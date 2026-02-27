"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getRaffleById, purchaseTickets } from "@/services/raffles.service";
import type { RaffleDetail } from "@/services/raffles.service";
import { useAuth } from "@/contexts/AuthContext";
import { useRaffleWebSocket } from "@/hooks/useRaffleWebSocket";
import { ProductMediaGallery } from "@/components/raffles/ProductMediaGallery";
import { DrawContainerReveal } from "@/components/raffles/DrawContainerReveal";
import { GamifiedDrawOverlay } from "@/components/raffles/GamifiedDrawOverlay";
import { ArrowLeft, Calendar, User, Loader2, X } from "lucide-react";

export default function RaffleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const id = params?.id as string;

  const from = searchParams?.get("from");
  const backHref = from === "my-raffles" ? "/my-raffles" : "/raffles";
  const backLabel = from === "my-raffles" ? "Back to my raffles" : "Back to raffles";

  const [raffle, setRaffle] = useState<RaffleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    ticketsSold: wsTicketsSold,
    status: wsStatus,
    countdown,
    isDrawing,
    winnerId: wsWinnerId,
    winnerName: wsWinnerName,
    wheelData,
  } = useRaffleWebSocket(id);

  const [joinQuantity, setJoinQuantity] = useState(1);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [flash, setFlash] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadRaffle = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRaffleById(id);
      setRaffle(data);
    } catch {
      setError("Raffle not found.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRaffle();
  }, [loadRaffle]);

  // Sync real-time updates from WebSocket
  useEffect(() => {
    if (wsTicketsSold !== null || wsStatus !== null || wsWinnerId !== null || wsWinnerName !== null) {
      setRaffle((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          ticketsSold: wsTicketsSold ?? prev.ticketsSold,
          status: wsStatus ?? prev.status,
          winnerId: wsWinnerId ?? prev.winnerId,
          winnerName: wsWinnerName ?? prev.winnerName,
        };
      });
    }
  }, [wsTicketsSold, wsStatus, wsWinnerId, wsWinnerName]);

  const handleJoinClick = useCallback(() => {
    if (!user) {
      setFlash({ type: "error", text: "Please log in to join this raffle." });
      router.push(`/login?redirect=/raffles/${id}`);
      return;
    }
    setJoinModalOpen(true);
    setJoinQuantity(1);
  }, [user, router, id]);

  const handleJoinConfirm = useCallback(async () => {
    if (!raffle) return;
    setJoinLoading(true);
    setFlash(null);
    try {
      await purchaseTickets(raffle.id, joinQuantity, undefined, user?.fullName, user?.email);
      setFlash({ type: "success", text: `You joined with ${joinQuantity} ticket(s).` });
      setJoinModalOpen(false);
      loadRaffle();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to join raffle";
      setFlash({ type: "error", text: msg });
    } finally {
      setJoinLoading(false);
    }
  }, [raffle, joinQuantity, loadRaffle, user]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 pt-8 pb-24 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl animate-pulse" />
          <Loader2 className="h-10 w-10 animate-spin text-primary-500 relative" />
        </div>
      </main>
    );
  }

  if (error || !raffle) {
    return (
      <main className="min-h-screen bg-slate-950 pt-8 pb-24">
        <div className="container mx-auto max-w-3xl px-4">
          <p className="text-red-400 font-medium">{error ?? "Raffle not found."}</p>
          <Link href={backHref} className="mt-4 inline-flex items-center gap-2 text-primary-400 font-semibold hover:text-primary-300">
            <ArrowLeft className="h-4 w-4" /> {backLabel}
          </Link>
        </div>
      </main>
    );
  }

  const progress = raffle.totalTickets > 0 ? (raffle.ticketsSold / raffle.totalTickets) * 100 : 0;

  return (
    <main className="min-h-screen border-t border-white/5 bg-slate-950 pt-8 pb-24">
      <div className="container mx-auto max-w-4xl px-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </Link>

        {flash && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium backdrop-blur-md ${flash.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/20 bg-red-500/10 text-red-400"
              }`}
            role="alert"
          >
            {flash.text}
            <button type="button" onClick={() => setFlash(null)} className="ml-2 underline">
              Dismiss
            </button>
          </div>
        )}

        <article className="rounded-2xl border border-white/10 bg-slate-900/50 shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Product Media - AliExpress style gallery */}
          <div className="p-4 sm:p-6">
            <ProductMediaGallery raffle={raffle} />
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold">
                <User className="h-4 w-4 text-primary-500" />
                {raffle.agentName ?? "Verified Agent"}
              </span>
              {raffle.startDate && (
                <span className="flex items-center gap-1.5 font-semibold">
                  <Calendar className="h-4 w-4 text-primary-500" />
                  Started: {new Date(raffle.startDate).toLocaleDateString("en-US", { dateStyle: "long" })}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">{raffle.name}</h1>

            {/* Full description */}
            <div className="prose prose-invert max-w-none mb-8">
              <p className="text-slate-400 whitespace-pre-wrap leading-relaxed">
                {raffle.description || "No description provided."}
              </p>
            </div>

            {/* Progress */}
            <div className="mb-8 space-y-2">
              <div className="flex justify-between text-sm font-bold text-slate-300">
                <span>{raffle.ticketsSold} sold</span>
                <span>{raffle.totalTickets} total</span>
              </div>
              <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${isDrawing || countdown !== null ? 'bg-orange-500 animate-pulse' : 'bg-primary-600'
                    }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-right text-xs font-bold text-primary-600">{Math.round(progress)}% filled</p>
            </div>

            {/* Full-screen draw overlay - cannot be closed until draw completes */}
            {/* Gamified Full-Screen Overlay */}
            <GamifiedDrawOverlay
              isOpen={countdown !== null || isDrawing || (raffle.status === 'executed' && !!(wsWinnerName || raffle.winnerName))}
              raffleName={raffle.name}
              drawState={{
                countdown,
                isDrawing,
                status: wsStatus || raffle.status || null,
                winnerId: wsWinnerId || raffle.winnerId,
                winnerName: wsWinnerName || raffle.winnerName,
                ticketsSold: wsTicketsSold ?? raffle.ticketsSold,
              }}
              segments={wheelData?.segments || []}
              winnerSectorIndex={wheelData?.winnerSectorIndex}
              onClose={() => {
                router.push("/raffles");
              }}
            />

            {/* Executed result - inline (startRevealed = no shake, overlay takes precedence when open) */}
            {raffle.status === 'executed' && (raffle.winnerName || wsWinnerName) && (
              <div className="mb-8 rounded-2xl bg-slate-900 p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
                {wheelData ? (
                  <DrawContainerReveal
                    segments={wheelData.segments}
                    winnerSectorIndex={wheelData.winnerSectorIndex}
                    winnerName={wsWinnerName || raffle.winnerName || "Winner"}
                    prizeName={raffle.name}
                    startRevealed
                    muted
                  />
                ) : (
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="bg-primary-500/20 text-primary-400 p-3 rounded-full mb-2">
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1">Winner</h2>
                      <p className="text-2xl font-black text-white break-all">
                        {raffle.winnerName || "Winner"}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-1.5 rounded-full text-sm font-bold border border-green-500/30">
                      Raffle Completed
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Price & CTA */}
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-white/10 ${raffle.status !== 'approved' ? 'opacity-50 grayscale' : ''}`}>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Price per ticket</p>
                <p className="text-2xl font-black text-white">{raffle.ticketPrice.toFixed(0)} ETB</p>
              </div>
              <button
                type="button"
                onClick={handleJoinClick}
                disabled={raffle.status !== 'approved'}
                className="rounded-xl bg-white px-6 py-3 text-base font-bold text-slate-950 hover:bg-slate-100 transition-colors disabled:cursor-not-allowed"
              >
                {raffle.status === 'approved' ? 'Join this raffle' : 'Sold Out / Closed'}
              </button>
            </div>
          </div>
        </article>

      </div>

      {/* Join modal */}
      {joinModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => !joinLoading && setJoinModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Join raffle</h2>
              <button
                type="button"
                onClick={() => !joinLoading && setJoinModalOpen(false)}
                disabled={joinLoading}
                className="rounded-lg p-1 text-slate-500 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-400">{raffle.name}</p>
            <div className="mb-4">
              <label htmlFor="detail-join-quantity" className="mb-1 block text-sm font-semibold text-slate-300">
                Number of tickets
              </label>
              <input
                id="detail-join-quantity"
                type="number"
                min={1}
                max={Math.max(1, raffle.totalTickets - raffle.ticketsSold)}
                value={joinQuantity}
                onChange={(e) => setJoinQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20"
              />
              <p className="mt-1 text-xs text-slate-500">
                {(raffle.ticketPrice * joinQuantity).toFixed(0)} ETB total
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => !joinLoading && setJoinModalOpen(false)}
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
