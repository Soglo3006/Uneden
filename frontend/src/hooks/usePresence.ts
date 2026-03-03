import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function usePresence(userId: string | null) {
  useEffect(() => {
    if (!userId) return;

    // Marquer online
    const setOnline = async () => {
      await supabase.from('user_presence').upsert({
        user_id: userId,
        is_online: true,
        last_seen: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    };

    // Marquer offline
    const setOffline = async () => {
      await supabase.from('user_presence').upsert({
        user_id: userId,
        is_online: false,
        last_seen: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    };

    setOnline();

    // Écoute visibilité de la page
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') setOnline();
      else setOffline();
    };

    // Écoute fermeture de la page
    const handleBeforeUnload = () => setOffline();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      setOffline();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId]);
}