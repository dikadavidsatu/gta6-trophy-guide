// Minimal local server for previewing app/ during development.
//   node serve.ts [--port 8123]   →   http://localhost:8123
// Standard library only; refuses paths outside app/.
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
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

createServer((req, res) => {
  let path: string;
  try { path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname); }
  catch { res.writeHead(400).end('bad request'); return; }
  if (path.endsWith('/')) path += 'index.html';
  const file = resolve(join(appRoot, normalize(path)));
  if (file !== appRoot && !file.startsWith(appRoot + sep)) { res.writeHead(403).end('forbidden'); return; }
  try {
    if (!statSync(file).isFile()) throw new Error('not a file');
    const body = readFileSync(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(404).end('not found'); }
}).listen(port, '127.0.0.1', () => console.log(`serving app/ at http://localhost:${port}`));
