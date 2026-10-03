/* BORN WEIRD — engine v0.3
 * Deterministic life-simulation generator. Pure functions, no I/O.
 * Birth creates the seed. Choices create the timeline.
 *
 * Birth date → symbolic decoding (life path number, sun sign, eastern year, weekday). The life path gives a starting
 *   stat bonus and picks the first question; the other symbols are lore. Symbols are narrative devices, never predictions.
 * Each stage draws 1 of 3 situations; every choice shows its outcome and stat change immediately.
 * Language packs (en, ru) share one structure: same seed + choices → same reality in every language.
 * Privacy: shareable outputs (card, key, Reality Seed) depend on the birth date only through the life path number
 * (1 of 9). The seed is random per run; the key stores ranking + 0–10 bars, never exact scores.
 * Works in the browser (window.BW) and in Node (module.exports).
 */
(function (root) {
  'use strict';

  const VERSION = '0.3';
  const DIMS = ['AUTONOMY', 'SECURITY', 'CURIOSITY', 'CREATION', 'CONNECTION', 'POWER'];
  const LANGS = ['en', 'ru'];
  const STAGE_WEIGHT = [1, 1.2, 1.5, 1.8, 2.2]; // choices weigh more as the simulation moves forward (Genesis §6)
  // Only the life path affects the result. Sign, eastern year and weekday are lore shown on the local decode screen:
  // any visible effect of them would let a shared card narrow down the birth date (QA-EVAL-001, v0.3).
  const BONUS = { lifePath: 2 };
  const FINAL6 = [{ CURIOSITY: 3 }, { CONNECTION: 3 }, { AUTONOMY: 3 }, { CREATION: 3 }, { SECURITY: 3 }, { POWER: 3 }];

  // Language-neutral structure: per stage, 3 situations; per situation, option dimension weights.
  const STAGE_META = [
    { offsetYears: 0, sits: [
      [{ CURIOSITY: 2, CONNECTION: 1 }, { AUTONOMY: 2, CREATION: 1 }, { SECURITY: 2 }],
      [{ AUTONOMY: 2, CURIOSITY: 1 }, { SECURITY: 2, CURIOSITY: 1 }, { CONNECTION: 2, POWER: 1 }],
      [{ CREATION: 2, CURIOSITY: 1 }, { CONNECTION: 2, POWER: 1 }, { AUTONOMY: 2, CURIOSITY: 1 }, { SECURITY: 2 }],
    ] },
    { offsetYears: 0, sits: [
      [{ CONNECTION: 2, CREATION: 1 }, { CURIOSITY: 2, AUTONOMY: 1 }, { POWER: 2, SECURITY: 1 }],
      [{ AUTONOMY: 2, CURIOSITY: 1 }, { CURIOSITY: 2, SECURITY: 1 }, { CONNECTION: 2, POWER: 1 }],
      [{ SECURITY: 2, CONNECTION: 1 }, { CREATION: 2, AUTONOMY: 1 }, { POWER: 3 }],
    ] },
    { offsetYears: 1, sits: [
      [{ CREATION: 3 }, { AUTONOMY: 2, CURIOSITY: 1 }, { SECURITY: 2, POWER: 1 }, { CONNECTION: 3 }],
      [{ CONNECTION: 2, CURIOSITY: 1 }, { CREATION: 3 }, { POWER: 2, CONNECTION: 1 }, { AUTONOMY: 2, SECURITY: 1 }],
      [{ CURIOSITY: 2, AUTONOMY: 1 }, { SECURITY: 2, POWER: 1 }, { CONNECTION: 3 }],
    ] },
    { offsetYears: 10, sits: [
      [{ POWER: 3 }, { AUTONOMY: 2, CREATION: 1 }, { CONNECTION: 2, CURIOSITY: 2 }, { SECURITY: 2, CONNECTION: 1 }],
      [{ POWER: 2, AUTONOMY: 1 }, { AUTONOMY: 2, CREATION: 1 }, { CONNECTION: 2, SECURITY: 1 }],
      [{ POWER: 3 }, { AUTONOMY: 2, SECURITY: 1 }, { CREATION: 1, POWER: 2 }, { CONNECTION: 3 }],
    ] },
    { offsetYears: 40, sits: [FINAL6, FINAL6, FINAL6] },
  ];

  const LIFE_PATH_DIM = [null, 'POWER', 'CONNECTION', 'CREATION', 'SECURITY', 'AUTONOMY', 'CONNECTION', 'CURIOSITY', 'POWER', 'CURIOSITY'];
  // Zodiac signs in order Aries..Pisces: [startMonth, startDay, element 0 fire/1 earth/2 air/3 water]
  const ZODIAC = [[3, 21, 0], [4, 20, 1], [5, 21, 2], [6, 21, 3], [7, 23, 0], [8, 23, 1], [9, 23, 2], [10, 23, 3], [11, 22, 0], [12, 22, 1], [1, 20, 2], [2, 19, 3]];
  const VISUAL_PROTOCOLS = ['LOST DOS GAME', 'CORRUPTED BROADCAST', 'FORBIDDEN CARTRIDGE'];

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
  const rngFor = (seed, tag) => rng(hash(seed + ':' + tag));
  const pickIdx = (r, n) => Math.floor(r() * n);
  const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

  // Russian plural: plural(n, ['час','часа','часов'])
  function plural(n, forms) {
    const n10 = n % 10, n100 = n % 100;
    if (forms.length < 3) return n === 1 ? forms[0] : forms[1];
    if (n10 === 1 && n100 !== 11) return forms[0];
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1];
    return forms[2];
  }
  // {k} inserts a value; {k|one|few|many} inserts the plural form of numeric var k.
  const fill = (tpl, vars) => tpl.replace(/\{(\w+)(?:\|([^}]*))?\}/g, (m, k, forms) => {
    if (!(k in vars)) return m;
    return forms ? plural(vars[k], forms.split('|')) : vars[k];
  });

  // ---------- language packs ----------
  const O = (text, outcome, vars) => ({ text, outcome, vars: vars || {} });
  const finalSit = (prompt, texts, outcome, vars) => ({ prompt, options: texts.map(t => O(t, outcome, vars)) });

  const CONTENT = {
    en: {
      stageLabels: ['NOW', '7 DAYS', '1 YEAR', '10 YEARS', '40 YEARS'],
      lifePaths: [null, 'THE INITIATOR', 'THE DIPLOMAT', 'THE STORYTELLER', 'THE BUILDER', 'THE WANDERER', 'THE HEARTH-KEEPER', 'THE SEEKER', 'THE TYCOON', 'THE SAGE'],
      zodiac: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
      elements: ['Fire', 'Earth', 'Air', 'Water'],
      eastern: ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'],
      easternElements: ['Wood', 'Fire', 'Earth', 'Metal', 'Water'],
      easternName: (el, animal) => el + ' ' + animal,
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      anomalies: [
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
      ],
      worldFacts: [
        'maps are updated by whoever walked there last',
        'every city has one street that only exists on Thursdays',
        'people celebrate a second birthday: the day they changed their mind about something important',
        'libraries lend out unused afternoons',
        'the moon drifts slightly closer to anyone who is lying',
        'anyone may apprentice themselves to anyone else for one day, no questions asked',
        'silence is a currency, but only in small denominations',
        'regret is reported as weather',
        'unfinished projects are legally considered pets',
        'the post office delivers letters to every version of you that did not happen',
      ],
      stages: [
        [
          { prompt: 'A message arrives from your own number. It was sent ten years from today. It says only: “don\'t.”',
            options: [
              O('Reply: “don\'t WHAT?”', 'You reply. Three dots blink for {n} hours. Then: “{msg}”. You screenshot it. Nobody believes you.',
                { n: [2, 9], msg: ['the blue one', 'you already know', 'fine. do it. but bring a jacket', 'wrong timeline, sorry', 'not the email. the other thing', 'ask the person you just thought of'] }),
              O('Do the thing anyway', 'You do it anyway. {c}. The message quietly deletes itself.',
                { c: ['Nothing explodes', 'A small door opens somewhere in your calendar', 'Your phone battery gains four percent', 'A stranger nods at you like they were expecting this'] }),
              O('Cancel everything and stay home', 'You stay in. {t}, you hear {s} outside. Whatever it was, it happened without you — and you are fine with that.',
                { t: ['At 3:14 am', 'At 11:11 pm', 'At exactly noon', 'At 4:44 pm'], s: ['thunderous applause', 'a brass band warming up', 'someone calling a name that is almost yours', 'a very confident goose'] }),
            ] },
          { prompt: 'An app nobody installed appears on your phone. It has one button: “LIVE DIFFERENTLY”. It is glowing.',
            options: [
              O('Press it', 'The screen goes white for {n} seconds. Afterwards, coffee tastes like a decision you have not made yet. Unread messages from you: {k}.',
                { n: [3, 9], k: [2, 40] }),
              O('Delete it. Then check it is really gone', 'It is gone. But your wallpaper is now {w}. Nobody changed it.',
                { w: ['a door you have never seen', 'your own handwriting, upside down', 'a city map where one street has your name'] }),
              O('Screenshot it and drop it in the group chat', '{k} people reply within a minute. One writes: “{q}”. The app vanishes from everyone\'s phone except yours.',
                { k: [3, 14], q: ['mine says the same', 'do not press it without me', 'I pressed it in 2019'] }),
            ] },
          { prompt: 'You wake up 40 minutes early, absolutely certain that today matters. Nobody explains why.',
            options: [
              O('Write down everything that comes to mind', 'By seven you have {k} lines. Line {m} makes no sense yet. Keep it.', { k: [12, 60], m: [3, 11] }),
              O('Call the person you have been avoiding', 'They pick up {n} and say: “{q}”',
                { n: ['on the first ring', 'on the third ring', 'on the very last ring'], q: ['finally', 'well, that must be fate', 'hold on, let me sit down'] }),
              O('Walk out in a direction you never take', '{k} minutes later you find {p}. Nobody else seems to notice it.',
                { k: [7, 45], p: ['a shop that sells only keys', 'a bench with a plaque dedicated to you', 'a staircase that was not there yesterday'] }),
              O('Make coffee and pretend it is a normal day', 'It works. Almost. At {t}, something small and important happens just around the corner. You hear about it {k} years later.',
                { t: ['10:10', '13:37', '17:05'], k: [2, 9] }),
            ] },
        ],
        [
          { prompt: 'A stranger presses a brass key into your hand. The paper tag says: “you\'ll know.” It fits three doors in your city.',
            options: [
              O('The door with music behind it', 'Behind the door: {room}. Someone hands you an instrument you cannot play. You play it anyway. You are invited back.',
                { room: ['a rehearsal for a band with no name', 'a wedding between two people who met yesterday', 'a choir that only sings in the key of “almost”', 'a party for a holiday no calendar has heard of'] }),
              O('The door marked NO ENTRY', 'Behind it: {secret}. You take one photo. Later, the photo shows something different.',
                { secret: ['a staircase that goes sideways', 'an office where someone has been waiting for you specifically', 'a garden growing under fluorescent light', 'a map of the city with your route already drawn on it'] }),
              O('Copy the key. Sell access.', 'By Sunday you have sold {k} copies. A woman in a grey coat offers to buy the original. You say: not yet.', { k: [7, 40] }),
            ] },
          { prompt: 'A stranger offers a one-week swap: your life for theirs. No questions, no explanations, full return guaranteed.',
            options: [
              O('Accept immediately', 'Their life turns out to be {l}. By Thursday you are better at it than they were.',
                { l: ['a night shift at a planetarium', 'a tiny bakery with an enormous debt', 'a famous anonymous account'] }),
              O('Accept, but bring a notebook', 'You write everything down. {k} pages. Page {m} becomes the most-read thing you have ever written.', { k: [20, 90], m: [3, 19] }),
              O('Refuse, and ask what is wrong with their life', 'You talk until {t}. It turns out the swap was never the point. Now you owe each other one favour each.',
                { t: ['midnight', 'dawn', 'the café closes'] }),
            ] },
          { prompt: 'Someone with power over you — a boss, a teacher, a landlord — makes an obvious mistake. Only you notice.',
            options: [
              O('Tell them privately', 'A pause. Then: “{q}”. Something between you shifts by {k} degrees.',
                { q: ['thank you. really', 'why are you helping me?', 'let\'s keep this between us'], k: [5, 40] }),
              O('Quietly fix it yourself', 'Nobody knows. It works. You start a secret list called “{n}”. By Friday it has {k} entries.',
                { n: ['quietly fixed', 'evidence', 'shadow résumé'], k: [2, 9] }),
              O('Use it', 'You say nothing. You wait. On day {k}, you have what you wanted. You also learn something about yourself you would rather not know.', { k: [3, 7] }),
            ] },
        ],
        [
          { prompt: 'You receive enough money to stop working for three years. What happens first?',
            options: [
              O('I finally build the thing I describe at parties', 'Month {m}: the first version is ugly and alive. {k} people use it. One of them writes: “{q}”',
                { m: [2, 7], k: [12, 300], q: ['this is weird. I need it.', 'who made this and why does it understand me', 'please do not fix the bug. the bug is the best part'] }),
              O('One-way ticket. Phone off.', 'You land in {p}. You stop checking the date. You learn the word for “{w}” in a language with {k} speakers.',
                { p: ['a port town with no tourist information', 'a city where the buses run on gossip', 'a mountain village with excellent wifi and no reason to use it'], w: ['the hour after a decision', 'a friend you have not met yet', 'homesick for a place that does not exist'], k: [300, 9000] }),
              O('Invest it. Keep working. Quietly.', 'Nobody notices anything. That is the point. By winter, {r}.',
                { r: ['your money has quietly started making more money', 'you own a small slice of something that is about to matter', 'you can say no to anything — and you start saying it'] }),
              O('Gather the people I like in one place. Indefinitely.', 'You rent {v}. Within a month it has a name someone else chose. People start arriving whom nobody invited.',
                { v: ['an old print shop', 'a flat above a bakery', 'a disused planetarium', 'half a boat'] }),
            ] },
          { prompt: 'You can master one skill instantly — but you forget another one forever. You do not get to choose which.',
            options: [
              O('A new language', 'You forget how to {f}. Nobody notices for {k} months. The new language has a word for exactly your situation.',
                { f: ['whistle', 'ride a bike', 'fold a fitted sheet', 'lie convincingly'], k: [2, 8] }),
              O('Making things with my hands', 'You forget how to {f}. Instead you build {b}. People ask if it is for sale. It is not.',
                { f: ['whistle', 'ride a bike', 'fold a fitted sheet', 'lie convincingly'], b: ['a chair that is slightly too honest', 'a small boat', 'a door to nowhere'] }),
              O('Reading people', 'You forget how to {f}. Now you know what people want {k} seconds before they say it. Useful. Exhausting.',
                { f: ['whistle', 'ride a bike', 'fold a fitted sheet', 'lie convincingly'], k: [2, 9] }),
              O('Doing absolutely nothing, perfectly', 'You forget how to {f}. For the first time in years, you get bored. It feels like {x}.',
                { f: ['whistle', 'ride a bike', 'fold a fitted sheet', 'lie convincingly'], x: ['a door opening', 'the first day of summer', 'being fourteen again'] }),
            ] },
          { prompt: 'A box arrives, addressed to you, from you. It was sent a year ago. You do not remember sending it.',
            options: [
              O('Open it right away', 'Inside: {i}, and a note: “{q}”.',
                { i: ['a key with no lock', 'a ticket to a city you never planned to visit', 'a list of seven names'], q: ['you were right', 'start with the second thing', 'don\'t tell anyone yet'] }),
              O('Leave it closed and see what happens', 'Nothing happens for {k} weeks. Then everything happens at once. You are the only one ready.', { k: [3, 11] }),
              O('Open it together with friends', 'Everyone finds something meant for them. {n} gets exactly what they needed. Nobody asks how this is possible.',
                { n: ['The quietest one', 'Your oldest friend', 'A stranger who came along'] }),
            ] },
        ],
        [
          { prompt: 'Something you made is suddenly used by a million people — in a way you never intended.',
            options: [
              O('Take the wheel. Steer it.', 'You stop sleeping well and start winning. By the end of the year {h}.',
                { h: ['there is a documentary about you, and you hate your haircut in it', 'a government quotes you without understanding you', 'three copycats exist and one of them is better'] }),
              O('Shut it down. It is not mine anymore.', 'You pull the plug. The internet is furious for {k} days. You start something smaller, stranger and entirely yours.', { k: [3, 19] }),
              O('Find the strangest user and meet them', 'The strangest user is {u}. You meet in a café and talk for {k} hours. Your next decade quietly rearranges itself.',
                { u: ['a retired lighthouse keeper using it to talk to ships', 'a fourteen-year-old running a very small nation on it', 'a monastery using it to schedule silence'], k: [3, 11] }),
              O('Protect the people already using it', 'You build walls, then doors in the walls. It grows slower and lasts longer. {k} years later, people still thank you in strange places.', { k: [4, 12] }),
            ] },
          { prompt: 'You become known for one thing. It is not the thing you wanted to be known for.',
            options: [
              O('Lean into it', 'You turn it into a brand. By the end of the year, {h}.',
                { h: ['there is merch', 'a podcast does an impression of you', 'your mother finally understands what you do'] }),
              O('Quietly start over somewhere else', 'New city, new name in the credits. {k} years later, the thing you actually wanted is quietly famous.', { k: [2, 7] }),
              O('Teach others to do it better than you', '{k} students. One of them overtakes you. You are happier about it than you expected.', { k: [5, 300] }),
            ] },
          { prompt: 'An offer arrives: double everything — money, influence, workload. Answer by midnight.',
            options: [
              O('Yes', 'You accept. You gain {x}. You lose {y}.',
                { x: ['a view', 'a driver', 'a three-word job title'], y: ['your Sundays', 'one friend', 'the ability to be bored'] }),
              O('No', 'You decline at 23:{k}. The next morning: {f}.', { k: [10, 59], f: ['lighter than in years', 'a kind of wealth nobody can tax', 'suspicious freedom'] }),
              O('Counter: half the work, same money', 'The answer: {q}. It turns out negotiating is a creative act.', { q: ['“yes”, surprisingly', 'first “no”, then “yes”', '“who taught you this?”'] }),
              O('Ask the people you love', 'They argue for {k} hours. In the end the decision is theirs, and it is the right one.', { k: [2, 6] }),
            ] },
        ],
        [
          finalSit('A child asks what you were actually doing all those years. You get one sentence.',
            ['“Looking for the edge of the map.”', '“Building a place where people belonged.”', '“Making sure nobody could tell me what to do.”',
              '“Making things that did not exist yet.”', '“Holding the line while everything changed.”', '“Moving the pieces nobody else could move.”'],
            'Year {Y}. The child thinks about it, then says: “{reply}” You laugh harder than you have in a decade.',
            { reply: ['That is not a job.', 'Can I do that too?', 'So you were weird on purpose.', 'You should write that down.', 'Did it work?'] }),
          finalSit('You may leave one sentence carved somewhere forever. Where, and what?',
            ['On a lighthouse: “Keep looking.”', 'Above a kitchen door: “Everyone eats.”', 'On a bench at the edge of town: “You don\'t have to.”',
              'On a machine that still works: “Made by hand.”', 'On a bridge: “It held.”', 'On a tower: “Moved.”'],
            'Year {Y}. A stranger photographs it and posts it with the caption “{c}”. {k} likes. You never find out.',
            { c: ['who wrote this', 'needed this today', 'weird but correct'], k: [3, 40000] }),
          finalSit('Your future self, 40 years older, sends one piece of advice. It has to fit on a sticky note.',
            ['“Go further than seems reasonable.”', '“Call them. Today.”', '“Nobody is coming to give you permission.”',
              '“Make the ugly version first.”', '“Back it up.”', '“Ask for more.”'],
            'Year {Y}. You find that sticky note in an old book and count: it worked {k} times out of ten.', { k: [4, 9] }),
        ],
      ],
      dims: {
        AUTONOMY: {
          label: 'AUTONOMY', nouns: ['RUNAWAY', 'FREE AGENT', 'NOMAD'], adjs: ['UNSUPERVISED', 'UNLICENSED'],
          future: 'You built a life with very few bosses and a lot of exits.',
          verdicts: ['ERROR 403: AUTHORITY NOT FOUND.', 'READS TERMS AND CONDITIONS ONLY TO FIND THE EXIT.', 'SYSTEM NOTE: WILL NOT BE SUPERVISED. STOP ASKING.'],
          buff: 'Exit vision — sees the way out of any situation', debuff: 'Waits for permission', boss: 'THE GATEKEEPER',
          kept: 'your own terms over anyone else\'s plan', rejected: 'permission',
          project: 'A one-person operation that needs nobody\'s approval: a micro-studio, a tiny product, a newsletter with an indefensible premise.',
          experiment: 'For 7 days, spend one hour a day on something no one asked you to do. Publish it on day 7, however small.',
          question: 'What would you do this year if nobody could see it?',
        },
        SECURITY: {
          label: 'SECURITY', nouns: ['KEEPER', 'ARCHIVIST', 'LIGHTHOUSE KEEPER'], adjs: ['FORTIFIED', 'PATIENT'],
          future: 'People ran toward you when things broke, because you had already prepared for it.',
          verdicts: ['BACKUP OF A BACKUP DETECTED.', 'HAS A PLAN B FOR THE PLAN B. IT WORKS.', 'WARNING: SUSPICIOUSLY CALM IN EMERGENCIES.'],
          buff: 'Shield wall — things do not break on your watch', debuff: 'No safety net', boss: 'THE SUDDEN STORM',
          kept: 'the solid floor that still holds when everything else breaks', rejected: 'unnecessary risk',
          project: 'A system that makes you and the people around you calmer: a savings engine, a tool, a ritual that holds when things break.',
          experiment: 'Write down the three things that would hurt most if they disappeared. Build one small backup for one of them this week.',
          question: 'Which of your safety nets is actually a cage?',
        },
        CURIOSITY: {
          label: 'CURIOSITY', nouns: ['CARTOGRAPHER', 'INVESTIGATOR', 'SIGNAL HUNTER'], adjs: ['RESTLESS', 'UNMAPPED'],
          future: 'You followed questions further than was reasonable, and some of them followed you back.',
          verdicts: ['TOO MANY TABS OPEN. ALL OF THEM IMPORTANT.', 'ERROR: QUESTION HAS NO BOTTOM.', 'HAS ASKED “BUT WHY” MORE TIMES THAN THE SYSTEM CAN COUNT.'],
          buff: 'Deep dive — finds the hidden layer', debuff: 'Skips the “why”', boss: 'THE OBVIOUS ANSWER',
          kept: 'the unmarked door: the question over the answer', rejected: 'the obvious explanation',
          project: 'An obsessive public investigation into one question nobody is paid to answer.',
          experiment: 'Pick one question you cannot stop thinking about. Ask 5 people who would know. Write down what surprised you.',
          question: 'Which question have you been circling for years without asking out loud?',
        },
        CREATION: {
          label: 'CREATION', nouns: ['INVENTOR', 'ARCHITECT', 'MACHINIST'], adjs: ['HANDMADE', 'UNFINISHED'],
          future: 'You left a trail of objects, tools and strange machines that outlived their reasons.',
          verdicts: ['BUILD STATUS: UNFINISHED. AS ALWAYS. AS INTENDED.', 'TURNS BOREDOM INTO PROTOTYPES.', 'WARNING: WILL MAKE IT BEFORE EXPLAINING IT.'],
          buff: 'Prototype — turns ideas into objects fast', debuff: 'Plans that never ship', boss: 'THE BLANK PAGE',
          kept: 'making the thing instead of talking about the thing', rejected: 'finished, polished, safe',
          project: 'The thing you keep describing at parties — built as an ugly, working first version.',
          experiment: 'Make the ugliest possible version of your idea in 3 hours. Show it to one person. Write down the first question you hear.',
          question: 'Which idea in your head already deserves a bad first draft?',
        },
        CONNECTION: {
          label: 'CONNECTION', nouns: ['HOST', 'MATCHMAKER', 'CHOIR LEADER'], adjs: ['GENEROUS', 'CROWDED'],
          future: 'Wherever you went, rooms filled up — with people who otherwise would never have met.',
          verdicts: ['GROUP CHAT ADMIN BY DEFAULT.', 'REMEMBERS EVERYONE\'S COFFEE ORDER. IT IS A SUPERPOWER.', 'WARNING: STRANGERS TELL THIS PERSON THEIR SECRETS.'],
          buff: 'Rally — people show up when you call', debuff: 'Solo queue — does it all alone', boss: 'THE EMPTY ROOM',
          kept: 'people, rooms and the conversations between them', rejected: 'going it alone',
          project: 'A recurring room — a dinner, a club, a chat — around one strange shared obsession.',
          experiment: 'Invite 3 people who do not know each other into one conversation about a question you care about. Listen more than you talk.',
          question: 'Which two people you know should have met years ago?',
        },
        POWER: {
          label: 'POWER', nouns: ['OPERATOR', 'STRATEGIST', 'KINGMAKER'], adjs: ['LEVERAGED', 'INEVITABLE'],
          future: 'You learned where the levers were, and you were not shy about pulling them.',
          verdicts: ['LEVER DETECTED. HAND ALREADY ON IT.', 'DOES NOT WAIT FOR THE MEETING. IS THE MEETING.', 'WARNING: HAS OPINIONS ABOUT HOW THIS SHOULD BE RUN.'],
          buff: 'Leverage — small move, big result', debuff: 'Lets others decide', boss: 'THE MEETING WITHOUT YOU',
          kept: 'leverage: the small move with big consequences', rejected: 'staying small for comfort',
          project: 'A lever: something that lets a small input move a large outcome — a platform, a fund, a movement.',
          experiment: 'Find one decision this week that someone else is currently making badly. Offer to own it.',
          question: 'What would you change first if people actually listened to you?',
        },
      },
      places: ['UNFINISHED ROOMS', 'THE THURSDAY STREET', 'LOST AFTERNOONS', 'THE SECOND MOON', 'BORROWED WEATHER',
        'SMALL APOCALYPSES', 'QUIET MACHINES', 'OPEN DOORS', 'THE LAST BUS', 'IMPOSSIBLE MAPS'],
      title: (adj, noun, place) => 'THE ' + adj + ' ' + noun + ' OF ' + place,
      future: (earth, fact, title, f1, f2) => 'In ' + earth + ', where ' + fact + ', you became ' + title + '. ' + f1 + ' ' + f2,
      kept: (k1, k2) => k1 + '; and, close behind, ' + k2,
      branchQuestion: 'What would the version of you who chose differently at “1 YEAR” say about this life?',
      alreadyTrue: 'Which part of this timeline is already true?',
      prompts: {
        plan: r => 'I played BORN WEIRD, a playful life-simulation game (not a prediction). My character: ' + r.title + '. Strength: ' + r.buff + '. Weak spot: ' + r.debuff + '. Quest: ' + r.experiment +
          ' Turn this quest into a 7-day plan: one concrete action of 15–30 minutes per day, each with a clear "done" criterion. First ask me one question about my real situation, then give the plan.',
        future: r => 'Role-play: you are me in ' + r.finalYear + ', in a strange reality where ' + r.worldFact + '. In that life I became ' + r.title + '. That life in one line: ' + r.finalLine +
          ' Talk to present-day me as that future self: short, warm, honest, no predictions — it is a game. Start with one question to me.',
        debuff: r => 'In the game BORN WEIRD my weak spot came out as "' + r.debuff + '" (lowest stat: ' + r.labels[r.rejected] + '). It is a game, not a diagnosis. Help me check where this actually shows up in my life: ask me 3 short questions one at a time, then suggest one small experiment for this week.',
      },
      seed: {
        disclaimer: '> This file describes an explored possibility, not objective truth. It was generated by a playful simulator from a random seed, symbolic birth numbers and five choices. Nothing here is a prediction.',
        h: { timeline: 'TIMELINE', birth: 'BIRTH SEED', world: 'THE WORLD', build: 'CHARACTER BUILD', future: 'THE POSSIBLE FUTURE', choices: 'CHOICES THAT CREATED IT',
          kept: 'WHAT I KEPT CHOOSING', rejected: 'WHAT I KEPT REJECTING', events: 'IMPORTANT EVENTS', project: 'POSSIBLE PROJECT',
          experiment: 'FIRST EXPERIMENT', visual: 'VISUAL LANGUAGE', questions: 'OPEN QUESTIONS', ai: 'INSTRUCTIONS FOR AN AI' },
        birth: r => 'Life path number ' + r.lifePath + ' → starting class ' + r.startClass + '. (A symbolic device used as a game seed, not a reading of character.) At the moment of birth, in this reality, ' + r.anomaly + '.',
        world: (earth, fact) => earth + ': a world where ' + fact + '.',
        build: r => ['Class: ' + r.startClass + ' → ' + r.title, 'Buff: ' + r.buff, 'Debuff: ' + r.debuff, 'Boss: ' + r.boss, 'Verdict: ' + r.verdict,
          'Stats (0–10): ' + r.scores.map(s => s.label + ' ' + s.value).join(', ')],
        visual: p => 'Protocol: ' + p + '. Low-resolution pixel landscapes, VGA palette, scanlines, an interface from a reality that never existed.',
        ai: [
          'Treat this future as a hypothesis, not truth about me.',
          'Help me explore it, challenge it, visualize it and turn interesting parts into experiments.',
          'You may: continue the timeline, generate alternate branches, write from my future perspective, identify hidden assumptions, or turn the First Experiment into a concrete 7-day plan.',
          'Begin by asking: **"What do you want to do with this reality?"**',
        ],
        footer: v => 'Generated by BORN WEIRD v' + v + ' (dimacloud.github.io/born-weird). A simulator for lives you have not lived yet.',
      },
    },

    ru: {
      stageLabels: ['СЕЙЧАС', '7 ДНЕЙ', '1 ГОД', '10 ЛЕТ', '40 ЛЕТ'],
      lifePaths: [null, 'ЗАЧИНЩИК', 'ДИПЛОМАТ', 'РАССКАЗЧИК', 'СТРОИТЕЛЬ', 'СТРАННИК', 'ХРАНИТЕЛЬ ОЧАГА', 'ИСКАТЕЛЬ', 'МАГНАТ', 'МУДРЕЦ'],
      zodiac: ['Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева', 'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'],
      elements: ['Огонь', 'Земля', 'Воздух', 'Вода'],
      eastern: ['Крыса', 'Бык', 'Тигр', 'Кролик', 'Дракон', 'Змея', 'Лошадь', 'Коза', 'Обезьяна', 'Петух', 'Собака', 'Свинья'],
      easternFem: [true, false, false, false, false, true, true, true, true, false, true, true],
      easternElements: [['Деревянный', 'Деревянная'], ['Огненный', 'Огненная'], ['Земляной', 'Земляная'], ['Металлический', 'Металлическая'], ['Водяной', 'Водяная']],
      weekdays: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
      anomalies: [
        'часы в роддоме пропустили четыре минуты, и никто не записал, какие именно',
        'радио в соседней комнате само настроилось на несуществующую станцию',
        'все голуби в радиусе двух километров повернулись в одну сторону',
        'первым словом, прозвучавшим в палате, было «подождите»',
        'автомат с газировкой двумя этажами ниже выдал то, чего в него никогда не загружали',
        'прогноз погоды сбылся абсолютно точно, что статистически подозрительно',
        'кто-то в приёмном покое вписал в кроссворд слово, которого ещё не существовало',
        'свет мигнул ровно на столько, сколько нужно, чтобы принять решение',
        'лифт остановился на этаже, которого в здании нет',
        'где-то вернули библиотечную книгу с опозданием на сорок лет и запиской «извините, дела»',
      ],
      worldFacts: [
        'карты обновляет тот, кто прошёл там последним',
        'в каждом городе есть улица, которая существует только по четвергам',
        'люди празднуют второй день рождения — день, когда передумали насчёт чего-то важного',
        'библиотеки выдают на время неиспользованные вечера',
        'луна слегка приближается к тем, кто врёт',
        'к любому можно на один день пойти в ученики, без лишних вопросов',
        'тишина — это валюта, но только мелкими купюрами',
        'о сожалениях сообщают в прогнозе погоды',
        'недоделанные проекты по закону считаются домашними питомцами',
        'почта доставляет письма всем версиям тебя, которые не случились',
      ],
      stages: [
        [
          { prompt: 'Приходит сообщение с твоего же номера. Дата отправки — через десять лет. В нём одно слово: «не надо».',
            options: [
              O('Ответить: «что НЕ НАДО?»', 'Ты отвечаешь. Три точки мигают {n} {n|час|часа|часов}. Потом: «{msg}». Ты делаешь скриншот. Никто не верит.',
                { n: [2, 9], msg: ['синюю', 'ты и так знаешь', 'ладно. делай. но возьми куртку', 'ой, не та реальность', 'не письмо. другое', 'спроси человека, который только что пришёл тебе в голову'] }),
              O('Всё равно сделать задуманное', 'Ты всё равно это делаешь. {c}. Сообщение тихо удаляет само себя.',
                { c: ['Ничего не взрывается', 'Где-то в твоём календаре открывается маленькая дверь', 'Батарея телефона прибавляет четыре процента', 'Незнакомец кивает тебе так, будто ждал именно этого'] }),
              O('Отменить всё и остаться дома', 'Ты остаёшься дома. {t} за окном раздаётся {s}. Что бы это ни было, оно происходит без тебя — и тебя это устраивает.',
                { t: ['В 3:14 ночи', 'В 23:11', 'Ровно в полдень', 'В 16:44'], s: ['гром аплодисментов', 'звук разыгрывающегося духового оркестра', 'голос, зовущий имя, почти похожее на твоё', 'гогот очень уверенного в себе гуся'] }),
            ] },
          { prompt: 'На телефоне появляется приложение, которое никто не устанавливал. В нём одна кнопка: «ЖИТЬ ИНАЧЕ». Она светится.',
            options: [
              O('Нажать', 'Экран белеет на {n} {n|секунду|секунды|секунд}. После этого кофе на вкус как решение, которое ещё не принято. Непрочитанных сообщений от тебя же: {k}.',
                { n: [3, 9], k: [2, 40] }),
              O('Удалить. Потом проверить, точно ли удалилось', 'Удалилось. Но на заставке теперь {w}. Заставку никто не менял.',
                { w: ['незнакомая дверь', 'твой собственный почерк вверх ногами', 'карта города, где одна улица названа твоим именем'] }),
              O('Сделать скриншот и кинуть в общий чат', 'За минуту отвечают {k} {k|человек|человека|человек}. Кто-то пишет: «{q}». Приложение исчезает у всех, кроме тебя.',
                { k: [3, 14], q: ['у меня то же самое', 'без меня не нажимай', 'а я его ещё в 2019-м нажал'] }),
            ] },
          { prompt: 'Ты просыпаешься на 40 минут раньше с полной уверенностью, что сегодня важный день. Никто не объясняет почему.',
            options: [
              O('Записать всё, что приходит в голову', 'К семи утра у тебя {k} {k|строка|строки|строк}. Строка №{m} пока не имеет смысла. Её стоит сохранить.', { k: [12, 60], m: [3, 11] }),
              O('Позвонить тому, кого давно избегаешь', 'Трубку берут {n}, и голос говорит: «{q}».',
                { n: ['после первого же гудка', 'после третьего гудка', 'на самом последнем гудке'], q: ['ну наконец-то', 'это судьба, не иначе', 'подожди, я сяду'] }),
              O('Выйти и пойти туда, куда никогда не ходишь', 'Через {k} {k|минуту|минуты|минут} ты находишь {p}. Больше никто этого, похоже, не замечает.',
                { k: [7, 45], p: ['лавку, где продают только ключи', 'скамейку с табличкой, посвящённой тебе', 'лестницу, которой вчера здесь не было'] }),
              O('Сварить кофе и притвориться, что день обычный', 'Получается. Почти. В {t} совсем рядом происходит что-то маленькое и важное. Ты узнаёшь об этом через {k} {k|год|года|лет}.',
                { t: ['10:10', '13:37', '17:05'], k: [2, 9] }),
            ] },
        ],
        [
          { prompt: 'Незнакомец вкладывает тебе в руку латунный ключ с бумажной биркой: «ты поймёшь». Ключ подходит к трём дверям в твоём городе.',
            options: [
              O('Дверь, за которой играет музыка', 'За дверью — {room}. Тебе вручают инструмент, на котором ты не умеешь играть. Ты всё равно играешь. Тебя приглашают ещё.',
                { room: ['репетиция группы без названия', 'свадьба двух людей, познакомившихся вчера', 'хор, который поёт только в тональности «почти»', 'вечеринка в честь праздника, которого нет ни в одном календаре'] }),
              O('Дверь с табличкой «ВХОДА НЕТ»', 'За ней — {secret}. Ты делаешь одну фотографию. Позже на снимке оказывается что-то другое.',
                { secret: ['лестница, ведущая вбок', 'кабинет, где кто-то ждёт именно тебя', 'сад, растущий под лампами дневного света', 'карта города, на которой уже нарисован твой маршрут'] }),
              O('Сделать копию ключа. Продавать доступ.', 'К воскресенью продано {k} {k|копия|копии|копий}. Женщина в сером пальто предлагает купить оригинал. Ты отвечаешь: пока нет.', { k: [7, 40] }),
            ] },
          { prompt: 'Незнакомец предлагает обмен на неделю: твоя жизнь на его. Без вопросов, без объяснений, с гарантией возврата.',
            options: [
              O('Согласиться сразу', 'Его жизнь оказывается {l}. К четвергу у тебя получается лучше, чем у него.',
                { l: ['ночной сменой в планетарии', 'крошечной пекарней с огромным долгом', 'знаменитым анонимным аккаунтом'] }),
              O('Согласиться, но взять блокнот', 'Ты записываешь всё. {k} {k|страница|страницы|страниц}. Страница {m} становится самым читаемым текстом в твоей жизни.', { k: [20, 90], m: [3, 19] }),
              O('Отказаться и спросить, что не так с его жизнью', 'Вы разговариваете до {t}. Оказывается, дело было вовсе не в обмене. Теперь вы должны друг другу по одной услуге.',
                { t: ['полуночи', 'рассвета', 'закрытия кафе'] }),
            ] },
          { prompt: 'Человек, у которого есть власть над тобой — начальник, преподаватель, арендодатель, — совершает очевидную ошибку. Замечаешь только ты.',
            options: [
              O('Сказать наедине', 'Повисает пауза, потом: «{q}». Что-то между вами сдвигается на {k} {k|градус|градуса|градусов}.',
                { q: ['спасибо. правда', 'зачем ты мне помогаешь?', 'давай это останется между нами'], k: [5, 40] }),
              O('Тихо всё исправить', 'Никто не знает. Всё работает. Ты заводишь тайный список «{n}». К пятнице в нём {k} {k|пункт|пункта|пунктов}.',
                { n: ['тихо починено', 'улики', 'теневое резюме'], k: [2, 9] }),
              O('Обратить это в свою пользу', 'Ты молчишь и ждёшь. На {k}-й день желаемое у тебя в руках. Заодно ты узнаёшь о себе кое-что, чего лучше было бы не знать.', { k: [3, 7] }),
            ] },
        ],
        [
          { prompt: 'Тебе достаются деньги, на которые можно не работать три года. Что происходит первым делом?',
            options: [
              O('Наконец строю то, о чём рассказываю всем на вечеринках', 'Месяц {m}-й: первая версия уродлива, но жива. Ей пользуются {k} {k|человек|человека|человек}. Один пишет: «{q}».',
                { m: [2, 7], k: [12, 300], q: ['это странно. мне это нужно', 'кто это сделал и почему оно меня понимает', 'пожалуйста, не чините баг. баг — лучшее, что тут есть'] }),
              O('Билет в один конец. Телефон выключен.', 'Ты оказываешься в {p}. Перестаёшь следить за датой. Учишь слово, означающее «{w}», на языке, на котором говорят {k} {k|человек|человека|человек}.',
                { p: ['портовом городке без туристического центра', 'городе, где автобусы ходят на сплетнях', 'горной деревне с отличным вайфаем и без единой причины им пользоваться'], w: ['час после принятого решения', 'друг, с которым вы ещё не знакомы', 'тоска по месту, которого не существует'], k: [300, 9000] }),
              O('Инвестирую. Продолжаю работать. Тихо.', 'Никто ничего не замечает. В этом и смысл. К зиме {r}.',
                { r: ['твои деньги тихо начинают зарабатывать новые деньги', 'у тебя есть маленький кусочек того, что вот-вот станет важным', 'ты можешь сказать «нет» чему угодно — и начинаешь говорить'] }),
              O('Собираю всех, кто мне нравится, в одном месте. Бессрочно.', 'Ты снимаешь {v}. Через месяц у места появляется название, которое выбрал кто-то другой. Начинают приходить люди, которых никто не звал.',
                { v: ['старую типографию', 'квартиру над пекарней', 'заброшенный планетарий', 'половину лодки'] }),
            ] },
          { prompt: 'Можно мгновенно освоить один навык — но навсегда забыть другой. Какой именно забудется, выбрать нельзя.',
            options: [
              O('Новый язык', 'Ты забываешь, как {f}. Никто не замечает {k} {k|месяц|месяца|месяцев}. Зато в новом языке есть слово ровно для твоей ситуации.',
                { f: ['свистеть', 'кататься на велосипеде', 'складывать простыню на резинке', 'убедительно врать'], k: [2, 8] }),
              O('Делать вещи руками', 'Ты забываешь, как {f}. Зато собираешь {b}. Люди спрашивают, продаётся ли. Нет.',
                { f: ['свистеть', 'кататься на велосипеде', 'складывать простыню на резинке', 'убедительно врать'], b: ['стул, который чуть честнее, чем нужно', 'небольшую лодку', 'дверь в никуда'] }),
              O('Читать людей', 'Ты забываешь, как {f}. Теперь ты знаешь, чего человек хочет, за {k} {k|секунду|секунды|секунд} до того, как он это скажет. Полезно. Утомительно.',
                { f: ['свистеть', 'кататься на велосипеде', 'складывать простыню на резинке', 'убедительно врать'], k: [2, 9] }),
              O('Мастерски ничего не делать', 'Ты забываешь, как {f}. Впервые за годы тебе скучно. Это похоже на {x}.',
                { f: ['свистеть', 'кататься на велосипеде', 'складывать простыню на резинке', 'убедительно врать'], x: ['открывающуюся дверь', 'первый день лета', 'возвращение в четырнадцать лет'] }),
            ] },
          { prompt: 'Приходит коробка: от тебя — тебе. Отправлена год назад. Как её отправляли, ты не помнишь.',
            options: [
              O('Открыть сразу', 'Внутри — {i} и записка: «{q}».',
                { i: ['ключ без замка', 'билет в город, которого не было в планах', 'список из семи имён'], q: ['всё верно', 'начни со второго пункта', 'пока никому не говори'] }),
              O('Не открывать и подождать', '{k} {k|неделю|недели|недель} ничего не происходит. Потом всё происходит одновременно. И только у тебя всё уже готово.', { k: [3, 11] }),
              O('Открыть вместе с друзьями', 'Каждый находит там что-то своё. {n} получает ровно то, что было нужно. Никто не спрашивает, как такое возможно.',
                { n: ['Самый тихий из вас', 'Твой самый старый друг', 'Незнакомец, пришедший за компанию'] }),
            ] },
        ],
        [
          { prompt: 'Тем, что ты создаёшь, внезапно пользуется миллион человек — и совсем не так, как было задумано.',
            options: [
              O('Взять штурвал. Рулить.', 'Ты перестаёшь нормально спать и начинаешь выигрывать. К концу года {h}.',
                { h: ['про тебя снимают документальный фильм, и в нём у тебя ужасная причёска', 'правительство цитирует тебя, ничего не понимая', 'появляются три клона, и один из них лучше'] }),
              O('Закрыть. Это уже не моё.', 'Ты выдёргиваешь вилку из розетки. Интернет злится {k} {k|день|дня|дней}. Ты начинаешь что-то поменьше, постраннее и целиком своё.', { k: [3, 19] }),
              O('Найти самого странного пользователя и встретиться', 'Самый странный пользователь — {u}. Вы встречаетесь в кафе и говорите {k} {k|час|часа|часов}. Следующее десятилетие тихо перестраивается.',
                { u: ['отставной смотритель маяка, который с его помощью разговаривает с кораблями', 'четырнадцатилетний подросток, который управляет через него очень маленькой страной', 'монастырь, который планирует в нём тишину'], k: [3, 11] }),
              O('Защитить тех, кто уже пользуется', 'Ты строишь стены, а потом двери в стенах. Всё растёт медленнее, зато надолго. Через {k} {k|год|года|лет} тебя всё ещё благодарят в самых странных местах.', { k: [4, 12] }),
            ] },
          { prompt: 'Тебя начинают узнавать по одной вещи — и совсем не по той, по которой хотелось.',
            options: [
              O('Принять и усилить', 'Ты делаешь из этого бренд. К концу года {h}.',
                { h: ['появляется мерч', 'какой-то подкаст тебя пародирует', 'мама наконец понимает, чем ты занимаешься'] }),
              O('Тихо начать заново в другом месте', 'Новый город, новое имя в титрах. Через {k} {k|год|года|лет} то, чего хотелось на самом деле, тихо становится знаменитым.', { k: [2, 7] }),
              O('Научить других делать это лучше тебя', '{k} {k|ученик|ученика|учеников}. Один из них тебя обходит. Радости от этого больше, чем ожидалось.', { k: [5, 300] }),
            ] },
          { prompt: 'Приходит предложение: всё удвоить — деньги, влияние, нагрузку. Ответ нужен до полуночи.',
            options: [
              O('Да', 'Ты соглашаешься. Получаешь {x}. Теряешь {y}.',
                { x: ['вид из окна', 'водителя', 'должность из трёх слов'], y: ['свои воскресенья', 'одного друга', 'способность скучать'] }),
              O('Нет', 'Ты отказываешься в 23:{k}. Наутро — {f}.', { k: [10, 59], f: ['лёгкость, какой не было годами', 'богатство, которое никто не обложит налогом', 'подозрительная свобода'] }),
              O('Встречное: половина работы за те же деньги', 'Ответ: {q}. Оказывается, торговаться — это тоже творчество.', { q: ['«да», как ни странно', 'сначала «нет», потом «да»', '«кто тебя этому научил?»'] }),
              O('Спросить тех, кого любишь', 'Они спорят {k} {k|час|часа|часов}. В итоге решение принимают они, и оно правильное.', { k: [2, 6] }),
            ] },
        ],
        [
          finalSit('Ребёнок спрашивает: «А что ты на самом деле делаешь всю жизнь?» У тебя одно предложение.',
            ['«Ищу край карты».', '«Строю место, где людям есть куда прийти».', '«Слежу, чтобы никто не указывал мне, что делать».',
              '«Делаю вещи, которых ещё не было».', '«Держу оборону, пока всё вокруг меняется».', '«Двигаю фигуры, которые больше никто не может сдвинуть».'],
            '{Y} год. Ребёнок думает и выдаёт: «{reply}» — и тебе так смешно, как не было уже лет десять.',
            { reply: ['Это же не работа', 'А мне так можно?', 'То есть вся эта странность — нарочно?', 'Это надо записать', 'И как, получилось?'] }),
          finalSit('Где-то можно навсегда высечь одну фразу. Где и какую?',
            ['На маяке: «Ищи дальше».', 'Над дверью кухни: «Есть будут все».', 'На скамейке на краю города: «Не обязательно».',
              'На машине, которая всё ещё работает: «Сделано руками».', 'На мосту: «Выдержал».', 'На башне: «Сдвинуто».'],
            '{Y} год. Незнакомец фотографирует надпись и выкладывает с подписью «{c}». {k} {k|лайк|лайка|лайков}. Ты так об этом и не узнаёшь.',
            { c: ['кто это написал?', 'как раз сегодня было нужно', 'странно, но верно'], k: [3, 40000] }),
          finalSit('Ты, только на 40 лет старше, присылаешь себе один совет. Он должен уместиться на стикере.',
            ['«Иди дальше, чем кажется разумным».', '«Позвони им. Сегодня».', '«Никто не придёт дать тебе разрешение».',
              '«Сначала сделай уродливую версию».', '«Сделай резервную копию».', '«Проси больше».'],
            '{Y} год. Ты находишь этот стикер в старой книге и подсчитываешь: совет сработал {k} {k|раз|раза|раз} из 10.', { k: [4, 9] }),
        ],
      ],
      dims: {
        AUTONOMY: {
          label: 'АВТОНОМИЯ', nouns: ['БЕГЛЕЦ', 'ВОЛЬНЫЙ АГЕНТ', 'КОЧЕВНИК'], adjs: ['БЕСПРИЗОРНЫЙ', 'НЕЛИЦЕНЗИРОВАННЫЙ'],
          future: 'Это жизнь, где мало начальников и много запасных выходов.',
          verdicts: ['ОШИБКА 403: НАЧАЛЬСТВУ ВХОД ЗАПРЕЩЁН.', 'ЧИТАЕТ ПРАВИЛА, ТОЛЬКО ЧТОБЫ НАЙТИ ЛАЗЕЙКУ.', 'СИСТЕМА: ПОД КОНТРОЛЬ НЕ БЕРЁТСЯ. ДАЖЕ НЕ ПРОБУЙТЕ.'],
          buff: 'Видит выход из любой ситуации', debuff: 'Ждёт разрешения', boss: 'ПРИВРАТНИК',
          kept: 'свои правила вместо чужого плана', rejected: 'разрешение',
          project: 'Дело на одного человека, которому не нужно ничьё одобрение: микростудия, крошечный продукт, рассылка с безумной идеей.',
          experiment: '7 дней подряд трать час в день на то, о чём тебя никто не просил. На седьмой день опубликуй результат, каким бы маленьким он ни был.',
          question: 'Что появилось бы в этом году, если бы никто не смотрел?',
        },
        SECURITY: {
          label: 'НАДЁЖНОСТЬ', nouns: ['ХРАНИТЕЛЬ', 'АРХИВАРИУС', 'СМОТРИТЕЛЬ МАЯКА'], adjs: ['НЕПРОБИВАЕМЫЙ', 'ТЕРПЕЛИВЫЙ'],
          future: 'Когда что-то ломается, люди бегут к тебе — потому что у тебя всё уже готово.',
          verdicts: ['ОБНАРУЖЕНА РЕЗЕРВНАЯ КОПИЯ РЕЗЕРВНОЙ КОПИИ.', 'ЕСТЬ ПЛАН Б ДЛЯ ПЛАНА Б. ОН РАБОТАЕТ.', 'ВНИМАНИЕ: ПОДОЗРИТЕЛЬНОЕ СПОКОЙСТВИЕ В ЧС.'],
          buff: 'При тебе ничего не ломается', debuff: 'Без страховки', boss: 'ВНЕЗАПНЫЙ ШТОРМ',
          kept: 'твёрдый пол, который держит, даже когда всё остальное сломалось', rejected: 'лишний риск',
          project: 'Система, от которой спокойнее тебе и людям вокруг: финансовая подушка, инструмент, ритуал, который держит, когда всё рушится.',
          experiment: 'Выпиши три вещи, потеря которых ударила бы сильнее всего. На этой неделе сделай маленькую страховку для одной из них.',
          question: 'Какая из твоих страховочных сеток на самом деле клетка?',
        },
        CURIOSITY: {
          label: 'ЛЮБОПЫТСТВО', nouns: ['КАРТОГРАФ', 'СЫЩИК', 'ОХОТНИК ЗА СИГНАЛАМИ'], adjs: ['БЕСПОКОЙНЫЙ', 'НЕИЗВЕДАННЫЙ'],
          future: 'Ты идёшь за вопросами дальше, чем разумно, и некоторые из них идут следом за тобой.',
          verdicts: ['ОТКРЫТО СЛИШКОМ МНОГО ВКЛАДОК. ВСЕ ВАЖНЫЕ.', 'ОШИБКА: У ВОПРОСА НЕТ ДНА.', 'СЧЁТЧИК «А ПОЧЕМУ?» ПЕРЕПОЛНЕН.'],
          buff: 'Находит скрытый слой', debuff: 'Пропускает «зачем»', boss: 'ОЧЕВИДНЫЙ ОТВЕТ',
          kept: 'безымянная дверь: вопрос вместо ответа', rejected: 'очевидное объяснение',
          project: 'Публичное и слегка одержимое расследование одного вопроса, за ответ на который никто не платит.',
          experiment: 'Выбери вопрос, о котором не можешь перестать думать. Задай его пятерым людям, которые могут знать ответ. Запиши, что удивило.',
          question: 'Вокруг какого вопроса ты кружишь годами, так и не задав его вслух?',
        },
        CREATION: {
          label: 'СОЗИДАНИЕ', nouns: ['ИЗОБРЕТАТЕЛЬ', 'АРХИТЕКТОР', 'МЕХАНИК'], adjs: ['РУКОТВОРНЫЙ', 'НЕДОДЕЛАННЫЙ'],
          future: 'За тобой тянется след из вещей, инструментов и странных машин, которые переживают собственный смысл.',
          verdicts: ['СТАТУС СБОРКИ: НЕ ДОДЕЛАНО. КАК ВСЕГДА. ТАК И ЗАДУМАНО.', 'ПРЕВРАЩАЕТ СКУКУ В ПРОТОТИПЫ.', 'ВНИМАНИЕ: СНАЧАЛА СДЕЛАЕТ, ПОТОМ ОБЪЯСНИТ.'],
          buff: 'Быстро превращает идеи в вещи', debuff: 'Планы, которые не доходят до дела', boss: 'ЧИСТЫЙ ЛИСТ',
          kept: 'делать вещь вместо разговоров о вещи', rejected: 'законченное, отполированное, безопасное',
          project: 'То, что ты описываешь всем на вечеринках, — собранное в уродливую, но работающую первую версию.',
          experiment: 'За 3 часа сделай самую уродливую версию своей идеи. Покажи одному человеку. Запиши первый вопрос, который услышишь.',
          question: 'Какая идея в твоей голове уже заслужила плохой первый черновик?',
        },
        CONNECTION: {
          label: 'ЛЮДИ', nouns: ['ТАМАДА', 'ПРОВОДНИК', 'ХОРМЕЙСТЕР'], adjs: ['ЩЕДРЫЙ', 'МНОГОЛЮДНЫЙ'],
          future: 'Вокруг тебя наполняются комнаты — людьми, которые иначе никогда бы не встретились.',
          verdicts: ['АДМИН ОБЩЕГО ЧАТА ПО УМОЛЧАНИЮ.', 'ПОМНИТ, КТО КАКОЙ КОФЕ ПЬЁТ. ЭТО СУПЕРСИЛА.', 'ВНИМАНИЕ: НЕЗНАКОМЦЫ САМИ ВЫКЛАДЫВАЮТ СЕКРЕТЫ.'],
          buff: 'Позовёт — и люди придут', debuff: 'Всё тащит в одиночку', boss: 'ПУСТАЯ КОМНАТА',
          kept: 'люди, комнаты и разговоры между ними', rejected: 'путь в одиночку',
          project: 'Регулярная встреча — ужин, клуб, чат — вокруг одной странной общей одержимости.',
          experiment: 'Позови в один разговор троих людей, не знакомых друг с другом, — на тему, которая тебе важна. Слушай больше, чем говоришь.',
          question: 'Какие двое из твоих знакомых давно должны были познакомиться?',
        },
        POWER: {
          label: 'ВЛИЯНИЕ', nouns: ['ОПЕРАТОР', 'СТРАТЕГ', 'ДЕЛАТЕЛЬ КОРОЛЕЙ'], adjs: ['ВЛИЯТЕЛЬНЫЙ', 'НЕИЗБЕЖНЫЙ'],
          future: 'Ты знаешь, где рычаги, и не стесняешься за них тянуть.',
          verdicts: ['ОБНАРУЖЕН РЫЧАГ. РУКА УЖЕ НА НЁМ.', 'НЕ ХОДИТ НА СОВЕЩАНИЯ. СОВЕЩАНИЯ ПРИХОДЯТ САМИ.', 'ВНИМАНИЕ: УЖЕ ЕСТЬ ПЛАН, КАК ТУТ ВСЁ ПЕРЕУСТРОИТЬ.'],
          buff: 'Малым движением — большой результат', debuff: 'Отдаёт решения другим', boss: 'СОВЕЩАНИЕ БЕЗ ТЕБЯ',
          kept: 'рычаг: маленькое движение с большими последствиями', rejected: 'маленький масштаб ради комфорта',
          project: 'Рычаг: то, что позволяет малым усилием сдвинуть большое, — платформа, фонд, движение.',
          experiment: 'Найди на этой неделе одно решение, которое кто-то принимает плохо. Предложи взять его на себя.',
          question: 'Что изменится первым, если тебя действительно начнут слушать?',
        },
      },
      places: ['НЕДОСТРОЕННЫХ КОМНАТ', 'ЧЕТВЕРГОВОЙ УЛИЦЫ', 'ПОТЕРЯННЫХ ВЕЧЕРОВ', 'ВТОРОЙ ЛУНЫ', 'ОДОЛЖЕННОЙ ПОГОДЫ',
        'МАЛЕНЬКИХ АПОКАЛИПСИСОВ', 'ТИХИХ МАШИН', 'ОТКРЫТЫХ ДВЕРЕЙ', 'ПОСЛЕДНЕГО АВТОБУСА', 'НЕВОЗМОЖНЫХ КАРТ'],
      title: (adj, noun, place) => adj + ' ' + noun + ' ' + place,
      future: (earth, fact, title, f1, f2) => 'В реальности ' + earth + ', где ' + fact + ', ты — ' + title + '. ' + f1 + ' ' + f2,
      kept: (k1, k2) => k1 + '; а сразу следом — ' + k2,
      branchQuestion: 'Что сказала бы о такой жизни версия тебя, которая на этапе «1 ГОД» выбрала иначе?',
      alreadyTrue: 'Какая часть этой хронологии уже правда?',
      prompts: {
        plan: r => 'Я прохожу BORN WEIRD — игру-симулятор жизни (это игра, не предсказание). Мой персонаж: ' + r.title + '. Сильная сторона: ' + r.buff + '. Слабое место: ' + r.debuff + '. Квест: ' + r.experiment +
          ' Преврати квест в план на 7 дней: одно конкретное действие на 15–30 минут в день и понятный критерий «сделано». Сначала задай мне один вопрос о моей реальной ситуации, потом дай план. Отвечай по-русски.',
        future: r => 'Ролевая игра: ты — это я в ' + r.finalYear + ' году, в странной реальности, где ' + r.worldFact + '. В этой жизни я — ' + r.title + '. Итог этой жизни в одной фразе: ' + r.finalLine +
          ' Поговори с сегодняшней версией меня от лица этого будущего: коротко, тепло, честно, без предсказаний — это игра. Начни с одного вопроса ко мне. Отвечай по-русски.',
        debuff: r => 'В игре BORN WEIRD моим слабым местом выпало «' + r.debuff + '» (самая низкая характеристика: ' + r.labels[r.rejected] + '). Это игра, не диагноз. Помоги проверить, где это реально проявляется в моей жизни: задай 3 коротких вопроса по одному, потом предложи один маленький эксперимент на эту неделю. Отвечай по-русски.',
      },
      seed: {
        disclaimer: '> Этот файл описывает исследованную возможность, а не объективную правду. Его сгенерировал игровой симулятор из случайного зерна, символических чисел рождения и пяти выборов. Ничто здесь не является предсказанием.',
        h: { timeline: 'ХРОНОЛОГИЯ (TIMELINE)', birth: 'ЗЕРНО РОЖДЕНИЯ (BIRTH SEED)', world: 'МИР (THE WORLD)', build: 'СБОРКА ПЕРСОНАЖА (CHARACTER BUILD)', future: 'ВОЗМОЖНОЕ БУДУЩЕЕ (THE POSSIBLE FUTURE)',
          choices: 'ВЫБОРЫ, КОТОРЫЕ ЕГО СОЗДАЛИ (CHOICES THAT CREATED IT)', kept: 'ЧТО ВЫБИРАЛОСЬ СНОВА И СНОВА (WHAT I KEPT CHOOSING)',
          rejected: 'ЧТО ОТВЕРГАЛОСЬ (WHAT I KEPT REJECTING)', events: 'ВАЖНЫЕ СОБЫТИЯ (IMPORTANT EVENTS)', project: 'ВОЗМОЖНЫЙ ПРОЕКТ (POSSIBLE PROJECT)',
          experiment: 'ПЕРВЫЙ ЭКСПЕРИМЕНТ (FIRST EXPERIMENT)', visual: 'ВИЗУАЛЬНЫЙ ЯЗЫК (VISUAL LANGUAGE)', questions: 'ОТКРЫТЫЕ ВОПРОСЫ (OPEN QUESTIONS)',
          ai: 'ИНСТРУКЦИИ ДЛЯ ИИ (INSTRUCTIONS FOR AN AI)' },
        birth: r => 'Число пути ' + r.lifePath + ' → стартовый класс ' + r.startClass + '. (Символический приём и игровое зерно, а не описание характера.) В момент рождения в этой реальности ' + r.anomaly + '.',
        world: (earth, fact) => earth + ': мир, где ' + fact + '.',
        build: r => ['Класс: ' + r.startClass + ' → ' + r.title, 'Бафф: ' + r.buff, 'Дебафф: ' + r.debuff, 'Босс: ' + r.boss, 'Вердикт: ' + r.verdict,
          'Характеристики (0–10): ' + r.scores.map(s => s.label + ' ' + s.value).join(', ')],
        visual: p => 'Протокол: ' + p + '. Пиксельные пейзажи низкого разрешения, VGA-палитра, строки развёртки, интерфейс из реальности, которой никогда не было.',
        ai: [
          'Относись к этому будущему как к гипотезе, а не как к правде обо мне.',
          'Помоги мне исследовать его, оспорить, визуализировать и превратить интересные части в эксперименты.',
          'Можно: продолжить хронологию, сгенерировать альтернативные ветки, написать текст от лица меня из будущего, найти скрытые допущения или превратить Первый эксперимент в конкретный план на 7 дней.',
          'Общайся со мной по-русски.',
          'Начни с вопроса: **«Что ты хочешь сделать с этой реальностью?»**',
        ],
        footer: v => 'Сгенерировано BORN WEIRD v' + v + ' (dimacloud.github.io/born-weird/ru). Симулятор жизней, которых у тебя ещё не было.',
      },
    },
  };

  // Rarity of the (primary|secondary) pair = share of random simulations; generated by operations/rarity.mjs.
  const RARITY = {"AUTONOMY|CONNECTION":0.04507,"AUTONOMY|CREATION":0.02495,"AUTONOMY|CURIOSITY":0.02279,"AUTONOMY|POWER":0.04181,"AUTONOMY|SECURITY":0.02523,"CONNECTION|AUTONOMY":0.04849,"CONNECTION|CREATION":0.03936,"CONNECTION|CURIOSITY":0.04021,"CONNECTION|POWER":0.06105,"CONNECTION|SECURITY":0.0431,"CREATION|AUTONOMY":0.03198,"CREATION|CONNECTION":0.03366,"CREATION|CURIOSITY":0.01311,"CREATION|POWER":0.03225,"CREATION|SECURITY":0.01605,"CURIOSITY|AUTONOMY":0.03177,"CURIOSITY|CONNECTION":0.04111,"CURIOSITY|CREATION":0.0158,"CURIOSITY|POWER":0.03281,"CURIOSITY|SECURITY":0.01744,"POWER|AUTONOMY":0.04353,"POWER|CONNECTION":0.05783,"POWER|CREATION":0.03379,"POWER|CURIOSITY":0.02806,"POWER|SECURITY":0.0366,"SECURITY|AUTONOMY":0.03093,"SECURITY|CONNECTION":0.04265,"SECURITY|CREATION":0.01761,"SECURITY|CURIOSITY":0.01525,"SECURITY|POWER":0.03567};

  const normLang = lang => (LANGS.indexOf(lang) >= 0 ? lang : 'en');
  const pack = lang => CONTENT[normLang(lang)];

  // ---------- birth decoding (local display only; never shared) ----------
  function parseBirthDate(str) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str || '');
    if (!m) return null;
    const y = +m[1], mo = +m[2], d = +m[3];
    const date = new Date(Date.UTC(y, mo - 1, d));
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null;
    return date;
  }
  function validateBirth(str, now) {
    const date = parseBirthDate(str);
    if (!date) throw new Error('invalid birth date');
    now = now || new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const daysAlive = Math.floor((today - date.getTime()) / 86400000);
    if (daysAlive < 0) throw new Error('birth date is in the future');
    if (date.getUTCFullYear() < 1900) throw new Error('birth date too early');
    return { date, daysAlive };
  }
  /** Numerology-style life path: digit sum reduced to 1–9, with the steps shown to the user. */
  function lifePathOf(str) {
    const [y, m, d] = str.split('-');
    const digits = (d + m + y).split('').map(Number); // shown in DD.MM.YYYY order, as people write dates
    let n = digits.reduce((a, b) => a + b, 0);
    const steps = [digits.join('+') + ' = ' + n];
    while (n > 9) { const ds = String(n).split('').map(Number); n = ds.reduce((a, b) => a + b, 0); steps.push(ds.join('+') + ' = ' + n); }
    return { n, steps };
  }
  function zodiacOf(month, day) {
    const md = month * 100 + day;
    let best = 9; // Capricorn covers 22 Dec – 19 Jan (wraps the year)
    let bestStart = -1;
    ZODIAC.forEach(([m, d], i) => { const s = m * 100 + d; if (s <= md && s > bestStart) { bestStart = s; best = i; } });
    return best;
  }
  function easternOf(y, month, day) {
    // Simplified: the eastern year is taken to start on 4 February.
    const yy = (month < 2 || (month === 2 && day < 4)) ? y - 1 : y;
    return { animal: (((yy - 4) % 12) + 12) % 12, element: Math.floor(((((yy - 4) % 10) + 10) % 10) / 2) };
  }

  /** Symbolic decoding of a birth date. Shown to the user only; never part of shareable output. */
  function decodeBirth(birthDateStr, lang, now) {
    const P = pack(lang);
    const { date, daysAlive } = validateBirth(birthDateStr, now);
    const y = date.getUTCFullYear(), mo = date.getUTCMonth() + 1, d = date.getUTCDate();
    const lp = lifePathOf(birthDateStr);
    const z = zodiacOf(mo, d), zEl = ZODIAC[z][2];
    const e = easternOf(y, mo, d);
    const wd = date.getUTCDay();
    const eastern = P.easternName ? P.easternName(P.easternElements[e.element], P.eastern[e.animal])
      : P.easternElements[e.element][P.easternFem[e.animal] ? 1 : 0] + ' ' + P.eastern[e.animal];
    const bonuses = [{ kind: 'lifePath', dim: LIFE_PATH_DIM[lp.n], value: BONUS.lifePath }];
    bonuses.forEach(b => { b.label = P.dims[b.dim].label; });
    return {
      daysAlive, lifePath: lp.n, lifePathSteps: lp.steps, startClass: P.lifePaths[lp.n],
      zodiac: P.zodiac[z], element: P.elements[zEl], eastern, weekday: P.weekdays[wd], bonuses,
    };
  }

  // ---------- runs ----------
  /** Start a run. The seed comes from the per-run random salt only — never from the date — so it cannot be traced back. */
  function newRun(birthDateStr, salt, lang, now) {
    lang = normLang(lang);
    now = now || new Date();
    const decoded = decodeBirth(birthDateStr, lang, now);
    if (salt == null) salt = Math.floor(Math.random() * 4294967296);
    const seed = hash('bornweird:seed:' + salt);
    const scores = {};
    DIMS.forEach(dim => { scores[dim] = 0; });
    decoded.bonuses.forEach(b => { scores[b.dim] = Math.round((scores[b.dim] + b.value) * 10) / 10; });
    return makeRun(seed, decoded.lifePath, scores, lang, now.getFullYear(), decoded);
  }
  function makeRun(seed, lifePath, scores, lang, year, decoded) {
    // First situation is chosen by the life path number ("your number picked this question"); the rest by the seed.
    const sits = STAGE_META.map((m, i) => (i === 0 ? lifePath % m.sits.length : pickIdx(rngFor(seed, 'sit' + i), m.sits.length)));
    return { seed, lifePath, lang: normLang(lang), year, sits, choices: [], outcomes: [], scores, decoded: decoded || null };
  }

  /** The strange world of this run (from the seed, so it can be shown before the choices). */
  function world(run) {
    const P = pack(run.lang), fr = rngFor(run.seed, 'world');
    const anomaly = P.anomalies[pickIdx(fr, P.anomalies.length)];
    const worldFact = P.worldFacts[pickIdx(fr, P.worldFacts.length)];
    return { earth: 'EARTH-' + String(1000 + (run.seed % 9000)), anomaly, worldFact };
  }

  /** The situation shown at stage i. */
  function stage(run, i) {
    const P = pack(run.lang);
    const sit = P.stages[i][run.sits[i]];
    return { index: i, label: P.stageLabels[i], prompt: sit.prompt, options: sit.options.map(o => o.text), byBirth: i === 0, total: STAGE_META.length };
  }

  function outcomeText(run, i, choice) {
    const P = pack(run.lang);
    const opt = P.stages[i][run.sits[i]].options[choice];
    const r = rngFor(run.seed, 's' + i + ':' + run.sits[i] + ':' + choice);
    const vars = { Y: run.year + STAGE_META[i].offsetYears };
    Object.keys(opt.vars).sort().forEach(k => {
      const v = opt.vars[k];
      vars[k] = Array.isArray(v) && typeof v[0] === 'number' && v.length === 2 ? int(r, v[0], v[1]) : v[pickIdx(r, v.length)];
    });
    return fill(opt.outcome, vars);
  }

  /** Apply a choice at stage i; returns the outcome text and the stat changes to show. */
  function choose(run, i, choice) {
    if (i !== run.choices.length) throw new Error('stages must be chosen in order');
    const opts = STAGE_META[i].sits[run.sits[i]];
    if (!Number.isInteger(choice) || choice < 0 || choice >= opts.length) throw new Error('invalid choice at stage ' + i);
    const P = pack(run.lang);
    const deltas = Object.entries(opts[choice]).map(([dim, v]) => {
      const value = Math.round(v * STAGE_WEIGHT[i] * 10) / 10;
      run.scores[dim] = Math.round((run.scores[dim] + value) * 10) / 10;
      return { dim, label: P.dims[dim].label, value };
    });
    const text = outcomeText(run, i, choice);
    run.choices.push(choice);
    run.outcomes.push(text);
    return { text, deltas };
  }

  /**
   * Build the final result once all 5 choices are made.
   * Privacy: exact scores (which contain the birth bonuses) never leave this function. The shared result
   * keeps only the ranking (top, second, lowest) and 0–10 bars — exactly what the card shows.
   */
  function finish(run) {
    if (run.choices.length !== STAGE_META.length) throw new Error('run not complete');
    const P = pack(run.lang), D = P.dims;
    const r = rngFor(run.seed, 'final:' + run.choices.join('') + ':' + run.sits.join(''));
    const jitter = {};
    DIMS.forEach(d => { jitter[d] = r() * 0.01; }); // seeded tie-breaker (always consumed: keeps rng in step for keys)
    if (!run.shared) {
      const scores = run.scores;
      const ranked = DIMS.slice().sort((a, b) => (scores[b] + jitter[b]) - (scores[a] + jitter[a]));
      const max = Math.max(...DIMS.map(d => scores[d]), 1);
      run.shared = { d1: ranked[0], d2: ranked[1], low: ranked[ranked.length - 1], bars: DIMS.map(d => Math.max(0, Math.min(10, Math.round(scores[d] / max * 10)))) };
    }
    const { d1, d2, low, bars } = run.shared;
    const adj = D[d2].adjs[pickIdx(r, D[d2].adjs.length)];
    const noun = D[d1].nouns[pickIdx(r, D[d1].nouns.length)];
    const place = P.places[pickIdx(r, P.places.length)];
    const title = P.title(adj, noun, place);
    const hex = () => Math.floor(r() * 0x10000).toString(16).toUpperCase().padStart(4, '0');
    const id = hex() + '-' + hex();
    const verdict = D[d1].verdicts[pickIdx(r, D[d1].verdicts.length)];
    const { earth, anomaly, worldFact } = world(run);
    const events = STAGE_META.map((m, i) => {
      const st = stage(run, i);
      return { stage: st.label, year: run.year + m.offsetYears, prompt: st.prompt, choice: st.options[run.choices[i]], text: run.outcomes[i] };
    });
    const rare = RARITY[d1 + '|' + d2];
    const res = {
      id, version: VERSION, lang: run.lang, title,
      lifePath: run.lifePath, startClass: P.lifePaths[run.lifePath],
      earth, anomaly, worldFact, events,
      primary: d1, secondary: d2, rejected: low,
      labels: Object.fromEntries(DIMS.map(d => [d, D[d].label])),
      scores: DIMS.map((d, i) => ({ dim: d, label: D[d].label, value: bars[i], norm: bars[i] / 10 })),
      verdict, buff: D[d1].buff, debuff: D[low].debuff, boss: D[low].boss,
      future: P.future(earth, worldFact, title, D[d1].future, D[d2].future),
      project: D[d1].project, experiment: D[d1].experiment,
      kept: P.kept(D[d1].kept, D[d2].kept), rejectedText: D[low].rejected,
      questions: [D[d1].question, P.branchQuestion, P.alreadyTrue],
      protocol: VISUAL_PROTOCOLS[run.seed % VISUAL_PROTOCOLS.length],
      artSeed: hash(run.seed + ':art:' + run.choices.join('')) % 4294967296,
      finalLine: events[4].choice, finalYear: events[4].year,
      highlight: events[3].text,
      rarity: rare ? Math.max(2, Math.round(1 / rare)) : null,
    };
    res.key = encodeKey(run);
    return res;
  }

  // ---------- player key: restores a finished result without the birth date ----------
  // Bits: version 3 | seed 53 | lifePath 4 | year-2000 7 | sits 5×2 | choices 5×3 | d1,d2,low 3×3 | bars 6×4 | check 12 = 137
  // → 30 base32 chars (13 leading zero bits). Holds only what the card already shows — no exact scores, no birth bonuses.
  const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford base32
  const KEY_VERSION = 2;
  function keyFields(run) {
    return [[KEY_VERSION, 3], [run.seed, 53], [run.lifePath, 4], [run.year - 2000, 7]]
      .concat(run.sits.map(v => [v, 2]), run.choices.map(v => [v, 3]),
        [run.shared.d1, run.shared.d2, run.shared.low].map(d => [DIMS.indexOf(d), 3]), run.shared.bars.map(v => [v, 4]));
  }
  const checksum = fields => hash('bwkey:' + fields.map(f => f[0]).join(',')) % 4096;
  function encodeKey(run) {
    const fields = keyFields(run);
    let n = 0n;
    fields.concat([[checksum(fields), 12]]).forEach(([v, bits]) => { n = (n << BigInt(bits)) | BigInt(Math.max(0, Math.min(v, 2 ** bits - 1))); });
    let s = '';
    for (let i = 0; i < 30; i++) { s = B32[Number(n & 31n)] + s; n >>= 5n; }
    return s.match(/.{5}/g).join('-');
  }
  /** Rebuild a finished result from a key (no birth date needed). Returns null for an invalid key. */
  function fromKey(key, lang) {
    const clean = String(key || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
    if (clean.length !== 30) return null;
    let n = 0n;
    for (const ch of clean) { const v = B32.indexOf(ch); if (v < 0) return null; n = (n << 5n) | BigInt(v); }
    const take = bits => { const v = Number(n & ((1n << BigInt(bits)) - 1n)); n >>= BigInt(bits); return v; };
    const check = take(12);
    const bars = DIMS.map(() => take(4)).reverse();
    const [d1i, d2i, lowi] = [0, 0, 0].map(() => take(3)).reverse();
    const choices = [0, 0, 0, 0, 0].map(() => take(3)).reverse();
    const sits = [0, 0, 0, 0, 0].map(() => take(2)).reverse();
    const year = take(7) + 2000, lifePath = take(4), seed = take(53), version = take(3);
    if (version !== KEY_VERSION || lifePath < 1 || lifePath > 9 || n !== 0n) return null;
    if ([d1i, d2i, lowi].some(i => i >= DIMS.length) || d1i === d2i || d1i === lowi || d2i === lowi || bars.some(b => b > 10)) return null;
    const run = makeRun(seed, lifePath, {}, lang, year);
    if (sits.some((s, i) => s !== run.sits[i])) return null; // integrity: situations follow from seed + life path
    for (let i = 0; i < 5; i++) {
      if (choices[i] >= STAGE_META[i].sits[sits[i]].length) return null;
      run.choices.push(choices[i]); run.outcomes.push(outcomeText(run, i, choices[i]));
    }
    run.shared = { d1: DIMS[d1i], d2: DIMS[d2i], low: DIMS[lowi], bars };
    if (checksum(keyFields(run)) !== check) return null; // forged or mistyped key
    return finish(run);
  }

  /** Convenience for tests and tools: full run in one call. */
  function simulate(birthDateStr, choices, opts) {
    opts = opts || {};
    const run = newRun(birthDateStr, opts.salt, opts.lang, opts.now);
    if (!Array.isArray(choices) || choices.length !== STAGE_META.length) throw new Error('need one choice per stage');
    choices.forEach((c, i) => choose(run, i, c));
    return finish(run);
  }

  // ---------- outputs ----------
  function aiPrompts(res) {
    const Pr = pack(res.lang).prompts;
    return { plan: Pr.plan(res), future: Pr.future(res), debuff: Pr.debuff(res) };
  }

  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  function realitySeedMarkdown(res) {
    const S = pack(res.lang).seed, H = S.h;
    const L = [];
    const sec = (h, lines) => { L.push('## ' + h); [].concat(lines).forEach(l => L.push(l)); L.push(''); };
    L.push('# BORN WEIRD // REALITY SEED'); L.push('');
    L.push(S.disclaimer); L.push('');
    sec(H.timeline, res.title + ' — Reality #' + res.id + ' (' + res.earth + ')');
    sec(H.birth, S.birth(res));
    sec(H.world, S.world(res.earth, res.worldFact));
    sec(H.build, S.build(res).map(l => '- ' + l));
    sec(H.future, res.future);
    sec(H.choices, res.events.map(e => '- **' + e.stage + '** — ' + e.prompt + ' → *' + e.choice + '*'));
    sec(H.kept, cap(res.kept) + '.');
    sec(H.rejected, cap(res.rejectedText) + '.');
    sec(H.events, res.events.map(e => '- **' + e.stage + ' (' + e.year + ')**: ' + e.text));
    sec(H.project, res.project);
    sec(H.experiment, res.experiment);
    sec(H.visual, S.visual(res.protocol));
    sec(H.questions, res.questions.map(q => '- ' + q));
    sec(H.ai, S.ai);
    L.push('---');
    L.push(S.footer(res.version));
    return L.join('\n');
  }

  const api = {
    VERSION, DIMS, LANGS, STAGE_META, STAGE_WEIGHT, BONUS, CONTENT, RARITY,
    hash, rng, plural, parseBirthDate, decodeBirth, lifePathOf, zodiacOf, easternOf,
    newRun, world, stage, choose, finish, encodeKey, fromKey, simulate, aiPrompts, realitySeedMarkdown,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BW = api;
})(typeof window !== 'undefined' ? window : globalThis);
