// BORN WEIRD engine tests (v0.3). Run: node --test 'product/test/*.test.mjs'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
const require = createRequire(import.meta.url);
const BW = require('../site/engine.js');
const NOW = new Date('2026-10-03T12:00:00Z');
const LEN = (i, s) => BW.STAGE_META[i].sits[s].length;
const allRuns = function* (date, lang, salts) {
  for (const salt of salts) {
    const probe = BW.newRun(date, salt, lang, NOW);
    const sizes = probe.sits.map((s, i) => LEN(i, s));
    const total = sizes.reduce((a, b) => a * b, 1);
    for (let k = 0; k < total; k++) {
      let r = k; const ch = sizes.map(n => { const c = r % n; r = Math.floor(r / n); return c; });
      const run = BW.newRun(date, salt, lang, NOW);
      const outs = ch.map((c, i) => BW.choose(run, i, c));
      yield { run, res: BW.finish(run), outs, ch };
    }
  }
};

// ---------- birth validation & decoding ----------
test('rejects malformed, impossible, future and pre-1900 dates', () => {
  for (const s of ['', 'abc', '1990-13-01', '1990-02-30', '2001-02-29', '19900101', null, undefined]) assert.throws(() => BW.decodeBirth(s, 'en', NOW), /invalid/);
  assert.throws(() => BW.decodeBirth('2026-10-04', 'en', NOW), /future/);
  assert.throws(() => BW.decodeBirth('1899-12-31', 'en', NOW), /too early/);
  assert.doesNotThrow(() => BW.decodeBirth('2000-02-29', 'en', NOW));
  assert.doesNotThrow(() => BW.decodeBirth('2026-10-03', 'en', NOW));
});
test('life path: digit sum in DD.MM.YYYY order reduced to 1–9, steps shown', () => {
  assert.deepEqual(BW.lifePathOf('1991-03-14'), { n: 1, steps: ['1+4+0+3+1+9+9+1 = 28', '2+8 = 10', '1+0 = 1'] });
  assert.equal(BW.lifePathOf('2000-01-01').n, 4);
  for (let y = 1900; y < 2027; y += 7) for (let m = 1; m <= 12; m += 5) { const n = BW.lifePathOf(`${y}-${String(m).padStart(2, '0')}-15`).n; assert.ok(n >= 1 && n <= 9); }
});
test('zodiac boundaries', () => {
  const z = (m, d) => BW.CONTENT.en.zodiac[BW.zodiacOf(m, d)];
  assert.equal(z(3, 20), 'Pisces'); assert.equal(z(3, 21), 'Aries'); assert.equal(z(12, 21), 'Sagittarius'); assert.equal(z(12, 22), 'Capricorn');
  assert.equal(z(1, 1), 'Capricorn'); assert.equal(z(1, 19), 'Capricorn'); assert.equal(z(1, 20), 'Aquarius'); assert.equal(z(2, 19), 'Pisces');
});
test('eastern year (simplified 4 Feb boundary) and RU gender agreement', () => {
  assert.equal(BW.decodeBirth('2000-02-03', 'en', NOW).eastern, 'Earth Rabbit');
  assert.equal(BW.decodeBirth('2000-02-05', 'en', NOW).eastern, 'Metal Dragon');
  assert.equal(BW.decodeBirth('1991-03-14', 'ru', NOW).eastern, 'Металлическая Коза');
  assert.equal(BW.decodeBirth('1985-06-01', 'ru', NOW).eastern, 'Деревянный Бык');
});
test('PRIVACY: only the life path affects the result (sign/eastern/weekday are lore only)', () => {
  const d = BW.decodeBirth('1991-03-14', 'en', NOW);
  assert.equal(d.bonuses.length, 1); assert.equal(d.bonuses[0].kind, 'lifePath');
  // Same life path, same salt and choices → identical results for dates with different signs/years/weekdays.
  const dates = ['1991-03-14', '2002-07-08', '1975-12-01', '1960-08-31', '1999-05-03'].filter(x => BW.lifePathOf(x).n === 1);
  assert.ok(dates.length >= 3, 'dates ' + dates);
  for (let salt = 0; salt < 40; salt++) {
    const rs = dates.map(x => BW.simulate(x, [salt % 3, salt % 3, salt % 3, salt % 3, salt % 6], { salt, now: NOW }));
    rs.forEach(r => assert.deepEqual(r, rs[0]));
  }
});

// ---------- runs ----------
test('first situation is chosen by the life path; others by the seed; questions vary across runs', () => {
  const seen = new Set();
  for (let s = 0; s < 300; s++) { const r = BW.newRun('1991-03-14', s, 'en', NOW); assert.equal(r.sits[0], 1 % 3); seen.add(r.sits.slice(1).join('')); }
  assert.ok(seen.size >= 60, 'distinct situation sets: ' + seen.size);
});
test('choices must be in order and valid; double choose rejected', () => {
  const run = BW.newRun('1990-05-17', 1, 'en', NOW);
  assert.throws(() => BW.choose(run, 1, 0), /order/);
  assert.throws(() => BW.choose(run, 0, 9), /invalid/);
  BW.choose(run, 0, 0);
  assert.throws(() => BW.choose(run, 0, 1), /order/);
  assert.throws(() => BW.finish(run), /not complete/);
});
test('deterministic for same date+salt+choices; unique ids across salts', () => {
  const a = BW.simulate('1987-11-02', [1, 1, 1, 1, 5], { salt: 42, now: NOW });
  const b = BW.simulate('1987-11-02', [1, 1, 1, 1, 5], { salt: 42, now: NOW });
  assert.deepEqual(a, b);
  const ids = new Set(); for (let s = 0; s < 500; s++) ids.add(BW.simulate('1987-11-02', [0, 0, 0, 0, 0], { salt: s, now: NOW }).id);
  assert.ok(ids.size >= 498);
});
test('every path (both languages) fills all placeholders; outputs well-formed', () => {
  const rx = /\{[^}]*\}|undefined|NaN|null/;
  let n = 0;
  for (const lang of ['en', 'ru']) for (const { res, outs } of allRuns('1995-07-14', lang, [0, 1, 2, 3, 4, 5])) {
    n++;
    outs.forEach(o => { assert.ok(!rx.test(o.text), o.text); assert.ok(o.deltas.length >= 1); });
    for (const k of ['title', 'future', 'kept', 'verdict', 'buff', 'debuff', 'boss', 'highlight', 'experiment']) assert.ok(res[k] && !rx.test(res[k]), k + ': ' + res[k]);
    assert.ok(!/ 1 часов| [2-4] часов| 1[1-4] часа| 21 копий| 5 часа/.test(outs.map(o => o.text).join(' ')));
  }
  assert.ok(n > 500, 'paths checked: ' + n);
});
test('primary dimension balance over random play', () => {
  const c = {}; const N = 3000;
  for (let i = 0; i < N; i++) {
    const run = BW.newRun('19' + (50 + (i % 50)) + '-0' + (1 + (i % 9)) + '-1' + (i % 9), i, 'en', NOW);
    for (let s = 0; s < 5; s++) BW.choose(run, s, Math.floor(Math.random() * LEN(s, run.sits[s])));
    const r = BW.finish(run); c[r.primary] = (c[r.primary] || 0) + 1;
  }
  for (const d of BW.DIMS) { const p = (c[d] || 0) / N; assert.ok(p > 0.05 && p < 0.35, d + ' ' + p); }
});

// ---------- languages ----------
test('EN and RU packs have identical shapes (same rng consumption)', () => {
  const en = BW.CONTENT.en, ru = BW.CONTENT.ru;
  for (const k of ['anomalies', 'worldFacts', 'places', 'stageLabels', 'lifePaths', 'zodiac', 'elements', 'eastern', 'easternElements', 'weekdays']) assert.equal(ru[k].length, en[k].length, k);
  en.stages.forEach((st, i) => st.forEach((sit, j) => {
    assert.equal(ru.stages[i][j].options.length, sit.options.length, `opts ${i}/${j}`);
    assert.equal(sit.options.length, BW.STAGE_META[i].sits[j].length, `meta ${i}/${j}`);
    sit.options.forEach((o, k) => {
      const r = ru.stages[i][j].options[k];
      assert.deepEqual(Object.keys(r.vars).sort(), Object.keys(o.vars).sort(), `vars ${i}/${j}/${k}`);
      for (const v in o.vars) {
        assert.equal(r.vars[v].length, o.vars[v].length, `len ${i}/${j}/${k}/${v}`);
        if (typeof o.vars[v][0] === 'number') assert.deepEqual(r.vars[v], o.vars[v]);
      }
    });
  }));
  for (const d of BW.DIMS) for (const k of ['nouns', 'adjs', 'verdicts']) assert.equal(ru.dims[d][k].length, en.dims[d][k].length, d + k);
});
test('same seed + choices → same reality in both languages', () => {
  for (let s = 0; s < 40; s++) {
    const ch = [s % 3, s % 3, s % 3, s % 3, s % 6];
    const a = BW.simulate('1993-08-21', ch, { salt: s, now: NOW, lang: 'en' }), b = BW.simulate('1993-08-21', ch, { salt: s, now: NOW, lang: 'ru' });
    for (const k of ['id', 'primary', 'secondary', 'rejected', 'earth', 'artSeed', 'key', 'rarity', 'lifePath']) assert.equal(a[k], b[k], k);
  }
});
test('plural helper', () => {
  const f = ['час', 'часа', 'часов'];
  assert.deepEqual([1, 2, 5, 11, 12, 21, 22, 25, 111, 104].map(n => BW.plural(n, f)), ['час', 'часа', 'часов', 'часов', 'часов', 'час', 'часа', 'часов', 'часов', 'часа']);
});

// ---------- key ----------
test('key round-trips to the identical result, in either language; tampered keys rejected', () => {
  for (let s = 0; s < 60; s++) {
    const run = BW.newRun('1979-06-02', s, 'ru', NOW);
    for (let i = 0; i < 5; i++) BW.choose(run, i, (s + i) % LEN(i, run.sits[i]));
    const r = BW.finish(run);
    assert.match(r.key, /^[0-9A-Z]{5}(-[0-9A-Z]{5}){5}$/);
    const back = BW.fromKey(r.key, 'ru');
    assert.deepEqual(back, r);
    assert.equal(BW.fromKey(r.key.toLowerCase(), 'en').id, r.id);
  }
  assert.equal(BW.fromKey('', 'en'), null);
  assert.equal(BW.fromKey('ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ', 'en'), null);
  assert.equal(BW.fromKey('hello', 'en'), null);
  const r = BW.simulate('1979-06-02', [0, 0, 0, 0, 0], { salt: 3, now: NOW });
  let bad = 0; const flip = c => (c === '0' ? '1' : '0');
  for (let i = 0; i < r.key.length; i++) { if (r.key[i] === '-') continue; const k = r.key.slice(0, i) + flip(r.key[i]) + r.key.slice(i + 1); const b = BW.fromKey(k, 'en'); if (!b || JSON.stringify(b) !== JSON.stringify(r)) bad++; }
  assert.equal(bad, 30, 'every single-char edit changes or invalidates the result: ' + bad);
});

// ---------- privacy ----------
test('PRIVACY: shareable outputs carry no date, zodiac, eastern year or weekday', () => {
  const date = '1990-05-17';
  const d = BW.decodeBirth(date, 'ru', NOW);
  for (const lang of ['en', 'ru']) {
    const dd = BW.decodeBirth(date, lang, NOW);
    const r = BW.simulate(date, [0, 1, 2, 0, 3], { salt: 5, now: NOW, lang });
    const md = BW.realitySeedMarkdown(r);
    const pr = Object.values(BW.aiPrompts(r)).join(' ');
    for (const s of [md, pr, JSON.stringify(r)]) {
      assert.ok(!/1990|17\.05|05-17|17 May|May 17|17 мая/.test(s));
      for (const bad of [dd.zodiac, dd.eastern]) assert.ok(!s.includes(bad), lang + ' leaks ' + bad);
      assert.ok(!new RegExp('\\b' + dd.weekday + '\\b', 'i').test(s.replace(/понедельник|вторник|среда|четверг|пятница|суббота|воскресенье/g, m => (m === dd.weekday ? m : ''))) || !s.toLowerCase().includes(dd.weekday.toLowerCase()), lang + ' leaks weekday');
    }
  }
  assert.ok(d.zodiac && d.eastern);
});
test('PRIVACY: seed is independent of the date; shared scores are 0–10 bars only', () => {
  const a = BW.newRun('1990-05-17', 77, 'en', NOW), b = BW.newRun('1961-11-30', 77, 'en', NOW);
  assert.equal(a.seed, b.seed, 'same salt → same seed regardless of date');
  const r = BW.simulate('1990-05-17', [0, 1, 2, 0, 3], { salt: 5, now: NOW });
  for (const s of r.scores) assert.ok(Number.isInteger(s.value) && s.value >= 0 && s.value <= 10);
  assert.ok(!/\d\.\d/.test(BW.realitySeedMarkdown(r).split('CHARACTER BUILD')[1].split('##')[0]), 'no decimal scores in the seed');
});
test('PRIVACY: flavour (earth/anomaly/world) depends on the per-run salt, not the date alone', () => {
  const earths = new Set(); for (let s = 0; s < 50; s++) earths.add(BW.world(BW.newRun('1990-05-17', s, 'en', NOW)).earth);
  assert.ok(earths.size > 40);
});

// ---------- outputs ----------
test('Reality Seed has Genesis §13 headings, disclaimer, build, no URL query', () => {
  for (const lang of ['en', 'ru']) {
    const r = BW.simulate('1990-05-17', [0, 1, 2, 3, 4], { salt: 5, now: NOW, lang });
    const md = BW.realitySeedMarkdown(r);
    for (const h of ['TIMELINE', 'BIRTH SEED', 'THE WORLD', 'CHARACTER BUILD', 'THE POSSIBLE FUTURE', 'CHOICES THAT CREATED IT', 'WHAT I KEPT CHOOSING',
      'WHAT I KEPT REJECTING', 'IMPORTANT EVENTS', 'POSSIBLE PROJECT', 'FIRST EXPERIMENT', 'VISUAL LANGUAGE', 'OPEN QUESTIONS', 'INSTRUCTIONS FOR AN AI']) assert.ok(md.includes(h), lang + ' ' + h);
    assert.ok(/not objective truth|не объективную правду/.test(md));
    assert.ok(!/\?k=|\?from=|https?:\/\//.test(md), 'no clickable URL in the seed (pastes looked like a link)');
  }
});
test('AI prompts: three, short enough for ?q= deep links, game framing, RU asks for Russian', () => {
  for (const lang of ['en', 'ru']) for (let s = 0; s < 30; s++) {
    const r = BW.simulate('1984-12-30', [s % 3, s % 3, s % 3, s % 3, s % 6], { salt: s, now: NOW, lang });
    const p = BW.aiPrompts(r);
    for (const k of ['plan', 'future', 'debuff']) {
      assert.ok(encodeURIComponent(p[k]).length < 2000 * (lang === 'ru' ? 1.6 : 1), lang + ' ' + k + ' ' + encodeURIComponent(p[k]).length);
      assert.ok(/game|игр/i.test(p[k]));
      if (lang === 'ru') assert.ok(/по-русски/.test(p[k]));
    }
  }
});
test('rarity table covers every primary|secondary pair', () => {
  for (const a of BW.DIMS) for (const b of BW.DIMS) if (a !== b) assert.ok(BW.RARITY[a + '|' + b] > 0, a + '|' + b);
});

// ---------- site files ----------
test('site: generated /ru/ entry exists with Russian meta and doctype first (run operations/build-ru.mjs)', () => {
  const p = new URL('../site/ru/index.html', import.meta.url);
  if (!existsSync(p)) return; // CI builds it after tests
  const h = readFileSync(p, 'utf8');
  assert.ok(h.startsWith('<!doctype html>'));
  assert.ok(h.includes('<base href="../">') && h.includes('og-ru.png') && h.includes('data-lang="ru"'));
});

// ---- QA-EVAL-001 (v0.3 review) — defects fixed in v0.3 before release; kept as regression tests. ----
test('QA PRIVACY: the key carries nothing birth-derived beyond the life path (same visible result → same key)', () => {
  // Dates sharing a life path but differing in zodiac / eastern year / weekday.
  const dates = [];
  for (let y = 1955; y <= 2008 && dates.length < 8; y += 3) for (let m = 1; m <= 12 && dates.length < 8; m += 4) {
    const d = `${y}-${String(m).padStart(2, '0')}-1${(y + m) % 9}`;
    if (BW.lifePathOf(d).n === 5) dates.push(d);
  }
  assert.ok(dates.length >= 5, 'found dates: ' + dates.length);
  const sig = d => { const x = BW.decodeBirth(d, 'en', NOW); return x.element + x.eastern + x.weekday; };
  assert.ok(new Set(dates.map(sig)).size >= 4, 'dates differ in zodiac/eastern/weekday');
  let compared = 0;
  for (let salt = 0; salt < 200; salt++) {
    const ch = [salt % 3, (salt >> 1) % 3, (salt >> 2) % 3, (salt >> 3) % 3, salt % 6];
    const rs = dates.map(d => BW.simulate(d, ch, { salt, now: NOW }));
    for (let i = 1; i < rs.length; i++) {
      const same = rs[i].primary === rs[0].primary && rs[i].secondary === rs[0].secondary && rs[i].rejected === rs[0].rejected
        && JSON.stringify(rs[i].scores) === JSON.stringify(rs[0].scores);
      if (same) { compared++; assert.equal(rs[i].key, rs[0].key, 'key differs although the visible result is identical'); }
    }
  }
  assert.ok(compared > 50, 'enough identical pairs compared: ' + compared);
});
test('QA KEY: tampering is rejected by the checksum', () => {
  const k = BW.simulate('1990-07-15', [0, 0, 0, 0, 0], { salt: 1, now: NOW }).key.replace(/-/g, '');
  const B = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  let accepted = 0;
  for (let i = 0; i < 30; i++) for (const c of B) {
    if (c === k[i]) continue;
    const r = BW.fromKey(k.slice(0, i) + c + k.slice(i + 1), 'en');
    if (r) accepted++;
  }
  assert.ok(accepted <= 2, 'forged single-char edits accepted: ' + accepted + ' of 930');
});
