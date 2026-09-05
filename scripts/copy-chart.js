// Copies the bundled Chart.js UMD build from node_modules into www/ so the
// Analytics charts work fully offline inside the native app (no CDN needed).
const fs = require('fs');
const path = require('path');

const candidates = [
  'node_modules/chart.js/dist/chart.min.js',
  'node_modules/chart.js/dist/Chart.min.js',
  'node_modules/chart.js/dist/chart.umd.js'
];

const dest = path.join(__dirname, '..', 'www', 'chart.min.js');
const src = candidates.map(p => path.join(__dirname, '..', p)).find(fs.existsSync);

if (!src) {
  console.warn('[copy-chart] Chart.js build not found in node_modules — run `npm install` first.');
  process.exit(0);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
console.log('[copy-chart] Copied', path.relative(process.cwd(), src), '->', path.relative(process.cwd(), dest));
