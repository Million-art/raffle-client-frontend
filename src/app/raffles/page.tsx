"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RaffleCard } from "@/components/raffles/RaffleCard";
import { useRaffles } from "@/hooks/useRaffles";
import { useAuth } from "@/contexts/AuthContext";
import type { RaffleListItem } from "@/services/raffles.service";
import { Loader2 } from "lucide-react";

const LIMIT = 20;

export default function RafflesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const { items, total, isLoading, isError, error, refetch } = useRaffles({
    page,
    limit: LIMIT,
    liveOnly: false,
  });

  const [flash, setFlash] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleJoinClick = (raffle: RaffleListItem) => {
    if (!user) {
      router.push(`/login?redirect=/raffles/${raffle.id}`);
      return;
    }
    router.push(`/raffles/${raffle.id}`);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <main className="min-h-screen border-t border-slate-200 bg-slate-50 pt-8 pb-24 relative overflow-hidden">
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

        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl animate-pulse" />
              <Loader2 className="h-10 w-10 animate-spin text-primary-500 relative" />
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 backdrop-blur-md">
            <p className="font-semibold">{error?.message ?? "Could not load raffles"}</p>
            <p className="mt-1 text-sm opacity-90">
              Make sure the client backend and admin backend are running.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Retry
            </button>
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

            {total > LIMIT && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50 hover:bg-slate-100"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
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
    </main>
  );
}
