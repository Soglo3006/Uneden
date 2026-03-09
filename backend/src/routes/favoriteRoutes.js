import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getFavorites, getFavoriteIds, addFavorite, removeFavorite } from "../controllers/favoriteController.js";

const router = express.Router();

router.get("/ids", protect, getFavoriteIds);
router.get("/", protect, getFavorites);
router.post("/", protect, addFavorite);
router.delete("/:serviceId", protect, removeFavorite);

export default router;
