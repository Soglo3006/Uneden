import pool from "../config/db.js";

export const createBooking = async (req, res) => {
  try {
    const { service_id } = req.body;

    const service = await pool.query("SELECT * FROM services WHERE id = $1", [service_id]);
    if (service.rows.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    const worker_id = service.rows[0].user_id;

    if (worker_id === req.user.id) {
      return res.status(400).json({ message: "You can't book your own service" });
    }

    const result = await pool.query(
      `INSERT INTO bookings (service_id, client_id, worker_id, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [service_id, req.user.id, worker_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating booking" });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, s.title, s.price, u.full_name AS worker_name, w.full_name AS client_name
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
      `SELECT b.*, s.title, s.price, u.full_name AS client_name
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

    const validStatuses = ["pending", "accepted", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid booking status" });
    }
    
    const booking = await pool.query(
      `SELECT * FROM bookings WHERE id = $1`,
      [id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const b = booking.rows[0];

    if (status === "accepted" || status === "rejected") {
      if (b.worker_id !== req.user.id) {
        return res.status(403).json({ message: "Only the worker can accept or reject bookings" });
      }
    }

    if (status === "cancelled") {
      if (b.client_id !== req.user.id && b.worker_id !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to cancel this booking" });
      }
    }

    if (status === "completed") {
      if (b.worker_id !== req.user.id) {
        return res.status(403).json({ message: "Only the worker can mark a booking as completed" });
      }
    }

    const result = await pool.query(
      `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating booking" });
  }
};
