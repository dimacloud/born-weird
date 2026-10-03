// BORN WEIRD engine tests — QA-EVAL-001. Run: node --test product/test/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const BW = require('../site/engine.js');

const NOW = new Date(2026, 9, 3); // fixed "today" = 2026-10-03 local
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const OPTS = BW.STAGES.map(s => s.options.length);

// ---------- birthSeed validation ----------
test('birthSeed rejects malformed strings', () => {
  for (const s of ['', null, undefined, 'abc', '1990-1-1', '1990/01/01', '01-01-1990', '1990-13-01', '1990-00-10', '1990-01-32', ' 1990-01-01', '1990-01-01T00:00', '19900101'])
    assert.throws(() => BW.birthSeed(s, NOW), /invalid/, String(s));
});
test('birthSeed rejects impossible calendar dates', () => {
  for (const s of ['1990-02-30', '2001-02-29', '1900-02-29', '1990-04-31'])
    assert.throws(() => BW.birthSeed(s, NOW), /invalid/, s);
});
test('birthSeed rejects future dates', () => {
  assert.throws(() => BW.birthSeed('2026-10-04', NOW), /future/);
  assert.throws(() => BW.birthSeed('2999-01-01', NOW), /future/);
});
test('birthSeed rejects pre-1900', () => {
  assert.throws(() => BW.birthSeed('1899-12-31', NOW), /too early/);
  assert.throws(() => BW.birthSeed('0001-01-01', NOW), /too early|invalid/);
  assert.doesNotThrow(() => BW.birthSeed('1900-01-01', NOW));
});
test('birthSeed accepts leap day 2000-02-29 and today', () => {
  const b = BW.birthSeed('2000-02-29', NOW);
  assert.equal(b.weekday, 'Tuesday');
  const t = BW.birthSeed(iso(NOW), NOW);
  assert.equal(t.daysAlive, 0);
  assert.doesNotThrow(() => BW.birthSeed(iso(new Date()))); // real today, default now
});

// ---------- simulate ----------
test('simulate rejects invalid choices', () => {
  const bad = [null, [], [0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [3, 0, 0, 0, 0], [0, 0, 4, 0, 0], [0, 0, 0, 0, 6], [-1, 0, 0, 0, 0], [0.5, 0, 0, 0, 0], ['0', 0, 0, 0, 0]];
  for (const c of bad) assert.throws(() => BW.simulate('1990-05-17', c, { salt: 1, now: NOW }), undefined, JSON.stringify(c));
  assert.throws(() => BW.simulate('1990-02-30', [0, 0, 0, 0, 0], { salt: 1, now: NOW }));
});
test('simulate is deterministic for same date+choices+salt', () => {
  const a = BW.simulate('1987-11-02', [1, 2, 3, 0, 5], { salt: 42, now: NOW });
  const b = BW.simulate('1987-11-02', [1, 2, 3, 0, 5], { salt: 42, now: NOW });
  assert.deepEqual(a, b);
});
test('different salts give different ids', () => {
  const ids = new Set();
  for (let s = 0; s < 200; s++) ids.add(BW.simulate('1987-11-02', [1, 2, 3, 0, 5], { salt: s, now: NOW }).id);
  assert.ok(ids.size >= 199, 'ids: ' + ids.size);
});

test('2000 random simulations: id collisions + primary distribution', () => {
  let x = 12345; const rnd = () => ((x = (x * 1103515245 + 12345) >>> 0) / 4294967296);
  const lo = Date.UTC(1940, 0, 1), hi = Date.UTC(2012, 0, 1);
  const ids = new Map(), prim = {}; BW.DIMS.forEach(d => prim[d] = 0);
  const N = 2000;
  for (let i = 0; i < N; i++) {
    const d = new Date(lo + Math.floor(rnd() * (hi - lo) / 86400000) * 86400000).toISOString().slice(0, 10);
    const ch = OPTS.map(n => Math.floor(rnd() * n));
    const r = BW.simulate(d, ch, { salt: Math.floor(rnd() * 2 ** 32), now: NOW });
    ids.set(r.id, (ids.get(r.id) || 0) + 1);
    prim[r.primary]++;
  }
  const collisions = N - ids.size;
  const pct = Object.fromEntries(Object.entries(prim).map(([k, v]) => [k, +(100 * v / N).toFixed(1)]));
  console.log('# collisions:', collisions, 'primary %:', JSON.stringify(pct));
  assert.ok(collisions <= 2, 'collisions ' + collisions);
  for (const [k, v] of Object.entries(pct)) assert.ok(v >= 3 && v <= 40, k + ' primary ' + v + '%');
});

// ---------- placeholders ----------
function* combos(i = 0, acc = []) {
  if (i === OPTS.length) { yield acc.slice(); return; }
  for (let j = 0; j < OPTS[i]; j++) { acc.push(j); yield* combos(i + 1, acc); acc.pop(); }
}
test('all 864 combinations x salts fill every placeholder', () => {
  let n = 0;
  for (const c of combos()) {
    for (const salt of [0, 1, 7, 99999, 4294967295]) {
      const r = BW.simulate('1995-07-14', c, { salt, now: NOW });
      for (const e of r.events) assert.ok(!/[{}]/.test(e.text), 'unfilled: ' + e.text);
      assert.ok(!/[{}]|undefined|NaN/.test(r.title + r.future + r.kept + r.rejectedText), 'bad text in ' + r.title);
      n++;
    }
  }
  assert.equal(n, 864 * 5);
});
test('vars ranges: every list option reachable and numeric ranges ordered', () => {
  for (const st of BW.STAGES) for (const o of st.options) for (const [k, v] of Object.entries(o.vars || {})) {
    assert.ok(Array.isArray(v) && v.length > 0, k);
    if (typeof v[0] === 'number') assert.ok(v.length === 2 && v[0] <= v[1], k);
  }
});

// ---------- Reality Seed ----------
test('Reality Seed markdown has all Genesis §13 headings and disclaimer', () => {
  const r = BW.simulate('1990-05-17', [0, 1, 2, 3, 4], { salt: 5, now: NOW });
  const md = BW.realitySeedMarkdown(r, 'https://example.test/?from=' + r.id);
  assert.ok(md.startsWith('# BORN WEIRD // REALITY SEED'));
  for (const h of ['TIMELINE', 'BIRTH SEED', 'THE WORLD', 'THE POSSIBLE FUTURE', 'CHOICES THAT CREATED IT', 'WHAT I KEPT CHOOSING',
    'WHAT I KEPT REJECTING', 'IMPORTANT EVENTS', 'POSSIBLE PROJECT', 'FIRST EXPERIMENT', 'VISUAL LANGUAGE', 'OPEN QUESTIONS', 'INSTRUCTIONS FOR AN AI'])
    assert.match(md, new RegExp('^## ' + h + '$', 'm'), h);
  assert.match(md, /not objective truth/);
  assert.match(md, /hypothesis, not truth about me/);
  assert.match(md, /What do you want to do with this reality\?/);
  assert.ok(!md.includes('1990'), 'raw birth year must not appear');
  assert.ok(!/daysAlive|\d{1,3},\d{3} days/.test(md));
});

// ---------- privacy: can the shared output be reversed to a birth date? ----------
// Shared fields (earth, anomaly, worldFact, id) must depend on a per-run random salt,
// so knowing them reveals nothing beyond the weekday.
test('PRIVACY: shared flavour fields are not a function of the birth date', () => {
  const d = '1990-05-17';
  const earths = new Set(), anomalies = new Set();
  for (let s = 0; s < 50; s++) {
    const b = BW.birthSeed(d, NOW, s);
    earths.add(b.earth); anomalies.add(b.anomaly);
  }
  assert.ok(earths.size > 40, 'earth varies with salt for one date: ' + earths.size);
  assert.ok(anomalies.size >= 5, 'anomaly varies with salt for one date: ' + anomalies.size);
});
test('PRIVACY: simulate shares birth flavour with birthSeed for the same salt (seed screen == result)', () => {
  const b = BW.birthSeed('1990-05-17', NOW, 77);
  const r = BW.simulate('1990-05-17', [0, 1, 2, 3, 4], { salt: 77, now: NOW });
  assert.equal(r.earth, b.earth); assert.equal(r.worldFact, b.worldFact); assert.equal(r.birth.anomaly, b.anomaly);
});
test('PRIVACY: Reality Seed and result contain no date, year of birth or day count', () => {
  const r = BW.simulate('1990-05-17', [0, 1, 2, 3, 4], { salt: 5, now: NOW });
  const md = BW.realitySeedMarkdown(r, 'https://x');
  assert.ok(!/1990|05-17|17 May|May 17/.test(md));
});
