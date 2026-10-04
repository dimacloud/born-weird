// LAB per-result share pages (DECISION #018, growth share rule #2).
// Telegram/Instagram read OG tags without running JS and ignore the #fragment, so every result
// needs its own static path with its own preview. For each prototype folder product/site/lab/<p>/
// with an og.json, this writes:
//   lab/<p>/og/<code>-<v>.png   1200×630 preview (versioned name: chat apps cache images by URL)
//   lab/<p>/r/<code>/index.html  OG tags + instant redirect to the game, fragment preserved
// og.json: { "v": 1, "title": "...", "cta": "...", "results": [{ "code": "cat", "big": "...", "line": "..." }] }
// plus a default preview og/_default-<v>.png for the prototype's own index.html.
// Usage: node operations/lab-og.mjs [p ...]   (needs Google Chrome; macOS path below)
import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LAB = join(ROOT, 'product', 'site', 'lab');
const SITE = join(ROOT, 'product', 'site');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL_BASE = 'https://dimacloud.github.io/born-weird/lab/';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function previewHtml(big, line, cta) {
  const font = f => pathToFileURL(join(SITE, f)).href;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:P;font-weight:400;src:url('${font('PlexMono-400-cyrillic.woff2')}')}
@font-face{font-family:P;font-weight:600;src:url('${font('PlexMono-600-cyrillic.woff2')}')}
@font-face{font-family:L;font-weight:600;src:url('${font('PlexMono-600-latin.woff2')}')}
html,body{margin:0;width:1200px;height:630px;background:#000;overflow:hidden;font-family:L,P,monospace;color:#c8ffc8}
.w{position:absolute;inset:40px 60px;border:4px solid #55ffff;padding:44px 52px;display:flex;flex-direction:column}
.b{color:#ff55ff;font-weight:600;letter-spacing:8px;font-size:30px}
.big{color:#ffff55;font-weight:600;font-size:${big.length > 22 ? 64 : 84}px;line-height:1.05;margin:26px 0 0;text-shadow:5px 5px 0 #ff55ff}
.l{font-size:36px;margin-top:22px;color:#c8ffc8}
.c{margin-top:auto;font-size:32px;color:#55ffff;font-weight:600}
body::after{content:'';position:fixed;inset:0;background:repeating-linear-gradient(#0000 0 2px,#0003 2px 3px)}
</style></head><body><div class="w"><div class="b">BORN WEIRD</div><div class="big">${esc(big)}</div><div class="l">${esc(line)}</div><div class="c">${esc(cta)}</div></div></body></html>`;
}

function shot(html, out) {
  const tmp = join(tmpdir(), 'bw-og-' + process.pid + '.html');
  return writeFile(tmp, html).then(() => {
    execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
      '--window-size=1200,630', '--virtual-time-budget=1500', '--screenshot=' + out, pathToFileURL(tmp).href], { stdio: 'ignore' });
  });
}

function redirectPage(p, cfg, r, img) {
  const title = r.big + ' · BORN WEIRD';
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(r.line + ' ' + cfg.cta)}">
<meta property="og:type" content="website">
<meta property="og:image" content="${URL_BASE}${p}/og/${img}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="robots" content="noindex">
<style>html,body{background:#000;color:#c8ffc8;font-family:monospace}</style>
<script>location.replace('../../' + location.search + (location.hash || '#ref=${encodeURIComponent(r.code)}'));</script>
</head><body><a href="../../">BORN WEIRD</a></body></html>`;
}

const only = process.argv.slice(2);
const dirs = (await readdir(LAB, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name).filter(p => !only.length || only.includes(p));
for (const p of dirs) {
  const cfgPath = join(LAB, p, 'og.json');
  if (!existsSync(cfgPath)) continue;
  const cfg = JSON.parse(await readFile(cfgPath, 'utf8'));
  const v = cfg.v || 1;
  await rm(join(LAB, p, 'og'), { recursive: true, force: true });
  await rm(join(LAB, p, 'r'), { recursive: true, force: true });
  await mkdir(join(LAB, p, 'og'), { recursive: true });
  await shot(previewHtml(cfg.title, cfg.sub || '', cfg.cta), join(LAB, p, 'og', `_default-${v}.png`));
  for (const r of cfg.results) {
    if (!/^[a-z0-9-]+$/.test(r.code)) throw new Error(`${p}: code must be a latin slug: ${r.code}`);
    const img = `${r.code}-${v}.png`;
    await shot(previewHtml(r.big, r.line, cfg.cta), join(LAB, p, 'og', img));
    await mkdir(join(LAB, p, 'r', r.code), { recursive: true });
    await writeFile(join(LAB, p, 'r', r.code, 'index.html'), redirectPage(p, cfg, r, img));
  }
  console.log(`${p}: ${cfg.results.length} result pages + default preview`);
}
