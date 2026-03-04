"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Grid3x3, MapPin, HeartOff } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface FavoriteService {
  id: string;
  title: string;
  price: number;
  location: string;
  category: string | null;
  subcategory: string | null;
  image_url: string | null;
}

export default function FavoritesPage() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [items, setItems] = useState<FavoriteService[]>([]);
  const [loading, setLoading] = useState(true);

  // Load saved IDs from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedListings");
      const arr: string[] = raw ? JSON.parse(raw) : [];
      setSavedIds(arr);
    } catch {
      setSavedIds([]);
    }
  }, []);

  // Fetch details for saved IDs
  useEffect(() => {
    const fetchAll = async () => {
      if (!savedIds.length) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const results: FavoriteService[] = [];
      await Promise.all(
        savedIds.map(async (id) => {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}`);
            if (res.ok) {
              const data = await res.json();
              results.push({
                id: data.id,
                title: data.title,
                price: Number(data.price),
                location: data.location,
                category: data.category_name ?? data.category ?? null,
                subcategory: data.subcategory ?? null,
                image_url: data.image_url ?? null,
              });
            }
          } catch {}
        })
      );
      setItems(results);
      setLoading(false);
    };
    fetchAll();
  }, [savedIds]);

  const remove = (id: string) => {
    try {
      const next = savedIds.filter((x) => x !== id);
      localStorage.setItem("savedListings", JSON.stringify(next));
      setSavedIds(next);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Favorites</h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-xl shadow-sm bg-white animate-pulse overflow-hidden">
                <div className="w-full aspect-video bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Grid3x3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-700">No favorites yet.</p>
            <Link href="/listings" className="text-sm text-green-700 hover:underline mt-2 inline-block">
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((s) => (
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
                  <Link href={`/serviceDetail/${s.id}`} className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 hover:text-green-700 transition-colors">
                      {s.title}
                    </h3>
                  </Link>

                  <p className="text-green-700 font-bold text-lg mb-2">${s.price}</p>

                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{s.location}</span>
                  </div>

                  {s.category && (
                    <p className="text-xs text-gray-500 line-clamp-1 mb-3">
                      {s.category}{s.subcategory && ` • ${s.subcategory}`}
                    </p>
                  )}

                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                      onClick={() => remove(s.id)}
                    >
                      <HeartOff className="h-3.5 w-3.5" />
                      Remove from Favorites
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
