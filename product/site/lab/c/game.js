/* BORN WEIRD LAB · C — ДВОЙНОЕ ДНО (tournament finalist C, spec: reports/tournament/FINALISTS.md).
 * Magic trick: the game asks the same 4 trade-offs twice without saying so — once as a quick WORD,
 * once as a costly SCENE — in one interleaved stream, and shows where the two answers split.
 * Pure logic, no DOM. Works in the browser (window.GAME_C) and in Node (module.exports).
 */
(function (root) {
  'use strict';

  const WORD_MS = 3000;
  const SCENE_MS = 7000;
  const N = 8;

  // Side 0 = a, side 1 = b. Scene buttons sa/sb map to the same sides. Scenes ≤ 14 words, buttons ≤ 2 words.
  // A scene and its buttons never reuse the vocabulary of its own word pair (no echo that gives the doubling away).
  // Titles: t[0] = word a → scene b, t[1] = word b → scene a. Noun phrases only.
  const PAIRS = [
    { k: 'free', a: 'СВОБОДА', b: 'СВОИ ЛЮДИ',
      scene: 'Жить у моря, как хочется. Но семья и друзья — за тысячу километров.', sa: 'ПЕРЕЕЗЖАЮ', sb: 'ОСТАЮСЬ',
      t: ['БЕГЛЕЦ С ОБРАТНЫМ БИЛЕТОМ', 'ДОМОСЕД С ЧЕМОДАНОМ НАГОТОВЕ'] },
    { k: 'succ', a: 'УСПЕХ', b: 'ПОКОЙ',
      scene: 'Большое повышение. Но рабочий телефон звонит и в воскресенье.', sa: 'СОГЛАШАЮСЬ', sb: 'ОТКАЗЫВАЮСЬ',
      t: ['КАРЬЕРИСТ В ГАМАКЕ', 'ОТШЕЛЬНИК С ВИЗИТКОЙ'] },
    { k: 'truth', a: 'ПРАВДА', b: 'МИР',
      scene: 'Друг горит своим планом. План слабый. Скажешь — поссоритесь.', sa: 'СКАЖУ', sb: 'ПРОМОЛЧУ',
      t: ['ПРАВДОРУБ С ГЛУШИТЕЛЕМ', 'МИРОТВОРЕЦ С ПЕРЦЕМ'] },
    { k: 'new', a: 'НОВОЕ', b: 'ПРИВЫЧНОЕ',
      scene: 'Один отпуск в году. Проверенное любимое место — или страна наугад.', sa: 'НАУГАД', sb: 'ЛЮБИМОЕ МЕСТО',
      t: ['ПУТЕШЕСТВЕННИК ПО КРУГУ', 'ТИХОНЯ С КОМПАСОМ'] },
  ];
  const WORD_Q = 'ЧТО БЛИЖЕ?';

  const TIERS = [
    { code: 'monolith', name: 'МОНОЛИТ' },
    { code: 'crack', name: 'ТРЕЩИНА' },
    { code: 'double', name: 'ДВОЙНОЕ ДНО' },
    { code: 'chameleon', name: 'ХАМЕЛЕОН' },
  ];
  const TWIST = '8 вопросов были 4 вопросами, заданными дважды: словом и ценой.';
  const HONESTY = 'Это не тест. Это два твоих ответа рядом.';

  function rng(seed) {
    let a = seed >>> 0 || 1;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function shuffle(arr, r) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /**
   * One interleaved stream of 8 items, random each run. Rules:
   *  - item 1 is a word (fast, fits the first screen);
   *  - a pair's word and scene are at least 3 apart (either order: a scene may come before its word);
   *  - exactly one scene in items 2–4, the rest in the second half (scenes mostly late, no fixed rhythm);
   *  - never 4 of a kind in a row.
   * Pair order, gaps and the type pattern all vary, so the echo is not predictable mid-stream.
   */
  function stream(r) {
    for (let guard = 0; guard < 100000; guard++) {
      const rest = shuffle([0, 1, 2, 3].map(p => ({ type: 's', p })).concat([0, 1, 2, 3].map(p => ({ type: 'w', p }))), r);
      const fi = rest.findIndex(it => it.type === 'w');
      const items = [rest[fi]].concat(rest.filter((_, i) => i !== fi));
      const types = items.map(it => it.type).join('');
      if (/wwww|ssss/.test(types)) continue;
      if ((types.slice(1, 4).match(/s/g) || []).length !== 1) continue;
      const pos = {};
      items.forEach((it, i) => { pos[it.type + it.p] = i; });
      let ok = true;
      for (let p = 0; p < 4 && ok; p++) if (Math.abs(pos['s' + p] - pos['w' + p]) < 3) ok = false;
      if (ok) return items.map(it => Object.assign({}, it, { swap: r() < 0.5 }));
    }
    throw new Error('stream: no valid order');
  }

  function newRun(r) {
    r = r || Math.random;
    return { items: stream(r), ans: new Array(N).fill(null) };
  }

  /** What the screen shows for item i: question text and two option labels (in display order) with their sides. */
  function view(run, i) {
    const it = run.items[i], P = PAIRS[it.p];
    const opts = it.type === 'w' ? [{ label: P.a, side: 0 }, { label: P.b, side: 1 }] : [{ label: P.sa, side: 0 }, { label: P.sb, side: 1 }];
    if (it.swap) opts.reverse();
    return { type: it.type, pair: P.k, q: it.type === 'w' ? WORD_Q : P.scene, opts, ms: it.type === 'w' ? WORD_MS : SCENE_MS, n: i + 1, of: N };
  }

  /** side: 0|1, or null for a timeout. rt in ms. */
  function answer(run, i, side, rt) {
    run.ans[i] = { side: side === 0 || side === 1 ? side : null, rt: Math.max(0, Math.round(+rt || 0)) };
  }

  function sec(ms) { return (Math.round(ms / 100) / 10).toFixed(1).replace('.', ',') + ' с'; }
  function median(xs) { const s = xs.slice().sort((a, b) => a - b), m = s.length >> 1; return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : 0; }
  const sideWord = (p, s) => (s === 0 ? PAIRS[p].a : PAIRS[p].b);
  const sideBtn = (p, s) => (s === 0 ? PAIRS[p].sa : PAIRS[p].sb);

  /** Per-pair ledger from a finished run. */
  function ledger(run) {
    const L = PAIRS.map((P, p) => ({ p, k: P.k, word: null, scene: null, wrt: 0, srt: 0 }));
    run.items.forEach((it, i) => {
      const a = run.ans[i]; if (!a) return;
      const row = L[it.p];
      if (it.type === 'w') { row.word = a.side; row.wrt = a.rt; } else { row.scene = a.side; row.srt = a.rt; }
    });
    L.forEach(row => { row.valid = row.word !== null && row.scene !== null; row.split = row.valid && row.word !== row.scene; });
    return L;
  }

  /** Reveal from the per-pair ledger (also used by the share-state decoder, which has no reaction times). */
  function fromLedger(L, headOverride) {
    const valid = L.filter(x => x.valid);
    const splits = valid.filter(x => x.split);
    const out = { ledger: L, nValid: valid.length, nSplit: splits.length, twist: TWIST, honesty: HONESTY };
    if (!valid.length) {
      return Object.assign(out, { tier: -1, code: '', name: 'ВРЕМЯ БЫСТРЕЕ', lines: ['Ни одна пара не собралась целиком — сравнивать нечего.'],
        quote: null, receipt: '', second: '', title: '', head: -1, chips: [], share: '', card: [] });
    }
    const tier = Math.min(3, splits.length);
    Object.assign(out, { tier, code: TIERS[tier].code, name: TIERS[tier].name });
    if (tier === 0) {
      // Fastest scene choice among valid pairs; ties → fixed pair order.
      const best = valid.slice().sort((x, y) => (x.srt - y.srt) || (x.p - y.p))[0];
      out.head = -1;
      out.lines = ['Словом и ценой — одно и то же, ' + valid.length + ' из\u00a0' + valid.length + '.'];
      out.quote = { lead: 'Быстрее всего:', scene: PAIRS[best.p].scene, btn: sideBtn(best.p, best.scene), time: best.srt ? sec(best.srt) : '' };
      out.receipt = ''; out.second = ''; out.title = '';
      out.chips = ['монолит', 'самый быстрый выбор'];
      out.share = 'У меня МОНОЛИТ: ни одного двойного дна. А у тебя?';
      out.card = ['МОНОЛИТ', 'НИ ОДНОГО ДВОЙНОГО ДНА', 'СЛОВОМ И ДЕЛОМ: ' + valid.length + ' ИЗ ' + valid.length];
      return out;
    }
    // Head = slowest-scene split; ties → fixed pair order (СВОБОДА, УСПЕХ, ПРАВДА, НОВОЕ).
    let head = splits.slice().sort((x, y) => (y.srt - x.srt) || (x.p - y.p))[0];
    if (headOverride != null) head = splits.find(x => x.p === headOverride) || head;
    const P = PAIRS[head.p];
    const W = sideWord(head.p, head.word), S = sideWord(head.p, head.scene);
    out.head = head.p;
    out.split = { word: W, scene: S };
    out.lines = tier === 3 ? ['Выбор зависит от цены, а не от слова.'] : [];
    out.headline = ['СЛОВОМ: ' + W + '.', 'КОГДА ДОРОГО: ' + S + '.'];
    out.quote = { lead: '', scene: P.scene, btn: sideBtn(head.p, head.scene), time: '' };
    // Facts only: a fast word, and a slow scene only under the hesitation rule (≥ 2× own scene median and ≥ 2.5 s).
    const parts = [];
    if (head.wrt > 0 && head.wrt < 1500) parts.push('Словом — за ' + sec(head.wrt) + '.');
    const med = median(valid.map(x => x.srt).filter(x => x > 0));
    if (head.srt >= 2500 && med > 0 && head.srt >= 2 * med) parts.push('Когда дорого — ' + sec(head.srt) + '.');
    out.receipt = parts.join(' ');
    const rest = splits.filter(x => x !== head).sort((x, y) => (y.srt - x.srt) || (x.p - y.p));
    out.second = tier === 2 && rest[0] ? 'И ещё: словом ' + sideWord(rest[0].p, rest[0].word) + ', когда дорого — ' + sideWord(rest[0].p, rest[0].scene) + '.' : '';
    out.title = P.t[head.word === 0 ? 0 : 1];
    out.chips = tier === 3 ? ['цена, а не слово', 'словом / когда дорого', 'прозвище'] : ['словом / когда дорого', 'цитата сцены', 'прозвище'];
    out.share = tier === 3
      ? 'У меня ХАМЕЛЕОН: выбор зависит от цены, а не от слова. А у тебя?'
      : 'У меня ' + TIERS[tier].name + ': словом ' + W + ', когда дорого — ' + S + '. А у тебя?';
    out.card = [TIERS[tier].name, 'СЛОВОМ: ' + W, 'КОГДА ДОРОГО: ' + S];
    return out;
  }

  function result(run) {
    const res = fromLedger(ledger(run));
    res.state = encode(res);
    return res;
  }

  // ---------- share state: "1" + 4 pair chars ('x' = excluded, else word*2+scene) + head ('-' or pair index) ----------
  function encode(res) {
    if (!res || res.tier < 0) return '';
    return '1' + res.ledger.map(x => (x.valid ? String(x.word * 2 + x.scene) : 'x')).join('') + (res.head >= 0 ? String(res.head) : '-');
  }
  /** Returns a reveal-like object for the sender, or null for anything broken. Never throws. */
  function decode(s) {
    try {
      if (typeof s !== 'string' || !/^1[0-3x]{4}[0-3-]$/.test(s)) return null;
      const L = PAIRS.map((P, p) => {
        const c = s[1 + p];
        if (c === 'x') return { p, k: P.k, word: null, scene: null, wrt: 0, srt: 0, valid: false, split: false };
        const v = +c, w = v >> 1, sc = v & 1;
        return { p, k: P.k, word: w, scene: sc, wrt: 0, srt: 0, valid: true, split: w !== sc };
      });
      const hc = s[5];
      const splits = L.filter(x => x.split);
      if (!L.some(x => x.valid)) return null;
      if (splits.length === 0 && hc !== '-') return null;
      if (splits.length > 0 && (hc === '-' || !L[+hc].split)) return null;
      const res = fromLedger(L, hc === '-' ? null : +hc);
      res.state = s;
      return res;
    } catch (e) { return null; }
  }

  function friendTop(f) { return 'У ДРУГА: ' + f.name + '. А У ТЕБЯ?'; }
  function compareLine(f, me) {
    const desc = r => r.name + (r.split ? ' (' + r.split.word + ' → ' + r.split.scene + ')' : '');
    if (me.tier < 0) return 'У друга — ' + desc(f) + '. У тебя пары не собрались.';
    if (f.tier === me.tier && f.head === me.head && f.head >= 0) return 'У друга то же дно: ' + desc(f) + '.';
    if (f.tier === me.tier) return 'У друга тоже ' + f.name + '. У тебя — ' + desc(me) + '.';
    return 'У друга — ' + desc(f) + '. У тебя — ' + desc(me) + '.';
  }

  /** All visible text of a reveal, for tests (no undefined / NaN / empty). */
  function texts(res) {
    const t = [res.twist, res.name, res.honesty].concat(res.lines || [], res.headline || [], res.card || []);
    if (res.quote) t.push(res.quote.scene, res.quote.btn);
    if (res.quote && res.quote.lead) t.push(res.quote.lead);
    ['receipt', 'second', 'title', 'share'].forEach(k => { if (res[k]) t.push(res[k]); });
    return t;
  }

  // ---------- simulation ----------
  /**
   * model: 'uniform' | 'spec' | 'tight'.
   *  spec  = true side per pair; word matches it with p_w ~ U[0.7,0.95], scene with p_s ~ U[0.6,0.9] (per player), 5% timeouts.
   *  tight = same with p_w ~ U[0.85,0.98], p_s ~ U[0.8,0.95] (better-matched items / more consistent people).
   */
  function playOne(model, r) {
    const run = newRun(r);
    const range = { spec: [0.7, 0.95, 0.6, 0.9], tight: [0.85, 0.98, 0.8, 0.95] }[model];
    const pw = range ? range[0] + r() * (range[1] - range[0]) : 0.5;
    const ps = range ? range[2] + r() * (range[3] - range[2]) : 0.5;
    const truth = [0, 1, 2, 3].map(() => (r() < 0.5 ? 0 : 1));
    run.items.forEach((it, i) => {
      const lim = it.type === 'w' ? WORD_MS : SCENE_MS;
      if (r() < 0.05) { answer(run, i, null, lim); return; }
      let side;
      if (!range) side = r() < 0.5 ? 0 : 1;
      else { const p = it.type === 'w' ? pw : ps; side = r() < p ? truth[it.p] : 1 - truth[it.p]; }
      const rt = it.type === 'w' ? 400 + r() * 2400 : 1500 + r() * 5400;
      answer(run, i, side, rt);
    });
    return result(run);
  }
  function simulate(model, n, seed) {
    const r = rng(seed || 7);
    const tiers = { blank: 0, monolith: 0, crack: 0, double: 0, chameleon: 0 };
    const flips = PAIRS.map(() => ({ valid: 0, split: 0 }));
    const titles = {}, heads = {};
    let anySplit = 0, receipts = 0, seconds = 0;
    for (let k = 0; k < n; k++) {
      const res = playOne(model, r);
      tiers[res.tier < 0 ? 'blank' : res.code]++;
      if (res.nSplit > 0) anySplit++;
      if (res.receipt) receipts++;
      if (res.second) seconds++;
      if (res.title) titles[res.title] = (titles[res.title] || 0) + 1;
      if (res.head >= 0) heads[PAIRS[res.head].k] = (heads[PAIRS[res.head].k] || 0) + 1;
      res.ledger.forEach((x, p) => { if (x.valid) { flips[p].valid++; if (x.split) flips[p].split++; } });
    }
    return { n, tiers, anySplit, receipts, seconds, titles, heads, flipRate: flips.map((f, p) => ({ k: PAIRS[p].k, rate: f.valid ? f.split / f.valid : 0 })) };
  }

  const api = { PAIRS, TIERS, WORD_MS, SCENE_MS, N, WORD_Q, TWIST, HONESTY, rng, stream, newRun, view, answer, ledger, fromLedger, result, encode, decode, friendTop, compareLine, texts, sec, playOne, simulate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GAME_C = api;
})(typeof window !== 'undefined' ? window : globalThis);
