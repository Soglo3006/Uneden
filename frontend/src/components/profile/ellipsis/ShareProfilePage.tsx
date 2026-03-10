"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Share2, Copy, Check } from "lucide-react";

interface Props {
  profileId: string;
  displayName: string;
}

export default function ShareProfilePage({ profileId, displayName }: Props) {
  const { t } = useTranslation();
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
        await navigator.share({ title: t("profile.shareTitle", { name: displayName }), text: t("profile.shareText", { name: displayName }), url: profileUrl });
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="text-center">
        <Share2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("profile.shareProfile")} - {displayName}</h3>
        <p className="text-sm text-gray-600">{t("profile.copyLinkToShare")}</p>
      </div>
      <div className="flex gap-2">
        <input type="text" value={profileUrl} readOnly className="flex-1 h-10 px-3 border rounded-lg bg-gray-50 text-sm" />
        <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer h-10" onClick={handleCopy}>
          {copied ? <><Check className="h-4 w-4 mr-2" />{t("common.copied")}</> : <><Copy className="h-4 w-4 mr-2" />{t("common.copy")}</>}
        </Button>
      </div>
      {typeof navigator !== "undefined" && 'share' in navigator && (
        <Button variant="outline" className="w-full cursor-pointer" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" /> {t("profile.shareViaDevice")}
        </Button>
      )}
    </Card>
  );
}
