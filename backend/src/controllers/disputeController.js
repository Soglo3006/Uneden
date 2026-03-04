import pool from "../config/db.js";
import { notifyDisputeCreated } from "../services/emailService.js";

export const CreateDispute = async (req, res) => {
    try {
        const { booking_id, description} = req.body;
        const raised_by = req.user.id;
        const status = "open";

        const booking = await pool.query("SELECT * FROM bookings WHERE id = $1", [booking_id]);
        if (booking.rows.length === 0) {
            return res.status(404).json({message: "Booking not found" });
        }
        const b = booking.rows[0];
        if (b.client_id !== req.user.id && b.worker_id !== req.user.id) {
            return res.status(403).json({ message: "You are not part of this booking" });
        }
        const allowed = ["open", "resolved", "rejected"];
        if (!allowed.includes(status)) {
        return res.status(400).json({ message: "Invalid dispute status" });
        }

        const existing = await pool.query(
        "SELECT * FROM disputes WHERE booking_id = $1",
        [booking_id]
        );

        if (existing.rows.length > 0) {
        return res.status(400).json({ message: "A dispute already exists for this booking" });
        }

        const result = await pool.query(
            `INSERT INTO disputes (booking_id, raised_by, description, status) VALUES ($1, $2, $3, $4) RETURNING *`,
            [booking_id, raised_by, description, status]
        );

        const users = await pool.query(
            `SELECT
                u1.email as client_email,
                CASE WHEN u1.account_type = 'company' THEN u1.company_name ELSE u1.full_name END as client_name,
                u2.email as worker_email,
                CASE WHEN u2.account_type = 'company' THEN u2.company_name ELSE u2.full_name END as worker_name
            FROM users u1, users u2
            WHERE u1.id = $1 AND u2.id = $2`,
            [b.client_id, b.worker_id]
        );

        if (users.rows.length > 0) {
            const { client_email, client_name, worker_email, worker_name } = users.rows[0];
            await notifyDisputeCreated(client_email, client_name, booking_id, description);
            await notifyDisputeCreated(worker_email, worker_name, booking_id, description);
        }

        res.status(201).json(result.rows[0]);
    } catch (err){
        console.error(err);
        res.status(500).json({ message: "Server error while creating dispute" });
    }
}

export const GetDisputes = async (req, res) => {
    try{
        const { id } = req.params;

        const result = await pool.query(
            `SELECT * FROM disputes WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Dispute not found" });
        }

        res.status(200).json(result.rows[0]);

    } catch(err){
        console.error(err);
        res.status(500).json({ message: "Server error while fetching dispute" });
    }
}

export const UpdateDispute = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowed = ["open", "resolved", "rejected"];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: "Invalid dispute status" });
        }

        const dispute = await pool.query(
            `SELECT d.*, b.client_id, b.worker_id 
             FROM disputes d
             JOIN bookings b ON d.booking_id = b.id
             WHERE d.id = $1`,
            [id]
        );

        if (dispute.rows.length === 0) {
            return res.status(404).json({ message: "Dispute not found" });
        }

        const d = dispute.rows[0];

        if (d.client_id !== req.user.id && d.worker_id !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to update this dispute" });
        }

        const result = await pool.query(
            `UPDATE disputes SET status = $1 WHERE id = $2 RETURNING *`,
            [status, id]
        );

        res.status(200).json(result.rows[0]);

    } catch(err){
        console.error(err);
        res.status(500).json({ message: "Server error while updating dispute" });
    }
}