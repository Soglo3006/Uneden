import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useTypingIndicator(chatId: string | null, currentUserId: string | null) {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopTyping = useCallback(async () => {
    if (!chatId || !currentUserId) return;
    await supabase
      .from('typing_indicators')
      .delete()
      .eq('chat_room_id', chatId)
      .eq('user_id', currentUserId);
  }, [chatId, currentUserId]);

  // Envoyer le statut "en train d'écrire"
  const sendTyping = useCallback(async () => {
    if (!chatId || !currentUserId) return;

    await supabase
      .from('typing_indicators')
      .upsert({
        chat_room_id: chatId,
        user_id: currentUserId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'chat_room_id,user_id' });

    // Auto-stop après 3s sans frappe
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => stopTyping(), 3000);
  }, [chatId, currentUserId, stopTyping]);

  // Cleanup quand on change de conv
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      stopTyping();
    };
  }, [chatId]);

  return { sendTyping, stopTyping };
}