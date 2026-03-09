import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    RefreshCw,
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
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
        } catch (err: unknown) {
            const error = err as { error?: { message?: string } };
            setError(error?.error?.message || 'Failed to load verification requests');
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#8a6d1c]">{t('verification.title')}</h1>
                    <p className="text-slate-500 mt-1">{t('verification.subtitle')}</p>
                </div>
                <Button
                    onClick={handleManualRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 h-[46px] px-6 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl hover:brightness-110 transition-all shadow-lg shadow-[#d4af37]/20 disabled:opacity-50 font-semibold"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {t('common.refresh')}
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-[#d4af37]/20 p-6 shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[250px]">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#8a6d1c] transition-colors" />
                            <Input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('verification.searchPlaceholder')}
                                className="w-full h-[46px] pl-12 pr-4 bg-[#f5f3ee] border-[#d4af37]/30 rounded-xl text-gray-700 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#d4af37] hover:border-[#d4af37]/50 transition-all text-base"
                            />
                        </div>
                    </div>

                    {/* Filter Group */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-[#8a6d1c]/50 hidden sm:block" />
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => { setStatusFilter(value as VerificationStatus | ''); setCurrentPage(1); }}
                            >
                                <SelectTrigger className="w-[160px] h-[46px] bg-[#f5f3ee] border-[#d4af37]/30 rounded-xl text-gray-700 focus:ring-1 focus:ring-[#d4af37] hover:border-[#d4af37]/50 transition-all font-medium">
                                    <SelectValue placeholder={t('status.allStatus')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('status.allStatus')}</SelectItem>
                                    <SelectItem value="pending">{t('status.pending')}</SelectItem>
                                    <SelectItem value="approved">{t('status.approved')}</SelectItem>
                                    <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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
                    {/* Verification Requests List */}
                    <div className="space-y-4">
                        {requests.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-3xl border border-[#d4af37]/10 shadow-sm">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-100">
                                    <HelpCircle className="w-10 h-10 text-slate-400" />
                                </div>
                                <p className="text-xl font-bold text-slate-900 mb-2">{t('verification.noRequests')}</p>
                                <p className="text-slate-500">Thử thay đổi bộ lọc hoặc tìm kiếm lại</p>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {requests.map((request) => {
                                    const statusInfo = getStatusInfo(request.status);
                                    const StatusIcon = statusInfo.icon;
                                    const TypeIcon = getTypeIcon(request.site_type);
                                    const regionInfo = getRegionInfo(request.site_region);

                                    return (
                                        <motion.div
                                            key={request.id}
                                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -15 }}
                                            transition={{ duration: 0.25 }}
                                            layout
                                        >
                                            <Card className="relative bg-white border border-slate-100 transition-all hover:shadow-md overflow-hidden cursor-pointer"
                                                onClick={() => {
                                                    setSelectedRequestId(request.id);
                                                    setIsDetailModalOpen(true);
                                                }}>
                                                <CardContent className="p-0">
                                                    {/* Header row */}
                                                    <div className="flex items-start justify-between p-5 pb-4">
                                                        <div className="flex items-center gap-3">
                                                            {request.applicant?.avatar_url ? (
                                                                <img
                                                                    src={request.applicant.avatar_url}
                                                                    alt={request.applicant.full_name || 'User'}
                                                                    className="w-11 h-11 rounded-full object-cover border-2 border-slate-100"
                                                                />
                                                            ) : (
                                                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#8a6d1c]/10 to-[#d4af37]/20 border border-[#d4af37]/30 flex items-center justify-center text-[#8a6d1c] shrink-0">
                                                                    <User className="w-5 h-5" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h3 className="text-[15px] font-semibold text-slate-800 leading-snug">
                                                                    {request.applicant?.full_name || t('verificationDetail.unknown')}
                                                                </h3>
                                                                <p className="text-slate-500 text-xs mt-0.5">
                                                                    {request.applicant?.email || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 shrink-0 ml-4">
                                                            <span className="font-mono text-slate-400 text-xs bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                                                {request.code}
                                                            </span>
                                                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full ${statusInfo.color}`}>
                                                                <StatusIcon className="w-3.5 h-3.5" />
                                                                {statusInfo.label}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Info row */}
                                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-t border-slate-50 bg-slate-50/40">
                                                        <div className="px-5 py-3.5 col-span-2 lg:col-span-1">
                                                            <p className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                                                                <TypeIcon className="w-3 h-3 text-[#d4af37]" />
                                                                {t('table.site') || 'Cơ sở'}
                                                            </p>
                                                            <p className="text-sm font-medium text-slate-700 truncate">{request.site_name}</p>
                                                        </div>

                                                        <div className="px-5 py-3.5">
                                                            <p className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                Tọa lạc tại
                                                            </p>
                                                            <p className="text-sm font-medium text-slate-700 truncate">{request.site_province}</p>
                                                            <p className={`text-[10px] font-semibold uppercase mt-0.5 ${regionInfo.color}`}>
                                                                {regionInfo.label}
                                                            </p>
                                                        </div>

                                                        <div className="px-5 py-3.5 border-t sm:border-t-0">
                                                            <p className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {t('table.created')}
                                                            </p>
                                                            <p className="text-sm font-medium text-slate-700 truncate">
                                                                {formatDate(request.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                {t('users.showing')} {(currentPage - 1) * limit + 1} {t('users.to')} {Math.min(currentPage * limit, pagination.total)} {t('users.of')} {pagination.total} {t('verification.requests')}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 rounded-lg border-[#d4af37]/30 hover:bg-[#d4af37]/10 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 text-[#8a6d1c]" />
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                                        <Button
                                            key={pageNum}
                                            variant={pageNum === currentPage ? "default" : "ghost"}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`w-10 h-10 rounded-lg font-medium transition-all ${pageNum === currentPage
                                                ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white shadow-md shadow-[#d4af37]/20 hover:brightness-110'
                                                : 'text-[#8a6d1c] hover:bg-[#d4af37]/10'
                                                }`}
                                        >
                                            {pageNum}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.totalPages}
                                    className="w-10 h-10 rounded-lg border-[#d4af37]/30 hover:bg-[#d4af37]/10 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 text-[#8a6d1c]" />
                                </Button>
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
