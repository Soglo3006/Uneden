"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useStartConversation } from "@/hooks/useStartConversation";
import { CalendarDays, MapPin, Grid3x3, Star, AlertTriangle, CheckCircle, XCircle, CreditCard } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import LeaveReviewModal from "@/components/bookings/LeaveReviewModal";
import OpenDisputeModal from "@/components/bookings/OpenDisputeModal";
import StripeConnectBanner from "@/components/bookings/StripeConnectBanner";
import PayNowButton from "@/components/bookings/PayNowButton";
import BookingDetailModal, { type BookingDetail } from "@/components/bookings/BookingDetailModal";

type BookingStatus = "pending" | "accepted" | "active" | "completed" | "cancelled" | "rejected";

interface ReceivedBooking {
  id: string;
  service_id: string;
  client_id: string;
  worker_id: string;
  status: BookingStatus;
  created_at: string;
  title: string;
  price: string | number;
  client_name: string;
  image_url: string | null;
  category: string | null;
  service_location: string | null;
  has_reviewed: boolean;
  has_dispute: boolean;
  payment_status: string | null;
  completed_by_worker: boolean;
  completed_by_client: boolean;
  client_description: string | null;
  is_one_time?: boolean;
  worker_note?: string | null;
  custom_price?: number | null;
  last_modified_at?: string | null;
  modified_fields?: string[] | null;
  cancel_requested_by?: string | null;
  cancel_reason?: string | null;
}

interface SentBooking {
  id: string;
  service_id: string;
  client_id: string;
  worker_id: string;
  status: BookingStatus;
  created_at: string;
  title: string;
  price: string | number;
  worker_name: string;
  image_url: string | null;
  category: string | null;
  service_location: string | null;
  has_reviewed: boolean;
  has_dispute: boolean;
  payment_status: string | null;
  completed_by_worker: boolean;
  completed_by_client: boolean;
  client_description: string | null;
  is_one_time?: boolean;
  worker_note?: string | null;
  custom_price?: number | null;
  last_modified_at?: string | null;
  modified_fields?: string[] | null;
  cancel_requested_by?: string | null;
  cancel_reason?: string | null;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; bar: string; badge: string }> = {
  pending:   { label: "Pending",   bar: "bg-amber-400",  badge: "bg-amber-100 text-amber-800 border-amber-200" },
  accepted:  { label: "Accepted",  bar: "bg-blue-500",   badge: "bg-blue-100 text-blue-800 border-blue-200" },
  active:    { label: "Active",    bar: "bg-indigo-500", badge: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  completed: { label: "Completed", bar: "bg-green-500",  badge: "bg-green-100 text-green-800 border-green-200" },
  cancelled: { label: "Cancelled", bar: "bg-gray-400",   badge: "bg-gray-100 text-gray-600 border-gray-200" },
  rejected:  { label: "Rejected",  bar: "bg-red-400",    badge: "bg-red-100 text-red-700 border-red-200" },
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.badge}`}>
      {c.label}
    </span>
  );
}

function PaymentBadge({ status }: { status: string | null }) {
  if (!status || status === "unpaid") return null;
  const cfg: Record<string, string> = {
    paid: "bg-green-100 text-green-700 border-green-200",
    transferred: "bg-blue-100 text-blue-700 border-blue-200",
    refunded: "bg-gray-100 text-gray-600 border-gray-200",
  };
  const labels: Record<string, string> = {
    paid: "Paid",
    transferred: "Paid out",
    refunded: "Refunded",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg[status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
      <CreditCard className="h-3 w-3" />
      {labels[status] ?? status}
    </span>
  );
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
  } catch { return dateStr; }
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border rounded-xl shadow-sm bg-white animate-pulse overflow-hidden">
          <div className="w-full aspect-video bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="flex gap-2 pt-2">
              <div className="h-8 bg-gray-200 rounded w-20" />
              <div className="h-8 bg-gray-200 rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 text-gray-500">
      <CalendarDays className="h-12 w-12 mx-auto mb-3 text-gray-300" />
      <p className="font-medium text-gray-700">{message}</p>
      <Link href="/listings" className="text-sm text-green-700 hover:underline mt-2 inline-block">
        Browse listings
      </Link>
    </div>
  );
}

// Inner component that uses useSearchParams (must be wrapped in Suspense)
function BookingsContent() {
  const { user, session, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<"received" | "sent">("received");
  const [received, setReceived] = useState<ReceivedBooking[]>([]);
  const [sent, setSent] = useState<SentBooking[]>([]);
  const [loadingReceived, setLoadingReceived] = useState(true);
  const [loadingSent, setLoadingSent] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Review / dispute modal state
  const [reviewBooking, setReviewBooking] = useState<{ id: string; targetName: string } | null>(null);
  const [disputeBooking, setDisputeBooking] = useState<{ id: string; title: string } | null>(null);

  // Booking detail modal
  const [detailBooking, setDetailBooking] = useState<{ booking: BookingDetail; role: "worker" | "client" } | null>(null);

  // Payment redirect feedback
  const paymentResult = searchParams.get("payment");
  const [paymentBanner, setPaymentBanner] = useState<"success" | "cancelled" | null>(
    paymentResult === "success" ? "success" : paymentResult === "cancelled" ? "cancelled" : null
  );

  const { startConversation, loading: chatLoading } = useStartConversation();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    if (!session?.access_token) return;
    const headers = { Authorization: `Bearer ${session.access_token}` };

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/received-bookings`, { headers })
      .then((r) => r.json())
      .then((data) => setReceived(Array.isArray(data) ? data : []))
      .catch(() => setReceived([]))
      .finally(() => setLoadingReceived(false));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/my-bookings`, { headers })
      .then((r) => r.json())
      .then((data) => setSent(Array.isArray(data) ? data : []))
      .catch(() => setSent([]))
      .finally(() => setLoadingSent(false));
  }, [user, session, router, authLoading]);

  // Auto-switch to "sent" tab if returning from a payment redirect
  useEffect(() => {
    if (paymentResult === "success" || paymentResult === "cancelled") {
      setTab("sent");
      // Dismiss banner after 5 seconds
      const t = setTimeout(() => setPaymentBanner(null), 5000);
      return () => clearTimeout(t);
    }
  }, [paymentResult]);

  const updateStatus = async (bookingId: string, status: BookingStatus, side: "received" | "sent") => {
    setUpdating(bookingId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) return;
      if (side === "received") {
        setReceived((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
      } else {
        setSent((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
      }
    } catch {
      // silent
    } finally {
      setUpdating(null);
    }
  };

  const markCompleted = async (bookingId: string, side: "received" | "sent") => {
    setUpdating(bookingId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) return;
      const updated = await res.json();
      if (side === "received") {
        setReceived((prev) => prev.map((b) => b.id === bookingId ? { ...b, ...updated } : b));
      } else {
        setSent((prev) => prev.map((b) => b.id === bookingId ? { ...b, ...updated } : b));
      }
    } catch {
      // silent
    } finally {
      setUpdating(null);
    }
  };

  const pendingCount = received.filter((b) => b.status === "pending").length;

  if (authLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

      {/* Payment result banner */}
      {paymentBanner === "success" && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4 text-green-800">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">Payment successful! The service provider has been notified.</p>
          <button type="button" aria-label="Dismiss" onClick={() => setPaymentBanner(null)} className="cursor-pointer ml-auto text-green-600 hover:text-green-800">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}
      {paymentBanner === "cancelled" && (
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4 text-gray-700">
          <XCircle className="h-5 w-5 flex-shrink-0 text-gray-400" />
          <p className="text-sm">Payment was cancelled. You can try again anytime.</p>
          <button type="button" aria-label="Dismiss" onClick={() => setPaymentBanner(null)} className="cursor-pointer ml-auto text-gray-400 hover:text-gray-600">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => setTab("received")}
          className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "received" ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Received
          {pendingCount > 0 && (
            <span className="bg-amber-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("sent")}
          className={`cursor-pointer px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "sent" ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Sent
        </button>
      </div>

      {/* ── Received bookings ── */}
      {tab === "received" && (
        <>
          {/* Stripe Connect banner for workers */}
          {session?.access_token && <StripeConnectBanner accessToken={session.access_token} />}

          {loadingReceived ? <LoadingSkeleton /> : received.length === 0 ? (
            <EmptyState message="No booking requests received yet." />
          ) : (
            <div className="space-y-8">
              {([
                { label: "Requests", statuses: ["pending"] as BookingStatus[] },
                { label: "Active", statuses: ["accepted", "active"] as BookingStatus[] },
                { label: "Completed", statuses: ["completed"] as BookingStatus[] },
                { label: "Closed", statuses: ["cancelled", "rejected"] as BookingStatus[] },
              ] as const).filter(({ statuses }) => received.some(b => statuses.includes(b.status))).map(({ label, statuses }) => (
                <div key={label}>
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    {label}
                    <span className="text-gray-300 font-normal normal-case tracking-normal text-xs">
                      ({received.filter(b => statuses.includes(b.status)).length})
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {received.filter(b => statuses.includes(b.status)).map((b) => {
                    const statusBar = STATUS_CONFIG[b.status]?.bar ?? "bg-gray-400";
                    return (
                  <div key={b.id} className="border rounded-xl shadow-sm bg-white flex flex-col overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setDetailBooking({ booking: b as BookingDetail, role: "worker" })}>
                    <div className="relative">
                      <AspectRatio ratio={16 / 9}>
                        {b.image_url ? (
                          <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Grid3x3 className="h-10 w-10 text-gray-300" />
                          </div>
                        )}
                      </AspectRatio>
                      <div className={`absolute bottom-0 left-0 right-0 h-1 ${statusBar}`} />
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 line-clamp-1 hover:text-green-700 transition-colors">
                            {b.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <PaymentBadge status={b.payment_status} />
                          <StatusBadge status={b.status} />
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mb-2">
                        From:{" "}
                        <Link href={`/profile/${b.client_id}`} onClick={(e) => e.stopPropagation()}
                          className="font-medium text-gray-700 hover:text-green-700 hover:underline">
                          {b.client_name}
                        </Link>
                      </p>

                      <p className="text-green-700 font-bold text-lg mb-1">${Number(b.price)}</p>

                      {b.service_location && (
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                          <span className="line-clamp-1">{b.service_location}</span>
                        </div>
                      )}

                      {b.category && <p className="text-xs text-gray-400 mb-3">{b.category}</p>}
                      <p className="text-xs text-gray-400 mb-3">{formatDate(b.created_at)}</p>

                      {/* Actions — stop propagation so card click doesn't open modal */}
                      <div className="mt-auto pt-3 border-t border-gray-100 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                        {b.status === "pending" && (
                          <>
                            <Button type="button" size="sm" className="bg-green-700 hover:bg-green-800 text-white flex-1"
                              onClick={() => updateStatus(b.id, "accepted", "received")} disabled={updating === b.id}>
                              {updating === b.id ? "…" : "Accept"}
                            </Button>
                            <Button type="button" size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 flex-1"
                              onClick={() => updateStatus(b.id, "rejected", "received")} disabled={updating === b.id}>
                              Reject
                            </Button>
                          </>
                        )}
                        {b.status === "accepted" && (
                          <div className="flex flex-col gap-2 w-full">
                            <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                              Waiting for client to complete payment.
                            </div>
                            <Button type="button" size="sm" variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 w-full"
                              onClick={() => updateStatus(b.id, "cancelled", "received")}
                              disabled={updating === b.id}>
                              {updating === b.id ? "…" : "Cancel Booking"}
                            </Button>
                          </div>
                        )}
                        {b.status === "active" && (
                          <>
                            {!b.completed_by_worker ? (
                              <Button type="button" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1"
                                onClick={() => markCompleted(b.id, "received")} disabled={updating === b.id}>
                                {updating === b.id ? "…" : "Mark Work Done"}
                              </Button>
                            ) : (
                              <span className="text-xs text-indigo-600 flex items-center gap-1 flex-1">
                                <CheckCircle className="h-3.5 w-3.5" /> You marked done
                                {!b.completed_by_client && " — waiting for client"}
                              </span>
                            )}
                            {!b.has_dispute && (
                              <Button type="button" size="sm" variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50 gap-1.5"
                                onClick={() => setDisputeBooking({ id: b.id, title: b.title })}>
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Dispute
                              </Button>
                            )}
                          </>
                        )}
                        {b.status === "completed" && (
                          <>
                            {!b.has_reviewed && (
                              <Button type="button" size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white flex-1 gap-1.5"
                                onClick={() => setReviewBooking({ id: b.id, targetName: b.client_name })}>
                                <Star className="h-3.5 w-3.5" />
                                Review
                              </Button>
                            )}
                            {b.has_reviewed && (
                              <span className="text-xs text-gray-400 italic flex items-center gap-1 flex-1">
                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> Reviewed
                              </span>
                            )}
                            {!b.has_dispute && (
                              <Button type="button" size="sm" variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50 gap-1.5"
                                onClick={() => setDisputeBooking({ id: b.id, title: b.title })}>
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Dispute
                              </Button>
                            )}
                          </>
                        )}
                        {b.has_dispute && (
                          <span className="text-xs text-amber-600 italic flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" /> Dispute open
                          </span>
                        )}
                        <Button type="button" size="sm" variant="outline" onClick={() => startConversation(b.client_id)} disabled={chatLoading}>
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                    );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Sent bookings ── */}
      {tab === "sent" && (
        loadingSent ? <LoadingSkeleton /> : sent.length === 0 ? (
          <EmptyState message="You haven't sent any booking requests yet." />
        ) : (
          <div className="space-y-8">
            {([
              { label: "Requests", statuses: ["pending"] as BookingStatus[] },
              { label: "Active", statuses: ["accepted", "active"] as BookingStatus[] },
              { label: "Completed", statuses: ["completed"] as BookingStatus[] },
              { label: "Closed", statuses: ["cancelled", "rejected"] as BookingStatus[] },
            ] as const).filter(({ statuses }) => sent.some(b => statuses.includes(b.status))).map(({ label, statuses }) => (
              <div key={label}>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  {label}
                  <span className="text-gray-300 font-normal normal-case tracking-normal text-xs">
                    ({sent.filter(b => statuses.includes(b.status)).length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sent.filter(b => statuses.includes(b.status)).map((b) => {
              const statusBar = STATUS_CONFIG[b.status]?.bar ?? "bg-gray-400";
              const needsPayment = b.status === "accepted" && (!b.payment_status || b.payment_status === "unpaid");
              return (
                <div key={b.id} className="border rounded-xl shadow-sm bg-white flex flex-col overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setDetailBooking({ booking: b as BookingDetail, role: "client" })}>
                  <div className="relative">
                    <AspectRatio ratio={16 / 9}>
                      {b.image_url ? (
                        <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Grid3x3 className="h-10 w-10 text-gray-300" />
                        </div>
                      )}
                    </AspectRatio>
                    <div className={`absolute bottom-0 left-0 right-0 h-1 ${statusBar}`} />
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 line-clamp-1 hover:text-green-700 transition-colors">
                          {b.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <PaymentBadge status={b.payment_status} />
                        <StatusBadge status={b.status} />
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-2">
                      Provider:{" "}
                      <Link href={`/profile/${b.worker_id}`} onClick={(e) => e.stopPropagation()}
                        className="font-medium text-gray-700 hover:text-green-700 hover:underline">
                        {b.worker_name}
                      </Link>
                    </p>

                    <p className="text-green-700 font-bold text-lg mb-1">${Number(b.price)}</p>

                    {b.service_location && (
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{b.service_location}</span>
                      </div>
                    )}

                    {b.category && <p className="text-xs text-gray-400 mb-3">{b.category}</p>}
                    <p className="text-xs text-gray-400 mb-3">{formatDate(b.created_at)}</p>

                    {/* "Pay now" call-to-action strip for accepted + unpaid */}
                    {needsPayment && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3 text-xs text-blue-700">
                        Booking accepted — complete your payment to confirm the job.
                      </div>
                    )}

                    {/* Actions — stop propagation so card click doesn't open modal */}
                    <div className="mt-auto pt-3 border-t border-gray-100 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                      {/* Pay Now button */}
                      {needsPayment && session?.access_token && (
                        <PayNowButton bookingId={b.id} accessToken={session.access_token} />
                      )}

                      {b.status === "pending" && (
                        <Button type="button" size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 flex-1"
                          onClick={() => updateStatus(b.id, "cancelled", "sent")} disabled={updating === b.id}>
                          {updating === b.id ? "…" : "Cancel Request"}
                        </Button>
                      )}
                      {b.status === "active" && (
                        <>
                          {!b.completed_by_client ? (
                            <Button type="button" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1"
                              onClick={() => markCompleted(b.id, "sent")} disabled={updating === b.id}>
                              {updating === b.id ? "…" : "Mark Job Done"}
                            </Button>
                          ) : (
                            <span className="text-xs text-indigo-600 flex items-center gap-1 flex-1">
                              <CheckCircle className="h-3.5 w-3.5" /> You marked done
                              {!b.completed_by_worker && " — waiting for provider"}
                            </span>
                          )}
                          {!b.has_dispute && (
                            <Button type="button" size="sm" variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50 gap-1.5"
                              onClick={() => setDisputeBooking({ id: b.id, title: b.title })}>
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Dispute
                            </Button>
                          )}
                        </>
                      )}
                      {b.status === "completed" && (
                        <>
                          {!b.has_reviewed && (
                            <Button type="button" size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white flex-1 gap-1.5"
                              onClick={() => setReviewBooking({ id: b.id, targetName: b.worker_name })}>
                              <Star className="h-3.5 w-3.5" />
                              Review
                            </Button>
                          )}
                          {b.has_reviewed && (
                            <span className="text-xs text-gray-400 italic flex items-center gap-1 flex-1">
                              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> Reviewed
                            </span>
                          )}
                          {!b.has_dispute && (
                            <Button type="button" size="sm" variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50 gap-1.5"
                              onClick={() => setDisputeBooking({ id: b.id, title: b.title })}>
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Dispute
                            </Button>
                          )}
                        </>
                      )}
                      {b.has_dispute && (
                        <span className="text-xs text-amber-600 italic flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" /> Dispute open
                        </span>
                      )}
                      <Button type="button" size="sm" variant="outline" onClick={() => startConversation(b.worker_id)} disabled={chatLoading}>
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              );
              })}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Booking Detail Modal */}
      {detailBooking && session?.access_token && (
        <BookingDetailModal
          booking={detailBooking.booking}
          userRole={detailBooking.role}
          accessToken={session.access_token}
          onClose={() => setDetailBooking(null)}
          onUpdated={(bookingId, updates) => {
            setReceived((prev) => prev.map((b) => b.id === bookingId ? { ...b, ...updates } : b));
            setSent((prev) => prev.map((b) => b.id === bookingId ? { ...b, ...updates } : b));
            // Keep the modal in sync too
            setDetailBooking((prev) => prev ? { ...prev, booking: { ...prev.booking, ...updates } } : null);
          }}
          onMessage={(userId) => startConversation(userId)}
          onOpenReview={(bookingId, targetName) => setReviewBooking({ id: bookingId, targetName })}
          onOpenDispute={(bookingId, title) => setDisputeBooking({ id: bookingId, title })}
        />
      )}

      {/* Leave Review Modal */}
      {reviewBooking && session?.access_token && (
        <LeaveReviewModal
          bookingId={reviewBooking.id}
          targetName={reviewBooking.targetName}
          accessToken={session.access_token}
          onClose={() => setReviewBooking(null)}
          onReviewed={(bookingId) => {
            setReceived((prev) => prev.map((b) => b.id === bookingId ? { ...b, has_reviewed: true } : b));
            setSent((prev) => prev.map((b) => b.id === bookingId ? { ...b, has_reviewed: true } : b));
          }}
        />
      )}

      {/* Open Dispute Modal */}
      {disputeBooking && session?.access_token && (
        <OpenDisputeModal
          bookingId={disputeBooking.id}
          serviceTitle={disputeBooking.title}
          accessToken={session.access_token}
          onClose={() => setDisputeBooking(null)}
          onOpened={(bookingId) => {
            setReceived((prev) => prev.map((b) => b.id === bookingId ? { ...b, has_dispute: true } : b));
            setSent((prev) => prev.map((b) => b.id === bookingId ? { ...b, has_dispute: true } : b));
          }}
        />
      )}
    </main>
  );
}

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-10 bg-gray-100 rounded" />
          </div>
        </main>
      }>
        <BookingsContent />
      </Suspense>
    </div>
  );
}
