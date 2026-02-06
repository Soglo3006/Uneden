"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageActions } from './MessageActions';

interface MessageBubbleProps {
  messageId: string;
  content: string;
  isOwn: boolean;
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
  setOpenMenuKey: (key: string | null) => void;
  setHoveredMessageId: (key: string | null) => void;
  setSelectedMessageKey: (key: string | null) => void;
  onReact?: () => void;
  onReply?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
}

export function MessageBubble({
  messageId,
  content,
  isOwn,
  otherUser,
  isHovered,
  isMenuOpen,
  isSelected,
  openMenuKey,
  setOpenMenuKey,
  setHoveredMessageId,
  setSelectedMessageKey,
  onReact,
  onReply,
  onPin,
  onDelete,
}: MessageBubbleProps) {
  const showActions = isHovered || isMenuOpen || isSelected;

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onMouseEnter={() => setHoveredMessageId(messageId)}
      onMouseLeave={() => {
        if (openMenuKey !== messageId && !isSelected) {
          setHoveredMessageId(null);
        }
      }}
      onClick={() => setSelectedMessageKey(prev => (prev === messageId ? null : messageId))}
      className={`flex gap-2 items-center ${isOwn ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Boutons d'action */}
      {showActions && (
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

        {/* Bulle de message */}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-green-700 text-white'
              : 'bg-white border border-gray-200 text-gray-900'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}