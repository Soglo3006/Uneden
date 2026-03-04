"use client";

import { useState, useEffect, useRef } from "react";
import ListingCard from "./ListingCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ApiService {
  id: string;
  title: string;
  price: number;
  location: string;
  created_at: string;
  image_url: string | null;
  category_name: string | null;
  subcategory: string | null;
}

export interface ListingsFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  serviceType?: string;
}

function formatRelativeDate(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return `${Math.floor(days / 7)} weeks ago`;
  } catch {
    return "Recently";
  }
}

const LISTINGS_PER_PAGE = 12;

export default function ListingsGrid({ filters }: { filters?: ListingsFilters }) {
  const [listings, setListings] = useState<ApiService[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPage(1);
    const controller = new AbortController();

    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters?.search)                               params.set("search", filters.search);
        if (filters?.category)                             params.set("categoryName", filters.category);
        if (filters?.subcategory)                          params.set("subcategory", filters.subcategory);
        if (filters?.location)                             params.set("location", filters.location);
        if (filters?.minPrice && filters.minPrice > 0)     params.set("minPrice", String(filters.minPrice));
        if (filters?.maxPrice && filters.maxPrice < 1000)  params.set("maxPrice", String(filters.maxPrice));
        if (filters?.serviceType && filters.serviceType !== "all") params.set("type", filters.serviceType);

        const query = params.toString();
        const url = `${process.env.NEXT_PUBLIC_API_URL}/services${query ? `?${query}` : ""}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        setListings(Array.isArray(data) ? data : []);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
    return () => controller.abort();
  }, [
    filters?.search,
    filters?.category,
    filters?.subcategory,
    filters?.location,
    filters?.minPrice,
    filters?.maxPrice,
    filters?.serviceType,
  ]);

  const totalPages = Math.ceil(listings.length / LISTINGS_PER_PAGE);
  const startIndex = (currentPage - 1) * LISTINGS_PER_PAGE;
  const currentListings = listings.slice(startIndex, startIndex + LISTINGS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div ref={gridTopRef} className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div ref={gridTopRef} className="text-center py-16 text-gray-500">
        <p className="text-lg font-medium">No services found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-5" ref={gridTopRef}>
      <div className="space-y-4">
        {currentListings.map((listing, index) => (
          <div key={listing.id}>
            <Link href={`/serviceDetail/${listing.id}`}>
              <ListingCard
                title={listing.title}
                price={Number(listing.price)}
                location={listing.location}
                postedTime={formatRelativeDate(listing.created_at)}
                imageUrl={listing.image_url ?? undefined}
                category={listing.category_name ?? undefined}
                subcategory={listing.subcategory ?? undefined}
              />
            </Link>
            {(index + 1) % 8 === 0 && index !== currentListings.length - 1 && (
              <div className="bg-gray-100 rounded-xl p-8 flex items-center justify-center border border-gray-200 h-32 mt-4">
                <span className="text-gray-500 text-sm font-medium">Ad placeholder</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="px-3">
            <ChevronLeft className="h-4 w-4" /><ChevronLeft className="h-4 w-4 -ml-3" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(i + 1)}
              className={`px-4 ${currentPage === i + 1 ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
            >
              {i + 1}
            </Button>
          ))}

          <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="px-3">
            <ChevronRight className="h-4 w-4" /><ChevronRight className="h-4 w-4 -ml-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
