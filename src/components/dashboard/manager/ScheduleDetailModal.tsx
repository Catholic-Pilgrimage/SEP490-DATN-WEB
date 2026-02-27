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
    AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ManagerService } from '../../../services/manager.service';
import { Schedule, ContentStatus } from '../../../types/manager.types';
import { useToast } from '../../../contexts/ToastContext';

interface ScheduleDetailModalProps {
    isOpen: boolean;
    schedule: Schedule | null;
    onClose: () => void;
    onStatusChange?: () => void;
}

/**
 * Modal hiển thị chi tiết Schedule và cho phép Approve/Reject
 */
export const ScheduleDetailModal: React.FC<ScheduleDetailModalProps> = ({
    isOpen,
    schedule,
    onClose,
    onStatusChange
}) => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    // ============ STATE ============
    const [actionLoading, setActionLoading] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionError, setActionError] = useState<string | null>(null);
    const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(schedule);

    // Confirm Modal State
    const [confirmAction, setConfirmAction] = useState<'approve' | 'toggle_active' | null>(null);

    // ============ RESET STATE ============
    useEffect(() => {
        if (isOpen && schedule) {
            setCurrentSchedule(schedule);
            setShowRejectForm(false);
            setRejectionReason('');
            setActionError(null);
            setConfirmAction(null);
        }
    }, [isOpen, schedule]);

    // ============ ACTIONS ============
    const handleApproveClick = () => setConfirmAction('approve');
    const handleToggleActiveClick = () => setConfirmAction('toggle_active');

    const executeAction = async () => {
        if (!currentSchedule || !confirmAction) return;

        try {
            setActionLoading(true);
            setActionError(null);

            if (confirmAction === 'approve') {
                const response = await ManagerService.updateScheduleStatus(currentSchedule.id, {
                    status: 'approved'
                });

                if (response.success && response.data) {
                    showToast('success', t('toast.approveSuccess') || 'Đã duyệt lịch biểu thành công');
                    setCurrentSchedule(response.data);
                    onStatusChange?.();
                } else {
                    setActionError(response.message || t('common.error'));
                }
            } else if (confirmAction === 'toggle_active') {
                const response = await ManagerService.toggleScheduleActive(currentSchedule.id, {
                    is_active: !currentSchedule.is_active
                });

                if (response.success && response.data) {
                    showToast('success', currentSchedule.is_active ? (t('toast.hideSuccess') || 'Đã ẩn lịch biểu') : (t('toast.restoreSuccess') || 'Đã hiển thị lịch biểu'));
                    setCurrentSchedule(response.data);
                    onStatusChange?.();
                } else {
                    setActionError(response.message || t('common.error'));
                }
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('common.error');
            setActionError(message);
        } finally {
            setActionLoading(false);
            setConfirmAction(null);
        }
    };

    const handleReject = async () => {
        if (!currentSchedule) return;

        if (!rejectionReason.trim()) {
            setActionError(t('content.reasonRequired'));
            return;
        }

        try {
            setActionLoading(true);
            setActionError(null);

            const response = await ManagerService.updateScheduleStatus(currentSchedule.id, {
                status: 'rejected',
                rejection_reason: rejectionReason.trim()
            });

            if (response.success && response.data) {
                showToast('success', t('toast.rejectSuccess') || 'Đã từ chối lịch biểu');
                setCurrentSchedule(response.data);
                setShowRejectForm(false);
                setRejectionReason('');
                onStatusChange?.();
            } else {
                setActionError(response.message || t('common.error'));
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('common.error');
            setActionError(message);
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

    const getDayName = (day: number): string => {
        const days = language === 'vi'
            ? ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
            : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[day] || '';
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
    if (!isOpen || !currentSchedule) return null;

    const statusInfo = getStatusInfo(currentSchedule.status);
    const StatusIcon = statusInfo.icon;
    const isPending = currentSchedule.status === 'pending';

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4 my-8 flex-shrink-0">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#f5f3ee] via-white to-[#f5f3ee]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] rounded-xl flex items-center justify-center shadow-lg shadow-[#d4af37]/20">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">
                                {t('schedule.detailTitle')}
                            </h2>
                            <span className="inline-flex items-center px-2 py-0.5 bg-[#f5f3ee] border border-[#d4af37]/20 rounded-md text-sm text-[#8a6d1c] font-mono font-medium">{currentSchedule.code}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#f5f3ee] rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="space-y-6">
                        {/* Hero: Time + Days Combined */}
                        <div className="bg-gradient-to-br from-[#f5f3ee] to-[#ece8dc] rounded-2xl p-6 border border-[#d4af37]/20">
                            <div className="flex items-center gap-5 mb-5">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-[#d4af37]/20 flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-8 h-8 text-[#d4af37]" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-[#8a6d1c] font-medium mb-0.5">{t('schedule.massTime')}</p>
                                    <p className="text-3xl font-bold text-slate-900 tracking-tight">
                                        {formatTime(currentSchedule.time)}
                                    </p>
                                </div>
                                {/* Status Badge */}
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                                        <StatusIcon className="w-4 h-4" />
                                        {statusInfo.label}
                                    </span>
                                    {!currentSchedule.is_active && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-500 text-white">
                                            <Trash2 className="w-4 h-4" />
                                            {t('content.deleted')}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Days grid inside hero */}
                            <div className="pt-4 border-t border-[#d4af37]/15">
                                <p className="text-xs text-[#8a6d1c]/70 font-semibold uppercase tracking-wider mb-3">{t('schedule.daysOfWeek')}</p>
                                <div className="flex flex-wrap gap-2">
                                    {currentSchedule.days_of_week.map(day => (
                                        <span
                                            key={day}
                                            className="px-4 py-1.5 bg-white text-[#8a6d1c] rounded-lg font-medium text-sm border border-[#d4af37]/20 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            {getDayName(day)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Info Grid: Note + Creator side by side */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Note */}
                            <div className="bg-white rounded-xl p-4 border border-[#d4af37]/15 hover:border-[#d4af37]/30 transition-colors">
                                <p className="text-xs text-[#8a6d1c]/70 font-semibold uppercase tracking-wider mb-2">{t('schedule.note')}</p>
                                <p className="text-slate-700 text-sm leading-relaxed">{currentSchedule.note || t('schedule.noNote')}</p>
                            </div>

                            {/* Creator */}
                            {currentSchedule.creator && (
                                <div className="bg-white rounded-xl p-4 border border-[#d4af37]/15 hover:border-[#d4af37]/30 transition-colors">
                                    <p className="text-xs text-[#8a6d1c]/70 font-semibold uppercase tracking-wider mb-2">{t('table.creator')}</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center shadow-md shadow-[#d4af37]/15 flex-shrink-0">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-900 text-sm truncate">
                                                {currentSchedule.creator.full_name}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">{currentSchedule.creator.email}</p>
                                        </div>
                                    </div>
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
                                    {formatDateTime(currentSchedule.created_at)}
                                </p>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-[#d4af37]/15 hover:border-[#d4af37]/30 transition-colors">
                                <div className="flex items-center gap-2 text-[#8a6d1c] mb-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">{t('content.updatedAt')}</span>
                                </div>
                                <p className="text-slate-900 font-medium text-sm">
                                    {formatDateTime(currentSchedule.updated_at)}
                                </p>
                            </div>
                        </div>

                        {/* Rejection Reason */}
                        {currentSchedule.status === 'rejected' && currentSchedule.rejection_reason && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <h4 className="font-medium text-red-700 mb-2">{t('content.rejectionReason')}</h4>
                                <p className="text-red-600">{currentSchedule.rejection_reason}</p>
                            </div>
                        )}

                        {/* Reject Form */}
                        {showRejectForm && isPending && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <h4 className="font-medium text-red-700 mb-3">{t('content.enterRejectionReason')}</h4>
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
                                        className="px-4 py-2 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
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
                                        onClick={handleApproveClick}
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
                        onClick={handleToggleActiveClick}
                        disabled={actionLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 ${currentSchedule.is_active
                            ? 'border border-orange-200 text-orange-600 hover:bg-orange-50'
                            : 'bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white hover:brightness-110 shadow-lg shadow-[#d4af37]/20'
                            }`}
                    >
                        {actionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : currentSchedule.is_active ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <RotateCcw className="w-4 h-4" />
                        )}
                        {currentSchedule.is_active ? t('schedule.hide') : t('schedule.restore')}
                    </button>
                </div>
            </div>

            {/* Confirm Dialog */}
            {confirmAction && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setConfirmAction(null)}
                    />

                    {/* Dialog */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-[#d4af37]/20 flex-shrink-0">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37]">
                            <div className="text-white">
                                <h2 className="text-lg font-semibold">
                                    {confirmAction === 'approve'
                                        ? t('common.approve')
                                        : currentSchedule.is_active ? t('schedule.hide') : t('schedule.restore')}
                                </h2>
                                <p className="text-sm opacity-80">{currentSchedule.creator?.full_name}</p>
                            </div>
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`p-3 rounded-full flex-shrink-0 ${confirmAction === 'approve' ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
                                    }`}>
                                    <AlertTriangle className={`w-6 h-6 ${confirmAction === 'approve' ? 'text-green-500' : 'text-orange-500'
                                        }`} />
                                </div>
                                <p className="text-gray-600">
                                    {t('content.confirmApproveMsg')}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#d4af37]/20">
                                <button
                                    onClick={() => setConfirmAction(null)}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2.5 border border-[#d4af37]/30 text-[#8a6d1c] rounded-xl hover:bg-[#d4af37]/10 transition-colors disabled:opacity-50"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={executeAction}
                                    disabled={actionLoading}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl transition-all shadow-sm disabled:opacity-50 ${confirmAction === 'approve'
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : currentSchedule.is_active ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] hover:brightness-110'
                                        }`}
                                >
                                    {actionLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : confirmAction === 'approve' ? (
                                        <Check className="w-4 h-4" />
                                    ) : currentSchedule.is_active ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <RotateCcw className="w-4 h-4" />
                                    )}
                                    {confirmAction === 'approve'
                                        ? t('common.approve')
                                        : currentSchedule.is_active ? t('schedule.hide') : t('schedule.restore')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
