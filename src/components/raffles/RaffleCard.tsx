"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, ArrowRight, Film } from 'lucide-react';

interface RaffleCardProps {
    raffle: {
        id: string;
        name: string;
        description: string;
        ticketPrice: number;
        totalTickets: number;
        ticketsSold: number;
        status?: string;
        videoUrl?: string;
        imageUrl?: string;
        agentName?: string;
    };
    onJoinClick?: (raffle: RaffleCardProps["raffle"]) => void;
    /** If set, card links to this detail page (e.g. /raffles/[id]) */
    detailHref?: string;
}

export const RaffleCard: React.FC<RaffleCardProps> = ({ raffle, onJoinClick, detailHref }) => {
    const router = useRouter();
    const sold = raffle.ticketsSold;
    const progress = raffle.totalTickets > 0
        ? (sold / raffle.totalTickets) * 100
        : 0;

    const handleCardClick = () => {
        if (detailHref) router.push(detailHref);
    };

    const handleJoinClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onJoinClick) onJoinClick(raffle);
        else if (detailHref) router.push(detailHref);
    };

    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className={`group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 transition-all hover:shadow-2xl hover:shadow-primary-100 ${detailHref ? 'cursor-pointer' : ''}`}
            onClick={detailHref ? handleCardClick : undefined}
            onKeyDown={detailHref ? (e) => e.key === 'Enter' && handleCardClick() : undefined}
            role={detailHref ? 'button' : undefined}
            tabIndex={detailHref ? 0 : undefined}
        >
            {/* Media Wrapper - Video or Image */}
            <div className="relative aspect-[16/10] overflow-hidden">
                {raffle.videoUrl ? (
                    <video
                        src={raffle.videoUrl}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        muted
                        loop
                        playsInline
                        autoPlay
                        preload="metadata"
                        poster={raffle.imageUrl}
                    />
                ) : raffle.imageUrl ? (
                    <img
                        src={raffle.imageUrl}
                        alt={raffle.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                        <Film className="h-8 w-8 opacity-20" />
                    </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                    {sold >= raffle.totalTickets && raffle.totalTickets > 0 ? (
                        <div className="flex items-center gap-1.5 rounded-lg bg-slate-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                            Sold Out
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                            <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            Live
                        </div>
                    )}
                </div>

                {raffle.videoUrl && (
                    <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white">
                        <Film className="h-4 w-4" />
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className="flex flex-1 flex-col p-6">
                {/* Agent Meta */}
                <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                        <User className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        {raffle.agentName || "Global Verified"}
                    </span>
                </div>

                {/* Title & Description */}
                <div className="mb-4">
                    <h3 className="mb-2 text-xl font-bold text-slate-900 leading-tight line-clamp-2">
                        {detailHref ? (
                            <span className="hover:text-primary-600 transition-colors">{raffle.name}</span>
                        ) : (
                            raffle.name
                        )}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {raffle.description}
                    </p>
                </div>

                {/* Progress Section */}
                <div className="mt-auto space-y-3 pt-2">
                    <div className="flex items-end justify-between">
                        <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tickets Sold</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-slate-900">{sold}</span>
                                <span className="text-xs text-slate-400">/ {raffle.totalTickets}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Goal</span>
                            <span className="text-sm font-bold text-primary-600">{Math.round(progress)}%</span>
                        </div>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-primary-600 to-primary-400"
                        />
                    </div>

                    {/* Footer / CTA */}
                    <div className="flex items-center justify-between pt-4">
                        <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entry Price</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-slate-900">{raffle.ticketPrice.toFixed(0)}</span>
                                <span className="text-sm font-bold text-slate-400"> ETB</span>
                            </div>
                        </div>
                        {sold >= raffle.totalTickets && raffle.totalTickets > 0 ? (
                            <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-400 px-5 py-3 text-xs font-bold text-white cursor-not-allowed">
                                Sold Out
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleJoinClick}
                                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-200 active:scale-95"
                            >
                                <span>JOIN DRAW</span>
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
