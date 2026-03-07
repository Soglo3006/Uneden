"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface Listing { id: string; title: string; price: number; image_url?: string; }

interface Props {
  profileId: string;
  displayName: string;
  userListings: Listing[];
  onClose: () => void;
}

export default function ReportListingPage({ profileId, displayName, userListings, onClose }: Props) {
  const { user } = useAuth();
  const [selectedListingId, setSelectedListingId] = useState("");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!user || !selectedListingId || !reason || !details.trim()) { alert("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/listing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ listing_id: selectedListingId, reported_user_id: profileId, reason, description: details }),
      });
      if (!response.ok) throw new Error("Failed to submit");
      setSuccess(true);
    } catch {
      alert("Failed to submit report. Please try again.");
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
        <Button className="w-full bg-green-700 hover:bg-green-800 text-white cursor-pointer" onClick={onClose}>Close</Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <p className="text-gray-600">Select the listing from {displayName} you want to report.</p>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Listing</label>
        {userListings.length === 0 ? (
          <p className="text-sm text-gray-500 italic">This user has no listings.</p>
        ) : (
          <Select value={selectedListingId} onValueChange={setSelectedListingId}>
            <SelectTrigger className="w-full cursor-pointer"><SelectValue placeholder="Select a listing" /></SelectTrigger>
            <SelectContent>
              {userListings.map((listing) => (
                <SelectItem key={listing.id} value={listing.id} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    {listing.image_url && <img src={listing.image_url} className="w-6 h-6 rounded object-cover" />}
                    <span className="truncate max-w-[250px]">{listing.title}</span>
                    <span className="text-gray-400 text-xs">${listing.price}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Reason</label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger className="w-full cursor-pointer"><SelectValue placeholder="Select a reason" /></SelectTrigger>
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
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Details</label>
        <Textarea placeholder="Describe the problem..." className="min-h-[120px] resize-none"
          value={details} onChange={(e) => setDetails(e.target.value)} />
      </div>
      <Button className="w-full bg-green-700 hover:bg-green-800 text-white cursor-pointer"
        onClick={handleSubmit} disabled={loading || !selectedListingId || !reason || !details.trim()}>
        {loading ? "Submitting..." : "Submit Report"}
      </Button>
    </Card>
  );
}
