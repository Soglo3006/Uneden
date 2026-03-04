import pool from "../config/db.js";
import { notifyBookingCreated, notifyBookingStatusUpdated } from "../services/emailService.js";
import stripe from "../config/stripe.js";

export const createBooking = async (req, res) => {
  try {
    const { service_id, client_description } = req.body;

    const service = await pool.query(
      "SELECT s.*, u.email as worker_email, CASE WHEN u.account_type = 'company' THEN u.company_name ELSE u.full_name END as worker_name FROM services s JOIN users u ON s.user_id = u.id WHERE s.id = $1",
      [service_id]
    );

    if (service.rows.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    const s = service.rows[0];

    if (!s.is_active) {
      return res.status(400).json({ message: "This listing is no longer available" });
    }

    const worker_id = s.user_id;

    if (worker_id === req.user.id) {
      return res.status(400).json({ message: "You can't request your own service" });
    }

    // Prevent duplicate pending requests from the same client
    const duplicate = await pool.query(
      "SELECT id FROM bookings WHERE service_id = $1 AND client_id = $2 AND status = 'pending'",
      [service_id, req.user.id]
    );
    if (duplicate.rows.length > 0) {
      return res.status(400).json({ message: "You already have a pending request for this listing" });
    }

    const client = await pool.query(
      "SELECT CASE WHEN account_type = 'company' THEN company_name ELSE full_name END AS display_name FROM users WHERE id = $1",
      [req.user.id]
    );
    const clientName = client.rows[0].display_name;

    const result = await pool.query(
      `INSERT INTO bookings (service_id, client_id, worker_id, status, client_description)
       VALUES ($1, $2, $3, 'pending', $4)
       RETURNING *`,
      [service_id, req.user.id, worker_id, client_description || null]
    );

    const booking = result.rows[0];

    // Ensure client has a wallet row
    await pool.query(
      "INSERT INTO wallets (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING",
      [req.user.id]
    );

    notifyBookingCreated(s.worker_email, s.worker_name, clientName, s.title, booking.id)
      .catch((err) => console.error("Booking email notification failed:", err.message));

    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating booking" });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, s.title, s.price, s.image_url, s.category, s.location AS service_location,
              s.is_one_time,
              CASE WHEN u.account_type = 'company' THEN u.company_name ELSE u.full_name END AS worker_name,
              CASE WHEN w.account_type = 'company' THEN w.company_name ELSE w.full_name END AS client_name,
              EXISTS(SELECT 1 FROM reviews WHERE booking_id = b.id AND reviewer_id = $1) AS has_reviewed,
              EXISTS(SELECT 1 FROM disputes WHERE booking_id = b.id) AS has_dispute,
              b.payment_status, b.completed_by_worker, b.completed_by_client
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN users u ON b.worker_id = u.id
       JOIN users w ON b.client_id = w.id
       WHERE b.client_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching bookings" });
  }
};

export const getReceivedBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, s.title, s.price, s.image_url, s.category, s.location AS service_location,
              s.is_one_time,
              CASE WHEN u.account_type = 'company' THEN u.company_name ELSE u.full_name END AS client_name,
              EXISTS(SELECT 1 FROM reviews WHERE booking_id = b.id AND reviewer_id = $1) AS has_reviewed,
              EXISTS(SELECT 1 FROM disputes WHERE booking_id = b.id) AS has_dispute,
              b.payment_status, b.completed_by_worker, b.completed_by_client
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN users u ON b.client_id = u.id
       WHERE b.worker_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "accepted", "active", "completed", "cancelled", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid booking status" });
    }

    const booking = await pool.query(
      `SELECT b.*, s.title, s.is_one_time,
              u.email as client_email,
              CASE WHEN u.account_type = 'company' THEN u.company_name ELSE u.full_name END AS client_name
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN users u ON b.client_id = u.id
       WHERE b.id = $1`,
      [id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const b = booking.rows[0];

    if (status === "accepted" || status === "rejected") {
      if (b.worker_id !== req.user.id) {
        return res.status(403).json({ message: "Only the service provider can accept or reject requests" });
      }
    }

    if (status === "cancelled") {
      if (b.client_id !== req.user.id && b.worker_id !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to cancel this request" });
      }
    }

    const result = await pool.query(
      `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (status === "accepted" || status === "rejected") {
      notifyBookingStatusUpdated(b.client_email, b.client_name, b.title, status, b.id)
        .catch((err) => console.error("Status email notification failed:", err.message));
    }

    // One-time listing: when accepted, auto-reject all OTHER pending requests + deactivate listing
    if (status === "accepted" && b.is_one_time) {
      autoRejectOtherRequests(b.service_id, id).catch((err) =>
        console.error("Auto-reject failed for service", b.service_id, err.message)
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating booking" });
  }
};

// Mark completion by one party (worker or client)
export const markCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await pool.query(
      `SELECT b.*, s.title, s.price,
              CASE WHEN cw.account_type = 'company' THEN cw.company_name ELSE cw.full_name END AS worker_name,
              CASE WHEN cc.account_type = 'company' THEN cc.company_name ELSE cc.full_name END AS client_name,
              cw.id AS worker_user_id, cc.id AS client_user_id
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN users cw ON b.worker_id = cw.id
       JOIN users cc ON b.client_id = cc.id
       WHERE b.id = $1`,
      [id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const b = booking.rows[0];

    if (b.status !== "active") {
      return res.status(400).json({ message: "Only active bookings can be marked as completed" });
    }

    if (b.client_id !== userId && b.worker_id !== userId) {
      return res.status(403).json({ message: "You are not part of this booking" });
    }

    const isWorker = b.worker_id === userId;
    const updateField = isWorker ? "completed_by_worker" : "completed_by_client";

    // Set this party's completion flag
    await pool.query(
      `UPDATE bookings SET ${updateField} = true WHERE id = $1`,
      [id]
    );

    // Re-fetch to check if BOTH have now completed
    const updated = await pool.query(
      "SELECT * FROM bookings WHERE id = $1",
      [id]
    );
    const u = updated.rows[0];

    if (u.completed_by_worker && u.completed_by_client) {
      // Both confirmed — finalize
      await pool.query(
        "UPDATE bookings SET status = 'completed' WHERE id = $1",
        [id]
      );

      // Update wallet balances + create transaction records
      finalizeCompletion(b).catch((err) =>
        console.error("Finalize completion failed for booking", id, err.message)
      );

      // Auto-release Stripe payment to worker
      if (u.payment_status === "paid") {
        autoReleasePayment(id, b.worker_id).catch((err) =>
          console.error("Auto-release payment failed for booking", id, err.message)
        );
      }

      return res.json({ ...u, status: "completed" });
    }

    res.json(u);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while marking completion" });
  }
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function autoRejectOtherRequests(serviceId, acceptedBookingId) {
  // Get all other pending bookings for this service
  const others = await pool.query(
    "SELECT b.*, u.email, CASE WHEN u.account_type = 'company' THEN u.company_name ELSE u.full_name END AS full_name FROM bookings b JOIN users u ON b.client_id = u.id WHERE b.service_id = $1 AND b.status = 'pending' AND b.id != $2",
    [serviceId, acceptedBookingId]
  );

  if (others.rows.length > 0) {
    await pool.query(
      "UPDATE bookings SET status = 'rejected' WHERE service_id = $1 AND status = 'pending' AND id != $2",
      [serviceId, acceptedBookingId]
    );
    // Could send rejection emails here for each
  }

  // Deactivate the listing so it no longer appears publicly
  await pool.query(
    "UPDATE services SET is_active = false WHERE id = $1",
    [serviceId]
  );
}

async function finalizeCompletion(booking) {
  const amount = Number(booking.price);
  const platformFeeRate = 0.05;
  const platformFee = Math.round(amount * platformFeeRate * 100) / 100;
  const workerReceives = amount - platformFee;

  // Ensure wallets exist
  await pool.query(
    "INSERT INTO wallets (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING",
    [booking.worker_id]
  );
  await pool.query(
    "INSERT INTO wallets (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING",
    [booking.client_id]
  );

  // Update worker's wallet
  await pool.query(
    `UPDATE wallets
     SET balance = balance + $1, total_earned = total_earned + $1, updated_at = NOW()
     WHERE user_id = $2`,
    [workerReceives, booking.worker_id]
  );

  // Record worker's transaction (credit)
  await pool.query(
    `INSERT INTO transactions (user_id, booking_id, type, amount, description, other_user_name, listing_title)
     VALUES ($1, $2, 'credit', $3, 'Payment received for completed job', $4, $5)`,
    [booking.worker_id, booking.id, workerReceives, booking.client_name, booking.title]
  );

  // Record client's transaction (debit — already paid, just record history)
  await pool.query(
    `INSERT INTO transactions (user_id, booking_id, type, amount, description, other_user_name, listing_title)
     VALUES ($1, $2, 'debit', $3, 'Payment for completed job', $4, $5)`,
    [booking.client_id, booking.id, amount, booking.worker_name, booking.title]
  );

  // Update client total_spent
  await pool.query(
    `UPDATE wallets SET total_spent = total_spent + $1, updated_at = NOW() WHERE user_id = $2`,
    [amount, booking.client_id]
  );
}

async function autoReleasePayment(bookingId, workerId) {
  const payment = await pool.query(
    "SELECT * FROM payments WHERE booking_id = $1 AND status = 'paid' LIMIT 1",
    [bookingId]
  );
  if (payment.rows.length === 0) return;

  const p = payment.rows[0];

  const stripeAccount = await pool.query(
    "SELECT stripe_account_id FROM stripe_accounts WHERE user_id = $1",
    [workerId]
  );
  if (stripeAccount.rows.length === 0) return;

  const transferAmount = p.amount - (p.platform_fee || 0);

  const transfer = await stripe.transfers.create({
    amount: transferAmount,
    currency: p.currency || "cad",
    destination: stripeAccount.rows[0].stripe_account_id,
    transfer_group: p.transfer_group,
  });

  await pool.query(
    "UPDATE payments SET status = 'transferred', stripe_transfer_id = $1, updated_at = NOW() WHERE id = $2",
    [transfer.id, p.id]
  );

  await pool.query(
    "UPDATE bookings SET payment_status = 'transferred' WHERE id = $1",
    [bookingId]
  );
}
