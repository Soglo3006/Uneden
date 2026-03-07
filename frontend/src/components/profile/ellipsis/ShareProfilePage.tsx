"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Share2, Copy, Check } from "lucide-react";

interface Props {
  profileId: string;
  displayName: string;
}

export default function ShareProfilePage({ profileId, displayName }: Props) {
  const [copied, setCopied] = useState(false);
  const profileUrl = `${window.location.origin}/profile/${profileId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${displayName}'s Profile - Uneden`, text: `Check out ${displayName} on Uneden`, url: profileUrl });
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="text-center">
        <Share2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Share {displayName}'s Profile</h3>
        <p className="text-sm text-gray-600">Copy the link below to share this profile</p>
      </div>
      <div className="flex gap-2">
        <input type="text" value={profileUrl} readOnly className="flex-1 h-10 px-3 border rounded-lg bg-gray-50 text-sm" />
        <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer h-10" onClick={handleCopy}>
          {copied ? <><Check className="h-4 w-4 mr-2" />Copied!</> : <><Copy className="h-4 w-4 mr-2" />Copy</>}
        </Button>
      </div>
      {navigator.share && (
        <Button variant="outline" className="w-full cursor-pointer" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" /> Share via Device
        </Button>
      )}
    </Card>
  );
}
