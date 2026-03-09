"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { sendOtp, verifyOtp } from "@/services/auth.service";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

/**
 * Sub-component to handle Google Login logic.
 */
function GoogleLoginSection() {
  const { googleLogin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || "/dashboard";

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await googleLogin(credentialResponse.credential, true);
      router.push(redirect);
    } catch {
      // error set in context
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
          text="signup_with"
        />
      </div>
    </>
  );
}

function SignupForm() {
  const { user, loading: authLoading, signup, error, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || "/dashboard";

  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirect);
    }
  }, [user, authLoading, router, redirect]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!phone.trim()) return;
    setSendingCode(true);
    try {
      await sendOtp(phone.trim());
      setStep(2);
    } catch {
      // error set in context
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!otpCode.trim()) return;
    setSubmitting(true);
    try {
      const { verificationToken } = await verifyOtp(phone.trim(), otpCode.trim());
      await signup({ phone: phone.trim(), fullName, password, confirmPassword, verificationToken });
      router.push(redirect);
    } catch {
      // error set in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (step === 1) {
      handleSendCode(e);
    } else {
      handleVerifyAndSignup(e);
    }
  };

  const isLoading = authLoading || submitting || sendingCode;

  if (authLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 flex flex-col items-center">
          <Image src="/logo.png" alt="Logo" width={140} height={48} className="h-12 w-auto object-contain mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Join and start participating in exciting raffles
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <span>{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="ml-2 font-semibold text-red-500 hover:text-red-700 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <div>
                <label htmlFor="signup-phone" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Phone Number
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="+251 9 12 34 56 78"
                  required
                />
              </div>
              <div>
                <label htmlFor="signup-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label htmlFor="signup-password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
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
              <div>
                <label htmlFor="signup-confirm" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="signup-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full rounded-xl bg-primary-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-primary-500 disabled:opacity-60"
              >
                {sendingCode ? "Sending code…" : "Send verification code"}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                We sent a 6-digit code to <strong className="text-slate-900">{phone}</strong>. Enter it below.
              </p>
              <div>
                <label htmlFor="signup-otp" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Verification code
                </label>
                <input
                  id="signup-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-center text-lg tracking-widest text-slate-900 placeholder-slate-400 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="000000"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm text-slate-500 hover:text-slate-700"
              >
                Use a different number
              </button>
              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                className="mt-2 w-full rounded-xl bg-primary-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-primary-500 disabled:opacity-60"
              >
                {submitting ? "Creating account…" : "Verify & sign up"}
              </button>
            </>
          )}
        </form>

        {googleClientId && (
          <GoogleLoginSection />
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href={redirect !== "/dashboard" ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"}
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
