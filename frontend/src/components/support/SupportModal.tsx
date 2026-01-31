"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

interface SupportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SupportModal({ open, onClose }: SupportModalProps) {
  const { user, session } = useAuth();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const submit = async () => {
    setError(null);
    setSuccess(null);
    if (!user) {
      setError("Please sign in to contact support.");
      return;
    }
    if (!description.trim()) {
      setError("Please describe your issue.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ subject, category, description }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to submit support request");
      }
      setSuccess("Your message has been sent to Uneden support. We'll get back to you soon.");
      setSubject("");
      setCategory("");
      setDescription("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <Card className="relative z-10 w-full max-w-lg p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Uneden Support</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Tell us about your issue. For the MVP, your message is sent directly to our support team.
        </p>

        <div className="space-y-3">
          <Input placeholder="Subject (optional)" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Input placeholder="Category (optional)" value={category} onChange={(e) => setCategory(e.target.value)} />
          <Textarea placeholder="Describe your problem" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        {success && <div className="mt-3 text-sm text-green-700">{success}</div>}

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="cursor-pointer">Cancel</Button>
          <Button onClick={submit} disabled={loading} className="bg-green-700 text-white hover:bg-green-800 cursor-pointer">
            {loading ? "Sending..." : "Send to Support"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
