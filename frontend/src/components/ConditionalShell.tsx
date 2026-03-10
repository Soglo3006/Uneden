"use client";

import "@/lib/i18n";
import { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import i18n from "@/lib/i18n";
import Header from "@/components/home/Header";
import CategoryNav from "@/components/home/Category";
import Footer from "@/components/home/Footer";
import SupportButton from "@/components/support/SupportButton";

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/choose_type",
  "/profile/complete_profil",
  "/auth/callback",
  "/auth/verify-email",
  "/forgot-password",
  "/auth/reset-password",
  "/admin",
];

const NO_CATEGORY_ROUTES = [
  "/listings",
];

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("i18nextLng");
    const browserLng = navigator.language?.startsWith("fr") ? "fr" : "en";
    const lng = saved ?? browserLng;
    if (lng !== i18n.language) i18n.changeLanguage(lng);
  }, []);
  const isAuthPage = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isNoCategoryPage = NO_CATEGORY_ROUTES.some((r) => pathname.startsWith(r));

  if (isAuthPage) {
    return <main className="flex-1">{children}</main>;
  }

  if (isNoCategoryPage) {
    return (
      <>
        <Suspense><Header /></Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
        <SupportButton floating />
      </>
    );
  }

  return (
    <>
      <Suspense><Header /></Suspense>
      <CategoryNav />
      <main className="flex-1">{children}</main>
      <Footer />
      <SupportButton floating />
    </>
  );
}