/* BORN WEIRD LAB — A «ШАР» (tournament finalist A), pure game logic.
 * Your balloon is falling, you throw your life overboard, and what stays in the basket is who you are.
 * Facts only: every receipt quotes a throw the player made. Auto-throws (fuse ran out) are logged
 * but never quoted. The title is play: noun by the kept item + «без …» tail by the first item thrown.
 * Works in the browser (window.SHAR) and in Node (module.exports), like product/site/engine.js.
 */
(function (root) {
  'use strict';

  // g: grammatical gender/number of the item for verb agreement (m, f, n, p = plural).
  const ITEMS = [
    { code: 'money', name: 'ДЕНЬГИ НА ГОД', short: 'ДЕНЬГИ', emoji: '💵', fam: 'БЕЗОПАСНОСТЬ', g: 'p' },
    { code: 'phone', name: 'ТЕЛЕФОН СО ВСЕМИ ФОТО', short: 'ТЕЛЕФОН', emoji: '📱', fam: 'ПАМЯТЬ', g: 'm' },
    { code: 'letter', name: 'НЕОТПРАВЛЕННОЕ ПИСЬМО', short: 'ПИСЬМО', emoji: '✉️', fam: 'ЧУВСТВА', g: 'n' },
    { code: 'passport', name: 'ЗАГРАНПАСПОРТ', short: 'ПАСПОРТ', emoji: '🛂', fam: 'СВОБОДА', g: 'm' },
    { code: 'keys', name: 'КЛЮЧИ ОТ ДОМА', short: 'КЛЮЧИ', emoji: '🔑', fam: 'КОРНИ', g: 'p' },
    { code: 'cat', name: 'ЧУЖОЙ КОТ', short: 'КОТ', emoji: '🐈', fam: 'ДОЛГ', g: 'm' },
    { code: 'manuscript', name: 'НЕДОПИСАННАЯ РУКОПИСЬ', short: 'РУКОПИСЬ', emoji: '📜', fam: 'МЕЧТА', g: 'f' },
    // On the reveal the player reads «ТВОИМ»; on the card and the share text it is the sender's own cup.
    { code: 'cup', name: 'КУБОК С ТВОИМ ИМЕНЕМ', me: 'КУБОК С МОИМ ИМЕНЕМ', short: 'КУБОК', emoji: '🏆', fam: 'ПРИЗНАНИЕ', g: 'm' },
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

  // Title: noun by family(kept) + tail by family(first thrown). A «без …» tail has no gender agreement.
  // Nouns are common-gender (ТИХОНЯ, БРОДЯГА, НЯНЬКА) or things (КОПИЛКА, АРХИВ, ЯКОРЬ, ЧЕРНОВИК, ЗВЕЗДА): none reads as male or female.
  const NOUN = { money: 'КОПИЛКА', phone: 'АРХИВ', letter: 'ТИХОНЯ', passport: 'БРОДЯГА', keys: 'ЯКОРЬ', cat: 'НЯНЬКА', manuscript: 'ЧЕРНОВИК', cup: 'ЗВЕЗДА' };
  const TAIL = { money: 'БЕЗ ЗАПАСА', phone: 'БЕЗ ПРОШЛОГО', letter: 'БЕЗ ПРИЗНАНИЙ', passport: 'БЕЗ ВИЗЫ', keys: 'БЕЗ АДРЕСА', cat: 'БЕЗ ОБЯЗАТЕЛЬСТВ', manuscript: 'БЕЗ ЧЕРНОВИКОВ', cup: 'БЕЗ НАГРАД' };

  const HONESTY = 'Тут ничего не вычислено — только то, что полетело за борт.';
  const AUTO_MIN = 4;               // ≥4 of 6 fused throws auto, or throw 7 auto → the fuse decided the basket
  const AUTO_NOTE = 'Это выбор шара, не твой. Ещё раз — быстрее?';
  const LAST = { m: 'ПОСЛЕДНИМ', n: 'ПОСЛЕДНИМ', f: 'ПОСЛЕДНЕЙ', p: 'ПОСЛЕДНИМИ' };
  const CHIPS = ['что осталось', 'что первым за борт', 'прозвище'];
  const END = { m: 'ся', f: 'ась', n: 'ось', p: 'ись' };
  const verb = (stem, g) => stem + END[g];           // остал+ся / держал+ась …
  const upFirst = s => s.charAt(0).toUpperCase() + s.slice(1);
  const meName = it => it.me || it.name;
  const fmtSec = ms => (Math.round(ms / 100) / 10).toFixed(1).replace('.', ',') + '\u00a0с';

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

  /** Friend state: kept index + j(ump)/d(rop), e.g. "5j". Anything else → null (silent fallback). */
  function encodeState(keptIdx, jump) { return String(keptIdx) + (jump ? 'j' : 'd'); }
  function decodeState(s) {
    if (typeof s !== 'string') return null;
    const m = /^([0-7])([jd])$/.exec(s.trim());
    if (!m) return null;
    return { keptIdx: +m[1], jump: m[2] === 'j' };
  }
  function guess(friend, i) { return !!friend && friend.keptIdx === i; }

  /** Build the reveal. jump: true = «ПРЫГАЮ Я», false = «ВЫКИДЫВАЮ». friend: decoded state or null. */
  function finish(run, jump, friend) {
    if (run.throws.length !== THROWS) throw new Error('run not complete');
    const keptIdx = remaining(run)[0];
    const kept = ITEMS[keptIdx];
    const first = run.throws.find(t => !t.auto);         // always throw 1 in the UI (the start tap)
    const firstIt = ITEMS[(first || run.throws[0]).i];  // no chosen throw is impossible in the UI; title still valid
    const lines = [];
    // headline[0] is the small label, headline[1] the big item name, headline[2] (jump only) the second big line.
    const headline = jump
      ? ['В ШАРЕ ' + verb('ОСТАЛ', kept.g).toUpperCase() + ':', kept.name, 'ПРЫЖОК РАДИ: ' + kept.emoji + ' ' + kept.short]
      : ['ВЫКИНУТО ВСЁ. ' + LAST[kept.g] + ':', kept.name];

    // Receipts — player choices only.
    const firstLabel = run.throws[0] === first ? 'Первым за борт' : 'Первым по выбору';
    if (first) lines.push({ k: 'first', text: firstLabel + ': ' + firstIt.name + (first.ms < FAST_MS ? ' (за\u00a0' + fmtSec(first.ms) + ')' : '') });
    const seventh = run.throws[THROWS - 1];
    const autos = run.throws.filter(t => t.auto).length;
    if (seventh.auto || autos >= AUTO_MIN) {
      // Honest branch: the basket was decided by the fuse, so no claim, no title, no share.
      lines.push({ k: 'autos', text: 'Без тебя за борт: ' + autos + ' из ' + THROWS });
      return {
        auto: true, keptIdx, kept, jump, code: kept.code, state: null, first: firstIt,
        headline: ['ШАР РЕШИЛ ЗА ТЕБЯ:', kept.name], receipts: lines, title: null, honesty: AUTO_NOTE,
        compare: null, share: null, card: null, chips: [], autos,
      };
    }
    if (!seventh.auto) lines.push({ k: 'almost', text: 'Почти ' + verb('остал', ITEMS[seventh.i].g) + ': ' + ITEMS[seventh.i].name });
    const h = hesitation(run);
    if (h) lines.push({ k: 'hes', text: 'Дольше всего в руках: ' + ITEMS[h.i].name + ' (' + fmtSec(h.ms) + ')' });

    const title = NOUN[kept.code] + ' ' + TAIL[firstIt.code];
    let compare = null;
    if (friend) {
      const f = ITEMS[friend.keptIdx];
      compare = friend.keptIdx === keptIdx
        ? 'У друга ' + verb('остал', f.g) + ': ' + f.short + '. У тебя тоже.'
        : 'У друга ' + verb('остал', f.g) + ': ' + f.short + '. У тебя: ' + kept.short + '.';
    }
    const share = jump
      ? 'В моём шаре ' + verb('остал', kept.g) + ' ' + meName(kept) + ', а за борт прыгаю я. А что останется в твоём?'
      : 'В моём шаре до последнего ' + verb('держал', kept.g) + ' ' + meName(kept) + '. А что останется в твоём?';
    const card = [jump ? 'В ШАРЕ ' + verb('ОСТАЛ', kept.g).toUpperCase() + ':' : 'ДО ПОСЛЕДНЕГО В ШАРЕ:', meName(kept), title];

    return {
      keptIdx, kept, jump, code: kept.code, state: encodeState(keptIdx, jump),
      auto: false, first: firstIt, headline, receipts: lines, title, honesty: HONESTY, compare, share, card, chips: CHIPS.slice(), autos,
    };
  }

  /** Every user-visible string of a result (for tests). */
  function texts(res) {
    if (res.auto) return [].concat(res.headline, res.receipts.map(l => l.text), [res.honesty]);
    return [].concat(res.headline, res.receipts.map(l => l.text), [res.title, res.honesty, res.share], res.card, res.chips, res.compare ? [res.compare] : []);
  }

  const api = {
    ITEMS, N, THROWS, GUST_AT, FUSE, TICK, FAST_MS, HES_MIN_MS, HES_RATIO, NOUN, TAIL, HONESTY, CHIPS, AUTO_MIN, AUTO_NOTE,
    verb, upFirst, fmtSec, newRun, remaining, throwItem, autoPick, hesitation, encodeState, decodeState, guess, finish, texts,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SHAR = api;
})(typeof window !== 'undefined' ? window : globalThis);
