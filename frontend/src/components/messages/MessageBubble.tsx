"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageActions } from './MessageActions';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { RepliedMessage } from './RepliedMessage';
import { MessageReactions } from './MessageReactions';

interface Reaction {  
  emoji: string;
  user_ids: string[];
}

interface MessageBubbleProps {
  messageId: string;
  content: string;
  isOwn: boolean;
  currentUserId: string;  
  status?: 'sending' | 'sent' | 'failed';
  repliedTo?: {
    id: string;
    content: string;
    sender_name?: string;
  } | null;
  onReplyClick?: (messageId: string) => void;
  otherUser?: {
    avatar_url?: string;
    account_type?: string;
    company_name?: string;
    full_name?: string;
  } | null;
  isHovered: boolean;
  isMenuOpen: boolean;
  isSelected: boolean;
  openMenuKey: string | null;
  reactions?: Reaction[];  
  setOpenMenuKey: (key: string | null) => void;
  setHoveredMessageId: (key: string | null) => void;
  setSelectedMessageKey: (key: string | null) => void;
  onReact?: (emoji: string) => void;  
  onReply?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  onRetry?: () => void;
  onReactionToggle?: (emoji: string) => void;
}

export function MessageBubble({
  messageId,
  content,
  isOwn,
  currentUserId,  
  status = 'sent',
  repliedTo,
  onReplyClick,
  otherUser,
  isHovered,
  isMenuOpen,
  isSelected,
  openMenuKey,
  reactions,  
  setOpenMenuKey,
  setHoveredMessageId,
  setSelectedMessageKey,
  onReact,
  onReply,
  onPin,
  onDelete,
  onRetry,
  onReactionToggle,
}: MessageBubbleProps) {
  const showActions = isHovered || isMenuOpen || isSelected;
  const isSending = status === 'sending';
  const isFailed = status === 'failed';

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onMouseEnter={() => !isSending && setHoveredMessageId(messageId)}
      onMouseLeave={() => {
        if (openMenuKey !== messageId && !isSelected) {
          setHoveredMessageId(null);
        }
      }}
      onClick={() => !isSending && setSelectedMessageKey(prev => (prev === messageId ? null : messageId))}
      className={`flex gap-2 items-center ${isOwn ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Boutons d'action */}
      {showActions && !isSending && !isFailed && (
        <MessageActions
          messageKey={messageId}
          openMenuKey={openMenuKey}
          setOpenMenuKey={setOpenMenuKey}
          onReact={onReact}
          onReply={onReply}
          onPin={onPin}
          onDelete={onDelete}
        />
      )}

      {/* Bouton Retry pour messages failed */}
      {isFailed && isOwn && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 bg-red-50 border border-red-200 hover:bg-red-100 rounded-full shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onRetry?.();
              }}
            >
              <RefreshCw className="h-3 w-3 text-red-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Réessayer</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Avatar + Bulle */}
      <div className="flex items-end gap-2">
        {/* Avatar pour les messages de l'autre personne */}
        {!isOwn && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            {otherUser?.avatar_url ? (
              <AvatarImage src={otherUser.avatar_url} />
            ) : null}
            <AvatarFallback className="text-xs">
              {(() => {
                if (!otherUser) return 'U';
                const name = otherUser.account_type === 'company'
                  ? otherUser.company_name
                  : otherUser.full_name;
                return (name || 'U').charAt(0).toUpperCase();
              })()}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Conteneur pour replied + bulle + reactions */}
        <div className="flex flex-col gap-1">
          {/* Message cité */}
          {repliedTo && (
            <RepliedMessage
              repliedTo={repliedTo}
              onMessageClick={onReplyClick || (() => {})}
            />
          )}

          {/* Bulle de message avec réaction en position absolue */}
          <div className="relative">
            <div
              className={`rounded-2xl px-4 py-2 ${
                isOwn
                  ? isFailed
                    ? 'bg-red-100 border border-red-300 text-gray-900'
                    : 'bg-green-700 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              } ${isSending ? 'opacity-60' : ''}`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">
                {content}
              </p>

              {/* Indicateur sending */}
              {isSending && isOwn && (
                <div className="absolute -bottom-1 -right-1">
                  <Loader2 className="h-4 w-4 text-green-600 animate-spin" />
                </div>
              )}

              {/* Indicateur failed */}
              {isFailed && isOwn && (
                <div className="absolute -bottom-1 -right-1">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
              )}
            </div>

            {/* Réactions en position absolue - en bas à droite */}
            {reactions && reactions.length > 0 && (
              <div className="absolute -bottom-4 -right-2">
                <MessageReactions
                  reactions={reactions}
                  currentUserId={currentUserId}
                  onReactionClick={onReactionToggle || (() => {})}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}