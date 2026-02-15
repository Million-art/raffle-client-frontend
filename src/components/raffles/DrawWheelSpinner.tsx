"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import {
  WheelOfFortune,
  type WheelOfFortuneRef,
  type WheelOfFortunePrize,
} from "@matmachry/react-wheel-of-fortune";

const SEG_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

interface DrawWheelSpinnerProps {
  segments: string[];
  winnerSectorIndex?: number;
  winnerName?: string;
  prizeName?: string;
}

function PointerIcon() {
  return (
    <div className="absolute -top-2 left-1/2 z-30 -translate-x-1/2">
      <div className="h-0 w-0 border-l-[16px] border-r-[16px] border-t-[28px] border-l-transparent border-r-transparent border-t-amber-400 drop-shadow-lg" />
    </div>
  );
}

export function DrawWheelSpinner({
  segments,
  winnerSectorIndex,
  winnerName = "Winner",
  prizeName = "Prize",
}: DrawWheelSpinnerProps) {
  const wheelRef = useRef<WheelOfFortuneRef>(null);
  const [phase, setPhase] = useState<"spinning" | "reveal">("spinning");
  const [hasSpun, setHasSpun] = useState(false);

  const isLanding = typeof winnerSectorIndex === "number";

  const prizes: WheelOfFortunePrize[] = segments.map((name, i) => ({
    key: `seg-${i}`,
    prize: name.length > 8 ? name.slice(0, 6) + "…" : name,
    color: SEG_COLORS[i % SEG_COLORS.length],
  }));

  const defaultWinnerKey = isLanding ? `seg-${winnerSectorIndex}` : undefined;

  useEffect(() => {
    if (isLanding && segments.length > 0 && !hasSpun) {
      const t = setTimeout(() => {
        wheelRef.current?.spin();
        setHasSpun(true);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [isLanding, hasSpun, segments.length]);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400">
        {isLanding ? "Spin the wheel" : "Spinning in realtime for all participants…"}
      </p>

      <div className="relative flex justify-center">
        {isLanding && segments.length > 0 ? (
          <div className="relative" style={{ width: 320, height: 320 }}>
            <WheelOfFortune
              ref={wheelRef}
              prizes={prizes}
              defaultWinnerKey={defaultWinnerKey}
              wheelPointer={<PointerIcon />}
              wheelSpinButton={
                <button
                  type="button"
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-6 py-2 text-sm font-bold text-slate-950 opacity-0 pointer-events-none"
                  aria-hidden
                >
                  Spin
                </button>
              }
              onSpinStart={() => setPhase("spinning")}
              onSpinEnd={() => {
                setPhase("reveal");
              }}
              animationDurationInMs={5000}
              wheelRotationsCount={5}
              useProbabilitiesToCalculateWinner={false}
              wheelBorderColor="#f59e0b"
              className="[&_svg]:max-w-[320px] [&_svg]:max-h-[320px]"
            />
          </div>
        ) : (
          <div className="relative">
            <PointerIcon />
            <SimpleSpinningWheel segments={segments} />
          </div>
        )}
      </div>

      {phase === "reveal" && isLanding && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center gap-3 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-amber-500/20 to-transparent px-8 py-6 shadow-xl"
        >
          <div className="rounded-full bg-amber-500/30 p-3">
            <Trophy className="h-10 w-10 text-amber-400" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Winner
          </p>
          <p className="text-2xl font-black text-white">{winnerName}</p>
          <p className="text-sm font-semibold text-slate-400">{prizeName}</p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-1.5 text-sm font-bold text-emerald-400 border border-emerald-500/30">
            Prize finalized
          </div>
        </motion.div>
      )}
    </div>
  );
}

/** Simple SVG wheel for spinning phase (no winner yet) */
function SimpleSpinningWheel({ segments }: { segments: string[] }) {
  if (segments.length === 0) {
    return (
      <div className="flex h-[320px] w-[320px] items-center justify-center rounded-full border-4 border-amber-500/50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500/30 border-t-amber-400" />
      </div>
    );
  }

  const n = segments.length;
  const segmentAngle = 360 / n;

  return (
    <div className="relative h-[320px] w-[320px] overflow-hidden rounded-full border-4 border-amber-500/50 shadow-2xl shadow-amber-500/20">
      <div className="h-full w-full animate-spin">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {segments.map((name, i) => {
            const startAngle = i * segmentAngle;
            const color = SEG_COLORS[i % SEG_COLORS.length];
            const rad = (angle: number) => (angle * Math.PI) / 180;
            const x1 = 50 + 50 * Math.sin(rad(startAngle));
            const y1 = 50 - 50 * Math.cos(rad(startAngle));
            const x2 = 50 + 50 * Math.sin(rad(startAngle + segmentAngle));
            const y2 = 50 - 50 * Math.cos(rad(startAngle + segmentAngle));
            const midAngle = startAngle + segmentAngle / 2;
            const textR = 35;
            const tx = 50 + textR * Math.sin(rad(midAngle));
            const ty = 50 - textR * Math.cos(rad(midAngle));
            const largeArc = segmentAngle > 180 ? 1 : 0;
            const path = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;

            return (
              <g key={i}>
                <path
                  d={path}
                  fill={color}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="0.5"
                />
                <text
                  x={tx}
                  y={ty}
                  fill="white"
                  fontSize="3.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
                  transform={`rotate(${midAngle}, ${tx}, ${ty})`}
                >
                  {name.length > 8 ? name.slice(0, 6) + "…" : name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
