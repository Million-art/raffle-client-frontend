"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Activity, Globe } from 'lucide-react';
import Link from 'next/link';

export const HeroSection = () => {
    return (
        <section className="relative overflow-hidden bg-slate-50 pt-16 pb-24 lg:pt-32 lg:pb-40">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 h-full w-full opacity-[0.4] pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-primary-100 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-blue-50 blur-[120px]" />
            </div>

            <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center">
                    {/* Badge */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8 flex items-center gap-2 rounded-full bg-white px-4 py-1.5 shadow-soft"
                    >
                        <ShieldCheck className="h-4 w-4 text-success-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Regulated & Transparent</span>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
                    >
                        Fair Participation. <br />
                        <span className="text-primary-600">Verified Winnings.</span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-6 max-w-2xl text-lg text-slate-600 lg:text-xl"
                    >
                        Join the most transparent raffle platform where every draw is cryptographically verified and all data is publicly accountable.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6"
                    >
                        <Link 
                            href="/raffles" 
                            className="group flex items-center justify-center gap-2 rounded-full bg-primary-600 px-8 py-4 text-base font-bold text-white shadow-medium transition-all hover:bg-primary-700 hover:shadow-lg active:scale-95"
                        >
                            Browse Raffles
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link 
                            href="/how-it-works" 
                            className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 shadow-soft transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95"
                        >
                            How it Works
                        </Link>
                    </motion.div>

                    {/* Social Proof / Stats */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="mt-20 grid grid-cols-2 gap-8 border-t border-slate-200 pt-12 sm:grid-cols-4 lg:gap-16"
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-slate-900">$1.2M+</span>
                            <span className="text-sm font-medium text-slate-500">Total Prizes</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-slate-900">45k+</span>
                            <span className="text-sm font-medium text-slate-500">Winners</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-slate-900">100%</span>
                            <span className="text-sm font-medium text-slate-500">Verified</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-slate-900">24/7</span>
                            <span className="text-sm font-medium text-slate-500">Support</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
