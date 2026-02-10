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
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReplyPreview } from '@/components/messages/ReplyPreview';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useDeleteMessage } from '@/hooks/useDeleteMessage';
import { useMarkAsRead } from '@/hooks/useMarkAsRead';

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
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);

  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    content: string;
    user_id: string;
    sender_name?: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768); 
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  
  const { messages, loading: messagesLoading, sending, sendMessage, retryMessage } = useMessages(activeChatId);
  const { toggleReaction } = useMessageReactions();
  const { deleteMessage } = useDeleteMessage();
  const { markChatAsRead } = useMarkAsRead();

  useEffect(() => {
    if (activeChatId && user?.id && !messagesLoading) {
      const timer = setTimeout(() => {
        markChatAsRead(activeChatId, user.id);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [activeChatId, user?.id, messagesLoading, markChatAsRead]);

  useEffect(() => {
    if (chatIdFromUrl && chats.length > 0) {
      setActiveChatId(chatIdFromUrl);
      if (isMobile) setShowMobileChat(true);
    } else if (chats.length > 0 && !activeChatId) {
      setActiveChatId(chats[0].id);
      if (isMobile) setShowMobileChat(true); 
    }
  }, [chats, chatIdFromUrl, activeChatId, isMobile]);

  useEffect(() => {
    if (activeChatId) {
      setShowMobileChat(true);
    }
  }, [activeChatId]);


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

    if (messageInput.trim() && fileUrl) {
      await sendMessage(messageInput.trim(), replyingTo?.id || null);

      await sendMessage(`[FILE:${fileUrl}]`, null);
    } 
    else if (fileUrl) {
      await sendMessage(`[FILE:${fileUrl}]`, replyingTo?.id || null);
    } else {
      await sendMessage(messageInput.trim(), replyingTo?.id || null);
    }

    setMessageInput('');
    removeAttachment();
    setReplyingTo(null);
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

  const handleChatSelect = (chatId: string) => {
    setActiveChatId(chatId);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  const scrollToMessage = (messageId: string) => {
  const element = document.getElementById(`message-${messageId}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.classList.add('bg-yellow-100');
    setTimeout(() => {
      element.classList.remove('bg-yellow-100');
    }, 2000);
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

        <div className="flex-1 max-w-[1600px] w-full mx-auto p-5 min-h-0">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[480px]  min-h-0">
            <div className="flex h-full min-h-0">
              
              {/* COLONNE 1 : Liste des conversations */}
              <div className={`${showMobileChat ? 'hidden' : 'flex'} md:flex w-full md:w-80 border-r flex-col bg-white min-h-0`}>
                <ConversationList
                  chats={chats}
                  activeChatId={activeChatId}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onChatSelect={handleChatSelect}
                  currentUserId={user?.id || null} 
                />
              </div>

              {/* COLONNE 2 : Zone de messages */}
              <div className={`${!showMobileChat ? 'hidden' : 'flex'} md:flex flex-1 flex-col bg-white min-h-0`}>
                {activeChat ? (
                  <>
                    {/* Header personnalisé avec bouton retour */}
                    <div className="shrink-0 p-4 border-b flex items-center justify-between bg-white shadow-sm">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="md:hidden shrink-0"
                          onClick={handleBackToList}
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </Button>

                        <Avatar className="h-10 w-10 shrink-0">
                          {activeChat.other_user?.avatar_url ? (
                            <AvatarImage src={activeChat.other_user.avatar_url} />
                          ) : null}
                          <AvatarFallback>
                            {(() => {
                              const name = activeChat.other_user?.account_type === 'company'
                                ? activeChat.other_user?.company_name
                                : activeChat.other_user?.full_name;
                              return (name || 'U').charAt(0).toUpperCase();
                            })()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <h2 className="font-semibold text-gray-900 truncate">
                            {activeChat.other_user?.account_type === 'company'
                              ? activeChat.other_user.company_name
                              : activeChat.other_user?.full_name || 'Unknown'}
                          </h2>
                        </div>
                      </div>

                      <Sheet open={showProfileSidebar} onOpenChange={setShowProfileSidebar}>
                        <SheetTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="xl:hidden shrink-0"
                          >
                            <Info className="h-5 w-5" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-80 p-0">
                          <ProfileSidebar otherUser={activeChat?.other_user} />
                        </SheetContent>
                      </Sheet>
                    </div>

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
                      retryMessage={retryMessage}
                      onReply={(message) => {  
                        setReplyingTo({
                          id: message.id,
                          content: message.content,
                          user_id: message.user_id,
                          sender_name: message.sender?.account_type === 'company'
                            ? message.sender.company_name
                            : message.sender?.full_name,
                        });
                      }}
                      onReplyClick={scrollToMessage}
                      onReactionToggle={async (messageId, emoji, currentReactions) => { 
                        if (!user?.id) return;
                        try {
                          await toggleReaction(messageId, emoji, user.id, currentReactions);
                        } catch (error) {
                          console.error('Failed to toggle reaction:', error);
                        }
                      }}
                      onDelete={async (messageId) => { 
                        try {
                          await deleteMessage(messageId);
                        } catch (error) {
                          console.error('Failed to delete message:', error);
                          alert('Échec de la suppression');
                        }
                      }}
                    />

                    <div className="shrink-0">
                      <ReplyPreview
                        repliedMessage={replyingTo}
                        onCancel={() => setReplyingTo(null)}
                      />
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
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Select a conversation
                      </h3>
                      <p className="text-gray-600">
                        Choose a conversation from the left to start messaging
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* COLONNE 3 : Panneau About */}
              <div className="hidden xl:flex w-80 shrink-0 border-l bg-white min-h-0">
                <ProfileSidebar otherUser={activeChat?.other_user} />
              </div>

            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}