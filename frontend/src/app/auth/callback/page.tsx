"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Authenticating...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          setMessage("Authentication failed. Redirecting to login...");
          setTimeout(() => router.push("/login"), 2000);
          return;
        }

        if (session) {
          const user = session.user;
          const profileCompleted = user.user_metadata?.profile_completed;

          if (!profileCompleted) {
            setMessage("Email verified! Let's complete your profile...");
            setTimeout(() => router.push("/choose_type"), 1500);
          } else {
            setMessage("Welcome back!");
            setTimeout(() => router.push("/"), 1500);
          }
        } else {
          setMessage("No session found. Redirecting to login...");
          setTimeout(() => router.push("/login"), 2000);
        }
      } catch (err) {
        console.error("Callback error:", err);
        setMessage("Something went wrong. Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
}