import { FlashSale } from "../models/flashSale.model.js";

// Helper: Check if another sale is already ACTIVE (excluding a given ID)
const hasActiveSaleConflict = async (excludeId = null) => {
    const query = { status: "ACTIVE" };
    if (excludeId) query._id = { $ne: excludeId };
    return await FlashSale.findOne(query);
};

// Admin: Create Campaign
export const createFlashSale = async (req, res) => {
    try {
        // Block creating a new ACTIVE sale if one already exists
        if (req.body.status === "ACTIVE") {
            const existing = await hasActiveSaleConflict();
            if (existing) {
                return res.status(409).json({
                    message: `Cannot activate — "${existing.title}" is already active. Only one sale can be active at a time.`
                });
            }
        }

        const flashSale = await FlashSale.create(req.body);
        res.status(201).json(flashSale);
    } catch (error) {
        console.error("Error creating flash sale:", error);
        res.status(500).json({ message: "Failed to create flash sale" });
    }
};

// Admin: Get all Campaigns
export const getAllFlashSales = async (req, res) => {
    try {
        const sales = await FlashSale.find().sort({ startTime: -1 });
        res.json(sales);
    } catch (error) {
        console.error("Error fetching flash sales:", error);
        res.status(500).json({ message: "Failed to fetch flash sales" });
    }
};

// Admin: Update Campaign
export const updateFlashSale = async (req, res) => {
    try {
        const { id } = req.params;

        // Block setting status to ACTIVE if another sale is already active
        if (req.body.status === "ACTIVE") {
            const existing = await hasActiveSaleConflict(id);
            if (existing) {
                return res.status(409).json({
                    message: `Cannot activate — "${existing.title}" is already active. Finish or deactivate it first.`
                });
            }
        }

        const updated = await FlashSale.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        console.error("Error updating flash sale:", error);
        res.status(500).json({ message: "Failed to update flash sale" });
    }
};

// Admin: Delete Campaign
export const deleteFlashSale = async (req, res) => {
    try {
        const { id } = req.params;
        await FlashSale.findByIdAndDelete(id);
        res.json({ message: "Flash sale deleted successfully" });
    } catch (error) {
        console.error("Error deleting flash sale:", error);
        res.status(500).json({ message: "Failed to delete flash sale" });
    }
};

// Public: Get currently active Flash Sale
export const getActiveFlashSale = async (req, res) => {
    try {
        const now = new Date();
        const activeSale = await FlashSale.findOne({
            startTime: { $lte: now },
            endTime: { $gte: now },
            status: "ACTIVE"
        }).populate("products", "name price images category isFlashSale discountPercent");

        res.json(activeSale || null);
    } catch (error) {
        console.error("Error fetching active flash sale:", error);
        res.status(500).json({ message: "Failed to fetch active flash sale" });
    }
};
