"use client";

import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { ArrowDown, MessageCircle, Check, CheckCheck, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageBubble } from './MessageBubble';
import { FileMessage } from './FileMessage';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { PinnedMessages } from './PinnedMessages';
import { VoiceMessage } from './VoiceMessage';
import { MessageActions } from './MessageActions';
import { MessageReactions } from './MessageReactions';
import { Skeleton } from '@/components/ui/skeleton';

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === yesterday.toDateString()) return 'Hier';

  const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    const day = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

  const sameYear = date.getFullYear() === today.getFullYear();
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

const SKELETON_BUBBLES = [
  { isOwn: false, w: 'w-48' },
  { isOwn: true,  w: 'w-36' },
  { isOwn: false, w: 'w-64' },
  { isOwn: true,  w: 'w-52' },
  { isOwn: false, w: 'w-40' },
  { isOwn: true,  w: 'w-44' },
  { isOwn: false, w: 'w-56' },
] as const;

interface MessageSender {
  account_type?: string;
  company_name?: string;
  full_name?: string;
  avatar_url?: string;
}

interface MessageReaction {
  emoji: string;
  user_ids: string[];
}

interface RepliedTo {
  id: string;
  content: string;
  user_id: string;
  sender_name?: string;
  deleted_at?: string | null;
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  status?: 'sending' | 'sent' | 'failed';
  pinned_at?: string | null;
  edited_at?: string | null;
  read_at?: string | null;
  deleted_at?: string | null;
  reactions?: MessageReaction[];
  replied_to?: RepliedTo | null;
  replied_to_message_id?: string | null;
  sender?: MessageSender | null;
  client_temp_id?: string;
}

interface MessageThreadProps {
  messages: Message[];
  loading: boolean;
  currentUserId: string;
  otherUser?: {
    id?: string;
    full_name?: string;
    company_name?: string;
    account_type?: string;
    avatar_url?: string;
  } | null;
  hoveredMessageId: string | null;
  setHoveredMessageId: (key: string | null) => void;
  openMenuKey: string | null;
  setOpenMenuKey: (key: string | null) => void;
  selectedMessageKey: string | null;
  setSelectedMessageKey: (key: string | null) => void;
  retryMessage?: (tempId: string) => Promise<void>;
  onReply?: (message: any) => void; 
  onReplyClick?: (messageId: string) => void;
  onReactionToggle?: (messageId: string, emoji: string, currentReactions: any[]) => Promise<void>;
  onEdit?: (messageId: string, newContent: string) => void;
  onPin?: (messageId: string, isPinned: boolean) => void;
  onDelete?: (messageId: string) => Promise<void>;
  isTyping?: boolean;
  hasMore?: boolean;
  loadingMore?: boolean;
  loadMore?: () => Promise<number>;
}

export function MessageThread({
  messages,
  loading,
  currentUserId,
  otherUser,
  hoveredMessageId,
  setHoveredMessageId,
  openMenuKey,
  setOpenMenuKey,
  selectedMessageKey,
  setSelectedMessageKey,
  retryMessage,
  onReply,
  onReplyClick,
  onReactionToggle,
  onEdit, 
  onPin,
  isTyping,
  onDelete,
  hasMore,
  loadingMore,
  loadMore,
}: MessageThreadProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const prevMessagesLength = useRef(0);
    const isInitialLoad = useRef(true);
    const hoverTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    // Infinite scroll: scroll-position preservation on prepend
    const prevScrollHeightRef = useRef(0);
    const prevFirstMsgIdRef = useRef('');
    // Tells the scroll-to-bottom effect to skip when messages were prepended (loadMore)
    const isPrependingRef = useRef(false);

    // Stable refs so the scroll listener (with [] deps) always sees fresh values
    const hasMoreRef = useRef(hasMore ?? false);
    const loadingMoreRef = useRef(loadingMore ?? false);
    const loadMoreRef = useRef(loadMore);

    // Keep refs in sync via effect (React Compiler requires refs only be written in effects/handlers)
    useEffect(() => { hasMoreRef.current = hasMore ?? false; }, [hasMore]);
    useEffect(() => { loadingMoreRef.current = loadingMore ?? false; }, [loadingMore]);
    useEffect(() => { loadMoreRef.current = loadMore; }, [loadMore]);


    // Index of last own sent message — read receipt only rendered there
    const lastOwnSentIndex = messages.reduce((found, msg, idx) => {
      if (msg.user_id === currentUserId && msg.status !== 'sending' && msg.status !== 'failed') return idx;
      return found;
    }, -1);

    const pinnedMessages = messages
      .filter(msg => msg.pinned_at && msg.content !== 'Message supprimé')
      .sort((a, b) => new Date(a.pinned_at!).getTime() - new Date(b.pinned_at!).getTime())
      .map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_name: msg.sender?.account_type === 'company'
          ? msg.sender.company_name
          : msg.sender?.full_name,
      }));

    const scrollViewportRef = useRef<HTMLDivElement | null>(null);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
      const viewport = scrollViewportRef.current;
      if (!viewport) return;
      if (behavior === 'instant') {
        viewport.scrollTop = viewport.scrollHeight;
      } else {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior });
      }
    };

  // Scroll to bottom BEFORE the browser paints — eliminates any visible scroll jump
  useLayoutEffect(() => {
    if (messages.length > 0 && isInitialLoad.current) {
      const viewport = scrollViewportRef.current;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
        isInitialLoad.current = false;
      }
    }
  }, [messages]);

  useEffect(() => {
    isInitialLoad.current = true;
    prevMessagesLength.current = 0;
    prevScrollHeightRef.current = 0;
    prevFirstMsgIdRef.current = '';
  }, [otherUser?.id]);

  // Restore scroll position after older messages are prepended
  useLayoutEffect(() => {
    if (!prevScrollHeightRef.current) return;
    const firstId = messages[0]?.id ?? '';
    if (firstId === prevFirstMsgIdRef.current) return; // no prepend yet
    const viewport = scrollViewportRef.current;
    if (!viewport) return;
    viewport.scrollTop += viewport.scrollHeight - prevScrollHeightRef.current;
    prevScrollHeightRef.current = 0;
    prevFirstMsgIdRef.current = '';
  }, [messages]);


  useEffect(() => {
    const el = scrollViewportRef.current;
    if (!el) return;

    const onScroll = () => {
        const threshold = 120;
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
        setShowScrollToBottom(!atBottom);

        // Trigger load-more when within 80px of the top
        if (el.scrollTop < 80 && hasMoreRef.current && !loadingMoreRef.current) {
          isPrependingRef.current = true;
          prevScrollHeightRef.current = el.scrollHeight;
          prevFirstMsgIdRef.current = el.querySelector('[id^="message-"]')?.id?.replace('message-', '') ?? '';
          loadMoreRef.current?.();
        }
    };

    el.addEventListener('scroll', onScroll);
    onScroll(); 

    return () => el.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const prevLen = prevMessagesLength.current;
        const hasNew = messages.length > prevLen && prevLen > 0;

        if (hasNew) {
            // Skip auto-scroll when loadMore prepended older messages
            if (isPrependingRef.current) {
              isPrependingRef.current = false;
              prevMessagesLength.current = messages.length;
              return;
            }

            const lastMessage = messages[messages.length - 1];
            const isMine = lastMessage?.user_id === currentUserId;

            if (isMine) {
              scrollToBottom('smooth');
              setShowScrollToBottom(false);
            } else {
              if (!showScrollToBottom) {
                scrollToBottom('smooth');
              }
            }
        }

        prevMessagesLength.current = messages.length;
        }, [messages, showScrollToBottom, currentUserId]);

  if (!otherUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <MessageCircle className="h-12 w-12" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-600">
            Choose a conversation from the left to start messaging
          </p>
        </div>
      </div>
    );
  }



  return (
    <div className="relative flex-1 min-h-0 overflow-hidden flex flex-col">
      <PinnedMessages
        pinnedMessages={pinnedMessages}
        onMessageClick={onReplyClick || (() => {})}
        onUnpin={(messageId) => onPin?.(messageId, true)}
      />

      <ScrollArea className="flex-1 min-h-0" ref={(node: { querySelector?: (s: string) => Element | null } | null) => {
        if (!node) return;
        const viewport = node.querySelector?.('[data-radix-scroll-area-viewport]');
        if (viewport) scrollViewportRef.current = viewport as HTMLDivElement;
        }}>
        <div className="p-4 bg-gray-50">
          {/* Load-more spinner shown at the very top when fetching older pages */}
          {loadingMore && (
            <div className="flex justify-center py-3">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}
          {loading ? (
            <div className="space-y-5 min-h-[400px] py-2">
              {SKELETON_BUBBLES.map((s, i) => (
                <div key={i} className={`flex items-end gap-2 ${s.isOwn ? 'justify-end' : 'justify-start'}`}>
                  {!s.isOwn && <Skeleton className="h-8 w-8 rounded-full bg-gray-200 shrink-0" />}
                  <Skeleton className={`h-10 rounded-2xl bg-gray-200 ${s.w}`} style={{ animationDelay: `${i * 80}ms` }} />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div
              className="space-y-4"
              onPointerDown={() => {
                setSelectedMessageKey(null);
                setOpenMenuKey(null);
              }}
            >
              {messages.map((message, index) => {
                const isLastOwnSent = index === lastOwnSentIndex;
                const isOwn = message.user_id === currentUserId;
                const showDate =
                  index === 0 ||
                  new Date(message.created_at).toDateString() !==
                    new Date(messages[index - 1].created_at).toDateString();

                return (
                  <div key={message.id} id={`message-${message.id}`}>
                    {showDate && (
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 font-medium shrink-0">
                          {getDateLabel(message.created_at)}
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    )}

                    <div className={`flex flex-col gap-2 ${isOwn ? 'items-end' : 'items-start'}`}>
                      {message.content.includes('[AUDIO:') ? (
                        (() => {
                          const match = message.content.match(/\[AUDIO:(.*?):(\d+)\]/);
                          const audioUrl = match ? match[1] : '';
                          const dur = match ? parseInt(match[2]) : 0;
                          return (
                            <div
                              onMouseEnter={() => {
                                const t = hoverTimeoutRef.current.get(message.id);
                                if (t) { clearTimeout(t); hoverTimeoutRef.current.delete(message.id); }
                                setHoveredMessageId(message.id);
                              }}
                              onMouseLeave={() => {
                                if (openMenuKey === message.id) return;
                                const t = setTimeout(() => {
                                  setHoveredMessageId(null);
                                  hoverTimeoutRef.current.delete(message.id);
                                }, 150);
                                hoverTimeoutRef.current.set(message.id, t);
                              }}
                              className={`relative flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                              {!isOwn && (
                                <Avatar className="h-8 w-8 shrink-0">
                                  {otherUser?.avatar_url ? <AvatarImage src={otherUser.avatar_url} /> : null}
                                  <AvatarFallback className="text-xs">
                                    {(otherUser?.account_type === 'company'
                                      ? otherUser?.company_name
                                      : otherUser?.full_name || 'U'
                                    ).charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <VoiceMessage
                                audioUrl={audioUrl}
                                duration={dur}
                                isOwn={isOwn}
                              />
                              {message.reactions && message.reactions.length > 0 && (
                                <div className={`absolute -bottom-4 ${isOwn ? '-left-2' : '-right-2'}`}>
                                  <MessageReactions
                                    reactions={message.reactions}
                                    currentUserId={currentUserId}
                                    onReactionClick={(emoji) => onReactionToggle?.(message.id, emoji, message.reactions || [])}
                                    isOwn={isOwn}
                                  />
                                </div>
                              )}
                              {(hoveredMessageId === message.id || openMenuKey === message.id || selectedMessageKey === message.id) && (
                                <div
                                  className={`absolute ${isOwn ? 'right-full mr-2' : 'left-full ml-2'} top-1/2 -translate-y-1/2`}
                                  onMouseEnter={() => {
                                    const t = hoverTimeoutRef.current.get(message.id);
                                    if (t) { clearTimeout(t); hoverTimeoutRef.current.delete(message.id); }
                                    setHoveredMessageId(message.id);
                                  }}
                                  onMouseLeave={() => {
                                    if (openMenuKey === message.id) return;
                                    const t = setTimeout(() => {
                                      setHoveredMessageId(null);
                                      hoverTimeoutRef.current.delete(message.id);
                                    }, 150);
                                    hoverTimeoutRef.current.set(message.id, t);
                                  }}
                                >
                                  <MessageActions
                                    messageKey={message.id}
                                    openMenuKey={openMenuKey}
                                    setOpenMenuKey={setOpenMenuKey}
                                    onReact={(emoji) => onReactionToggle?.(message.id, emoji, message.reactions || [])}
                                    onReply={() => onReply?.(message)}
                                    onDelete={() => onDelete?.(message.id)}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })()
                        ) : message.content.includes('[FILE:') ? (
                        (() => {
                          const match = message.content.match(/\[FILE:(.*?)\]/);
                          const fileUrl = match ? match[1] : '';
                          const text = message.content.replace(/\[FILE:.*?\]/, '').trim();
                          const isImage = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(fileUrl);

                          return (
                            <FileMessage
                              messageId={message.id}
                              text={text}
                              fileUrl={fileUrl}
                              isImage={isImage}
                              isOwn={isOwn}
                              currentUserId={currentUserId}  
                              status={message.status}  
                              repliedTo={message.replied_to}
                              onReplyClick={onReplyClick}
                              reactions={message.reactions}  
                              otherUser={otherUser}
                              hoveredMessageId={hoveredMessageId}
                              openMenuKey={openMenuKey}
                              selectedMessageKey={selectedMessageKey}
                              setHoveredMessageId={setHoveredMessageId}
                              setOpenMenuKey={setOpenMenuKey}
                              setSelectedMessageKey={setSelectedMessageKey}
                              onReact={(emoji) => {  
                                onReactionToggle?.(message.id, emoji, message.reactions || []);
                              }}
                              onReactionToggle={(emoji) => { 
                                onReactionToggle?.(message.id, emoji, message.reactions || []);
                              }}
                              isPinned={!!message.pinned_at}
                              onReply={() => onReply?.(message)}
                              onPin={() => onPin?.(message.id, !!message.pinned_at)}
                              onDelete={() => onDelete?.(message.id)}
                            />
                          );
                        })()
                      ) : (
                        <MessageBubble
                          messageId={message.id}
                          content={message.content}
                          isOwn={isOwn}
                          currentUserId={currentUserId}
                          status={message.status}
                          editedAt={message.edited_at}
                          isPinned={!!message.pinned_at}
                          repliedTo={message.replied_to}  
                          onReplyClick={onReplyClick} 
                          otherUser={otherUser}
                          isHovered={hoveredMessageId === message.id}
                          isMenuOpen={openMenuKey === message.id}
                          isSelected={selectedMessageKey === message.id}
                          openMenuKey={openMenuKey}
                          reactions={message.reactions}
                          setOpenMenuKey={setOpenMenuKey}
                          setHoveredMessageId={setHoveredMessageId}
                          setSelectedMessageKey={setSelectedMessageKey}
                          onReply={() => onReply?.(message)}
                          onDelete={() => onDelete?.(message.id)}
                          onEdit={(newContent) => onEdit?.(message.id, newContent)}
                          onPin={() => onPin?.(message.id, !!message.pinned_at)}
                          onRetry={() => {
                            if (message.status === 'failed') {
                              retryMessage?.(message.id);
                            }
                          }}
                          onReact={(emoji) => {
                            onReactionToggle?.(message.id, emoji, message.reactions || []);
                          }}
                          onReactionToggle={(emoji) => {
                            onReactionToggle?.(message.id, emoji, message.reactions || []);
                          }}
                        />
                      )}
                    </div>

                    <div className={`flex items-center gap-2 mt-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      
                      {/* Accusé de lecture — uniquement sur le dernier message envoyé */}
                      {isOwn && isLastOwnSent && message.status !== 'sending' && message.status !== 'failed' && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={`text-xs cursor-help ${message.read_at ? 'text-green-600' : 'text-gray-400'}`}>
                              {message.read_at 
                                ? <CheckCheck className="h-3.5 w-3.5" />
                                : <Check className="h-3.5 w-3.5" />
                              }
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {message.read_at 
                                ? `Lu à ${new Date(message.read_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                                : 'Envoyé'
                              }
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex items-end gap-2">
                  <div className="bg-white border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm w-16">
                    <div className="flex items-center justify-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {showScrollToBottom && !loading && messages.length > 0 && (
      <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-2 left-1/2 z-50 -translate-x-1/2 h-11 w-11 rounded-full bg-green-700 cursor-pointer text-white shadow-lg flex items-center justify-center transition-all duration-300 animate-in fade-in zoom-in-95"  >
          <ArrowDown className="h-5 w-5" />
      </button>
      )}
      </div>
  );
}