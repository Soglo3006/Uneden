import express from 'express';
import { reportListing } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/listing', protect, reportListing);

export default router;