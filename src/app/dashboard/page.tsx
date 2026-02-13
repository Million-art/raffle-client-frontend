"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Ticket, User, Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getMyRaffles } from "@/services/participations.service";
import type { Participation } from "@/services/participations.service";

function DashboardContent() {
  const [raffles, setRaffles] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyRaffles()
      .then((data) => {
        if (!cancelled) setRaffles(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        <p className="font-semibold">Could not load your raffles</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  if (raffles.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-soft">
        <Ticket className="mx-auto h-14 w-14 text-slate-300" />
        <h2 className="mt-4 text-xl font-bold text-slate-800">No participations yet</h2>
        <p className="mt-2 text-slate-500">
          When you join raffles, they will appear here.
        </p>
        <a
          href="/raffles"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-soft transition-all hover:bg-primary-700"
        >
          Explore raffles
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {raffles.map((r, i) => (
        <motion.article
          key={r.raffleId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-all hover:border-primary-200 hover:shadow-medium"
        >
          <div className="relative aspect-video overflow-hidden bg-slate-100">
            {r.imageUrl ? (
              <img src={r.imageUrl} alt={r.raffleName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center italic text-slate-400">
                Raffle
              </div>
            )}
            <div className="absolute left-4 top-4">
              <span className="rounded-full border border-slate-100 bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-sm">
                {r.status === "locked"
                  ? "Locked"
                  : r.status === "executed"
                    ? "Completed"
                    : "Active"}
              </span>
            </div>
            <div className="absolute right-4 top-4 rounded-full bg-primary-600 px-3 py-1 text-xs font-bold text-white">
              {r.myTickets} ticket{r.myTickets !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="flex flex-col p-6">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <User className="h-3 w-3 text-primary-500" />
              {r.agentName || "Verified Agent"}
            </div>

            <h3 className="mb-2 text-xl font-bold text-slate-900 line-clamp-1">{r.raffleName}</h3>
            <p className="mb-6 text-sm text-slate-500 line-clamp-2 leading-relaxed">{r.description}</p>

            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>{r.ticketsSold} sold</span>
                <span>{r.totalTickets} total</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.ticketsSold / r.totalTickets) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-primary-600"
                />
              </div>
            </div>

            <div className="mt-auto border-t border-slate-100 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Price / ticket</p>
              <p className="text-xl font-black text-slate-900">{r.ticketPrice.toFixed(0)} ETB</p>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50 pt-8 pb-24">
        <div className="container mx-auto max-w-7xl px-4">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">My dashboard</h1>
          <p className="mt-2 text-slate-500 font-medium">
            Raffles you participated in and your ticket counts.
          </p>
          <div className="mt-10">
            <DashboardContent />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
