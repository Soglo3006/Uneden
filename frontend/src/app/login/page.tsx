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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [charging, setCharging] = useState(false);

  const { signInWithEmail, signInWithGoogle, signInWithFacebook } = useAuth();

  const { loading } = useProtectedRoute({
    requireAuth: false,
  });

  if (loading) return <div>Loading...</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCharging(true);

    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setCharging(false);
      if (err.message.includes("Email not confirmed")) {
        setError("Please verify your email before logging in. Check your inbox!");
      } else {
        setError("Login failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="font-semibold text-xs">
            Sign in to access local opportunities and community services
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
                <Label htmlFor="email" className="font-semibold text-sm">Email</Label>
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
                  <Label htmlFor="password" className="font-semibold text-sm">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-green-700"
                  >
                    Forgot your password?
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
                {charging ? "Loading..." : "Login"}
              </Button>
            </div>
          </form>
          <div className="flex items-center my-3">
            <div className="flex-1 h-px bg-gray-400" />
            <span className="px-4 text-sm">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-gray-400" />
          </div>
          <div className="flex flex-col gap-2">
<Button variant="outline" type="button" className="cursor-pointer w-full" onClick={()=> signInWithGoogle()}>
            <FcGoogle />
            Login with Gooogle
          </Button>
          <Button variant="outline" type="button" className="cursor-pointer w-full" onClick={()=> signInWithFacebook()}>
            <FaFacebookF className="text-blue-600 h-5 w-5"/>
            Login with Facebook
          </Button>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <CardDescription>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-green-600 hover:underline cursor-pointer">
              Sign in
            </Link>
          </CardDescription>
        </CardFooter>
      </Card>
    </div>
  )
}