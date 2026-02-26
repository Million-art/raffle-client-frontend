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
    | 'unsubscribe'
    | 'notification'
    | 'user_notification'
    | 'authenticate'
    | 'auth_success'
    | 'auth_error';

// WebSocket message structure
export interface WebSocketMessage {
    type: WebSocketMessageType;
    raffleId?: string;
    token?: string;
    data?: Record<string, any>;
}

// WebSocket client for real-time raffle updates
class WebSocketClient {
    private ws: WebSocket | null = null;
    private url: string;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10; // Increased
    private reconnectDelay = 1000;
    private listeners: Map<string, Set<(data: any) => void>> = new Map();
    private subscriptions: Set<string> = new Set();
    private authenticated = false;

    constructor(url: string) {
        this.url = url;
    }

    connect(): Promise<void> {
        // Use 127.0.0.1 instead of localhost for IPv4/IPv6 consistency if needed, 
        // but URL comes from ENV so we use as is.
        console.log('[WebSocket] Connecting to:', this.url);

        return new Promise((resolve, reject) => {
            try {
                // Remove token from URL for security
                this.ws = new WebSocket(this.url);

                this.ws.onopen = () => {
                    this.reconnectAttempts = 0;
                    console.log('[WebSocket] Connected');

                    // 1. Authenticate immediately if token exists
                    const token = localStorage.getItem('token');
                    if (token) {
                        this.authenticate(token);
                    }

                    // 2. Resubscribe to all raffles
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
                        this.handleInternalMessage(message);
                        this.handleMessage(message);
                    } catch (error) {
                        console.error('[WebSocket] Failed to parse message:', error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('[WebSocket] Error:', error);
                    if (this.ws?.readyState !== WebSocket.OPEN) {
                        reject(error);
                    }
                };

                this.ws.onclose = (event) => {
                    this.authenticated = false;
                    console.log('[WebSocket] Closed:', event.code, event.reason);
                    this.handleReconnect();
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    private handleInternalMessage(message: WebSocketMessage) {
        if (message.type === 'auth_success') {
            this.authenticated = true;
            console.log('[WebSocket] Authentication successful');
        } else if (message.type === 'auth_error') {
            this.authenticated = false;
            console.error('[WebSocket] Authentication failed:', message.data?.error);
        }
    }

    private handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            // Exponential backoff with jitter
            const baseDelay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            const jitter = Math.random() * 1000;
            const delay = Math.min(baseDelay + jitter, 30000); // Cap at 30s

            console.log(`[WebSocket] Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts})`);

            setTimeout(() => {
                this.connect().catch(() => {
                    // Fail silently, onclose will trigger next attempt
                });
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

    authenticate(token: string) {
        this.send({
            type: 'authenticate',
            token,
        });
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
            this.ws.onclose = null; // Prevent reconnect on intentional disconnect
            this.ws.close();
            this.ws = null;
        }
        this.authenticated = false;
        this.listeners.clear();
        this.subscriptions.clear();
    }

    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    isAuthenticated(): boolean {
        return this.authenticated;
    }
}

// Singleton instance
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8082/ws';

let wsClient: WebSocketClient | null = null;

// Only initialize on client side
if (typeof window !== 'undefined') {
    wsClient = new WebSocketClient(WS_URL);
    // Don't connect immediately at module load to avoid unnecessary connections on public pages
    // Components should call connect() when needed, or we connect here if likely needed
    // For now, let's keep the auto-connect but only if we are on a page that actually needs it?
    // Actually, many pages do. Let's keep it but make it more robust.
    wsClient.connect().catch(console.error);
}

export { wsClient };
