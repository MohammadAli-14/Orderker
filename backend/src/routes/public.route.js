import { Router } from "express";
import { getPublicStats } from "../controllers/public.controller.js";

const router = Router();

// No auth middleware — this is intentionally public
router.get("/stats", getPublicStats);

export default router;
