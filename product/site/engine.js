/* BORN WEIRD — engine v0.5 "Value Compass"
 * The stars make a guess about your values. Your choices test it. Not a test, not a diagnosis, not a prediction.
 *
 * Model (see reports/CONCEPT_v0.5.md):
 *  - 8 values on Schwartz's circle (10 basic values; Stimulation+Hedonism and Tradition+Conformity merged).
 *    Circle order: FREEDOM, NOVELTY, SUCCESS, INFLUENCE, SECURITY, ROOTS, PEOPLE, WORLD — opposite = index + 4.
 *  - 9 screens in 3 rounds:
 *      I  INSTINCT (3): four options, "open" (+1) and "definitely not" (−1)       — best–worst
 *      II PRICE    (3): four prices, "never" (+1, protected) and "easily" (−1)   — best–worst
 *      III SHADOW  (3): a leader (or a value the stars expected) with a real cost: take it (+1) / unsure (0) / no (−1)
 *    In rounds I–II every value appears exactly 3 times (balanced block design, rotated per run).
 *  - The birth date gives private facts (weeks lived, life grid, next fresh-start date) and a "stars" hypothesis:
 *    life path number + element of the sun sign → 2 expected values. Scores come from choices only.
 * Only the life path and the element reach shareable outputs.
 * Language packs (en, ru) share one structure. Works in the browser (window.BW) and in Node (module.exports).
 */
(function (root) {
  'use strict';

  const VERSION = '0.5';
  const VALUES = ['FREEDOM', 'NOVELTY', 'SUCCESS', 'INFLUENCE', 'SECURITY', 'ROOTS', 'PEOPLE', 'WORLD']; // circle order
  const N = VALUES.length;
  const opp = i => (i + 4) % N;
  const LANGS = ['en', 'ru'];
  const ROUNDS = ['instinct', 'instinct', 'instinct', 'price', 'price', 'price', 'shadow', 'shadow', 'shadow'];
  const CHOICE_SCREENS = 6, TOTAL = 9, POOL_SIZE = 8;
  // Balanced design: 6 blocks of 4 over 8 values, each value exactly 3 times; 4 blocks hold two opposite pairs.
  const DESIGN = [[0, 2, 4, 6], [1, 3, 5, 7], [0, 3, 4, 7], [1, 2, 5, 6], [0, 1, 6, 7], [2, 3, 4, 5]];
  // Stars: life path → value, element (fire, earth, air, water) → value (alt when it repeats the life path's).
  const LP_VALUE = [null, 2, 6, 1, 4, 0, 5, 0, 3, 7];
  const ELEM_VALUE = [1, 4, 0, 6], ELEM_ALT = [2, 5, 1, 7];

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
    let a = seed >>> 0; // mulberry32
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
  function shuffled(arr, r) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = pickIdx(r, i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function plural(n, forms) {
    const n10 = n % 10, n100 = n % 100;
    if (forms.length < 3) return n === 1 ? forms[0] : forms[1];
    if (n10 === 1 && n100 !== 11) return forms[0];
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1];
    return forms[2];
  }

  // Situations: [title, prompt, FREEDOM, NOVELTY, SUCCESS, INFLUENCE, SECURITY, ROOTS, PEOPLE, WORLD] — any 4 options may be shown together.
  const CONTENT = {
    en: {
      values: {
        FREEDOM: { label: 'FREEDOM', meaning: 'deciding for yourself, living your own way' },
        NOVELTY: { label: 'NOVELTY', meaning: 'new experiences, thrill, risk' },
        SUCCESS: { label: 'SUCCESS', meaning: 'being the best at what you do, seeing results' },
        INFLUENCE: { label: 'INFLUENCE', meaning: 'status, money, a voice that decides' },
        SECURITY: { label: 'SECURITY', meaning: 'safety, predictability, a reserve' },
        ROOTS: { label: 'ROOTS', meaning: 'traditions, rules, "how it is done here"' },
        PEOPLE: { label: 'MY PEOPLE', meaning: 'your own: family and friends' },
        WORLD: { label: 'THE WORLD', meaning: 'fairness, nature, good for strangers' },
      },
      rounds: {
        instinct: { name: 'INSTINCT', intro: 'Don\'t think. Go with what pulls you first.', plus: 'Tap what you OPEN', minus: 'Now — what is DEFINITELY NOT for you?', mkPlus: '✓ I OPEN', mkMinus: '✗ DEFINITELY NOT' },
        price: { name: 'PRICE', intro: 'The dream is yours. But it has a price.', plus: 'Now — which price would you NEVER pay?', minus: 'Which price would you pay EASILY?', mkPlus: '✓ NEVER', mkMinus: '✗ EASILY' },
        shadow: { name: 'SHADOW', intro: 'Testing your leaders: do you still want them when they cost something?', q: 'TAKE IT?', answers: ['TAKE IT', 'NOT SURE', 'NO'], starsCheck: v => 'The stars insist: one more check — ' + v + '.' },
      },
      instinct: [
        ['DOORS', 'Doors in front of you. You may open only one.', 'Behind it — a life where nobody tells you how to live', 'Behind it — something you have never felt before', 'Behind it — a chance to become number one at your craft', 'Behind it — the chair from which decisions for many are made', 'Behind it — a life with no debts, fears or surprises', 'Behind it — a home where everything is as in childhood: same holidays, same rules', 'Behind it — your people, and they are all fine', 'Behind it — a world a little fairer for everyone'],
        ['THE BUTTON', 'A red button. Press it and this is yours forever.', 'The right to drop everything any day and start over', 'One adventure every year that cannot be planned', 'Mastery: whatever you do comes out excellent', 'A word that people listen to', 'A cushion big enough for any rainy day', 'A family tradition your grandchildren will carry on', 'Close people who are always there when needed', 'Saving one stranger\'s life every year'],
        ['THE ISLAND', 'A year on a desert island. You may take one thing.', 'A boat — to leave whenever I want', 'A map of the unexplored part of the island', 'Tools to build something to be proud of', 'The right to decide who else lands on the island', 'Food and medicine for two years', 'The family album and grandma\'s recipes', 'One person close to me', 'Seeds — so the island becomes a garden for whoever comes next'],
        ['THE SPELL', 'You are given one spell. It always works.', 'Nobody can force you to do anything', 'Every morning — a new city outside the window', 'Whatever you take on, you bring to perfection', 'People agree with you the first time', 'Nothing bad will happen to you or your home', 'You always remember where you come from — and they wait for you there', 'Your close ones never get sick', 'Any lie near you becomes visible'],
        ['NIGHT TRAIN', 'A night train. Each carriage is a different life. You board…', 'The carriage with no timetable: get off wherever you like', 'The carriage going where you have never been', 'The workshop carriage: by morning, the best work of your life', 'The carriage of those who decide where the train goes', 'The safest carriage: warm, stocked, with a conductor', 'The carriage where they sing old songs over tea in glass holders', 'The carriage with your people', 'The carriage you opened to those who had no ticket'],
        ['A FALLING STAR', 'A star falls. You have time for one wish.', 'To live by my own rules', 'To never be bored', 'To achieve my dream with my own hands', 'For my word to change the course of things', 'For tomorrow to be as calm as today', 'For all the good things in my family never to be lost', 'For my people to be happy', 'For there to be less injustice on Earth'],
        ['FREE EVENING', 'A free evening, everything already paid for. Where to?', 'Wherever my feet take me, no plan', 'Something I have never tried: a jump, improv, a strange concert', 'Finishing my project while nobody distracts me', 'A closed meeting with the people who decide', 'Home: sort things out and get some sleep', 'Dinner at my parents\', as it has always been', 'To a friend who is having a hard time', 'Volunteering where hands are short'],
        ['A SPARE DAY', 'You get a spare day that nobody knows about.', 'Leave town in a random direction', 'Learn something completely wild in a single day', 'Do a piece of work to be proud of', 'Hold negotiations that change everything', 'Put my money and documents in order', 'Visit the place my family comes from', 'Spend it with the person closest to me', 'Help strangers who are in trouble'],
      ],
      price: [
        ['DREAM JOB', 'You are offered your dream job. But you must pay with one of these:', 'Getting every step approved by the boss', 'Five years of the same thing, no surprises', 'Staying forever average at it', 'Nobody will know it is your work', 'No stability: a three-month contract', 'Working on the holidays when the family gathers', 'Moving far away from your close ones', 'Knowing the company harms nature'],
        ['DREAM HOUSE', 'The house of your dreams is yours. The price:', 'Living by strict association rules: fence colour, guests, noise', 'No more travel', 'Giving up the craft you have almost mastered', 'Losing all your status and connections', 'It stands where a flood comes once every ten years', 'It is in a country where nobody knows your traditions', 'Your close ones are 12 hours away', 'A forest was cut down for it'],
        ['TEN MORE YEARS', 'You can live ten extra healthy years. The price:', 'All those years someone else sets your schedule', 'Every day is like the one before', 'You will achieve nothing more — only live', 'Your voice will no longer count anywhere', 'Every year you start from zero: no money, no home', 'You forget where you come from and how things were done', 'Everyone dear to you will be far away — you rebuild it all from scratch', 'In those years you cannot help anyone'],
        ['THE MONEY', 'Enough money for the rest of your life lands in your account. One condition:', 'You may spend it only by someone else\'s plan', 'You may never change city or job', 'You may never do your craft again', 'You lose all influence: your opinion decides nothing', 'It arrives in 10 years; until then, no safety net', 'You may not celebrate anything your family celebrated', 'You may not share it with your close ones', 'It was earned dishonestly, and you know it'],
        ['THE BIG PROJECT', 'Your big project will definitely succeed. The price:', 'Doing it strictly by someone else\'s spec', 'It will take ten years of routine', 'It turns out fine, but not brilliant', 'Someone else gets the fame', 'You must put all your savings into it', 'Breaking with how things are done in your family and circle', 'Barely seeing your close ones for a year', 'It will hurt someone, if only a little'],
        ['THE MOVE', 'You are invited to a city where you will be happier. But:', 'There, everything is decided for you: where to live, what to wear, what to say', 'Nothing ever happens there', 'Nobody there needs your profession', 'There you are nobody: status starts from zero', 'No guarantees: no contract, no home', 'Another language, another cuisine, other holidays', 'Your close ones will not come', 'They turn a blind eye to injustice there'],
        ['THE TALENT', 'You get a huge talent for what you love. In exchange, give up one thing:', 'Free time: talent demands a strict regime', 'Curiosity: everything else becomes dull', 'Victories: you will be happy, not number one', 'Authority: people will not listen to you', 'A steady income: money will be feast or famine', 'The bond with the place you come from', 'Time with your close ones', 'The chance to help strangers'],
        ['SECOND LIFE', 'You can live a second life in parallel. But it will lack one thing:', 'The right to choose', 'Surprises', 'Victories', 'Influence', 'Confidence in tomorrow', 'Roots and traditions', 'Your close ones', 'Meaning beyond your own life'],
      ],
      shadows: {
        FREEDOM: ['Absolute freedom: nobody will ever again tell you what to do. But nobody will tell you whether you are doing right, either.', 'No obligations — not yours, not to you. But nobody will count on you either.'],
        NOVELTY: ['Every year a new country, a new job, new people. But nothing stays for long.', 'A life that is never boring. And never calm.'],
        SUCCESS: ['You become number one at your craft. But nobody but you will ever know.', 'Every goal you have will be reached. But each one will cost sleepless nights.'],
        INFLUENCE: ['Your word decides the fate of many. But every mistake is yours to answer for — in public.', 'You are at the very top. Everyone listens to you there — and almost nobody tells you the truth.'],
        SECURITY: ['A life without a single risk. And without big highs.', 'Full confidence in tomorrow. But tomorrow will be almost the same as today.'],
        ROOTS: ['Everything that mattered in your family will be kept. But it may never be changed.', 'You become part of a great tradition. But it, not you, decides how to live.'],
        PEOPLE: ['Your close ones will be happy. But beyond your circle you will change nothing.', 'You are always there for your people. But for this you must give up a big chance.'],
        WORLD: ['The world gets a little fairer thanks to you. But nobody says thank you, and the time comes out of your close ones\' share.', 'You help thousands of strangers. But you will never know their names or see the result.'],
      },
      reactions: {
        FREEDOM: ['Somewhere a door opens that was not there yesterday.', 'The script written for you loses a page.', 'SYSTEM LOG: route not approved. Proceeding anyway.', 'For a second, the compass points at you.'],
        NOVELTY: ['The world map quietly draws one more edge.', 'Somewhere an unfamiliar sign lights up.', 'SYSTEM LOG: boredom declined.', 'The wind changes direction. Coincidence?'],
        SUCCESS: ['An empty frame appears on some wall of fame. For now.', 'The ladder grows one rung taller.', 'SYSTEM LOG: bar raised.', 'A light comes on in the workshop. Late, but someone is still working.'],
        INFLUENCE: ['Somewhere on the board, a piece moves.', 'Across town, someone says your name.', 'SYSTEM LOG: stakes raised.', 'Lever found. Hand already on it.'],
        SECURITY: ['Somewhere a lock clicks. Everything is in place.', 'Backup created. By whom — unknown.', 'SYSTEM LOG: risk declined.', 'The foundation gets a centimetre thicker.'],
        ROOTS: ['A page turns in an old album.', 'Somewhere a kettle goes on — at seven, as always.', 'SYSTEM LOG: tradition preserved.', 'In an archive, one more folder is neatly labelled.'],
        PEOPLE: ['Someone of yours feels a little lighter. They don\'t know why.', 'One more heart in the group chat.', 'SYSTEM LOG: nobody left behind.', 'Someone\'s heavy bag suddenly feels lighter.'],
        WORLD: ['Somewhere a stranger finds what they lost.', 'A light comes on in someone else\'s window.', 'SYSTEM LOG: injustice −1.', 'Somewhere in a forest there is one more tree.'],
      },
      shadowReact: ['The value passed the shadow test.', 'The shadow logged a doubt. That is an answer too.', 'The shadow noted: at this price — no.'],
      nouns: {
        FREEDOM: { name: 'WANDERER', plus: 'you go where no instructions lead', shadow: 'you can go so far that nobody is left to come back to' },
        NOVELTY: { name: 'SEEKER', plus: 'you turn an ordinary day into a story', shadow: 'boredom scares you more than real risks' },
        SUCCESS: { name: 'MASTER', plus: 'you bring things to a level worth being proud of', shadow: 'the bar rises faster than the joy of results' },
        INFLUENCE: { name: 'STRATEGIST', plus: 'you see the whole board and move the pieces', shadow: 'people may start to look like pieces' },
        SECURITY: { name: 'KEEPER', plus: 'people feel safe with you: there is always a plan B', shadow: 'safety can become a cage' },
        ROOTS: { name: 'CHRONICLER', plus: 'you keep what matters while everyone chases the new', shadow: '"how it is done" can replace "what is right"' },
        PEOPLE: { name: 'GUARDIAN', plus: 'your people know you will come', shadow: 'there may be no time or strength left for yourself' },
        WORLD: { name: 'GARDENER', plus: 'you make things better not only for your own', shadow: 'you can worry about everyone so much that nothing is left for you and yours' },
      },
      adjectives: { FREEDOM: 'FREE', NOVELTY: 'RESTLESS', SUCCESS: 'TIRELESS', INFLUENCE: 'POWERFUL', SECURITY: 'STEADFAST', ROOTS: 'LOYAL', PEOPLE: 'WARM', WORLD: 'FAIR' },
      titleOf: (adj, noun, place) => ('THE ' + adj + ' ' + noun + ' ' + place).trim(),
      places: ['OF UNFINISHED ROOMS', 'OF THE THURSDAY STREET', 'OF LOST AFTERNOONS', 'OF THE SECOND MOON', 'OF BORROWED WEATHER', 'OF SMALL APOCALYPSES', 'OF QUIET MACHINES', 'OF OPEN DOORS', 'OF THE LAST BUS', 'OF IMPOSSIBLE MAPS'],
      purposeVerb: { FREEDOM: 'to carve your own path', NOVELTY: 'to discover the unknown', SUCCESS: 'to do your craft at the highest level', INFLUENCE: 'to move big decisions', SECURITY: 'to build things that last', ROOTS: 'to keep what matters and pass it on', PEOPLE: 'to be a rock for your people', WORLD: 'to make the world fairer' },
      purposeTail: { FREEDOM: 'nobody writes the script for you', NOVELTY: 'life never turns into Groundhog Day', SUCCESS: 'the result is visible', INFLUENCE: 'it changes the rules of the game', SECURITY: 'others can lean on it', ROOTS: 'it outlives you', PEOPLE: 'your people feel warmer', WORLD: 'strangers win too' },
      purpose: (verb, tail) => 'It looks like what matters to you is ' + verb + ' — in a way that ' + tail + '.',
      cost: {
        FREEDOM: 'a life by someone else\'s script: all correct, none of it yours', NOVELTY: 'years that blur into one', SUCCESS: 'a craft that never became mastery', INFLUENCE: 'others make the decisions about your life',
        SECURITY: 'one bad month can bring everything down', ROOTS: 'the feeling of being from nowhere', PEOPLE: 'one day you look around — and nobody is there', WORLD: 'a life that changed nothing for anyone but you',
      },
      questGive: {
        FREEDOM: 'Every day make one decision yourself — no advice, no approvals. Even a small one. Write down what it was.',
        NOVELTY: 'One "first time" every day: a new route, dish, person, genre. Seven first times in a week.',
        SUCCESS: 'Pick one skill and train it 20 minutes a day for 7 days in a row. At the end, compare with day one.',
        INFLUENCE: 'Once a day, say what you think where you usually keep quiet. No softening.',
        SECURITY: 'Build a cushion in 7 days: one step a day — money, documents, health, backups.',
        ROOTS: 'Every day learn one thing about your family or where you come from. Call an older relative and ask how it used to be.',
        PEOPLE: 'Every day do one thing for one close person — for no reason and without being asked.',
        WORLD: 'One small thing for strangers every day: a donation, a review, a hand, litter into the bin. Seven in a week.',
      },
      axes: [
        { short: 'Freedom vs security', text: 'You are pulled both to live your own way and to have firm ground under your feet. That is why "risk it or stay" decisions are hard for you. It is not indecision: two real values pull in different directions.', quest: 'Find one decision you keep postponing because of the risk. Make a small version of it with a safety net: try it for a week, not forever.' },
        { short: 'Novelty vs roots', text: 'You need new experiences and change — and at the same time you need something that stays: traditions, your rituals, "how we do it". Hardest of all is when the new demands giving up the old.', quest: 'Take one of your traditions and do it a new way: another place, another format, a new person. Notice what in it is essential and what can change.' },
        { short: 'Success vs my people', text: 'It matters to you to achieve your goals — and to be there for your people. There is only one stock of time, and almost every week settles this argument anew. Hence the guilt in both directions.', quest: 'For a week, set one untouchable slot for your work and one for your close ones. Do not give one up for the other. At the end, honestly look at what happened.' },
        { short: 'Influence vs fairness', text: 'You want weight and a say — and you want things to be fair for everyone. It is hard when the road to influence asks you to look away from fairness.', quest: 'Find one situation where you have even a little influence and use it for someone who has none. Once this week — for real.' },
      ],
      near: {
        short: (a, b) => a + ' and ' + b,
        text: (a, b, ma, mb) => 'Two of your strong values — ' + a + ' (' + ma + ') and ' + b + ' (' + mb + ') — sit on almost opposite sides of the circle. In life they often want different things, and choosing between them is harder than it looks from outside.',
        quest: (a, b) => 'This week, find one situation where ' + a + ' and ' + b + ' want different things. Do not choose at once: write down what each gives you, and only then decide.',
      },
      open: { short: 'No single direction yet', text: 'Your choices spread around the circle: no value won clearly. That is not bad — it happens when many things matter a little, or on a day like this. The next run will sharpen the picture.', quest: 'For 7 evenings, write down one decision of the day and which value it protected. At the end, see which one shows up most often.' },
      clear: {
        short: a => a + ' drives you',
        text: (a, c, cost) => 'Almost all your choices point one way: ' + a + '. The strength is clarity. The price is ' + c + ': ' + cost + '.',
      },
      evidence: {
        instinct: [(t, o) => '"' + t + '": you open — "' + o + '"', (t, o) => '"' + t + '": definitely not — "' + o + '"'],
        price: [(t, o) => '"' + t + '": you would never pay — "' + o + '"', (t, o) => '"' + t + '": you would easily pay — "' + o + '"'],
        shadow: [(t, o) => '"' + t + '": "' + o + '" — TAKE IT', (t, o) => '"' + t + '": "' + o + '" — NO'],
      },
      shadowTitle: 'SHADOW',
      stars: {
        persona: { FREEDOM: 'a rebel', NOVELTY: 'an adventurer', SUCCESS: 'a champion', INFLUENCE: 'a leader', SECURITY: 'a fortress', ROOTS: 'a keeper of traditions', PEOPLE: 'a rock for your people', WORLD: 'an idealist' },
        match: (p, a, b) => 'The stars expected ' + p + ' — and got it right: ' + a + ' and ' + b + ' are both in your top three. Rare.',
        half: (p, hit, miss, pos) => 'The stars were half right: ' + hit + ' — yes, but ' + miss + ' is only #' + pos + ' for you.',
        miss: (p, top) => 'The stars expected ' + p + '. Your compass is led by ' + top + '.',
        word: { match: 'MATCH', half: 'HALF RIGHT', miss: 'AWKWARD' },
      },
      hidden: v => 'Hidden value: ' + v + '. It does not win everyday choices, but asked directly, the answer is "take it".',
      fragile: v => v + ' leads while it is free: once it had a price, the answer was "no". Check whether it is your value or a habit.',
      conf: {
        pair: (a, b) => a + ' matters more to you than ' + b + ' — several choices show it.',
        unclear: (a, b) => 'Not clear yet: ' + a + ' or ' + b + '. Take it again in a week — it will show.',
        steady: 'Your answers are consistent — the picture is sharp.',
      },
      lpWhy: [null, '1 is the number of firsts', '2 is the number of union', '3 is the number of play and expression', '4 is the number of foundations', '5 is the number of change', '6 is the number of home and family', '7 is the number of loners and seekers', '8 is the number of power and money', '9 is the number of all people'],
      elements: ['fire', 'earth', 'air', 'water'],
      elemWhy: ['fire — thrill', 'earth — firm ground', 'air — open space', 'water — feelings'],
      stages: [
        { max: 12, name: 'industry vs inferiority', q: 'What are you best at?' },
        { max: 18, name: 'identity vs role confusion', q: 'Who are you when nobody is watching?' },
        { max: 39, name: 'intimacy vs isolation', q: 'With whom — and for what?' },
        { max: 64, name: 'generativity vs stagnation', q: 'What will you leave to those who come after you?' },
        { max: 200, name: 'integrity vs despair', q: 'Which story of your life rings true?' },
      ],
      techMilestones: [[1957, 'the first satellite'], [1961, 'the first human in space'], [1969, 'the Moon landing'], [1971, 'the first email'], [1983, 'the first mobile phone on sale'], [1991, 'the World Wide Web'], [1998, 'Google'], [2001, 'Wikipedia'], [2005, 'YouTube'], [2007, 'the iPhone'], [2022, 'ChatGPT']],
      worldAtBirth: (pop, tech, yrs) => 'When you arrive, there are about ' + pop + ' billion people on Earth' + (tech ? ', and ' + tech + ' is still ' + yrs + ' year' + (yrs === 1 ? '' : 's') + ' away.' : '.'),
      zodiac: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
      sep: ' · ', orderSep: ' > ',
      prompts: {
        compass: r => 'I played BORN WEIRD, a values calibration game (a game, not a test). My compass: ' + r.orderText + '. Never give up: ' + r.protectLabel + '; give up easily: ' + r.easyLabel + '. Main contradiction: ' + r.contradiction.short + '.' +
          ' Ask me 3 short questions one at a time about my real decisions, then tell me where this contradiction most likely shows up and suggest one experiment for this week.',
        purpose: r => 'In the game BORN WEIRD my value compass came out as: ' + r.orderText + '. Purpose hypothesis: "' + r.purpose + '" It is a game, not truth.' +
          ' Help me refine it: ask 3 questions one at a time, then offer 3 wordings of my purpose, each with one intention for the coming month.',
        plan: r => 'I played BORN WEIRD, a values game (not a test). My top values: ' + r.drivesText + '. My 7-day quest: ' + r.contradiction.quest +
          ' Turn it into a 7-day plan: one concrete 15–30 minute action per day with a clear "done" criterion. First ask me one question about my real situation.',
      },
      seed: {
        title: 'BORN WEIRD // VALUE PASSPORT',
        disclaimer: '> A first calibration from 9 choices on one day — not a psychometric test, not a diagnosis, not a prediction. Values follow Schwartz\'s theory of basic human values (8 of them, our wording, not validated). The stars (life path number, element) are a playful hypothesis, not evidence: scores come from choices only.',
        h: { compass: 'VALUE COMPASS', stars: 'STARS VS CHOICES', contra: 'MAIN CONTRADICTION', conf: 'CONFIDENCE', purpose: 'PURPOSE HYPOTHESIS', quest: '7-DAY QUEST', archetype: 'ARCHETYPE', choices: 'CHOICES', data: 'MACHINE-READABLE PROFILE', ai: 'INSTRUCTIONS FOR AN AI' },
        drives: 'Drives you', protect: 'Never give up', easy: 'Give up easily',
        starsLine: r => 'Life path ' + r.lifePath + ', element: ' + r.stars.elementName + ' → expected ' + r.stars.labels.join(' + ') + '.',
        ai: ['Treat this as a first hypothesis about my values, not truth about me.', 'Help me test it against my real decisions, refine the purpose hypothesis, and turn it into one or two intentions.', 'Begin by asking: **"Where did you recognise yourself — and where not at all?"**'],
        footer: v => 'BORN WEIRD v' + v + ' (dimacloud.github.io/born-weird). A simulator for lives you have not lived yet.',
      },
    },

    ru: {
      values: {
        FREEDOM: { label: 'СВОБОДА', meaning: 'решать за себя, жить по-своему' },
        NOVELTY: { label: 'НОВИЗНА', meaning: 'впечатления, драйв, риск' },
        SUCCESS: { label: 'УСПЕХ', meaning: 'быть номером один в своём деле, видеть результат' },
        INFLUENCE: { label: 'ВЛИЯНИЕ', meaning: 'статус, деньги, слово, которое решает' },
        SECURITY: { label: 'НАДЁЖНОСТЬ', meaning: 'безопасность, предсказуемость, запас' },
        ROOTS: { label: 'КОРНИ', meaning: 'традиции, правила, «как у нас принято»' },
        PEOPLE: { label: 'БЛИЗКИЕ', meaning: 'свои люди: семья, друзья' },
        WORLD: { label: 'МИР', meaning: 'справедливость, природа, польза незнакомым' },
      },
      rounds: {
        instinct: { name: 'ИНСТИНКТ', intro: 'Не думай. Выбирай то, что тянет первым.', plus: 'Что из этого — ТВОЁ?', minus: 'А что — ТОЧНО НЕ ТВОЁ?', mkPlus: '✓ МОЁ', mkMinus: '✗ ТОЧНО НЕТ' },
        price: { name: 'ЦЕНА', intro: 'Мечта — твоя. Но за неё придётся заплатить.', plus: 'А какую цену — НИ ЗА ЧТО?', minus: 'Какую цену заплатишь ЛЕГКО?', mkPlus: '✓ НИ ЗА ЧТО', mkMinus: '✗ ЗАПЛАЧУ ЛЕГКО' },
        shadow: { name: 'ТЕНЬ', intro: 'Проверяем твои главные ценности: нужны ли они тебе, если за них надо платить?', q: 'БЕРЁШЬ?', answers: ['БЕРУ', 'СОМНЕВАЮСЬ', 'НЕТ'], starsCheck: v => 'Звёзды настаивают: проверим ещё раз — ' + v + '.' },
      },
      instinct: [
        ['ДВЕРИ', 'Перед тобой двери. Открыть можно только одну.', 'За ней жизнь, где никто не говорит тебе, как надо', 'За ней то, чего ещё не доводилось испытать', 'За ней шанс стать номером один в своём деле', 'За ней кресло, из которого решают за многих', 'За ней жизнь без долгов, страхов и сюрпризов', 'За ней дом, где всё как в детстве: те же праздники, те же правила', 'За ней твои люди, и с ними всё хорошо', 'За ней мир, где стало чуть справедливее для всех'],
        ['КНОПКА', 'Красная кнопка. Нажмёшь — и это будет у тебя навсегда.', 'Право в любой день всё бросить и начать заново', 'Каждый год — одно приключение, которое невозможно спланировать', 'Мастерство: за что ни возьмёшься, получается на отлично', 'Слово, к которому прислушиваются', 'Подушка, которой хватит на любой чёрный день', 'Семейная традиция, которую продолжат твои внуки', 'Близкие, которые всегда рядом, когда нужны', 'Возможность каждый год спасать одну чужую жизнь'],
        ['ОСТРОВ', 'Год на необитаемом острове. Можно взять одно.', 'Лодку — уплыть, когда захочу', 'Карту неизведанной части острова', 'Инструменты, чтобы построить то, чем можно гордиться', 'Право решать, кто ещё приплывёт на остров', 'Запас еды и лекарств на два года', 'Семейный альбом и бабушкины рецепты', 'Одного близкого человека', 'Семена — чтобы остров стал садом для тех, кто придёт после'],
        ['ЗАКЛИНАНИЕ', 'Тебе дали одно заклинание. Оно работает всегда.', 'Никто не может тебя заставить', 'Каждое утро за окном новый город', 'Всё, за что берёшься, доводишь до блеска', 'С тобой соглашаются с первого раза', 'С тобой и твоим домом ничего плохого не случится', 'Ты всегда помнишь, откуда ты, — и тебя там ждут', 'Твои близкие никогда не болеют', 'Любая ложь рядом с тобой становится видна'],
        ['НОЧНОЙ ПОЕЗД', 'Ночной поезд. В каждом вагоне своя жизнь. Ты садишься в…', 'Вагон без расписания: выходишь где хочешь', 'Вагон, который идёт туда, где ещё не доводилось бывать', 'Вагон-мастерскую: к утру — лучшая работа в твоей жизни', 'Вагон тех, кто решает, куда пойдёт поезд', 'Самый надёжный вагон: тепло, запас, проводник', 'Вагон, где пьют чай из подстаканников и поют старые песни', 'Вагон, где едут твои', 'Вагон, куда ты пускаешь тех, кому не хватило билета'],
        ['ПАДАЕТ ЗВЕЗДА', 'Падает звезда. Успеешь загадать одно.', 'Жить по своим правилам', 'Чтобы скучно не было никогда', 'Добиться мечты своими руками', 'Чтобы моё слово меняло ход вещей', 'Чтобы завтра было таким же спокойным, как сегодня', 'Чтобы всё хорошее, что было в нашей семье, не потерялось', 'Чтобы мои были счастливы', 'Чтобы на земле стало меньше несправедливости'],
        ['СВОБОДНЫЙ ВЕЧЕР', 'Свободный вечер, всё уже оплачено. Куда?', 'Куда глаза глядят, без плана', 'На что-то совсем новое: прыжок, импровизация, странный концерт', 'В тишину — дожать свой проект, пока никто не отвлекает', 'На закрытую встречу с теми, кто решает', 'Домой: разобрать дела и выспаться', 'К родителям на ужин, как заведено', 'К другу, которому сейчас тяжело', 'Волонтёром туда, где не хватает рук'],
        ['ЛИШНИЙ ДЕНЬ', 'У тебя появился лишний день, о котором никто не знает.', 'Уехать в случайном направлении', 'За один день научиться чему-то совсем дикому', 'Сделать дело, которым можно гордиться', 'Провести переговоры, которые всё изменят', 'Навести порядок в деньгах и документах', 'Съездить туда, откуда родом твоя семья', 'Провести его с самым близким человеком', 'Помочь незнакомым людям, у которых беда'],
      ],
      price: [
        ['РАБОТА МЕЧТЫ', 'Тебе предлагают работу мечты. Но за неё придётся чем-то заплатить:', 'Каждый шаг согласовывать с начальством', 'Пять лет одно и то же, без сюрпризов', 'Никогда не подняться в этом деле выше среднего', 'Никто не узнает, что это твоя работа', 'Никакой стабильности: контракт на три месяца', 'Работать в праздники, когда собирается вся семья', 'Уехать далеко от близких', 'Знать, что компания вредит природе'],
        ['ДОМ МЕЧТЫ', 'Дом мечты — твой. Цена:', 'Жить по строгим правилам посёлка: цвет забора, гости, шум', 'Больше никаких путешествий', 'Бросить дело, в котором ты почти мастер', 'Потерять весь статус и связи', 'Он стоит там, где раз в десять лет бывает наводнение', 'Он в стране, где никто не знает твоих традиций', 'До близких — 12 часов дороги', 'Ради него вырубили лес'],
        ['ДЕСЯТЬ ЛЕТ', 'Можно получить ещё десять лет здоровой жизни. Цена:', 'Все эти годы твой распорядок решает кто-то другой', 'Каждый день похож на предыдущий', 'Ты больше ничего не добьёшься — просто будешь жить', 'Твой голос больше нигде ничего не решает', 'Каждый год начинать с нуля: без денег и дома', 'Ты забудешь, откуда ты и как у вас было заведено', 'Все, кто тебе дорог, будут далеко — придётся всё строить заново', 'Все эти годы ты никому не сможешь помочь'],
        ['ДЕНЬГИ', 'На счёт падает сумма, которой хватит до конца жизни. Но с одним из этих условий:', 'Тратить можно только по чужому плану', 'Нельзя менять город и работу', 'Больше нельзя заниматься своим делом', 'Ты теряешь всё влияние: твоё мнение ничего не решает', 'Деньги придут через 10 лет, а до тех пор — без подушки', 'Нельзя праздновать ничего, что праздновали в семье', 'Нельзя делиться с близкими', 'Деньги заработаны нечестно, и ты это знаешь'],
        ['ГЛАВНЫЙ ПРОЕКТ', 'Твой главный проект точно получится. Цена:', 'Делать его строго по чужому техзаданию', 'Он займёт десять лет рутины', 'Получится нормально, но не блестяще', 'Слава достанется другому', 'Придётся вложить все сбережения', 'Придётся порвать с тем, как принято в твоей семье и среде', 'Год почти не видеть близких', 'Он кому-то навредит, пусть и немного'],
        ['ПЕРЕЕЗД', 'Тебя зовут в город, где тебе будет лучше. Но:', 'Там за тебя решают всё: где жить, что носить, что говорить', 'Там ничего не происходит', 'Там твоя профессия никому не нужна', 'Там ты никто: статус с нуля', 'Там нет гарантий: ни контракта, ни жилья', 'Там другой язык, другая кухня, другие праздники', 'Близкие с тобой не поедут', 'Там закрывают глаза на несправедливость'],
        ['ТАЛАНТ', 'Тебе дают огромный талант к любимому делу. Взамен отдай одно:', 'Свободное время: талант требует жёсткого режима', 'Любопытство: всё остальное станет неинтересно', 'Победы: будет счастье, но не первое место', 'Авторитет: тебя не будут слушать', 'Стабильный доход: деньги будут то густо, то пусто', 'Связь с местом, откуда ты родом', 'Время с близкими', 'Возможность помогать посторонним'],
        ['ВТОРАЯ ЖИЗНЬ', 'Можно прожить вторую жизнь параллельно. Но в ней не будет одного:', 'Права выбирать', 'Сюрпризов', 'Побед', 'Влияния', 'Уверенности в завтрашнем дне', 'Корней и традиций', 'Твоих близких', 'Смысла за пределами своей жизни'],
      ],
      shadows: {
        FREEDOM: ['Абсолютная свобода: никто больше никогда не скажет, что тебе делать. Но и не скажет, правильно ли ты поступаешь.', 'Никаких обязательств — ни у тебя, ни перед тобой. Но и рассчитывать на тебя никто не станет.'],
        NOVELTY: ['Каждый год — новая страна, новое дело, новые люди. Но ничего не остаётся надолго.', 'Жизнь, в которой никогда не скучно. Но и никогда не спокойно.'],
        SUCCESS: ['Ты становишься номером один в своём деле. Но никто, кроме тебя, об этом не узнает.', 'Все твои цели будут достигнуты. Но каждая будет стоить бессонных ночей.'],
        INFLUENCE: ['Твоё слово решает судьбы многих. Но и за каждую ошибку отвечать тебе — публично.', 'Ты на самом верху. Там тебя слушают все — и почти никто не говорит правду.'],
        SECURITY: ['Жизнь без единого риска. Но и без больших взлётов.', 'Полная уверенность в завтрашнем дне. Но завтра будет почти как сегодня.'],
        ROOTS: ['Всё, что было важно в твоей семье, сохранится. Но менять это будет нельзя.', 'Ты — часть большой традиции. Но решать, как жить, будет она, а не ты.'],
        PEOPLE: ['Твои близкие будут счастливы. Но за пределами вашего круга ты ничего не изменишь.', 'Ты всегда рядом со своими. Но ради этого придётся отказаться от большого шанса.'],
        WORLD: ['Мир станет чуть справедливее благодаря тебе. Но спасибо никто не скажет, а время на это придётся забрать у близких.', 'Ты поможешь тысячам незнакомых. Но не узнаешь их имён и не увидишь результата.'],
      },
      reactions: {
        FREEDOM: ['Где-то открывается дверь, которой вчера не было.', 'Сценарий, написанный за тебя, теряет страницу.', 'СИСТЕМНЫЙ ЖУРНАЛ: маршрут не согласован. Продолжаем.', 'На секунду стрелка компаса показывает на тебя.'],
        NOVELTY: ['Карта мира тихо дорисовывает ещё один край.', 'Где-то загорается незнакомая вывеска.', 'СИСТЕМНЫЙ ЖУРНАЛ: скука отклонена.', 'Ветер меняет направление. Совпадение?'],
        SUCCESS: ['На чьей-то доске почёта появляется пустая рамка. Пока пустая.', 'Лестница становится на ступеньку выше.', 'СИСТЕМНЫЙ ЖУРНАЛ: планка поднята.', 'В мастерской загорается свет. Поздно, но кто-то ещё работает.'],
        INFLUENCE: ['Где-то на доске сдвигается фигура.', 'В другом конце города кто-то произносит твоё имя.', 'СИСТЕМНЫЙ ЖУРНАЛ: ставки повышены.', 'Рычаг найден. Рука уже на нём.'],
        SECURITY: ['Где-то щёлкает замок. Всё на месте.', 'Резервная копия создана. Кем — неизвестно.', 'СИСТЕМНЫЙ ЖУРНАЛ: риск отклонён.', 'Фундамент становится на сантиметр толще.'],
        ROOTS: ['В старом альбоме переворачивается страница.', 'Где-то ставят чайник — как всегда, в семь.', 'СИСТЕМНЫЙ ЖУРНАЛ: традиция сохранена.', 'В архиве ещё одна папка аккуратно подписана.'],
        PEOPLE: ['Кому-то из твоих становится чуть легче. Непонятно почему.', 'В общем чате появляется ещё одно сердечко.', 'СИСТЕМНЫЙ ЖУРНАЛ: никого не бросили.', 'Чей-то тяжёлый рюкзак вдруг становится легче.'],
        WORLD: ['Где-то незнакомый человек находит то, что потерял.', 'В чужом окне загорается свет.', 'СИСТЕМНЫЙ ЖУРНАЛ: несправедливость −1.', 'Где-то в лесу становится на одно дерево больше.'],
      },
      shadowReact: ['Ценность прошла проверку тенью.', 'Тень записала сомнение. Это тоже ответ.', 'Тень записала: за такую цену — нет.'],
      nouns: {
        FREEDOM: { name: 'СТРАННИК', plus: 'идёшь туда, куда не ведёт ни одна инструкция', shadow: 'можно уйти так далеко, что не останется, к кому вернуться' },
        NOVELTY: { name: 'ИСКАТЕЛЬ', plus: 'превращаешь обычный день в историю', shadow: 'скука пугает сильнее настоящих рисков' },
        SUCCESS: { name: 'МАСТЕР', plus: 'доводишь дело до уровня, которым можно гордиться', shadow: 'планка растёт быстрее, чем радость от результата' },
        INFLUENCE: { name: 'СТРАТЕГ', plus: 'видишь доску целиком и двигаешь фигуры', shadow: 'люди могут начать казаться фигурами' },
        SECURITY: { name: 'ХРАНИТЕЛЬ', plus: 'с тобой спокойно: у тебя всегда есть план Б', shadow: 'безопасность может стать клеткой' },
        ROOTS: { name: 'ЛЕТОПИСЕЦ', plus: 'бережёшь важное, пока все бегут за новым', shadow: '«так принято» может заменить «так правильно»' },
        PEOPLE: { name: 'ЗАЩИТНИК', plus: 'твои люди знают, что ты придёшь', shadow: 'на себя может не остаться ни времени, ни сил' },
        WORLD: { name: 'САДОВНИК', plus: 'делаешь лучше не только для своих', shadow: 'можно так переживать за всех, что не останется сил на себя и своих' },
      },
      adjectives: { FREEDOM: 'ВОЛЬНЫЙ', NOVELTY: 'ДЕРЗКИЙ', SUCCESS: 'НЕУТОМИМЫЙ', INFLUENCE: 'ВЛИЯТЕЛЬНЫЙ', SECURITY: 'НАДЁЖНЫЙ', ROOTS: 'ВЕРНЫЙ', PEOPLE: 'ТЁПЛЫЙ', WORLD: 'СПРАВЕДЛИВЫЙ' },
      titleOf: (adj, noun, place) => (adj + ' ' + noun + ' ' + place).trim(),
      places: ['НЕДОСТРОЕННЫХ КОМНАТ', 'УЛИЦЫ ЧЕТВЕРГА', 'ПОТЕРЯННЫХ ВЕЧЕРОВ', 'ВТОРОЙ ЛУНЫ', 'ПОГОДЫ НАПРОКАТ', 'МАЛЕНЬКИХ АПОКАЛИПСИСОВ', 'ТИХИХ МАШИН', 'ОТКРЫТЫХ ДВЕРЕЙ', 'ПОСЛЕДНЕГО АВТОБУСА', 'НЕВОЗМОЖНЫХ КАРТ'],
      purposeVerb: { FREEDOM: 'прокладывать свой путь', NOVELTY: 'открывать неизведанное', SUCCESS: 'делать своё дело на высшем уровне', INFLUENCE: 'влиять на большие решения', SECURITY: 'строить то, что не рухнет', ROOTS: 'хранить и передавать важное', PEOPLE: 'быть опорой для своих', WORLD: 'делать мир справедливее' },
      purposeTail: { FREEDOM: 'никто не писал за тебя сценарий', NOVELTY: 'жизнь не превращалась в День сурка', SUCCESS: 'результат было видно', INFLUENCE: 'это меняло правила игры', SECURITY: 'за завтра можно было не бояться', ROOTS: 'это пережило тебя', PEOPLE: 'твоим людям было теплее', WORLD: 'от этого выигрывали и незнакомые' },
      purpose: (verb, tail) => 'Похоже, тебе важно ' + verb + ' — так, чтобы ' + tail + '.',
      cost: {
        FREEDOM: 'жизнь по чужому сценарию: всё правильно, но не твоё', NOVELTY: 'годы, которые сливаются в один', SUCCESS: 'дело, которое так и не стало мастерством', INFLUENCE: 'решения о твоей жизни принимают другие',
        SECURITY: 'один неудачный месяц может обрушить всё', ROOTS: 'ощущение, что ты ниоткуда', PEOPLE: 'однажды оглянуться — а рядом никого', WORLD: 'жизнь, которая ни для кого, кроме тебя, ничего не изменила',
      },
      questGive: {
        FREEDOM: 'Каждый день принимай одно решение — своё, без советов и согласований. Даже маленькое. Записывай, каким оно было.',
        NOVELTY: 'Каждый день — одно «впервые»: новый маршрут, блюдо, человек, жанр. Семь «впервые» за неделю.',
        SUCCESS: 'Выбери одно умение и 7 дней подряд тренируй его по 20 минут. В конце сравни с первым днём.',
        INFLUENCE: 'Раз в день говори своё мнение там, где обычно молчишь. Без смягчений.',
        SECURITY: 'За 7 дней собери «подушку»: по одному шагу в день — деньги, документы, здоровье, резервные копии.',
        ROOTS: 'Каждый день узнавай одну вещь о своей семье или месте, откуда ты. Позвони кому-то из старших и спроси, как было раньше.',
        PEOPLE: 'Каждый день делай одну вещь для одного близкого человека — без повода и без просьбы.',
        WORLD: 'Каждый день — одно маленькое дело для незнакомых: донат, отзыв, помощь, мусор в урну. Семь дел за неделю.',
      },
      axes: [
        { short: 'Свобода против надёжности', text: 'Тебя тянет и жить по-своему, и стоять на твёрдой почве. Поэтому решения «рискнуть или остаться» даются тяжело. Это не нерешительность: две настоящие ценности тянут в разные стороны.', quest: 'Найди одно решение, которое давно откладываешь из-за риска. Сделай его маленькую версию с подстраховкой: попробуй на неделю, а не навсегда.' },
        { short: 'Новизна против корней', text: 'Тебе нужны впечатления и перемены — и одновременно важно, чтобы оставалось что-то постоянное: традиции, свои ритуалы, «как у нас принято». Тяжелее всего, когда новое требует отказаться от старого.', quest: 'Возьми одну свою традицию и сделай её по-новому: другое место, другой формат, новый человек. Посмотри, что в ней главное, а что можно менять.' },
        { short: 'Успех против близких', text: 'Тебе важно добиться своего — и важно быть рядом со своими. Время одно, и почти каждая неделя решает этот спор заново. Отсюда чувство вины в обе стороны.', quest: 'На неделю назначь одно «неприкосновенное» время для дела и одно — для близких. Не отдавай одно ради другого. В конце честно посмотри, что получилось.' },
        { short: 'Влияние против справедливости', text: 'Тебе хочется иметь вес и решать — и хочется, чтобы было честно для всех. Тяжело, когда путь к влиянию требует закрыть глаза на справедливость.', quest: 'Найди ситуацию, где у тебя есть хоть немного влияния, и используй его в пользу того, у кого влияния нет. Один раз за неделю — по-настоящему.' },
      ],
      near: {
        short: (a, b) => a + ' и ' + b,
        text: (a, b, ma, mb) => 'Две твои сильные ценности — ' + a + ' (' + ma + ') и ' + b + ' (' + mb + ') — стоят почти напротив друг друга на круге ценностей. В жизни они часто требуют разного, и выбор между ними даётся тяжелее, чем кажется со стороны.',
        quest: (a, b) => 'На этой неделе найди одну ситуацию, где ' + a + ' и ' + b + ' требуют разного. Не выбирай сразу: запиши, что даёт тебе каждая из них, и только потом реши.',
      },
      open: { short: 'Компас пока ищет север', text: 'Твои выборы разошлись по всему кругу: ни одна ценность не победила явно. Это не плохо — так бывает, когда важно всё понемногу или день такой. Следующее прохождение сделает картину чётче.', quest: '7 вечеров подряд записывай одно решение дня и какую ценность оно защитило. В конце посмотри, какая встречается чаще всего.' },
      clear: {
        short: a => 'Ясный курс: ' + a,
        text: (a, c, cost) => 'Почти все твои выборы смотрят в одну сторону: ' + a + '. Сильная сторона — ясность. Обратная сторона — ' + c + ' в тени: ' + cost + '.',
      },
      evidence: {
        instinct: [(t, o) => '«' + t + '»: твоё — «' + o + '»', (t, o) => '«' + t + '»: точно нет — «' + o + '»'],
        price: [(t, o) => '«' + t + '»: ни за что не заплатишь — «' + o + '»', (t, o) => '«' + t + '»: легко заплатишь — «' + o + '»'],
        shadow: [(t, o) => '«' + t + '»: «' + o + '» — БЕРУ', (t, o) => '«' + t + '»: «' + o + '» — НЕТ'],
      },
      shadowTitle: 'ТЕНЬ',
      stars: {
        persona: { FREEDOM: 'бунтаря', NOVELTY: 'искателя приключений', SUCCESS: 'чемпиона', INFLUENCE: 'лидера', SECURITY: 'человека-крепость', ROOTS: 'хранителя традиций', PEOPLE: 'опору для своих', WORLD: 'идеалиста' },
        match: (p, a, b) => 'Звёзды ждали ' + p + ' — и угадали: ' + a + ' и ' + b + ' — в твоей первой тройке. Редкий случай.',
        half: (p, hit, miss, pos) => 'Звёзды угадали наполовину: ' + hit + ' — да, а вот ' + miss + ' у тебя только на ' + pos + '-м месте.',
        miss: (p, top) => 'Звёзды ждали ' + p + '. А во главе твоего компаса — ' + top + '.',
        word: { match: 'СОВПАЛО', half: 'ПОПАЛИ НАПОЛОВИНУ', miss: 'НЕЛОВКО' },
      },
      hidden: v => 'Скрытая ценность: ' + v + '. В обычных выборах она не побеждает, но на прямой вопрос ответ — «беру».',
      fragile: v => v + ' — в лидерах, пока это бесплатно: как только появилась цена, ответ — «нет». Проверь, твоя ли это ценность или привычка.',
      conf: {
        pair: (a, b) => a + ' для тебя важнее, чем ' + b + ', — это видно по нескольким выборам.',
        unclear: (a, b) => 'Пока не ясно, что для тебя важнее: ' + a + ' или ' + b + '. Пройди ещё раз через неделю — станет видно.',
        steady: 'Ответы последовательны — картина чёткая.',
      },
      lpWhy: [null, 'единица — число первых', 'двойка — число союза', 'тройка — число игры и самовыражения', 'четвёрка — число фундамента', 'пятёрка — число перемен', 'шестёрка — число дома и рода', 'семёрка — число одиночек и искателей', 'восьмёрка — число силы и денег', 'девятка — число всех людей'],
      elements: ['огонь', 'земля', 'воздух', 'вода'],
      elemWhy: ['огонь — азарт', 'земля — опора', 'воздух — простор', 'вода — чувства'],
      stages: [
        { max: 12, name: 'трудолюбие ↔ неполноценность', q: 'Что у тебя получается лучше всего?' },
        { max: 18, name: 'идентичность ↔ смешение ролей', q: 'Кто ты, когда никто не смотрит?' },
        { max: 39, name: 'близость ↔ изоляция', q: 'С кем — и ради чего?' },
        { max: 64, name: 'продуктивность ↔ застой', q: 'Что ты оставишь тем, кто идёт следом?' },
        { max: 200, name: 'целостность ↔ отчаяние', q: 'Какая история твоей жизни звучит правдой?' },
      ],
      techMilestones: [[1957, 'первого спутника'], [1961, 'полёта Гагарина'], [1969, 'высадки на Луну'], [1971, 'первого электронного письма'], [1983, 'первого мобильного телефона в продаже'], [1991, 'Всемирной паутины'], [1998, 'Google'], [2001, 'Википедии'], [2005, 'YouTube'], [2007, 'iPhone'], [2022, 'ChatGPT']],
      worldAtBirth: (pop, tech, yrs) => 'Когда ты появляешься на свет, на Земле около ' + pop + ' млрд человек' + (tech ? ', а до ' + tech + ' ещё ' + yrs + ' ' + plural(yrs, ['год', 'года', 'лет']) + '.' : '.'),
      zodiac: ['Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева', 'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'],
      sep: ' · ', orderSep: ' > ',
      prompts: {
        compass: r => 'Я прохожу BORN WEIRD — игру-калибровку ценностей (игра, не тест). Мой компас: ' + r.orderText + '. Ни за что не отдам: ' + r.protectLabel + '; легко отдаю: ' + r.easyLabel + '. Главное противоречие: ' + r.contradiction.short + '.' +
          ' Задай мне 3 коротких вопроса по одному о моих реальных решениях, потом скажи, где это противоречие, скорее всего, проявляется, и предложи один эксперимент на неделю. Отвечай по-русски.',
        purpose: r => 'В игре BORN WEIRD у меня вышел компас ценностей: ' + r.orderText + '. Гипотеза о предназначении: «' + r.purpose + '» Это игра, а не истина.' +
          ' Помоги уточнить: задай 3 вопроса по одному, потом предложи 3 формулировки предназначения и к каждой — одно намерение на ближайший месяц. Отвечай по-русски.',
        plan: r => 'Я прохожу BORN WEIRD — игру про ценности (не тест). Мои главные ценности: ' + r.drivesText + '. Квест на 7 дней: ' + r.contradiction.quest +
          ' Преврати его в план на 7 дней: одно действие на 15–30 минут в день и понятный критерий «сделано». Сначала задай один вопрос о моей ситуации. Отвечай по-русски.',
      },
      seed: {
        title: 'BORN WEIRD // ПАСПОРТ ЦЕННОСТЕЙ (VALUE PASSPORT)',
        disclaimer: '> Первая калибровка по 9 выборам в один день — не психометрический тест, не диагноз и не предсказание. Ценности — по теории базовых ценностей Шварца (8 штук, формулировки наши, не валидированы). Звёзды (число пути, стихия) — игровая гипотеза, а не доказательство: баллы считаются только по выборам.',
        h: { compass: 'КОМПАС ЦЕННОСТЕЙ (VALUE COMPASS)', stars: 'ЗВЁЗДЫ VS ВЫБОРЫ (STARS VS CHOICES)', contra: 'ГЛАВНОЕ ПРОТИВОРЕЧИЕ (MAIN CONTRADICTION)', conf: 'УВЕРЕННОСТЬ (CONFIDENCE)', purpose: 'ГИПОТЕЗА О ПРЕДНАЗНАЧЕНИИ (PURPOSE HYPOTHESIS)', quest: 'КВЕСТ НА 7 ДНЕЙ (7-DAY QUEST)', archetype: 'АРХЕТИП (ARCHETYPE)', choices: 'ВЫБОРЫ (CHOICES)', data: 'ПРОФИЛЬ ДЛЯ МАШИН (MACHINE-READABLE PROFILE)', ai: 'ИНСТРУКЦИИ ДЛЯ ИИ (INSTRUCTIONS FOR AN AI)' },
        drives: 'Главное', protect: 'Ни за что не отдам', easy: 'Легко отдаю',
        starsLine: r => 'Число пути ' + r.lifePath + ', стихия: ' + r.stars.elementName + ' → прогноз: ' + r.stars.labels.join(' + ') + '.',
        ai: ['Относись к этому как к первой гипотезе о моих ценностях, а не как к правде обо мне.', 'Помоги проверить её на моих реальных решениях, уточнить гипотезу о предназначении и превратить её в одно-два намерения.', 'Общайся со мной по-русски.', 'Начни с вопроса: **«Где ты себя узнаёшь — а где совсем нет?»**'],
        footer: v => 'BORN WEIRD v' + v + ' (dimacloud.github.io/born-weird/ru). Симулятор жизней, которых у тебя ещё не было.',
      },
    },
  };

  // Top-1|top-2 rarity = share of random play; generated by operations/rarity.mjs.
  const RARITY = {"FREEDOM|INFLUENCE":0.0188,"FREEDOM|NOVELTY":0.02051,"FREEDOM|PEOPLE":0.01678,"FREEDOM|ROOTS":0.01866,"FREEDOM|SECURITY":0.01605,"FREEDOM|SUCCESS":0.0162,"FREEDOM|WORLD":0.01703,"INFLUENCE|FREEDOM":0.01908,"INFLUENCE|NOVELTY":0.01935,"INFLUENCE|PEOPLE":0.01936,"INFLUENCE|ROOTS":0.01687,"INFLUENCE|SECURITY":0.01781,"INFLUENCE|SUCCESS":0.01722,"INFLUENCE|WORLD":0.0141,"NOVELTY|FREEDOM":0.0178,"NOVELTY|INFLUENCE":0.01708,"NOVELTY|PEOPLE":0.02049,"NOVELTY|ROOTS":0.01549,"NOVELTY|SECURITY":0.02354,"NOVELTY|SUCCESS":0.01813,"NOVELTY|WORLD":0.01708,"PEOPLE|FREEDOM":0.01634,"PEOPLE|INFLUENCE":0.01895,"PEOPLE|NOVELTY":0.02261,"PEOPLE|ROOTS":0.01739,"PEOPLE|SECURITY":0.01784,"PEOPLE|SUCCESS":0.01401,"PEOPLE|WORLD":0.01641,"ROOTS|FREEDOM":0.01911,"ROOTS|INFLUENCE":0.01626,"ROOTS|NOVELTY":0.01756,"ROOTS|PEOPLE":0.01702,"ROOTS|SECURITY":0.01835,"ROOTS|SUCCESS":0.01983,"ROOTS|WORLD":0.01546,"SECURITY|FREEDOM":0.01506,"SECURITY|INFLUENCE":0.01735,"SECURITY|NOVELTY":0.02348,"SECURITY|PEOPLE":0.01697,"SECURITY|ROOTS":0.01744,"SECURITY|SUCCESS":0.01664,"SECURITY|WORLD":0.01963,"SUCCESS|FREEDOM":0.01623,"SUCCESS|INFLUENCE":0.01767,"SUCCESS|NOVELTY":0.02026,"SUCCESS|PEOPLE":0.01447,"SUCCESS|ROOTS":0.01947,"SUCCESS|SECURITY":0.01675,"SUCCESS|WORLD":0.01961,"WORLD|FREEDOM":0.0174,"WORLD|INFLUENCE":0.01446,"WORLD|NOVELTY":0.01961,"WORLD|PEOPLE":0.01743,"WORLD|ROOTS":0.01582,"WORLD|SECURITY":0.01991,"WORLD|SUCCESS":0.01977};

  const normLang = lang => (LANGS.indexOf(lang) >= 0 ? lang : 'en');
  const pack = lang => CONTENT[normLang(lang)];

  // ---------- birth date: private facts + the stars' hypothesis ----------
  function parseBirthDate(str) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str || '');
    if (!m) return null;
    const y = +m[1], mo = +m[2], d = +m[3];
    const date = new Date(Date.UTC(y, mo - 1, d));
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null;
    return date;
  }
  function lifePathOf(str) {
    const [y, m, d] = str.split('-');
    const digits = (d + m + y).split('').map(Number); // DD.MM.YYYY order, as people write dates
    let n = digits.reduce((a, b) => a + b, 0);
    const steps = [digits.join('+') + ' = ' + n];
    while (n > 9) { const ds = String(n).split('').map(Number); n = ds.reduce((a, b) => a + b, 0); steps.push(ds.join('+') + ' = ' + n); }
    return { n, steps };
  }
  const ZODIAC = [[3, 21], [4, 20], [5, 21], [6, 21], [7, 23], [8, 23], [9, 23], [10, 23], [11, 22], [12, 22], [1, 20], [2, 19]];
  function zodiacOf(month, day) {
    const md = month * 100 + day; let best = 9, bestStart = -1;
    ZODIAC.forEach(([m, d], i) => { const s = m * 100 + d; if (s <= md && s > bestStart) { bestStart = s; best = i; } });
    return best;
  }
  const elementOf = zodiacIdx => zodiacIdx % 4; // Aries fire, Taurus earth, Gemini air, Cancer water, …
  function starsOf(lifePath, element) {
    const a = LP_VALUE[lifePath], b = ELEM_VALUE[element] !== a ? ELEM_VALUE[element] : ELEM_ALT[element];
    return [a, b];
  }
  const POP = [[1900, 1.6], [1930, 2.07], [1950, 2.5], [1960, 3.0], [1970, 3.7], [1980, 4.4], [1990, 5.3], [2000, 6.1], [2010, 6.9], [2020, 7.8], [2026, 8.2]];
  function populationAt(year) {
    for (let i = 1; i < POP.length; i++) if (year <= POP[i][0]) { const [y0, p0] = POP[i - 1], [y1, p1] = POP[i]; return p0 + (p1 - p0) * (year - y0) / (y1 - y0); }
    return POP[POP.length - 1][1];
  }
  const DAY = 86400000;
  const fmtDate = (ms, lang) => { const d = new Date(ms); const dd = String(d.getUTCDate()).padStart(2, '0'), mm = String(d.getUTCMonth() + 1).padStart(2, '0'); return lang === 'ru' ? dd + '.' + mm + '.' + d.getUTCFullYear() : d.getUTCFullYear() + '-' + mm + '-' + dd; };

  /** Everything the birth date gives. Shown to the user only — only lifePath and element reach shareable output. */
  function decodeBirth(birthDateStr, lang, now) {
    lang = normLang(lang);
    const P = pack(lang);
    const date = parseBirthDate(birthDateStr);
    if (!date) throw new Error('invalid birth date');
    now = now || new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const daysAlive = Math.floor((today - date.getTime()) / DAY);
    if (daysAlive < 0) throw new Error('birth date is in the future');
    const y = date.getUTCFullYear(), mo = date.getUTCMonth() + 1, d = date.getUTCDate();
    if (y < 1900) throw new Error('birth date too early');
    let age = new Date(today).getUTCFullYear() - y;
    if ((new Date(today).getUTCMonth() + 1) * 100 + new Date(today).getUTCDate() < mo * 100 + d) age--;
    const lp = lifePathOf(birthDateStr);
    // Next "fresh start" milestone: round thousand of days, billion seconds, round hundred of weeks or the birthday — whichever comes first.
    const cands = [{ day: (Math.floor(daysAlive / 1000) + 1) * 1000, kind: 'days' }];
    for (let k = 1; k <= 4; k++) { const day = Math.ceil(k * 1e9 / 86400); if (day > daysAlive) { cands.push({ day, kind: 'gsec', k }); break; } }
    const w100 = (Math.floor(daysAlive / 700) + 1) * 100; cands.push({ day: w100 * 7, kind: 'weeks', k: w100 });
    let bd = Date.UTC(new Date(today).getUTCFullYear(), mo - 1, d);
    if (bd <= today) bd = Date.UTC(new Date(today).getUTCFullYear() + 1, mo - 1, d);
    cands.push({ day: Math.round((bd - date.getTime()) / DAY), kind: 'bday', k: age + 1 });
    const ms = cands.sort((a, b) => a.day - b.day)[0];
    const milestone = { day: ms.day, kind: ms.kind, k: ms.k || 0, inDays: ms.day - daysAlive, date: fmtDate(date.getTime() + ms.day * DAY, lang) };
    const stage = P.stages.find(s => age <= s.max);
    const tech = P.techMilestones.find(([ty]) => ty > y);
    const pop = populationAt(y);
    const popTxt = lang === 'ru' ? pop.toFixed(1).replace('.', ',') : pop.toFixed(1);
    const z = zodiacOf(mo, d), element = elementOf(z), stars = starsOf(lp.n, element);
    return {
      daysAlive, weeksLived: Math.floor(daysAlive / 7), age,
      lifePath: lp.n, lifePathSteps: lp.steps, lpWhy: P.lpWhy[lp.n],
      zodiac: P.zodiac[z], element, elementName: P.elements[element], elemWhy: P.elemWhy[element],
      stars: stars.map(v => ({ value: VALUES[v], label: P.values[VALUES[v]].label, meaning: P.values[VALUES[v]].meaning })),
      stage: { name: stage.name, q: stage.q },
      world: P.worldAtBirth(popTxt, tech ? tech[1] : null, tech ? tech[0] - y : 0),
      milestone,
      retakeDate: fmtDate(today + 7 * DAY, lang),
    };
  }

  // ---------- runs ----------
  /**
   * Start a run. The seed comes from the per-run random salt only (never the date).
   * seen: situation ids from earlier runs in this browser (e.g. ['I3','P5']) — skipped when possible, so repeats are rare.
   */
  function newRun(birthDateStr, salt, lang, now, seen) {
    lang = normLang(lang);
    const decoded = decodeBirth(birthDateStr, lang, now);
    if (salt == null) salt = Math.floor(Math.random() * 4294967296);
    const seed = hash('bornweird:seed:' + salt);
    return makeRun(seed, decoded.lifePath, decoded.element, lang, decoded, seen || []);
  }
  const sitTag = k => (k < 3 ? 'I' : 'P');
  function pickSits(seed, seen) {
    const sits = [];
    ['I', 'P'].forEach(tag => {
      const order = shuffled([0, 1, 2, 3, 4, 5, 6, 7], rngFor(seed, 'pick' + tag));
      const fresh = order.filter(i => seen.indexOf(tag + i) < 0);
      sits.push(...fresh.concat(order.filter(i => fresh.indexOf(i) < 0)).slice(0, 3));
    });
    return sits;
  }
  /** The 6 value blocks of this run, each in display order: design rotated/reflected and shuffled by the seed. */
  function valueBlocks(seed) {
    const r = rngFor(seed, 'design'), rot = pickIdx(r, N), flip = r() < 0.5;
    const blocks = shuffled(DESIGN, rngFor(seed, 'blocks')).map(b => b.map(v => ((flip ? (N - v) % N : v) + rot) % N));
    return blocks.map((b, k) => shuffled(b, rngFor(seed, 'order' + k)));
  }
  function makeRun(seed, lifePath, element, lang, decoded, seen) {
    return { seed, lifePath, element, lang: normLang(lang), sits: pickSits(seed, seen || []), vals: valueBlocks(seed), answers: [], shadows: [], decoded: decoded || null };
  }
  const sitIds = run => run.sits.map((s, k) => sitTag(k) + s);
  const sitOf = (P, run, k) => (k < 3 ? P.instinct : P.price)[run.sits[k]];

  // ---------- scoring ----------
  function tally(run) {
    const z = () => new Array(N).fill(0);
    const t = { plus: z(), minus: z(), sh: z(), pricePlus: z(), priceMinus: z() };
    run.answers.forEach(([p, m], k) => {
      const vp = run.vals[k][p], vm = run.vals[k][m];
      t.plus[vp]++; t.minus[vm]++;
      if (k >= 3) { t.pricePlus[vp]++; t.priceMinus[vm]++; }
    });
    return t;
  }
  function rankOf(seed, net, t) {
    const r = rngFor(seed, 'tie'), jitter = VALUES.map(() => r());
    return VALUES.map((_, i) => i).sort((a, b) => (net[b] - net[a]) || (t.minus[a] - t.minus[b]) || (t.plus[b] - t.plus[a]) || (jitter[b] - jitter[a]));
  }
  /** Values tested in the shadow round: the two leaders after 6 screens, then a value the stars expected if it is not in the top 3. */
  function shadowTargets(run) {
    if (run.answers.length < CHOICE_SCREENS) throw new Error('shadow round comes after 6 screens');
    const t = tally(run), net = t.plus.map((p, i) => p - t.minus[i]);
    const rank = rankOf(run.seed, net, t);
    const hiddenCand = starsOf(run.lifePath, run.element).find(v => rank.indexOf(v) > 2);
    return [rank[0], rank[1], hiddenCand != null ? hiddenCand : rank[2]].map((v, j) => ({ value: v, hiddenCheck: j === 2 && hiddenCand != null }));
  }
  function score(run) {
    const t = tally(run);
    const targets = run.answers.length === CHOICE_SCREENS ? shadowTargets(run) : [];
    run.shadows.forEach((a, j) => { t.sh[targets[j].value] += a === 0 ? 1 : a === 2 ? -1 : 0; });
    const net = t.plus.map((p, i) => p - t.minus[i] + t.sh[i]);
    return Object.assign(t, { net, rank: rankOf(run.seed, net, t), targets });
  }

  // ---------- items ----------
  /** Screen k (0–8). Rounds I–II: four options (the value stays hidden in the UI). Round III: one shadow statement. */
  function item(run, k) {
    const P = pack(run.lang), round = ROUNDS[k];
    if (k < CHOICE_SCREENS) {
      const s = sitOf(P, run, k);
      return { index: k, total: TOTAL, round, title: s[0], prompt: s[1], options: run.vals[k].map(v => ({ text: s[2 + v], value: VALUES[v] })) };
    }
    const tg = shadowTargets(run)[k - CHOICE_SCREENS], V = VALUES[tg.value];
    const variant = pickIdx(rngFor(run.seed, 'shadow' + k), 2);
    return { index: k, total: TOTAL, round, title: P.shadowTitle, prompt: P.shadows[V][variant], value: V, hiddenCheck: tg.hiddenCheck };
  }
  const labelOf = (P, v) => P.values[VALUES[v]].label;

  /** Rounds I–II: plusPos = "open" / "never pay", minusPos = "definitely not" / "pay easily" (display positions 0–3). */
  function answer(run, k, plusPos, minusPos) {
    if (k !== run.answers.length || k >= CHOICE_SCREENS) throw new Error('screens must be answered in order');
    if (![plusPos, minusPos].every(v => Number.isInteger(v) && v >= 0 && v < 4) || plusPos === minusPos) throw new Error('invalid answer');
    run.answers.push([plusPos, minusPos]);
    const P = pack(run.lang), vp = run.vals[k][plusPos], vm = run.vals[k][minusPos];
    const pool = P.reactions[VALUES[vp]];
    return {
      reaction: pool[pickIdx(rngFor(run.seed, 'react' + k + ':' + vp), pool.length)],
      deltas: [{ value: VALUES[vp], label: labelOf(P, vp), delta: 1 }, { value: VALUES[vm], label: labelOf(P, vm), delta: -1 }],
    };
  }
  /** Round III: choice 0 = take it (+1), 1 = not sure (0), 2 = no (−1). */
  function answerShadow(run, k, choice) {
    if (run.answers.length !== CHOICE_SCREENS || k !== CHOICE_SCREENS + run.shadows.length || k >= TOTAL) throw new Error('screens must be answered in order');
    if (![0, 1, 2].includes(choice)) throw new Error('invalid answer');
    const it = item(run, k);
    run.shadows.push(choice);
    const P = pack(run.lang), d = choice === 0 ? 1 : choice === 2 ? -1 : 0;
    return { reaction: P.shadowReact[choice], deltas: d ? [{ value: it.value, label: P.values[it.value].label, delta: d }] : [] };
  }

  // ---------- result ----------
  function finish(run) {
    if (run.answers.length !== CHOICE_SCREENS || run.shadows.length !== 3) throw new Error('run not complete');
    const P = pack(run.lang), L = v => labelOf(P, v), M = v => P.values[VALUES[v]].meaning;
    const sc = score(run), rank = sc.rank, net = sc.net;
    const top = rank[0], second = rank[1], third = rank[2], last = rank[N - 1];
    const r = rngFor(run.seed, 'final:' + run.answers.map(a => a.join('')).join(',') + ':' + run.shadows.join(''));
    const hex = () => Math.floor(r() * 0x10000).toString(16).toUpperCase().padStart(4, '0');
    const id = hex() + '-' + hex();
    const place = P.places[pickIdx(r, P.places.length)];
    const noun = P.nouns[VALUES[top]], adj = P.adjectives[VALUES[second]];

    // every signal with its source, in screen order
    const signals = VALUES.map(() => []), choices = [];
    run.answers.forEach(([p, m], k) => {
      const s = sitOf(P, run, k), round = ROUNDS[k], vp = run.vals[k][p], vm = run.vals[k][m];
      signals[vp].push({ sign: 1, text: P.evidence[round][0](s[0], s[2 + vp]) });
      signals[vm].push({ sign: -1, text: P.evidence[round][1](s[0], s[2 + vm]) });
      choices.push({ round, title: s[0], prompt: s[1], plus: s[2 + vp], minus: s[2 + vm], plusValue: VALUES[vp], minusValue: VALUES[vm] });
    });
    sc.targets.forEach((tg, j) => {
      const a = run.shadows[j], it = item(run, CHOICE_SCREENS + j);
      if (a !== 1) signals[tg.value].push({ sign: a === 0 ? 1 : -1, text: P.evidence.shadow[a === 0 ? 0 : 1](it.title, it.prompt) });
      choices.push({ round: 'shadow', title: it.title, prompt: it.prompt, answer: P.rounds.shadow.answers[a], value: it.value });
    });
    const firstEv = (v, sign) => (signals[v].find(s => s.sign === sign) || {}).text;

    // compass
    const conf = VALUES.map((_, v) => {
      const pos = signals[v].some(s => s.sign > 0), neg = signals[v].some(s => s.sign < 0);
      return pos && neg ? 'low' : Math.abs(net[v]) >= 2 ? 'high' : 'mid';
    });
    const compass = rank.map(v => ({ value: VALUES[v], label: L(v), meaning: M(v), net: net[v], plus: sc.plus[v], minus: sc.minus[v], shadow: sc.sh[v], bar: Math.max(0, Math.min(10, Math.round((net[v] + 4) / 8 * 10))), conf: conf[v] }));
    // protected = most "never pay" picks; given up easily = the lowest-ranked value paid "easily"
    const protect = rank.filter(v => sc.pricePlus[v] > 0).sort((a, b) => sc.pricePlus[b] - sc.pricePlus[a] || rank.indexOf(a) - rank.indexOf(b))[0];
    const easyCands = rank.filter(v => sc.priceMinus[v] > 0 && v !== protect);
    const easy = easyCands[easyCands.length - 1];

    // stars vs choices
    const stars = starsOf(run.lifePath, run.element);
    // a stars value is a hit when it is chosen (+1 or more) and scores at least as high as the #3 value
    const hits = stars.filter(v => net[v] >= 1 && net[v] >= net[third]);
    const starsKind = hits.length === 2 ? 'match' : hits.length === 1 ? 'half' : 'miss';
    const persona = P.stars.persona[VALUES[stars[0]]];
    const missV = stars.find(v => hits.indexOf(v) < 0);
    const starsText = starsKind === 'match' ? P.stars.match(persona, L(stars[0]), L(stars[1]))
      : starsKind === 'half' ? P.stars.half(persona, L(hits[0]), L(missV), rank.indexOf(missV) + 1)
        : P.stars.miss(persona, L(top));

    // hidden value (stars' value tested directly and taken) and fragile leaders (refused once it had a price)
    let hidden = null, fragile = null;
    sc.targets.forEach((tg, j) => {
      if (tg.hiddenCheck && run.shadows[j] === 0 && rank.indexOf(tg.value) > 2) hidden = tg.value;
      if (j < 2 && run.shadows[j] === 2 && rank.indexOf(tg.value) < 3 && sc.pricePlus[tg.value] === 0 && sc.plus[tg.value] - sc.minus[tg.value] >= 1 && fragile == null) fragile = tg.value;
    });

    // main contradiction (top 3 only, both chosen, one of them +2 or more): an opposite pair, else a near-opposite pair,
    // else a clear direction (a strict leader at +2 or more), else "open" (no single direction yet)
    const strong = rank.slice(0, 3).filter(v => net[v] >= 1);
    const pairAt = dist => {
      let best = null;
      strong.forEach(a => strong.forEach(b => {
        const d = Math.abs(a - b);
        if (a < b && (d === dist || d === N - dist) && Math.max(net[a], net[b]) >= 2) { const s = Math.min(net[a], net[b]); if (!best || s > best.s) best = { a, b, s }; }
      }));
      if (best && rank.indexOf(best.b) < rank.indexOf(best.a)) [best.a, best.b] = [best.b, best.a];
      return best;
    };
    let contradiction;
    const op = pairAt(4), nr = op ? null : pairAt(3);
    if (op) {
      const ax = P.axes[Math.min(op.a, op.b) % 4];
      contradiction = { kind: 'opposite', a: VALUES[op.a], b: VALUES[op.b], short: ax.short, text: ax.text, quest: ax.quest, evidence: [firstEv(op.a, 1), firstEv(op.b, 1)] };
    } else if (nr) {
      contradiction = { kind: 'near', a: VALUES[nr.a], b: VALUES[nr.b], short: P.near.short(L(nr.a), L(nr.b)), text: P.near.text(L(nr.a), L(nr.b), M(nr.a), M(nr.b)), quest: P.near.quest(L(nr.a), L(nr.b)), evidence: [firstEv(nr.a, 1), firstEv(nr.b, 1)] };
    } else if (net[top] >= 2 && net[top] > net[second]) {
      const c = opp(top);
      contradiction = { kind: 'clear', a: VALUES[top], b: VALUES[c], short: P.clear.short(L(top)), text: P.clear.text(L(top), L(c), P.cost[VALUES[c]]), quest: P.questGive[VALUES[c]], evidence: [firstEv(top, 1), firstEv(c, -1)] };
    }
    else contradiction = Object.assign({ kind: 'open', a: VALUES[top], b: VALUES[second], evidence: [] }, P.open);
    contradiction.evidence = contradiction.evidence.filter(Boolean);

    // confidence: what is clear and what is not yet
    const sure = net[top] - net[last] >= 3 ? P.conf.pair(L(top), L(last)) : null;
    let unclear = null;
    for (let i = 0; i < 3 && !unclear; i++) if (net[rank[i]] === net[rank[i + 1]]) unclear = P.conf.unclear(L(rank[i]), L(rank[i + 1]));
    const shaky = rank.slice(0, 3).find(v => conf[v] === 'low');
    if (!unclear && shaky != null) unclear = P.conf.unclear(L(shaky), L(rank[rank.indexOf(shaky) + 1]));

    const drives = [top].concat([second, third].filter(v => net[v] >= 1));
    const rKey = VALUES[top] + '|' + VALUES[second];
    const res = {
      id, version: VERSION, lang: run.lang,
      archetype: P.titleOf(adj, noun.name, ''), title: P.titleOf(adj, noun.name, place), plus: noun.plus, shadow: noun.shadow,
      rank: rank.map(v => VALUES[v]), top: VALUES[top], second: VALUES[second], third: VALUES[third], low: VALUES[last],
      compass,
      orderText: rank.map(L).join(P.orderSep),
      drives: drives.map(v => VALUES[v]), drivesText: drives.map(L).join(P.sep),
      protect: VALUES[protect], protectLabel: L(protect), easy: easy != null ? VALUES[easy] : null, easyLabel: easy != null ? L(easy) : '—',
      stars: { values: stars.map(v => VALUES[v]), labels: stars.map(L), kind: starsKind, word: P.stars.word[starsKind], text: starsText, lifePath: run.lifePath, element: run.element, elementName: P.elements[run.element] },
      hidden: hidden != null ? VALUES[hidden] : null, hiddenText: hidden != null ? P.hidden(L(hidden)) : null,
      fragile: fragile != null ? VALUES[fragile] : null, fragileText: fragile != null ? P.fragile(L(fragile)) : null,
      contradiction,
      confidence: { sure, unclear, text: [sure, unclear].filter(Boolean).join(' ') || P.conf.steady },
      purpose: P.purpose(P.purposeVerb[VALUES[top]], P.purposeTail[VALUES[second]]),
      choices,
      lifePath: run.lifePath, element: run.element,
      earth: 'EARTH-' + String(1000 + (run.seed % 9000)),
      protocol: ['LOST DOS GAME', 'CORRUPTED BROADCAST', 'FORBIDDEN CARTRIDGE'][run.seed % 3],
      artSeed: hash(run.seed + ':art:' + run.answers.join('|') + ':' + run.shadows.join('')) % 4294967296,
      rarity: RARITY[rKey] ? Math.max(2, Math.round(1 / RARITY[rKey])) : null,
      rarityKey: rKey,
      sitIds: sitIds(run),
    };
    res.key = encodeKey(run);
    return res;
  }

  // ---------- player key (restores a result without the birth date) ----------
  // Bits: version 3 | seed 53 | lifePath 4 | element 2 | sits 6×3 | answers 6×(2+2) | shadows 3×2 | check 12 = 122 → 25 base32 chars.
  const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const KEY_VERSION = 4;
  function keyFields(run) {
    return [[KEY_VERSION, 3], [run.seed, 53], [run.lifePath, 4], [run.element, 2]].concat(run.sits.map(v => [v, 3]), run.answers.flatMap(([p, m]) => [[p, 2], [m, 2]]), run.shadows.map(s => [s, 2]));
  }
  const checksum = fields => hash('bwkey:' + fields.map(f => f[0]).join(',')) % 4096;
  function encodeKey(run) {
    const fields = keyFields(run);
    let n = 0n;
    fields.concat([[checksum(fields), 12]]).forEach(([v, bits]) => { n = (n << BigInt(bits)) | BigInt(Math.max(0, Math.min(v, 2 ** bits - 1))); });
    let s = '';
    for (let i = 0; i < 25; i++) { s = B32[Number(n & 31n)] + s; n >>= 5n; }
    return s.match(/.{5}/g).join('-');
  }
  function fromKey(key, lang) {
    const clean = String(key || '').toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
    if (clean.length !== 25) return null;
    let n = 0n;
    for (const ch of clean) { const v = B32.indexOf(ch); if (v < 0) return null; n = (n << 5n) | BigInt(v); }
    const take = bits => { const v = Number(n & ((1n << BigInt(bits)) - 1n)); n >>= BigInt(bits); return v; };
    const check = take(12);
    const shadows = [0, 1, 2].map(() => take(2)).reverse();
    const answers = [0, 1, 2, 3, 4, 5].map(() => { const m = take(2), p = take(2); return [p, m]; }).reverse();
    const sits = [0, 1, 2, 3, 4, 5].map(() => take(3)).reverse();
    const element = take(2), lifePath = take(4), seed = take(53), version = take(3);
    if (version !== KEY_VERSION || n !== 0n || lifePath < 1 || lifePath > 9) return null;
    if (shadows.some(s => s > 2) || answers.some(([p, m]) => p === m)) return null;
    if (new Set(sits.slice(0, 3)).size !== 3 || new Set(sits.slice(3)).size !== 3) return null; // no repeated situation in a round
    const run = makeRun(seed, lifePath, element, lang, null, []);
    run.sits = sits; run.answers = answers; run.shadows = shadows;
    if (checksum(keyFields(run)) !== check) return null;
    return finish(run);
  }

  /** Convenience for tests/tools: answers = [[plusPos, minusPos] ×6] in display positions; opts.shadow = [0–2 ×3]. */
  function simulate(birthDateStr, answers, opts) {
    opts = opts || {};
    const run = newRun(birthDateStr, opts.salt, opts.lang, opts.now, opts.seen);
    answers.forEach(([p, m], k) => answer(run, k, p, m));
    (opts.shadow || [0, 0, 0]).forEach((a, j) => answerShadow(run, CHOICE_SCREENS + j, a));
    return finish(run);
  }

  function aiPrompts(res) { const Pr = pack(res.lang).prompts; return { compass: Pr.compass(res), purpose: Pr.purpose(res), plan: Pr.plan(res) }; }

  /** Portable profile for other tools (an Intent OS-ready "value passport"). No birth facts beyond life path and element. */
  function valueProfile(res) {
    const lc = v => (v ? v.toLowerCase() : null);
    return {
      format: 'born-weird/value-profile', version: res.version,
      values: Object.fromEntries(res.compass.map(c => [lc(c.value), { score: c.net, confidence: c.conf }])),
      top: res.drives.map(lc), protected: lc(res.protect), low_cost: lc(res.easy),
      contradiction: { kind: res.contradiction.kind, values: [lc(res.contradiction.a), lc(res.contradiction.b)] },
      hidden: lc(res.hidden), fragile: lc(res.fragile),
      stars: { expected: res.stars.values.map(lc), verdict: res.stars.kind },
      purpose_hypothesis: res.purpose, evidence_screens: TOTAL,
    };
  }

  function realitySeedMarkdown(res) {
    const S = pack(res.lang).seed, H = S.h, L = [];
    const sec = (h, lines) => { L.push('## ' + h); [].concat(lines).forEach(l => L.push(l)); L.push(''); };
    L.push('# ' + S.title); L.push(''); L.push(S.disclaimer); L.push('');
    sec(H.compass, [res.orderText, '', '- ' + S.drives + ': ' + res.drivesText, '- ' + S.protect + ': ' + res.protectLabel, '- ' + S.easy + ': ' + res.easyLabel, ''].concat(res.compass.map(c => '- ' + c.label + ' (' + c.meaning + '): ' + (c.net > 0 ? '+' : '') + c.net)));
    sec(H.stars, [S.starsLine(res), res.stars.text].concat(res.hiddenText ? [res.hiddenText] : []));
    sec(H.contra, ['**' + res.contradiction.short + '**', res.contradiction.text].concat(res.contradiction.evidence.map(e => '- ' + e)));
    sec(H.conf, [res.confidence.text].concat(res.fragileText ? [res.fragileText] : []));
    sec(H.purpose, res.purpose);
    sec(H.quest, res.contradiction.quest);
    sec(H.archetype, [res.title + ' — #' + res.id, '+ ' + res.plus, '− ' + res.shadow]);
    sec(H.choices, res.choices.map(c => (c.round === 'shadow' ? '- **' + c.title + '** — ' + c.prompt + ' → ' + c.answer : '- **' + c.title + '** — ' + c.prompt + ' → ✓ ' + c.plus + ' · ✗ ' + c.minus)));
    sec(H.data, ['```json', JSON.stringify(valueProfile(res), null, 2), '```']);
    sec(H.ai, S.ai);
    L.push('---'); L.push(S.footer(res.version));
    return L.join('\n');
  }

  const api = {
    VERSION, VALUES, LANGS, ROUNDS, TOTAL, CHOICE_SCREENS, POOL_SIZE, DESIGN, CONTENT, RARITY, LP_VALUE, ELEM_VALUE, ELEM_ALT,
    hash, rng, plural, parseBirthDate, lifePathOf, zodiacOf, elementOf, starsOf, decodeBirth,
    newRun, item, answer, answerShadow, shadowTargets, score, finish, encodeKey, fromKey, simulate, aiPrompts, valueProfile, realitySeedMarkdown,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BW = api;
})(typeof window !== 'undefined' ? window : globalThis);
