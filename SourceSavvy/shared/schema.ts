import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, point } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  name: text("name").notNull(),
  userType: text("user_type", { enum: ["vendor", "supplier"] }).notNull(),
  location: point("location"),
  address: text("address"),
  isVerified: boolean("is_verified").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessName: text("business_name").notNull(),
  businessType: text("business_type"),
  deliveryRadius: integer("delivery_radius").default(5), // in km
  minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }).default("0"),
  isOnline: boolean("is_online").default(false),
  avgDeliveryTime: integer("avg_delivery_time").default(30), // in minutes
});

export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  stallName: text("stall_name").notNull(),
  foodType: text("food_type"),
  dailyBudget: decimal("daily_budget", { precision: 10, scale: 2 }),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").references(() => suppliers.id).notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  unit: text("unit").notNull(),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(),
  minQuantity: integer("min_quantity").default(1),
  stockQuantity: integer("stock_quantity").default(0),
  isAvailable: boolean("is_available").default(true),
  qualityGrade: text("quality_grade"),
  expiryDate: timestamp("expiry_date"),
  imageUrl: text("image_url"),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendors.id).notNull(),
  supplierId: varchar("supplier_id").references(() => suppliers.id).notNull(),
  orderNumber: text("order_number").notNull().unique(),
  items: jsonb("items").notNull(), // Array of order items
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status", { 
    enum: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"] 
  }).default("pending"),
  isEmergency: boolean("is_emergency").default(false),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryLocation: point("delivery_location"),
  estimatedDeliveryTime: timestamp("estimated_delivery_time"),
  actualDeliveryTime: timestamp("actual_delivery_time"),
  voiceNotes: jsonb("voice_notes"), // Array of voice note URLs
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  reviewerId: varchar("reviewer_id").references(() => users.id).notNull(),
  revieweeId: varchar("reviewee_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  qualityRating: integer("quality_rating"),
  deliveryRating: integer("delivery_rating"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type", { enum: ["order", "delivery", "promotion", "emergency"] }).notNull(),
  isRead: boolean("is_read").default(false),
  data: jsonb("data"), // Additional notification data
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  supplier: one(suppliers, { fields: [users.id], references: [suppliers.userId] }),
  vendor: one(vendors, { fields: [users.id], references: [vendors.userId] }),
  sentReviews: many(reviews, { relationName: "reviewer" }),
  receivedReviews: many(reviews, { relationName: "reviewee" }),
  notifications: many(notifications),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  user: one(users, { fields: [suppliers.userId], references: [users.id] }),
  products: many(products),
  orders: many(orders),
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  user: one(users, { fields: [vendors.userId], references: [users.id] }),
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ one }) => ({
  supplier: one(suppliers, { fields: [products.supplierId], references: [suppliers.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  vendor: one(vendors, { fields: [orders.vendorId], references: [vendors.id] }),
  supplier: one(suppliers, { fields: [orders.supplierId], references: [suppliers.id] }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  order: one(orders, { fields: [reviews.orderId], references: [orders.id] }),
  reviewer: one(users, { fields: [reviews.reviewerId], references: [users.id], relationName: "reviewer" }),
  reviewee: one(users, { fields: [reviews.revieweeId], references: [users.id], relationName: "reviewee" }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Extended types for API responses
export type UserWithProfile = User & {
  supplier?: Supplier;
  vendor?: Vendor;
};

export type OrderWithDetails = Order & {
  vendor: Vendor & { user: User };
  supplier: Supplier & { user: User };
};

export type ProductWithSupplier = Product & {
  supplier: Supplier & { user: User };
};
