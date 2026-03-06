import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { CreateDispute, GetDisputes, UpdateDispute, AdminGetAllDisputes, AdminUpdateDispute } from "../controllers/disputeController.js";

const router = express.Router();

router.post("/", protect, CreateDispute);
router.get("/:id", protect, GetDisputes);
router.put("/:id", protect, UpdateDispute);

// Admin
router.get("/", protect, adminOnly, AdminGetAllDisputes);
router.put("/:id/admin", protect, adminOnly, AdminUpdateDispute);

export default router;