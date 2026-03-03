import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { completeProfile, GetMyProfile, UpdateMyProfile, getUserProfile, getSettings, updateSettings } from "../controllers/profileController.js";

const router = express.Router();

router.get("/me", protect, GetMyProfile);
router.put("/me", protect, UpdateMyProfile);
router.put("/complete", protect, completeProfile);
router.get("/:id", getUserProfile);
router.get("/settings", protect, getSettings);
router.put("/settings", protect, updateSettings);

export default router;