"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ShieldCheck, Ticket } from 'lucide-react';

const STATIC_WINNERS = [
    { id: '1', name: 'Abebe B.', amount: '$2,500', raffle: 'Quick Draw #42', date: '2 hours ago' },
    { id: '2', name: 'Sara K.', amount: '$10,000', raffle: 'Grand Tech Raffle', date: '5 hours ago' },
    { id: '3', name: 'Mulugeta T.', amount: '$500', raffle: 'Daily Bonus', date: 'Yesterday' },
];

export const WinnersSection = () => {
    return (
        <section className="bg-white py-24">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
                    <div>
                        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-success-50 text-success-600">
                            <Trophy className="h-6 w-6" />
                        </div>
                        <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                            Real People. <br />
                            <span className="text-primary-600">Real Accountability.</span>
                        </h2>
                        <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                            We believe in absolute clarity. Every winner is verified, their winnings are distributed via secure escrow, and the hash of every draw is published to the public ledger for manual audit.
                        </p>
                        
                        <div className="mt-10 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Cryptographic Proof</h4>
                                    <p className="text-sm text-slate-500">All draws are powered by provably fair algorithms.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                                    <Ticket className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Instant Escrow Release</h4>
                                    <p className="text-sm text-slate-500">Winning tickets trigger immediate fund reservation for winners.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 rounded-3xl bg-slate-100/50 blur-3xl" />
                        <div className="relative space-y-4">
                            {STATIC_WINNERS.map((winner, idx) => (
                                <motion.div 
                                    key={winner.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-soft transition-all hover:shadow-medium"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 font-bold text-slate-400">
                                            {winner.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{winner.name}</p>
                                            <p className="text-xs text-slate-400 font-medium">{winner.raffle}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-primary-600">{winner.amount}</p>
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{winner.date}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
