"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyRaffles, type MyRaffle } from "@/services/raffles.service";
import { useRaffleWebSocketMulti } from "@/hooks/useRaffleWebSocketMulti";
import { GamifiedDrawOverlay } from "@/components/raffles/GamifiedDrawOverlay";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X, Zap } from "lucide-react";

/**
 * Global component mounted in root layout.
 * Listens for draw events on raffles the CURRENT USER has joined,
 * and shows a slide-up toast. The user can then click "Watch Live"
 * to open the GamifiedDrawOverlay.
 */
export function DrawToastNotification() {
    const { user } = useAuth();
    const [raffles, setRaffles] = useState<MyRaffle[]>([]);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());
    const [watchingId, setWatchingId] = useState<string | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const load = useCallback(() => {
        if (!user) return;
        getMyRaffles()
            .then((data) => setRaffles(data.raffles))
            .catch(() => { /* Silent fail for background polling */ });
    }, [user]);

    useEffect(() => {
        if (!user) { setRaffles([]); return; }
        load();
        // Poll every 30s so we catch newly-locked raffles
        pollRef.current = setInterval(load, 30_000);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [user, load]);

    const raffleIds = useMemo(() => raffles.map((r) => r.raffleId), [raffles]);
    const { getState } = useRaffleWebSocketMulti(raffleIds);

    // Find the first raffle that is actively in draw state (countdown or spinning)
    const activeToast = useMemo(() => {
        for (const raffle of raffles) {
            if (dismissed.has(raffle.raffleId)) continue;
            const s = getState(raffle.raffleId);
            if (s.countdown !== null || s.isDrawing) {
                return { raffle, state: s };
            }
        }
        return null;
    }, [raffles, getState, dismissed]);

    const watchingState = watchingId ? getState(watchingId) : null;
    const watchingRaffle = raffles.find((r) => r.raffleId === watchingId);

    if (!user) return null;

    return (
        <>
            {/* Slide-up toast */}
            <AnimatePresence>
                {activeToast && !watchingId && (
                    <motion.div
                        key={activeToast.raffle.raffleId}
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-6 right-6 z-[9000] w-80 rounded-2xl border border-amber-200 bg-white p-4 shadow-2xl"
                        role="alert"
                    >
                        {/* Pulsing accent bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-amber-500 animate-pulse" />

                        <div className="pl-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-amber-600" />
                                    <span className="text-xs font-black uppercase tracking-widest text-amber-600">
                                        Draw Starting!
                                    </span>
                                </div>
                                <button
                                    onClick={() => setDismissed((d) => new Set(d).add(activeToast.raffle.raffleId))}
                                    className="text-slate-400 hover:text-slate-900 transition-colors"
                                    aria-label="Dismiss"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <p className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">
                                {activeToast.raffle.raffleName}
                            </p>

                            <p className="text-xs text-slate-500 mb-4">
                                {activeToast.state.countdown !== null
                                    ? `Draw begins in ${activeToast.state.countdown} second${activeToast.state.countdown !== 1 ? "s" : ""}`
                                    : "The draw is happening right now!"}
                            </p>

                            <button
                                onClick={() => setWatchingId(activeToast.raffle.raffleId)}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-white hover:bg-amber-600 transition-all active:scale-95 shadow-lg shadow-amber-200"
                            >
                                <Eye className="h-3.5 w-3.5" />
                                Watch Live
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Full-screen draw overlay */}
            {watchingId && watchingState && watchingRaffle && (
                <GamifiedDrawOverlay
                    isOpen={true}
                    raffleName={watchingRaffle.raffleName}
                    drawState={watchingState}
                    segments={watchingState.segments}
                    winnerSectorIndex={watchingState.winnerSectorIndex}
                    onClose={() => setWatchingId(null)}
                />
            )}
        </>
    );
}
