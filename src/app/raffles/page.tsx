"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RaffleCard } from "@/components/raffles/RaffleCard";
import { getRaffles, purchaseTickets } from "@/services/raffles.service";
import type { RaffleListItem } from "@/services/raffles.service";
import { useAuth } from "@/contexts/AuthContext";
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
    <main className="min-h-screen bg-slate-50 pt-8 pb-24">
      <div className="container mx-auto max-w-7xl px-4">
        {flash && (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${
              flash.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
            role="alert"
          >
            {flash.text}
            <button
              type="button"
              onClick={() => setFlash(null)}
              className="ml-2 underline focus:outline-none"
            >
              Dismiss
            </button>
          </div>
        )}
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Explore Raffles
            </h1>
            <p className="mt-2 font-medium text-slate-500">
              Browse through verified opportunities and find your next win.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or agent..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-50"
              />
            </div>
            <button
              type="button"
              className="flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
            <p className="font-semibold">{error}</p>
            <p className="mt-1 text-sm">
              Make sure the client backend and admin backend are running.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">No raffles available. Check back later.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((raffle) => (
                <RaffleCard key={raffle.id} raffle={raffle} onJoinClick={handleJoinClick} detailHref={`/raffles/${raffle.id}`} />
              ))}
            </div>

            {total > limit && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50 hover:bg-slate-50"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">
                  Page {page} of {Math.ceil(total / limit)}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            )}

            <div className="mt-24 flex flex-col items-center text-center opacity-60">
              <div className="mb-4 h-px w-24 bg-slate-300" />
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleJoinClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="join-raffle-title"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="join-raffle-title" className="text-lg font-bold text-slate-900">
                Join raffle
              </h2>
              <button
                type="button"
                onClick={handleJoinClose}
                disabled={joinLoading}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-600">{joinRaffle.name}</p>
            <div className="mb-4">
              <label htmlFor="join-quantity" className="mb-1 block text-sm font-semibold text-slate-700">
                Number of tickets
              </label>
              <input
                id="join-quantity"
                type="number"
                min={1}
                max={Math.max(1, joinRaffle.totalTickets - joinRaffle.ticketsSold)}
                value={joinQuantity}
                onChange={(e) => setJoinQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
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
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleJoinConfirm}
                disabled={joinLoading}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
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
