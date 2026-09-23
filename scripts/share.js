// Publishes the map to the internet through a Cloudflare quick tunnel.
//
//   npm run share
//
// Builds dist/, serves only that folder on 127.0.0.1, and opens an outbound tunnel to it.
// Nothing listens on the network: the tunnel dials out to Cloudflare, so no router port
// forward and no firewall rule are involved, and your public IP is never shown. The page
// gets a random https://<words>.trycloudflare.com address that works until you stop this.
//
// Quick tunnels need no Cloudflare account and cost nothing. They are for sharing, not
// hosting: the address changes on every run and there is no uptime guarantee.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number.parseInt(process.env.SHARE_PORT ?? '4174', 10) || 4174;
const local = `http://127.0.0.1:${port}`;

/** cloudflared is not always on PATH straight after install, so look in the usual places. */
function findCloudflared() {
  if (process.env.CLOUDFLARED) return process.env.CLOUDFLARED;
  const candidates = process.platform === 'win32'
    ? [
        'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe',
        'C:\\Program Files\\cloudflared\\cloudflared.exe',
        path.join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Links', 'cloudflared.exe')
      ]
    : ['/usr/local/bin/cloudflared', '/opt/homebrew/bin/cloudflared', '/usr/bin/cloudflared'];
  return candidates.find(candidate => candidate && fs.existsSync(candidate)) ?? 'cloudflared';
}

async function waitFor(url, attempts = 40) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch { /* not listening yet */ }
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error(`the site server did not start on ${url}`);
}

const children = [];
function shutdown(code = 0) {
  for (const child of children) if (!child.killed) child.kill();
  process.exit(code);
}
process.on('SIGINT', () => { console.log('\nstopping the tunnel'); shutdown(0); });
process.on('SIGTERM', () => shutdown(0));

await build();

// Bound to loopback on purpose: the tunnel is the only way in.
const site = spawn(process.execPath, [path.join(root, 'server.js')], {
  env: { ...process.env, SITE_ROOT: 'dist', HOST: '127.0.0.1', PORT: String(port) },
  stdio: ['ignore', 'ignore', 'inherit']
});
children.push(site);
site.on('exit', code => { if (code) { console.error(`site server exited with code ${code}`); shutdown(1); } });
await waitFor(local);
console.log(`serving dist/ on ${local} (loopback only)`);

const binary = findCloudflared();
const tunnel = spawn(binary, ['tunnel', '--no-autoupdate', '--url', local], { stdio: ['ignore', 'pipe', 'pipe'] });
children.push(tunnel);

tunnel.on('error', error => {
  if (error.code !== 'ENOENT') { console.error(error.message); shutdown(1); }
  console.error([
    '',
    'cloudflared is not installed.',
    '',
    process.platform === 'win32'
      ? '  winget install --id Cloudflare.cloudflared'
      : '  brew install cloudflared      (or see https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)',
    '',
    'Then open a new terminal so it is on PATH, and run npm run share again.',
    'If it is installed somewhere unusual, point CLOUDFLARED at the executable.'
  ].join('\n'));
  shutdown(1);
});

// cloudflared prints the address inside a banner on stderr. Pick it out and repeat it
// plainly, since the rest of its output is connection noise.
let announced = false;
const scan = chunk => {
  const text = chunk.toString();
  if (process.env.SHARE_VERBOSE) process.stderr.write(text);
  const match = !announced && text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
  if (!match) return;
  announced = true;
  console.log([
    '',
    '  Public address',
    `  ${match[0]}`,
    '',
    '  Anyone with that link can open the map. It stops working when you press Ctrl+C.',
    ''
  ].join('\n'));
};
tunnel.stdout.on('data', scan);
tunnel.stderr.on('data', scan);
tunnel.on('exit', code => {
  if (!announced) console.error(`cloudflared exited before a tunnel came up (code ${code}). Run with SHARE_VERBOSE=1 to see why.`);
  shutdown(code ?? 1);
});
