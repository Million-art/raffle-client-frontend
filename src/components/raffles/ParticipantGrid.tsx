"use client";

import React, {
    memo,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ParticipantGridProps {
    /** Participant display names (from WS `segments`) */
    participants: string[];
    /** Index into `participants` that is the winner (from WS `winnerSectorIndex`) */
    winnerIndex?: number;
    /** When true, start the traversal animation immediately */
    isTraversing: boolean;
    /** Called once traversal finishes and the winner tile is highlighted */
    onWinnerLanded: () => void;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface TileProps {
    name: string;
    index: number;
    isActive: boolean;
    isWinner: boolean;
    size: TileSize;
}

type TileSize = "lg" | "md" | "sm" | "xs";

const sizeCls: Record<TileSize, string> = {
    lg: "text-sm min-h-[72px]  p-2",
    md: "text-xs min-h-[56px]  p-1.5",
    sm: "text-[10px] min-h-[44px] p-1",
    xs: "text-[9px]  min-h-[36px] p-0.5",
};

const Tile = memo(function Tile({
    name,
    index,
    isActive,
    isWinner,
    size,
}: TileProps) {
    const base =
        "relative flex items-center justify-center rounded-lg border text-center font-semibold leading-tight transition-all duration-150 will-change-transform overflow-hidden cursor-default select-none";

    const stateClass = isWinner
        ? "border-amber-400 bg-amber-500/30 text-white scale-[1.08] z-20 shadow-[0_0_30px_rgba(251,191,36,0.6)] ring-2 ring-amber-400/50"
        : isActive
            ? "border-emerald-400/80 bg-emerald-500/20 text-white scale-[1.05] z-10 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            : "border-white/5 bg-slate-900/40 text-slate-400 hover:border-white/20 hover:bg-slate-800/60";

    return (
        <motion.div
            layout={false}
            className={`${base} ${sizeCls[size]} ${stateClass}`}
            aria-label={`Participant ${index + 1}: ${name}`}
            animate={
                isWinner
                    ? {
                        scale: [1.05, 1.12, 1.05],
                        transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut" },
                    }
                    : isActive
                        ? { scale: 1.05 }
                        : { scale: 1 }
            }
        >
            {/* inner glow shard for active/winner */}
            {(isActive || isWinner) && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pointer-events-none absolute inset-0 rounded-lg"
                    style={{
                        background: isWinner
                            ? "radial-gradient(circle at 50% 50%, rgba(251,191,36,0.3) 0%, transparent 80%)"
                            : "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.2) 0%, transparent 80%)",
                    }}
                />
            )}
            <span className="relative z-10 line-clamp-2 break-words px-0.5">
                {name}
            </span>
        </motion.div>
    );
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a schedule (array of ms delays) that ease-out from `fast` to `slow`
 * over `totalHops` hops, using a quadratic curve.
 */
function buildDelaySchedule(
    totalHops: number,
    fastMs = 40,
    slowMs = 450
): number[] {
    return Array.from({ length: totalHops }, (_, i) => {
        const t = i / Math.max(totalHops - 1, 1); // 0 → 1
        const eased = t * t; // quadratic ease-in on the DELAY (= ease-out on speed)
        return Math.round(fastMs + (slowMs - fastMs) * eased);
    });
}

/**
 * Determine the tile size class based on participant count.
 */
function getTileSize(count: number): TileSize {
    if (count <= 50) return "lg";
    if (count <= 150) return "md";
    if (count <= 300) return "sm";
    return "xs";
}

/**
 * Determine the min tile width (for CSS grid auto-fill) based on participant count.
 */
function getMinTileWidth(count: number): number {
    if (count <= 50) return 84;
    if (count <= 150) return 68;
    if (count <= 300) return 54;
    return 44;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const ParticipantGrid = memo(function ParticipantGrid({
    participants,
    winnerIndex,
    isTraversing,
    onWinnerLanded,
}: ParticipantGridProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [winnerLanded, setWinnerLanded] = useState(false);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scheduleRef = useRef<number[]>([]);
    const hopRef = useRef(0);
    const indexSeqRef = useRef<number[]>([]);
    const landedRef = useRef(false);

    const n = participants.length;
    const tileSize = getTileSize(n);
    const minTileWidth = getMinTileWidth(n);

    // Build & fire traversal
    const runTraversal = useCallback(() => {
        if (n === 0 || winnerIndex === undefined) return;

        const EXTRA_LAPS = 3; // number of full traversals before slowing into winner
        const totalHops = EXTRA_LAPS * n + winnerIndex + 1;
        const delays = buildDelaySchedule(totalHops, 40, 420);

        // Pre-build index sequence: EXTRA_LAPS full sweeps, then land on winner
        const seq: number[] = [];
        for (let lap = 0; lap < EXTRA_LAPS; lap++) {
            for (let i = 0; i < n; i++) seq.push(i);
        }
        for (let i = 0; i <= winnerIndex; i++) seq.push(i);

        scheduleRef.current = delays;
        indexSeqRef.current = seq;
        hopRef.current = 0;
        landedRef.current = false;

        const step = () => {
            const hop = hopRef.current;
            if (hop >= seq.length) {
                // Done
                setActiveIndex(seq[seq.length - 1]);
                setWinnerLanded(true);
                if (!landedRef.current) {
                    landedRef.current = true;
                    setTimeout(() => onWinnerLanded(), 600);
                }
                return;
            }
            setActiveIndex(seq[hop]);
            hopRef.current = hop + 1;
            timerRef.current = setTimeout(step, delays[hop] ?? 420);
        };

        step();
    }, [n, winnerIndex, onWinnerLanded]);

    // Start traversal when isTraversing becomes true
    useEffect(() => {
        if (!isTraversing) return;
        // small delay so overlay finishes mounting first
        const t = setTimeout(runTraversal, 300);
        return () => {
            clearTimeout(t);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isTraversing, runTraversal]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // Reset when participants change
    useEffect(() => {
        setActiveIndex(null);
        setWinnerLanded(false);
        landedRef.current = false;
    }, [participants]);

    if (n === 0) {
        return (
            <div className="flex h-40 items-center justify-center text-slate-500 text-sm">
                Waiting for participants…
            </div>
        );
    }

    return (
        <div
            className="w-full overflow-y-auto px-2 py-4 custom-scrollbar"
            style={{ maxHeight: "50vh" }}
            aria-label="Participant grid"
        >
            <div
                className="grid gap-1.5"
                style={{
                    gridTemplateColumns: `repeat(auto-fill, minmax(${minTileWidth}px, 1fr))`,
                }}
            >
                {participants.map((name, i) => (
                    <Tile
                        key={i}
                        index={i}
                        name={name}
                        size={tileSize}
                        isActive={!winnerLanded && activeIndex === i}
                        isWinner={winnerLanded && i === winnerIndex}
                    />
                ))}
            </div>
        </div>
    );
});
