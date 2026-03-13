"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Ticket, ArrowRight, Loader2, Home, AlertCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { getRaffleById, getPaymentStatus, type RaffleDetail } from "@/services/raffles.service";

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [status, setStatus] = useState<"verifying" | "success" | "pending_long">("verifying");
    const [raffle, setRaffle] = useState<RaffleDetail | null>(null);
    const [loadingRaffle, setLoadingRaffle] = useState(false);
    const [attempts, setAttempts] = useState(0);

    const txRef = searchParams?.get("trx_ref") || searchParams?.get("tx_ref");
    const raffleIdFromUrl = searchParams?.get("raffle_id");

    useEffect(() => {
        // If there's no transaction reference, it's likely the user cancelled 
        // or navigated here manually. Redirect to failed/cancelled page.
        if (!txRef) {
            const timeout = setTimeout(() => {
                router.push(`/payment/failed${raffleIdFromUrl ? `?raffle_id=${raffleIdFromUrl}` : ''}`);
            }, 1500); // Small delay to show the "Verifying" state for a moment
            return () => clearTimeout(timeout);
        }
    }, [txRef, router, raffleIdFromUrl]);

    const verifyPayment = useCallback(async () => {
        if (!txRef) return;

        try {
            const data = await getPaymentStatus(txRef);
            if (data.status === "success") {
                setStatus("success");
                if (data.raffle_id) {
                    fetchRaffle(data.raffle_id);
                } else if (raffleIdFromUrl) {
                    fetchRaffle(raffleIdFromUrl);
                }
            } else {
                // Keep polling
                if (attempts < 10) {
                    setTimeout(() => {
                        setAttempts(prev => prev + 1);
                    }, 2000);
                } else {
                    setStatus("pending_long");
                }
            }
        } catch (err) {
            console.error("Verification error:", err);
            setStatus("pending_long");
        }
    }, [txRef, attempts, raffleIdFromUrl]);

    const fetchRaffle = async (id: string) => {
        setLoadingRaffle(true);
        try {
            const data = await getRaffleById(id);
            setRaffle(data);
        } catch (err) {
            console.error("Raffle fetch error:", err);
        } finally {
            setLoadingRaffle(false);
        }
    };

    useEffect(() => {
        verifyPayment();
    }, [attempts, verifyPayment]);

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] bg-primary-600/5 blur-[120px] pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 text-center relative z-10"
            >
                <div className="mb-8 relative">
                    {status === "verifying" ? (
                        <div className="h-24 w-24 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
                            <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
                        </div>
                    ) : status === "success" ? (
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-24 w-24 bg-green-100 rounded-3xl flex items-center justify-center mx-auto"
                        >
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </motion.div>
                    ) : (
                        <div className="h-24 w-24 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto">
                            <AlertCircle className="h-12 w-12 text-amber-500" />
                        </div>
                    )}
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-2">
                    {status === "verifying" ? "Verifying Payment..." : 
                     status === "success" ? "Payment Successful!" : 
                     "Payment Processing"}
                </h1>
                
                <p className="text-slate-500 font-medium mb-8">
                    {status === "verifying" ? "We're confirming your transaction with Chapa. Please wait..." : 
                     status === "success" ? "Your tickets have been issued and are now in your account." : 
                     "Your payment is taking a bit longer to process. Don't worry, your tickets will appear automatically."}
                </p>

                {loadingRaffle ? (
                    <div className="py-8 flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                    </div>
                ) : raffle ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left"
                    >
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Joined Raffle</h2>
                        <div className="flex items-center gap-4">
                            {raffle.imageUrl ? (
                                <img src={raffle.imageUrl} alt={raffle.name} className="h-14 w-14 rounded-xl object-cover shadow-sm" />
                            ) : (
                                <div className="h-14 w-14 rounded-xl bg-primary-100 flex items-center justify-center">
                                    <Ticket className="h-6 w-6 text-primary-600" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 leading-tight truncate">{raffle.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100 uppercase">
                                        Confirmed
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : null}

                <div className="grid gap-3">
                    {status === "success" ? (
                        <Link
                            href="/my-raffles"
                            className="flex items-center justify-center gap-3 rounded-2xl bg-primary-600 py-4 text-sm font-black text-white hover:bg-primary-500 transition-all shadow-lg shadow-primary-600/20 active:scale-[0.98]"
                        >
                            <Ticket className="h-4 w-4" />
                            View My Tickets
                        </Link>
                    ) : (
                        <Link
                            href={`/payment/failed${raffleIdFromUrl ? `?raffle_id=${raffleIdFromUrl}` : ''}`}
                            className="flex items-center justify-center gap-3 rounded-2xl bg-slate-900 py-4 text-sm font-black text-white hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
                        >
                            <XCircle className="h-4 w-4" />
                            Retry Payment
                        </Link>
                    )}
                    
                    {(raffleIdFromUrl || raffle?.id) && (
                        <Link
                            href={`/raffles/${raffleIdFromUrl || raffle?.id}`}
                            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-4 text-sm font-black text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
                        >
                            Return to Raffle
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    )}

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all mt-2"
                    >
                        <Home className="h-3.5 w-3.5" />
                        Back to Home
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            </main>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}
