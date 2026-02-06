// frontend/src/hooks/useMessages.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: string;
  chat_room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  sender?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export function useMessages(chatRoomId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!chatRoomId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);

      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_room_id', chatRoomId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        if (messagesData) {
          const senderIds = [...new Set(messagesData.map(m => m.user_id))];
          
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, email, full_name, avatar_url')
            .in('id', senderIds);

          const profilesMap = new Map(
            profilesData?.map(p => [p.id, p]) || []
          );

          const messagesWithSenders = messagesData.map(msg => ({
            ...msg,
            sender: profilesMap.get(msg.user_id),
          }));

          setMessages(messagesWithSenders);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatRoomId]);

  useEffect(() => {
    if (!chatRoomId) return;

    const channel = supabase
      .channel(`messages:${chatRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${chatRoomId}`,
        },
        async (payload) => {
          // ✅ Profile - SANS .single()
          const { data: senderDataArray } = await supabase
            .from('profiles')
            .select('id, email, full_name, avatar_url')
            .eq('id', payload.new.user_id)
            .limit(1);

          const senderData = senderDataArray?.[0] || null;

          const newMessage = {
            ...payload.new,
            sender: senderData,
          } as Message;

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoomId]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !chatRoomId || !user) return;

    setSending(true);

    try {
      const { error } = await supabase.from('messages').insert({
        chat_room_id: chatRoomId,
        user_id: user.id,
        content: content.trim(),
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return { messages, loading, sending, sendMessage };
}