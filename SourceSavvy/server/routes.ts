import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertSupplierSchema, insertVendorSchema, insertProductSchema, insertOrderSchema, insertReviewSchema } from "@shared/schema";
import { getSmartRecommendations, analyzeQuality, generatePriceNegotiation } from "./services/openai";
import { z } from "zod";

function handleError(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Create profile based on user type
      if (userData.userType === "supplier" && req.body.supplierData) {
        const supplierData = insertSupplierSchema.parse({
          ...req.body.supplierData,
          userId: user.id,
        });
        await storage.createSupplier(supplierData);
      } else if (userData.userType === "vendor" && req.body.vendorData) {
        const vendorData = insertVendorSchema.parse({
          ...req.body.vendorData,
          userId: user.id,
        });
        await storage.createVendor(vendorData);
      }

      res.json({ user });
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phone } = req.body;
      const user = await storage.getUserByPhone(phone);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ user });
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.params.id, updates);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  // Supplier routes
  app.get("/api/suppliers/nearby", async (req, res) => {
    try {
      const { lat, lon, radius = 5 } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      const suppliers = await storage.getNearbySuppliers(
        parseFloat(lat as string),
        parseFloat(lon as string),
        parseInt(radius as string)
      );

      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.patch("/api/suppliers/:id/status", async (req, res) => {
    try {
      const { isOnline } = req.body;
      await storage.updateSupplierStatus(req.params.id, isOnline);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  app.get("/api/suppliers/:id/stats", async (req, res) => {
    try {
      const stats = await storage.getSupplierStats(req.params.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Vendor routes
  app.get("/api/vendors/:id/stats", async (req, res) => {
    try {
      const stats = await storage.getVendorStats(req.params.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Product routes
  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  app.get("/api/products/search", async (req, res) => {
    try {
      const { query: searchQuery, lat, lon } = req.query;
      const products = await storage.searchProducts(
        searchQuery as string,
        lat ? parseFloat(lat as string) : undefined,
        lon ? parseFloat(lon as string) : undefined
      );
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const { stockQuantity } = req.body;
      await storage.updateProductStock(req.params.id, stockQuantity);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  // Order routes
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  app.get("/api/orders/vendor/:vendorId", async (req, res) => {
    try {
      const orders = await storage.getOrdersByVendor(req.params.vendorId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.get("/api/orders/supplier/:supplierId", async (req, res) => {
    try {
      const orders = await storage.getOrdersBySupplier(req.params.supplierId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      await storage.updateOrderStatus(req.params.id, status);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const orders = await storage.getOrdersByVendor(req.params.id);
      res.json(orders[0] || null);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Review routes
  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  app.get("/api/reviews/supplier/:supplierId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByUser(req.params.supplierId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Notification routes
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.params.userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  // AI-powered features
  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { vendorId, category, location, urgency } = req.body;
      const recommendations = await getSmartRecommendations(vendorId, category, location, urgency);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.post("/api/ai/quality-check", async (req, res) => {
    try {
      const { image, productType } = req.body;
      const analysis = await analyzeQuality(image, productType);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.post("/api/ai/price-negotiation", async (req, res) => {
    try {
      const { currentPrice, targetPrice, context } = req.body;
      const suggestion = await generatePriceNegotiation("", currentPrice, targetPrice, context);
      res.json(suggestion);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}