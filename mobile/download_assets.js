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
        if (response.statusCode !== 200) {
            console.error(`Failed to download ${url}: Status Code ${response.statusCode}`);
            return;
        }
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${filename}`);
        });
    });

    request.on('error', (err) => {
        fs.unlink(dest, () => { }); // Delete the file async
        console.error(`Error downloading ${url}: ${err.message}`);
    });
};

// URLs
// Trying Naheed URL for Dalda
const daldaUrl = "https://www.naheed.pk/media/catalog/product/d/a/dalda_cooking_oil_5_litre_tin.jpg";
const milkPakUrl = "https://www.naheed.pk/media/catalog/product/n/e/nestle_milkpak_milk_1000ml_1.jpg";

// Ensure directory exists
const dir = path.join(__dirname, 'assets/images');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

downloadImage(daldaUrl, 'dalda-real.jpg');
downloadImage(milkPakUrl, 'milkpak-real.jpg');
