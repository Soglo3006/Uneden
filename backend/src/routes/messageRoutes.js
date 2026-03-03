import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { notifyNewMessage } from '../services/emailService.js';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

router.post('/notify', async (req, res) => {
  try {
    const { chatRoomId, senderUserId, messagePreview } = req.body;
    if (!chatRoomId || !senderUserId) return res.status(400).json({ error: 'Missing fields' });

    // Trouver le destinataire
    const { data: members } = await supabase
      .from('chat_room_member')
      .select('user_id')
      .eq('chat_room_id', chatRoomId)
      .neq('user_id', senderUserId);

    if (!members?.length) return res.json({ sent: false });

    const receiverId = members[0].user_id;

    // Vérifier si le destinataire est en ligne
    const { data: presence } = await supabase
      .from('user_presence')
      .select('last_seen')
      .eq('user_id', receiverId)
      .single();

    const isOnline = presence?.last_seen &&
      new Date(presence.last_seen) > new Date(Date.now() - 60 * 1000);

    if (isOnline) return res.json({ sent: false, reason: 'user online' });

    // Récupérer les profils
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name, company_name, account_type')
      .in('id', [senderUserId, receiverId]);

    const sender = profiles?.find(p => p.id === senderUserId);
    const receiver = profiles?.find(p => p.id === receiverId);

    if (!receiver?.email) return res.json({ sent: false });

    const senderName = sender?.account_type === 'company'
      ? sender.company_name
      : sender?.full_name || 'Quelqu\'un';

    const receiverName = receiver?.account_type === 'company'
      ? receiver.company_name
      : receiver?.full_name || 'là';

    await notifyNewMessage(
      receiver.email,
      receiverName,
      senderName,
      messagePreview.substring(0, 100),
      chatRoomId
    );

    res.json({ sent: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;