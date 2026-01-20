"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  MessageCircle, 
  Heart, 
  Calendar, 
  User, 
  Settings 
} from "lucide-react";
import ConversationsList from "./ConversationsList";
import MessageThread from "./MessageThread";
import UserInfoSidebar from "./UserInfoSidebar";

const navItems = [
  { id: "messages", label: "Messages", icon: MessageCircle, href: "/messages" },
  { id: "favourites", label: "My Favourites", icon: Heart, href: "/favourites" },
  { id: "orders", label: "My Orders", icon: Calendar, href: "/bookings/my-bookings" },
  { id: "profile", label: "My Profile", icon: User, href: `/profile/me` },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

export default function MessagesContent() {
  const { session, user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetUserId = searchParams.get("userId");
  
  const [activeTab, setActiveTab] = useState("messages");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingUser, setCheckingUser] = useState(false);

  // Vérifier si on peut créer une conversation avec l'utilisateur cible
  useEffect(() => {
    const checkConversationWithUser = async () => {
      if (!targetUserId || !session?.access_token) return;

      try {
        setCheckingUser(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/messages/check/${targetUserId}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          if (data.exists) {
            // La conversation existe déjà
            setSelectedConversation(data.conversation);
          } else {
            // Créer une nouvelle conversation virtuelle
            // Déterminer le nom d'affichage selon le type d'utilisateur
            let displayName = "User";
            if (data.otherUser.account_type === "company" && data.otherUser.company_name) {
              displayName = data.otherUser.company_name;
            } else if (data.otherUser.full_name) {
              displayName = data.otherUser.full_name;
            }
            
            setSelectedConversation({
              id: "new",
              other_user_id: targetUserId,
              other_user_name: displayName,
              other_user_avatar: data.otherUser.avatar || null,
              service_title: "Direct message",
              booking_id: null,
              last_message: "",
              last_message_at: new Date().toISOString(),
              unread_count: 0,
              isNew: true,
            });
          }
        }
      } catch (error) {
        console.error("Error checking conversation:", error);
      } finally {
        setCheckingUser(false);
      }
    };
    
    if (targetUserId) {
      checkConversationWithUser();
    }
  }, [targetUserId, session, router]);

  // Récupérer toutes les conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!session?.access_token) return;

      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/messages/conversations`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setConversations(data);

          // Si on n'a pas de conversation sélectionnée et pas d'utilisateur cible
          if (!selectedConversation && !targetUserId && data.length > 0) {
            setSelectedConversation(data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [session]);

  const handleConversationCreated = (newConv) => {
    // Retirer le paramètre userId de l'URL
    router.push("/messages");
    
    // Ajouter la nouvelle conversation à la liste
    setConversations([newConv, ...conversations]);
    setSelectedConversation(newConv);
  };

  if (loading || checkingUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <>
      {/* Secondary Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative cursor-pointer ${
                    activeTab === item.id
                      ? "text-green-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {activeTab === item.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700" />
                  )}
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {!selectedConversation && conversations.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No conversations yet
            </h3>
            <p className="text-gray-600">
              Start a conversation by booking a service or contacting a provider.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Conversations List */}
            <ConversationsList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
              newConversation={selectedConversation?.isNew ? selectedConversation : null}
            />

            {/* Message Thread */}
            <MessageThread 
              conversation={selectedConversation}
              onConversationCreated={handleConversationCreated}
            />

            {/* User Info Sidebar */}
            <UserInfoSidebar conversation={selectedConversation} />
          </div>
        )}
      </div>
    </>
  );
}