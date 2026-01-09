import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {GetMyProfile, UpdateMyProfile, getUserProfile, completeProfile } from "../controllers/profileController.js";

const router = express.Router();

router.get("/me", protect, GetMyProfile);
router.put("/me", protect, UpdateMyProfile);
router.put("/complete", protect, completeProfile);
router.get("/:id", getUserProfile);

export default router;