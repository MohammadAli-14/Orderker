import { ENV } from "../config/env.js";

export async function getAppConfig(req, res) {
    try {
        const config = {
            minimum_version: "1.0.0",
            latest_version: "1.0.0",
            force_update: false,
            maintenance: false,
            maintenance_message: "We are currently updating our systems. Please check back later.",
            update_url: "https://orderker.com/update",
            banners: [
                {
                    id: "welcome-2025",
                    image: "https://res.cloudinary.com/dz6c9ocg7/image/upload/v1706622301/banners/welcome.png",
                    action: "shop"
                }
            ],
            features: {
                enable_reviews: true,
                enable_wishlist: true,
                enable_jazzcash: true,
                enable_easypaisa: true
            }
        };

        res.status(200).json(config);
    } catch (error) {
        console.error("Error fetching app config:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
