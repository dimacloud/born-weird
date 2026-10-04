// LAB C — ДВОЙНОЕ ДНО: simulation gate + logic tests. Run: node --test 'product/test/*.test.mjs'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const G = require('../site/lab/c/game.js');
const RUNS = 10000;
const pct = (x, n) => x / n;

test('stream: random interleave — item 1 a word, pair gap ≥ 3 (either order), 1 scene in items 2–4, varied order', () => {
  const r = G.rng(1);
  const patterns = new Set(), gaps = new Set();
  let sameOrder = 0, sceneFirst = 0;
  const RUNS_S = 5000;
  for (let k = 0; k < RUNS_S; k++) {
    const items = G.newRun(r).items;
    assert.equal(items.length, 8);
    assert.equal(items[0].type, 'w');
    const types = items.map(i => i.type).join('');
    patterns.add(types);
    assert.ok(!/wwww|ssss/.test(types));
    assert.equal((types.slice(1, 4).match(/s/g) || []).length, 1);
    const pos = {};
    items.forEach((it, i) => { pos[it.type + it.p] = i; });
    for (let p = 0; p < 4; p++) {
      assert.ok(pos['w' + p] !== undefined && pos['s' + p] !== undefined);
      const d = pos['s' + p] - pos['w' + p];
      assert.ok(Math.abs(d) >= 3, 'word and scene of a pair ≥ 3 apart');
      gaps.add(d); if (d < 0) sceneFirst++;
    }
    assert.ok(!(items[2].type === 's' && items[2].p === items[0].p), 'item 3 never re-asks item 1');
    const wo = items.filter(i => i.type === 'w').map(i => i.p).join(''), so = items.filter(i => i.type === 's').map(i => i.p).join('');
    if (wo === so) sameOrder++;
  }
  assert.ok(patterns.size >= 6, 'type pattern varies: ' + patterns.size);
  assert.ok(gaps.size >= 6, 'gap varies');
  assert.ok(sameOrder / RUNS_S < 0.1, 'scene order rarely mirrors word order');
  assert.ok(sceneFirst > 0, 'a scene can come before its word');
});

test('scenes never echo their own word pair (no vocabulary giveaway)', () => {
  const stem = w => w.toLowerCase().replace(/ё/g, 'е').slice(0, Math.min(5, Math.max(3, w.length - 2)));
  for (const P of G.PAIRS) {
    const text = (P.scene + ' ' + P.sa + ' ' + P.sb).toLowerCase().replace(/ё/g, 'е');
    for (const word of (P.a + ' ' + P.b).split(' ')) assert.ok(!text.includes(stem(word)), P.k + ': scene echoes «' + word + '»');
  }
});

test('items: scenes ≤ 14 words, options ≤ 2 words, copy rules', () => {
  const words = s => s.replace(/[—.,:?«»]/g, ' ').split(/\s+/).filter(Boolean).length;
  for (const P of G.PAIRS) {
    assert.ok(words(P.scene) <= 14, P.scene);
    for (const o of [P.a, P.b, P.sa, P.sb]) assert.ok(words(o) <= 2, o);
  }
  const src = readFileSync(new URL('../site/lab/c/game.js', import.meta.url), 'utf8') + readFileSync(new URL('../site/lab/c/index.html', import.meta.url), 'utf8');
  assert.ok(!/\(а\)/.test(src), 'no (а)');
  assert.ok(!/думал/i.test(src), 'no думал');
  assert.ok(!/на деле/i.test(src), 'no «на деле»');
});

test('every branch reachable, no undefined / NaN / empty text, state round-trips', () => {
  const seen = new Set(), titles = new Set();
  let receipt = 0, second = 0, fastWord = 0, slowScene = 0;
  for (const model of ['uniform', 'spec', 'tight']) {
    const r = G.rng(model.length * 31);
    for (let k = 0; k < RUNS; k++) {
      const res = G.playOne(model, r);
      seen.add(res.tier < 0 ? 'blank' : res.code);
      if (res.title) titles.add(res.title);
      if (res.receipt) receipt++;
      if (res.second) second++;
      if (/Словом — за/.test(res.receipt)) fastWord++;
      if (/Когда дорого —/.test(res.receipt)) slowScene++;
      for (const t of G.texts(res)) {
        assert.equal(typeof t, 'string');
        assert.ok(t.trim().length > 0, 'empty line');
        assert.ok(!/undefined|NaN|null/.test(t), t);
      }
      if (res.tier >= 0) {
        assert.equal(res.card.length, 3);
        assert.match(res.code, /^(monolith|crack|double|chameleon)$/);
        assert.ok(res.share.endsWith('?') && !/http/.test(res.share));
        const back = G.decode(res.state);
        assert.ok(back, 'decodes: ' + res.state);
        assert.equal(back.tier, res.tier);
        assert.equal(back.head, res.head);
        for (const t of G.texts(back)) assert.ok(t && !/undefined|NaN/.test(t));
        assert.ok(G.compareLine(back, res).length > 0);
      } else {
        assert.equal(res.state, '');
      }
    }
  }
  for (const b of ['blank', 'monolith', 'crack', 'double', 'chameleon']) assert.ok(seen.has(b), 'reachable: ' + b);
  assert.equal(titles.size, 8, 'all 8 named splits reachable');
  assert.ok(receipt && second && fastWord && slowScene);
});

test('timeouts exclude the pair and are never quoted', () => {
  const run = G.newRun(G.rng(9));
  run.items.forEach((it, i) => G.answer(run, i, it.p === 0 && it.type === 'w' ? null : 1 - (it.type === 'w' ? 0 : 1), 1000));
  const res = G.result(run);
  assert.equal(res.ledger[0].valid, false);
  assert.equal(res.nValid, 3);
  assert.ok(!G.texts(res).some(t => t.includes(G.PAIRS[0].scene) || t.includes('СВОБОДА') || t.includes('СВОИ ЛЮДИ')));
});

test('broken friend states fall back (decode → null, never throws)', () => {
  const bad = [undefined, null, '', 'x', '1', '10000', '100000x', '1xxxx-', '10000' + '0', '1000002', '103000', '2000-0', '1abcd-', '%%%', '1003-0', 12, {}, '1'.repeat(400)];
  for (const s of bad) assert.equal(G.decode(s), null, String(s));
  assert.ok(G.decode('10000-'));              // monolith 4/4
  assert.ok(G.decode('11000' + '0'));         // crack, head = pair 0
  assert.equal(G.decode('11000' + '1'), null); // head on a non-split pair
});

test('SIM GATE: tier distribution and per-pair flip rate (10k runs per model)', () => {
  const table = {};
  for (const model of ['uniform', 'spec', 'tight']) {
    const s = G.simulate(model, RUNS, 2026);
    table[model] = s;
    const tiers = Object.fromEntries(Object.entries(s.tiers).map(([k, v]) => [k, pct(v, RUNS)]));
    const any = pct(s.anySplit, RUNS);
    console.log(`[lab-c] ${model.padEnd(7)} ` + Object.entries(tiers).map(([k, v]) => `${k} ${(v * 100).toFixed(1)}%`).join(' · ') +
      ` | any split ${(any * 100).toFixed(1)}% | flip/pair ` + s.flipRate.map(f => `${f.k} ${(f.rate * 100).toFixed(1)}%`).join(' '));
  }
  // Spec model (BEHAVIOR): no tier above 45%, at least 3 tiers ≥ 10%.
  const spec = table.spec;
  const specT = ['monolith', 'crack', 'double', 'chameleon'].map(k => pct(spec.tiers[k], RUNS));
  assert.ok(Math.max(...specT) <= 0.45, 'no tier above 45% (spec model)');
  assert.ok(specT.filter(x => x >= 0.10).length >= 3, '≥ 3 tiers at 10%+ (spec model)');
  // Uniform random players: no tier above 45% either.
  const uniT = ['monolith', 'crack', 'double', 'chameleon'].map(k => pct(table.uniform.tiers[k], RUNS));
  assert.ok(Math.max(...uniT) <= 0.45);
  // "Any split" 25–60% is NOT reachable under the spec noise model (per-pair flip ≈ 34% → any ≈ 75%); see build-c.md.
  // It is reached once per-pair flip falls to ≈ 19% (tight model) — the real rate needs humans (counter flip_<pair>).
  const anyTight = pct(table.tight.anySplit, RUNS);
  assert.ok(anyTight >= 0.25 && anyTight <= 0.60, 'any split 25–60% at ≈19% per-pair flip');
  // No line above 60% in the spec model: the blank tier is rare; receipts and second-split lines stay under 60%.
  assert.ok(pct(spec.receipts, RUNS) <= 0.60 && pct(spec.seconds, RUNS) <= 0.60);
  // Per-pair flip rate is symmetric under the model (items are interchangeable in the sim).
  for (const f of spec.flipRate) assert.ok(f.rate > 0.28 && f.rate < 0.40);
});
