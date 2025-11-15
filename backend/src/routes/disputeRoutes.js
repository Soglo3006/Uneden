import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { CreateDispute, GetDisputes, UpdateDispute} from "../controllers/disputeController.js";

const router = express.Router();

router.post("/", protect, CreateDispute);
router.get("/:id", protect, GetDisputes);
router.put("/:id", protect, UpdateDispute);

export default router;