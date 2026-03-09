"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-brand-blue pt-32 pb-24">
      
      {/* radial light effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.35)_0%,rgba(45,159,246,1)_65%)]" />

      <div className="relative container mx-auto max-w-7xl px-6">

        <div className="flex flex-col items-center text-center">

          {/* headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight"
          >
            Win Big,{" "}
            <span className="text-brand-yellow">
              Play Fair.
            </span>
          </motion.h1>

          {/* sub text */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-lg text-blue-100 max-w-xl"
          >
            Participate in the Smart Raffle Platform
          </motion.p>

          {/* CTA buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex gap-4 mt-8"
          >
            <Link
              href="/raffles"
              className="bg-white text-brand-blue font-semibold px-6 py-3 rounded-lg shadow hover:scale-105 transition"
            >
              View Raffles
            </Link>

            <Link
              href={process.env.NEXT_PUBLIC_AGENT_SIGNUP_URL || "/agent/signup"}
              className="border border-white text-white px-6 py-3 rounded-lg hover:bg-white/10 transition flex items-center gap-2"
            >
              Become an Agent
              <ArrowRight size={18} />
            </Link>
          </motion.div>

        </div>

        {/* product images */}
        <div className="pointer-events-none mt-12 relative h-[300px] lg:h-0">

          {/* left product */}
          <motion.img
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            src="/images/watch.png"
            className="static lg:absolute lg:left-0 lg:bottom-0 w-[200px] lg:w-[260px] mx-auto lg:mx-0 block"
            alt="watch"
          />

          {/* right product */}
          <motion.img
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            src="/images/device.png"
            className="static lg:absolute lg:right-0 lg:bottom-0 w-[260px] lg:w-[320px] mx-auto lg:mx-0 hidden lg:block"
            alt="device"
          />

        </div>

      </div>
    </section>
  );
};