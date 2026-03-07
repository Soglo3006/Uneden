import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getMetrics } from "../controllers/metricsController.js";

const router = express.Router();

router.get("/", protect, adminOnly, getMetrics);

export default router;
