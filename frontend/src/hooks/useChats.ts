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
}

export function useChats() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      console.log('❌ No user, skipping fetch');
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      try {
        console.log('🔍 [useChats] Fetching chats for user:', user.id);
        
        // 1. Récupérer les chat rooms où l'user est membre
        const { data: memberData, error: memberError } = await supabase
          .from('chat_room_member')
          .select('chat_room_id')
          .eq('user_id', user.id);

        console.log('📊 [useChats] Member data:', memberData);

        if (memberError) {
          console.error('❌ [useChats] Error fetching memberships:', memberError);
          setLoading(false);
          return;
        }

        if (!memberData || memberData.length === 0) {
          console.log('⚠️ [useChats] No chat memberships found');
          setChats([]);
          setLoading(false);
          return;
        }

        const chatRoomIds = memberData.map(m => m.chat_room_id);
        console.log('📝 [useChats] Chat room IDs:', chatRoomIds);

        // 2. Récupérer les infos des chat rooms
        const { data: roomsData, error: roomsError } = await supabase
          .from('chat_room')
          .select('*')
          .in('id', chatRoomIds);

        console.log('🏠 [useChats] Rooms data:', roomsData);

        if (roomsError) {
          console.error('❌ [useChats] Error fetching rooms:', roomsError);
          setLoading(false);
          return;
        }

        if (!roomsData) {
          console.log('⚠️ [useChats] No rooms found');
          setChats([]);
          setLoading(false);
          return;
        }

        // 3. Pour chaque chat, récupérer le dernier message et l'autre user
        const chatsWithDetails = await Promise.all(
          roomsData.map(async (room) => {
            console.log(`🔄 [useChats] Processing room ${room.id}`);

            // Dernier message
            const { data: lastMessageArray  } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('chat_room_id', room.id)
              .order('created_at', { ascending: false })
              .limit(1)

            const lastMessage = lastMessageArray?.[0] || null;

            // Si chat direct, récupérer l'autre user
            let otherUser = null;
            // Ligne ~95 dans useChats.ts
if (!room.is_group) {
  const { data: members } = await supabase
    .from('chat_room_member')
    .select('user_id')
    .eq('chat_room_id', room.id);

  console.log('🔍 === DEBUG CHAT ===');
  console.log('🔍 Room ID:', room.id);
  console.log('🔍 All members:', members);
  console.log('🔍 Current user ID:', user.id);
  console.log('🔍 Current user type:', typeof user.id);

  if (members) {
    // Vérifier chaque membre
    members.forEach(m => {
      console.log('🔍 Member:', m.user_id, 'Type:', typeof m.user_id);
      console.log('🔍 Is this me?', m.user_id === user.id);
      console.log('🔍 String comparison:', m.user_id.toString() === user.id.toString());
    });

    const otherUserId = members.find(m => m.user_id !== user.id)?.user_id;
    
    console.log('🔍 Other user ID found:', otherUserId);
    console.log('🔍 ==================');
    
    if (otherUserId) {
      const { data: userDataArray } = await supabase
        .from('profiles')
        .select('id, email, full_name, company_name, account_type, avatar_url, bio')
        .eq('id', otherUserId)
        .limit(1);

      console.log('🔍 Profile fetched:', userDataArray?.[0]);

      otherUser = userDataArray?.[0] || null;
    }
  }
}

            return {
              ...room,
              last_message: lastMessage || undefined,
              other_user: otherUser || undefined,
            };
          })
        );

        // Trier par dernier message
        chatsWithDetails.sort((a, b) => {
          const dateA = a.last_message?.created_at || a.created_at;
          const dateB = b.last_message?.created_at || b.created_at;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        console.log('✅ [useChats] Final chats:', chatsWithDetails);
        setChats(chatsWithDetails);
      } catch (error) {
        console.error('❌ [useChats] Error:', error);
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
          console.log('🔔 [useChats] Real-time update');
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