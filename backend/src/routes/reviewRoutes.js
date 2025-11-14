import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createReview, getUserReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/:userId", getUserReviews);

export default router;
