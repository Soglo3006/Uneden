"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import SupportModal from "./SupportModal";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function SupportButton({ floating = false }: { floating?: boolean }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const trigger = (
    <Button
      className={`bg-green-700 text-white hover:bg-green-800 cursor-pointer ${floating ? "fixed bottom-6 right-6 z-40" : ""}`}
      onClick={() => setOpen(true)}
    >
      Customer Support
    </Button>
  );

  return (
    <>
      {user ? (
        trigger
      ) : (
        <Link href="/login">{trigger}</Link>
      )}
      <SupportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
