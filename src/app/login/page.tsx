"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

/**
 * Sub-component to handle Google Login logic.
 */
const NO_ACCOUNT_ERROR = "No account found with this email. Please sign up first.";

function GoogleLoginSection() {
  const { googleLogin, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || "/dashboard";

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await googleLogin(credentialResponse.credential, false);
      router.push(redirect);
    } catch (e) {
      if (e instanceof Error && e.message === NO_ACCOUNT_ERROR) {
        clearError();
        const signupUrl = redirect !== "/dashboard"
          ? `/signup?redirect=${encodeURIComponent(redirect)}`
          : "/signup";
        router.push(signupUrl);
      }
    }
  };

  return (
    <>
      <div className="mt-8 relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm font-medium">
          <span className="bg-white px-4 text-slate-500">or continue with</span>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            console.error("Google Login Failed");
          }}
          theme="outline"
          shape="pill"
          width="320"
          text="signin_with"
        />
      </div>
    </>
  );
}

function LoginForm() {
  const { user, loading: authLoading, login, error, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || "/dashboard";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirect);
    }
  }, [user, authLoading, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);

    try {
      await login({ identifier, password });
      router.push(redirect);
    } catch {
      // Error is handled by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = authLoading || submitting;

  if (authLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 flex flex-col items-center">
          <Image src="/logo.png" alt="Logo" width={140} height={48} className="h-12 w-auto object-contain mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Sign in to your account</h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Access your tickets and winnings.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Email or Phone Number
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="Enter your email or phone"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-xl bg-primary-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-primary-500 disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {googleClientId && (
          <GoogleLoginSection />
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href={redirect !== "/dashboard" ? `/signup?redirect=${encodeURIComponent(redirect)}` : "/signup"}
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
