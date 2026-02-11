const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { v2: cloudinary } = require("cloudinary");
const dotenv = require("dotenv");

console.log("🚀 Starting Asset Synchronization (Isolated Mode)...");

// Load env
dotenv.config();

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Paths for Windows - relative to current script's parent
const BACKEND_DIR = path.resolve(__dirname, "..");
const MAP_FILE = path.join(BACKEND_DIR, "src", "seeds", "media-map.json");
const CACHE_DIR = path.join(BACKEND_DIR, "cache");

console.log(`📂 Backend Dir: ${BACKEND_DIR}`);
console.log(`📂 Cache Dir: ${CACHE_DIR}`);
console.log(`📄 Map File: ${MAP_FILE}`);

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
    console.log("📁 Creating cache directory...");
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Full product list with SECURE static-01.daraz.pk URLs (https://static-01.daraz.pk/...)
const products = [
    {
        name: "Dalda Cooking Oil (1L Pouch)",
        images: ["https://static-01.daraz.pk/p/6d07d1a29339e120f2b604e768e7af55.jpg"],
    },
    {
        name: "Nestle Milk Pak (1 Liter)",
        images: ["https://static-01.daraz.pk/p/83e8cb1178374a3957159963144a9bab.jpg"],
    },
    {
        name: "Olper's Milk (1.5 Liter)",
        images: ["https://static-01.daraz.pk/p/721db29134ccce900ff4054e9492dfec.jpg"],
    },
    {
        name: "Cheeni (Sugar)",
        images: ["https://static-01.daraz.pk/p/0e19d1e96cc90266bf2ff5c1ba88133f.jpg"],
    },
    {
        name: "Daal Chana",
        images: ["https://static-01.daraz.pk/p/86d66f2814d9eae2ea0d671628957c1b.jpg"],
    },
    {
        name: "Shan Biryani Masala (50g)",
        images: ["https://static-01.daraz.pk/p/63984962b46e3e539ca070ea9d08454b.jpg"],
    },
    {
        name: "National Mixed Pickle (900g)",
        images: ["https://static-01.daraz.pk/p/9990e45bbcd9130925ce3c22bd85cd8b.jpg"],
    },
    {
        name: "Dhania Powder (Coriander)",
        images: ["https://static-01.daraz.pk/p/a65a13dd8d684f0b43cd72d0f68dd3e4.png"],
    },
    {
        name: "Zeera (Cumin Seeds)",
        images: ["https://static-01.daraz.pk/p/c2a872b999cef1dec34e005983f76eac.png"],
    }
];

let mediaMap = {};
if (fs.existsSync(MAP_FILE)) {
    mediaMap = JSON.parse(fs.readFileSync(MAP_FILE, "utf-8"));
}

async function downloadImage(url, filename) {
    const filePath = path.join(CACHE_DIR, filename);
    console.log(`   ⬇️ Downloading: ${url}`);
    const writer = fs.createWriteStream(filePath);
    const response = await axios({ url, method: "GET", responseType: "stream", headers: { 'User-Agent': 'Mozilla/5.0' } });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
}

async function sync() {
    let synced = 0;
    let skipped = 0;

    for (const product of products) {
        if (!product.images || !product.images[0]) continue;
        const url = product.images[0];

        // Skip if already synced THE SAME URL
        if (mediaMap[product.name] && mediaMap[product.name].originalUrl === url) {
            console.log(`⏩ Skipping ${product.name}`);
            skipped++;
            continue;
        }

        try {
            console.log(`📦 Processing ${product.name}...`);
            const ext = url.split("?")[0].split(".").pop() || "jpg";
            const safeName = product.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
            const localName = `${safeName}.${ext}`;
            const localPath = path.join(CACHE_DIR, localName);

            await downloadImage(url, localName);

            console.log(`   ⬆️ Uploading to Cloudinary...`);
            const result = await cloudinary.uploader.upload(localPath, {
                folder: "orderker_products",
                public_id: safeName,
                overwrite: true,
            });

            mediaMap[product.name] = {
                originalUrl: url,
                cloudinaryUrl: result.secure_url,
                syncedAt: new Date().toISOString()
            };

            console.log(`   ✅ Synced: ${result.secure_url}`);
            synced++;
            if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        } catch (err) {
            console.error(`   ❌ Failed ${product.name}: ${err.message}`);
        }
    }

    // Final write
    fs.writeFileSync(MAP_FILE, JSON.stringify(mediaMap, null, 2));
    console.log(`\n✨ Done! Synced: ${synced}, Skipped: ${skipped}`);
}

sync();
