import express from "express";
import { getWallet, getTransactions } from "../controllers/walletController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getWallet);
router.get("/transactions", protect, getTransactions);

export default router;
