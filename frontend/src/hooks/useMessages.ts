import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export function useMessages(chatRoomId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const requestIdRef = useRef(0);

  const messagesCacheRef = useRef<Map<string, Message[]>>(new Map());

  const profilesCacheRef = useRef<Map<string, any>>(new Map());

  const makeTempId = () =>
    `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  // charge profils manquants en batch
  const ensureProfiles = async (ids: string[]) => {
    const missing = ids.filter((id) => !profilesCacheRef.current.has(id));
    if (!missing.length) return;

    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, company_name, account_type, avatar_url')
      .in('id', missing);

    (data || []).forEach((p) => profilesCacheRef.current.set(p.id, p));
  };

  useEffect(() => {
    if (!chatRoomId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const currentRequestId = ++requestIdRef.current;

    // show cache instantly (Messenger feel)
    const cached = messagesCacheRef.current.get(chatRoomId);
    if (cached) {
      setMessages(cached);
      setLoading(false);
    } else {
      setMessages([]);
      setLoading(true);
    }

    const fetchMessages = async () => {
      try {
        const { data: messagesData, error } = await supabase
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
          

        if (error) throw error;

        // si request stale, on ignore
        if (currentRequestId !== requestIdRef.current) return;

        const senderIds = [...new Set((messagesData || []).map((m: any) => m.user_id))];

        // replied profiles only if needed
        const repliedUserIds = [...new Set(
          (messagesData || [])
            .filter((m: any) => m.replied_to?.user_id)
            .map((m: any) => m.replied_to.user_id)
        )];

        await ensureProfiles([...senderIds, ...repliedUserIds]);

        const messagesWithDetails: Message[] = (messagesData || []).map((msg: any) => {
          let repliedToData = null;

          if (msg.replied_to) {
            const repliedProfile = profilesCacheRef.current.get(msg.replied_to.user_id);
            repliedToData = {
              id: msg.replied_to.id,
              content: msg.replied_to.content,
              user_id: msg.replied_to.user_id,
              deleted_at: msg.replied_to.deleted_at,
              sender_name:
                repliedProfile?.account_type === 'company'
                  ? repliedProfile.company_name
                  : repliedProfile?.full_name,
            };
          }

          return {
            ...msg,
            status: 'sent',
            sender: profilesCacheRef.current.get(msg.user_id) || null,
            replied_to: repliedToData,
          };
        });

        setMessages(messagesWithDetails);
        messagesCacheRef.current.set(chatRoomId, messagesWithDetails);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        if (currentRequestId === requestIdRef.current) setLoading(false);
      }
    };

    fetchMessages();
  }, [chatRoomId]);

  // INSERT listener (plus léger + utilise caches)
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

          // évite overwrite si on a changé de chat pendant l’async
          const activeId = chatRoomId;

          // assure profile sender via cache (1 requête max si missing)
          await ensureProfiles([row.user_id]);

          // replied_to: enrich seulement si on peut sans faire 2-3 requêtes
          // (si tu veux full details, on pourra le faire async mais pas bloquant)
          let repliedToData = null;
          if (row.replied_to_message_id) {
            // si le message replied-to est déjà dans messages (cache/local), on enrichit sans requête
            const existing = (messagesCacheRef.current.get(activeId) || []).find(
              (m) => m.id === row.replied_to_message_id
            );
            if (existing) {
              repliedToData = {
                id: existing.id,
                content: existing.content,
                user_id: existing.user_id,
                sender_name: existing.sender?.account_type === 'company'
                  ? existing.sender.company_name
                  : existing.sender?.full_name,
                deleted_at: existing.deleted_at || null,
              };
            }
          }

          const incoming: Message = {
            ...row,
            sender: profilesCacheRef.current.get(row.user_id) || null,
            replied_to: repliedToData,
            status: 'sent',
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;

            // replace optimistic by client_temp_id
            if (incoming.client_temp_id) {
              const idx = prev.findIndex((m) => m.client_temp_id === incoming.client_temp_id);
              if (idx !== -1) {
                const copy = [...prev];
                copy[idx] = incoming;
                messagesCacheRef.current.set(activeId, copy);
                return copy;
              }
            }

            const next = [...prev, incoming];
            messagesCacheRef.current.set(activeId, next);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoomId]);

  // UPDATE listener: garde, mais pense à mettre à jour le cache aussi
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
          const activeId = chatRoomId;

          setMessages((prev) => {
            const next = prev.map((msg) => {
              if (msg.id === updated.id) {
                if (updated.deleted_at) {
                  return { ...msg, content: 'Message supprimé', deleted_at: updated.deleted_at, reactions: [] };
                }
                return {
                  ...msg,
                  content: updated.content,
                  edited_at: updated.edited_at,
                  pinned_at: updated.pinned_at ?? msg.pinned_at,
                  reactions: updated.reactions,
                  read_at: updated.read_at,
                };
              }

              if (msg.replied_to_message_id === updated.id && updated.deleted_at) {
                return {
                  ...msg,
                  replied_to: msg.replied_to
                    ? { ...msg.replied_to, deleted_at: updated.deleted_at, content: 'Message supprimé' }
                    : null,
                };
              }

              return msg;
            });

            messagesCacheRef.current.set(activeId, next);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoomId]);

  // sendMessage: garde, mais update aussi le cache
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
            const target = messages.find((m) => m.id === repliedToMessageId);
            return target
              ? { id: target.id, content: target.content, user_id: target.user_id, sender_name: target.sender?.full_name }
              : null;
          })()
        : null,
    };

    setMessages((prev) => {
      const next = [...prev, optimistic];
      messagesCacheRef.current.set(chatRoomId, next);
      return next;
    });

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

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatRoomId,
          senderUserId: user.id,
          messagePreview: trimmed.substring(0, 100),
        }),
      }).catch(console.error);
      
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages((prev) => {
        const next = prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m));
        messagesCacheRef.current.set(chatRoomId, next);
        return next;
      });
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