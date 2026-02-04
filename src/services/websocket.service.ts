import { io, Socket } from 'socket.io-client';
import { API_CONFIG, STORAGE_KEYS } from '../config/api';
import { Notification } from '../types/notification.types';

export class WebSocketService {
    private static socket: Socket | null = null;
    private static notificationCallbacks: ((notification: Notification) => void)[] = [];

    /**
     * Connect to WebSocket server
     */
    static connect(): void {
        if (this.socket?.connected) {
            console.log('WebSocket already connected');
            return;
        }

        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!token) {
            console.error('No access token found');
            return;
        }

        // Create socket connection
        this.socket = io(API_CONFIG.BASE_URL, {
            auth: {
                token: `Bearer ${token}`
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        // Connection successful
        this.socket.on('connect', () => {
            console.log('Connected to WebSocket:', this.socket?.id);
        });

        // Listen for notifications
        this.socket.on('notification', (data: Notification) => {
            console.log('New notification:', data);
            // Trigger all registered callbacks
            this.notificationCallbacks.forEach(callback => callback(data));
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error.message);
        });

        // Disconnection
        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from WebSocket:', reason);
        });

        // Error event
        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }

    /**
     * Disconnect from WebSocket server
     */
    static disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.notificationCallbacks = [];
            console.log('WebSocket disconnected');
        }
    }

    /**
     * Register a callback for notifications
     */
    static onNotification(callback: (notification: Notification) => void): () => void {
        this.notificationCallbacks.push(callback);
        
        // Return unsubscribe function
        return () => {
            this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
        };
    }

    /**
     * Check if socket is connected
     */
    static isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    /**
     * Get socket instance (for advanced usage)
     */
    static getSocket(): Socket | null {
        return this.socket;
    }
}
