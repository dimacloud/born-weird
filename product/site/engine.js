/* BORN WEIRD — engine v0.4 "Mirror"
 * A 3-minute mirror of today's choices. Not a test, not a diagnosis, not a prediction.
 *
 * Model (see reports/CONCEPT_v0.4.md):
 *  - 4 value poles on two axes, after Schwartz's theory of basic human values (wording is ours, not validated):
 *      FREEDOM (openness to change)  ↔  ANCHOR (conservation)
 *      WEIGHT  (self-enhancement)    ↔  CARE   (self-transcendence)
 *  - BRIDGE: future self-continuity, one 1–7 item (after Hershfield's overlapping-circles measure).
 *  - 8 situations per run (best–worst: "I'd choose" / "definitely not"), drawn from a pool of 30.
 * Birth date → real facts shown privately (weeks lived, next "fresh start" milestone, life stage, the world at birth)
 *   + the life path number as openly symbolic lore. Only the life path reaches shareable outputs.
 * Language packs (en, ru) share one structure. Works in the browser (window.BW) and in Node (module.exports).
 */
(function (root) {
  'use strict';

  const VERSION = '0.4';
  const POLES = ['FREEDOM', 'ANCHOR', 'WEIGHT', 'CARE'];   // content options are always written in this order
  const OPPOSITE = { FREEDOM: 'ANCHOR', ANCHOR: 'FREEDOM', WEIGHT: 'CARE', CARE: 'WEIGHT' };
  const AXIS = { FREEDOM: 'O', ANCHOR: 'O', WEIGHT: 'E', CARE: 'E' };
  const LANGS = ['en', 'ru'];
  const HORIZONS = ['NOW', 'D7', 'Y1', 'Y10', 'Y40'];
  const PLAN = ['NOW', 'NOW', 'D7', 'D7', 'Y1', 'Y1', 'Y10', 'Y40']; // 8 items per run
  const BRIDGE_AFTER = 6; // the bridge question comes after the 10-year item (index 6)
  const POOL_SIZE = 6;    // situations per horizon

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

  // Situation = [prompt, FREEDOM option, ANCHOR option, WEIGHT option, CARE option]
  const CONTENT = {
    en: {
      horizonLabels: { NOW: 'NOW', D7: 'IN 7 DAYS', Y1: 'IN 1 YEAR', Y10: 'IN 10 YEARS', Y40: 'IN 40 YEARS' },
      poles: {
        FREEDOM: { label: 'FREEDOM', meaning: 'new things, your own way, no script' },
        ANCHOR: { label: 'ANCHOR', meaning: 'stability, predictability, clear rules' },
        WEIGHT: { label: 'WEIGHT', meaning: 'results, recognition, influence' },
        CARE: { label: 'CARE', meaning: 'being of use to people and the world beyond yourself' },
      },
      bridge: { label: 'BRIDGE', meaning: 'how much you-in-10-years feels like you' },
      situations: {
        NOW: [
          ['A free evening, everything already paid for. Where to?', 'Somewhere you have never been — it might be boring', 'A familiar ritual with trusted people — nothing new', 'A closed meetup with people who decide your growth — you have to be "on"', 'Helping a friend move house — your back will thank you later. Much later'],
          ['You are offered a new project. Your workload will grow.', 'I take it if I can do it my way, no approvals', 'I decline: what exists must keep running smoothly', 'I take it and ask for a title — otherwise why bother', 'I take it if it helps the team, even if not me'],
          ['Someone gives you a sum of money with one condition: spend it within a week.', 'A sudden trip, wherever the cheapest ticket goes', 'Pay off debts and top up the safety cushion', 'A course or a tool that speeds up my growth', 'A feast for people who are having a tough time'],
          ['You can take any course for free. Three months.', 'Something totally unlike my life: blacksmithing, Japanese, improv', 'Personal finance — to sleep better', 'Negotiation and leadership — to grow faster', 'First aid or psychology — to be more useful to my people'],
          ['A friend asks for an honest opinion on their business idea. It is weak.', 'I suggest flipping it completely — let\'s invent a stranger one', 'I gently suggest not quitting their stable job', 'I say it straight: this won\'t win — and show how to win', 'I first ask what they actually need — the idea is secondary'],
          ['You get one whole free day that nobody knows about.', 'Leave town in a random direction, no plan', 'Finally sort out the things that have been hanging for months', 'Quietly push my own project while nobody distracts me', 'Spend it with someone who is having a hard time'],
        ],
        D7: [
          ['In a week you could move to another city for six months. All paid. Decide now.', 'Going: new city, new version of me', 'Staying: everything that holds me is here', 'Going — only if it brings growth and connections', 'First I ask my people — they will live with it too'],
          ['For a week you receive anonymous notes with one word: "decide."', 'I do the thing I keep postponing — never mind who writes', 'I find out who is sending them before doing anything', 'I go for the most ambitious item on my list', 'I finally say something important to someone who needs to hear it'],
          ['The team needs someone to be the public face of the project for a week.', 'Yes — but in my own words, no press release', 'No — I\'d rather keep everything running backstage', 'Yes — my chance to be noticed', 'I suggest someone who needs it more for their growth'],
          ['Friends dare you: a week without a phone. Prize: dinner on them.', 'Yes — curious who I am without the feed', 'No — too much depends on me being reachable', 'Yes — and I will win, it is a matter of character', 'Yes, if we all do it together'],
          ['A neighbour starts fixing up the stairwell and needs weekend volunteers.', 'I\'m in if I can paint something strange on the wall', 'I chip in money, but my weekends are mine', 'I take over the organising — it will go better', 'I show up with tools, simply because it needs doing'],
          ['You can swap your job for a completely different one for a week.', 'The strangest one: lighthouse keeper, cheesemaker, stunt double', 'Something close to mine — so I don\'t lose my edge', 'Wherever they pay most and decide most', 'Where people are helped directly: doctor, teacher, rescuer'],
        ],
        Y1: [
          ['A year from now you get to choose:', 'A year\'s budget and full freedom for my strange experiment', 'A permanent contract with a clear salary and schedule', 'A role where I am the face of the project and I decide', 'Work that clearly helps people, even if it pays less'],
          ['You receive enough money to stop working for three years. First:', 'I build the thing I describe at every party', 'I invest it and keep working. Quietly', 'I start a business to multiply it tenfold', 'I gather my people and solve their problems'],
          ['In one year you can truly master one thing. Which?', 'A new language — and move away to practise it', 'Order in my money and my health', 'A skill that pays three times more', 'How to support people in their hardest moments'],
          ['An old friend invites you into a joint venture. Chaotic, but on fire.', 'I\'m in — chaos suits me', 'I\'m in only with a contract and a plan B', 'I\'m in if the decisions are mine', 'I\'m in because they need someone solid'],
          ['In a year you could live in any of four places:', 'A city where nobody knows me', 'My own home, right where I am now', 'The capital, where everything gets decided', 'Close to the people who can\'t manage without me'],
          ['You are offered a public blog for a year. Topic of your choice.', 'Experiments on my own life', 'No blog: private stays private', 'How to get what you want — to become the expert', 'People nobody notices'],
        ],
        Y10: [
          ['Ten years from now you are at a fork. Which life?', 'Start over in another country and profession', 'Strengthen what is already built', 'Reach the level where hundreds of people depend on me', 'Give most of my time to those who need help'],
          ['Something you made is suddenly used by a million people — not as intended.', 'I shut it down and start something smaller and stranger', 'I build protections so nothing breaks', 'I take the wheel and scale it', 'I find the people it truly helps and build for them'],
          ['You become known for one thing — not the one you wanted.', 'I quietly start over somewhere else', 'I accept it: a reputation is a foundation', 'I turn it into a brand', 'I teach others to do it better than me'],
          ['An offer: double everything — money, influence, workload. Answer by midnight.', 'No — freedom is worth more', 'No — I won\'t rock what works', 'Yes', 'I ask the people I love — it is their call'],
          ['In ten years you are offered a paid sabbatical year.', 'A year of travel with no route', 'A year for health, home and order', 'A year to write the book people will quote', 'A year of volunteering where it is hard'],
          ['You can pass one of your skills on to a hundred strangers.', 'Not being afraid to start from zero', 'Keeping a cool head in a crisis', 'Getting what you want', 'Listening'],
        ],
        Y40: [
          ['A child asks what you were actually doing all your life. One sentence.', '"Looking for the edge of the map."', '"Holding the line while everything changed."', '"Moving pieces nobody else could move."', '"Building a place where people could come."'],
          ['You may carve one sentence somewhere forever. Where and what?', 'On a bench at the edge of town: "You don\'t have to."', 'On a bridge: "It held."', 'On a tower: "Moved."', 'Above a kitchen door: "Everyone eats."'],
          ['You, 40 years older, send yourself one piece of advice on a sticky note.', '"Go further than seems reasonable."', '"Back it up."', '"Ask for more."', '"Call them. Today."'],
          ['In 40 years someone makes a short film about you. Its title:', '"The One Who Always Left in Time"', '"The One You Could Count On"', '"The One Who Changed the Rules"', '"The One Who Left No One Behind"'],
          ['At the end you can keep one object. Which?', 'An old one-way ticket', 'The key to the house where it all began', 'An award nobody expected you to win', 'A stack of letters that say "thank you"'],
          ['In 40 years you leave one line of advice on your grandchildren\'s fridge.', '"Don\'t live by someone else\'s plan."', '"Always keep a spare key."', '"Take more than you are offered."', '"Call each other more often."'],
        ],
      },
      reactions: {
        FREEDOM: ['Somewhere a door opens that was not there yesterday.', 'The world map quietly draws one more edge.', 'The script written for you loses a page.', 'For a second, the compass points at you.', 'SYSTEM LOG: route not approved. Proceeding anyway.', 'The wind changes direction. Coincidence?'],
        ANCHOR: ['Somewhere a lock clicks. Everything is in place.', 'The foundation gets a centimetre thicker.', 'Backup created. By whom — unknown.', 'Your tea stays warm suspiciously long.', 'SYSTEM LOG: risk declined.', 'In an archive, one more folder is neatly labelled.'],
        WEIGHT: ['Somewhere on the board, a piece moves.', 'The influence counter quietly ticks up.', 'Across town, someone says your name.', 'SYSTEM LOG: stakes raised.', 'The ladder grows one rung taller.', 'Lever found. Hand already on it.'],
        CARE: ['Somewhere someone feels a little lighter. They don\'t know why.', 'One more heart in the group chat.', 'A kettle in someone else\'s kitchen boils right on time.', 'SYSTEM LOG: nobody left behind.', 'Someone\'s heavy bag suddenly feels lighter.', 'A window lights up that you could knock on.'],
      },
      archetypes: {
        'FREEDOM|WEIGHT': { name: 'THE TRAILBLAZER', plus: 'starts what did not exist yet', shadow: 'leaves others to catch up' },
        'FREEDOM|CARE': { name: 'THE KIND REBEL', plus: 'breaks rules for people', shadow: 'burns out on everyone else\'s causes' },
        'ANCHOR|WEIGHT': { name: 'THE MASTER BUILDER', plus: 'builds what outlives fashion', shadow: 'mistakes control for care' },
        'ANCHOR|CARE': { name: 'THE LIGHTHOUSE', plus: 'people feel calm around them', shadow: 'holds on to what is time to let go' },
        'WEIGHT|FREEDOM': { name: 'THE MAVERICK', plus: 'turns risk into results', shadow: 'gets bored of everything that already works' },
        'WEIGHT|ANCHOR': { name: 'THE STRATEGIST', plus: 'sees the board ten moves ahead', shadow: 'won\'t move without guarantees' },
        'CARE|FREEDOM': { name: 'THE WANDERING HEALER', plus: 'appears where needed most', shadow: 'disappears when it gets crowded' },
        'CARE|ANCHOR': { name: 'THE GUARDIAN', plus: 'never leaves anyone behind', shadow: 'protects even from what would help them grow' },
      },
      tension: {
        O: { short: 'FREEDOM ↔ ANCHOR', text: 'You are pulled both toward the new and toward the reliable. Decisions get hard when freedom costs stability: moving, changing jobs, a big risk. That is not indecision — two real values are pulling in different directions.',
          quest: '7 days: every day, one small "new" inside safe limits (a new route, dish, conversation) — and one action that strengthens your foundation. On day 7, write down which gave you more energy.' },
        E: { short: 'WEIGHT ↔ CARE', text: 'Both achieving and caring matter to you. It gets hardest when success means leaving someone behind: missed evenings, tough calls. That is not weakness — two real values are pulling in different directions.',
          quest: '7 days: every morning pick one thing for your own growth and one for a specific person. In the evening, note which of the two stayed undone.' },
      },
      clearShort: (top, low) => 'clear priority: ' + top + ' (cost: ' + low + ')',
      clearText: (top, low, cost) => top + ' wins most of the time, almost without a fight. The price of that clarity is ' + low + ': ' + cost + '.',
      cost: { FREEDOM: 'new things may pass you by because "it\'s fine as it is"', ANCHOR: 'plans, savings and predictability can quietly sag', WEIGHT: 'your own goals and voice may wait in line forever', CARE: 'people near you may start to feel like resources' },
      questLow: {
        FREEDOM: '7 days: one small "first time" every day — a route, a dish, a person, a question. Write down what felt most alive.',
        ANCHOR: '7 days: pick one area where you lack an anchor (money, sleep, order) and do one boring 10-minute action in it every day.',
        WEIGHT: '7 days: 30 minutes a day on your own goal — before answering anyone else\'s requests.',
        CARE: '7 days: every day do one thing for one person with zero expected return. Write down how they reacted.',
      },
      mixed: { short: 'no clear leader', text: 'No single value wins: the votes split almost evenly. That can be flexibility — or decision fatigue. Look at your "definitely not" picks: they say more about you than the "I\'d choose" ones.',
        quest: '7 days: every evening write down one decision of the day and which value won it. On day 7, count who won most often.' },
      blind: {
        FREEDOM: 'Blind spot — FREEDOM. It can feel like there is no choice when there is one. Where are you living by someone else\'s script?',
        ANCHOR: 'Blind spot — ANCHOR. Without a plan B every storm becomes personal. What breaks first if tomorrow goes wrong?',
        WEIGHT: 'Blind spot — WEIGHT. Your ideas may stay invisible. Where do you stay silent when you should take the floor?',
        CARE: 'Blind spot — CARE. You can reach the goal alone. Who would notice if you needed help?',
      },
      bridgeText: [
        'Future you is still a stranger. That is a very common state. Try the conversation with your future self below.',
        'Future you is a distant relative: a familiar face, but you rarely meet. One letter to yourself in 10 years brings you closer.',
        'You and future you are almost the same person. In Hershfield\'s studies, people like this have more savings and patience for the long game. Make that version of you one promise this week.',
      ],
      bridgeQ: { prompt: 'How much does you-in-10-years feel like you?', low: '1 — two different people', high: '7 — the same person' },
      lifePaths: [null,
        { name: 'THE INITIATOR', plus: 'starts first', shadow: 'drops things halfway', q: 'What will you start without waiting for permission?' },
        { name: 'THE DIPLOMAT', plus: 'feels what others need', shadow: 'loses their own voice', q: 'Where do you agree when you want to object?' },
        { name: 'THE STORYTELLER', plus: 'turns life into a story', shadow: 'embellishes', q: 'Which story about yourself is due for a rewrite?' },
        { name: 'THE BUILDER', plus: 'finishes things', shadow: 'cannot rest', q: 'What are you building — and for whom?' },
        { name: 'THE WANDERER', plus: 'is not afraid of change', shadow: 'runs from boredom, not toward a goal', q: 'What are you really leaving behind?' },
        { name: 'THE HEARTH-KEEPER', plus: 'makes a home anywhere', shadow: 'takes on too much', q: 'Who takes care of you?' },
        { name: 'THE SEEKER', plus: 'sees deeper', shadow: 'escapes from life into their head', q: 'Which question are you afraid to ask out loud?' },
        { name: 'THE TYCOON', plus: 'turns effort into results', shadow: 'measures everything in money', q: 'What does wealth mean to you besides money?' },
        { name: 'THE SAGE', plus: 'sees the big picture', shadow: 'watches life from the outside', q: 'Where is it time to stop watching and step in?' },
      ],
      stages: [
        { max: 12, name: 'industry vs inferiority', q: 'What are you best at?' },
        { max: 18, name: 'identity vs role confusion', q: 'Who are you when nobody is watching?' },
        { max: 39, name: 'intimacy vs isolation', q: 'With whom — and for what?' },
        { max: 64, name: 'generativity vs stagnation', q: 'What will you leave to those who come after you?' },
        { max: 200, name: 'integrity vs despair', q: 'Which story of your life rings true?' },
      ],
      techMilestones: [[1957, 'the first satellite'], [1961, 'the first human in space'], [1969, 'the Moon landing'], [1971, 'the first email'], [1983, 'the first mobile phone on sale'], [1991, 'the World Wide Web'], [1998, 'Google'], [2001, 'Wikipedia'], [2005, 'YouTube'], [2007, 'the iPhone'], [2022, 'ChatGPT']],
      worldAtBirth: (pop, tech, yrs) => 'When you arrive, there are about ' + pop + ' billion people on Earth' + (tech ? ', and ' + tech + ' is still ' + yrs + ' year' + (yrs === 1 ? '' : 's') + ' away.' : '.'),
      places: ['OF UNFINISHED ROOMS', 'OF THE THURSDAY STREET', 'OF LOST AFTERNOONS', 'OF THE SECOND MOON', 'OF BORROWED WEATHER', 'OF SMALL APOCALYPSES', 'OF QUIET MACHINES', 'OF OPEN DOORS', 'OF THE LAST BUS', 'OF IMPOSSIBLE MAPS'],
      worldFacts: [
        'maps are updated by whoever walked there last', 'every city has one street that only exists on Thursdays',
        'people celebrate a second birthday: the day they changed their mind about something important', 'libraries lend out unused afternoons',
        'the moon drifts slightly closer to anyone who is lying', 'anyone may apprentice themselves to anyone else for one day',
        'silence is a currency, but only in small denominations', 'regret is reported as weather',
        'unfinished projects are legally considered pets', 'the post office delivers letters to every version of you that did not happen',
      ],
      prompts: {
        plan: r => 'I played BORN WEIRD, a values mirror game (a game — not a test or a prediction). My value order: ' + r.orderText + '. My main tension: ' + r.tension.short + '. My 7-day quest: ' + r.tension.quest +
          ' Turn it into a 7-day plan: one concrete 15–30 minute action per day with a clear "done" criterion. First ask me one question about my real situation, then give the plan.',
        future: r => 'Role-play: you are me, 10 years from now. Right now my connection with my future self is ' + r.bridge + ' out of 7. My values: ' + r.orderText + '; main tension: ' + r.tension.short +
          '. Talk to present-day me as that future self: short, warm, honest, no predictions — it is a game. Start with one question to me.',
        tension: r => 'In the game BORN WEIRD my main inner tension came out as: ' + r.tension.short + ' — "' + r.tension.text + '" It is a game, not a diagnosis. Help me see where this tension actually shows up in my decisions: ask me 3 short questions one at a time, then suggest one small experiment for this week.',
      },
      orderSep: ' > ',
      seed: {
        title: 'BORN WEIRD // REALITY SEED',
        disclaimer: '> A mirror of one set of choices on one day — not a psychometric test, not a diagnosis, not a prediction. Questions are inspired by Schwartz\'s theory of basic human values and Hershfield\'s research on future self-continuity; the wording is ours and not validated. The life path number is symbolic decoration.',
        h: { profile: 'VALUE PROFILE', tension: 'MAIN TENSION', blind: 'BLIND SPOT', bridge: 'BRIDGE TO FUTURE SELF', quest: '7-DAY QUEST', archetype: 'ARCHETYPE', lore: 'BIRTH SYMBOL (LORE)', choices: 'CHOICES', world: 'THE WORLD', ai: 'INSTRUCTIONS FOR AN AI' },
        lore: r => 'Life path ' + r.lifePath + ' — ' + r.lp.name + ': plus — ' + r.lp.plus + '; shadow — ' + r.lp.shadow + '. Question: ' + r.lp.q,
        best: 'chose', worst: 'rejected',
        ai: ['Treat this as a hypothesis about today\'s choices, not truth about me.', 'Help me test it against my real life, find where the main tension shows up, and turn the 7-day quest into concrete steps.', 'Begin by asking: **"Where did you recognise yourself — and where not at all?"**'],
        footer: v => 'BORN WEIRD v' + v + ' (dimacloud.github.io/born-weird). A simulator for lives you have not lived yet.',
      },
    },

    ru: {
      horizonLabels: { NOW: 'СЕЙЧАС', D7: 'ЧЕРЕЗ 7 ДНЕЙ', Y1: 'ЧЕРЕЗ ГОД', Y10: 'ЧЕРЕЗ 10 ЛЕТ', Y40: 'ЧЕРЕЗ 40 ЛЕТ' },
      poles: {
        FREEDOM: { label: 'СВОБОДА', meaning: 'хочется нового, своего, без сценария' },
        ANCHOR: { label: 'ОПОРА', meaning: 'хочется стабильности, предсказуемости, понятных правил' },
        WEIGHT: { label: 'ВЕС', meaning: 'хочется результата, признания, влияния' },
        CARE: { label: 'ЗАБОТА', meaning: 'хочется приносить пользу людям и миру за пределами себя' },
      },
      bridge: { label: 'МОСТ', meaning: 'насколько ты-через-10-лет ощущается как ты' },
      situations: {
        NOW: [
          ['Свободный вечер, всё уже оплачено. Куда?', 'Туда, где ещё не доводилось бывать, — вдруг окажется скучно', 'Привычный ритуал с проверенными людьми — ничего нового', 'Закрытая встреча с теми, от кого зависит рост, — придётся быть «в форме»', 'Помочь другу с переездом — спина спасибо не скажет'],
          ['Тебе предлагают новый проект. Нагрузка вырастет.', 'Беру, если можно сделать по-своему, без согласований', 'Отказываюсь: текущее должно работать без сбоев', 'Беру — но с громкой должностью, иначе зачем', 'Беру, если это поможет команде, пусть и не мне'],
          ['Тебе дарят сумму денег с одним условием: потратить её за неделю.', 'Внезапная поездка — куда угодно, куда дешевле билет', 'Закрыть долги и пополнить подушку', 'Курс или инструмент, который ускорит мой рост', 'Праздник для тех, кому сейчас туго'],
          ['Можно бесплатно пройти любой курс. Три месяца.', 'Что-то совсем не из моей жизни: кузнечное дело, японский, импровизация', 'Финансовую грамотность — чтобы спать спокойнее', 'Переговоры и лидерство — чтобы расти быстрее', 'Первую помощь или психологию — чтобы быть опорой для своих'],
          ['Друг просит честно оценить его бизнес-идею. Идея слабая.', 'Предлагаю перевернуть её целиком — придумаем что-то страннее', 'Мягко советую не бросать стабильную работу', 'Говорю прямо: так не выиграть — и показываю, как надо', 'Сначала спрашиваю, что ему на самом деле нужно: идея вторична'],
          ['У тебя появляется целый свободный день, о котором никто не знает.', 'Уехать куда глаза глядят, без плана', 'Наконец разобрать дела, которые висят месяцами', 'Тихо продвинуть свой проект, пока никто не отвлекает', 'Провести его с тем, кому сейчас тяжело'],
        ],
        D7: [
          ['Через неделю можно переехать в другой город на полгода. Всё оплачено. Решать сейчас.', 'Еду: новый город — новая версия меня', 'Остаюсь: здесь всё, что меня держит', 'Еду — но только если это даст рост и связи', 'Сначала спрашиваю своих — им с этим жить'],
          ['Неделю подряд приходят анонимные записки с одним словом: «решайся».', 'Делаю то, что давно откладываю, — неважно, кто пишет', 'Сначала выясняю, кто отправитель', 'Берусь за самое амбициозное из своего списка', 'Наконец говорю важное тому, кому давно пора было это сказать'],
          ['Команде нужен человек, который неделю будет публичным лицом проекта.', 'Соглашаюсь, но говорю своими словами, без пресс-релиза', 'Отказываюсь: лучше прослежу, чтобы за кулисами всё работало', 'Соглашаюсь — это шанс, что меня заметят', 'Предлагаю того, кому это нужнее для роста'],
          ['Друзья берут на слабо: неделя без телефона. Приз — ужин за их счёт.', 'Да — интересно, кто я без ленты', 'Нет — слишком многое держится на том, что я на связи', 'Да — и выиграю, это вопрос характера', 'Да — но только если все вместе'],
          ['Сосед затевает ремонт в подъезде и ищет добровольцев на выходные.', 'Иду, если можно расписать стену чем-то странным', 'Скидываюсь деньгами, но выходные — мои', 'Беру организацию на себя — так выйдет лучше', 'Прихожу с инструментами, просто потому что надо'],
          ['Можно на неделю поменять свою работу на совсем другую.', 'На самую странную: смотритель маяка, сыровар, каскадёр', 'На похожую — чтобы не потерять навык', 'Туда, где больше всего платят и где всё решается', 'Туда, где помогают напрямую: врач, учитель, спасатель'],
        ],
        Y1: [
          ['Через год тебе предлагают выбор:', 'Годовой бюджет и полная свобода на свой странный эксперимент', 'Бессрочный контракт с понятной зарплатой и графиком', 'Роль, где я — лицо проекта и последнее слово за мной', 'Работа, которая ощутимо помогает людям, пусть и скромнее'],
          ['Тебе достаётся сумма, с которой можно три года не работать. Первым делом:', 'Строю то, о чём рассказываю на каждой вечеринке', 'Инвестирую и продолжаю работать. Тихо', 'Запускаю бизнес, чтобы через три года их стало вдесятеро больше', 'Решаю проблемы близких — пусть и за свой счёт'],
          ['За год можно по-настоящему освоить одно. Что?', 'Новый язык — и уехать его практиковать', 'Порядок в деньгах и здоровье', 'Навык, за который платят втрое больше', 'Умение поддержать человека в самый тяжёлый момент'],
          ['Старый друг зовёт в общее дело: хаоса много, но глаза горят.', 'Иду — хаос мне по душе', 'Иду, только с договором и запасным планом', 'Иду, если решения будут за мной', 'Иду, потому что ему нужна опора'],
          ['Через год можно жить в любом из четырёх мест:', 'Город, где меня никто не знает', 'Свой дом там же, где сейчас', 'Столица, где всё решается', 'Рядом с теми, кто без меня не справится'],
          ['Тебе предлагают вести публичный блог целый год. Тема — любая.', 'Эксперименты над собственной жизнью', 'Никакого блога: личное остаётся личным', 'Как добиваться своего — чтобы стать экспертом', 'Люди, которых никто не замечает'],
        ],
        Y10: [
          ['Через 10 лет ты на развилке. Какую жизнь выбираешь?', 'Начать заново в другой стране и профессии', 'Укрепить то, что уже построено', 'Выйти на уровень, где от меня зависят сотни людей', 'Отдавать большую часть времени тем, кому нужна помощь'],
          ['Тем, что ты создаёшь, внезапно пользуется миллион человек — совсем не так, как задумано.', 'Закрываю и начинаю что-то поменьше и страннее', 'Строю защиту, чтобы ничего не сломалось', 'Беру штурвал и масштабирую', 'Ищу тех, кому это правда помогает, и делаю для них'],
          ['Тебя начинают узнавать по одной вещи — и совсем не по той, по которой хотелось.', 'Тихо начинаю заново в другом месте', 'Принимаю: репутация — это опора', 'Делаю из этого бренд', 'Учу других делать это лучше меня'],
          ['Предложение: всё удвоить — деньги, влияние, нагрузку. Ответ до полуночи.', 'Нет — свобода дороже', 'Нет — не буду раскачивать то, что работает', 'Да. Полночь можно не ждать', 'Спрашиваю тех, кого люблю, — решать им'],
          ['Через 10 лет тебе дают оплачиваемый год «творческого отпуска».', 'Год путешествий без маршрута', 'Год для здоровья, дома и порядка', 'Год на книгу, которую будут цитировать', 'Год волонтёрства там, где тяжело'],
          ['Можно передать одно своё умение сотне незнакомых людей.', 'Не бояться начинать с нуля', 'Не терять голову в кризис', 'Добиваться своего', 'Слушать'],
        ],
        Y40: [
          ['Ребёнок спрашивает: «А чем ты на самом деле занимаешься всю жизнь?» У тебя одно предложение.', '«Ищу край карты».', '«Держу оборону, пока всё вокруг меняется».', '«Сдвигаю то, что больше никому не сдвинуть».', '«Строю место, где людям есть куда прийти».'],
          ['Где-то можно навсегда высечь одну фразу. Где и какую?', 'На скамейке на краю города: «Не обязательно».', 'На мосту: «Выдержит».', 'На башне: «Сдвинуто».', 'Над дверью кухни: «Есть будут все».'],
          ['Ты, только на 40 лет старше, присылаешь себе один совет на стикере.', '«Иди дальше, чем кажется разумным».', '«Сделай резервную копию».', '«Проси больше».', '«Позвони им. Сегодня».'],
          ['Через 40 лет о тебе снимают короткий фильм. Как он называется?', '«Человек, который вовремя уходил»', '«Человек, на которого можно было положиться»', '«Человек, который менял правила»', '«Человек, который никого не бросил»'],
          ['В самом конце можно сохранить один предмет. Какой?', 'Старый билет в один конец', 'Ключ от дома, где всё началось', 'Награду, которой от меня никто не ждал', 'Пачку писем со словом «спасибо»'],
          ['Через 40 лет ты оставляешь внукам один совет на холодильнике.', '«Не живите по чужому плану».', '«Всегда держите запасной ключ».', '«Берите больше, чем предлагают».', '«Звоните друг другу чаще».'],
        ],
      },
      reactions: {
        FREEDOM: ['Где-то открывается дверь, которой вчера не было.', 'Карта мира тихо дорисовывает ещё один край.', 'Сценарий, написанный для тебя, теряет страницу.', 'На секунду компас указывает прямо на тебя.', 'СИСТЕМА: маршрут не согласован. Продолжаем.', 'Ветер меняет направление. Совпадение?'],
        ANCHOR: ['Где-то щёлкает замок. Всё на месте.', 'Фундамент становится на сантиметр толще.', 'Резервная копия создана. Кем — неизвестно.', 'Чай остаётся тёплым подозрительно долго.', 'СИСТЕМА: риск отклонён.', 'В архиве аккуратно подписывают ещё одну папку.'],
        WEIGHT: ['Где-то на доске двигается фигура.', 'Счётчик влияния тихо щёлкает вверх.', 'На другом конце города кто-то произносит твоё имя.', 'СИСТЕМА: ставка повышена.', 'Лестница становится на ступень выше.', 'Рычаг найден. Рука уже на нём.'],
        CARE: ['Где-то кому-то становится чуть легче. Он не знает почему.', 'В общем чате на одно сердечко больше.', 'Чайник на чужой кухне закипает вовремя.', 'СИСТЕМА: никто не брошен.', 'Чья-то тяжёлая сумка вдруг стала легче.', 'Где-то загорается окно, в которое можно постучать.'],
      },
      archetypes: {
        'FREEDOM|WEIGHT': { name: 'ПЕРВОПРОХОДЕЦ', plus: 'начинает то, чего ещё не было', shadow: 'оставляет других догонять' },
        'FREEDOM|CARE': { name: 'ДОБРЫЙ БУНТАРЬ', plus: 'нарушает правила ради людей', shadow: 'сгорает в чужих делах' },
        'ANCHOR|WEIGHT': { name: 'ЗОДЧИЙ', plus: 'строит то, что переживёт моду', shadow: 'путает контроль с заботой' },
        'ANCHOR|CARE': { name: 'МАЯК', plus: 'рядом с ним спокойно', shadow: 'держится за то, что пора отпустить' },
        'WEIGHT|FREEDOM': { name: 'АВАНТЮРИСТ', plus: 'превращает риск в результат', shadow: 'скучает от всего, что уже получилось' },
        'WEIGHT|ANCHOR': { name: 'СТРАТЕГ', plus: 'видит доску на десять ходов вперёд', shadow: 'не делает ход без гарантий' },
        'CARE|FREEDOM': { name: 'ВОЛЬНЫЙ ЛЕКАРЬ', plus: 'появляется там, где нужнее всего', shadow: 'исчезает, когда становится тесно' },
        'CARE|ANCHOR': { name: 'СТРАЖ', plus: 'никого не бросает', shadow: 'защищает даже от того, что помогло бы вырасти' },
      },
      tension: {
        O: { short: 'СВОБОДА ↔ ОПОРА', text: 'Тебя тянет и к новому, и к надёжному. Решения даются тяжело, когда за свободу платишь стабильностью: переезд, смена работы, большой риск. Это не нерешительность — две настоящие ценности тянут в разные стороны.',
          quest: '7 дней: каждый день одно маленькое «новое» внутри безопасных рамок (маршрут, блюдо, разговор) — и одно действие, которое укрепляет опору. На седьмой день запиши, что дало больше энергии.' },
        E: { short: 'ВЕС ↔ ЗАБОТА', text: 'Тебе важно и добиваться, и заботиться. Тяжелее всего, когда успех требует кого-то оставить позади: пропущенные вечера, жёсткие решения. Это не слабость — две настоящие ценности тянут в разные стороны.',
          quest: '7 дней: каждое утро выбирай одно дело для своего роста и одно — для конкретного человека. Вечером отмечай, какое из двух осталось несделанным.' },
      },
      clearShort: (top, low) => 'ясный приоритет — ' + top + ' (цена — ' + low + ')',
      clearText: (top, low, cost) => 'Чаще всего побеждает ' + top + ' — и почти без боя. Цена этой ясности — ' + low + ': ' + cost + '.',
      cost: { FREEDOM: 'новое может проходить мимо, потому что «и так нормально»', ANCHOR: 'планы, подушка и предсказуемость могут незаметно проседать', WEIGHT: 'свои цели и свой голос могут вечно ждать очереди', CARE: 'людям рядом может начать казаться, что они ресурс' },
      questLow: {
        FREEDOM: '7 дней: каждый день одно маленькое «впервые» — путь, блюдо, человек, вопрос. Записывай, что было самым живым.',
        ANCHOR: '7 дней: выбери одну область, где не хватает опоры (деньги, сон, порядок), и каждый день делай в ней одно скучное действие на 10 минут.',
        WEIGHT: '7 дней: 30 минут в день на свою цель — до того, как отвечать на чужие просьбы.',
        CARE: '7 дней: каждый день делай что-то для одного человека без расчёта на пользу. Записывай, как он реагирует.',
      },
      mixed: { short: 'без явного лидера', text: 'Ни одна ценность не побеждает: голоса делятся почти поровну. Это может быть гибкость — а может быть усталость от выбора. Посмотри на свои «точно нет»: они говорят о тебе больше, чем «выберу».',
        quest: '7 дней: каждый вечер записывай одно решение дня и какая ценность в нём победила. На седьмой день посчитай, кто выигрывал чаще.' },
      blind: {
        FREEDOM: 'Слепая зона — СВОБОДА. Может казаться, что выбора нет, хотя он есть. Где ты живёшь по чужому сценарию?',
        ANCHOR: 'Слепая зона — ОПОРА. Без запасного плана любая буря становится личной. Что сломается первым, если завтра всё пойдёт не так?',
        WEIGHT: 'Слепая зона — ВЕС. Твои идеи могут оставаться невидимыми. Где ты молчишь, хотя стоило бы взять слово?',
        CARE: 'Слепая зона — ЗАБОТА. До цели можно дойти в одиночестве. Кто заметит, если тебе понадобится помощь?',
      },
      bridgeText: [
        'Ты-через-10-лет — пока незнакомец. Так бывает очень часто. Попробуй разговор с собой из будущего — кнопка ниже.',
        'Ты-через-10-лет — как дальний родственник: лицо знакомое, но видитесь вы редко. Одно письмо себе через 10 лет заметно сближает.',
        'Ты сейчас и ты-через-10-лет — почти одно лицо. В исследованиях Хершфилда у таких людей больше сбережений и терпения в долгих делах. Дай этой версии себя одно обещание на этой неделе.',
      ],
      bridgeQ: { prompt: 'Насколько ты-через-10-лет ощущается как ты?', low: '1 — два разных человека', high: '7 — один и тот же человек' },
      lifePaths: [null,
        { name: 'ЗАЧИНЩИК', plus: 'начинает первым', shadow: 'бросает на середине', q: 'Что ты начнёшь, не дожидаясь разрешения?' },
        { name: 'ДИПЛОМАТ', plus: 'чувствует, что нужно другому', shadow: 'теряет свой голос', q: 'Где ты соглашаешься, хотя хочется возразить?' },
        { name: 'РАССКАЗЧИК', plus: 'превращает жизнь в историю', shadow: 'приукрашивает', q: 'Какую историю о себе пора переписать?' },
        { name: 'СТРОИТЕЛЬ', plus: 'доводит до конца', shadow: 'не умеет отдыхать', q: 'Что ты строишь — и для кого?' },
        { name: 'СТРАННИК', plus: 'не боится перемен', shadow: 'бежит от скуки, а не к цели', q: 'От чего ты на самом деле уходишь?' },
        { name: 'ХРАНИТЕЛЬ ОЧАГА', plus: 'создаёт дом где угодно', shadow: 'берёт на себя слишком много', q: 'Кто позаботится о тебе?' },
        { name: 'ИСКАТЕЛЬ', plus: 'видит глубже', shadow: 'уходит от жизни в голову', q: 'Какой вопрос ты боишься задать вслух?' },
        { name: 'МАГНАТ', plus: 'превращает усилие в результат', shadow: 'измеряет всё деньгами', q: 'Что для тебя богатство, кроме денег?' },
        { name: 'МУДРЕЦ', plus: 'видит большую картину', shadow: 'смотрит на жизнь со стороны', q: 'Где пора перестать наблюдать и вмешаться?' },
      ],
      stages: [
        { max: 12, name: 'трудолюбие ↔ неполноценность', q: 'Что у тебя получается лучше всего?' },
        { max: 18, name: 'идентичность ↔ смешение ролей', q: 'Кто ты, когда никто не смотрит?' },
        { max: 39, name: 'близость ↔ изоляция', q: 'С кем — и ради чего?' },
        { max: 64, name: 'продуктивность ↔ застой', q: 'Что ты оставишь тем, кто идёт следом?' },
        { max: 200, name: 'целостность ↔ отчаяние', q: 'Какая история твоей жизни звучит правдой?' },
      ],
      techMilestones: [[1957, 'первого спутника'], [1961, 'полёта Гагарина'], [1969, 'высадки на Луну'], [1971, 'первого электронного письма'], [1983, 'первого мобильного телефона в продаже'], [1991, 'Всемирной паутины'], [1998, 'Google'], [2001, 'Википедии'], [2005, 'YouTube'], [2007, 'iPhone'], [2022, 'ChatGPT']],
      worldAtBirth: (pop, tech, yrs) => 'Когда ты появляешься на свет, на Земле около ' + pop + ' млрд человек' + (tech ? ', а до ' + tech + ' ещё ' + yrs + ' ' + plural(yrs, ['год', 'года', 'лет']) + '.' : '.'),
      places: ['НЕДОСТРОЕННЫХ КОМНАТ', 'ЧЕТВЕРГОВОЙ УЛИЦЫ', 'ПОТЕРЯННЫХ ВЕЧЕРОВ', 'ВТОРОЙ ЛУНЫ', 'ОДОЛЖЕННОЙ ПОГОДЫ', 'МАЛЕНЬКИХ АПОКАЛИПСИСОВ', 'ТИХИХ МАШИН', 'ОТКРЫТЫХ ДВЕРЕЙ', 'ПОСЛЕДНЕГО АВТОБУСА', 'НЕВОЗМОЖНЫХ КАРТ'],
      worldFacts: [
        'карты обновляет тот, кто прошёл там последним', 'в каждом городе есть улица, которая существует только по четвергам',
        'люди празднуют второй день рождения — день, когда передумали насчёт чего-то важного', 'библиотеки выдают на время неиспользованные вечера',
        'луна слегка приближается к тем, кто врёт', 'к любому можно на один день пойти в ученики',
        'тишина — это валюта, но только мелкими купюрами', 'о сожалениях сообщают в прогнозе погоды',
        'недоделанные проекты по закону считаются домашними питомцами', 'почта доставляет письма всем версиям тебя, которые не случились',
      ],
      prompts: {
        plan: r => 'Я прохожу BORN WEIRD — игру-зеркало ценностей (это игра, не тест и не предсказание). Мой порядок ценностей: ' + r.orderText + '. Главное напряжение: ' + r.tension.short + '. Квест: ' + r.tension.quest +
          ' Преврати его в план на 7 дней: одно конкретное действие на 15–30 минут в день и понятный критерий «сделано». Сначала задай мне один вопрос о моей реальной ситуации, потом дай план. Отвечай по-русски.',
        future: r => 'Ролевая игра: ты — это я через 10 лет. Сейчас моя связь с будущим собой — ' + r.bridge + ' из 7. Мои ценности: ' + r.orderText + '; главное напряжение: ' + r.tension.short +
          '. Поговори с сегодняшней версией меня от лица меня-будущего: коротко, тепло, честно, без предсказаний — это игра. Начни с одного вопроса ко мне. Отвечай по-русски.',
        tension: r => 'В игре BORN WEIRD моё главное внутреннее напряжение вышло таким: ' + r.tension.short + ' — «' + r.tension.text + '» Это игра, не диагноз. Помоги увидеть, где это напряжение реально проявляется в моих решениях: задай 3 коротких вопроса по одному, потом предложи один маленький эксперимент на эту неделю. Отвечай по-русски.',
      },
      orderSep: ' > ',
      seed: {
        title: 'BORN WEIRD // ЗЕРНО РЕАЛЬНОСТИ (REALITY SEED)',
        disclaimer: '> Зеркало одного набора выборов в один день — не психометрический тест, не диагноз и не предсказание. Вопросы вдохновлены теорией базовых ценностей Шварца и исследованиями Хершфилда о связи с будущим собой; формулировки наши и не валидированы. Число пути — символическое украшение.',
        h: { profile: 'ПРОФИЛЬ ЦЕННОСТЕЙ (VALUE PROFILE)', tension: 'ГЛАВНОЕ НАПРЯЖЕНИЕ (MAIN TENSION)', blind: 'СЛЕПАЯ ЗОНА (BLIND SPOT)', bridge: 'МОСТ К БУДУЩЕМУ СЕБЕ (BRIDGE TO FUTURE SELF)', quest: 'КВЕСТ НА 7 ДНЕЙ (7-DAY QUEST)', archetype: 'АРХЕТИП (ARCHETYPE)', lore: 'СИМВОЛ РОЖДЕНИЯ — ЛОР (BIRTH SYMBOL)', choices: 'ВЫБОРЫ (CHOICES)', world: 'МИР (THE WORLD)', ai: 'ИНСТРУКЦИИ ДЛЯ ИИ (INSTRUCTIONS FOR AN AI)' },
        lore: r => 'Число пути ' + r.lifePath + ' — ' + r.lp.name + ': плюс — ' + r.lp.plus + '; тень — ' + r.lp.shadow + '. Вопрос: ' + r.lp.q,
        best: 'выбрано', worst: 'отвергнуто',
        ai: ['Относись к этому как к гипотезе о сегодняшних выборах, а не как к правде обо мне.', 'Помоги проверить её на моей реальной жизни, найти, где проявляется главное напряжение, и превратить квест на 7 дней в конкретные шаги.', 'Общайся со мной по-русски.', 'Начни с вопроса: **«Где ты себя узнал — а где совсем нет?»**'],
        footer: v => 'BORN WEIRD v' + v + ' (dimacloud.github.io/born-weird/ru). Симулятор жизней, которых у тебя ещё не было.',
      },
    },
  };
  // RU AI-seed opening question must stay gender-neutral:
  CONTENT.ru.seed.ai[3] = 'Начни с вопроса: **«Где в этом результате есть узнавание — а где совсем нет?»**';

  // Archetype × tension rarity = share of random play; generated by operations/rarity.mjs.
  const RARITY = {"ANCHOR|CARE|E":0.02235,"ANCHOR|CARE|O":0.06191,"ANCHOR|CARE|clear":0.028,"ANCHOR|CARE|mixed":0.01302,"ANCHOR|WEIGHT|E":0.02241,"ANCHOR|WEIGHT|O":0.06168,"ANCHOR|WEIGHT|clear":0.02782,"ANCHOR|WEIGHT|mixed":0.01307,"CARE|ANCHOR|E":0.06176,"CARE|ANCHOR|O":0.02288,"CARE|ANCHOR|clear":0.02811,"CARE|ANCHOR|mixed":0.01299,"CARE|FREEDOM|E":0.06136,"CARE|FREEDOM|O":0.02283,"CARE|FREEDOM|clear":0.02737,"CARE|FREEDOM|mixed":0.01283,"FREEDOM|CARE|E":0.0229,"FREEDOM|CARE|O":0.06042,"FREEDOM|CARE|clear":0.02758,"FREEDOM|CARE|mixed":0.01276,"FREEDOM|WEIGHT|E":0.02202,"FREEDOM|WEIGHT|O":0.06103,"FREEDOM|WEIGHT|clear":0.02825,"FREEDOM|WEIGHT|mixed":0.01332,"WEIGHT|ANCHOR|E":0.0615,"WEIGHT|ANCHOR|O":0.02227,"WEIGHT|ANCHOR|clear":0.02835,"WEIGHT|ANCHOR|mixed":0.01297,"WEIGHT|FREEDOM|E":0.06189,"WEIGHT|FREEDOM|O":0.02267,"WEIGHT|FREEDOM|clear":0.02853,"WEIGHT|FREEDOM|mixed":0.01312};

  const normLang = lang => (LANGS.indexOf(lang) >= 0 ? lang : 'en');
  const pack = lang => CONTENT[normLang(lang)];

  // ---------- birth date: real facts (private) + one symbol (shareable) ----------
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
  const ZODIAC_NAMES = { en: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
    ru: ['Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева', 'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'] };
  function zodiacOf(month, day) {
    const md = month * 100 + day; let best = 9, bestStart = -1;
    ZODIAC.forEach(([m, d], i) => { const s = m * 100 + d; if (s <= md && s > bestStart) { bestStart = s; best = i; } });
    return best;
  }
  const POP = [[1900, 1.6], [1930, 2.07], [1950, 2.5], [1960, 3.0], [1970, 3.7], [1980, 4.4], [1990, 5.3], [2000, 6.1], [2010, 6.9], [2020, 7.8], [2026, 8.2]];
  function populationAt(year) {
    for (let i = 1; i < POP.length; i++) if (year <= POP[i][0]) { const [y0, p0] = POP[i - 1], [y1, p1] = POP[i]; return p0 + (p1 - p0) * (year - y0) / (y1 - y0); }
    return POP[POP.length - 1][1];
  }
  const DAY = 86400000;
  const fmtDate = (ms, lang) => { const d = new Date(ms); const dd = String(d.getUTCDate()).padStart(2, '0'), mm = String(d.getUTCMonth() + 1).padStart(2, '0'); return lang === 'ru' ? dd + '.' + mm + '.' + d.getUTCFullYear() : d.getUTCFullYear() + '-' + mm + '-' + dd; };

  /** Everything the birth date gives. Shown to the user only — never part of shareable output (except lifePath). */
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
    // Next "fresh start" milestone: the next round thousand of days, or a billion-seconds mark if sooner.
    const cands = [{ day: (Math.floor(daysAlive / 1000) + 1) * 1000, kind: 'days' }];
    for (let k = 1; k <= 4; k++) { const day = Math.ceil(k * 1e9 / 86400); if (day > daysAlive) { cands.push({ day, kind: 'gsec', k }); break; } }
    const w100 = (Math.floor(daysAlive / 700) + 1) * 100; cands.push({ day: w100 * 7, kind: 'weeks', k: w100 });
    // next birthday (also a "fresh start" landmark in Dai, Milkman & Riis)
    let bd = Date.UTC(new Date(today).getUTCFullYear(), mo - 1, d);
    if (bd <= today) bd = Date.UTC(new Date(today).getUTCFullYear() + 1, mo - 1, d);
    cands.push({ day: Math.round((bd - date.getTime()) / DAY), kind: 'bday', k: age + 1 });
    const ms = cands.sort((a, b) => a.day - b.day)[0];
    const milestone = { day: ms.day, kind: ms.kind, k: ms.k || 0, inDays: ms.day - daysAlive, date: fmtDate(date.getTime() + ms.day * DAY, lang) };
    const stage = P.stages.find(s => age <= s.max);
    const tech = P.techMilestones.find(([ty]) => ty > y);
    const pop = populationAt(y);
    const popTxt = lang === 'ru' ? pop.toFixed(1).replace('.', ',') : pop.toFixed(1);
    return {
      daysAlive, weeksLived: Math.floor(daysAlive / 7), age,
      lifePath: lp.n, lifePathSteps: lp.steps, lp: P.lifePaths[lp.n],
      zodiac: ZODIAC_NAMES[lang][zodiacOf(mo, d)],
      stage: { name: stage.name, q: stage.q },
      world: P.worldAtBirth(popTxt, tech ? tech[1] : null, tech ? tech[0] - y : 0),
      milestone,
      retakeDate: fmtDate(today + 7 * DAY, lang),
    };
  }

  // ---------- runs ----------
  /**
   * Start a run. The seed comes from the per-run random salt only (never the date).
   * seen: situation ids from earlier runs in this browser (e.g. ['NOW3','Y1-0']) — preferred to be skipped, so repeats are rare.
   */
  function newRun(birthDateStr, salt, lang, now, seen) {
    lang = normLang(lang);
    const decoded = decodeBirth(birthDateStr, lang, now);
    if (salt == null) salt = Math.floor(Math.random() * 4294967296);
    const seed = hash('bornweird:seed:' + salt);
    return makeRun(seed, decoded.lifePath, lang, decoded, seen || []);
  }
  const sitId = (h, i) => h + i;
  function pickSits(seed, lifePath, seen) {
    const used = {}; const sits = [];
    PLAN.forEach((h, k) => {
      used[h] = used[h] || [];
      const r = rngFor(seed, 'pick' + k);
      // first item: the life path number picks the starting point ("your number picked this question"), rotating past seen ones
      const order = k === 0 ? [0, 1, 2, 3, 4, 5].map(j => (lifePath + j) % POOL_SIZE) : shuffled([0, 1, 2, 3, 4, 5], r);
      const fresh = order.filter(i => used[h].indexOf(i) < 0 && seen.indexOf(sitId(h, i)) < 0);
      const any = order.filter(i => used[h].indexOf(i) < 0);
      const i = (fresh.length ? fresh : any)[0];
      used[h].push(i); sits.push(i);
    });
    return sits;
  }
  function makeRun(seed, lifePath, lang, decoded, seen) {
    const sits = pickSits(seed, lifePath, seen || []);
    const orders = PLAN.map((h, k) => shuffled([0, 1, 2, 3], rngFor(seed, 'order' + k))); // display order of poles
    return { seed, lifePath, lang: normLang(lang), sits, orders, answers: [], bridge: null, decoded: decoded || null };
  }
  const sitIds = run => PLAN.map((h, k) => sitId(h, run.sits[k]));

  /** Item k as shown: options in display order (pole hidden from the UI text). */
  function item(run, k) {
    const P = pack(run.lang), h = PLAN[k], s = P.situations[h][run.sits[k]];
    return { index: k, total: PLAN.length, horizon: P.horizonLabels[h], prompt: s[0], options: run.orders[k].map(p => ({ text: s[1 + p], pole: POLES[p] })), byBirth: k === 0, bridgeNext: k === BRIDGE_AFTER };
  }

  /** Answer item k: best and worst are DISPLAY positions (0–3). Returns the weird reaction and the score changes. */
  function answer(run, k, bestPos, worstPos) {
    if (k !== run.answers.length) throw new Error('items must be answered in order');
    if (k > BRIDGE_AFTER && run.bridge == null) throw new Error('bridge question comes first');
    if (![bestPos, worstPos].every(v => Number.isInteger(v) && v >= 0 && v < 4) || bestPos === worstPos) throw new Error('invalid answer');
    const best = run.orders[k][bestPos], worst = run.orders[k][worstPos];
    run.answers.push([best, worst]);
    const P = pack(run.lang), r = rngFor(run.seed, 'react' + k + ':' + best);
    const pool = P.reactions[POLES[best]];
    return {
      reaction: pool[pickIdx(r, pool.length)],
      deltas: [{ pole: POLES[best], label: P.poles[POLES[best]].label, value: 1 }, { pole: POLES[worst], label: P.poles[POLES[worst]].label, value: -1 }],
    };
  }
  function setBridge(run, v) {
    if (!(Number.isInteger(v) && v >= 1 && v <= 7)) throw new Error('bridge must be 1–7');
    if (run.answers.length !== BRIDGE_AFTER + 1) throw new Error('bridge is asked after item ' + (BRIDGE_AFTER + 1));
    run.bridge = v;
  }

  // ---------- scoring ----------
  function score(run) {
    const best = [0, 0, 0, 0], worst = [0, 0, 0, 0];
    run.answers.forEach(([b, w]) => { best[b]++; worst[w]++; });
    const net = best.map((b, i) => b - worst[i]);
    const r = rngFor(run.seed, 'tie');
    const jitter = POLES.map(() => r() * 0.001);
    const rank = [0, 1, 2, 3].sort((a, b) => (net[b] - net[a]) || (worst[a] - worst[b]) || (jitter[b] - jitter[a]));
    // Tension: an axis where BOTH poles were chosen as "I'd choose" at least twice.
    // Otherwise a clear priority — only if one pole was chosen strictly more often than every other — else "mixed".
    const pull = { O: Math.min(best[0], best[1]), E: Math.min(best[2], best[3]) };
    const top = POLES[rank[0]];
    const maxBest = Math.max(...best), leaders = best.filter(b => b === maxBest).length;
    let tension;
    if (Math.max(pull.O, pull.E) >= 2) tension = pull.O === pull.E ? AXIS[top] : (pull.O > pull.E ? 'O' : 'E');
    else if (leaders === 1 && best[rank[0]] === maxBest) tension = 'clear';
    else tension = 'mixed';
    const otherAxis = AXIS[top] === 'O' ? [2, 3] : [0, 1];
    const second = POLES[otherAxis.slice().sort((a, b) => rank.indexOf(a) - rank.indexOf(b))[0]];
    const low = POLES[rank[3]];
    // Blind spot = the weakest pole, but never a pole of the tension axis (that axis is about pull, not neglect).
    let blind = low;
    if ((tension === 'O' || tension === 'E') && AXIS[low] === tension) {
      const other = tension === 'O' ? [2, 3] : [0, 1];
      blind = POLES[other.slice().sort((a, b) => rank.indexOf(b) - rank.indexOf(a))[0]];
    }
    return { best, worst, net, rank: rank.map(i => POLES[i]), top, second, low, blind, tension };
  }

  /** Final result. Shared outputs carry only: choices (best/worst poles), bridge, life path — no birth facts. */
  function finish(run) {
    if (run.answers.length !== PLAN.length || run.bridge == null) throw new Error('run not complete');
    const P = pack(run.lang);
    const sc = score(run);
    const arch = P.archetypes[sc.top + '|' + sc.second];
    const r = rngFor(run.seed, 'final:' + run.answers.map(a => a.join('')).join(','));
    const place = P.places[pickIdx(r, P.places.length)];
    const hex = () => Math.floor(r() * 0x10000).toString(16).toUpperCase().padStart(4, '0');
    const id = hex() + '-' + hex();
    const worldFact = P.worldFacts[pickIdx(rngFor(run.seed, 'world'), P.worldFacts.length)];
    const L = p => P.poles[p].label;
    let tension;
    if (sc.tension === 'clear') tension = { kind: 'clear', pole: sc.top, costPole: sc.blind, short: P.clearShort(L(sc.top), L(sc.blind)), text: P.clearText(L(sc.top), L(sc.blind), P.cost[sc.blind]), quest: P.questLow[sc.blind] };
    else if (sc.tension === 'mixed') tension = Object.assign({ kind: 'mixed' }, P.mixed);
    else tension = Object.assign({ kind: 'axis', axis: sc.tension }, P.tension[sc.tension]);
    const bars = sc.net.map(n => Math.max(0, Math.min(10, Math.round((n + 8) / 16 * 10))));
    const choices = run.answers.map(([b, w], k) => {
      const s = P.situations[PLAN[k]][run.sits[k]];
      return { horizon: P.horizonLabels[PLAN[k]], prompt: s[0], best: s[1 + b], worst: s[1 + w], bestPole: POLES[b] };
    });
    const tKey = sc.top + '|' + sc.second + '|' + (tension.kind === 'axis' ? tension.axis : tension.kind);
    const rare = RARITY[tKey];
    const res = {
      id, version: VERSION, lang: run.lang,
      archetype: arch.name, plus: arch.plus, shadow: arch.shadow,
      title: run.lang === 'ru' ? arch.name + ' ' + place : arch.name + ' ' + place,
      rank: sc.rank, top: sc.top, second: sc.second, low: sc.low,
      labels: Object.fromEntries(POLES.map(p => [p, P.poles[p].label])),
      meanings: Object.fromEntries(POLES.map(p => [p, P.poles[p].meaning])),
      profile: POLES.map((p, i) => ({ pole: p, label: P.poles[p].label, net: sc.net[i], best: sc.best[i], worst: sc.worst[i], bar: bars[i] })),
      orderText: sc.rank.map(p => P.poles[p].label).join(P.orderSep),
      tension, blind: P.blind[sc.blind], blindPole: sc.blind,
      bridge: run.bridge, bridgeLabel: P.bridge.label, bridgeText: P.bridgeText[run.bridge <= 2 ? 0 : run.bridge <= 5 ? 1 : 2],
      lifePath: run.lifePath, lp: P.lifePaths[run.lifePath],
      choices, earth: 'EARTH-' + String(1000 + (run.seed % 9000)), worldFact,
      protocol: ['LOST DOS GAME', 'CORRUPTED BROADCAST', 'FORBIDDEN CARTRIDGE'][run.seed % 3],
      artSeed: hash(run.seed + ':art:' + run.answers.join('|')) % 4294967296,
      rarity: rare ? Math.max(2, Math.round(1 / rare)) : null,
      rarityKey: tKey,
      sitIds: sitIds(run),
    };
    res.key = encodeKey(run);
    return res;
  }

  // ---------- player key (restores a result without the birth date) ----------
  // Bits: version 3 | seed 53 | lifePath 4 | sits 8×3 | answers 8×(2+2) | bridge 3 | check 12 = 131 → 30 base32 chars.
  const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const KEY_VERSION = 3;
  function keyFields(run) {
    return [[KEY_VERSION, 3], [run.seed, 53], [run.lifePath, 4]].concat(run.sits.map(v => [v, 3]), run.answers.flatMap(([b, w]) => [[b, 2], [w, 2]]), [[run.bridge, 3]]);
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
  function fromKey(key, lang) {
    const clean = String(key || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
    if (clean.length !== 30) return null;
    let n = 0n;
    for (const ch of clean) { const v = B32.indexOf(ch); if (v < 0) return null; n = (n << 5n) | BigInt(v); }
    const take = bits => { const v = Number(n & ((1n << BigInt(bits)) - 1n)); n >>= BigInt(bits); return v; };
    const check = take(12), bridge = take(3);
    const answers = PLAN.map(() => { const w = take(2), b = take(2); return [b, w]; }).reverse();
    const sits = PLAN.map(() => take(3)).reverse();
    const lifePath = take(4), seed = take(53), version = take(3);
    if (version !== KEY_VERSION || n !== 0n || lifePath < 1 || lifePath > 9 || bridge < 1 || bridge > 7) return null;
    if (sits.some(s => s >= POOL_SIZE) || answers.some(([b, w]) => b === w)) return null;
    if (sits.some((s, k) => sits.some((s2, k2) => k2 < k && PLAN[k2] === PLAN[k] && s2 === s))) return null; // no repeated situation in a horizon
    const run = makeRun(seed, lifePath, lang, null, []);
    run.sits = sits; run.answers = answers; run.bridge = bridge;
    if (checksum(keyFields(run)) !== check) return null;
    return finish(run);
  }

  /** Convenience for tests/tools: answers = [[bestPos, worstPos] ×8] in display positions. */
  function simulate(birthDateStr, answers, opts) {
    opts = opts || {};
    const run = newRun(birthDateStr, opts.salt, opts.lang, opts.now, opts.seen);
    answers.forEach(([b, w], k) => { answer(run, k, b, w); if (k === BRIDGE_AFTER) setBridge(run, opts.bridge || 4); });
    return finish(run);
  }

  function aiPrompts(res) { const Pr = pack(res.lang).prompts; return { plan: Pr.plan(res), future: Pr.future(res), tension: Pr.tension(res) }; }

  function realitySeedMarkdown(res) {
    const S = pack(res.lang).seed, H = S.h, L = [];
    const sec = (h, lines) => { L.push('## ' + h); [].concat(lines).forEach(l => L.push(l)); L.push(''); };
    L.push('# ' + S.title); L.push(''); L.push(S.disclaimer); L.push('');
    sec(H.archetype, [res.title + ' — #' + res.id, '+ ' + res.plus, '− ' + res.shadow]);
    sec(H.profile, [res.orderText].concat(res.profile.map(p => '- ' + p.label + ' (' + res.meanings[p.pole] + '): ' + p.bar + '/10')));
    sec(H.tension, ['**' + res.tension.short + '**', res.tension.text]);
    sec(H.blind, res.blind);
    sec(H.bridge, [res.bridgeLabel + ': ' + res.bridge + '/7', res.bridgeText]);
    sec(H.quest, res.tension.quest);
    sec(H.lore, S.lore(res));
    sec(H.choices, res.choices.map(c => '- **' + c.horizon + '** — ' + c.prompt + ' → ✓ ' + c.best + ' · ✗ ' + c.worst));
    sec(H.world, res.earth + ': ' + res.worldFact + '.');
    sec(H.ai, S.ai);
    L.push('---'); L.push(S.footer(res.version));
    return L.join('\n');
  }

  const api = {
    VERSION, POLES, OPPOSITE, AXIS, LANGS, HORIZONS, PLAN, BRIDGE_AFTER, POOL_SIZE, CONTENT, RARITY,
    hash, rng, plural, parseBirthDate, lifePathOf, zodiacOf, decodeBirth,
    newRun, item, answer, setBridge, score, finish, encodeKey, fromKey, simulate, aiPrompts, realitySeedMarkdown,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BW = api;
})(typeof window !== 'undefined' ? window : globalThis);
