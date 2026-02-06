"use client";

import { useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';
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
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(0);
  const isInitialLoad = useRef(true);

  // Scroll initial
  useEffect(() => {
    if (messages.length > 0 && isInitialLoad.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
        isInitialLoad.current = false;
      }, 100);
    }
  }, [messages]);

  // Reset lors du changement de chat
  useEffect(() => {
    isInitialLoad.current = true;
    prevMessagesLength.current = 0;
  }, [otherUser?.id]);

  // Scroll auto pour nouveaux messages
  useEffect(() => {
    if (messages.length > prevMessagesLength.current && prevMessagesLength.current > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  const displayName = (() => {
    if (!otherUser) return 'Unknown';
    const isPerson = otherUser.account_type === 'person';
    const isCompany = otherUser.account_type === 'company';
    return isPerson
      ? otherUser.full_name
      : isCompany
      ? otherUser.company_name
      : otherUser.full_name || 'Unknown';
  })();

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
    <>
      {/* Header sticky */}
      <div className="sticky top-0 z-10 p-4 border-b flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-4 border-white shadow-lg">
            {otherUser.avatar_url ? (
              <AvatarImage src={otherUser.avatar_url} alt={displayName} />
            ) : null}
            <AvatarFallback className="text-md">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900">{displayName}</h2>
          </div>
        </div>
      </div>

      {/* Messages - CORRECTION ICI */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
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
                {messages.map((message, index) => {
                  const isOwn = message.user_id === currentUserId;
                  const showDate =
                    index === 0 ||
                    new Date(message.created_at).toDateString() !==
                      new Date(messages[index - 1].created_at).toDateString();

                  return (
                    <div key={message.id}>
                      {/* Date separator */}
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

                      {/* Message content */}
                      <div className={`flex flex-col gap-2 ${isOwn ? 'items-end' : 'items-start'}`}>
                        {message.content.includes('[FILE:') ? (
                          /* Message avec fichier */
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
                                otherUser={otherUser}
                                hoveredMessageId={hoveredMessageId}
                                openMenuKey={openMenuKey}
                                selectedMessageKey={selectedMessageKey}
                                setHoveredMessageId={setHoveredMessageId}
                                setOpenMenuKey={setOpenMenuKey}
                                setSelectedMessageKey={setSelectedMessageKey}
                              />
                            );
                          })()
                        ) : (
                          /* Message texte simple */
                          <MessageBubble
                            messageId={message.id}
                            content={message.content}
                            isOwn={isOwn}
                            otherUser={otherUser}
                            isHovered={hoveredMessageId === message.id}
                            isMenuOpen={openMenuKey === message.id}
                            isSelected={selectedMessageKey === message.id}
                            openMenuKey={openMenuKey}
                            setOpenMenuKey={setOpenMenuKey}
                            setHoveredMessageId={setHoveredMessageId}
                            setSelectedMessageKey={setSelectedMessageKey}
                          />
                        )}
                      </div>

                      {/* Timestamp */}
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
      </div>
    </>
  );
}