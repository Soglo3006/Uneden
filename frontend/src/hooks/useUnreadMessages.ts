// frontend/src/hooks/useUnreadMessages.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export interface UnreadChat {
  id: string;
  chat_room_id: string;
  last_message: string;
  last_message_time: string;
  sender_name: string;
  sender_avatar: string | null;
  sender_id: string;
  is_read: boolean;
}

export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadChats, setUnreadChats] = useState<UnreadChat[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUnreadMessages = async () => {
      try {
        // 1. Récupérer tous les chats de l'user
        const { data: memberData } = await supabase
          .from('chat_room_member')
          .select('chat_room_id')
          .eq('user_id', user.id);

        if (!memberData || memberData.length === 0) {
          setUnreadChats([]);
          setUnreadCount(0);
          setLoading(false);
          return;
        }

        const chatRoomIds = memberData.map(m => m.chat_room_id);

        // 2. Pour chaque chat, récupérer le dernier message
        const chatsWithMessages = await Promise.all(
          chatRoomIds.map(async (chatId) => {
            // Dernier message du chat
            const { data: lastMsg } = await supabase
              .from('messages')
              .select('*')
              .eq('chat_room_id', chatId)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (!lastMsg) return null;

            // Si le message n'est pas de nous et qu'on ne l'a pas lu
            if (lastMsg.user_id !== user.id) {
              // Récupérer les infos du sender
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .eq('id', lastMsg.user_id)
                .single();

              // Vérifier s'il y a des messages non lus
              // On considère un message comme "lu" s'il y a un message plus récent de notre part
              const { data: ourLastMsg } = await supabase
                .from('messages')
                .select('created_at')
                .eq('chat_room_id', chatId)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

              const isUnread = !ourLastMsg || 
                new Date(lastMsg.created_at) > new Date(ourLastMsg.created_at);

              if (isUnread) {
                return {
                  id: lastMsg.id,
                  chat_room_id: chatId,
                  last_message: lastMsg.content,
                  last_message_time: lastMsg.created_at,
                  sender_name: senderProfile?.full_name || 'Unknown',
                  sender_avatar: senderProfile?.avatar_url || null,
                  sender_id: lastMsg.user_id,
                  is_read: false,
                };
              }
            }

            return null;
          })
        );

        // Filtrer les null et trier par date
        const unread = chatsWithMessages
          .filter((chat): chat is UnreadChat => chat !== null)
          .sort((a, b) => 
            new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
          );

        setUnreadChats(unread);
        setUnreadCount(unread.length);
      } catch (error) {
        console.error('Error fetching unread messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadMessages();

    // Real-time : écouter les nouveaux messages
    const channel = supabase
      .channel('new-messages-notif')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          // Si ce n'est pas notre message, recharger
          if (payload.new.user_id !== user.id) {
            fetchUnreadMessages();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (chatRoomId: string) => {
    // Retirer de la liste locale
    setUnreadChats(prev => prev.filter(c => c.chat_room_id !== chatRoomId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return { unreadChats, unreadCount, loading, markAsRead };
}