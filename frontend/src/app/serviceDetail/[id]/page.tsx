"use client";

import { useParams } from "next/navigation";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ListingCard from "@/components/listings/ListingCard";
import { sampleListings } from "@/lib/listings";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Star, Clock, CheckCircle, Bookmark, Share2 } from "lucide-react";
import CategoryNav from "@/components/home/Category";
import Link from "next/link";
import StartConversationButton from "@/components/messages/StartConversationButton";
import { useEffect, useState } from "react";

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceId = parseInt(params.id as string, 10);

  // Trouver le listing par ID
  const listing = sampleListings.find((l) => l.id === serviceId);

  if (!listing || isNaN(serviceId)) {
    return (
      <div className="min-h-screen bg-white text-black">
        <Header />
        <CategoryNav />
        <main className="max-w-7xl mx-auto p-5">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Service not found</h1>
            <p className="text-gray-600 mb-6">The service you're looking for doesn't exist.</p>
            <Link href="/listings">
              <Button className="bg-green-700 text-white hover:bg-green-800">
                Back to Listings
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const provider = {
    id: "mock-provider-id-1",
    name: "Sarah Thompson",
    avatar: "/demo/provider.jpg",
    rating: 4.8,
    reviews: 43,
    location: listing.location,
    responseTime: "< 2 hours",
    acceptanceRate: "95%",
    verified: true,
  };

  const [providerListingCount, setProviderListingCount] = useState<number>(0);

  useEffect(() => {
    // TODO: Replace with real provider ID and fetch actual count
    // Keeping 0 for now since ServiceDetail uses mock data
    setProviderListingCount(0);
  }, []);

  const description =
    "I provide professional house cleaning services. Fully insured and experienced. I bring my own supplies and equipment and can handle deep cleans, regular maintenance, move-in / move-out. Flexible scheduling and competitive rates.";

  const otherListings = sampleListings
    .filter((l) => l.id !== serviceId)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  const formattedPrice = `$${listing.price}`;
  const [isMapOpen, setIsMapOpen] = useState(false);
  // Placeholder until listing schema supports precise sharing toggle
  const shareExactLocation = false;
  const mapQuery = encodeURIComponent(listing.location);

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <CategoryNav />

      <main className="max-w-7xl mx-auto p-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <img
                src={listing.image}
                alt={listing.title}
                className="w-full h-56 sm:h-80 object-cover"
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>

                  <div className="flex items-center space-x-3 mt-4 text-sm text-gray-600">
                    <button
                      type="button"
                      onClick={() => setIsMapOpen(true)}
                      className="flex items-center space-x-1 hover:text-green-700"
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="underline cursor-pointer">{listing.location}</span>
                    </button>
                    <span>·</span>
                    <span>{listing.created_at}</span>
                  </div>

                  {/* Save & Share actions */}
                  <SaveShareActions serviceId={serviceId} title={listing.title} />

                  <p className="text-3xl font-extrabold text-green-700 mt-4">
                    {formattedPrice}
                  </p>
                </div>

                <div className="md:w-48 w-full flex-shrink-0 md:mt-0 mt-4">
                  <Link href={`/profile/${provider.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-green-200 transition-colors cursor-pointer">
                      <Avatar className="w-16 h-16 mx-auto mb-3">
                        <AvatarImage src={provider.avatar} alt={provider.name} />
                        <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-semibold text-gray-900">{provider.name}</div>
                      <div className="text-xs text-gray-500 mt-1">Service Provider</div>

                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-gray-900">{provider.rating}</span>
                        <span className="text-xs text-gray-500">({provider.reviews})</span>
                      </div>

                      <div className="mt-2">
                        <Link href={`/profile/${provider.name.toLowerCase().replace(/\s+/g, '-') }#listings`}>
                          <span className="underline text-green-700 hover:text-green-800 text-sm">View all listings ({providerListingCount})</span>
                        </Link>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">About this service</h2>
                <p className="text-gray-700 leading-relaxed text-base">{description}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h2>
              <div className="space-y-4">
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        A
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Alexandre</div>
                        <div className="text-xs text-gray-500">2 days ago</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-500 ml-4">
                      <Star className="h-4 w-4 fill-yellow-500" />
                      <span className="font-semibold text-sm">5.0</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-3 text-sm">
                    Excellent cleaning — very thorough and punctual. Highly recommended.
                  </p>
                </div>

                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        M
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Marie</div>
                        <div className="text-xs text-gray-500">1 week ago</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-500 ml-4">
                      <Star className="h-4 w-4 fill-yellow-500" />
                      <span className="font-semibold text-sm">4.5</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-3 text-sm">
                    Great job, communication could be a little faster but the result was perfect.
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Reviews
              </Button>
            </div>

            <div className="rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar services</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {otherListings.map((l) => (
                  <Link key={l.id} href={`/serviceDetail/${l.id}`}>
                    <ListingCard
                      title={l.title}
                      price={l.price as number}
                      location={l.location}
                      postedTime={l.created_at}
                      imageUrl={l.image}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="sticky top-24 border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Ready to book?</h3>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Price</span>
                    <span className="font-semibold text-gray-900">{formattedPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                    <span className="text-gray-600">Platform Fee</span>
                    <span className="font-semibold text-gray-900">$5</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span className="text-green-700">${(listing.price as number) + 5}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full bg-green-700 text-white hover:bg-green-800 h-12">
                  Request Booking
                </Button>
                <StartConversationButton
                  recipientId={provider.id}
                  recipientName={provider.name}
                  recipientImage={provider.avatar}
                  variant="outline"
                  className="w-full h-12"
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">About {provider.name.split(' ')[0]}</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-gray-600">Rating</span>
                  </div>
                  <span className="font-semibold text-gray-900">{provider.rating} ({provider.reviews})</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-600">Response Time</span>
                  </div>
                  <span className="font-semibold text-gray-900">{provider.responseTime}</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">Acceptance Rate</span>
                  </div>
                  <span className="font-semibold text-gray-900">{provider.acceptanceRate}</span>
                </div>
              </div>

              <Link href={`/profile/${provider.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <Button variant="outline" className="w-full mt-4">
                  View Full Profile
                </Button>
              </Link>
            </div>

            <div className="border border-dashed border-gray-300 rounded-2xl p-6 bg-gray-50 flex items-center justify-center text-gray-500 h-64">
              <div className="text-center">
                <div className="text-sm font-medium">Advertisement</div>
                <div className="text-xs text-gray-400 mt-1">300×600</div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      {/* Location Map Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMapOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden z-10">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-900">Approximate Location</h3>
              <button
                onClick={() => setIsMapOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close map"
              >
                ✕
              </button>
            </div>
            <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
              <iframe
                title="Location Map"
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed&z=${shareExactLocation ? 14 : 12}`}
              />
              {!shareExactLocation && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="w-56 h-56 md:w-64 md:h-64 rounded-full border-2 border-green-600 bg-green-500/10 shadow-lg" />
                </div>
              )}
            </div>
            <div className="px-4 py-3 text-xs text-gray-600 flex items-center justify-between border-t">
              <span>
                This shows an approximate area to protect privacy.
              </span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-green-700 hover:text-green-800"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Local component for Save/Share actions
function SaveShareActions({ serviceId, title }: { serviceId: number; title: string }) {
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedListings");
      const arr: number[] = raw ? JSON.parse(raw) : [];
      setIsSaved(arr.includes(serviceId));
    } catch {}
  }, [serviceId]);

  const persist = (arr: number[]) => {
    try {
      localStorage.setItem("savedListings", JSON.stringify(arr));
    } catch {}
  };

  const toggleSave = () => {
    try {
      const raw = localStorage.getItem("savedListings");
      const arr: number[] = raw ? JSON.parse(raw) : [];
      const exists = arr.includes(serviceId);
      const next = exists ? arr.filter((id) => id !== serviceId) : [...arr, serviceId];
      persist(next);
      setIsSaved(!exists);
    } catch {
      setIsSaved((v) => !v);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title, text: title, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard");
      } else {
        alert(url);
      }
    } catch (e) {
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard");
      } catch {
        alert(url);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 mt-3">
      <Button variant="outline" className="gap-2" onClick={toggleSave}>
        <Bookmark className={`h-4 w-4 ${isSaved ? "fill-green-700 text-green-700" : ""}`} />
        {isSaved ? "Saved" : "Save"}
      </Button>
      <Button variant="outline" className="gap-2" onClick={handleShare}>
        <Share2 className="h-4 w-4" />
        Share
      </Button>
    </div>
  );
}