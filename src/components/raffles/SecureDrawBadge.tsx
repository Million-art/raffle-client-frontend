"use client";

import React from "react";
import { ShieldCheck, Info } from "lucide-react";
import { motion } from "framer-motion";

interface SecureDrawBadgeProps {
    className?: string;
    onInfoClick?: () => void;
}

export function SecureDrawBadge({ className = "", onInfoClick }: SecureDrawBadgeProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)] ${className}`}
        >
            <div className="relative flex h-5 w-5 items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-full bg-emerald-400/20"
                />
            </div>

            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/80 leading-none">
                    Secure Draw
                </span>
                <span className="text-[11px] font-bold text-emerald-200 leading-tight">
                    Verified RNG System
                </span>
            </div>

            {onInfoClick && (
                <button
                    type="button"
                    onClick={onInfoClick}
                    className="ml-1 rounded-full p-1 text-emerald-500/50 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors"
                    title="Provably Fair Information"
                >
                    <Info className="h-3.5 w-3.5" />
                </button>
            )}
        </motion.div>
    );
}
