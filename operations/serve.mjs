// Local static server for previews/QA. Usage: node operations/serve.mjs [port]
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'product', 'site');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.md': 'text/markdown', '.svg': 'image/svg+xml' };
const port = +process.argv[2] || 8417;
http.createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/born-weird/, '');
  if (p.endsWith('/')) p += 'index.html';
  if (p.includes('..')) { res.writeHead(400); return res.end(); }
  try { const b = await readFile(join(root, p)); res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); res.end(b); }
  catch { res.writeHead(404); res.end('not found'); }
}).listen(port, () => console.log('serving ' + root + ' on ' + port));
