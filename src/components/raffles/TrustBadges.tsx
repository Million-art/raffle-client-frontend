"use client";

import React from "react";
import { ShieldCheck, Truck, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function TrustBadges() {
  const badges = [
    {
      icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
      title: "Secure Payments",
      desc: "Chapa & Telebirr",
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-blue-400" />,
      title: "Verified Agent",
      desc: "Licensed Operator",
    },
    {
      icon: <Clock className="h-5 w-5 text-amber-400" />,
      title: "Instant Draw",
      desc: "Real-time results",
    },
    {
      icon: <Truck className="h-5 w-5 text-purple-400" />,
      title: "Prize Delivery",
      desc: "Nationwide shipping",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-8 border-y border-white/5">
      {badges.map((badge, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/5 border border-white/5"
        >
          <div className="mb-2 p-2 rounded-full bg-slate-950/50 text-white border border-white/10">
            {badge.icon}
          </div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">{badge.title}</h3>
          <p className="text-[10px] text-slate-500 font-medium">{badge.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
