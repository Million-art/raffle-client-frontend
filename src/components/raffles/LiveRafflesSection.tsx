"use client";

import { useEffect, useState } from "react";
import { RaffleCard } from "@/components/raffles/RaffleCard";
import { getRaffles } from "@/services/raffles.service";
import type { RaffleListItem } from "@/services/raffles.service";
import { Loader2, ArrowRight } from "lucide-react";

export function LiveRafflesSection() {
  const [items, setItems] = useState<RaffleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRaffles({ page: 1, limit: 6 })
      .then((r) => setItems(r.items))
      .catch(() => setError("Could not load raffles"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-slate-950 py-32 border-t border-white/5">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl animate-pulse" />
              <Loader2 className="h-12 w-12 animate-spin text-primary-500 relative" />
            </div>
            <p className="mt-8 text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing with Audit Trail...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full bg-slate-950 py-32 border-t border-white/5">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="rounded-[2rem] border border-red-500/20 bg-red-500/5 p-8 text-center backdrop-blur-md">
            <p className="text-xl font-black text-white mb-2">{error}</p>
            <p className="text-slate-400 font-medium italic">Make sure the platform nodes are currently reachable.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-slate-950 py-32 border-t border-white/5 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 h-[500px] w-[500px] bg-primary-600/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        <div className="mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 mb-6">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Live Infrastructure</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-6xl leading-[1.1]">
              Active <span className="text-primary-500">Global</span> Draws
            </h2>
            <p className="mt-6 text-lg text-slate-400 font-medium leading-relaxed">
              Real-time participation opportunities. Every ticket purchase is logged to the public audit trail instantly.
            </p>
          </div>
          <a
            href="/raffles"
            className="group inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-black text-white backdrop-blur-sm transition-all hover:bg-white/10 active:scale-95"
          >
            All Verification Nodes
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {items.length === 0 ? (
          <div className="rounded-[3rem] border border-white/5 bg-white/[0.02] p-24 text-center backdrop-blur-md">
            <h3 className="text-2xl font-black text-white mb-4 italic">The nodes are silent.</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto italic">No active draws found on the platform. Join our waitlist to be notified of the next high-value release.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((raffle) => (
              <RaffleCard key={raffle.id} raffle={raffle} detailHref={`/raffles/${raffle.id}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
