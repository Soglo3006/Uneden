export type BookingStatus = "pending" | "accepted" | "active" | "completed" | "cancelled" | "rejected";

interface BookingBase {
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

export interface ReceivedBooking extends BookingBase {
  client_name: string;
}

export interface SentBooking extends BookingBase {
  worker_name: string;
}

export const STATUS_CONFIG: Record<BookingStatus, { label: string; bar: string; badge: string }> = {
  pending:   { label: "Pending",   bar: "bg-amber-400",  badge: "bg-amber-100 text-amber-800 border-amber-200" },
  accepted:  { label: "Accepted",  bar: "bg-blue-500",   badge: "bg-blue-100 text-blue-800 border-blue-200" },
  active:    { label: "Active",    bar: "bg-indigo-500", badge: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  completed: { label: "Completed", bar: "bg-green-500",  badge: "bg-green-100 text-green-800 border-green-200" },
  cancelled: { label: "Cancelled", bar: "bg-gray-400",   badge: "bg-gray-100 text-gray-600 border-gray-200" },
  rejected:  { label: "Rejected",  bar: "bg-red-400",    badge: "bg-red-100 text-red-700 border-red-200" },
};

export function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
  } catch { return dateStr; }
}

export const BOOKING_GROUPS = [
  { label: "Requests",  statuses: ["pending"] as BookingStatus[] },
  { label: "Active",    statuses: ["accepted", "active"] as BookingStatus[] },
  { label: "Completed", statuses: ["completed"] as BookingStatus[] },
  { label: "Closed",    statuses: ["cancelled", "rejected"] as BookingStatus[] },
] as const;
