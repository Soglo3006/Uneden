import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, ShieldAlert, UserRoundPlus, ArrowLeft } from "lucide-react";
import ReportUserPage from "./ellipsis/ReportUserPage";
import ReportListingPage from "./ellipsis/ReportListingPage";
import BlockUserPage from "./ellipsis/BlockUserPage";
import ShareProfilePage from "./ellipsis/ShareProfilePage";

type Screen = "default" | "reportUser" | "reportListing" | "blockUser" | "shareProfile";

interface Props {
  onClose: () => void;
  profileId: string;
  displayName: string;
  userListings: { id: string; title: string; price: number; image_url?: string }[];
}

const SCREEN_TITLES: Record<Screen, string> = {
  default: "Profile Options",
  reportUser: "Report User",
  reportListing: "Report Listing",
  blockUser: "Block User",
  shareProfile: "Share Profile",
};

export default function EllipsisPage({ onClose, profileId, displayName, userListings }: Props) {
  const [screen, setScreen] = useState<Screen>("default");

  return (
    <div className="w-full bg-gray-50">
      <div className="bg-white border-b relative">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-xl absolute top-4 right-4 cursor-pointer">✕</button>
        {screen !== "default" && (
          <button onClick={() => setScreen("default")} className="text-gray-600 hover:text-gray-900 text-sm absolute top-1 left-4 flex items-center gap-1 cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        )}
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{SCREEN_TITLES[screen]}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {screen === "default" && (
          <div className="grid gap-6">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <ShieldAlert className="h-6 w-6 text-green-700" />
                  <h2 className="text-xl font-bold text-gray-900">Report & Safety</h2>
                </div>
              </div>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-between cursor-pointer" onClick={() => setScreen("reportUser")}>
                  <span>Report User</span><ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between cursor-pointer" onClick={() => setScreen("reportListing")}>
                  <span>Report Listing</span><ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between border-red-200 text-red-600 hover:bg-red-50 cursor-pointer" onClick={() => setScreen("blockUser")}>
                  <span>Block User</span><ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <UserRoundPlus className="h-6 w-6 text-green-700" />
                  <h2 className="text-xl font-bold text-gray-900">Profile Actions</h2>
                </div>
              </div>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-between cursor-pointer" onClick={() => setScreen("shareProfile")}>
                  <span>Share Profile</span><ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        )}
        {screen === "reportUser" && <ReportUserPage profileId={profileId} displayName={displayName} onClose={onClose} />}
        {screen === "reportListing" && <ReportListingPage profileId={profileId} displayName={displayName} userListings={userListings} onClose={onClose} />}
        {screen === "blockUser" && <BlockUserPage profileId={profileId} displayName={displayName} onBack={() => setScreen("default")} onClose={onClose} />}
        {screen === "shareProfile" && <ShareProfilePage profileId={profileId} displayName={displayName} />}
      </div>
    </div>
  );
}
