"use client";

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sanitizeMessage } from '@/lib/sanitize';

interface ReplyPreviewProps {
  repliedMessage: {
    id: string;
    content: string;
    user_id: string;
    sender_name?: string;
  } | null;
  onCancel: () => void;
}

export function ReplyPreview({ repliedMessage, onCancel }: ReplyPreviewProps) {
  if (!repliedMessage) return null;

  // Extraire le texte et le fichier
  const fileMatch = repliedMessage.content.match(/\[FILE:(.*?)\]/);
  const fileUrl = fileMatch ? fileMatch[1] : null;
  const messageText = repliedMessage.content.replace(/\[FILE:.*?\]/g, '').trim();
  const isImage = fileUrl ? /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl) : false;

  return (
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex items-start gap-2">
        {/* Barre verticale verte */}
        <div className="w-1 bg-green-700 rounded-full self-stretch flex-shrink-0" />
        
        {/* Miniature image si applicable */}
        {isImage && fileUrl && (
          <img 
            src={fileUrl} 
            alt="Preview" 
            className="w-12 h-12 rounded object-cover flex-shrink-0"
          />
        )}
        
        {/* Contenu */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <p className="text-xs font-semibold text-green-700">
            Répondre à {repliedMessage.sender_name || 'Utilisateur'}
          </p>
          <div className="text-sm text-gray-600 truncate">
            {isImage}
            {!isImage && fileUrl}
            {messageText && (isImage || fileUrl ? ' • ' : '')}
            <span 
              dangerouslySetInnerHTML={{ 
                __html: sanitizeMessage(messageText) 
              }} 
            />
          </div>
        </div>

        {/* Bouton fermer */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-6 w-6 text-gray-400 hover:text-gray-600 flex-shrink-0 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}