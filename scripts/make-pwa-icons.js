// Generates PWA icons into www/icons/ from the same TimeFlow mark.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#5b78ff"/><stop offset="1" stop-color="#3a55d9"/>
  </linearGradient></defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <circle cx="512" cy="512" r="300" fill="none" stroke="#ffffff" stroke-width="46" opacity="0.95"/>
  <line x1="512" y1="512" x2="512" y2="330" stroke="#ffffff" stroke-width="42" stroke-linecap="round"/>
  <line x1="512" y1="512" x2="648" y2="560" stroke="#ffffff" stroke-width="42" stroke-linecap="round"/>
  <circle cx="512" cy="512" r="34" fill="#ffffff"/>
  <circle cx="512" cy="512" r="300" fill="none" stroke="#c7d2ff" stroke-width="46"
          stroke-linecap="round" stroke-dasharray="150 1200" transform="rotate(-90 512 512)" opacity="0.9"/>
</svg>`;

const outDir = path.join(__dirname, '..', 'www', 'icons');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  for (const size of [192, 512]) {
    await sharp(Buffer.from(svg)).resize(size, size).png()
      .toFile(path.join(outDir, `icon-${size}.png`));
  }
  // Maskable icon: the mark already sits inside the safe zone, bg fills the square.
  await sharp(Buffer.from(svg)).resize(512, 512).png()
    .toFile(path.join(outDir, 'icon-512-maskable.png'));
  // favicon
  await sharp(Buffer.from(svg)).resize(64, 64).png()
    .toFile(path.join(__dirname, '..', 'www', 'favicon.png'));
  console.log('Generated www/icons/{icon-192,icon-512,icon-512-maskable}.png and www/favicon.png');
})();
