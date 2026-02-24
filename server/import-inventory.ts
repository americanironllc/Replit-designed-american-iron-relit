import { readFileSync } from "fs";
import { db } from "./db";
import { equipment } from "@shared/schema";
import { sql } from "drizzle-orm";

const CATEGORY_MAP: Record<string, string> = {
  "equipment-scrapers": "SCRAPERS",
  "equipment-articulated-trucks": "ARTICULATED TRUCKS",
  "equipment-wheel-loaders": "WHEEL LOADERS",
  "equipment-excavators": "EXCAVATORS",
  "equipment-bulldozers": "BULLDOZERS",
  "equipment-telehandlers": "TELEHANDLERS",
  "equipment-motor-graders": "MOTOR GRADERS",
  "equipment-skidsteer": "SKIDSTEER",
  "equipment-off-highway-trucks": "OFF-HIGHWAY TRUCKS",
  "equipment-backhoes": "BACKHOES",
  "equipment-compactors": "COMPACTORS",
  "equipment-track-dozers": "TRACK DOZERS",
  "equipment": "OTHER EQUIPMENT",
};

function inferCategoryFromModel(make: string, model: string): string {
  const m = model.toUpperCase();
  const mk = make.toUpperCase();
  if (/^AP\d|PAVER/i.test(m)) return "ASPHALT PAVERS";
  if (/^RM\d|^RM\s|RECLAIM/i.test(m)) return "COLD PLANERS";
  if (/^PM\d|PLANER|COLD/i.test(m)) return "COLD PLANERS";
  if (/FOREST|^5[0-9]{2}\s|^538|^568/i.test(m) && mk === "CAT") return "FORESTRY EQUIPMENT";
  if (/PIPE\s?LAY|^PL\d/i.test(m)) return "PIPELAYERS";
  if (/LOADER|^9[0-9]{2}\s|^966|^950|^972/i.test(m) && !/TRACK|SKID/i.test(m)) return "WHEEL LOADERS";
  if (/GRADER|^1[0-9]{2}[A-Z]/i.test(m) && mk === "CAT") return "MOTOR GRADERS";
  if (/DOZER|^D[0-9]/i.test(m) && !/TRACK/i.test(m)) return "BULLDOZERS";
  if (/EXCAVAT|^3[0-9]{2}\s/i.test(m) && mk === "CAT") return "EXCAVATORS";
  if (/TELEHANDL|^TL\d|^TH\d/i.test(m)) return "TELEHANDLERS";
  if (/SKID\s?STEER|^2[0-9]{2}D|^S[0-9]{3}/i.test(m)) return "SKIDSTEER";
  if (/COMPACT|^CS\d|^CP\d|^CB\d|^CC\d|^BW\d|^DD[\-\d]/i.test(m)) return "COMPACTORS";
  if (/BACKHOE|^4[12][0-9]\s/i.test(m) && mk === "CAT") return "BACKHOES";
  if (/ARTICULAT|^7[0-9]{2}\s|^A[0-9]{2}[A-Z]/i.test(m)) return "ARTICULATED TRUCKS";
  if (/OFF.?HIGH|HAUL|^7[0-9]{2}[A-Z]/i.test(m)) return "OFF-HIGHWAY TRUCKS";
  if (/TRACK.?DOZ|TRACK.?LOAD/i.test(m)) return "TRACK DOZERS";
  return "OTHER EQUIPMENT";
}

function getCategoryFromLink(link: string): string {
  const match = link.match(/americanironus\.com\/([^.]+)\.html/);
  if (!match) return "OTHER EQUIPMENT";
  const slug = match[1];
  return CATEGORY_MAP[slug] || "OTHER EQUIPMENT";
}

async function importInventory() {
  const raw = readFileSync("attached_assets/xoxoxo_Listing_81825_1771681629194.txt");
  const text = raw.toString("latin1").replace(/\r/g, "");
  const lines = text.split("\n").filter((l) => l.trim().length > 0);

  await db.delete(equipment);
  console.log("Cleared existing equipment data.");

  const rows: Array<{
    equipmentId: string;
    make: string;
    model: string;
    year: number | null;
    meter: number | null;
    price: string | null;
    city: string | null;
    state: string | null;
    category: string;
    imageUrl: string | null;
  }> = [];

  const seenIds = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split("\t");
    if (cols.length < 9) continue;

    const eqId = cols[0].trim();
    if (!eqId || seenIds.has(eqId)) continue;
    seenIds.add(eqId);

    const make = cols[1].trim();
    const model = cols[2].trim();
    const yearStr = cols[3].trim();
    const meterStr = cols[4].trim();
    const priceStr = cols[5].trim().replace(/"/g, "").trim();
    const link = cols[8].trim();

    if (!make || !model) continue;

    const year = yearStr ? parseInt(yearStr, 10) : null;
    const meter = meterStr ? parseInt(meterStr, 10) : null;

    let category = getCategoryFromLink(link);
    if (category === "OTHER EQUIPMENT") {
      category = inferCategoryFromModel(make, model);
    }

    const price = priceStr && priceStr !== "$0.00" ? priceStr : "CALL";

    rows.push({
      equipmentId: eqId.substring(0, 20),
      make: make.substring(0, 50),
      model: model.substring(0, 100),
      year: year && year > 1900 && year < 2100 ? year : null,
      meter: meter && meter >= 0 ? meter : null,
      price: price.substring(0, 50),
      city: null,
      state: null,
      category,
      imageUrl: null,
    });
  }

  console.log(`Parsed ${rows.length} unique equipment items.`);

  const BATCH_SIZE = 100;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await db.insert(equipment).values(batch);
    inserted += batch.length;
    if (inserted % 500 === 0 || inserted === rows.length) {
      console.log(`Inserted ${inserted}/${rows.length} items...`);
    }
  }

  const categoryCounts: Record<string, number> = {};
  for (const r of rows) {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  }
  console.log("\nCategory breakdown:");
  for (const [cat, count] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }

  console.log(`\nDone! Total: ${rows.length} items imported.`);
  process.exit(0);
}

importInventory().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
