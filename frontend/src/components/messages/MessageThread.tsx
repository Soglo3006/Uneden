"use client";

import { useRef, useEffect, useState } from 'react';
import { ArrowDown, MessageCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { FileMessage } from './FileMessage';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
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
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(0);
  const isInitialLoad = useRef(true);

    const scrollViewportRef = useRef<HTMLDivElement | null>(null);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    };

  useEffect(() => {
    if (messages.length > 0 && isInitialLoad.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
        isInitialLoad.current = false;
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    isInitialLoad.current = true;
    prevMessagesLength.current = 0;
  }, [otherUser?.id]);


  useEffect(() => {
    const el = scrollViewportRef.current;
    if (!el) return;

    const onScroll = () => {
        const threshold = 120;
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
        setShowScrollToBottom(!atBottom);
    };

    el.addEventListener('scroll', onScroll);
    onScroll(); 

    return () => el.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const prevLen = prevMessagesLength.current;
        const hasNew = messages.length > prevLen && prevLen > 0;

        if (hasNew) {
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
    <div className="relative flex-1 min-h-0 overflow-hidden">
      <ScrollArea className="h-full" ref={(node: any) => {
        if (!node) return;
        const viewport = node.querySelector?.('[data-radix-scroll-area-viewport]');
        if (viewport) scrollViewportRef.current = viewport as HTMLDivElement;
        }}>
        <div className="p-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
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
              {messages.map((message: any, index) => {
                const isOwn = message.user_id === currentUserId;
                const showDate =
                  index === 0 ||
                  new Date(message.created_at).toDateString() !==
                    new Date(messages[index - 1].created_at).toDateString();

                return (
                  <div key={message.id} id={`message-${message.id}`}>
                    {showDate && (
                      <div className="sticky top-0 z-10 text-center text-sm text-gray-500 my-4 py-2 bg-gray-50/80 backdrop-blur-sm rounded-full">
                        {new Date(message.created_at).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    )}

                    <div className={`flex flex-col gap-2 ${isOwn ? 'items-end' : 'items-start'}`}>
                      {message.content.includes('[FILE:') ? (
                        (() => {
                          const match = message.content.match(/\[FILE:(.*?)\]/);
                          const fileUrl = match ? match[1] : '';
                          const text = message.content.replace(/\[FILE:.*?\]/, '').trim();
                          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);

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
                      {isOwn && <span className="text-xs text-gray-500">✓✓</span>}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {showScrollToBottom && !loading && messages.length > 0 && (
    <button
        onClick={() => scrollToBottom('smooth')}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 h-11 w-11 rounded-full bg-green-700 text-white shadow-lg flex items-center justify-center hover:bg-green-800 transition-all duration-300 animate-in fade-in zoom-in-95"    >
        <ArrowDown className="h-5 w-5" />
    </button>
    )}
    </div>
  );
}