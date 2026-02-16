import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";

/**
 * GET /api/public/stats
 * Returns aggregate-only stats for the public landing page.
 * No auth required. No sensitive data exposed.
 */
export const getPublicStats = async (req, res) => {
    try {
        const [totalOrders, activeProducts, totalCustomers, revenueResult] =
            await Promise.all([
                Order.countDocuments(),
                Product.countDocuments(),
                User.countDocuments(),
                Order.aggregate([
                    { $match: { status: { $ne: "cancelled" } } },
                    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
                ]),
            ]);

        const totalRevenue = revenueResult[0]?.total || 0;

        res.json({
            totalOrders,
            activeProducts,
            totalCustomers,
            totalRevenue,
        });
    } catch (error) {
        console.error("Public stats error:", error);
        res.status(500).json({ message: "Failed to fetch stats" });
    }
};
