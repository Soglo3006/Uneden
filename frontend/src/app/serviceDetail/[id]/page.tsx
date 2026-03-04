"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Bookmark, Share2, Clock, Globe, CheckCircle, Calendar, Zap, Truck, X, Tag, Grid3x3 } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Link from "next/link";
import { useEffect, useState } from "react";
import SupportButton from "@/components/support/SupportButton";
import { useStartConversation } from "@/hooks/useStartConversation";
import { useAuth } from "@/contexts/AuthContext";
import EditListingModal from "@/components/listings/EditListingModal";

interface Service {
  id: string;
  user_id: string;
  type: "offer" | "looking";
  title: string;
  description: string;
  category: string | null;
  category_id: number | null;
  subcategory: string | null;
  price: number;
  location: string;
  poster_type: string | null;
  availability: string | null;
  language: string | null;
  mobility: string | null;
  duration: string | null;
  urgency: string | null;
  image_url: string | null;
  created_at: string;
  owner_name: string;
  owner_id: string;
  category_name: string | null;
  faq?: Array<{ question: string; answer: string }> | string | null;
  favorites_count?: number;
  is_one_time?: boolean;
}

interface SimilarService {
  id: string;
  title: string;
  price: number;
  location: string;
  created_at: string;
  image_url: string | null;
}

function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceId = params.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [similarServices, setSimilarServices] = useState<SimilarService[]>([]);
  const [providerListingCount, setProviderListingCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const { startConversation, loading: contactLoading } = useStartConversation();
  const { user, session } = useAuth();
  const router = useRouter();

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingState, setBookingState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [bookingNote, setBookingNote] = useState("");
  const [bookingErrorMsg, setBookingErrorMsg] = useState("Something went wrong. Please try again.");
  const [existingBookingStatus, setExistingBookingStatus] = useState<string | null>(null);

  // Owner edit/delete states
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!serviceId) return;

    const fetchAll = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${serviceId}`);
        if (!res.ok) {
          setError(true);
          return;
        }
        const data: Service = await res.json();
        setService(data);

        // Favorites count
        const fav = data.favorites_count ?? 0;
        setFavoritesCount(typeof fav === "number" ? fav : 0);

        // FAQs
        const rawFaq = data.faq;
        if (Array.isArray(rawFaq)) {
          setFaqs(rawFaq.filter((x) => x?.question && x?.answer));
        } else if (typeof rawFaq === "string") {
          try {
            const parsed = JSON.parse(rawFaq);
            if (Array.isArray(parsed)) setFaqs(parsed.filter((x) => x?.question && x?.answer));
          } catch {}
        }

        // Provider listing count
        if (data.owner_id) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/user/${data.owner_id}`)
            .then((r) => r.json())
            .then((list) => setProviderListingCount(Array.isArray(list) ? list.length : 0))
            .catch(() => {});
        }

        // Check for existing booking (non-cancelled/rejected) for this service
        if (user && session?.access_token) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/my-bookings`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          })
            .then((r) => r.json())
            .then((bookings: Array<{ service_id: string; status: string }>) => {
              const active = bookings.find(
                (b) => b.service_id === data.id && b.status !== "cancelled" && b.status !== "rejected"
              );
              if (active) setExistingBookingStatus(active.status);
            })
            .catch(() => {});
        }

        // Similar services (same category, exclude current)
        const similarUrl = data.category_id
          ? `${process.env.NEXT_PUBLIC_API_URL}/services?category=${data.category_id}`
          : `${process.env.NEXT_PUBLIC_API_URL}/services`;
        fetch(similarUrl)
          .then((r) => r.json())
          .then((list: SimilarService[]) =>
            setSimilarServices(list.filter((s) => s.id !== data.id).slice(0, 2))
          )
          .catch(() => {});
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black">
        <main className="max-w-7xl mx-auto p-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start animate-pulse">
            {/* Main content skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl bg-gray-200 aspect-video w-full" />
              <div className="bg-gray-100 rounded-2xl p-6 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="bg-gray-100 rounded-2xl p-6 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/6" />
              </div>
            </div>
            {/* Sidebar skeleton */}
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-2xl p-6 space-y-3">
                <div className="h-8 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-11 bg-gray-200 rounded-xl w-full mt-4" />
                <div className="h-11 bg-gray-200 rounded-xl w-full" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-white text-black">
        <main className="max-w-7xl mx-auto p-5">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Service not found</h1>
            <p className="text-gray-600 mb-6">This service doesn't exist or has been removed.</p>
            <Link href="/listings">
              <Button className="bg-green-700 text-white hover:bg-green-800">Back to Listings</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const price = Number(service.price);
  const mapQuery = encodeURIComponent(service.location);
  const providerFirstName = service.owner_name?.split(" ")[0] ?? "Provider";
  const isOwner = !!user && user.id === service.user_id;

  const handleOwnerDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${service.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) router.push("/my-listings");
    } catch {
      // silent
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleBookingRequest = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setBookingState("idle");
    setBookingNote("");
    setShowBookingModal(true);
  };

  const submitBooking = async () => {
    setBookingState("loading");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ service_id: service.id, client_description: bookingNote || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setBookingErrorMsg(data.message || "Something went wrong. Please try again.");
        setBookingState("error");
        return;
      }
      setExistingBookingStatus("pending");
      setBookingState("success");
    } catch {
      setBookingErrorMsg("Something went wrong. Please try again.");
      setBookingState("error");
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">

      <main className="max-w-7xl mx-auto p-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start">
          {/* ── Main content ── */}
          <section className="lg:col-span-2 space-y-6 order-1">
            {/* Hero image */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <AspectRatio ratio={16 / 9}>
                {service.image_url ? (
                  <img
                    src={service.image_url}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                    <span className="text-6xl">🛠️</span>
                  </div>
                )}
              </AspectRatio>
            </div>

            {/* Title & info card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="flex-1">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        service.type === "offer"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {service.type === "offer" ? "Offering" : "Looking for"}
                    </span>
                    {service.category_name && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {service.category_name}
                        {service.subcategory && ` · ${service.subcategory}`}
                      </span>
                    )}
                    {service.is_one_time && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        <Tag className="h-3 w-3" />
                        One-time listing
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>

                  <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-600">
                    <button
                      type="button"
                      onClick={() => setIsMapOpen(true)}
                      className="flex items-center gap-1 hover:text-green-700"
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="underline cursor-pointer">{service.location}</span>
                    </button>
                    <span>·</span>
                    <span>{formatRelativeDate(service.created_at)}</span>
                  </div>

                  {/* Save & Share */}
                  <SaveShareActions serviceId={service.id} title={service.title} />

                  {favoritesCount > 0 && (
                    <div className="text-sm text-gray-600 mt-2">
                      Favorited by{" "}
                      <span className="font-semibold text-gray-900">
                        {favoritesCount >= 1000 ? "1k+" : favoritesCount}
                      </span>{" "}
                      users
                    </div>
                  )}

                  <p className="text-3xl font-extrabold text-green-700 mt-4">
                    ${price}
                    {service.duration && (
                      <span className="text-base font-normal text-gray-500 ml-1">
                        / {service.duration}
                      </span>
                    )}
                  </p>
                </div>

                {/* Provider mini-card */}
                <div className="md:w-48 w-full flex-shrink-0">
                  <Link href={`/profile/${service.owner_id}`}>
                    <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-green-200 transition-colors cursor-pointer">
                      <Avatar className="w-16 h-16 mx-auto mb-3">
                        <AvatarFallback className="text-xl">
                          {service.owner_name?.charAt(0) ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-semibold text-gray-900">{service.owner_name}</div>
                      <div className="mt-2">
                        <span className="underline text-green-700 hover:text-green-800 text-sm">
                          View all listings ({providerListingCount})
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">About this service</h2>
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                  {service.description}
                </p>
              </div>

              {/* Extra details */}
              {(service.availability || service.language || service.mobility || service.urgency) && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.availability && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="h-4 w-4 text-green-600 shrink-0" />
                        <span>
                          <span className="font-medium">Availability:</span> {service.availability}
                        </span>
                      </div>
                    )}
                    {service.language && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Globe className="h-4 w-4 text-blue-500 shrink-0" />
                        <span>
                          <span className="font-medium">Language:</span> {service.language}
                        </span>
                      </div>
                    )}
                    {service.mobility && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Truck className="h-4 w-4 text-orange-500 shrink-0" />
                        <span>
                          <span className="font-medium">Mobility:</span> {service.mobility}
                        </span>
                      </div>
                    )}
                    {service.urgency && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Zap className="h-4 w-4 text-yellow-500 shrink-0" />
                        <span>
                          <span className="font-medium">Urgency:</span> {service.urgency}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* FAQ & Reviews */}
            <div className="rounded-2xl border border-gray-200 shadow-sm p-6">
              {faqs.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">FAQ</h2>
                  <div className="space-y-3">
                    {faqs.map((f, idx) => (
                      <div key={idx} className="border border-gray-100 rounded-lg p-4">
                        <div className="font-semibold text-gray-900 mb-1">{f.question}</div>
                        <p className="text-gray-700 text-sm leading-relaxed">{f.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h2>
              <p className="text-gray-500 text-sm">No reviews yet for this service.</p>
            </div>

          </section>

          {/* ── Sidebar ── order-2 on mobile so it appears before similar services */}
          <aside className="lg:col-span-1 space-y-6 order-2">
            {isOwner ? (
              /* ── Owner panel ── */
              <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm space-y-3">
                <h3 className="font-semibold text-gray-900 mb-2">Manage Your Listing</h3>
                <Button
                  className="w-full bg-green-700 hover:bg-green-800 text-white h-12 gap-2"
                  onClick={() => setShowEditModal(true)}
                >
                  Edit Listing
                </Button>
                {confirmDelete ? (
                  <div className="space-y-2">
                    <p className="text-sm text-red-600 text-center font-medium">
                      Are you sure? This action is irreversible.
                    </p>
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 text-white h-11"
                      onClick={handleOwnerDelete}
                      disabled={deleting}
                    >
                      {deleting ? "Deleting…" : "Yes, Delete Listing"}
                    </Button>
                    <Button variant="outline" className="w-full h-11" onClick={() => setConfirmDelete(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-12 text-red-600 border-red-200 hover:bg-red-50 gap-2"
                    onClick={() => setConfirmDelete(true)}
                  >
                    Delete Listing
                  </Button>
                )}
                <Link href="/my-listings">
                  <Button variant="outline" className="w-full h-11 mt-1">
                    View All My Listings
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Booking card */}
                <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {service.type === "offer" ? "Ready to book?" : "Interested?"}
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {service.type === "offer" ? "Service Price" : "Budget"}
                      </span>
                      <span className="font-semibold text-gray-900">${price}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                      <span className="text-gray-600">Platform Fee</span>
                      <span className="font-semibold text-gray-900">$5</span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
                      <span>Total</span>
                      <span className="text-green-700">${price + 5}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      className="w-full bg-green-700 text-white hover:bg-green-800 h-12 disabled:opacity-60"
                      onClick={
                        service.type === "offer"
                          ? handleBookingRequest
                          : () => startConversation(String(service.owner_id))
                      }
                      disabled={
                        (service.type === "looking" && contactLoading) ||
                        (service.type === "offer" && existingBookingStatus !== null)
                      }
                    >
                      {service.type === "offer"
                        ? existingBookingStatus
                          ? existingBookingStatus === "pending"
                            ? "Request already sent"
                            : `Booking ${existingBookingStatus}`
                          : "Request Booking"
                        : contactLoading
                        ? "Opening chat…"
                        : "Make an Offer"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-12"
                      onClick={() => startConversation(String(service.owner_id))}
                      disabled={contactLoading}
                    >
                      {contactLoading ? "Opening chat…" : `Contact ${providerFirstName}`}
                    </Button>
                  </div>
                </div>

                {/* Provider info card */}
                <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">About {providerFirstName}</h3>
                  <div className="space-y-1">
                    {service.availability && (
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-blue-500" />
                          <span className="text-sm text-gray-600">Availability</span>
                        </div>
                        <span className="font-semibold text-gray-900 text-sm text-right max-w-[130px] truncate">
                          {service.availability}
                        </span>
                      </div>
                    )}
                    {service.language && (
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-green-500" />
                          <span className="text-sm text-gray-600">Language</span>
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{service.language}</span>
                      </div>
                    )}
                    {service.mobility && (
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-sm text-gray-600">Mobile</span>
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{service.mobility}</span>
                      </div>
                    )}
                  </div>
                  <Link href={`/profile/${service.owner_id}`}>
                    <Button variant="outline" className="w-full mt-4">
                      View Full Profile
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {/* Ad placeholder */}
            <div className="border border-dashed border-gray-300 rounded-2xl p-6 bg-gray-50 flex items-center justify-center text-gray-500 h-64">
              <div className="text-center">
                <div className="text-sm font-medium">Advertisement</div>
                <div className="text-xs text-gray-400 mt-1">300×600</div>
              </div>
            </div>
          </aside>

          {/* ── Similar Services ── order-3: appears after sidebar on mobile */}
          {similarServices.length > 0 && (
            <div className="lg:col-span-2 order-3 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Similar Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {similarServices.map((s) => (
                  <Link key={s.id} href={`/serviceDetail/${s.id}`} className="block group">
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow">
                      <AspectRatio ratio={16 / 9}>
                        {s.image_url ? (
                          <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Grid3x3 className="h-10 w-10 text-gray-300" />
                          </div>
                        )}
                      </AspectRatio>
                      <div className="p-3">
                        <p className="font-semibold text-gray-900 line-clamp-1 group-hover:text-green-700 transition-colors">{s.title}</p>
                        <p className="text-green-700 font-bold text-sm mt-1">${s.price}</p>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />{s.location}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <SupportButton floating />

      {/* Owner edit modal */}
      {showEditModal && service && session?.access_token && (
        <EditListingModal
          service={service}
          accessToken={session.access_token}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) => {
            setService((prev) => prev ? { ...prev, ...updated } : prev);
            setShowEditModal(false);
          }}
        />
      )}

      {/* Booking modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => { if (bookingState !== "loading") setShowBookingModal(false); }}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Request Booking</h3>
              {bookingState !== "loading" && (
                <button onClick={() => setShowBookingModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {bookingState === "success" ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">Request Sent!</h4>
                <p className="text-sm text-gray-600 mb-6">
                  {providerFirstName} will review your request and get back to you shortly.
                </p>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-700 text-white hover:bg-green-800"
                    onClick={() => {
                      setShowBookingModal(false);
                      startConversation(String(service.owner_id));
                    }}
                  >
                    Message {providerFirstName}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setShowBookingModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="font-medium text-gray-900 text-sm mb-3 line-clamp-2">{service.title}</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service Price</span>
                      <span className="font-semibold">${price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Platform Fee</span>
                      <span className="font-semibold">$5</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2">
                      <span>Total</span>
                      <span className="text-green-700">${price + 5}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Describe your request <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={bookingNote}
                    onChange={(e) => setBookingNote(e.target.value)}
                    placeholder={`Describe what you need from ${providerFirstName}…`}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
                    disabled={bookingState === "loading"}
                  />
                </div>

                {bookingState === "error" && (
                  <p className="text-sm text-red-600 mb-3">{bookingErrorMsg}</p>
                )}

                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-700 text-white hover:bg-green-800 h-11"
                    onClick={submitBooking}
                    disabled={bookingState === "loading"}
                  >
                    {bookingState === "loading" ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending…
                      </span>
                    ) : "Confirm Booking Request"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-11"
                    onClick={() => setShowBookingModal(false)}
                    disabled={bookingState === "loading"}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Location map modal */}
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
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed&z=12`}
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-56 h-56 md:w-64 md:h-64 rounded-full border-2 border-green-600 bg-green-500/10 shadow-lg" />
              </div>
            </div>
            <div className="px-4 py-3 text-xs text-gray-600 flex items-center justify-between border-t">
              <span>This shows an approximate area to protect privacy.</span>
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

// ── Save / Share actions ──────────────────────────────────────────────────────
function SaveShareActions({ serviceId, title }: { serviceId: number; title: string }) {
  const [isSaved, setIsSaved] = useState(() => {
    try {
      const arr: number[] = JSON.parse(localStorage.getItem("savedListings") ?? "[]");
      return arr.includes(serviceId);
    } catch {
      return false;
    }
  });

  const toggleSave = () => {
    try {
      const arr: number[] = JSON.parse(localStorage.getItem("savedListings") ?? "[]");
      const next = arr.includes(serviceId)
        ? arr.filter((id) => id !== serviceId)
        : [...arr, serviceId];
      localStorage.setItem("savedListings", JSON.stringify(next));
      setIsSaved(!arr.includes(serviceId));
    } catch {
      setIsSaved((v) => !v);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: title, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard");
      }
    } catch {
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
