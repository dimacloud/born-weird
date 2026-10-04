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
  return { run, res: G.finish(run, jump, friend || null) };
}

function simulate(model, seed, runs = RUNS, bias = BIAS) {
  const r = rng(seed);
  const s = { kept: Array(N).fill(0), first: Array(N).fill(0), titles: new Map(), autoBranch: 0, jump: 0, fast: 0, almost: 0, hes: 0, anyAuto: 0, autos: 0, keptAfterAuto7: 0 };
  for (let n = 0; n < runs; n++) {
    const { run, res } = playOne(r, model, null, bias);
    s.kept[res.keptIdx]++; s.first[run.throws[0].i]++;
    if (res.auto) s.autoBranch++; else s.titles.set(res.title, (s.titles.get(res.title) || 0) + 1);
    if (res.jump) s.jump++;
    if (res.receipts.some(l => l.k === 'first' && l.text.includes('(за\u00a0'))) s.fast++;
    if (res.receipts.some(l => l.k === 'almost')) s.almost++;
    if (res.receipts.some(l => l.k === 'hes')) s.hes++;
    if (res.autos) s.anyAuto++;
    s.autos += res.autos;
    if (run.throws[G.THROWS - 1].auto) s.keptAfterAuto7++;
  }
  const pct = x => x / runs;
  return {
    autoBranch: pct(s.autoBranch), kept: s.kept.map(pct), first: s.first.map(pct), titleCount: s.titles.size,
    topTitle: Math.max(...s.titles.values()) / runs, jump: pct(s.jump), fast: pct(s.fast), almost: pct(s.almost), hes: pct(s.hes),
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
  rows.push('', '| Line / rate | uniform | preference |', '|---|---|---|');
  [['jump (ПРЫГАЮ Я)', 'jump'], ['«за X с» on first throw (<1.5 s)', 'fast'], ['«Почти остался» (throw 7 chosen)', 'almost'], ['«Дольше всего в руках» (hesitation rule)', 'hes'],
   ['any auto-throw in the game', 'anyAuto'], ['auto-throws per fused throw', 'autoPerThrow'], ['throw 7 was auto (kept item partly by chance)', 'auto7'], ['honest «ШАР РЕШИЛ ЗА ТЕБЯ» reveal (throw 7 auto or ≥4 autos)', 'autoBranch'], ['most common title', 'topTitle']]
    .forEach(([l, k]) => rows.push(`| ${l} | ${f(U[k])} | ${f(P[k])} |`));
  rows.push(`| distinct titles seen | ${U.titleCount} | ${P.titleCount} |`);
  console.log('\n' + rows.join('\n') + '\n');
}

// ---------- simulation gate ----------
test('sim gate: no kept item above 30% (preference model) and ≥3 headline groups ≥10%', () => {
  assert.ok(Math.max(...P.kept) <= 0.30, 'max kept ' + Math.max(...P.kept));
  assert.ok(P.kept.filter(x => x >= 0.10).length >= 3);
  assert.ok(Math.max(...U.kept) <= 0.20);
  assert.ok(P.kept.every(x => x > 0.03), 'every item is kept by someone');
});
test('sim gate: every title (8 nouns × 7 tails = 56) is reachable; none dominates', () => {
  assert.equal(U.titleCount, 56);
  assert.ok(P.topTitle < 0.10);
});
test('sim gate: optional receipt lines fire sometimes, never always', () => {
  for (const k of ['fast', 'almost', 'hes', 'anyAuto']) { assert.ok(P[k] > 0.01 && P[k] < 0.99, k + ' ' + P[k]); }
  assert.ok(P.autoPerThrow < 0.15, 'timeouts stay the exception: ' + P.autoPerThrow);
  assert.ok(P.jump > 0.2 && P.jump < 0.8);
});

// ---------- logic ----------
const BAD = /undefined|NaN|null|\(а\)|\[object/;
const PAST = /(?:^|[^а-яё])(?:выбрал|прыгнул|оставил|выкинул|выбросил|сбросил|решил|держал|отдал|сохранил|спас)(?![а-яё]*с[яь])/i;
function checkTexts(res) {
  for (const t of G.texts(res)) {
    assert.equal(typeof t, 'string'); assert.ok(t.trim().length > 0, 'empty line');
    assert.ok(!BAD.test(t), 'bad text: ' + t);
    assert.ok(!PAST.test(t.replace(/^ШАР РЕШИЛ ЗА ТЕБЯ:/, '')), 'past tense about the player: ' + t); // the balloon is the subject there
  }
}
test('no undefined / NaN / empty / gendered text across 20k simulated reveals (+friend compare)', () => {
  const r = rng(5);
  for (let n = 0; n < 20000; n++) {
    const friend = n % 3 ? null : { keptIdx: Math.floor(r() * N), jump: r() < 0.5 };
    const { res } = playOne(r, n % 2 ? 'pref' : 'uniform', friend);
    checkTexts(res);
    assert.match(res.code, /^[a-z]+$/);
    assert.ok(res.receipts.length >= 1 && res.receipts.length <= 3);
    if (res.auto) {
      assert.ok(res.share === null && res.card === null && res.title === null && res.state === null && res.compare === null);
      assert.equal(res.headline[0], 'ШАР РЕШИЛ ЗА ТЕБЯ:');
      assert.ok(!res.headline.join(' ').includes('ПРЫЖОК'));
      continue;
    }
    assert.deepEqual(G.decodeState(res.state), { keptIdx: res.keptIdx, jump: res.jump });
    assert.ok(res.card.length === 3);
    assert.ok(/\?$/.test(res.share) && !/https?:|\.io/.test(res.share));
    if (friend) assert.ok(res.compare && res.compare.startsWith('У друга'));
  }
});
test('every branch reachable: jump/drop, each kept item, each receipt present/absent, friend same/different', () => {
  const seen = new Set();
  const r = rng(9);
  for (let n = 0; n < 5000; n++) {
    const friend = n % 2 ? { keptIdx: Math.floor(r() * N), jump: true } : null;
    const { run, res } = playOne(r, 'pref', friend);
    seen.add('kept_' + res.code); seen.add(res.jump ? 'jump' : 'drop'); seen.add(res.auto ? 'autoBranch' : 'ownBranch');
    ['first', 'almost', 'hes'].forEach(k => seen.add(k + (res.receipts.some(l => l.k === k) ? '+' : '-')));
    seen.add(res.receipts[0].text.includes('(за\u00a0') ? 'fast+' : 'fast-');
    if (friend && !res.auto) seen.add(friend.keptIdx === res.keptIdx ? 'same' : 'diff');
    run.throws.forEach((t, k) => { if (t.auto) seen.add('auto@' + k); });
  }
  const need = ['autoBranch', 'ownBranch', 'jump', 'drop', 'first+', 'almost+', 'almost-', 'hes+', 'hes-', 'fast+', 'fast-', 'same', 'diff']
    .concat(G.ITEMS.map(it => 'kept_' + it.code), [1, 2, 3, 4, 5, 6].map(k => 'auto@' + k));
  need.forEach(k => assert.ok(seen.has(k), 'unreachable: ' + k));
  assert.ok(!seen.has('first-'), 'throw 1 is the start tap, so «Первым за борт» always shows');
});
test('auto-throws are never quoted', () => {
  const run = G.newRun();
  G.throwItem(run, 0, 900, false);
  [1, 2, 3, 4, 5].forEach(i => G.throwItem(run, i, null, true));
  G.throwItem(run, 6, null, true);
  const res = G.finish(run, true, { keptIdx: 1, jump: true });
  const txt = res.receipts.map(l => l.text).join(' | ');
  assert.equal(res.receipts.length, 2, txt);
  assert.ok(res.auto && txt.includes('Без тебя за борт: 6 из 7'));
  assert.equal(res.share, null);
  for (const i of [1, 2, 3, 4, 5, 6]) assert.ok(!txt.includes(G.ITEMS[i].name));
  assert.ok(txt.includes('(за\u00a00,9\u00a0с)'));
  checkTexts(res);
  // 3 autos, throw 7 chosen → own result, autos unquoted
  const r3 = G.newRun(); [0, 1, 2, 3, 4, 5, 6].forEach((i, k) => G.throwItem(r3, i, 1000, k >= 1 && k <= 3));
  const res3 = G.finish(r3, true, null); assert.equal(res3.auto, false); checkTexts(res3);
  for (const i of [1, 2, 3]) assert.ok(!res3.receipts.map(l => l.text).join().includes(G.ITEMS[i].name));
  // throw 7 auto alone → honest branch
  const r4 = G.newRun(); [0, 1, 2, 3, 4, 5, 6].forEach((i, k) => G.throwItem(r4, i, 1000, k === 6));
  assert.equal(G.finish(r4, false, null).auto, true);
  // first throw auto (impossible in the UI) still gives a valid reveal
  const r2 = G.newRun(); [0, 1, 2, 3, 4, 5, 6].forEach((i, k) => G.throwItem(r2, i, k ? 1000 : null, k === 0));
  const res2 = G.finish(r2, true, null); checkTexts(res2);
  assert.ok(res2.receipts[0].text.startsWith('Первым по выбору'));
});
test('hesitation rule: ≥2× median and ≥2.5 s, throws 2–7 only', () => {
  const mk = times => { const run = G.newRun(); times.forEach((ms, k) => G.throwItem(run, k, ms, false)); return run; };
  assert.equal(G.hesitation(mk([9000, 1000, 1000, 1000, 1000, 1000, 1000])), null, 'throw 1 (reading) excluded');
  assert.equal(G.hesitation(mk([1000, 2400, 900, 900, 900, 900, 900])), null, 'under 2.5 s');
  assert.equal(G.hesitation(mk([1000, 3000, 1600, 1600, 1600, 1500, 1500])), null, 'under 2× median');
  const h = G.hesitation(mk([1000, 3600, 1000, 900, 800, 700, 1000]));
  assert.equal(h.i, 1); assert.equal(h.ms, 3600);
  const res = G.finish(mk([1000, 3600, 1000, 900, 800, 700, 1000]), true, null);
  assert.ok(res.receipts.some(l => l.text === 'Дольше всего в руках: ТЕЛЕФОН СО ВСЕМИ ФОТО (3,6 с)'));
});
test('headlines, share text and grammar per item', () => {
  const mk = keep => { const run = G.newRun(); for (let i = 0; i < N; i++) if (i !== keep) G.throwItem(run, i, 1200, false); return run; };
  const cat = G.finish(mk(5), true, null);
  assert.deepEqual(cat.headline, ['В ШАРЕ ОСТАЛСЯ:', 'ЧУЖОЙ КОТ', 'ПРЫЖОК РАДИ: 🐈 КОТ']);
  assert.equal(G.finish(mk(6), false, null).headline[0], 'ВЫКИНУТО ВСЁ. ПОСЛЕДНЕЙ:');
  assert.equal(G.finish(mk(4), false, null).headline[0], 'ВЫКИНУТО ВСЁ. ПОСЛЕДНИМИ:');
  assert.equal(cat.share, 'В моём шаре остался ЧУЖОЙ КОТ, а за борт прыгаю я. А что останется в твоём?');
  assert.equal(G.finish(mk(0), true, null).headline[0], 'В ШАРЕ ОСТАЛИСЬ:');
  assert.equal(G.finish(mk(6), true, null).headline[0], 'В ШАРЕ ОСТАЛАСЬ:');
  assert.equal(G.finish(mk(2), true, null).headline[0], 'В ШАРЕ ОСТАЛОСЬ:');
  const cup = G.finish(mk(7), false, { keptIdx: 7, jump: false });
  assert.deepEqual(cup.headline, ['ВЫКИНУТО ВСЁ. ПОСЛЕДНИМ:', 'КУБОК С ТВОИМ ИМЕНЕМ']);
  assert.ok(cup.share.includes('КУБОК С МОИМ ИМЕНЕМ') && cup.card[1] === 'КУБОК С МОИМ ИМЕНЕМ');
  assert.equal(cup.compare, 'У друга остался: КУБОК. У тебя тоже.');
  assert.equal(G.finish(mk(5), false, { keptIdx: 6, jump: true }).compare, 'У друга осталась: РУКОПИСЬ. У тебя: КОТ.');
  assert.equal(cat.title, 'НЯНЬКА БЕЗ ЗАПАСА');
  for (const n of Object.values(G.NOUN)) assert.ok(!/^(БЕГЛЕЦ|ДОМОСЕД|КАЗНАЧЕЙ|ЧЕМПИОН|МЕЧТАТЕЛЬ|РОМАНТИК|АРХИВАРИУС|ХРАНИТЕЛЬ)$/.test(n));
});
test('friend state: round trip; broken states fall back to null', () => {
  for (let k = 0; k < N; k++) for (const j of [true, false]) assert.deepEqual(G.decodeState(G.encodeState(k, j)), { keptIdx: k, jump: j });
  for (const s of [undefined, null, '', ' ', '8j', '5x', '55j', 'j5', '-1j', '5', 'cat', '5j&', '%', '{"a":1}', 42, {}, '５j'])
    assert.equal(G.decodeState(s), null, 'should reject ' + JSON.stringify(s));
  assert.equal(G.guess({ keptIdx: 3, jump: true }, 3), true);
  assert.equal(G.guess({ keptIdx: 3, jump: true }, 4), false);
  assert.equal(G.guess(null, 4), false);
});
test('throwItem guards', () => {
  const run = G.newRun(); G.throwItem(run, 0, 100, false);
  assert.throws(() => G.throwItem(run, 0, 100, false), /already/);
  assert.throws(() => G.throwItem(run, 8, 100, false), /bad item/);
  assert.throws(() => G.finish(run, true, null), /not complete/);
  for (let i = 1; i < 7; i++) G.throwItem(run, i, 100, false);
  assert.throws(() => G.throwItem(run, 7, 100, false), /no throws/);
});
test('fuse schedule: no fuse on the start tap, 4 s first, gust at throw 4 halves it, floor ≥1.5 s', () => {
  assert.equal(G.FUSE[0], 0); assert.equal(G.FUSE[1], 4000);
  assert.equal(G.GUST_AT, 3);
  assert.ok(G.FUSE[G.GUST_AT] <= G.FUSE[1] * 0.5 && G.FUSE[G.GUST_AT] < G.FUSE[G.GUST_AT - 1]);
  for (let k = 1; k < G.THROWS; k++) { assert.ok(G.FUSE[k] >= 1500); if (k > 1) assert.ok(G.FUSE[k] <= G.FUSE[k - 1]); }
});

// ---------- page & og ----------
test('og.json: one result page per item code, slugs latin', () => {
  const og = JSON.parse(readFileSync(join(DIR, 'og.json'), 'utf8'));
  assert.deepEqual(og.results.map(r => r.code).sort(), G.ITEMS.map(it => it.code).sort());
  og.results.forEach(r => { assert.match(r.code, /^[a-z0-9-]+$/); assert.ok(r.big && r.line); assert.ok(!BAD.test(r.big + r.line) && !PAST.test(r.big + r.line)); });
  assert.ok(og.title && og.cta);
});
test('page: kit wiring, events, weight', () => {
  const html = readFileSync(join(DIR, 'index.html'), 'utf8');
  for (const s of ['../lab.css', '../lab.js', 'game.js', "LAB.init('a')", "track('view')", "track('start')", "track('done')", "'kept_'", "'jump'", "'drop'", "'guess_ok'", "'guess_no'",
    'L.recog(', 'L.share(', 'LAB.timer(', 'LAB.canvasImg(', 'document.fonts.ready', 'удерживай картинку, чтобы сохранить', 'ПОКАЗАТЬ ДРУГУ', 'ещё раз',
    'ШАР ПАДАЕТ. ВЫКИДЫВАЙ ЛИШНЕЕ.', 'ПОРЫВ ВЕТРА!', 'ШАР НЕ ЖДЁТ', 'ПРЫГАЮ Я', 'ВЫКИДЫВАЮ', 'ОСТАЛАСЬ ОДНА ВЕЩЬ', 'ЕЩЁ РАЗ — БЫСТРЕЕ', 'bw_lab_a_guessed_', 'sessionStorage', 'У ДРУГА В ШАРЕ ОСТАЛОСЬ ОДНО. УГАДАЕШЬ?', 'ТЕПЕРЬ ТВОЙ ШАР'])
    assert.ok(html.includes(s), 'missing ' + s);
  assert.ok(!/\(а\)/.test(html));
  assert.ok(!/https?:\/\/(?!dimacloud\.github\.io)/.test(html.replace(/<meta[^>]*>/g, '').replace(/xmlns='http:\/\/www\.w3\.org\/2000\/svg'/g, '')), 'no external requests');
  const kb = (statSync(join(DIR, 'index.html')).size + statSync(join(DIR, 'game.js')).size) / 1024;
  assert.ok(kb < 150, kb + ' KB');
});
