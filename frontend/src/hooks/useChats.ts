import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatRoom {
  id: string;
  name: string | null;
  is_group: boolean;
  created_at: string;
  last_message?: {
    content: string;
    created_at: string;
  };
  other_user?: {
    id: string;
    email: string;
    full_name: string;
    company_name?: string;
    account_type?: string;
    avatar_url: string | null;
    bio?: string;
  };
  unread_count?: number;
  is_archived?: boolean;
}

export function useChats() {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setChats([]);
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      setLoading(true);
      try {
        // Requête existante pour récupérer les chats
        const { data: chatRoomMembers, error: membersError } = await supabase
          .from('chat_room_member')
          .select('chat_room_id')
          .eq('user_id', user.id);

        if (membersError) throw membersError;

        const chatRoomIds = chatRoomMembers?.map(m => m.chat_room_id) || [];

        if (chatRoomIds.length === 0) {
          setChats([]);
          setLoading(false);
          return;
        }

        const { data: chatRooms, error: roomsError } = await supabase
          .from('chat_room')
          .select('*')
          .in('id', chatRoomIds);

        if (roomsError) throw roomsError;

        // Récupérer les derniers messages
        const chatsWithDetails = await Promise.all(
          (chatRooms || []).map(async (room) => {
            const { data: members } = await supabase
              .from('chat_room_member')
              .select('user_id')
              .eq('chat_room_id', room.id)
              .neq('user_id', user.id);

            const otherUserId = members?.[0]?.user_id;

            const { data: otherUserProfile } = await supabase
              .from('profiles')
              .select('id,full_name, company_name, account_type, avatar_url, bio')
              .eq('id', otherUserId)
              .single();

            const { data: lastMessage } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('chat_room_id', room.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            return {
              ...room,
              other_user: otherUserProfile,
              last_message: lastMessage,
            };
          })
        );

        // Trier par dernier message (plus récent en premier)
        chatsWithDetails.sort((a, b) => {
          const timeA = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
          const timeB = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
          return timeB - timeA;
        });

        setChats(chatsWithDetails);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    const channel = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMessage = payload.new as any;

          // Mettre à jour le chat concerné
          setChats((prev) =>
            prev
              .map((chat) => {
                if (chat.id === newMessage.chat_room_id) {
                  return {
                    ...chat,
                    last_message: {
                      content: newMessage.content,
                      created_at: newMessage.created_at,
                    },
                  };
                }
                return chat;
              })
              // Re-trier par date de dernier message
              .sort((a, b) => {
                const timeA = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
                const timeB = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
                return timeB - timeA;
              })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);
  return { chats, loading };
}