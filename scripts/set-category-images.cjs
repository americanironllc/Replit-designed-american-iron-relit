const fs = require('fs');
const path = require('path');

const categoryImageMap = {
  'Hydraulic System': 'part-0010.png',
  'Engine Components': 'part-0185.png',
  'Bearings': 'part-0310.png',
  'Undercarriage': 'part-0430.png',
  'Filters': 'part-0500.png',
  'Electrical': 'part-0570.png',
  'Ground Engaging Tools': 'part-0640.png',
  'Belts & Hoses': 'part-0700.png',
  'Braking & Friction': 'part-0760.png',
  'Hardware': 'part-0830.png',
  'Cooling System': 'part-0875.png',
  'Turbochargers': 'part-0920.png',
  'Air Inlet & Exhaust': 'part-0955.png',
  'Gaskets & Seals': 'part-0975.png',
};

const categoryFileMap = {
  'Hydraulic System': 'hydraulic-system',
  'Engine Components': 'engine-components',
  'Bearings': 'bearings',
  'Undercarriage': 'undercarriage',
  'Filters': 'filters',
  'Electrical': 'electrical',
  'Ground Engaging Tools': 'ground-engaging',
  'Belts & Hoses': 'belts-hoses',
  'Braking & Friction': 'braking-friction',
  'Hardware': 'hardware',
  'Cooling System': 'cooling-system',
  'Turbochargers': 'turbochargers',
  'Air Inlet & Exhaust': 'air-inlet-exhaust',
  'Gaskets & Seals': 'gaskets-seals',
};

const srcDir = path.join(__dirname, '..', 'client', 'public', 'images', 'parts', 'items');
const destDir = path.join(__dirname, '..', 'client', 'public', 'images', 'parts');

for (const [category, srcFile] of Object.entries(categoryImageMap)) {
  const destName = categoryFileMap[category];
  if (!destName) continue;
  const src = path.join(srcDir, srcFile);
  const dest = path.join(destDir, `${destName}.png`);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${srcFile} -> ${destName}.png for ${category}`);
  } else {
    console.log(`WARNING: ${src} not found`);
  }
}

console.log('Done setting category images!');
