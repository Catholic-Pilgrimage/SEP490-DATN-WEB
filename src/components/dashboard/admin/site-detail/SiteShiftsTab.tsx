import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Clock, Calendar, User, AlertCircle, Filter } from 'lucide-react';
import { AdminService } from '../../../../services/admin.service';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { SiteShiftSubmission, SiteShiftsResponse, ShiftSubmissionStatus } from '../../../../types/admin.types';
import { extractErrorMessage } from '../../../../lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Pagination as ShadcnPagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface SiteShiftsTabProps {
    siteId: string;
}

export const SiteShiftsTab: React.FC<SiteShiftsTabProps> = ({ siteId }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SiteShiftsResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<ShiftSubmissionStatus | ''>('');

    const normalizeStatusFilter = useCallback((value: string): ShiftSubmissionStatus | '' => {
        if (value === 'pending' || value === 'approved' || value === 'rejected') return value;
        return '';
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await AdminService.getSiteShifts(siteId, {
                page: currentPage,
                limit,
                status: statusFilter || undefined
            });

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Không thể tải danh sách lịch trực');
            }
        } catch (error) {
            const message = extractErrorMessage(error, 'Không thể tải danh sách lịch trực');
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [siteId, currentPage, limit, statusFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getDayName = (dayOfWeek: number): string => {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return days[dayOfWeek] || `Day ${dayOfWeek}`;
    };

    const formatTime = (time: string): string => {
        return time.substring(0, 5); // HH:mm
    };

    const getStatusBadge = (status: ShiftSubmissionStatus) => {
        const configs = {
            pending: { color: 'bg-yellow-100 text-yellow-700', labelKey: 'status.pending' },
            approved: { color: 'bg-green-100 text-green-700', labelKey: 'status.approved' },
            rejected: { color: 'bg-red-100 text-red-700', labelKey: 'status.rejected' }
        };
        const config = configs[status] || configs.pending;
        return { ...config, label: t(config.labelKey) };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    const submissions = data?.submissions || [];
    const pagination = data?.pagination;
    const totalPages = pagination?.totalPages || 1;
    const currentCount = submissions.length;

    return (
        <div className="p-6 space-y-4">
            {/* Header with Filter */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-slate-500">
                    {currentCount} {t('shifts.shiftRegistrations')}
                </p>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <Select
                        value={statusFilter || 'all'}
                        onValueChange={(value) => {
                            setStatusFilter(value === 'all' ? '' : normalizeStatusFilter(value));
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="h-9 w-[170px] bg-white border border-slate-200 rounded-lg text-sm">
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

            {/* Content */}
            {submissions.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-6 h-6 text-[#d4af37]" />
                    </div>
                    <h3 className="font-medium text-slate-900 mb-1">
                        {t('shifts.noShifts')}
                    </h3>
                    <p className="text-sm text-slate-500">
                        Không có đăng ký lịch trực nào
                    </p>
                </div>
            ) : (
                <>
                    {/* Submissions List */}
                    <div className="space-y-3">
                        {submissions.map((submission: SiteShiftSubmission) => {
                            const statusBadge = getStatusBadge(submission.status);

                            return (
                                <div
                                    key={submission.id}
                                    className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#d4af37] border border-[#d4af37]/30 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-white/90" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">{submission.guide.full_name}</h4>
                                                <p className="text-xs text-slate-500">{submission.guide.email}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                                            {statusBadge.label}
                                        </span>
                                    </div>

                                    {/* Week Info */}
                                    <div className="flex items-center gap-4 mb-3 text-sm text-slate-600">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span>Tuần {new Date(submission.week_start_date).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <span>{submission.total_shifts} ca</span>
                                        </div>
                                    </div>

                                    {/* Shifts */}
                                    <div className="flex flex-wrap gap-2">
                                        {submission.shifts.map((shift) => (
                                            <div
                                                key={shift.id}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                                            >
                                                <span className="font-medium text-blue-600">{getDayName(shift.day_of_week)}</span>
                                                <span className="text-slate-400">|</span>
                                                <span className="text-slate-600">
                                                    {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Rejection reason if rejected */}
                                    {submission.status === 'rejected' && submission.rejection_reason && (
                                        <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                                            <strong>Lý do từ chối:</strong> {submission.rejection_reason}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-sm text-slate-500">
                                Trang {currentPage} / {totalPages}
                            </p>
                            <ShadcnPagination className="justify-end">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => currentPage > 1 && setCurrentPage(p => Math.max(1, p - 1))}
                                            className={`cursor-pointer text-[#8a6d1c] hover:text-[#8a6d1c] hover:bg-[#d4af37]/10 ${currentPage === 1 ? "pointer-events-none opacity-40" : ""}`}
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum: number;
                                        if (totalPages <= 5) pageNum = i + 1;
                                        else if (currentPage <= 3) pageNum = i + 1;
                                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                        else pageNum = currentPage - 2 + i;

                                        return (
                                            <PaginationItem key={pageNum}>
                                                <PaginationLink
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    isActive={currentPage === pageNum}
                                                    className={`cursor-pointer rounded-lg border border-[#d4af37]/30 text-sm px-3 py-2 ${currentPage === pageNum
                                                        ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white hover:text-white hover:brightness-110'
                                                        : 'text-[#8a6d1c] bg-white hover:bg-[#d4af37]/10'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}

                                    {totalPages > 5 && currentPage < totalPages - 2 && (
                                        <PaginationItem>
                                            <PaginationEllipsis className="text-[#8a6d1c]" />
                                        </PaginationItem>
                                    )}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => currentPage < totalPages && setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            className={`cursor-pointer text-[#8a6d1c] hover:text-[#8a6d1c] hover:bg-[#d4af37]/10 ${currentPage === totalPages ? "pointer-events-none opacity-40" : ""}`}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </ShadcnPagination>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
