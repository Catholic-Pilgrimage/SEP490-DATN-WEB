import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    RefreshCw,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    User,
    MapPin,
    Church,
    Building,
    Mountain,
    Home,
    HelpCircle
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import {
    VerificationRequest,
    Pagination,
    VerificationListParams,
    VerificationStatus,
    SiteType,
    SiteRegion
} from '../../../types/admin.types';
import { VerificationDetailModal } from './VerificationDetailModal';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';

export const VerificationRequests: React.FC = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<VerificationStatus | ''>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);

    // Debounce search
    const [searchDebounce, setSearchDebounce] = useState('');

    // Detail modal
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(search);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params: VerificationListParams = {
                page: currentPage,
                limit,
                status: statusFilter,
                search: searchDebounce,
            };

            const response = await AdminService.getVerificationRequests(params);

            if (response.success && response.data) {
                setRequests(response.data.requests);
                setPagination(response.data.pagination);
            } else {
                setError(response.message || 'Failed to load verification requests');
            }
        } catch (err: any) {
            setError(err?.error?.message || 'Failed to load verification requests');
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, statusFilter, searchDebounce]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleManualRefresh = async () => {
        await fetchRequests();
        showToast('success', t('toast.refreshSuccess'), t('toast.refreshSuccessMsg'));
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && pagination && page <= pagination.totalPages) {
            setCurrentPage(page);
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

    const getRegionInfo = (region: SiteRegion) => {
        const regions = {
            Bac: { label: t('region.bac'), color: 'text-red-600' },
            Trung: { label: t('region.trung'), color: 'text-yellow-600' },
            Nam: { label: t('region.nam'), color: 'text-blue-600' }
        };
        return regions[region] || regions.Nam;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] bg-clip-text text-transparent">{t('verification.title')}</h1>
                    <p className="text-slate-500 mt-1">{t('verification.subtitle')}</p>
                </div>
                <button
                    onClick={handleManualRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl hover:brightness-110 transition-all shadow-lg shadow-[#d4af37]/20 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {t('common.refresh')}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-[#d4af37]/20 p-6 shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[250px]">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#8a6d1c] transition-colors" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('verification.searchPlaceholder')}
                                className="w-full pl-12 pr-4 py-3 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-gray-700 placeholder:text-gray-400 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-[#8a6d1c]/50" />
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value as VerificationStatus | ''); setCurrentPage(1); }}
                            className="px-4 py-3 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-gray-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all cursor-pointer"
                        >
                            <option value="">{t('status.allStatus')}</option>
                            <option value="pending">{t('status.pending')}</option>
                            <option value="approved">{t('status.approved')}</option>
                            <option value="rejected">{t('status.rejected')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 flex items-center gap-2">
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#d4af37]/20 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#f5f3ee] border-b-2 border-[#d4af37]/30">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-[#8a6d1c] border-r border-[#d4af37]/20">{t('table.code') || 'Mã'}</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-[#8a6d1c] border-r border-[#d4af37]/20">{t('table.site') || 'Site'}</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-[#8a6d1c] border-r border-[#d4af37]/20">{t('table.applicant') || 'Người nộp'}</th>
                                        <th className="text-center px-6 py-4 text-sm font-semibold text-[#8a6d1c] border-r border-[#d4af37]/20">{t('table.status')}</th>
                                        <th className="text-center px-6 py-4 text-sm font-semibold text-[#8a6d1c] border-r border-[#d4af37]/20">{t('table.created')}</th>
                                        <th className="text-center px-6 py-4 text-sm font-semibold text-[#8a6d1c]">{t('table.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#d4af37]/10">
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                                {t('verification.noRequests')}
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.map((request) => {
                                            const statusInfo = getStatusInfo(request.status);
                                            const StatusIcon = statusInfo.icon;
                                            const TypeIcon = getTypeIcon(request.site_type);
                                            const regionInfo = getRegionInfo(request.site_region);

                                            return (
                                                <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                                                    {/* Code */}
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono text-sm font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded">
                                                            {request.code}
                                                        </span>
                                                    </td>

                                                    {/* Site */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="p-2 bg-[#d4af37]/20 rounded-lg">
                                                                <TypeIcon className="w-4 h-4 text-[#8a6d1c]" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900 text-sm">{request.site_name}</p>
                                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    <span>{request.site_province}</span>
                                                                    <span className={`font-medium ${regionInfo.color}`}>• {regionInfo.label}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Applicant */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {request.applicant?.avatar_url ? (
                                                                <img
                                                                    src={request.applicant.avatar_url}
                                                                    alt={request.applicant.full_name || 'User'}
                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                                                    <User className="w-4 h-4 text-white" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-slate-900 text-sm">{request.applicant?.full_name || t('verificationDetail.unknown')}</p>
                                                                <p className="text-xs text-slate-500">{request.applicant?.email || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                                            <StatusIcon className="w-3.5 h-3.5" />
                                                            {statusInfo.label}
                                                        </span>
                                                    </td>

                                                    {/* Date */}
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-600">{formatDate(request.created_at)}</span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedRequestId(request.id);
                                                                    setIsDetailModalOpen(true);
                                                                }}
                                                                className="p-2 hover:bg-[#d4af37]/10 rounded-lg transition-colors group"
                                                                title={t('common.view')}
                                                            >
                                                                <Eye className="w-5 h-5 text-gray-400 group-hover:text-[#8a6d1c]" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                {t('users.showing')} {(currentPage - 1) * limit + 1} {t('users.to')} {Math.min(currentPage * limit, pagination.total)} {t('users.of')} {pagination.total} {t('verification.requests')}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-[#d4af37]/30 hover:bg-[#d4af37]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 text-[#8a6d1c]" />
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`w-10 h-10 rounded-lg font-medium transition-all ${pageNum === currentPage
                                                ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white shadow-lg shadow-[#d4af37]/20'
                                                : 'hover:bg-[#d4af37]/10 text-[#8a6d1c]'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.totalPages}
                                    className="p-2 rounded-lg border border-[#d4af37]/30 hover:bg-[#d4af37]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 text-[#8a6d1c]" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Detail Modal */}
            <VerificationDetailModal
                requestId={selectedRequestId}
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedRequestId(null);
                }}
                onSuccess={() => {
                    fetchRequests(); // Refresh list after approve/reject
                }}
            />
        </div>
    );
};
