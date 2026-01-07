import pool from "../config/db.js";


export const completeProfile = async (req,res) => {
    try {
        const {
            account_type,
            phone,
            address,
            city,
            province,
            bio,
            avatar,

            // Person data
            profession,
            skills,
            languages,
            experiences,
            
            // Company data
            company_name,
            industry,
            team_size,
            
            // Portfolio (commun)
            portfolio
            } = req.body;

            const userId = req.user.id;
            const fullName = req.user.full_name;

            console.log("Completing profile for user:", userId);

            // Mettre à jour le profil
            const result = await pool.query(
            `UPDATE users 
            SET 
                account_type = $1,
                phone = $2,
                address = $3,
                city = $4,
                province = $5,
                bio = $6,
                avatar = $7,
                profession = $8,
                skills = $9,
                languages = $10,
                experiences = $11,
                company_name = $12,
                industry = $13,
                team_size = $14,
                portfolio = $15,
                profile_completed = true,
                updated_at = NOW()
            WHERE id = $16
            RETURNING *`,
            [
                account_type,
                phone,
                address,
                city,
                province,
                bio,
                avatar,
                profession,
                JSON.stringify(skills || []),
                JSON.stringify(languages || []),
                JSON.stringify(experiences || []),
                company_name,
                industry,
                team_size,
                JSON.stringify(portfolio || []),
                userId
            ]
            );

            if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
            }

            console.log("Profile completed successfully");

            res.json({ 
            message: "Profile completed successfully",
            user: result.rows[0]
            });
        } catch (err) {
            console.error("Error completing profile:", err);
            res.status(500).json({ 
            message: "Server error while completing profile",
            error: err.message 
            });
        }
};

export const GetMyProfile = async (req,res) => {
    try {

        const result = await pool.query(
            `SELECT * FROM users WHERE id= $1`,
            [req.user.id]
        )

        if (result.rows.length === 0){
            return res.status(404).json({message: "Profile not found"});
        }

        const user = result.rows[0];

        res.json(user);
    } catch(err){
        console.error(err);
        res.status(500).json({message: "Server error while fetching profile" });
    }
}

export const UpdateMyProfile = async (req, res) => {
    try {
        const {
            full_name,
            email,
            phone,
            avatar,
            bio,
            city,
            province,
            skills,
            languages,
            portfolio,
            profession,      
            company_name,     
            industry,          
            team_size 
        } = req.body;

        // Validation des champs requis
        if (!full_name || !email) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        if (full_name.trim() === "" || email.trim() === "") {
            return res.status(400).json({ message: "Fields cannot be empty" });
        }

        // Convertir les tableaux en JSON seulement s'ils sont des tableaux
        const skillsJson = Array.isArray(skills) ? JSON.stringify(skills) : skills;
        const languagesJson = Array.isArray(languages) ? JSON.stringify(languages) : languages;
        const portfolioJson = Array.isArray(portfolio) ? JSON.stringify(portfolio) : portfolio;

        // Mise à jour avec tous les champs
        const result = await pool.query(
            `UPDATE users 
            SET 
                full_name = $1,
                email = $2,
                phone = $3,
                avatar = $4,
                bio = $5,
                city = $6,
                province = $7,
                skills = $8,
                languages = $9,
                portfolio = $10,
                profession = $11,
                company_name = $12,
                industry = $13,
                team_size = $14,
                updated_at = NOW()
            WHERE id = $15
            RETURNING *`,
            [
                full_name,
                email,
                phone || null,
                avatar || null,
                bio || null,
                city || null,
                province || null,
                skillsJson || '[]',
                languagesJson || '[]',
                portfolioJson || '[]',
                profession || null,      
                company_name || null,    
                industry || null,        
                team_size || null,
                req.user.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.json({
            message: "Profile updated successfully",
            user: result.rows[0]
        });

    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ 
            message: "Server error while updating profile",
            error: err.message 
        });
    }
}

export const getUserProfile = async (req,res) => {
    try {
        const { id } = req.params;

        const userResult = await pool.query(
            `SELECT 
            id, full_name, email, account_type, bio, avatar, 
            profession, skills, languages, portfolio,
            company_name, industry, team_size,
            created_at 
            FROM users 
            WHERE id = $1`,
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
};