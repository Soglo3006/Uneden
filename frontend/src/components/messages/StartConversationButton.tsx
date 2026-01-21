"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useStreamChat } from "@/contexts/StreamChatContext";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface StartConversationButtonProps {
  recipientId: string;
  recipientName: string;
  recipientImage?: string;
  bookingId?: string;
  serviceName?: string;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export default function StartConversationButton({
  recipientId,
  recipientName,
  recipientImage,
  bookingId,
  serviceName,
  variant = "default",
  className = "",
}: StartConversationButtonProps) {
  const router = useRouter();
  const { session, user } = useAuth();
  const { client, isReady } = useStreamChat();
  const [loading, setLoading] = useState(false);

  const handleStartConversation = async () => {
    if (!client || !isReady) {
      alert("Chat is not ready. Please try again.");
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      if (bookingId) {
        // Conversation liée à un booking
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stream/channel/booking`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ booking_id: bookingId }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to create channel");
        }
      } else {
        // Conversation directe
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stream/channel/direct`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ recipient_id: recipientId }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to create channel");
        }
      }

      // Rediriger vers la page des messages
      router.push("/messages");
    } catch (error) {
      console.error("Error starting conversation:", error);
      alert(error.message || "Failed to start conversation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleStartConversation}
      disabled={loading || !isReady}
      variant={variant}
      className={`gap-2 ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      {loading ? "Loading..." : "Send Message"}
    </Button>
  );
}