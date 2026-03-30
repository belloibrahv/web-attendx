"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Check your email and password, then try again.");
        return;
      }

      const sessionResponse = await fetch("/api/auth/session");
      const session = await sessionResponse.json();
      const role = session?.user?.role;

      if (role === "ADMIN") router.replace("/admin");
      else if (role === "LECTURER") router.replace("/lecturer");
      else if (role === "STUDENT") router.replace("/student");
      else router.replace("/home");
    } catch {
      setError("Sign-in could not be completed right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Secure Sign In"
      title="Access your institutional dashboard"
      description="Sign in with the email and password assigned to your TASUED attendance account. Access is routed automatically based on your user role."
      footer={
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            New to the platform?{" "}
            <Link href="/register" className="font-semibold text-primary hover:text-accent">
              Create a student or lecturer account
            </Link>
            .
          </p>
          <p>Administrator accounts remain provisioned separately through system management.</p>
        </div>
      }
    >
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium text-slate-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@tasued.edu.ng"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 rounded-2xl border-slate-200 bg-white px-4"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-medium text-slate-700">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 rounded-2xl border-slate-200 bg-white px-4 pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="text-sm leading-6 text-red-700">{error}</p>
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-2xl bg-gradient-to-r from-primary to-accent text-base font-semibold text-white hover:from-primary/92 hover:to-accent/92"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
