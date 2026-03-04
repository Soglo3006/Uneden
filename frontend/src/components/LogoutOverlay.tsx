"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function LogoutOverlay() {
  const { isLoggingOut } = useAuth();

  if (!isLoggingOut) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-600 font-medium">Signing out…</p>
    </div>
  );
}
