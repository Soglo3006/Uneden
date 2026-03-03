"use client";

import { useState, useEffect } from 'react';
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
import { sanitizeMessage } from '@/lib/sanitize';

interface Chat {
  id: string;
  name?: string;
  last_message?: {
    content: string;
    created_at: string;
    user_id?: string;
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
  currentUserId: string | null;
}

function ConversationItem({ 
  chat, 
  isActive, 
  currentUserId, 
  onSelect,
  now,
}: { 
  chat: Chat; 
  isActive: boolean; 
  currentUserId: string | null; 
  onSelect: () => void;
  now: number;
}) {

  const unreadCount = chat.unread_count ?? 0;

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
  
  if (content.includes('[AUDIO:')) {
    const isOwn = chat.last_message.user_id === currentUserId;
    const senderName = chat.other_user?.account_type === 'company'
      ? chat.other_user?.company_name
      : chat.other_user?.full_name;
    return isOwn ? ' Vous avez envoyé un message vocal' : ` ${senderName} a envoyé un message vocal`;
  }
  
  if (content.includes('[FILE:')) {
    const match = content.match(/\[FILE:(.*?)\]/);
    const fileUrl = match ? match[1] : '';
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
    return isImage ? ' Photo' : ' Fichier';
  }
  
  return content;
})();

  const timeDisplay = (() => {
    if (!chat.last_message?.created_at) return '';

    const messageDate = new Date(chat.last_message.created_at).getTime();
    const diffMs = now - messageDate;

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 1) return diffMs < 30_000 ? "À l'instant" : "1 min";
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours} h`;
    if (diffDays < 7) return `${diffDays} j`;
    if (diffWeeks < 4) return `${diffWeeks} sem`;
    if (diffMonths < 12) return `${diffMonths} mois`;
    return `${diffYears} an${diffYears > 1 ? 's' : ''}`;
  })();


  return (
    <div
      onClick={onSelect}
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
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-700 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-900 truncate ${
            unreadCount > 0 ? 'font-bold' : ''
          }`}>
            {displayName}
          </h3>
          <div className={`flex items-center gap-1 text-sm mt-1 ${
            unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'
          }`}>
            <span className="truncate min-w-0 flex-1 block max-w-[160px]">
              <span dangerouslySetInnerHTML={{ __html: sanitizeMessage(lastMessagePreview) }} />
            </span>
            {timeDisplay && (
              <span className="text-xs text-gray-400 shrink-0">· {timeDisplay}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConversationList({
  chats,
  activeChatId,
  searchQuery,
  onSearchChange,
  onChatSelect,
  currentUserId,
}: ConversationListProps) {
  const [filter, setFilter] = useState<string>('all');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

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
    <div className="w-full md:w-64 lg:w-80 border-r flex flex-col bg-white h-full min-h-0">
      {/* Search bar sticky */}
      <div className="sticky top-0 z-10 p-4 border-b bg-white h-[73px] flex items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Title + Filter Select sticky */}
      <div className="sticky top-[72px] z-10 px-4 py-3 border-b bg-white">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-gray-900 whitespace-nowrap">Messages</h2>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px] h-9 cursor-pointer">
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
          filteredChats.map((chat) => (
            <ConversationItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === activeChatId}
              currentUserId={currentUserId}
              onSelect={() => onChatSelect(chat.id)}
              now={now}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}