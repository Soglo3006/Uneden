"use client";
import { Button } from "@/components/ui/button";
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
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [chargement, setChargement] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const { signUpWithEmail, signInWithGoogle, signInWithFacebook } = useAuth();
  const router = useRouter();

  const { loading } = useProtectedRoute({
    requireAuth: false,
  });

  if (loading) return <div>Loading...</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setChargement(true);

    try {
      await signUpWithEmail(email, password, fullName);
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Account created!</h2>
            <p className="text-gray-600 text-sm mb-6">
              Check your email to verify your account before signing in.
            </p>
            <Button
              className="w-full bg-green-800 hover:bg-green-900"
              onClick={() => router.push("/auth/verify-email")}
            >
              OK
            </Button>
          </div>
        </div>
      )}
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
          <CardDescription className="font-semibold text-xs">
            Join the community and start posting or finding local services
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6 font-semibold text-sm">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-green-800 hover:bg-green-900 cursor-pointer"
                disabled={chargement}
              >
                {chargement ? "Creating Account..." : "Create Account"}
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
<Button variant="outline" type="button" className="cursor-pointer" onClick={() => signInWithGoogle()}>
              <FcGoogle />
              Sign in with Google
            </Button>
            <Button variant="outline" type="button" className="cursor-pointer" onClick={() => signInWithFacebook()}>
              <FaFacebookF className="text-blue-600 h-5 w-5"/>
              Sign in with Facebook
            </Button>
            </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <CardDescription className="font-semibold text-xs text-center justify-center">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </CardDescription>
        </CardFooter>
      </Card>
      <p className="mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-green-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
