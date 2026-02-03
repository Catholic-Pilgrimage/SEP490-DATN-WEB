import React, { useEffect, useState } from 'react';
import {
    X,
    Loader2,
    MapPin,
    User,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Church,
    Building,
    Mountain,
    Home,
    HelpCircle,
    ExternalLink,
    UserCheck,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import { VerificationRequestDetail, VerificationStatus, SiteType, SiteRegion } from '../../../types/admin.types';
import { useLanguage } from '../../../contexts/LanguageContext';

interface VerificationDetailModalProps {
    requestId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const VerificationDetailModal: React.FC<VerificationDetailModalProps> = ({
    requestId,
    isOpen,
    onClose,
    onSuccess
}) => {
    const { t } = useLanguage();
    const [request, setRequest] = useState<VerificationRequestDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Action states
    const [actionLoading, setActionLoading] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        if (isOpen && requestId) {
            fetchRequestDetail();
            setShowRejectForm(false);
            setRejectionReason('');
        }
    }, [isOpen, requestId]);

    const fetchRequestDetail = async () => {
        if (!requestId) return;

        try {
            setLoading(true);
            setError(null);
            const response = await AdminService.getVerificationRequestById(requestId);

            if (response.success && response.data) {
                setRequest(response.data);
            } else {
                setError(response.message || 'Failed to load verification request');
            }
        } catch (err: any) {
            setError(err?.error?.message || 'Failed to load verification request');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!requestId) return;

        try {
            setActionLoading(true);
            setError(null);
            const response = await AdminService.updateVerificationStatus(requestId, { status: 'approved' });

            if (response.success) {
                onSuccess?.();
                onClose();
            } else {
                setError(response.message || 'Failed to approve request');
            }
        } catch (err: any) {
            setError(err?.error?.message || 'Failed to approve request');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!requestId || !rejectionReason.trim()) {
            setError('Please enter a rejection reason');
            return;
        }

        try {
            setActionLoading(true);
            setError(null);
            const response = await AdminService.updateVerificationStatus(requestId, {
                status: 'rejected',
                rejection_reason: rejectionReason.trim()
            });

            if (response.success) {
                onSuccess?.();
                onClose();
            } else {
                setError(response.message || 'Failed to reject request');
            }
        } catch (err: any) {
            setError(err?.error?.message || 'Failed to reject request');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusInfo = (status: VerificationStatus) => {
        const statuses = {
            pending: { label: t('status.pending'), color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
            approved: { label: t('status.approved'), color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
            rejected: { label: t('status.rejected'), color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
        };
        return statuses[status] || statuses.pending;
    };

    const getTypeIcon = (type: SiteType) => {
        const icons = {
            church: Church,
            shrine: Mountain,
            monastery: Building,
            center: Home,
            other: HelpCircle
        };
        return icons[type] || HelpCircle;
    };

    const getRegionLabel = (region: SiteRegion) => {
        const labels = { Bac: t('region.bac'), Trung: t('region.trung'), Nam: t('region.nam') };
        return labels[region] || region;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 my-8 overflow-hidden border border-[#d4af37]/20 flex-shrink-0">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37]">
                    <div className="text-white">
                        <h2 className="text-lg font-semibold">{t('verificationDetail.title')}</h2>
                        {request && <p className="text-sm opacity-80">{request.code}</p>}
                    </div>
                    <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 mb-4">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {request && !loading && (
                        <div className="space-y-5">
                            {/* Status Badge - Centered and prominent */}
                            {(() => {
                                const statusInfo = getStatusInfo(request.status);
                                const StatusIcon = statusInfo.icon;
                                return (
                                    <div className="flex flex-col items-center text-center pb-4 border-b border-[#d4af37]/20">
                                        <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border-2 ${statusInfo.color} shadow-sm`}>
                                            <StatusIcon className="w-5 h-5" />
                                            {statusInfo.label}
                                        </span>
                                        {request.verified_at && (
                                            <span className="text-xs text-gray-500 mt-2">
                                                {t('verificationDetail.verified')}: {formatDate(request.verified_at)}
                                            </span>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Site Info Card - Main highlight */}
                            <div className="bg-gradient-to-br from-[#f5f3ee] to-white rounded-xl p-5 border border-[#d4af37]/20 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] rounded-xl shadow-lg shadow-[#d4af37]/20">
                                        {(() => {
                                            const TypeIcon = getTypeIcon(request.site_type);
                                            return <TypeIcon className="w-6 h-6 text-white" />;
                                        })()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-[#8a6d1c] truncate">{request.site_name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                            <MapPin className="w-4 h-4 flex-shrink-0 text-[#d4af37]" />
                                            <span className="truncate">{request.site_address}, {request.site_province}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="px-2.5 py-1 bg-[#d4af37]/20 text-[#8a6d1c] rounded-lg text-xs font-medium capitalize">{request.site_type}</span>
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">{getRegionLabel(request.site_region)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Introduction */}
                            {request.introduction && (
                                <div className="bg-[#f5f3ee] rounded-xl p-4 border border-[#d4af37]/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-[#8a6d1c]" />
                                        <h4 className="text-sm font-semibold text-[#8a6d1c]">{t('verificationDetail.introduction')}</h4>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed">{request.introduction}</p>
                                </div>
                            )}

                            {/* Certificate */}
                            {request.certificate_url && (
                                <a
                                    href={request.certificate_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 bg-[#f5f3ee] rounded-xl border border-[#d4af37]/20 hover:border-[#d4af37]/50 hover:shadow-md transition-all group"
                                >
                                    <div className="p-2 bg-[#d4af37]/20 rounded-lg group-hover:bg-[#d4af37]/30 transition-colors">
                                        <FileText className="w-5 h-5 text-[#8a6d1c]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-[#8a6d1c]">{t('verificationDetail.certificate')}</p>
                                        <p className="text-xs text-gray-500">{t('verificationDetail.viewCertificate')}</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-[#d4af37] group-hover:translate-x-1 transition-transform" />
                                </a>
                            )}

                            {/* Rejection Reason */}
                            {request.status === 'rejected' && request.rejection_reason && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <XCircle className="w-4 h-4 text-red-600" />
                                        <h4 className="text-sm font-semibold text-red-700">{t('verificationDetail.rejectionReason')}</h4>
                                    </div>
                                    <p className="text-red-600 text-sm">{request.rejection_reason}</p>
                                </div>
                            )}

                            {/* Applicant & Reviewer Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Applicant Card */}
                                <div className="bg-[#f5f3ee] rounded-xl p-4 border border-[#d4af37]/10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <User className="w-4 h-4 text-[#8a6d1c]" />
                                        <h4 className="text-xs font-semibold text-[#8a6d1c] uppercase tracking-wider">{t('verificationDetail.applicant')}</h4>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {request.applicant?.avatar_url ? (
                                            <img src={request.applicant.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#d4af37]/30" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate text-sm">{request.applicant?.full_name || t('verificationDetail.unknown')}</p>
                                            <p className="text-xs text-gray-500 truncate">{request.applicant?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Reviewer Card */}
                                {request.reviewer && (
                                    <div className="bg-[#d4af37]/10 rounded-xl p-4 border border-[#d4af37]/20">
                                        <div className="flex items-center gap-2 mb-3">
                                            <UserCheck className="w-4 h-4 text-[#8a6d1c]" />
                                            <h4 className="text-xs font-semibold text-[#8a6d1c] uppercase tracking-wider">{t('verificationDetail.reviewedBy')}</h4>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center">
                                                <UserCheck className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate text-sm">{request.reviewer.full_name}</p>
                                                <p className="text-xs text-gray-500 truncate">{request.reviewer.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Timestamps Grid */}
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#d4af37]/20">
                                <div className="bg-[#f5f3ee] rounded-lg p-3 border border-[#d4af37]/10">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Clock className="w-3 h-3 text-[#8a6d1c]/60" />
                                        <span className="text-xs text-gray-500">{t('table.created')}</span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-700">{formatDate(request.created_at)}</p>
                                </div>
                                <div className="bg-[#f5f3ee] rounded-lg p-3 border border-[#d4af37]/10">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Clock className="w-3 h-3 text-[#8a6d1c]/60" />
                                        <span className="text-xs text-gray-500">{t('detail.updatedAt')}</span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-700">{formatDate(request.updated_at)}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {request.status === 'pending' && (
                                <div className="pt-4 border-t border-[#d4af37]/20 space-y-4">
                                    {showRejectForm ? (
                                        <div className="space-y-3">
                                            <label className="block text-sm font-medium text-gray-700">
                                                {t('verificationDetail.rejectionReasonRequired')}
                                            </label>
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder={t('verificationDetail.enterRejectionReason')}
                                                rows={3}
                                                className="w-full px-4 py-2.5 border border-[#d4af37]/30 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent resize-none bg-white"
                                            />
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => { setShowRejectForm(false); setRejectionReason(''); }}
                                                    disabled={actionLoading}
                                                    className="flex-1 px-4 py-2.5 border border-[#d4af37]/30 text-gray-700 rounded-xl hover:bg-[#f5f3ee] transition-colors disabled:opacity-50 font-medium"
                                                >
                                                    {t('common.cancel')}
                                                </button>
                                                <button
                                                    onClick={handleReject}
                                                    disabled={actionLoading || !rejectionReason.trim()}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                                                >
                                                    {actionLoading ? (
                                                        <><Loader2 className="w-4 h-4 animate-spin" /> {t('verificationDetail.rejecting')}</>
                                                    ) : (
                                                        <><ThumbsDown className="w-4 h-4" /> {t('verificationDetail.confirmReject')}</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setShowRejectForm(true)}
                                                disabled={actionLoading}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50 font-medium"
                                            >
                                                <ThumbsDown className="w-5 h-5" />
                                                {t('verificationDetail.reject')}
                                            </button>
                                            <button
                                                onClick={handleApprove}
                                                disabled={actionLoading}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl hover:brightness-110 transition-all shadow-lg shadow-[#d4af37]/25 disabled:opacity-50 font-medium"
                                            >
                                                {actionLoading ? (
                                                    <><Loader2 className="w-5 h-5 animate-spin" /> {t('verificationDetail.approving')}</>
                                                ) : (
                                                    <><ThumbsUp className="w-5 h-5" /> {t('verificationDetail.approve')}</>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

