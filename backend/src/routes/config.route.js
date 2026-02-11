import express from "express";
import { getAppConfig } from "../controllers/config.controller.js";

const router = express.Router();

router.get("/", getAppConfig);

export default router;
