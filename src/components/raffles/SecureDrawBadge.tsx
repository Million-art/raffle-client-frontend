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
            className={`inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 shadow-sm ${className}`}
        >
            <div className="relative flex h-5 w-5 items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-full bg-emerald-500/20"
                />
            </div>

            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/80 leading-none">
                    Secure Draw
                </span>
                <span className="text-[11px] font-bold text-emerald-800 leading-tight">
                    Verified RNG System
                </span>
            </div>

            {onInfoClick && (
                <button
                    type="button"
                    onClick={onInfoClick}
                    className="ml-1 rounded-full p-1 text-emerald-400 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                    title="Provably Fair Information"
                >
                    <Info className="h-3.5 w-3.5" />
                </button>
            )}
        </motion.div>
    );
}
