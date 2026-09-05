// Generates the app icon and splash source images into resources/ from inline
// SVG. Run: node scripts/make-assets.js  (requires sharp; used at build time only)
const fs = require('fs');
const path = require('path');
let sharp;
try { sharp = require('sharp'); } catch (e) {
  console.error('sharp not installed. Run: npm install --no-save sharp'); process.exit(1);
}

const resDir = path.join(__dirname, '..', 'resources');
fs.mkdirSync(resDir, { recursive: true });

// --- App icon: full-bleed 1024x1024, no transparency (iOS masks the corners) ---
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5b78ff"/>
      <stop offset="1" stop-color="#3a55d9"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <circle cx="512" cy="512" r="300" fill="none" stroke="#ffffff" stroke-width="46" opacity="0.95"/>
  <!-- clock hands -->
  <line x1="512" y1="512" x2="512" y2="330" stroke="#ffffff" stroke-width="42" stroke-linecap="round"/>
  <line x1="512" y1="512" x2="648" y2="560" stroke="#ffffff" stroke-width="42" stroke-linecap="round"/>
  <circle cx="512" cy="512" r="34" fill="#ffffff"/>
  <!-- flow accent -->
  <circle cx="512" cy="512" r="300" fill="none" stroke="#c7d2ff" stroke-width="46"
          stroke-linecap="round" stroke-dasharray="150 1200" transform="rotate(-90 512 512)" opacity="0.9"/>
</svg>`;

// --- Splash: 2732x2732, centered mark on the app background ---
const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">
  <rect width="2732" height="2732" fill="#f5f6fa"/>
  <g transform="translate(1366 1300)">
    <circle cx="0" cy="0" r="230" fill="none" stroke="#4f6df5" stroke-width="34"/>
    <line x1="0" y1="0" x2="0" y2="-140" stroke="#4f6df5" stroke-width="32" stroke-linecap="round"/>
    <line x1="0" y1="0" x2="104" y2="38" stroke="#4f6df5" stroke-width="32" stroke-linecap="round"/>
    <circle cx="0" cy="0" r="26" fill="#4f6df5"/>
  </g>
  <text x="1366" y="1720" text-anchor="middle" font-family="-apple-system, Helvetica, Arial, sans-serif"
        font-size="150" font-weight="700" fill="#1b2030" letter-spacing="-3">TimeFlow</text>
</svg>`;

(async () => {
  await sharp(Buffer.from(iconSvg)).png().toFile(path.join(resDir, 'icon.png'));
  await sharp(Buffer.from(iconSvg)).png().toFile(path.join(resDir, 'icon-only.png'));
  await sharp(Buffer.from(splashSvg)).png().toFile(path.join(resDir, 'splash.png'));
  await sharp(Buffer.from(splashSvg)).png().toFile(path.join(resDir, 'splash-dark.png'));
  // A 180x180 favicon-style icon for the web/PWA fallback.
  await sharp(Buffer.from(iconSvg)).resize(180, 180).png().toFile(path.join(__dirname, '..', 'www', 'apple-touch-icon.png'));
  console.log('Generated resources/icon.png, splash.png (+dark), www/apple-touch-icon.png');
})();
