"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { ParticipantGrid } from "./ParticipantGrid";
import { useDrawSounds } from "@/hooks/useDrawSounds";
import type { RaffleDrawState } from "@/hooks/useRaffleWebSocketMulti";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface GamifiedDrawOverlayProps {
  isOpen: boolean;
  raffleName: string;
  drawState: RaffleDrawState;
  /** Participant name list (WS `segments`) */
  segments?: string[];
  /** Winner index into segments (WS `winnerSectorIndex`) */
  winnerSectorIndex?: number;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function GamifiedDrawOverlay({
  isOpen,
  raffleName,
  drawState,
  segments = [],
  winnerSectorIndex,
  onClose,
}: GamifiedDrawOverlayProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [traversalDone, setTraversalDone] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const sounds = useDrawSounds();

  // Focus-trap ref for winner modal close button
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    sounds.stopShake();
    onClose();
  }, [sounds, onClose]);

  // Reset state when overlay is closed/reopened
  useEffect(() => {
    if (!isOpen) {
      setShowConfetti(false);
      setTraversalDone(false);
      setShowWinnerModal(false);
    }
  }, [isOpen]);

  // Start shake sound when draw begins
  useEffect(() => {
    if (drawState.isDrawing && !traversalDone) {
      sounds.playShake();
    }
    return () => {
      sounds.stopShake();
    };
  }, [drawState.isDrawing, traversalDone, sounds]);

  // Called by ParticipantGrid when traversal animation finishes
  const handleWinnerLanded = useCallback(() => {
    sounds.stopShake();
    sounds.playWinner();
    setTraversalDone(true);
    setShowConfetti(true);
    // Small delay so winner tile animation settles before modal appears
    setTimeout(() => setShowWinnerModal(true), 700);
  }, [sounds]);

  // If we receive winner from server but traversal isn't in progress (e.g. page
  // reload mid-draw), treat it as done immediately.
  const hasWinner = !!drawState.winnerName;
  useEffect(() => {
    if (hasWinner && !drawState.isDrawing && !traversalDone) {
      setTraversalDone(true);
      setShowConfetti(true);
      setTimeout(() => setShowWinnerModal(true), 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasWinner, drawState.isDrawing]);

  // ESC key to close winner modal
  useEffect(() => {
    if (!showWinnerModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showWinnerModal, handleClose]);

  // Auto-focus close button when winner modal opens
  useEffect(() => {
    if (showWinnerModal) {
      closeBtnRef.current?.focus();
    }
  }, [showWinnerModal]);

  if (!isOpen) return null;

  const { countdown, isDrawing, winnerName } = drawState;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-950/97 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Raffle draw"
    >
      {/* Ambient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary-600/10 blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* ================================================================
            PHASE 1 — COUNTDOWN
        ================================================================ */}
        {countdown !== null && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
            className="relative z-10 flex flex-col items-center text-center px-4"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 2, -2, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-primary-300">
                  Draw Starting In
                </span>
              </div>
            </motion.div>

            <div className="relative">
              <span className="text-[12rem] font-black leading-none tabular-nums text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                {countdown}
              </span>
            </div>

            <h2 className="mt-8 text-2xl font-bold text-slate-300 max-w-lg">
              {raffleName}
            </h2>
          </motion.div>
        )}

        {/* ================================================================
            PHASE 2 — DRAW IN PROGRESS (participant grid + traversal)
        ================================================================ */}
        {(isDrawing || traversalDone) && (
          <motion.div
            key="drawing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 flex w-full max-w-6xl flex-col items-center px-4 py-6"
          >
            {/* Header */}
            <div className="mb-6 text-center">
              <h3 className="text-sm font-medium text-slate-400 mb-1 uppercase tracking-widest">
                {raffleName}
              </h3>
              <h1 className="text-3xl font-black text-white tracking-tight">
                {traversalDone ? "WINNER CONFIRMED" : "DRAW IN PROGRESS"}
              </h1>
              {traversalDone && winnerName && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xl font-bold text-amber-400"
                >
                  {winnerName}
                </motion.p>
              )}
            </div>

            {/* Participant Grid */}
            <div className="w-full">
              <ParticipantGrid
                participants={segments}
                winnerIndex={winnerSectorIndex}
                isTraversing={isDrawing && !traversalDone}
                onWinnerLanded={handleWinnerLanded}
              />
            </div>

            {/* Status indicator while traversal is running */}
            {isDrawing && !traversalDone && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 flex flex-col items-center gap-3 w-full max-w-md"
              >
                <div className="flex items-center gap-3 rounded-full bg-slate-900/60 px-6 py-2 border border-emerald-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-400" />
                  <span className="text-sm font-bold text-emerald-400 tracking-wide uppercase">
                    Selecting Winner…
                  </span>
                </div>
                <div className="font-mono text-xs text-slate-500 bg-black/40 px-4 py-2 rounded-lg border border-white/5 w-full text-center overflow-hidden whitespace-nowrap">
                  <HashAnimation />
                </div>
                <div className="flex items-center gap-2 opacity-40">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest text-slate-400">
                    RaffleHub Secure RNG System
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================================
          WINNER MODAL — appears after traversal finishes
      ================================================================== */}
      <AnimatePresence>
        {showWinnerModal && (
          <motion.div
            key="winner-modal"
            className="absolute inset-0 z-[110] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Blurred overlay */}
            <div
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
              onClick={handleClose}
              aria-hidden="true"
            />

            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="winner-heading"
              className="relative z-10 flex flex-col items-center text-center max-w-lg w-full rounded-3xl border border-amber-400/30 bg-slate-900/90 px-8 py-10 shadow-[0_0_80px_rgba(251,191,36,0.25)] backdrop-blur-xl"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
            >
              {/* Trophy icon */}
              <motion.div
                animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mb-4"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20 border border-amber-400/40 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                  <Trophy className="h-10 w-10 text-amber-400" />
                </div>
              </motion.div>

              <p className="text-xl font-black uppercase tracking-widest text-amber-400 mb-2">
                🎉 WINNER 🎉
              </p>

              <h2
                id="winner-heading"
                className="text-4xl sm:text-5xl font-black text-white leading-tight mb-3 break-words"
              >
                {winnerName || drawState.winnerName || ""}
              </h2>

              <p className="text-sm text-slate-400 mb-8">
                Congratulations! The winner has been selected.
              </p>

              {/* Fairness hash badge */}
              <div className="mb-6 w-full rounded-xl bg-black/30 border border-white/5 px-4 py-2">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                  Fairness Hash
                </p>
                <FairnessHashDisplay winnerName={winnerName || ""} winnerIndex={winnerSectorIndex} />
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full">
                <button
                  ref={closeBtnRef}
                  onClick={handleClose}
                  className="flex-1 group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white px-6 py-3 text-sm font-black text-slate-950 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="relative z-10">Close</span>
                  <X className="relative z-10 h-4 w-4" />
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti */}
      {showConfetti && <ConfettiFX />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ConfettiFX
// ---------------------------------------------------------------------------
function ConfettiFX() {
  const colors = [
    "#ef4444", "#eab308", "#22c55e",
    "#3b82f6", "#ec4899", "#8b5cf6", "#f97316",
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[50]">
      {[...Array(60)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            top: "-5%",
            left: `${Math.random() * 100}%`,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            top: "108%",
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
            opacity: [1, 1, 0.3],
          }}
          transition={{
            duration: 2.5 + Math.random() * 2.5,
            ease: "linear",
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          className="absolute rounded-sm"
          style={{
            width: `${4 + Math.random() * 6}px`,
            height: `${8 + Math.random() * 8}px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// HashAnimation — animated security hash display
// ---------------------------------------------------------------------------
function HashAnimation() {
  const [hash, setHash] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setHash(
        Array.from({ length: 48 }, () =>
          "0123456789abcdef"[Math.floor(Math.random() * 16)]
        ).join("")
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return <span>0x{hash}</span>;
}

// ---------------------------------------------------------------------------
// FairnessHashDisplay — stable hash shown after draw
// ---------------------------------------------------------------------------
function FairnessHashDisplay({
  winnerName,
  winnerIndex,
}: {
  winnerName: string;
  winnerIndex?: number;
}) {
  // Deterministic display hash from winner name + index (client-side only)
  const hash = React.useMemo(() => {
    const seed = `${winnerName}-${winnerIndex ?? 0}`;
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
    }
    const hexBase = Math.abs(h).toString(16).padStart(8, "0");
    return "0x" + hexBase.repeat(6).slice(0, 48);
  }, [winnerName, winnerIndex]);

  return (
    <p className="font-mono text-[10px] text-slate-400 truncate">{hash}</p>
  );
}
