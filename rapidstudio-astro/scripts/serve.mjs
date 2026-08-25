/*
  A local preview server.

  The site used to open by double-clicking index.html. It cannot any more: it is
  several pages with clean URLs, and cross-document view transitions need a real
  origin. This is the smallest thing that serves the build correctly — clean
  URLs resolved to their index.html, and the right content types.

  node scripts/serve.mjs [port]
*/
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const ROOT = new URL('../dist/', import.meta.url).pathname;
const PORT = Number(process.argv[2] || 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

async function resolve(pathname) {
  // never let a request climb out of dist
  const safe = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const candidates = [join(ROOT, safe)];
  if (!extname(safe)) {
    candidates.push(join(ROOT, safe, 'index.html'), join(ROOT, safe + '.html'));
  }
  for (const c of candidates) {
    if (!c.startsWith(ROOT)) continue;
    try {
      const s = await stat(c);
      if (s.isFile()) return c;
    } catch {}
  }
  return null;
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = await resolve(url.pathname);
  if (!file) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found');
    return;
  }

  const { size } = await stat(file);
  const type = TYPES[extname(file)] || 'application/octet-stream';
  const base = { 'content-type': type, 'cache-control': 'no-cache', 'accept-ranges': 'bytes' };

  // Range support is not optional here. Without it a <video> reports an empty
  // seekable range and currentTime cannot be set at all — which silently kills
  // the scrubbed hero, with no error anywhere to say why.
  const range = req.headers.range;
  const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (m) {
    let start = m[1] === '' ? null : Number(m[1]);
    let end = m[2] === '' ? null : Number(m[2]);
    if (start === null) { start = size - (end || 0); end = size - 1; }   // suffix range
    if (end === null || end >= size) end = size - 1;
    if (!Number.isFinite(start) || start < 0 || start > end) {
      res.writeHead(416, { ...base, 'content-range': `bytes */${size}` });
      res.end();
      return;
    }
    res.writeHead(206, { ...base, 'content-range': `bytes ${start}-${end}/${size}`, 'content-length': end - start + 1 });
    if (req.method === 'HEAD') { res.end(); return; }
    createReadStream(file, { start, end }).pipe(res);
    return;
  }

  res.writeHead(200, { ...base, 'content-length': size });
  if (req.method === 'HEAD') { res.end(); return; }
  createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`RapidStudio preview → http://localhost:${PORT}`);
});
