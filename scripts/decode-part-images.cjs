const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'attached_assets', 'PARTS_IMAGES_URLS_1771748243811.txt');
const outputDir = path.join(__dirname, '..', 'client', 'public', 'images', 'parts', 'items');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const content = fs.readFileSync(inputFile, 'utf-8');
const lines = content.split('\n').filter(l => l.trim().startsWith('data:image'));

console.log(`Found ${lines.length} base64 image data URLs`);

let saved = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  const match = line.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/);
  if (match) {
    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `part-${String(i + 1).padStart(4, '0')}.${ext}`;
    fs.writeFileSync(path.join(outputDir, filename), buffer);
    saved++;
    if (saved % 100 === 0) {
      console.log(`Saved ${saved} images...`);
    }
  } else {
    console.log(`Line ${i + 1}: Could not parse data URL`);
  }
}

console.log(`Done! Saved ${saved} images to ${outputDir}`);
