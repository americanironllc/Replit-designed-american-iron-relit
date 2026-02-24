const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const classificationsFile = path.join(__dirname, 'image-classifications.json');
const classifications = JSON.parse(fs.readFileSync(classificationsFile, 'utf8'));

function normalizeText(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function getMatchScore(imageType, imageKeywords, partDesc, partSubcat) {
  const imgWords = normalizeText(imageType + ' ' + (imageKeywords || '')).split(' ').filter(w => w.length > 2);
  const partWords = normalizeText(partDesc + ' ' + partSubcat).split(' ').filter(w => w.length > 2);
  
  let score = 0;
  for (const iw of imgWords) {
    for (const pw of partWords) {
      if (iw === pw) score += 3;
      else if (pw.includes(iw) || iw.includes(pw)) score += 1;
    }
  }
  return score;
}

async function main() {
  const client = await pool.connect();
  
  try {
    const imagesByCategory = {};
    for (const cls of classifications) {
      if (!imagesByCategory[cls.category]) imagesByCategory[cls.category] = [];
      imagesByCategory[cls.category].push(cls);
    }

    console.log('Image classification distribution:');
    for (const [cat, imgs] of Object.entries(imagesByCategory)) {
      console.log(`  ${cat}: ${imgs.length} images`);
    }

    const partsRes = await client.query('SELECT id, category, subcategory, description, part_number FROM parts ORDER BY category, subcategory, id');
    const parts = partsRes.rows;
    console.log(`\nTotal parts: ${parts.length}`);

    const partsByCategory = {};
    for (const part of parts) {
      if (!partsByCategory[part.category]) partsByCategory[part.category] = [];
      partsByCategory[part.category].push(part);
    }

    const assignments = [];
    let matchedWithScore = 0;
    let cycled = 0;

    for (const [category, categoryParts] of Object.entries(partsByCategory)) {
      const categoryImages = imagesByCategory[category] || [];
      
      if (categoryImages.length === 0) {
        console.log(`  No images for category: ${category}, using fallback`);
        for (const part of categoryParts) {
          assignments.push({ partId: part.id, imageUrl: '/images/parts/generic-part.png' });
        }
        continue;
      }

      const subcatGroups = {};
      for (const part of categoryParts) {
        const subcat = part.subcategory || 'GENERAL';
        if (!subcatGroups[subcat]) subcatGroups[subcat] = [];
        subcatGroups[subcat].push(part);
      }

      for (const [subcat, subcatParts] of Object.entries(subcatGroups)) {
        let bestImages = [];
        for (const img of categoryImages) {
          const score = getMatchScore(img.partType, img.keywords || '', subcatParts[0].description, subcat);
          bestImages.push({ ...img, score });
        }
        bestImages.sort((a, b) => b.score - a.score);

        const topImages = bestImages.filter(img => img.score > 0);
        const imagesToUse = topImages.length > 0 ? topImages : categoryImages;

        for (let i = 0; i < subcatParts.length; i++) {
          const imgIdx = i % imagesToUse.length;
          const img = imagesToUse[imgIdx];
          const imageUrl = `/images/parts/items/${img.file}`;
          assignments.push({ partId: subcatParts[i].id, imageUrl });
          
          if (img.score > 0) matchedWithScore++;
          else cycled++;
        }
      }
    }

    console.log(`\nAssignment summary:`);
    console.log(`  Total assignments: ${assignments.length}`);
    console.log(`  Matched by type: ${matchedWithScore}`);
    console.log(`  Cycled within category: ${cycled}`);

    console.log('\nUpdating database...');
    const BATCH_SIZE = 500;
    for (let i = 0; i < assignments.length; i += BATCH_SIZE) {
      const batch = assignments.slice(i, i + BATCH_SIZE);
      const cases = batch.map(a => `WHEN ${a.partId} THEN '${a.imageUrl}'`).join(' ');
      const ids = batch.map(a => a.partId).join(',');
      await client.query(`UPDATE parts SET image_url = CASE id ${cases} END WHERE id IN (${ids})`);
      
      if ((i + BATCH_SIZE) % 2000 < BATCH_SIZE) {
        console.log(`  Updated ${Math.min(i + BATCH_SIZE, assignments.length)}/${assignments.length}`);
      }
    }

    console.log('Done! All parts updated with matched images.');

    const verifyRes = await client.query(`
      SELECT category, COUNT(DISTINCT image_url) as unique_images, COUNT(*) as total_parts 
      FROM parts GROUP BY category ORDER BY total_parts DESC
    `);
    console.log('\nVerification:');
    for (const row of verifyRes.rows) {
      console.log(`  ${row.category}: ${row.unique_images} unique images for ${row.total_parts} parts`);
    }

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
