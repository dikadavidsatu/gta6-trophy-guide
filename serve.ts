// Minimal local server for previewing app/ during development.
//   node serve.ts [--port 8123]   →   http://localhost:8123
// Standard library only; refuses any path outside app/.
//
// Politeness extras for a dev server: HEAD requests are answered with
// headers only, every file carries a weak ETag so repeat previews can be
// answered with a 304 instead of the whole body, and a missing path gets
// a small styled 404 page (in the guide's own colours) rather than bare
// text, so a broken link is obvious while clicking around.
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('./app', import.meta.url)));
const pi = process.argv.indexOf('--port');
const port = pi >= 0 ? Number(process.argv[pi + 1]) || 8123 : 8123;
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
};

function etagFor(body: Buffer): string {
  return 'W/"' + body.length + '-' + createHash('sha256').update(body).digest('hex').slice(0, 16) + '"';
}

function notFoundPage(path: string): string {
  const safe = path.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
    '<title>404 — Leonida Legend</title><style>' +
    'body{margin:0;background:#0b0714;color:#f5effd;font-family:system-ui,sans-serif;padding:3rem 1.5rem}' +
    'h1{color:#ff4fa3;font-family:Georgia,serif}p{color:#baa9da;max-width:55ch}a{color:#25e6e0}' +
    'code{color:#ffd34d}</style></head><body>' +
    '<h1>404 — not on this map</h1>' +
    '<p>No file in the guide matches <code>' + safe + '</code>. ' +
    'Head back to the <a href="/">trophy tracker</a> and pick up the trail there.</p>' +
    '</body></html>';
}

createServer((req, res) => {
  let path: string;
  try { path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname); }
  catch { res.writeHead(400).end('bad request'); return; }
  if (path.endsWith('/')) path += 'index.html';
  const file = resolve(join(appRoot, normalize(path)));
  if (file !== appRoot && !file.startsWith(appRoot + sep)) { res.writeHead(403).end('forbidden'); return; }
  const headOnly = req.method === 'HEAD';
  try {
    if (!statSync(file).isFile()) throw new Error('not a file');
    const body = readFileSync(file);
    const etag = etagFor(body);
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, { etag, 'cache-control': 'no-cache' });
      res.end();
      return;
    }
    res.writeHead(200, {
      'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
      'content-length': body.length,
      etag,
      'cache-control': 'no-cache',
    });
    res.end(headOnly ? undefined : body);
  } catch {
    const page = notFoundPage(path);
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8', 'content-length': Buffer.byteLength(page) });
    res.end(headOnly ? undefined : page);
  }
}).listen(port, '127.0.0.1', () => console.log(`serving app/ at http://localhost:${port}`));
