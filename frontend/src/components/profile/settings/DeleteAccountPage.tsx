"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, TriangleAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  onBack: () => void;
  onClose: () => void;
}

export default function DeleteAccountPage({ onBack, onClose }: Props) {
  const { session, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "DELETE") { setError("Please type DELETE to confirm"); return; }
    try {
      setLoading(true); setError("");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/delete-account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete account");
      await signOut();
    } catch (err: unknown) {
      console.error("Delete account error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="bg-white border-b relative">
        <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-900 text-xl cursor-pointer">✕</button>
        <button onClick={onBack} className="absolute top-3 left-3 sm:top-4 sm:left-4 text-gray-600 hover:text-gray-900 cursor-pointer text-sm">← Back</button>
        <div className="px-3 sm:px-4 py-4 sm:py-6 text-center">
          <h1 className="text-lg sm:text-3xl font-bold text-red-600 mt-6 sm:mt-0">Delete Account</h1>
        </div>
      </div>
      <div className="px-3 sm:px-4 py-4 sm:py-8">
        <Card className="p-4 sm:p-8 border-2 border-red-200 shadow-lg">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 flex items-center justify-center">
              <TriangleAlert className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
            </div>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-center text-gray-900 mb-2">Permanent Account Deletion</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4">
            <p className="text-gray-800 text-center text-sm leading-relaxed">
              This is <span className="font-bold text-red-600">permanent and irreversible</span>. All your data will be removed:
            </p>
          </div>
          <div className="space-y-2 mb-6">
            {["Your profile and account information", "All messages and conversations", "Services and listings", "Bookings and transaction history", "Reviews and ratings"].map((item) => (
              <div key={item} className="flex items-start gap-3 text-gray-700">
                <span className="text-red-500 shrink-0"><X className="h-4 w-4 mt-0.5" /></span>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg">
              <p className="text-red-800 text-sm text-center font-medium">{error}</p>
            </div>
          )}
          <div className="mb-4">
            <Label htmlFor="confirmText" className="block text-center mb-3 text-gray-700 font-medium text-sm">
              Type <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">DELETE</span> to confirm
            </Label>
            <Input
              id="confirmText" type="text" value={confirmText}
              onChange={(e) => { setConfirmText(e.target.value); setError(""); }}
              disabled={loading} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              className={`text-center font-mono text-base uppercase tracking-wider ${confirmText && confirmText !== "DELETE" ? "border-red-300" : ""}`}
            />
            {confirmText && confirmText !== "DELETE" && (
              <p className="text-xs text-red-500 text-center mt-1">Please type exactly: DELETE</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1 cursor-pointer text-sm" onClick={onBack} disabled={loading}>Cancel</Button>
            <Button
              className={`flex-1 cursor-pointer text-sm transition-all ${confirmText === "DELETE" && !loading ? "bg-red-600 hover:bg-red-700 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
              onClick={handleDelete} disabled={loading || confirmText !== "DELETE"}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Deleting...
                </span>
              ) : "Delete My Account"}
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">This action cannot be undone.</p>
        </Card>
      </div>
    </div>
  );
}
