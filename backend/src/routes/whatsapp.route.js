import { Router } from "express";
import { getWhatsAppStatus, getWhatsAppQr, restartWhatsApp } from "../controllers/whatsapp.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = Router();

// All WhatsApp admin routes require authentication + admin role
router.use(protectRoute);
router.use(adminRoute);

router.get("/status", getWhatsAppStatus);
router.get("/qr", getWhatsAppQr);
router.post("/restart", restartWhatsApp);

export default router;
