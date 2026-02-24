import React, { useEffect, useState } from 'react';
import {
    X,
    Loader2,
    User,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Check,
    Ban,
    Trash2,
    Calendar,
    RotateCcw,
    EyeOff,
    MapPin,
    Sparkles,
    ExternalLink
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { Event, ContentStatus } from '../../../types/manager.types';
import { useLanguage } from '../../../contexts/LanguageContext';

interface EventDetailModalProps {
    isOpen: boolean;
    event: Event | null;
    onClose: () => void;
    onStatusChange?: () => void;
}

/**
 * Modal hiển thị chi tiết Event và cho phép Approve/Reject
 */
export const EventDetailModal: React.FC<EventDetailModalProps> = ({
    isOpen,
    event,
    onClose,
    onStatusChange
}) => {
    const { t, language } = useLanguage();
    // ============ STATE ============
    const [actionLoading, setActionLoading] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionError, setActionError] = useState<string | null>(null);
    const [currentEvent, setCurrentEvent] = useState<Event | null>(event);

    // ============ RESET STATE ============
    useEffect(() => {
        if (isOpen && event) {
            setCurrentEvent(event);
            setShowRejectForm(false);
            setRejectionReason('');
            setActionError(null);
        }
    }, [isOpen, event]);

    // ============ ACTIONS ============
    const handleApprove = async () => {
        if (!currentEvent) return;

        const confirmed = window.confirm(`${t('content.confirmApproveMsg')}?`);
        if (!confirmed) return;

        try {
            setActionLoading(true);
            setActionError(null);

            const response = await ManagerService.updateEventStatus(currentEvent.id, {
                status: 'approved'
            });

            if (response.success && response.data) {
                setCurrentEvent(response.data);
                onStatusChange?.();
            } else {
                setActionError(response.message || t('common.error'));
            }
        } catch (err: any) {
            setActionError(err?.error?.message || t('common.error'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!currentEvent) return;

        if (!rejectionReason.trim()) {
            setActionError(t('content.enterRejectReason'));
            return;
        }

        try {
            setActionLoading(true);
            setActionError(null);

            const response = await ManagerService.updateEventStatus(currentEvent.id, {
                status: 'rejected',
                rejection_reason: rejectionReason.trim()
            });

            if (response.success && response.data) {
                setCurrentEvent(response.data);
                setShowRejectForm(false);
                setRejectionReason('');
                onStatusChange?.();
            } else {
                setActionError(response.message || t('common.error'));
            }
        } catch (err: any) {
            setActionError(err?.error?.message || t('common.error'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleActive = async () => {
        if (!currentEvent) return;

        const confirmed = window.confirm(`${t('content.confirmApproveMsg')}?`);
        if (!confirmed) return;

        try {
            setActionLoading(true);
            setActionError(null);

            const response = await ManagerService.toggleEventActive(currentEvent.id, {
                is_active: !currentEvent.is_active
            });

            if (response.success && response.data) {
                setCurrentEvent(response.data);
                onStatusChange?.();
            } else {
                setActionError(response.message || t('common.error'));
            }
        } catch (err: any) {
            setActionError(err?.error?.message || t('common.error'));
        } finally {
            setActionLoading(false);
        }
    };

    // ============ HELPERS ============
    const getStatusInfo = (status: ContentStatus) => {
        const statuses = {
            pending: { label: t('status.pending'), color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
            approved: { label: t('status.approved'), color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
            rejected: { label: t('status.rejected'), color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
        };
        return statuses[status] || statuses.pending;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (time: string): string => {
        return time.slice(0, 5);
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ============ RENDER ============
    if (!isOpen || !currentEvent) return null;

    const statusInfo = getStatusInfo(currentEvent.status);
    const StatusIcon = statusInfo.icon;
    const isPending = currentEvent.status === 'pending';

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden mx-4 my-8 flex-shrink-0">
                {/* Banner Header */}
                <div className="relative h-48 bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] overflow-hidden">
                    {currentEvent.banner_url ? (
                        <img
                            src={currentEvent.banner_url}
                            alt={currentEvent.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-16 h-16 text-white/30" />
                        </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-lg transition-colors border border-white/10"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    {/* Title on banner */}
                    <div className="absolute bottom-4 left-6 right-6">
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border backdrop-blur-sm bg-white/90 ${statusInfo.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                {statusInfo.label}
                            </span>
                            {!currentEvent.is_active && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-500 text-white">
                                    <Trash2 className="w-4 h-4" />
                                    {t('content.deleted')}
                                </span>
                            )}
                            <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md text-white text-xs rounded-lg font-mono border border-white/10">
                                {currentEvent.code}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white drop-shadow-md">
                            {currentEvent.name}
                        </h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
                    <div className="space-y-5">
                        {/* Description */}
                        <div className="bg-gradient-to-br from-[#f5f3ee] to-[#ece8dc] rounded-2xl p-5 border border-[#d4af37]/20">
                            <p className="text-xs text-[#8a6d1c]/70 font-semibold uppercase tracking-wider mb-2">{t('event.description')}</p>
                            <p className="text-slate-700 leading-relaxed">{currentEvent.description || t('event.noDescription')}</p>
                        </div>

                        {/* Date & Time & Location Hero Card */}
                        <div className="bg-gradient-to-br from-[#f5f3ee] to-[#ece8dc] rounded-2xl p-5 border border-[#d4af37]/20">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Date */}
                                <div className="bg-white rounded-xl p-4 border border-[#d4af37]/15">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-[#f5f3ee] flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-[#d4af37]" />
                                        </div>
                                        <span className="text-xs text-[#8a6d1c]/70 font-semibold uppercase tracking-wider">{t('event.date')}</span>
                                    </div>
                                    <p className="text-slate-900 font-medium text-sm">
                                        {formatDate(currentEvent.start_date)}
                                    </p>
                                    {currentEvent.start_date !== currentEvent.end_date && (
                                        <p className="text-slate-500 text-xs mt-1">
                                            → {formatDate(currentEvent.end_date)}
                                        </p>
                                    )}
                                </div>

                                {/* Time */}
                                <div className="bg-white rounded-xl p-4 border border-[#d4af37]/15">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-[#f5f3ee] flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-[#d4af37]" />
                                        </div>
                                        <span className="text-xs text-[#8a6d1c]/70 font-semibold uppercase tracking-wider">{t('event.time')}</span>
                                    </div>
                                    <p className="text-slate-900 font-bold text-lg tracking-tight">
                                        {formatTime(currentEvent.start_time)} - {formatTime(currentEvent.end_time)}
                                    </p>
                                </div>

                                {/* Location */}
                                <div className="bg-white rounded-xl p-4 border border-[#d4af37]/15">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-[#f5f3ee] flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-[#d4af37]" />
                                        </div>
                                        <span className="text-xs text-[#8a6d1c]/70 font-semibold uppercase tracking-wider">{t('event.location')}</span>
                                    </div>
                                    <p className="text-slate-900 font-medium text-sm">{currentEvent.location}</p>
                                </div>
                            </div>
                        </div>

                        {/* Info Grid: Creator + Banner */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Creator */}
                            {currentEvent.creator && (
                                <div className="bg-white rounded-xl p-4 border border-[#d4af37]/15 hover:border-[#d4af37]/30 transition-colors">
                                    <p className="text-xs text-[#8a6d1c]/70 font-semibold uppercase tracking-wider mb-2">{t('table.creator')}</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center shadow-md shadow-[#d4af37]/15 flex-shrink-0">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-900 text-sm truncate">
                                                {currentEvent.creator.full_name}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">{currentEvent.creator.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Banner URL */}
                            {currentEvent.banner_url && (
                                <div className="bg-white rounded-xl p-4 border border-[#d4af37]/15 hover:border-[#d4af37]/30 transition-colors">
                                    <p className="text-xs text-[#8a6d1c]/70 font-semibold uppercase tracking-wider mb-2">{t('event.banner')}</p>
                                    <a
                                        href={currentEvent.banner_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-[#8a6d1c] hover:text-[#6b5516] text-sm font-medium transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        {t('event.openBanner')}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Timestamps */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-4 border border-[#d4af37]/15 hover:border-[#d4af37]/30 transition-colors">
                                <div className="flex items-center gap-2 text-[#8a6d1c] mb-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">{t('content.createdAt')}</span>
                                </div>
                                <p className="text-slate-900 font-medium text-sm">
                                    {formatDateTime(currentEvent.created_at)}
                                </p>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-[#d4af37]/15 hover:border-[#d4af37]/30 transition-colors">
                                <div className="flex items-center gap-2 text-[#8a6d1c] mb-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">{t('content.updatedAt')}</span>
                                </div>
                                <p className="text-slate-900 font-medium text-sm">
                                    {formatDateTime(currentEvent.updated_at)}
                                </p>
                            </div>
                        </div>

                        {/* Rejection Reason */}
                        {currentEvent.status === 'rejected' && currentEvent.rejection_reason && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <h4 className="font-medium text-red-700 mb-2">Lý do từ chối</h4>
                                <p className="text-red-600">{currentEvent.rejection_reason}</p>
                            </div>
                        )}

                        {/* Reject Form */}
                        {showRejectForm && isPending && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <h4 className="font-medium text-red-700 mb-3">{t('content.enterRejectReason')}</h4>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder={t('content.rejectionPlaceholder')}
                                    className="w-full px-4 py-3 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                    rows={3}
                                    disabled={actionLoading}
                                />
                            </div>
                        )}

                        {/* Action Error */}
                        {actionError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{actionError}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 p-6 border-t border-[#d4af37]/20">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-700 border border-[#d4af37]/20 rounded-xl hover:bg-[#f5f3ee] transition-colors"
                    >
                        {t('common.close')}
                    </button>

                    {/* Action Buttons */}
                    {isPending && (
                        <div className="flex items-center gap-3">
                            {showRejectForm ? (
                                <>
                                    <button
                                        onClick={() => { setShowRejectForm(false); setRejectionReason(''); setActionError(null); }}
                                        disabled={actionLoading}
                                        className="px-4 py-2 text-slate-700 border border-[#d4af37]/20 rounded-xl hover:bg-[#f5f3ee] transition-colors disabled:opacity-50"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={actionLoading || !rejectionReason.trim()}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Ban className="w-4 h-4" />
                                        )}
                                        {t('content.confirmReject')}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setShowRejectForm(true)}
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        {t('common.reject')}
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Check className="w-4 h-4" />
                                        )}
                                        {t('common.approve')}
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Toggle Active Button */}
                    <button
                        onClick={handleToggleActive}
                        disabled={actionLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all disabled:opacity-50 ${currentEvent.is_active
                            ? 'border border-orange-200 text-orange-600 hover:bg-orange-50'
                            : 'bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white shadow-lg shadow-[#d4af37]/20 hover:brightness-110'
                            }`}
                    >
                        {actionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : currentEvent.is_active ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <RotateCcw className="w-4 h-4" />
                        )}
                        {currentEvent.is_active ? t('content.hide') : t('content.restore')}
                    </button>
                </div>
            </div>
        </div>
    );
};
