"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Ticket, Users, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { RaffleListItem } from "@/services/raffles.service";

interface Props {
    raffles: RaffleListItem[];
}

const AUTO_PLAY_INTERVAL = 4000; // 4 seconds

export function FeaturedRaffleSection({ raffles }: Props) {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

    const goTo = useCallback((index: number, dir: number) => {
        setDirection(dir);
        setCurrent(index);
    }, []);

    const next = useCallback(() => {
        goTo((current + 1) % raffles.length, 1);
    }, [current, raffles.length, goTo]);

    const prev = useCallback(() => {
        goTo((current - 1 + raffles.length) % raffles.length, -1);
    }, [current, raffles.length, goTo]);

    // Auto-play
    useEffect(() => {
        if (raffles.length <= 1) return;
        const timer = setInterval(next, AUTO_PLAY_INTERVAL);
        return () => clearInterval(timer);
    }, [next, raffles.length]);

    if (!raffles || raffles.length === 0) return null;

    const raffle = raffles[current];
    const progress = raffle.totalTickets > 0
        ? (raffle.ticketsSold / raffle.totalTickets) * 100
        : 0;

    const variants = {
        enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
    };

    return (
        <section className="w-full bg-slate-50 py-24 border-t border-slate-100 overflow-hidden">
            <div className="mx-auto max-w-7xl px-4">

                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block rounded-full bg-brand-blue/10 px-4 py-1.5 text-sm font-semibold text-brand-blue">
                        ★ Featured Raffles
                    </span>
                </div>

                {/* Carousel */}
                <div className="relative">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={raffle.id}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                            className="grid md:grid-cols-2 gap-14 items-center"
                        >
                            {/* Media */}
                            <div className="relative w-full h-[300px] md:h-[420px] rounded-3xl overflow-hidden shadow-xl">
                                {raffle.videoUrl ? (
                                    <video
                                        src={raffle.videoUrl}
                                        className="h-full w-full object-cover"
                                        muted loop playsInline autoPlay
                                        poster={raffle.imageUrl}
                                    />
                                ) : raffle.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={raffle.imageUrl} alt={raffle.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400 text-lg font-semibold">
                                        No image
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                                {/* Slide counter badge */}
                                <div className="absolute bottom-4 left-4 flex items-center gap-1.5">
                                    {raffles.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => goTo(i, i > current ? 1 : -1)}
                                            className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <div>
                                {raffle.agentName && (
                                    <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-500">
                                        <Users className="h-4 w-4 text-brand-blue" />
                                        {raffle.agentName}
                                    </div>
                                )}

                                <h2 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
                                    {raffle.name}
                                </h2>

                                <p className="text-slate-600 mb-6 leading-relaxed text-lg line-clamp-3">
                                    {raffle.description}
                                </p>

                                {/* Progress */}
                                <div className="mb-6">
                                    <div className="flex justify-between text-sm font-semibold text-slate-600 mb-2">
                                        <span>{raffle.ticketsSold} tickets sold</span>
                                        <span>{raffle.totalTickets} total</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-brand-blue rounded-full transition-all duration-700"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="mt-1.5 text-right text-xs font-bold text-brand-blue">
                                        {Math.round(progress)}% filled
                                    </p>
                                </div>

                                {/* Price */}
                                <div className="flex items-center gap-2 text-sm text-slate-600 mb-8">
                                    <Ticket className="h-4 w-4 text-brand-blue" />
                                    <span className="font-bold text-slate-900 text-base">{raffle.ticketPrice} ETB</span>
                                    <span>/ ticket</span>
                                </div>

                                {/* CTA + Nav */}
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <Link
                                        href={`/raffles/${raffle.id}`}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-8 py-4 text-white font-bold hover:bg-blue-600 transition shadow-lg shadow-brand-blue/25"
                                    >
                                        Enter Raffle
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>

                                    {raffles.length > 1 && (
                                        <div className="flex items-center gap-2 ml-auto">
                                            <button
                                                onClick={prev}
                                                className="h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-brand-blue hover:text-brand-blue transition shadow-sm"
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>
                                            <span className="text-sm font-semibold text-slate-500 select-none">
                                                {current + 1} / {raffles.length}
                                            </span>
                                            <button
                                                onClick={next}
                                                className="h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-brand-blue hover:text-brand-blue transition shadow-sm"
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>
        </section>
    );
}