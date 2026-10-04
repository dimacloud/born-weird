/* BORN WEIRD LAB — finalist B «ОРАКУЛ» (tournament round 1).
 * Magic trick: the oracle bets on what you'll choose next; you find out how readable you are.
 *
 * Rules (reports/tournament/FINALISTS.md, section B):
 *  - 3 axes: Я/МЫ · СЕЙЧАС/ПОТОМ · ПРЫЖОК/ОПОРА. Side 0 / side 1 per axis.
 *  - Taps 1–3: one everyday item per axis (order Я/МЫ, СЕЙЧАС/ПОТОМ, ПРЫЖОК/ОПОРА). No bets yet.
 *  - Taps 4–6: the other everyday item of the same axis; bet = the side chosen on that axis at tap 1–3.
 *  - Tap 7 (boss): the first axis whose two answers agree (tie order as above), in the item that makes
 *    THAT side costly; bet = that side. If no axis is consistent: axis Я/МЫ, bet = its latest side.
 *  - hits = correct bets over taps 4–7 (0–4). Label by hits. Code = latest side per axis.
 *  - Receipt = first miss quoted verbatim (bet label vs chosen label); with no miss, the boss choice.
 * The birth date only builds a persona (name, colour, sigil). It is never an input to bets, hits,
 * labels, receipts or the share state: finish() and encodeState() do not take it.
 * UMD: window.ORACLE in the browser, module.exports in Node.
 */
(function (root) {
  'use strict';

  const AXES = [
    { id: 'me', sides: ['Я', 'МЫ'] },
    { id: 'now', sides: ['СЕЙЧАС', 'ПОТОМ'] },
    { id: 'leap', sides: ['ПРЫЖОК', 'ОПОРА'] },
  ];

  // o[side] = button label for that side. boss[s] = the costly form when the bet is side s.
  const ITEMS = [
    {
      every: [
        { id: 'cake', text: 'Последний кусок торта.', title: 'Последний кусок торта', o: ['СЪЕМ', 'ОСТАВЛЮ'] },
        { id: 'friday', text: 'Пятница. Друзья зовут.', title: 'Пятница', o: ['СВОЙ ПЛАН', 'ДРУЗЬЯ'] },
      ],
      boss: [
        { id: 'move', text: 'Друг переезжает. У тебя единственный выходной.', title: 'Друг переезжает', o: ['ОТДЫХАЮ', 'ПОМОГАЮ'] },
        { id: 'team', text: 'Команда просит остаться. Отпуск уже оплачен.', title: 'Отпуск уже оплачен', o: ['ЛЕЧУ', 'ОСТАЮСЬ'] },
      ],
    },
    {
      every: [
        { id: 'bonus', text: 'Неожиданная премия.', title: 'Неожиданная премия', o: ['ПОТРАЧУ', 'ОТЛОЖУ'] },
        { id: 'course', text: 'Скучный курс. Половина позади.', title: 'Скучный курс', o: ['БРОШУ', 'ДОТЕРПЛЮ'] },
      ],
      boss: [
        { id: 'concert', text: 'Концерт мечты сегодня. Билет — ползарплаты.', title: 'Концерт мечты', o: ['ИДУ', 'ПРОПУСКАЮ'] },
        { id: 'flat', text: 'Три года без отпусков — и своя квартира.', title: 'Три года без отпусков', o: ['ЖИВУ СЕЙЧАС', 'КОПЛЮ'] },
      ],
    },
    {
      every: [
        { id: 'chute', text: 'Прыжок с парашютом. Завтра.', title: 'Прыжок с парашютом', o: ['ПРЫГАЮ', 'НЕТ, СПАСИБО'] },
        { id: 'city', text: 'Новая работа в чужом городе.', title: 'Работа в чужом городе', o: ['ЕДУ', 'ОСТАЮСЬ'] },
      ],
      boss: [
        { id: 'own', text: 'Уйти в своё дело? Денег — на полгода.', title: 'Своё дело', o: ['УХОЖУ', 'ОСТАЮСЬ'] },
        { id: 'five', text: 'Та же работа ещё пять лет. Надёжно.', title: 'Ещё пять лет', o: ['УХОЖУ', 'ОСТАЮСЬ'] },
      ],
    },
  ];

  const TOTAL = 7;
  const BANDS = [
    { code: 'cipher', label: 'ШИФР', min: 0 },
    { code: 'cipher', label: 'ШИФР', min: 1 },
    { code: 'agent', label: 'ДВОЙНОЙ АГЕНТ', min: 2 },
    { code: 'riddle', label: 'КНИГА С ЗАГАДКОЙ', min: 3 },
    { code: 'book', label: 'ОТКРЫТАЯ КНИГА', min: 4 },
  ];
  const CODES = ['book', 'riddle', 'agent', 'cipher'];
  const HONESTY = 'Оракул не читает мысли — он ставит на то, что ты не меняешься.';

  // Oracle voice (the oracle speaks about itself; never past tense about the player).
  const LINES = {
    scan: 'ОРАКУЛ ИЗУЧАЕТ…',
    learn: ['Записано.', 'Так-так.', 'Достаточно. Теперь я ставлю.'],
    bet: ['Я знаю, что ты выберешь.', 'Ставлю снова.', 'И ещё раз.', 'Финал. Тут дороже.'],
    hit: ['Предсказуемо.', 'Как по книге.', 'Я же говорил.', 'Ещё одно очко мне.'],
    miss: ['Хм. Неожиданно.', 'Ладно, этот твой.', 'Не по плану.', 'Ты сбиваешь прицел.'],
  };

  function makeRng(seed) {
    let a = seed >>> 0 || 1;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  /** New run. rand: () => [0,1). firstEvery[a] = which everyday item of axis a comes first; swap[k] = buttons swapped. */
  function newRun(rand) {
    const r = typeof rand === 'function' ? rand : Math.random;
    return {
      firstEvery: [0, 1, 2].map(() => (r() < 0.5 ? 0 : 1)),
      swap: Array.from({ length: TOTAL }, () => r() < 0.5),
      answers: [],
    };
  }

  /** Boss axis and bet from the first 6 answers. */
  function bossOf(answers) {
    for (let a = 0; a < 3; a++) if (answers[a] === answers[a + 3]) return { axis: a, side: answers[a], consistent: true };
    return { axis: 0, side: answers[3], consistent: false };
  }

  /** Item k (0-based). For k = 6, the first 6 answers must exist. */
  function itemAt(run, k) {
    let axis, src, bet = null, boss = false;
    if (k < 3) { axis = k; src = ITEMS[axis].every[run.firstEvery[axis]]; }
    else if (k < 6) { axis = k - 3; src = ITEMS[axis].every[1 - run.firstEvery[axis]]; bet = run.answers[axis]; }
    else if (k === 6) {
      if (run.answers.length < 6) throw new Error('boss needs 6 answers');
      const b = bossOf(run.answers);
      axis = b.axis; bet = b.side; boss = true; src = ITEMS[axis].boss[bet];
    } else throw new Error('no item ' + k);
    const opts = [0, 1].map(side => ({ side, label: src.o[side] }));
    if (run.swap[k]) opts.reverse();
    return { k, id: src.id, axis, text: src.text, title: src.title, options: opts, bet, boss };
  }

  function answer(run, k, side) {
    if (k !== run.answers.length) throw new Error('answer out of order: ' + k);
    if (side !== 0 && side !== 1) throw new Error('bad side');
    run.answers.push(side);
    const it = itemAt(run, k);
    return it.bet === null ? { k, bet: null, hit: null } : { k, bet: it.bet, hit: it.bet === side };
  }

  /** Live score after the answers given so far: [oracle, player]. */
  function score(run) {
    let o = 0, p = 0;
    for (let k = 3; k < run.answers.length; k++) { const it = itemAt(run, k); if (it.bet === run.answers[k]) o++; else p++; }
    return [o, p];
  }

  function sideWord(axis, side) { return AXES[axis].sides[side]; }
  function codeText(sides) { return sides.map((s, a) => sideWord(a, s)).join(' · '); }
  function bandOf(hits) { return BANDS[hits]; }

  function finish(run) {
    if (run.answers.length !== TOTAL) throw new Error('run not finished');
    const bets = [];
    for (let k = 3; k < TOTAL; k++) {
      const it = itemAt(run, k), choice = run.answers[k];
      const src = it.boss ? ITEMS[it.axis].boss[it.bet] : ITEMS[it.axis].every[1 - run.firstEvery[it.axis]];
      bets.push({ k, id: it.id, axis: it.axis, title: it.title, bet: it.bet, choice, hit: it.bet === choice, betLabel: src.o[it.bet], choiceLabel: src.o[choice], boss: it.boss });
    }
    const hits = bets.filter(b => b.hit).length;
    const band = bandOf(hits);
    // Latest side per axis: answers 3..5 are the axis's latest, the boss overrides its axis.
    const sides = [run.answers[3], run.answers[4], run.answers[5]];
    const bossBet = bets[3];
    sides[bossBet.axis] = bossBet.choice;
    const firstMiss = bets.find(b => !b.hit) || null;
    const receipt = firstMiss
      ? `Промах — «${firstMiss.title}»: ставка ${firstMiss.betLabel}, выбор ${firstMiss.choiceLabel}.`
      : `Без промахов. Финал «${bossBet.title}» — ${bossBet.choiceLabel}.`;
    // Why the oracle bet (the trick made visible): the player's own earlier choices, verbatim.
    const shown = firstMiss || bossBet;
    const ev = evidence(run, shown.k);
    const why = `Почему ставка ${shown.betLabel}: раньше ` + ev.map(e => `«${e.title}» → ${e.label}`).join(' и ') + '.';
    const boss = bossOf(run.answers);
    return {
      hits,
      score: [hits, 4 - hits],
      headline: `ОРАКУЛ УГАДАЛ ${hits} ИЗ 4`,
      label: band.label,
      code: band.code,
      sides,
      codeText: codeText(sides),
      receipt,
      why,
      receiptKind: firstMiss ? 'miss' : 'boss',
      receiptItem: firstMiss ? firstMiss.id : bossBet.id,
      bossAxis: boss.axis,
      bossConsistent: boss.consistent,
      bets,
      honesty: HONESTY,
      shareText: `Оракул угадал меня ${hits} из 4. Тебя он угадает?`,
      cardLine: firstMiss ? `Промах: «${firstMiss.title}»` : 'Без единого промаха',
      chips: ['счёт', 'прозвище', firstMiss ? 'промах' : 'финал'],
      state: encodeState({ hits, sides }),
    };
  }

  /** The earlier answers a bet at item k was built from: [{title, label}] (verbatim). */
  function evidence(run, k) {
    const at = j => { const src = j < 3 ? ITEMS[j].every[run.firstEvery[j]] : ITEMS[j - 3].every[1 - run.firstEvery[j - 3]]; return { title: src.title, label: src.o[run.answers[j]] }; };
    if (k < 6) return [at(k - 3)];
    const b = bossOf(run.answers);
    return b.consistent ? [at(b.axis), at(b.axis + 3)] : [at(b.axis + 3)];
  }

  /** Everything the shareable card shows. Takes only the result: no persona, no date. */
  function cardSpec(res) {
    return { top: 'ОРАКУЛ УГАДАЛ МЕНЯ', big: res.hits + ' ИЗ 4', pips: res.bets.map(b => b.hit), label: res.label, line: res.cardLine, color: '#55ffff' };
  }

  // ---------- share state: "1" + hits + 3 side bits. Contains no birth data by construction. ----------
  function encodeState(res) { return '1' + res.hits + res.sides.join(''); }
  function decodeState(s) {
    if (typeof s !== 'string') return null;
    const m = /^1([0-4])([01])([01])([01])$/.exec(s.trim());
    if (!m) return null;
    const hits = +m[1], sides = [+m[2], +m[3], +m[4]];
    return { hits, sides, label: bandOf(hits).label, codeText: codeText(sides) };
  }

  function friendTop(f) { return `ОРАКУЛ УГАДАЛ ДРУГА ${f.hits} ИЗ 4. ТЕБЯ — ПОСМОТРИМ.`; }
  function compareLine(me, f) {
    return `Друга — ${f.hits} из 4, тебя — ${me.hits} из 4. Код друга: ${f.codeText || codeText(f.sides)}.`;
  }

  // ---------- birth persona (costume only; day + month, never the year) ----------
  const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const MDAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const COLORS = ['#55ffff', '#ff55ff', '#ffff55', '#55ff99', '#ff9955', '#9999ff'];
  function validDate(day, month) { return Number.isInteger(day) && Number.isInteger(month) && month >= 1 && month <= 12 && day >= 1 && day <= MDAYS[month - 1]; }
  /** rand only sets the sigil's rotation, so the costume can't be decoded back to a date. */
  function persona(day, month, rand) {
    if (!validDate(day, month)) return null;
    const r = typeof rand === 'function' ? rand : Math.random;
    const h = (day * 37 + month * 101) >>> 0;
    return {
      name: `ОРАКУЛ ${day} ${MONTHS[month - 1].toUpperCase()}`,
      color: COLORS[h % COLORS.length],
      points: 3 + ((day + month) % 6),       // sigil: star polygon with 3..8 points
      rot: Math.floor(r() * 360),
    };
  }
  const DEFAULT_PERSONA = { name: 'ОРАКУЛ', color: '#55ffff', points: 0, rot: 0 };

  const api = {
    AXES, ITEMS, TOTAL, BANDS, CODES, HONESTY, LINES, MONTHS, MDAYS, COLORS, DEFAULT_PERSONA,
    makeRng, newRun, itemAt, answer, score, bossOf, finish, encodeState, decodeState, friendTop, compareLine,
    validDate, persona, codeText, evidence, cardSpec,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ORACLE = api;
})(typeof window !== 'undefined' ? window : globalThis);
