"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, Users, Sparkles } from "lucide-react";
import { DrawWheelSpinner } from "./DrawWheelSpinner";
import type { RaffleDrawState } from "@/hooks/useRaffleWebSocketMulti";

// If Portal doesn't exist, we can render directly or create one. 
// For now, I'll use a simple approach using fixed positioning which works well at top level.

interface GamifiedDrawOverlayProps {
    isOpen: boolean;
    raffleName: string;
    drawState: RaffleDrawState;
    segments?: string[];
    winnerSectorIndex?: number;
    onClose: () => void;
}

export function GamifiedDrawOverlay({
    isOpen,
    raffleName,
    drawState,
    segments = [],
    winnerSectorIndex,
    onClose,
}: GamifiedDrawOverlayProps) {
    const [showConfetti, setShowConfetti] = useState(false);

    // Reset internal state when closed
    useEffect(() => {
        if (!isOpen) {
            setShowConfetti(false);
        }
    }, [isOpen]);

    // Trigger confetti when winner is revealed
    useEffect(() => {
        if (drawState.winnerName || drawState.winnerId) {
            setShowConfetti(true);
        }
    }, [drawState.winnerName, drawState.winnerId]);

    if (!isOpen) return null;

    const { countdown, isDrawing, winnerName, winnerId } = drawState;
    const isWinnerRevealed = !!(winnerName || winnerId);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-950/95 backdrop-blur-xl">
            {/* Background Ambient Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary-600/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            <AnimatePresence mode="wait">
                {/* PHASE 1: COUNTDOWN */}
                {countdown !== null && (
                    <motion.div
                        key="countdown"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
                        className="relative z-10 flex flex-col items-center text-center"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], rotate: [0, 2, -2, 0] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="mb-8"
                        >
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 backdrop-blur-md">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75"></span>
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500"></span>
                                </span>
                                <span className="text-xs font-bold uppercase tracking-widest text-primary-300">
                                    Draw Starting In
                                </span>
                            </div>
                        </motion.div>

                        <div className="relative">
                            <span className="text-[12rem] font-black leading-none tabular-nums text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                                {countdown}
                            </span>
                        </div>

                        <h2 className="mt-8 text-2xl font-bold text-slate-300 max-w-lg">
                            {raffleName}
                        </h2>
                    </motion.div>
                )}

                {/* PHASE 2: SPINNING & RESULT */}
                {(isDrawing || isWinnerRevealed) && (
                    <motion.div
                        key="drawing"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 flex w-full max-w-4xl flex-col items-center px-4"
                    >
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <h3 className="text-lg font-medium text-slate-400 mb-2">{raffleName}</h3>
                            <h1 className="text-4xl font-black text-white tracking-tight">
                                {isWinnerRevealed ? "WINNER CONFIRMED" : "DRAW IN PROGRESS"}
                            </h1>
                        </div>

                        {/* The Wheel */}
                        <div className={`transition-all duration-700 ${isWinnerRevealed ? "scale-90 opacity-100" : "scale-110"}`}>
                            <DrawWheelSpinner
                                segments={segments}
                                winnerSectorIndex={winnerSectorIndex}
                                winnerName={winnerName || "Winner"}
                                prizeName={raffleName}
                            />
                        </div>

                        {/* Winner Celebration Overlay (if we want extra pop outside the wheel component) */}
                        {isWinnerRevealed && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, type: "spring" }}
                                className="mt-12 flex flex-col items-center"
                            >
                                <button
                                    onClick={onClose}
                                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-8 py-3 text-sm font-black text-slate-950 transition-transform hover:scale-105 active:scale-95"
                                >
                                    <span className="relative z-10">CLOSE RESULT</span>
                                    <X className="relative z-10 h-4 w-4" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 transition-opacity group-hover:opacity-100" />
                                </button>
                            </motion.div>
                        )}

                        {/* Improved Security Visualization */}
                        {isDrawing && !isWinnerRevealed && (
                            <div className="mt-12 flex flex-col items-center gap-4 w-full max-w-md">
                                <div className="flex items-center gap-3 rounded-full bg-slate-900/50 px-6 py-2 border border-emerald-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-400" />
                                    <span className="text-sm font-bold text-emerald-400 tracking-wide uppercase">Verifying Cryptographic Proof</span>
                                </div>

                                <div className="font-mono text-xs text-slate-500 bg-black/40 px-4 py-2 rounded-lg border border-white/5 w-full text-center overflow-hidden whitespace-nowrap">
                                    <HashAnimation />
                                </div>

                                <div className="flex items-center gap-2 opacity-50">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] uppercase tracking-widest text-slate-400">RaffleHub Secure RNG System</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Simple Confetti Implementation using CSS/DOM if needed, or stick to simple animations */}
            {showConfetti && <ConfettiFX />}
        </div>
    );
}

// Simple CSS-based confetti effect
function ConfettiFX() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[50]">
            {[...Array(50)].map((_, i) => ( // ... existing confetti code ... 
                <motion.div
                    key={i}
                    initial={{
                        top: "-10%",
                        left: `${Math.random() * 100}%`,
                        rotate: 0
                    }}
                    animate={{
                        top: "110%",
                        rotate: 360 * (Math.random() > 0.5 ? 1 : -1)
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        ease: "linear",
                        repeat: Infinity,
                        delay: Math.random() * 2
                    }}
                    className="absolute h-3 w-1.5 rounded-sm"
                    style={{
                        backgroundColor: ["#ef4444", "#eab308", "#22c55e", "#3b82f6", "#ec4899", "#8b5cf6"][Math.floor(Math.random() * 6)]
                    }}
                />
            ))}
        </div>
    );
}

function HashAnimation() {
    const [hash, setHash] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setHash(
                Array.from({ length: 48 }, () =>
                    "0123456789abcdef"[Math.floor(Math.random() * 16)]
                ).join("")
            );
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return <span>0x{hash}</span>;
}
