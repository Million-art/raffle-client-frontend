"use client";

import { useCallback, useRef, useMemo } from "react";

export interface DrawSounds {
  playShake: () => void;
  stopShake: () => void;
  playLidOpen: () => void;
  playWinner: () => void;
}

let sharedCtx: AudioContext | null = null;
function getCtx() {
  if (typeof window === "undefined") return null;
  if (!sharedCtx) {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) sharedCtx = new AudioContextClass();
    } catch {
      return null;
    }
  }
  if (sharedCtx && sharedCtx.state === "suspended") {
    sharedCtx.resume().catch(() => { });
  }
  return sharedCtx;
}

/**
 * Web Audio API fallback for draw sounds. Works without external MP3 files.
 */
function useWebAudioSounds(): DrawSounds {
  const shakeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const playShake = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      if (shakeIntervalRef.current) clearInterval(shakeIntervalRef.current);
      const playBurst = () => {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.15;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const gain = ctx.createGain();
        gain.gain.value = 0.2;
        src.connect(gain);
        gain.connect(ctx.destination);
        src.start(0);
      };
      playBurst();
      shakeIntervalRef.current = setInterval(playBurst, 120);
    } catch {
      /* no-op */
    }
  }, []);

  const stopShake = useCallback(() => {
    if (shakeIntervalRef.current) {
      clearInterval(shakeIntervalRef.current);
      shakeIntervalRef.current = null;
    }
  }, []);

  // Screw/twist sound for plastic container with screw-on lid
  const playLidOpen = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const playClick = (t: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(200, ctx.currentTime + t);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.04);
      };
      playClick(0);
      playClick(0.08);
      playClick(0.16);
    } catch {
      /* no-op */
    }
  }, []);

  const playWinner = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const playTone = (freq: number, start: number, duration: number, vol: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      playTone(523.25, 0, 0.15, 0.2);
      playTone(659.25, 0.12, 0.15, 0.18);
      playTone(783.99, 0.24, 0.2, 0.22);
    } catch {
      /* no-op */
    }
  }, []);

  return useMemo(() => ({ playShake, stopShake, playLidOpen, playWinner }), [playShake, stopShake, playLidOpen, playWinner]);
}

export function useDrawSounds(): DrawSounds {
  return useWebAudioSounds();
}
