"use client";

import { Pin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_name?: string;
}

interface PinnedMessagesProps {
  pinnedMessages: Message[];
  onMessageClick: (messageId: string) => void;
  onUnpin: (messageId: string) => void;
}

export function PinnedMessages({ 
  pinnedMessages, 
  onMessageClick, 
  onUnpin 
}: PinnedMessagesProps) {
  if (pinnedMessages.length === 0) return null;

  return (
    <div className="border-b bg-blue-50 px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <Pin className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-semibold text-blue-900">
          Messages épinglés ({pinnedMessages.length}/3)
        </span>
      </div>
      
      <ScrollArea className="max-h-32">
        <div className="space-y-2">
          {pinnedMessages.map((message) => {
            // Extraire le texte (sans [FILE:...])
            const textContent = message.content.replace(/\[FILE:.*?\]/g, '').trim();
            const hasFile = message.content.includes('[FILE:');
            
            return (
              <div
                key={message.id}
                className="flex items-start gap-2 p-2 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer group"
                onClick={() => onMessageClick(message.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-900 mb-1">
                    {message.sender_name || 'Utilisateur'}
                  </p>
                  <p className="text-sm text-gray-700 truncate">
                    {hasFile }
                    {textContent}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnpin(message.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}