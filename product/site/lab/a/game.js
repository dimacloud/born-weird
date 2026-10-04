/* BORN WEIRD LAB — A «ШАР», pure game logic (round 2: reveal variants v1 «СМЫСЛ» / v2 «КОМПАС»).
 * Your balloon is falling, you throw your life overboard, and what stays in the basket is who you are.
 * The game (items, fuse, gust, twist, timeouts) is frozen since round 1; only the reveal changed.
 * Facts only: receipts quote throws the player made; auto-throws (fuse ran out) are never quoted or ranked.
 * Works in the browser (window.SHAR) and in Node (module.exports), like product/site/engine.js.
 */
(function (root) {
  'use strict';

  // g: grammatical gender/number for verb agreement (m, f, n, p = plural).
  // value: the word shown in v2. hold / holdMe: «держишься за …» (you / me, accusative).
  // drop: «легче всего отпускаешь …» (accusative). they: «друг держится за …» (friend entry, no gendered pronoun).
  const ITEMS = [
    { code: 'money', name: 'ДЕНЬГИ НА ГОД', short: 'ДЕНЬГИ', emoji: '💵', value: 'БЕЗОПАСНОСТЬ', g: 'p',
      hold: 'запас на чёрный день', drop: 'запас на чёрный день', they: 'запас на чёрный день' },
    { code: 'phone', name: 'ТЕЛЕФОН СО ВСЕМИ ФОТО', short: 'ТЕЛЕФОН', emoji: '📱', value: 'ПАМЯТЬ', g: 'm',
      hold: 'своё прошлое', drop: 'прошлое', they: 'своё прошлое' },
    { code: 'letter', name: 'НЕОТПРАВЛЕННОЕ ПИСЬМО', short: 'ПИСЬМО', emoji: '✉️', value: 'ЧУВСТВА', g: 'n',
      hold: 'несказанное', drop: 'несказанное', they: 'несказанное' },
    { code: 'passport', name: 'ЗАГРАНПАСПОРТ', short: 'ПАСПОРТ', emoji: '🛂', value: 'СВОБОДА', g: 'm',
      hold: 'возможность в любой момент уехать', drop: 'возможность уехать', they: 'возможность в любой момент уехать' },
    { code: 'keys', name: 'КЛЮЧИ ОТ ДОМА', short: 'КЛЮЧИ', emoji: '🔑', value: 'ДОМ', g: 'p',
      hold: 'своё место', drop: 'насиженное место', they: 'своё место' },
    { code: 'cat', name: 'ЧУЖОЙ КОТ', short: 'КОТ', emoji: '🐈', value: 'ЗАБОТА', g: 'm',
      hold: 'тех, кто на тебя рассчитывает', holdMe: 'тех, кто на меня рассчитывает', drop: 'чужие ожидания', they: 'чужое доверие' },
    { code: 'manuscript', name: 'НЕДОПИСАННАЯ РУКОПИСЬ', short: 'РУКОПИСЬ', emoji: '📜', value: 'МЕЧТА', g: 'f',
      hold: 'свою большую мечту', drop: 'мечту «на потом»', they: 'свою большую мечту' },
    // On the reveal the player reads «ТВОИМ»; on the card and the share text it is the sender's own cup.
    { code: 'cup', name: 'КУБОК С ТВОИМ ИМЕНЕМ', me: 'КУБОК С МОИМ ИМЕНЕМ', short: 'КУБОК', emoji: '🏆', value: 'ПРИЗНАНИЕ', g: 'm',
      hold: 'своё имя', drop: 'чужую похвалу', they: 'своё имя' },
  ];
  const N = ITEMS.length;           // 8 items
  const THROWS = N - 1;             // 7 throws, then the twist on the last one
  const GUST_AT = 3;                // the gust hits before throw 4 (index 3)
  // Fuse per throw (ms). Throw 1 is the start tap (no fuse: nobody gets auto-thrown while reading).
  // Pre-gust 4 s → 3 s; the gust halves the 4 s fuse to 2 s, then it shrinks to 1.7 s (floor), so timeouts stay the exception.
  const FUSE = [0, 4000, 3000, 2000, 1900, 1800, 1700];
  const TICK = [0, 500, 500, 250, 250, 250, 250]; // beep interval per throw (faster after the gust)
  const FAST_MS = 1500;             // «за 0,8 с» shown only under this
  const HES_MIN_MS = 2500, HES_RATIO = 2;
  const VARIANTS = [1, 2];

  // v2 contradiction: two of the top 3 from an opposite pair. One plain line per pair (order-free).
  const PAIRS = [
    { a: 'passport', b: 'keys', line: 'хочешь уехать — и боишься потерять своё место.', me: 'хочу уехать — и боюсь потерять своё место.' },
    { a: 'cup', b: 'cat', line: 'хочешь, чтобы тебя заметили, — и не можешь подвести тех, кто на тебя рассчитывает.', me: 'хочу, чтобы меня заметили, — и не могу подвести тех, кто на меня рассчитывает.' },
    { a: 'manuscript', b: 'money', line: 'тянет к большой мечте — но без запаса страшно.', me: 'тянет к большой мечте — но без запаса страшно.' },
    { a: 'phone', b: 'letter', line: 'живёшь тем, что было, — а сказать главное так и не решаешься.', me: 'живу тем, что было, — а сказать главное так и не решаюсь.' },
  ];

  const AUTO_MIN = 4;               // ≥4 of 6 fused throws auto, or throw 7 auto → the fuse decided the basket
  const AUTO_NOTE = 'Это выбор шара, не твой. Ещё раз — быстрее?';
  const LAST = { m: 'ПОСЛЕДНИМ', n: 'ПОСЛЕДНИМ', f: 'ПОСЛЕДНЕЙ', p: 'ПОСЛЕДНИМИ' };
  const JUMP_LINE = 'Ради этого не жалко и себя.';
  const DROP_LINE = 'Но себя ты бережёшь ещё больше.';
  const END = { m: 'ся', f: 'ась', n: 'ось', p: 'ись' };
  const verb = (stem, g) => stem + END[g];           // остал+ся / держал+ась …
  const upFirst = s => s.charAt(0).toUpperCase() + s.slice(1);
  const meName = it => it.me || it.name;
  const low = s => s.toLowerCase();
  const fmtSec = ms => (Math.round(ms / 100) / 10).toFixed(1).replace('.', ',') + ' с';
  const idx = code => ITEMS.findIndex(it => it.code === code);

  function newRun() { return { throws: [] }; }
  function thrown(run) { return run.throws.map(t => t.i); }
  function remaining(run) { const t = thrown(run); const out = []; for (let i = 0; i < N; i++) if (t.indexOf(i) < 0) out.push(i); return out; }

  /** Log a throw. ms = time the item was "in hands" (pause-aware), auto = the fuse ran out. */
  function throwItem(run, i, ms, auto) {
    if (!(i >= 0 && i < N) || (i | 0) !== i) throw new Error('bad item');
    if (run.throws.length >= THROWS) throw new Error('no throws left');
    if (thrown(run).indexOf(i) >= 0) throw new Error('already thrown');
    run.throws.push({ i, ms: auto ? null : Math.max(0, Math.round(+ms || 0)), auto: !!auto });
    return run;
  }
  /** Random remaining item for a timeout. r = () => [0,1). */
  function autoPick(run, r) { const rem = remaining(run); return rem[Math.min(rem.length - 1, Math.floor(r() * rem.length))]; }

  function median(a) { const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }

  /** Hesitation: only chosen throws 2–7 (throw 1 includes reading the screen). ≥2× median and ≥2.5 s. */
  function hesitation(run) {
    const c = run.throws.slice(1).filter(t => !t.auto);
    if (c.length < 3) return null;
    const med = median(c.map(t => t.ms));
    let best = null;
    c.forEach(t => { if (!best || t.ms > best.ms) best = t; });
    if (best.ms >= HES_MIN_MS && best.ms >= HES_RATIO * med) return best;
    return null;
  }

  /** The two plain sentences: what you hold on to, what you let go of most easily. */
  function meaning(keptIdx, firstIdx) {
    const k = ITEMS[keptIdx], f = ITEMS[firstIdx];
    return {
      you: 'Ты держишься за ' + k.hold + '. А\u00a0легче всего отпускаешь ' + f.drop + '.',
      me: 'Держусь за ' + (k.holdMe || k.hold) + '. А\u00a0легче всего отпускаю ' + f.drop + '.',
    };
  }

  /** v2 ranking: kept item first, then chosen throws in reverse order. Auto-throws are unranked (skipped). */
  function compass(run) {
    const out = [remaining(run)[0]];
    for (let k = run.throws.length - 1; k >= 0; k--) if (!run.throws[k].auto) out.push(run.throws[k].i);
    return out;
  }
  /** Contradiction among the top 3, or null. Earliest pair in PAIRS order wins if (rarely) two fire. */
  function contradiction(top3) {
    const codes = top3.map(i => ITEMS[i].code);
    for (const p of PAIRS) {
      const ia = codes.indexOf(p.a), ib = codes.indexOf(p.b);
      if (ia >= 0 && ib >= 0) return { a: p.a, b: p.b, head: ITEMS[idx(p.a)].value + ' × ' + ITEMS[idx(p.b)].value, line: p.line, me: p.me };
    }
    return null;
  }

  /**
   * Friend state: kept index + j/d + variant, plus (v2) the next two compass items: "5j1", "5j247".
   * Round-1 links ("5j") still decode (variant null). Anything else → null (silent fallback).
   */
  function encodeState(keptIdx, jump, variant, top3) {
    let s = String(keptIdx) + (jump ? 'j' : 'd');
    if (variant === 1) s += '1';
    if (variant === 2) s += '2' + top3[1] + top3[2];
    return s;
  }
  function decodeState(s) {
    if (typeof s !== 'string') return null;
    const m = /^([0-7])([jd])(?:(1)|2([0-7])([0-7]))?$/.exec(s.trim());
    if (!m) return null;
    const keptIdx = +m[1], out = { keptIdx, jump: m[2] === 'j', variant: null, top3: null };
    if (m[3]) out.variant = 1;
    else if (m[4] !== undefined) {
      const t = [keptIdx, +m[4], +m[5]];
      if (new Set(t).size !== 3) return null;
      out.variant = 2; out.top3 = t;
    }
    return out;
  }
  function guess(friend, i) { return !!friend && friend.keptIdx === i; }
  const compassText = (top, n) => top.slice(0, n).map(i => ITEMS[i].value).join('\u00a0> ');

  /**
   * Build the reveal. jump: true = «ПРЫГАЮ Я», false = «ВЫКИДЫВАЮ». friend: decoded state or null.
   * variant: 1 «СМЫСЛ» or 2 «КОМПАС».
   */
  function finish(run, jump, friend, variant) {
    if (run.throws.length !== THROWS) throw new Error('run not complete');
    const v = variant === 2 ? 2 : 1;
    const keptIdx = remaining(run)[0];
    const kept = ITEMS[keptIdx];
    const first = run.throws.find(t => !t.auto);         // always throw 1 in the UI (the start tap)
    const firstIdx = (first || run.throws[0]).i;
    const firstIt = ITEMS[firstIdx];
    const autos = run.throws.filter(t => t.auto).length;
    const seventh = run.throws[THROWS - 1];

    // Receipts — player choices only.
    const receipts = [];
    const firstLabel = run.throws[0] === first ? 'Первым за борт' : 'Первым по выбору';
    if (first) receipts.push({ k: 'first', text: firstLabel + ': ' + low(firstIt.name) + (first.ms < FAST_MS ? ' (за ' + fmtSec(first.ms) + ')' : '') });
    if (!seventh.auto) receipts.push({ k: 'almost', text: 'Почти ' + verb('остал', ITEMS[seventh.i].g) + ': ' + low(ITEMS[seventh.i].name) });

    if (seventh.auto || autos >= AUTO_MIN) {
      // Honest branch: the basket was decided by the fuse, so no claim, no meaning, no share.
      receipts.push({ k: 'autos', text: 'Без тебя за борт: ' + autos + ' из ' + THROWS });
      return {
        auto: true, variant: v, keptIdx, kept, jump, code: kept.code, state: null, first: firstIt,
        headline: ['ШАР РЕШИЛ ЗА ТЕБЯ:', kept.name], receipts, note: AUTO_NOTE,
        sentence: null, extra: null, compass: null, contra: null, compare: null, share: null, card: null, chips: [], autos,
      };
    }
    const h = hesitation(run);
    if (h) receipts.push({ k: 'hes', text: 'Дольше всего в руках: ' + low(ITEMS[h.i].name) + ' (' + fmtSec(h.ms) + ')' });

    const headline = jump ? ['ПРЫЖОК РАДИ:', kept.name] : ['ВЫКИНУТО ВСЁ. ' + LAST[kept.g] + ':', kept.name];
    const mean = meaning(keptIdx, firstIdx);
    const extra = jump ? JUMP_LINE : DROP_LINE;
    const top = compass(run);
    const top3 = top.slice(0, 3);
    const contra = v === 2 ? contradiction(top3) : null;

    let compare = null;
    if (friend) {
      const f = ITEMS[friend.keptIdx];
      compare = friend.keptIdx === keptIdx
        ? 'У друга ' + verb('остал', f.g) + ': ' + f.short + '. У тебя тоже.'
        : 'У друга ' + verb('остал', f.g) + ': ' + f.short + '. У тебя: ' + kept.short + '.';
      if (v === 2 && friend.top3) compare += ' Компас друга: ' + compassText(friend.top3, 3) + '.';
    }

    let share, card, chips;
    if (v === 1) {
      share = jump
        ? 'В моём шаре ' + verb('остал', kept.g) + ' ' + meName(kept) + '. А что спасёшь ты?'
        : 'В моём шаре до последнего ' + verb('держал', kept.g) + ' ' + meName(kept) + '. А что спасёшь ты?';
      card = [headline[0], meName(kept), mean.me];
      chips = ['за что держусь', 'что отпускаю', 'прыжок / последнее'];
    } else {
      share = 'Мой компас: ' + compassText(top, 3) + '. А твой?';
      card = ['МОЙ КОМПАС — ЧТО МНЕ ВАЖНЕЕ:', compassText(top, 4), contra ? contra.head + ': ' + contra.me : mean.me];
      chips = contra ? ['порядок', 'противоречие', 'что отпускаю'] : ['порядок', 'за что держусь', 'что отпускаю'];
    }

    return {
      auto: false, variant: v, keptIdx, kept, jump, code: kept.code, state: encodeState(keptIdx, jump, v, top3),
      first: firstIt, headline, receipts, sentence: mean.you, sentenceMe: mean.me, extra,
      compass: v === 2 ? top.slice(0, 4).map(i => ITEMS[i].value) : null, contra, compare, share, card, chips, autos,
    };
  }

  /** Every user-visible string of a result (for tests). */
  function texts(res) {
    if (res.auto) return [].concat(res.headline, res.receipts.map(l => l.text), [res.note]);
    return [].concat(res.headline, res.receipts.map(l => l.text), [res.sentence, res.extra, res.share], res.card, res.chips,
      res.compass || [], res.contra ? [res.contra.head, res.contra.line, res.contra.me] : [], res.compare ? [res.compare] : []);
  }

  const api = {
    ITEMS, N, THROWS, GUST_AT, FUSE, TICK, FAST_MS, HES_MIN_MS, HES_RATIO, VARIANTS, PAIRS, AUTO_MIN, AUTO_NOTE, JUMP_LINE, DROP_LINE,
    verb, upFirst, fmtSec, newRun, remaining, throwItem, autoPick, hesitation, meaning, compass, contradiction, compassText,
    encodeState, decodeState, guess, finish, texts,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SHAR = api;
})(typeof window !== 'undefined' ? window : globalThis);
