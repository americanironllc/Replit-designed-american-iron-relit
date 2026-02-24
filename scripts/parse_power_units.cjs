const XLSX = require('xlsx');
const { Pool } = require('pg');

const wb = XLSX.readFile('attached_assets/catalog_power_units_UPDATE_1771814211440.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const raw = XLSX.utils.sheet_to_json(ws, {header: 1, defval: ''});

function fixBrand(rawBrand) {
  if (!rawBrand || rawBrand === 'N/A') return 'N/A';
  const b = String(rawBrand).trim();
  const fixes = {
    'ummins': 'Cummins', 'aterpillar': 'Caterpillar', 'roy Somer': 'Leroy Somer',
    'eneracs': 'Generac', 'itsubishi': 'Mitsubishi', 'ohn Deere': 'John Deere',
    'olvo': 'Volvo', 'ohnson & Towers': 'Johnson & Towers', 'etroit Diesel': 'Detroit Diesel',
    'an': 'MAN', 'MTU / Detroit Dies': 'MTU / Detroit Diesel', 'ummings': 'Cummins',
  };
  return fixes[b] || b;
}

function cleanVal(v) {
  if (v === undefined || v === null || v === '') return 'N/A';
  const s = String(v).trim();
  return s === '' ? 'N/A' : s;
}

function parseNum(v) {
  if (v === undefined || v === null || v === '' || v === 'N/A') return null;
  const n = parseInt(String(v).replace(/,/g, ''));
  return isNaN(n) ? null : n;
}

// Define section configs with their column mappings
const sections = [
  {
    name: 'Generator Sets', startRow: 2, endRow: 90,
    cols: { brand: 1, model: 2, year: 5, condition: 9, hours: 11, hp: 14, kw: 17, rpm: 20, engineRpm: 23, tierRating: 27, fuelType: 31, cooling: 35, enclosure: 38, volts: 41, stage: 43, sellingStage: 45, unitType: 48 }
  },
  {
    name: 'Industrial Engines', startRow: 93, endRow: 106,
    cols: { brand: 0, model: 2, year: 7, condition: 10, hours: 14, hp: 18, kw: 22, rpm: 24, engineRpm: 26, tierRating: 30, fuelType: 34, cooling: 37, enclosure: 39, volts: 42, stage: 43, sellingStage: 46, unitType: 49 }
  },
  {
    name: 'Marine Engines', startRow: 109, endRow: 132,
    cols: { brand: 0, model: 2, year: 4, condition: 8, hours: 13, hp: 16, kw: 19, rpm: 22, engineRpm: 25, tierRating: 29, fuelType: 33, cooling: 36, enclosure: 39, volts: 42, stage: 43, sellingStage: 45, unitType: 48 }
  },
  {
    name: 'Power Units', startRow: 135, endRow: 157,
    cols: { brand: 0, model: 3, year: 6, condition: 9, hours: 12, hp: 15, kw: 18, rpm: 21, engineRpm: 24, tierRating: 28, fuelType: 32, cooling: 35, enclosure: 38, volts: 40, stage: 42, sellingStage: 44, unitType: 47 }
  }
];

const allItems = [];
let itemIndex = 0;

for (const section of sections) {
  for (let i = section.startRow; i <= section.endRow && i < raw.length; i++) {
    const row = raw[i];
    const nonEmpty = row.filter(c => c !== '');
    // Skip rows with less than 5 non-empty cells (section headers, single-letter rows)
    if (nonEmpty.length < 5) continue;

    const c = section.cols;
    const brand = fixBrand(row[c.brand]);
    const model = cleanVal(row[c.model]);
    const year = cleanVal(row[c.year]);
    const condition = cleanVal(row[c.condition]);
    const hours = cleanVal(row[c.hours]);
    const hp = parseNum(row[c.hp]);
    const kw = parseNum(row[c.kw]);
    const rpm = parseNum(row[c.rpm]);
    const engineRpm = parseNum(row[c.engineRpm]);
    const tierRating = cleanVal(row[c.tierRating]);
    const fuelType = cleanVal(row[c.fuelType]);
    const cooling = cleanVal(row[c.cooling]);
    const enclosure = cleanVal(row[c.enclosure]);
    const volts = cleanVal(row[c.volts]);
    const stage = cleanVal(row[c.stage]);
    const sellingStage = cleanVal(row[c.sellingStage]);
    const unitType = cleanVal(row[c.unitType]);

    // Build display model name
    let displayModel = model;
    if (brand && brand !== 'N/A') {
      displayModel = `${brand} ${model}`;
    }

    itemIndex++;
    const stockNum = `PU-${String(itemIndex).padStart(3, '0')}`;
    // Map to existing images if available (we have 95)
    const imageUrl = itemIndex <= 95 ? `/images/power-units-new/power_unit_${String(itemIndex).padStart(3, '0')}.png` : null;

    allItems.push({
      stockNumber: stockNum,
      brand,
      model: displayModel,
      category: section.name,
      hp, kw, rpm, engineRpm,
      year,
      condition,
      hours,
      tierRating,
      fuelType,
      cooling,
      enclosure,
      volts,
      stage,
      sellingStage,
      unitType,
      location: 'Tampa, FL',
      price: 'Call for Price',
      imageUrl
    });
  }
}

console.log(`Parsed ${allItems.length} items:`);
sections.forEach(s => {
  const count = allItems.filter(i => i.category === s.name).length;
  console.log(`  ${s.name}: ${count}`);
});

// Print first 3 items from each section for verification
sections.forEach(s => {
  console.log(`\n--- ${s.name} (first 3) ---`);
  allItems.filter(i => i.category === s.name).slice(0, 3).forEach(i => {
    console.log(`  ${i.stockNumber}: ${i.model} | ${i.condition} | HP:${i.hp} KW:${i.kw} | ${i.hours}hrs | ${i.fuelType} | ${i.enclosure}`);
  });
});

// Insert into database
async function seedDB() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query('DELETE FROM power_units');
    console.log('\nCleared old power_units data');

    for (const item of allItems) {
      await pool.query(
        `INSERT INTO power_units (stock_number, brand, model, category, hp, kw, rpm, engine_rpm, year, condition, hours, tier_rating, fuel_type, cooling, enclosure, volts, stage, selling_stage, unit_type, location, price, image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
        [item.stockNumber, item.brand, item.model, item.category, item.hp, item.kw, item.rpm, item.engineRpm, item.year, item.condition, item.hours, item.tierRating, item.fuelType, item.cooling, item.enclosure, item.volts, item.stage, item.sellingStage, item.unitType, item.location, item.price, item.imageUrl]
      );
    }
    console.log(`Inserted ${allItems.length} power units into database`);
    
    // Verify
    const result = await pool.query('SELECT COUNT(*), category FROM power_units GROUP BY category ORDER BY category');
    console.log('\nDatabase counts:');
    result.rows.forEach(r => console.log(`  ${r.category}: ${r.count}`));
  } catch(err) {
    console.error('DB error:', err);
  } finally {
    await pool.end();
  }
}

seedDB();
