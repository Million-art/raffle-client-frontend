"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDrawSounds } from "@/hooks/useDrawSounds";
import type { DrawSounds } from "@/hooks/useDrawSounds";

const noopSounds: DrawSounds = {
  playShake: () => { },
  stopShake: () => { },
  playLidOpen: () => { },
  playWinner: () => { },
};

interface DrawContainerRevealProps {
  segments: string[];
  winnerSectorIndex?: number;
  winnerName?: string;
  prizeName?: string;
  /** Path to opened container image (e.g. /bottle-open.png) */
  openedContainerSrc?: string;
  /** When true, skip shake/opening and show reveal state immediately (for post-draw summary) */
  startRevealed?: boolean;
  className?: string;
  sounds?: DrawSounds;
  muted?: boolean;
}

type Phase = "idle" | "shaking" | "opening" | "reveal";

export function DrawContainerReveal({
  segments,
  winnerSectorIndex,
  winnerName = "Winner",
  prizeName = "Prize",
  openedContainerSrc = "/bottle-open.png",
  startRevealed = false,
  className,
  sounds: soundsProp,
  muted = false,
}: DrawContainerRevealProps) {
  const soundsHook = useDrawSounds();
  const sounds = muted ? noopSounds : (soundsProp ?? soundsHook);
  // Only transition when we have real winner data (not placeholder) - prevents bottle from shaking forever
  const hasWinner =
    typeof winnerSectorIndex === "number" ||
    (winnerName != null && winnerName !== "" && winnerName !== "Winner");
  const MIN_SHAKE_MS = 3000;
  const [phase, setPhase] = useState<Phase>(() =>
    startRevealed ? "reveal" : "shaking"
  );
  const shakeStartedAtRef = useRef<number | null>(null);
  const winnerHandledRef = useRef(false);

  // Preload opened container so it's ready for smooth crossfade
  useEffect(() => {
    if (openedContainerSrc) {
      const img = new Image();
      img.src = openedContainerSrc;
    }
  }, [openedContainerSrc]);

  // Track shake start time (for minimum duration before reveal)
  useEffect(() => {
    if (startRevealed) return;
    if (phase === "shaking" && shakeStartedAtRef.current === null) {
      shakeStartedAtRef.current = Date.now();
    }
  }, [phase, startRevealed]);

  // Stop shake sound when component unmounts
  useEffect(() => () => sounds.stopShake(), [sounds]);

  // When winner arrives: wait for minimum shake duration, then open and reveal
  useEffect(() => {
    if (startRevealed || !hasWinner || winnerHandledRef.current) return;

    const elapsed = shakeStartedAtRef.current ? Date.now() - shakeStartedAtRef.current : 0;
    const remaining = Math.max(0, MIN_SHAKE_MS - elapsed);

    winnerHandledRef.current = true;

    const t = setTimeout(() => {
      sounds.stopShake();
      sounds.playLidOpen();
      setPhase("opening");
    }, remaining);

    const t2 = setTimeout(() => {
      setPhase("reveal");
      sounds.playWinner();
    }, remaining + 1500);

    return () => {
      // Intentional: Do not clear timeouts on dependency change (sounds)
      // because we only want to handle the winner once.
      // If we unmount completely, React 18+ is safe against state updates.
    };
  }, [hasWinner, sounds, startRevealed]);

  const isShaking = phase === "shaking";
  const isOpening = phase === "opening";
  const isReveal = phase === "reveal";

  const [openedImgError, setOpenedImgError] = React.useState(false);
  const showOpenedContainer = (isOpening || isReveal) && openedContainerSrc && !openedImgError;
  const containerSrc = showOpenedContainer ? openedContainerSrc : "/bottle.png";

  return (

    <div className="relative flex justify-center" style={{ perspective: 1000 }}>
      <motion.div
        className="relative flex flex-col items-center"
        style={{ width: 220, height: 300 }}
        animate={
          isShaking
            ? {
              y: [0, -12, 12, -8, 8, 0],
              rotateX: 0,
              scale: 1,
              transition: { repeat: Infinity, duration: 0.25 },
            }
            : isOpening || isReveal
              ? {
                y: -10,
                rotateX: 15,
                scale: 0.95,
                transition: {
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                },
              }
              : { y: 0, rotateX: 0, scale: 1 }
        }
      >
        {/* Container - closed (shaking) or opened (opening/reveal) */}
        <div className="relative w-[200px] h-[260px] flex-shrink-0">
          <img
            key={showOpenedContainer ? "opened" : "closed"}
            src={containerSrc}
            alt="Draw container"
            onError={() => setOpenedImgError(true)}
            className="h-full w-full object-contain object-bottom drop-shadow-2xl"
            style={{ filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.4))" }}
          />
          {/* Cap overlay - only when closed; animates off when opening (hidden during crossfade) */}
          {!showOpenedContainer && (
            <motion.div
              className="absolute left-1/2 top-[8%] z-10 -translate-x-1/2"
              initial={false}
              animate={
                isOpening
                  ? {
                    y: -120,
                    rotate: -15,
                    opacity: 0.6,
                    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                  }
                  : {
                    y: 0,
                    rotate: 0,
                    opacity: 1,
                  }
              }
            >
              <div
                className="h-6 w-8 -translate-y-1/2 rounded-t-lg border-2 border-amber-700/80 bg-gradient-to-b from-amber-600 to-amber-800 shadow-lg"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
              />
            </motion.div>
          )}
          {segments.length > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold text-white/90 uppercase tracking-wider backdrop-blur-sm">
              {segments.length} inside
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
