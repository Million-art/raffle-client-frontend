"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, Home, Ticket, AlertCircle, RefreshCcw } from "lucide-react";
import { getRaffleById, type RaffleDetail } from "@/services/raffles.service";
import { apiFetch, type ApiResponse } from "@/lib/api";

type PaymentStatus = "loading" | "success" | "error" | "pending";

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Robust parsing: runs during render, not in useEffect
  // This prevents race conditions where polling starts before txRef is set
  const getParam = (name: string) => {
    // 1. Try standard next/navigation searchParams
    const fromParams = searchParams?.get(name);
    if (fromParams) return fromParams;

    // 2. Fallback to manual window.location parsing for mangled URLs (e.g. Double ? from Chapa)
    if (typeof window !== "undefined") {
      const search = window.location.search;
      // Look for the last occurrence of the parameter to handle mangled query strings
      const regex = new RegExp(`[?&]${name}=([^&?]+)`, "g");
      let match;
      let lastValue = "";
      while ((match = regex.exec(search)) !== null) {
        lastValue = decodeURIComponent(match[1]);
      }
      return lastValue;
    }
    return "";
  };

  const statusParam = getParam("status");
  const raffleId = getParam("raffle_id");
  // Chapa may use tx_ref or trx_ref in redirect URLs (callback uses trx_ref)
  const txRef = getParam("tx_ref") || getParam("trx_ref");
  const message = getParam("message");

  // Internal state
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [raffle, setRaffle] = useState<RaffleDetail | null>(null);
  const [errorReason, setErrorReason] = useState<string | null>(message);
  const [attempts, setAttempts] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);

  // Debug log for production-ish troubleshooting
  useEffect(() => {
    console.log("[PaymentStatus] Initialized:", { statusParam, txRef, raffleId, fullUrl: window.location.href });
    
    // Give the URL parser 5 seconds to "settle" or find the reference 
    // before we even think about showing a "Missing Reference" error
    const timer = setTimeout(() => setIsInitializing(false), 5000);
    return () => clearTimeout(timer);
  }, [statusParam, txRef, raffleId]);

  const checkStatus = useCallback(async () => {
    if (!txRef) {
      // Priority 1: If we have an explicit status from the redirect, use it
      if (statusParam === "success") {
        setStatus("success");
        return;
      }
      if (statusParam === "error") {
        setStatus("error");
        return;
      }
      
      // Priority 2: If we are still in the initial 5-second search window, just stay loading
      if (isInitializing) {
        setStatus("loading");
        return;
      }

      // Priority 3: Only after 5 seconds of finding NOTHING, we show the error
      setStatus("error");
      setErrorReason("Missing transaction reference.");
      return;
    }

    try {
      const response = await apiFetch<ApiResponse<{ status: string; raffle_id?: string }>>(
        `/api/payments/status/${txRef}`
      );

      if (response.data.status === "success") {
        setStatus("success");
        if (response.data.raffle_id) {
          const detail = await getRaffleById(response.data.raffle_id);
          setRaffle(detail);
        }
      } else if (response.data.status === "pending") {
        setStatus("pending");
        // Poll again in 2 seconds if less than 15 attempts (30 seconds total)
        if (attempts < 15) {
          setTimeout(() => {
            setAttempts(prev => prev + 1);
          }, 2000);
        } else {
          setStatus("error");
          setErrorReason("Verification timeout. Please check your tickets in dashboard.");
        }
      } else {
        setStatus("error");
        setErrorReason("Payment verification failed.");
      }
    } catch (err) {
      console.error("Status check failed:", err);
      if (attempts < 5) {
        setTimeout(() => setAttempts(prev => prev + 1), 2000);
      } else {
        setStatus("error");
        setErrorReason("Could not verify payment status.");
      }
    }
  }, [txRef, attempts, statusParam, isInitializing]);

  useEffect(() => {
    if (statusParam === "error") {
      setStatus("error");
    } else {
      checkStatus();
    }
  }, [statusParam, checkStatus]);

  useEffect(() => {
    if (raffleId && !raffle) {
      getRaffleById(raffleId).then(setRaffle).catch(console.error);
    }
  }, [raffleId, raffle]);

  // UI State: Success
  if (status === "success") {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
          <div className="bg-green-500 p-8 flex justify-center">
            <CheckCircle2 className="h-20 w-20 text-white" />
          </div>
          <div className="p-8 text-center">
            <h1 className="text-2xl font-black text-slate-900 mb-2">Payment Successful!</h1>
            <p className="text-slate-600 mb-8">
              Your tickets have been issued. You are now officially in the {raffle?.name ? `"${raffle.name}"` : "raffle"}!
            </p>

            {raffle && (
              <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Raffle</p>
                <p className="text-sm font-bold text-slate-900 truncate">{raffle.name}</p>
                {txRef && (
                  <>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 mt-3">Transaction ID</p>
                    <p className="text-xs font-mono text-slate-600 break-all">{txRef}</p>
                  </>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Link
                href={raffleId ? `/raffles/${raffleId}` : "/raffles"}
                className="w-full py-4 bg-brand-blue text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
              >
                <Ticket className="h-5 w-5" />
                Go to {raffleId ? "Raffle" : "Raffles"}
              </Link>
              <Link
                href="/my-raffles"
                className="w-full py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
              >
                View My Tickets
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // UI State: Error
  if (status === "error") {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
          <div className="bg-red-500 p-8 flex justify-center">
            <XCircle className="h-20 w-20 text-white" />
          </div>
          <div className="p-8 text-center">
            <h1 className="text-2xl font-black text-slate-900 mb-2">Payment Failed</h1>
            <p className="text-slate-600 mb-8">
              {errorReason || "We couldn't process your payment. Please try again or contact support if the problem persists."}
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href={raffleId ? `/raffles/${raffleId}` : "/raffles"}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                <RefreshCcw className="h-5 w-5" />
                Retry Purchase
              </Link>
              <Link
                href="/my-raffles"
                className="w-full py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
              >
                View My Tickets
              </Link>
              <Link
                href="/contact"
                className="w-full py-3 text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors"
              >
                Contact support if your payment went through
              </Link>
              <Link
                href="/"
                className="w-full py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // UI State: Loading / Pending
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-12 text-center overflow-hidden">
        <div className="relative mb-8 inline-block">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl animate-pulse" />
          <Loader2 className="h-20 w-20 text-brand-blue animate-spin relative" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Verifying Payment</h1>
        <p className="text-slate-500 animate-pulse">
          {status === "pending" ? "Waiting for confirmation from bank..." : "Synchronizing with payment gateway..."}
        </p>
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Please do not close this window</span>
        </div>
      </div>
    </main>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-12 text-center overflow-hidden">
          <div className="relative mb-8 inline-block">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl animate-pulse" />
            <Loader2 className="h-20 w-20 text-brand-blue animate-spin relative" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Loading...</h1>
        </div>
      </main>
    }>
      <PaymentStatusContent />
    </Suspense>
  );
}
