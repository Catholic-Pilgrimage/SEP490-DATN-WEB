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
    EyeOff
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { Schedule, ContentStatus } from '../../../types/manager.types';

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
    // ============ STATE ============
    const [actionLoading, setActionLoading] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionError, setActionError] = useState<string | null>(null);
    const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(schedule);

    // ============ RESET STATE ============
    useEffect(() => {
        if (isOpen && schedule) {
            setCurrentSchedule(schedule);
            setShowRejectForm(false);
            setRejectionReason('');
            setActionError(null);
        }
    }, [isOpen, schedule]);

    // ============ ACTIONS ============
    const handleApprove = async () => {
        if (!currentSchedule) return;

        const confirmed = window.confirm('Bạn có chắc muốn duyệt lịch lễ này?');
        if (!confirmed) return;

        try {
            setActionLoading(true);
            setActionError(null);

            const response = await ManagerService.updateScheduleStatus(currentSchedule.id, {
                status: 'approved'
            });

            if (response.success && response.data) {
                setCurrentSchedule(response.data);
                onStatusChange?.();
            } else {
                setActionError(response.message || 'Không thể duyệt lịch lễ');
            }
        } catch (err: any) {
            setActionError(err?.error?.message || 'Không thể duyệt lịch lễ');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!currentSchedule) return;

        if (!rejectionReason.trim()) {
            setActionError('Vui lòng nhập lý do từ chối');
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
                setCurrentSchedule(response.data);
                setShowRejectForm(false);
                setRejectionReason('');
                onStatusChange?.();
            } else {
                setActionError(response.message || 'Không thể từ chối lịch lễ');
            }
        } catch (err: any) {
            setActionError(err?.error?.message || 'Không thể từ chối lịch lễ');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleActive = async () => {
        if (!currentSchedule) return;

        const action = currentSchedule.is_active ? 'Ẩn' : 'Khôi phục';
        const confirmed = window.confirm(`Bạn có chắc muốn ${action.toLowerCase()} lịch lễ này?`);
        if (!confirmed) return;

        try {
            setActionLoading(true);
            setActionError(null);

            const response = await ManagerService.toggleScheduleActive(currentSchedule.id, {
                is_active: !currentSchedule.is_active
            });

            if (response.success && response.data) {
                setCurrentSchedule(response.data);
                onStatusChange?.();
            } else {
                setActionError(response.message || `Không thể ${action.toLowerCase()} lịch lễ`);
            }
        } catch (err: any) {
            setActionError(err?.error?.message || `Không thể ${action.toLowerCase()} lịch lễ`);
        } finally {
            setActionLoading(false);
        }
    };

    // ============ HELPERS ============
    const getStatusInfo = (status: ContentStatus) => {
        const statuses = {
            pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
            approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
            rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
        };
        return statuses[status] || statuses.pending;
    };

    const getDayName = (day: number): string => {
        const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return days[day] || '';
    };

    const formatTime = (time: string): string => {
        return time.slice(0, 5);
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">
                                Chi tiết Lịch lễ
                            </h2>
                            <span className="text-sm text-slate-400">{currentSchedule.code}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="space-y-6">
                        {/* Status Badge */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                {statusInfo.label}
                            </span>
                            {!currentSchedule.is_active && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-500 text-white">
                                    <Trash2 className="w-4 h-4" />
                                    Đã xóa
                                </span>
                            )}
                        </div>

                        {/* Time Info */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                                    <Clock className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Giờ lễ</p>
                                    <p className="text-3xl font-bold text-slate-900">
                                        {formatTime(currentSchedule.time)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Days of Week */}
                        <div className="bg-slate-50 rounded-xl p-4">
                            <h4 className="font-medium text-slate-900 mb-3">Các ngày trong tuần</h4>
                            <div className="flex flex-wrap gap-2">
                                {currentSchedule.days_of_week.map(day => (
                                    <span
                                        key={day}
                                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium"
                                    >
                                        {getDayName(day)}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Note */}
                        <div className="bg-slate-50 rounded-xl p-4">
                            <h4 className="font-medium text-slate-900 mb-2">Ghi chú</h4>
                            <p className="text-slate-600">{currentSchedule.note || '(Không có ghi chú)'}</p>
                        </div>

                        {/* Creator Info */}
                        {currentSchedule.creator && (
                            <div className="bg-slate-50 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">
                                            {currentSchedule.creator.full_name}
                                        </h4>
                                        <p className="text-sm text-slate-500">{currentSchedule.creator.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-blue-600 mb-1">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm font-medium">Ngày tạo</span>
                                </div>
                                <p className="text-slate-900 font-medium">
                                    {formatDateTime(currentSchedule.created_at)}
                                </p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-purple-600 mb-1">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-medium">Cập nhật</span>
                                </div>
                                <p className="text-slate-900 font-medium">
                                    {formatDateTime(currentSchedule.updated_at)}
                                </p>
                            </div>
                        </div>

                        {/* Rejection Reason */}
                        {currentSchedule.status === 'rejected' && currentSchedule.rejection_reason && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <h4 className="font-medium text-red-700 mb-2">Lý do từ chối</h4>
                                <p className="text-red-600">{currentSchedule.rejection_reason}</p>
                            </div>
                        )}

                        {/* Reject Form */}
                        {showRejectForm && isPending && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <h4 className="font-medium text-red-700 mb-3">Nhập lý do từ chối</h4>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Vui lòng nhập lý do từ chối..."
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
                <div className="flex items-center justify-between gap-3 p-6 border-t border-slate-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Đóng
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
                                        Hủy
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
                                        Xác nhận từ chối
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
                                        Từ chối
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
                                        Duyệt
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Toggle Active Button */}
                    <button
                        onClick={handleToggleActive}
                        disabled={actionLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors disabled:opacity-50 ${currentSchedule.is_active
                            ? 'border border-orange-200 text-orange-600 hover:bg-orange-50'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {actionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : currentSchedule.is_active ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <RotateCcw className="w-4 h-4" />
                        )}
                        {currentSchedule.is_active ? 'Ẩn lịch lễ' : 'Khôi phục'}
                    </button>
                </div>
            </div>
        </div>
    );
};
