import { FlashSale } from "../models/flashSale.model.js";

// Simple in-memory cache to avoid DB hits on every request
let saleCache = {
    data: null,
    expiresAt: 0
};

const CACHE_DURATION_MS = 30 * 1000; // 30 seconds

/**
 * Applies active flash sale logic to one or more products.
 * If a sale is active, it overrides the isFlashSale flag and potentially the discountPercent.
 * @param {Object|Array} products - Mongoose document(s) or plain object(s)
 * @returns {Object|Array} - Processed product(s)
 */
export const applyFlashSaleLogic = async (products) => {
    try {
        const now = new Date();
        let activeSale;

        // Check cache (whether data is present or null)
        if (saleCache.expiresAt > now.getTime()) {
            activeSale = saleCache.data;
        } else {
            // Fetch from DB
            activeSale = await FlashSale.findOne({
                startTime: { $lte: now },
                endTime: { $gte: now },
                status: "ACTIVE"
            });

            // Update cache
            saleCache = {
                data: activeSale,
                expiresAt: now.getTime() + CACHE_DURATION_MS
            };
        }

        const isArray = Array.isArray(products);
        const productList = isArray ? products : [products];

        const processedProducts = productList.map(product => {
            // Convert to plain object if it's a Mongoose document
            const productObj = product.toObject ? product.toObject() : { ...product };

            // Check if product is in the active sale
            const isInActiveSale = activeSale && activeSale.products.some(p => p.toString() === productObj._id.toString());

            if (isInActiveSale) {
                productObj.isFlashSale = true;
                if (activeSale.discountType === "GLOBAL") {
                    productObj.discountPercent = activeSale.globalDiscountPercent;
                }
                // If INDIVIDUAL, it keeps the discountPercent it already has on the product model
            } else {
                // Not in active sale -> force false
                productObj.isFlashSale = false;
            }
            return productObj;
        });

        return isArray ? processedProducts : processedProducts[0];
    } catch (error) {
        console.error("Error applying flash sale logic:", error);
        return products; // Return original if error
    }
};
