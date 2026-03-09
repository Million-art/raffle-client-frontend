"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getMyRaffles, type MyRaffle } from "@/services/raffles.service";
import { useRaffleWebSocketMulti } from "@/hooks/useRaffleWebSocketMulti";
import { GamifiedDrawOverlay } from "@/components/raffles/GamifiedDrawOverlay";
import { motion } from "framer-motion";
import { Trophy, Ticket, Clock, Loader2, RefreshCw, Eye, ChevronRight, CheckCircle2, AlertTriangle, Star, MessageSquare } from "lucide-react";
import { confirmPrize } from "@/services/raffles.service";

export default function MyRafflesPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [raffles, setRaffles] = useState<MyRaffle[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Draw overlay state — which raffle is the user watching live
    const [watchingRaffleId, setWatchingRaffleId] = useState<string | null>(null);

    // Filtering and Pagination
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "won" | "completed">("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Confirmation Modal State
    const [confirmingRaffle, setConfirmingRaffle] = useState<MyRaffle | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [confData, setConfData] = useState({
        prizeReceived: true,
        prizeMatches: true,
        rating: 5,
        feedback: ""
    });

    const load = useCallback(() => {
        setLoading(true);
        getMyRaffles({
            status: statusFilter !== "all" ? statusFilter : undefined,
            page: currentPage,
            limit: itemsPerPage
        })
            .then((data) => {
                setRaffles(data.raffles);
                setTotal(data.total);
            })
            .catch(() => setError("Could not load your raffles. Please try again."))
            .finally(() => setLoading(false));
    }, [statusFilter, currentPage, itemsPerPage]);

    const handleConfirm = async () => {
        if (!confirmingRaffle?.confirmationId) return;
        setConfirming(true);
        try {
            await confirmPrize(confirmingRaffle.confirmationId, confData);
            setConfirmingRaffle(null);
            load();
        } catch (err) {
            alert("Failed to confirm. Please try again.");
        } finally {
            setConfirming(false);
        }
    };

    // Redirect unauthenticated users
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login?from=/my-raffles");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) load();
    }, [user, load]);

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter]);

    // Subscribe to all raffle IDs the user has joined
    const raffleIds = useMemo(() => raffles.map((r) => r.raffleId), [raffles]);
    const { getState } = useRaffleWebSocketMulti(raffleIds);

    // Find any raffle currently in draw state to offer "Watch Live"
    const inDrawRaffles = useMemo(() =>
        raffles.filter((r) => {
            const s = getState(r.raffleId);
            return s.countdown !== null || s.isDrawing;
        }),
        [raffles, getState]
    );

    // Sorted raffles: Live > Active > Executed (Won > lost)
    const sortedRaffles = useMemo(() => {
        return [...raffles].sort((a, b) => {
            const stateA = getState(a.raffleId);
            const stateB = getState(b.raffleId);

            const isLiveA = stateA.countdown !== null || stateA.isDrawing;
            const isLiveB = stateB.countdown !== null || stateB.isDrawing;

            // 1. Live draws always first
            if (isLiveA && !isLiveB) return -1;
            if (!isLiveA && isLiveB) return 1;

            // 2. Fallback to joinedAt (Latest first)
            const timeA = new Date(a.joinedAt).getTime();
            const timeB = new Date(b.joinedAt).getTime();

            if (timeA !== timeB) return timeB - timeA;

            return a.raffleId.localeCompare(b.raffleId);
        });
    }, [raffles, getState]);

    const watchingState = watchingRaffleId ? getState(watchingRaffleId) : null;
    const watchingRaffle = raffles.find((r) => r.raffleId === watchingRaffleId);

    if (authLoading || (loading && !raffles.length)) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
                    <p className="text-slate-500 text-sm font-medium animate-pulse">Loading your raffles…</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 pt-8 pb-24 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] bg-primary-600/5 blur-[120px] pointer-events-none" />

            <div className="container relative z-10 mx-auto max-w-5xl px-4">
                {/* Header */}
                <div className="mb-10 flex items-start justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 border border-primary-200 px-3 py-1 mb-4">
                            <Ticket className="h-3.5 w-3.5 text-primary-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600">My Activity</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">My Raffles</h1>
                        <p className="mt-2 text-slate-600 font-medium">All the draws you&apos;ve entered, live and past.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                            {(["all", "active", "won", "completed"] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${statusFilter === s
                                        ? "bg-primary-600 text-white shadow-md"
                                        : "text-slate-500 hover:text-slate-800"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={load}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm text-slate-600 hover:bg-slate-50 transition-all"
                            title="Refresh"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                </div>

                {/* Live Draw Alert Banner */}
                {inDrawRaffles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                            <p className="text-sm font-bold text-amber-300">
                                {inDrawRaffles.length === 1
                                    ? `"${inDrawRaffles[0].raffleName}" draw is live!`
                                    : `${inDrawRaffles.length} draws are live right now!`}
                            </p>
                        </div>
                        <button
                            onClick={() => setWatchingRaffleId(inDrawRaffles[0].raffleId)}
                            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-900 hover:bg-amber-400 transition-all"
                        >
                            <Eye className="h-3.5 w-3.5" />
                            Watch Live
                        </button>
                    </motion.div>
                )}

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
                )}

                {raffles.length === 0 && !loading ? (
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-24 text-center shadow-xl">
                        <Ticket className="h-12 w-12 mx-auto mb-6 text-slate-400" />
                        <h3 className="text-2xl font-black text-slate-900 mb-3">No raffles yet</h3>
                        <p className="text-slate-500 font-medium mb-8">Join a raffle and your entries will appear here.</p>
                        <button
                            onClick={() => router.push("/raffles")}
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-black text-white hover:bg-primary-500 transition-all"
                        >
                            Explore Raffles
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedRaffles.map((raffle) => {
                            const wsState = getState(raffle.raffleId);
                            const isLive = wsState.countdown !== null || wsState.isDrawing;
                            const effectiveStatus = wsState.status === "executed" ? "executed" : raffle.status;
                            const winnerName = wsState.winnerName || raffle.winnerName;
                            const progress = raffle.totalTickets > 0
                                ? Math.min(100, (raffle.ticketsSold / raffle.totalTickets) * 100)
                                : 0;

                            return (
                                <motion.div
                                    key={raffle.raffleId}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col sm:flex-row sm:items-center gap-5 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                >
                                    {/* Live pulsing border */}
                                    {isLive && (
                                        <div className="absolute inset-0 rounded-2xl border border-amber-500/40 animate-pulse pointer-events-none" />
                                    )}

                                    {/* Status icon */}
                                    <div className={`flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl ${effectiveStatus === "executed"
                                        ? (wsState.winnerId || raffle.winnerId) === user?.id
                                            ? "bg-amber-100"
                                            : "bg-slate-100"
                                        : isLive
                                            ? "bg-amber-50"
                                            : "bg-primary-50"
                                        }`}>
                                        {effectiveStatus === "executed" ? (
                                            <Trophy className={`h-6 w-6 ${(wsState.winnerId || raffle.winnerId) === user?.id ? "text-amber-500" : "text-slate-400"}`} />
                                        ) : isLive ? (
                                            <div className="h-3 w-3 rounded-full bg-amber-500 animate-ping" />
                                        ) : (
                                            <Ticket className="h-6 w-6 text-primary-500" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-3 flex-wrap mb-2">
                                            <h3 className="text-base font-black text-slate-900 truncate">{raffle.raffleName}</h3>
                                            {/* Status badge */}
                                            {effectiveStatus === "executed" ? (
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${(wsState.winnerId || raffle.winnerId) === user?.id
                                                    ? "bg-amber-100 text-amber-600"
                                                    : "bg-slate-100 text-slate-500"
                                                    }`}>
                                                    {(wsState.winnerId || raffle.winnerId) === user?.id ? "🏆 Won!" : "Completed"}
                                                </span>
                                            ) : isLive ? (
                                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 flex items-center gap-1">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                                                    {wsState.countdown !== null ? `Draw in ${wsState.countdown}s` : "Draw in progress"}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary-50 text-primary-600">
                                                    Active
                                                </span>
                                            )}
                                        </div>

                                        {/* Winner line */}
                                        {effectiveStatus === "executed" && winnerName && (
                                            <p className={`text-sm font-medium mb-2 ${(wsState.winnerId || raffle.winnerId) === user?.id ? "text-amber-600" : "text-slate-500"}`}>
                                                {(wsState.winnerId || raffle.winnerId) === user?.id ? "🎉 Congratulations, you won!" : `Winner: ${winnerName}`}
                                            </p>
                                        )}

                                        {/* Progress bar + stats */}
                                        <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Ticket className="h-3 w-3" />
                                                <strong className="text-slate-700">{raffle.myTickets}</strong> ticket{raffle.myTickets !== 1 ? "s" : ""} held
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {raffle.ticketsSold}/{raffle.totalTickets} sold
                                            </span>
                                            <div className="h-1.5 flex-1 min-w-[80px] max-w-[160px] rounded-full bg-slate-100 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action / Watch Live */}
                                    <div className="flex-shrink-0 flex flex-col gap-2">
                                        {(effectiveStatus === "executed" && (wsState.winnerId || raffle.winnerId) === user?.id && (!raffle.confirmationStatus || raffle.confirmationStatus === "pending")) && (
                                            <button
                                                onClick={() => setConfirmingRaffle(raffle)}
                                                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-slate-900 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                                            >
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Confirm Receipt
                                            </button>
                                        )}
                                        {isLive ? (
                                            <button
                                                onClick={() => setWatchingRaffleId(raffle.raffleId)}
                                                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-slate-900 hover:bg-amber-400 transition-all"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                Watch Live
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => router.push(`/raffles/${raffle.raffleId}?from=my-raffles`)}
                                                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white shadow-sm px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                                            >
                                                View Raffle
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {total > itemsPerPage && (
                    <div className="mt-12 flex items-center justify-center gap-4">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || loading}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm disabled:opacity-40 hover:bg-slate-50 transition-all"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-medium text-slate-500">
                            Page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{Math.ceil(total / itemsPerPage)}</span>
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => p + 1)}
                            disabled={currentPage >= Math.ceil(total / itemsPerPage) || loading}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm disabled:opacity-40 hover:bg-slate-50 transition-all"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {confirmingRaffle && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md bg-white border border-slate-200 rounded-[2rem] p-8 shadow-2xl"
                    >
                        <div className="text-center mb-8">
                            <div className="h-16 w-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Trophy className="h-8 w-8 text-amber-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Confirm Prize Receipt</h3>
                            <p className="text-slate-500 mt-2 font-medium">For raffle: <span className="text-primary-600">"{confirmingRaffle.raffleName}"</span></p>
                        </div>

                        <div className="space-y-6">
                            {/* Questions */}
                            <div className="space-y-4">
                                <label className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-slate-500" />
                                        <span className="text-sm font-semibold text-slate-700">Did you receive the prize?</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={confData.prizeReceived}
                                        onChange={(e) => setConfData(d => ({ ...d, prizeReceived: e.target.checked }))}
                                        className="h-5 w-5 rounded-lg bg-white border-slate-300 text-primary-600 focus:ring-primary-500"
                                    />
                                </label>

                                <label className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all">
                                    <div className="flex items-center gap-3">
                                        <Ticket className="h-5 w-5 text-slate-500" />
                                        <span className="text-sm font-semibold text-slate-700">Does it match the description?</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={confData.prizeMatches}
                                        onChange={(e) => setConfData(d => ({ ...d, prizeMatches: e.target.checked }))}
                                        className="h-5 w-5 rounded-lg bg-white border-slate-300 text-primary-600 focus:ring-primary-500"
                                    />
                                </label>
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-3 block">Overall Satisfaction</label>
                                <div className="flex items-center justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setConfData(d => ({ ...d, rating: star }))}
                                            className="p-1 transition-all hover:scale-110"
                                        >
                                            <Star className={`h-8 w-8 ${confData.rating >= star ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Feedback */}
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-3 block">Comments & Feedback</label>
                                <textarea
                                    value={confData.feedback}
                                    onChange={(e) => setConfData(d => ({ ...d, feedback: e.target.value }))}
                                    placeholder="Tell us about your experience..."
                                    className="w-full h-24 rounded-2xl bg-white border border-slate-300 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                                />
                            </div>

                            {!confData.prizeReceived && (
                                <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200">
                                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                    <p className="text-xs text-red-600 leading-relaxed font-medium">
                                        Reporting prize as not received will alert our compliance team immediately to investigate the agent.
                                    </p>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setConfirmingRaffle(null)}
                                    className="flex-1 rounded-2xl border border-slate-200 bg-white py-4 text-sm font-black text-slate-700 hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={confirming}
                                    className="flex-1 rounded-2xl bg-primary-600 py-4 text-sm font-black text-white hover:bg-primary-500 disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2"
                                >
                                    {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Confirmation"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Full-screen draw overlay — only shown when user clicks "Watch Live" */}
            {watchingRaffleId && watchingState && watchingRaffle && (
                <GamifiedDrawOverlay
                    isOpen={true}
                    raffleName={watchingRaffle.raffleName}
                    drawState={watchingState}
                    segments={watchingState.segments}
                    winnerSectorIndex={watchingState.winnerSectorIndex}
                    onClose={() => {
                        setWatchingRaffleId(null);
                        load(); // Refresh to get updated winner
                    }}
                />
            )}
        </main>
    );
}
