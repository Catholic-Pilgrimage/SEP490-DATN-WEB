import React, { useEffect, useState } from 'react';
import {
    X,
    Loader2,
    User,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Image,
    Video,
    ExternalLink,
    Check,
    Ban,
    Trash2,
    Calendar,
    RotateCcw,
    EyeOff
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { Media, MediaType, ContentStatus } from '../../../types/manager.types';

interface MediaDetailModalProps {
    isOpen: boolean;
    media: Media | null;  // Media đã có từ list, không cần fetch
    onClose: () => void;
    onStatusChange?: () => void;  // Callback khi status thay đổi (để refresh list)
}

/**
 * Modal hiển thị chi tiết Media và cho phép Approve/Reject
 * 
 * Giải thích:
 * - Hiển thị full thông tin của media
 * - Preview hình ảnh hoặc video
 * - Nút Approve/Reject khi status = 'pending'
 * - Form nhập lý do khi Reject
 */
export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
    isOpen,
    media,
    onClose,
    onStatusChange
}) => {
    // ============ APPROVE/REJECT STATE ============
    const [actionLoading, setActionLoading] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionError, setActionError] = useState<string | null>(null);
    const [currentMedia, setCurrentMedia] = useState<Media | null>(media);

    // ============ RESET STATE ============
    useEffect(() => {
        if (isOpen && media) {
            setCurrentMedia(media);
            setShowRejectForm(false);
            setRejectionReason('');
            setActionError(null);
        }
    }, [isOpen, media]);

    // ============ ACTIONS ============
    const handleApprove = async () => {
        if (!currentMedia) return;

        const confirmed = window.confirm('Bạn có chắc muốn duyệt media này?');
        if (!confirmed) return;

        try {
            setActionLoading(true);
            setActionError(null);

            const response = await ManagerService.updateMediaStatus(currentMedia.id, {
                status: 'approved'
            });

            if (response.success && response.data) {
                setCurrentMedia(response.data);
                onStatusChange?.();
            } else {
                setActionError(response.message || 'Không thể duyệt media');
            }
        } catch (err: any) {
            setActionError(err?.error?.message || 'Không thể duyệt media');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!currentMedia) return;

        if (!rejectionReason.trim()) {
            setActionError('Vui lòng nhập lý do từ chối');
            return;
        }

        try {
            setActionLoading(true);
            setActionError(null);

            const response = await ManagerService.updateMediaStatus(currentMedia.id, {
                status: 'rejected',
                rejection_reason: rejectionReason.trim()
            });

            if (response.success && response.data) {
                setCurrentMedia(response.data);
                setShowRejectForm(false);
                setRejectionReason('');
                onStatusChange?.();
            } else {
                setActionError(response.message || 'Không thể từ chối media');
            }
        } catch (err: any) {
            setActionError(err?.error?.message || 'Không thể từ chối media');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle toggle is_active (soft delete / restore)
    const handleToggleActive = async () => {
        if (!currentMedia) return;

        const action = currentMedia.is_active ? 'Ẩn' : 'Khôi phục';
        const confirmed = window.confirm(`Bạn có chắc muốn ${action.toLowerCase()} media này?`);
        if (!confirmed) return;

        try {
            setActionLoading(true);
            setActionError(null);

            const response = await ManagerService.toggleMediaActive(currentMedia.id, {
                is_active: !currentMedia.is_active
            });

            if (response.success && response.data) {
                setCurrentMedia(response.data);
                onStatusChange?.();
            } else {
                setActionError(response.message || `Không thể ${action.toLowerCase()} media`);
            }
        } catch (err: any) {
            setActionError(err?.error?.message || `Không thể ${action.toLowerCase()} media`);
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

    const getTypeInfo = (type: MediaType) => {
        const types = {
            image: { label: 'Hình ảnh', icon: Image, color: 'text-blue-600 bg-blue-100' },
            video: { label: 'Video', icon: Video, color: 'text-red-600 bg-red-100' },
            panorama: { label: 'Panorama', icon: Image, color: 'text-purple-600 bg-purple-100' }
        };
        return types[type] || types.image;
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

    const isYoutubeUrl = (url: string) => {
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const getYoutubeEmbedUrl = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const videoId = match && match[2].length === 11 ? match[2] : null;
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    // ============ RENDER ============
    if (!isOpen || !currentMedia) return null;

    const statusInfo = getStatusInfo(currentMedia.status);
    const typeInfo = getTypeInfo(currentMedia.type);
    const StatusIcon = statusInfo.icon;
    const TypeIcon = typeInfo.icon;
    const isPending = currentMedia.status === 'pending';

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden mx-4 my-8 flex-shrink-0">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Chi tiết Media
                        </h2>
                        <span className="text-sm text-slate-400">{currentMedia.code}</span>
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
                        {/* Media Preview */}
                        <div className="rounded-xl overflow-hidden bg-slate-100">
                            {currentMedia.type === 'video' && isYoutubeUrl(currentMedia.url) ? (
                                <div className="aspect-video">
                                    <iframe
                                        src={getYoutubeEmbedUrl(currentMedia.url) || ''}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            ) : currentMedia.type === 'image' || currentMedia.type === 'panorama' ? (
                                <img
                                    src={currentMedia.url}
                                    alt={currentMedia.caption}
                                    className="w-full max-h-96 object-contain"
                                />
                            ) : (
                                <div className="aspect-video flex items-center justify-center">
                                    <Video className="w-16 h-16 text-slate-300" />
                                </div>
                            )}
                        </div>

                        {/* Status & Type Badges */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                {statusInfo.label}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${typeInfo.color}`}>
                                <TypeIcon className="w-4 h-4" />
                                {typeInfo.label}
                            </span>
                            {!currentMedia.is_active && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-500 text-white">
                                    <Trash2 className="w-4 h-4" />
                                    Đã xóa
                                </span>
                            )}
                        </div>

                        {/* Caption */}
                        <div className="bg-slate-50 rounded-xl p-4">
                            <h4 className="font-medium text-slate-900 mb-2">Mô tả</h4>
                            <p className="text-slate-600">{currentMedia.caption}</p>
                        </div>

                        {/* Creator Info */}
                        {currentMedia.creator && (
                            <div className="bg-slate-50 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">
                                            {currentMedia.creator.full_name}
                                        </h4>
                                        <p className="text-sm text-slate-500">{currentMedia.creator.email}</p>
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
                                    {formatDateTime(currentMedia.created_at)}
                                </p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-purple-600 mb-1">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-medium">Cập nhật</span>
                                </div>
                                <p className="text-slate-900 font-medium">
                                    {formatDateTime(currentMedia.updated_at)}
                                </p>
                            </div>
                        </div>

                        {/* Rejection Reason (if rejected) */}
                        {currentMedia.status === 'rejected' && currentMedia.rejection_reason && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <h4 className="font-medium text-red-700 mb-2">Lý do từ chối</h4>
                                <p className="text-red-600">{currentMedia.rejection_reason}</p>
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

                        {/* Open URL Button */}
                        <a
                            href={currentMedia.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Mở trong tab mới
                        </a>
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

                    {/* Action Buttons - chỉ hiển thị khi status = 'pending' */}
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

                    {/* Toggle Active Button - luôn hiển thị */}
                    <button
                        onClick={handleToggleActive}
                        disabled={actionLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors disabled:opacity-50 ${currentMedia.is_active
                            ? 'border border-orange-200 text-orange-600 hover:bg-orange-50'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {actionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : currentMedia.is_active ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <RotateCcw className="w-4 h-4" />
                        )}
                        {currentMedia.is_active ? 'Ẩn media' : 'Khôi phục'}
                    </button>
                </div>
            </div>
        </div>
    );
};
