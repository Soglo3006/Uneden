"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Chat {
  id: string;
  name?: string;
  last_message?: {
    content: string;
    created_at: string;
  };
  other_user?: {
    full_name?: string;
    company_name?: string;
    account_type?: string;
    avatar_url?: string;
  };
  unread_count?: number; 
  is_archived?: boolean; 
}

interface ConversationListProps {
  chats: Chat[];
  activeChatId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onChatSelect: (chatId: string) => void;
}

export function ConversationList({
  chats,
  activeChatId,
  searchQuery,
  onSearchChange,
  onChatSelect,
}: ConversationListProps) {
  const [filter, setFilter] = useState<string>('all');

  const filteredChats = chats.filter(chat => {
    // Filtre par recherche
    if (searchQuery.trim()) {
      const isPerson = chat.other_user?.account_type === 'person';
      const isCompany = chat.other_user?.account_type === 'company';
      
      const name = isPerson
        ? chat.other_user?.full_name
        : isCompany
        ? chat.other_user?.company_name
        : chat.other_user?.full_name || chat.name || '';
      
      if (!name?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }

    // Filtre par catégorie
    switch (filter) {
      case 'unread':
        return chat.unread_count && chat.unread_count > 0;
      case 'archived':
        return chat.is_archived === true;
      case 'all':
      default:
        return !chat.is_archived; 
    }
  });

  return (
    <div className="w-full md:w-80 border-r flex flex-col bg-white h-full min-h-0">
      {/* Search bar sticky */}
      <div className="sticky top-0 z-10 p-4 border-b bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Title + Filter Select sticky */}
      <div className="sticky top-[72px] z-10 px-4 py-3 border-b bg-white">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-gray-900 whitespace-nowrap">Messages</h2>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conversations list */}
      <ScrollArea className="flex-1">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>
              {filter === 'unread' 
                ? 'No unread messages' 
                : filter === 'archived'
                ? 'No archived conversations'
                : 'No conversations yet'}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const isPerson = chat.other_user?.account_type === 'person';
            const isCompany = chat.other_user?.account_type === 'company';

            const displayName = isPerson
              ? chat.other_user?.full_name
              : isCompany
              ? chat.other_user?.company_name
              : chat.other_user?.full_name || chat.name || 'Unknown';

            const lastMessagePreview = (() => {
              if (!chat.last_message?.content) return 'No messages yet';
              
              const content = chat.last_message.content;
              
              if (content.includes('[FILE:')) {
                const match = content.match(/\[FILE:(.*?)\]/);
                const fileUrl = match ? match[1] : '';
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
                
                return isImage ? ' Photo' : ' File';
              }
              
              return content;
            })();

            const timeDisplay = chat.last_message?.created_at
              ? new Date(chat.last_message.created_at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })
              : '';

            return (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`p-4 border-b cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-green-50 border-l-4 border-l-green-700'
                    : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-4 border-white shadow-lg">
                      {chat.other_user?.avatar_url ? (
                        <AvatarImage src={chat.other_user.avatar_url} alt={displayName} />
                      ) : null}
                      <AvatarFallback className="text-lg">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Badge unread count */}
                    {chat.unread_count && chat.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-700 text-[10px] font-bold text-white">
                        {chat.unread_count > 9 ? '9+' : chat.unread_count}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className={`font-semibold text-gray-900 truncate ${
                        chat.unread_count && chat.unread_count > 0 ? 'font-bold' : ''
                      }`}>
                        {displayName}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2">
                        {timeDisplay}
                      </span>
                    </div>
                    <p className={`text-sm text-gray-500 truncate mt-1 ${
                      chat.unread_count && chat.unread_count > 0 ? 'font-semibold text-gray-900' : ''
                    }`}>
                      {lastMessagePreview}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </ScrollArea>
    </div>
  );
}