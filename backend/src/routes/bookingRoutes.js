import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createBooking, getMyBookings, updateBookingStatus, getReceivedBookings, markCompleted } from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.get("/received-bookings", protect, getReceivedBookings);
router.put("/:id/status", protect, updateBookingStatus);
router.post("/:id/complete", protect, markCompleted);

export default router;