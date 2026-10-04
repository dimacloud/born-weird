// ANALYST-SCRIPT-001, lab mode (EXP-004, DECISION #019). Read-only GETs on namespace bw-lab-r1.
// Usage: node operations/lab-metrics.mjs [--write] [--baseline]
//   --write     updates company/lab-metrics.json
//   --baseline  snapshots current raw counts to company/lab-baseline.json (QA/test hits before the
//               Founder sees the lab); every later run subtracts the baseline.
// Prints the PLAYER → RESULT → SHARE → NEW PLAYER chain per prototype; Founder plays (f_ prefix) shown separately.
import { writeFile, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const NS = 'bw-lab-r1';
const PROTOS = ['a', 'b', 'c'];
const CORE = ['view', 'ref_view', 'start', 'ref_start', 'done', 'ref_done', 'rec_yes', 'rec_kinda', 'rec_no', 'share_click', 'share_ok'];
const EXTRA = {
  a: ['guess_ok', 'guess_no', 'jump', 'drop', 'auto_reveal', ...['v1', 'v2'].flatMap(v => [v + '_view', v + '_done', v + '_share_ok', v + '_rec_yes', v + '_rec_kinda', v + '_rec_no']), 'contra_shown', 'contra_none', ...['money', 'phone', 'letter', 'passport', 'keys', 'cat', 'manuscript', 'cup'].map(k => 'kept_' + k)],
  b: [...['book', 'riddle', 'agent', 'cipher'].map(k => 'res_' + k), 'arm_birth', 'arm_none', 'birth_given', 'birth_skip', 'start_birth', 'start_none', 'done_birth', 'done_none'],
  c: [...['monolith', 'crack', 'double', 'chameleon', 'blank'].map(t => 'tier_' + t), ...['free', 'succ', 'truth', 'new'].flatMap(k => ['flip_' + k, 'same_' + k, 'to_' + k])],
};

async function get(key) {
  try {
    const r = await fetch(`https://abacus.jasoncameron.dev/get/${NS}/${key}`);
    if (r.status === 404) return 0;
    const j = await r.json();
    return Math.max(0, j.value ?? 0);
  } catch { return null; }
}
const pct = (a, b) => (b ? Math.round((a / b) * 100) + '%' : 'n/a');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const HERE = join(dirname(fileURLToPath(import.meta.url)), '..', 'company');
const TAKE_BASE = process.argv.includes('--baseline');
let base = {};
if (!TAKE_BASE) { try { base = JSON.parse(await readFile(join(HERE, 'lab-baseline.json'), 'utf8')).raw || {}; } catch {} }
const raw = {};
const net = async key => { const v = await get(key); raw[key] = v; return v === null ? null : Math.max(0, v - (base[key] || 0)); };
const out = { updated_at: new Date().toISOString(), namespace: NS, baseline_subtracted: !TAKE_BASE && Object.keys(base).length > 0, prototypes: {} };
for (const p of PROTOS) {
  const c = {}, f = {};
  for (const e of [...CORE, ...(EXTRA[p] || [])]) {
    c[e] = await net(`${p}_${e}`);
    f[e] = await net(`f_${p}_${e}`);
    await sleep(400); // stay under the provider's 30 req / 10 s limit
  }
  const rec = c.rec_yes + c.rec_kinda + c.rec_no;
  out.prototypes[p] = {
    counts: c, founder: f,
    chain: {
      START: pct(c.start, c.view),
      COMPLETION: pct(c.done, c.start),
      RECOGNITION: pct(c.rec_yes + c.rec_kinda, rec) + ` (n=${rec})`,
      SHARE_INTENT: pct(c.share_click, c.done),
      ACTUAL_SHARE: pct(c.share_ok, c.done),
      REFERRED_START: pct(c.ref_start, c.ref_view) + ` (${c.ref_start} of ${c.ref_view})`,
    },
  };
  console.log(`\n${p.toUpperCase()}  view ${c.view} → start ${c.start} → done ${c.done} → share ${c.share_ok} → ref_view ${c.ref_view} → ref_start ${c.ref_start}   (founder: ${f.view} views, ${f.done} done)`);
  console.log('   ', out.prototypes[p].chain);
}
if (TAKE_BASE) {
  await writeFile(join(HERE, 'lab-baseline.json'), JSON.stringify({ taken_at: out.updated_at, note: 'QA/test hits before Founder exposure; subtracted from every lab-metrics run', raw }, null, 2) + '\n');
  console.log('\nwrote company/lab-baseline.json');
}
if (process.argv.includes('--write')) {
  await writeFile(join(dirname(fileURLToPath(import.meta.url)), '..', 'company', 'lab-metrics.json'), JSON.stringify(out, null, 2) + '\n');
  console.log('\nwrote company/lab-metrics.json');
}
