import pool from "../config/db.js";
import { notifyNewMessage } from "../services/emailService.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiver_id, content, booking_id } = req.body;
    const sender_id = req.user.id;

    if (!receiver_id || !content) {
      return res.status(400).json({ message: "Receiver and content are required" });
    }

    if (sender_id === receiver_id) {
      return res.status(400).json({ message: "You cannot send a message to yourself" });
    }

    // Chercher ou créer une conversation
    let conversation = await pool.query(
      `SELECT * FROM conversations 
       WHERE ((user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1))`,
      [sender_id, receiver_id]
    );

    let conversation_id;

    if (conversation.rows.length === 0) {
      const newConv = await pool.query(
        `INSERT INTO conversations (user1_id, user2_id, booking_id) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [sender_id, receiver_id, booking_id || null]
      );
      conversation_id = newConv.rows[0].id;
    } else {
      conversation_id = conversation.rows[0].id;
      
      // Vérifier si on a un booking
      const hasBooking = conversation.rows[0].booking_id !== null;
      
      if (!hasBooking) {
        // Compter les messages de cet utilisateur dans cette conversation
        const messageCount = await pool.query(
          `SELECT COUNT(*) as count FROM messages 
           WHERE conversation_id = $1 AND sender_id = $2`,
          [conversation_id, sender_id]
        );
        
        const count = parseInt(messageCount.rows[0].count);
        
        // Limite de 3 messages sans booking
        if (count >= 3) {
          return res.status(403).json({ 
            message: "You've reached the message limit. Please book a service to continue the conversation.",
            needsBooking: true 
          });
        }
      }
    }

    // Créer le message
    const message = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, receiver_id, content) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [conversation_id, sender_id, receiver_id, content]
    );

    await pool.query(
      `UPDATE conversations SET last_message_at = NOW() WHERE id = $1`,
      [conversation_id]
    );

    // Notification email
    const users = await pool.query(
      `SELECT 
        u1.email as receiver_email, 
        u1.full_name as receiver_name,
        u2.full_name as sender_name
       FROM users u1, users u2
       WHERE u1.id = $1 AND u2.id = $2`,
      [receiver_id, sender_id]
    );

    if (users.rows.length > 0) {
      const { receiver_email, receiver_name, sender_name } = users.rows[0];
      const messagePreview = content.length > 50 ? content.substring(0, 50) + "..." : content;
      await notifyNewMessage(receiver_email, receiver_name, sender_name, messagePreview, conversation_id);
    }

    res.status(201).json(message.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while sending message" });
  }
};

export const getMyConversations = async (req, res) => {
  try {
    const user_id = req.user.id;

    const conversations = await pool.query(
      `SELECT 
         c.id,
         c.booking_id,
         c.last_message_at,
         COALESCE(b.status, 'no_booking') as booking_status,
         COALESCE(s.title, 'Direct message') as service_title,
         CASE 
           WHEN c.user1_id = $1 THEN u2.id
           ELSE u1.id
         END as other_user_id,
         CASE 
           WHEN c.user1_id = $1 THEN COALESCE(u2.full_name, u2.company_name)
           ELSE COALESCE(u1.full_name, u1.company_name)
         END as other_user_name,
         CASE
           WHEN c.user1_id = $1 THEN u2.avatar
           ELSE u1.avatar
         END as other_user_avatar,
         (SELECT content FROM messages 
          WHERE conversation_id = c.id 
          ORDER BY created_at DESC LIMIT 1) as last_message,
         (SELECT COUNT(*) FROM messages 
          WHERE conversation_id = c.id 
          AND receiver_id = $1 
          AND is_read = false) as unread_count
       FROM conversations c
       JOIN users u1 ON c.user1_id = u1.id
       JOIN users u2 ON c.user2_id = u2.id
       LEFT JOIN bookings b ON c.booking_id = b.id
       LEFT JOIN services s ON b.service_id = s.id
       WHERE c.user1_id = $1 OR c.user2_id = $1
       ORDER BY c.last_message_at DESC`,
      [user_id]
    );

    res.json(conversations.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching conversations" });
  }
};


export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const user_id = req.user.id;

    const conversation = await pool.query(
      `SELECT * FROM conversations 
       WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
      [conversationId, user_id]
    );

    if (conversation.rows.length === 0) {
      return res.status(403).json({ message: "You are not part of this conversation" });
    }

    const messages = await pool.query(
      `SELECT m.*, u.full_name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC`,
      [conversationId]
    );

    await pool.query(
      `UPDATE messages 
       SET is_read = true 
       WHERE conversation_id = $1 
       AND receiver_id = $2 
       AND is_read = false`,
      [conversationId, user_id]
    );

    res.json(messages.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching messages" });
  }
};

export const getConversationByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const user_id = req.user.id;
    const booking = await pool.query(
      `SELECT * FROM bookings 
       WHERE id = $1 AND (client_id = $2 OR worker_id = $2)`,
      [bookingId, user_id]
    );

    if (booking.rows.length === 0) {
      return res.status(403).json({ message: "You are not part of this booking" });
    }

    const conversation = await pool.query(
      `SELECT c.*, 
         CASE 
           WHEN c.user1_id = $2 THEN u2.full_name
           ELSE u1.full_name
         END as other_user_name
       FROM conversations c
       JOIN users u1 ON c.user1_id = u1.id
       JOIN users u2 ON c.user2_id = u2.id
       WHERE c.booking_id = $1`,
      [bookingId]
    );

    if (conversation.rows.length === 0) {
      return res.json({ 
        exists: false, 
        booking_id: bookingId,
        other_user_id: booking.rows[0].client_id === user_id 
          ? booking.rows[0].worker_id 
          : booking.rows[0].client_id
      });
    }

    res.json({ 
      exists: true, 
      conversation: conversation.rows[0] 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching conversation" });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const user_id = req.user.id;

    const result = await pool.query(
      `UPDATE messages 
       SET is_read = true 
       WHERE id = $1 AND receiver_id = $2
       RETURNING *`,
      [messageId, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Message not found or not yours" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while marking message as read" });
  }
};

export const getOrCreateConversationWithUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }

    const existingConversation = await pool.query(
      `SELECT c.*, 
        COALESCE(b.status, 'no_booking') as booking_status,
        COALESCE(s.title, 'Direct message') as service_title,
        CASE 
          WHEN c.user1_id = $1 THEN COALESCE(u2.full_name, u2.company_name)
          ELSE COALESCE(u1.full_name, u1.company_name)
        END as other_user_name,
        CASE 
          WHEN c.user1_id = $1 THEN u2.id
          ELSE u1.id
        END as other_user_id,
        CASE
          WHEN c.user1_id = $1 THEN u2.avatar
          ELSE u1.avatar
        END as other_user_avatar,
        (SELECT content FROM messages 
         WHERE conversation_id = c.id 
         ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM messages 
         WHERE conversation_id = c.id 
         AND receiver_id = $1 
         AND is_read = false) as unread_count
      FROM conversations c
      JOIN users u1 ON c.user1_id = u1.id
      JOIN users u2 ON c.user2_id = u2.id
      LEFT JOIN bookings b ON c.booking_id = b.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE (c.user1_id = $1 AND c.user2_id = $2) 
         OR (c.user1_id = $2 AND c.user2_id = $1)
      ORDER BY c.last_message_at DESC
      LIMIT 1`,
      [currentUserId, userId]
    );

    if (existingConversation.rows.length > 0) {
      return res.json({
        exists: true,
        conversation: existingConversation.rows[0]
      });
    }

    // Pas de conversation existante, récupérer les infos de l'utilisateur
    const otherUser = await pool.query(
      `SELECT id, full_name, company_name, account_type, avatar FROM users WHERE id = $1`,
      [userId]
    );



    if (otherUser.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      exists: false,
      needsBooking: false,
      otherUser: otherUser.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while checking conversation" });
  }
};
