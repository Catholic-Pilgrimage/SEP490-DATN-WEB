import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Notification } from '../types/notification.types';
import { WebSocketService } from '../services/websocket.service';
import { NotificationService } from '../services/notification.service';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    isConnected: boolean;
    loading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    deleteAllNotifications: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await NotificationService.getNotifications({ page: 1, limit: 20 });
            console.log('📥 Fetch notifications response:', response);
            
            // Backend returns: response.data.notifications (not response.data.data)
            if (response.success && response.data && response.data.notifications) {
                console.log('✅ Setting notifications:', response.data.notifications.length, 'items');
                setNotifications(response.data.notifications);
                setUnreadCount(response.data.unread_count || 0);
            } else {
                console.log('⚠️ No data in response, setting empty array');
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('❌ Error fetching notifications:', error);
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle new notification from WebSocket
    const handleNewNotification = useCallback((notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        if (!notification.is_read) {
            setUnreadCount(prev => prev + 1);
        }
        
        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/logo.png',
                tag: notification.id
            });
        }
        
        // Play notification sound (optional)
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Cannot play notification sound:', e));
    }, []);

    // Initialize WebSocket connection
    useEffect(() => {
        console.log('🔌 Initializing WebSocket connection...');
        
        // Connect to WebSocket
        WebSocketService.connect();
        
        // Check connection status periodically
        const checkConnection = () => {
            const connected = WebSocketService.isConnected();
            console.log('WebSocket status:', connected ? 'Connected' : 'Disconnected');
            setIsConnected(connected);
        };
        
        // Initial check
        checkConnection();
        
        // Check every 2 seconds
        const intervalId = setInterval(checkConnection, 2000);

        // Subscribe to notifications
        const unsubscribe = WebSocketService.onNotification(handleNewNotification);

        // Fetch initial notifications
        fetchNotifications();

        // Request browser notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Cleanup
        return () => {
            clearInterval(intervalId);
            unsubscribe();
            WebSocketService.disconnect();
        };
    }, [handleNewNotification, fetchNotifications]);

    // Mark notification as read
    const markAsRead = useCallback(async (id: string) => {
        try {
            await NotificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        try {
            await NotificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, []);

    // Delete notification
    const deleteNotification = useCallback(async (id: string) => {
        try {
            await NotificationService.deleteNotification(id);
            const notification = notifications.find(n => n.id === id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (notification && !notification.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }, [notifications]);

    // Delete all notifications
    const deleteAllNotifications = useCallback(async () => {
        try {
            await NotificationService.deleteAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Error deleting all notifications:', error);
        }
    }, []);

    // Refresh notifications
    const refreshNotifications = useCallback(async () => {
        await fetchNotifications();
    }, [fetchNotifications]);

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        isConnected,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        refreshNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
