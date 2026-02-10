import React, { useEffect, useState } from 'react';
import {
    X,
    Loader2,
    Calendar,
    Clock,
    User,
    Mail,
    Phone,
    CheckCircle,
    XCircle,
    AlertCircle,
    Plus,
    Minus,
    RefreshCw,
    Check,
    Ban
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ManagerService } from '../../../services/manager.service';
import { ShiftSubmissionDetail, ShiftSubmissionStatus, ShiftChange } from '../../../types/manager.types';

interface ShiftSubmissionDetailModalProps {
    isOpen: boolean;
    submissionId: string | null;  // ID của submission cần xem
    onClose: () => void;
    onStatusChange?: () => void;  // Callback khi status thay đổi (để refresh list)
}

/**
 * Modal hiển thị chi tiết Shift Submission
 * 
 * Giải thích:
 * - Hiển thị thông tin đầy đủ của submission
 * - Nếu submission_type = 'change', hiển thị diff (các thay đổi)
 * - Có nút Approve/Reject khi status = 'pending'
 * - Form nhập lý do khi Reject
 */
export const ShiftSubmissionDetailModal: React.FC<ShiftSubmissionDetailModalProps> = ({
    isOpen,
    submissionId,
    onClose,
    onStatusChange
}) => {
    const { t, language } = useLanguage();
    const [submission, setSubmission] = useState<ShiftSubmissionDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ============ APPROVE/REJECT STATE ============
    const [actionLoading, setActionLoading] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionError, setActionError] = useState<string | null>(null);

    // ============ RESET STATE ============
    useEffect(() => {
        if (!isOpen) {
            setSubmission(null);
            setError(null);
            setShowRejectForm(false);
            setRejectionReason('');
            setActionError(null);
        }
    }, [isOpen]);

    // ============ FETCH DATA ============
    useEffect(() => {
        if (isOpen && submissionId) {
            fetchDetail();
        }
    }, [isOpen, submissionId]);

    const fetchDetail = async () => {
        if (!submissionId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await ManagerService.getShiftSubmissionDetail(submissionId);

            if (response.success && response.data) {
                setSubmission(response.data);
            } else {
                setError(response.message || t('modal.errorLoading'));
            }
        } catch (err: any) {
            setError(err?.error?.message || t('modal.errorLoading'));
        } finally {
            setLoading(false);
        }
    };

    // ============ ACTIONS ============
    const handleApprove = async () => {
        if (!submissionId) return;

        const confirmed = window.confirm(t('shifts.confirmApproveMsg'));
        if (!confirmed) return;

        try {
            setActionLoading(true);
            setActionError(null);

            const response = await ManagerService.updateShiftSubmissionStatus(submissionId, {
                status: 'approved'
            });

            if (response.success) {
                // Refresh detail
                await fetchDetail();
                // Notify parent to refresh list
                onStatusChange?.();
            } else {
                setActionError(response.message || t('localGuides.updateError'));
            }
        } catch (err: any) {
            setActionError(err?.error?.message || t('localGuides.updateError'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!submissionId) return;

        // Validate rejection reason
        if (!rejectionReason.trim()) {
            setActionError(t('shifts.reasonRequired'));
            return;
        }

        try {
            setActionLoading(true);
            setActionError(null);

            const response = await ManagerService.updateShiftSubmissionStatus(submissionId, {
                status: 'rejected',
                rejection_reason: rejectionReason.trim()
            });

            if (response.success) {
                setShowRejectForm(false);
                setRejectionReason('');
                // Refresh detail
                await fetchDetail();
                // Notify parent to refresh list
                onStatusChange?.();
            } else {
                setActionError(response.message || t('localGuides.updateError'));
            }
        } catch (err: any) {
            setActionError(err?.error?.message || t('localGuides.updateError'));
        } finally {
            setActionLoading(false);
        }
    };

    // ============ HELPERS ============
    const getStatusInfo = (status: ShiftSubmissionStatus) => {
        const statuses = {
            pending: { label: t('status.pending'), color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
            approved: { label: t('status.approved'), color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
            rejected: { label: t('status.rejected'), color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
        };
        return statuses[status] || statuses.pending;
    };

    const getDayName = (day: number): string => {
        const date = new Date(2024, 0, day + 1); // Mock date to get day name, carefully chosen week
        // Or better, just map based on language since input is number 0-6 (Sun-Sat)
        if (language === 'vi') {
            const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
            return days[day] || `Ngày ${day}`;
        } else {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return days[day] || `Day ${day}`;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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

    const formatTime = (timeString: string) => {
        return timeString.slice(0, 5);
    };

    // ============ RENDER ============
    if (!isOpen) return null;

    const statusInfo = submission ? getStatusInfo(submission.status) : null;
    const StatusIcon = statusInfo?.icon || Clock;
    const isPending = submission?.status === 'pending';

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
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900">
                        {t('shifts.detailTitle')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
                        </div>
                    )}

                    {/* Error */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Content */}
                    {submission && !loading && (
                        <div className="space-y-6">
                            {/* Status Badge & Type */}
                            <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusInfo?.color}`}>
                                    <StatusIcon className="w-4 h-4" />
                                    {statusInfo?.label}
                                </span>
                                <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                                    {submission.submission_type === 'new' ? t('shifts.typeNew') : t('shifts.typeChange')}
                                </span>
                            </div>

                            {/* Guide Info */}
                            <div className="bg-[#f5f3ee] rounded-xl p-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center">
                                        {submission.guide.avatar_url ? (
                                            <img
                                                src={submission.guide.avatar_url}
                                                alt={submission.guide.full_name}
                                                className="w-14 h-14 rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-7 h-7 text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 text-lg">
                                            {submission.guide.full_name}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-4 h-4" />
                                                {submission.guide.email}
                                            </span>
                                            {submission.guide.phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-4 h-4" />
                                                    {submission.guide.phone}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Week Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#f5f3ee] rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-[#8a6d1c] mb-1">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm font-medium">{t('shifts.weekStart')}</span>
                                    </div>
                                    <p className="text-lg font-semibold text-slate-900">
                                        {formatDate(submission.week_start_date)}
                                    </p>
                                </div>
                                <div className="bg-[#f5f3ee] rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-[#8a6d1c] mb-1">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm font-medium">{t('shifts.totalShifts')}</span>
                                    </div>
                                    <p className="text-lg font-semibold text-slate-900">
                                        {submission.total_shifts} {t('shifts.shiftCount')}
                                    </p>
                                </div>
                            </div>

                            {/* Shifts */}
                            <div>
                                <h4 className="font-medium text-slate-900 mb-3">{t('shifts.shiftsList')}</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {submission.shifts.map((shift) => (
                                        <div
                                            key={shift.id}
                                            className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg"
                                        >
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-700">
                                                {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Changes (Diff) - chỉ hiện khi có thay đổi */}
                            {submission.changes && submission.changes.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-slate-900 mb-3">{t('shifts.changes')}</h4>
                                    <div className="space-y-2">
                                        {submission.changes.map((change: ShiftChange, index: number) => (
                                            <div
                                                key={index}
                                                className={`p-3 rounded-lg border ${change.is_new
                                                    ? 'bg-green-50 border-green-200'
                                                    : change.is_removed
                                                        ? 'bg-red-50 border-red-200'
                                                        : 'bg-yellow-50 border-yellow-200'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    {change.is_new && (
                                                        <Plus className="w-4 h-4 text-green-600" />
                                                    )}
                                                    {change.is_removed && (
                                                        <Minus className="w-4 h-4 text-red-600" />
                                                    )}
                                                    {change.is_changed && (
                                                        <RefreshCw className="w-4 h-4 text-yellow-600" />
                                                    )}
                                                    <span className="font-semibold">
                                                        {getDayName(change.day_of_week)}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${change.is_new
                                                        ? 'bg-green-200 text-green-700'
                                                        : change.is_removed
                                                            ? 'bg-red-200 text-red-700'
                                                            : 'bg-yellow-200 text-yellow-700'
                                                        }`}>
                                                        {change.is_new ? t('shifts.changeNew') : change.is_removed ? t('shifts.changeRemoved') : t('shifts.changeModified')}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-600">
                                                    {change.old && (
                                                        <span className="line-through mr-2">
                                                            {formatTime(change.old.start_time)} - {formatTime(change.old.end_time)}
                                                        </span>
                                                    )}
                                                    {change.new && (
                                                        <span className="font-medium text-slate-900">
                                                            {change.old && '→ '}
                                                            {formatTime(change.new.start_time)} - {formatTime(change.new.end_time)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Change Reason */}
                            {submission.change_reason && (
                                <div className="bg-[#f5f3ee] rounded-xl p-4">
                                    <h4 className="font-medium text-slate-900 mb-2">{t('shifts.changeReason')}</h4>
                                    <p className="text-slate-600">{submission.change_reason}</p>
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {submission.status === 'rejected' && submission.rejection_reason && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <h4 className="font-medium text-red-700 mb-2">{t('shifts.rejectionReason')}</h4>
                                    <p className="text-red-600">{submission.rejection_reason}</p>
                                </div>
                            )}

                            {/* Reject Form - hiện khi click Từ chối */}
                            {showRejectForm && isPending && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <h4 className="font-medium text-red-700 mb-3">{t('shifts.enterRejectionReason')}</h4>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder={t('shifts.rejectionPlaceholder')}
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

                            {/* Timestamps */}
                            <div className="pt-4 border-t border-slate-200 text-sm text-slate-500">
                                <div className="flex justify-between">
                                    <span>{t('shifts.createdAt')}: {formatDateTime(submission.createdAt)}</span>
                                    {submission.approved_at && (
                                        <span>{t('shifts.approvedAt')}: {formatDateTime(submission.approved_at)}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 p-6 border-t border-slate-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        {t('common.close')}
                    </button>

                    {/* Action Buttons - chỉ hiển thị khi status = 'pending' */}
                    {isPending && !loading && (
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
                                        {t('shifts.confirmReject')}
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
                </div>
            </div>
        </div>
    );
};
