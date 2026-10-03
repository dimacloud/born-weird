// ANALYST-SCRIPT-001: pulls anonymous event counters and computes Phase 0 metrics.
// Usage: node operations/metrics.mjs [--write]   (--write updates company/metrics.json)
// Read-only against the counter service (uses /get, never /hit).
import { writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const NS = 'bw-x7q2-p0';
const EVENTS = [
  'landing_view', 'referred_visit', 'locale_ru',
  'simulation_started', 'referred_simulation_started', 'birth_seed_created',
  ...[1, 2, 3, 4, 5].flatMap(i => ['choice_presented_' + i, 'choice_selected_' + i]),
  'simulation_completed', 'referred_simulation_completed',
  'artifact_generation_started', 'artifact_generated', 'artifact_generation_failed', 'artifact_saved',
  'share_clicked', 'share_completed', 'share_cancelled', 'link_copied',
  'reality_seed_viewed', 'reality_seed_copied', 'reality_seed_downloaded',
  'feedback_submitted', ...[1, 2, 3, 4, 5].map(n => 'fb_worth_' + n), 'fb_feel_meh', 'fb_feel_weird', 'fb_feel_wtf', 'fb_send_yes', 'fb_send_no',
  'restart_clicked', 'lang_switch_en', 'lang_switch_ru',
];
// Russian-language segment (EXP-002): every event is also counted as ru_<event> when the UI is in Russian.
const RU_EVENTS = ['landing_view', 'referred_visit', 'simulation_started', 'simulation_completed', 'referred_simulation_completed',
  'artifact_generated', 'share_completed', 'link_copied', 'reality_seed_copied', 'reality_seed_downloaded',
  ...[1, 2, 3, 4, 5].map(i => 'choice_selected_' + i), ...[1, 2, 3, 4, 5].map(n => 'fb_worth_' + n), 'fb_send_yes', 'fb_send_no'];

async function get(key) {
  try {
    const r = await fetch(`https://abacus.jasoncameron.dev/get/${NS}/${key}`);
    if (r.status === 404) return 0;
    const j = await r.json();
    return Math.max(0, j.value ?? 0);
  } catch { return null; }
}

const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 + '%' : 'n/a');

const counts = {}, founder = {};
for (const e of EVENTS) {
  counts[e] = await get(e);
  founder[e] = await get('founder_' + e);
  await new Promise(r => setTimeout(r, 400)); // 2 GETs per 400 ms = 5/s, under the 30 req/10 s limit
}

const ru = {};
for (const e of RU_EVENTS) {
  ru[e] = await get('ru_' + e);
  await new Promise(r => setTimeout(r, 200));
}

const c = counts;
const worthN = [1, 2, 3, 4, 5].reduce((s, n) => s + (c['fb_worth_' + n] || 0), 0);
const worthAvg = worthN ? [1, 2, 3, 4, 5].reduce((s, n) => s + n * (c['fb_worth_' + n] || 0), 0) / worthN : null;
const metrics = {
  generated_at: new Date().toISOString(),
  scope: 'non-founder traffic only (founder-flagged and qa traffic excluded)',
  funnel: {
    visits: c.landing_view,
    started: c.simulation_started,
    completed: c.simulation_completed,
    artifacts: c.artifact_generated,
    shares_completed: c.share_completed,
    links_copied: c.link_copied,
    referred_visits: c.referred_visit,
    referred_completed: c.referred_simulation_completed,
  },
  rates: {
    activation: pct(c.simulation_started, c.landing_view),
    completion: pct(c.simulation_completed, c.simulation_started),
    artifact_rate: pct(c.artifact_generated, c.simulation_completed),
    share_rate: pct((c.share_completed || 0) + (c.link_copied || 0), c.simulation_completed),
    referral_conversion: pct(c.referred_simulation_completed, c.referred_visit),
    RRR: pct(c.referred_simulation_completed, c.simulation_completed),
    stage_dropoff: [1, 2, 3, 4, 5].map(i => c['choice_selected_' + i]),
  },
  satisfaction: { worth_avg: worthAvg && Math.round(worthAvg * 100) / 100, worth_n: worthN, feel: { meh: c.fb_feel_meh, weird: c.fb_feel_weird, wtf: c.fb_feel_wtf } },
  alive_signal: (c.referred_simulation_completed || 0) >= 1
    ? 'LIKELY: a referred visitor completed a simulation (needs human confirmation it was a non-Founder)'
    : ((c.share_completed || 0) + (c.link_copied || 0)) >= 1 ? 'PARTIAL: share actions recorded, no referred completion yet' : 'NOT YET',
  by_language: {
    ru: {
      visits: ru.landing_view, started: ru.simulation_started, completed: ru.simulation_completed,
      completion: pct(ru.simulation_completed, ru.simulation_started),
      share_rate: pct((ru.share_completed || 0) + (ru.link_copied || 0), ru.simulation_completed),
      referred_completed: ru.referred_simulation_completed,
    },
    en: {
      visits: (c.landing_view || 0) - (ru.landing_view || 0), started: (c.simulation_started || 0) - (ru.simulation_started || 0),
      completed: (c.simulation_completed || 0) - (ru.simulation_completed || 0),
    },
    switches: { to_en: c.lang_switch_en, to_ru: c.lang_switch_ru },
  },
  raw: counts,
  raw_ru: ru,
  founder_raw: Object.fromEntries(Object.entries(founder).filter(([, v]) => v)),
};

console.log(JSON.stringify(metrics, null, 2));
if (process.argv.includes('--write')) {
  const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'company', 'metrics.json');
  await writeFile(out, JSON.stringify(metrics, null, 2) + '\n');
  console.error('wrote ' + out);
}
