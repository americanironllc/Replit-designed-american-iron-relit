import { db } from "./db";
import { parts } from "@shared/schema";
import * as fs from "fs";
import { sql } from "drizzle-orm";

const CATEGORY_IMAGES: Record<string, string> = {
  "Air Inlet & Exhaust": "/images/parts/air-inlet-exhaust.jpg",
  "Turbochargers": "/images/parts/turbochargers.jpg",
  "Bearings": "/images/parts/bearings.jpg",
  "Belts & Hoses": "/images/parts/belts-hoses.jpg",
  "Braking & Friction": "/images/parts/braking-friction.jpg",
  "Cooling System": "/images/parts/cooling-system.jpg",
  "Electrical": "/images/parts/electrical.jpg",
  "Engine Components": "/images/parts/engine-components.jpg",
  "Filters": "/images/parts/filters.jpg",
  "Ground Engaging Tools": "/images/parts/ground-engaging.jpg",
  "Hardware": "/images/parts/hardware.jpg",
  "Hydraulic System": "/images/parts/hydraulic-system.jpg",
  "Gaskets & Seals": "/images/parts/gaskets-seals.jpg",
  "Undercarriage": "/images/parts/undercarriage.jpg",
};

async function seedParts() {
  console.log("Loading parsed parts...");
  const data = JSON.parse(fs.readFileSync("/tmp/parsed_parts.json", "utf-8"));
  console.log(`Loaded ${data.length} parts`);

  console.log("Clearing existing parts...");
  await db.delete(parts);

  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE).map((p: any) => ({
      partNumber: p.partNumber,
      description: p.description || p.category,
      category: p.category,
      subcategory: p.subcategory || null,
      price: null,
      compatibility: p.equipment || null,
      engineModel: p.engineModel || null,
      gasket: p.gasket || null,
      equipment: p.equipment || null,
      imageUrl: CATEGORY_IMAGES[p.category] || "/images/parts/generic-part.jpg",
    }));

    await db.insert(parts).values(batch);
    inserted += batch.length;
    if (inserted % 2000 === 0 || inserted === data.length) {
      console.log(`  Inserted ${inserted}/${data.length} parts...`);
    }
  }

  const [count] = await db.select({ count: sql<number>`count(*)` }).from(parts);
  console.log(`\nDone! Total parts in database: ${count.count}`);

  const cats = await db
    .select({ category: parts.category, count: sql<number>`count(*)` })
    .from(parts)
    .groupBy(parts.category);
  console.log("\nCategory counts:");
  for (const row of cats) {
    console.log(`  ${row.category}: ${row.count}`);
  }
}

seedParts().catch(console.error).finally(() => process.exit(0));
