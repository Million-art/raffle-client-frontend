import { useEffect } from "react";
import { wsClient } from "@/lib/websocket";

/**
 * Subscribes to raffle_approved WebSocket events and invokes onListChanged
 * so participants see newly approved raffles without refreshing.
 */
export function useRaffleListUpdates(onListChanged: () => void) {
  useEffect(() => {
    if (!wsClient) return;

    const unsub = wsClient.on("raffle_approved", () => {
      onListChanged();
    });

    return () => {
      unsub();
    };
  }, [onListChanged]);
}
