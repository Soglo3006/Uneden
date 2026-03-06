"use client";

import { useState } from "react";
import { CalendarDays, Check, Clock, CheckCircle, XCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnreadBookings } from "@/hooks/useUnreadBookings";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: "Pending",   color: "text-orange-600 bg-orange-50",  icon: <Clock className="h-3 w-3" /> },
  accepted:  { label: "Accepted",  color: "text-green-700 bg-green-50",    icon: <CheckCircle className="h-3 w-3" /> },
  refused:   { label: "Refused",   color: "text-red-600 bg-red-50",        icon: <XCircle className="h-3 w-3" /> },
  completed: { label: "Completed", color: "text-blue-600 bg-blue-50",      icon: <Star className="h-3 w-3" /> },
};

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  if (diff < 7 * 86400000) return `${Math.floor(diff / 86400000)}d`;
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export default function BookingNotifications() {
  const { notifs, loading, unseenCount, markSeen, markAllSeen } = useUnreadBookings();
  const router = useRouter();
  const [tab, setTab] = useState<"received" | "sent">("received");

  const received = notifs.filter((n) => n.role === "worker");
  const sent = notifs.filter((n) => n.role === "client");
  const current = tab === "received" ? received : sent;

  const receivedUnseen = received.filter((n) => !n.seen).length;
  const sentUnseen = sent.filter((n) => !n.seen).length;

  const handleClick = (id: string) => {
    markSeen(id);
    router.push("/bookings");
  };

  const NotifRow = ({ notif }: { notif: typeof notifs[0] }) => {
    const cfg = STATUS_CONFIG[notif.status] || STATUS_CONFIG.pending;
    const label = notif.role === "worker"
      ? `From ${notif.other_name}`
      : `By ${notif.other_name}`;

    return (
      <div
        onClick={() => handleClick(notif.id)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0",
          !notif.seen ? "bg-orange-50/60 hover:bg-orange-100/60" : "hover:bg-gray-50"
        )}
      >
        <Avatar className="h-10 w-10 shrink-0">
          {notif.other_avatar && <AvatarImage src={notif.other_avatar} />}
          <AvatarFallback className="bg-gray-200 text-gray-600 text-sm font-medium">
            {notif.other_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={cn("text-sm truncate", !notif.seen ? "font-semibold text-gray-900" : "font-medium text-gray-700")}>
              {notif.service_title}
            </p>
            <span className="text-[11px] text-gray-400 shrink-0">{formatTime(notif.created_at)}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full", cfg.color)}>
              {cfg.icon}{cfg.label}
            </span>
            <p className="text-[12px] text-gray-500 truncate">{label}</p>
          </div>
        </div>

        {!notif.seen ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); markSeen(notif.id); }}
            className="cursor-pointer shrink-0 group flex items-center justify-center h-8 w-8 rounded-full hover:bg-orange-100 transition-colors"
            title="Mark as read"
          >
            <span className="block group-hover:hidden h-2.5 w-2.5 rounded-full bg-orange-400" />
            <Check className="hidden group-hover:block h-4 w-4 text-orange-600" />
          </button>
        ) : (
          <div className="shrink-0 w-8" />
        )}
      </div>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative cursor-pointer hover:bg-gray-100">
          <CalendarDays className="h-5 w-5 text-gray-700" />
          {unseenCount > 0 && (
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[380px] p-0 rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Bookings
            {unseenCount > 0 && (
              <span className="ml-1.5 text-xs font-normal text-gray-500">({unseenCount} new)</span>
            )}
          </h3>
          {unseenCount > 0 && (
            <button type="button" onClick={markAllSeen} className="text-xs text-green-700 hover:underline cursor-pointer">
              Mark all as read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => setTab("received")}
            className={cn(
              "cursor-pointer flex-1 text-sm py-2 font-medium transition-colors",
              tab === "received" ? "text-green-700 border-b-2 border-green-700" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Received
            {receivedUnseen > 0 && (
              <span className="ml-1.5 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5">{receivedUnseen}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("sent")}
            className={cn(
              "cursor-pointer flex-1 text-sm py-2 font-medium transition-colors",
              tab === "sent" ? "text-green-700 border-b-2 border-green-700" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Sent
            {sentUnseen > 0 && (
              <span className="ml-1.5 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5">{sentUnseen}</span>
            )}
          </button>
        </div>

        {/* List */}
        <div className="max-h-[360px] overflow-y-auto overscroll-contain">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-700" />
            </div>
          ) : current.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <CalendarDays className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">
                {tab === "received" ? "No incoming booking requests" : "No sent bookings"}
              </p>
            </div>
          ) : (
            current.map((notif) => <NotifRow key={notif.id} notif={notif} />)
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-3">
          <button
            type="button"
            onClick={() => router.push("/bookings")}
            className="text-sm font-medium text-green-700 hover:text-green-800 hover:underline w-full text-center transition-colors cursor-pointer"
          >
            See All Bookings
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
