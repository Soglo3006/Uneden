import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useUserPresence(otherUserId?: string) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!otherUserId) return;

    // Fetch initial
    const fetchPresence = async () => {
      const { data } = await supabase
        .from('user_presence')
        .select('is_online, last_seen')
        .eq('user_id', otherUserId)
        .single();
      
      if (data) setIsOnline(data.is_online);
    };

    fetchPresence();

    // Écoute realtime
    const channel = supabase
      .channel(`presence-${otherUserId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_presence',
        filter: `user_id=eq.${otherUserId}`,
      }, (payload) => {
        setIsOnline((payload.new as any).is_online);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [otherUserId]);

  return isOnline;
}