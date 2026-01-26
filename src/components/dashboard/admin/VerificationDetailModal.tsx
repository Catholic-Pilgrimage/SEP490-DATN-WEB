import React, { useEffect, useState } from 'react';
import {
    X,
    Loader2,
    MapPin,
    User,
    Mail,
    Phone,
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
            pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
            approved: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
            rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
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
        const labels = { Bac: 'Miền Bắc', Trung: 'Miền Trung', Nam: 'Miền Nam' };
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <div className="text-white">
                        <h2 className="text-lg font-semibold">Verification Request Detail</h2>
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
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 mb-4">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {request && !loading && (
                        <div className="space-y-6">
                            {/* Status Badge */}
                            {(() => {
                                const statusInfo = getStatusInfo(request.status);
                                const StatusIcon = statusInfo.icon;
                                return (
                                    <div className="flex items-center justify-between">
                                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                                            <StatusIcon className="w-4 h-4" />
                                            {statusInfo.label}
                                        </span>
                                        {request.verified_at && (
                                            <span className="text-sm text-slate-500">
                                                Verified: {formatDate(request.verified_at)}
                                            </span>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Site Info */}
                            <div className="bg-slate-50 rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    {(() => {
                                        const TypeIcon = getTypeIcon(request.site_type);
                                        return <TypeIcon className="w-4 h-4" />;
                                    })()}
                                    Site Information
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-lg font-semibold text-slate-900">{request.site_name}</p>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MapPin className="w-4 h-4" />
                                        <span>{request.site_address}, {request.site_province}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize">{request.site_type}</span>
                                        <span className="text-slate-500">{getRegionLabel(request.site_region)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Introduction */}
                            {request.introduction && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Introduction
                                    </h3>
                                    <p className="text-slate-600 bg-slate-50 rounded-xl p-4">{request.introduction}</p>
                                </div>
                            )}

                            {/* Certificate */}
                            {request.certificate_url && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Certificate</h3>
                                    <a
                                        href={request.certificate_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
                                    >
                                        <FileText className="w-5 h-5" />
                                        <span>View Certificate</span>
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            )}

                            {/* Rejection Reason (for already rejected) */}
                            {request.status === 'rejected' && request.rejection_reason && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <XCircle className="w-4 h-4" />
                                        Rejection Reason
                                    </h3>
                                    <p className="text-red-600">{request.rejection_reason}</p>
                                </div>
                            )}

                            {/* Applicant */}
                            <div className="border border-slate-200 rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Applicant
                                </h3>
                                <div className="flex items-center gap-4">
                                    {request.applicant.avatar_url ? (
                                        <img src={request.applicant.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-slate-900">{request.applicant.full_name}</p>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {request.applicant.email}
                                            </span>
                                            {request.applicant.phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {request.applicant.phone}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reviewer */}
                            {request.reviewer && (
                                <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                                    <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <UserCheck className="w-4 h-4" />
                                        Reviewed By
                                    </h3>
                                    <div>
                                        <p className="font-semibold text-slate-900">{request.reviewer.full_name}</p>
                                        <p className="text-sm text-slate-500">{request.reviewer.email}</p>
                                    </div>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-200">
                                <span>Created: {formatDate(request.created_at)}</span>
                                <span>Updated: {formatDate(request.updated_at)}</span>
                            </div>

                            {/* Action Buttons - Only for Pending */}
                            {request.status === 'pending' && (
                                <div className="pt-4 border-t border-slate-200 space-y-4">
                                    {showRejectForm ? (
                                        <div className="space-y-3">
                                            <label className="block text-sm font-medium text-slate-700">
                                                Rejection Reason <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Enter the reason for rejection..."
                                                rows={3}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                            />
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => { setShowRejectForm(false); setRejectionReason(''); }}
                                                    disabled={actionLoading}
                                                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleReject}
                                                    disabled={actionLoading || !rejectionReason.trim()}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                                                >
                                                    {actionLoading ? (
                                                        <><Loader2 className="w-4 h-4 animate-spin" /> Rejecting...</>
                                                    ) : (
                                                        <><ThumbsDown className="w-4 h-4" /> Confirm Reject</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setShowRejectForm(true)}
                                                disabled={actionLoading}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                                            >
                                                <ThumbsDown className="w-4 h-4" />
                                                Reject
                                            </button>
                                            <button
                                                onClick={handleApprove}
                                                disabled={actionLoading}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                                            >
                                                {actionLoading ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Approving...</>
                                                ) : (
                                                    <><ThumbsUp className="w-4 h-4" /> Approve</>
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

