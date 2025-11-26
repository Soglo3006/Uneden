import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { sendMessage, getMyConversations, getConversationMessages, getConversationByBooking, markMessageAsRead } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/conversations", protect, getMyConversations);
router.get("/conversations/:conversationId", protect, getConversationMessages);
router.get("/booking/:bookingId", protect, getConversationByBooking);
router.put("/:messageId/read", protect, markMessageAsRead);

export default router;