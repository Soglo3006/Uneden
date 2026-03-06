import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { supabaseAdmin } from "../lib/supabase.js";

const router = express.Router();

// GET /notifications/vapid-public-key
router.get("/vapid-public-key", (_req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// POST /notifications/subscribe
router.post("/subscribe", protect, async (req, res) => {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ message: "Invalid subscription object" });
  }
  try {
    const { error } = await supabaseAdmin
      .from("push_subscriptions")
      .upsert(
        { user_id: req.user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
        { onConflict: "user_id,endpoint" }
      );
    if (error) throw error;
    res.status(201).json({ message: "Subscribed" });
  } catch (err) {
    console.error("Subscribe error:", err.message);
    res.status(500).json({ message: "Failed to save subscription" });
  }
});

// DELETE /notifications/unsubscribe
router.delete("/unsubscribe", protect, async (req, res) => {
  const { endpoint } = req.body;
  try {
    await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .eq("user_id", req.user.id)
      .eq("endpoint", endpoint);
    res.json({ message: "Unsubscribed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to unsubscribe" });
  }
});

export default router;
