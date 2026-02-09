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
  // Extraire le texte et le fichier
  const fileMatch = repliedTo.content.match(/\[FILE:(.*?)\]/);
  const fileUrl = fileMatch ? fileMatch[1] : null;
  const messageText = repliedTo.content.replace(/\[FILE:.*?\]/g, '').trim();
  const isImage = fileUrl ? /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl) : false;

  return (
    <div
      onClick={() => onMessageClick(repliedTo.id)}
      className="border-l-4 border-green-700 bg-green-50/50 pl-3 py-2 mb-2 rounded cursor-pointer hover:bg-green-50 transition-colors"
    >
      <p className="text-xs font-semibold text-green-700 mb-2">
        {repliedTo.sender_name || 'Utilisateur'}
      </p>
      
      <div className="flex items-center gap-2">
        {/* Miniature image si applicable */}
        {isImage && fileUrl && (
          <img 
            src={fileUrl} 
            alt="Preview" 
            className="w-10 h-10 rounded object-cover flex-shrink-0"
          />
        )}
        
        {/* Texte du message */}
        <p className="text-sm text-gray-600 truncate flex-1">
          {isImage}
          {!isImage && fileUrl}
          {messageText && (isImage || fileUrl ? ' • ' : '')}{messageText}
        </p>
      </div>
    </div>
  );
}