/*
  Post-build: turn Astro's server-rooted output into a folder that also opens
  by double-clicking index.html.

  Two things stop that by default:
    1. assets are referenced from the site root ("/_astro/…"), which on file://
       resolves to the filesystem root
    2. the bundle is an ES module, and browsers refuse module scripts over file://

  So: bundle the entry to a classic IIFE, inline it, and make every remaining
  reference relative. The served output behaves exactly the same.
*/
import { readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { build } from 'esbuild';

const DIST = new URL('../dist/', import.meta.url).pathname;

const html0 = readFileSync(join(DIST, 'index.html'), 'utf8');

// 1. find the module bundle Astro emitted
const m = html0.match(/<script[^>]+src="\/(_astro\/[^"]+\.js)"[^>]*><\/script>/);
if (!m) {
  console.log('portable: no module script found, nothing to inline');
}

let html = html0;

if (m) {
  const entry = join(DIST, m[1]);
  // 2. re-bundle it as a classic script with no import/export syntax
  const out = await build({
    entryPoints: [entry],
    bundle: true,
    format: 'iife',
    minify: true,
    write: false,
    target: ['es2019'],
    logLevel: 'silent',
  });
  const code = out.outputFiles[0].text;
  // Astro's original was type="module", which browsers defer until the document
  // is parsed. An inline classic script has no defer, so it would run before the
  // canvas exists and the whole rig would silently no-op. Hold it until DOM ready.
  const deferred =
    `<script>(function(){function go(){${code}}` +
    `if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',go)}else{go()}})();</script>`;
  html = html.replace(m[0], deferred);
  // the module file is no longer referenced
  rmSync(entry, { force: true });
}

// 3. make every root-absolute reference relative
html = html.replace(/(src|href)="\/(?!\/)/g, '$1="./');

writeFileSync(join(DIST, 'index.html'), html, 'utf8');

// 4. the same for url(...) inside emitted css
for (const f of readdirSync(join(DIST, '_astro'))) {
  if (!f.endsWith('.css')) continue;
  const p = join(DIST, '_astro', f);
  const css = readFileSync(p, 'utf8').replace(/url\((["']?)\/(?!\/)/g, 'url($1../');
  writeFileSync(p, css, 'utf8');
}

// 5. and inside the self-hosted font sheet
const fp = join(DIST, 'fonts', 'fonts.css');
try {
  const css = readFileSync(fp, 'utf8').replace(/url\((["']?)\/fonts\//g, 'url($1');
  writeFileSync(fp, css, 'utf8');
} catch {}

console.log('portable: index.html now opens from disk as well as from a server');
