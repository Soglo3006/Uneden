"use client";

import { useState, useEffect } from "react";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useStreamChat } from "@/contexts/StreamChatContext";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Chat, 
  Channel, 
  MessageList, 
  MessageInput, 
  Window,
  ChannelList,
  Thread,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import Header from "@/components/home/Header";
import CategoryNav from "@/components/home/Category";
import Footer from "@/components/home/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Search, MoreVertical, Star } from "lucide-react";

// Composant personnalisé pour la preview des conversations
const CustomChannelPreview = ({ channel, latestMessage, unread, setActiveChannel, activeChannel }) => {
  const otherMembers = Object.values(channel.state.members).filter(
    (member) => member.user.id !== channel._client.userID
  );
  
  const otherUser = otherMembers[0]?.user;
  const isActive = activeChannel?.id === channel.id;
  
  const formatDate = (date) => {
    if (!date) return '';
    const messageDate = new Date(date);
    const today = new Date();
    
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return messageDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  return (
    <div
      onClick={() => setActiveChannel(channel)}
      className={`flex items-start gap-3 p-4 cursor-pointer transition-colors border-l-4 ${
        isActive 
          ? "bg-green-50 border-l-green-700" 
          : "bg-white border-l-transparent hover:bg-gray-50"
      }`}
    >
      <Avatar className="h-12 w-12 mt-1">
        <AvatarImage src={otherUser?.image} alt={otherUser?.name} />
        <AvatarFallback className="bg-gray-200 text-gray-700 text-lg font-semibold">
          {otherUser?.name?.charAt(0) || "A"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-gray-900 text-base">
            {otherUser?.name || "User"}
          </h3>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
            {formatDate(channel.state.last_message_at)}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 mb-1">
          Direct message
        </p>
        
        <p className="text-sm text-gray-700 truncate">
          {latestMessage?.text || "No messages yet"}
        </p>
      </div>
    </div>
  );
};

// Composant pour l'en-tête personnalisé du canal
const CustomChannelHeader = ({ channel }) => {
  const otherMembers = Object.values(channel.state.members).filter(
    (member) => member.user.id !== channel._client.userID
  );
  
  const otherUser = otherMembers[0]?.user;
  
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={otherUser?.image} alt={otherUser?.name} />
          <AvatarFallback className="bg-gray-200 text-gray-700 text-lg font-semibold">
            {otherUser?.name?.charAt(0) || "A"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-gray-900 text-lg">
            {otherUser?.name || "User"}
          </h2>
          <p className="text-sm text-gray-500">Direct message</p>
        </div>
      </div>
      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
        <MoreVertical className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
};

// Panneau latéral "About"
const AboutPanel = ({ channel }) => {
  const otherMembers = Object.values(channel?.state?.members || {}).filter(
    (member) => member.user.id !== channel?._client?.userID
  );
  
  const otherUser = otherMembers[0]?.user;
  
  if (!channel) return null;
  
  return (
    <div className="w-80 border-l bg-white p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">About</h2>
      
      <div className="flex flex-col items-center mb-6">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={otherUser?.image} alt={otherUser?.name} />
          <AvatarFallback className="bg-gray-200 text-gray-700 text-3xl font-semibold">
            {otherUser?.name?.charAt(0) || "A"}
          </AvatarFallback>
        </Avatar>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {otherUser?.name || "User"}
        </h3>
        
        <div className="flex items-center gap-1 mb-4">
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          <span className="font-semibold">N/A</span>
          <span className="text-sm text-gray-500">(0 reviews)</span>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Member since</span>
          <span className="font-semibold text-gray-900">January 2026</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Completed jobs</span>
          <span className="font-semibold text-gray-900">0</span>
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 leading-relaxed">
          {otherUser?.bio || "No bio available"}
        </p>
      </div>
      
      <button className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
        View Full Profile
      </button>
    </div>
  );
};

// Composant vide pour quand aucune conversation n'est sélectionnée
const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
    <MessageCircle className="h-24 w-24 text-gray-300 mb-4" />
    <h2 className="text-2xl font-bold text-gray-900 mb-2">No conversation selected</h2>
    <p className="text-gray-600 text-center max-w-md">
      Choose a conversation from the list to start messaging, or create a new booking to start a conversation.
    </p>
  </div>
);

export default function MessagesPage() {
  const { user, session, loading: authLoading } = useAuth();
  const { loading: routeLoading } = useProtectedRoute({
    requireAuth: true,
    requireProfileCompleted: true,
  });

  const { client, isReady } = useStreamChat();
  const [activeChannel, setActiveChannel] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetUserId = searchParams.get("userId");

  const filters = { 
    type: 'messaging', 
    members: { $in: [user?.id || ''] } 
  };
  
  const sort = { last_message_at: -1 };
  const options = { limit: 20 };

  useEffect(() => {
    const createAndOpenChannel = async () => {
      if (!client || !isReady || !user || !targetUserId || !session?.access_token) return;
      
      try {
        console.log('🔄 Creating channel with user:', targetUserId);
        
        // Créer le canal via le backend
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stream/channel/direct`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ recipient_id: targetUserId })
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create channel');
        }
        
        const { channelId } = await response.json();
        console.log('Channel created:', channelId);
        
        // Ouvrir le canal créé
        const channel = client.channel('messaging', channelId);
        await channel.watch();
        setActiveChannel(channel);
        
        console.log('Channel opened');
        
        // Nettoyer l'URL
        router.replace('/messages');
      } catch (error) {
        console.error('Error:', error);
        // Ne pas afficher d'alerte si le canal existe déjà
        if (!error.message.includes('already exists')) {
          alert('Failed to start conversation. Please try again.');
        }
        // Nettoyer l'URL même en cas d'erreur
        router.replace('/messages');
      }
    };

    createAndOpenChannel();
  }, [client, isReady, user, targetUserId, session, router]);

  if (authLoading || routeLoading || !isReady || !client) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <CategoryNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <CategoryNav />
      
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-5">
        <div className="border rounded-xl overflow-hidden bg-white shadow-sm" style={{ height: 'calc(100vh - 200px)' }}>
          <Chat client={client} theme="str-chat__theme-light">
            <div className="flex h-full">
              {/* Liste des conversations */}
              <div className="w-96 border-r bg-white flex flex-col">
                <div className="p-4 border-b bg-white">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <h2 className="font-semibold text-gray-900 text-lg">
                    All Messages
                  </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  <ChannelList 
                    filters={filters} 
                    sort={sort}
                    options={options}
                    setActiveChannel={setActiveChannel}
                    Preview={(previewProps) => (
                      <CustomChannelPreview 
                        {...previewProps} 
                        activeChannel={activeChannel}
                      />
                    )}
                  />
                </div>
              </div>
              
              {/* Zone de chat */}
              <div className="flex-1 flex">
                {activeChannel ? (
                  <>
                    <div className="flex-1 flex flex-col">
                      <Channel channel={activeChannel}>
                        <Window>
                          <CustomChannelHeader channel={activeChannel} />
                          <MessageList />
                          <MessageInput />
                        </Window>
                        <Thread />
                      </Channel>
                    </div>
                    <AboutPanel channel={activeChannel} />
                  </>
                ) : (
                  <EmptyState />
                )}
              </div>
            </div>
          </Chat>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}