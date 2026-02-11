import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createOrder, getUserOrders, getOrderById, updateOrderPaymentProof } from "../controllers/order.controller.js";

const router = Router();

router.post("/", protectRoute, createOrder);
router.get("/", protectRoute, getUserOrders);
router.get("/:id", protectRoute, getOrderById);
router.put("/:id/payment-proof", protectRoute, updateOrderPaymentProof);

export default router;
