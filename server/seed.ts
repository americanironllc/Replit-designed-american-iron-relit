import { db } from "./db";
import { equipment, parts, powerUnits } from "@shared/schema";
import { sql, eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

const BATCH_SIZE = 500;

async function syncPowerUnitImages() {
  try {
    const dataDir = path.resolve(process.cwd(), "server", "data");
    const filePath = path.join(dataDir, "power-units.json");
    if (!fs.existsSync(filePath)) return;

    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const dbRows = await db.select({ id: powerUnits.id, stockNumber: powerUnits.stockNumber, imageUrl: powerUnits.imageUrl }).from(powerUnits);

    const jsonByStock: Record<string, string> = {};
    for (const r of jsonData) {
      const sn = r.stockNumber || r.stock_number;
      const img = r.imageUrl || r.image_url;
      if (sn && img) jsonByStock[sn] = img;
    }

    let updated = 0;
    for (const row of dbRows) {
      const expectedImg = jsonByStock[row.stockNumber];
      if (expectedImg && expectedImg !== row.imageUrl) {
        await db.update(powerUnits).set({ imageUrl: expectedImg }).where(eq(powerUnits.id, row.id));
        updated++;
      }
    }

    if (updated > 0) {
      console.log(`Synced ${updated} power unit image URLs to match data file.`);
    } else {
      console.log("Power unit images already in sync.");
    }
  } catch (error) {
    console.error("Error syncing power unit images:", error);
  }
}

async function insertBatch(table: any, rows: any[], label: string) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await db.insert(table).values(batch);
    inserted += batch.length;
    if (inserted % 2000 === 0 || inserted === rows.length) {
      console.log(`  ${label}: ${inserted}/${rows.length}`);
    }
  }
}

export async function seedDatabase() {
  try {
    const [eqCount] = await db.select({ count: sql<number>`count(*)` }).from(equipment);
    const [ptCount] = await db.select({ count: sql<number>`count(*)` }).from(parts);
    const [puCount] = await db.select({ count: sql<number>`count(*)` }).from(powerUnits);

    const eqTotal = Number(eqCount.count);
    const ptTotal = Number(ptCount.count);
    const puTotal = Number(puCount.count);

    if (eqTotal >= 2000 && ptTotal >= 17000 && puTotal >= 100) {
      console.log(`Database already seeded (${eqTotal} equipment, ${ptTotal} parts, ${puTotal} power units).`);
      await syncPowerUnitImages();
      return;
    }

    console.log(`Current counts: ${eqTotal} equipment, ${ptTotal} parts, ${puTotal} power units`);
    console.log("Seeding missing data from JSON files...");

    const dataDir = path.resolve(process.cwd(), "server", "data");

    if (eqTotal < 2000) {
      const filePath = path.join(dataDir, "equipment.json");
      if (fs.existsSync(filePath)) {
        console.log("Importing equipment...");
        await db.delete(equipment);
        const rows = JSON.parse(fs.readFileSync(filePath, "utf-8")).map((r: any) => ({
          equipmentId: r.equipmentId || r.equipment_id,
          make: r.make,
          model: r.model,
          year: r.year,
          meter: r.meter,
          price: r.price,
          city: r.city,
          state: r.state,
          category: r.category,
          imageUrl: r.imageUrl || r.image_url,
        }));
        await insertBatch(equipment, rows, "Equipment");
        console.log(`Imported ${rows.length} equipment items.`);
      } else {
        console.log("Equipment data file not found, skipping.");
      }
    }

    if (ptTotal < 17000) {
      const filePath = path.join(dataDir, "parts.json");
      if (fs.existsSync(filePath)) {
        console.log("Importing parts...");
        await db.delete(parts);
        const rows = JSON.parse(fs.readFileSync(filePath, "utf-8")).map((r: any) => ({
          partNumber: r.partNumber || r.part_number,
          description: r.description,
          category: r.category,
          subcategory: r.subcategory,
          price: r.price,
          compatibility: r.compatibility,
          engineModel: r.engineModel || r.engine_model,
          gasket: r.gasket,
          equipment: r.equipment,
          imageUrl: r.imageUrl || r.image_url,
        }));
        await insertBatch(parts, rows, "Parts");
        console.log(`Imported ${rows.length} parts.`);
      } else {
        console.log("Parts data file not found, skipping.");
      }
    }

    if (puTotal < 100) {
      const filePath = path.join(dataDir, "power-units.json");
      if (fs.existsSync(filePath)) {
        console.log("Importing power units...");
        await db.delete(powerUnits);
        const rows = JSON.parse(fs.readFileSync(filePath, "utf-8")).map((r: any) => ({
          stockNumber: r.stockNumber || r.stock_number,
          model: r.model,
          category: r.category,
          hp: r.hp,
          kw: r.kw,
          rpm: r.rpm,
          year: r.year,
          condition: r.condition,
          location: r.location,
          price: r.price,
          imageUrl: r.imageUrl || r.image_url,
          brand: r.brand,
          fuelType: r.fuelType || r.fuel_type,
          hours: r.hours,
          serialNumber: r.serialNumber || r.serial_number,
          unitType: r.unitType || r.unit_type,
          description: r.description,
        }));
        await insertBatch(powerUnits, rows, "Power Units");
        console.log(`Imported ${rows.length} power units.`);
      } else {
        console.log("Power units data file not found, skipping.");
      }
    }

    console.log("Seeding complete.");
  } catch (error) {
    console.error("Seeding error:", error);
  }
}
