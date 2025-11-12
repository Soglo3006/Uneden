import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createBooking, getMyBookings, updateBookingStatus } from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.put("/:id/status", protect, updateBookingStatus);

export default router;