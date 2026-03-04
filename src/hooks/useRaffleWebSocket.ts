import { useEffect, useState, useCallback } from 'react';
import { wsClient } from '@/lib/websocket';

interface RaffleUpdate {
    raffleId: string;
    ticketsSold?: number;
    totalTickets?: number;
    status?: string;
    winnerId?: string;
    winnerName?: string;
    executedAt?: string;
    segments?: string[];
    winnerSectorIndex?: number;
}

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

        // Subscribe to raffle updates
        wsClient.subscribe(raffleId);

        // Listen for ticket purchases
        const unsubPurchase = wsClient.on('ticket_purchase', (data: RaffleUpdate) => {
            if (data.raffleId?.toLowerCase() === raffleId?.toLowerCase()) {
                if (data.ticketsSold !== undefined) setTicketsSold(data.ticketsSold);
                if (data.status) setStatus(data.status);
            }
        });

        // Listen for raffle locked
        const unsubLocked = wsClient.on('raffle_locked', (data: RaffleUpdate) => {
            if (data.raffleId?.toLowerCase() === raffleId?.toLowerCase()) {
                setStatus('locked');
                if (data.ticketsSold !== undefined) setTicketsSold(data.ticketsSold);
            }
        });

        // Listen for raffle countdown
        const unsubCountdown = wsClient.on('raffle_countdown', (data: { raffleId: string; countdown: number }) => {
            if (data.raffleId?.toLowerCase() === raffleId?.toLowerCase()) {
                setCountdown(data.countdown);
                setStatus('locked');
            }
        });

        // Listen for draw started
        const unsubDrawStarted = wsClient.on('draw_started', (data: { raffleId: string; segments?: string[] }) => {
            if (data.raffleId?.toLowerCase() === raffleId?.toLowerCase()) {
                setIsDrawing(true);
                setCountdown(null);
                if (data.segments?.length) {
                    setWheelData({ segments: data.segments });
                }
            }
        });

        // Listen for raffle executed
        const unsubExecuted = wsClient.on('raffle_executed', (data: RaffleUpdate) => {
            if (data.raffleId?.toLowerCase() === raffleId?.toLowerCase()) {
                setIsDrawing(false);
                setStatus('executed');
                if (data.winnerId) setWinnerId(data.winnerId);
                if (data.winnerName) setWinnerName(data.winnerName);
                if (data.ticketsSold !== undefined) setTicketsSold(data.ticketsSold);

                // Update wheel data - merge with existing segments if missing in this event
                setWheelData(prev => {
                    const segments = data.segments?.length ? data.segments : prev?.segments;
                    if (segments && segments.length > 0 && typeof data.winnerSectorIndex === 'number') {
                        return { segments, winnerSectorIndex: data.winnerSectorIndex };
                    }
                    return prev;
                });
            }
        });

        // Listen for general raffle updates
        const unsubUpdate = wsClient.on('raffle_update', (data: RaffleUpdate) => {
            if (data.raffleId?.toLowerCase() === raffleId?.toLowerCase()) {
                if (data.ticketsSold !== undefined) setTicketsSold(data.ticketsSold);
                if (data.status) setStatus(data.status);
            }
        });

        // Cleanup
        return () => {
            if (wsClient) {
                wsClient.unsubscribe(raffleId);
                unsubPurchase();
                unsubLocked();
                unsubCountdown();
                unsubDrawStarted();
                unsubExecuted();
                unsubUpdate();
            }
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
