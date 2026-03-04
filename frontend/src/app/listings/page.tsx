"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, ChevronRight, MapPin, X } from "lucide-react";
import { categories } from "@/lib/categories";
import ListingsGrid from "@/components/listings/ListingsGrid";

// ── Inner component (needs useSearchParams inside Suspense) ──────────────────
function ListingsContent() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") ?? "");
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get("subcategory") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [serviceType, setServiceType] = useState(searchParams.get("type") ?? "all");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : []
  );

  // Sync search from header navigation (URL param changes)
  const urlSearch = searchParams.get("search") ?? "";
  useEffect(() => {
    setSearch(urlSearch);
    setDebouncedSearch(urlSearch);
  }, [urlSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced values — prevent API call on every keystroke/drag
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [debouncedLocation, setDebouncedLocation] = useState(location);
  const [debouncedPrice, setDebouncedPrice] = useState<[number, number]>(priceRange);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedLocation(location), 400);
    return () => clearTimeout(t);
  }, [location]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedPrice(priceRange), 300);
    return () => clearTimeout(t);
  }, [priceRange]);

  const toggleExpand = (name: string) =>
    setExpandedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );

  const selectCategory = (name: string) => {
    setSelectedCategory(name);
    setSelectedSubcategory("");
  };

  const selectSubcategory = (cat: string, sub: string) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(sub);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setLocation("");
    setPriceRange([0, 1000]);
    setServiceType("all");
    setExpandedCategories([]);
  };

  const activeChips = [
    debouncedSearch && { label: `"${debouncedSearch}"`, clear: () => setSearch("") },
    selectedCategory && !selectedSubcategory && { label: selectedCategory, clear: () => setSelectedCategory("") },
    selectedSubcategory && { label: selectedSubcategory, clear: () => setSelectedSubcategory("") },
    debouncedLocation && { label: `📍 ${debouncedLocation}`, clear: () => setLocation("") },
    serviceType !== "all" && { label: serviceType === "offer" ? "Offering" : "Looking", clear: () => setServiceType("all") },
    (debouncedPrice[0] > 0 || debouncedPrice[1] < 1000) && {
      label: `$${debouncedPrice[0]}–$${debouncedPrice[1] >= 1000 ? "1000+" : debouncedPrice[1]}`,
      clear: () => setPriceRange([0, 1000]),
    },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div className="max-w-7xl mx-auto p-5">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Filter sidebar ── */}
        <aside className="w-full lg:w-1/4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <div className="border border-gray-200 rounded-xl p-4 space-y-5">

            {/* Clear all */}
            {activeChips.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{activeChips.length} filter{activeChips.length > 1 ? "s" : ""} active</span>
                <button onClick={clearFilters} className="text-xs text-green-700 underline hover:text-green-800">
                  Clear all
                </button>
              </div>
            )}

            {/* Type */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Type</h3>
              <div className="flex gap-2">
                {[
                  { value: "all", label: "All" },
                  { value: "offer", label: "Offering" },
                  { value: "looking", label: "Looking" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setServiceType(value)}
                    className={`flex-1 text-xs px-2 py-2 rounded-lg border transition-colors ${
                      serviceType === value
                        ? "border-green-700 bg-green-50 text-green-800 font-semibold"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">Category</h3>
                {selectedCategory && (
                  <button
                    onClick={() => { setSelectedCategory(""); setSelectedSubcategory(""); }}
                    className="text-xs text-green-700 underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-0.5">
                {categories.map((cat) => (
                  <div key={cat.name}>
                    <button
                      onClick={() => {
                        toggleExpand(cat.name);
                        selectCategory(cat.name);
                      }}
                      className={`w-full flex items-center justify-between py-2 px-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat.name && !selectedSubcategory
                          ? "bg-green-50 text-green-800 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{cat.name}</span>
                      {expandedCategories.includes(cat.name) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedCategories.includes(cat.name) && (
                      <div className="ml-3 pl-3 border-l-2 border-gray-100 space-y-0.5 mb-1">
                        {cat.subcategories.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => selectSubcategory(cat.name, sub)}
                            className={`block w-full text-left py-1.5 px-2 rounded text-xs transition-colors ${
                              selectedSubcategory === sub
                                ? "text-green-800 bg-green-50 font-semibold"
                                : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Location</h3>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="City or area..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Price range */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">Price</h3>
                <span className="text-xs font-medium text-green-700">
                  ${priceRange[0]} – {priceRange[1] >= 1000 ? "$1000+" : `$${priceRange[1]}`}
                </span>
              </div>
              <Slider
                value={priceRange}
                onValueChange={(v) => setPriceRange(v as [number, number])}
                max={1000}
                step={5}
                className="w-full [&_[data-slot=slider-track]]:bg-gray-300 [&_[data-slot=slider-range]]:bg-green-700 [&_[data-slot=slider-thumb]]:border-green-800 [&_[data-slot=slider-thumb]]:bg-white cursor-pointer"
              />
            </div>

            {/* Ad in sidebar */}
            <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center border border-gray-200">
              <span className="text-gray-500 text-xs">Ad placeholder</span>
            </div>
          </div>
        </aside>

        {/* ── Results ── */}
        <div className="w-full lg:w-3/4 space-y-4">
          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeChips.map(({ label, clear }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 bg-green-50 text-green-800 text-xs px-3 py-1 rounded-full border border-green-200"
                >
                  {label}
                  <button onClick={clear} className="ml-1 hover:text-green-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <ListingsGrid
            filters={{
              search: debouncedSearch,
              category: selectedCategory,
              subcategory: selectedSubcategory,
              location: debouncedLocation,
              minPrice: debouncedPrice[0],
              maxPrice: debouncedPrice[1],
              serviceType,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Page wrapper ─────────────────────────────────────────────────────────────
export default function ListingsPage() {
  return (
    <div className="bg-white min-h-screen text-black">
      <Header />

      {/* Ad banner */}
      <div className="bg-gray-200 border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-center">
            <span className="text-gray-500 text-sm font-medium">Ad placeholder</span>
          </div>
        </div>
      </div>

      <main>
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto p-5 flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <ListingsContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
