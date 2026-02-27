import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronRight,
  ShieldAlert,
  UserRoundPlus,
  ArrowLeft,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface EllipsisPageProps {
  onClose: () => void;
  profileId: string;
  displayName: string;
  userListings: any[];
}

export default function EllipsisPage({ onClose, profileId, displayName, userListings }: EllipsisPageProps) {
  const [screen, setScreen] = useState("default");
  

  return (
    <div className="w-full bg-gray-50">
      <div className="bg-white border-b relative">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-900 text-xl absolute top-4 right-4 cursor-pointer"
        >
          ✕
        </button>

        {screen !== "default" && (
          <button
            onClick={() => setScreen("default")}
            className="text-gray-600 hover:text-gray-900 text-sm absolute top-1 left-4 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}

        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {screen === "default" && "Profile Options"}
            {screen === "reportUser" && "Report User"}
            {screen === "reportListing" && "Report Listing"}
            {screen === "blockUser" && "Block User"}
            {screen === "shareProfile" && "Share Profile"}
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {screen === "default" && <DefaultMenu setScreen={setScreen} />}
        {screen === "reportUser" && (
          <ReportUserPage 
            setScreen={setScreen} 
            profileId={profileId}
            displayName={displayName}
            onClose={onClose}
          />
        )}
        {screen === "reportListing" && 
        <ReportListingPage
          setScreen={setScreen}
          profileId={profileId}
          displayName={displayName}
          userListings={userListings}
          onClose={onClose}
        />}
        {screen === "blockUser" && (
          <BlockUserPage 
            setScreen={setScreen}
            profileId={profileId}
            displayName={displayName}
            onClose={onClose}
          />
        )}
        {screen === "shareProfile" && (
          <ShareProfilePage
            setScreen={setScreen}
            profileId={profileId}
            displayName={displayName}
          />
        )}
      </div>
    </div>
  );
}

function DefaultMenu({ setScreen }) {
  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <ShieldAlert className="h-6 w-6 text-green-700" />
            <h2 className="text-xl font-bold text-gray-900">Report & Safety</h2>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-between cursor-pointer"
            onClick={() => setScreen("reportUser")}
          >
            <span>Report User</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between cursor-pointer"
            onClick={() => setScreen("reportListing")}
          >
            <span>Report Listing</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
            onClick={() => setScreen("blockUser")}
          >
            <span>Block User</span>
            <ChevronRight className="h-4 w-4" />
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
          <Button 
            variant="outline" 
            className="w-full justify-between cursor-pointer"
            onClick={() => setScreen("shareProfile")}
          >
            <span>Share Profile</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ReportUserPage({ setScreen, profileId, displayName, onClose }) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);


  const handleSubmit = async () => {
    if (!user || !reason || !details.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: user.id,
          reported_user_id: profileId,
          reason: reason,
          description: details,
          status: 'pending'
        });

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      console.error('Error submitting report:', err);
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="h-8 w-8 text-green-700" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Report Received</h3>
        <p className="text-gray-600">
          Thank you for reporting {displayName}. We've received your report and will review 
          the account carefully. If it violates our policies, we'll take the appropriate action.
        </p>
        <Button className="w-full bg-green-700 hover:bg-green-800 text-white cursor-pointer" onClick={onClose}>
          Close
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <p className="text-gray-600">
        Tell us why you want to report {displayName}.
      </p>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Reason</label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inappropriate" className="cursor-pointer">
              Inappropriate behavior
            </SelectItem>
            <SelectItem value="fraud" className="cursor-pointer">
              Fraud / Scam attempt
            </SelectItem>
            <SelectItem value="harassment" className="cursor-pointer">
              Harassment
            </SelectItem>
            <SelectItem value="spam" className="cursor-pointer">
              Spam
            </SelectItem>
            <SelectItem value="fake" className="cursor-pointer">
              Fake profile
            </SelectItem>
            <SelectItem value="other" className="cursor-pointer">
              Other
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Details</label>
        <Textarea
          placeholder="Describe the issue in detail..."
          className="min-h-[120px] resize-none"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>

      <Button
        className="w-full bg-green-700 hover:bg-green-800 text-white cursor-pointer"
        onClick={handleSubmit}
        disabled={loading || !reason || !details.trim()}
      >
        {loading ? "Submitting..." : "Submit Report"}
      </Button>
    </Card>
  );
}

function ReportListingPage({ setScreen, profileId, displayName, userListings, onClose }) {
  const { user } = useAuth();
  const [selectedListingId, setSelectedListingId] = useState("");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!user || !selectedListingId || !reason || !details.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/listing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          listing_id: selectedListingId,
          reported_user_id: profileId,
          reason,
          description: details,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      setSuccess(true);
    } catch (err) {
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="h-8 w-8 text-green-700" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Report Received</h3>
        <p className="text-gray-600">
          Thank you for your report. We've received it and will review the listing carefully. 
          If it violates our policies, we'll take the appropriate action.
        </p>
        <Button className="w-full bg-green-700 hover:bg-green-800 text-white cursor-pointer" onClick={onClose}>
          Close
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <p className="text-gray-600">
        Select the listing from {displayName} you want to report.
      </p>

      {/* Sélection du listing */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Listing</label>
        {userListings.length === 0 ? (
          <p className="text-sm text-gray-500 italic">This user has no listings.</p>
        ) : (
          <Select value={selectedListingId} onValueChange={setSelectedListingId}>
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Select a listing" />
            </SelectTrigger>
            <SelectContent>
              {userListings.map((listing) => (
                <SelectItem key={listing.id} value={listing.id} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    {listing.image_url && (
                      <img src={listing.image_url} className="w-6 h-6 rounded object-cover" />
                    )}
                    <span className="truncate max-w-[250px]">{listing.title}</span>
                    <span className="text-gray-400 text-xs">${listing.price}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Raison */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Reason</label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="misleading" className="cursor-pointer">Misleading Information</SelectItem>
            <SelectItem value="price" className="cursor-pointer">Wrong Price</SelectItem>
            <SelectItem value="illegal" className="cursor-pointer">Illegal Service</SelectItem>
            <SelectItem value="offensive" className="cursor-pointer">Offensive Content</SelectItem>
            <SelectItem value="scam" className="cursor-pointer">Scam</SelectItem>
            <SelectItem value="other" className="cursor-pointer">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Détails */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Details</label>
        <Textarea
          placeholder="Describe the problem..."
          className="min-h-[120px] resize-none"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>

      <Button
        className="w-full bg-green-700 hover:bg-green-800 text-white cursor-pointer"
        onClick={handleSubmit}
        disabled={loading || !selectedListingId || !reason || !details.trim()}
      >
        {loading ? "Submitting..." : "Submit Report"}
      </Button>
    </Card>
  );
}

function BlockUserPage({ setScreen, profileId, displayName, onClose }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBlock = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_user_id: profileId,
        });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      console.error('Error blocking user:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">User Blocked</h3>
        <p className="text-gray-600">
          {displayName} has been blocked. They will no longer be able to contact you or see your profile.
        </p>
        <Button
          className="w-full bg-green-700 hover:bg-green-800 text-white cursor-pointer"
          onClick={() => { onClose(); window.location.reload(); }}
        >
          Close
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <p className="text-gray-900 font-bold text-2xl text-center">
        Are you sure you want to block {displayName}?
      </p>
      <div className="bg-gray-50 px-4 py-3 rounded-lg space-y-2">
        <p className="text-gray-700 text-sm">When you block this user:</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>They won't be able to contact you</li>
          <li>You won't see their listings or posts</li>
          <li>They won't be notified that you blocked them</li>
          <li>You can unblock them later in settings</li>
        </ul>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 cursor-pointer"
          onClick={() => setScreen("default")}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 bg-red-600 hover:bg-red-700 text-white cursor-pointer"
          onClick={handleBlock}
          disabled={loading}
        >
          {loading ? "Blocking..." : "Confirm Block"}
        </Button>
      </div>
    </Card>
  );
}

function ShareProfilePage({ setScreen, profileId, displayName }) {
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
        await navigator.share({
          title: `${displayName}'s Profile - FieldHearts`,
          text: `Check out ${displayName} on FieldHearts`,
          url: profileUrl,
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="p-6">
      <div className="text-center">
        <Share2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Share {displayName}'s Profile
        </h3>
        <p className="text-sm text-gray-600">
          Copy the link below to share this profile
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={profileUrl}
          readOnly
          className="flex-1 h-10 px-3 border rounded-lg bg-gray-50 text-sm"
        />
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer h-10"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </>
          )}
        </Button>
      </div>

      {navigator.share && (
        <Button
          variant="outline"
          className="w-full cursor-pointer"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share via Device
        </Button>
      )}
    </Card>
  );
}