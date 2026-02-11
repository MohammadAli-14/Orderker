import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import fs from "fs";
import path from "path";
import { ENV } from "../config/env.js";
import { products } from "./products.js";

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(ENV.DB_URL);
    console.log("✅ Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("🗑️  Cleared existing products");

    // Load media map if it exists
    const MAP_FILE = path.join(process.cwd(), "src/seeds/media-map.json");
    let mediaMap = {};
    if (fs.existsSync(MAP_FILE)) {
      mediaMap = JSON.parse(fs.readFileSync(MAP_FILE, "utf-8"));
      console.log("📄 Loaded media map for permanent assets");
    }

    // Apply permanent URLs from map
    const finalProducts = products.map((product) => {
      if (mediaMap[product.name]) {
        return {
          ...product,
          images: [mediaMap[product.name].cloudinaryUrl],
        };
      }
      return product;
    });

    // Insert seed products
    await Product.insertMany(finalProducts);
    console.log(`✅ Successfully seeded ${finalProducts.length} products`);

    // Display summary
    const categories = [...new Set(products.map((p) => p.category))];
    console.log("\n📊 Seeded Products Summary:");
    console.log(`Total Products: ${products.length}`);
    console.log(`Categories: ${categories.join(", ")}`);

    // Close connection
    await mongoose.connection.close();
    console.log("\n✅ Database seeding completed and connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
