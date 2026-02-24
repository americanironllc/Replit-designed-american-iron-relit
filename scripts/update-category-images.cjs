const fs = require('fs');
const path = require('path');

const classificationsFile = path.join(__dirname, 'image-classifications.json');
const classifications = JSON.parse(fs.readFileSync(classificationsFile, 'utf8'));

const IMAGES_DIR = path.join(__dirname, '..', 'client', 'public', 'images', 'parts', 'items');
const OUTPUT_DIR = path.join(__dirname, '..', 'client', 'public', 'images', 'parts');

const CATEGORY_FILES = {
  "Hydraulic System": "hydraulic-system.png",
  "Engine Components": "engine-components.png",
  "Bearings": "bearings.png",
  "Undercarriage": "undercarriage.png",
  "Filters": "filters.png",
  "Electrical": "electrical.png",
  "Ground Engaging Tools": "ground-engaging-tools.png",
  "Belts & Hoses": "belts-hoses.png",
  "Braking & Friction": "braking-friction.png",
  "Hardware": "hardware.png",
  "Cooling System": "cooling-system.png",
  "Turbochargers": "turbochargers.png",
  "Air Inlet & Exhaust": "air-inlet-exhaust.png",
  "Gaskets & Seals": "gaskets-seals.png"
};

const imagesByCategory = {};
for (const cls of classifications) {
  if (!imagesByCategory[cls.category]) imagesByCategory[cls.category] = [];
  imagesByCategory[cls.category].push(cls);
}

for (const [category, outputFile] of Object.entries(CATEGORY_FILES)) {
  const images = imagesByCategory[category] || [];
  if (images.length === 0) {
    console.log(`No images for ${category}, skipping`);
    continue;
  }

  let bestImage = images[0];
  let bestSize = 0;
  for (const img of images) {
    const filePath = path.join(IMAGES_DIR, img.file);
    if (fs.existsSync(filePath)) {
      const size = fs.statSync(filePath).size;
      if (size > bestSize) {
        bestSize = size;
        bestImage = img;
      }
    }
  }

  const srcPath = path.join(IMAGES_DIR, bestImage.file);
  const dstPath = path.join(OUTPUT_DIR, outputFile);
  fs.copyFileSync(srcPath, dstPath);
  console.log(`${category}: ${bestImage.file} (${bestImage.partType}) -> ${outputFile} (${Math.round(bestSize/1024)}KB)`);
}

console.log('\nDone! Category images updated.');
