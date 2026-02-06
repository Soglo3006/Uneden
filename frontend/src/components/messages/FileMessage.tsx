"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageActions } from './MessageActions';

interface FileMessageProps {
  messageId: string;
  text?: string;
  fileUrl: string;
  isImage: boolean;
  isOwn: boolean;
  otherUser?: {
    avatar_url?: string;
    account_type?: string;
    company_name?: string;
    full_name?: string;
  } | null;
  hoveredMessageId: string | null;
  openMenuKey: string | null;
  selectedMessageKey: string | null;
  setHoveredMessageId: (key: string | null) => void;
  setOpenMenuKey: (key: string | null) => void;
  setSelectedMessageKey: (key: string | null) => void;
}

export function FileMessage({
  messageId,
  text,
  fileUrl,
  isImage,
  isOwn,
  otherUser,
  hoveredMessageId,
  openMenuKey,
  selectedMessageKey,
  setHoveredMessageId,
  setOpenMenuKey,
  setSelectedMessageKey,
}: FileMessageProps) {
  const keyText = `${messageId}-text`;
  const keyImage = `${messageId}-image`;

  const actionsVisible = (key: string) =>
    hoveredMessageId === key || openMenuKey === key || selectedMessageKey === key;

  return (
    <>
      {/* TEXTE (si présent) */}
      {text && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onMouseEnter={() => setHoveredMessageId(keyText)}
          onMouseLeave={() => {
            if (openMenuKey !== keyText && selectedMessageKey !== keyText) {
              setHoveredMessageId(null);
            }
          }}
          onClick={() => setSelectedMessageKey(prev => (prev === keyText ? null : keyText))}
          className={`flex gap-2 items-start ${isOwn ? 'flex-row' : 'flex-row-reverse'}`}
        >
          {/* Actions */}
          {actionsVisible(keyText) && (
            <MessageActions
              messageKey={keyText}
              openMenuKey={openMenuKey}
              setOpenMenuKey={setOpenMenuKey}
            />
          )}

          {/* Avatar + Bulle */}
          <div className="flex items-end gap-2">
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

            <div
              className={`rounded-2xl px-4 py-2 ${
                isOwn
                  ? 'bg-green-700 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{text}</p>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE */}
      {isImage && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onMouseEnter={() => setHoveredMessageId(keyImage)}
          onMouseLeave={() => {
            if (openMenuKey !== keyImage && selectedMessageKey !== keyImage) {
              setHoveredMessageId(null);
            }
          }}
          onClick={() => setSelectedMessageKey(prev => (prev === keyImage ? null : keyImage))}
          className={`flex gap-2 items-center ${isOwn ? 'flex-row' : 'flex-row-reverse'}`}
        >
          {/* Actions */}
          {actionsVisible(keyImage) && (
            <MessageActions
              messageKey={keyImage}
              openMenuKey={openMenuKey}
              setOpenMenuKey={setOpenMenuKey}
            />
          )}

          {/* Avatar + Image */}
          <div className="flex items-end gap-2">
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

            <img
              src={fileUrl}
              alt="Attachment"
              className="max-w-xs max-h-64 rounded-xl cursor-pointer object-cover shadow-md"
              onClick={(e) => {
                if (openMenuKey === keyImage || selectedMessageKey === keyImage) {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                window.open(fileUrl, '_blank');
              }}
            />
          </div>
        </div>
      )}

      {/* PDF */}
      {!isImage && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 p-3 rounded-xl shadow-sm ${
            isOwn
              ? 'bg-green-50 hover:bg-green-100 border border-green-200'
              : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <span className="text-sm font-medium">📄 View file</span>
        </a>
      )}
    </>
  );
}