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
    LocalGuide
} from '../../../types/manager.types';
import { ShiftSubmissionDetailModal } from './ShiftSubmissionDetailModal';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';

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
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Find the Monday of the first week
    let startDate = getMonday(firstDay);
    // If the Monday is after the 1st, go back a week
    if (startDate.getDate() > 1 && startDate.getMonth() === month) {
        startDate = addDays(startDate, -7);
    }

    const days: Date[] = [];
    let current = new Date(startDate);

    // Generate 6 weeks (42 days) to ensure we cover the whole month
    for (let i = 0; i < 42; i++) {
        days.push(new Date(current));
        current = addDays(current, 1);
        // Stop if we've passed the last day and we're in a new week
        if (current > lastDay && current.getDay() === 1) {
            break;
        }
    }

    return days;
};

const getWeekDays = (startDate: Date): Date[] => {
    const monday = getMonday(startDate);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
        days.push(addDays(monday, i));
    }
    return days;
};

/**
 * ShiftSubmissions Component - Calendar View
 * 
 * Features:
 * - Month and Week view toggle
 * - Click date to see shifts in right panel
 * - Pending shifts shown with different color
 * - Approved shifts shown with green
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

    // Modal state
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

    // Filter state
    const [guideFilter, setGuideFilter] = useState('');
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
                const dateKey = shiftDate.toISOString().split('T')[0];

                if (!map.has(dateKey)) {
                    map.set(dateKey, {
                        date: shiftDate,
                        shifts: [],
                        hasApproved: false,
                        hasPending: false
                    });
                }

                const dayShifts = map.get(dateKey)!;
                dayShifts.shifts.push({ shift, submission });

                if (submission.status === 'approved') {
                    dayShifts.hasApproved = true;
                } else if (submission.status === 'pending') {
                    dayShifts.hasPending = true;
                }
            });
        });

        return map;
    }, [submissions]);

    // Get shifts for selected date
    const selectedDayShifts = useMemo(() => {
        if (!selectedDate) return null;
        const dateKey = selectedDate.toISOString().split('T')[0];
        return shiftsMap.get(dateKey) || null;
    }, [selectedDate, shiftsMap]);

    // ============ FETCH DATA ============
    const fetchSubmissions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all submissions for current view (we need enough data)
            const response = await ManagerService.getShiftSubmissions({
                limit: 100,
                guide_id: guideFilter || undefined
            });

            if (response.success && response.data) {
                setSubmissions(response.data.data);
            } else {
                setError(response.message || t('shifts.errorLoad'));
            }
        } catch (err: any) {
            setError(err?.error?.message || t('shifts.errorLoad'));
        } finally {
            setLoading(false);
        }
    }, [guideFilter]);

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

    return (
        <div className="h-full flex flex-col p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('shifts.title')}</h1>
                    <p className="text-slate-500 mt-1">{t('shifts.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-slate-100 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('year')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'year'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Calendar className="w-4 h-4" />
                            {t('common.year')}
                        </button>
                        <button
                            onClick={() => setViewMode('month')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'month'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <CalendarDays className="w-4 h-4" />
                            {t('common.month')}
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'week'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <CalendarRange className="w-4 h-4" />
                            {t('common.week')}
                        </button>
                    </div>

                    {/* Guide Filter */}
                    <select
                        value={guideFilter}
                        onChange={(e) => setGuideFilter(e.target.value)}
                        className="px-4 py-2.5 border border-[#d4af37]/20 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                    >
                        <option value="">{t('shifts.allGuides')}</option>
                        {guides.map(guide => (
                            <option key={guide.id} value={guide.id}>{guide.full_name}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleManualRefresh}
                        disabled={loading || refreshing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white font-medium rounded-xl hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-[#d4af37]/20"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading || refreshing ? 'animate-spin' : ''}`} />
                        {t('common.refresh')}
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 flex items-center gap-2 mb-6">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex gap-6 min-h-0">
                {/* Calendar */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-[#d4af37]/20 overflow-hidden flex flex-col">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-semibold text-slate-900">
                                {renderHeaderTitle()}
                            </h2>
                            <button
                                onClick={goToToday}
                                className="px-3 py-1 text-sm text-[#8a6d1c] border border-[#d4af37]/30 rounded-lg hover:bg-[#f5f3ee] transition-colors"
                            >
                                {t('common.today')}
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={navigatePrev}
                                className="p-2 hover:bg-[#f5f3ee] rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={navigateNext}
                                className="p-2 hover:bg-[#f5f3ee] rounded-lg transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
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
                            {/* Legend */}
                            <div className="flex items-center gap-4 px-4 py-2 border-b border-slate-100 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-slate-600">{t('status.approved')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <span className="text-slate-600">{t('status.pending')}</span>
                                </div>
                            </div>

                            {/* Day Names */}
                            <div className="grid grid-cols-7 border-b border-slate-200">
                                {dayNames.map(day => (
                                    <div
                                        key={day}
                                        className="py-3 text-center text-sm font-semibold text-slate-500"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className={`flex-1 grid grid-cols-7 ${viewMode === 'week' ? 'grid-rows-1' : ''}`}>
                                {calendarDays.map((date, index) => {
                                    const dateKey = date.toISOString().split('T')[0];
                                    const dayShifts = shiftsMap.get(dateKey);
                                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                                    const isToday = isSameDay(date, today);
                                    const isSelected = selectedDate && isSameDay(date, selectedDate);

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedDate(date)}
                                            className={`
                                                p-2 border-b border-r border-slate-100 
                                                text-left transition-colors relative
                                                ${viewMode === 'week' ? 'min-h-[200px]' : 'min-h-[80px]'}
                                                ${isCurrentMonth ? 'bg-white' : 'bg-slate-50'}
                                                ${isSelected ? 'ring-2 ring-[#d4af37] ring-inset z-10' : ''}
                                                hover:bg-[#f5f3ee]
                                            `}
                                        >
                                            {/* Date Number */}
                                            <div className={`
                                                inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
                                                ${isToday ? 'bg-[#8a6d1c] text-white' : ''}
                                                ${!isToday && isCurrentMonth ? 'text-slate-900' : ''}
                                                ${!isToday && !isCurrentMonth ? 'text-slate-400' : ''}
                                            `}>
                                                {date.getDate()}
                                            </div>

                                            {/* Shift Indicators */}
                                            {dayShifts && (
                                                <div className="mt-1 space-y-1">
                                                    {viewMode === 'week' ? (
                                                        // Week view - show details
                                                        dayShifts.shifts.slice(0, 4).map((item, idx) => (
                                                            <div
                                                                key={idx}
                                                                className={`
                                                                    text-xs px-2 py-1 rounded truncate
                                                                    ${item.submission.status === 'approved'
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : item.submission.status === 'pending'
                                                                            ? 'bg-yellow-100 text-yellow-700'
                                                                            : 'bg-red-100 text-red-700'
                                                                    }
                                                                `}
                                                            >
                                                                {item.submission.guide.full_name.split(' ').pop()}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        // Month view - show dots
                                                        <div className="flex items-center gap-1">
                                                            {dayShifts.hasApproved && (
                                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                            )}
                                                            {dayShifts.hasPending && (
                                                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                                            )}
                                                            {dayShifts.shifts.length > 0 && (
                                                                <span className="text-xs text-slate-500 ml-1">
                                                                    {dayShifts.shifts.length}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {viewMode === 'week' && dayShifts.shifts.length > 4 && (
                                                        <div className="text-xs text-slate-500">
                                                            +{dayShifts.shifts.length - 4} more
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
                <div className="w-80 bg-white rounded-2xl shadow-sm border border-[#d4af37]/20 overflow-hidden flex flex-col">
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
                                <button
                                    onClick={() => setSelectedDate(null)}
                                    className="p-1 hover:bg-slate-100 rounded-lg"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
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
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.submission.status)}`}>
                                                        {item.submission.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                                                        {item.submission.status === 'pending' && <Clock className="w-3 h-3" />}
                                                        {item.submission.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                                        {getStatusLabel(item.submission.status)}
                                                    </span>
                                                    <button
                                                        onClick={() => setSelectedSubmissionId(item.submission.id)}
                                                        className="flex items-center gap-1 text-xs text-[#8a6d1c] hover:text-[#d4af37]"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        {t('common.details')}
                                                    </button>
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
