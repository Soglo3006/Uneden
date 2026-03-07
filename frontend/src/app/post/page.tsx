"use client";
import { useState } from "react";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import OfferServiceForm from "@/components/post/OfferServiceForm";
import LookingForWorkerForm from "@/components/post/LookingForWorkerForm";
import SuccessPopup from "@/components/post/SuccessPopup";

type PostMode = "offer" | "looking";

export default function PostServicePage() {
  const { loading } = useProtectedRoute({ requireAuth: true, requireProfileCompleted: true });
  const [mode, setMode] = useState<PostMode>("offer");
  const [success, setSuccess] = useState<{ type: PostMode; id: string } | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {success && (
        <SuccessPopup type={success.type} id={success.id} onClose={() => setSuccess(null)} />
      )}

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Create a New Post</h1>
            <p className="mt-3 text-gray-600 text-lg">Choose the type of post you want to create.</p>
          </div>

          <div className="flex gap-4 mb-6">
            {(["offer", "looking"] as PostMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`cursor-pointer flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl border-2 transition-all duration-200 font-semibold text-lg ${
                  mode === m
                    ? "bg-green-700 text-white border-green-700 shadow-lg"
                    : "bg-white text-gray-700 border-gray-200 hover:border-green-700 hover:bg-green-50"
                }`}
              >
                {m === "offer" ? "Offer a Service" : "Looking for a Worker"}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
            {mode === "offer" ? (
              <OfferServiceForm onSuccess={(id) => setSuccess({ type: "offer", id })} />
            ) : (
              <LookingForWorkerForm onSuccess={(id) => setSuccess({ type: "looking", id })} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
