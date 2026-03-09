"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface Props {
  profileId: string;
  displayName: string;
  onClose: () => void;
}

export default function ReportUserPage({ profileId, displayName, onClose }: Props) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!user || !reason || !details.trim()) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("user_reports").insert({
        reporter_id: user.id, reported_user_id: profileId,
        reason, description: details, status: "pending",
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      console.error("Error submitting report:", err);
      toast.error("Failed to submit report. Please try again.");
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
          Thank you for reporting {displayName}. We've received your report and will review the account carefully.
          If it violates our policies, we'll take the appropriate action.
        </p>
        <Button className="w-full bg-green-700 hover:bg-green-800 text-white cursor-pointer" onClick={onClose}>Close</Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <p className="text-gray-600">Tell us why you want to report {displayName}.</p>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Reason</label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger className="w-full cursor-pointer"><SelectValue placeholder="Select a reason" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="inappropriate" className="cursor-pointer">Inappropriate behavior</SelectItem>
            <SelectItem value="fraud" className="cursor-pointer">Fraud / Scam attempt</SelectItem>
            <SelectItem value="harassment" className="cursor-pointer">Harassment</SelectItem>
            <SelectItem value="spam" className="cursor-pointer">Spam</SelectItem>
            <SelectItem value="fake" className="cursor-pointer">Fake profile</SelectItem>
            <SelectItem value="other" className="cursor-pointer">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Details</label>
        <Textarea placeholder="Describe the issue in detail..." className="min-h-[120px] resize-none"
          value={details} onChange={(e) => setDetails(e.target.value)} />
      </div>
      <Button className="w-full bg-green-700 hover:bg-green-800 text-white cursor-pointer"
        onClick={handleSubmit} disabled={loading || !reason || !details.trim()}>
        {loading ? "Submitting..." : "Submit Report"}
      </Button>
    </Card>
  );
}
