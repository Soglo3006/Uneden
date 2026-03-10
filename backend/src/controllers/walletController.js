import pool from "../config/db.js";

export const getWallet = async (req, res) => {
  try {
    const userId = req.user.id;

    // Upsert wallet row so the endpoint always returns something
    await pool.query(
      "INSERT INTO wallets (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING",
      [userId]
    );

    const result = await pool.query(
      "SELECT balance, total_earned, total_spent FROM wallets WHERE user_id = $1",
      [userId]
    );

    res.json(result.rows[0] ?? { balance: 0, total_earned: 0, total_spent: 0 });
  } catch (err) {
    console.error("getWallet error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;

    const result = await pool.query(
      `SELECT id, booking_id, type, amount, description, other_user_name, listing_title, created_at
       FROM transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getTransactions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
