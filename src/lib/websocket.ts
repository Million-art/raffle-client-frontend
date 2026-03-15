import { createRaffleWebSocketClient } from '@raffle-hub/shared';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8082/ws';

let wsClient: ReturnType<typeof createRaffleWebSocketClient> | null = null;

if (typeof window !== 'undefined') {
  wsClient = createRaffleWebSocketClient({
    url: WS_URL,
    authMode: 'cookie',
    maxReconnectAttempts: 10,
    reconnectWithJitter: true,
    preventReconnectOnDisconnect: true,
    debug: process.env.NODE_ENV === 'development',
  });
  wsClient.connect().catch(console.error);
}

export { wsClient };
