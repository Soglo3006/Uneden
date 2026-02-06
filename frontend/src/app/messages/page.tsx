"use client";

import { useState, useRef, useEffect } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useChats } from '@/hooks/useChats';
import { useMessages } from '@/hooks/useMessages';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/home/Header';
import CategoryNav from '@/components/home/Category';
import Footer from '@/components/home/Footer';
import { supabase } from '@/lib/supabaseClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Send, MoreVertical, Star, MessageCircle, X , Smile} from 'lucide-react';
import Link from "next/link";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { messages, loading: messagesLoading, sending, sendMessage } = useMessages(activeChatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(0);  
  const isInitialLoad = useRef(true);  
  
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);      
  const [selectedMessageKey, setSelectedMessageKey] = useState<string | null>(null); 

  const actionsVisible = (key: string) =>
    hoveredMessageId === key || openMenuKey === key || selectedMessageKey === key;

  useEffect(() => {
    if (messages.length > 0 && isInitialLoad.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
        isInitialLoad.current = false;
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    isInitialLoad.current = true;
    prevMessagesLength.current = 0;
  }, [activeChatId]);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current && prevMessagesLength.current > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);


  // Sélectionner le chat depuis l'URL ou le premier chat
  useEffect(() => {
    if (chatIdFromUrl && chats.length > 0) {
      // Si un chat est spécifié dans l'URL, l'ouvrir
      setActiveChatId(chatIdFromUrl);
    } else if (chats.length > 0 && !activeChatId) {
      // Sinon, ouvrir le premier chat par défaut
      setActiveChatId(chats[0].id);
    }
  }, [chats, chatIdFromUrl, activeChatId]);

  const activeChat = chats.find(c => c.id === activeChatId);
  const filteredChats = chats.filter(chat => {
    if (!searchQuery.trim()) return true;
    
    const isPerson = chat.other_user?.account_type === 'person';
    const isCompany = chat.other_user?.account_type === 'company';
    
    const name = isPerson
      ? chat.other_user?.full_name
      : isCompany
      ? chat.other_user?.company_name
      : chat.other_user?.full_name || chat.name || '';
    
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

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

      // Si un fichier est attaché, l'uploader d'abord
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

      // Envoyer le message avec l'URL du fichier
      const messageContent = attachedFile
        ? `${messageInput}\n[FILE:${fileUrl}]`
        : messageInput;

      await sendMessage(messageContent);
      
      // Reset
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
            <div className="w-80 border-r flex flex-col bg-white">
              {/* Search bar sticky */}
              <div className="sticky top-0 z-10 p-4 border-b bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Title sticky */}
              <div className="sticky top-[72px] z-10 px-4 py-3 border-b bg-white">
                <h2 className="font-semibold text-gray-900">All Messages</h2>
              </div>

              <ScrollArea className="flex-1">
                {filteredChats.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No conversations yet</p>
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
                      
                      // Si le message contient un fichier
                      if (content.includes('[FILE:')) {
                        const match = content.match(/\[FILE:(.*?)\]/);
                        const fileUrl = match ? match[1] : '';
                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
                        
                        return isImage ? ' Photo' : ' File';
                      }
                      
                      // Message texte normal
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
                        onClick={() => setActiveChatId(chat.id)}
                        className={`p-4 border-b cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-green-50 border-l-4 border-l-green-700'
                            : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12 border-4 border-white shadow-lg">
                            {chat.other_user?.avatar_url ? (
                              <AvatarImage src={chat.other_user.avatar_url} alt={displayName} />
                            ) : null}
                            <AvatarFallback className="text-lg">
                              {displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {displayName}
                              </h3>
                              <span className="text-xs text-gray-500 ml-2">
                                {timeDisplay}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate mt-1">
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

            {/* COLONNE 2 : Zone de messages */}
            <div className="flex-1 flex flex-col bg-white">
              {activeChat ? (
                <>
                  <div className="sticky top-0 z-10 p-4 border-b flex items-center justify-between bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-4 border-white shadow-lg">
                        {activeChat.other_user?.avatar_url ? (
                          <AvatarImage 
                            src={activeChat.other_user.avatar_url} 
                            alt={(() => {
                              if (!activeChat.other_user) return 'User';
                              return activeChat.other_user.account_type === 'company'
                                ? activeChat.other_user.company_name || 'Company'
                                : activeChat.other_user.full_name || 'User';
                            })()} 
                          />
                        ) : null}
                        <AvatarFallback className="text-md">
                          {(() => {
                            if (!activeChat.other_user) return 'U';
                            const name = activeChat.other_user.account_type === 'company'
                              ? activeChat.other_user.company_name
                              : activeChat.other_user.full_name;
                            return (name).charAt(0).toUpperCase();
                          })()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {(() => {
                            if (!activeChat.other_user) return activeChat.name || 'Unknown';
                            const isPerson = activeChat.other_user.account_type === 'person';
                            const isCompany = activeChat.other_user.account_type === 'company';
                            return isPerson
                              ? activeChat.other_user.full_name
                              : isCompany
                              ? activeChat.other_user.company_name
                              : activeChat.other_user.full_name || 'Unknown';
                          })()}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 p-4 bg-gray-50" style={{ height: 'calc(100% - 140px)' }}>
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      <div
                        className="space-y-4"
                        onPointerDown={() => {
                          setSelectedMessageKey(null);
                          setOpenMenuKey(null);
                        }}
                      >
                        {messages.map((message, index) => {
                          const isOwn = message.user_id === user?.id;
                          const showDate =
                            index === 0 ||
                            new Date(message.created_at).toDateString() !==
                              new Date(messages[index - 1].created_at).toDateString();

                          return (
                            <div key={message.id}>
                              {showDate && (
                                  <div className="sticky top-0 z-10 text-center text-sm text-gray-500 my-4 py-2 bg-gray-50/80 backdrop-blur-sm rounded-full">
                                  {new Date(message.created_at).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </div>
                              )}

                              {/* Contenu du message avec hover individuel sur chaque élément */}
                              <div className={`flex flex-col gap-2 ${isOwn ? 'items-end' : 'items-start'}`}>
                                {message.content.includes('[FILE:') ? (
                                  <>
                                    {(() => {
                                      const match = message.content.match(/\[FILE:(.*?)\]/);
                                      const fileUrl = match ? match[1] : '';
                                      const text = message.content.replace(/\[FILE:.*?\]/, '').trim();
                                      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
                                      const keyText = `${message.id}-text`;
                                      const keyImage = `${message.id}-image`;

                                      return (
                                        <>
                                          {/* TEXTE avec son propre hover */}
                                          {text && (
                                            <div
                                                onPointerDown={(e) => e.stopPropagation()}
                                                onMouseEnter={() => setHoveredMessageId(keyText)}
                                                onMouseLeave={() => {
                                                  if (openMenuKey !== keyText && selectedMessageKey !== keyText) setHoveredMessageId(null);
                                                }}
                                                onClick={() => setSelectedMessageKey(prev => (prev === keyText ? null : keyText))}
                                                className={`flex gap-2 items-start ${isOwn ? 'flex-row' : 'flex-row-reverse'}`}
                                              >
                                              {/* Boutons pour le texte */}
                                              {actionsVisible(keyText) && (
                                                <div className="flex items-center gap-1 mt-1">
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <Button variant="ghost" size="icon" className="h-7 w-7 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow-sm">
                                                        <span className="text-sm"><Smile className="h-3 w-3 text-gray-600"/></span>
                                                      </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                      <p>Ajouter une réaction</p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <Button variant="ghost" size="icon" className="h-7 w-7 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow-sm">
                                                        <MessageCircle className="h-3 w-3 text-gray-600" />
                                                      </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                      <p>Répondre</p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                  <DropdownMenu open={openMenuKey === keyText} onOpenChange={(open) => setOpenMenuKey(open ? keyText : null)}>
                                                    <Tooltip>
                                                      <TooltipTrigger asChild>
                                                        <DropdownMenuTrigger asChild>
                                                          <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow-sm"
                                                            onPointerDown={(e) => e.stopPropagation()}
                                                            onClick={(e) => e.stopPropagation()}
                                                          >
                                                            <MoreVertical className="h-3 w-3 text-gray-600" />
                                                          </Button>
                                                        </DropdownMenuTrigger>
                                                      </TooltipTrigger>
                                                      <TooltipContent>
                                                        <p>Plus</p>
                                                      </TooltipContent>
                                                    </Tooltip>

                                                    <DropdownMenuContent align="end" className="z-[9999]" onPointerDown={(e) => e.stopPropagation()}>
                                                      <DropdownMenuItem onSelect={() => setOpenMenuKey(null)}>
                                                        Répondre
                                                      </DropdownMenuItem>
                                                      <DropdownMenuItem onSelect={() => setOpenMenuKey(null)}>
                                                        Épingler
                                                      </DropdownMenuItem>
                                                      <DropdownMenuSeparator />
                                                      <DropdownMenuItem className="text-red-600" onSelect={() => setOpenMenuKey(null)}>
                                                        Supprimer
                                                      </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                  </DropdownMenu>
                                                </div>
                                              )}

                                              {/* Avatar + Bulle de texte */}
                                              <div className="flex items-end gap-2">
                                                {!isOwn && (
                                                  <Avatar className="h-8 w-8 flex-shrink-0">
                                                    {activeChat.other_user?.avatar_url ? (
                                                      <AvatarImage src={activeChat.other_user.avatar_url} />
                                                    ) : null}
                                                    <AvatarFallback className="text-xs">
                                                      {(() => {
                                                        if (!activeChat.other_user) return 'U';
                                                        const name = activeChat.other_user.account_type === 'company'
                                                          ? activeChat.other_user.company_name
                                                          : activeChat.other_user.full_name;
                                                        return (name || 'U').charAt(0).toUpperCase();
                                                      })()}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                )}

                                                {/* Bulle de texte */}
                                                <div
                                                  className={`rounded-2xl px-4 py-2 ${
                                                    isOwn
                                                      ? 'bg-green-700 text-white'
                                                      : 'bg-white border border-gray-200 text-gray-900'
                                                  }`}
                                                >
                                                  <p className="text-sm whitespace-pre-wrap break-words">
                                                    {text}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                          
                                          {/* IMAGE avec son propre hover */}
                                          {isImage && (
                                            <div
                                              onPointerDown={(e) => e.stopPropagation()}
                                              onMouseEnter={() => setHoveredMessageId(keyImage)}
                                              onMouseLeave={() => {
                                                if (openMenuKey !== keyImage && selectedMessageKey !== keyImage) setHoveredMessageId(null);
                                              }}
                                              onClick={() => setSelectedMessageKey(prev => (prev === keyImage ? null : keyImage))}
                                              className={`flex gap-2 items-center ${isOwn ? 'flex-row' : 'flex-row-reverse'}`}
                                            >
                                              {/* Boutons pour l'image */}
                                              {actionsVisible(keyImage) && (
                                                <div className="flex items-center gap-1 mt-1">
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <Button variant="ghost" size="icon" className="h-7 w-7 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow-sm">
                                                        <Smile className="h-3 w-3 text-gray-600"/>
                                                      </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                      <p>Réagir</p>
                                                    </TooltipContent>
                                                  </Tooltip>

                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <Button variant="ghost" size="icon" className="h-7 w-7 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow-sm">
                                                        <MessageCircle className="h-3 w-3 text-gray-600" />
                                                      </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                      <p>Répondre</p>
                                                    </TooltipContent>
                                                  </Tooltip>

                                                  <DropdownMenu open={openMenuKey === keyImage} onOpenChange={(open) => setOpenMenuKey(open ? keyImage : null)}>
                                                    <Tooltip>
                                                      <TooltipTrigger asChild>
                                                        <DropdownMenuTrigger asChild>
                                                          <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow-sm"
                                                            onPointerDown={(e) => e.stopPropagation()}
                                                            onClick={(e) => e.stopPropagation()}
                                                          >
                                                            <MoreVertical className="h-3 w-3 text-gray-600" />
                                                          </Button>
                                                        </DropdownMenuTrigger>
                                                      </TooltipTrigger>
                                                      <TooltipContent>
                                                        <p>Plus</p>
                                                      </TooltipContent>
                                                    </Tooltip>

                                                    <DropdownMenuContent align="end" className="z-[9999]" onPointerDown={(e) => e.stopPropagation()}>
                                                      <DropdownMenuItem onSelect={() => setOpenMenuKey(null)}>
                                                        Répondre
                                                      </DropdownMenuItem>
                                                      <DropdownMenuItem onSelect={() => setOpenMenuKey(null)}>
                                                        Épingler
                                                      </DropdownMenuItem>
                                                      <DropdownMenuSeparator />
                                                      <DropdownMenuItem className="text-red-600" onSelect={() => setOpenMenuKey(null)}>
                                                        Supprimer
                                                      </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                  </DropdownMenu>
                                                </div>
                                              )}

                                              {/* Avatar + Image */}
                                              <div className="flex items-end gap-2">
                                                {/* Avatar uniquement pour les messages de l'autre personne */}
                                                {!isOwn && (
                                                  <Avatar className="h-8 w-8 flex-shrink-0">
                                                    {activeChat.other_user?.avatar_url ? (
                                                      <AvatarImage src={activeChat.other_user.avatar_url} />
                                                    ) : null}
                                                    <AvatarFallback className="text-xs">
                                                      {(() => {
                                                        if (!activeChat.other_user) return 'U';
                                                        const name = activeChat.other_user.account_type === 'company'
                                                          ? activeChat.other_user.company_name
                                                          : activeChat.other_user.full_name;
                                                        return (name || 'U').charAt(0).toUpperCase();
                                                      })()}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                )}

                                                {/* Image */}
                                                <img
                                                  src={fileUrl}
                                                  alt="Attachment"
                                                  className="max-w-xs max-h-64 rounded-xl cursor-pointer object-cover shadow-md"
                                                  onClick={() => window.open(fileUrl, '_blank')}
                                                />
                                              </div>
                                            </div>
                                          )}

                                          {/* PDF (sans hover pour l'instant) */}
                                          {!isImage && (
                                            <a
                                              href={fileUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className={`flex items-center gap-2 p-3 rounded-xl shadow-sm ${
                                                isOwn 
                                                  ? 'bg-green-50 hover:bg-green-100 border border-green-200' 
                                                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                              }`}
                                            >
                                              <span className="text-sm font-medium">📄 View file</span>
                                            </a>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </>
                                ) : (
                                  (() => {
                                    const key = message.id;

                                    return (
                                      <div
                                        onPointerDown={(e) => e.stopPropagation()} // empêche le background de clear
                                        onMouseEnter={() => setHoveredMessageId(key)}
                                        onMouseLeave={() => {
                                          // si le menu est ouvert OU message sélectionné, on ne cache pas
                                          if (openMenuKey !== key && selectedMessageKey !== key) setHoveredMessageId(null);
                                        }}
                                        onClick={() => setSelectedMessageKey(prev => (prev === key ? null : key))}
                                        className={`flex gap-2 items-center ${isOwn ? 'flex-row' : 'flex-row-reverse'}`}
                                      >
                                        {/* Boutons */}
                                        {actionsVisible(key) && (
                                          <div className="flex items-center gap-1 mt-1">
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-7 w-7 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow-sm"
                                                  onPointerDown={(e) => e.stopPropagation()}
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  <Smile className="h-3 w-3 text-gray-600" />
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Réagir</p>
                                              </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-7 w-7 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow-sm"
                                                  onPointerDown={(e) => e.stopPropagation()}
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  <MessageCircle className="h-3 w-3 text-gray-600" />
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Répondre</p>
                                              </TooltipContent>
                                            </Tooltip>

                                            <DropdownMenu
                                              open={openMenuKey === key}
                                              onOpenChange={(open) => setOpenMenuKey(open ? key : null)}
                                            >
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <DropdownMenuTrigger asChild>
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      className="h-7 w-7 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow-sm"
                                                      onPointerDown={(e) => e.stopPropagation()}
                                                      onClick={(e) => e.stopPropagation()}
                                                    >
                                                      <MoreVertical className="h-3 w-3 text-gray-600" />
                                                    </Button>
                                                  </DropdownMenuTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>Plus</p>
                                                </TooltipContent>
                                              </Tooltip>

                                              <DropdownMenuContent
                                                align="end"
                                                className="z-[9999]"
                                                onPointerDown={(e) => e.stopPropagation()}
                                              >
                                                <DropdownMenuItem onSelect={() => setOpenMenuKey(null)}>
                                                  Répondre
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => setOpenMenuKey(null)}>
                                                  Épingler
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                  className="text-red-600"
                                                  onSelect={() => setOpenMenuKey(null)}
                                                >
                                                  Supprimer
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        )}

                                        {/* Avatar + Bulle */}
                                        <div className="flex items-end gap-2">
                                          {/* Avatar uniquement pour les messages de l'autre personne */}
                                          {!isOwn && (
                                            <Avatar className="h-8 w-8 flex-shrink-0">
                                              {activeChat.other_user?.avatar_url ? (
                                                <AvatarImage src={activeChat.other_user.avatar_url} />
                                              ) : null}
                                              <AvatarFallback className="text-xs">
                                                {(() => {
                                                  if (!activeChat.other_user) return 'U';
                                                  const name = activeChat.other_user.account_type === 'company'
                                                    ? activeChat.other_user.company_name
                                                    : activeChat.other_user.full_name;
                                                  return (name || 'U').charAt(0).toUpperCase();
                                                })()}
                                              </AvatarFallback>
                                            </Avatar>
                                          )}

                                          {/* Bulle */}
                                          <div
                                            className={`rounded-2xl px-4 py-2 ${
                                              isOwn
                                                ? 'bg-green-700 text-white'
                                                : 'bg-white border border-gray-200 text-gray-900'
                                            }`}
                                          >
                                            <p className="text-sm whitespace-pre-wrap break-words">
                                              {message.content}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()

                                )}
                              </div>

                              {/* Heure */}
                              <div className={`flex items-center gap-2 mt-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-xs text-gray-500">
                                  {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {isOwn && <span className="text-xs text-gray-500">✓✓</span>}
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  <div className="sticky bottom-0 p-4 border-t bg-white">
                    {/* Aperçu du fichier attaché */}
                    {attachedFile && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          {attachmentPreview ? (
                            <img 
                              src={attachmentPreview} 
                              alt="Preview" 
                              className="h-16 w-16 object-cover rounded"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-500">PDF</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {attachedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(attachedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={removeAttachment}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 items-center">
                      {/* Bouton d'attachment */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={sending}
                      >
                        <span className="text-xl">+</span>
                      </Button>

                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`Message ${
                          activeChat.other_user?.account_type === 'company'
                            ? activeChat.other_user.company_name
                            : activeChat.other_user?.full_name?.split(' ')[0] || 'User'
                        }...`}
                        disabled={sending}
                        className="flex-1"
                      />

                      <Button
                        onClick={handleSendMessage}
                        disabled={(!messageInput.trim() && !attachedFile) || sending}
                        size="icon"
                        className="bg-green-700 hover:bg-green-800 shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="text-gray-400 mb-4">
                      <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-12 w-12" />
                      </div>
                    </div>
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
            <div className="w-80 border-l bg-gray-50 flex flex-col">
              {activeChat ? (
                <>
                  {/* Header sticky du panneau About */}
                  <div className="sticky top-0 z-10 p-6 bg-gray-50 border-b">
                    <h3 className="text-lg font-semibold text-center">About</h3>
                  </div>

                  {/* Contenu scrollable */}
                  <ScrollArea className="flex-1 px-6" style={{ height: 'calc(100vh - 400px)' }}>
                    <div className="py-4">
                      <div className="text-center mb-6">
                        <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white shadow-lg">
                          {activeChat.other_user?.avatar_url ? (
                            <AvatarImage 
                              src={activeChat.other_user.avatar_url} 
                              alt={(() => {
                                if (!activeChat.other_user) return 'User';
                                return activeChat.other_user.account_type === 'company'
                                  ? activeChat.other_user.company_name || 'Company'
                                  : activeChat.other_user.full_name || 'User';
                              })()} 
                            />
                          ) : null}
                          <AvatarFallback className="text-2xl">
                            {(() => {
                              if (!activeChat.other_user) return 'U';
                              const name = activeChat.other_user.account_type === 'company'
                                ? activeChat.other_user.company_name
                                : activeChat.other_user.full_name;
                              return (name).charAt(0).toUpperCase();
                            })()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <h4 className="text-lg font-semibold mb-2">
                          {(() => {
                            if (!activeChat.other_user) return 'Unknown';
                            const isPerson = activeChat.other_user.account_type === 'person';
                            const isCompany = activeChat.other_user.account_type === 'company';
                            return isPerson
                              ? activeChat.other_user.full_name
                              : isCompany
                              ? activeChat.other_user.company_name
                              : 'Unknown';
                          })()}
                        </h4>
                        
                        <div className="flex items-center justify-center gap-1 mt-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium">N/A</span>
                          <span className="text-sm text-gray-500">(0 reviews)</span>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Member since</span>
                          <span className="font-medium">January 2026</span>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {activeChat.other_user?.bio || 'No bio available'}
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                  {/* Bouton fixe en bas */}
                  <div className="sticky bottom-0 p-6 bg-gray-50 border-t">
                    <Link href={`/profile/${activeChat.other_user?.id}`}>
                      <Button className="w-full bg-green-700 hover:bg-green-800 text-white">
                        View Full Profile
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p className="text-sm text-center px-4">
                    Select a conversation to view profile details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}