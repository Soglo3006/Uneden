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
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      try {
        const { data: memberData, error: memberError } = await supabase
          .from('chat_room_member')
          .select('chat_room_id')
          .eq('user_id', user.id);

        if (memberError) {
          console.error('Error fetching memberships:', memberError);
          setLoading(false);
          return;
        }

        if (!memberData || memberData.length === 0) {
          setChats([]);
          setLoading(false);
          return;
        }

        const chatRoomIds = memberData.map(m => m.chat_room_id);

        const { data: roomsData, error: roomsError } = await supabase
          .from('chat_room')
          .select('*')
          .in('id', chatRoomIds);

        if (roomsError) {
          console.error('Error fetching rooms:', roomsError);
          setLoading(false);
          return;
        }

        if (!roomsData) {
          setChats([]);
          setLoading(false);
          return;
        }

        const chatsWithDetails = await Promise.all(
          roomsData.map(async (room) => {
            const { data: lastMessageArray } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('chat_room_id', room.id)
              .order('created_at', { ascending: false })
              .limit(1);

            const lastMessage = lastMessageArray?.[0] || null;

            let otherUser = null;
            if (!room.is_group) {
              const { data: members } = await supabase
                .from('chat_room_member')
                .select('user_id')
                .eq('chat_room_id', room.id);

              if (members) {
                const otherUserId = members.find(m => m.user_id !== user.id)?.user_id;
                
                if (otherUserId) {
                  const { data: userDataArray } = await supabase
                    .from('profiles')
                    .select('id, email, full_name, company_name, account_type, avatar_url, bio')
                    .eq('id', otherUserId)
                    .limit(1);

                  otherUser = userDataArray?.[0] || null;
                }
              }
            }

            const { count: unreadCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('chat_room_id', room.id)
              .neq('user_id', user.id)
              .is('read_at', null);

            return {
              ...room,
              last_message: lastMessage || undefined,
              other_user: otherUser || undefined,
              unread_count: unreadCount || 0,
              is_archived: false, 
            };
          })
        );

        // Trier par dernier message
        chatsWithDetails.sort((a, b) => {
          const dateA = a.last_message?.created_at || a.created_at;
          const dateB = b.last_message?.created_at || b.created_at;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        setChats(chatsWithDetails);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    // Real-time
    const channel = supabase
      .channel('user-chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_room_member',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { chats, loading };
}