import http from 'node:http';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number.parseInt(process.env.PORT ?? '4173', 10) || 4173;
// Binds to every interface so the map is reachable from other devices on the same
// network. Set HOST=127.0.0.1 to keep it on this machine only.
const host = process.env.HOST ?? '0.0.0.0';

function localAddresses() {
  return Object.values(os.networkInterfaces()).flat()
    .filter(entry => entry && entry.family === 'IPv4' && !entry.internal)
    .map(entry => entry.address);
}

const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.webp', 'image/webp']
]);

function safeFilePath(urlPath) {
  let pathname;
  try {
    pathname = decodeURIComponent(urlPath.split('?')[0]);
  } catch {
    return null;
  }
  if (pathname.includes('\0')) return null;
  if (pathname.split('/').some(segment => segment === '..')) return null;
  const requested = pathname === '/' ? '/index.html' : pathname;
  const absolute = path.resolve(root, `.${requested}`);
  const relative = path.relative(root, absolute);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return absolute;
}

const server = http.createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed');
    return;
  }

  const filename = safeFilePath(request.url ?? '/');
  if (!filename) {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Bad request');
    return;
  }

  try {
    const stat = await fs.stat(filename);
    if (!stat.isFile()) throw new Error('Not a file');
    const contentType = MIME.get(path.extname(filename).toLowerCase()) ?? 'application/octet-stream';
    response.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    if (request.method === 'HEAD') response.end();
    else response.end(await fs.readFile(filename));
  } catch (error) {
    const status = error?.code === 'ENOENT' ? 404 : 500;
    response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(status === 404 ? 'Not found' : 'Internal server error');
  }
});

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  server.listen(port, host, () => {
    console.log(`Ethereum RPC map listening on ${host}:${port}`);
    console.log(`  local    http://127.0.0.1:${port}`);
    if (host === '0.0.0.0') localAddresses().forEach(address => console.log(`  network  http://${address}:${port}`));
  });
}

export { server, safeFilePath, localAddresses };
