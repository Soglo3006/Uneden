"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

export default function StartConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();
  const userId = params.userId as string;

  const { loading } = useProtectedRoute({
    requireAuth: true,
    requireProfileCompleted: true,
  });

  useEffect(() => {
    if (!loading && session?.access_token) {
      // Redirect to messages page with userId as a query param
      router.push(`/messages?userId=${userId}`);
    }
  }, [loading, session, userId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return null;
}