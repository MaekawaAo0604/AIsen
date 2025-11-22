/**
 * Generate favicon.ico and apple-icon.png from app/icon.svg
 *
 * Usage:
 *   npm install --save-dev sharp
 *   node scripts/generate-favicon.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const svgPath = path.join(__dirname, '../app/icon.svg');
  const icoPath = path.join(__dirname, '../public/favicon.ico');
  const applePath = path.join(__dirname, '../public/apple-icon.png');

  if (!fs.existsSync(svgPath)) {
    console.error('❌ app/icon.svg not found');
    process.exit(1);
  }

  try {
    const svg = fs.readFileSync(svgPath);

    // Generate 32x32 favicon.ico
    await sharp(svg)
      .resize(32, 32)
      .png()
      .toFile(icoPath);

    console.log('✓ favicon.ico generated at public/favicon.ico');

    // Generate 180x180 apple-icon.png (iOS home screen icon)
    await sharp(svg)
      .resize(180, 180)
      .png()
      .toFile(applePath);

    console.log('✓ apple-icon.png generated at public/apple-icon.png');

    console.log('\n🎉 All icons generated successfully!');
  } catch (error) {
    console.error('❌ Failed to generate icons:', error.message);
    console.error('\nTry installing sharp: npm install --save-dev sharp');
    process.exit(1);
  }
}

generateIcons();
