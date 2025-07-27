import { 
  users, suppliers, vendors, products, orders, reviews, notifications,
  type User, type InsertUser, type Supplier, type InsertSupplier,
  type Vendor, type InsertVendor, type Product, type InsertProduct,
  type Order, type InsertOrder, type Review, type InsertReview,
  type Notification, type InsertNotification,
  type UserWithProfile, type OrderWithDetails, type ProductWithSupplier
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, sql, lt, gte } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<UserWithProfile | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;

  // Supplier management
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  getSupplierByUserId(userId: string): Promise<Supplier | undefined>;
  getNearbySuppliers(lat: number, lon: number, radius: number): Promise<(Supplier & { user: User })[]>;
  updateSupplierStatus(id: string, isOnline: boolean): Promise<void>;

  // Vendor management
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  getVendorByUserId(userId: string): Promise<Vendor | undefined>;

  // Product management
  createProduct(product: InsertProduct): Promise<Product>;
  getProductsBySupplier(supplierId: string): Promise<Product[]>;
  getProductsByCategory(category: string, lat?: number, lon?: number): Promise<ProductWithSupplier[]>;
  updateProductStock(id: string, stockQuantity: number): Promise<void>;
  searchProducts(query: string, lat?: number, lon?: number): Promise<ProductWithSupplier[]>;

  // Order management
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderById(id: string): Promise<OrderWithDetails | undefined>;
  getOrdersByVendor(vendorId: string): Promise<OrderWithDetails[]>;
  getOrdersBySupplier(supplierId: string): Promise<OrderWithDetails[]>;
  updateOrderStatus(id: string, status: string): Promise<void>;
  getEmergencyOrders(): Promise<OrderWithDetails[]>;

  // Review management
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByUser(userId: string): Promise<Review[]>;

  // Notification management
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;

  // Analytics
  getSupplierStats(supplierId: string): Promise<{
    totalOrders: number;
    averageRating: number;
    totalRevenue: number;
  }>;
  getVendorStats(vendorId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    favoriteSuppliers: string[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByPhone(phone: string): Promise<UserWithProfile | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .leftJoin(suppliers, eq(users.id, suppliers.userId))
      .leftJoin(vendors, eq(users.id, vendors.userId))
      .where(eq(users.phone, phone));
    
    if (!user) return undefined;

    return {
      ...user.users,
      supplier: user.suppliers || undefined,
      vendor: user.vendors || undefined,
    };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  async getSupplierByUserId(userId: string): Promise<Supplier | undefined> {
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.userId, userId));
    return supplier || undefined;
  }

  async getNearbySuppliers(lat: number, lon: number, radius: number): Promise<(Supplier & { user: User })[]> {
    // Using PostGIS-style distance calculation
    const results = await db
      .select()
      .from(suppliers)
      .innerJoin(users, eq(suppliers.userId, users.id))
      .where(
        and(
          eq(suppliers.isOnline, true),
          sql`ST_DWithin(${users.location}, ST_MakePoint(${lon}, ${lat})::geography, ${radius * 1000})`
        )
      )
      .orderBy(sql`ST_Distance(${users.location}, ST_MakePoint(${lon}, ${lat})::geography)`);

    return results.map(row => ({
      ...row.suppliers,
      user: row.users,
    }));
  }

  async updateSupplierStatus(id: string, isOnline: boolean): Promise<void> {
    await db
      .update(suppliers)
      .set({ isOnline })
      .where(eq(suppliers.id, id));
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async getVendorByUserId(userId: string): Promise<Vendor | undefined> {
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.userId, userId));
    return vendor || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async getProductsBySupplier(supplierId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.supplierId, supplierId))
      .orderBy(asc(products.name));
  }

  async getProductsByCategory(category: string, lat?: number, lon?: number): Promise<ProductWithSupplier[]> {
    let query = db
      .select()
      .from(products)
      .innerJoin(suppliers, eq(products.supplierId, suppliers.id))
      .innerJoin(users, eq(suppliers.userId, users.id))
      .where(
        and(
          eq(products.category, category),
          eq(products.isAvailable, true),
          eq(suppliers.isOnline, true)
        )
      );

    if (lat && lon) {
      query = query.orderBy(sql`ST_Distance(${users.location}, ST_MakePoint(${lon}, ${lat})::geography)`) as any;
    } else {
      query = query.orderBy(asc(products.pricePerUnit)) as any;
    }

    const results = await query;
    
    return results.map(row => ({
      ...row.products,
      supplier: {
        ...row.suppliers,
        user: row.users,
      },
    }));
  }

  async updateProductStock(id: string, stockQuantity: number): Promise<void> {
    await db
      .update(products)
      .set({ stockQuantity })
      .where(eq(products.id, id));
  }

  async searchProducts(query: string, lat?: number, lon?: number): Promise<ProductWithSupplier[]> {
    let searchQuery = db
      .select()
      .from(products)
      .innerJoin(suppliers, eq(products.supplierId, suppliers.id))
      .innerJoin(users, eq(suppliers.userId, users.id))
      .where(
        and(
          sql`${products.name} ILIKE ${`%${query}%`}`,
          eq(products.isAvailable, true),
          eq(suppliers.isOnline, true)
        )
      );

    if (lat && lon) {
      searchQuery = searchQuery.orderBy(sql`ST_Distance(${users.location}, ST_MakePoint(${lon}, ${lat})::geography)`) as any;
    } else {
      searchQuery = searchQuery.orderBy(asc(products.pricePerUnit)) as any;
    }

    const results = await searchQuery;
    
    return results.map(row => ({
      ...row.products,
      supplier: {
        ...row.suppliers,
        user: row.users,
      },
    }));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const [newOrder] = await db
      .insert(orders)
      .values({ ...order, orderNumber })
      .returning();
    return newOrder;
  }

  async getOrderById(id: string): Promise<OrderWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(orders)
      .innerJoin(vendors, eq(orders.vendorId, vendors.id))
      .innerJoin(suppliers, eq(orders.supplierId, suppliers.id))
      .innerJoin(users, eq(vendors.userId, users.id))
      .leftJoin(users as any, eq(suppliers.userId, users.id))
      .where(eq(orders.id, id));

    if (!result) return undefined;

    return {
      ...result.orders,
      vendor: {
        ...result.vendors,
        user: result.users,
      },
      supplier: {
        ...result.suppliers,
        user: result.users,
      },
    };
  }

  async getOrdersByVendor(vendorId: string): Promise<OrderWithDetails[]> {
    const results = await db
      .select()
      .from(orders)
      .innerJoin(vendors, eq(orders.vendorId, vendors.id))
      .innerJoin(suppliers, eq(orders.supplierId, suppliers.id))
      .leftJoin(users, eq(vendors.userId, users.id))
      .leftJoin(users as any, eq(suppliers.userId, users.id))
      .where(eq(orders.vendorId, vendorId))
      .orderBy(desc(orders.createdAt));

    return results.map(row => ({
      ...row.orders,
      vendor: {
        ...row.vendors,
        user: row.users,
      },
      supplier: {
        ...row.suppliers,
        user: row.users,
      },
    }));
  }

  async getOrdersBySupplier(supplierId: string): Promise<OrderWithDetails[]> {
    const results = await db
      .select()
      .from(orders)
      .innerJoin(vendors, eq(orders.vendorId, vendors.id))
      .innerJoin(suppliers, eq(orders.supplierId, suppliers.id))
      .leftJoin(users, eq(vendors.userId, users.id))
      .leftJoin(users as any, eq(suppliers.userId, users.id))
      .where(eq(orders.supplierId, supplierId))
      .orderBy(desc(orders.createdAt));

    return results.map(row => ({
      ...row.orders,
      vendor: {
        ...row.vendors,
        user: row.users,
      },
      supplier: {
        ...row.suppliers,
        user: row.users,
      },
    }));
  }

  async updateOrderStatus(id: string, status: "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled"): Promise<void> {
    await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id));
  }

  async getEmergencyOrders(): Promise<OrderWithDetails[]> {
    const results = await db
      .select()
      .from(orders)
      .innerJoin(vendors, eq(orders.vendorId, vendors.id))
      .innerJoin(suppliers, eq(orders.supplierId, suppliers.id))
      .leftJoin(users, eq(vendors.userId, users.id))
      .leftJoin(users as any, eq(suppliers.userId, users.id))
      .where(
        and(
          eq(orders.isEmergency, true),
          sql`${orders.status} IN ('pending', 'confirmed', 'preparing')`
        )
      )
      .orderBy(asc(orders.createdAt));

    return results.map(row => ({
      ...row.orders,
      vendor: {
        ...row.vendors,
        user: row.users,
      },
      supplier: {
        ...row.suppliers,
        user: row.users,
      },
    }));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.revieweeId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async getSupplierStats(supplierId: string): Promise<{
    totalOrders: number;
    averageRating: number;
    totalRevenue: number;
  }> {
    const [orderStats] = await db
      .select({
        totalOrders: count(),
        totalRevenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(eq(orders.supplierId, supplierId));

    const [ratingStats] = await db
      .select({
        averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
      })
      .from(reviews)
      .innerJoin(orders, eq(reviews.orderId, orders.id))
      .where(eq(orders.supplierId, supplierId));

    return {
      totalOrders: orderStats.totalOrders,
      totalRevenue: Number(orderStats.totalRevenue),
      averageRating: Number(ratingStats.averageRating),
    };
  }

  async getVendorStats(vendorId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    favoriteSuppliers: string[];
  }> {
    const [orderStats] = await db
      .select({
        totalOrders: count(),
        totalSpent: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(eq(orders.vendorId, vendorId));

    const favoriteSuppliers = await db
      .select({
        supplierId: orders.supplierId,
        orderCount: count(),
      })
      .from(orders)
      .where(eq(orders.vendorId, vendorId))
      .groupBy(orders.supplierId)
      .orderBy(desc(count()))
      .limit(3);

    return {
      totalOrders: orderStats.totalOrders,
      totalSpent: Number(orderStats.totalSpent),
      favoriteSuppliers: favoriteSuppliers.map(s => s.supplierId),
    };
  }
}

export const storage = new DatabaseStorage();
