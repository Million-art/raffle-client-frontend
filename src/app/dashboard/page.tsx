"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Ticket, User, Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getMyRaffles } from "@/services/participations.service";
import type { Participation } from "@/services/participations.service";
import { useRaffleWebSocketMulti } from "@/hooks/useRaffleWebSocketMulti";

function DashboardContent() {
  const [raffles, setRaffles] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const raffleIds = useMemo(() => (raffles ?? []).map((r) => r.raffleId), [raffles]);
  const { getState } = useRaffleWebSocketMulti(raffleIds);

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
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl animate-pulse" />
          <Loader2 className="h-10 w-10 animate-spin text-primary-500 relative" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-400 backdrop-blur-md">
        <p className="font-semibold">Could not load your raffles</p>
        <p className="mt-1 text-sm opacity-90">{error}</p>
      </div>
    );
  }

  if (!raffles || raffles.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center backdrop-blur-md">
        <Ticket className="mx-auto h-14 w-14 text-slate-500" />
        <h2 className="mt-4 text-xl font-bold text-white">No participations yet</h2>
        <p className="mt-2 text-slate-400">
          When you join raffles, they will appear here.
        </p>
        <a
          href="/raffles"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-950 shadow-soft transition-all hover:bg-slate-100"
        >
          Explore raffles
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {raffles.map((r, i) => {
        const drawState = getState(r.raffleId);
        const isInDraw = drawState.countdown !== null || drawState.isDrawing;
        const sold = drawState.ticketsSold ?? r.ticketsSold;
        return (
          <motion.article
            key={r.raffleId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 shadow-xl transition-all hover:border-primary-500/30 hover:shadow-2xl backdrop-blur-md"
          >
            {/* Draw in progress overlay - spinner for all participants in realtime */}
            {isInDraw && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md rounded-2xl">
                <div className="flex flex-col items-center gap-3 p-4">
                  {drawState.countdown !== null ? (
                    <>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary-400">Draw starting</p>
                      <div className="text-4xl font-black tabular-nums text-white">{drawState.countdown}s</div>
                    </>
                  ) : (
                    <>
                      <div className="h-14 w-14 rounded-full border-4 border-primary-500/30 border-t-primary-400 animate-spin" />
                      <p className="text-sm font-bold text-white">Shaking container…</p>
                    </>
                  )}
                </div>
              </div>
            )}
            <div className="relative aspect-video overflow-hidden bg-white/5">
              {r.videoUrl ? (
                <video
                  src={r.videoUrl}
                  className="h-full w-full object-cover"
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="metadata"
                  poster={r.imageUrl}
                />
              ) : r.imageUrl ? (
                <img src={r.imageUrl} alt={r.raffleName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center italic text-slate-400">
                  Raffle
                </div>
              )}

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              <div className="absolute left-4 top-4">
                <span className={`rounded-full border border-white/10 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ${(drawState.status ?? r.status) === "locked" ? "bg-slate-600" :
                    (drawState.status ?? r.status) === "executed" ? "bg-amber-500/80" : "bg-emerald-500/80"
                  }`}>
                  {(drawState.status ?? r.status) === "locked"
                    ? "Sold Out"
                    : (drawState.status ?? r.status) === "executed"
                      ? "Completed"
                      : "Active"}
                </span>
              </div>
              <div className="absolute right-4 top-4 rounded-full bg-primary-600 px-3 py-1 text-xs font-bold text-white">
                {r.myTickets} ticket{r.myTickets !== 1 ? "s" : ""}
              </div>

              {/* Video Indicator */}
              {r.videoUrl && (
                <div className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white">
                  <div className="h-0 w-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
                </div>
              )}
            </div>

            <div className="flex flex-col p-6">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <User className="h-3 w-3 text-primary-400" />
                {r.agentName || "Verified Agent"}
              </div>

              <h3 className="mb-2 text-xl font-bold text-white line-clamp-1">{r.raffleName}</h3>
              <p className="mb-6 text-sm text-slate-400 line-clamp-2 leading-relaxed">{r.description}</p>

              <div className="mb-6 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>{sold} sold</span>
                  <span>{r.totalTickets} total</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(sold / r.totalTickets) * 100}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-primary-600"
                  />
                </div>
              </div>

              <div className="mt-auto border-t border-white/10 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Price / ticket</p>
                <p className="text-xl font-black text-white">{r.ticketPrice.toFixed(0)} ETB</p>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen border-t border-white/5 bg-slate-950 pt-8 pb-24">
        <div className="container mx-auto max-w-7xl px-4">
          <h1 className="text-4xl font-black tracking-tight text-white">My dashboard</h1>
          <p className="mt-2 text-slate-400 font-medium">
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
