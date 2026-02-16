// WebSocket message types
export type WebSocketMessageType =
    | 'raffle_update'
    | 'ticket_purchase'
    | 'raffle_locked'
    | 'raffle_executed'
    | 'raffle_countdown'
    | 'draw_started'
    | 'raffle_approved'
    | 'subscribe'
    | 'unsubscribe';

// WebSocket message structure
export interface WebSocketMessage {
    type: WebSocketMessageType;
    raffleId?: string;
    data?: Record<string, any>;
}

// WebSocket client for real-time raffle updates
class WebSocketClient {
    private ws: WebSocket | null = null;
    private url: string;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private listeners: Map<string, Set<(data: any) => void>> = new Map();
    private subscriptions: Set<string> = new Set();

    constructor(url: string) {
        this.url = url;
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);

                this.ws.onopen = () => {
                    this.reconnectAttempts = 0;

                    // Resubscribe to all raffles
                    this.subscriptions.forEach(raffleId => {
                        this.send({
                            type: 'subscribe',
                            raffleId,
                        });
                    });

                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message: WebSocketMessage = JSON.parse(event.data);
                        this.handleMessage(message);
                    } catch (error) {
                        console.error('[WebSocket] Failed to parse message:', error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('[WebSocket] Error:', error);
                    // Don't reject if we're already connected, let onclose handle it
                    if (this.ws?.readyState !== WebSocket.OPEN) {
                        reject(error);
                    }
                };

                this.ws.onclose = () => {
                    this.handleReconnect();
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    private handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

            setTimeout(() => {
                this.connect().catch(console.error);
            }, delay);
        } else {
            console.error('[WebSocket] Max reconnect attempts reached');
        }
    }

    private handleMessage(message: WebSocketMessage) {
        const { type, raffleId, data } = message;

        // Notify type-specific listeners
        const typeListeners = this.listeners.get(type);
        if (typeListeners) {
            typeListeners.forEach(callback => callback({ raffleId, ...data }));
        }

        // Notify raffle-specific listeners
        if (raffleId) {
            const raffleListeners = this.listeners.get(`raffle:${raffleId}`);
            if (raffleListeners) {
                raffleListeners.forEach(callback => callback({ type, ...data }));
            }
        }
    }

    send(message: WebSocketMessage) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('[WebSocket] Cannot send message, not connected');
        }
    }

    subscribe(raffleId: string) {
        this.subscriptions.add(raffleId);
        if (this.isConnected()) {
            this.send({
                type: 'subscribe',
                raffleId,
            });
        }
    }

    unsubscribe(raffleId: string) {
        this.subscriptions.delete(raffleId);
        if (this.isConnected()) {
            this.send({
                type: 'unsubscribe',
                raffleId,
            });
        }
    }

    on(event: string, callback: (data: any) => void) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);

        // Return unsubscribe function
        return () => {
            const listeners = this.listeners.get(event);
            if (listeners) {
                listeners.delete(callback);
                if (listeners.size === 0) {
                    this.listeners.delete(event);
                }
            }
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.listeners.clear();
        this.subscriptions.clear();
    }

    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
}

// Singleton instance
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000/ws';

let wsClient: WebSocketClient | null = null;

// Only initialize on client side
if (typeof window !== 'undefined') {
    wsClient = new WebSocketClient(WS_URL);
    wsClient.connect().catch(console.error);
}

export { wsClient };
