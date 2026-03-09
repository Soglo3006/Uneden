"use client";
import { Button } from "@/components/ui/button"
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React, { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [charging, setCharging] = useState(false);

  const { signInWithEmail, signInWithGoogle, signInWithFacebook } = useAuth();
  const { t } = useTranslation();

  const { loading } = useProtectedRoute({
    requireAuth: false,
  });

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
        </div>
      </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCharging(true);

    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setCharging(false);
      if (err.message.includes("Email not confirmed")) {
        setError(t("login.emailNotConfirmed"));
      } else {
        setError(t("login.loginFailed"));
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t("login.title")}</CardTitle>
          <CardDescription className="font-semibold text-xs">
            {t("login.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-semibold text-sm">{t("login.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="font-semibold text-sm">{t("login.password")}</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-green-700"
                  >
                    {t("login.forgotPassword")}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-green-800 hover:bg-green-900 cursor-pointer"
                disabled={charging}
              >
                {charging ? t("login.loading") : t("login.loginButton")}
              </Button>
            </div>
          </form>
          <div className="flex items-center my-3">
            <div className="flex-1 h-px bg-gray-400" />
            <span className="px-4 text-sm">
              {t("login.orContinueWith")}
            </span>
            <div className="flex-1 h-px bg-gray-400" />
          </div>
          <div className="flex flex-col gap-2">
<Button variant="outline" type="button" className="cursor-pointer w-full" onClick={()=> signInWithGoogle()}>
            <FcGoogle />
            {t("login.loginWithGoogle")}
          </Button>
          <Button variant="outline" type="button" className="cursor-pointer w-full" onClick={()=> signInWithFacebook()}>
            <FaFacebookF className="text-blue-600 h-5 w-5"/>
            {t("login.loginWithFacebook")}
          </Button>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <CardDescription>
            {t("login.noAccount")}{" "}
            <Link href="/register" className="text-green-600 hover:underline cursor-pointer">
              {t("login.signUp")}
            </Link>
          </CardDescription>
        </CardFooter>
      </Card>
    </div>
  )
}
