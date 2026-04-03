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
    Check,
    Ban,
    Trash2,
    Calendar,
    RotateCcw,
    EyeOff,
    Box,
    AlertTriangle,
    Mic
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { Media, MediaType, ContentStatus } from '../../../types/manager.types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { Model3DViewer } from '../../shared/Model3DViewer';

interface MediaDetailModalProps {
    isOpen: boolean;
    media: Media | null;
    onClose: () => void;
    onStatusChange?: () => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
    isOpen,
    media,
    onClose,
    onStatusChange
}) => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();

    // ============ STATE ============
    const [actionLoading, setActionLoading] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showNarrativeRejectForm, setShowNarrativeRejectForm] = useState(false);
    const [narrativeRejectReason, setNarrativeRejectReason] = useState('');
    const [actionError, setActionError] = useState<string | null>(null);
    const [currentMedia, setCurrentMedia] = useState<Media | null>(media);

    // Confirm Modal State
    const [confirmAction, setConfirmAction] = useState<'approve' | 'toggle_active' | 'approve_narrative' | null>(null);

    // ============ RESET STATE ============
    useEffect(() => {
        if (isOpen && media) {
            setCurrentMedia(media);
            setShowRejectForm(false);
            setRejectionReason('');
            setShowNarrativeRejectForm(false);
            setNarrativeRejectReason('');
            setActionError(null);
            setConfirmAction(null);
        }
    }, [isOpen, media]);

    // ============ ACTIONS ============
    const handleApproveClick = () => setConfirmAction('approve');
    const handleToggleActiveClick = () => setConfirmAction('toggle_active');
    const handleNarrativeApproveClick = () => setConfirmAction('approve_narrative');

    const executeAction = async () => {
        if (!currentMedia || !confirmAction) return;

        try {
            setActionLoading(true);
            setActionError(null);

            if (confirmAction === 'approve') {
                const response = await ManagerService.updateMediaStatus(currentMedia.id, {
                    status: 'approved'
                });

                if (response.success && response.data) {
                    showToast('success', t('toast.approveSuccess') || 'Đã duyệt nội dung thành công');
                    setCurrentMedia(response.data);
                    onStatusChange?.();
                    onClose();
                } else {
                    setActionError(response.message || t('common.error'));
                }
            } else if (confirmAction === 'toggle_active') {
                const response = await ManagerService.toggleMediaActive(currentMedia.id, {
                    is_active: !currentMedia.is_active
                });

                if (response.success && response.data) {
                    showToast('success', currentMedia.is_active ? (t('toast.hideSuccess') || 'Đã ẩn nội dung') : (t('toast.restoreSuccess') || 'Đã hiển thị nội dung'));
                    setCurrentMedia(response.data);
                    onStatusChange?.();
                    onClose();
                } else {
                    setActionError(response.message || t('common.error'));
                }
            } else if (confirmAction === 'approve_narrative') {
                const response = await ManagerService.updateMediaNarrativeStatus(currentMedia.id, {
                    status: 'approved'
                });

                if (response.success && response.data) {
                    const d = response.data;
                    setCurrentMedia((prev) =>
                        prev
                            ? {
                                  ...prev,
                                  narrative_status: d.narrative_status,
                                  audio_url: d.audio_url ?? prev.audio_url,
                                  narration_text: d.narration_text ?? prev.narration_text,
                                  narrative_rejection_reason:
                                      d.narrative_rejection_reason ?? null
                              }
                            : null
                    );
                    showToast(
                        'success',
                        response.message || t('toast.narrativeApproveSuccess')
                    );
                    onStatusChange?.();
                } else {
                    setActionError(response.message || t('common.error'));
                }
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : t('common.error');
            setActionError(message);
        } finally {
            setActionLoading(false);
            setConfirmAction(null);
        }
    };

    const handleReject = async () => {
        if (!currentMedia) return;

        if (!rejectionReason.trim()) {
            setActionError(t('content.reasonRequired'));
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
                showToast('success', t('toast.rejectSuccess') || 'Đã từ chối nội dung');
                setCurrentMedia(response.data);
                setShowRejectForm(false);
                setRejectionReason('');
                onStatusChange?.();
                onClose();
            } else {
                setActionError(response.message || t('common.error'));
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : t('common.error');
            setActionError(message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleNarrativeReject = async () => {
        if (!currentMedia) return;

        if (!narrativeRejectReason.trim()) {
            setActionError(t('content.reasonRequired'));
            return;
        }

        try {
            setActionLoading(true);
            setActionError(null);

            const response = await ManagerService.updateMediaNarrativeStatus(currentMedia.id, {
                status: 'rejected',
                rejection_reason: narrativeRejectReason.trim()
            });

            if (response.success && response.data) {
                const d = response.data;
                setCurrentMedia((prev) =>
                    prev
                        ? {
                              ...prev,
                              narrative_status: d.narrative_status,
                              audio_url: d.audio_url ?? prev.audio_url,
                              narration_text: d.narration_text ?? prev.narration_text,
                              narrative_rejection_reason:
                                  d.narrative_rejection_reason ?? null
                          }
                        : null
                );
                showToast(
                    'success',
                    response.message || t('toast.narrativeRejectSuccess')
                );
                setShowNarrativeRejectForm(false);
                setNarrativeRejectReason('');
                onStatusChange?.();
            } else {
                setActionError(response.message || t('common.error'));
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : t('common.error');
            setActionError(message);
        } finally {
            setActionLoading(false);
        }
    };

    // ============ HELPERS ============
    const getStatusInfo = (status: ContentStatus) => {
        const statuses = {
            pending: { label: t('status.pending'), color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
            approved: { label: t('status.approved'), color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
            rejected: { label: t('status.rejected'), color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle }
        };
        return statuses[status] || statuses.pending;
    };

    const getTypeInfo = (type: MediaType) => {
        const types: Record<MediaType, { label: string, icon: React.ElementType, gradient: string }> = {
            image: { label: t('media.image'), icon: Image, gradient: 'from-blue-600 to-cyan-500' },
            video: { label: t('media.video'), icon: Video, gradient: 'from-red-600 to-orange-500' },
            model_3d: { label: t('media.model3d'), icon: Box, gradient: 'from-[#8a6d1c] to-[#d4af37]' }
        };
        return types[type] || types.image;
    };
    const formatDateTime = (dateString: string) => {
        const locale = language === 'vi' ? 'vi-VN' : 'en-US';
        return new Date(dateString).toLocaleString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ============ HELPERS ============
    const getReviewerInfo = () => {
        if (currentMedia?.reviewer) return currentMedia.reviewer;
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                return { id: user.id, full_name: user.name || 'Manager', email: user.email || '' };
            }
        } catch { /* ignore */ }
        return { id: 'unknown', full_name: 'Manager', email: '' };
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
    const reviewerInfo = (currentMedia.status === 'approved' || currentMedia.status === 'rejected') ? getReviewerInfo() : null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden mx-4 my-8 flex-shrink-0 flex flex-col">
                {/* Hero Header — flex-shrink-0 so preview + badges are never crushed when body scrolls inside max-h */}
                <div className={`relative flex-shrink-0 bg-gradient-to-br ${typeInfo.gradient} overflow-hidden`}>
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

                    {/* Media Preview */}
                    <div className="relative isolate">
                        {currentMedia.type === 'video' && isYoutubeUrl(currentMedia.url) ? (
                            <div className="aspect-video relative z-0">
                                <iframe
                                    src={getYoutubeEmbedUrl(currentMedia.url) || ''}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        ) : currentMedia.type === 'image' ? (
                            <img
                                src={currentMedia.url}
                                alt={currentMedia.caption}
                                className="relative z-0 w-full max-h-80 object-contain bg-black/20"
                            />
                        ) : currentMedia.type === 'model_3d' ? (
                            <div className="relative z-0">
                                <Model3DViewer
                                    src={currentMedia.url}
                                    alt={currentMedia.caption || '3D Model'}
                                    className="w-full h-[300px] sm:h-[400px] bg-black/40"
                                />
                            </div>
                        ) : (
                            <div className="relative z-0 aspect-video flex items-center justify-center">
                                <Video className="w-16 h-16 text-white/30" />
                            </div>
                        )}

                        {/* Overlay: z-[2] so badges stay above iframe/canvas; extra pb so pills are not clipped */}
                        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2] bg-gradient-to-t from-black/85 via-black/45 to-transparent px-5 pb-6 pt-16">
                            <div className="pointer-events-auto flex items-center gap-2 mb-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm bg-white/90 shadow-sm ${statusInfo.color}`}>
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    {statusInfo.label}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 shadow-sm text-slate-700">
                                    <TypeIcon className="w-3.5 h-3.5" />
                                    {typeInfo.label}
                                </span>
                                <span className="px-2 py-0.5 bg-black/40 backdrop-blur-md text-white text-xs rounded-lg font-mono font-medium border border-white/10">
                                    {currentMedia.code}
                                </span>
                                {!currentMedia.is_active && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/90 backdrop-blur-sm text-white">
                                        <Trash2 className="w-3.5 h-3.5" />
                                        {t('content.deleted')}
                                    </span>
                                )}
                            </div>
                            {/* Caption on overlay */}
                            <p className="text-white/90 text-sm leading-relaxed line-clamp-2 drop-shadow-sm">
                                {currentMedia.caption}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto flex-1 min-h-0">
                    <div className="space-y-4">
                        {/* Info Hero Card — Creator + Open URL + Timestamps */}
                        <div className="bg-gradient-to-br from-[#f5f3ee] to-[#ece8dc] rounded-2xl p-5 border border-[#d4af37]/20">
                            {/* Users Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                {currentMedia.creator ? (
                                    <div>
                                        <p className="text-xs text-[#8a6d1c]/70 font-semibold uppercase tracking-wider mb-2">{t('table.creator') || 'Người tạo'}</p>
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center shadow-sm shadow-[#d4af37]/15 flex-shrink-0">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-900 text-sm truncate">{currentMedia.creator.full_name}</p>
                                                <p className="text-xs text-slate-500 truncate">{currentMedia.creator.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : <div />}
                                {reviewerInfo && (
                                    <div>
                                        <p className="text-xs text-[#8a6d1c]/70 font-semibold uppercase tracking-wider mb-2">
                                            {currentMedia.status === 'approved' ? 'Người duyệt' : 'Người từ chối'}
                                        </p>
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center shadow-sm shadow-[#d4af37]/15 flex-shrink-0">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-900 text-sm truncate">{reviewerInfo.full_name}</p>
                                                <p className="text-xs text-slate-500 truncate">{reviewerInfo.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Timestamps row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-xl p-3.5 border border-[#d4af37]/15">
                                    <div className="flex items-center gap-1.5 text-[#8a6d1c] mb-0.5">
                                        <Calendar className="w-3 h-3" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">{t('content.createdAt')}</span>
                                    </div>
                                    <p className="text-slate-900 font-medium text-sm">{formatDateTime(currentMedia.created_at)}</p>
                                </div>
                                <div className="bg-white rounded-xl p-3.5 border border-[#d4af37]/15">
                                    <div className="flex items-center gap-1.5 text-[#8a6d1c] mb-0.5">
                                        <Clock className="w-3 h-3" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">{t('content.updatedAt')}</span>
                                    </div>
                                    <p className="text-slate-900 font-medium text-sm">{formatDateTime(currentMedia.updated_at)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Rejection Reason */}
                        {currentMedia.status === 'rejected' && currentMedia.rejection_reason && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <h4 className="font-medium text-red-700 mb-2">{t('content.rejectionReason')}</h4>
                                <p className="text-red-600 text-sm">{currentMedia.rejection_reason}</p>
                            </div>
                        )}

                        {/* 3D narration (Local Guide) */}
                        {currentMedia.type === 'model_3d' && (
                            <div className="rounded-2xl border border-[#d4af37]/25 bg-gradient-to-br from-[#faf8f3] to-white p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 rounded-xl bg-[#8a6d1c]/10">
                                        <Mic className="w-4 h-4 text-[#8a6d1c]" />
                                    </div>
                                    <h4 className="font-semibold text-slate-900">{t('content.narrativeSection')}</h4>
                                </div>
                                {!currentMedia.audio_url ? (
                                    <p className="text-sm text-slate-500">{t('content.narrativeNoAudio')}</p>
                                ) : (
                                    <div className="space-y-3">
                                        {currentMedia.narrative_status != null &&
                                            (() => {
                                                const nInfo = getStatusInfo(currentMedia.narrative_status!);
                                                const NIcon = nInfo.icon;
                                                return (
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${nInfo.color}`}
                                                    >
                                                        <NIcon className="w-3.5 h-3.5" />
                                                        {t('content.narrativeStatus')}: {nInfo.label}
                                                    </span>
                                                );
                                            })()}
                                        {currentMedia.narration_text ? (
                                            <div className="bg-white/80 rounded-xl p-3 border border-[#d4af37]/15">
                                                <p className="text-xs font-semibold text-[#8a6d1c] uppercase tracking-wide mb-1">
                                                    {t('content.narrationScript')}
                                                </p>
                                                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                                    {currentMedia.narration_text}
                                                </p>
                                            </div>
                                        ) : null}
                                        <audio
                                            controls
                                            src={currentMedia.audio_url}
                                            className="w-full rounded-lg"
                                            preload="metadata"
                                        />
                                        {currentMedia.narrative_status === 'rejected' &&
                                            currentMedia.narrative_rejection_reason && (
                                                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                                                    <h5 className="text-xs font-semibold text-red-700 mb-1">
                                                        {t('content.narrativeRejectionReason')}
                                                    </h5>
                                                    <p className="text-sm text-red-600">
                                                        {currentMedia.narrative_rejection_reason}
                                                    </p>
                                                </div>
                                            )}
                                        {currentMedia.narrative_status === 'pending' && (
                                            <>
                                                <p className="text-xs text-slate-500">{t('content.narrativePendingHint')}</p>
                                                {showNarrativeRejectForm ? (
                                                    <div className="space-y-3 pt-1">
                                                        <textarea
                                                            value={narrativeRejectReason}
                                                            onChange={(e) => setNarrativeRejectReason(e.target.value)}
                                                            placeholder={t('content.rejectionPlaceholder')}
                                                            className="w-full px-4 py-3 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                                                            rows={3}
                                                            disabled={actionLoading}
                                                        />
                                                        <div className="flex flex-wrap gap-2 justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setShowNarrativeRejectForm(false);
                                                                    setNarrativeRejectReason('');
                                                                    setActionError(null);
                                                                }}
                                                                disabled={actionLoading}
                                                                className="px-4 py-2 text-slate-700 border border-[#d4af37]/20 rounded-xl hover:bg-[#f5f3ee] text-sm disabled:opacity-50"
                                                            >
                                                                {t('common.cancel')}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleNarrativeReject}
                                                                disabled={actionLoading || !narrativeRejectReason.trim()}
                                                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm disabled:opacity-50"
                                                            >
                                                                {actionLoading ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <Ban className="w-4 h-4" />
                                                                )}
                                                                {t('content.confirmRejectNarrative')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2 pt-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setShowNarrativeRejectForm(true);
                                                                setShowRejectForm(false);
                                                                setRejectionReason('');
                                                                setActionError(null);
                                                            }}
                                                            disabled={actionLoading}
                                                            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 text-sm disabled:opacity-50"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            {t('content.rejectNarrative')}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleNarrativeApproveClick}
                                                            disabled={actionLoading}
                                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl shadow-md shadow-[#d4af37]/15 hover:brightness-110 text-sm disabled:opacity-50"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            {t('content.approveNarrative')}
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
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
                                        {t('content.confirmReject')}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            setShowRejectForm(true);
                                            setShowNarrativeRejectForm(false);
                                            setNarrativeRejectReason('');
                                            setActionError(null);
                                        }}
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        {t('content.reject')}
                                    </button>
                                    <button
                                        onClick={handleApproveClick}
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
                    {currentMedia.status === 'approved' && (
                        <button
                            onClick={handleToggleActiveClick}
                            disabled={actionLoading}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all disabled:opacity-50 ${currentMedia.is_active
                                ? 'border border-orange-200 text-orange-600 hover:bg-orange-50'
                                : 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white shadow-lg shadow-[#d4af37]/20 hover:brightness-110'
                                }`}
                        >
                            {actionLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : currentMedia.is_active ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <RotateCcw className="w-4 h-4" />
                            )}
                            {currentMedia.is_active ? t('content.hide') : t('content.restore')}
                        </button>
                    )}
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
                                    {confirmAction === 'approve_narrative'
                                        ? t('content.approveNarrative')
                                        : confirmAction === 'approve'
                                          ? t('common.approve')
                                          : currentMedia.is_active
                                            ? t('content.hide')
                                            : t('content.restore')}
                                </h2>
                                <p className="text-sm opacity-80">{currentMedia.creator?.full_name}</p>
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
                                <div className={`p-3 rounded-full flex-shrink-0 ${confirmAction === 'approve' || confirmAction === 'approve_narrative' ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
                                    }`}>
                                    <AlertTriangle className={`w-6 h-6 ${confirmAction === 'approve' || confirmAction === 'approve_narrative' ? 'text-green-500' : 'text-orange-500'
                                        }`} />
                                </div>
                                <p className="text-gray-600">
                                    {confirmAction === 'approve_narrative'
                                        ? t('content.confirmApproveNarrativeMsg')
                                        : t('content.confirmApproveMsg')}
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
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl transition-all shadow-sm disabled:opacity-50 ${confirmAction === 'approve' || confirmAction === 'approve_narrative'
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : currentMedia.is_active ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] hover:brightness-110'
                                        }`}
                                >
                                    {actionLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : confirmAction === 'approve' || confirmAction === 'approve_narrative' ? (
                                        <Check className="w-4 h-4" />
                                    ) : currentMedia.is_active ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <RotateCcw className="w-4 h-4" />
                                    )}
                                    {confirmAction === 'approve_narrative'
                                        ? t('content.approveNarrative')
                                        : confirmAction === 'approve'
                                          ? t('common.approve')
                                          : currentMedia.is_active ? t('content.hide') : t('content.restore')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
