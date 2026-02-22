"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getConfirmation, confirmPrize, type MyRaffle } from "@/services/raffles.service";
import { motion } from "framer-motion";
import { Trophy, CheckCircle2, Ticket, Star, AlertTriangle, Loader2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export default function ConfirmPrizePage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [raffle, setRaffle] = useState<MyRaffle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirming, setConfirming] = useState(false);

    const [confData, setConfData] = useState({
        prizeReceived: true,
        prizeMatches: true,
        rating: 5,
        feedback: ""
    });

    const [confirmed, setConfirmed] = useState(false);

    const load = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await getConfirmation(id as string);
            setRaffle(data);
            if (data.confirmationStatus && data.confirmationStatus !== 'pending') {
                setConfirmed(true);
            }
        } catch (err) {
            setError("Confirmation link is invalid or expired.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/login?from=/confirm-prize/${id}`);
            return;
        }
        if (user) load();
    }, [user, authLoading, id, load, router]);

    const handleConfirm = async () => {
        if (!id) return;
        setConfirming(true);
        try {
            await confirmPrize(id as string, confData);
            router.push("/my-raffles?confirmed=true");
        } catch (err) {
            toast.error("Failed to confirm prize receipt. Please try again.");
            console.error(err);
        } finally {
            setConfirming(false);
        }
    };

    if (authLoading || loading) {
        return (
            <main className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
                <div className="max-w-md">
                    <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-white mb-4">{error}</h2>
                    <button
                        onClick={() => router.push("/my-raffles")}
                        className="inline-flex items-center gap-2 text-primary-400 font-bold hover:text-primary-300 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Go to My Raffles
                    </button>
                </div>
            </main>
        );
    }

    if (confirmed) {
        return (
            <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] p-12 shadow-2xl"
                >
                    <div className="h-20 w-20 bg-green-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="h-10 w-10 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4">Prize Confirmed!</h2>
                    <p className="text-slate-400 font-medium mb-10">You have already confirmed receipt of the prize for <span className="text-primary-400">"{raffle?.raffleName}"</span>.</p>
                    <button
                        onClick={() => router.push("/my-raffles")}
                        className="inline-flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-8 py-4 text-sm font-black text-white hover:bg-white/10 transition-all"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Go to My Activity
                    </button>
                </motion.div>
            </main>
        );
    }

    if (!raffle) return null;

    return (
        <main className="min-h-screen bg-slate-950 pt-16 pb-24 px-4 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] bg-primary-600/5 blur-[120px] pointer-events-none" />

            <div className="container relative z-10 mx-auto max-w-lg">
                <button
                    onClick={() => router.push("/my-raffles")}
                    className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors group"
                >
                    <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold">Back to My Raffles</span>
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
                >
                    <div className="text-center mb-10">
                        <div className="h-20 w-20 bg-amber-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <Trophy className="h-10 w-10 text-amber-400" />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2">Claim Your Prize</h1>
                        <p className="text-slate-400 font-medium">
                            Confirm receipt for: <span className="text-primary-400">"{raffle.raffleName}"</span>
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* Questions */}
                        <div className="space-y-4">
                            <label className="flex items-center justify-between gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-all">
                                <div className="flex items-center gap-4">
                                    <CheckCircle2 className={`h-6 w-6 ${confData.prizeReceived ? 'text-primary-500' : 'text-slate-500'}`} />
                                    <span className="text-sm font-bold text-slate-200">Did you receive the prize?</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={confData.prizeReceived}
                                    onChange={(e) => setConfData(d => ({ ...d, prizeReceived: e.target.checked }))}
                                    className="h-6 w-6 rounded-lg bg-white/5 border-white/10 text-primary-500 focus:ring-primary-500"
                                />
                            </label>

                            <label className="flex items-center justify-between gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-all">
                                <div className="flex items-center gap-4">
                                    <Ticket className={`h-6 w-6 ${confData.prizeMatches ? 'text-primary-500' : 'text-slate-500'}`} />
                                    <span className="text-sm font-bold text-slate-200">Does it match the description?</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={confData.prizeMatches}
                                    onChange={(e) => setConfData(d => ({ ...d, prizeMatches: e.target.checked }))}
                                    className="h-6 w-6 rounded-lg bg-white/5 border-white/10 text-primary-500 focus:ring-primary-500"
                                />
                            </label>
                        </div>

                        {/* Rating */}
                        <div>
                            <label className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 block">Overall Satisfaction</label>
                            <div className="flex items-center justify-center gap-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setConfData(d => ({ ...d, rating: star }))}
                                        className="p-1 transition-all hover:scale-125 hover:-translate-y-1"
                                    >
                                        <Star className={`h-10 w-10 ${confData.rating >= star ? "text-amber-400 fill-amber-400" : "text-slate-700"}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Feedback */}
                        <div>
                            <label className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 block">Experience Feedback</label>
                            <textarea
                                value={confData.feedback}
                                onChange={(e) => setConfData(d => ({ ...d, feedback: e.target.value }))}
                                placeholder="Share your experience with the delivery and product..."
                                className="w-full h-32 rounded-3xl bg-white/5 border border-white/10 p-5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 transition-all resize-none shadow-inner"
                            />
                        </div>

                        {!confData.prizeReceived && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="flex items-start gap-4 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 shadow-lg shadow-red-500/5"
                            >
                                <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0" />
                                <p className="text-xs text-red-400 leading-relaxed font-bold">
                                    Heads up! Marking the prize as not received triggers an automatic investigation into the agent's account. Our team will contact you shortly.
                                </p>
                            </motion.div>
                        )}

                        <button
                            onClick={handleConfirm}
                            disabled={confirming}
                            className="w-full rounded-[1.5rem] bg-gradient-to-r from-primary-600 to-primary-500 py-5 text-sm font-black text-white hover:from-primary-500 hover:to-primary-400 disabled:opacity-50 transition-all shadow-xl shadow-primary-600/25 flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {confirming ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle2 className="h-5 w-5" />
                                    Complete Confirmation
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
