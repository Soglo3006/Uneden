import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {GetMyProfile, UpdateMyProfile, getUserProfile } from "../controllers/profileController.js";

const router = express.Router();

router.post("/me", protect, GetMyProfile);
router.put("/me", protect, UpdateMyProfile);
router.get("/:userId", getUserProfile);

export default router;