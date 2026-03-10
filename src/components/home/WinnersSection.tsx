"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ShieldCheck, Ticket } from 'lucide-react';

const STATIC_WINNERS = [
  { id: '1', name: 'Abebe B.', amount: '2,500 ETB', raffle: 'Quick Draw #42', date: '2 hours ago' },
  { id: '2', name: 'Sara K.', amount: '10,000 ETB', raffle: 'Grand Tech Raffle', date: '5 hours ago' },
  { id: '3', name: 'Mulugeta T.', amount: '500 ETB', raffle: 'Daily Bonus', date: 'Yesterday' },
];

export const WinnersSection = () => {
  return (
    <section className="w-full bg-white py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-slate-200" />
      <div className="absolute bottom-0 left-0 h-[600px] w-[600px] bg-brand-blue/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-brand-blue/10 border border-brand-blue/20 text-brand-blue">
              <Trophy className="h-7 w-7" />
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl leading-[1.05]">
              Real People. <br />
              <span className="text-brand-blue">Verified Fortunes.</span>
            </h2>
            <p className="mt-8 text-xl text-slate-600 leading-relaxed font-medium">
              Transparency isn't a feature; it's our core architecture. Every winner identity is authenticated, every payout is immediate, and every record is immutable.
            </p>

            <div className="mt-12 space-y-8">
              <div className="flex items-start gap-5">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue shadow-xl shadow-brand-blue/5">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 tracking-tight">Cryptographic Protocol</h4>
                  <p className="mt-1 text-slate-600 font-medium">Powered by verified, provably fair randomness engines.</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 shadow-xl shadow-blue-500/5">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 tracking-tight">Direct Settlement Layer</h4>
                  <p className="mt-1 text-slate-600 font-medium">Winning tickets trigger immediate asset reservations for winners.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-[-10%] top-[-10%] bottom-[-10%] rounded-[3rem] bg-brand-blue/5 blur-[100px]" />
            <div className="relative space-y-5">
              {STATIC_WINNERS.map((winner, idx) => (
                <motion.div
                  key={winner.id}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  className="flex items-center justify-between rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-brand-blue/30 group"
                >
                  <div className="flex items-center gap-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 border border-slate-200 font-bold text-slate-400 group-hover:text-brand-blue transition-colors">
                      {winner.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 tracking-tight">{winner.name}</p>
                      <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mt-1 group-hover:text-brand-blue transition-colors">{winner.raffle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-brand-blue tracking-tighter">{winner.amount}</p>
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-1.5">{winner.date}</p>
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
