"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";

interface Props {
  isBlocked: boolean;
  isBlockedByOther: boolean;
  blockLoading: boolean;
  onUnblock: () => void;
}

export default function BlockedBanner({ isBlocked, isBlockedByOther, blockLoading, onUnblock }: Props) {
  if (isBlocked) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <Ban className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">User Blocked</h3>
          <p className="text-gray-500 mb-6">You have blocked this user. Unblock them to see their content.</p>
          <Button
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50 cursor-pointer"
            onClick={onUnblock}
            disabled={blockLoading}
          >
            {blockLoading ? "Unblocking..." : "Unblock User"}
          </Button>
        </div>
      </Card>
    );
  }

  if (isBlockedByOther) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <Ban className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Contenu non disponible</h3>
          <p className="text-gray-500">Vous ne pouvez pas voir le contenu de ce profil.</p>
        </div>
      </Card>
    );
  }

  return null;
}
