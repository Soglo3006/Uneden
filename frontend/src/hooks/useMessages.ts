import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export type MessageStatus = 'sending' | 'sent' | 'failed';

export interface Message {
  id: string;
  chat_room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  read_at?: string | null;
  edited_at?: string | null;
  pinned_at?: string | null;
  client_temp_id?: string | null;
  deleted_at?: string | null;
  replied_to_message_id?: string | null;
  reactions?: Reaction[];
  status?: MessageStatus;
  sender?: {
    id: string;
    email: string;
    full_name: string;
    company_name?: string;
    account_type?: string;
    avatar_url: string | null;
  };
  replied_to?: {
    id: string;
    content: string;
    user_id: string;
    sender_name?: string;
    deleted_at?: string | null;
  } | null;
}

interface Reaction {  
  emoji: string;
  user_ids: string[];
}

export function useMessages(chatRoomId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const makeTempId = () =>
    `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`;

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
          .select(`
            *,
            replied_to:replied_to_message_id (
              id,
              content,
              user_id,
              deleted_at
            )
          `)
          .eq('chat_room_id', chatRoomId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        if (messagesData) {
          const senderIds = [...new Set(messagesData.map((m) => m.user_id))];

          // Fetch sender profiles
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, email, full_name, company_name, account_type, avatar_url')
            .in('id', senderIds);

          const profilesMap = new Map(
            profilesData?.map((p) => [p.id, p]) || []
          );

          // Fetch replied message senders
          const repliedUserIds = messagesData
            .filter((m: any) => m.replied_to?.user_id)
            .map((m: any) => m.replied_to.user_id);

          const { data: repliedProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, company_name, account_type')
            .in('id', repliedUserIds);

          const repliedProfilesMap = new Map(
            repliedProfiles?.map((p) => [p.id, p]) || []
          );

          const messagesWithDetails = messagesData.map((msg: any) => {
            let repliedToData = null;

            if (msg.replied_to) {
              const repliedProfile = repliedProfilesMap.get(msg.replied_to.user_id);
              repliedToData = {
                id: msg.replied_to.id,
                content: msg.replied_to.content,
                user_id: msg.replied_to.user_id,
                sender_name: repliedProfile?.account_type === 'company'
                  ? repliedProfile.company_name
                  : repliedProfile?.full_name,
              };
            }

            return {
              ...msg,
              status: 'sent' as const,
              sender: profilesMap.get(msg.user_id),
              replied_to: repliedToData,
            };
          });

          setMessages(messagesWithDetails);
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
          const row = payload.new as any;

          // Fetch sender
          const { data: senderDataArray } = await supabase
            .from('profiles')
            .select('id, email, full_name, company_name, account_type, avatar_url')
            .eq('id', row.user_id)
            .limit(1);

          const senderData = senderDataArray?.[0] || null;

          // Fetch replied message if exists
          let repliedToData = null;
          if (row.replied_to_message_id) {
            const { data: repliedMsgArray } = await supabase
              .from('messages')
              .select('id, content, user_id')
              .eq('id', row.replied_to_message_id)
              .limit(1);

            if (repliedMsgArray?.[0]) {
              const { data: repliedProfileArray } = await supabase
                .from('profiles')
                .select('id, full_name, company_name, account_type')
                .eq('id', repliedMsgArray[0].user_id)
                .limit(1);

              const repliedProfile = repliedProfileArray?.[0];

              repliedToData = {
                id: repliedMsgArray[0].id,
                content: repliedMsgArray[0].content,
                user_id: repliedMsgArray[0].user_id,
                sender_name: repliedProfile?.account_type === 'company'
                  ? repliedProfile.company_name
                  : repliedProfile?.full_name,
              };
            }
          }

          const incoming: Message = {
            ...row,
            sender: senderData,
            replied_to: repliedToData,
            status: 'sent',
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;

            if (incoming.client_temp_id) {
              const idx = prev.findIndex(
                (m) => m.client_temp_id && m.client_temp_id === incoming.client_temp_id
              );
              if (idx !== -1) {
                const copy = [...prev];
                copy[idx] = incoming;
                return copy;
              }
            }

            return [...prev, incoming];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoomId]);


  useEffect(() => {
    if (!chatRoomId) return;

    const channel = supabase
      .channel(`updates:${chatRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${chatRoomId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          
          setMessages((prev) =>
            prev.map((msg) => {
              // Mettre à jour le message modifié
              if (msg.id === updated.id) {
                // Si supprimé
                if (updated.deleted_at) {
                  return { 
                    ...msg, 
                    content: 'Message supprimé',
                    deleted_at: updated.deleted_at,
                    reactions: []
                  };
                }
                
                // Sinon, mettre à jour réactions + read_at
                return { 
                  ...msg, 
                  content: updated.content,        
                  edited_at: updated.edited_at,
                  pinned_at: updated.pinned_at,
                  reactions: updated.reactions,
                  read_at: updated.read_at  
                };
              }
              
              // Mettre à jour les messages qui répondent au message supprimé
              if (msg.replied_to_message_id === updated.id && updated.deleted_at) {
                return {
                  ...msg,
                  replied_to: msg.replied_to
                    ? { ...msg.replied_to, deleted_at: updated.deleted_at, content: 'Message supprimé' }
                    : null,
                };
              }
              
              return msg;
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoomId]);



  const sendMessage = async (content: string, repliedToMessageId?: string | null) => {
    if (!content.trim() || !chatRoomId || !user) return;

    const trimmed = content.trim();
    const tempId = makeTempId();
    const nowIso = new Date().toISOString();

    const optimistic: Message = {
      id: tempId,
      client_temp_id: tempId,
      chat_room_id: chatRoomId,
      user_id: user.id,
      content: trimmed,
      created_at: nowIso,
      replied_to_message_id: repliedToMessageId || null,
      status: 'sending',
      replied_to: repliedToMessageId
      ? (() => {
          const target = messages.find(m => m.id === repliedToMessageId);
          return target
            ? { id: target.id, content: target.content, user_id: target.user_id, sender_name: target.sender?.full_name }
            : null;
        })()
      : null,
    };

    setMessages((prev) => [...prev, optimistic]);
    setSending(true);

    try {
      const { error } = await supabase.from('messages').insert({
        chat_room_id: chatRoomId,
        user_id: user.id,
        content: trimmed,
        client_temp_id: tempId,
        replied_to_message_id: repliedToMessageId || null,
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m))
      );
    } finally {
      setSending(false);
    }
  };

  const retryMessage = async (tempId: string) => {
    const msg = messages.find((m) => m.id === tempId);
    if (!msg) return;
    await sendMessage(msg.content, msg.replied_to_message_id);
  };

  return { messages, loading, sending, sendMessage, retryMessage };
}