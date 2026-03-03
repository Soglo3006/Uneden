"use client";

import { useParams } from "next/navigation";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ListingCard from "@/components/listings/ListingCard";
import { sampleListings } from "@/lib/listings";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Star, Clock, CheckCircle } from "lucide-react";
import CategoryNav from "@/components/home/Category";
import Link from "next/link";

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
    name: "Sarah Thompson",
    avatar: "/demo/provider.jpg",
    rating: 4.8,
    reviews: 43,
    location: listing.location,
    responseTime: "< 2 hours",
    acceptanceRate: "95%",
    verified: true,
  };

  const description =
    "I provide professional house cleaning services. Fully insured and experienced. I bring my own supplies and equipment and can handle deep cleans, regular maintenance, move-in / move-out. Flexible scheduling and competitive rates.";

  const otherListings = sampleListings
    .filter((l) => l.id !== serviceId)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  const formattedPrice = `$${listing.price}`;

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
                className="w-full h-80 object-cover"
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>

                  <div className="flex items-center space-x-3 mt-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{listing.location}</span>
                    </div>
                    <span>·</span>
                    <span>{listing.created_at}</span>
                  </div>

                  <p className="text-3xl font-extrabold text-green-700 mt-4">
                    {formattedPrice}
                  </p>
                </div>

                <div className="w-48 flex-shrink-0">
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
                <div>
                  <label className="text-sm text-gray-600 block mb-2">Select date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

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
    </div>
  );
}