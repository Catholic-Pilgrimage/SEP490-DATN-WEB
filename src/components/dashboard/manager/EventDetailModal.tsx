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

        const confirmed = window.confirm('Bạn có chắc muốn duyệt sự kiện này?');
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
                setActionError(response.message || 'Không thể duyệt sự kiện');
            }
        } catch (err: any) {
            setActionError(err?.error?.message || 'Không thể duyệt sự kiện');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!currentEvent) return;

        if (!rejectionReason.trim()) {
            setActionError('Vui lòng nhập lý do từ chối');
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
                setActionError(response.message || 'Không thể từ chối sự kiện');
            }
        } catch (err: any) {
            setActionError(err?.error?.message || 'Không thể từ chối sự kiện');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleActive = async () => {
        if (!currentEvent) return;

        const action = currentEvent.is_active ? 'Ẩn' : 'Khôi phục';
        const confirmed = window.confirm(`Bạn có chắc muốn ${action.toLowerCase()} sự kiện này?`);
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
                setActionError(response.message || `Không thể ${action.toLowerCase()} sự kiện`);
            }
        } catch (err: any) {
            setActionError(err?.error?.message || `Không thể ${action.toLowerCase()} sự kiện`);
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
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
        return new Date(dateString).toLocaleString('vi-VN', {
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
                <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-500">
                    {currentEvent.banner_url ? (
                        <img
                            src={currentEvent.banner_url}
                            alt={currentEvent.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-16 h-16 text-white/50" />
                        </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
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
                                    Đã xóa
                                </span>
                            )}
                            <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-lg font-mono">
                                {currentEvent.code}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            {currentEvent.name}
                        </h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
                    <div className="space-y-6">
                        {/* Description */}
                        <div className="bg-slate-50 rounded-xl p-4">
                            <h4 className="font-medium text-slate-900 mb-2">Mô tả</h4>
                            <p className="text-slate-600">{currentEvent.description || '(Không có mô tả)'}</p>
                        </div>

                        {/* Date & Time & Location Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Date */}
                            <div className="bg-purple-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-purple-600 mb-2">
                                    <Calendar className="w-5 h-5" />
                                    <span className="font-medium">Thời gian</span>
                                </div>
                                <p className="text-slate-900 font-medium">
                                    {formatDate(currentEvent.start_date)}
                                </p>
                                {currentEvent.start_date !== currentEvent.end_date && (
                                    <p className="text-slate-600 text-sm mt-1">
                                        đến {formatDate(currentEvent.end_date)}
                                    </p>
                                )}
                            </div>

                            {/* Time */}
                            <div className="bg-blue-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-blue-600 mb-2">
                                    <Clock className="w-5 h-5" />
                                    <span className="font-medium">Giờ diễn ra</span>
                                </div>
                                <p className="text-slate-900 font-medium text-lg">
                                    {formatTime(currentEvent.start_time)} - {formatTime(currentEvent.end_time)}
                                </p>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="bg-green-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-green-600 mb-2">
                                <MapPin className="w-5 h-5" />
                                <span className="font-medium">Địa điểm</span>
                            </div>
                            <p className="text-slate-900">{currentEvent.location}</p>
                        </div>

                        {/* Banner URL */}
                        {currentEvent.banner_url && (
                            <div className="bg-slate-50 rounded-xl p-4">
                                <h4 className="font-medium text-slate-900 mb-2">Banner</h4>
                                <a
                                    href={currentEvent.banner_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Mở banner trong tab mới
                                </a>
                            </div>
                        )}

                        {/* Creator Info */}
                        {currentEvent.creator && (
                            <div className="bg-slate-50 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">
                                            {currentEvent.creator.full_name}
                                        </h4>
                                        <p className="text-sm text-slate-500">{currentEvent.creator.email}</p>
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
                                    {formatDateTime(currentEvent.created_at)}
                                </p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-purple-600 mb-1">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-medium">Cập nhật</span>
                                </div>
                                <p className="text-slate-900 font-medium">
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
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors disabled:opacity-50 ${currentEvent.is_active
                            ? 'border border-orange-200 text-orange-600 hover:bg-orange-50'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {actionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : currentEvent.is_active ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <RotateCcw className="w-4 h-4" />
                        )}
                        {currentEvent.is_active ? 'Ẩn sự kiện' : 'Khôi phục'}
                    </button>
                </div>
            </div>
        </div>
    );
};
