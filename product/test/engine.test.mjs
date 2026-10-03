// BORN WEIRD engine tests (v0.5 "Value Compass"). Run: node --test 'product/test/*.test.mjs'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
const require = createRequire(import.meta.url);
const BW = require('../site/engine.js');
const NOW = new Date('2026-10-03T12:00:00Z');
const V = BW.VALUES;
const randAnswers = r => Array.from({ length: BW.CHOICE_SCREENS }, () => { const b = Math.floor(r() * 4); let w = Math.floor(r() * 3); if (w >= b) w++; return [b, w]; });
const randShadow = r => [0, 1, 2].map(() => Math.floor(r() * 3));
const play = (date, r, opts = {}) => BW.simulate(date, randAnswers(r), Object.assign({ now: NOW, shadow: randShadow(r) }, opts));
/** Play by value preference: plus = most preferred visible value, minus = least preferred; shadow answers given. */
function playPref(pref, shadow = [0, 0, 0], salt = 1, date = '1990-05-17') {
  const run = BW.newRun(date, salt, 'en', NOW);
  for (let k = 0; k < BW.CHOICE_SCREENS; k++) {
    const opts = BW.item(run, k).options.map(o => o.value);
    const sorted = opts.slice().sort((a, b) => pref.indexOf(a) - pref.indexOf(b));
    BW.answer(run, k, opts.indexOf(sorted[0]), opts.indexOf(sorted[3]));
  }
  shadow.forEach((a, j) => BW.answerShadow(run, BW.CHOICE_SCREENS + j, a));
  return { run, res: BW.finish(run) };
}
const dist = (a, b) => { const d = Math.abs(V.indexOf(a) - V.indexOf(b)); return Math.min(d, 8 - d); };

// ---------- birth date ----------
test('validation: malformed, impossible, future, pre-1900', () => {
  for (const s of ['', 'abc', '1990-13-01', '1990-02-30', '2001-02-29', null]) assert.throws(() => BW.decodeBirth(s, 'en', NOW), /invalid/);
  assert.throws(() => BW.decodeBirth('2026-10-04', 'en', NOW), /future/);
  assert.throws(() => BW.decodeBirth('1899-12-31', 'en', NOW), /too early/);
  assert.doesNotThrow(() => BW.decodeBirth('2000-02-29', 'en', NOW));
});
test('real facts: weeks, age, stage, milestone, world; stars hypothesis', () => {
  const d = BW.decodeBirth('1988-06-21', 'ru', NOW);
  assert.equal(d.age, 38); assert.equal(d.weeksLived, Math.floor(d.daysAlive / 7));
  assert.equal(d.stage.name, 'близость ↔ изоляция');
  assert.ok(d.milestone.inDays > 0 && d.milestone.inDays <= 1000);
  assert.match(d.world, /млрд/);
  assert.equal(d.zodiac, 'Рак'); assert.equal(d.elementName, 'вода');
  assert.equal(d.stars.length, 2); assert.notEqual(d.stars[0].value, d.stars[1].value);
  assert.equal(BW.decodeBirth('1988-10-03', 'en', NOW).age, 38); // birthday today
  assert.equal(BW.decodeBirth('1988-10-04', 'en', NOW).age, 37);
});
test('life path arithmetic in DD.MM.YYYY order; stars always two different values', () => {
  assert.deepEqual(BW.lifePathOf('1991-03-14'), { n: 1, steps: ['1+4+0+3+1+9+9+1 = 28', '2+8 = 10', '1+0 = 1'] });
  for (let lp = 1; lp <= 9; lp++) for (let e = 0; e < 4; e++) { const s = BW.starsOf(lp, e); assert.equal(new Set(s).size, 2); s.forEach(v => assert.ok(v >= 0 && v < 8)); }
});

// ---------- runs ----------
test('rounds I–II: 4 distinct options; every value exactly 3 times per run', () => {
  for (let salt = 0; salt < 200; salt++) {
    const run = BW.newRun('1990-05-17', salt, 'en', NOW), count = {};
    for (let k = 0; k < BW.CHOICE_SCREENS; k++) {
      const it = BW.item(run, k);
      assert.equal(it.options.length, 4); assert.equal(new Set(it.options.map(o => o.value)).size, 4);
      assert.equal(it.round, k < 3 ? 'instinct' : 'price');
      it.options.forEach(o => { count[o.value] = (count[o.value] || 0) + 1; assert.ok(o.text); });
    }
    assert.deepEqual(Object.values(count), [3, 3, 3, 3, 3, 3, 3, 3]);
  }
});
test('answer rules: order, distinct picks, shadow only after 6 screens', () => {
  const run = BW.newRun('1990-05-17', 1, 'en', NOW);
  assert.throws(() => BW.answer(run, 1, 0, 1), /order/);
  assert.throws(() => BW.answer(run, 0, 2, 2), /invalid/);
  assert.throws(() => BW.answerShadow(run, 6, 0), /order/);
  for (let k = 0; k < 6; k++) BW.answer(run, k, 0, 1);
  assert.throws(() => BW.answer(run, 6, 0, 1), /order/);
  assert.throws(() => BW.answerShadow(run, 7, 0), /order/);
  assert.throws(() => BW.answerShadow(run, 6, 3), /invalid/);
  assert.throws(() => BW.finish(run), /not complete/);
  [0, 1, 2].forEach(j => BW.answerShadow(run, 6 + j, 1));
  assert.ok(BW.finish(run).id);
});
test('variety: no repeated situation within a run; seen-history gives 2 fresh runs in a row', () => {
  let seen = [];
  for (let i = 0; i < 2; i++) {
    const run = BW.newRun('1990-05-17', 100 + i, 'ru', NOW, seen);
    const ids = run.sits.map((s, k) => (k < 3 ? 'I' : 'P') + s);
    assert.equal(new Set(ids).size, 6);
    for (const id of ids) assert.ok(!seen.includes(id), 'repeat ' + id + ' in run ' + i);
    seen = seen.concat(ids);
  }
});
test('shadow round tests the two leaders, then a stars value that is not in the top 3', () => {
  for (let salt = 0; salt < 300; salt++) {
    const run = BW.newRun('1990-05-17', salt, 'en', NOW), r = BW.rng(salt);
    randAnswers(r).forEach(([p, m], k) => BW.answer(run, k, p, m));
    const sc = BW.score(run), tg = BW.shadowTargets(run);
    assert.equal(tg[0].value, sc.rank[0]); assert.equal(tg[1].value, sc.rank[1]);
    const stars = BW.starsOf(run.lifePath, run.element);
    if (tg[2].hiddenCheck) { assert.ok(stars.includes(tg[2].value)); assert.ok(sc.rank.indexOf(tg[2].value) > 2); }
    else { assert.equal(tg[2].value, sc.rank[2]); stars.forEach(v => assert.ok(sc.rank.indexOf(v) <= 2)); }
    assert.equal(BW.item(run, 6).value, V[tg[0].value]);
  }
});
test('scoring: a consistent player gets their order back; opposite values both chosen → opposite contradiction', () => {
  const { res } = playPref(['FREEDOM', 'NOVELTY', 'SUCCESS', 'WORLD', 'INFLUENCE', 'PEOPLE', 'ROOTS', 'SECURITY']);
  assert.equal(res.top, 'FREEDOM'); assert.equal(res.low, 'SECURITY');
  const op = playPref(['FREEDOM', 'SECURITY', 'NOVELTY', 'SUCCESS', 'INFLUENCE', 'WORLD', 'PEOPLE', 'ROOTS']).res;
  assert.equal(op.contradiction.kind, 'opposite');
  assert.deepEqual([op.contradiction.a, op.contradiction.b].sort(), ['FREEDOM', 'SECURITY']);
  assert.match(op.contradiction.short, /Freedom vs security/);
});
test('shadow: "no" to a leader marks it fragile; "take it" on a stars value outside the top 3 marks it hidden', () => {
  for (let salt = 1; salt < 60; salt++) {
    const { run, res } = playPref(['NOVELTY', 'SUCCESS', 'INFLUENCE', 'FREEDOM', 'ROOTS', 'SECURITY', 'WORLD', 'PEOPLE'], [2, 0, 0], salt);
    const tg = BW.score(run).targets;
    const sc0 = BW.score(run); if (res.rank.indexOf(V[tg[0].value]) < 3 && sc0.pricePlus[tg[0].value] === 0 && sc0.plus[tg[0].value] - sc0.minus[tg[0].value] >= 1) assert.equal(res.fragile, V[tg[0].value]);
    if (BW.score(run).pricePlus[tg[0].value] > 0) assert.notEqual(res.fragile, V[tg[0].value]);
    if (tg[2].hiddenCheck && res.rank.indexOf(V[tg[2].value]) > 2) assert.equal(res.hidden, V[tg[2].value]);
    if (!tg[2].hiddenCheck) assert.equal(res.hidden, null);
  }
});
test('consistency over random play: contradiction, stars, protect/easy, ranking follow the rules', () => {
  const r0 = BW.rng(21), kinds = {}, stars = {};
  for (let i = 0; i < 5000; i++) {
    const res = play('1990-05-17', r0, { salt: i });
    const net = Object.fromEntries(res.compass.map(c => [c.value, c.net]));
    const c = res.contradiction; kinds[c.kind] = (kinds[c.kind] || 0) + 1; stars[res.stars.kind] = (stars[res.stars.kind] || 0) + 1;
    const strong = V.filter(v => net[v] >= 1);
    const hasOpp = strong.some(a => strong.some(b => dist(a, b) === 4));
    if (c.kind === 'opposite') { assert.equal(dist(c.a, c.b), 4); assert.ok(net[c.a] >= 1 && net[c.b] >= 1); }
    if (c.kind === 'near') { assert.equal(dist(c.a, c.b), 3); assert.ok(net[c.a] >= 1 && net[c.b] >= 1); }
    const top3 = res.rank.slice(0, 3);
    if (c.kind === 'opposite' || c.kind === 'near') { assert.ok(top3.includes(c.a) && top3.includes(c.b)); assert.ok(Math.max(net[c.a], net[c.b]) >= 2); assert.equal(c.evidence.length, 2); }
    if (c.kind === 'clear') { assert.equal(c.a, res.top); assert.equal(dist(c.a, c.b), 4); assert.ok(net[res.top] >= 2 && net[res.top] > net[res.rank[1]]); }
    if (c.kind === 'open') assert.ok(!(net[res.top] >= 2 && net[res.top] > net[res.rank[1]]));
    if (res.fragile) { assert.notEqual(res.fragile, res.protect); }
    res.drives.slice(1).forEach(v => assert.ok(net[v] >= 1));
    if (res.stars.kind === 'match') res.stars.values.forEach(v => assert.ok(net[v] >= 1));
    const hits = res.stars.values.filter(v => net[v] >= 1 && net[v] >= net[res.rank[2]]).length;
    assert.equal(res.stars.kind, ['miss', 'half', 'match'][hits]);
    assert.notEqual(res.protect, res.easy);
    assert.equal(res.drives[0], res.top);
    for (let k = 1; k < 8; k++) assert.ok(net[res.rank[k - 1]] >= net[res.rank[k]]);
  }
  assert.ok(kinds.opposite && kinds.near && kinds.clear && kinds.open, JSON.stringify(kinds));
  assert.ok(stars.match && stars.half && stars.miss, JSON.stringify(stars));
});
test('every result fully formed in both languages (random play)', () => {
  const r0 = BW.rng(7);
  for (const lang of ['en', 'ru']) for (let i = 0; i < 400; i++) {
    const res = play('1990-05-17', r0, { salt: i, lang });
    for (const k of ['archetype', 'title', 'plus', 'shadow', 'orderText', 'drivesText', 'protectLabel', 'easyLabel', 'purpose']) assert.ok(res[k] && !/undefined|null|NaN/.test(res[k]), k);
    for (const k of ['short', 'text', 'quest']) assert.ok(res.contradiction[k] && !/undefined|NaN/.test(res.contradiction[k]), 'contradiction.' + k);
    assert.ok(res.stars.text && !/undefined|NaN/.test(res.stars.text + res.confidence.text));
    assert.equal(res.compass.length, 8); res.compass.forEach(c => assert.ok(c.bar >= 0 && c.bar <= 10));
    assert.equal(res.choices.length, 9);
  }
});
test('archetype balance over random play: each of 8 appears, none dominates', () => {
  const r0 = BW.rng(11), c = {};
  for (let i = 0; i < 4000; i++) { const res = play('1990-05-17', r0, { salt: i }); c[res.top] = (c[res.top] || 0) + 1; }
  assert.equal(Object.keys(c).length, 8);
  for (const v of Object.values(c)) assert.ok(v / 4000 > 0.06 && v / 4000 < 0.2, JSON.stringify(c));
});

// ---------- languages ----------
test('EN and RU packs have identical shapes', () => {
  const en = BW.CONTENT.en, ru = BW.CONTENT.ru;
  for (const pool of ['instinct', 'price']) {
    assert.equal(en[pool].length, BW.POOL_SIZE); assert.equal(ru[pool].length, BW.POOL_SIZE);
    ru[pool].forEach((s, i) => { assert.equal(s.length, 10, pool + i); assert.equal(en[pool][i].length, 10, pool + i); s.forEach(x => assert.ok(x)); });
  }
  for (const v of V) {
    for (const k of ['reactions', 'shadows']) assert.equal(ru[k][v].length, en[k][v].length, k + v);
    for (const k of ['values', 'nouns', 'adjectives', 'purposeVerb', 'purposeTail', 'cost', 'questGive']) { assert.ok(ru[k][v], 'ru ' + k + v); assert.ok(en[k][v], 'en ' + k + v); }
    assert.ok(ru.stars.persona[v] && en.stars.persona[v]);
  }
  for (const k of ['axes', 'places', 'lpWhy', 'elements', 'elemWhy', 'stages', 'techMilestones', 'zodiac', 'shadowReact']) assert.equal(ru[k].length, en[k].length, k);
});
test('same seed + answers → same reality in both languages', () => {
  for (let s = 0; s < 40; s++) {
    const ans = randAnswers(BW.rng(s)), sh = randShadow(BW.rng(s + 100));
    const a = BW.simulate('1993-08-21', ans, { salt: s, now: NOW, lang: 'en', shadow: sh }), b = BW.simulate('1993-08-21', ans, { salt: s, now: NOW, lang: 'ru', shadow: sh });
    for (const k of ['id', 'top', 'second', 'low', 'key', 'rarity', 'artSeed', 'protect', 'easy', 'hidden', 'fragile']) assert.equal(a[k], b[k], k);
    assert.deepEqual(a.rank, b.rank); assert.equal(a.contradiction.kind, b.contradiction.kind); assert.equal(a.stars.kind, b.stars.kind);
  }
});

// ---------- key ----------
test('key round-trips; tampering rejected', () => {
  const r0 = BW.rng(5);
  for (let s = 0; s < 60; s++) {
    const r = play('1979-06-02', r0, { salt: s, lang: 'ru' });
    assert.match(r.key, /^[0-9A-Z]{5}(-[0-9A-Z]{5}){4}$/);
    assert.deepEqual(BW.fromKey(r.key, 'ru'), r);
    assert.equal(BW.fromKey(r.key.toLowerCase(), 'en').id, r.id);
  }
  const k = play('1979-06-02', r0, { salt: 1 }).key.replace(/-/g, '');
  const B = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; let accepted = 0;
  for (let i = 0; i < 25; i++) for (const c of B) { if (c === k[i]) continue; if (BW.fromKey(k.slice(0, i) + c + k.slice(i + 1), 'en')) accepted++; }
  assert.ok(accepted <= 2, 'forged edits accepted: ' + accepted);
  for (const bad of ['', 'hello', 'ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ', '00000-00000-00000-00000-00000-00000']) assert.equal(BW.fromKey(bad, 'en'), null);
});
test('QA: forged key with a repeated situation is rejected', () => {
  const run = BW.newRun('1990-05-17', 5, 'en', NOW);
  for (let k = 0; k < 6; k++) BW.answer(run, k, 0, 1);
  [0, 0, 0].forEach((a, j) => BW.answerShadow(run, 6 + j, a));
  run.sits[1] = run.sits[0];
  assert.equal(BW.fromKey(BW.encodeKey(run), 'en'), null);
});

// ---------- privacy ----------
test('PRIVACY: result depends on the birth date only via life path and element', () => {
  const want = { lp: BW.lifePathOf('1991-03-14').n, el: BW.elementOf(BW.zodiacOf(3, 14)) };
  const dates = [];
  for (let y = 1955; y < 2010 && dates.length < 4; y += 7) for (let m = 1; m <= 12 && dates.length < 4; m += 5) for (let d = 1; d <= 28; d++) {
    const s = y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    if (BW.lifePathOf(s).n === want.lp && BW.elementOf(BW.zodiacOf(m, d)) === want.el) { dates.push(s); break; }
  }
  assert.ok(dates.length >= 3, dates.join());
  const r0 = BW.rng(9);
  for (let s = 0; s < 30; s++) {
    const ans = randAnswers(r0), sh = randShadow(r0);
    const rs = dates.map(d => BW.simulate(d, ans, { salt: s, now: NOW, shadow: sh }));
    rs.forEach(r => assert.deepEqual(r, rs[0]));
  }
});
test('PRIVACY: shareable outputs contain no date, age, weeks, stage, zodiac sign or birth-year facts', () => {
  const date = '1988-06-21';
  for (const lang of ['en', 'ru']) {
    const d = BW.decodeBirth(date, lang, NOW);
    const r = play(date, BW.rng(1), { salt: 5, lang });
    const blob = BW.realitySeedMarkdown(r) + Object.values(BW.aiPrompts(r)).join(' ') + JSON.stringify(r);
    for (const bad of ['1988', '21.06', '06-21', String(d.weeksLived), String(d.daysAlive), d.stage.name, d.zodiac, d.world, d.milestone.date, d.retakeDate]) assert.ok(!blob.includes(bad), lang + ' leaks ' + bad);
  }
});

// ---------- outputs ----------
test('Value passport: headings, honest disclaimer, machine-readable profile, no URL', () => {
  for (const lang of ['en', 'ru']) {
    const md = BW.realitySeedMarkdown(play('1990-05-17', BW.rng(2), { salt: 5, lang }));
    for (const h of ['VALUE COMPASS', 'STARS VS CHOICES', 'MAIN CONTRADICTION', 'CONFIDENCE', 'PURPOSE HYPOTHESIS', '7-DAY QUEST', 'ARCHETYPE', 'MACHINE-READABLE PROFILE', 'INSTRUCTIONS FOR AN AI']) assert.ok(md.includes(h), lang + ' ' + h);
    assert.ok(/not a psychometric test|не психометрический тест/.test(md));
    assert.ok(!/\?k=|https?:\/\//.test(md));
    const json = JSON.parse(md.split('```json')[1].split('```')[0]);
    assert.equal(json.format, 'born-weird/value-profile'); assert.equal(Object.keys(json.values).length, 8); assert.ok(json.top.length >= 1 && json.top.length <= 3);
  }
});
test('AI prompts: three, short enough for ?q= links, game framing, RU asks for Russian', () => {
  for (const lang of ['en', 'ru']) for (let s = 0; s < 60; s++) {
    const p = BW.aiPrompts(play('1984-12-30', BW.rng(s + 1), { salt: s, lang }));
    for (const k of ['compass', 'purpose', 'plan']) {
      assert.ok(encodeURIComponent(p[k]).length < 3200, lang + ' ' + k + ' ' + encodeURIComponent(p[k]).length);
      assert.ok(/game|игр/i.test(p[k]));
      if (lang === 'ru') assert.ok(/по-русски/.test(p[k]));
    }
  }
});
test('RU copy has no gendered past tense or adjectives about the user', () => {
  const ru = BW.CONTENT.ru;
  const all = JSON.stringify([ru.values, ru.instinct, ru.price, ru.shadows, ru.axes, ru.cost, ru.questGive, ru.nouns, ru.rounds, ru.open]) + [ru.near.text('А', 'Б', 'а', 'б'), ru.clear.text('А', 'Б', 'в'), ru.hidden('А'), ru.fragile('А')].join(' ');
  for (const bad of ['сделал(а)', 'был(а)', 'мог(ла)', 'Будущий ты', 'никогда не был', 'испытывал', 'пробовал', 'будешь счастлив', 'готов ', 'последователен', 'самому', ' сам ', 'здоровым', 'середнячком']) assert.ok(!all.includes(bad), bad);
  const re = /(^|[^а-яё])ты (никогда |уже |ещё )?(не )?[а-яё]+л[ ,.!?»]/i;
  assert.ok(!re.test(all), String(all.match(re)));
});
test('rarity table covers every reachable top-1|top-2 combination', () => {
  const r0 = BW.rng(13);
  for (let i = 0; i < 2000; i++) { const r = play('1990-05-17', r0, { salt: i }); assert.ok(BW.RARITY[r.rarityKey] > 0, r.rarityKey); }
});
test('site: generated /ru/ entry (if built)', () => {
  const p = new URL('../site/ru/index.html', import.meta.url);
  if (!existsSync(p)) return;
  const h = readFileSync(p, 'utf8');
  assert.ok(h.startsWith('<!doctype html>') && h.includes('<base href="../">') && h.includes('og-ru.png') && h.includes('data-lang="ru"'));
});
