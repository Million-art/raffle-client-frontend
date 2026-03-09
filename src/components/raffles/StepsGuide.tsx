"use client";

import React from "react";
import { Search, Ticket, Sparkles, Trophy } from "lucide-react";

export function StepsGuide() {
  const steps = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Choose Raffle",
      desc: "Explore active draws and high-value prizes from verified agents.",
    },
    {
      icon: <Ticket className="h-6 w-6" />,
      title: "Buy Tickets",
      desc: "Select your lucky count and pay securely via Chapa or Telebirr.",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Watch Reveal",
      desc: "Experience the draw live with our interactive digital container reveal.",
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Claim Prize",
      desc: "If you win, we'll notify you instantly to claim or deliver your prize.",
    },
  ];

  return (
    <div className="py-12">
      <h2 className="text-2xl font-black text-white mb-8 text-center">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((step, i) => (
          <div key={i} className="relative group">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 relative">
                <div className="h-16 w-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
                  {step.icon}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-16 w-full h-[2px] bg-gradient-to-r from-primary-500/20 to-transparent" />
                )}
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                  {i + 1}
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
