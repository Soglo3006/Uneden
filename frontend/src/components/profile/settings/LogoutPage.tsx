"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { SubPageHeader } from "./SubPageHeader";

interface Props {
  onBack: () => void;
  onClose: () => void;
}

export default function LogoutPage({ onBack, onClose }: Props) {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50">
      <SubPageHeader title="Logout" onBack={onBack} onClose={onClose} />
      <div className="px-3 sm:px-4 py-4 sm:py-8">
        <Card className="p-4 sm:p-6">
          <p className="text-sm text-gray-600 text-center mb-4">Are you sure you want to log out?</p>
          <div className="flex gap-3">
            <Button variant="outline" className="cursor-pointer flex-1 text-sm" onClick={onBack} disabled={loading}>Cancel</Button>
            <Button className="bg-red-600 text-white hover:bg-red-700 cursor-pointer flex-1 text-sm" onClick={handleLogout} disabled={loading}>
              {loading ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
