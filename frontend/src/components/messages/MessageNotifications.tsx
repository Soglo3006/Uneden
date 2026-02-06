// frontend/src/components/MessageNotifications.tsx
"use client";

import { MessageCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function MessageNotifications() {
  const { unreadChats, unreadCount, loading, markAsRead } = useUnreadMessages();
  const router = useRouter();

  const handleMessageClick = (chatRoomId: string) => {
    markAsRead(chatRoomId);
    router.push(`/messages?chat=${chatRoomId}`);
  };

  const handleMarkAsRead = (e: React.MouseEvent, chatRoomId: string) => {
    e.stopPropagation();
    markAsRead(chatRoomId);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Moins d'une minute
    if (diff < 60000) {
      return 'Just now';
    }
    
    // Moins d'une heure
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins}m`;
    }
    
    // Moins d'un jour
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h`;
    }
    
    // Sinon, afficher la date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative cursor-pointer hover:bg-gray-100"
        >
          <MessageCircle className="h-6 w-6 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[380px] p-0">
        {/* Header */}
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Messages
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-500">
                  ({unreadCount} unread)
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Messages List */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-700" />
            </div>
          ) : unreadChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No new messages</p>
            </div>
          ) : (
            <div className="divide-y">
              {unreadChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleMessageClick(chat.chat_room_id)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
                    !chat.is_read 
                      ? "bg-blue-50 hover:bg-blue-100" 
                      : "bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="h-10 w-10 mt-1">
                    {chat.sender_avatar ? (
                      <AvatarImage src={chat.sender_avatar} alt={chat.sender_name} />
                    ) : null}
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-sm">
                      {chat.sender_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {chat.sender_name}
                      </p>
                      <span className="text-xs text-gray-500 ml-2 shrink-0">
                        {formatTime(chat.last_message_time)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {chat.last_message}
                    </p>
                  </div>

                  {/* Mark as read button */}
                  {!chat.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={(e) => handleMarkAsRead(e, chat.chat_room_id)}
                    >
                      <Check className="h-4 w-4 text-gray-500 hover:text-green-600" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {unreadChats.length > 0 && (
          <div className="border-t px-4 py-3">
            <button
              onClick={() => router.push('/messages')}
              className="text-sm font-medium text-green-700 hover:text-green-800 w-full text-center"
            >
              See All in Inbox
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}