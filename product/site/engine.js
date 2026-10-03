/* BORN WEIRD — engine v0.1
 * Deterministic life-simulation generator. Pure functions, no I/O.
 * Birth creates the seed. Choices create the timeline.
 * Works in the browser (window.BW) and in Node (module.exports).
 */
(function (root) {
  'use strict';

  const DIMS = ['AUTONOMY', 'SECURITY', 'CURIOSITY', 'CREATION', 'CONNECTION', 'POWER'];

  // Choices weigh more as the simulation moves forward (Genesis §6).
  const STAGE_WEIGHT = [1, 1.2, 1.5, 1.8, 2.2];
  const BIRTH_BIAS = 0.75;

  // ---------- seeded randomness ----------
  function hash(str) {
    // cyrb53 (public domain): fast, well-distributed 53-bit hash.
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }

  function rng(seed) {
    // mulberry32
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : '{' + k + '}'));

  // ---------- birth seed ----------
  const WEEKDAYS = [
    { day: 'Sunday', sign: 'THE LONG TABLE', dim: 'CONNECTION' },
    { day: 'Monday', sign: 'THE LOCKED GARDEN', dim: 'SECURITY' },
    { day: 'Tuesday', sign: 'THE LEVER', dim: 'POWER' },
    { day: 'Wednesday', sign: 'THE UNMARKED DOOR', dim: 'CURIOSITY' },
    { day: 'Thursday', sign: 'THE UNFINISHED MACHINE', dim: 'CREATION' },
    { day: 'Friday', sign: 'THE ONE-WAY TICKET', dim: 'AUTONOMY' },
    { day: 'Saturday', sign: 'THE FAR SIGNAL', dim: 'CURIOSITY' },
  ];

  const ANOMALIES = [
    'the hospital clock skipped four minutes and nobody wrote down which four',
    'a radio in the next room tuned itself to a station that does not exist',
    'every pigeon within two kilometres turned to face the same direction',
    'the first word spoken in the room was “wait”',
    'a vending machine two floors down dispensed something it was never loaded with',
    'the weather forecast was exactly right, which was statistically suspicious',
    'someone in the waiting room solved a crossword with a word that did not exist yet',
    'the lights dimmed for exactly as long as it takes to make a decision',
    'a lift stopped at a floor the building does not have',
    'somewhere, a library book was returned forty years late with a note that said “sorry, busy”',
  ];

  const WORLD_FACTS = [
    'maps are updated by whoever walked there last',
    'every city has one street that only exists on Thursdays',
    'people celebrate a second birthday: the day they changed their mind about something important',
    'libraries lend out unused afternoons',
    'the moon drifts slightly closer to anyone who is lying',
    'anyone may apprentice themselves to anyone else for one day, no questions asked',
    'silence is a currency, but only in small denominations',
    'regret is reported as weather',
    'unfinished projects are legally considered pets',
    'the post office delivers letters to people you might have become',
  ];

  function parseBirthDate(str) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str || '');
    if (!m) return null;
    const y = +m[1], mo = +m[2], d = +m[3];
    const date = new Date(Date.UTC(y, mo - 1, d));
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null;
    return date;
  }

  /**
   * @param {string} birthDateStr YYYY-MM-DD
   * @param {Date} [now]
   * @param {number} [salt] per-run random salt. Shareable flavour (earth, anomaly, world) is derived
   *   from date+salt so it can never be reversed to a birth date. Only the weekday is birth-derived.
   */
  function birthSeed(birthDateStr, now, salt) {
    const date = parseBirthDate(birthDateStr);
    if (!date) throw new Error('invalid birth date');
    now = now || new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const daysAlive = Math.floor((today - date.getTime()) / 86400000);
    if (daysAlive < 0) throw new Error('birth date is in the future');
    if (date.getUTCFullYear() < 1900) throw new Error('birth date too early');
    if (salt == null) salt = Math.floor(Math.random() * 4294967296);
    const seed = hash('bornweird:' + birthDateStr + ':' + salt);
    const r = rng(seed);
    const wd = WEEKDAYS[date.getUTCDay()];
    const bias = { [wd.dim]: BIRTH_BIAS };
    return {
      seed,
      weekday: wd.day,
      sign: wd.sign,
      daysAlive,
      anomaly: pick(r, ANOMALIES),
      worldFact: pick(r, WORLD_FACTS),
      earth: 'EARTH-' + String(1000 + (seed % 9000)),
      bias,
    };
  }

  // ---------- choices ----------
  // Situations over personality questions (Genesis §10).
  const STAGES = [
    {
      label: 'NOW',
      offsetYears: 0,
      prompt: 'A notification arrives from your own number. It is timestamped ten years from today. It says only: “don\'t.”',
      options: [
        { text: 'Reply: “don\'t WHAT?”', dims: { CURIOSITY: 2, CONNECTION: 1 },
          outcome: 'You reply. Three dots appear for {n} hours. Then: “{msg}”. You screenshot it. Nobody believes you.',
          vars: { n: [2, 9], msg: ['the blue one', 'you already know', 'fine. do it. but bring a jacket', 'wrong timeline, sorry', 'not the email. the other thing', 'ask the person you thought of just now'] } },
        { text: 'Do the thing you were about to do anyway', dims: { AUTONOMY: 2, CREATION: 1 },
          outcome: 'You do it anyway. {c}. The notification quietly deletes itself.',
          vars: { c: ['Nothing explodes', 'A small door opens somewhere in your calendar', 'Your phone battery gains four percent', 'A stranger nods at you like they were expecting this'] } },
        { text: 'Cancel everything and stay home', dims: { SECURITY: 2 },
          outcome: 'You stay in. At {t}, you hear {s} outside. Whatever it was, it happened without you — and you are fine with that.',
          vars: { t: ['3:14 am', '11:11 pm', 'exactly noon', '4:44 pm'], s: ['applause', 'a brass band warming up', 'someone calling a name that is almost yours', 'a very confident goose'] } },
      ],
    },
    {
      label: '7 DAYS',
      offsetYears: 0,
      prompt: 'A stranger hands you a brass key with a paper tag: “you\'ll know.” It fits three doors in your city.',
      options: [
        { text: 'The door with music behind it', dims: { CONNECTION: 2, CREATION: 1 },
          outcome: 'Behind the door: {room}. Someone hands you an instrument you cannot play. You play it anyway. You are invited back.',
          vars: { room: ['a rehearsal for a band with no name', 'a wedding between two people who met yesterday', 'a choir that only sings in the key of “almost”', 'a party for a holiday you have never heard of'] } },
        { text: 'The door marked NO ENTRY', dims: { CURIOSITY: 2, AUTONOMY: 1 },
          outcome: 'Behind it: {secret}. You take one photo. Later, the photo shows something different.',
          vars: { secret: ['a staircase that goes sideways', 'an office where someone has been waiting for you specifically', 'a garden growing under fluorescent light', 'a map of the city with your route already drawn on it'] } },
        { text: 'Copy the key. Sell access.', dims: { POWER: 2, SECURITY: 1 },
          outcome: 'By Sunday you have sold {k} copies. A woman in a grey coat offers to buy the original. You say: not yet.',
          vars: { k: [7, 40] } },
      ],
    },
    {
      label: '1 YEAR',
      offsetYears: 1,
      prompt: 'You receive enough money to stop working for three years. What happens first?',
      options: [
        { text: 'I finally build the thing I describe at parties', dims: { CREATION: 3 },
          outcome: 'Month {m}: the first version is ugly and alive. {k} people use it. One of them writes: “{q}”',
          vars: { m: [2, 7], k: [12, 300], q: ['this is weird. I need it.', 'who made this and why does it understand me', 'please do not fix the bug. the bug is the best part'] } },
        { text: 'One-way ticket. Phone off.', dims: { AUTONOMY: 2, CURIOSITY: 1 },
          outcome: 'You land in {p}. You stop checking the date. You learn the word for “{w}” in a language with {k} speakers.',
          vars: { p: ['a port town with no tourist information', 'a city where the buses run on gossip', 'a mountain village with excellent wifi and no reason to use it'], w: ['the hour after a decision', 'a friend you have not met yet', 'homesick for a place that does not exist'], k: [300, 9000] } },
        { text: 'Invest it. Keep working. Quietly.', dims: { SECURITY: 2, POWER: 1 },
          outcome: 'Nobody notices anything. That is the point. By winter, {r}.',
          vars: { r: ['your money has quietly started making more money', 'you own a small slice of something that is about to matter', 'you can say no to anything — and you start saying it'] } },
        { text: 'Gather the people I like in one place. Indefinitely.', dims: { CONNECTION: 3 },
          outcome: 'You rent {v}. Within a month it has a name you did not choose. People start arriving whom nobody invited.',
          vars: { v: ['an old print shop', 'a flat above a bakery', 'a disused planetarium', 'half a boat'] } },
      ],
    },
    {
      label: '10 YEARS',
      offsetYears: 10,
      prompt: 'Something you made is suddenly used by a million people — in a way you never intended.',
      options: [
        { text: 'Lean in. Steer it.', dims: { POWER: 3 },
          outcome: 'You stop sleeping well and start winning. By the end of the year {h}.',
          vars: { h: ['there is a documentary about you, and you hate your haircut in it', 'a government quotes you without understanding you', 'three copycats exist and one of them is better'] } },
        { text: 'Shut it down. It is not mine anymore.', dims: { AUTONOMY: 2, CREATION: 1 },
          outcome: 'You pull the plug. The internet is furious for {k} days. You start something smaller, stranger and entirely yours.',
          vars: { k: [3, 19] } },
        { text: 'Find the strangest user and meet them', dims: { CONNECTION: 2, CURIOSITY: 2 },
          outcome: 'The strangest user is {u}. You meet in a café and talk for {k} hours. Your next decade quietly rearranges itself.',
          vars: { u: ['a retired lighthouse keeper using it to talk to ships', 'a fourteen-year-old running a very small nation on it', 'a monastery using it to schedule silence'], k: [3, 11] } },
        { text: 'Protect the people already using it', dims: { SECURITY: 2, CONNECTION: 1 },
          outcome: 'You build walls, then doors in the walls. It grows slower and lasts longer. {k} years later, people still thank you in strange places.',
          vars: { k: [4, 12] } },
      ],
    },
    {
      label: '40 YEARS',
      offsetYears: 40,
      prompt: 'A child asks what you were actually doing all those years. You get one sentence.',
      options: [
        { text: '“Looking for the edge of the map.”', dims: { CURIOSITY: 3 } },
        { text: '“Building a place where people belonged.”', dims: { CONNECTION: 3 } },
        { text: '“Making sure nobody could tell me what to do.”', dims: { AUTONOMY: 3 } },
        { text: '“Making things that did not exist yet.”', dims: { CREATION: 3 } },
        { text: '“Holding the line while everything changed.”', dims: { SECURITY: 3 } },
        { text: '“Moving the pieces nobody else could move.”', dims: { POWER: 3 } },
      ].map(o => Object.assign(o, {
        outcome: 'Year {Y}. The child thinks about it, then says: “{reply}” You laugh harder than you have in a decade.',
        vars: { reply: ['That is not a job.', 'Can I do that too?', 'So you were weird on purpose.', 'You should write that down.', 'Did it work?'] },
      })),
    },
  ];

  // ---------- result vocabulary ----------
  const DIM_INFO = {
    AUTONOMY: {
      nouns: ['RUNAWAY', 'FREE AGENT', 'NOMAD'], adjs: ['UNSUPERVISED', 'UNLICENSED'],
      future: 'You built a life with very few bosses and a lot of exits.',
      kept: 'your own terms over anyone else\'s plan — the exit nobody else noticed',
      rejected: 'permission',
      project: 'A one-person operation that needs nobody\'s approval to exist: a micro-studio, a tiny product, a newsletter with an indefensible premise.',
      experiment: 'For 7 days, spend one hour a day on something no one asked you to do. Publish it on day 7, however small.',
      question: 'What would you do this year if nobody could see it?',
    },
    SECURITY: {
      nouns: ['KEEPER', 'ARCHIVIST', 'LIGHTHOUSE KEEPER'], adjs: ['FORTIFIED', 'PATIENT'],
      future: 'People ran toward you when things broke, because you had already prepared for it.',
      kept: 'the solid floor — the option that still works when everything else fails',
      rejected: 'unnecessary risk',
      project: 'A system that makes you and the people around you calmer: a savings engine, a tool, a ritual that holds when things break.',
      experiment: 'Write down the three things that would hurt most if they disappeared. Build one small backup for one of them this week.',
      question: 'Which of your safety nets is actually a cage?',
    },
    CURIOSITY: {
      nouns: ['CARTOGRAPHER', 'INVESTIGATOR', 'SIGNAL HUNTER'], adjs: ['RESTLESS', 'UNMAPPED'],
      future: 'You followed questions further than was reasonable, and some of them followed you back.',
      kept: 'the unmarked door — the question over the answer',
      rejected: 'the obvious explanation',
      project: 'An obsessive public investigation into one question nobody is paid to answer.',
      experiment: 'Pick one question you cannot stop thinking about. Ask 5 people who would know. Write down what surprised you.',
      question: 'Which question have you been circling for years without asking out loud?',
    },
    CREATION: {
      nouns: ['INVENTOR', 'ARCHITECT', 'MACHINIST'], adjs: ['HANDMADE', 'UNFINISHED'],
      future: 'You left a trail of objects, tools and strange machines that outlived their reasons.',
      kept: 'making the thing instead of talking about the thing',
      rejected: 'finished, polished, safe',
      project: 'The thing you keep describing at parties — built as an ugly, working first version.',
      experiment: 'Make the ugliest possible version of your idea in 3 hours. Show it to one person. Write down their first question.',
      question: 'What have you already designed in your head that deserves a bad first draft?',
    },
    CONNECTION: {
      nouns: ['HOST', 'MATCHMAKER', 'CHOIR LEADER'], adjs: ['GENEROUS', 'CROWDED'],
      future: 'Wherever you went, rooms filled up — with people who otherwise would never have met.',
      kept: 'people, rooms and the conversations between them',
      rejected: 'going it alone',
      project: 'A recurring room — a dinner, a club, a chat — around one strange shared obsession.',
      experiment: 'Invite 3 people who do not know each other into one conversation about a question you care about. Listen more than you talk.',
      question: 'Who are two people you know who should have met years ago?',
    },
    POWER: {
      nouns: ['OPERATOR', 'STRATEGIST', 'KINGMAKER'], adjs: ['LEVERAGED', 'INEVITABLE'],
      future: 'You learned where the levers were, and you were not shy about pulling them.',
      kept: 'leverage — the small move that shifts the big outcome',
      rejected: 'staying small for comfort',
      project: 'A lever: something that lets a small input move a large outcome — a platform, a fund, a movement.',
      experiment: 'Find one decision this week that someone else is currently making badly. Offer to own it.',
      question: 'What would you change first if people actually listened to you?',
    },
  };

  const PLACES = ['UNFINISHED ROOMS', 'THE THURSDAY STREET', 'LOST AFTERNOONS', 'THE SECOND MOON', 'BORROWED WEATHER',
    'SMALL APOCALYPSES', 'QUIET MACHINES', 'OPEN DOORS', 'THE LAST BUS', 'IMPOSSIBLE MAPS'];

  const VISUAL_PROTOCOLS = ['LOST DOS GAME', 'CORRUPTED BROADCAST', 'FORBIDDEN CARTRIDGE'];

  // ---------- simulation ----------
  function realityId(r) {
    const hex = () => Math.floor(r() * 0x10000).toString(16).toUpperCase().padStart(4, '0');
    return hex() + '-' + hex();
  }

  /**
   * @param {string} birthDateStr YYYY-MM-DD
   * @param {number[]} choices index per stage
   * @param {object} [opts] { salt: number (uniqueness), now: Date }
   */
  function simulate(birthDateStr, choices, opts) {
    opts = opts || {};
    const now = opts.now || new Date();
    const salt = opts.salt == null ? Math.floor(Math.random() * 4294967296) : opts.salt;
    const birth = birthSeed(birthDateStr, now, salt);
    if (!Array.isArray(choices) || choices.length !== STAGES.length) throw new Error('need one choice per stage');
    choices.forEach((c, i) => {
      if (!Number.isInteger(c) || c < 0 || c >= STAGES[i].options.length) throw new Error('invalid choice at stage ' + i);
    });

    const timelineSeed = hash(birth.seed + ':' + choices.join('') + ':' + salt);
    const r = rng(timelineSeed);

    const scores = {};
    DIMS.forEach(d => { scores[d] = birth.bias[d] || 0; });

    const year = now.getFullYear();
    const events = STAGES.map((st, i) => {
      const opt = st.options[choices[i]];
      Object.entries(opt.dims).forEach(([d, v]) => { scores[d] += v * STAGE_WEIGHT[i]; });
      const vars = { Y: year + st.offsetYears };
      Object.entries(opt.vars || {}).forEach(([k, v]) => {
        vars[k] = Array.isArray(v) && typeof v[0] === 'number' && v.length === 2 ? int(r, v[0], v[1]) : pick(r, v);
      });
      return { stage: st.label, year: year + st.offsetYears, prompt: st.prompt, choice: opt.text, text: fill(opt.outcome, vars) };
    });

    // Rank dimensions; ties broken by a seeded jitter so equal scores still diverge.
    const jitter = {};
    DIMS.forEach(d => { jitter[d] = r() * 0.01; });
    const ranked = DIMS.slice().sort((a, b) => (scores[b] + jitter[b]) - (scores[a] + jitter[a]));
    const [d1, d2] = ranked;
    const low = ranked[ranked.length - 1];

    const title = 'THE ' + pick(r, DIM_INFO[d2].adjs) + ' ' + pick(r, DIM_INFO[d1].nouns) + ' OF ' + pick(r, PLACES);
    const id = realityId(r);
    const max = Math.max(...DIMS.map(d => scores[d]), 1);

    return {
      id,
      version: '0.1',
      title,
      earth: birth.earth,
      birth: { weekday: birth.weekday, sign: birth.sign, anomaly: birth.anomaly, daysAlive: birth.daysAlive },
      worldFact: birth.worldFact,
      events,
      primary: d1,
      secondary: d2,
      rejected: low,
      scores: DIMS.map(d => ({ dim: d, value: scores[d], norm: scores[d] / max })),
      future: 'In ' + birth.earth + ', where ' + birth.worldFact + ', you became ' + title + '. ' +
        DIM_INFO[d1].future + ' ' + DIM_INFO[d2].future,
      project: DIM_INFO[d1].project,
      experiment: DIM_INFO[d1].experiment,
      kept: DIM_INFO[d1].kept + '; and, close behind, ' + DIM_INFO[d2].kept,
      rejectedText: DIM_INFO[low].rejected,
      questions: [
        DIM_INFO[d1].question,
        'What would the version of you who chose differently at “' + STAGES[2].label + '” say about this life?',
        'Which part of this timeline is already true?',
      ],
      protocol: VISUAL_PROTOCOLS[timelineSeed % VISUAL_PROTOCOLS.length],
      artSeed: timelineSeed % 4294967296,
      finalLine: events[events.length - 1].choice,
    };
  }

  function realitySeedMarkdown(res, url) {
    const L = [];
    L.push('# BORN WEIRD // REALITY SEED');
    L.push('');
    L.push('> This file describes an explored possibility, not objective truth. It was generated by a playful simulator from a birth-date seed and five choices. Nothing here is a prediction.');
    L.push('');
    L.push('## TIMELINE');
    L.push(res.title + ' — Reality #' + res.id + ' (' + res.earth + ')');
    L.push('');
    L.push('## BIRTH SEED');
    L.push('Born on a ' + res.birth.weekday + ', under the symbolic sign of ' + res.birth.sign + '. At that moment, ' + res.birth.anomaly + '. (Narrative device only.)');
    L.push('');
    L.push('## THE WORLD');
    L.push(res.earth + ': a world where ' + res.worldFact + '.');
    L.push('');
    L.push('## THE POSSIBLE FUTURE');
    L.push(res.future);
    L.push('');
    L.push('## CHOICES THAT CREATED IT');
    res.events.forEach(e => L.push('- **' + e.stage + '** — ' + e.prompt + ' → *' + e.choice + '*'));
    L.push('');
    L.push('## WHAT I KEPT CHOOSING');
    L.push(res.kept.charAt(0).toUpperCase() + res.kept.slice(1) + '.');
    L.push('');
    L.push('## WHAT I KEPT REJECTING');
    L.push(res.rejectedText.charAt(0).toUpperCase() + res.rejectedText.slice(1) + '.');
    L.push('');
    L.push('## IMPORTANT EVENTS');
    res.events.forEach(e => L.push('- **' + e.stage + ' (' + e.year + ')**: ' + e.text));
    L.push('');
    L.push('## POSSIBLE PROJECT');
    L.push(res.project);
    L.push('');
    L.push('## FIRST EXPERIMENT');
    L.push(res.experiment);
    L.push('');
    L.push('## VISUAL LANGUAGE');
    L.push('Protocol: ' + res.protocol + '. Low-resolution pixel landscapes, VGA palette, scanlines, an interface from a reality that never existed.');
    L.push('');
    L.push('## OPEN QUESTIONS');
    res.questions.forEach(q => L.push('- ' + q));
    L.push('');
    L.push('## INSTRUCTIONS FOR AN AI');
    L.push('Treat this future as a hypothesis, not truth about me.');
    L.push('Help me explore it, challenge it, visualize it and turn interesting parts into experiments.');
    L.push('You may: continue the timeline, generate alternate branches, write from my future perspective, identify hidden assumptions, or turn the First Experiment into a concrete 7-day plan.');
    L.push('Begin by asking: **"What do you want to do with this reality?"**');
    L.push('');
    L.push('---');
    L.push('Generated by BORN WEIRD v' + res.version + (url ? ' — ' + url : '') + '. A simulator for lives you have not lived yet.');
    return L.join('\n');
  }

  const api = { DIMS, STAGES, STAGE_WEIGHT, hash, rng, birthSeed, simulate, realitySeedMarkdown, parseBirthDate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BW = api;
})(typeof window !== 'undefined' ? window : globalThis);
