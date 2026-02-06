"use client";

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  // Extraire le texte (sans les fichiers)
  const messageText = repliedMessage.content.replace(/\[FILE:.*?\]/g, '').trim();
  const hasFile = repliedMessage.content.includes('[FILE:');

  return (
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex items-start gap-2">
        {/* Barre verticale verte */}
        <div className="w-1 bg-green-700 rounded-full self-stretch flex-shrink-0" />
        
        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-green-700 mb-1">
            Répondre à {repliedMessage.sender_name || 'Utilisateur'}
          </p>
          <p className="text-sm text-gray-600 truncate">
            {hasFile && '📎 '}
            {messageText || 'Fichier'}
          </p>
        </div>

        {/* Bouton fermer */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-6 w-6 text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}