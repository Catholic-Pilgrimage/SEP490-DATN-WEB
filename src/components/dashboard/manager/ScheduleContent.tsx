import { useEffect, useState, useCallback } from 'react';
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
    User
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { Schedule, ContentStatus } from '../../../types/manager.types';
import { ScheduleDetailModal } from './ScheduleDetailModal';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';

/**
 * ScheduleContent Component
 * 
 * Giải thích:
 * - Hiển thị danh sách lịch lễ (schedules) của site
 * - Có filter theo: status, day_of_week, is_active
 * - Table layout với thông tin ngày, giờ, ghi chú
 */
export const ScheduleContent: React.FC = () => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    // ============ STATE ============
    const [scheduleList, setScheduleList] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(10);

    // Filters
    const [statusFilter, setStatusFilter] = useState<ContentStatus | ''>('');
    const [dayFilter, setDayFilter] = useState<number | undefined>(undefined);
    const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

    // Selected schedule for detail modal
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // ============ FETCH DATA ============
    const fetchScheduleList = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await ManagerService.getScheduleList({
                page: currentPage,
                limit,
                status: statusFilter || undefined,
                day_of_week: dayFilter,
                is_active: activeFilter
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

    // ============ HELPERS ============
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getStatusInfo = (status: ContentStatus) => {
        const statuses = {
            pending: { label: t('status.pending'), color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
            approved: { label: t('status.approved'), color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
            rejected: { label: t('status.rejected'), color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
        };
        return statuses[status] || statuses.pending;
    };

    const getDayName = (day: number): string => {
        const days = language === 'vi'
            ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
            : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[day] || '';
    };

    const formatTime = (time: string): string => {
        // "17:30:00" -> "17:30"
        return time.slice(0, 5);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // ============ RENDER ============
    return (
        <div className="h-full flex flex-col p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('schedule.title')}</h1>
                    <p className="text-slate-500 mt-1">{t('schedule.subtitle')}</p>
                </div>
                <button
                    onClick={handleManualRefresh}
                    disabled={loading || refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white rounded-xl shadow-lg shadow-[#d4af37]/20 hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                    <RefreshCw className={`w-4 h-4 ${loading || refreshing ? 'animate-spin' : ''}`} />
                    {t('common.refresh')}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-[#d4af37]/20 shadow-sm mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-[#8a6d1c]/50" />
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value as ContentStatus | ''); setCurrentPage(1); }}
                            className="px-4 py-2.5 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-slate-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all cursor-pointer"
                        >
                            <option value="">{t('content.allStatus')}</option>
                            <option value="pending">{t('status.pending')}</option>
                            <option value="approved">{t('status.approved')}</option>
                            <option value="rejected">{t('status.rejected')}</option>
                        </select>
                    </div>

                    {/* Day of Week Filter */}
                    <div className="flex items-center gap-2">
                        <select
                            value={dayFilter === undefined ? '' : dayFilter.toString()}
                            onChange={(e) => {
                                const val = e.target.value;
                                setDayFilter(val === '' ? undefined : parseInt(val, 10));
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-slate-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all cursor-pointer"
                        >
                            <option value="">{t('schedule.allDays')}</option>
                            <option value="0">{language === 'vi' ? 'Chủ nhật' : 'Sunday'}</option>
                            <option value="1">{language === 'vi' ? 'Thứ 2' : 'Monday'}</option>
                            <option value="2">{language === 'vi' ? 'Thứ 3' : 'Tuesday'}</option>
                            <option value="3">{language === 'vi' ? 'Thứ 4' : 'Wednesday'}</option>
                            <option value="4">{language === 'vi' ? 'Thứ 5' : 'Thursday'}</option>
                            <option value="5">{language === 'vi' ? 'Thứ 6' : 'Friday'}</option>
                            <option value="6">{language === 'vi' ? 'Thứ 7' : 'Saturday'}</option>
                        </select>
                    </div>

                    {/* Active Filter */}
                    <div className="flex items-center gap-2">
                        <select
                            value={activeFilter === undefined ? '' : activeFilter.toString()}
                            onChange={(e) => {
                                const val = e.target.value;
                                setActiveFilter(val === '' ? undefined : val === 'true');
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-slate-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all cursor-pointer"
                        >
                            <option value="">{t('content.allActive')}</option>
                            <option value="true">{t('content.activeTrue')}</option>
                            <option value="false">{t('content.activeFalse')}</option>
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
                <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-[#d4af37]/20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
                </div>
            ) : (
                <>
                    {/* Content */}
                    {scheduleList.length === 0 ? (
                        /* Empty State */
                        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-[#d4af37]/20 text-center p-12">
                            <div className="w-16 h-16 bg-[#f5f3ee] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 text-[#d4af37]/40" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                {t('schedule.empty')}
                            </h3>
                            <p className="text-slate-500">
                                {t('schedule.emptyDesc')}
                            </p>
                        </div>
                    ) : (
                        /* Table Layout */
                        <div className="bg-white rounded-2xl shadow-sm border border-[#d4af37]/20 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-[#f5f3ee] via-[#faf8f3] to-[#f5f3ee] border-b border-[#d4af37]/20">
                                            <th className="text-left py-4 px-6 font-semibold text-[#8a6d1c] text-sm uppercase tracking-wider">{t('table.scheduleCode')}</th>
                                            <th className="text-left py-4 px-6 font-semibold text-[#8a6d1c] text-sm uppercase tracking-wider">{t('table.day')}</th>
                                            <th className="text-left py-4 px-6 font-semibold text-[#8a6d1c] text-sm uppercase tracking-wider">{t('table.time')}</th>
                                            <th className="text-left py-4 px-6 font-semibold text-[#8a6d1c] text-sm uppercase tracking-wider">{t('table.note')}</th>
                                            <th className="text-left py-4 px-6 font-semibold text-[#8a6d1c] text-sm uppercase tracking-wider">{t('table.status')}</th>
                                            <th className="text-left py-4 px-6 font-semibold text-[#8a6d1c] text-sm uppercase tracking-wider">{t('table.creator')}</th>
                                            <th className="text-left py-4 px-6 font-semibold text-[#8a6d1c] text-sm uppercase tracking-wider">{t('content.createdAt')}</th>
                                            <th className="text-center py-4 px-6 font-semibold text-[#8a6d1c] text-sm uppercase tracking-wider">{t('table.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scheduleList.map((schedule) => {
                                            const statusInfo = getStatusInfo(schedule.status);
                                            const StatusIcon = statusInfo.icon;

                                            return (
                                                <tr
                                                    key={schedule.id}
                                                    className={`border-b border-slate-100 hover:bg-[#faf8f3] transition-all duration-200 ${!schedule.is_active ? 'opacity-60 bg-red-50/30' : ''}`}
                                                >
                                                    <td className="py-4 px-6">
                                                        <span className="inline-flex items-center px-2.5 py-1 bg-[#f5f3ee] border border-[#d4af37]/20 rounded-lg font-mono text-sm text-[#8a6d1c] font-medium">{schedule.code}</span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex flex-wrap gap-1">
                                                            {schedule.days_of_week.map(day => (
                                                                <span
                                                                    key={day}
                                                                    className="px-2.5 py-0.5 bg-[#f5f3ee] text-[#8a6d1c] text-xs font-medium rounded-full border border-[#d4af37]/20"
                                                                >
                                                                    {getDayName(day)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                                                            <Clock className="w-4 h-4 text-[#d4af37]" />
                                                            {formatTime(schedule.time)}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <p className="text-slate-600 line-clamp-2 max-w-[200px]" title={schedule.note}>
                                                            {schedule.note}
                                                        </p>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                                                <StatusIcon className="w-3 h-3" />
                                                                {statusInfo.label}
                                                            </span>
                                                            {!schedule.is_active && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                                                                    <Trash2 className="w-3 h-3" />
                                                                    {t('content.deleted')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {schedule.creator ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center">
                                                                    <User className="w-3 h-3 text-white" />
                                                                </div>
                                                                <span className="text-slate-700 text-sm font-medium truncate max-w-[120px]">
                                                                    {schedule.creator.full_name}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6 text-slate-500 text-sm">
                                                        {formatDate(schedule.created_at)}
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        <button
                                                            onClick={() => setSelectedSchedule(schedule)}
                                                            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#f5f3ee] text-[#8a6d1c] border border-[#d4af37]/20 rounded-lg hover:bg-[#ece8dc] hover:border-[#d4af37]/40 hover:shadow-sm transition-all duration-200 mx-auto"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            {t('content.detail')}
                                                        </button>
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
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-slate-500">
                                {t('media.showing')} <span className="font-medium text-slate-900">{(currentPage - 1) * limit + 1}</span> {t('media.to')} <span className="font-medium text-slate-900">{Math.min(currentPage * limit, totalItems)}</span> {t('media.of')} <span className="font-medium text-slate-900">{totalItems}</span> {t('media.items')}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-[#d4af37]/20 hover:bg-[#f5f3ee] text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                                    ? 'bg-[#d4af37] text-white shadow-lg shadow-[#d4af37]/20'
                                                    : 'hover:bg-[#f5f3ee] text-slate-600 hover:text-[#8a6d1c]'
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
                                    className="p-2 rounded-lg border border-[#d4af37]/20 hover:bg-[#f5f3ee] text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ============ DETAIL MODAL ============ */}
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
