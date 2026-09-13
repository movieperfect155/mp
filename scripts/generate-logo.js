// Script to generate exact logo matching photo_2026-09-13_19-10-17.jpg
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Geometric analysis of photo_2026-09-13_19-10-17.jpg:
 * 
 * Slant angle: ~57.5 degrees (dx/dy ≈ 0.64)
 * Baseline Y = 250
 * Total height = 250
 * Total width ≈ 430
 * 
 * Ascending heights:
 * 1. Peak 1 (leftmost): Y = 130 (height = 120)
 * 2. Peak 2 (middle):   Y = 65  (height = 185)
 * 3. Peak 3 / P:        Y = 0   (height = 250)
 * 
 * Colors from photo_2026-09-13_19-10-17.jpg:
 * - Front Faces: Solid rich cobalt/royal blue `#0050b4`
 * - Shadow Facets: Solid deep navy blue `#002568`
 * - Background: Pure white `#ffffff`
 */

// Standalone MP Icon SVG (viewBox fitted closely around the mark)
const mpIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 250" width="450" height="250">
  <!-- Solid Brand Colors -->
  <defs>
    <linearGradient id="mpBlueFront" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0055b8" />
      <stop offset="100%" stop-color="#004ca8" />
    </linearGradient>
    <linearGradient id="mpBlueShadow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#002b70" />
      <stop offset="100%" stop-color="#002058" />
    </linearGradient>
  </defs>

  <g id="mp-logo-mark">
    <!-- 1. Leftmost upward bar (Step 1) -->
    <polygon points="0,250 76,250 152,130 76,130" fill="url(#mpBlueFront)" />

    <!-- 2. Left shadow valley fold (Fold 1) -->
    <polygon points="76,130 152,130 196,250 120,250" fill="url(#mpBlueShadow)" />

    <!-- 3. Middle upward stroke to peak (Step 2) -->
    <polygon points="120,250 196,250 238,65 162,65" fill="url(#mpBlueFront)" />

    <!-- 4. Middle-to-P shadow fold (Fold 2) -->
    <polygon points="162,65 238,65 282,250 206,250" fill="url(#mpBlueShadow)" />

    <!-- 5. P Main upright stem (Step 3) -->
    <polygon points="206,250 282,250 324,0 248,0" fill="url(#mpBlueFront)" />

    <!-- 6. P Head loop (Solid outer shape with counter cutout) -->
    <!-- Outer boundary: Top (248,0) -> (440,0) -> Slant down to (344,148) -> Return (260,148) -->
    <!-- Inner cutout: (272,48) -> (360,48) -> (328,98) -> (240,98) -->
    <path d="M 248,0 L 440,0 L 344,148 L 260,148 L 292,98 L 328,98 L 360,48 L 272,48 Z" fill="url(#mpBlueFront)" />
  </g>
</svg>`;

// Full Logo SVG: Square canvas with centered MP mark (matching photo_2026-09-13_19-10-17.jpg)
const squareLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="sqBlueFront" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0055b8" />
      <stop offset="100%" stop-color="#004ca8" />
    </linearGradient>
    <linearGradient id="sqBlueShadow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#002b70" />
      <stop offset="100%" stop-color="#002058" />
    </linearGradient>
  </defs>

  <!-- Pure White Background matching photo_2026-09-13_19-10-17.jpg -->
  <rect width="600" height="600" fill="#ffffff" />

  <!-- Prominently Centered MP Emblem -->
  <g transform="translate(85, 185) scale(0.95)">
    <!-- 1. Leftmost upward bar (Step 1) -->
    <polygon points="0,250 76,250 152,130 76,130" fill="url(#sqBlueFront)" />

    <!-- 2. Left shadow valley fold (Fold 1) -->
    <polygon points="76,130 152,130 196,250 120,250" fill="url(#sqBlueShadow)" />

    <!-- 3. Middle upward stroke to peak (Step 2) -->
    <polygon points="120,250 196,250 238,65 162,65" fill="url(#sqBlueFront)" />

    <!-- 4. Middle-to-P shadow fold (Fold 2) -->
    <polygon points="162,65 238,65 282,250 206,250" fill="url(#sqBlueShadow)" />

    <!-- 5. P Main upright stem (Step 3) -->
    <polygon points="206,250 282,250 324,0 248,0" fill="url(#sqBlueFront)" />

    <!-- 6. P Head loop -->
    <path d="M 248,0 L 440,0 L 344,148 L 260,148 L 292,98 L 328,98 L 360,48 L 272,48 Z" fill="url(#sqBlueFront)" />
  </g>
</svg>`;

// Native App / Favicon SVG (512x512)
const appIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="appBlueFront" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0055b8" />
      <stop offset="100%" stop-color="#004ca8" />
    </linearGradient>
    <linearGradient id="appBlueShadow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#002b70" />
      <stop offset="100%" stop-color="#002058" />
    </linearGradient>
  </defs>

  <rect width="512" height="512" fill="#ffffff" />

  <g transform="translate(68, 155) scale(0.84)">
    <polygon points="0,250 76,250 152,130 76,130" fill="url(#appBlueFront)" />
    <polygon points="76,130 152,130 196,250 120,250" fill="url(#appBlueShadow)" />
    <polygon points="120,250 196,250 238,65 162,65" fill="url(#appBlueFront)" />
    <polygon points="162,65 238,65 282,250 206,250" fill="url(#appBlueShadow)" />
    <polygon points="206,250 282,250 324,0 248,0" fill="url(#appBlueFront)" />
    <path d="M 248,0 L 440,0 L 344,148 L 260,148 L 292,98 L 328,98 L 360,48 L 272,48 Z" fill="url(#appBlueFront)" />
  </g>
</svg>`;

async function build() {
  const publicDir = path.resolve('public');

  // Write SVGs
  fs.writeFileSync(path.join(publicDir, 'logo-icon.svg'), mpIconSvg, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), squareLogoSvg, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), appIconSvg, 'utf-8');
  console.log('SVGs generated successfully');

  // Build crisp PNGs
  await sharp(Buffer.from(squareLogoSvg))
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'logo.png'));
  console.log('logo.png generated');

  await sharp(Buffer.from(appIconSvg))
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('pwa-512x512.png generated');

  await sharp(Buffer.from(appIconSvg))
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('pwa-maskable-512x512.png generated');

  await sharp(Buffer.from(appIconSvg))
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('pwa-192x192.png generated');

  await sharp(Buffer.from(appIconSvg))
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('apple-touch-icon.png generated');

  console.log('All assets matching photo_2026-09-13_19-10-17.jpg generated!');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
