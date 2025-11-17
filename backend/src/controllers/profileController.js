import pool from "../config/db.js";

export const GetMyProfile = async (req,res) => {
    try {

        const result = await pool.query(
            `SELECT id, full_name, email, created_at FROM users WHERE id= $1`,
            [req.user.id]
        )

        if (result.rows.length === 0){
            return res.status(404).json({message: "Profile not found"});
        }

        res.json(result.rows[0]);

    } catch(err){
        console.error(err);
        res.status(500).json({message: "Server error while fetching profile" });
    }
}

export const UpdateMyProfile = async (req,res) => {
    try {

        const { full_name, email} = req.body;

        if (!full_name || !email){
            return res.status(400).json({message: "Please fill all fields"});
        }

        if (full_name.trim() === "" || email.trim() === ""){
            return res.status(400).json({message: "Fields cannot be empty"});
        }

        const result = await pool.query(
            `UPDATE users SET full_name = $1, email= $2 WHERE id = $3 RETURNING id, full_name, email, created_at`,
            [full_name, email, req.user.id]
        )

        if (result.rows.length === 0){
            return res.status(404).json({message: "Profile not found"});
        }
        
        res.json(result.rows[0]);

    } catch (err){
        console.error(err);
        res.status(500).json({message: "Server error while updating profile" });
    }
}

export const getUserProfile = async (req,res) => {
    try {
        const { id } = req.params;

        const userResult = await pool.query(
            `SELECT id, full_name, email, created_at FROM users WHERE id=$1`,
            [id]
        );

        if (userResult.rows.length === 0){
            return res.status(404).json({message: "Profile not found"});
        }
        
        const user = userResult.rows[0];

        const serviceUser = await pool.query(
            `SELECT COUNT(*) AS total_services FROM services WHERE user_id=$1`,
            [id]
        );

        const completedBookings = await pool.query(
            `SELECT COUNT(*) as count FROM bookings WHERE worker_id = $1 AND status = 'completed'`,
            [id]
        );

        const avgRating = await pool.query(
            `SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE target_id = $1`,
            [id]
        );

        res.json({
            ...user,
            stats:{
                total_services: parseInt(serviceUser.rows[0].total_services, 10),
                completed_bookings: parseInt(completedBookings.rows[0].count, 10),
                average_rating: avgRating.rows[0].avg_rating ? parseFloat(parseFloat(avgRating.rows[0].avg_rating).toFixed(1)) : null,
                total_reviews: parseInt(avgRating.rows[0].review_count, 10)
            }
        });

    } catch(err){
        console.error(err);
        res.status(500).json({message: "Server error while fetching profile" });
    }
}