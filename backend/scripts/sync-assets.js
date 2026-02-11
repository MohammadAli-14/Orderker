import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import fs from "node:fs";

// Standard modules
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to resolve project paths
const resolvePath = (relPath) => resolve(__dirname, relPath);

// Import project config and products using absolute file URLs to force resolution
const CONFIG_URL = new URL("../src/config/cloudinary.js", import.meta.url).toString();
const PRODUCTS_URL = new URL("../src/seeds/products.js", import.meta.url).toString();

const cloudinaryMod = await import(CONFIG_URL);
const productsMod = await import(PRODUCTS_URL);

const cloudinary = cloudinaryMod.default;
const products = productsMod.products;

const CACHE_DIR = resolvePath("../cache");
const MAP_FILE = resolvePath("../src/seeds/media-map.json");

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Load existing map if any
let mediaMap = {};
if (fs.existsSync(MAP_FILE)) {
    mediaMap = JSON.parse(fs.readFileSync(MAP_FILE, "utf-8"));
}

const downloadImage = async (url, filename) => {
    const filePath = join(CACHE_DIR, filename);
    const writer = fs.createWriteStream(filePath);

    const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
};

const syncAssets = async () => {
    console.log("🚀 Starting Asset Synchronization to Cloudinary...");

    let syncedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
        if (!product.images || product.images.length === 0) continue;

        const originalUrl = product.images[0];

        // Skip if already in map and still valid
        if (mediaMap[product.name] && mediaMap[product.name].originalUrl === originalUrl) {
            console.log(`⏩ Skipping "${product.name}" - Already synced.`);
            skippedCount++;
            continue;
        }

        // Skip non-external URLs (e.g. data: or localhost)
        if (!originalUrl.startsWith("http") || originalUrl.includes("localhost") || originalUrl.includes("127.0.0.1")) {
            continue;
        }

        try {
            console.log(`📦 Processing "${product.name}"...`);

            // 1. Generate local filename
            const urlParts = originalUrl.split("?")[0].split(".");
            const ext = urlParts.length > 1 ? urlParts.pop() : "jpg";
            const safeName = product.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
            const localFilename = `${safeName}.${ext}`;

            // 2. Download
            await downloadImage(originalUrl, localFilename);
            const localPath = join(CACHE_DIR, localFilename);

            // 3. Upload to Cloudinary
            console.log(`   ⬆️ Uploading to Cloudinary...`);
            const result = await cloudinary.uploader.upload(localPath, {
                folder: "orderker_products",
                public_id: safeName,
                overwrite: true,
            });

            // 4. Update map
            mediaMap[product.name] = {
                originalUrl: originalUrl,
                cloudinaryUrl: result.secure_url,
                syncedAt: new Date().toISOString()
            };

            console.log(`   ✅ Synced: ${result.secure_url}`);
            syncedCount++;

            // Clean up local cache
            fs.unlinkSync(localPath);

        } catch (error) {
            console.error(`   ❌ Failed to sync "${product.name}":`, error.message);
        }
    }

    // Save map
    fs.writeFileSync(MAP_FILE, JSON.stringify(mediaMap, null, 2));

    console.log("\n✨ Sync Completed!");
    console.log(`✅ Synced: ${syncedCount}`);
    console.log(`⏩ Skipped: ${skippedCount}`);
    console.log(`📄 Map saved to: ${MAP_FILE}`);
};

syncAssets().catch(err => {
    console.error("💥 Fatal Error:", err);
    process.exit(1);
});
