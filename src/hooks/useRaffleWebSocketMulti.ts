import { useEffect, useState, useCallback } from 'react';
import { wsClient } from '@/lib/websocket';
import { subscribeToRaffleEvents, type RaffleUpdate } from "@raffle-hub/shared";

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

    const handleEvent = (event: string, data: unknown) => {
      const d = data as RaffleUpdate & { countdown?: number; segments?: string[] };
      if (!d.raffleId || !raffleIds.includes(d.raffleId)) return;

      switch (event) {
        case 'ticket_purchase':
          updateState(d.raffleId, (prev) => ({
            ...prev,
            ticketsSold: d.ticketsSold ?? prev.ticketsSold,
            status: d.status ?? prev.status,
          }));
          break;
        case 'raffle_locked':
          updateState(d.raffleId, (prev) => ({
            ...prev,
            status: 'locked',
            ticketsSold: d.ticketsSold ?? prev.ticketsSold,
          }));
          break;
        case 'raffle_countdown':
          updateState(d.raffleId, (prev) => ({
            ...prev,
            countdown: d.countdown ?? null,
            status: 'locked',
          }));
          break;
        case 'draw_started':
          updateState(d.raffleId, (prev) => ({
            ...prev,
            countdown: null,
            isDrawing: true,
            status: 'locked',
            segments: d.segments ?? prev.segments,
          }));
          break;
        case 'raffle_executed':
          updateState(d.raffleId, (prev) => ({
            ...prev,
            countdown: null,
            isDrawing: false,
            status: 'executed',
            ticketsSold: d.ticketsSold ?? prev.ticketsSold,
            winnerId: d.winnerId ?? prev.winnerId,
            winnerName: d.winnerName ?? prev.winnerName,
            segments: d.segments ?? prev.segments,
            winnerSectorIndex: typeof d.winnerSectorIndex === 'number' ? d.winnerSectorIndex : prev.winnerSectorIndex,
          }));
          break;
        case 'raffle_update':
          updateState(d.raffleId, (prev) => ({
            ...prev,
            ticketsSold: d.ticketsSold ?? prev.ticketsSold,
            status: d.status ?? prev.status,
          }));
          break;
      }
    };

    const unsubscribe = subscribeToRaffleEvents(client, handleEvent);

    return () => {
      raffleIds.forEach((id) => client?.unsubscribe(id));
      unsubscribe();
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
