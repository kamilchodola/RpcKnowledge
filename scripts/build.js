// Builds the static bundle that gets published.
//
// The repo holds more than the site: a dev server, tests, and notes. Publishing the repo
// root would put all of it on the public internet, so the deploy target is an explicit
// allow-list copied into dist/. Adding a file to the repo does not publish it; adding it
// to PUBLISHED below does.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');

export const PUBLISHED = [
  'index.html',
  'styles.css',
  'favicon.svg',
  'knowledge.js',
  'src',
  'data'
];

// Served by Cloudflare Pages from the output directory. The content security policy is
// tight because the page loads no third-party code: only Google's font stylesheet and the
// font files it references come from anywhere else.
export const HEADERS = `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: no-referrer
  Permissions-Policy: geolocation=(), microphone=(), camera=(), interest-cohort=()
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'

/index.html
  Cache-Control: public, max-age=0, must-revalidate

/data/*
  Cache-Control: public, max-age=600

/src/*
  Cache-Control: public, max-age=600
`;

export async function build() {
  await fs.rm(out, { recursive: true, force: true });
  await fs.mkdir(out, { recursive: true });

  const copied = [];
  for (const entry of PUBLISHED) {
    const from = path.join(root, entry);
    const stat = await fs.stat(from).catch(() => null);
    if (!stat) throw new Error(`build: ${entry} is in the publish list but not in the repo`);
    await fs.cp(from, path.join(out, entry), { recursive: true });
    copied.push(entry);
  }
  await fs.writeFile(path.join(out, '_headers'), HEADERS, 'utf8');

  const files = [];
  const walk = async dir => {
    for (const item of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) await walk(full);
      else files.push(path.relative(out, full).replace(/\\/g, '/'));
    }
  };
  await walk(out);
  const bytes = (await Promise.all(files.map(async file => (await fs.stat(path.join(out, file))).size)))
    .reduce((total, size) => total + size, 0);

  console.log(`built dist/ from ${copied.length} entries`);
  console.log(`${files.length} files, ${(bytes / 1024).toFixed(0)} KB`);
  for (const file of files.filter(name => !name.startsWith('data/') && !name.startsWith('src/'))) console.log(`  ${file}`);
  console.log(`  data/ (${files.filter(name => name.startsWith('data/')).length} files)`);
  console.log(`  src/  (${files.filter(name => name.startsWith('src/')).length} files)`);
}

// Only build when run directly, so the tests can import the publish list without
// writing anything to disk.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build().catch(error => {
    console.error(error.message);
    process.exit(1);
  });
}
