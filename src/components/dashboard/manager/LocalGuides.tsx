import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Filter,
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
    AlertTriangle
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { LocalGuide, LocalGuideStatus } from '../../../types/manager.types';
import { LocalGuideFormModal } from './LocalGuideFormModal';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Pagination as ShadcnPagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

export const LocalGuides: React.FC = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [guides, setGuides] = useState<LocalGuide[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(10);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<LocalGuideStatus | ''>('');

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [guideToToggle, setGuideToToggle] = useState<LocalGuide | null>(null);
    const [refreshing, setRefreshing] = useState(false);
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
        } catch (error) {
            const err = error as { error?: { statusCode?: number } };
            const is400 = err?.error?.statusCode === 400;
            if (is400) {
                setError(t('localGuides.errorNoSite'));
            } else {
                const message = error instanceof Error ? error.message : t('localGuides.errorLoad');
                setError(message);
            }
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

            const response = await ManagerService.updateLocalGuideStatus(
                guideToToggle.id,
                { status: newStatus }
            );

            if (response.success) {
                showToast('success', t('localGuides.updateSuccess'));
                fetchLocalGuides();
            } else {
                showToast('error', t('localGuides.updateError'), response.message || t('localGuides.updateError'));
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : t('localGuides.updateError');
            showToast('error', t('localGuides.updateError'), message);
        } finally {
            setTogglingId(null);
            setGuideToToggle(null);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('localGuides.title')}</h1>
                    <p className="text-slate-500 mt-1">{t('localGuides.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleManualRefresh}
                        disabled={loading || refreshing}
                        className="border-[#d4af37]/30 text-[#8a6d1c] rounded-xl hover:bg-[#f5f3ee]"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading || refreshing ? 'animate-spin' : ''}`} />
                        {t('common.refresh')}
                    </Button>
                    <Button
                        onClick={() => setIsFormModalOpen(true)}
                        className="bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl hover:brightness-110 shadow-lg shadow-[#d4af37]/20"
                    >
                        <Plus className="w-4 h-4" />
                        {t('localGuides.addGuide')}
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#d4af37]/20 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[250px]">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#8a6d1c] transition-colors" />
                            <Input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('localGuides.searchPlaceholder')}
                                className="pl-10 h-11 bg-[#f5f3ee] border-[#d4af37]/30 rounded-xl focus-visible:ring-1 focus-visible:ring-[#d4af37] focus-visible:border-[#d4af37] hover:border-[#d4af37]/50"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-[#8a6d1c]/50" />
                        <Select
                            value={statusFilter || 'all'}
                            onValueChange={(value) => {
                                setStatusFilter(value === 'all' ? '' : value as LocalGuideStatus);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[180px] h-11 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-gray-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all">
                                <SelectValue placeholder={t('sites.allStatus')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('sites.allStatus')}</SelectItem>
                                <SelectItem value="active">{t('common.active')}</SelectItem>
                                <SelectItem value="banned">{t('status.banned')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-[#d4af37]/20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
                </div>
            ) : (
                <>
                    {guides.length === 0 ? (
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
                            <Button
                                onClick={() => setIsFormModalOpen(true)}
                                className="bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl hover:brightness-110 shadow-lg shadow-[#d4af37]/20"
                            >
                                <Plus className="w-5 h-5" />
                                {t('localGuides.addFirst')}
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-[#d4af37]/20 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-[#f5f3ee]">
                                    <TableRow className="border-b-[#d4af37]/20 hover:bg-transparent">
                                        <TableHead className="px-6 h-12 font-semibold text-slate-500 uppercase tracking-wider">{t('localGuides.table.guide')}</TableHead>
                                        <TableHead className="px-6 h-12 font-semibold text-slate-500 uppercase tracking-wider">{t('localGuides.table.contact')}</TableHead>
                                        <TableHead className="px-6 h-12 font-semibold text-slate-500 uppercase tracking-wider">{t('localGuides.table.status')}</TableHead>
                                        <TableHead className="px-6 h-12 font-semibold text-slate-500 uppercase tracking-wider">{t('localGuides.table.created')}</TableHead>
                                        <TableHead className="px-6 h-12 text-center font-semibold text-slate-500 uppercase tracking-wider">{t('localGuides.table.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {guides.map((guide) => {
                                        const statusInfo = getStatusInfo(guide.status);
                                        const StatusIcon = statusInfo.icon;

                                        return (
                                            <TableRow key={guide.id} className="hover:bg-[#f5f3ee]/60 border-b-[#d4af37]/10">
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center">
                                                            <User className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-slate-900 truncate">{guide.full_name}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <Mail className="w-4 h-4 text-slate-400" />
                                                            <span className="truncate">{guide.email}</span>
                                                        </div>
                                                        {guide.phone && (
                                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                                <Phone className="w-4 h-4 text-slate-400" />
                                                                <span>{guide.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <Badge
                                                        variant="outline"
                                                        className={`gap-1.5 w-fit ${statusInfo.color}`}
                                                    >
                                                        <StatusIcon className="w-3.5 h-3.5" />
                                                        {statusInfo.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-sm text-slate-600">
                                                    {formatDate(guide.created_at)}
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-center">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleToggleStatus(guide)}
                                                        disabled={togglingId === guide.id}
                                                        className={`${guide.status === 'active'
                                                            ? 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700'
                                                            : 'border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700'
                                                            }`}
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
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                {t('sites.showing')} {(currentPage - 1) * limit + 1} {t('sites.to')} {Math.min(currentPage * limit, totalItems)} {t('sites.of')} {totalItems} {t('localGuides.table.guide')}
                            </p>

                            <ShadcnPagination className="justify-end w-auto mx-0">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum: number;
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
                                            <PaginationItem key={pageNum}>
                                                <PaginationLink
                                                    onClick={() => handlePageChange(pageNum)}
                                                    isActive={currentPage === pageNum}
                                                    className={`cursor-pointer ${currentPage === pageNum ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white hover:text-white hover:brightness-110' : ''}`}
                                                >
                                                    {pageNum}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}

                                    {totalPages > 5 && currentPage < totalPages - 2 && (
                                        <PaginationItem>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </ShadcnPagination>
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

            <AlertDialog
                open={isConfirmOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsConfirmOpen(false);
                        setGuideToToggle(null);
                    }
                }}
            >
                <AlertDialogContent className="p-0 overflow-hidden border-[#d4af37]/20 rounded-2xl max-w-md">
                    {guideToToggle && (
                        <>
                            <AlertDialogHeader className="px-6 py-4 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37]">
                                <div className="text-white text-left">
                                    <AlertDialogTitle className="text-lg font-semibold">
                                        {guideToToggle.status === 'active' ? t('localGuides.ban') : t('localGuides.unban')}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm opacity-80 text-white/90">
                                        {guideToToggle.full_name}
                                    </AlertDialogDescription>
                                </div>
                            </AlertDialogHeader>

                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`p-3 rounded-full flex-shrink-0 ${guideToToggle.status === 'active' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                                        <AlertTriangle className={`w-6 h-6 ${guideToToggle.status === 'active' ? 'text-red-500' : 'text-green-500'}`} />
                                    </div>
                                    <p className="text-gray-600 text-left">
                                        {guideToToggle.status === 'active'
                                            ? t('localGuides.confirmBan').replace('{name}', guideToToggle.full_name)
                                            : t('localGuides.confirmUnban').replace('{name}', guideToToggle.full_name)
                                        }
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#d4af37]/20">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsConfirmOpen(false);
                                            setGuideToToggle(null);
                                        }}
                                        className="flex-1 border-[#d4af37]/30 text-[#8a6d1c] rounded-xl hover:bg-[#d4af37]/10"
                                    >
                                        {t('common.cancel')}
                                    </Button>
                                    <Button
                                        onClick={handleConfirmToggleStatus}
                                        className={`flex-1 text-white rounded-xl ${guideToToggle.status === 'active'
                                            ? 'bg-red-500 hover:bg-red-600'
                                            : 'bg-green-500 hover:bg-green-600'
                                            }`}
                                    >
                                        {guideToToggle.status === 'active' ? (
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
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
