import { useEffect, useState, useCallback } from 'react';
import { wsClient } from '@/lib/websocket';
import { subscribeToRaffleEvents, type RaffleUpdate } from "@raffle-hub/shared";

/**
 * Hook to subscribe to real-time updates for a specific raffle
 */
export const useRaffleWebSocket = (raffleId: string | undefined) => {
    const [ticketsSold, setTicketsSold] = useState<number | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [winnerId, setWinnerId] = useState<string | null>(null);
    const [winnerName, setWinnerName] = useState<string | null>(null);
    const [wheelData, setWheelData] = useState<{ segments: string[]; winnerSectorIndex?: number } | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!raffleId || !wsClient) return;

        // Check connection status
        setIsConnected(wsClient.isConnected());

        wsClient.subscribe(raffleId);

        const handleEvent = (event: string, data: unknown) => {
            const d = data as RaffleUpdate & { countdown?: number; segments?: string[] };
            if (d.raffleId?.toLowerCase() !== raffleId?.toLowerCase()) return;

            switch (event) {
                case 'ticket_purchase':
                    if (d.ticketsSold !== undefined) setTicketsSold(d.ticketsSold);
                    if (d.status) setStatus(d.status);
                    break;
                case 'raffle_locked':
                    setStatus('locked');
                    if (d.ticketsSold !== undefined) setTicketsSold(d.ticketsSold);
                    break;
                case 'raffle_countdown':
                    setCountdown(d.countdown ?? null);
                    setStatus('locked');
                    break;
                case 'draw_started':
                    setIsDrawing(true);
                    setCountdown(null);
                    if (d.segments?.length) setWheelData({ segments: d.segments });
                    break;
                case 'raffle_executed':
                    setIsDrawing(false);
                    setStatus('executed');
                    if (d.winnerId) setWinnerId(d.winnerId);
                    if (d.winnerName) setWinnerName(d.winnerName);
                    if (d.ticketsSold !== undefined) setTicketsSold(d.ticketsSold);
                    setWheelData(prev => {
                        const segments = d.segments?.length ? d.segments : prev?.segments;
                        if (segments?.length && typeof d.winnerSectorIndex === 'number') {
                            return { segments, winnerSectorIndex: d.winnerSectorIndex };
                        }
                        return prev;
                    });
                    break;
                case 'raffle_update':
                    if (d.ticketsSold !== undefined) setTicketsSold(d.ticketsSold);
                    if (d.status) setStatus(d.status);
                    break;
            }
        };

        const unsubscribe = subscribeToRaffleEvents(wsClient, handleEvent);

        return () => {
            if (wsClient) wsClient.unsubscribe(raffleId);
            unsubscribe();
        };
    }, [raffleId]);

    const resetState = useCallback(() => {
        setTicketsSold(null);
        setStatus(null);
        setWinnerId(null);
        setWinnerName(null);
        setWheelData(null);
        setCountdown(null);
        setIsDrawing(false);
    }, []);

    return {
        ticketsSold,
        status,
        winnerId,
        winnerName,
        wheelData,
        countdown,
        isDrawing,
        isConnected,
        resetState,
    };
};
