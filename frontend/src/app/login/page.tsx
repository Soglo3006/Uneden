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
  
  const { signInWithEmail, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();

  const { loading } = useProtectedRoute({
  });

  if (loading) return <div>Loading...</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCharging(true);

    try {
    await signInWithEmail(email, password);
    } catch (err: any) {
      if (err.message.includes("Email not confirmed")) {
        setError("Please verify your email before logging in. Check your inbox!");
      } else {
        setError(err.message || "Login failed");
      }
    } finally {
      setCharging(false);
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
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
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
          <Button variant="outline" type="button" className="cursor-pointer w-full" onClick={()=> signInWithApple()}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                fill="currentColor"
                className="h-5 w-5"
              />
            </svg>
            Login with Apple
          </Button>
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
            Don't have an account?{" "}
            <Link href="/register" className="text-green-600 hover:underline cursor-pointer">
              Sign up
            </Link>
          </CardDescription>
        </CardFooter>
      </Card>
    </div>
  )
}