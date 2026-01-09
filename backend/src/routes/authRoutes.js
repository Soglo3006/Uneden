import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { changePassword } from "../controllers/authController.js";

const router = express.Router();

router.put("/change-password", protect, changePassword);

export default router;