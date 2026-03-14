"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Payment status page — redirects to My Tickets.
 * Chapa return_url now goes directly to /my-raffles. This page exists only
 * for legacy links; it immediately redirects.
 */
export default function PaymentStatusPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/my-raffles");
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-500">Redirecting...</p>
    </main>
  );
}
