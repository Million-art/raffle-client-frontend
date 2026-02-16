import { useEffect, useState, useCallback } from 'react';
import { wsClient } from '@/lib/websocket';

export interface RaffleDrawState {
  countdown: number | null;
  isDrawing: boolean;
  status: string | null;
  ticketsSold?: number;
  winnerId?: string | null;
  winnerName?: string | null;
  segments?: string[];
  winnerSectorIndex?: number;
}

interface RaffleUpdate {
  raffleId: string;
  ticketsSold?: number;
  totalTickets?: number;
  status?: string;
  winnerId?: string;
  winnerName?: string;
  executedAt?: string;
}

/**
 * Hook to subscribe to real-time draw updates for multiple raffles.
 * Returns a map of raffleId -> draw state (countdown, isDrawing, etc.)
 * Use on list/dashboard pages to show spinner for all participants in realtime.
 */
export const useRaffleWebSocketMulti = (raffleIds: string[]) => {
  const [states, setStates] = useState<Record<string, RaffleDrawState>>({});
  const [isConnected, setIsConnected] = useState(false);

  const updateState = useCallback((raffleId: string, updater: (prev: RaffleDrawState) => RaffleDrawState) => {
    setStates((prev) => {
      const current = prev[raffleId] ?? {
        countdown: null,
        isDrawing: false,
        status: null,
      };
      return { ...prev, [raffleId]: updater(current) };
    });
  }, []);

  useEffect(() => {
    const client = wsClient;
    if (!client || raffleIds.length === 0) return;

    setIsConnected(client.isConnected());

    raffleIds.forEach((id) => client.subscribe(id));

    const unsubPurchase = client.on('ticket_purchase', (data: RaffleUpdate) => {
      if (data.raffleId && raffleIds.includes(data.raffleId)) {
        updateState(data.raffleId, (prev) => ({
          ...prev,
          ticketsSold: data.ticketsSold,
          status: data.status ?? prev.status,
        }));
      }
    });

    const unsubLocked = client.on('raffle_locked', (data: RaffleUpdate) => {
      if (data.raffleId && raffleIds.includes(data.raffleId)) {
        updateState(data.raffleId, (prev) => ({
          ...prev,
          status: 'locked',
          ticketsSold: data.ticketsSold ?? prev.ticketsSold,
        }));
      }
    });

    const unsubCountdown = client.on(
      'raffle_countdown',
      (data: { raffleId: string; countdown: number }) => {
        if (data.raffleId && raffleIds.includes(data.raffleId)) {
          updateState(data.raffleId, (prev) => ({
            ...prev,
            countdown: data.countdown,
            status: 'locked',
          }));
        }
      }
    );

    const unsubDrawStarted = client.on('draw_started', (data: { raffleId: string; segments?: string[] }) => {
      if (data.raffleId && raffleIds.includes(data.raffleId)) {
        updateState(data.raffleId, (prev) => ({
          ...prev,
          countdown: null,
          isDrawing: true,
          status: 'locked',
          segments: data.segments ?? prev.segments,
        }));
      }
    });

    const unsubExecuted = client.on('raffle_executed', (data: RaffleUpdate & { segments?: string[]; winnerSectorIndex?: number }) => {
      if (data.raffleId && raffleIds.includes(data.raffleId)) {
        updateState(data.raffleId, (prev) => ({
          ...prev,
          countdown: null,
          isDrawing: false,
          status: 'executed',
          ticketsSold: data.ticketsSold ?? prev.ticketsSold,
          winnerId: data.winnerId ?? null,
          winnerName: data.winnerName ?? null,
          segments: data.segments ?? prev.segments,
          winnerSectorIndex: data.winnerSectorIndex,
        }));
      }
    });

    const unsubUpdate = client.on('raffle_update', (data: RaffleUpdate) => {
      if (data.raffleId && raffleIds.includes(data.raffleId)) {
        updateState(data.raffleId, (prev) => ({
          ...prev,
          ticketsSold: data.ticketsSold ?? prev.ticketsSold,
          status: data.status ?? prev.status,
        }));
      }
    });

    return () => {
      raffleIds.forEach((id) => client?.unsubscribe(id));
      unsubPurchase();
      unsubLocked();
      unsubCountdown();
      unsubDrawStarted();
      unsubExecuted();
      unsubUpdate();
    };
  }, [raffleIds.join(','), updateState]);

  const getState = useCallback(
    (raffleId: string): RaffleDrawState => {
      return (
        states[raffleId] ?? {
          countdown: null,
          isDrawing: false,
          status: null,
        }
      );
    },
    [states]
  );

  return { states, getState, isConnected };
};
