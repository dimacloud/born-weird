/* BORN WEIRD — engine v0.2
 * Deterministic life-simulation generator. Pure functions, no I/O.
 * Birth creates the seed. Choices create the timeline.
 * Content lives in language packs (en, ru) with identical shapes, so the same
 * date + choices + salt yields the same reality (id, scores, art) in every language.
 * Works in the browser (window.BW) and in Node (module.exports).
 */
(function (root) {
  'use strict';

  const DIMS = ['AUTONOMY', 'SECURITY', 'CURIOSITY', 'CREATION', 'CONNECTION', 'POWER'];
  const LANGS = ['en', 'ru'];

  // Choices weigh more as the simulation moves forward (Genesis §6).
  const STAGE_WEIGHT = [1, 1.2, 1.5, 1.8, 2.2];
  const BIRTH_BIAS = 0.75;

  // Language-neutral structure: time offsets and dimension weights per option.
  const STAGE_META = [
    { offsetYears: 0, options: [{ CURIOSITY: 2, CONNECTION: 1 }, { AUTONOMY: 2, CREATION: 1 }, { SECURITY: 2 }] },
    { offsetYears: 0, options: [{ CONNECTION: 2, CREATION: 1 }, { CURIOSITY: 2, AUTONOMY: 1 }, { POWER: 2, SECURITY: 1 }] },
    { offsetYears: 1, options: [{ CREATION: 3 }, { AUTONOMY: 2, CURIOSITY: 1 }, { SECURITY: 2, POWER: 1 }, { CONNECTION: 3 }] },
    { offsetYears: 10, options: [{ POWER: 3 }, { AUTONOMY: 2, CREATION: 1 }, { CONNECTION: 2, CURIOSITY: 2 }, { SECURITY: 2, CONNECTION: 1 }] },
    { offsetYears: 40, options: [{ CURIOSITY: 3 }, { CONNECTION: 3 }, { AUTONOMY: 3 }, { CREATION: 3 }, { SECURITY: 3 }, { POWER: 3 }] },
  ];
  const WEEKDAY_DIM = ['CONNECTION', 'SECURITY', 'POWER', 'CURIOSITY', 'CREATION', 'AUTONOMY', 'CURIOSITY'];
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
  const CONTENT = {
    en: {
      weekdays: [
        { day: 'Sunday', sign: 'THE LONG TABLE' }, { day: 'Monday', sign: 'THE LOCKED GARDEN' },
        { day: 'Tuesday', sign: 'THE LEVER' }, { day: 'Wednesday', sign: 'THE UNMARKED DOOR' },
        { day: 'Thursday', sign: 'THE UNFINISHED MACHINE' }, { day: 'Friday', sign: 'THE ONE-WAY TICKET' },
        { day: 'Saturday', sign: 'THE FAR SIGNAL' },
      ],
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
        'the post office delivers letters to people you might have become',
      ],
      stages: [
        {
          label: 'NOW',
          prompt: 'A notification arrives from your own number. It is timestamped ten years from today. It says only: “don\'t.”',
          options: [
            { text: 'Reply: “don\'t WHAT?”',
              outcome: 'You reply. Three dots appear for {n} hours. Then: “{msg}”. You screenshot it. Nobody believes you.',
              vars: { n: [2, 9], msg: ['the blue one', 'you already know', 'fine. do it. but bring a jacket', 'wrong timeline, sorry', 'not the email. the other thing', 'ask the person you thought of just now'] } },
            { text: 'Do the thing you were about to do anyway',
              outcome: 'You do it anyway. {c}. The notification quietly deletes itself.',
              vars: { c: ['Nothing explodes', 'A small door opens somewhere in your calendar', 'Your phone battery gains four percent', 'A stranger nods at you like they were expecting this'] } },
            { text: 'Cancel everything and stay home',
              outcome: 'You stay in. {t}, you hear {s} outside. Whatever it was, it happened without you — and you are fine with that.',
              vars: { t: ['At 3:14 am', 'At 11:11 pm', 'At exactly noon', 'At 4:44 pm'], s: ['applause', 'a brass band warming up', 'someone calling a name that is almost yours', 'a very confident goose'] } },
          ],
        },
        {
          label: '7 DAYS',
          prompt: 'A stranger hands you a brass key with a paper tag: “you\'ll know.” It fits three doors in your city.',
          options: [
            { text: 'The door with music behind it',
              outcome: 'Behind the door: {room}. Someone hands you an instrument you cannot play. You play it anyway. You are invited back.',
              vars: { room: ['a rehearsal for a band with no name', 'a wedding between two people who met yesterday', 'a choir that only sings in the key of “almost”', 'a party for a holiday no calendar has heard of'] } },
            { text: 'The door marked NO ENTRY',
              outcome: 'Behind it: {secret}. You take one photo. Later, the photo shows something different.',
              vars: { secret: ['a staircase that goes sideways', 'an office where someone has been waiting for you specifically', 'a garden growing under fluorescent light', 'a map of the city with your route already drawn on it'] } },
            { text: 'Copy the key. Sell access.',
              outcome: 'By Sunday you have sold {k} copies. A woman in a grey coat offers to buy the original. You say: not yet.',
              vars: { k: [7, 40] } },
          ],
        },
        {
          label: '1 YEAR',
          prompt: 'You receive enough money to stop working for three years. What happens first?',
          options: [
            { text: 'I finally build the thing I describe at parties',
              outcome: 'Month {m}: the first version is ugly and alive. {k} people use it. One of them writes: “{q}”',
              vars: { m: [2, 7], k: [12, 300], q: ['this is weird. I need it.', 'who made this and why does it understand me', 'please do not fix the bug. the bug is the best part'] } },
            { text: 'One-way ticket. Phone off.',
              outcome: 'You land in {p}. You stop checking the date. You learn the word for “{w}” in a language with {k} speakers.',
              vars: { p: ['a port town with no tourist information', 'a city where the buses run on gossip', 'a mountain village with excellent wifi and no reason to use it'], w: ['the hour after a decision', 'a friend you have not met yet', 'homesick for a place that does not exist'], k: [300, 9000] } },
            { text: 'Invest it. Keep working. Quietly.',
              outcome: 'Nobody notices anything. That is the point. By winter, {r}.',
              vars: { r: ['your money has quietly started making more money', 'you own a small slice of something that is about to matter', 'you can say no to anything — and you start saying it'] } },
            { text: 'Gather the people I like in one place. Indefinitely.',
              outcome: 'You rent {v}. Within a month it has a name someone else chose. People start arriving whom nobody invited.',
              vars: { v: ['an old print shop', 'a flat above a bakery', 'a disused planetarium', 'half a boat'] } },
          ],
        },
        {
          label: '10 YEARS',
          prompt: 'Something you made is suddenly used by a million people — in a way you never intended.',
          options: [
            { text: 'Lean in. Steer it.',
              outcome: 'You stop sleeping well and start winning. By the end of the year {h}.',
              vars: { h: ['there is a documentary about you, and you hate your haircut in it', 'a government quotes you without understanding you', 'three copycats exist and one of them is better'] } },
            { text: 'Shut it down. It is not mine anymore.',
              outcome: 'You pull the plug. The internet is furious for {k} days. You start something smaller, stranger and entirely yours.',
              vars: { k: [3, 19] } },
            { text: 'Find the strangest user and meet them',
              outcome: 'The strangest user is {u}. You meet in a café and talk for {k} hours. Your next decade quietly rearranges itself.',
              vars: { u: ['a retired lighthouse keeper using it to talk to ships', 'a fourteen-year-old running a very small nation on it', 'a monastery using it to schedule silence'], k: [3, 11] } },
            { text: 'Protect the people already using it',
              outcome: 'You build walls, then doors in the walls. It grows slower and lasts longer. {k} years later, people still thank you in strange places.',
              vars: { k: [4, 12] } },
          ],
        },
        {
          label: '40 YEARS',
          prompt: 'A child asks what you were actually doing all those years. You get one sentence.',
          options: [
            '“Looking for the edge of the map.”',
            '“Building a place where people belonged.”',
            '“Making sure nobody could tell me what to do.”',
            '“Making things that did not exist yet.”',
            '“Holding the line while everything changed.”',
            '“Moving the pieces nobody else could move.”',
          ].map(text => ({
            text,
            outcome: 'Year {Y}. The child thinks about it, then says: “{reply}” You laugh harder than you have in a decade.',
            vars: { reply: ['That is not a job.', 'Can I do that too?', 'So you were weird on purpose.', 'You should write that down.', 'Did it work?'] },
          })),
        },
      ],
      dims: {
        AUTONOMY: {
          label: 'AUTONOMY', nouns: ['RUNAWAY', 'FREE AGENT', 'NOMAD'], adjs: ['UNSUPERVISED', 'UNLICENSED'],
          future: 'You built a life with very few bosses and a lot of exits.',
          kept: 'your own terms over anyone else\'s plan — the exit nobody else noticed',
          rejected: 'permission',
          project: 'A one-person operation that needs nobody\'s approval to exist: a micro-studio, a tiny product, a newsletter with an indefensible premise.',
          experiment: 'For 7 days, spend one hour a day on something no one asked you to do. Publish it on day 7, however small.',
          question: 'What would you do this year if nobody could see it?',
        },
        SECURITY: {
          label: 'SECURITY', nouns: ['KEEPER', 'ARCHIVIST', 'LIGHTHOUSE KEEPER'], adjs: ['FORTIFIED', 'PATIENT'],
          future: 'People ran toward you when things broke, because you had already prepared for it.',
          kept: 'the solid floor — the option that still works when everything else fails',
          rejected: 'unnecessary risk',
          project: 'A system that makes you and the people around you calmer: a savings engine, a tool, a ritual that holds when things break.',
          experiment: 'Write down the three things that would hurt most if they disappeared. Build one small backup for one of them this week.',
          question: 'Which of your safety nets is actually a cage?',
        },
        CURIOSITY: {
          label: 'CURIOSITY', nouns: ['CARTOGRAPHER', 'INVESTIGATOR', 'SIGNAL HUNTER'], adjs: ['RESTLESS', 'UNMAPPED'],
          future: 'You followed questions further than was reasonable, and some of them followed you back.',
          kept: 'the unmarked door — the question over the answer',
          rejected: 'the obvious explanation',
          project: 'An obsessive public investigation into one question nobody is paid to answer.',
          experiment: 'Pick one question you cannot stop thinking about. Ask 5 people who would know. Write down what surprised you.',
          question: 'Which question have you been circling for years without asking out loud?',
        },
        CREATION: {
          label: 'CREATION', nouns: ['INVENTOR', 'ARCHITECT', 'MACHINIST'], adjs: ['HANDMADE', 'UNFINISHED'],
          future: 'You left a trail of objects, tools and strange machines that outlived their reasons.',
          kept: 'making the thing instead of talking about the thing',
          rejected: 'finished, polished, safe',
          project: 'The thing you keep describing at parties — built as an ugly, working first version.',
          experiment: 'Make the ugliest possible version of your idea in 3 hours. Show it to one person. Write down their first question.',
          question: 'What have you already designed in your head that deserves a bad first draft?',
        },
        CONNECTION: {
          label: 'CONNECTION', nouns: ['HOST', 'MATCHMAKER', 'CHOIR LEADER'], adjs: ['GENEROUS', 'CROWDED'],
          future: 'Wherever you went, rooms filled up — with people who otherwise would never have met.',
          kept: 'people, rooms and the conversations between them',
          rejected: 'going it alone',
          project: 'A recurring room — a dinner, a club, a chat — around one strange shared obsession.',
          experiment: 'Invite 3 people who do not know each other into one conversation about a question you care about. Listen more than you talk.',
          question: 'Who are two people you know who should have met years ago?',
        },
        POWER: {
          label: 'POWER', nouns: ['OPERATOR', 'STRATEGIST', 'KINGMAKER'], adjs: ['LEVERAGED', 'INEVITABLE'],
          future: 'You learned where the levers were, and you were not shy about pulling them.',
          kept: 'leverage — the small move that shifts the big outcome',
          rejected: 'staying small for comfort',
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
      branchQuestion: label => 'What would the version of you who chose differently at “' + label + '” say about this life?',
      alreadyTrue: 'Which part of this timeline is already true?',
      seed: {
        disclaimer: '> This file describes an explored possibility, not objective truth. It was generated by a playful simulator from a random seed and five choices. Nothing here is a prediction.',
        h: { timeline: 'TIMELINE', birth: 'BIRTH SEED', world: 'THE WORLD', future: 'THE POSSIBLE FUTURE', choices: 'CHOICES THAT CREATED IT',
          kept: 'WHAT I KEPT CHOOSING', rejected: 'WHAT I KEPT REJECTING', events: 'IMPORTANT EVENTS', project: 'POSSIBLE PROJECT',
          experiment: 'FIRST EXPERIMENT', visual: 'VISUAL LANGUAGE', questions: 'OPEN QUESTIONS', ai: 'INSTRUCTIONS FOR AN AI' },
        birth: b => 'Born on a ' + b.weekday + ', under the symbolic sign of ' + b.sign + '. At that moment, ' + b.anomaly + '. (Narrative device only.)',
        world: (earth, fact) => earth + ': a world where ' + fact + '.',
        visual: p => 'Protocol: ' + p + '. Low-resolution pixel landscapes, VGA palette, scanlines, an interface from a reality that never existed.',
        ai: [
          'Treat this future as a hypothesis, not truth about me.',
          'Help me explore it, challenge it, visualize it and turn interesting parts into experiments.',
          'You may: continue the timeline, generate alternate branches, write from my future perspective, identify hidden assumptions, or turn the First Experiment into a concrete 7-day plan.',
          'Begin by asking: **"What do you want to do with this reality?"**',
        ],
        footer: (v, url) => 'Generated by BORN WEIRD v' + v + (url ? ' — ' + url : '') + '. A simulator for lives you have not lived yet.',
      },
    },

    ru: {
      weekdays: [
        { day: 'воскресенье', nom: 'ВОСКРЕСЕНЬЕ', sign: 'ДЛИННОГО СТОЛА' }, { day: 'понедельник', nom: 'ПОНЕДЕЛЬНИК', sign: 'ЗАПЕРТОГО САДА' },
        { day: 'вторник', nom: 'ВТОРНИК', sign: 'РЫЧАГА' }, { day: 'среду', nom: 'СРЕДА', sign: 'БЕЗЫМЯННОЙ ДВЕРИ' },
        { day: 'четверг', nom: 'ЧЕТВЕРГ', sign: 'НЕДОСТРОЕННОЙ МАШИНЫ' }, { day: 'пятницу', nom: 'ПЯТНИЦА', sign: 'БИЛЕТА В ОДИН КОНЕЦ' },
        { day: 'субботу', nom: 'СУББОТА', sign: 'ДАЛЁКОГО СИГНАЛА' },
      ],
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
        {
          label: 'СЕЙЧАС',
          prompt: 'Приходит сообщение с твоего же номера. Дата отправки — через десять лет. В нём одно слово: «не надо».',
          options: [
            { text: 'Ответить: «что НЕ НАДО?»',
              outcome: 'Ты отвечаешь. Три точки мигают {n} {n|час|часа|часов}. Потом: «{msg}». Ты делаешь скриншот. Никто не верит.',
              vars: { n: [2, 9], msg: ['синюю', 'ты и так знаешь', 'ладно. делай. но возьми куртку', 'ой, не та реальность', 'не письмо. другое', 'спроси человека, который только что пришёл тебе в голову'] } },
            { text: 'Всё равно сделать задуманное',
              outcome: 'Ты всё равно это делаешь. {c}. Сообщение тихо удаляет само себя.',
              vars: { c: ['Ничего не взрывается', 'Где-то в твоём календаре открывается маленькая дверь', 'Батарея телефона прибавляет четыре процента', 'Незнакомец кивает тебе так, будто ждал именно этого'] } },
            { text: 'Отменить всё и остаться дома',
              outcome: 'Ты остаёшься дома. {t} за окном раздаётся {s}. Что бы это ни было, оно происходит без тебя — и тебя это устраивает.',
              vars: { t: ['В 3:14 ночи', 'В 23:11', 'Ровно в полдень', 'В 16:44'], s: ['гром аплодисментов', 'звук разыгрывающегося духового оркестра', 'голос, зовущий имя, почти похожее на твоё', 'гогот очень уверенного в себе гуся'] } },
          ],
        },
        {
          label: '7 ДНЕЙ',
          prompt: 'Незнакомец вкладывает тебе в руку латунный ключ с бумажной биркой: «ты поймёшь». Ключ подходит к трём дверям в твоём городе.',
          options: [
            { text: 'Дверь, за которой играет музыка',
              outcome: 'За дверью — {room}. Тебе вручают инструмент, на котором ты не умеешь играть. Ты всё равно играешь. Тебя приглашают ещё.',
              vars: { room: ['репетиция группы без названия', 'свадьба двух людей, познакомившихся вчера', 'хор, который поёт только в тональности «почти»', 'вечеринка в честь праздника, которого нет ни в одном календаре'] } },
            { text: 'Дверь с табличкой «ВХОДА НЕТ»',
              outcome: 'За ней — {secret}. Ты делаешь одну фотографию. Позже на снимке оказывается что-то другое.',
              vars: { secret: ['лестница, ведущая вбок', 'кабинет, где кто-то ждёт именно тебя', 'сад, растущий под лампами дневного света', 'карта города, на которой уже нарисован твой маршрут'] } },
            { text: 'Сделать копию ключа. Продавать доступ.',
              outcome: 'К воскресенью продано {k} {k|копия|копии|копий}. Женщина в сером пальто предлагает купить оригинал. Ты отвечаешь: пока нет.',
              vars: { k: [7, 40] } },
          ],
        },
        {
          label: '1 ГОД',
          prompt: 'Тебе достаются деньги, на которые можно не работать три года. Что происходит первым делом?',
          options: [
            { text: 'Наконец строю то, о чём рассказываю всем на вечеринках',
              outcome: 'Месяц {m}-й: первая версия уродлива, но жива. Ей пользуются {k} {k|человек|человека|человек}. Один пишет: «{q}».',
              vars: { m: [2, 7], k: [12, 300], q: ['это странно. мне это нужно', 'кто это сделал и почему оно меня понимает', 'пожалуйста, не чините баг. баг — лучшее, что тут есть'] } },
            { text: 'Билет в один конец. Телефон выключен.',
              outcome: 'Ты оказываешься в {p}. Перестаёшь следить за датой. Учишь слово, означающее «{w}», на языке, на котором говорят {k} {k|человек|человека|человек}.',
              vars: { p: ['портовом городке без туристического центра', 'городе, где автобусы ходят на сплетнях', 'горной деревне с отличным вайфаем и без единой причины им пользоваться'], w: ['час после принятого решения', 'друг, с которым вы ещё не знакомы', 'тоска по месту, которого не существует'], k: [300, 9000] } },
            { text: 'Инвестирую. Продолжаю работать. Тихо.',
              outcome: 'Никто ничего не замечает. В этом и смысл. К зиме {r}.',
              vars: { r: ['твои деньги тихо начинают зарабатывать новые деньги', 'у тебя есть маленький кусочек того, что вот-вот станет важным', 'ты можешь сказать «нет» чему угодно — и начинаешь говорить'] } },
            { text: 'Собираю всех, кто мне нравится, в одном месте. Бессрочно.',
              outcome: 'Ты снимаешь {v}. Через месяц у места появляется название, которое выбрал кто-то другой. Начинают приходить люди, которых никто не звал.',
              vars: { v: ['старую типографию', 'квартиру над пекарней', 'заброшенный планетарий', 'половину лодки'] } },
          ],
        },
        {
          label: '10 ЛЕТ',
          prompt: 'Тем, что ты создаёшь, внезапно пользуется миллион человек — и совсем не так, как было задумано.',
          options: [
            { text: 'Сесть за руль. Рулить.',
              outcome: 'Ты перестаёшь нормально спать и начинаешь выигрывать. К концу года {h}.',
              vars: { h: ['про тебя снимают документальный фильм, и в нём у тебя ужасная причёска', 'правительство цитирует тебя, ничего не понимая', 'появляются три клона, и один из них лучше'] } },
            { text: 'Закрыть. Это уже не моё.',
              outcome: 'Ты выдёргиваешь вилку из розетки. Интернет злится {k} {k|день|дня|дней}. Ты начинаешь что-то поменьше, постраннее и целиком своё.',
              vars: { k: [3, 19] } },
            { text: 'Найти самого странного пользователя и встретиться',
              outcome: 'Самый странный пользователь — {u}. Вы встречаетесь в кафе и говорите {k} {k|час|часа|часов}. Следующее десятилетие тихо перестраивается.',
              vars: { u: ['отставной смотритель маяка, который с его помощью разговаривает с кораблями', 'четырнадцатилетний подросток, который управляет через него очень маленькой страной', 'монастырь, который планирует в нём тишину'], k: [3, 11] } },
            { text: 'Защитить тех, кто уже пользуется',
              outcome: 'Ты строишь стены, а потом двери в стенах. Всё растёт медленнее, зато надолго. Через {k} {k|год|года|лет} тебя всё ещё благодарят в самых странных местах.',
              vars: { k: [4, 12] } },
          ],
        },
        {
          label: '40 ЛЕТ',
          prompt: 'Ребёнок спрашивает: «А что ты на самом деле делаешь всю жизнь?» У тебя одно предложение.',
          options: [
            '«Ищу край карты».',
            '«Строю место, где людям есть куда прийти».',
            '«Слежу, чтобы никто не указывал мне, что делать».',
            '«Делаю вещи, которых ещё не было».',
            '«Держу оборону, пока всё вокруг меняется».',
            '«Двигаю фигуры, которые больше никто не может сдвинуть».',
          ].map(text => ({
            text,
            outcome: '{Y} год. Ребёнок думает и выдаёт: «{reply}» — и тебе так смешно, как не было уже лет десять.',
            vars: { reply: ['Это же не работа', 'А мне так можно?', 'То есть вся эта странность — нарочно?', 'Это надо записать', 'И как, получилось?'] },
          })),
        },
      ],
      dims: {
        AUTONOMY: {
          label: 'АВТОНОМИЯ', nouns: ['БЕГЛЕЦ', 'ВОЛЬНЫЙ АГЕНТ', 'КОЧЕВНИК'], adjs: ['БЕСПРИЗОРНЫЙ', 'НЕЛИЦЕНЗИРОВАННЫЙ'],
          future: 'Это жизнь, где мало начальников и много запасных выходов.',
          kept: 'свои правила вместо чужого плана: запасной выход, которого больше никто не заметил',
          rejected: 'разрешение',
          project: 'Дело на одного человека, которому не нужно ничьё одобрение: микростудия, крошечный продукт, рассылка с безумной идеей.',
          experiment: '7 дней подряд трать час в день на то, о чём тебя никто не просил. На седьмой день опубликуй результат, каким бы маленьким он ни был.',
          question: 'Что появилось бы в этом году, если бы никто не смотрел?',
        },
        SECURITY: {
          label: 'НАДЁЖНОСТЬ', nouns: ['ХРАНИТЕЛЬ', 'АРХИВАРИУС', 'СМОТРИТЕЛЬ МАЯКА'], adjs: ['НЕПРОБИВАЕМЫЙ', 'ТЕРПЕЛИВЫЙ'],
          future: 'Когда что-то ломается, люди бегут к тебе — потому что у тебя всё уже готово.',
          kept: 'твёрдый пол: вариант, который работает, даже когда всё остальное сломалось',
          rejected: 'лишний риск',
          project: 'Система, от которой спокойнее тебе и людям вокруг: финансовая подушка, инструмент, ритуал, который держит, когда всё рушится.',
          experiment: 'Выпиши три вещи, потеря которых ударила бы сильнее всего. На этой неделе сделай маленькую страховку для одной из них.',
          question: 'Какая из твоих страховочных сеток на самом деле клетка?',
        },
        CURIOSITY: {
          label: 'ЛЮБОПЫТСТВО', nouns: ['КАРТОГРАФ', 'СЫЩИК', 'ОХОТНИК ЗА СИГНАЛАМИ'], adjs: ['БЕСПОКОЙНЫЙ', 'НЕИЗВЕДАННЫЙ'],
          future: 'Ты идёшь за вопросами дальше, чем разумно, и некоторые из них идут следом за тобой.',
          kept: 'безымянная дверь: вопрос вместо ответа',
          rejected: 'очевидное объяснение',
          project: 'Публичное и слегка одержимое расследование одного вопроса, за ответ на который никто не платит.',
          experiment: 'Выбери вопрос, о котором не можешь перестать думать. Задай его пятерым людям, которые могут знать ответ. Запиши, что удивило.',
          question: 'Вокруг какого вопроса ты кружишь годами, так и не задав его вслух?',
        },
        CREATION: {
          label: 'СОЗИДАНИЕ', nouns: ['ИЗОБРЕТАТЕЛЬ', 'АРХИТЕКТОР', 'МЕХАНИК'], adjs: ['РУКОТВОРНЫЙ', 'НЕДОДЕЛАННЫЙ'],
          future: 'За тобой тянется след из вещей, инструментов и странных машин, которые переживают собственный смысл.',
          kept: 'делать вещь вместо разговоров о вещи',
          rejected: 'законченное, отполированное, безопасное',
          project: 'То, что ты описываешь всем на вечеринках, — собранное в уродливую, но работающую первую версию.',
          experiment: 'За 3 часа сделай самую уродливую версию своей идеи. Покажи одному человеку. Запиши первый вопрос, который услышишь.',
          question: 'Какая идея в твоей голове уже заслужила плохой первый черновик?',
        },
        CONNECTION: {
          label: 'ЛЮДИ', nouns: ['ТАМАДА', 'ПРОВОДНИК', 'ХОРМЕЙСТЕР'], adjs: ['ЩЕДРЫЙ', 'МНОГОЛЮДНЫЙ'],
          future: 'Вокруг тебя наполняются комнаты — людьми, которые иначе никогда бы не встретились.',
          kept: 'люди, комнаты и разговоры между ними',
          rejected: 'путь в одиночку',
          project: 'Регулярная встреча — ужин, клуб, чат — вокруг одной странной общей одержимости.',
          experiment: 'Позови в один разговор троих людей, не знакомых друг с другом, — на тему, которая тебе важна. Слушай больше, чем говоришь.',
          question: 'Какие двое из твоих знакомых давно должны были познакомиться?',
        },
        POWER: {
          label: 'ВЛИЯНИЕ', nouns: ['ОПЕРАТОР', 'СТРАТЕГ', 'ДЕЛАТЕЛЬ КОРОЛЕЙ'], adjs: ['ВЛИЯТЕЛЬНЫЙ', 'НЕИЗБЕЖНЫЙ'],
          future: 'Ты знаешь, где рычаги, и не стесняешься за них тянуть.',
          kept: 'рычаг: маленькое движение с большими последствиями',
          rejected: 'маленький масштаб ради комфорта',
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
      branchQuestion: label => 'Что сказала бы о такой жизни версия тебя, которая на этапе «' + label + '» выбрала иначе?',
      alreadyTrue: 'Какая часть этой хронологии уже правда?',
      seed: {
        disclaimer: '> Этот файл описывает исследованную возможность, а не объективную правду. Его сгенерировал игровой симулятор из случайного зерна и пяти выборов. Ничто здесь не является предсказанием.',
        h: { timeline: 'ХРОНОЛОГИЯ (TIMELINE)', birth: 'ЗЕРНО РОЖДЕНИЯ (BIRTH SEED)', world: 'МИР (THE WORLD)', future: 'ВОЗМОЖНОЕ БУДУЩЕЕ (THE POSSIBLE FUTURE)',
          choices: 'ВЫБОРЫ, КОТОРЫЕ ЕГО СОЗДАЛИ (CHOICES THAT CREATED IT)', kept: 'ЧТО ВЫБИРАЛОСЬ СНОВА И СНОВА (WHAT I KEPT CHOOSING)',
          rejected: 'ЧТО ОТВЕРГАЛОСЬ (WHAT I KEPT REJECTING)', events: 'ВАЖНЫЕ СОБЫТИЯ (IMPORTANT EVENTS)', project: 'ВОЗМОЖНЫЙ ПРОЕКТ (POSSIBLE PROJECT)',
          experiment: 'ПЕРВЫЙ ЭКСПЕРИМЕНТ (FIRST EXPERIMENT)', visual: 'ВИЗУАЛЬНЫЙ ЯЗЫК (VISUAL LANGUAGE)', questions: 'ОТКРЫТЫЕ ВОПРОСЫ (OPEN QUESTIONS)',
          ai: 'ИНСТРУКЦИИ ДЛЯ ИИ (INSTRUCTIONS FOR AN AI)' },
        birth: b => 'День недели рождения — ' + b.weekdayNom.toLowerCase() + ', под символическим знаком ' + b.sign + '. В тот момент ' + b.anomaly + '. (Только художественный приём.)',
        world: (earth, fact) => earth + ': мир, где ' + fact + '.',
        visual: p => 'Протокол: ' + p + '. Пиксельные пейзажи низкого разрешения, VGA-палитра, строки развёртки, интерфейс из реальности, которой никогда не было.',
        ai: [
          'Относись к этому будущему как к гипотезе, а не как к правде обо мне.',
          'Помоги мне исследовать его, оспорить, визуализировать и превратить интересные части в эксперименты.',
          'Можно: продолжить хронологию, сгенерировать альтернативные ветки, написать текст от лица меня из будущего, найти скрытые допущения или превратить Первый эксперимент в конкретный план на 7 дней.',
          'Общайся со мной по-русски.',
          'Начни с вопроса: **«Что ты хочешь сделать с этой реальностью?»**',
        ],
        footer: (v, url) => 'Сгенерировано BORN WEIRD v' + v + (url ? ' — ' + url : '') + '. Симулятор жизней, которых у тебя ещё не было.',
      },
    },
  };

  function pack(lang) { return CONTENT[lang] || CONTENT.en; }
  function normLang(lang) { return LANGS.indexOf(lang) >= 0 ? lang : 'en'; }

  // Stage views for the UI: label, prompt, option texts in the requested language.
  function stages(lang) {
    const P = pack(normLang(lang));
    return STAGE_META.map((m, i) => ({ label: P.stages[i].label, prompt: P.stages[i].prompt, options: P.stages[i].options.map(o => ({ text: o.text })) }));
  }

  // ---------- birth seed ----------
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
   * @param {string} [lang] 'en' | 'ru'
   */
  function birthSeed(birthDateStr, now, salt, lang) {
    const P = pack(normLang(lang));
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
    const wdIdx = date.getUTCDay();
    const wd = P.weekdays[wdIdx];
    const anomalyIdx = pickIdx(r, P.anomalies.length);
    const worldIdx = pickIdx(r, P.worldFacts.length);
    return {
      seed,
      weekday: wd.day,
      weekdayNom: wd.nom || wd.day,
      sign: wd.sign,
      daysAlive,
      anomaly: P.anomalies[anomalyIdx],
      worldFact: P.worldFacts[worldIdx],
      earth: 'EARTH-' + String(1000 + (seed % 9000)),
      bias: { [WEEKDAY_DIM[wdIdx]]: BIRTH_BIAS },
    };
  }

  // ---------- simulation ----------
  function realityId(r) {
    const hex = () => Math.floor(r() * 0x10000).toString(16).toUpperCase().padStart(4, '0');
    return hex() + '-' + hex();
  }

  /**
   * @param {string} birthDateStr YYYY-MM-DD
   * @param {number[]} choices index per stage
   * @param {object} [opts] { salt: number (uniqueness), now: Date, lang: 'en'|'ru' }
   */
  function simulate(birthDateStr, choices, opts) {
    opts = opts || {};
    const lang = normLang(opts.lang);
    const P = pack(lang);
    const now = opts.now || new Date();
    const salt = opts.salt == null ? Math.floor(Math.random() * 4294967296) : opts.salt;
    const birth = birthSeed(birthDateStr, now, salt, lang);
    if (!Array.isArray(choices) || choices.length !== STAGE_META.length) throw new Error('need one choice per stage');
    choices.forEach((c, i) => {
      if (!Number.isInteger(c) || c < 0 || c >= STAGE_META[i].options.length) throw new Error('invalid choice at stage ' + i);
    });

    const timelineSeed = hash(birth.seed + ':' + choices.join('') + ':' + salt);
    const r = rng(timelineSeed);

    const scores = {};
    DIMS.forEach(d => { scores[d] = birth.bias[d] || 0; });

    const year = now.getFullYear();
    const events = STAGE_META.map((meta, i) => {
      const st = P.stages[i];
      const opt = st.options[choices[i]];
      Object.entries(meta.options[choices[i]]).forEach(([d, v]) => { scores[d] += v * STAGE_WEIGHT[i]; });
      const vars = { Y: year + meta.offsetYears };
      Object.keys(opt.vars || {}).sort().forEach(k => {
        const v = opt.vars[k];
        vars[k] = Array.isArray(v) && typeof v[0] === 'number' && v.length === 2 ? int(r, v[0], v[1]) : v[pickIdx(r, v.length)];
      });
      return { stage: st.label, year: year + meta.offsetYears, prompt: st.prompt, choice: opt.text, text: fill(opt.outcome, vars) };
    });

    // Rank dimensions; ties broken by a seeded jitter so equal scores still diverge.
    const jitter = {};
    DIMS.forEach(d => { jitter[d] = r() * 0.01; });
    const ranked = DIMS.slice().sort((a, b) => (scores[b] + jitter[b]) - (scores[a] + jitter[a]));
    const [d1, d2] = ranked;
    const low = ranked[ranked.length - 1];
    const D = P.dims;

    const adj = D[d2].adjs[pickIdx(r, D[d2].adjs.length)];
    const noun = D[d1].nouns[pickIdx(r, D[d1].nouns.length)];
    const place = P.places[pickIdx(r, P.places.length)];
    const title = P.title(adj, noun, place);
    const id = realityId(r);
    const max = Math.max(...DIMS.map(d => scores[d]), 1);

    return {
      id,
      version: '0.2',
      lang,
      title,
      earth: birth.earth,
      birth: { weekday: birth.weekday, weekdayNom: birth.weekdayNom, sign: birth.sign, anomaly: birth.anomaly, daysAlive: birth.daysAlive },
      worldFact: birth.worldFact,
      events,
      primary: d1,
      secondary: d2,
      rejected: low,
      labels: Object.fromEntries(DIMS.map(d => [d, D[d].label])),
      scores: DIMS.map(d => ({ dim: d, label: D[d].label, value: scores[d], norm: scores[d] / max })),
      future: P.future(birth.earth, birth.worldFact, title, D[d1].future, D[d2].future),
      project: D[d1].project,
      experiment: D[d1].experiment,
      kept: P.kept(D[d1].kept, D[d2].kept),
      rejectedText: D[low].rejected,
      questions: [D[d1].question, P.branchQuestion(P.stages[2].label), P.alreadyTrue],
      protocol: VISUAL_PROTOCOLS[timelineSeed % VISUAL_PROTOCOLS.length],
      artSeed: timelineSeed % 4294967296,
      finalLine: events[events.length - 1].choice,
    };
  }

  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  function realitySeedMarkdown(res, url) {
    const S = pack(res.lang).seed, H = S.h;
    const L = [];
    L.push('# BORN WEIRD // REALITY SEED');
    L.push('');
    L.push(S.disclaimer);
    L.push('');
    L.push('## ' + H.timeline);
    L.push(res.title + ' — Reality #' + res.id + ' (' + res.earth + ')');
    L.push('');
    L.push('## ' + H.birth);
    L.push(S.birth(res.birth));
    L.push('');
    L.push('## ' + H.world);
    L.push(S.world(res.earth, res.worldFact));
    L.push('');
    L.push('## ' + H.future);
    L.push(res.future);
    L.push('');
    L.push('## ' + H.choices);
    res.events.forEach(e => L.push('- **' + e.stage + '** — ' + e.prompt + ' → *' + e.choice + '*'));
    L.push('');
    L.push('## ' + H.kept);
    L.push(cap(res.kept) + '.');
    L.push('');
    L.push('## ' + H.rejected);
    L.push(cap(res.rejectedText) + '.');
    L.push('');
    L.push('## ' + H.events);
    res.events.forEach(e => L.push('- **' + e.stage + ' (' + e.year + ')**: ' + e.text));
    L.push('');
    L.push('## ' + H.project);
    L.push(res.project);
    L.push('');
    L.push('## ' + H.experiment);
    L.push(res.experiment);
    L.push('');
    L.push('## ' + H.visual);
    L.push(S.visual(res.protocol));
    L.push('');
    L.push('## ' + H.questions);
    res.questions.forEach(q => L.push('- ' + q));
    L.push('');
    L.push('## ' + H.ai);
    S.ai.forEach(l => L.push(l));
    L.push('');
    L.push('---');
    L.push(S.footer(res.version, url));
    return L.join('\n');
  }

  const STAGES = stages('en'); // back-compat for tests and older callers
  const api = { DIMS, LANGS, STAGES, STAGE_META, STAGE_WEIGHT, CONTENT, hash, rng, plural, stages, birthSeed, simulate, realitySeedMarkdown, parseBirthDate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BW = api;
})(typeof window !== 'undefined' ? window : globalThis);
