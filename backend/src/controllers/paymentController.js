import pool from "../config/db.js";
import stripe from "../config/stripe.js";

const PLATFORM_FEE_PERCENT = 5; // 5% platform fee
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// ─── Stripe Connect: create onboarding link for worker ───────────────────────
export const createConnectAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if worker already has a Stripe account
    const existing = await pool.query(
      "SELECT * FROM stripe_accounts WHERE user_id = $1",
      [userId]
    );

    let stripeAccountId;

    if (existing.rows.length > 0) {
      stripeAccountId = existing.rows[0].stripe_account_id;
    } else {
      // Get user email
      const user = await pool.query("SELECT email, full_name FROM users WHERE id = $1", [userId]);
      if (user.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create Express Connect account
      const account = await stripe.accounts.create({
        type: "express",
        email: user.rows[0].email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
      });

      stripeAccountId = account.id;

      // Save to DB
      await pool.query(
        `INSERT INTO stripe_accounts (user_id, stripe_account_id, details_submitted, charges_enabled)
         VALUES ($1, $2, false, false)`,
        [userId, stripeAccountId]
      );
    }

    // Create account link (onboarding URL)
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${FRONTEND_URL}/bookings?stripe=refresh`,
      return_url: `${FRONTEND_URL}/bookings?stripe=success`,
      type: "account_onboarding",
    });

    res.json({ url: accountLink.url });
  } catch (err) {
    console.error("Stripe Connect error:", err);
    res.status(500).json({ message: "Failed to create Stripe Connect account" });
  }
};

// ─── Get worker's Stripe Connect status ──────────────────────────────────────
export const getConnectStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT * FROM stripe_accounts WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ connected: false, charges_enabled: false });
    }

    const row = result.rows[0];

    // Refresh status from Stripe
    const account = await stripe.accounts.retrieve(row.stripe_account_id);

    // Update DB with latest status
    await pool.query(
      `UPDATE stripe_accounts
       SET details_submitted = $1, charges_enabled = $2, updated_at = NOW()
       WHERE user_id = $3`,
      [account.details_submitted, account.charges_enabled, userId]
    );

    res.json({
      connected: true,
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
      stripe_account_id: row.stripe_account_id,
    });
  } catch (err) {
    console.error("Stripe status error:", err);
    res.status(500).json({ message: "Failed to get Stripe status" });
  }
};

// ─── Create Stripe Checkout Session (client pays for accepted booking) ────────
export const createCheckoutSession = async (req, res) => {
  try {
    const { booking_id } = req.body;
    const clientId = req.user.id;

    // Fetch booking + service + worker info
    const booking = await pool.query(
      `SELECT b.*, s.title, s.price, s.image_url,
              u.email AS worker_email
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN users u ON b.worker_id = u.id
       WHERE b.id = $1`,
      [booking_id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const b = booking.rows[0];

    if (b.client_id !== clientId) {
      return res.status(403).json({ message: "You are not the client for this booking" });
    }

    if (b.status !== "accepted") {
      return res.status(400).json({ message: "Booking must be accepted before payment" });
    }

    if (b.payment_status === "paid") {
      return res.status(400).json({ message: "This booking has already been paid" });
    }

    // Check that worker has a Stripe Connect account with charges enabled
    const stripeAccount = await pool.query(
      "SELECT * FROM stripe_accounts WHERE user_id = $1",
      [b.worker_id]
    );

    if (stripeAccount.rows.length === 0 || !stripeAccount.rows[0].charges_enabled) {
      return res.status(400).json({
        message: "The service provider has not set up their payment account yet.",
      });
    }

    const workerStripeId = stripeAccount.rows[0].stripe_account_id;
    const amountCents = Math.round(Number(b.price) * 100);
    const platformFee = Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100));
    const transferGroup = `booking_${booking_id}`;

    // Create Checkout Session (funds go to platform, NOT to worker yet — escrow)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: b.title,
              description: `FieldHearts service booking`,
              ...(b.image_url && { images: [b.image_url] }),
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_group: transferGroup,
        on_behalf_of: workerStripeId,
      },
      success_url: `${FRONTEND_URL}/bookings?payment=success&booking_id=${booking_id}`,
      cancel_url: `${FRONTEND_URL}/bookings?payment=cancelled`,
      metadata: {
        booking_id,
        worker_stripe_id: workerStripeId,
        platform_fee: String(platformFee),
      },
    });

    // Record pending payment in DB
    await pool.query(
      `INSERT INTO payments
         (booking_id, amount, status, stripe_checkout_session_id, platform_fee, currency, transfer_group)
       VALUES ($1, $2, 'pending', $3, $4, 'cad', $5)
       ON CONFLICT DO NOTHING`,
      [booking_id, amountCents, session.id, platformFee, transferGroup]
    );

    res.json({ url: session.url, session_id: session.id });
  } catch (err) {
    console.error("Checkout session error:", err);
    res.status(500).json({ message: "Failed to create checkout session" });
  }
};

// ─── Stripe Webhook ──────────────────────────────────────────────────────────
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.booking_id;
    const paymentIntentId = session.payment_intent;

    if (bookingId) {
      try {
        // Update payment record
        await pool.query(
          `UPDATE payments
           SET status = 'paid', stripe_payment_intent_id = $1, updated_at = NOW()
           WHERE stripe_checkout_session_id = $2`,
          [paymentIntentId, session.id]
        );

        // Update booking payment_status and advance status to 'active'
        await pool.query(
          "UPDATE bookings SET payment_status = 'paid', status = 'active' WHERE id = $1 AND status = 'accepted'",
          [bookingId]
        );

        console.log(`Payment confirmed for booking ${bookingId} — now active`);
      } catch (err) {
        console.error("Error processing payment webhook:", err);
      }
    }
  }

  res.json({ received: true });
};

// ─── Release payment to worker (called when booking is marked completed) ──────
export const releasePayment = async (req, res) => {
  try {
    const { booking_id } = req.body;
    const userId = req.user.id;

    // Fetch booking
    const booking = await pool.query(
      `SELECT b.*, sa.stripe_account_id
       FROM bookings b
       LEFT JOIN stripe_accounts sa ON sa.user_id = b.worker_id
       WHERE b.id = $1`,
      [booking_id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const b = booking.rows[0];

    if (b.worker_id !== userId) {
      return res.status(403).json({ message: "Only the worker can release payment" });
    }

    if (b.status !== "completed") {
      return res.status(400).json({ message: "Booking must be completed before releasing payment" });
    }

    if (b.payment_status !== "paid") {
      return res.status(400).json({ message: "No payment found for this booking" });
    }

    // Fetch payment record
    const payment = await pool.query(
      "SELECT * FROM payments WHERE booking_id = $1 AND status = 'paid'",
      [booking_id]
    );

    if (payment.rows.length === 0) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    const p = payment.rows[0];

    if (!b.stripe_account_id) {
      return res.status(400).json({ message: "Worker has no Stripe account" });
    }

    // Transfer to worker's Connect account (amount minus platform fee)
    const transferAmount = p.amount - p.platform_fee;

    const transfer = await stripe.transfers.create({
      amount: transferAmount,
      currency: p.currency || "cad",
      destination: b.stripe_account_id,
      transfer_group: p.transfer_group,
      source_transaction: p.stripe_payment_intent_id,
    });

    // Update payment record
    await pool.query(
      `UPDATE payments SET status = 'transferred', stripe_transfer_id = $1, updated_at = NOW()
       WHERE id = $2`,
      [transfer.id, p.id]
    );

    // Update booking payment_status
    await pool.query(
      "UPDATE bookings SET payment_status = 'transferred' WHERE id = $1",
      [booking_id]
    );

    res.json({ success: true, transfer_id: transfer.id });
  } catch (err) {
    console.error("Release payment error:", err);
    res.status(500).json({ message: "Failed to release payment" });
  }
};

// ─── Refund payment (for disputes resolved in client's favor) ─────────────────
export const refundPayment = async (req, res) => {
  try {
    const { booking_id } = req.body;

    const payment = await pool.query(
      "SELECT * FROM payments WHERE booking_id = $1 AND status = 'paid'",
      [booking_id]
    );

    if (payment.rows.length === 0) {
      return res.status(404).json({ message: "No paid payment found for this booking" });
    }

    const p = payment.rows[0];

    const refund = await stripe.refunds.create({
      payment_intent: p.stripe_payment_intent_id,
    });

    await pool.query(
      "UPDATE payments SET status = 'refunded', updated_at = NOW() WHERE id = $1",
      [p.id]
    );

    await pool.query(
      "UPDATE bookings SET payment_status = 'refunded' WHERE id = $1",
      [booking_id]
    );

    res.json({ success: true, refund_id: refund.id });
  } catch (err) {
    console.error("Refund error:", err);
    res.status(500).json({ message: "Failed to refund payment" });
  }
};

// ─── Get payment status for a booking ────────────────────────────────────────
export const getPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await pool.query(
      "SELECT * FROM bookings WHERE id = $1",
      [bookingId]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const b = booking.rows[0];

    if (b.client_id !== userId && b.worker_id !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const payment = await pool.query(
      "SELECT status, amount, platform_fee, currency, created_at FROM payments WHERE booking_id = $1 ORDER BY created_at DESC LIMIT 1",
      [bookingId]
    );

    res.json({
      payment_status: b.payment_status,
      payment: payment.rows[0] || null,
    });
  } catch (err) {
    console.error("Get payment status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
