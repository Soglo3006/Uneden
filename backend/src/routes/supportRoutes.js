import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { createSupportTicket, listSupportTickets, updateSupportStatus } from "../controllers/supportController.js";

const router = express.Router();

// Create a support ticket (requires auth)
router.post("/", protect, createSupportTicket);

// List and update tickets: admin only
router.get("/", protect, adminOnly, listSupportTickets);
router.put("/:id/status", protect, adminOnly, updateSupportStatus);

export default router;
