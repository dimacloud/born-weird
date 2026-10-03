// BORN WEIRD engine tests (v0.4 "Mirror"). Run: node --test 'product/test/*.test.mjs'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
const require = createRequire(import.meta.url);
const BW = require('../site/engine.js');
const NOW = new Date('2026-10-03T12:00:00Z');
const randAnswers = r => BW.PLAN.map(() => { const b = Math.floor(r() * 4); let w = Math.floor(r() * 3); if (w >= b) w++; return [b, w]; });

// ---------- birth date ----------
test('validation: malformed, impossible, future, pre-1900', () => {
  for (const s of ['', 'abc', '1990-13-01', '1990-02-30', '2001-02-29', null]) assert.throws(() => BW.decodeBirth(s, 'en', NOW), /invalid/);
  assert.throws(() => BW.decodeBirth('2026-10-04', 'en', NOW), /future/);
  assert.throws(() => BW.decodeBirth('1899-12-31', 'en', NOW), /too early/);
  assert.doesNotThrow(() => BW.decodeBirth('2000-02-29', 'en', NOW));
});
test('real facts: weeks, age, stage, milestone, world', () => {
  const d = BW.decodeBirth('1988-06-21', 'ru', NOW);
  assert.equal(d.age, 38); assert.equal(d.weeksLived, Math.floor(d.daysAlive / 7));
  assert.equal(d.stage.name, 'близость ↔ изоляция');
  assert.ok(d.milestone.inDays > 0 && d.milestone.inDays <= 1000);
  assert.match(d.world, /млрд/);
  assert.equal(BW.decodeBirth('1988-10-03', 'en', NOW).age, 38); // birthday today
  assert.equal(BW.decodeBirth('1988-10-04', 'en', NOW).age, 37);
  const g = BW.decodeBirth('1995-01-01', 'en', new Date('2026-09-01T12:00:00Z'));
  assert.ok(['days', 'gsec', 'weeks', 'bday'].includes(g.milestone.kind)); assert.ok(g.milestone.inDays <= 366);
});
test('life path arithmetic in DD.MM.YYYY order', () => {
  assert.deepEqual(BW.lifePathOf('1991-03-14'), { n: 1, steps: ['1+4+0+3+1+9+9+1 = 28', '2+8 = 10', '1+0 = 1'] });
});

// ---------- runs ----------
test('8 items, horizons in order, 4 options each with every pole once', () => {
  const run = BW.newRun('1990-05-17', 1, 'en', NOW);
  for (let k = 0; k < 8; k++) {
    const it = BW.item(run, k);
    assert.equal(it.options.length, 4);
    assert.deepEqual(it.options.map(o => o.pole).sort(), [...BW.POLES].sort());
  }
});
test('answer rules: order, distinct best/worst, bridge after item 7', () => {
  const run = BW.newRun('1990-05-17', 1, 'en', NOW);
  assert.throws(() => BW.answer(run, 1, 0, 1), /order/);
  assert.throws(() => BW.answer(run, 0, 2, 2), /invalid/);
  for (let k = 0; k <= BW.BRIDGE_AFTER; k++) BW.answer(run, k, 0, 1);
  assert.throws(() => BW.answer(run, BW.BRIDGE_AFTER + 1, 0, 1), /bridge/);
  assert.throws(() => BW.setBridge(run, 9), /1–7/);
  BW.setBridge(run, 5);
  BW.answer(run, 7, 0, 1);
  assert.equal(BW.finish(run).bridge, 5);
});
test('variety: no repeated situations within a run; seen-history avoids repeats across 3 runs', () => {
  let seen = [];
  for (let i = 0; i < 3; i++) {
    const run = BW.newRun('1990-05-17', 100 + i, 'ru', NOW, seen);
    const ids = run.sits.map((s, k) => BW.PLAN[k] + s);
    assert.equal(new Set(ids).size, 8);
    for (const id of ids) assert.ok(!seen.includes(id), 'repeat ' + id + ' in run ' + i);
    seen = seen.concat(ids);
  }
});
test('first situation is picked by the life path among unseen', () => {
  const lp = BW.lifePathOf('1990-05-17').n;
  assert.equal(BW.newRun('1990-05-17', 1, 'en', NOW).sits[0], lp % 6);
});
test('scoring: best +1, worst −1; tension and blind spot follow the rules', () => {
  const run = BW.newRun('1990-05-17', 3, 'en', NOW);
  // choose FREEDOM as best 4 times and ANCHOR as best 4 times → O-axis tension
  for (let k = 0; k < 8; k++) {
    const opts = BW.item(run, k).options.map(o => o.pole);
    const best = opts.indexOf(k % 2 ? 'FREEDOM' : 'ANCHOR'), worst = opts.indexOf('WEIGHT');
    BW.answer(run, k, best, worst);
    if (k === BW.BRIDGE_AFTER) BW.setBridge(run, 2);
  }
  const r = BW.finish(run);
  assert.equal(r.tension.kind, 'axis'); assert.equal(r.tension.axis, 'O');
  assert.equal(r.low, 'WEIGHT');
  assert.equal(r.profile.find(p => p.pole === 'WEIGHT').worst, 8);
});
test('clear priority when one pole dominates', () => {
  const run = BW.newRun('1990-05-17', 4, 'en', NOW);
  for (let k = 0; k < 8; k++) {
    const opts = BW.item(run, k).options.map(o => o.pole);
    BW.answer(run, k, opts.indexOf('CARE'), opts.indexOf('WEIGHT'));
    if (k === BW.BRIDGE_AFTER) BW.setBridge(run, 7);
  }
  const r = BW.finish(run);
  assert.equal(r.tension.kind, 'clear'); assert.equal(r.top, 'CARE'); assert.equal(r.low, 'WEIGHT');
  assert.ok(['THE GUARDIAN', 'THE WANDERING HEALER'].includes(r.archetype));
});
test('every result fully formed in both languages (random play)', () => {
  const r0 = BW.rng(7);
  for (const lang of ['en', 'ru']) for (let i = 0; i < 400; i++) {
    const res = BW.simulate('1990-05-17', randAnswers(r0), { salt: i, now: NOW, lang, bridge: 1 + (i % 7) });
    for (const k of ['archetype', 'plus', 'shadow', 'orderText', 'blind', 'bridgeText', 'title']) assert.ok(res[k] && !/undefined|null|NaN/.test(res[k]), k);
    for (const k of ['short', 'text', 'quest']) assert.ok(res.tension[k], 'tension.' + k);
    assert.equal(res.rank.length, 4);
    res.profile.forEach(p => assert.ok(p.bar >= 0 && p.bar <= 10));
  }
});
test('archetype balance over random play: each of 8 appears, none dominates', () => {
  const r0 = BW.rng(11), c = {};
  for (let i = 0; i < 4000; i++) { const res = BW.simulate('1990-05-17', randAnswers(r0), { salt: i, now: NOW }); c[res.archetype] = (c[res.archetype] || 0) + 1; }
  assert.equal(Object.keys(c).length, 8);
  for (const v of Object.values(c)) assert.ok(v / 4000 > 0.05 && v / 4000 < 0.25, JSON.stringify(c));
});

// ---------- languages ----------
test('EN and RU packs have identical shapes', () => {
  const en = BW.CONTENT.en, ru = BW.CONTENT.ru;
  for (const h of BW.HORIZONS) {
    assert.equal(en.situations[h].length, BW.POOL_SIZE); assert.equal(ru.situations[h].length, BW.POOL_SIZE);
    ru.situations[h].forEach((s, i) => { assert.equal(s.length, 5, h + i); assert.equal(en.situations[h][i].length, 5, h + i); });
  }
  for (const p of BW.POLES) assert.equal(ru.reactions[p].length, en.reactions[p].length);
  assert.deepEqual(Object.keys(ru.archetypes).sort(), Object.keys(en.archetypes).sort());
  for (const k of ['places', 'worldFacts', 'lifePaths', 'stages', 'techMilestones', 'bridgeText']) assert.equal(ru[k].length, en[k].length, k);
});
test('same seed + answers → same reality in both languages', () => {
  const r0 = BW.rng(3);
  for (let s = 0; s < 40; s++) {
    const ans = randAnswers(r0);
    const a = BW.simulate('1993-08-21', ans, { salt: s, now: NOW, lang: 'en' }), b = BW.simulate('1993-08-21', ans, { salt: s, now: NOW, lang: 'ru' });
    for (const k of ['id', 'top', 'second', 'low', 'key', 'rarity', 'bridge', 'artSeed']) assert.equal(a[k], b[k], k);
  }
});

// ---------- key ----------
test('key round-trips; tampering rejected', () => {
  const r0 = BW.rng(5);
  for (let s = 0; s < 60; s++) {
    const r = BW.simulate('1979-06-02', randAnswers(r0), { salt: s, now: NOW, lang: 'ru', bridge: 1 + (s % 7) });
    assert.match(r.key, /^[0-9A-Z]{5}(-[0-9A-Z]{5}){5}$/);
    assert.deepEqual(BW.fromKey(r.key, 'ru'), r);
    assert.equal(BW.fromKey(r.key.toLowerCase(), 'en').id, r.id);
  }
  const k = BW.simulate('1979-06-02', randAnswers(r0), { salt: 1, now: NOW }).key.replace(/-/g, '');
  const B = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; let accepted = 0;
  for (let i = 0; i < 30; i++) for (const c of B) { if (c === k[i]) continue; if (BW.fromKey(k.slice(0, i) + c + k.slice(i + 1), 'en')) accepted++; }
  assert.ok(accepted <= 2, 'forged edits accepted: ' + accepted);
  for (const bad of ['', 'hello', 'ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ']) assert.equal(BW.fromKey(bad, 'en'), null);
});

// ---------- privacy ----------
test('PRIVACY: result depends on the birth date only via the life path', () => {
  const dates = ['1991-03-14', '2002-07-08', '1960-08-31'];
  dates.forEach(d => assert.equal(BW.lifePathOf(d).n, 1));
  const r0 = BW.rng(9);
  for (let s = 0; s < 30; s++) {
    const ans = randAnswers(r0);
    const rs = dates.map(d => BW.simulate(d, ans, { salt: s, now: NOW }));
    rs.forEach(r => assert.deepEqual(r, rs[0]));
  }
});
test('PRIVACY: shareable outputs contain no date, age, weeks, stage, zodiac or birth-year facts', () => {
  const date = '1988-06-21';
  for (const lang of ['en', 'ru']) {
    const d = BW.decodeBirth(date, lang, NOW);
    const r = BW.simulate(date, randAnswers(BW.rng(1)), { salt: 5, now: NOW, lang });
    const blob = BW.realitySeedMarkdown(r) + Object.values(BW.aiPrompts(r)).join(' ') + JSON.stringify(r);
    for (const bad of ['1988', '21.06', '06-21', String(d.weeksLived), String(d.daysAlive), d.stage.name, d.zodiac, d.world, d.milestone.date]) assert.ok(!blob.includes(bad), lang + ' leaks ' + bad);
  }
});

// ---------- outputs ----------
test('Reality Seed: headings, honest disclaimer, no URL query', () => {
  for (const lang of ['en', 'ru']) {
    const md = BW.realitySeedMarkdown(BW.simulate('1990-05-17', randAnswers(BW.rng(2)), { salt: 5, now: NOW, lang }));
    for (const h of ['VALUE PROFILE', 'MAIN TENSION', 'BLIND SPOT', 'BRIDGE TO FUTURE SELF', '7-DAY QUEST', 'ARCHETYPE', 'BIRTH SYMBOL', 'INSTRUCTIONS FOR AN AI']) assert.ok(md.includes(h), lang + ' ' + h);
    assert.ok(/not a psychometric test|не психометрический тест/.test(md));
    assert.ok(!/\?k=|https?:\/\//.test(md));
  }
});
test('AI prompts: three, short enough for ?q= links, game framing, RU asks for Russian', () => {
  for (const lang of ['en', 'ru']) for (let s = 0; s < 30; s++) {
    const p = BW.aiPrompts(BW.simulate('1984-12-30', randAnswers(BW.rng(s + 1)), { salt: s, now: NOW, lang }));
    for (const k of ['plan', 'future', 'tension']) {
      assert.ok(encodeURIComponent(p[k]).length < 3200, lang + ' ' + k + ' ' + encodeURIComponent(p[k]).length);
      assert.ok(/game|игр/i.test(p[k]));
      if (lang === 'ru') assert.ok(/по-русски/.test(p[k]));
    }
  }
});
test('RU copy has no gendered past tense about the user in key places', () => {
  const ru = BW.CONTENT.ru, all = JSON.stringify([ru.situations, ru.tension, ru.blind, ru.bridgeText, ru.lifePaths, ru.archetypes]);
  for (const bad of ['сделал(а)', 'был(а)', 'мог(ла)', 'Будущий ты']) assert.ok(!all.includes(bad), bad);
});
test('rarity table covers every reachable archetype|tension combination', () => {
  const r0 = BW.rng(13);
  for (let i = 0; i < 2000; i++) { const r = BW.simulate('1990-05-17', randAnswers(r0), { salt: i, now: NOW }); assert.ok(BW.RARITY[r.rarityKey] > 0, r.rarityKey); }
});
test('site: generated /ru/ entry (if built)', () => {
  const p = new URL('../site/ru/index.html', import.meta.url);
  if (!existsSync(p)) return;
  const h = readFileSync(p, 'utf8');
  assert.ok(h.startsWith('<!doctype html>') && h.includes('<base href="../">') && h.includes('og-ru.png') && h.includes('data-lang="ru"'));
});

// ---------- QA-EVAL-001 (v0.4) ----------
const playPoles = (seq, salt = 1) => {
  const run = BW.newRun('1990-05-17', salt, 'en', NOW);
  seq.forEach(([b, w], k) => { const o = BW.item(run, k).options.map(x => x.pole); BW.answer(run, k, o.indexOf(b), o.indexOf(w)); if (k === BW.BRIDGE_AFTER) BW.setBridge(run, 4); });
  return BW.finish(run);
};
const rep = f => Array.from({ length: 8 }, (_, k) => f(k));
test('QA: edge cases — same pole best 8×, all ties deterministic per seed', () => {
  const r = playPoles(rep(() => ['FREEDOM', 'ANCHOR']));
  assert.equal(r.tension.kind, 'clear'); assert.equal(r.top, 'FREEDOM'); assert.equal(r.low, 'ANCHOR');
  const P = BW.POLES;
  for (let s = 1; s < 20; s++) assert.deepEqual(playPoles(rep(k => [P[k % 4], P[(k + 2) % 4]]), s), playPoles(rep(k => [P[k % 4], P[(k + 2) % 4]]), s));
});
test('QA: forged key with a repeated situation is rejected', () => {
  const run = BW.newRun('1990-05-17', 5, 'en', NOW);
  for (let k = 0; k < 8; k++) { BW.answer(run, k, 0, 1); if (k === 6) BW.setBridge(run, 3); }
  run.sits[1] = run.sits[0];
  assert.equal(BW.fromKey(BW.encodeKey(run), 'en'), null);
});
test('QA: "clear priority" only when one pole strictly wins; its cost is the blind spot', () => {
  const tie = playPoles(rep(k => [k % 2 ? 'FREEDOM' : 'WEIGHT', 'ANCHOR'])); // FREEDOM and WEIGHT chosen 4× each
  assert.notEqual(tie.tension.kind, 'clear');
  const r = playPoles(rep(() => ['FREEDOM', 'WEIGHT']));
  assert.equal(r.tension.kind, 'clear'); assert.equal(r.tension.pole, 'FREEDOM');
  assert.equal(r.tension.costPole, r.blindPole); assert.equal(r.blindPole, 'WEIGHT');
});
test('QA: blind spot is never a pole of the main tension axis', () => {
  const r = playPoles(rep(k => (k < 2 ? ['FREEDOM', 'CARE'] : k < 4 ? ['ANCHOR', 'FREEDOM'] : ['CARE', 'FREEDOM'])));
  assert.ok(!(r.tension.kind === 'axis' && BW.AXIS[r.blindPole] === r.tension.axis), r.tension.short + ' + blind ' + r.blindPole);
});
test('consistency over random play: clear = strict winner, cost = blind spot, blind spot off the tension axis', () => {
  const r0 = BW.rng(21);
  const kinds = {};
  for (let i = 0; i < 5000; i++) {
    const res = BW.simulate('1990-05-17', randAnswers(r0), { salt: i, now: NOW });
    kinds[res.tension.kind] = (kinds[res.tension.kind] || 0) + 1;
    const best = Object.fromEntries(res.profile.map(p => [p.pole, p.best]));
    if (res.tension.kind === 'clear') {
      assert.ok(BW.POLES.every(p => p === res.tension.pole || best[p] < best[res.tension.pole]));
      assert.equal(res.tension.pole, res.top); assert.equal(res.tension.costPole, res.blindPole);
    }
    if (res.tension.kind === 'axis') assert.notEqual(BW.AXIS[res.blindPole], res.tension.axis);
  }
  assert.ok(kinds.axis && kinds.clear && kinds.mixed, JSON.stringify(kinds));
});
