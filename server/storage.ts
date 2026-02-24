import {
  type Equipment,
  type InsertEquipment,
  type Part,
  type InsertPart,
  type QuoteRequest,
  type InsertQuoteRequest,
  type ContactInquiry,
  type InsertContactInquiry,
  type ProjectEstimate,
  type InsertProjectEstimate,
  type PowerUnit,
  type InsertPowerUnit,
  type CustomerOrder,
  type InsertCustomerOrder,
  type CustomerPayment,
  type InsertCustomerPayment,
  equipment,
  parts,
  quoteRequests,
  contactInquiries,
  projectEstimates,
  powerUnits,
  customerOrders,
  customerPayments,
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, sql, desc } from "drizzle-orm";

export interface IStorage {
  getEquipment(filters?: { category?: string; search?: string; page?: number; limit?: number }): Promise<{ items: Equipment[]; total: number }>;
  getEquipmentById(equipmentId: string): Promise<Equipment | undefined>;
  createEquipment(data: InsertEquipment): Promise<Equipment>;
  getEquipmentCategoryCounts(): Promise<Record<string, number>>;

  getParts(filters?: { category?: string; subcategory?: string; search?: string; page?: number; limit?: number }): Promise<{ items: Part[]; total: number }>;
  getPartById(id: number): Promise<Part | undefined>;
  getPartsByNumbers(partNumbers: string[]): Promise<Part[]>;
  createPart(data: InsertPart): Promise<Part>;
  getPartsSubcategoryCounts(category?: string): Promise<Record<string, number>>;

  createQuoteRequest(data: InsertQuoteRequest): Promise<QuoteRequest>;
  createContactInquiry(data: InsertContactInquiry): Promise<ContactInquiry>;

  getEquipmentCount(): Promise<number>;
  getPartsCount(): Promise<number>;
  getPartsCategoryCounts(): Promise<Record<string, number>>;
  getEquipmentPriceSummary(): Promise<Record<string, { min: string; max: string; avg: string; count: number }>>;
  createProjectEstimate(data: InsertProjectEstimate): Promise<ProjectEstimate>;

  getPowerUnits(filters?: { category?: string; search?: string; page?: number; limit?: number }): Promise<{ items: PowerUnit[]; total: number }>;
  getPowerUnitById(id: number): Promise<PowerUnit | undefined>;
  createPowerUnit(data: InsertPowerUnit): Promise<PowerUnit>;
  getPowerUnitCategoryCounts(): Promise<Record<string, number>>;
  getPowerUnitsCount(): Promise<number>;

  getQuotesByEmail(email: string): Promise<QuoteRequest[]>;
  getQuotesByCustomerId(customerId: string): Promise<QuoteRequest[]>;
  getOrdersByCustomerId(customerId: string): Promise<CustomerOrder[]>;
  getPaymentsByCustomerId(customerId: string): Promise<CustomerPayment[]>;
  getContactInquiriesByEmail(email: string): Promise<ContactInquiry[]>;
}

export class DatabaseStorage implements IStorage {
  async getEquipment(filters?: { category?: string; search?: string; page?: number; limit?: number }): Promise<{ items: Equipment[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 24;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters?.category) {
      conditions.push(eq(equipment.category, filters.category));
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(equipment.make, searchTerm),
          ilike(equipment.model, searchTerm),
          ilike(equipment.equipmentId, searchTerm),
          ilike(equipment.city, searchTerm),
          ilike(equipment.state, searchTerm),
          sql`CONCAT(${equipment.make}, ' ', ${equipment.model}) ILIKE ${searchTerm}`,
        )!
      );
    }

    let whereClause: any = undefined;
    if (conditions.length > 0) {
      let combined = conditions[0]!;
      for (let i = 1; i < conditions.length; i++) {
        combined = sql`${combined} AND ${conditions[i]}`;
      }
      whereClause = combined;
    }

    const countQuery = db.select({ count: sql<number>`count(*)` }).from(equipment);
    if (whereClause) {
      countQuery.where(whereClause);
    }
    const [countResult] = await countQuery;
    const total = Number(countResult.count);

    let itemsQuery = db.select().from(equipment);
    if (whereClause) {
      itemsQuery = itemsQuery.where(whereClause) as any;
    }
    const items = await (itemsQuery as any).limit(limit).offset(offset);

    return { items, total };
  }

  async getEquipmentCategoryCounts(): Promise<Record<string, number>> {
    const results = await db
      .select({
        category: equipment.category,
        count: sql<number>`count(*)`,
      })
      .from(equipment)
      .groupBy(equipment.category);

    const counts: Record<string, number> = {};
    for (const row of results) {
      counts[row.category] = Number(row.count);
    }
    return counts;
  }

  async getEquipmentById(equipmentId: string): Promise<Equipment | undefined> {
    const [item] = await db.select().from(equipment).where(eq(equipment.equipmentId, equipmentId));
    return item;
  }

  async createEquipment(data: InsertEquipment): Promise<Equipment> {
    const [item] = await db.insert(equipment).values(data).returning();
    return item;
  }

  async getParts(filters?: { category?: string; subcategory?: string; search?: string; page?: number; limit?: number }): Promise<{ items: Part[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters?.category) {
      conditions.push(eq(parts.category, filters.category));
    }

    if (filters?.subcategory) {
      conditions.push(eq(parts.subcategory, filters.subcategory));
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(parts.partNumber, searchTerm),
          ilike(parts.description, searchTerm),
          ilike(parts.equipment, searchTerm),
          ilike(parts.engineModel, searchTerm),
        )!
      );
    }

    let whereClause: any = undefined;
    if (conditions.length > 0) {
      let combined = conditions[0]!;
      for (let i = 1; i < conditions.length; i++) {
        combined = sql`${combined} AND ${conditions[i]}`;
      }
      whereClause = combined;
    }

    const countQuery = db.select({ count: sql<number>`count(*)` }).from(parts);
    if (whereClause) {
      countQuery.where(whereClause);
    }
    const [countResult] = await countQuery;
    const total = Number(countResult.count);

    let itemsQuery = db.select().from(parts);
    if (whereClause) {
      itemsQuery = itemsQuery.where(whereClause) as any;
    }
    const items = await (itemsQuery as any).limit(limit).offset(offset);

    return { items, total };
  }

  async getPartById(id: number): Promise<Part | undefined> {
    const [item] = await db.select().from(parts).where(eq(parts.id, id));
    return item;
  }

  async getPartsByNumbers(partNumbers: string[]): Promise<Part[]> {
    if (partNumbers.length === 0) return [];
    return db.select().from(parts).where(sql`${parts.partNumber} = ANY(${partNumbers})`);
  }

  async createPart(data: InsertPart): Promise<Part> {
    const [item] = await db.insert(parts).values(data).returning();
    return item;
  }

  async getPartsSubcategoryCounts(category?: string): Promise<Record<string, number>> {
    let query = db
      .select({
        subcategory: parts.subcategory,
        count: sql<number>`count(*)`,
      })
      .from(parts)
      .groupBy(parts.subcategory);

    if (category) {
      query = query.where(eq(parts.category, category)) as any;
    }

    const results = await query;
    const counts: Record<string, number> = {};
    for (const row of results) {
      counts[row.subcategory || "Other"] = Number(row.count);
    }
    return counts;
  }

  async createQuoteRequest(data: InsertQuoteRequest): Promise<QuoteRequest> {
    const [item] = await db.insert(quoteRequests).values(data).returning();
    return item;
  }

  async createContactInquiry(data: InsertContactInquiry): Promise<ContactInquiry> {
    const [item] = await db.insert(contactInquiries).values(data).returning();
    return item;
  }

  async getEquipmentCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(equipment);
    return Number(result.count);
  }

  async getPartsCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(parts);
    return Number(result.count);
  }

  async getPartsCategoryCounts(): Promise<Record<string, number>> {
    const results = await db
      .select({
        category: parts.category,
        count: sql<number>`count(*)`,
      })
      .from(parts)
      .groupBy(parts.category);

    const counts: Record<string, number> = {};
    for (const row of results) {
      counts[row.category] = Number(row.count);
    }
    return counts;
  }

  async getEquipmentPriceSummary(): Promise<Record<string, { min: string; max: string; avg: string; count: number }>> {
    const results = await db
      .select({
        category: equipment.category,
        minPrice: sql<string>`MIN(REGEXP_REPLACE(price, '[^0-9.]', '', 'g')::numeric)`,
        maxPrice: sql<string>`MAX(REGEXP_REPLACE(price, '[^0-9.]', '', 'g')::numeric)`,
        avgPrice: sql<string>`ROUND(AVG(REGEXP_REPLACE(price, '[^0-9.]', '', 'g')::numeric))`,
        count: sql<number>`count(*)`,
      })
      .from(equipment)
      .where(sql`price IS NOT NULL AND price != '' AND REGEXP_REPLACE(price, '[^0-9.]', '', 'g') != ''`)
      .groupBy(equipment.category);

    const summary: Record<string, { min: string; max: string; avg: string; count: number }> = {};
    for (const row of results) {
      summary[row.category] = {
        min: `$${Number(row.minPrice).toLocaleString()}`,
        max: `$${Number(row.maxPrice).toLocaleString()}`,
        avg: `$${Number(row.avgPrice).toLocaleString()}`,
        count: Number(row.count),
      };
    }
    return summary;
  }

  async createProjectEstimate(data: InsertProjectEstimate): Promise<ProjectEstimate> {
    const [item] = await db.insert(projectEstimates).values(data).returning();
    return item;
  }

  async getPowerUnits(filters?: { category?: string; search?: string; page?: number; limit?: number }): Promise<{ items: PowerUnit[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 24;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters?.category) {
      conditions.push(eq(powerUnits.category, filters.category));
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(powerUnits.model, searchTerm),
          ilike(powerUnits.stockNumber, searchTerm),
          ilike(powerUnits.condition, searchTerm),
          ilike(powerUnits.brand, searchTerm),
          ilike(powerUnits.fuelType, searchTerm),
          ilike(powerUnits.unitType, searchTerm),
        )!
      );
    }

    let whereClause: any = undefined;
    if (conditions.length > 0) {
      let combined = conditions[0]!;
      for (let i = 1; i < conditions.length; i++) {
        combined = sql`${combined} AND ${conditions[i]}`;
      }
      whereClause = combined;
    }

    const countQuery = db.select({ count: sql<number>`count(*)` }).from(powerUnits);
    if (whereClause) countQuery.where(whereClause);
    const [countResult] = await countQuery;
    const total = Number(countResult.count);

    let itemsQuery = db.select().from(powerUnits);
    if (whereClause) itemsQuery = itemsQuery.where(whereClause) as any;
    const items = await (itemsQuery as any).limit(limit).offset(offset);

    return { items, total };
  }

  async getPowerUnitById(id: number): Promise<PowerUnit | undefined> {
    const [item] = await db.select().from(powerUnits).where(eq(powerUnits.id, id));
    return item;
  }

  async createPowerUnit(data: InsertPowerUnit): Promise<PowerUnit> {
    const [item] = await db.insert(powerUnits).values(data).returning();
    return item;
  }

  async getPowerUnitCategoryCounts(): Promise<Record<string, number>> {
    const results = await db
      .select({
        category: powerUnits.category,
        count: sql<number>`count(*)`,
      })
      .from(powerUnits)
      .groupBy(powerUnits.category);

    const counts: Record<string, number> = {};
    for (const row of results) {
      counts[row.category] = Number(row.count);
    }
    return counts;
  }

  async getPowerUnitsCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(powerUnits);
    return Number(result.count);
  }

  async getQuotesByEmail(email: string): Promise<QuoteRequest[]> {
    return db.select().from(quoteRequests).where(eq(quoteRequests.email, email)).orderBy(desc(quoteRequests.createdAt));
  }

  async getQuotesByCustomerId(customerId: string): Promise<QuoteRequest[]> {
    return db.select().from(quoteRequests).where(eq(quoteRequests.customerId, customerId)).orderBy(desc(quoteRequests.createdAt));
  }

  async getOrdersByCustomerId(customerId: string): Promise<CustomerOrder[]> {
    return db.select().from(customerOrders).where(eq(customerOrders.customerId, customerId)).orderBy(desc(customerOrders.createdAt));
  }

  async getPaymentsByCustomerId(customerId: string): Promise<CustomerPayment[]> {
    return db.select().from(customerPayments).where(eq(customerPayments.customerId, customerId)).orderBy(desc(customerPayments.createdAt));
  }

  async getContactInquiriesByEmail(email: string): Promise<ContactInquiry[]> {
    return db.select().from(contactInquiries).where(eq(contactInquiries.email, email)).orderBy(desc(contactInquiries.createdAt));
  }
}

export const storage = new DatabaseStorage();
