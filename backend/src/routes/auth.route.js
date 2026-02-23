import { Router } from "express";
import { sendVerificationCode, verifyPhoneNumber, requestWhatsAppCode } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute);

router.post("/send-otp", sendVerificationCode);
router.post("/verify-otp", verifyPhoneNumber);
router.post("/whatsapp-code", requestWhatsAppCode);

export default router;
