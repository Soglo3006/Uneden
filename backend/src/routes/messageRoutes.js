import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { sendMessage, getMyConversations, getConversationMessages, getConversationByBooking, markMessageAsRead, getOrCreateConversationWithUser } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/conversations", protect, getMyConversations);
router.get("/conversations/:conversationId", protect, getConversationMessages);
router.get("/booking/:bookingId", protect, getConversationByBooking);
router.put("/:messageId/read", protect, markMessageAsRead);
router.get("/check/:userId", protect, getOrCreateConversationWithUser);

export default router;