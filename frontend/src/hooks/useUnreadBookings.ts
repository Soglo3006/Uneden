import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export interface BookingNotif {
  id: string;
  service_title: string;
  other_name: string;  
  other_avatar: string | null;
  status: string;
  created_at: string;
  role: "worker" | "client";
  seen: boolean;
}

const STORAGE_KEY = (userId: string) => `booking_seen_${userId}`;

function getSeenIds(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(userId));
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

function saveSeenIds(userId: string, ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY(userId), JSON.stringify([...ids]));
  } catch {}
}

export function useUnreadBookings() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<BookingNotif[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = useCallback(async () => {
    if (!user) return;

    const seenIds = getSeenIds(user.id);

    // Fetch worker side: pending bookings (no join — FK not set on worker_id/client_id)
    const { data: workerBookings } = await supabase
      .from("bookings")
      .select("id, status, created_at, service_id, client_id")
      .eq("worker_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10);

    // Fetch client side: accepted/refused/completed bookings (last 30 days)
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const { data: clientBookings } = await supabase
      .from("bookings")
      .select("id, status, created_at, service_id, worker_id")
      .eq("client_id", user.id)
      .in("status", ["accepted", "refused", "completed"])
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10);

    // Collect IDs to fetch in bulk
    const serviceIds = [
      ...new Set([
        ...(workerBookings || []).map((b) => b.service_id),
        ...(clientBookings || []).map((b) => b.service_id),
      ]),
    ].filter(Boolean);

    const profileIds = [
      ...new Set([
        ...(workerBookings || []).map((b) => b.client_id),
        ...(clientBookings || []).map((b) => b.worker_id),
      ]),
    ].filter(Boolean);

    const [{ data: services }, { data: profiles }] = await Promise.all([
      serviceIds.length
        ? supabase.from("services").select("id, title").in("id", serviceIds)
        : Promise.resolve({ data: [] }),
      profileIds.length
        ? supabase.from("profiles").select("id, full_name, company_name, account_type, avatar_url").in("id", profileIds)
        : Promise.resolve({ data: [] }),
    ]);

    const serviceMap = Object.fromEntries((services || []).map((s) => [s.id, s]));
    const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

    const result: BookingNotif[] = [];

    for (const b of workerBookings || []) {
      const client = profileMap[b.client_id];
      const name = client?.account_type === "company" ? client?.company_name : client?.full_name;
      result.push({
        id: b.id,
        service_title: serviceMap[b.service_id]?.title || "Service",
        other_name: name || "Client",
        other_avatar: client?.avatar_url || null,
        status: b.status,
        created_at: b.created_at,
        role: "worker",
        seen: seenIds.has(b.id),
      });
    }

    for (const b of clientBookings || []) {
      const worker = profileMap[b.worker_id];
      const name = worker?.account_type === "company" ? worker?.company_name : worker?.full_name;
      result.push({
        id: b.id,
        service_title: serviceMap[b.service_id]?.title || "Service",
        other_name: name || "Worker",
        other_avatar: worker?.avatar_url || null,
        status: b.status,
        created_at: b.created_at,
        role: "client",
        seen: seenIds.has(b.id),
      });
    }

    // Sort: unseen first, then by date
    result.sort((a, b) => {
      if (a.seen !== b.seen) return a.seen ? 1 : -1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setNotifs(result);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      Promise.resolve().then(() => { setNotifs([]); setLoading(false); });
      return;
    }

    Promise.resolve().then(() => fetchNotifs());

    const channel = supabase
      .channel("booking-notifs")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, fetchNotifs)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchNotifs]);

  const markSeen = useCallback((id: string) => {
    if (!user) return;
    const seenIds = getSeenIds(user.id);
    seenIds.add(id);
    saveSeenIds(user.id, seenIds);
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, seen: true } : n));
  }, [user]);

  const markAllSeen = useCallback(() => {
    if (!user) return;
    const seenIds = getSeenIds(user.id);
    notifs.forEach((n) => seenIds.add(n.id));
    saveSeenIds(user.id, seenIds);
    setNotifs((prev) => prev.map((n) => ({ ...n, seen: true })));
  }, [user, notifs]);

  const unseenCount = notifs.filter((n) => !n.seen).length;

  return { notifs, loading, unseenCount, markSeen, markAllSeen };
}
