// LAB finalist A «ШАР»: logic + simulation gate. Run: node --test 'product/test/*.test.mjs'
// Print the simulation table: SIM_TABLE=1 node --test product/test/lab-a.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
const G = require('../site/lab/a/game.js');
const { rng } = require('../site/lab/lab.js');
const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'site', 'lab', 'a');
const RUNS = 10000;
const N = G.N;

// ---------- player models ----------
const gauss = r => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());
const logn = (r, med, sig) => med * Math.exp(sig * gauss(r));
const gumbel = r => -Math.log(-Math.log(r() || 1e-9));
// Mild population bias: the cat and the phone are slightly favoured (kept more), per FINALISTS.md.
const BIAS = G.ITEMS.map(it => ({ cat: 1.35, phone: 1.25 }[it.code] || 1));
const gamma1 = r => -Math.log(r() || 1e-9); // Gamma(1) → normalized = Dirichlet(1,…,1)

/**
 * Play one game. model: 'uniform' (random throws, random twist) or 'pref' (Dirichlet-like
 * preference weights × bias; throws the least-wanted item with Gumbel noise).
 * Timing: throw 1 includes reading (median 2.2 s); throws 2–7 median 0.45 + 0.25·log2(tiles left) s,
 * σ 0.45 lognormal, with 15% "dilemma" spikes ×2.6; a time ≥ the fuse is a timeout → random auto-throw (as in the UI).
 */
function playOne(r, model, friend, bias = BIAS) {
  const run = G.newRun();
  const w = bias.map(b => gamma1(r) * b);
  for (let k = 0; k < G.THROWS; k++) {
    const rem = G.remaining(run);
    let pick;
    if (model === 'uniform') pick = rem[Math.floor(r() * rem.length)];
    else pick = rem.reduce((best, i) => { const u = Math.log(w[i]) + 0.6 * gumbel(r); return !best || u < best.u ? { i, u } : best; }, null).i;
    // Hick-style: fewer tiles left → faster decision (median 1.15 s with 7 left … 0.7 s with 2 left).
    let ms = k === 0 ? logn(r, 2200, 0.5) : logn(r, 450 + 250 * Math.log2(rem.length), 0.45) * (r() < 0.15 ? 2.6 : 1);
    if (k > 0 && ms >= G.FUSE[k]) G.throwItem(run, G.autoPick(run, r), null, true);
    else G.throwItem(run, pick, ms, false);
  }
  const kept = G.remaining(run)[0];
  const jump = model === 'uniform' ? r() < 0.5 : r() < 0.35 + 0.3 * Math.min(1, w[kept] / Math.max(...w));
  return { run, jump };
}

function simulate(model, seed, runs = RUNS, bias = BIAS) {
  const r = rng(seed);
  const s = { kept: Array(N).fill(0), first: Array(N).fill(0), sentences: new Map(), autoBranch: 0, own: 0, contra: 0, pairs: {},
    jump: 0, fast: 0, almost: 0, hes: 0, anyAuto: 0, autos: 0, keptAfterAuto7: 0 };
  for (let n = 0; n < runs; n++) {
    const { run, jump } = playOne(r, model, null, bias);
    const res = G.finish(run, jump, null, 1), res2 = G.finish(run, jump, null, 2);
    s.kept[res.keptIdx]++; s.first[run.throws[0].i]++;
    if (res.auto) s.autoBranch++;
    else {
      s.own++;
      s.sentences.set(res.sentence, (s.sentences.get(res.sentence) || 0) + 1);
      if (res2.contra) { s.contra++; s.pairs[res2.contra.head] = (s.pairs[res2.contra.head] || 0) + 1; }
    }
    if (res.jump) s.jump++;
    if (res.receipts.some(l => l.k === 'first' && l.text.includes('(за '))) s.fast++;
    if (res.receipts.some(l => l.k === 'almost')) s.almost++;
    if (res.receipts.some(l => l.k === 'hes')) s.hes++;
    if (res.autos) s.anyAuto++;
    s.autos += res.autos;
    if (run.throws[G.THROWS - 1].auto) s.keptAfterAuto7++;
  }
  const pct = x => x / runs;
  return {
    autoBranch: pct(s.autoBranch), kept: s.kept.map(pct), first: s.first.map(pct), sentenceCount: s.sentences.size,
    topSentence: Math.max(...s.sentences.values()) / s.own, contra: s.contra / s.own,
    pairs: Object.fromEntries(Object.entries(s.pairs).map(([k, v]) => [k, v / s.own])),
    jump: pct(s.jump), fast: pct(s.fast), almost: pct(s.almost), hes: pct(s.hes),
    anyAuto: pct(s.anyAuto), autoPerThrow: s.autos / (runs * (G.THROWS - 1)), auto7: pct(s.keptAfterAuto7),
  };
}

const U = simulate('uniform', 11);
const P = simulate('pref', 22);

if (process.env.SIM_TABLE) {
  // Sensitivity only (not gated): a population that strongly protects the cat (bias ×3).
  const C = simulate('pref', 33, RUNS, G.ITEMS.map(it => (it.code === 'cat' ? 3 : it.code === 'phone' ? 1.25 : 1)));
  const f = x => (100 * x).toFixed(1) + '%';
  const rows = ['| Item | kept, uniform | kept, preference | first thrown, preference | kept, cat ×3 (stress) |', '|---|---|---|---|---|'];
  G.ITEMS.forEach((it, i) => rows.push(`| ${it.name} | ${f(U.kept[i])} | ${f(P.kept[i])} | ${f(P.first[i])} | ${f(C.kept[i])} |`));
  rows.push('', '| Line / rate | uniform | preference | cat ×3 |', '|---|---|---|---|');
  [['v1: most common meaning sentence (of own reveals)', 'topSentence'], ['v2: contradiction fires (of own reveals)', 'contra'],
   ['jump (ПРЫГАЮ Я)', 'jump'], ['«за X с» on first throw (<1.5 s)', 'fast'], ['«Почти остался» (throw 7 chosen)', 'almost'], ['«Дольше всего в руках» (hesitation rule)', 'hes'],
   ['any auto-throw in the game', 'anyAuto'], ['auto-throws per fused throw', 'autoPerThrow'], ['throw 7 was auto', 'auto7'], ['honest «ШАР РЕШИЛ ЗА ТЕБЯ» reveal', 'autoBranch']]
    .forEach(([l, k]) => rows.push(`| ${l} | ${f(U[k])} | ${f(P[k])} | ${f(C[k])} |`));
  rows.push(`| v1: distinct meaning sentences seen | ${U.sentenceCount} | ${P.sentenceCount} | ${C.sentenceCount} |`);
  rows.push('', '| v2 contradiction pair (of own reveals) | uniform | preference |', '|---|---|---|');
  G.PAIRS.forEach(p => { const h = G.ITEMS.find(i => i.code === p.a).value + ' × ' + G.ITEMS.find(i => i.code === p.b).value; rows.push(`| ${h} | ${f(U.pairs[h] || 0)} | ${f(P.pairs[h] || 0)} |`); });
  console.log('\n' + rows.join('\n') + '\n');
}

// ---------- simulation gate ----------
test('sim gate: no kept item above 30% (preference model) and ≥3 headline groups ≥10%', () => {
  assert.ok(Math.max(...P.kept) <= 0.30, 'max kept ' + Math.max(...P.kept));
  assert.ok(P.kept.filter(x => x >= 0.10).length >= 3);
  assert.ok(Math.max(...U.kept) <= 0.20);
  assert.ok(P.kept.every(x => x > 0.03), 'every item is kept by someone');
});
test('sim gate v1: all 56 meaning sentences reachable; none above 15%', () => {
  assert.equal(U.sentenceCount, 56);
  assert.ok(P.topSentence <= 0.15, 'top sentence ' + P.topSentence);
  assert.ok(U.topSentence <= 0.15);
});
test('sim gate v2: contradiction fires for 25–60% (preference model), every pair fires', () => {
  assert.ok(P.contra >= 0.25 && P.contra <= 0.60, 'contra ' + P.contra);
  assert.ok(U.contra >= 0.25 && U.contra <= 0.60, 'contra uniform ' + U.contra);
  assert.equal(Object.keys(P.pairs).length, 4);
});
test('sim gate: optional receipt lines fire sometimes, never always', () => {
  for (const k of ['fast', 'almost', 'hes', 'anyAuto']) { assert.ok(P[k] > 0.01 && P[k] < 0.99, k + ' ' + P[k]); }
  assert.ok(P.autoPerThrow < 0.15, 'timeouts stay the exception: ' + P.autoPerThrow);
  assert.ok(P.jump > 0.2 && P.jump < 0.8);
});

// ---------- logic ----------
const BAD = /undefined|NaN|null|\(а\)|\(ы\)|\[object|НЯНЬКА|ничего не вычислено/;
const PAST = /(?:^|[^а-яё])(?:выбрал|прыгнул|оставил|выкинул|выбросил|сбросил|решил|держал|отдал|сохранил|спас)(?:а|о|и)?(?![а-яё])/i;
const GENDERED = /(?:^|[^а-яё])(?:готов|готова|один|одна|сам|сама|рад|рада|первым|первой)(?![а-яё])/i;
function checkTexts(res) {
  for (const t of G.texts(res)) {
    assert.equal(typeof t, 'string'); assert.ok(t.trim().length > 0, 'empty line');
    assert.ok(!BAD.test(t), 'bad text: ' + t);
    const tt = t.replace(/^ШАР РЕШИЛ ЗА ТЕБЯ:/, '').replace(/^Первым (за борт|по выбору)/, ''); // balloon/item is the subject there
    assert.ok(!PAST.test(tt), 'past tense about the player: ' + t);
    if (/Ты |Держусь|хочешь|хочу|бережёшь|берегу|тянет/.test(t)) assert.ok(!GENDERED.test(t), 'gendered word about the player: ' + t);
  }
}
test('both variants: no undefined / NaN / empty / gendered text across 20k simulated reveals (+friend)', () => {
  const r = rng(5);
  for (let n = 0; n < 20000; n++) {
    const v = 1 + (n % 2);
    const friend = n % 3 ? null : G.decodeState(String(Math.floor(r() * N)) + (r() < 0.5 ? 'j' : 'd'));
    const { run, jump } = playOne(r, n % 4 < 2 ? 'pref' : 'uniform');
    const res = G.finish(run, jump, friend, v);
    checkTexts(res);
    assert.equal(res.variant, v);
    assert.match(res.code, /^[a-z]+$/);
    assert.ok(res.receipts.length >= 1 && res.receipts.length <= 3);
    if (res.auto) {
      assert.ok(res.share === null && res.card === null && res.sentence === null && res.state === null && res.compare === null);
      assert.equal(res.headline[0], 'ШАР РЕШИЛ ЗА ТЕБЯ:');
      continue;
    }
    const st = G.decodeState(res.state);
    assert.equal(st.keptIdx, res.keptIdx); assert.equal(st.jump, res.jump); assert.equal(st.variant, v);
    assert.equal(res.card.length, 3);
    assert.ok(/\?$/.test(res.share) && !/https?:|\.io/.test(res.share));
    assert.ok(res.sentence.startsWith('Ты держишься за ') && res.sentence.includes('А\u00a0легче всего отпускаешь '));
    if (v === 2) {
      assert.equal(res.compass.length, 4); assert.equal(new Set(res.compass).size, 4);
      assert.equal(res.compass[0], res.kept.value);
      assert.equal(st.top3.length, 3);
      assert.ok(res.share.startsWith('Мой компас: ') && res.share.split('\u00a0> ').length === 3);
    } else {
      assert.equal(res.compass, null); assert.equal(res.contra, null);
      assert.ok(res.share.endsWith('А что спасёшь ты?'));
    }
    if (friend) assert.ok(res.compare && res.compare.startsWith('У друга'));
  }
});
test('v2 compass skips auto-throws and contradiction only fires on a real opposite pair in the top 3', () => {
  const mk = (order, autos = []) => { const run = G.newRun(); order.forEach((i, k) => G.throwItem(run, i, 1000, autos.includes(k))); return run; };
  // throws: money, phone, letter, passport, keys(auto), cat, manuscript → kept cup
  const run = mk([0, 1, 2, 3, 4, 5, 6], [4]);
  assert.deepEqual(G.compass(run), [7, 6, 5, 3, 2, 1, 0]);
  const res = G.finish(run, true, null, 2);
  assert.deepEqual(res.compass, ['ПРИЗНАНИЕ', 'МЕЧТА', 'ЗАБОТА', 'СВОБОДА']);
  assert.equal(res.contra.head, 'ПРИЗНАНИЕ × ЗАБОТА');
  assert.ok(res.card[2].startsWith('ПРИЗНАНИЕ × ЗАБОТА: хочу, чтобы меня заметили'));
  assert.equal(res.card[0], 'МОЙ КОМПАС — ЧТО МНЕ ВАЖНЕЕ:');
  // no pair in top 3: ЗАБОТА, МЕЧТА, ДОМ
  const r2 = G.finish(mk([3, 0, 7, 1, 2, 4, 6]), false, null, 2);
  assert.deepEqual(r2.compass.slice(0, 3), ['ЗАБОТА', 'МЕЧТА', 'ДОМ']);
  assert.equal(r2.contra, null); assert.equal(r2.card[2], r2.sentenceMe);
  // every pair fires and has both a «ты» and a «я» line
  for (const p of G.PAIRS) {
    const a = G.ITEMS.findIndex(i => i.code === p.a), b = G.ITEMS.findIndex(i => i.code === p.b);
    const c = G.contradiction([a, a === 0 || b === 0 ? 7 : 0, b]);
    assert.ok(c && c.line && c.me);
  }
});
test('every branch reachable: variants, jump/drop, each kept item, receipts, contra/no contra, friend', () => {
  const seen = new Set();
  const r = rng(9);
  for (let n = 0; n < 6000; n++) {
    const v = 1 + (n % 2);
    const friend = n % 3 === 0 ? G.decodeState((n % 8) + 'j2' + ((n + 1) % 8) + ((n + 2) % 8)) : n % 3 === 1 ? G.decodeState((n % 8) + 'd1') : null;
    const { run, jump } = playOne(r, 'pref');
    const res = G.finish(run, jump, friend, v);
    seen.add('kept_' + res.code); seen.add(res.jump ? 'jump' : 'drop'); seen.add(res.auto ? 'autoBranch' : 'ownBranch');
    ['first', 'almost', 'hes'].forEach(k => seen.add(k + (res.receipts.some(l => l.k === k) ? '+' : '-')));
    seen.add(res.receipts[0].text.includes('(за ') ? 'fast+' : 'fast-');
    if (!res.auto) {
      seen.add('v' + v);
      if (v === 2) seen.add(res.contra ? 'contra' : 'nocontra');
      if (friend) seen.add(res.compare.includes('Компас друга') ? 'cmp-compass' : friend.keptIdx === res.keptIdx ? 'same' : 'diff');
    }
    run.throws.forEach((t, k) => { if (t.auto) seen.add('auto@' + k); });
  }
  const need = ['v1', 'v2', 'contra', 'nocontra', 'cmp-compass', 'autoBranch', 'ownBranch', 'jump', 'drop', 'first+', 'almost+', 'almost-', 'hes+', 'hes-', 'fast+', 'fast-', 'same', 'diff']
    .concat(G.ITEMS.map(it => 'kept_' + it.code), [1, 2, 3, 4, 5, 6].map(k => 'auto@' + k));
  need.forEach(k => assert.ok(seen.has(k), 'unreachable: ' + k));
  assert.ok(!seen.has('first-'), 'throw 1 is the start tap, so «Первым за борт» always shows');
});
test('auto-throws are never quoted; the fuse-decided basket gets the honest reveal in both variants', () => {
  const run = G.newRun();
  G.throwItem(run, 0, 900, false);
  [1, 2, 3, 4, 5, 6].forEach(i => G.throwItem(run, i, null, true));
  for (const v of [1, 2]) {
    const res = G.finish(run, true, { keptIdx: 1, jump: true }, v);
    const txt = res.receipts.map(l => l.text).join(' | ');
    assert.equal(res.receipts.length, 2, txt);
    for (const i of [1, 2, 3, 4, 5, 6]) assert.ok(!txt.toUpperCase().includes(G.ITEMS[i].name));
    assert.ok(txt.includes('(за 0,9 с)'));
    assert.ok(res.auto && txt.includes('Без тебя за борт: 6 из 7'));
    assert.equal(res.share, null);
    checkTexts(res);
  }
  const r3 = G.newRun(); [0, 1, 2, 3, 4, 5, 6].forEach((i, k) => G.throwItem(r3, i, 1000, k >= 1 && k <= 3));
  const res3 = G.finish(r3, true, null, 2); assert.equal(res3.auto, false); checkTexts(res3);
  for (const i of [1, 2, 3]) { assert.ok(!res3.receipts.map(l => l.text).join().toUpperCase().includes(G.ITEMS[i].name)); assert.ok(!res3.compass.includes(G.ITEMS[i].value)); }
  const r4 = G.newRun(); [0, 1, 2, 3, 4, 5, 6].forEach((i, k) => G.throwItem(r4, i, 1000, k === 6));
  assert.equal(G.finish(r4, false, null, 1).auto, true);
  const r2 = G.newRun(); [0, 1, 2, 3, 4, 5, 6].forEach((i, k) => G.throwItem(r2, i, k ? 1000 : null, k === 0));
  const res2 = G.finish(r2, true, null, 1); checkTexts(res2);
  assert.ok(res2.receipts[0].text.startsWith('Первым по выбору'));
});
test('hesitation rule: ≥2× median and ≥2.5 s, throws 2–7 only', () => {
  const mk = times => { const run = G.newRun(); times.forEach((ms, k) => G.throwItem(run, k, ms, false)); return run; };
  assert.equal(G.hesitation(mk([9000, 1000, 1000, 1000, 1000, 1000, 1000])), null, 'throw 1 (reading) excluded');
  assert.equal(G.hesitation(mk([1000, 2400, 900, 900, 900, 900, 900])), null, 'under 2.5 s');
  assert.equal(G.hesitation(mk([1000, 3000, 1600, 1600, 1600, 1500, 1500])), null, 'under 2× median');
  const h = G.hesitation(mk([1000, 3600, 1000, 900, 800, 700, 1000]));
  assert.equal(h.i, 1); assert.equal(h.ms, 3600);
  const res = G.finish(mk([1000, 3600, 1000, 900, 800, 700, 1000]), true, null, 1);
  assert.ok(res.receipts.some(l => l.text === 'Дольше всего в руках: телефон со всеми фото (3,6 с)'));
});
test('v1 copy: headlines, sentence, extra line, share, card', () => {
  const mk = keep => { const run = G.newRun(); for (let i = 0; i < N; i++) if (i !== keep) G.throwItem(run, i, 1200, false); return run; };
  const cat = G.finish(mk(5), true, null, 1);
  assert.deepEqual(cat.headline, ['ПРЫЖОК РАДИ:', 'ЧУЖОЙ КОТ']);
  assert.equal(cat.sentence, 'Ты держишься за тех, кто на тебя рассчитывает. А\u00a0легче всего отпускаешь запас на чёрный день.');
  assert.equal(cat.extra, 'Ради этого не жалко и себя.');
  assert.equal(cat.share, 'В моём шаре остался ЧУЖОЙ КОТ. А что спасёшь ты?');
  assert.deepEqual(cat.card, ['ПРЫЖОК РАДИ:', 'ЧУЖОЙ КОТ', 'Держусь за тех, кто на меня рассчитывает. А\u00a0легче всего отпускаю запас на чёрный день.']);
  const cup = G.finish(mk(7), false, { keptIdx: 7, jump: false, variant: 1, top3: null }, 1);
  assert.deepEqual(cup.headline, ['ВЫКИНУТО ВСЁ. ПОСЛЕДНИМ:', 'КУБОК С ТВОИМ ИМЕНЕМ']);
  assert.equal(cup.extra, 'Но себя ты бережёшь ещё больше.');
  assert.ok(cup.share.includes('КУБОК С МОИМ ИМЕНЕМ') && cup.card[1] === 'КУБОК С МОИМ ИМЕНЕМ' && cup.card[2].startsWith('Держусь за своё имя.'));
  assert.equal(cup.compare, 'У друга остался: КУБОК. У тебя тоже.');
  assert.equal(G.finish(mk(6), false, null, 1).headline[0], 'ВЫКИНУТО ВСЁ. ПОСЛЕДНЕЙ:');
  assert.equal(G.finish(mk(4), false, null, 1).headline[0], 'ВЫКИНУТО ВСЁ. ПОСЛЕДНИМИ:');
  assert.equal(G.finish(mk(5), false, G.decodeState('6j'), 1).compare, 'У друга осталась: РУКОПИСЬ. У тебя: КОТ.');
  for (const it of G.ITEMS) { assert.ok(it.hold && it.drop && it.value && it.they); assert.ok(!/тебя|тебе/.test((it.holdMe || '') + it.they)); }
  assert.ok(!G.ITEMS.some(it => it.value === 'ДОЛГ'));
});
test('friend state: round trip with variant; legacy and broken states', () => {
  for (let k = 0; k < N; k++) for (const j of [true, false]) {
    assert.deepEqual(G.decodeState(G.encodeState(k, j, 1)), { keptIdx: k, jump: j, variant: 1, top3: null });
    const t = [k, (k + 3) % N, (k + 5) % N];
    assert.deepEqual(G.decodeState(G.encodeState(k, j, 2, t)), { keptIdx: k, jump: j, variant: 2, top3: t });
    assert.deepEqual(G.decodeState(String(k) + (j ? 'j' : 'd')), { keptIdx: k, jump: j, variant: null, top3: null });
  }
  for (const s of [undefined, null, '', ' ', '8j', '5x', '55j', 'j5', '-1j', '5', 'cat', '5j&', '%', '{"a":1}', 42, {}, '５j', '5j3', '5j2', '5j21', '5j255', '5j251', '5j215', '5j112', '5j289'])
    assert.equal(G.decodeState(s), null, 'should reject ' + JSON.stringify(s));
  assert.equal(G.guess({ keptIdx: 3, jump: true }, 3), true);
  assert.equal(G.guess({ keptIdx: 3, jump: true }, 4), false);
  assert.equal(G.guess(null, 4), false);
});
test('throwItem guards', () => {
  const run = G.newRun(); G.throwItem(run, 0, 100, false);
  assert.throws(() => G.throwItem(run, 0, 100, false), /already/);
  assert.throws(() => G.throwItem(run, 8, 100, false), /bad item/);
  assert.throws(() => G.finish(run, true, null, 1), /not complete/);
  for (let i = 1; i < 7; i++) G.throwItem(run, i, 100, false);
  assert.throws(() => G.throwItem(run, 7, 100, false), /no throws/);
});
test('fuse schedule (frozen since round 1): no fuse on the start tap, 4 s first, gust halves it, floor ≥1.5 s', () => {
  assert.deepEqual(G.FUSE, [0, 4000, 3000, 2000, 1900, 1800, 1700]);
  assert.equal(G.GUST_AT, 3);
});

// ---------- page & og ----------
test('og.json: one result page per item code, slugs latin, version bumped', () => {
  const og = JSON.parse(readFileSync(join(DIR, 'og.json'), 'utf8'));
  assert.deepEqual(og.results.map(r => r.code).sort(), G.ITEMS.map(it => it.code).sort());
  og.results.forEach(r => { assert.match(r.code, /^[a-z0-9-]+$/); assert.ok(r.big && r.line); assert.ok(!BAD.test(r.big + r.line) && !PAST.test(r.big + r.line)); });
  assert.ok(og.title && og.cta);
  assert.ok(og.v >= 2);
});
test('page: kit wiring, variants, events, weight', () => {
  const html = readFileSync(join(DIR, 'index.html'), 'utf8');
  for (const s of ['../lab.css', '../lab.js', 'game.js', "LAB.init('a')", "track('view')", "track('start')", "track('done')", "'kept_'", "'jump'", "'drop'", "'guess_ok'", "'guess_no'",
    "VP + 'view'", "VP + 'done'", "VP + 'share_ok'", "VP + 'rec_'", "'contra_shown'", "'contra_none'", "params.get('v')", 'bw_lab_a_v',
    'L.recog(', 'L.share(', 'LAB.timer(', 'LAB.canvasImg(', 'document.fonts.ready', 'удерживай картинку, чтобы сохранить', 'ПОКАЗАТЬ ДРУГУ', 'ещё раз',
    'ШАР ПАДАЕТ. ВЫКИДЫВАЙ ЛИШНЕЕ.', 'ПОРЫВ ВЕТРА!', 'ШАР НЕ ЖДЁТ', 'ПРЫГАЮ Я', 'ВЫКИДЫВАЮ', 'ОСТАЛАСЬ ОДНА ВЕЩЬ', 'ЕЩЁ РАЗ — БЫСТРЕЕ', 'bw_lab_a_guessed_', 'sessionStorage',
    'У ДРУГА В ШАРЕ ОСТАЛОСЬ ОДНО. УГАДАЕШЬ?', 'ТЕПЕРЬ ТВОЙ ШАР', 'ТВОЙ КОМПАС', 'ПРОТИВОРЕЧИЕ: '])
    assert.ok(html.includes(s), 'missing ' + s);
  assert.ok(!/\(а\)|ПРОЗВИЩЕ|ничего не вычислено/.test(html));
  // share button comes before the recognition block and the card
  assert.ok(html.indexOf('id="bShare"') < html.indexOf('id="recog"') && html.indexOf('id="bShare"') < html.indexOf('id="card"'));
  assert.ok(!/https?:\/\/(?!dimacloud\.github\.io)/.test(html.replace(/<meta[^>]*>/g, '').replace(/xmlns='http:\/\/www\.w3\.org\/2000\/svg'/g, '')), 'no external requests');
  const kb = (statSync(join(DIR, 'index.html')).size + statSync(join(DIR, 'game.js')).size) / 1024;
  assert.ok(kb < 150, kb + ' KB');
});
