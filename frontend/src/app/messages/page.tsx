"use client";

import { useState, useRef, useEffect } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useChats } from '@/hooks/useChats';
import { useMessages } from '@/hooks/useMessages';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/home/Header';
import CategoryNav from '@/components/home/Category';
import { supabase } from '@/lib/supabaseClient';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ConversationList } from '@/components/messages/ConversationList';
import { MessageThread } from '@/components/messages/MessageThread';
import { MessageInput } from '@/components/messages/MessageInput';
import { ProfileSidebar } from '@/components/messages/ProfileSidebar';

export default function MessagesPage() {
  const { user } = useProtectedRoute({
    requireAuth: true,
    requireProfileCompleted: true,
  });

  const searchParams = useSearchParams();
  const chatIdFromUrl = searchParams.get('chat');

  const { chats, loading: chatsLoading } = useChats();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const [selectedMessageKey, setSelectedMessageKey] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { messages, loading: messagesLoading, sending, sendMessage } = useMessages(activeChatId);

  // Sélectionner le chat depuis l'URL ou le premier chat
  useEffect(() => {
    if (chatIdFromUrl && chats.length > 0) {
      setActiveChatId(chatIdFromUrl);
    } else if (chats.length > 0 && !activeChatId) {
      setActiveChatId(chats[0].id);
    }
  }, [chats, chatIdFromUrl, activeChatId]);

  const activeChat = chats.find(c => c.id === activeChatId);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please select an image (JPEG, PNG, GIF, WebP) or PDF file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setAttachedFile(file);

    // Créer un aperçu pour les images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview(null);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !attachedFile) return;

    try {
      let fileUrl = null;

      if (attachedFile) {
        const fileExt = attachedFile.name.split('.').pop();
        const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
        const filePath = `chat-attachments/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('chat-attachments')
          .upload(filePath, attachedFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert('Failed to upload file');
          return;
        }

        const { data } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(filePath);

        fileUrl = data.publicUrl;
      }

      const messageContent = attachedFile
        ? `${messageInput}\n[FILE:${fileUrl}]`
        : messageInput;

      await sendMessage(messageContent);

      setMessageInput('');
      removeAttachment();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (chatsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <CategoryNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <CategoryNav />

        <div className="flex-1 max-w-[1600px] w-full mx-auto p-5">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
            <div className="flex h-full">
              
              {/* COLONNE 1 : Liste des conversations */}
              <ConversationList
                chats={chats}
                activeChatId={activeChatId}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onChatSelect={setActiveChatId}
              />

              {/* COLONNE 2 : Zone de messages */}
              <div className="flex-1 flex flex-col bg-white">
                <MessageThread
                  messages={messages}
                  loading={messagesLoading}
                  currentUserId={user?.id || ''}
                  otherUser={activeChat?.other_user}
                  hoveredMessageId={hoveredMessageId}
                  setHoveredMessageId={setHoveredMessageId}
                  openMenuKey={openMenuKey}
                  setOpenMenuKey={setOpenMenuKey}
                  selectedMessageKey={selectedMessageKey}
                  setSelectedMessageKey={setSelectedMessageKey}
                />

                {activeChat && (
                  <MessageInput
                    value={messageInput}
                    onChange={setMessageInput}
                    onSend={handleSendMessage}
                    onKeyPress={handleKeyPress}
                    disabled={sending}
                    placeholder={`Message ${
                      activeChat.other_user?.account_type === 'company'
                        ? activeChat.other_user.company_name
                        : activeChat.other_user?.full_name?.split(' ')[0] || 'User'
                    }...`}
                    attachedFile={attachedFile}
                    attachmentPreview={attachmentPreview}
                    onFileSelect={handleFileSelect}
                    onRemoveAttachment={removeAttachment}
                    fileInputRef={fileInputRef}
                  />
                )}
              </div>

              {/* COLONNE 3 : Panneau About */}
              <ProfileSidebar otherUser={activeChat?.other_user} />

            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}