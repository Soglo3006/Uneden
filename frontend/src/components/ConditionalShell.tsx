"use client";

import { usePathname } from "next/navigation";
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
];

const NO_CATEGORY_ROUTES = [
  "/listings",
];

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isNoCategoryPage = NO_CATEGORY_ROUTES.some((r) => pathname.startsWith(r));

  if (isAuthPage) {
    return <main className="flex-1">{children}</main>;
  }

  if (isNoCategoryPage) {
    return (
      <>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <SupportButton floating />
      </>
    );
  }

  return (
    <>
      <Header />
      <CategoryNav />
      <main className="flex-1">{children}</main>
      <Footer />
      <SupportButton floating />
    </>
  );
}