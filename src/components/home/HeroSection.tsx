"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Activity, Globe } from 'lucide-react';
import Link from 'next/link';

export const HeroSection = () => {
    return (
        <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden bg-slate-950 pt-20 pb-24 lg:pt-32 lg:pb-40">
            {/* Animated Background Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-primary-600/30 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[20%] left-[10%] h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[100px]" />

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
            </div>

            <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8 flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 backdrop-blur-md shadow-2xl"
                    >
                        <div className="h-2 w-2 rounded-full bg-success-500 animate-ping" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Regulated & Transparent</span>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-5xl text-6xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl leading-[1.05]"
                    >
                        Rethinking Trust. <br />
                        <span className="bg-gradient-to-r from-primary-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Verified Rewards.</span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-8 max-w-2xl text-lg text-slate-400 lg:text-xl font-medium leading-relaxed"
                    >
                        The next generation of participation. Every draw is cryptographically secured, every win is instantly verified, and every record is public.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-12 flex flex-col gap-4 sm:flex-row sm:gap-6"
                    >
                        <Link
                            href="/raffles"
                            className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white px-10 py-5 text-base font-black text-slate-950 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                        >
                            Explore Global Raffles
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            href="/how-it-works"
                            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-10 py-5 text-base font-black text-white backdrop-blur-sm transition-all hover:bg-white/10 active:scale-95"
                        >
                            Transparency Protocol
                        </Link>
                    </motion.div>

                    {/* Social Proof / Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-24 grid grid-cols-2 gap-8 border-t border-white/5 pt-12 sm:grid-cols-4 lg:gap-20"
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-black text-white tracking-tight">$1.2M+</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-2 font-bold">Prizes Distributed</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-black text-white tracking-tight">45k+</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-2 font-bold">Trusted Winners</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-black text-white tracking-tight">100%</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-2 font-bold">On-Chain Audit</span>
                        </div>
                        <div className="flex flex-col items-center border-emerald-500/20 px-4">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <Activity className="h-4 w-4" />
                                <span className="text-4xl font-black tracking-tight">Online</span>
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-2 font-bold">Fairness Engine</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
