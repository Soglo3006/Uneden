"use client";

import { useState, useEffect } from "react";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import MessagesContent from "@/components/messages/MessagesContent";

export default function MessagesPage() {
  const { user, loading } = useProtectedRoute({
    requireAuth: true,
    requireProfileCompleted: true,
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <MessagesContent />
      <Footer />
    </div>
  );
}