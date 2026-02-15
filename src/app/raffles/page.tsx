"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RaffleCard } from "@/components/raffles/RaffleCard";
import { getRaffles, purchaseTickets } from "@/services/raffles.service";
import type { RaffleListItem } from "@/services/raffles.service";
import { useAuth } from "@/contexts/AuthContext";
import { useRaffleWebSocketMulti } from "@/hooks/useRaffleWebSocketMulti";
import { Search, Filter, Loader2, X } from "lucide-react";

export default function RafflesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<RaffleListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [joinRaffle, setJoinRaffle] = useState<RaffleListItem | null>(null);
  const [joinQuantity, setJoinQuantity] = useState(1);
  const [joinLoading, setJoinLoading] = useState(false);
  const [flash, setFlash] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const raffleIds = useMemo(() => (items ?? []).map((r) => r.id), [items]);
  const { getState } = useRaffleWebSocketMulti(raffleIds);

  const loadRaffles = useCallback(() => {
    setLoading(true);
    getRaffles({ page, limit })
      .then((r) => {
        setItems(r.items);
        setTotal(r.total);
      })
      .catch(() => setError("Could not load raffles"))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    loadRaffles();
  }, [loadRaffles]);

  const handleJoinClick = useCallback(
    (raffle: RaffleListItem) => {
      if (!user) {
        setFlash({ type: "error", text: "Please log in to join a raffle." });
        router.push("/login?from=/raffles");
        return;
      }
      setJoinRaffle(raffle);
      setJoinQuantity(1);
    },
    [user, router]
  );

  const handleJoinConfirm = useCallback(async () => {
    if (!joinRaffle) return;
    setJoinLoading(true);
    setFlash(null);
    try {
      await purchaseTickets(joinRaffle.id, joinQuantity, undefined, user?.fullName, user?.email);
      setFlash({ type: "success", text: `You joined "${joinRaffle.name}" with ${joinQuantity} ticket(s).` });
      setJoinRaffle(null);
      loadRaffles();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to join raffle";
      setFlash({ type: "error", text: msg });
    } finally {
      setJoinLoading(false);
    }
  }, [joinRaffle, joinQuantity, loadRaffles, user]);

  const handleJoinClose = useCallback(() => {
    if (!joinLoading) setJoinRaffle(null);
  }, [joinLoading]);

  return (
    <main className="min-h-screen border-t border-white/5 bg-slate-950 pt-8 pb-24 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 h-[500px] w-[500px] bg-primary-600/5 blur-[120px] pointer-events-none" />
      <div className="container relative z-10 mx-auto max-w-7xl px-4">
        {flash && (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium backdrop-blur-md ${
              flash.type === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
            role="alert"
          >
            {flash.text}
            <button
              type="button"
              onClick={() => setFlash(null)}
              className="ml-2 underline focus:outline-none opacity-80 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 mb-4">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Live Infrastructure</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              Explore Raffles
            </h1>
            <p className="mt-2 font-medium text-slate-400">
              Browse through verified opportunities and find your next win.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name or agent..."
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 text-sm font-medium text-white placeholder-slate-500 outline-none transition-all focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <button
              type="button"
              className="flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-bold text-white transition-all hover:bg-white/10"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl animate-pulse" />
              <Loader2 className="h-10 w-10 animate-spin text-primary-500 relative" />
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-red-400 backdrop-blur-md">
            <p className="font-semibold">{error}</p>
            <p className="mt-1 text-sm opacity-90">
              Make sure the client backend and admin backend are running.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-24 text-center backdrop-blur-md">
            <h3 className="text-2xl font-black text-white mb-4 italic">The nodes are silent.</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto italic">No raffles available. Check back later.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((raffle) => (
                <RaffleCard
                  key={raffle.id}
                  raffle={raffle}
                  onJoinClick={handleJoinClick}
                  detailHref={`/raffles/${raffle.id}`}
                  drawState={getState(raffle.id)}
                />
              ))}
            </div>

            {total > limit && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-white/10"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-400">
                  Page {page} of {Math.ceil(total / limit)}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-white/10"
                >
                  Next
                </button>
              </div>
            )}

            <div className="mt-24 flex flex-col items-center text-center opacity-60">
              <div className="mb-4 h-px w-24 bg-white/10" />
              <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                More Raffles Incoming Daily
              </p>
            </div>
          </>
        )}
      </div>

      {/* Join Raffle modal */}
      {joinRaffle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={handleJoinClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="join-raffle-title"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="join-raffle-title" className="text-lg font-bold text-white">
                Join raffle
              </h2>
              <button
                type="button"
                onClick={handleJoinClose}
                disabled={joinLoading}
                className="rounded-lg p-1 text-slate-500 hover:bg-white/10 hover:text-white disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-400">{joinRaffle.name}</p>
            <div className="mb-4">
              <label htmlFor="join-quantity" className="mb-1 block text-sm font-semibold text-slate-300">
                Number of tickets
              </label>
              <input
                id="join-quantity"
                type="number"
                min={1}
                max={Math.max(1, joinRaffle.totalTickets - joinRaffle.ticketsSold)}
                value={joinQuantity}
                onChange={(e) => setJoinQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20"
              />
              <p className="mt-1 text-xs text-slate-500">
                {(joinRaffle.ticketPrice * joinQuantity).toFixed(0)} ETB total
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleJoinClose}
                disabled={joinLoading}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleJoinConfirm}
                disabled={joinLoading}
                className="flex-1 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-100 disabled:opacity-50"
              >
                {joinLoading ? "Joining…" : "Join"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
