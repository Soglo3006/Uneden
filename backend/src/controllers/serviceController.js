import pool from "../config/db.js";

export const createService = async (req, res) => {
  try {
    const {
      type, 
      title,
      description,
      category_id,
      subcategory,
      price,
      location,
      poster_type,
      availability,
      language,
      mobility,
      duration,
      urgency, 
      image_url,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    if (!type || !['offer', 'looking'].includes(type)) {
      return res.status(400).json({ message: "Invalid type. Must be 'offer' or 'looking'" });
    }

    if (!price || price <= 0) {
      return res.status(400).json({ message: "Price/Budget must be greater than 0" });
    }

    if (type === 'looking' && !urgency) {
      return res.status(400).json({ message: "Urgency is required for job requests" });
    }

    // Créer le service
    const result = await pool.query(
      `INSERT INTO services (
        user_id, type, title, description, category_id, subcategory,
        price, location, poster_type, availability, 
        language, mobility, duration, urgency, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        req.user.id,
        type,
        title,
        description,
        category_id,
        subcategory,
        price,
        location,
        poster_type,
        availability,
        language,
        mobility,
        duration,
        urgency || null,
        image_url || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating service" });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const { category, location, minPrice, maxPrice, search } = req.query;

    let query = `
      SELECT 
        s.*,
        c.name AS category_name,
        c.image_url
      FROM services s
      LEFT JOIN categories c ON c.id = s.category_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND s.category_id = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (location) {
      query += ` AND s.location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
      paramCount++;
    }

    if (minPrice) {
      query += ` AND s.price >= $${paramCount}`;
      params.push(minPrice);
      paramCount++;
    }

    if (maxPrice) {
      query += ` AND s.price <= $${paramCount}`;
      params.push(maxPrice);
      paramCount++;
    }

    if (search) {
      query += ` AND (s.title ILIKE $${paramCount} OR s.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY s.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error while fetching services" });
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
  try {
    const result = await pool.query(
      `SELECT * FROM services WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching your services" });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
          s.*, 
          u.full_name AS owner_name, 
          u.id AS owner_id,
          c.name AS category_name,
          c.image_url
       FROM services s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN categories c ON c.id = s.category_id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching service" });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category_id, price, location } = req.body;

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
       SET title = $1, 
           description = $2, 
           category_id = $3, 
           price = $4, 
           location = $5
       WHERE id = $6
       RETURNING *`,
      [
        title || existing.title,
        description || existing.description,
        category_id || existing.category_id,
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

export const getUserServices = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT 
        s.*,
        u.full_name AS owner_name,
        u.company_name,
        u.account_type
      FROM services s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = $1 
      ORDER BY s.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching user services" });
  }
};
