import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generate() {
  const svgPath = path.resolve('public/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // 192x192 PWA Icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');
  console.log('Generated public/pwa-192x192.png');

  // 512x512 PWA Icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');
  console.log('Generated public/pwa-512x512.png');

  // 512x512 Maskable Icon with 10% safe margin on white background
  await sharp(svgBuffer)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: '#ffffff'
    })
    .png()
    .toFile('public/pwa-maskable-512x512.png');
  console.log('Generated public/pwa-maskable-512x512.png');

  // Apple Touch Icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');
  console.log('Generated public/apple-touch-icon.png');

  // Logo PNG 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/logo.png');
  console.log('Generated public/logo.png');
}

generate().catch(console.error);
