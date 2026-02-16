import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";
import { User } from "../models/user.model.js";

/**
 * GET /api/admin/analytics
 * Returns all RFM analytics data in a single response.
 */
export const getAnalytics = async (req, res) => {
    try {
        const now = new Date();

        const [
            productFlow,
            customerRFM,
            ratingDistribution,
            monthlyRevenue,
            totalCustomers,
        ] = await Promise.all([
            // 1. Product Flow: sold qty, remaining stock, revenue, rating
            getProductFlow(),
            // 2. Customer RFM: recency, frequency, monetary per customer
            getCustomerRFM(now),
            // 3. Rating distribution: count per star (1-5)
            getRatingDistribution(),
            // 4. Monthly revenue trend (last 12 months)
            getMonthlyRevenue(),
            // 5. Total customer count
            User.countDocuments({ role: "user" }),
        ]);

        // Compute core KPIs more reliably
        const totalRevenue = customerRFM.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
        const totalOrders = customerRFM.reduce((sum, c) => sum + (c.orderCount || 0), 0);
        const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

        // Compute repeat purchase stats from customerRFM
        const repeatBuyers = customerRFM.filter((c) => c._id && c.orderCount > 1).length;
        const oneTimeBuyers = customerRFM.filter((c) => c._id && c.orderCount === 1).length;
        const totalBuyers = repeatBuyers + oneTimeBuyers;
        const repeatRate = totalBuyers > 0 ? Math.round((repeatBuyers / totalBuyers) * 100) : 0;

        // Compute average rating from ratingDistribution
        const allRatings = ratingDistribution.reduce((sum, r) => sum + r.count, 0);
        const weightedSum = ratingDistribution.reduce((sum, r) => sum + r._id * r.count, 0);
        const avgRating = allRatings > 0 ? (weightedSum / allRatings).toFixed(1) : "0.0";

        // RFM Segments
        const segments = computeRFMSegments(customerRFM, now);

        // Top 10 products by quantity sold
        const topProducts = [...productFlow]
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, 10);

        res.json({
            kpis: {
                totalCustomers,
                repeatRate,
                avgOrderValue,
                avgRating: parseFloat(avgRating),
                totalReviewCount: allRatings,
            },
            productFlow,
            topProducts,
            customerSegments: segments,
            repeatPurchase: { repeatBuyers, oneTimeBuyers, repeatRate },
            ratingDistribution,
            monthlyRevenue,
        });
    } catch (error) {
        console.error("Analytics error:", error);
        res.status(500).json({ message: "Failed to fetch analytics" });
    }
};

async function getProductFlow() {
    // 1. Get all currently existing products for database baseline
    const products = await Product.find({}).lean();
    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    // Map by name (lowercase, trimmed) to catch re-seeded items with different IDs
    const productNameMap = new Map(products.map(p => [p.name.toLowerCase().trim(), p]));

    // 2. Aggregate sold quantities and revenue from all non-cancelled orders
    const soldData = await Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $unwind: "$orderItems" },
        {
            $group: {
                _id: "$orderItems.product",
                name: { $first: "$orderItems.name" },
                image: { $first: "$orderItems.image" },
                totalSold: { $sum: "$orderItems.quantity" },
                revenue: { $sum: { $multiply: [{ $ifNull: ["$orderItems.price", 0] }, { $ifNull: ["$orderItems.quantity", 0] }] } },
            },
        },
    ]);

    // 3. Prepare results map initialized with all current products
    const resultsMap = new Map();
    products.forEach(p => {
        resultsMap.set(p._id.toString(), {
            _id: p._id,
            name: p.name,
            image: p.images?.[0] || "",
            price: p.price,
            stock: p.stock,
            totalSold: 0,
            revenue: 0,
            averageRating: p.averageRating || 0,
            totalReviews: p.totalReviews || 0,
            isGhost: false,
            isActive: true
        });
    });

    // 4. Process sold data and merge into products (mapping by ID or Name)
    for (const sold of soldData) {
        const idStr = sold._id?.toString();
        if (!idStr && !sold.name) continue;

        let targetId = idStr;
        let isMatchedToReal = productMap.has(idStr);

        // Fallback: If ID is stale/missing, try matching by name string
        if (!isMatchedToReal && sold.name) {
            const normalizedName = sold.name.toLowerCase().trim();
            const matchedProduct = productNameMap.get(normalizedName);
            if (matchedProduct) {
                targetId = matchedProduct._id.toString();
                isMatchedToReal = true;
            }
        }

        if (isMatchedToReal) {
            const entry = resultsMap.get(targetId);
            entry.totalSold += (sold.totalSold || 0);
            entry.revenue += (sold.revenue || 0);
        } else {
            // Truly a ghost product (deleted or name mismatch)
            resultsMap.set(idStr || `ghost_${sold.name}`, {
                _id: idStr,
                name: sold.name + " (Deleted)",
                image: sold.image || "",
                price: 0,
                stock: 0,
                totalSold: sold.totalSold,
                revenue: sold.revenue,
                averageRating: 0,
                totalReviews: 0,
                isGhost: true,
                isActive: false
            });
        }
    }

    return Array.from(resultsMap.values());
}

async function getCustomerRFM(now) {
    return Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        {
            $group: {
                _id: "$user",
                orderCount: { $sum: 1 },
                totalSpent: { $sum: "$totalPrice" },
                lastOrderDate: { $max: "$createdAt" },
                firstOrderDate: { $min: "$createdAt" },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userInfo",
            },
        },
        { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                name: { $ifNull: ["$userInfo.name", "Unknown"] },
                email: { $ifNull: ["$userInfo.email", ""] },
                orderCount: 1,
                totalSpent: 1,
                lastOrderDate: 1,
                firstOrderDate: 1,
                daysSinceLastOrder: {
                    $divide: [{ $subtract: [now, "$lastOrderDate"] }, 86400000],
                },
            },
        },
    ]);
}

async function getRatingDistribution() {
    const result = await Review.aggregate([
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
    ]);

    // Fill in missing stars (1-5) with count 0
    const filled = [1, 2, 3, 4, 5].map((star) => {
        const found = result.find((r) => r._id === star);
        return { _id: star, count: found ? found.count : 0 };
    });

    return filled;
}

async function getMonthlyRevenue() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    return Order.aggregate([
        {
            $match: {
                status: { $ne: "cancelled" },
                createdAt: { $gte: twelveMonthsAgo },
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                },
                revenue: { $sum: "$totalPrice" },
                orders: { $sum: 1 },
            },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
            $project: {
                _id: 0,
                month: {
                    $concat: [
                        { $arrayElemAt: [["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], "$_id.month"] },
                        " ",
                        { $toString: "$_id.year" },
                    ],
                },
                revenue: 1,
                orders: 1,
            },
        },
    ]);
}

function computeRFMSegments(customers, now) {
    const segments = { Champions: 0, Loyal: 0, "At Risk": 0, New: 0 };

    for (const c of customers) {
        const days = c.daysSinceLastOrder || 999;

        // Recency Score (1-3)
        const R = days <= 7 ? 3 : days <= 30 ? 2 : 1;
        // Frequency Score (1-3)
        const F = c.orderCount >= 5 ? 3 : c.orderCount >= 2 ? 2 : 1;
        // Monetary Score (1-3)
        const M = c.totalSpent >= 10000 ? 3 : c.totalSpent >= 3000 ? 2 : 1;

        const score = R + F + M;

        if (score >= 7) segments.Champions++;
        else if (score >= 5) segments.Loyal++;
        else if (score >= 3) segments["At Risk"]++;
        else segments.New++;
    }

    return Object.entries(segments).map(([name, value]) => ({ name, value }));
}

/**
 * GET /api/admin/customers/chains
 * Returns all customers with their complete order history grouped as chains.
 */
export const getCustomerChains = async (req, res) => {
    try {
        const customers = await Order.aggregate([
            // Stage 1: Sort orders newest first
            { $sort: { createdAt: -1 } },
            // Stage 2: Group all orders by customer
            {
                $group: {
                    _id: "$user",
                    orders: {
                        $push: {
                            _id: "$_id",
                            orderItems: "$orderItems",
                            totalPrice: "$totalPrice",
                            status: "$status",
                            paymentMethod: "$paymentMethod",
                            shippingAddress: "$shippingAddress",
                            createdAt: "$createdAt",
                            deliveredAt: "$deliveredAt",
                            shippedAt: "$shippedAt",
                            paymentProof: "$paymentProof",
                        },
                    },
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: "$totalPrice" },
                    lastOrderDate: { $max: "$createdAt" },
                    firstOrderDate: { $min: "$createdAt" },
                },
            },
            // Stage 3: Lookup user details
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo",
                },
            },
            { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
            // Stage 4: Project clean shape
            {
                $project: {
                    _id: 1,
                    user: {
                        _id: "$_id",
                        name: { $ifNull: ["$userInfo.name", "Unknown"] },
                        email: { $ifNull: ["$userInfo.email", ""] },
                        imageUrl: { $ifNull: ["$userInfo.imageUrl", ""] },
                        phoneNumber: { $ifNull: ["$userInfo.phoneNumber", ""] },
                        isPhoneVerified: { $ifNull: ["$userInfo.isPhoneVerified", false] },
                    },
                    orders: 1,
                    totalOrders: 1,
                    totalSpent: 1,
                    lastOrderDate: 1,
                    firstOrderDate: 1,
                },
            },
            // Stage 5: Sort by most recent order first
            { $sort: { lastOrderDate: -1 } },
        ]);

        // Compute summary stats
        const totalItems = customers.reduce((sum, c) => {
            return sum + c.orders.reduce((s, o) => {
                return s + (o.orderItems?.reduce((is, i) => is + (i.quantity || 1), 0) || 0);
            }, 0);
        }, 0);

        const pendingChains = customers.filter((c) =>
            c.orders.some((o) => o.status === "pending")
        ).length;

        res.json({
            customers,
            summary: {
                totalCustomersWithOrders: customers.length,
                totalItems,
                pendingChains,
            },
        });
    } catch (error) {
        console.error("Customer chains error:", error);
        res.status(500).json({ message: "Failed to fetch customer chains" });
    }
};
