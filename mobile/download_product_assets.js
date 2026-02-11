const fs = require('fs');
const https = require('https');
const path = require('path');

const downloadImage = (url, filename) => {
    const dest = path.join(__dirname, 'assets/images', filename);
    const file = fs.createWriteStream(dest);

    const request = https.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        }
    }, (response) => {
        // Follow redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
            console.log(`Redirecting to: ${response.headers.location}`);
            downloadImage(response.headers.location, filename);
            return;
        }

        if (response.statusCode !== 200) {
            console.error(`Failed to download ${url}: Status Code ${response.statusCode}`);
            return;
        }
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            const stats = fs.statSync(dest);
            console.log(`Downloaded ${filename} - Size: ${Math.round(stats.size / 1024)}KB`);
        });
    });

    request.on('error', (err) => {
        fs.unlink(dest, () => { }); // Delete the file async
        console.error(`Error downloading ${url}: ${err.message}`);
    });
};

// Based on the user's Foodpanda link pattern and previous working URLs
// Foodpanda typically uses deliveryhero.io CDN:
// Pattern: https://images.deliveryhero.io/image/fd-pk/Products/[PRODUCT_ID].jpg

// Try multiple known good URLs for Dalda from previous carousel work
const daldaUrls = [
    "https://images.deliveryhero.io/image/fd-pk/Products/139099638.jpg", // Dalda Banaspati 4.8kg from Business 1 LHR
    "https://www.naheed.pk/media/catalog/product/d/a/dalda_banaspati_ghee_can_4.8kg_1_1.jpg", // Naheed.pk backup
];

// Try multiple URLs for Milk Pak
const milkPakUrls = [
    "https://www.naheed.pk/media/catalog/product/n/e/nestle_milkpak_milk_1000ml_1.jpg", // This worked before
    "https://images.deliveryhero.io/image/fd-pk/Products/milkpak.jpg", // Generic pattern
];

// Ensure directory exists
const dir = path.join(__dirname, 'assets/images');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

console.log("Attempting to download Dalda images...");
daldaUrls.forEach((url, index) => {
    downloadImage(url, `dalda_hero_${index}.jpg`);
});

console.log("Attempting to download Milk Pak images...");
milkPakUrls.forEach((url, index) => {
    downloadImage(url, `milkpak_hero_${index}.jpg`);
});
