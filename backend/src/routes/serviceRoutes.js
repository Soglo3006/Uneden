import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createService, getAllServices, deleteService } from "../controllers/serviceController.js";

const router = express.Router();

router.post("/", protect, createService);
router.get("/", getAllServices);
router.delete("/:id", protect, deleteService);

export default router;
