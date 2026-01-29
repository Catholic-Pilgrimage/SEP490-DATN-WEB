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
    Phone,
    Utensils,
    Hotel,
    Heart,
    Navigation,
    ExternalLink
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { NearbyPlace, ContentStatus, NearbyPlaceCategory } from '../../../types/manager.types';

interface NearbyPlaceDetailModalProps {
    isOpen: boolean;
    place: NearbyPlace | null;
    onClose: () => void;
    onStatusChange?: () => void;
}

/**
 * Modal hiển thị chi tiết NearbyPlace và cho phép Approve/Reject
 */
export const NearbyPlaceDetailModal: React.FC<NearbyPlaceDetailModalProps> = ({
    isOpen,
    place,
    onClose,
    onStatusChange
}) => {
    // ============ STATE ============
    const [actionLoading, setActionLoading] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionError, setActionError] = useState<string | null>(null);
    const [currentPlace, setCurrentPlace] = useState<NearbyPlace | null>(place);

    // ============ RESET STATE ============
    useEffect(() => {
        if (isOpen && place) {
            setCurrentPlace(place);
            setShowRejectForm(false);
            setRejectionReason('');
            setActionError(null);
        }
    }, [isOpen, place]);

    // ============ ACTIONS ============
    const handleApprove = async () => {
        if (!currentPlace) return;

        const confirmed = window.confirm('Bạn có chắc muốn duyệt địa điểm này?');
        if (!confirmed) return;

        try {
            setActionLoading(true);
            setActionError(null);

            const response = await ManagerService.updateNearbyPlaceStatus(currentPlace.id, {
                status: 'approved'
            });

            if (response.success && response.data) {
                setCurrentPlace(response.data);
                onStatusChange?.();
            } else {
                setActionError(response.message || 'Không thể duyệt địa điểm');
            }
        } catch (err: any) {
            setActionError(err?.error?.message || 'Không thể duyệt địa điểm');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!currentPlace) return;

        if (!rejectionReason.trim()) {
            setActionError('Vui lòng nhập lý do từ chối');
            return;
        }

        try {
            setActionLoading(true);
            setActionError(null);

            const response = await ManagerService.updateNearbyPlaceStatus(currentPlace.id, {
                status: 'rejected',
                rejection_reason: rejectionReason.trim()
            });

            if (response.success && response.data) {
                setCurrentPlace(response.data);
                setShowRejectForm(false);
                setRejectionReason('');
                onStatusChange?.();
            } else {
                setActionError(response.message || 'Không thể từ chối địa điểm');
            }
        } catch (err: any) {
            setActionError(err?.error?.message || 'Không thể từ chối địa điểm');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleActive = async () => {
        if (!currentPlace) return;

        const action = currentPlace.is_active ? 'Ẩn' : 'Khôi phục';
        const confirmed = window.confirm(`Bạn có chắc muốn ${action.toLowerCase()} địa điểm này?`);
        if (!confirmed) return;

        try {
            setActionLoading(true);
            setActionError(null);

            const response = await ManagerService.toggleNearbyPlaceActive(currentPlace.id, {
                is_active: !currentPlace.is_active
            });

            if (response.success && response.data) {
                setCurrentPlace(response.data);
                onStatusChange?.();
            } else {
                setActionError(response.message || `Không thể ${action.toLowerCase()} địa điểm`);
            }
        } catch (err: any) {
            setActionError(err?.error?.message || `Không thể ${action.toLowerCase()} địa điểm`);
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

    const getCategoryInfo = (category: NearbyPlaceCategory) => {
        const categories = {
            food: { label: 'Ẩm thực', icon: Utensils, color: 'bg-orange-100 text-orange-700', gradient: 'from-orange-500 to-red-500' },
            lodging: { label: 'Lưu trú', icon: Hotel, color: 'bg-blue-100 text-blue-700', gradient: 'from-blue-500 to-indigo-500' },
            medical: { label: 'Y tế', icon: Heart, color: 'bg-red-100 text-red-700', gradient: 'from-red-500 to-pink-500' }
        };
        return categories[category] || categories.food;
    };

    const formatDistance = (meters: number): string => {
        if (meters < 1000) {
            return `${meters}m`;
        }
        return `${(meters / 1000).toFixed(1)}km`;
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

    const openGoogleMaps = () => {
        if (currentPlace) {
            const url = `https://www.google.com/maps?q=${currentPlace.latitude},${currentPlace.longitude}`;
            window.open(url, '_blank');
        }
    };

    // ============ RENDER ============
    if (!isOpen || !currentPlace) return null;

    const statusInfo = getStatusInfo(currentPlace.status);
    const StatusIcon = statusInfo.icon;
    const categoryInfo = getCategoryInfo(currentPlace.category);
    const CategoryIcon = categoryInfo.icon;
    const isPending = currentPlace.status === 'pending';

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
                <div className={`p-6 bg-gradient-to-r ${categoryInfo.gradient} text-white`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <CategoryIcon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                                        {categoryInfo.label}
                                    </span>
                                    <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-lg font-mono">
                                        {currentPlace.code}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold">
                                    {currentPlace.name}
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-3 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {statusInfo.label}
                    </span>
                    {!currentPlace.is_active && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-500 text-white">
                            <Trash2 className="w-4 h-4" />
                            Đã xóa
                        </span>
                    )}
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        Cách {formatDistance(currentPlace.distance_meters)}
                    </span>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
                    <div className="space-y-5">
                        {/* Address */}
                        <div className="bg-slate-50 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-medium text-slate-900 mb-1">Địa chỉ</h4>
                                    <p className="text-slate-600">{currentPlace.address}</p>
                                    <button
                                        onClick={openGoogleMaps}
                                        className="inline-flex items-center gap-2 mt-2 text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        <Navigation className="w-4 h-4" />
                                        Mở trên Google Maps
                                        <ExternalLink className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Coordinates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-xl p-4">
                                <p className="text-sm text-blue-600 mb-1">Vĩ độ (Lat)</p>
                                <p className="text-slate-900 font-mono font-medium">{currentPlace.latitude}</p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-4">
                                <p className="text-sm text-purple-600 mb-1">Kinh độ (Lng)</p>
                                <p className="text-slate-900 font-mono font-medium">{currentPlace.longitude}</p>
                            </div>
                        </div>

                        {/* Phone */}
                        {currentPlace.phone && (
                            <div className="bg-green-50 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-green-600" />
                                    <div>
                                        <h4 className="font-medium text-slate-900 mb-1">Số điện thoại</h4>
                                        <a href={`tel:${currentPlace.phone}`} className="text-green-600 hover:text-green-800 font-medium">
                                            {currentPlace.phone}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {currentPlace.description && (
                            <div className="bg-slate-50 rounded-xl p-4">
                                <h4 className="font-medium text-slate-900 mb-2">Mô tả</h4>
                                <p className="text-slate-600">{currentPlace.description}</p>
                            </div>
                        )}

                        {/* Proposer Info */}
                        {currentPlace.proposer && (
                            <div className="bg-slate-50 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${categoryInfo.gradient} flex items-center justify-center`}>
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">
                                            {currentPlace.proposer.full_name}
                                        </h4>
                                        <p className="text-sm text-slate-500">{currentPlace.proposer.email}</p>
                                        <p className="text-xs text-slate-400 mt-1">Người đề xuất</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Dates */}
                        <div className="bg-slate-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm">Đề xuất lúc: </span>
                                <span className="font-medium text-slate-900">{formatDateTime(currentPlace.created_at)}</span>
                            </div>
                        </div>

                        {/* Rejection Reason */}
                        {currentPlace.status === 'rejected' && currentPlace.rejection_reason && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <h4 className="font-medium text-red-700 mb-2">Lý do từ chối</h4>
                                <p className="text-red-600">{currentPlace.rejection_reason}</p>
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
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors disabled:opacity-50 ${currentPlace.is_active
                                ? 'border border-orange-200 text-orange-600 hover:bg-orange-50'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {actionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : currentPlace.is_active ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <RotateCcw className="w-4 h-4" />
                        )}
                        {currentPlace.is_active ? 'Ẩn địa điểm' : 'Khôi phục'}
                    </button>
                </div>
            </div>
        </div>
    );
};
