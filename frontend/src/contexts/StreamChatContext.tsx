"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { StreamChat } from "stream-chat";
import { useAuth } from "./AuthContext";

interface StreamChatContextType {
  client: StreamChat | null;
  isReady: boolean;
}

const StreamChatContext = createContext<StreamChatContextType>({
  client: null,
  isReady: false,
});

export function StreamChatProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();

  const clientRef = useRef<StreamChat | null>(null);
  const connectedUserIdRef = useRef<string | null>(null);
  const connectingRef = useRef(false);

  const [client, setClient] = useState<StreamChat | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const run = async () => {
      const accessToken = session?.access_token;

      // si pas connecté (supabase), on coupe stream
      if (!user || !accessToken) {
        if (clientRef.current) {
          try {
            await clientRef.current.disconnectUser();
          } catch (e) {
            console.error(e);
          }
        }
        clientRef.current = null;
        connectedUserIdRef.current = null;
        setClient(null);
        setIsReady(false);
        return;
      }

      // éviter double-connect (StrictMode / rerenders)
      if (connectingRef.current) return;

      try {
        connectingRef.current = true;

        // fetch token stream
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stream/token`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) throw new Error("Failed to get Stream token");

        const { token, apiKey, userId } = await response.json();

        // si déjà connecté au même user -> ne reconnect pas
        if (clientRef.current && connectedUserIdRef.current === userId) {
          setClient(clientRef.current);
          setIsReady(true);
          return;
        }

        // si un autre user était connecté, on nettoie
        if (clientRef.current) {
          await clientRef.current.disconnectUser();
        }

        const chatClient = StreamChat.getInstance(apiKey);

        await chatClient.connectUser(
          {
            id: userId,
            name: user.user_metadata?.full_name || user.email,
            image: user.user_metadata?.avatar || "",
          },
          token
        );

        clientRef.current = chatClient;
        connectedUserIdRef.current = userId;

        setClient(chatClient);
        setIsReady(true);
      } catch (err) {
        console.error("Stream Chat init error:", err);
        setIsReady(false);
      } finally {
        connectingRef.current = false;
      }
    };

    run();

    return () => {
      // unmount
      // (optionnel) tu peux laisser vide en dev, mais là c'est safe:
      // on ne disconnect pas à chaque rerender, seulement au unmount effect
    };
  }, [user?.id, session?.access_token]);

  return (
    <StreamChatContext.Provider value={{ client, isReady }}>
      {children}
    </StreamChatContext.Provider>
  );
}

export function useStreamChat() {
  return useContext(StreamChatContext);
}
