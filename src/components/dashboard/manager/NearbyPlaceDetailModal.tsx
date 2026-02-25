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
    Utensils,
    Hotel,
    Heart,
    Navigation,
    ExternalLink
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { NearbyPlace, ContentStatus, NearbyPlaceCategory } from '../../../types/manager.types';
import { useLanguage } from '../../../contexts/LanguageContext';

interface NearbyPlaceDetailModalProps {
    isOpen: boolean;
    place: NearbyPlace | null;
    onClose: () => void;
    onStatusChange?: () => void;
}

/**
 * Modal hiển thị chi tiết NearbyPlace và cho phép Approve/Reject
 * Gold premium theme + i18n support
 */
export const NearbyPlaceDetailModal: React.FC<NearbyPlaceDetailModalProps> = ({
    isOpen,
    place,
    onClose,
    onStatusChange
}) => {
    const { t, language } = useLanguage();

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

        const confirmed = window.confirm(t('content.confirmApproveMsg'));
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
                setActionError(response.message || t('common.error'));
            }
        } catch (err: any) {
            setActionError(err?.error?.message || t('common.error'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!currentPlace) return;

        if (!rejectionReason.trim()) {
            setActionError(t('content.rejectionPlaceholder'));
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
                setActionError(response.message || t('common.error'));
            }
        } catch (err: any) {
            setActionError(err?.error?.message || t('common.error'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleActive = async () => {
        if (!currentPlace) return;

        const confirmed = window.confirm(`${t('content.confirmApproveMsg')}`);
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
            pending: { label: t('status.pending'), color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
            approved: { label: t('status.approved'), color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
            rejected: { label: t('status.rejected'), color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle }
        };
        return statuses[status] || statuses.pending;
    };

    const getCategoryInfo = (category: NearbyPlaceCategory) => {
        const categories = {
            food: { label: t('category.food'), icon: Utensils, color: 'bg-orange-100 text-orange-700', gradient: 'from-amber-500 via-orange-500 to-red-400' },
            lodging: { label: t('category.lodging'), icon: Hotel, color: 'bg-sky-100 text-sky-700', gradient: 'from-sky-500 via-blue-500 to-indigo-400' },
            medical: { label: t('category.medical'), icon: Heart, color: 'bg-rose-100 text-rose-700', gradient: 'from-rose-500 via-pink-500 to-fuchsia-400' }
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
        return new Date(dateString).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
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
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4">
                {/* Hero Header with gradient */}
                <div className={`relative p-6 pb-5 bg-gradient-to-br ${categoryInfo.gradient} text-white overflow-hidden`}>
                    {/* Decorative pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-8 -right-8 w-40 h-40 border-2 border-white rounded-full" />
                        <div className="absolute -bottom-10 -left-10 w-48 h-48 border-2 border-white rounded-full" />
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors z-10"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    {/* Header content */}
                    <div className="relative flex items-center gap-4 mb-3">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
                            <CategoryIcon className="w-7 h-7 text-white drop-shadow-md" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${categoryInfo.color}`}>
                                    <CategoryIcon className="w-3 h-3" />
                                    {categoryInfo.label}
                                </span>
                                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-lg font-mono font-medium border border-white/10">
                                    {currentPlace.code}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold leading-tight drop-shadow-sm truncate pr-8">
                                {currentPlace.name}
                            </h2>
                        </div>
                    </div>

                    {/* Status badges inline in header */}
                    <div className="relative flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm bg-white/90 shadow-sm ${statusInfo.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusInfo.label}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/25 backdrop-blur-md text-white text-xs rounded-lg font-semibold border border-white/10">
                            <Navigation className="w-3 h-3" />
                            {formatDistance(currentPlace.distance_meters)}
                        </span>
                        {!currentPlace.is_active && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/90 backdrop-blur-sm text-white">
                                <Trash2 className="w-3.5 h-3.5" />
                                {t('content.deleted')}
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-260px)]">
                    <div className="space-y-4">
                        {/* Location Info Card — Address + Coords + Phone combined */}
                        <div className="bg-gradient-to-br from-[#f5f3ee] to-[#ece8dc] rounded-2xl p-5 border border-[#d4af37]/20">
                            {/* Address */}
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 border border-[#d4af37]/15 shadow-sm">
                                    <MapPin className="w-4.5 h-4.5 text-[#d4af37]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-[#8a6d1c]/70 font-semibold uppercase tracking-wider mb-0.5">{t('nearby.address')}</p>
                                    <p className="text-slate-700 leading-relaxed text-sm">{currentPlace.address}</p>
                                </div>
                                <button
                                    onClick={openGoogleMaps}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#8a6d1c] bg-white border border-[#d4af37]/20 rounded-lg hover:bg-[#f5f3ee] hover:border-[#d4af37]/40 transition-all flex-shrink-0"
                                >
                                    <Navigation className="w-3 h-3" />
                                    Maps
                                    <ExternalLink className="w-2.5 h-2.5" />
                                </button>
                            </div>

                            {/* Coords + Phone grid */}
                            <div className={`grid ${currentPlace.phone ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
                                <div className="bg-white rounded-xl p-3 border border-[#d4af37]/10">
                                    <p className="text-xs text-[#8a6d1c]/60 font-semibold uppercase tracking-wider mb-1">{t('nearby.latitude')}</p>
                                    <p className="text-slate-900 font-mono font-medium text-sm">{currentPlace.latitude}</p>
                                </div>
                                <div className="bg-white rounded-xl p-3 border border-[#d4af37]/10">
                                    <p className="text-xs text-[#8a6d1c]/60 font-semibold uppercase tracking-wider mb-1">{t('nearby.longitude')}</p>
                                    <p className="text-slate-900 font-mono font-medium text-sm">{currentPlace.longitude}</p>
                                </div>
                                {currentPlace.phone && (
                                    <div className="bg-white rounded-xl p-3 border border-[#d4af37]/10">
                                        <p className="text-xs text-[#8a6d1c]/60 font-semibold uppercase tracking-wider mb-1">{t('nearby.phone')}</p>
                                        <a href={`tel:${currentPlace.phone}`} className="text-[#8a6d1c] hover:text-[#6b5516] font-medium text-sm transition-colors">
                                            {currentPlace.phone}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {currentPlace.description && (
                            <div className="bg-white rounded-xl p-4 border-l-4 border-l-[#d4af37] border border-[#d4af37]/15">
                                <p className="text-xs text-[#8a6d1c]/70 font-semibold uppercase tracking-wider mb-1.5">{t('event.description')}</p>
                                <p className="text-slate-700 leading-relaxed text-sm">{currentPlace.description}</p>
                            </div>
                        )}

                        {/* Proposer */}
                        {currentPlace.proposer && (
                            <div className="bg-white rounded-xl p-4 border border-[#d4af37]/15">
                                <p className="text-xs text-[#8a6d1c]/70 font-semibold uppercase tracking-wider mb-2">{t('nearby.proposer')}</p>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center shadow-sm shadow-[#d4af37]/15 flex-shrink-0">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900 text-sm truncate">{currentPlace.proposer.full_name}</p>
                                        <p className="text-xs text-slate-500 truncate">{currentPlace.proposer.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Timestamps — full width row */}
                        <div className="bg-white rounded-xl p-4 border border-[#d4af37]/15 flex items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5 text-[#8a6d1c] mb-0.5">
                                    <Calendar className="w-3 h-3" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">{t('content.createdAt')}</span>
                                </div>
                                <p className="text-slate-900 font-medium text-sm">{formatDateTime(currentPlace.created_at)}</p>
                            </div>
                            {currentPlace.reviewed_at && (
                                <>
                                    <div className="w-px h-10 bg-[#d4af37]/20 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1.5 text-[#8a6d1c] mb-0.5">
                                            <CheckCircle className="w-3 h-3" />
                                            <span className="text-xs font-semibold uppercase tracking-wider">{t('nearby.reviewedAt')}</span>
                                        </div>
                                        <p className="text-slate-900 font-medium text-sm">{formatDateTime(currentPlace.reviewed_at)}</p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Rejection Reason */}
                        {currentPlace.status === 'rejected' && currentPlace.rejection_reason && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <h4 className="font-medium text-red-700 mb-2">{t('content.rejectionReason')}</h4>
                                <p className="text-red-600 text-sm">{currentPlace.rejection_reason}</p>
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
                                <span className="text-sm">{actionError}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 p-6 border-t border-[#d4af37]/20 bg-gradient-to-r from-[#faf8f3] to-white">
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
                                        {t('content.reject')}
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
                                        {t('content.reject')}
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white rounded-xl shadow-lg shadow-[#d4af37]/20 hover:brightness-110 transition-all disabled:opacity-50"
                                    >
                                        {actionLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Check className="w-4 h-4" />
                                        )}
                                        {t('content.approve')}
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Toggle Active Button */}
                    <button
                        onClick={handleToggleActive}
                        disabled={actionLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all disabled:opacity-50 ${currentPlace.is_active
                            ? 'border border-orange-200 text-orange-600 hover:bg-orange-50'
                            : 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white shadow-lg shadow-[#d4af37]/20 hover:brightness-110'
                            }`}
                    >
                        {actionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : currentPlace.is_active ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <RotateCcw className="w-4 h-4" />
                        )}
                        {currentPlace.is_active ? t('content.hide') : t('content.restore')}
                    </button>
                </div>
            </div>
        </div>
    );
};
