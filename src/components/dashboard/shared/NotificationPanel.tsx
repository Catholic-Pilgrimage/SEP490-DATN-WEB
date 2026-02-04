import React, { useState } from 'react';
import { 
    Bell, 
    Check, 
    CheckCheck, 
    X, 
    Trash2, 
    RefreshCw,
    Calendar,
    CheckCircle,
    XCircle,
    Image,
    PartyPopper,
    CalendarDays,
    MapPin,
    FileText,
    AlertCircle,
    EyeOff
} from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import type { Notification, NotificationType } from '../../../types/notification.types';
import type { ActiveView } from '../Dashboard';

// Notification icon mapping (12 types for Admin + Manager)
const getNotificationIcon = (type: NotificationType) => {
    const iconProps = { size: 20, className: 'flex-shrink-0' };
    
    switch (type) {
        // ========== ADMIN NOTIFICATIONS (3) ==========
        case 'verification_submitted':
            return <FileText {...iconProps} className="text-blue-500" />;
        case 'site_registration_submitted':
            return <FileText {...iconProps} className="text-blue-500" />;
        case 'sos_created':
            return <AlertCircle {...iconProps} className="text-red-600" />;
        
        // ========== MANAGER NOTIFICATIONS (9) ==========
        // Content submitted by Local Guide
        case 'shift_submitted':
            return <Calendar {...iconProps} className="text-blue-500" />;
        case 'media_submitted':
            return <Image {...iconProps} className="text-blue-500" />;
        case 'event_submitted':
            return <PartyPopper {...iconProps} className="text-blue-500" />;
        case 'schedule_submitted':
            return <CalendarDays {...iconProps} className="text-blue-500" />;
        case 'nearby_place_submitted':
            return <MapPin {...iconProps} className="text-blue-500" />;
        
        // Site status from Admin
        case 'site_update_submitted':
            return <FileText {...iconProps} className="text-blue-500" />;
        case 'site_approved':
            return <CheckCircle {...iconProps} className="text-green-500" />;
        case 'site_rejected':
            return <XCircle {...iconProps} className="text-red-500" />;
        case 'site_hidden':
            return <EyeOff {...iconProps} className="text-orange-500" />;
        
        default:
            return <Bell {...iconProps} className="text-gray-500" />;
    }
};

// Format time ago
const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
};

// Get navigation path based on notification type (12 types for Admin + Manager)
const getNotificationPath = (notification: Notification): string | null => {
    const { type } = notification;
    
    switch (type) {
        // ========== ADMIN NOTIFICATIONS (3) ==========
        case 'verification_submitted':
            return '/dashboard/verifications'; // Navigate to verification requests
        case 'site_registration_submitted':
            return '/dashboard/sites'; // Navigate to site management
        case 'sos_created':
            return '/dashboard/sos'; // Navigate to SOS center
        
        // ========== MANAGER NOTIFICATIONS (9) ==========
        // Content submitted by Local Guide
        case 'shift_submitted':
            return '/dashboard/shifts'; // Navigate to shifts page
        case 'media_submitted':
        case 'event_submitted':
        case 'schedule_submitted':
        case 'nearby_place_submitted':
            return '/dashboard/content'; // Navigate to content management
        
        // Site status from Admin
        case 'site_update_submitted':
        case 'site_approved':
        case 'site_rejected':
        case 'site_hidden':
            return '/dashboard/mysite'; // Navigate to my site
        
        default:
            return null;
    }
};

const NotificationItem: React.FC<{
    notification: Notification;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
    onNavigate: (path: string) => void;
}> = ({ notification, onMarkAsRead, onDelete, onNavigate }) => {
    const handleClick = () => {
        const path = getNotificationPath(notification);
        if (path) {
            // Mark as read when clicking
            if (!notification.is_read) {
                onMarkAsRead(notification.id);
            }
            // Navigate to the relevant page
            onNavigate(path);
        }
    };
    
    return (
        <div
            onClick={handleClick}
            className={`group relative p-4 border-b last:border-b-0 transition-all cursor-pointer ${
                notification.is_read 
                    ? 'bg-white hover:bg-gray-50' 
                    : 'bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100'
            }`}
        >
            {/* Unread indicator */}
            {!notification.is_read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500"></div>
            )}
            
            <div className="flex items-start gap-3 pl-2">
                {/* Icon with background */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.is_read ? 'bg-gray-100' : 'bg-white shadow-sm'
                }`}>
                    {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`font-semibold text-sm leading-tight ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                            {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap font-medium">
                            {formatTimeAgo(notification.created_at)}
                        </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                        {notification.message}
                    </p>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {!notification.is_read && (
                            <button
                                onClick={() => onMarkAsRead(notification.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                            >
                                <Check size={12} />
                                Đánh dấu đã đọc
                            </button>
                        )}
                        <button
                            onClick={() => onDelete(notification.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                        >
                            <Trash2 size={12} />
                            Xóa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const NotificationPanel: React.FC<{ onViewChange?: (view: ActiveView) => void }> = ({ onViewChange }) => {
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        refreshNotifications,
        isConnected,
    } = useNotifications();

    const [isOpen, setIsOpen] = useState(false);
    
    // Handle navigation based on notification type
    const handleNavigate = (path: string) => {
        setIsOpen(false); // Close dropdown
        
        // Map path to view for onViewChange callback
        const viewMap: Record<string, ActiveView> = {
            '/dashboard/shifts': 'shifts',
            '/dashboard/content': 'content',
            '/dashboard/mysite': 'mysite',
            '/dashboard/sites': 'sites',
            '/dashboard/verifications': 'verifications',
            '/dashboard/sos': 'sos',
        };
        
        const view = viewMap[path];
        if (view && onViewChange) {
            onViewChange(view);
        }
    };

    return (
        <div className="relative">
            {/* Notification Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border z-50 max-h-[600px] flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Bell size={20} className="text-blue-600" />
                                    <h3 className="font-semibold text-lg text-gray-800">Thông báo</h3>
                                    {isConnected ? (
                                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                            Online
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                            Offline
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-white rounded-lg transition-colors"
                                    title="Đóng"
                                >
                                    <X size={18} className="text-gray-500" />
                                </button>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={refreshNotifications}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white hover:bg-gray-50 text-gray-700 rounded-lg border transition-colors disabled:opacity-50"
                                    title="Làm mới"
                                    disabled={loading}
                                >
                                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                                    Làm mới
                                </button>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                        title="Đánh dấu tất cả đã đọc"
                                    >
                                        <CheckCheck size={14} />
                                        Đọc tất cả
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={deleteAllNotifications}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                        title="Xóa tất cả thông báo"
                                    >
                                        <Trash2 size={14} />
                                        Xóa tất cả
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto flex-1">
                            {loading && (!notifications || notifications.length === 0) ? (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2">Đang tải...</p>
                                </div>
                            ) : !notifications || notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Bell size={48} className="mx-auto text-gray-300 mb-2" />
                                    <p>Không có thông báo nào</p>
                                </div>
                            ) : (
                                <div>
                                    {notifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onMarkAsRead={markAsRead}
                                            onDelete={deleteNotification}
                                            onNavigate={handleNavigate}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications && notifications.length > 0 && (
                            <div className="p-3 border-t text-center">
                                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                    Xem tất cả thông báo
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
