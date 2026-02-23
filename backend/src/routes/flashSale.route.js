import express from "express";
import {
    createFlashSale,
    getAllFlashSales,
    updateFlashSale,
    deleteFlashSale,
    getActiveFlashSale
} from "../controllers/flashSale.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin routes
router.post("/", protectRoute, adminRoute, createFlashSale);
router.get("/admin", protectRoute, adminRoute, getAllFlashSales);
router.put("/:id", protectRoute, adminRoute, updateFlashSale);
router.delete("/:id", protectRoute, adminRoute, deleteFlashSale);

// Public routes
router.get("/active", getActiveFlashSale);

export default router;
