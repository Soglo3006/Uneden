"use client";

import { supabase } from "@/lib/supabaseClient";

export default function TestPage() {
  const testConnection = async () => {
    const { data } = await supabase.from("users").select("*");
    console.log("DATA:", data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Test Supabase Connection</h1>
      <button
        onClick={testConnection}
        style={{ padding: "10px 20px", background: "green", color: "#fff" }}
      >
        Click to Test
      </button>
    </div>
  );
}
