"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Send, Paperclip, MoreVertical, AlertCircle, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  other_user_name: string;
  other_user_id: string;
  service_title: string;
  booking_id: string | null;
  isNew?: boolean;
}

interface MessageThreadProps {
  conversation: Conversation | null;
  onConversationCreated?: (newConv: Conversation) => void;
}

export default function MessageThread({ conversation, onConversationCreated }: MessageThreadProps) {
  const { session, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [needsBooking, setNeedsBooking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (conversation && !conversation.isNew) {
      fetchMessages();
    } else if (conversation?.isNew) {
      setMessages([]);
      setLoading(false);
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!session?.access_token || !conversation || conversation.isNew) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/conversations/${conversation.id}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
  if (!messageInput.trim() || !session?.access_token || !conversation || sending) return;

  try {
    setSending(true);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          receiver_id: conversation.other_user_id,
          content: messageInput,
          booking_id: conversation.booking_id || null, // Optionnel maintenant
        }),
      }
    );

    if (response.ok) {
      const newMessage = await response.json();
      setMessages([...messages, newMessage]);
      setMessageInput("");
      setNeedsBooking(false);

      // Si c'était une nouvelle conversation, la marquer comme créée
      if (conversation.isNew && onConversationCreated) {
        // Récupérer la conversation nouvellement créée
        const convResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/messages/conversations`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (convResponse.ok) {
          const conversations = await convResponse.json();
          const newConv = conversations.find(
            (c: any) => c.other_user_id === conversation.other_user_id
          );
          if (newConv) {
            onConversationCreated(newConv);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error sending message:", error);
  } finally {
    setSending(false);
  }
};

  if (!conversation) {
    return (
      <div className="col-span-6 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center">
        <p className="text-gray-500">Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className="col-span-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage
              src={conversation.other_user_avatar}
              alt={conversation.other_user_name}
            />
            <AvatarFallback className="bg-gray-200 text-gray-700">
              {(conversation.other_user_name || "U").charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">
              {conversation.other_user_name}
            </h3>
            <p className="text-xs text-gray-500">
              {conversation.isNew ? "New conversation" : conversation.service_title}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {conversation.isNew ? "Start a conversation" : "No messages yet"}
            </h3>
            <p className="text-gray-500 max-w-sm">
              {conversation.isNew 
                ? `Send a message to ${conversation.other_user_name} to start the conversation.`
                : "Be the first to send a message in this conversation."}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isMine = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] ${
                      isMine
                        ? "bg-green-700 text-white"
                        : "bg-gray-100 text-gray-900"
                    } rounded-2xl px-4 py-2`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span
                      className={`text-xs mt-1 block ${
                        isMine ? "text-green-100" : "text-gray-500"
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Warning if booking needed */}
      {/*needsBooking && (
        <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-200 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-yellow-800 font-medium">
              Booking required
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              You need to book a service with this user before you can send messages. 
              Visit their profile to make a booking.
            </p>
          </div>
        </div>
      )*/}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Paperclip className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-4 py-2 bg-transparent resize-none focus:outline-none"
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={sending}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={sending || !messageInput.trim()}
            className="p-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}