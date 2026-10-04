// LAB finalist B «ОРАКУЛ»: simulation gate + logic, copy, privacy checks.
// Run: node --test 'product/test/*.test.mjs'   (set LAB_B_TABLE=1 to print the simulation table)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, statSync } from 'node:fs';
const require = createRequire(import.meta.url);
const G = require('../site/lab/b/game.js');
const LABK = require('../site/lab/lab.js');
const SITE = new URL('../site/lab/b/', import.meta.url);
const N = 10000;
const BOSS_COST = 0.1; // the boss item makes the bet side costlier: P(bet side) drops by this much

function play(run, pick) {
  for (let k = 0; k < G.TOTAL; k++) G.answer(run, k, pick(G.itemAt(run, k), run, k));
  return G.finish(run);
}
const coin = r => (r() < 0.5 ? 0 : 1);
const toward = (r, p, side) => (r() < p ? side : 1 - side);
/** P(choose the true side) with the boss cost applied against the bet side. */
function withCost(it, p, trueSide) { return it.boss ? (it.bet === trueSide ? p - BOSS_COST : p + BOSS_COST) : p; }

const MODELS = {
  random: { gate: true, make: r => () => coin(r) },
  // per-axis true side, one consistency p per player
  consistentPlayer: { gate: true, structured: true, make: r => { const t = [coin(r), coin(r), coin(r)], p = 0.55 + 0.35 * r(); return it => toward(r, withCost(it, p, t[it.axis]), t[it.axis]); } },
  // per-axis true side, a fresh consistency p per item
  consistentItem: { gate: true, structured: true, make: r => { const t = [coin(r), coin(r), coin(r)]; return it => { const p = 0.55 + 0.35 * r(); return toward(r, withCost(it, p, t[it.axis]), t[it.axis]); }; } },
  // no trait at all: each item has its own population pull (0.3–0.7 towards side 0), players follow it
  itemPreference: { gate: true, structured: true, make: (r, bias) => it => (r() < bias[it.id] ? 0 : 1) },
  // informational: players who sense the bet and defy it 70% of the time (Aaronson-oracle play)
  defier: { gate: false, make: r => (it) => (it.bet === null ? coin(r) : toward(r, 0.7, 1 - it.bet)) },
};

function simulate(name, seed) {
  const r = LABK.rng(seed);
  const bias = {};
  G.ITEMS.forEach(ax => [...ax.every, ...ax.boss].forEach(i => { bias[i.id] = 0.3 + 0.4 * r(); }));
  const bands = { book: 0, riddle: 0, agent: 0, cipher: 0 }, codes = {}, quoteItem = {};
  let miss = 0, bossFallback = 0;
  for (let i = 0; i < N; i++) {
    const res = play(G.newRun(r), MODELS[name].make(r, bias));
    bands[res.code]++;
    codes[res.codeText] = (codes[res.codeText] || 0) + 1;
    quoteItem[res.receiptItem] = (quoteItem[res.receiptItem] || 0) + 1;
    if (res.receiptKind === 'miss') miss++;
    if (!res.bossConsistent) bossFallback++;
  }
  const pct = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, +(100 * v / N).toFixed(1)]));
  return { bands: pct(bands), codes: pct(codes), quote: pct(quoteItem), miss: +(100 * miss / N).toFixed(1), bossFallback: +(100 * bossFallback / N).toFixed(1) };
}

const RESULTS = {};
for (const [i, name] of Object.keys(MODELS).entries()) RESULTS[name] = simulate(name, 1000 + i);

if (process.env.LAB_B_TABLE) {
  console.log('| model | ОТКРЫТАЯ КНИГА (4) | КНИГА С ЗАГАДКОЙ (3) | ДВОЙНОЙ АГЕНТ (2) | ШИФР (0–1) | miss receipt | top quoted item | top code | boss fallback |');
  console.log('|---|---|---|---|---|---|---|---|---|');
  for (const [name, s] of Object.entries(RESULTS)) {
    const topQ = Object.entries(s.quote).sort((a, b) => b[1] - a[1])[0];
    const topC = Object.entries(s.codes).sort((a, b) => b[1] - a[1])[0];
    console.log(`| ${name} | ${s.bands.book}% | ${s.bands.riddle}% | ${s.bands.agent}% | ${s.bands.cipher}% | ${s.miss}% | ${topQ[0]} ${topQ[1]}% | ${topC[0]} ${topC[1]}% | ${s.bossFallback}% |`);
  }
}

test('simulation gate: no hit band above 40%, at least 3 bands at 10%+', () => {
  for (const [name, s] of Object.entries(RESULTS)) {
    if (!MODELS[name].gate) continue;
    const v = Object.values(s.bands);
    assert.ok(Math.max(...v) <= 40, `${name}: a band above 40%: ${JSON.stringify(s.bands)}`);
    assert.ok(v.filter(x => x >= 10).length >= 3, `${name}: fewer than 3 bands at 10%+: ${JSON.stringify(s.bands)}`);
  }
});

test('simulation gate: structured models keep every band at or under 37% (35% rule, ±2 pt noise margin)', () => {
  for (const [name, s] of Object.entries(RESULTS)) {
    if (!MODELS[name].structured) continue;
    assert.ok(Math.max(...Object.values(s.bands)) <= 37, `${name}: ${JSON.stringify(s.bands)}`);
  }
});

test('simulation gate: no single quoted receipt line above 60%; all 8 codes appear', () => {
  for (const [name, s] of Object.entries(RESULTS)) {
    assert.ok(Math.max(...Object.values(s.quote)) <= 60, `${name}: ${JSON.stringify(s.quote)}`);
    if (MODELS[name].gate) assert.equal(Object.keys(s.codes).length, 8, name);
  }
});

// ---------- exhaustive: every answer pattern × every item order ----------
function* allRuns() {
  for (let fe = 0; fe < 8; fe++) for (let sw = 0; sw < 2; sw++) for (let mask = 0; mask < 128; mask++) {
    const run = { firstEvery: [fe & 1, (fe >> 1) & 1, (fe >> 2) & 1], swap: Array(7).fill(!!sw), answers: [] };
    const res = play(run, (it, _r, k) => (mask >> k) & 1);
    yield { run, res, mask };
  }
}
function strings(o, out = []) {
  if (typeof o === 'string') out.push(o);
  else if (Array.isArray(o)) o.forEach(x => strings(x, out));
  else if (o && typeof o === 'object') Object.values(o).forEach(x => strings(x, out));
  else if (typeof o === 'number') assert.ok(Number.isFinite(o), 'NaN/Infinity in result');
  else assert.ok(o === null || typeof o === 'boolean', 'undefined in result');
  return out;
}

test('exhaustive: all branches reachable, never undefined/NaN/empty', () => {
  const labels = new Set(), codes = new Set(), codeTexts = new Set(), bossAxes = new Set(), bossItems = new Set(), kinds = new Set(), hits = new Set();
  let fallback = 0;
  for (const { run, res } of allRuns()) {
    for (const s of strings(res)) {
      assert.ok(s.trim().length > 0, 'empty string');
      assert.ok(!/undefined|NaN|null/.test(s), 'bad token in: ' + s);
    }
    labels.add(res.label); codes.add(res.code); codeTexts.add(res.codeText); bossAxes.add(res.bossAxis);
    bossItems.add(res.bets[3].id); kinds.add(res.receiptKind); hits.add(res.hits);
    if (!res.bossConsistent) fallback++;
    assert.equal(res.headline, `ОРАКУЛ УГАДАЛ ${res.hits} ИЗ 4`);
    assert.deepEqual(res.score, [res.hits, 4 - res.hits]);
    assert.ok(res.chips.length >= 2 && res.chips.length <= 3);
    assert.ok(G.decodeState(res.state), 'own state must decode');
    assert.match(res.why, /^Почему ставка [^:]+: раньше «[^»]+» → [^«]+( и «[^»]+» → .+)?\.$/);
    // the why line is built only from the player's own earlier choices, verbatim
    const shown = res.bets.find(b => !b.hit) || res.bets[3];
    for (const e of G.evidence(run, shown.k)) assert.ok(res.why.includes(`«${e.title}» → ${e.label}`));
  }
  assert.deepEqual([...hits].sort(), [0, 1, 2, 3, 4]);
  assert.equal(labels.size, 4);
  assert.deepEqual([...codes].sort(), [...G.CODES].sort());
  assert.equal(codeTexts.size, 8);
  assert.deepEqual([...bossAxes].sort(), [0, 1, 2]);
  assert.equal(bossItems.size, 6, 'every boss item reachable');
  assert.deepEqual([...kinds].sort(), ['boss', 'miss']);
  assert.ok(fallback > 0, 'no-consistent-axis fallback reachable');
});

test('bets follow the rules', () => {
  const run = G.newRun(LABK.rng(5));
  [0, 1, 1].forEach((s, k) => G.answer(run, k, s));
  assert.equal(G.itemAt(run, 3).bet, 0);
  assert.equal(G.itemAt(run, 4).bet, 1);
  assert.equal(G.itemAt(run, 5).bet, 1);
  [1, 1, 0].forEach((s, i) => G.answer(run, 3 + i, s));
  // axis 0 flipped, axis 1 consistent → boss on axis 1, bet ПОТОМ, costly-ПОТОМ item
  const boss = G.itemAt(run, 6);
  assert.equal(boss.axis, 1); assert.equal(boss.bet, 1); assert.equal(boss.id, 'flat'); assert.ok(boss.boss);
  G.answer(run, 6, 0);
  const res = G.finish(run);
  assert.equal(res.hits, 1); // hit only on item 5 (axis 1)
  assert.equal(res.code, 'cipher');
  assert.equal(res.codeText, 'МЫ · СЕЙЧАС · ПРЫЖОК');
  assert.match(res.receipt, /^Промах — «.+»: ставка .+, выбор .+\.$/);
  // the why line quotes the earlier item and its chosen label verbatim (first miss = item 4, from item 1)
  const it0 = G.itemAt(run, 0), lbl0 = it0.options.find(o => o.side === 0).label;
  assert.equal(res.why, `Почему ставка ${res.bets[0].betLabel}: раньше «${it0.title}» → ${lbl0}.`);
  assert.throws(() => G.answer(run, 3, 0), /out of order/);
  // all flipped → fallback axis Я/МЫ, bet = latest side
  const r2 = G.newRun(LABK.rng(6));
  [0, 0, 0, 1, 1, 1].forEach((s, k) => G.answer(r2, k, s));
  const b2 = G.itemAt(r2, 6);
  assert.equal(b2.axis, 0); assert.equal(b2.bet, 1); assert.equal(b2.id, 'team');
});

test('friend state: round trip; broken fragments fall back to null', () => {
  for (const { res } of allRuns()) {
    const f = G.decodeState(res.state);
    assert.equal(f.hits, res.hits); assert.deepEqual(f.sides, res.sides);
    assert.equal(G.compareLine(res, f), `Друга — ${f.hits} из 4, тебя — ${res.hits} из 4. Код друга: ${res.codeText}.`);
    assert.match(G.friendTop(f), /^ОРАКУЛ УГАДАЛ ДРУГА \d ИЗ 4\. ТЕБЯ — ПОСМОТРИМ\.$/);
    break;
  }
  for (const bad of [undefined, null, '', '1', '15000', '1300', '13012', '2301', '13010x', '%E2%80', '<script>', 'x'.repeat(5000), 13010, {}, []]) {
    assert.equal(G.decodeState(bad), null, 'should reject: ' + String(bad).slice(0, 20));
  }
});

// ---------- birth date: costume only ----------
test('birth persona: day+month only, valid for all 366 dates, never part of the game or the share state', () => {
  let n = 0;
  for (let m = 1; m <= 12; m++) for (let d = 1; d <= 31; d++) {
    const p = G.persona(d, m);
    assert.equal(!!p, G.validDate(d, m));
    if (!p) continue;
    n++;
    assert.match(p.name, /^ОРАКУЛ \d{1,2} [А-Я]+$/);
    assert.ok(G.COLORS.includes(p.color));
    assert.ok(p.points >= 3 && p.points <= 8);
    // rotation is random, not derived from the date
    assert.notEqual(G.persona(d, m, () => 0).rot, G.persona(d, m, () => 0.5).rot);
  }
  assert.equal(n, 366);
  for (const [d, m] of [[0, 1], [32, 1], [31, 4], [30, 2], [1, 13], [1.5, 2], [NaN, 3]]) assert.equal(G.persona(d, m), null);
  // the logic API has no birth input at all
  assert.equal(G.newRun.length, 1); assert.equal(G.itemAt.length, 2); assert.equal(G.answer.length, 3); assert.equal(G.finish.length, 1);
  for (const { res } of allRuns()) { assert.match(res.state, /^1[0-4][01]{3}$/); break; }
  // page: share/track never see the date; the date is never written to storage or a URL
  const html = readFileSync(new URL('index.html', SITE), 'utf8');
  assert.match(html, /L\.share\(\{\s*code: lastRes\.code, state: lastRes\.state, text: lastRes\.shareText,/);
  for (const m of html.matchAll(/L\.track\(([^)]*)\)/g)) assert.ok(!/persona|bd|day|month/i.test(m[1]), 'track leaks: ' + m[1]);
  for (const m of html.matchAll(/(sessionStorage|localStorage)\.setItem\(([^)]*)\)/g)) assert.ok(!/persona|bd|day|month/i.test(m[2]), 'storage leaks: ' + m[2]);
  assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon/.test(html), 'page must not make its own requests');
});

// ---------- copy and weight ----------
test('copy: short balanced items, gender-neutral, no forms', () => {
  const words = s => s.replace(/[—–,.:]/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  const all = [];
  G.ITEMS.forEach(ax => [...ax.every, ...ax.boss].forEach(i => {
    assert.ok(words(i.text) <= 8, 'situation too long: ' + i.text);
    i.o.forEach(o => { assert.ok(words(o) >= 1 && words(o) <= 4, 'option too long: ' + o); all.push(o); });
    assert.notEqual(i.o[0], i.o[1]);
    all.push(i.text, i.title);
  }));
  Object.values(G.LINES).forEach(v => all.push(...[].concat(v)));
  for (const { res } of allRuns()) all.push(res.receipt, res.why, res.shareText, res.cardLine, res.label, res.honesty);
  const banned = /\((а|ла|ая)\)|(?<![А-Яа-яЁё])(сам|сама|готов|готова|уверен|уверена|выбрал|выбрала|ушёл|ушла|сломал|сломала|думал|думала|предсказуем|предсказуема|читаем|читаема)(?![А-Яа-яЁё])/i;
  for (const s of all) assert.ok(!banned.test(s), 'gendered/past form: ' + s);
  const files = ['index.html', 'game.js'].map(f => readFileSync(new URL(f, SITE), 'utf8')).join('\n');
  assert.ok(!files.includes('(а)'));
});

test('first screen (no birth arm): at most 12 words before the first tap', () => {
  const words = s => s.replace(/[—–,.:…·]/g, ' ').trim().split(/\s+/).filter(w => /[A-Za-zА-Яа-яЁё]/.test(w)).length;
  // visible: brand, oracle line, scoreboard words, situation, two options
  for (const it of G.ITEMS[0].every) {
    const n = words('BORN WEIRD') + words(G.LINES.scan) + words('ОРАКУЛ ТЫ') + words(it.text) + it.o.reduce((a, o) => a + words(o), 0);
    assert.ok(n <= 12, `${it.id}: ${n} words`);
  }
});

test('weight and og.json', () => {
  const kb = ['index.html', 'game.js'].reduce((a, f) => a + statSync(new URL(f, SITE)).size, 0) / 1024;
  assert.ok(kb < 150, kb + ' KB');
  const og = JSON.parse(readFileSync(new URL('og.json', SITE), 'utf8'));
  assert.deepEqual(og.results.map(r => r.code).sort(), [...G.CODES].sort());
  og.results.forEach(r => { assert.match(r.code, /^[a-z0-9-]+$/); assert.ok(r.big && r.line); });
});

test('card (shareable) depends only on the result: no birth date, persona, colour or sigil', () => {
  assert.equal(G.cardSpec.length, 1);
  for (const { res } of allRuns()) {
    const spec = G.cardSpec(res);
    assert.deepEqual(Object.keys(spec).sort(), ['big', 'color', 'label', 'line', 'pips', 'top']);
    assert.equal(spec.color, G.DEFAULT_PERSONA.color);
    const flat = JSON.stringify(spec);
    for (const m of G.MONTHS) assert.ok(!flat.toLowerCase().includes(m), 'month on card');
    for (const c of G.COLORS.slice(1)) assert.ok(!flat.includes(c), 'persona colour on card');
  }
  // the page's drawCard reads nothing but G.cardSpec(res)
  const html = readFileSync(new URL('index.html', SITE), 'utf8');
  const body = html.slice(html.indexOf('async function drawCard(res)'), html.indexOf('// ---------- boot'));
  assert.ok(body.includes('const spec = G.cardSpec(res);'));
  assert.ok(!/persona|bdDay|bdMonth/.test(body), 'drawCard touches the persona');
  assert.ok(!/res\.(?!headline)/.test(body.replace('G.cardSpec(res)', '')), 'drawCard reads the result directly');
  const eye = html.slice(html.indexOf('function drawEye('), html.indexOf('function wrap('));
  assert.ok(!/persona/.test(eye.replace('(no persona)', '')), 'card eye uses the persona');
  // the reveal resets to the default look and never prints the persona name
  assert.match(html, /applyPersona\(G\.DEFAULT_PERSONA\)/);
  assert.ok(!/id="rvName"/.test(html));
});
