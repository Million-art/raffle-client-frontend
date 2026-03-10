"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RaffleCard } from "@/components/raffles/RaffleCard";
import { getRaffles, purchaseTickets } from "@/services/raffles.service";
import type { RaffleListItem } from "@/services/raffles.service";
import { useAuth } from "@/contexts/AuthContext";
import { useRaffleListUpdates } from "@/hooks/useRaffleListUpdates";
import { Loader2, X } from "lucide-react";

export default function RafflesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [items, setItems] = useState<RaffleListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const requestId = useRef(0);

  const [joinRaffle, setJoinRaffle] = useState<RaffleListItem | null>(null);
  const [joinQuantity, setJoinQuantity] = useState(1);
  const [joinLoading, setJoinLoading] = useState(false);

  const [flash, setFlash] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadRaffles = useCallback(() => {
    const id = ++requestId.current;

    setLoading(true);

    getRaffles({ page, limit })
      .then((r) => {
        if (id !== requestId.current) return;

        setItems(r.items);
        setTotal(r.total);
      })
      .catch(() => setError("Could not load raffles"))
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, [page]);

  useEffect(() => {
    loadRaffles();
  }, [loadRaffles]);

  useRaffleListUpdates(loadRaffles);

  useEffect(() => {
    if (!flash) return;

    const t = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  const handleJoinClick = useCallback(
    (raffle: RaffleListItem) => {
      if (!user) {
        setFlash({ type: "error", text: "Please log in to join a raffle." });
        router.push("/login?redirect=/raffles");
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
      await purchaseTickets(
        joinRaffle.id,
        joinQuantity,
        undefined,
        user?.fullName,
        user?.email
      );

      setFlash({
        type: "success",
        text: `You joined "${joinRaffle.name}" with ${joinQuantity} ticket(s).`,
      });

      setJoinRaffle(null);
      loadRaffles();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to join raffle";

      setFlash({
        type: "error",
        text: msg,
      });
    } finally {
      setJoinLoading(false);
    }
  }, [joinRaffle, joinQuantity, loadRaffles, user]);

  const handleJoinClose = useCallback(() => {
    if (!joinLoading) setJoinRaffle(null);
  }, [joinLoading]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleJoinClose();
    };

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [handleJoinClose]);

  const handleQuantityChange = useCallback(
    (value: string) => {
      if (!joinRaffle) return;

      const remaining =
        joinRaffle.totalTickets - joinRaffle.ticketsSold;

      const val = Number(value);

      if (Number.isNaN(val)) {
        setJoinQuantity(1);
        return;
      }

      const clamped = Math.max(1, Math.min(val, remaining));

      setJoinQuantity(clamped);
    },
    [joinRaffle]
  );

  return (
    <main className="min-h-screen border-t border-slate-200 bg-slate-50 pt-8 pb-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 h-[500px] w-[500px] bg-primary-600/5 blur-[120px] pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4">
        {flash && (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium backdrop-blur-md ${flash.type === "success"
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
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                Live Infrastructure
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Explore Raffles
            </h1>

            <p className="mt-2 font-medium text-slate-600">
              Browse through verified opportunities and find your next win.
            </p>
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
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 backdrop-blur-md">
            <p className="font-semibold">{error}</p>
            <p className="mt-1 text-sm opacity-90">
              Make sure the client backend and admin backend are running.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-24 text-center shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-4 italic">
              The nodes are silent.
            </h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto italic">
              No raffles available. Check back later.
            </p>
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
                />
              ))}
            </div>

            {total > limit && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setPage((p) => Math.max(1, p - 1))
                  }
                  disabled={page <= 1}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50 hover:bg-slate-100"
                >
                  Previous
                </button>

                <span className="text-sm text-slate-500">
                  Page {page} of {Math.ceil(total / limit)}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((p) =>
                      Math.min(Math.ceil(total / limit), p + 1)
                    )
                  }
                  disabled={page >= Math.ceil(total / limit)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50 hover:bg-slate-100"
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

      {joinRaffle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          onClick={handleJoinClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="join-raffle-title"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="join-raffle-title"
                className="text-lg font-bold text-slate-900"
              >
                Join raffle
              </h2>

              <button
                type="button"
                onClick={handleJoinClose}
                disabled={joinLoading}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-sm text-slate-600">
              {joinRaffle.name}
            </p>

            <div className="mb-4">
              <label
                htmlFor="join-quantity"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                Number of tickets
              </label>

              <input
                id="join-quantity"
                type="number"
                min={1}
                max={
                  joinRaffle.totalTickets -
                  joinRaffle.ticketsSold
                }
                value={joinQuantity}
                onChange={(e) =>
                  handleQuantityChange(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20"
              />

              <p className="mt-1 text-xs text-slate-500">
                {(joinRaffle.ticketPrice * joinQuantity).toLocaleString()} ETB
                total
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
                className="flex-1 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
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