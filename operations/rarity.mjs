// Computes class rarity (share of each primary|secondary pair) from N random simulations
// and writes it into product/site/engine.js between /*RARITY*/ markers. Re-run after changing STAGE_META or bonuses.
// Usage: node operations/rarity.mjs [N=200000]
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'product', 'site', 'engine.js');
const BW = require(file);
const N = +process.argv[2] || 200000;
const start = Date.UTC(1950, 0, 1), span = Date.UTC(2010, 0, 1) - start;
const counts = {};
for (let i = 0; i < N; i++) {
  const d = new Date(start + Math.floor(Math.random() * span / 86400000) * 86400000).toISOString().slice(0, 10);
  const run = BW.newRun(d, i, 'en', new Date('2026-10-03'));
  for (let s = 0; s < 5; s++) BW.choose(run, s, Math.floor(Math.random() * BW.STAGE_META[s].sits[run.sits[s]].length));
  const r = BW.finish(run);
  const k = r.primary + '|' + r.secondary;
  counts[k] = (counts[k] || 0) + 1;
}
const table = Object.fromEntries(Object.entries(counts).sort().map(([k, v]) => [k, +(v / N).toFixed(5)]));
let src = await readFile(file, 'utf8');
src = src.replace(/const RARITY = \{[^]*?\};/, 'const RARITY = ' + JSON.stringify(table) + ';');
await writeFile(file, src);
const sorted = Object.entries(table).sort((a, b) => a[1] - b[1]);
console.log('pairs:', sorted.length, '| rarest:', sorted.slice(0, 3), '| commonest:', sorted.slice(-3));
const prim = {}; for (const [k, v] of Object.entries(table)) { const p = k.split('|')[0]; prim[p] = +((prim[p] || 0) + v).toFixed(3); }
console.log('primary shares:', prim);
