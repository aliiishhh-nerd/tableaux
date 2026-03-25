#!/usr/bin/env node
// scripts/generate-icons.js
// Generates all required PWA icons from a single source image
//
// USAGE:
//   1. npm install --save-dev sharp   (one-time)
//   2. Place your source icon at: public/icons/source.png
//      → Minimum 512x512px, ideally 1024x1024px, square PNG
//   3. node scripts/generate-icons.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE = path.join(__dirname, '../public/icons/source.png');
const OUT_DIR = path.join(__dirname, '../public/icons');

const ICONS = [
  { name: 'icon-72x72.png',           size: 72  },
  { name: 'icon-96x96.png',           size: 96  },
  { name: 'icon-128x128.png',         size: 128 },
  { name: 'icon-144x144.png',         size: 144 },
  { name: 'icon-152x152.png',         size: 152 },
  { name: 'icon-192x192.png',         size: 192 },
  { name: 'icon-384x384.png',         size: 384 },
  { name: 'icon-512x512.png',         size: 512 },
  { name: 'badge-72x72.png',          size: 72  },
  { name: 'shortcut-feed.png',        size: 96  },
  { name: 'shortcut-events.png',      size: 96  },
  { name: 'shortcut-invites.png',     size: 96  },
  // Maskable icons need padding (safe zone = center 80%)
  { name: 'icon-maskable-192x192.png', size: 192, maskable: true },
  { name: 'icon-maskable-512x512.png', size: 512, maskable: true },
];

const SPLASHSCREENS = [
  { name: 'apple-splash-1179-2556.png', width: 1179, height: 2556 },
  { name: 'apple-splash-1170-2532.png', width: 1170, height: 2532 },
  { name: 'apple-splash-750-1334.png',  width: 750,  height: 1334 },
];

const SPLASH_DIR = path.join(__dirname, '../public/splashscreens');

async function generateIcons() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`\n❌ Source icon not found at: ${SOURCE}`);
    console.error('   Create a 1024x1024px PNG and save it as public/icons/source.png\n');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(SPLASH_DIR, { recursive: true });

  console.log('\n🎨 Generating Tableaux PWA icons...\n');

  for (const icon of ICONS) {
    const outPath = path.join(OUT_DIR, icon.name);

    if (icon.maskable) {
      // Maskable: add 10% padding on all sides so the icon is safe in circular crops
      const padding = Math.round(icon.size * 0.1);
      const innerSize = icon.size - padding * 2;

      await sharp(SOURCE)
        .resize(innerSize, innerSize)
        .extend({
          top: padding, bottom: padding, left: padding, right: padding,
          background: { r: 13, g: 13, b: 13, alpha: 1 }, // matches --bg #0D0D0D
        })
        .png()
        .toFile(outPath);
    } else {
      await sharp(SOURCE)
        .resize(icon.size, icon.size)
        .png()
        .toFile(outPath);
    }

    console.log(`  ✓ ${icon.name}`);
  }

  // Splash screens: dark background + centered icon
  console.log('\n📱 Generating iOS splash screens...\n');

  for (const splash of SPLASHSCREENS) {
    const outPath = path.join(SPLASH_DIR, splash.name);
    const iconSize = Math.round(Math.min(splash.width, splash.height) * 0.25);
    const padding = Math.round((splash.width - iconSize) / 2);
    const vertPadding = Math.round((splash.height - iconSize) / 2);

    const iconBuffer = await sharp(SOURCE)
      .resize(iconSize, iconSize)
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: splash.width,
        height: splash.height,
        channels: 4,
        background: { r: 13, g: 13, b: 13, alpha: 1 },
      },
    })
      .composite([{ input: iconBuffer, left: padding, top: vertPadding }])
      .png()
      .toFile(outPath);

    console.log(`  ✓ ${splash.name}`);
  }

  console.log('\n✅ All icons generated successfully!\n');
  console.log('Next steps:');
  console.log('  1. Review icons in public/icons/ and public/splashscreens/');
  console.log('  2. npm run build && git push to deploy\n');
}

generateIcons().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
