import { Router } from "express";
import { requestWhatsAppCode } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute);

router.post("/whatsapp-code", requestWhatsAppCode);

export default router;
