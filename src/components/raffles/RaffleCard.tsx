"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Ticket, User, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RaffleCardProps {
    raffle: {
        id: string;
        name: string;
        description: string;
        ticketPrice: number;
        totalTickets: number;
        ticketsSold: number;
        endDate: string;
        imageUrl?: string;
        agentName?: string;
    };
}

export const RaffleCard: React.FC<RaffleCardProps> = ({ raffle }) => {
    const progress = (raffle.ticketsSold / raffle.totalTickets) * 100;
    
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-all hover:border-primary-200 hover:shadow-medium"
        >
            {/* Image Wrapper */}
            <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                {raffle.imageUrl ? (
                    <img src={raffle.imageUrl} alt={raffle.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 italic text-slate-400">
                        Visualizing Transparency...
                    </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                    <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-sm border border-slate-100">
                        Live Raffle
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col p-6">
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <User className="h-3 w-3 text-primary-500" />
                        {raffle.agentName || "Verified Agent"}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <Calendar className="h-3 w-3 text-primary-500" />
                        {new Date(raffle.endDate).toLocaleDateString()}
                    </div>
                </div>

                <h3 className="mb-2 text-xl font-bold text-slate-900 line-clamp-1">{raffle.name}</h3>
                <p className="mb-6 text-sm text-slate-500 line-clamp-2 leading-relaxed">{raffle.description}</p>

                {/* Progress Tracking */}
                <div className="mb-6 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{raffle.ticketsSold} Tickets Sold</span>
                        <span>{raffle.totalTickets} Total</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-primary-600 rounded-full"
                        />
                    </div>
                    <div className="text-right text-[10px] font-bold text-primary-600 uppercase">
                        {Math.round(progress)}% Progressed
                    </div>
                </div>

                {/* Footer / CTA */}
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Price / Ticket</p>
                        <p className="text-xl font-black text-slate-900">${raffle.ticketPrice.toFixed(2)}</p>
                    </div>
                    <button className="group flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary-700 active:scale-95 shadow-soft">
                        Join Raffle
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
