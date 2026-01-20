"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Conversation {
  id: string;
  other_user_name: string;
  other_user_id: string;
  service_title: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  isNew?: boolean;
}

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conv: Conversation) => void;
  newConversation?: Conversation | null;
}

export default function ConversationsList({
  conversations,
  selectedConversation,
  onSelectConversation,
  newConversation,
}: ConversationsListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Combiner la nouvelle conversation avec les existantes
  const allConversations = newConversation && !conversations.find(c => c.other_user_id === newConversation.other_user_id)
    ? [newConversation, ...conversations]
    : conversations;

  const filteredConversations = allConversations.filter((conv) =>
    conv.other_user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">All Messages</h3>
      </div>

      {/* Conversations */}
      <div className="overflow-y-auto h-[calc(100vh-340px)]">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No conversations found
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                selectedConversation?.id === conv.id ? "bg-green-50 border-l-4 border-l-green-700" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={conv.other_user_avatar}
                      alt={conv.other_user_name}
                    />
                    <AvatarFallback className="bg-gray-200 text-gray-700">
                      {(conv.other_user_name || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {conv.isNew && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">!</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {conv.other_user_name}
                    </h3>
                    {!conv.isNew && (
                      <span className="text-xs text-gray-500">
                        {new Date(conv.last_message_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-1 truncate">
                    {conv.service_title}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate flex-1">
                      {conv.isNew ? "Start a new conversation" : (conv.last_message || "No messages yet")}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="ml-2 bg-green-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}