const fs = require('fs');
const path = require('path');
const OpenAI = require('openai').default;

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const CATEGORIES = [
  "Hydraulic System",
  "Engine Components",
  "Bearings",
  "Undercarriage",
  "Filters",
  "Electrical",
  "Ground Engaging Tools",
  "Belts & Hoses",
  "Braking & Friction",
  "Hardware",
  "Cooling System",
  "Turbochargers",
  "Air Inlet & Exhaust",
  "Gaskets & Seals"
];

const IMAGES_DIR = path.join(__dirname, '..', 'client', 'public', 'images', 'parts', 'items');
const OUTPUT_FILE = path.join(__dirname, 'image-classifications.json');

async function classifyImage(imagePath, imageFile) {
  const imageData = fs.readFileSync(imagePath);
  const base64 = imageData.toString('base64');

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [{
      role: "user",
      content: [
        { type: "image_url", image_url: { url: `data:image/png;base64,${base64}` } },
        { type: "text", text: `Classify this heavy equipment/machinery part image into ONE category from this list:
1. Hydraulic System (pumps, valves, cylinders, hoses, fittings)
2. Engine Components (pistons, crankshafts, camshafts, cylinder heads, blocks)
3. Bearings (ball bearings, roller bearings, bushings, races)
4. Undercarriage (track links, rollers, idlers, sprockets, shoes)
5. Filters (oil, fuel, air, hydraulic filters)
6. Electrical (alternators, starters, wiring, switches, sensors)
7. Ground Engaging Tools (bucket teeth, cutting edges, blades)
8. Belts & Hoses (drive belts, radiator hoses, hydraulic hoses)
9. Braking & Friction (brake pads, discs, friction plates)
10. Hardware (bolts, nuts, screws, washers, pins, clamps)
11. Cooling System (radiators, water pumps, thermostats, fans)
12. Turbochargers (turbo assemblies, cartridges, housings)
13. Air Inlet & Exhaust (mufflers, exhaust pipes, manifolds)
14. Gaskets & Seals (gaskets, o-rings, seals, seal kits)

Reply ONLY with JSON: {"cat": <number 1-14>, "type": "specific part name"}` }
      ]
    }],
    max_completion_tokens: 60,
  });

  const content = (response.choices[0].message.content || '').trim();
  let parsed = { cat: 1, type: "unknown" };
  
  try {
    const jsonMatch = content.match(/\{[^}]+\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    const numMatch = content.match(/(\d+)/);
    if (numMatch) {
      parsed.cat = parseInt(numMatch[1]);
    }
  }

  const catIdx = Math.max(0, Math.min(13, (parsed.cat || 1) - 1));
  return {
    file: imageFile,
    category: CATEGORIES[catIdx],
    partType: parsed.type || "unknown",
  };
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const existingResults = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    for (const item of existing) {
      existingResults[item.file] = item;
    }
    console.log(`Resuming: ${Object.keys(existingResults).length} already classified`);
  }

  const imageFiles = fs.readdirSync(IMAGES_DIR)
    .filter(f => f.endsWith('.png') && f.startsWith('part-'))
    .sort();

  console.log(`Total images: ${imageFiles.length}`);
  const toProcess = imageFiles.filter(f => !existingResults[f]);
  console.log(`Remaining: ${toProcess.length}`);

  if (toProcess.length === 0) {
    printSummary(Object.values(existingResults));
    return;
  }

  const results = [...Object.values(existingResults)];
  let processed = results.length;
  let errors = 0;
  const CONCURRENCY = 2;

  for (let i = 0; i < toProcess.length; i += CONCURRENCY) {
    const batch = toProcess.slice(i, i + CONCURRENCY);
    const promises = batch.map(async (imageFile) => {
      const imagePath = path.join(IMAGES_DIR, imageFile);
      for (let attempt = 0; attempt < 6; attempt++) {
        try {
          return await classifyImage(imagePath, imageFile);
        } catch (err) {
          const msg = err.message || '';
          if (msg.includes('429') || msg.toLowerCase().includes('rate')) {
            const delay = Math.pow(2, attempt) * 3000;
            await sleep(delay);
          } else {
            if (attempt === 5) {
              errors++;
              return { file: imageFile, category: "Hardware", partType: "unknown", error: msg.substring(0, 100) };
            }
            await sleep(2000);
          }
        }
      }
    });

    const batchResults = await Promise.all(promises);
    for (const r of batchResults) {
      if (r) {
        results.push(r);
        processed++;
      }
    }

    if (i % 20 === 0 || i + CONCURRENCY >= toProcess.length) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    }

    if (processed % 25 < CONCURRENCY) {
      console.log(`Progress: ${processed}/${imageFiles.length} (${errors} errors)`);
    }
    
    await sleep(300);
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  printSummary(results);
}

function printSummary(results) {
  const categoryCounts = {};
  for (const r of results) {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  }
  console.log('\nClassification summary:');
  for (const [cat, count] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log(`Total: ${results.length}`);
}

main().catch(console.error);
