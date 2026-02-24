import * as fs from "fs";

interface ParsedPart {
  partNumber: string;
  description: string;
  category: string;
  subcategory: string;
  engineModel: string;
  gasket: string;
  equipment: string;
}

const SIDEBAR_TO_CATEGORY: Record<string, string> = {
  "air inlet & exhaust system": "Air Inlet & Exhaust",
  "turbochargers": "Turbochargers",
  "bearings": "Bearings",
  "belts & hoses": "Belts & Hoses",
  "braking & friction": "Braking & Friction",
  "cooling system": "Cooling System",
  "electrical parts": "Electrical",
  "diesel engine components": "Engine Components",
  "ground engaging tools": "Ground Engaging Tools",
  "hardware parts": "Hardware",
  "hydraulic system": "Hydraulic System",
  "gaskets & seals": "Gaskets & Seals",
  "filters": "Filters",
  "fluids": "Fluids",
  "fuel system": "Fuel System",
  "undercarriage": "Undercarriage",
  "operator station": "Operator Station",
  "powertrain": "Powertrain",
  "rubber products": "Rubber Products",
  "work tools": "Work Tools",
};

const KNOWN_SUBCATEGORIES = new Set([
  "SINGLE MANIFOLDS", "EXHAUST MANIFOLDS", "GROUP MANIFOLDS", "MUFFLERS",
  "EXHAUST PIPES", "INLET PIPES", "EXHAUST RAIN CAPS", "INLET & EXHAUST PIPES",
  "MUFFLERS FOR KOMATSU", "EXHAUST PIPES FOR KOMATSU",
  "C SERIES TURBOCHARGERS", "D SERIES TURBOCHARGERS",
  "TURBOCHARGERS FOR KOMATSU", "TURBOCHARGER HEAT SHIELDS",
  "AFTERCOOLER GASKETS", "AFTERCOOLER ADAPTERS", "AFTERCOOLERS",
  "TURBOCHARGER CARTRIDGES",
  "COMPOSITE BEARINGS", "BEARING SLEEVES", "BUSHINGS", "BEARINGS",
  "BUSHINGS FOR KOMATSU", "BEARINGS FOR JOHN DEERE",
  "SLEEVES", "SPHERICAL BEARINGS", "SPHERICAL BEARING RACES",
  "SPHERICAL BEARINGS FOR KOMATSU", "TAPERED BEARINGS",
  "TAPERED ROLLER BEARING ASSEMBLIES", "ROLLER BEARINGS",
  "ROLLER BEARINGS FOR KOMATSU", "NEEDLE BEARINGS",
  "V-BELTS", "BELTS BY SIZE", "SERPENTINE BELTS", "BELT TENSIONERS",
  "COGGED V-BELT", "BELTS FOR KOMATSU", "PULLEYS",
  "RADIATOR HOSES", "RUBBER HOSES", "WATER HOSES",
  "AFTERCOOLER AIR HOSES", "ENGINE OIL COOLER HOSES",
  "BRAKE PEDALS & VALVES", "BRAKE SYSTEM VALVES",
  "HYDRAULIC BRAKE CALIPERS", "BRAKE LINING", "BRAKE PADS",
  "BRAKE BAND LINING KITS", "SHOE LINING AND BANDS",
  "BRAKE DISCS", "STEERING CLUTCH DISCS", "FINAL DRIVE DISCS",
  "DISCS FOR POWERTRAIN", "POWER SHIFT CONTROL DISCS",
  "ENGINE OIL COOLERS", "OIL COOLERS", "RADIATOR OIL COOLERS",
  "RADIATOR CORES", "RADIATORS", "RADIATORS FOR KOMATSU",
  "RADIATOR COOLING FANS", "WATER PUMPS", "WATER PUMPS FOR KOMATSU",
  "THERMOSTATS", "FAN BLADES", "FAN DRIVES",
  "ALTERNATORS", "ALTERNATORS FOR KOMATSU", "VOLTAGE REGULATORS",
  "STARTING MOTORS", "STARTING MOTORS FOR KOMATSU",
  "STARTING MOTORS PARTS", "BATTERIES",
  "SEALED LAMPS", "LED LAMP GROUP", "DRIVING & TRAFFIC LIGHTS",
  "WARNING LIGHTS", "LAMP BULBS",
  "SENSORS", "PRESSURE SENSORS", "TEMPERATURE SENSORS",
  "SPEED SENSORS", "OIL PRESSURE SENSORS",
  "SWITCHES", "IGNITION SWITCHES", "TOGGLE SWITCHES",
  "ROCKER SWITCHES", "PUSHBUTTON SWITCHES",
  "SOLENOIDS", "FUEL SHUTOFF SOLENOIDS", "ELECTRICAL SOLENOIDS",
  "SPARK PLUGS", "GLOW PLUGS",
  "ENGINE BLOCKS", "CUSTOM ENGINES",
  "INFRAME OVERHAUL KITS", "ENGINE KITS",
  "PISTONS", "PISTON RING SETS", "CYLINDER LINERS",
  "CRANKSHAFTS", "CRANKSHAFT GEARS",
  "CAMSHAFTS", "CAMSHAFT GEARS",
  "ENGINE CONNECTING RODS", "CONNECTING ROD KITS",
  "ENGINE OIL PUMPS", "ENGINE VALVES",
  "CYLINDER HEADS", "ASSEMBLED CYLINDER HEADS",
  "INJECTOR SLEEVES", "PRE-COMBUSTION CHAMBERS",
  "TIPS & ADAPTERS", "RIPPER SHANKS", "SHANK PROTECTORS",
  "RIPPER TEETH", "SHANK TIPS",
  "CUTTING EDGES", "END BITS", "GRADER BLADES",
  "BUCKET TEETH", "ADAPTERS FOR EXCAVATOR",
  "EXCAVATOR BUCKETS", "MINI-EXCAVATORS",
  "BOLTS", "NUTS", "SCREWS", "WASHERS", "PINS",
  "PLOW BOLTS", "TRACK BOLTS", "CUTTING EDGE BOLTS",
  "CONNECTORS", "FITTINGS", "CLAMPS",
  "GEAR PUMPS", "PISTON PUMPS", "VANE PUMPS",
  "HYDRAULIC CYLINDERS", "HYDRAULIC HOSES",
  "HYDRAULIC FILTERS", "CONTROL VALVES",
  "COMPLETE GASKET SETS", "HEAD GASKETS",
  "OIL FILTERS", "FUEL FILTERS", "AIR FILTERS",
  "PRIMARY AIR FILTERS", "SECONDARY AIR FILTERS",
  "HYDRAULIC FILTERS", "TRANSMISSION FILTERS",
  "FUEL TRANSFER PUMPS", "FUEL PRIMING PUMPS",
  "FUEL INJECTION NOZZLES", "FUEL INJECTORS",
  "SPROCKETS & SEGMENTS", "TRACK SHOES", "TRACK CHAINS",
  "TRACK ROLLERS", "CARRIER ROLLERS", "IDLERS",
  "TRACK LINKS", "TRACK GROUPS",
  "LOADER PADS", "RUBBER PADS",
  "SEATS", "MIRRORS", "FUEL CAPS", "GLASS",
  "BULLDOZER GLASS", "WINDSHIELD WIPERS",
]);

function cleanCostex(text: string): string {
  return text
    .replace(/\bCostex\s*Tractor\s*Parts?\b/gi, "")
    .replace(/\bCostex\b/gi, "")
    .replace(/\bCTP\s*/g, "")
    .replace(/Copyright\s*©.*$/gi, "")
    .replace(/®/g, "")
    .trim();
}

function isValidSubcategory(s: string): boolean {
  s = s.replace(/\(CONT\.?\)/i, "").trim();
  if (s.length < 4 || s.length > 60) return false;
  if (/\d{3,}[A-Z]/.test(s)) return false;
  if (/^[A-Z]\d{2}/.test(s)) return false;
  if (/,\s*[A-Z0-9]+\s*,/.test(s) && s.split(",").length > 3) return false;
  if (/^\d/.test(s) && !/^\d+-/.test(s) && !/^\d{2,4}-Volt/.test(s)) return false;

  const normalized = s.replace(/\(.*?\)/g, "").replace(/FOR KOMATSU|FOR JOHN DEERE/gi, "").trim();
  for (const known of KNOWN_SUBCATEGORIES) {
    if (normalized.includes(known) || known.includes(normalized)) return true;
  }

  const words = normalized.split(/\s+/);
  const partWords = ["MANIFOLD", "BEARING", "BELT", "HOSE", "BRAKE", "DISC", "PUMP",
    "VALVE", "MOTOR", "FILTER", "SENSOR", "SWITCH", "LAMP", "LIGHT",
    "BOLT", "NUT", "SCREW", "PIN", "WASHER", "FITTING", "CLAMP",
    "PISTON", "LINER", "CRANKSHAFT", "CAMSHAFT", "GASKET", "SEAL",
    "CYLINDER", "COOLER", "RADIATOR", "FAN", "THERMOSTAT",
    "ALTERNATOR", "STARTER", "BATTERY", "SOLENOID", "PLUG",
    "SPROCKET", "ROLLER", "IDLER", "TRACK", "SHOE", "PAD",
    "BUCKET", "EDGE", "TOOTH", "TEETH", "SHANK", "BLADE",
    "SEAT", "MIRROR", "CAP", "GLASS", "WIPER", "TUBE",
    "GEAR", "CARTRIDGE", "OVERHAUL", "KIT", "ENGINE",
    "HYDRAULIC", "CONNECTING", "ROD", "OIL", "WATER", "FUEL", "AIR",
    "RUBBER", "ACTUATOR", "REGULATOR", "HEAD", "INJECTOR",
    "NOZZLE", "ADAPTER", "RIPPER", "GRADER", "CUTTING", "EXCAVATOR",
    "PIPE", "MUFFLER", "TURBOCHARGER", "AFTERCOOLER", "EXHAUST",
    "INLET", "RAIN", "TENSIONER", "PULLEY", "SERPENTINE", "COGGED"];

  return words.some(w => partWords.some(pw => w.includes(pw)));
}

function isPartNumber(s: string): boolean {
  s = s.trim();
  if (s.length < 4 || s.length > 20) return false;
  if (/^\d{1,4}$/.test(s)) return false;
  if (/^(ENGINE|GASKET|PART|MODEL|NUMBER|DESCRIPTION|EQUIPMENT|CARTRIDGE|CONT|SOLD|SEPARATELY|STATED|STD|LH|RH|NA|QTY)$/i.test(s)) return false;
  if (/^[A-Z][a-z]/.test(s)) return false;
  if (/^[A-Z]{3,}$/.test(s)) return false;

  if (/^\d{1,2}[A-Z]\d{4,5}$/.test(s)) return true;
  if (/^\d{6,8}$/.test(s)) return true;
  if (/^\d{3,4}-\d{2}-\d{4,5}$/.test(s)) return true;
  if (/^[A-Z]\d{4,}$/.test(s)) return true;
  if (/^\d+[A-Z]+\d+[A-Z]*\d*$/.test(s)) return true;
  if (/^[A-Z]{2,3}\d{3,}[A-Z]*\d*$/.test(s)) return true;

  return false;
}

function parseCatalog(filePath: string): ParsedPart[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const parts: ParsedPart[] = [];
  const seen = new Set<string>();

  let currentCategory = "";
  let currentSubcategory = "";

  const skipPatterns = [
    /Costex\s*Tractor/i, /Copyright\s*©/i, /All rights reserved/i,
    /Part numbers are used for reference/i, /contact your sales/i,
    /^Part\s+No\.\s*Description/i, /^Engine\s+Part\s+Number/i,
    /^Engine\s+Part\s+No\./i, /^ENGINE\s+END\s+CENTER/i,
    /manufactured to meet/i, /will help you maximize/i,
    /^For over \d+ years/i, /^At CTP/i, /authorized distributor/i,
    /^All Part Numbers/i, /^Other part no/i,
    /^\s*Typical Applications/i, /^\s*Features:/i,
    /lubricating properties/i,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 3) continue;
    if (skipPatterns.some(p => p.test(trimmed))) continue;
    if (/^\d{1,3}$/.test(trimmed)) continue;

    const lowerTrimmed = trimmed.toLowerCase().replace(/\s+/g, " ");
    for (const [sidebar, cat] of Object.entries(SIDEBAR_TO_CATEGORY)) {
      if (lowerTrimmed === sidebar || lowerTrimmed === sidebar.replace(/ & /g, "&")) {
        currentCategory = cat;
        break;
      }
    }

    if (/^[A-Z][A-Z &\-\/,'()0-9]+$/.test(trimmed) && trimmed.length > 4 && trimmed.length < 70) {
      const cleanSub = trimmed.replace(/\(CONT\.?\)/i, "").trim();
      if (isValidSubcategory(cleanSub)) {
        let sub = cleanSub
          .replace(/\bFOR\s+KOMATSU\b/gi, "(Komatsu)")
          .replace(/\bFOR\s+JOHN\s+DEERE\b/gi, "(John Deere)");
        sub = cleanCostex(sub);
        if (sub.length > 3) {
          currentSubcategory = sub;
        }
      }
    }

    if (!currentCategory) continue;

    const singleTokens = trimmed.split(/\s+/).filter(t => t.trim().length > 0);
    const tokens = trimmed.split(/\s{2,}/).filter(t => t.trim().length > 0);

    for (const token of singleTokens) {
      const pn = token.trim();
      if (!isPartNumber(pn)) continue;
      if (seen.has(pn)) continue;

      let engine = "";
      let gasket = "";
      let equipment = "";

      if (tokens.length >= 2) {
        const pnTokenIdx = tokens.findIndex(t => t.includes(pn));
        if (pnTokenIdx >= 0) {
          if (pnTokenIdx > 0) {
            const before = tokens[pnTokenIdx - 1].trim();
            if (/^[A-Z0-9][A-Z0-9, .\-\/]+$/.test(before) && before.length < 60 && !isPartNumber(before)) {
              engine = before;
            }
          }
          for (let j = pnTokenIdx + 1; j < tokens.length; j++) {
            const after = tokens[j].trim();
            if (isPartNumber(after)) {
              if (!gasket) gasket = after;
            } else if (after.length > 3) {
              equipment += (equipment ? ", " : "") + cleanCostex(after);
            }
          }
        }
      }

      if (!equipment && i + 1 < lines.length) {
        const nextLine = lines[i + 1]?.trim();
        if (nextLine && nextLine.length > 5 && /^[A-Z0-9]/.test(nextLine)) {
          const nextTokens = nextLine.split(/\s{2,}/);
          const firstToken = nextTokens[0]?.trim();
          if (firstToken && !isPartNumber(firstToken) && !/^[A-Z][A-Z &\-]+$/.test(firstToken)) {
            equipment = cleanCostex(firstToken);
          }
        }
      }

      seen.add(pn);
      parts.push({
        partNumber: pn,
        description: cleanCostex(currentSubcategory || currentCategory),
        category: currentCategory,
        subcategory: cleanCostex(currentSubcategory),
        engineModel: cleanCostex(engine),
        gasket,
        equipment: equipment.substring(0, 500),
      });
    }
  }

  return parts;
}

console.log("Parsing catalog...");
const parts = parseCatalog("/tmp/catalog_layout.txt");
console.log(`Total parts parsed: ${parts.length}`);

const catCounts: Record<string, number> = {};
for (const p of parts) {
  catCounts[p.category] = (catCounts[p.category] || 0) + 1;
}
console.log("\nCategory counts:");
for (const [cat, count] of Object.entries(catCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${count}`);
}

const subCounts: Record<string, number> = {};
for (const p of parts) {
  const key = `${p.category} > ${p.subcategory || "(none)"}`;
  subCounts[key] = (subCounts[key] || 0) + 1;
}
console.log("\nSubcategory counts (top 40):");
Object.entries(subCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 40)
  .forEach(([k, v]) => console.log(`  ${k}: ${v}`));

console.log("\nSample parts (every ~1000th):");
for (let i = 0; i < parts.length; i += Math.max(1, Math.floor(parts.length / 15))) {
  const p = parts[i];
  console.log(`  [${p.category}/${p.subcategory}] ${p.partNumber} E:${p.engineModel?.substring(0, 30) || "-"} Eq:${p.equipment?.substring(0, 50) || "-"}`);
}

fs.writeFileSync("/tmp/parsed_parts.json", JSON.stringify(parts, null, 2));
console.log(`\nWritten to /tmp/parsed_parts.json`);
