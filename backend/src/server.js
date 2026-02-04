import express from "express";
import path from "path";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import cors from "cors";

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
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true })); // credentials: true allows the browser to send the cookies to the server with the request

app.use("/api/inngest", serve({ client: inngest, functions }));

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
// Note: Express 5 requires a Regex or named parameter for wildcards
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../../admin", "dist", "index.html"));
});

// For any unmatched /api routes, return a 404 JSON
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

const startServer = async () => {
  await connectDB();
  app.listen(ENV.PORT, () => {
    console.log("Server is up and running");
  });
};

startServer();
