"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Grid3x3, MapPin } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import EditListingModal from "@/components/listings/EditListingModal";

interface MyService {
  id: string;
  type: "offer" | "looking";
  title: string;
  description: string;
  price: string | number;
  location: string;
  category: string | null;
  subcategory: string | null;
  poster_type: string | null;
  availability: string | null;
  language: string | null;
  mobility: string | null;
  duration: string | null;
  urgency: string | null;
  image_url: string | null;
  created_at: string;
}

export default function MyListingsPage() {
  const { user, session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [listings, setListings] = useState<MyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<MyService | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    if (!session?.access_token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/my-services`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((data) => setListings(Array.isArray(data) ? data : []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [user, session, router, authLoading]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) setListings((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // silent
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <Link href="/post">
            <Button className="bg-green-700 hover:bg-green-800 text-white gap-2">
              <Plus className="h-4 w-4" />
              New Listing
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-xl shadow-sm bg-white animate-pulse overflow-hidden">
                <div className="w-full aspect-video bg-gray-200" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded w-16" />
                  <div className="h-8 bg-gray-200 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Grid3x3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-700">You have no listings yet.</p>
            <Link href="/post" className="text-sm text-green-700 hover:underline mt-2 inline-block">
              Post your first listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((s) => (
              <div key={s.id} className="border rounded-xl shadow-sm bg-white flex flex-col overflow-hidden hover:shadow-lg transition-all">
                <Link href={`/serviceDetail/${s.id}`} className="block">
                  <AspectRatio ratio={16 / 9}>
                    {s.image_url ? (
                      <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Grid3x3 className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                  </AspectRatio>
                </Link>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start gap-2 mb-1">
                    <Link href={`/serviceDetail/${s.id}`} className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-1 hover:text-green-700 transition-colors">
                        {s.title}
                      </h3>
                    </Link>
                    {s.type === "looking" && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs flex-shrink-0 border-0">Looking</Badge>
                    )}
                  </div>

                  <p className="text-green-700 font-bold text-lg mb-2">${Number(s.price)}</p>

                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{s.location}</span>
                  </div>

                  {s.category && (
                    <p className="text-xs text-gray-500 line-clamp-1 mb-3">
                      {s.category}{s.subcategory && ` • ${s.subcategory}`}
                    </p>
                  )}

                  <div className="mt-auto pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5 flex-1" onClick={() => setEditingService(s)}>
                      Edit
                    </Button>
                    {confirmDeleteId === s.id ? (
                      <>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white flex-1"
                          onClick={() => handleDelete(s.id)}
                          disabled={deletingId === s.id}
                        >
                          {deletingId === s.id ? "…" : "Confirm"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5 flex-1"
                        onClick={() => setConfirmDeleteId(s.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {editingService && session?.access_token && (
        <EditListingModal
          service={editingService}
          accessToken={session.access_token}
          onClose={() => setEditingService(null)}
          onSaved={(updated) => {
            setListings((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
            setEditingService(null);
          }}
        />
      )}
    </div>
  );
}
