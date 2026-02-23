import { ENV } from "../config/env.js";
import { FlashSale } from "../models/flashSale.model.js";

export async function getAppConfig(req, res) {
    try {
        const now = new Date();
        const activeSale = await FlashSale.findOne({
            startTime: { $lte: now },
            endTime: { $gte: now },
            status: "ACTIVE"
        });

        let flashSaleData;

        if (activeSale) {
            flashSaleData = {
                active: true,
                status: "ACTIVE",
                endTime: activeSale.endTime,
                title: activeSale.title,
                bannerImage: activeSale.bannerImage,
                products: activeSale.products
            };
        } else {
            // Check for upcoming sale (Starts within 24 hours)
            const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const upcomingSale = await FlashSale.findOne({
                startTime: { $gt: now, $lte: next24Hours },
                status: "SCHEDULED"
            }).sort({ startTime: 1 });

            if (upcomingSale) {
                flashSaleData = {
                    active: false,
                    status: "SCHEDULED",
                    startTime: upcomingSale.startTime,
                    title: upcomingSale.title || "Flash Sale Coming Soon",
                    bannerImage: upcomingSale.bannerImage,
                    products: upcomingSale.products
                };
            } else {
                flashSaleData = { active: false, status: "NONE" };
            }
        }

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
            flashSale: flashSaleData,
            features: {
                enable_reviews: true,
                enable_wishlist: true,
                enable_jazzcash: true,
                enable_easypaisa: true,
                whatsapp_bot_number: ENV.WHATSAPP_BOT_NUMBER
            }
        };

        res.status(200).json(config);
    } catch (error) {
        console.error("Error fetching app config:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
