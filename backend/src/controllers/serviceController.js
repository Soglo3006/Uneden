import pool from "../config/db.js";

export const createService = async (req, res) => {
  try {
    const { title, description, category, price, location } = req.body;

    if (!title || !price) {
      return res.status(400).json({ message: "Title and price are required" });
    }

    const result = await pool.query(
      `INSERT INTO services (user_id, title, description, category, price, location)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, title, description, category, price, location]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating service" });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.full_name AS owner_name
       FROM services s
       JOIN users u ON s.user_id = u.id
       ORDER BY s.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching services" });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const check = await pool.query(
      `SELECT * FROM services WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ message: "You can't delete this service" });
    }

    await pool.query(`DELETE FROM services WHERE id = $1`, [id]);
    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting service" });
  }
};

export const getMyServices = async (req, res) => {
    try{
        const result = await pool.query(
            `SELECT * FROM services WHERE user_id = $1 ORDER BY created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error while fetching your services" });
    }
}


export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, price, location } = req.body;

    const check = await pool.query(
      `SELECT * FROM services WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ message: "You can't update this service" });
    }

    const existing = check.rows[0];
    const updated = await pool.query(
      `UPDATE services 
       SET title = $1, description = $2, category = $3, price = $4, location = $5
       WHERE id = $6
       RETURNING *`,
      [
        title || existing.title,
        description || existing.description,
        category || existing.category,
        price || existing.price,
        location || existing.location,
        id,
      ]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating service" });
  }
};
