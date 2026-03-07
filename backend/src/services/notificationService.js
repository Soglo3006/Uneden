import pool from "../config/db.js";

/**
 * Create an in-app notification for a user.
 * Fires-and-forgets; never throws.
 *
 * @param {object} opts
 * @param {string} opts.userId    - recipient user UUID
 * @param {string} opts.type      - 'message' | 'booking_request' | 'booking_accepted' | 'booking_rejected' | 'booking_completed' | 'dispute' | 'payment'
 * @param {string} opts.title     - short title
 * @param {string} opts.body      - longer description
 * @param {string} [opts.link]    - optional frontend path to navigate to
 */
export async function createNotification({ userId, type, title, body, link = null }) {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, type, title, body, link]
    );
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }
}
