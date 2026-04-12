import { useCallback, useEffect, useState } from 'react';
import {
    AlertCircle,
    AlertTriangle,
    Ban,
    Calendar,
    Check,
    CheckCircle,
    Clock,
    Loader2,
    Mail,
    Minus,
    Phone,
    Plus,
    RefreshCw,
    User,
    X,
    XCircle,
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { ManagerService } from '../../../services/manager.service';
import { ShiftChange, ShiftSubmissionDetail, ShiftSubmissionStatus } from '../../../types/manager.types';
import { extractErrorMessage } from '../../../lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

/**
 * Chi tiết + duyệt/từ chối submission.
 * - GET   /api/manager/local-guides/shift-submissions/{id}
 * - PATCH /api/manager/local-guides/shift-submissions/{id}/status
 */

interface ShiftSubmissionDetailModalProps {
    isOpen: boolean;
    submissionId: string | null;
    onClose: () => void;
    onStatusChange?: () => void;
}

export const ShiftSubmissionDetailModal: React.FC<ShiftSubmissionDetailModalProps> = ({
    isOpen,
    submissionId,
    onClose,
    onStatusChange
}) => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();

    const [submission, setSubmission] = useState<ShiftSubmissionDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionError, setActionError] = useState<string | null>(null);
    const [showConfirmApprove, setShowConfirmApprove] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setSubmission(null);
            setError(null);
            setShowRejectForm(false);
            setRejectionReason('');
            setActionError(null);
            setShowConfirmApprove(false);
        }
    }, [isOpen]);

    const fetchDetail = useCallback(async () => {
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
        } catch (err: unknown) {
            setError(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [submissionId, t]);

    useEffect(() => {
        if (isOpen && submissionId) {
            fetchDetail();
        }
    }, [isOpen, submissionId, fetchDetail]);

    const handleApprove = () => {
        if (!submissionId) return;
        setShowConfirmApprove(true);
    };

    const handleConfirmApprove = async () => {
        if (!submissionId) return;

        try {
            setActionLoading(true);
            setActionError(null);

            const response = await ManagerService.updateShiftSubmissionStatus(submissionId, {
                status: 'approved'
            });

            if (response.success) {
                showToast('success', t('toast.shiftApproved'));
                setShowConfirmApprove(false);
                onStatusChange?.();
                onClose();
            } else {
                setActionError(response.message || t('localGuides.updateError'));
            }
        } catch (err: unknown) {
            setActionError(extractErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!submissionId) return;

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
                showToast('success', t('toast.shiftRejected'));
                setShowRejectForm(false);
                setRejectionReason('');
                onStatusChange?.();
                onClose();
            } else {
                setActionError(response.message || t('localGuides.updateError'));
            }
        } catch (err: unknown) {
            setActionError(extractErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusInfo = (status: ShiftSubmissionStatus) => {
        const statuses = {
            pending: { label: t('status.pending'), color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
            approved: { label: t('status.approved'), color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
            rejected: { label: t('status.rejected'), color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
        };
        return statuses[status] || statuses.pending;
    };

    const getDayName = (day: number): string => {
        const days = language === 'vi'
            ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
            : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[day] || (language === 'vi' ? `Ngay ${day}` : `Day ${day}`);
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

    const handleDialogChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };

    const handleApproveDialogChange = (open: boolean) => {
        if (!actionLoading) {
            setShowConfirmApprove(open);
        }
    };

    if (!isOpen) return null;

    const statusInfo = submission ? getStatusInfo(submission.status) : null;
    const StatusIcon = statusInfo?.icon || Clock;
    const isPending = submission?.status === 'pending';

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleDialogChange}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden border-[#d4af37]/20 rounded-2xl p-0 gap-0 [&>button]:hidden">
                    <DialogHeader className="p-6 border-b border-slate-200">
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1 text-left">
                                <DialogTitle className="text-xl font-semibold text-slate-900">
                                    {t('shifts.detailTitle')}
                                </DialogTitle>
                                <DialogDescription className="sr-only">
                                    {t('shifts.detailTitle')}
                                </DialogDescription>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        {loading && (
                            <div className="flex items-center justify-center h-48">
                                <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
                            </div>
                        )}

                        {error && !loading && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {submission && !loading && (
                            <div className="space-y-6">
                                <div className="flex flex-wrap items-center gap-3">
                                    <Badge
                                        variant="outline"
                                        className={`gap-1.5 rounded-full px-3 py-1.5 text-sm ${statusInfo?.color}`}
                                    >
                                        <StatusIcon className="w-4 h-4" />
                                        {statusInfo?.label}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600 border-slate-200"
                                    >
                                        {submission.submission_type === 'new' ? t('shifts.typeNew') : t('shifts.typeChange')}
                                    </Badge>
                                </div>

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
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-1">
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

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                                <div>
                                    <h4 className="font-medium text-slate-900 mb-3">{t('shifts.shiftsList')}</h4>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {submission.shifts.map((shift) => (
                                            <div
                                                key={shift.id}
                                                className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg"
                                            >
                                                <span className="font-semibold text-slate-900 w-8">
                                                    {getDayName(shift.day_of_week)}
                                                </span>
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                <span className="text-slate-700">
                                                    {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

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
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
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
                                                        <Badge
                                                            variant="outline"
                                                            className={`${change.is_new
                                                                ? 'bg-green-200 text-green-700 border-green-200'
                                                                : change.is_removed
                                                                    ? 'bg-red-200 text-red-700 border-red-200'
                                                                    : 'bg-yellow-200 text-yellow-700 border-yellow-200'
                                                                }`}
                                                        >
                                                            {change.is_new ? t('shifts.changeNew') : change.is_removed ? t('shifts.changeRemoved') : t('shifts.changeModified')}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-slate-600">
                                                        {change.old && (
                                                            <span className="line-through mr-2">
                                                                {formatTime(change.old.start_time)} - {formatTime(change.old.end_time)}
                                                            </span>
                                                        )}
                                                        {change.new && (
                                                            <span className="font-medium text-slate-900">
                                                                {change.old && '-> '}
                                                                {formatTime(change.new.start_time)} - {formatTime(change.new.end_time)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {submission.change_reason && (
                                    <div className="bg-[#f5f3ee] rounded-xl p-4">
                                        <h4 className="font-medium text-slate-900 mb-2">{t('shifts.changeReason')}</h4>
                                        <p className="text-slate-600">{submission.change_reason}</p>
                                    </div>
                                )}

                                {submission.status === 'rejected' && submission.rejection_reason && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                        <h4 className="font-medium text-red-700 mb-2">{t('shifts.rejectionReason')}</h4>
                                        <p className="text-red-600">{submission.rejection_reason}</p>
                                    </div>
                                )}

                                {showRejectForm && isPending && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                        <h4 className="font-medium text-red-700 mb-3">{t('shifts.enterRejectionReason')}</h4>
                                        <Textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder={t('shifts.rejectionPlaceholder')}
                                            className="min-h-[96px] resize-none border-red-200 focus-visible:ring-red-500"
                                            rows={3}
                                            disabled={actionLoading}
                                        />
                                    </div>
                                )}

                                {actionError && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <span>{actionError}</span>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-slate-200 text-sm text-slate-500">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <span>{t('shifts.createdAt')}: {formatDateTime(submission.createdAt)}</span>
                                        {submission.approved_at && (
                                            <span>{t('shifts.approvedAt')}: {formatDateTime(submission.approved_at)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 p-6 border-t border-slate-200 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                            {t('common.close')}
                        </Button>

                        {isPending && !loading && (
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                {showRejectForm ? (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowRejectForm(false);
                                                setRejectionReason('');
                                                setActionError(null);
                                            }}
                                            disabled={actionLoading}
                                            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleReject}
                                            disabled={actionLoading || !rejectionReason.trim()}
                                            className="rounded-xl bg-red-600 text-white hover:bg-red-700"
                                        >
                                            {actionLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Ban className="w-4 h-4" />
                                            )}
                                            {t('shifts.confirmReject')}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowRejectForm(true)}
                                            disabled={actionLoading}
                                            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            {t('common.reject')}
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleApprove}
                                            disabled={actionLoading}
                                            className="rounded-xl bg-green-600 text-white hover:bg-green-700"
                                        >
                                            {actionLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Check className="w-4 h-4" />
                                            )}
                                            {t('common.approve')}
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showConfirmApprove} onOpenChange={handleApproveDialogChange}>
                <AlertDialogContent className="max-w-md p-0 overflow-hidden border-[#d4af37]/20 rounded-2xl gap-0">
                    <AlertDialogHeader className="px-6 py-4 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37]">
                        <div className="flex items-start justify-between gap-4">
                            <div className="text-left text-white">
                                <AlertDialogTitle className="text-lg font-semibold">
                                    {t('common.approve')}
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-sm text-white/80">
                                    {submission?.guide?.full_name}
                                </AlertDialogDescription>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowConfirmApprove(false)}
                                disabled={actionLoading}
                                className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </AlertDialogHeader>

                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-full flex-shrink-0 bg-green-50 border border-green-200">
                                <AlertTriangle className="w-6 h-6 text-green-500" />
                            </div>
                            <p className="text-gray-600">
                                {t('shifts.confirmApproveMsg')}
                            </p>
                        </div>

                        <AlertDialogFooter className="mt-6 pt-4 border-t border-[#d4af37]/20 flex-row items-center justify-end gap-3 space-x-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowConfirmApprove(false)}
                                disabled={actionLoading}
                                className="flex-1 border-[#d4af37]/30 text-[#8a6d1c] rounded-xl hover:bg-[#d4af37]/10"
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleConfirmApprove}
                                disabled={actionLoading}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl"
                            >
                                {actionLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                                {t('common.approve')}
                            </Button>
                        </AlertDialogFooter>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
