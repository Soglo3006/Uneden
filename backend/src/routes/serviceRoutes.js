import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createService, getAllServices, deleteService, getMyServices, updateService  } from "../controllers/serviceController.js";

const router = express.Router();

router.post("/", protect, createService);
router.get("/", getAllServices);
router.get("/my-services", protect, getMyServices);
router.put("/:id", protect, updateService);
router.delete("/:id", protect, deleteService);

export default router;
