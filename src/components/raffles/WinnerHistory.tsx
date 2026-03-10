"use client";

import React from "react";
import { Trophy, Calendar, User, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface Winner {
  id: string;
  name: string;
  prize: string;
  date: string;
  imageUrl?: string;
  agentName?: string;
}

interface WinnerHistoryProps {
  winners?: Winner[];
  title?: string;
}

export function WinnerHistory({ winners, title = "Recent Winners" }: WinnerHistoryProps) {
  // Mock winners if none provided for demonstration
  const displayWinners = winners || [
    {
      id: "1",
      name: "Abebe B.",
      prize: "Toyota Vitz 2023",
      date: "2024-03-01",
      imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=2070&auto=format&fit=crop",
      agentName: "Amana Agent",
    },
    {
      id: "2",
      name: "Sara T.",
      prize: "iPhone 15 Pro Max",
      date: "2024-02-28",
      imageUrl: "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=2070&auto=format&fit=crop",
      agentName: "Global Verified",
    },
    {
      id: "3",
      name: "Mulugeta K.",
      prize: "Smart TV 55 Inch",
      date: "2024-02-25",
      imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=2070&auto=format&fit=crop",
      agentName: "Eagle Agent",
    },
  ];

  return (
    <div className="py-12 border-t border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <Trophy className="h-6 w-6 text-amber-500" />
          {title}
        </h2>
        <button className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors">
          View all history
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayWinners.map((winner, i) => (
          <motion.div
            key={winner.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white hover:border-amber-400 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            {/* Prize Image */}
            <div className="relative h-40 w-full overflow-hidden bg-slate-50 uppercase">
              <img
                src={winner.imageUrl}
                alt={winner.prize}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <span className="text-xs font-black text-amber-600 tracking-widest bg-amber-50 border border-amber-100 px-2 py-1 rounded">
                  WINNER
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                <Calendar className="h-3 w-3" />
                {new Date(winner.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{winner.name}</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-1 font-medium">{winner.prize}</p>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <User className="h-3.5 w-3.5 text-primary-500" />
                  {winner.agentName}
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary-500 group-hover:text-white transition-all cursor-pointer">
                  <Trophy className="h-4 w-4" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
