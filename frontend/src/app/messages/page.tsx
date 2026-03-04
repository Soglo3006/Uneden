"use client";

import { useState, useRef, useEffect, Suspense } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useChats } from '@/hooks/useChats';
import { useMessages } from '@/hooks/useMessages';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ConversationList } from '@/components/messages/ConversationList';
import { MessageThread } from '@/components/messages/MessageThread';
import { MessageInput } from '@/components/messages/MessageInput';
import { ProfileSidebar } from '@/components/messages/ProfileSidebar';
import { ArrowLeft, Info, Ban, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReplyPreview } from '@/components/messages/ReplyPreview';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useDeleteMessage } from '@/hooks/useDeleteMessage';
import { useMarkAsRead } from '@/hooks/useMarkAsRead';
import { useEditMessage } from '@/hooks/useEditMessage';
import { usePinMessage } from '@/hooks/usePinMessage';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useIsTyping } from '@/hooks/useIsTyping';
import { usePresence } from '@/hooks/usePresence';
import { useUserPresence } from '@/hooks/useUserPresence';
import { ConversationSettings } from '@/components/messages/ConversationSettings';
import { Phone, Video } from 'lucide-react';
import Link from 'next/link';

function MessagesContent() {
  const { user } = useProtectedRoute({
    requireAuth: true,
    requireProfileCompleted: true,
  });

  const searchParams = useSearchParams();
  const chatIdFromUrl = searchParams.get('chat');
  const router = useRouter();

  const { chats, loading: chatsLoading, clearUnreadCount, archiveChat } = useChats();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const [selectedMessageKey, setSelectedMessageKey] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockedByOther, setIsBlockedByOther] = useState(false);
  const [blockCheckLoading, setBlockCheckLoading] = useState(false);

  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    content: string;
    user_id: string;
    sender_name?: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const { messages, loading: messagesLoading, sending, sendMessage, retryMessage, loadedChatId, hasMore, loadingMore, loadMore } = useMessages(activeChatId);
  const isMessagesLoading = messagesLoading || loadedChatId !== activeChatId;
  const { toggleReaction } = useMessageReactions();
  const { deleteMessage } = useDeleteMessage();
  const { markChatAsRead } = useMarkAsRead();
  const { editMessage } = useEditMessage();
  const { togglePin, checkPinLimit } = usePinMessage();

  useEffect(() => {
    if (activeChatId && user?.id && !messagesLoading) {
      const timer = setTimeout(() => {
        markChatAsRead(activeChatId, user.id);
        clearUnreadCount(activeChatId);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [activeChatId, user?.id, messagesLoading, markChatAsRead, clearUnreadCount]);

  useEffect(() => {
    if (!chats.length) return;

    if (chatIdFromUrl) {
      setActiveChatId(chatIdFromUrl);
      if (isMobile) setShowMobileChat(true);
      return;
    }

    // Si pas de chat dans l’URL, on prend le 1er et on met aussi l’URL
    if (!activeChatId) {
      const firstId = chats[0].id;
      setActiveChatId(firstId);
      router.replace(`/messages?chat=${firstId}`); // replace pour éviter l’historique inutile
      if (isMobile) setShowMobileChat(true);
    }
  }, [chats, chatIdFromUrl, activeChatId, isMobile, router]);

  useEffect(() => {
    if (activeChatId) {
      setShowMobileChat(true);
    }
  }, [activeChatId]);


  const activeChat = chats.find(c => c.id === activeChatId);
  usePresence(user?.id || null);

  const { sendTyping } = useTypingIndicator(activeChatId, user?.id);
  const isTyping = useIsTyping(activeChatId, activeChat?.other_user?.id);
  const isOtherOnline = useUserPresence(activeChat?.other_user?.id);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ];
    
    if (!validTypes.includes(file.type)) {
      alert('Type de fichier non autorisé. Formats acceptés : JPEG, PNG, GIF, WebP, PDF');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; 
    if (file.size > MAX_SIZE) {
      alert(`Fichier trop volumineux. Taille maximum : 5MB (votre fichier : ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
        const fileName = `${user?.id}/${Date.now()}.${fileExt}`;  
        
        const { error: uploadError } = await supabase.storage
          .from('chat-attachments')
          .upload(fileName, attachedFile);  

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert('Failed to upload file');
          return;
        }

        const { data } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(fileName);  

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
    if (chatId === activeChatId) return;
    setActiveChatId(chatId);
    clearUnreadCount(chatId);
    setShowMobileChat(true);
    setIsBlocked(false);
    setIsBlockedByOther(false);
    setBlockCheckLoading(true);
    setShowSettings(false);
    setReplyingTo(null);
    router.push(`/messages?chat=${chatId}`);
  };

  const handleVoiceMessage = async (audioBlob: Blob, duration: number) => {
    try {
      const fileName = `${user?.id}/${Date.now()}.webm`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, audioBlob, { contentType: 'audio/webm' });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(fileName);

      await sendMessage(`[AUDIO:${data.publicUrl}:${duration}]`, null);
    } catch (error) {
      console.error('Error sending voice message:', error);
      alert('Échec de l\'envoi du message vocal');
    }
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (!element) return;

    const viewport = element.closest('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (viewport) {
      const top =
        viewport.scrollTop +
        element.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top -
        viewport.clientHeight / 2 +
        element.clientHeight / 2;
      viewport.scrollTo({ top, behavior: 'smooth' });
    } else {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    element.classList.add('bg-yellow-100');
    setTimeout(() => {
      element.classList.remove('bg-yellow-100');
    }, 2000);
  };

    useEffect(() => {
    const checkBlocked = async () => {
      if (!user?.id || !activeChat?.other_user?.id) {
        setIsBlocked(false);
        setIsBlockedByOther(false);
        setBlockCheckLoading(false);
        return;
      }

      setBlockCheckLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setBlockCheckLoading(false);
        return;
      }

      const [{ data: iBlockedThem }, { data: theyBlockedMe }] = await Promise.all([
        supabase.from('blocked_users').select('id')
          .eq('blocker_id', user.id)
          .eq('blocked_user_id', activeChat.other_user.id)
          .maybeSingle(),
        supabase.from('blocked_users').select('id')
          .eq('blocker_id', activeChat.other_user.id)
          .eq('blocked_user_id', user.id)
          .maybeSingle(),
      ]);

      setIsBlocked(!!iBlockedThem);
      setIsBlockedByOther(!!theyBlockedMe);
      setBlockCheckLoading(false);
    };

    checkBlocked();
  }, [user?.id, activeChat?.other_user?.id]);

  const handleUnblock = async () => {
    if (!user?.id || !activeChat?.other_user?.id) return;
    await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_user_id', activeChat.other_user.id);
    setIsBlocked(false);
  };

  if (chatsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
        </div>
      </div>
    );
  }


  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Bannière hors-ligne */}
        {!isOnline && (
          <div className="flex items-center justify-center gap-2 bg-amber-50 border-b border-amber-200 px-4 py-2">
            <WifiOff className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700 font-medium">
              Connexion perdue — Reconnexion en cours...
            </p>
          </div>
        )}

        <div className="flex-1 max-w-[1600px] w-full mx-auto p-2 sm:p-5 min-h-0">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[calc(100vh-180px)] min-h-[500px] min-h-0">
            <div className="flex h-full min-h-0">
              
              {/* COLONNE 1 : Liste des conversations */}
              <div className={`${showMobileChat ? 'hidden' : 'flex'} md:flex w-full md:w-64 lg:w-80 border-r flex-col bg-white min-h-0`}>
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
              <div className={`${(isLargeScreen || (isMobile ? showMobileChat : true)) && (!showSettings || isLargeScreen) ? 'flex' : 'hidden'} flex-1 min-w-0 flex-col bg-white min-h-0 overflow-hidden`}>
                {activeChat ? (
                  <>
                    {/* Header personnalisé avec bouton retour */}
                    <div className="shrink-0 p-4 border-b flex items-center justify-between bg-white shadow-sm h-[73px]">
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden shrink-0 cursor-pointer" onClick={handleBackToList}>
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <Link href={`/profile/${activeChat.other_user?.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                          <div className="relative">
                            <Avatar className="h-10 w-10 shrink-0">
                              {activeChat.other_user?.avatar_url ? (
                                <AvatarImage src={activeChat.other_user.avatar_url} />
                              ) : null}
                              <AvatarFallback>
                                {(activeChat.other_user?.account_type === 'company'
                                  ? activeChat.other_user?.company_name
                                  : activeChat.other_user?.full_name || 'U'
                                ).charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {isOtherOnline && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h2 className="font-semibold text-gray-900 truncate">
                              {activeChat.other_user?.account_type === 'company'
                                ? activeChat.other_user.company_name
                                : activeChat.other_user?.full_name || 'Unknown'}
                            </h2>
                            <p className="text-xs">
                              {isOtherOnline
                                ? <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                                    <span className="text-green-500 font-medium">En ligne</span>
                                  </span>
                                : <span className="text-gray-400">Hors ligne</span>
                              }
                            </p>
                          </div>
                        </Link>
                      </div>

                      {/* Boutons droite */}
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" disabled className="opacity-40 cursor-not-allowed">
                          <Phone className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" disabled className="opacity-40 cursor-not-allowed">
                          <Video className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowSettings(!showSettings)}
                          className={`cursor-pointer ${showSettings ? 'bg-gray-100' : ''}`}
                        >
                          <Info className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    <MessageThread
                      messages={messages}
                      loading={isMessagesLoading}
                      currentUserId={user?.id || ''}
                      otherUser={activeChat?.other_user}
                      hoveredMessageId={hoveredMessageId}
                      setHoveredMessageId={setHoveredMessageId}
                      openMenuKey={openMenuKey}
                      setOpenMenuKey={setOpenMenuKey}
                      selectedMessageKey={selectedMessageKey}
                      setSelectedMessageKey={setSelectedMessageKey}
                      retryMessage={retryMessage}
                      isTyping={isTyping}
                      hasMore={hasMore}
                      loadingMore={loadingMore}
                      loadMore={loadMore}
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
                      onEdit={async (messageId, newContent) => { 
                        try {
                          await editMessage(messageId, newContent);
                        } catch (error) {
                          console.error('Failed to edit message:', error);
                          alert('Échec de la modification');
                        }
                      }}
                      onPin={async (messageId, isPinned) => {  
                        try {
                          await togglePin(messageId, isPinned);
                        } catch (error) {
                          console.error('Failed to pin message:', error);
                          alert('Échec de l\'épinglage');
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
                      
                      {blockCheckLoading ? (
                        <div className="border-t bg-white px-4 py-3">
                          <div className="h-10 rounded-xl bg-gray-100 animate-pulse" />
                        </div>
                      ) : isBlocked ? (
                        <div className="border-t bg-white">
                          {/* Bannière */}
                          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-b border-red-100">
                            <Ban className="h-4 w-4 text-red-500 shrink-0" />
                            <p className="text-sm text-red-600">
                              Vous avez bloqué ce compte. Ce compte ne peut plus vous envoyer de messages.
                            </p>
                          </div>
                          {/* Bouton débloquer */}
                          <div className="p-4 flex justify-center">
                            <Button
                              variant="outline"
                              className="border-green-700 cursor-pointer text-green-700 hover:bg-green-50"
                              onClick={handleUnblock}
                            >
                              Débloquer {activeChat.other_user?.full_name || activeChat.other_user?.company_name}
                            </Button>
                          </div>
                        </div>
                        ) : isBlockedByOther ? (
                        <div className="border-t bg-white">
                          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50">
                            <Ban className="h-4 w-4 text-gray-400 shrink-0" />
                            <p className="text-sm text-gray-500">
                              Vous ne pouvez plus envoyer de messages à cette personne.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <MessageInput
                          value={messageInput}
                          onChange={(val) => { setMessageInput(val); if (val) sendTyping(); }}
                          onSend={handleSendMessage}
                          onKeyPress={handleKeyPress}
                          onVoiceMessage={handleVoiceMessage}
                          disabled={sending}
                          attachedFile={attachedFile}
                          attachmentPreview={attachmentPreview}
                          onFileSelect={handleFileSelect}
                          onRemoveAttachment={removeAttachment}
                          fileInputRef={fileInputRef}
                        />
                      )}
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
              <div className={`${isLargeScreen || (showSettings && showMobileChat) ? 'flex' : 'hidden'} ${isLargeScreen ? 'w-72 shrink-0' : 'flex-1'} border-l bg-white min-h-0`}>
                {showSettings
                  ? <ConversationSettings
                      messages={messages}
                      onMessageClick={scrollToMessage}
                      isBlocked={isBlocked}
                      onUnblockUser={async () => {
                        await handleUnblock();
                        setShowSettings(false);
                      }}
                      otherUser={activeChat?.other_user}
                      onClose={() => setShowSettings(false)}
                      isMuted={isMuted}
                      onToggleMute={() => setIsMuted(!isMuted)}
                      onDeleteConversation={async () => {
                        if (!activeChatId || !user?.id) return;
                        
                        // Supprimer tous les messages
                        const { error: msgError } = await supabase
                          .from('messages')
                          .delete()
                          .eq('chat_room_id', activeChatId);
                        if (msgError) throw msgError;

                        // Retirer l'utilisateur de la conv
                        const { error: memberError } = await supabase
                          .from('chat_room_member')
                          .delete()
                          .eq('chat_room_id', activeChatId)
                          .eq('user_id', user.id);
                        if (memberError) throw memberError;

                        // Trouver la prochaine convo
                        const remainingChats = chats.filter(c => c.id !== activeChatId);
                        
                        if (remainingChats.length > 0) {
                          const nextChatId = remainingChats[0].id;
                          setActiveChatId(nextChatId);
                          router.replace(`/messages?chat=${nextChatId}`);
                        } else {
                          setActiveChatId(null);
                          router.replace('/messages');
                        }

                        setShowSettings(false);
                        router.push('/messages');
                      }}
                      onBlockUser={async () => {
                        if (!activeChat?.other_user?.id) return;
                        const { error } = await supabase
                          .from('blocked_users')
                          .insert({
                            blocker_id: user?.id,
                            blocked_user_id: activeChat.other_user.id,
                          });
                        if (error && error.code !== '23505') throw error;
                        setIsBlocked(true);
                        setShowSettings(false);
                      }}
                      onReportUser={async (reason: string, details: string) => {
                        if (!activeChat?.other_user?.id) return;
                        const { error } = await supabase
                          .from('user_reports')
                          .insert({
                            reporter_id: user?.id,
                            reported_user_id: activeChat.other_user.id,
                            reason,
                            description: details,
                            status: 'pending',
                          });
                        if (error) throw error;
                      }}
                      isArchived={activeChat?.is_archived || false}
                      onArchive={async () => {
                        if (!activeChatId || !user?.id) return;
                        const newIsArchived = !activeChat?.is_archived;
                        const { error } = await supabase
                          .from('chat_room_member')
                          .update({ is_archived: newIsArchived })
                          .eq('chat_room_id', activeChatId)
                          .eq('user_id', user.id);
                        if (error) throw error;
                        archiveChat(activeChatId, newIsArchived);
                        if (newIsArchived) {
                          const next = chats.find(c => c.id !== activeChatId && !c.is_archived);
                          if (next) {
                            setActiveChatId(next.id);
                            router.replace(`/messages?chat=${next.id}`);
                          } else {
                            setActiveChatId(null);
                            router.replace('/messages');
                          }
                          setShowSettings(false);
                        }
                      }}
                    />
                  : <ProfileSidebar otherUser={activeChat?.other_user} />
                }
              </div>

            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}