import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { changePassword, deleteAccount } from "../controllers/authController.js";

const router = express.Router();

router.put("/change-password", protect, changePassword);
router.delete("/delete-account", protect, deleteAccount);

export default router;