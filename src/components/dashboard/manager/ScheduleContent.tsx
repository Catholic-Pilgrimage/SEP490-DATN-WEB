import React, { useEffect, useState, useCallback } from 'react';
import {
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    RefreshCw,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Trash2,
    Eye,
    Calendar,
    User,
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { Schedule, ContentStatus } from '../../../types/manager.types';
import { ScheduleDetailModal } from './ScheduleDetailModal';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

/**
 * ScheduleContent — danh sách lịch lễ site, filter & bảng chi tiết.
 */
export const ScheduleContent: React.FC = () => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const [scheduleList, setScheduleList] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(10);

    const [statusFilter, setStatusFilter] = useState<ContentStatus | ''>('');
    const [dayFilter, setDayFilter] = useState<number | undefined>(undefined);
    const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchScheduleList = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await ManagerService.getScheduleList({
                page: currentPage,
                limit,
                status: statusFilter || undefined,
                day_of_week: dayFilter,
                is_active: activeFilter,
            });

            if (response.success && response.data) {
                setScheduleList(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalItems(response.data.pagination.totalItems);
            } else {
                setError(response.message || t('schedule.loadError'));
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('schedule.loadError');
            setError(message);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, limit, statusFilter, dayFilter, activeFilter]);

    useEffect(() => {
        fetchScheduleList();
    }, [fetchScheduleList]);

    const handleManualRefresh = async () => {
        setRefreshing(true);
        await fetchScheduleList();
        setRefreshing(false);
        showToast('success', t('toast.refreshSuccess'), t('toast.refreshSuccessMsg'));
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getStatusInfo = (status: ContentStatus) => {
        const statuses = {
            pending: {
                label: t('status.pending'),
                color: 'border-amber-200 bg-amber-50 text-amber-800',
                icon: Clock,
            },
            approved: {
                label: t('status.approved'),
                color: 'border-emerald-200 bg-emerald-50 text-emerald-800',
                icon: CheckCircle,
            },
            rejected: {
                label: t('status.rejected'),
                color: 'border-red-200 bg-red-50 text-red-800',
                icon: XCircle,
            },
        };
        return statuses[status] || statuses.pending;
    };

    const getDayName = (day: number): string => {
        const days =
            language === 'vi'
                ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
                : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[day] || '';
    };

    const formatTime = (time: string) => time.slice(0, 5);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

    const dayOptions = [
        { value: '0', labelVi: 'Chủ nhật', labelEn: 'Sunday' },
        { value: '1', labelVi: 'Thứ 2', labelEn: 'Monday' },
        { value: '2', labelVi: 'Thứ 3', labelEn: 'Tuesday' },
        { value: '3', labelVi: 'Thứ 4', labelEn: 'Wednesday' },
        { value: '4', labelVi: 'Thứ 5', labelEn: 'Thursday' },
        { value: '5', labelVi: 'Thứ 6', labelEn: 'Friday' },
        { value: '6', labelVi: 'Thứ 7', labelEn: 'Saturday' },
    ];

    return (
        <div className="flex h-full min-h-0 flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] shadow-lg shadow-[#d4af37]/25 ring-4 ring-[#d4af37]/10">
                        <Calendar className="h-7 w-7 text-white" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            {t('schedule.title')}
                        </h1>
                        <p className="mt-1 max-w-xl text-sm text-slate-600 sm:text-base">{t('schedule.subtitle')}</p>
                    </div>
                </div>
                <Button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={loading || refreshing}
                    className="h-11 shrink-0 gap-2 rounded-xl bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] px-6 text-white shadow-md shadow-[#d4af37]/25 hover:brightness-110 disabled:opacity-70"
                >
                    <RefreshCw className={`h-5 w-5 ${loading || refreshing ? 'animate-spin' : ''}`} />
                    {t('common.refresh')}
                </Button>
            </div>

            {/* Filters */}
            <Card className="rounded-2xl border-[#d4af37]/20 shadow-sm">
                <CardContent className="flex flex-wrap items-center gap-3 p-4 sm:gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 shrink-0 text-[#8a6d1c]/50" />
                        <Select
                            value={statusFilter === '' ? 'all' : statusFilter}
                            onValueChange={(v) => {
                                setStatusFilter(v === 'all' ? '' : (v as ContentStatus));
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="h-9 w-[min(100vw-4rem,200px)] rounded-xl border-[#d4af37]/30 bg-[#f5f3ee] text-slate-700 focus:ring-[#d4af37] sm:w-[200px]">
                                <SelectValue placeholder={t('content.allStatus')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('content.allStatus')}</SelectItem>
                                <SelectItem value="pending">{t('status.pending')}</SelectItem>
                                <SelectItem value="approved">{t('status.approved')}</SelectItem>
                                <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Select
                        value={dayFilter === undefined ? 'all' : String(dayFilter)}
                        onValueChange={(v) => {
                            setDayFilter(v === 'all' ? undefined : parseInt(v, 10));
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="h-9 w-[min(100vw-4rem,220px)] rounded-xl border-[#d4af37]/30 bg-[#f5f3ee] text-slate-700 focus:ring-[#d4af37] sm:w-[220px]">
                            <SelectValue placeholder={t('schedule.allDays')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('schedule.allDays')}</SelectItem>
                            {dayOptions.map((d) => (
                                <SelectItem key={d.value} value={d.value}>
                                    {language === 'vi' ? d.labelVi : d.labelEn}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={activeFilter === undefined ? 'all' : activeFilter ? 'true' : 'false'}
                        onValueChange={(v) => {
                            setActiveFilter(v === 'all' ? undefined : v === 'true');
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="h-9 w-[min(100vw-4rem,200px)] rounded-xl border-[#d4af37]/30 bg-[#f5f3ee] text-slate-700 focus:ring-[#d4af37] sm:w-[200px]">
                            <SelectValue placeholder={t('content.allActive')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('content.allActive')}</SelectItem>
                            <SelectItem value="true">{t('content.activeTrue')}</SelectItem>
                            <SelectItem value="false">{t('content.activeFalse')}</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {error && (
                <Card className="rounded-xl border-red-200 bg-red-50">
                    <CardContent className="flex items-center gap-2 p-4 text-red-600">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span>{error}</span>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <Card className="flex min-h-[280px] flex-1 items-center justify-center rounded-2xl border-[#d4af37]/20">
                    <CardContent className="flex flex-col items-center gap-3 py-16">
                        <Loader2 className="h-9 w-9 animate-spin text-[#d4af37]" />
                        <p className="text-sm text-slate-500">{t('modal.loading')}</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {scheduleList.length === 0 ? (
                        <Card className="flex min-h-[320px] flex-1 flex-col rounded-2xl border-[#d4af37]/20">
                            <CardContent className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
                                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5f3ee] to-[#ece8dc] ring-1 ring-[#d4af37]/15">
                                    <Calendar className="h-9 w-9 text-[#d4af37]/50" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">{t('schedule.empty')}</h3>
                                <p className="max-w-md text-slate-500">{t('schedule.emptyDesc')}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="min-h-0 flex-1 overflow-hidden rounded-2xl border-[#d4af37]/20 shadow-md shadow-[#d4af37]/5">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="sticky top-0 z-10 bg-gradient-to-r from-[#f5f3ee] via-[#faf8f3] to-[#f5f3ee] shadow-[0_1px_0_0_rgba(212,175,55,0.2)]">
                                        <TableRow className="border-0 border-b border-[#d4af37]/20 hover:bg-transparent">
                                            <TableHead className="h-12 whitespace-nowrap px-5 text-left text-xs font-semibold uppercase tracking-wider text-[#8a6d1c]">
                                                {t('table.scheduleCode')}
                                            </TableHead>
                                            <TableHead className="h-12 whitespace-nowrap px-5 text-left text-xs font-semibold uppercase tracking-wider text-[#8a6d1c]">
                                                {t('table.day')}
                                            </TableHead>
                                            <TableHead className="h-12 whitespace-nowrap px-5 text-left text-xs font-semibold uppercase tracking-wider text-[#8a6d1c]">
                                                {t('table.time')}
                                            </TableHead>
                                            <TableHead className="h-12 min-w-[180px] px-5 text-left text-xs font-semibold uppercase tracking-wider text-[#8a6d1c]">
                                                {t('table.note')}
                                            </TableHead>
                                            <TableHead className="h-12 whitespace-nowrap px-5 text-left text-xs font-semibold uppercase tracking-wider text-[#8a6d1c]">
                                                {t('table.status')}
                                            </TableHead>
                                            <TableHead className="h-12 whitespace-nowrap px-5 text-left text-xs font-semibold uppercase tracking-wider text-[#8a6d1c]">
                                                {t('table.creator')}
                                            </TableHead>
                                            <TableHead className="h-12 whitespace-nowrap px-5 text-left text-xs font-semibold uppercase tracking-wider text-[#8a6d1c]">
                                                {t('content.createdAt')}
                                            </TableHead>
                                            <TableHead className="h-12 w-[120px] whitespace-nowrap px-5 text-center text-xs font-semibold uppercase tracking-wider text-[#8a6d1c]">
                                                {t('table.actions')}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {scheduleList.map((schedule) => {
                                            const statusInfo = getStatusInfo(schedule.status);
                                            const StatusIcon = statusInfo.icon;

                                            return (
                                                <TableRow
                                                    key={schedule.id}
                                                    className={`border-slate-100 transition-colors hover:bg-[#faf8f3]/90 ${!schedule.is_active ? 'bg-red-50/35 opacity-[0.92]' : ''}`}
                                                >
                                                    <TableCell className="px-5 py-4 align-middle">
                                                        <Badge
                                                            variant="outline"
                                                            className="font-mono text-xs font-semibold text-[#8a6d1c] border-[#d4af37]/30 bg-[#f5f3ee]/80"
                                                        >
                                                            {schedule.code}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 align-middle">
                                                        <div className="flex flex-wrap gap-1">
                                                            {schedule.days_of_week.map((day) => (
                                                                <span
                                                                    key={day}
                                                                    className="inline-flex items-center rounded-full border border-[#d4af37]/25 bg-white px-2 py-0.5 text-xs font-medium text-[#8a6d1c] shadow-sm"
                                                                >
                                                                    {getDayName(day)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 align-middle">
                                                        <div className="flex items-center gap-2 font-medium text-slate-800">
                                                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5f3ee]">
                                                                <Clock className="h-4 w-4 text-[#d4af37]" />
                                                            </span>
                                                            {formatTime(schedule.time)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="max-w-[220px] px-5 py-4 align-middle">
                                                        <p
                                                            className="line-clamp-2 text-sm leading-snug text-slate-600"
                                                            title={schedule.note}
                                                        >
                                                            {schedule.note}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 align-middle">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span
                                                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${statusInfo.color}`}
                                                            >
                                                                <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                                                                {statusInfo.label}
                                                            </span>
                                                            {!schedule.is_active && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white shadow-sm">
                                                                    <Trash2 className="h-3 w-3 shrink-0" />
                                                                    {t('content.deleted')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 align-middle">
                                                        {schedule.creator ? (
                                                            <div className="flex min-w-0 max-w-[140px] items-center gap-2">
                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] shadow-sm">
                                                                    <User className="h-3.5 w-3.5 text-white" />
                                                                </div>
                                                                <span className="truncate text-sm font-medium text-slate-700">
                                                                    {schedule.creator.full_name}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap px-5 py-4 text-sm text-slate-500 align-middle">
                                                        {formatDate(schedule.created_at)}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-center align-middle">
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => setSelectedSchedule(schedule)}
                                                            className="h-8 gap-1.5 rounded-lg border border-[#d4af37]/20 bg-[#f5f3ee] text-xs text-[#8a6d1c] hover:bg-[#ece8dc]"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            {t('content.detail')}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                    {totalPages > 1 && (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                {t('media.showing')}{' '}
                                <span className="font-medium text-slate-900">
                                    {(currentPage - 1) * limit + 1}
                                </span>{' '}
                                {t('media.to')}{' '}
                                <span className="font-medium text-slate-900">
                                    {Math.min(currentPage * limit, totalItems)}
                                </span>{' '}
                                {t('media.of')}{' '}
                                <span className="font-medium text-slate-900">{totalItems}</span>{' '}
                                {t('media.items')}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="h-9 w-9 rounded-lg border-[#d4af37]/25 text-slate-600 hover:bg-[#f5f3ee] disabled:opacity-50"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                                            <Button
                                                key={pageNum}
                                                type="button"
                                                variant={pageNum === currentPage ? 'default' : 'ghost'}
                                                size="icon"
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`h-9 w-9 rounded-lg font-medium ${
                                                    pageNum === currentPage
                                                        ? 'bg-[#d4af37] text-white shadow-md shadow-[#d4af37]/25 hover:bg-[#c9a227]'
                                                        : 'text-slate-600 hover:bg-[#f5f3ee] hover:text-[#8a6d1c]'
                                                }`}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="h-9 w-9 rounded-lg border-[#d4af37]/25 text-slate-600 hover:bg-[#f5f3ee] disabled:opacity-50"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <ScheduleDetailModal
                isOpen={selectedSchedule !== null}
                schedule={selectedSchedule}
                onClose={() => setSelectedSchedule(null)}
                onStatusChange={() => {
                    fetchScheduleList();
                }}
            />
        </div>
    );
};
