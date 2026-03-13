"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, ArrowLeft, RefreshCw, Home } from "lucide-react";
import { motion } from "framer-motion";

function PaymentFailedContent() {
    const searchParams = useSearchParams();
    const raffleId = searchParams?.get("raffle_id");

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] bg-red-500/5 blur-[120px] pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 text-center relative z-10"
            >
                <div className="mb-8 relative">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200 }}
                        className="h-24 w-24 bg-red-100 rounded-3xl flex items-center justify-center mx-auto"
                    >
                        <XCircle className="h-12 w-12 text-red-600" />
                    </motion.div>
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-2">Payment Cancelled</h1>
                <p className="text-slate-500 font-medium mb-8">
                    The payment was either cancelled or could not be processed at this time.
                </p>

                <div className="grid gap-3">
                    {raffleId ? (
                        <Link
                            href={`/raffles/${raffleId}`}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-primary-600 py-4 text-sm font-black text-white hover:bg-primary-500 transition-all shadow-lg shadow-primary-600/20"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Return to Raffle & Try Again
                        </Link>
                    ) : (
                        <Link
                            href="/raffles"
                            className="flex items-center justify-center gap-2 rounded-2xl bg-primary-600 py-4 text-sm font-black text-white hover:bg-primary-500 transition-all shadow-lg shadow-primary-600/20"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Raffles
                        </Link>
                    )}

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all"
                    >
                        <Home className="h-3 w-3" />
                        Back to Home
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}

export default function PaymentFailedPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            </main>
        }>
            <PaymentFailedContent />
        </Suspense>
    );
}
