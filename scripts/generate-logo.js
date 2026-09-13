// Script to generate ultra-accurate SVG and PNG assets matching photo_2026-09-13_18-52-28.jpg
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Mathematical geometric analysis of photo_2026-09-13_18-52-28.jpg:
 * 
 * Slant angle: ~63.4 degrees from horizontal (dx/dy = 1/2 or approx 0.5)
 * Let's use coordinate system:
 * The MP emblem width: 440, height: 220
 * 
 * Elements:
 * 1. Left bar of M (Royal Blue #1555d8):
 *    Slanted parallelogram:
 *    Bottom left: (40, 200)
 *    Bottom right: (95, 200)
 *    Top right: (145, 100)
 *    Top left: (90, 100)
 * 
 * 2. Left internal shadow facet (Deep Dark Navy #0a256d):
 *    Forms the lower valley between left bar and middle bar:
 *    Points: (95, 200), (135, 200), (145, 100)
 * 
 * 3. Middle bar of M (Bright Royal Blue #1d69f2):
 *    Rises higher up:
 *    Bottom left: (135, 200)
 *    Bottom right: (185, 200)  -- wait, or folds down?
 *    Top right: (220, 30)
 *    Top left: (170, 30)
 * 
 * 4. Middle to right shadow facet (Deep Navy #081e59):
 *    Downward transition:
 *    Points: (220, 30), (185, 200), (225, 200)
 * 
 * 5. P Main upright stem (Electric Cyan-Blue #0084ff):
 *    Starts at bottom (225, 200), (275, 200)
 *    Rises up to (375, 0), (325, 0)
 * 
 * 6. P Head loop (Electric Cyan-Blue #0084ff / #1fa0ff):
 *    Top horizontal bar extending right to (440, 0), (415, 55)
 *    Outer right slant down to (370, 130)
 *    Bottom return horizontal to (290, 130)
 *    Inner cutout counter forming the clean P loop.
 */

// Let's create an optimized standalone MP icon SVG
const mpIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 250" width="500" height="250">
  <defs>
    <!-- Facet 1: M Left Bar (Rich Royal Blue) -->
    <linearGradient id="mpGradBar1" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f4ec7" />
      <stop offset="100%" stop-color="#185ee0" />
    </linearGradient>

    <!-- Facet 2: Left Shadow Valley (Deep Navy) -->
    <linearGradient id="mpGradShadow1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b2469" />
      <stop offset="100%" stop-color="#061642" />
    </linearGradient>

    <!-- Facet 3: M Center Peak (Vibrant Blue) -->
    <linearGradient id="mpGradPeak" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#165edf" />
      <stop offset="100%" stop-color="#2475f5" />
    </linearGradient>

    <!-- Facet 4: Center-to-Right Shadow Fold (Deep Navy) -->
    <linearGradient id="mpGradShadow2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c256a" />
      <stop offset="100%" stop-color="#061745" />
    </linearGradient>

    <!-- Facet 5: P Upright Stem (Bright Vivid Blue) -->
    <linearGradient id="mpGradPStem" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0a6be8" />
      <stop offset="100%" stop-color="#1b8bf5" />
    </linearGradient>

    <!-- Facet 6: P Head & Loop (Electric Sky/Cyan Blue) -->
    <linearGradient id="mpGradPLoop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1b90f8" />
      <stop offset="100%" stop-color="#0080ff" />
    </linearGradient>
  </defs>

  <g transform="translate(10, 15)">
    <!-- 1. M Left-most slanted bar -->
    <polygon points="50,110 106,110 56,215 0,215" fill="url(#mpGradBar1)" />

    <!-- 2. Left internal shadow facet -->
    <polygon points="106,110 144,110 94,215 56,215" fill="url(#mpGradShadow1)" />

    <!-- 3. M Middle upward stroke to peak -->
    <polygon points="144,110 200,10 156,10 94,215" fill="url(#mpGradPeak)" />

    <!-- 4. M to P downward shadow fold -->
    <polygon points="200,10 236,10 176,215 142,215" fill="url(#mpGradShadow2)" />

    <!-- 5. P Main upright ribbon stem -->
    <polygon points="236,10 292,10 196,215 176,215" fill="url(#mpGradPStem)" />

    <!-- 6. P Head loop (Combined solid polygon with counter hole) -->
    <path d="M 276,10 L 440,10 L 388,124 L 272,124 L 298,70 L 356,70 L 370,38 L 290,38 Z" fill="url(#mpGradPLoop)" />
  </g>
</svg>`;

// Let's create Full Logo SVG: 600x600 pure white background with MP mark and "Mobile Perfect" text
const fullLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="fullGradBar1" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f4ec7" />
      <stop offset="100%" stop-color="#185ee0" />
    </linearGradient>
    <linearGradient id="fullGradShadow1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b2469" />
      <stop offset="100%" stop-color="#061642" />
    </linearGradient>
    <linearGradient id="fullGradPeak" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#165edf" />
      <stop offset="100%" stop-color="#2475f5" />
    </linearGradient>
    <linearGradient id="fullGradShadow2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c256a" />
      <stop offset="100%" stop-color="#061745" />
    </linearGradient>
    <linearGradient id="fullGradPStem" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0a6be8" />
      <stop offset="100%" stop-color="#1b8bf5" />
    </linearGradient>
    <linearGradient id="fullGradPLoop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1b90f8" />
      <stop offset="100%" stop-color="#0080ff" />
    </linearGradient>
  </defs>

  <!-- Solid White Canvas matching photo_2026-09-13_18-52-28.jpg -->
  <rect width="600" height="600" fill="#ffffff" />

  <!-- Centered MP 3D Ribbon Emblem -->
  <g transform="translate(105, 175) scale(0.85)">
    <!-- 1. M Left-most slanted bar -->
    <polygon points="50,110 106,110 56,215 0,215" fill="url(#fullGradBar1)" />

    <!-- 2. Left internal shadow facet -->
    <polygon points="106,110 144,110 94,215 56,215" fill="url(#fullGradShadow1)" />

    <!-- 3. M Middle upward stroke to peak -->
    <polygon points="144,110 200,10 156,10 94,215" fill="url(#fullGradPeak)" />

    <!-- 4. M to P downward shadow fold -->
    <polygon points="200,10 236,10 176,215 142,215" fill="url(#fullGradShadow2)" />

    <!-- 5. P Main upright ribbon stem -->
    <polygon points="236,10 292,10 196,215 176,215" fill="url(#fullGradPStem)" />

    <!-- 6. P Head loop -->
    <path d="M 276,10 L 440,10 L 388,124 L 272,124 L 298,70 L 356,70 L 370,38 L 290,38 Z" fill="url(#fullGradPLoop)" />
  </g>

  <!-- Mobile Perfect Typography: bold, clean modern sans-serif in solid black -->
  <text 
    x="300" 
    y="435" 
    text-anchor="middle" 
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" 
    font-size="52" 
    font-weight="700" 
    letter-spacing="-0.5px"
    fill="#000000"
  >Mobile Perfect</text>
</svg>`;

// Let's create Square App Icon (for Favicon / PWA / Android Home Shortcut)
const squareIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="sqGradBar1" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f4ec7" />
      <stop offset="100%" stop-color="#185ee0" />
    </linearGradient>
    <linearGradient id="sqGradShadow1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b2469" />
      <stop offset="100%" stop-color="#061642" />
    </linearGradient>
    <linearGradient id="sqGradPeak" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#165edf" />
      <stop offset="100%" stop-color="#2475f5" />
    </linearGradient>
    <linearGradient id="sqGradShadow2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c256a" />
      <stop offset="100%" stop-color="#061745" />
    </linearGradient>
    <linearGradient id="sqGradPStem" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0a6be8" />
      <stop offset="100%" stop-color="#1b8bf5" />
    </linearGradient>
    <linearGradient id="sqGradPLoop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1b90f8" />
      <stop offset="100%" stop-color="#0080ff" />
    </linearGradient>
  </defs>

  <!-- Pure White Background with rounded corners for native app icon -->
  <rect width="512" height="512" fill="#ffffff" />

  <!-- Prominently Centered MP Emblem -->
  <g transform="translate(68, 146) scale(0.85)">
    <!-- 1. M Left-most slanted bar -->
    <polygon points="50,110 106,110 56,215 0,215" fill="url(#sqGradBar1)" />

    <!-- 2. Left internal shadow facet -->
    <polygon points="106,110 144,110 94,215 56,215" fill="url(#sqGradShadow1)" />

    <!-- 3. M Middle upward stroke to peak -->
    <polygon points="144,110 200,10 156,10 94,215" fill="url(#sqGradPeak)" />

    <!-- 4. M to P downward shadow fold -->
    <polygon points="200,10 236,10 176,215 142,215" fill="url(#sqGradShadow2)" />

    <!-- 5. P Main upright ribbon stem -->
    <polygon points="236,10 292,10 196,215 176,215" fill="url(#sqGradPStem)" />

    <!-- 6. P Head loop -->
    <path d="M 276,10 L 440,10 L 388,124 L 272,124 L 298,70 L 356,70 L 370,38 L 290,38 Z" fill="url(#sqGradPLoop)" />
  </g>
</svg>`;

async function build() {
  const publicDir = path.resolve('public');
  
  // Write SVG files
  fs.writeFileSync(path.join(publicDir, 'logo-icon.svg'), mpIconSvg, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), fullLogoSvg, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), squareIconSvg, 'utf-8');
  console.log('SVGs written successfully');

  // Generate crystal clear PNG assets using sharp
  await sharp(Buffer.from(fullLogoSvg))
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'logo.png'));
  console.log('logo.png created');

  await sharp(Buffer.from(squareIconSvg))
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('pwa-512x512.png created');

  await sharp(Buffer.from(squareIconSvg))
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('pwa-maskable-512x512.png created');

  await sharp(Buffer.from(squareIconSvg))
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('pwa-192x192.png created');

  await sharp(Buffer.from(squareIconSvg))
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('apple-touch-icon.png created');

  console.log('All brand logo assets successfully rebuilt!');
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
