import { useEffect, useState, useCallback } from 'react';
import { wsClient } from '@/lib/websocket';

export interface RaffleDrawState {
  countdown: number | null;
  isDrawing: boolean;
  status: string | null;
  ticketsSold?: number;
  winnerId?: string | null;
  winnerName?: string | null;
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
    if (!wsClient || raffleIds.length === 0) return;

    setIsConnected(wsClient.isConnected());

    raffleIds.forEach((id) => wsClient.subscribe(id));

    const unsubPurchase = wsClient.on('ticket_purchase', (data: RaffleUpdate) => {
      if (data.raffleId && raffleIds.includes(data.raffleId)) {
        updateState(data.raffleId, (prev) => ({
          ...prev,
          ticketsSold: data.ticketsSold,
          status: data.status ?? prev.status,
        }));
      }
    });

    const unsubLocked = wsClient.on('raffle_locked', (data: RaffleUpdate) => {
      if (data.raffleId && raffleIds.includes(data.raffleId)) {
        updateState(data.raffleId, (prev) => ({
          ...prev,
          status: 'locked',
          ticketsSold: data.ticketsSold ?? prev.ticketsSold,
        }));
      }
    });

    const unsubCountdown = wsClient.on(
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

    const unsubDrawStarted = wsClient.on('draw_started', (data: { raffleId: string }) => {
      if (data.raffleId && raffleIds.includes(data.raffleId)) {
        updateState(data.raffleId, () => ({
          countdown: null,
          isDrawing: true,
          status: 'locked',
        }));
      }
    });

    const unsubExecuted = wsClient.on('raffle_executed', (data: RaffleUpdate) => {
      if (data.raffleId && raffleIds.includes(data.raffleId)) {
        updateState(data.raffleId, (prev) => ({
          ...prev,
          countdown: null,
          isDrawing: false,
          status: 'executed',
          ticketsSold: data.ticketsSold ?? prev.ticketsSold,
          winnerId: data.winnerId ?? null,
          winnerName: data.winnerName ?? null,
        }));
      }
    });

    const unsubUpdate = wsClient.on('raffle_update', (data: RaffleUpdate) => {
      if (data.raffleId && raffleIds.includes(data.raffleId)) {
        updateState(data.raffleId, (prev) => ({
          ...prev,
          ticketsSold: data.ticketsSold ?? prev.ticketsSold,
          status: data.status ?? prev.status,
        }));
      }
    });

    return () => {
      raffleIds.forEach((id) => wsClient?.unsubscribe(id));
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
