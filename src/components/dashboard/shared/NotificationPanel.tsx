import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    EyeOff,
    Loader2
} from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { Notification, NotificationType } from '../../../types/notification.types';

// Notification icon mapping (12 types for Admin + Manager)
const getNotificationIcon = (type: NotificationType) => {
    const iconProps = { size: 20, className: 'flex-shrink-0' };

    switch (type) {
        // ========== ADMIN NOTIFICATIONS (3) ==========
        case 'verification_submitted':
            return <FileText {...iconProps} className="text-[#8a6d1c]" />;
        case 'site_registration_submitted':
            return <FileText {...iconProps} className="text-[#8a6d1c]" />;
        case 'sos_created':
            return <AlertCircle {...iconProps} className="text-red-500" />;

        // ========== MANAGER NOTIFICATIONS (9) ==========
        // Content submitted by Local Guide
        case 'shift_submitted':
            return <Calendar {...iconProps} className="text-[#8a6d1c]" />;
        case 'media_submitted':
            return <Image {...iconProps} className="text-[#8a6d1c]" />;
        case 'event_submitted':
            return <PartyPopper {...iconProps} className="text-[#8a6d1c]" />;
        case 'schedule_submitted':
            return <CalendarDays {...iconProps} className="text-[#8a6d1c]" />;
        case 'nearby_place_submitted':
            return <MapPin {...iconProps} className="text-[#8a6d1c]" />;

        // Site status from Admin
        case 'site_update_submitted':
            return <FileText {...iconProps} className="text-[#8a6d1c]" />;
        case 'site_approved':
            return <CheckCircle {...iconProps} className="text-green-500" />;
        case 'site_rejected':
            return <XCircle {...iconProps} className="text-red-500" />;
        case 'site_hidden':
            return <EyeOff {...iconProps} className="text-[#d4af37]" />;

        default:
            return <Bell {...iconProps} className="text-slate-500" />;
    }
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
    t: (key: string) => string;
}> = ({ notification, onMarkAsRead, onDelete, onNavigate, t }) => {
    // Format time ago
    const formatTimeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return t('notification.justNow');
        if (seconds < 3600) return `${Math.floor(seconds / 60)} ${t('notification.minutesAgo')}`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} ${t('notification.hoursAgo')}`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} ${t('notification.daysAgo')}`;
        return date.toLocaleDateString('vi-VN');
    };

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
            className={`group relative p-4 border-b border-[#d4af37]/10 last:border-b-0 transition-all cursor-pointer ${notification.is_read
                ? 'bg-white hover:bg-[#f5f3ee]/50'
                : 'bg-gradient-to-r from-[#f5f3ee] to-[#d4af37]/5 hover:from-[#d4af37]/10 hover:to-[#d4af37]/20'
                }`}
        >
            {/* Unread indicator */}
            {!notification.is_read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8a6d1c] to-[#d4af37]"></div>
            )}

            <div className="flex items-start gap-3 pl-2">
                {/* Icon with background */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.is_read ? 'bg-slate-50 border border-slate-100' : 'bg-white shadow-sm border border-[#d4af37]/20'
                    }`}>
                    {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`font-semibold text-sm leading-tight ${!notification.is_read ? 'text-[#8a6d1c]' : 'text-slate-700'
                            }`}>
                            {notification.title}
                        </h4>
                        <span className={`text-xs whitespace-nowrap font-medium ${!notification.is_read ? 'text-[#d4af37]' : 'text-slate-400'}`}>
                            {formatTimeAgo(notification.created_at)}
                        </span>
                    </div>

                    <p className={`text-sm leading-relaxed mb-3 ${!notification.is_read ? 'text-slate-700' : 'text-slate-500'}`}>
                        {notification.message}
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {!notification.is_read && (
                            <button
                                onClick={() => onMarkAsRead(notification.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#8a6d1c] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 rounded-md transition-colors border border-[#d4af37]/20"
                            >
                                <Check size={12} />
                                {t('notification.markRead')}
                            </button>
                        )}
                        <button
                            onClick={() => onDelete(notification.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors border border-red-100 opacity-0 group-hover:opacity-100 active:opacity-100"
                        >
                            <Trash2 size={12} />
                            {t('notification.delete')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const NotificationPanel: React.FC = () => {
    const { t } = useLanguage();
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
    const navigate = useNavigate();

    // Handle navigation based on notification type
    const handleNavigate = (path: string) => {
        setIsOpen(false); // Close dropdown
        navigate(path);
    };

    return (
        <div className="relative">
            {/* Notification Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2.5 rounded-xl transition-all ${isOpen
                    ? 'text-[#8a6d1c] bg-[#d4af37]/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]'
                    : 'text-slate-500 hover:text-[#8a6d1c] hover:bg-[#f5f3ee] hover:shadow-sm'
                    }`}
            >
                <Bell size={22} className={unreadCount > 0 ? "animate-[bell-ring_2s_ease-in-out_infinite]" : ""} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#d4af37] text-white text-[10px] rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold shadow-sm border-2 border-white px-1">
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
                    <div className="absolute right-0 sm:-right-4 md:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-[#d4af37]/20 z-[100] max-h-[80vh] flex flex-col overflow-hidden transform origin-top-right transition-all">
                        {/* Header */}
                        <div className="p-3 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#f5f3ee] to-white relative overflow-hidden shrink-0 z-10">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37]"></div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-[#d4af37]/10 rounded-xl">
                                        <Bell size={20} className="text-[#8a6d1c]" />
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 font-serif">{t('notification.title')}</h3>
                                    {isConnected ? (
                                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 font-medium ml-2 shadow-sm">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
                                            {t('notification.online')}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100 font-medium ml-2 shadow-sm">
                                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                            {t('notification.offline')}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                    title="Đóng"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={refreshNotifications}
                                    className="flex items-center justify-center gap-1 flex-1 px-2 py-1.5 text-xs font-medium bg-white hover:bg-[#f5f3ee] text-slate-700 rounded-lg border border-slate-200 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                    title={t('notification.refresh')}
                                    disabled={loading}
                                >
                                    <RefreshCw size={14} className={loading ? 'animate-spin text-[#d4af37]' : 'text-slate-500'} />
                                    {t('notification.refresh')}
                                </button>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="flex items-center justify-center gap-1 flex-1 px-2 py-1.5 text-xs font-medium bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] hover:brightness-110 text-white rounded-lg transition-all shadow-md shadow-[#d4af37]/20 active:scale-95 border border-[#d4af37]/50"
                                        title={t('notification.markAllRead')}
                                    >
                                        <CheckCheck size={14} />
                                        {t('notification.markAllRead')}
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={deleteAllNotifications}
                                        className="flex items-center justify-center gap-1 flex-1 px-2 py-1.5 text-xs font-medium bg-white hover:bg-rose-50 text-rose-600 rounded-lg border border-rose-200 transition-all shadow-sm active:scale-95 hover:border-rose-300"
                                        title={t('notification.deleteAll')}
                                    >
                                        <Trash2 size={14} />
                                        {t('notification.deleteAll')}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto flex-1 bg-slate-50/50 custom-scrollbar">
                            {loading && (!notifications || notifications.length === 0) ? (
                                <div className="p-12 flex flex-col items-center justify-center text-slate-500">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mb-3" />
                                    <p className="text-sm font-medium">{t('notification.loading')}</p>
                                </div>
                            ) : !notifications || notifications.length === 0 ? (
                                <div className="p-16 flex flex-col items-center justify-center text-slate-400">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                                        <Bell size={28} className="text-slate-300" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-500">{t('notification.empty')}</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {notifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onMarkAsRead={markAsRead}
                                            onDelete={deleteNotification}
                                            onNavigate={handleNavigate}
                                            t={t}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications && notifications.length > 0 && (
                            <div className="p-3 border-t border-slate-100 bg-white text-center shadow-[0_-5px_15px_-10px_rgba(0,0,0,0.05)] shrink-0 z-10">
                                <button className="text-sm font-medium text-[#8a6d1c] hover:text-[#d4af37] hover:underline underline-offset-4 transition-colors p-2 rounded-lg w-full">
                                    {t('notification.viewAll')}
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
