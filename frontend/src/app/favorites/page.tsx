"use client";

import Header from "@/components/home/Header";
import CategoryNav from "@/components/home/Category";
import Footer from "@/components/home/Footer";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { sampleListings } from "@/lib/listings";
import ListingCard from "@/components/listings/ListingCard";
import Link from "next/link";
import { HeartOff, Grid3x3 } from "lucide-react";

type Service = {
  id: number;
  title: string;
  price: number;
  location: string;
  created_at?: string;
  image_url?: string | null;
  image?: string | null;
};

export default function FavoritesPage() {
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Load saved IDs from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedListings");
      const arr: number[] = raw ? JSON.parse(raw) : [];
      setSavedIds(arr);
    } catch {
      setSavedIds([]);
    }
  }, []);

  // Fetch details for saved IDs (API), fallback to sample listings
  useEffect(() => {
    const fetchAll = async () => {
      if (!savedIds.length) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const results: Service[] = [];

      await Promise.all(
        savedIds.map(async (id) => {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}`);
            if (res.ok) {
              const data = await res.json();
              results.push({
                id: data.id,
                title: data.title,
                price: data.price,
                location: data.location,
                created_at: data.created_at,
                image_url: data.image_url,
              });
              return;
            }
          } catch {}

          // Fallback to sample listing if API fails
          const sample = sampleListings.find((s) => s.id === id);
          if (sample) {
            results.push({
              id: sample.id,
              title: sample.title,
              price: sample.price as number,
              location: sample.location,
              created_at: sample.created_at,
              image: sample.image,
            });
          }
        })
      );

      setItems(results);
      setLoading(false);
    };

    fetchAll();
  }, [savedIds]);

  const remove = (id: number) => {
    try {
      const next = savedIds.filter((x) => x !== id);
      localStorage.setItem("savedListings", JSON.stringify(next));
      setSavedIds(next);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <CategoryNav />

      <main className="max-w-7xl mx-auto p-5">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">My Favorites</h1>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
          </div>
        ) : items.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((s) => (
              <Card key={s.id} className="p-3">
                <div className="relative">
                  <button
                    onClick={() => remove(s.id)}
                    className="absolute top-2 right-2 z-10 rounded-full bg-white/90 hover:bg-white border border-gray-200 p-2"
                    aria-label="Remove from favorites"
                  >
                    <HeartOff className="h-4 w-4 text-red-500" />
                  </button>
                  <Link href={`/serviceDetail/${s.id}`}>
                    <ListingCard
                      title={s.title}
                      price={s.price}
                      location={s.location}
                      postedTime={s.created_at || "Recently"}
                      imageUrl={(s as any).image_url || (s as any).image || undefined}
                    />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center">
            <Grid3x3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-900">No favorites yet</h2>
            <p className="text-gray-600 mt-1">Save services to see them here.</p>
            <Link href="/">
              <Button className="mt-4 bg-green-700 text-white hover:bg-green-800">Browse Services</Button>
            </Link>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
