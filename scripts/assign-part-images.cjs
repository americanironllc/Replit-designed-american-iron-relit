const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    const catResult = await client.query(
      `SELECT category, COUNT(*) as cnt FROM parts GROUP BY category ORDER BY cnt DESC`
    );
    const categories = catResult.rows;
    console.log(`Found ${categories.length} categories`);

    const totalParts = categories.reduce((s, c) => s + parseInt(c.cnt), 0);
    console.log(`Total parts: ${totalParts}`);

    const totalImages = 975;
    let imageIndex = 0;

    for (const cat of categories) {
      const catCount = parseInt(cat.cnt);
      const imagesForCat = Math.max(1, Math.round((catCount / totalParts) * totalImages));
      const startIdx = imageIndex;
      const endIdx = Math.min(imageIndex + imagesForCat, totalImages);
      
      console.log(`Category: ${cat.category} (${catCount} parts) -> images ${startIdx + 1} to ${endIdx}`);

      const partsResult = await client.query(
        `SELECT id FROM parts WHERE category = $1 ORDER BY id`,
        [cat.category]
      );

      const catImageCount = endIdx - startIdx;
      for (let i = 0; i < partsResult.rows.length; i++) {
        const imgNum = startIdx + (i % catImageCount) + 1;
        const imgPath = `/images/parts/items/part-${String(imgNum).padStart(4, '0')}.png`;
        await client.query(
          `UPDATE parts SET image_url = $1 WHERE id = $2`,
          [imgPath, partsResult.rows[i].id]
        );
      }

      imageIndex = endIdx;
      if (imageIndex >= totalImages) {
        imageIndex = 0;
      }
    }

    console.log('Done assigning images!');
    
    const verify = await client.query(
      `SELECT COUNT(DISTINCT image_url) as unique_images FROM parts WHERE image_url LIKE '/images/parts/items/%'`
    );
    console.log(`Unique item images assigned: ${verify.rows[0].unique_images}`);

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
