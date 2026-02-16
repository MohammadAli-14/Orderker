import express from "express";
import path from "path";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import cors from "cors";
import compression from "compression";

import { functions, inngest } from "./config/inngest.js";

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.route.js";
import orderRoutes from "./routes/order.route.js";
import reviewRoutes from "./routes/review.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import paymentRoutes from "./routes/payment.route.js";

import uploadRoutes from "./routes/upload.route.js";
import configRoutes from "./routes/config.route.js";
import publicRoutes from "./routes/public.route.js";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// special handling: Stripe webhook needs raw body BEFORE any body parsing middleware
// apply raw body parser conditionally only to webhook endpoint
app.use(
  "/api/payment",
  (req, res, next) => {
    if (req.originalUrl === "/api/payment/webhook") {
      express.raw({ type: "application/json" })(req, res, next);
    } else {
      express.json()(req, res, next); // parse json for non-webhook routes
    }
  },
  paymentRoutes
);

app.use(express.json());
app.use(clerkMiddleware()); // adds auth object under the req => req.auth

// Dynamic CORS configuration: Permissive for dev/mobile testing, Restrictive for production
const corsOptions = {
  origin: (origin, callback) => {
    // In development or if the request has no origin (like mobile/Postman), allow it
    if (ENV.NODE_ENV !== "production" || !origin) {
      callback(null, true);
    } else {
      // In production, split comma-separated whitelist and check
      const whitelist = [ENV.CLIENT_URL];
      if (whitelist.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(compression());

// App Version Check Middleware
app.use((req, res, next) => {
  const clientVersion = req.get("X-App-Version");
  if (clientVersion) {
    // Logic for version tracking can go here
    console.log(`Request from App Version: ${clientVersion}`);
  }
  next();
});

app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/public", publicRoutes);
app.use("/api/config", configRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Success" });
});

// make our app ready for deployment
// Serve static files from the admin/dist folder (relative to src)
app.use(express.static(path.join(__dirname, "../../admin/dist")));

// Catch-all route to serve index.html for any frontend route
// We use a regular function here to exclude /api routes more reliably
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "../../admin", "dist", "index.html"));
});

// For any unmatched /api routes, return a 404 JSON
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

const startServer = async () => {
  await connectDB();
  const PORT = ENV.PORT || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is up and running on 0.0.0.0:${PORT}`);
  });
};

startServer();
