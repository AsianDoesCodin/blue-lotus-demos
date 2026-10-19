// Local preview server for demo-site (mirrors Vercel's trailingSlash: true). Run: node demo-site/dev-server.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.argv[2] || 5180);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon', '.ttf': 'font/ttf' };

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let path;
  try { path = decodeURIComponent(url.pathname); } catch { res.writeHead(400).end(); return; }
  const file = normalize(join(root, path));
  if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  try {
    let target = file;
    const info = await stat(target);
    if (info.isDirectory()) {
      if (!path.endsWith('/')) { res.writeHead(308, { Location: `${path}/${url.search}` }).end(); return; }
      target = join(target, 'index.html');
    }
    const body = await readFile(target);
    res.writeHead(200, { 'Content-Type': types[extname(target).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`demo-site on http://localhost:${port}`));
