import { Router } from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.post("/", protectRoute, upload.single("image"), uploadImage);

export default router;
