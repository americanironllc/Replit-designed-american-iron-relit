import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuoteRequestSchema, insertContactInquirySchema } from "@shared/schema";
import { isAuthenticated } from "./replit_integrations/auth";
import OpenAI from "openai";
import { z } from "zod";
import { Resend } from "resend";
import PDFDocument from "pdfkit";
import * as fs from "fs";
import * as path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const estimateRequestSchema = z.object({
  projectName: z.string().min(1).max(200),
  projectType: z.string().min(1).max(100),
  location: z.string().min(1).max(200),
  terrain: z.string().min(1).max(100),
  projectSize: z.string().min(1).max(100),
  duration: z.string().min(1).max(100),
  additionalDetails: z.string().max(2000).optional().nullable(),
});

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/equipment", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 24;
      const result = await storage.getEquipment({ category, search, page, limit });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch equipment" });
    }
  });

  app.get("/api/equipment/categories/counts", async (req, res) => {
    try {
      const counts = await storage.getEquipmentCategoryCounts();
      res.json(counts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category counts" });
    }
  });

  app.get("/api/equipment/:id", async (req, res) => {
    try {
      const item = await storage.getEquipmentById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Equipment not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch equipment" });
    }
  });

  app.get("/api/parts/categories/counts", async (req, res) => {
    try {
      const counts = await storage.getPartsCategoryCounts();
      res.json(counts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch parts category counts" });
    }
  });

  app.get("/api/parts", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const subcategory = req.query.subcategory as string | undefined;
      const search = req.query.search as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const result = await storage.getParts({ category, subcategory, search, page, limit });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch parts" });
    }
  });

  app.get("/api/parts/subcategories/counts", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const counts = await storage.getPartsSubcategoryCounts(category);
      res.json(counts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subcategory counts" });
    }
  });

  app.get("/api/parts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid part ID" });
      const item = await storage.getPartById(id);
      if (!item) return res.status(404).json({ error: "Part not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch part" });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      const data = insertQuoteRequestSchema.parse(req.body);
      const customerId = (req as any).user?.claims?.sub || null;
      const item = await storage.createQuoteRequest({ ...data, customerId });

      const businessHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
    <tr>
      <td style="background:#000000;padding:24px 32px;">
        <h1 style="margin:0;color:#FFCD11;font-size:22px;font-weight:bold;">AMERICAN IRON LLC</h1>
        <p style="margin:4px 0 0;color:#cccccc;font-size:13px;">New Quote Request Received</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <h2 style="margin:0 0 16px;color:#000;font-size:18px;">Parts Quote Request</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;">
          <tr><td style="padding:12px 16px;background:#f9f9f9;border-bottom:1px solid #eee;"><span style="color:#888;font-size:13px;display:inline-block;width:100px;">Name</span><span style="color:#000;font-size:14px;font-weight:600;">${escHtml(data.name)}</span></td></tr>
          <tr><td style="padding:12px 16px;border-bottom:1px solid #eee;"><span style="color:#888;font-size:13px;display:inline-block;width:100px;">Email</span><a href="mailto:${data.email}" style="color:#FFCD11;font-size:14px;font-weight:600;text-decoration:none;">${escHtml(data.email)}</a></td></tr>
          ${data.phone ? `<tr><td style="padding:12px 16px;background:#f9f9f9;border-bottom:1px solid #eee;"><span style="color:#888;font-size:13px;display:inline-block;width:100px;">Phone</span><span style="color:#000;font-size:14px;font-weight:600;">${escHtml(data.phone)}</span></td></tr>` : ""}
          ${data.shipTo ? `<tr><td style="padding:12px 16px;border-bottom:1px solid #eee;"><span style="color:#888;font-size:13px;display:inline-block;width:100px;">Ship To</span><span style="color:#000;font-size:14px;font-weight:600;">${escHtml(data.shipTo)}</span></td></tr>` : ""}
          ${data.items ? `<tr><td style="padding:16px;background:#f9f9f9;border-bottom:1px solid #eee;"><span style="color:#888;font-size:13px;display:block;margin-bottom:8px;">Parts Requested</span><p style="margin:0;color:#000;font-size:14px;line-height:1.5;font-family:monospace;white-space:pre-wrap;">${escHtml(data.items)}</p></td></tr>` : ""}
          ${data.notes ? `<tr><td style="padding:16px;"><span style="color:#888;font-size:13px;display:block;margin-bottom:8px;">Notes</span><p style="margin:0;color:#000;font-size:14px;line-height:1.5;white-space:pre-wrap;">${escHtml(data.notes)}</p></td></tr>` : ""}
        </table>
        <p style="margin:24px 0 0;color:#888;font-size:12px;">Submitted on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        <p style="margin:12px 0 0;"><a href="mailto:${data.email}?subject=RE: Your Parts Quote Request — American Iron LLC" style="display:inline-block;background:#FFCD11;color:#000;padding:10px 24px;text-decoration:none;border-radius:4px;font-weight:bold;font-size:14px;">Reply to ${escHtml(data.name)}</a></p>
      </td>
    </tr>
    <tr>
      <td style="background:#f4f4f4;padding:16px 32px;text-align:center;">
        <p style="margin:0;color:#999;font-size:11px;">American Iron LLC — Tampa, Florida | +1 (850) 777-3797</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const confirmHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
    <tr>
      <td style="background:#000000;padding:24px 32px;">
        <h1 style="margin:0;color:#FFCD11;font-size:22px;font-weight:bold;">AMERICAN IRON LLC</h1>
        <p style="margin:4px 0 0;color:#cccccc;font-size:13px;">Heavy Equipment & Industrial Parts</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <h2 style="margin:0 0 8px;color:#000;font-size:18px;">Quote Request Received</h2>
        <p style="margin:0 0 20px;color:#666;font-size:14px;line-height:1.5;">Thank you, ${escHtml(data.name)}. We've received your parts quote request and will respond within one business day with pricing and availability.</p>
        ${data.items ? `<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;"><tr><td style="padding:16px;background:#f9f9f9;"><span style="color:#888;font-size:13px;display:block;margin-bottom:8px;">Parts Requested</span><p style="margin:0;color:#000;font-size:14px;line-height:1.5;font-family:monospace;white-space:pre-wrap;">${escHtml(data.items)}</p></td></tr></table>` : ""}
        <p style="margin:24px 0 0;color:#666;font-size:13px;">Need immediate assistance?</p>
        <p style="margin:8px 0 0;color:#000;font-size:13px;">Phone: +1 (850) 777-3797</p>
        <p style="margin:4px 0 0;color:#000;font-size:13px;">WhatsApp: +1 (813) 200-6088</p>
        <p style="margin:16px 0 0;"><a href="https://www.americanironus.com/parts" style="display:inline-block;background:#FFCD11;color:#000;padding:10px 24px;text-decoration:none;border-radius:4px;font-weight:bold;font-size:14px;">Browse Parts Catalog</a></p>
      </td>
    </tr>
    <tr>
      <td style="background:#f4f4f4;padding:16px 32px;text-align:center;">
        <p style="margin:0;color:#999;font-size:11px;">American Iron LLC — Tampa, Florida | +1 (850) 777-3797</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

      try {
        await Promise.all([
          resend.emails.send({
            from: "American Iron LLC <onboarding@resend.dev>",
            to: "info@americanironus.com",
            subject: `New Parts Quote Request from ${escHtml(data.name)}`,
            html: businessHtml,
            replyTo: data.email,
          }),
          resend.emails.send({
            from: "American Iron LLC <onboarding@resend.dev>",
            to: data.email,
            subject: "Quote Request Received — American Iron LLC",
            html: confirmHtml,
          }),
        ]);
        console.log("Quote request emails sent for:", data.name, data.email);
      } catch (emailErr) {
        console.error("Quote request email send error (non-blocking):", emailErr);
      }

      res.status(201).json(item);
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({ error: "Validation error", details: error.issues });
      }
      res.status(500).json({ error: "Failed to create quote request" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const data = insertContactInquirySchema.parse(req.body);
      const item = await storage.createContactInquiry(data);

      const businessHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
    <tr>
      <td style="background:#000000;padding:24px 32px;">
        <h1 style="margin:0;color:#FFCD11;font-size:22px;font-weight:bold;">AMERICAN IRON LLC</h1>
        <p style="margin:4px 0 0;color:#cccccc;font-size:13px;">New Contact Form Submission</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <h2 style="margin:0 0 16px;color:#000;font-size:18px;">New Inquiry Received</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;">
          <tr><td style="padding:12px 16px;background:#f9f9f9;border-bottom:1px solid #eee;"><span style="color:#888;font-size:13px;display:inline-block;width:100px;">Name</span><span style="color:#000;font-size:14px;font-weight:600;">${escHtml(data.name)}</span></td></tr>
          <tr><td style="padding:12px 16px;border-bottom:1px solid #eee;"><span style="color:#888;font-size:13px;display:inline-block;width:100px;">Email</span><a href="mailto:${data.email}" style="color:#FFCD11;font-size:14px;font-weight:600;text-decoration:none;">${escHtml(data.email)}</a></td></tr>
          <tr><td style="padding:16px;background:#f9f9f9;"><span style="color:#888;font-size:13px;display:block;margin-bottom:8px;">Message</span><p style="margin:0;color:#000;font-size:14px;line-height:1.5;white-space:pre-wrap;">${escHtml(data.message)}</p></td></tr>
        </table>
        <p style="margin:24px 0 0;color:#888;font-size:12px;">Submitted on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        <p style="margin:12px 0 0;"><a href="mailto:${data.email}?subject=RE: Your Inquiry — American Iron LLC" style="display:inline-block;background:#FFCD11;color:#000;padding:10px 24px;text-decoration:none;border-radius:4px;font-weight:bold;font-size:14px;">Reply to ${escHtml(data.name)}</a></p>
      </td>
    </tr>
    <tr>
      <td style="background:#f4f4f4;padding:16px 32px;text-align:center;">
        <p style="margin:0;color:#999;font-size:11px;">American Iron LLC — Tampa, Florida | +1 (850) 777-3797</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const confirmHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
    <tr>
      <td style="background:#000000;padding:24px 32px;">
        <h1 style="margin:0;color:#FFCD11;font-size:22px;font-weight:bold;">AMERICAN IRON LLC</h1>
        <p style="margin:4px 0 0;color:#cccccc;font-size:13px;">Heavy Equipment & Industrial Parts</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <h2 style="margin:0 0 8px;color:#000;font-size:18px;">Thank You, ${escHtml(data.name)}</h2>
        <p style="margin:0 0 20px;color:#666;font-size:14px;line-height:1.5;">We've received your inquiry and a specialist will respond within one business day.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;">
          <tr><td style="padding:16px;background:#f9f9f9;"><span style="color:#888;font-size:13px;display:block;margin-bottom:8px;">Your Message</span><p style="margin:0;color:#000;font-size:14px;line-height:1.5;white-space:pre-wrap;">${escHtml(data.message)}</p></td></tr>
        </table>
        <p style="margin:24px 0 0;color:#666;font-size:13px;">In the meantime, you can reach us directly:</p>
        <p style="margin:8px 0 0;color:#000;font-size:13px;">Phone: +1 (850) 777-3797</p>
        <p style="margin:4px 0 0;color:#000;font-size:13px;">WhatsApp: +1 (813) 200-6088</p>
        <p style="margin:16px 0 0;"><a href="https://www.americanironus.com" style="display:inline-block;background:#FFCD11;color:#000;padding:10px 24px;text-decoration:none;border-radius:4px;font-weight:bold;font-size:14px;">Browse Our Inventory</a></p>
      </td>
    </tr>
    <tr>
      <td style="background:#f4f4f4;padding:16px 32px;text-align:center;">
        <p style="margin:0;color:#999;font-size:11px;">American Iron LLC — Tampa, Florida | +1 (850) 777-3797</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

      try {
        await Promise.all([
          resend.emails.send({
            from: "American Iron LLC <onboarding@resend.dev>",
            to: "info@americanironus.com",
            subject: `New Contact Inquiry from ${escHtml(data.name)}`,
            html: businessHtml,
            replyTo: data.email,
          }),
          resend.emails.send({
            from: "American Iron LLC <onboarding@resend.dev>",
            to: data.email,
            subject: "We've Received Your Inquiry — American Iron LLC",
            html: confirmHtml,
          }),
        ]);
        console.log("Contact emails sent for:", data.name, data.email);
      } catch (emailErr) {
        console.error("Contact email send error (non-blocking):", emailErr);
      }

      res.status(201).json(item);
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({ error: "Validation error", details: error.issues });
      }
      res.status(500).json({ error: "Failed to create contact inquiry" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const equipmentCount = await storage.getEquipmentCount();
      const partsCount = await storage.getPartsCount();
      const powerUnitsCount = await storage.getPowerUnitsCount();
      res.json({ equipmentCount, partsCount, powerUnitsCount });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/power-units", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 24;
      const result = await storage.getPowerUnits({ category, search, page, limit });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch power units" });
    }
  });

  app.get("/api/power-units/categories/counts", async (req, res) => {
    try {
      const counts = await storage.getPowerUnitCategoryCounts();
      res.json(counts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch power unit category counts" });
    }
  });

  app.get("/api/power-units/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid power unit ID" });
      const item = await storage.getPowerUnitById(id);
      if (!item) return res.status(404).json({ error: "Power unit not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch power unit" });
    }
  });

  app.post("/api/estimate", async (req, res) => {
    try {
      const parsed = estimateRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation error", details: parsed.error.issues });
      }
      const { projectName, projectType, location, terrain, projectSize, duration, additionalDetails } = parsed.data;

      const categoryCounts = await storage.getEquipmentCategoryCounts();
      const equipmentSummary = await storage.getEquipmentPriceSummary();
      const partsCategoryCounts = await storage.getPartsCategoryCounts();

      const inventoryContext = `
AMERICAN IRON LLC INVENTORY DATA:
Equipment Categories & Counts: ${JSON.stringify(categoryCounts)}
Equipment Price Ranges by Category: ${JSON.stringify(equipmentSummary)}
Parts Categories & Counts: ${JSON.stringify(partsCategoryCounts)}
Total Equipment Items: ${Object.values(categoryCounts).reduce((a: number, b: number) => a + b, 0)}
Total Parts Items: ${Object.values(partsCategoryCounts).reduce((a: number, b: number) => a + b, 0)}
`;

      const systemPrompt = `You are the IRON Estimator — an institutional-grade construction equipment estimation tool for American Iron LLC, a leading heavy equipment and parts company based in Tampa, Florida. You provide comprehensive, thorough, and professional project equipment estimates.

${inventoryContext}

You must generate a detailed, institutional-quality estimate that includes:

1. **Primary Equipment Requirements**: List each piece of heavy equipment needed with specific make/model recommendations from our inventory categories (Excavators, Bulldozers, Wheel Loaders, Articulated Trucks, Motor Graders, Compactors, Scrapers, Track Dozers, Backhoes, Skidsteers, Telehandlers, etc.), quantities needed, and estimated costs based on our pricing.

2. **Supporting Equipment**: Forklifts, telehandlers, skidsteers, compactors, and other support machinery needed.

3. **Power Generation**: Generators and power units required for the project scope and location.

4. **Transportation & Logistics**: Estimated transport costs for equipment mobilization/demobilization based on the project location relative to our Tampa, FL headquarters.

5. **Maintenance & Parts Budget**: Estimated maintenance costs and replacement parts budget based on project duration, including filters, hydraulic components, undercarriage parts, engine components, etc. from our 12,200+ parts catalog.

6. **Personnel Considerations**: Estimated operator and maintenance crew requirements.

7. **Cost Summary**: 
   - Equipment Purchase/Rental Costs
   - Transportation Costs
   - Maintenance & Parts Reserve
   - Support Equipment Costs
   - Total Estimated Project Equipment Budget

Format your response as a structured, professional report with clear sections, bullet points, and cost breakdowns. Use real pricing ranges based on the inventory data provided. Be specific with equipment models and quantities. Consider the terrain type, project size, duration, and location when making recommendations.

Always provide cost ranges (low-mid-high) to give the client flexibility in budgeting. Include a note that actual pricing may vary and encourage the visitor to request a formal quote through American Iron LLC for exact pricing.`;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate a comprehensive construction project equipment estimate for the following project:

**Project Name:** ${projectName}
**Project Type:** ${projectType}
**Location:** ${location}
**Terrain Type:** ${terrain}
**Project Size/Scale:** ${projectSize}
**Estimated Duration:** ${duration}
${additionalDetails ? `**Additional Details:** ${additionalDetails}` : ""}

Provide a thorough, institutional-grade estimate with specific equipment recommendations, quantities, cost breakdowns, and a comprehensive budget summary.`,
          },
        ],
        stream: true,
        max_completion_tokens: 8192,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      await storage.createProjectEstimate({
        projectName,
        projectType,
        location,
        terrain,
        projectSize,
        duration,
        additionalDetails: additionalDetails || null,
        estimateResult: fullResponse,
      });

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error generating estimate:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to generate estimate" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to generate estimate" });
      }
    }
  });

  const quoteEmailSchema = z.object({
    email: z.string().email(),
    itemType: z.enum(["equipment", "power-unit"]),
    itemId: z.string(),
    quoteNumber: z.string(),
    quoteDate: z.string(),
  });

  app.post("/api/quotes/send-email", async (req, res) => {
    try {
      const parsed = quoteEmailSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation error", details: parsed.error.issues });
      }

      const { email, itemType, itemId, quoteNumber, quoteDate } = parsed.data;

      let itemTitle = "";
      let itemIdentifier = "";
      let itemCategory = "";
      let itemPrice = "Call for Price";
      let specs: { label: string; value: string }[] = [];

      if (itemType === "equipment") {
        const item = await storage.getEquipmentById(itemId);
        if (!item) return res.status(404).json({ error: "Equipment not found" });
        itemTitle = `${item.make} ${item.model}`;
        itemIdentifier = `ID: ${item.equipmentId}`;
        itemCategory = item.category;
        itemPrice = item.price && item.price !== "CALL" ? item.price : "Call for Price";
        specs = [
          { label: "Make", value: item.make },
          { label: "Model", value: item.model },
          { label: "Year", value: item.year?.toString() || "N/A" },
          { label: "Hours", value: item.meter ? `${item.meter.toLocaleString()} hrs` : "N/A" },
          { label: "Location", value: [item.city, item.state].filter(Boolean).join(", ") || "Tampa, FL" },
        ];
      } else {
        const id = parseInt(itemId);
        if (isNaN(id)) return res.status(400).json({ error: "Invalid power unit ID" });
        const item = await storage.getPowerUnitById(id);
        if (!item) return res.status(404).json({ error: "Power unit not found" });
        itemTitle = item.model;
        itemIdentifier = `SN: ${item.stockNumber}`;
        itemCategory = item.category;
        itemPrice = item.price ? `$${Number(item.price).toLocaleString()}` : "Call for Price";
        specs = [
          { label: "Model", value: item.model },
          { label: "Stock Number", value: item.stockNumber },
          { label: "Category", value: item.category },
          ...(item.hp ? [{ label: "Horsepower", value: `${item.hp} HP` }] : []),
          ...(item.kw ? [{ label: "Kilowatts", value: `${item.kw} kW` }] : []),
          ...(item.rpm ? [{ label: "RPM", value: `${item.rpm}` }] : []),
          ...(item.year ? [{ label: "Year", value: item.year }] : []),
          ...(item.condition ? [{ label: "Condition", value: item.condition }] : []),
          ...(item.location ? [{ label: "Location", value: item.location }] : []),
        ];
      }

      const dateObj = new Date(quoteDate);
      const validTo = new Date(dateObj);
      validTo.setDate(validTo.getDate() + 30);
      const formatDate = (d: Date) =>
        d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

      const logoPath = path.resolve(process.cwd(), "client", "public", "images", "american-iron-logo.png");

      const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
        const doc = new PDFDocument({ size: "LETTER", margin: 50 });
        const chunks: Buffer[] = [];
        doc.on("data", (chunk: Buffer) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        doc.rect(0, 0, doc.page.width, 90).fill("#1a1a1a");
        doc.rect(0, 86, doc.page.width, 4).fill("#FFCD11");

        try {
          if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 40, 8, { height: 72 });
          } else {
            doc.fontSize(22).fill("#FFCD11").text("AMERICAN IRON LLC", 50, 25);
            doc.fontSize(10).fill("#999999").text("Heavy Equipment & Industrial Parts", 50, 55);
          }
        } catch (e) {
          doc.fontSize(22).fill("#FFCD11").text("AMERICAN IRON LLC", 50, 25);
          doc.fontSize(10).fill("#999999").text("Heavy Equipment & Industrial Parts", 50, 55);
        }

        doc.fontSize(10).fill("#CCCCCC").text("+1 (850) 777-3797", 350, 25, { align: "right", width: 210 });
        doc.fill("#CCCCCC").text("info@americanironus.com", 350, 40, { align: "right", width: 210 });
        doc.fill("#CCCCCC").text("Tampa, FL 33618, USA", 350, 55, { align: "right", width: 210 });

        doc.moveDown(2);
        doc.y = 110;
        doc.fontSize(18).fill("#000000").text("QUOTATION", 50);
        doc.fontSize(10).fill("#666666").text(`Quote #: ${quoteNumber}`, 400, 110, { align: "right", width: 160 });
        doc.text(`Date: ${formatDate(dateObj)}`, 400, 125, { align: "right", width: 160 });
        doc.text(`Valid Until: ${formatDate(validTo)}`, 400, 140, { align: "right", width: 160 });

        doc.moveTo(50, 165).lineTo(562, 165).stroke("#CCCCCC");

        doc.y = 180;
        doc.fontSize(14).fill("#000000").text(itemTitle, 50);
        doc.fontSize(10).fill("#666666").text(`${itemIdentifier} | ${itemCategory}`, 50);

        doc.moveTo(50, doc.y + 10).lineTo(562, doc.y + 10).stroke("#CCCCCC");
        doc.y += 25;

        doc.fontSize(12).fill("#000000").text("SPECIFICATIONS", 50);
        doc.moveDown(0.5);

        specs.forEach((spec, i) => {
          const y = doc.y;
          if (i % 2 === 0) {
            doc.rect(50, y - 2, 512, 20).fill("#F5F5F5");
          }
          doc.fontSize(10).fill("#666666").text(spec.label, 60, y + 2, { width: 150 });
          doc.fill("#000000").text(spec.value, 220, y + 2, { width: 300 });
          doc.y = y + 22;
        });

        doc.moveDown(1);
        doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke("#CCCCCC");
        doc.moveDown(0.5);

        doc.fontSize(12).fill("#000000").text("PRICING", 50);
        doc.moveDown(0.5);

        const tableTop = doc.y;
        doc.rect(50, tableTop, 512, 22).fill("#000000");
        doc.fontSize(10).fill("#FFFFFF").text("Item", 60, tableTop + 6, { width: 250 });
        doc.text("Qty", 320, tableTop + 6, { width: 60, align: "center" });
        doc.text("Unit Price", 400, tableTop + 6, { width: 152, align: "right" });

        const row1Top = tableTop + 24;
        doc.rect(50, row1Top, 512, 24).fill("#FFFFFF");
        doc.fontSize(10).fill("#000000").text(itemTitle, 60, row1Top + 6, { width: 250 });
        doc.text("1", 320, row1Top + 6, { width: 60, align: "center" });
        doc.text(itemPrice, 400, row1Top + 6, { width: 152, align: "right" });

        const totalTop = row1Top + 26;
        doc.rect(50, totalTop, 512, 26).fill("#000000");
        doc.fontSize(11).fill("#FFFFFF").text("Total", 60, totalTop + 7, { width: 300, align: "right" });
        doc.fill("#FFCD11").text(itemPrice, 400, totalTop + 7, { width: 152, align: "right" });

        doc.y = totalTop + 50;
        doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke("#CCCCCC");
        doc.moveDown(0.5);

        doc.fontSize(11).fill("#000000").text("TERMS & CONDITIONS", 50);
        doc.moveDown(0.3);
        const terms = [
          "1. This quotation is valid for 30 days from the date of issue.",
          "2. Prices are quoted in USD and are subject to change without notice after the validity period.",
          "3. Shipping, freight, and handling charges are not included unless otherwise stated.",
          "4. Payment terms: Wire transfer or certified check.",
          "5. Equipment is sold as-is, where-is unless otherwise specified.",
          "6. American Iron LLC reserves the right to modify or withdraw this quotation prior to acceptance.",
        ];
        terms.forEach((term) => {
          doc.fontSize(8).fill("#666666").text(term, 50, doc.y, { width: 512 });
          doc.moveDown(0.2);
        });

        doc.moveDown(1);
        doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke("#CCCCCC");
        doc.moveDown(0.5);
        doc.fontSize(9).fill("#888888").text("American Iron LLC — Tampa, Florida", 50, doc.y, { align: "center", width: 512 });
        doc.text("Phone: +1 (850) 777-3797 | Email: info@americanironus.com | Web: www.americanironus.com", { align: "center", width: 512 });

        doc.end();
      });

      const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
    <tr>
      <td style="background:#000000;padding:24px 32px;">
        <h1 style="margin:0;color:#FFCD11;font-size:22px;font-weight:bold;">AMERICAN IRON LLC</h1>
        <p style="margin:4px 0 0;color:#cccccc;font-size:13px;">Heavy Equipment & Industrial Parts</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <h2 style="margin:0 0 8px;color:#000;font-size:20px;">Your Equipment Quote</h2>
        <p style="margin:0 0 24px;color:#666;font-size:14px;">Quote #${quoteNumber} | ${formatDate(dateObj)}</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;">
          <tr>
            <td style="background:#f9f9f9;padding:16px;">
              <p style="margin:0 0 4px;font-size:11px;color:#FFCD11;font-weight:bold;text-transform:uppercase;">${itemCategory}</p>
              <h3 style="margin:0 0 4px;color:#000;font-size:16px;">${itemTitle}</h3>
              <p style="margin:0;color:#888;font-size:13px;">${itemIdentifier}</p>
            </td>
          </tr>
          ${specs.map((s, i) => `
          <tr>
            <td style="padding:10px 16px;border-top:1px solid #eee;background:${i % 2 === 0 ? "#ffffff" : "#fafafa"};">
              <span style="color:#888;font-size:13px;display:inline-block;width:140px;">${s.label}</span>
              <span style="color:#000;font-size:13px;font-weight:600;">${s.value}</span>
            </td>
          </tr>`).join("")}
          <tr>
            <td style="background:#000;padding:14px 16px;">
              <span style="color:#fff;font-size:14px;font-weight:bold;">Total: </span>
              <span style="color:#FFCD11;font-size:16px;font-weight:bold;">${itemPrice}</span>
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;color:#888;font-size:12px;">This quote is valid for 30 days. Shipping charges not included. Please reply to this email or call +1 (850) 777-3797 to proceed.</p>
        <p style="margin:16px 0 0;">
          <a href="https://www.americanironus.com" style="display:inline-block;background:#FFCD11;color:#000;padding:10px 24px;text-decoration:none;border-radius:4px;font-weight:bold;font-size:14px;">Visit Our Website</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="background:#f4f4f4;padding:20px 32px;text-align:center;">
        <p style="margin:0;color:#999;font-size:11px;">American Iron LLC — Tampa, Florida</p>
        <p style="margin:4px 0 0;color:#999;font-size:11px;">+1 (850) 777-3797 | info@americanironus.com</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const { data: emailResult, error: emailError } = await resend.emails.send({
        from: "American Iron LLC <onboarding@resend.dev>",
        to: email,
        subject: `Quote ${quoteNumber} — ${itemTitle} | American Iron LLC`,
        html: htmlBody,
        attachments: [
          {
            filename: `American_Iron_Quote_${quoteNumber}.pdf`,
            content: pdfBuffer,
          },
        ],
      });

      if (emailError) {
        console.error("Resend error:", emailError);
        return res.status(500).json({ error: "Failed to send email", details: emailError.message });
      }

      console.log("Quote email sent:", emailResult?.id, "to:", email);
      res.json({ success: true, emailId: emailResult?.id });
    } catch (error: any) {
      console.error("Quote email error:", error);
      res.status(500).json({ error: "Failed to send quote email" });
    }
  });

  // UPS Rating API
  const upsRateSchema = z.object({
    originCity: z.string().min(1),
    originState: z.string().min(1).max(5),
    originPostal: z.string().min(1),
    originCountry: z.string().length(2).default("US"),
    destCity: z.string().min(1),
    destState: z.string().max(5).optional().default(""),
    destPostal: z.string().min(1),
    destCountry: z.string().length(2).default("US"),
    weightLbs: z.number().positive().max(150),
    lengthIn: z.number().positive().max(108),
    widthIn: z.number().positive().max(108),
    heightIn: z.number().positive().max(108),
  });

  let upsAccessToken: string | null = null;
  let upsTokenExpiry = 0;

  async function getUPSToken(): Promise<string> {
    if (upsAccessToken && Date.now() < upsTokenExpiry) {
      return upsAccessToken;
    }
    const clientId = process.env.UPS_CLIENT_ID;
    const clientSecret = process.env.UPS_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("UPS credentials not configured");
    }
    const resp = await fetch("https://onlinetools.ups.com/security/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: "grant_type=client_credentials",
    });
    if (!resp.ok) {
      const errText = await resp.text();
      console.error("UPS OAuth error:", resp.status, errText);
      throw new Error(`UPS authentication failed: ${resp.status}`);
    }
    const data = await resp.json() as any;
    upsAccessToken = data.access_token;
    upsTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return upsAccessToken!;
  }

  app.post("/api/shipping/ups-rates", async (req, res) => {
    try {
      const parsed = upsRateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation error", details: parsed.error.issues });
      }
      const d = parsed.data;
      const accountNumber = process.env.UPS_ACCOUNT_NUMBER;
      if (!accountNumber) {
        return res.status(500).json({ error: "UPS account not configured" });
      }

      const token = await getUPSToken();

      const payload = {
        RateRequest: {
          Request: {
            SubVersion: "2205",
            TransactionReference: { CustomerContext: "Rate Request" },
          },
          Shipment: {
            Shipper: {
              ShipperNumber: accountNumber,
              Address: {
                City: d.originCity,
                StateProvinceCode: d.originState,
                PostalCode: d.originPostal,
                CountryCode: d.originCountry,
              },
            },
            ShipTo: {
              Address: {
                City: d.destCity,
                StateProvinceCode: d.destState,
                PostalCode: d.destPostal,
                CountryCode: d.destCountry,
              },
            },
            ShipFrom: {
              Address: {
                City: d.originCity,
                StateProvinceCode: d.originState,
                PostalCode: d.originPostal,
                CountryCode: d.originCountry,
              },
            },
            Package: {
              PackagingType: { Code: "02" },
              Dimensions: {
                UnitOfMeasurement: { Code: "IN" },
                Length: String(d.lengthIn),
                Width: String(d.widthIn),
                Height: String(d.heightIn),
              },
              PackageWeight: {
                UnitOfMeasurement: { Code: "LBS" },
                Weight: String(d.weightLbs),
              },
            },
          },
        },
      };

      const upsResp = await fetch("https://onlinetools.ups.com/api/rating/v2403/Shop", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          transId: `ami-${Date.now()}`,
          transactionSrc: "AmericanIronLLC",
        },
        body: JSON.stringify(payload),
      });

      if (!upsResp.ok) {
        const errBody = await upsResp.text();
        console.error("UPS Rating error:", upsResp.status, errBody);
        return res.status(502).json({ error: "Unable to retrieve UPS rates. Please verify the addresses and try again." });
      }

      const upsData = await upsResp.json() as any;
      const ratedShipments = upsData?.RateResponse?.RatedShipment || [];

      const serviceNames: Record<string, string> = {
        "01": "UPS Next Day Air",
        "02": "UPS 2nd Day Air",
        "03": "UPS Ground",
        "07": "UPS Worldwide Express",
        "08": "UPS Worldwide Expedited",
        "11": "UPS Standard",
        "12": "UPS 3 Day Select",
        "13": "UPS Next Day Air Saver",
        "14": "UPS Next Day Air Early",
        "54": "UPS Worldwide Express Plus",
        "59": "UPS 2nd Day Air A.M.",
        "65": "UPS Worldwide Saver",
        "82": "UPS Today Standard",
        "83": "UPS Today Dedicated Courier",
        "84": "UPS Today Intercity",
        "85": "UPS Today Express",
        "86": "UPS Today Express Saver",
        "96": "UPS Worldwide Express Freight",
      };

      const rates = ratedShipments.map((rs: any) => {
        const serviceCode = rs.Service?.Code || "";
        return {
          serviceCode,
          serviceName: serviceNames[serviceCode] || `UPS Service ${serviceCode}`,
          totalCharges: rs.TotalCharges?.MonetaryValue || "0",
          currency: rs.TotalCharges?.CurrencyCode || "USD",
          guaranteedDays: rs.GuaranteedDelivery?.BusinessDaysInTransit || null,
          deliveryByTime: rs.GuaranteedDelivery?.DeliveryByTime || null,
          billingWeight: rs.BillingWeight?.Weight || null,
          billingWeightUnit: rs.BillingWeight?.UnitOfMeasurement?.Code || "LBS",
        };
      });

      rates.sort((a: any, b: any) => parseFloat(a.totalCharges) - parseFloat(b.totalCharges));

      res.json({ rates, origin: `${d.originCity}, ${d.originState} ${d.originPostal}`, destination: `${d.destCity}, ${d.destState || ""} ${d.destPostal} ${d.destCountry}` });
    } catch (error: any) {
      console.error("UPS rate error:", error);
      res.status(500).json({ error: "Failed to fetch UPS rates", message: error.message });
    }
  });

  app.get("/api/portal/profile", isAuthenticated, async (req: any, res) => {
    try {
      const claims = req.user?.claims;
      if (!claims?.email) {
        return res.status(400).json({ error: "No email associated with account" });
      }
      const quotes = await storage.getQuotesByEmail(claims.email);
      const orders = await storage.getOrdersByCustomerId(claims.sub);
      const payments = await storage.getPaymentsByCustomerId(claims.sub);
      const inquiries = await storage.getContactInquiriesByEmail(claims.email);
      res.json({
        user: {
          id: claims.sub,
          email: claims.email,
          firstName: claims.first_name,
          lastName: claims.last_name,
          profileImageUrl: claims.profile_image_url,
        },
        counts: {
          quotes: quotes.length,
          orders: orders.length,
          payments: payments.length,
          inquiries: inquiries.length,
        },
      });
    } catch (error) {
      console.error("Portal profile error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.get("/api/portal/quotes", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user?.claims?.sub;
      const email = req.user?.claims?.email;
      let quotes: any[] = [];
      if (customerId) {
        quotes = await storage.getQuotesByCustomerId(customerId);
      }
      if (quotes.length === 0 && email) {
        quotes = await storage.getQuotesByEmail(email);
      }
      res.json(quotes);
    } catch (error) {
      console.error("Portal quotes error:", error);
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });

  app.get("/api/portal/orders", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user?.claims?.sub;
      if (!customerId) return res.status(401).json({ error: "Unauthorized" });
      const orders = await storage.getOrdersByCustomerId(customerId);
      res.json(orders);
    } catch (error) {
      console.error("Portal orders error:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/portal/payments", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user?.claims?.sub;
      if (!customerId) return res.status(401).json({ error: "Unauthorized" });
      const payments = await storage.getPaymentsByCustomerId(customerId);
      res.json(payments);
    } catch (error) {
      console.error("Portal payments error:", error);
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.get("/api/portal/inquiries", isAuthenticated, async (req: any, res) => {
    try {
      const email = req.user?.claims?.email;
      if (!email) return res.status(400).json({ error: "No email associated with account" });
      const inquiries = await storage.getContactInquiriesByEmail(email);
      res.json(inquiries);
    } catch (error) {
      console.error("Portal inquiries error:", error);
      res.status(500).json({ error: "Failed to fetch inquiries" });
    }
  });

  return httpServer;
}
