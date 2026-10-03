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

// ---------- i18n (added by CEO-001 for v0.2; QA to extend) ----------
test('i18n: RU and EN packs have identical shapes (same rng consumption)', () => {
  const en = BW.CONTENT.en, ru = BW.CONTENT.ru;
  for (const k of ['anomalies', 'worldFacts', 'places', 'weekdays']) assert.equal(ru[k].length, en[k].length, k);
  en.stages.forEach((s, i) => s.options.forEach((o, j) => {
    const r = ru.stages[i].options[j];
    assert.deepEqual(Object.keys(r.vars || {}).sort(), Object.keys(o.vars || {}).sort(), `vars ${i}/${j}`);
    for (const k in o.vars) {
      assert.equal(r.vars[k].length, o.vars[k].length, `len ${i}/${j}/${k}`);
      if (typeof o.vars[k][0] === 'number') assert.deepEqual(r.vars[k], o.vars[k], `range ${i}/${j}/${k}`);
    }
  }));
  for (const d of BW.DIMS) for (const k of ['nouns', 'adjs']) assert.equal(ru.dims[d][k].length, en.dims[d][k].length, d + k);
});
test('i18n: same date+choices+salt gives the same reality in both languages', () => {
  for (let s = 0; s < 50; s++) {
    const c = [s % 3, (s >> 1) % 3, s % 4, (s >> 2) % 4, s % 6];
    const a = BW.simulate('1993-08-21', c, { salt: s, now: NOW, lang: 'en' });
    const b = BW.simulate('1993-08-21', c, { salt: s, now: NOW, lang: 'ru' });
    assert.equal(a.id, b.id); assert.equal(a.primary, b.primary); assert.equal(a.rejected, b.rejected);
    assert.equal(a.earth, b.earth); assert.equal(a.artSeed, b.artSeed);
  }
});
test('i18n: all 864 RU paths fill every placeholder and use correct plurals', () => {
  const rx = /\{[^}]*\}|undefined|NaN/;
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 4; c++) for (let d = 0; d < 4; d++) for (let e = 0; e < 6; e++) {
    for (const salt of [0, 3, 12345]) {
      const r = BW.simulate('1995-07-14', [a, b, c, d, e], { salt, now: NOW, lang: 'ru' });
      for (const ev of r.events) assert.ok(!rx.test(ev.text), ev.text);
      assert.ok(!rx.test(r.title + r.future + r.kept));
      assert.ok(!/ 1 часов| 2 часов| 5 часа| 21 копий| 11 копия/.test(r.events.map(x => x.text).join(' ')));
    }
  }
});
test('i18n: plural helper', () => {
  const f = ['час', 'часа', 'часов'];
  assert.deepEqual([1, 2, 5, 11, 12, 21, 22, 25, 111, 104].map(n => BW.plural(n, f)),
    ['час', 'часа', 'часов', 'часов', 'часов', 'час', 'часа', 'часов', 'часов', 'часа']);
});
test('i18n: RU Reality Seed keeps canonical headings, disclaimer and RU AI instruction', () => {
  const r = BW.simulate('1990-05-17', [0, 1, 2, 3, 4], { salt: 5, now: NOW, lang: 'ru' });
  const md = BW.realitySeedMarkdown(r, 'https://x/ru/?from=' + r.id);
  for (const h of ['TIMELINE', 'BIRTH SEED', 'THE WORLD', 'THE POSSIBLE FUTURE', 'CHOICES THAT CREATED IT', 'WHAT I KEPT CHOOSING',
    'WHAT I KEPT REJECTING', 'IMPORTANT EVENTS', 'POSSIBLE PROJECT', 'FIRST EXPERIMENT', 'VISUAL LANGUAGE', 'OPEN QUESTIONS', 'INSTRUCTIONS FOR AN AI'])
    assert.ok(md.includes('(' + h + ')'), h);
  assert.ok(md.includes('не объективную правду')); assert.ok(md.includes('по-русски')); assert.ok(!/1990|17 мая/.test(md));
});
test('i18n: unknown language falls back to English', () => {
  const r = BW.simulate('1990-05-17', [0, 0, 0, 0, 0], { salt: 1, now: NOW, lang: 'xx' });
  assert.equal(r.lang, 'en');
});

// ---------- v0.2 i18n page-level guarantees (QA-EVAL-001) ----------
import { readFileSync, existsSync } from 'node:fs';
const PAGE = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const RU_PAGE_PATH = new URL('../site/ru/index.html', import.meta.url);

test('i18n page: siteRoot/langBase resolve for prod and localhost, EN and RU entries', () => {
  const expr = /const siteRoot = (location\.origin \+ location\.pathname[^;]+);/.exec(PAGE)[1];
  const root = (origin, pathname) => new Function('location', 'return ' + expr)({ origin, pathname });
  const P = 'https://dimacloud.github.io';
  for (const p of ['/born-weird/', '/born-weird/index.html', '/born-weird/ru/', '/born-weird/ru/index.html'])
    assert.equal(root(P, p), P + '/born-weird/', p);
  for (const p of ['/', '/index.html', '/ru/', '/ru/index.html'])
    assert.equal(root('http://localhost:8417', p), 'http://localhost:8417/', p);
});

test('i18n page: restart regex clears ru_ and founder_ru_ funnel keys but keeps landing/lang keys', () => {
  const re = new RegExp(/fired\.forEach\(k => \{ if \(\/(.+?)\/\.test\(k\)\)/.exec(PAGE)[1]);
  for (const k of ['ru_simulation_started', 'founder_ru_choice_selected_3', 'ru_fb_worth_5', 'founder_ru_feedback_submitted', 'ru_restart_clicked', 'simulation_completed'])
    assert.ok(re.test(k), k);
  for (const k of ['landing_view', 'ru_landing_view', 'lang_switch_ru', 'founder_lang_switch_en', 'locale_ru'])
    assert.ok(!re.test(k), k);
});

test('i18n page: every UI key exists in both languages with the same type', () => {
  const src = /const UI = (\{[\s\S]*?\n  \});/.exec(PAGE)[1];
  const UI = new Function('return ' + src)();
  assert.deepEqual(Object.keys(UI.ru).sort(), Object.keys(UI.en).sort());
  for (const k of Object.keys(UI.en)) assert.equal(typeof UI.ru[k], typeof UI.en[k], k);
  for (const m of PAGE.matchAll(/data-i18n="([^"]+)"/g)) assert.ok(m[1] in UI.ru && m[1] in UI.en, m[1]);
});

test('i18n page: generated ru/index.html has doctype first, base href, Russian meta, og-ru.png', { skip: !existsSync(RU_PAGE_PATH) }, () => {
  const ru = readFileSync(RU_PAGE_PATH, 'utf8');
  assert.ok(ru.startsWith('<!doctype html>'));
  assert.match(ru, /<html lang="ru" data-lang="ru">/);
  assert.match(ru, /<head>\n<base href="\.\.\/">/);
  assert.match(ru, /og:image" content="[^"]*og-ru\.png"/);
  assert.match(ru, /og:title" content="[^"]*[А-Яа-я]/);
  assert.ok(existsSync(new URL('../site/og-ru.png', import.meta.url)));
});
