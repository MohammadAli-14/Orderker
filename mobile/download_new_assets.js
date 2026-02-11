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

// URLs from search results
// Milkpak: VHV (New source, appears to be full carton)
const milkPakUrl = "https://www.vhv.rs/dpng/d/426-4268486_transparent-milk-carton-png-nestle-full-cream-milk.png";

// Dalda: PNGKey (Likely fine, but re-downloading to be safe/keep script simple)
const daldaUrl = "https://www.pngkey.com/png/detail/421-4217596_cooking-oil-png-download-dalda-cooking-oil-bottle.png";


// Ensure directory exists
const dir = path.join(__dirname, 'assets/images');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

downloadImage(daldaUrl, 'dalda_hero.png');
downloadImage(milkPakUrl, 'milkpak_hero.png');
