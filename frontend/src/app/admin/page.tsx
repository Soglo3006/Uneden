"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, HeadphonesIcon, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { session, user, loading } = useAuth();
  const [allowed, setAllowed] = useState(false);
  const [openDisputes, setOpenDisputes] = useState<number | null>(null);
  const [openTickets, setOpenTickets] = useState<number | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (!isAdminUser(user)) { router.replace("/"); return; }
    setAllowed(true);
  }, [user, loading, router]);

  useEffect(() => {
    if (!allowed || !session?.access_token) return;

    const headers = { Authorization: `Bearer ${session.access_token}` };

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/disputes`, { headers })
      .then((r) => r.json())
      .then((data) => setOpenDisputes(Array.isArray(data) ? data.filter((d: any) => d.status === "open").length : 0))
      .catch(() => setOpenDisputes(0));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/support`, { headers })
      .then((r) => r.json())
      .then((data) => setOpenTickets(Array.isArray(data) ? data.filter((t: any) => t.status === "open").length : 0))
      .catch(() => setOpenTickets(0));
  }, [allowed, session]);

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
      </div>
    );
  }

  const sections = [
    {
      href: "/admin/disputes",
      label: "Disputes",
      description: "Manage booking disputes between clients and workers.",
      icon: Scale,
      count: openDisputes,
      countLabel: "open",
      color: "amber",
    },
    {
      href: "/admin/support",
      label: "Support",
      description: "View and respond to user support tickets.",
      icon: HeadphonesIcon,
      count: openTickets,
      countLabel: "open",
      color: "blue",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of pending actions.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {sections.map(({ href, label, description, icon: Icon, count, countLabel, color }) => (
          <Link key={href} href={href}>
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer border hover:border-green-200 group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${color === "amber" ? "bg-amber-50" : "bg-blue-50"}`}>
                  <Icon className={`h-5 w-5 ${color === "amber" ? "text-amber-600" : "text-blue-600"}`} />
                </div>
                {count !== null && count > 0 && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    color === "amber" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {count} {countLabel}
                  </span>
                )}
              </div>
              <h2 className="font-semibold text-gray-900 mb-1">{label}</h2>
              <p className="text-sm text-gray-500 mb-4">{description}</p>
              <div className="flex items-center gap-1 text-sm text-green-700 font-medium group-hover:gap-2 transition-all">
                Go to {label} <ArrowRight className="h-4 w-4" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
