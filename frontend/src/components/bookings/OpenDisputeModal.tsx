"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, AlertTriangle, CheckCircle } from "lucide-react";

interface Props {
  bookingId: string;
  serviceTitle: string;
  accessToken: string;
  onClose: () => void;
  onOpened: (bookingId: string) => void;
}

export default function OpenDisputeModal({
  bookingId,
  serviceTitle,
  accessToken,
  onClose,
  onOpened,
}: Props) {
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isValid = description.trim().length >= 20;

  const handleSubmit = async () => {
    if (!isValid) {
      setError("Please provide a description (at least 20 characters).");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/disputes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ booking_id: bookingId, description: description.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Failed to open dispute.");
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        onOpened(bookingId);
        onClose();
      }, 800);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Open a Dispute</h2>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{serviceTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
            Opening a dispute will notify our team and both parties. Please describe the issue clearly.
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-base font-medium text-gray-900">
              Describe the issue <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what went wrong, what was agreed upon, and what outcome you're seeking…"
              className="min-h-32 resize-none"
            />
            <p className={`text-xs text-right ${description.length < 20 ? "text-gray-400" : "text-green-600"}`}>
              {description.length} / 20 characters minimum
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white min-w-36"
            onClick={handleSubmit}
            disabled={submitting || !isValid}
          >
            {success ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Dispute Opened!
              </span>
            ) : submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Opening…
              </span>
            ) : "Open Dispute"}
          </Button>
        </div>
      </div>
    </div>
  );
}
