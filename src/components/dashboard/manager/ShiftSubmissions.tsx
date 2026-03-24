import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    RefreshCw,
    Calendar,
    Clock,
    User,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    X,
    CalendarDays,
    CalendarRange
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import {
    ShiftSubmission,
    ShiftSubmissionStatus,
    Shift,
    LocalGuide,
} from '../../../types/manager.types';
import { ShiftSubmissionDetailModal } from './ShiftSubmissionDetailModal';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

/**
 * Manager — lịch đăng ký ca làm (shift submissions).
 *
 * API:
 * - GET  /api/manager/local-guides/shift-submissions — danh sách (`ManagerService.getShiftSubmissions`)
 * - GET  /api/manager/local-guides/shift-submissions/{id} — chi tiết (`ShiftSubmissionDetailModal` + `getShiftSubmissionDetail`)
 * - PATCH /api/manager/local-guides/shift-submissions/{id}/status — duyệt/từ chối (modal + `updateShiftSubmissionStatus`)
 */

// ============ TYPES ============
type ViewMode = 'month' | 'week' | 'year';

interface ShiftWithGuide {
    shift: Shift;
    submission: ShiftSubmission;
}

interface DayShifts {
    date: Date;
    shifts: ShiftWithGuide[];
    hasApproved: boolean;
    hasPending: boolean;
    hasRejected: boolean;
}

// ============ DATE HELPERS ============
const getMonday = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const isSameDay = (d1: Date, d2: Date): boolean => {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

const getCalendarDays = (year: number, month: number): Date[] => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
};

const getWeekDays = (startDate: Date): Date[] => {
    const monday = getMonday(startDate);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
        days.push(addDays(monday, i));
    }
    return days;
};

const getMondayBasedColumn = (date: Date): number => {
    const day = date.getDay();
    return day === 0 ? 7 : day; // Mon=1 ... Sun=7
};

const LIST_PAGE_SIZE = 100;

/** YYYY-MM-DD theo giờ local — tránh lệch ngày khi dùng toISOString() (UTC). */
function toLocalDateKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/**
 * Lịch (tháng/tuần/năm) + filter; tải danh sách bằng GET shift-submissions.
 */
export const ShiftSubmissions: React.FC = () => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    // ============ STATE ============
    const [submissions, setSubmissions] = useState<ShiftSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Calendar state
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);

    // Modal state
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

    // Filter state
    const [guideFilter, setGuideFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<ShiftSubmissionStatus | ''>('');
    const [guides, setGuides] = useState<LocalGuide[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    // ============ COMPUTED VALUES ============
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const calendarDays = useMemo(() => {
        if (viewMode === 'week') {
            return getWeekDays(currentDate);
        }
        return getCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
    }, [viewMode, currentDate]);

    const leadingEmptyDays = useMemo(() => {
        if (viewMode !== 'month' || calendarDays.length === 0) return 0;
        return getMondayBasedColumn(calendarDays[0]) - 1;
    }, [viewMode, calendarDays]);

    const calendarRowCount = viewMode === 'week'
        ? 1
        : Math.ceil((leadingEmptyDays + calendarDays.length) / 7);

    // Map shifts to calendar dates
    const shiftsMap = useMemo(() => {
        const map = new Map<string, DayShifts>();

        submissions.forEach(submission => {
            const weekStart = new Date(submission.week_start_date);
            weekStart.setHours(0, 0, 0, 0);

            submission.shifts.forEach(shift => {
                // Calculate actual date from week_start_date + day_of_week
                // week_start_date is Monday (day 1), so we need to adjust
                let daysToAdd = shift.day_of_week - 1; // 1=Mon, 2=Tue, ..., 0=Sun
                if (shift.day_of_week === 0) daysToAdd = 6; // Sunday is 6 days after Monday

                const shiftDate = addDays(weekStart, daysToAdd);
                const dateKey = toLocalDateKey(shiftDate);

                if (!map.has(dateKey)) {
                    map.set(dateKey, {
                        date: shiftDate,
                        shifts: [],
                        hasApproved: false,
                        hasPending: false,
                        hasRejected: false,
                    });
                }

                const dayShifts = map.get(dateKey)!;
                dayShifts.shifts.push({ shift, submission });

                if (submission.status === 'approved') {
                    dayShifts.hasApproved = true;
                } else if (submission.status === 'pending') {
                    dayShifts.hasPending = true;
                } else if (submission.status === 'rejected') {
                    dayShifts.hasRejected = true;
                }
            });
        });

        return map;
    }, [submissions]);

    // Get shifts for selected date
    const selectedDayShifts = useMemo(() => {
        if (!selectedDate) return null;
        const dateKey = toLocalDateKey(selectedDate);
        return shiftsMap.get(dateKey) || null;
    }, [selectedDate, shiftsMap]);

    // ============ FETCH DATA ============
    const fetchSubmissions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const weekStartParam =
                viewMode === 'week' ? toLocalDateKey(getMonday(currentDate)) : undefined;

            let page = 1;
            let totalPages = 1;
            const merged: ShiftSubmission[] = [];

            while (page <= totalPages) {
                const response = await ManagerService.getShiftSubmissions({
                    page,
                    limit: LIST_PAGE_SIZE,
                    guide_id: guideFilter || undefined,
                    status: statusFilter || undefined,
                    week_start_date: weekStartParam,
                });

                if (!response.success || !response.data) {
                    setSubmissions([]);
                    setError(response.message || t('shifts.errorLoad'));
                    return;
                }

                merged.push(...response.data.data);
                totalPages = Math.max(1, response.data.pagination.totalPages);
                page += 1;
            }

            setSubmissions(merged);
        } catch (err) {
            const message = err instanceof Error ? err.message : t('shifts.errorLoad');
            setError(message);
            setSubmissions([]);
        } finally {
            setLoading(false);
        }
    }, [guideFilter, statusFilter, viewMode, currentDate, t]);

    const fetchGuides = useCallback(async () => {
        try {
            const response = await ManagerService.getLocalGuides({ limit: 100 });
            if (response.success && response.data) {
                setGuides(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching guides:', err);
        }
    }, []);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    useEffect(() => {
        fetchGuides();
    }, [fetchGuides]);

    // ============ NAVIGATION ============
    const navigatePrev = () => {
        if (viewMode === 'year') {
            setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1));
        } else if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        } else {
            setCurrentDate(addDays(currentDate, -7));
        }
    };

    const navigateNext = () => {
        if (viewMode === 'year') {
            setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1));
        } else if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        } else {
            setCurrentDate(addDays(currentDate, 7));
        }
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(new Date());
    };

    const handleManualRefresh = async () => {
        setRefreshing(true);
        await fetchSubmissions();
        setRefreshing(false);
        showToast('success', t('toast.refreshSuccess'), t('toast.refreshSuccessMsg'));
    };

    // ============ HELPERS ============
    const formatTime = (timeString: string) => timeString.slice(0, 5);

    const getMonthName = (month: number): string => {
        const date = new Date(currentDate.getFullYear(), month, 1);
        return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'long' });
    };

    const getStatusColor = (status: ShiftSubmissionStatus) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (status: ShiftSubmissionStatus) => {
        switch (status) {
            case 'approved': return t('status.approved');
            case 'pending': return t('status.pending');
            case 'rejected': return t('status.rejected');
            default: return status;
        }
    };

    const getViewModeButtonClass = (mode: ViewMode) => (
        viewMode === mode
            ? 'bg-white text-slate-900 shadow-sm hover:bg-white'
            : 'text-slate-500 hover:text-slate-700 hover:bg-transparent'
    );

    const renderHeaderTitle = () => {
        const locale = language === 'vi' ? 'vi-VN' : 'en-US';
        if (viewMode === 'year') {
            return `${t('common.year')} ${currentDate.getFullYear()}`;
        }
        if (viewMode === 'month') {
            return currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
        }
        // Week view
        return `${t('common.week')} ${Math.ceil(currentDate.getDate() / 7)} - ${currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}`;
    };

    const handleMonthClick = (monthIndex: number) => {
        const newDate = new Date(currentDate.getFullYear(), monthIndex, 1);
        setCurrentDate(newDate);
        setViewMode('month');
    };

    // ============ RENDER ============
    const dayNames = language === 'vi'
        ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const controlTriggerClass =
        'h-9 rounded-lg border-[#d4af37]/25 bg-white text-sm shadow-sm focus:ring-1 focus:ring-[#d4af37]/40 focus:border-[#d4af37]';

    return (
        <div className="flex h-full flex-col gap-5 p-4 sm:p-6">
            {/* Header + controls — một cụm gọn */}
            <div className="rounded-2xl border border-[#d4af37]/18 bg-gradient-to-br from-white via-[#faf8f4]/90 to-white px-4 py-4 shadow-sm sm:px-5 sm:py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{t('shifts.title')}</h1>
                        <p className="mt-0.5 text-sm text-slate-500">{t('shifts.subtitle')}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 lg:justify-end">
                        <div className="inline-flex shrink-0 rounded-lg border border-slate-200/80 bg-slate-100/90 p-0.5">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('year')}
                                className={`h-8 gap-1 rounded-md px-2.5 text-xs sm:text-sm ${getViewModeButtonClass('year')}`}
                            >
                                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                {t('common.year')}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('month')}
                                className={`h-8 gap-1 rounded-md px-2.5 text-xs sm:text-sm ${getViewModeButtonClass('month')}`}
                            >
                                <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                {t('common.month')}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('week')}
                                className={`h-8 gap-1 rounded-md px-2.5 text-xs sm:text-sm ${getViewModeButtonClass('week')}`}
                            >
                                <CalendarRange className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                {t('common.week')}
                            </Button>
                        </div>

                        <Button
                            type="button"
                            size="sm"
                            onClick={handleManualRefresh}
                            disabled={loading || refreshing}
                            className="h-9 shrink-0 gap-1.5 rounded-lg bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] px-3 text-sm font-medium text-white shadow-sm hover:brightness-105"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${loading || refreshing ? 'animate-spin' : ''}`} />
                            {t('common.refresh')}
                        </Button>

                        <Select value={guideFilter || 'all'} onValueChange={(value) => setGuideFilter(value === 'all' ? '' : value)}>
                            <SelectTrigger className={`w-[min(100vw-2rem,220px)] sm:w-[220px] ${controlTriggerClass}`}>
                                <SelectValue placeholder={t('shifts.allGuides')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('shifts.allGuides')}</SelectItem>
                                {guides.map((guide) => (
                                    <SelectItem key={guide.id} value={guide.id}>
                                        {guide.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={statusFilter || 'all'}
                            onValueChange={(value) =>
                                setStatusFilter(value === 'all' ? '' : (value as ShiftSubmissionStatus))
                            }
                        >
                            <SelectTrigger
                                className={`w-[min(100vw-2rem,200px)] sm:w-[200px] ${controlTriggerClass}`}
                                aria-label={t('shifts.filterByStatus')}
                            >
                                <SelectValue placeholder={t('shifts.allStatuses')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('shifts.allStatuses')}</SelectItem>
                                <SelectItem value="pending">{t('status.pending')}</SelectItem>
                                <SelectItem value="approved">{t('status.approved')}</SelectItem>
                                <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:p-4">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Main Content */}
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-5">
                {/* Calendar */}
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#d4af37]/18 bg-white shadow-sm">
                    {/* Calendar toolbar */}
                    <div className="flex flex-col gap-3 border-b border-slate-100 bg-[#faf8f4]/40 px-3 py-3 sm:px-4 sm:py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <h2 className="text-base font-semibold capitalize text-slate-900 sm:text-lg">
                                    {renderHeaderTitle()}
                                </h2>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={goToToday}
                                        className="h-8 rounded-lg border-[#d4af37]/35 text-xs text-[#6b5420] hover:bg-[#f5f3ee]"
                                    >
                                        {t('common.today')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsDayDetailOpen(true)}
                                        disabled={!selectedDate || viewMode === 'year'}
                                        className="h-8 rounded-lg border-[#d4af37]/35 text-xs text-[#6b5420] hover:bg-[#f5f3ee]"
                                    >
                                        {t('common.details')}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={navigatePrev}
                                    className="h-8 w-8 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={navigateNext}
                                    className="h-8 w-8 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* View Content */}
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
                        </div>
                    ) : viewMode === 'year' ? (
                        // YEAR VIEW
                        <div className="flex-1 grid grid-cols-4 gap-4 p-4 overflow-y-auto">
                            {Array.from({ length: 12 }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleMonthClick(i)}
                                    className={`
                                        flex flex-col items-center justify-center p-6 
                                        rounded-xl border border-slate-100 
                                        hover:border-[#d4af37]/50 hover:bg-[#f5f3ee] hover:shadow-sm 
                                        transition-all
                                        ${new Date().getMonth() === i && new Date().getFullYear() === currentDate.getFullYear()
                                            ? 'bg-[#f5f3ee] border-[#d4af37]/30 ring-1 ring-[#d4af37]/30'
                                            : 'bg-white'
                                        }
                                    `}
                                >
                                    <span className={`text-lg font-semibold ${new Date().getMonth() === i && new Date().getFullYear() === currentDate.getFullYear()
                                        ? 'text-blue-700'
                                        : 'text-slate-700'
                                        }`}>
                                        {getMonthName(i)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        // MONTH & WEEK VIEW
                        <>
                            {/* Legend — chip nhỏ, dễ đọc */}
                            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-2 sm:px-4">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    {t('shifts.legend')}
                                </span>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200/80 bg-green-50/90 px-2.5 py-1 text-xs font-medium text-green-800">
                                        <span className="h-2 w-2 rounded-full bg-green-500" />
                                        {t('status.approved')}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/90 px-2.5 py-1 text-xs font-medium text-amber-900">
                                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                                        {t('status.pending')}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200/80 bg-red-50/90 px-2.5 py-1 text-xs font-medium text-red-800">
                                        <span className="h-2 w-2 rounded-full bg-red-500" />
                                        {t('status.rejected')}
                                    </span>
                                </div>
                            </div>

                            {/* Day Names */}
                            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
                                {dayNames.map((day) => (
                                    <div
                                        key={day}
                                        className="py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:py-2.5 sm:text-xs"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid — tháng: ô cố định tối thiểu, không kéo giãn quá cao */}
                            <div
                                className="grid min-h-0 flex-1 grid-cols-7 overflow-y-auto"
                                style={{
                                    gridTemplateRows:
                                        viewMode === 'week'
                                            ? `repeat(${calendarRowCount}, minmax(11rem, 1fr))`
                                            : `repeat(${calendarRowCount}, minmax(4.75rem, auto))`,
                                }}
                            >
                                {calendarDays.map((date, index) => {
                                    const dateKey = toLocalDateKey(date);
                                    const dayShifts = shiftsMap.get(dateKey);
                                    const isToday = isSameDay(date, today);
                                    const isSelected = selectedDate && isSameDay(date, selectedDate);

                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => setSelectedDate(date)}
                                            style={viewMode === 'month' && index === 0
                                                ? { gridColumnStart: getMondayBasedColumn(date) }
                                                : undefined}
                                            className={`
                                                relative flex flex-col border-b border-r border-slate-100/90 bg-white p-1.5 text-left
                                                transition-colors sm:p-2
                                                ${viewMode === 'week' ? 'min-h-0' : ''}
                                                ${isSelected ? 'z-10 ring-2 ring-inset ring-[#d4af37]/90' : ''}
                                                hover:bg-[#faf8f4]/80
                                            `}
                                        >
                                            <div
                                                className={`
                                                    flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 sm:text-sm
                                                    ${isToday ? 'bg-[#8a6d1c] text-white shadow-sm' : 'text-slate-800'}
                                                `}
                                            >
                                                {date.getDate()}
                                            </div>

                                            {dayShifts && (
                                                <div className="mt-1 flex min-h-0 flex-1 flex-col gap-1">
                                                    {viewMode === 'week' ? (
                                                        <>
                                                            {dayShifts.shifts.slice(0, 4).map((item, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className={`
                                                                        truncate rounded-md px-2 py-1 text-[11px] font-medium sm:text-xs
                                                                        ${item.submission.status === 'approved'
                                                                            ? 'border border-green-200/80 bg-green-50 text-green-800'
                                                                            : item.submission.status === 'pending'
                                                                                ? 'border border-amber-200/80 bg-amber-50 text-amber-900'
                                                                                : 'border border-red-200/80 bg-red-50 text-red-800'
                                                                        }
                                                                    `}
                                                                >
                                                                    {item.submission.guide.full_name.split(' ').pop()}
                                                                </div>
                                                            ))}
                                                            {dayShifts.shifts.length > 4 && (
                                                                <div className="text-[10px] font-medium text-slate-500">
                                                                    +{dayShifts.shifts.length - 4}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="mt-auto flex flex-wrap items-center gap-1">
                                                            <div className="flex items-center gap-1">
                                                                {dayShifts.hasApproved && (
                                                                    <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-sm ring-1 ring-white" />
                                                                )}
                                                                {dayShifts.hasPending && (
                                                                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-sm ring-1 ring-white" />
                                                                )}
                                                                {dayShifts.hasRejected && (
                                                                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm ring-1 ring-white" />
                                                                )}
                                                            </div>
                                                            {dayShifts.shifts.length > 0 && (
                                                                <span className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-semibold tabular-nums text-slate-600">
                                                                    {dayShifts.shifts.length}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Right Panel - Day Detail */}
                {isDayDetailOpen && (
                    <div className="flex max-h-[70vh] w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-[#d4af37]/18 bg-white shadow-sm lg:max-h-none lg:w-[min(100%,20rem)] xl:w-80">
                        {selectedDate ? (
                            <>
                                {/* Panel Header */}
                                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                                    <div>
                                        <h3 className="font-semibold text-slate-900">
                                            {selectedDate.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long'
                                            })}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            {selectedDayShifts ? `${selectedDayShifts.shifts.length} ${t('shifts.shiftCount')}` : t('shifts.noShifts')}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsDayDetailOpen(false)}
                                        className="rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                {/* Panel Content */}
                                <div className="flex-1 overflow-y-auto p-4">
                                    {selectedDayShifts && selectedDayShifts.shifts.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedDayShifts.shifts.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-slate-50 rounded-xl p-3 hover:bg-slate-100 transition-colors"
                                                >
                                                    {/* Guide Info */}
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center">
                                                            {item.submission.guide.avatar_url ? (
                                                                <img
                                                                    src={item.submission.guide.avatar_url}
                                                                    alt={item.submission.guide.full_name}
                                                                    className="w-10 h-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <User className="w-5 h-5 text-white" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-slate-900 truncate">
                                                                {item.submission.guide.full_name}
                                                            </p>
                                                            <p className="text-xs text-slate-500 truncate">
                                                                {item.submission.guide.email}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Shift Time */}
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Clock className="w-4 h-4 text-slate-400" />
                                                        <span className="text-sm text-slate-600">
                                                            {formatTime(item.shift.start_time)} - {formatTime(item.shift.end_time)}
                                                        </span>
                                                    </div>

                                                    {/* Status & Action */}
                                                    <div className="flex items-center justify-between">
                                                        <Badge
                                                            variant="outline"
                                                            className={`gap-1 rounded-full px-2 py-1 text-xs ${getStatusColor(item.submission.status)}`}
                                                        >
                                                            {item.submission.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                                                            {item.submission.status === 'pending' && <Clock className="w-3 h-3" />}
                                                            {item.submission.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                                            {getStatusLabel(item.submission.status)}
                                                        </Badge>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setSelectedSubmissionId(item.submission.id)}
                                                            className="h-8 px-2 text-xs text-[#8a6d1c] hover:bg-[#f5f3ee] hover:text-[#8a6d1c]"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            {t('common.details')}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                            <Calendar className="w-12 h-12 text-slate-300 mb-3" />
                                            <p className="text-slate-500">{t('shifts.noShifts')}</p>
                                            <p className="text-sm text-slate-400">{t('shifts.noShiftsDay')}</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                                <Calendar className="w-16 h-16 text-slate-300 mb-4" />
                                <h3 className="font-medium text-slate-700 mb-1">{t('shifts.selectDay')}</h3>
                                <p className="text-sm text-slate-500">
                                    {t('shifts.selectDayDesc')}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <ShiftSubmissionDetailModal
                isOpen={selectedSubmissionId !== null}
                submissionId={selectedSubmissionId}
                onClose={() => setSelectedSubmissionId(null)}
                onStatusChange={() => {
                    fetchSubmissions();
                }}
            />
        </div>
    );
};
