import streamClient from "../config/streamChat.js";
import pool from "../config/db.js";
import crypto from "crypto";

export const getStreamToken = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer les infos de l'utilisateur depuis la DB
    const userResult = await pool.query(
      `SELECT full_name, company_name, account_type, avatar FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];
    const displayName = user.account_type === 'person' 
      ? user.full_name 
      : user.company_name;

    // Créer ou mettre à jour l'utilisateur dans Stream
    await streamClient.upsertUser({
      id: userId,
      name: displayName,
      image: user.avatar || '',
      role: 'user',
    });

    // Générer un token pour l'utilisateur
    const token = streamClient.createToken(userId);

    res.json({ 
      token,
      apiKey: process.env.STREAM_API_KEY,
      userId 
    });
  } catch (err) {
    console.error('Stream token error:', err);
    res.status(500).json({ message: "Error generating Stream token" });
  }
};

export const createBookingChannel = async (req, res) => {
  try {
    const { booking_id } = req.body;
    
    // Récupérer les infos du booking
    const booking = await pool.query(
      `SELECT b.*, s.title,
        u1.full_name as client_name, u1.company_name as client_company,
        u1.account_type as client_type, u1.avatar as client_avatar,
        u2.full_name as worker_name, u2.company_name as worker_company,
        u2.account_type as worker_type, u2.avatar as worker_avatar
       FROM bookings b 
       JOIN services s ON b.service_id = s.id
       JOIN users u1 ON b.client_id = u1.id
       JOIN users u2 ON b.worker_id = u2.id
       WHERE b.id = $1`,
      [booking_id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const b = booking.rows[0];
    const userId = req.user.id;

    // Vérifier que l'utilisateur fait partie du booking
    if (b.client_id !== userId && b.worker_id !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Préparer les infos des utilisateurs pour Stream
    const clientName = b.client_type === 'person' ? b.client_name : b.client_company;
    const workerName = b.worker_type === 'person' ? b.worker_name : b.worker_company;

    // Upsert des deux utilisateurs dans Stream
    await streamClient.upsertUsers([
      {
        id: b.client_id,
        name: clientName,
        image: b.client_avatar || '',
      },
      {
        id: b.worker_id,
        name: workerName,
        image: b.worker_avatar || '',
      }
    ]);

    // Créer le channel dans Stream
    const channelId = `booking-${booking_id}`;
    const channel = streamClient.channel('messaging', channelId, {
      name: `Booking: ${b.title}`,
      members: [b.client_id, b.worker_id],
      created_by_id: userId,
      booking_id: booking_id,
      service_title: b.title,
    });

    await channel.create();

    res.json({ 
      channelId: channelId,
      channelType: 'messaging' 
    });
  } catch (err) {
    console.error('Channel creation error:', err);
    res.status(500).json({ message: "Error creating channel" });
  }
};

export const createDirectChannel = async (req, res) => {
  try {
    const { recipient_id } = req.body;
    const currentUserId = req.user.id;

    if (recipient_id === currentUserId) {
      return res.status(400).json({ message: "Cannot message yourself" });
    }

    const users = await pool.query(
      `SELECT id, full_name, company_name, account_type, avatar 
       FROM users WHERE id = ANY($1)`,
      [[currentUserId, recipient_id]]
    );

    if (users.rows.length !== 2) {
      return res.status(404).json({ message: "User not found" });
    }

    // Upsert des utilisateurs dans Stream
    const streamUsers = users.rows.map(u => ({
      id: u.id,
      name: u.account_type === 'person' ? u.full_name : u.company_name,
      image: u.avatar || '',
    }));

    await streamClient.upsertUsers(streamUsers);

    // CRÉER UN CHANNEL ID PLUS COURT avec un hash
    // Trier les IDs pour avoir toujours le même hash peu importe l'ordre
    const sortedIds = [currentUserId, recipient_id].sort().join('-');
    // Créer un hash MD5 (32 caractères)
    const hash = crypto.createHash('md5').update(sortedIds).digest('hex');
    const channelId = `dm-${hash}`; // dm-{32 caractères} = 35 caractères total

    const otherUser = users.rows.find(u => u.id === recipient_id);
    const otherUserName = otherUser.account_type === 'person' 
      ? otherUser.full_name 
      : otherUser.company_name;

    const channel = streamClient.channel('messaging', channelId, {
      name: `Chat with ${otherUserName}`,
      members: [currentUserId, recipient_id],
      created_by_id: currentUserId,
    });

    await channel.create();

    res.json({ 
      channelId: channelId,
      channelType: 'messaging' 
    });
  } catch (err) {
    console.error('Direct channel creation error:', err);
    res.status(500).json({ message: "Error creating channel" });
  }
};