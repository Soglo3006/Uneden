import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useIsTyping(chatId: string | null, otherUserId?: string) {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!chatId || !otherUserId) return;

    const channel = supabase
      .channel(`typing-${chatId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'typing_indicators',
        filter: `chat_room_id=eq.${chatId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          if ((payload.new as any).user_id === otherUserId) {
            setIsTyping(true);
          }
        }
        if (payload.eventType === 'DELETE') {
          if ((payload.old as any).user_id === otherUserId) {
            setIsTyping(false);
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [chatId, otherUserId]);

  return isTyping;
}