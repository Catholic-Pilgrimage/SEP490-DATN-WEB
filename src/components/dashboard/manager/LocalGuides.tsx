import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    RefreshCw,
    Users,
    User,
    Mail,
    Phone,
    Plus,
    CheckCircle,
    XCircle,
    AlertCircle,
    Ban,
    UserCheck,
    X,
    AlertTriangle
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { LocalGuide, LocalGuideStatus } from '../../../types/manager.types';
import { LocalGuideFormModal } from './LocalGuideFormModal';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';

export const LocalGuides: React.FC = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [guides, setGuides] = useState<LocalGuide[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(10);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<LocalGuideStatus | ''>('');

    // ============ MODAL STATE ============
    // isFormModalOpen: kiểm soát modal có đang mở hay không
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    // ============ TOGGLE STATUS STATE ============
    // togglingId: lưu ID của Local Guide đang được toggle status
    // Để hiển loading spinner trên nút cụ thể đó
    const [togglingId, setTogglingId] = useState<string | null>(null);

    // Confirm dialog state
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [guideToToggle, setGuideToToggle] = useState<LocalGuide | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Debounce search
    const [searchDebounce, setSearchDebounce] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(search);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchLocalGuides = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await ManagerService.getLocalGuides({
                page: currentPage,
                limit,
                status: statusFilter,
                search: searchDebounce
            });

            if (response.success && response.data) {
                setGuides(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalItems(response.data.pagination.totalItems);
            } else {
                setError(response.message || t('localGuides.errorLoad'));
            }
        } catch (err: any) {
            // Check if manager has no site
            if (err?.error?.statusCode === 400) {
                setError(t('localGuides.errorNoSite'));
            } else {
                setError(err?.error?.message || t('localGuides.errorLoad'));
            }
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, statusFilter, searchDebounce]);

    useEffect(() => {
        fetchLocalGuides();
    }, [fetchLocalGuides]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getStatusInfo = (status: LocalGuideStatus) => {
        // Chỉ có 2 trạng thái theo API:
        // - active: đang hoạt động (màu xanh)
        // - banned: bị cấm/khóa (màu đỏ)
        const statuses = {
            active: { label: t('common.active'), color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
            banned: { label: t('status.banned'), color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
        };
        return statuses[status] || statuses.active;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // ============ TOGGLE STATUS HANDLER ============
    /**
     * Xử lý khi click nút Ban/Unban
     * 
     * Giải thích:
     * - Nếu đang active -> chuyển sang banned
     * - Nếu đang banned -> chuyển sang active
     * - Hiện confirm dialog trước khi thực hiện
     */
    const handleToggleStatus = (guide: LocalGuide) => {
        setGuideToToggle(guide);
        setIsConfirmOpen(true);
    };

    const handleManualRefresh = async () => {
        setRefreshing(true);
        await fetchLocalGuides();
        setRefreshing(false);
        showToast('success', t('toast.refreshSuccess'), t('toast.refreshSuccessMsg'));
    };

    const handleConfirmToggleStatus = async () => {
        if (!guideToToggle) return;
        const newStatus = guideToToggle.status === 'active' ? 'banned' : 'active';

        try {
            setTogglingId(guideToToggle.id);
            setIsConfirmOpen(false);
            setError(null);

            const response = await ManagerService.updateLocalGuideStatus(
                guideToToggle.id,
                { status: newStatus }
            );

            if (response.success) {
                showToast('success', t('localGuides.updateSuccess'));
                fetchLocalGuides();
            } else {
                setError(response.message || t('localGuides.updateError'));
            }
        } catch (err: any) {
            setError(err?.error?.message || t('localGuides.updateError'));
        } finally {
            setTogglingId(null);
            setGuideToToggle(null);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('localGuides.title')}</h1>
                    <p className="text-slate-500 mt-1">{t('localGuides.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleManualRefresh}
                        disabled={loading || refreshing}
                        className="flex items-center gap-2 px-4 py-2 border border-[#d4af37]/30 text-[#8a6d1c] rounded-xl hover:bg-[#f5f3ee] transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading || refreshing ? 'animate-spin' : ''}`} />
                        {t('common.refresh')}
                    </button>
                    <button
                        onClick={() => setIsFormModalOpen(true)}  // Mở modal khi click
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl hover:brightness-110 transition-all shadow-lg shadow-[#d4af37]/20"
                    >
                        <Plus className="w-4 h-4" />
                        {t('localGuides.addGuide')}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#d4af37]/20 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[250px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('localGuides.searchPlaceholder')}
                            className="w-full pl-10 pr-4 py-2.5 border border-[#d4af37]/20 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value as LocalGuideStatus | ''); setCurrentPage(1); }}
                            className="px-4 py-2.5 border border-[#d4af37]/20 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                        >
                            <option value="">{t('sites.allStatus')}</option>
                            <option value="active">{t('common.active')}</option>
                            <option value="banned">{t('status.banned')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
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
                    {/* Content */}
                    {guides.length === 0 ? (
                        /* Empty State */
                        /* Empty State */
                        <div className="bg-white rounded-2xl shadow-sm border border-[#d4af37]/20 p-12 text-center">
                            <div className="w-16 h-16 bg-[#d4af37]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-[#8a6d1c]" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                {t('localGuides.noGuidesTitle')}
                            </h3>
                            <p className="text-slate-500 mb-6">
                                {t('localGuides.noGuidesDesc')}
                            </p>
                            <button
                                onClick={() => setIsFormModalOpen(true)}  // Mở modal khi click
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl hover:brightness-110 transition-all font-medium shadow-lg shadow-[#d4af37]/20"
                            >
                                <Plus className="w-5 h-5" />
                                {t('localGuides.addFirst')}
                            </button>
                        </div>
                    ) : (
                        /* Table */
                        <div className="bg-white rounded-2xl shadow-sm border border-[#d4af37]/20 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-[#f5f3ee] border-b border-[#d4af37]/20">
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('localGuides.table.guide')}</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('localGuides.table.contact')}</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('localGuides.table.status')}</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('localGuides.table.created')}</th>
                                            <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('localGuides.table.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {guides.map((guide) => {
                                            const statusInfo = getStatusInfo(guide.status);
                                            const StatusIcon = statusInfo.icon;

                                            return (
                                                <tr key={guide.id} className="hover:bg-[#f5f3ee] transition-colors">
                                                    {/* Name */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center">
                                                                <User className="w-5 h-5 text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900">{guide.full_name}</p>
                                                                <p className="text-xs text-slate-500 font-mono">{guide.id.slice(0, 8)}...</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Contact */}
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                                <Mail className="w-4 h-4 text-slate-400" />
                                                                {guide.email}
                                                            </div>
                                                            {guide.phone && (
                                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                                    {guide.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                                            <StatusIcon className="w-3.5 h-3.5" />
                                                            {statusInfo.label}
                                                        </span>
                                                    </td>

                                                    {/* Created At */}
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-600">{formatDate(guide.created_at)}</span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {/* Nút Ban/Unban */}
                                                            <button
                                                                onClick={() => handleToggleStatus(guide)}
                                                                disabled={togglingId === guide.id}
                                                                className={`
                                                                    flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors
                                                                    disabled:opacity-50 disabled:cursor-not-allowed
                                                                    ${guide.status === 'active'
                                                                        ? 'border border-red-200 text-red-600 hover:bg-red-50'
                                                                        : 'border border-green-200 text-green-600 hover:bg-green-50'
                                                                    }
                                                                `}
                                                                title={guide.status === 'active' ? t('localGuides.banTooltip') : t('localGuides.unbanTooltip')}
                                                            >
                                                                {togglingId === guide.id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : guide.status === 'active' ? (
                                                                    <>
                                                                        <Ban className="w-4 h-4" />
                                                                        {t('localGuides.ban')}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserCheck className="w-4 h-4" />
                                                                        {t('localGuides.unban')}
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                {t('sites.showing')} {(currentPage - 1) * limit + 1} {t('sites.to')} {Math.min(currentPage * limit, totalItems)} {t('sites.of')} {totalItems} {t('localGuides.table.guide')}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-slate-200 hover:bg-[#f5f3ee] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-10 h-10 rounded-lg font-medium transition-colors ${pageNum === currentPage
                                                    ? 'bg-[#8a6d1c] text-white'
                                                    : 'hover:bg-[#f5f3ee] text-slate-600'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-slate-200 hover:bg-[#f5f3ee] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <LocalGuideFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSuccess={() => {
                    fetchLocalGuides();
                }}
            />

            {/* Confirm Ban/Unban Dialog */}
            {isConfirmOpen && guideToToggle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => { setIsConfirmOpen(false); setGuideToToggle(null); }}
                    />

                    {/* Dialog */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-[#d4af37]/20 flex-shrink-0">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37]">
                            <div className="text-white">
                                <h2 className="text-lg font-semibold">
                                    {guideToToggle.status === 'active' ? t('localGuides.ban') : t('localGuides.unban')}
                                </h2>
                                <p className="text-sm opacity-80">{guideToToggle.full_name}</p>
                            </div>
                            <button
                                onClick={() => { setIsConfirmOpen(false); setGuideToToggle(null); }}
                                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`p-3 rounded-full flex-shrink-0 ${guideToToggle.status === 'active' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                                    <AlertTriangle className={`w-6 h-6 ${guideToToggle.status === 'active' ? 'text-red-500' : 'text-green-500'}`} />
                                </div>
                                <p className="text-gray-600">
                                    {guideToToggle.status === 'active'
                                        ? t('localGuides.confirmBan').replace('{name}', guideToToggle.full_name)
                                        : t('localGuides.confirmUnban').replace('{name}', guideToToggle.full_name)
                                    }
                                </p>
                            </div>

                            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#d4af37]/20">
                                <button
                                    onClick={() => { setIsConfirmOpen(false); setGuideToToggle(null); }}
                                    className="flex-1 px-4 py-2.5 border border-[#d4af37]/30 text-[#8a6d1c] rounded-xl hover:bg-[#d4af37]/10 transition-colors"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={handleConfirmToggleStatus}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl transition-all shadow-sm ${guideToToggle.status === 'active'
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-green-500 hover:bg-green-600'
                                        }`}
                                >
                                    {guideToToggle.status === 'active' ? (
                                        <><Ban className="w-4 h-4" /> {t('localGuides.ban')}</>
                                    ) : (
                                        <><UserCheck className="w-4 h-4" /> {t('localGuides.unban')}</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
