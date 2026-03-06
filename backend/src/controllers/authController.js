import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import { notifyPasswordChanged } from "../services/emailService.js";

export const changePassword = async (req, res) => {
    console.log(req.body);
    console.log(req.user);
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Validation
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ 
                message: "Old password and new password are required" 
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ 
                message: "New password must be at least 8 characters" 
            });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({ 
                message: "New password must be different from current password" 
            });
        }

        // Récupérer l'utilisateur avec le mot de passe
        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = result.rows[0];

        // Vérifier l'ancien mot de passe
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                message: "Current password is incorrect" 
            });
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe
        await pool.query(
            'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
            [hashedPassword, userId]
        );

        // Notify user by email
        const displayName = user.account_type === "company" ? user.company_name : user.full_name;
        notifyPasswordChanged(user.email, displayName || user.email)
          .catch((err) => console.error("Password changed email failed:", err.message));

        res.json({
            message: "Password changed successfully"
        });

    } catch (err) {
        console.error("Error changing password:", err);
        res.status(500).json({ 
            message: "Server error while changing password",
            error: err.message 
        });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;

        // Supprimer l'utilisateur de la base de données
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING id, email',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }


        res.json({ 
            message: "Account deleted successfully" 
        });

    } catch (err) {
        res.status(500).json({ 
            message: "Server error while deleting account",
            error: err.message 
        });
    }
};