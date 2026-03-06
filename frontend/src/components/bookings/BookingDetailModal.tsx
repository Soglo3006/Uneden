"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  X, MapPin, CalendarDays, Tag, Star,
  AlertTriangle, CheckCircle, CreditCard, FileText, Grid3x3
} from "lucide-react";
import PayNowButton from "@/components/bookings/PayNowButton";

type BookingStatus = "pending" | "accepted" | "active" | "completed" | "cancelled" | "rejected";

export interface BookingDetail {
  id: string;
  service_id: string;
  client_id: string;
  worker_id: string;
  status: BookingStatus;
  created_at: string;
  title: string;
  price: string | number;
  image_url: string | null;
  category: string | null;
  service_location: string | null;
  client_description: string | null;
  has_reviewed: boolean;
  has_dispute: boolean;
  payment_status: string | null;
  completed_by_worker: boolean;
  completed_by_client: boolean;
  is_one_time?: boolean;
  // received bookings
  client_name?: string;
  // sent bookings
  worker_name?: string;
}

interface Props {
  booking: BookingDetail;
  userRole: "worker" | "client";
  accessToken: string;
  onClose: () => void;
  onUpdated: (bookingId: string, updates: Partial<BookingDetail>) => void;
  onMessage: (userId: string) => void;
  onOpenReview: (bookingId: string, targetName: string) => void;
  onOpenDispute: (bookingId: string, title: string) => void;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; badge: string }> = {
  pending:   { label: "Pending",   badge: "bg-amber-100 text-amber-800 border-amber-200" },
  accepted:  { label: "Accepted",  badge: "bg-blue-100 text-blue-800 border-blue-200" },
  active:    { label: "Active",    badge: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  completed: { label: "Completed", badge: "bg-green-100 text-green-800 border-green-200" },
  cancelled: { label: "Cancelled", badge: "bg-gray-100 text-gray-600 border-gray-200" },
  rejected:  { label: "Rejected",  badge: "bg-red-100 text-red-700 border-red-200" },
};

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-CA", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
  } catch { return dateStr; }
}

export default function BookingDetailModal({
  booking: initialBooking,
  userRole,
  accessToken,
  onClose,
  onUpdated,
  onMessage,
  onOpenReview,
  onOpenDispute,
}: Props) {
  const [booking, setBooking] = useState(initialBooking);
  const [serviceDescription, setServiceDescription] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Keep in sync if parent updates (e.g. after markCompleted)
  useEffect(() => {
    setBooking(initialBooking);
  }, [initialBooking]);

  // Fetch service description
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${booking.service_id}`)
      .then((r) => r.json())
      .then((s) => { if (s?.description) setServiceDescription(s.description); })
      .catch(() => {});
  }, [booking.service_id]);

  const callStatus = async (status: BookingStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${booking.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) return;
      const updated = { ...booking, status };
      setBooking(updated);
      onUpdated(booking.id, { status });
    } finally {
      setUpdating(false);
    }
  };

  const callMarkCompleted = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${booking.id}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setBooking((prev) => ({ ...prev, ...data }));
      onUpdated(booking.id, data);
    } finally {
      setUpdating(false);
    }
  };

  const otherUserName = userRole === "worker" ? (booking.client_name ?? "Client") : (booking.worker_name ?? "Provider");
  const otherUserId = userRole === "worker" ? booking.client_id : booking.worker_id;
  const needsPayment = booking.status === "accepted" && (!booking.payment_status || booking.payment_status === "unpaid");

  const hasMarkedDone =
    userRole === "worker" ? booking.completed_by_worker : booking.completed_by_client;
  const otherHasMarkedDone =
    userRole === "worker" ? booking.completed_by_client : booking.completed_by_worker;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_CONFIG[booking.status]?.badge}`}>
              {STATUS_CONFIG[booking.status]?.label}
            </span>
            {booking.is_one_time && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                <Tag className="h-3 w-3" />
                One-time
              </span>
            )}
            {booking.payment_status && booking.payment_status !== "unpaid" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                <CreditCard className="h-3 w-3" />
                {booking.payment_status === "transferred" ? "Paid out" : "Paid"}
              </span>
            )}
          </div>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {/* Service image */}
          {booking.image_url ? (
            <img src={booking.image_url} alt={booking.title} className="w-full h-48 object-cover" />
          ) : (
            <div className="w-full h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              <Grid3x3 className="h-10 w-10 text-gray-300" />
            </div>
          )}

          <div className="px-5 py-4 space-y-4">
            {/* Service info */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">{booking.title}</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                <span className="text-xl font-extrabold text-green-700">${Number(booking.price)}</span>
                {booking.category && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{booking.category}</span>
                )}
                {booking.service_location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {booking.service_location}
                  </span>
                )}
              </div>
            </div>

            {/* Service description */}
            {serviceDescription && (
              <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                {serviceDescription.length > 240
                  ? serviceDescription.slice(0, 240) + "…"
                  : serviceDescription}
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Who made the request */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback className="text-sm bg-green-100 text-green-800">
                  {otherUserName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-gray-500">
                  {userRole === "worker" ? "Request from" : "Service by"}
                </p>
                <p className="text-sm font-semibold text-gray-900">{otherUserName}</p>
              </div>
            </div>

            {/* Client description */}
            {booking.client_description && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                  <FileText className="h-3.5 w-3.5" />
                  {userRole === "worker" ? "Client's request details" : "Your request details"}
                </div>
                <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-line">
                  {booking.client_description}
                </p>
              </div>
            )}

            {!booking.client_description && (
              <p className="text-xs text-gray-400 italic">No request description provided.</p>
            )}

            {/* Date */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <CalendarDays className="h-3.5 w-3.5" />
              Requested on {formatDate(booking.created_at)}
            </div>

            {/* Status-specific info */}
            {booking.status === "accepted" && userRole === "worker" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
                Waiting for client to complete payment.
              </div>
            )}

            {booking.status === "active" && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 text-xs text-indigo-700 space-y-1">
                <div className="flex items-center gap-1.5 font-medium">
                  Job in progress — both parties must confirm completion.
                </div>
                <div className="flex gap-4">
                  <span className={`flex items-center gap-1 ${booking.completed_by_worker ? "text-green-600" : "text-gray-400"}`}>
                    <CheckCircle className="h-3.5 w-3.5" />
                    Provider {booking.completed_by_worker ? "✓" : "pending"}
                  </span>
                  <span className={`flex items-center gap-1 ${booking.completed_by_client ? "text-green-600" : "text-gray-400"}`}>
                    <CheckCircle className="h-3.5 w-3.5" />
                    Client {booking.completed_by_client ? "✓" : "pending"}
                  </span>
                </div>
              </div>
            )}

            {booking.has_dispute && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                <AlertTriangle className="h-3.5 w-3.5" />
                A dispute has been opened for this booking.
              </div>
            )}
          </div>
        </div>

        {/* Footer — action buttons */}
        <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-2 flex-shrink-0">
          {/* Worker: pending */}
          {userRole === "worker" && booking.status === "pending" && (
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-green-700 hover:bg-green-800 text-white h-11"
                onClick={() => callStatus("accepted")}
                disabled={updating}
              >
                {updating ? "…" : "Accept"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50 h-11"
                onClick={() => callStatus("rejected")}
                disabled={updating}
              >
                Reject
              </Button>
            </div>
          )}

          {/* Client: pending — cancel */}
          {userRole === "client" && booking.status === "pending" && (
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 h-11"
              onClick={() => callStatus("cancelled")}
              disabled={updating}
            >
              {updating ? "…" : "Cancel Request"}
            </Button>
          )}

          {/* Worker: accepted — cancel before payment */}
          {userRole === "worker" && booking.status === "accepted" && (
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 h-11"
              onClick={() => callStatus("cancelled")}
              disabled={updating}
            >
              {updating ? "…" : "Cancel Booking"}
            </Button>
          )}

          {/* Client: accepted — pay now */}
          {userRole === "client" && needsPayment && (
            <PayNowButton bookingId={booking.id} accessToken={accessToken} fullWidth />
          )}

          {/* Active: mark done */}
          {booking.status === "active" && !hasMarkedDone && (
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11"
              onClick={callMarkCompleted}
              disabled={updating}
            >
              {updating ? "…" : userRole === "worker" ? "Mark Work Done" : "Mark Job Done"}
            </Button>
          )}
          {booking.status === "active" && hasMarkedDone && (
            <div className="flex items-center justify-center gap-2 text-sm text-indigo-600 font-medium py-1">
              <CheckCircle className="h-4 w-4" />
              You marked done{!otherHasMarkedDone && ` — waiting for ${userRole === "worker" ? "client" : "provider"}`}
            </div>
          )}

          {/* Active / completed: dispute */}
          {(booking.status === "active" || booking.status === "completed") && !booking.has_dispute && (
            <Button
              variant="outline"
              className="w-full text-amber-600 border-amber-200 hover:bg-amber-50 h-10 gap-2"
              onClick={() => { onOpenDispute(booking.id, booking.title); onClose(); }}
            >
              <AlertTriangle className="h-4 w-4" />
              Open Dispute
            </Button>
          )}

          {/* Completed: review */}
          {booking.status === "completed" && !booking.has_reviewed && (
            <Button
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white h-10 gap-2"
              onClick={() => { onOpenReview(booking.id, otherUserName); onClose(); }}
            >
              <Star className="h-4 w-4" />
              Leave a Review
            </Button>
          )}
          {booking.status === "completed" && booking.has_reviewed && (
            <div className="flex items-center justify-center gap-1.5 text-sm text-gray-400 py-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              Review submitted
            </div>
          )}

          {/* Message */}
          <Button
            variant="outline"
            className="w-full h-10 gap-2"
            onClick={() => { onMessage(otherUserId); onClose(); }}
          >
            Message {otherUserName.split(" ")[0]}
          </Button>
        </div>
      </div>
    </div>
  );
}
