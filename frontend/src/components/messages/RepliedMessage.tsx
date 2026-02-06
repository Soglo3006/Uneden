"use client";

interface RepliedMessageProps {
  repliedTo: {
    id: string;
    content: string;
    sender_name?: string;
  };
  onMessageClick: (messageId: string) => void;
}

export function RepliedMessage({ repliedTo, onMessageClick }: RepliedMessageProps) {
  // Extraire le texte
  const messageText = repliedTo.content.replace(/\[FILE:.*?\]/g, '').trim();
  const hasFile = repliedTo.content.includes('[FILE:');

  return (
    <div
      onClick={() => onMessageClick(repliedTo.id)}
      className="border-l-4 border-green-700 bg-green-50/50 pl-3 py-2 mb-2 rounded cursor-pointer hover:bg-green-50 transition-colors"
    >
      <p className="text-xs font-semibold text-green-700 mb-1">
        {repliedTo.sender_name || 'Utilisateur'}
      </p>
      <p className="text-sm text-gray-600 truncate">
        {hasFile && '📎 '}
        {messageText || 'Fichier'}
      </p>
    </div>
  );
}