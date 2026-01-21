import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getStreamToken, createBookingChannel, createDirectChannel } from "../controllers/streamChatController.js";

const router = express.Router();

router.get("/token", protect, getStreamToken);
router.post("/channel/booking", protect, createBookingChannel);
router.post("/channel/direct", protect, createDirectChannel);

export default router;