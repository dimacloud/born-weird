// Computes result rarity (share of each top-1|top-2 value combination) from N random plays
// and writes it into product/site/engine.js (const RARITY). Re-run after changing scoring or content structure.
// Usage: node operations/rarity.mjs [N=200000]
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'product', 'site', 'engine.js');
const BW = require(file);
const N = +process.argv[2] || 200000;
const counts = {};
for (let i = 0; i < N; i++) {
  const run = BW.newRun('1990-01-01', i, 'en', new Date('2026-10-03'));
  for (let k = 0; k < BW.CHOICE_SCREENS; k++) {
    const b = Math.floor(Math.random() * 4); let w = Math.floor(Math.random() * 3); if (w >= b) w++;
    BW.answer(run, k, b, w);
  }
  for (let k = BW.CHOICE_SCREENS; k < BW.TOTAL; k++) BW.answerShadow(run, k, Math.floor(Math.random() * 3));
  const r = BW.finish(run);
  counts[r.rarityKey] = (counts[r.rarityKey] || 0) + 1;
}
const table = Object.fromEntries(Object.entries(counts).sort().map(([k, v]) => [k, +(v / N).toFixed(5)]));
let src = await readFile(file, 'utf8');
src = src.replace(/const RARITY = \{[^]*?\};/, 'const RARITY = ' + JSON.stringify(table) + ';');
await writeFile(file, src);
const sorted = Object.entries(table).sort((a, b) => a[1] - b[1]);
console.log('combos:', sorted.length, '| rarest:', sorted.slice(0, 3), '| commonest:', sorted.slice(-3));
