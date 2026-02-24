import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, numeric, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  equipmentId: varchar("equipment_id", { length: 20 }).notNull().unique(),
  make: varchar("make", { length: 50 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year"),
  meter: integer("meter"),
  price: varchar("price", { length: 50 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 10 }),
  category: varchar("category", { length: 50 }).notNull(),
  imageUrl: text("image_url"),
});

export const parts = pgTable("parts", {
  id: serial("id").primaryKey(),
  partNumber: varchar("part_number", { length: 50 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  subcategory: varchar("subcategory", { length: 100 }),
  price: varchar("price", { length: 50 }),
  compatibility: text("compatibility"),
  engineModel: text("engine_model"),
  gasket: varchar("gasket", { length: 50 }),
  equipment: text("equipment"),
  imageUrl: text("image_url"),
});

export const quoteRequests = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id", { length: 255 }),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  shipTo: text("ship_to"),
  notes: text("notes"),
  items: text("items"),
  status: varchar("status", { length: 30 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactInquiries = pgTable("contact_inquiries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 200 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({ id: true });
export const insertPartSchema = createInsertSchema(parts).omit({ id: true });
export const insertQuoteRequestSchema = createInsertSchema(quoteRequests).omit({ id: true, createdAt: true, status: true });
export const insertContactInquirySchema = createInsertSchema(contactInquiries).omit({ id: true, createdAt: true });

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Part = typeof parts.$inferSelect;
export type InsertPart = z.infer<typeof insertPartSchema>;
export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type ContactInquiry = typeof contactInquiries.$inferSelect;
export type InsertContactInquiry = z.infer<typeof insertContactInquirySchema>;

export const projectEstimates = pgTable("project_estimates", {
  id: serial("id").primaryKey(),
  projectName: varchar("project_name", { length: 200 }).notNull(),
  projectType: varchar("project_type", { length: 100 }).notNull(),
  location: varchar("location", { length: 200 }).notNull(),
  terrain: varchar("terrain", { length: 100 }).notNull(),
  projectSize: varchar("project_size", { length: 100 }).notNull(),
  duration: varchar("duration", { length: 100 }).notNull(),
  additionalDetails: text("additional_details"),
  estimateResult: text("estimate_result").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectEstimateSchema = createInsertSchema(projectEstimates).omit({ id: true, createdAt: true });
export type ProjectEstimate = typeof projectEstimates.$inferSelect;
export type InsertProjectEstimate = z.infer<typeof insertProjectEstimateSchema>;

export const powerUnits = pgTable("power_units", {
  id: serial("id").primaryKey(),
  stockNumber: varchar("stock_number", { length: 30 }).notNull(),
  brand: varchar("brand", { length: 100 }),
  model: varchar("model", { length: 150 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  hp: integer("hp"),
  kw: integer("kw"),
  rpm: integer("rpm"),
  engineRpm: integer("engine_rpm"),
  year: varchar("year", { length: 20 }),
  condition: varchar("condition", { length: 100 }),
  hours: varchar("hours", { length: 30 }),
  tierRating: varchar("tier_rating", { length: 50 }),
  fuelType: varchar("fuel_type", { length: 50 }),
  cooling: varchar("cooling", { length: 50 }),
  enclosure: varchar("enclosure", { length: 50 }),
  volts: varchar("volts", { length: 50 }),
  stage: varchar("stage", { length: 50 }),
  sellingStage: varchar("selling_stage", { length: 50 }),
  unitType: varchar("unit_type", { length: 50 }),
  location: varchar("location", { length: 100 }),
  price: varchar("price", { length: 50 }),
  imageUrl: text("image_url"),
});

export const insertPowerUnitSchema = createInsertSchema(powerUnits).omit({ id: true });
export type PowerUnit = typeof powerUnits.$inferSelect;
export type InsertPowerUnit = z.infer<typeof insertPowerUnitSchema>;

export const customerOrders = pgTable("customer_orders", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 200 }).notNull(),
  quoteRequestId: integer("quote_request_id"),
  itemType: varchar("item_type", { length: 30 }),
  itemDescription: text("item_description"),
  total: varchar("total", { length: 50 }),
  status: varchar("status", { length: 30 }).default("processing").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customerPayments = pgTable("customer_payments", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 200 }).notNull(),
  orderId: integer("order_id"),
  amount: varchar("amount", { length: 50 }).notNull(),
  status: varchar("status", { length: 30 }).default("pending").notNull(),
  method: varchar("method", { length: 50 }),
  reference: varchar("reference", { length: 200 }),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomerOrderSchema = createInsertSchema(customerOrders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCustomerPaymentSchema = createInsertSchema(customerPayments).omit({ id: true, createdAt: true });

export type CustomerOrder = typeof customerOrders.$inferSelect;
export type InsertCustomerOrder = z.infer<typeof insertCustomerOrderSchema>;
export type CustomerPayment = typeof customerPayments.$inferSelect;
export type InsertCustomerPayment = z.infer<typeof insertCustomerPaymentSchema>;

export * from "./models/chat";
export * from "./models/auth";
