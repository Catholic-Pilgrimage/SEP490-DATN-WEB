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
    User
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { Schedule, ContentStatus } from '../../../types/manager.types';
import { ScheduleDetailModal } from './ScheduleDetailModal';

/**
 * ScheduleContent Component
 * 
 * Giải thích:
 * - Hiển thị danh sách lịch lễ (schedules) của site
 * - Có filter theo: status, day_of_week, is_active
 * - Table layout với thông tin ngày, giờ, ghi chú
 */
export const ScheduleContent: React.FC = () => {
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
                setError(response.message || 'Không thể tải danh sách lịch lễ');
            }
        } catch (err: any) {
            setError(err?.error?.message || 'Không thể tải danh sách lịch lễ');
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, statusFilter, dayFilter, activeFilter]);

    useEffect(() => {
        fetchScheduleList();
    }, [fetchScheduleList]);

    // ============ HELPERS ============
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getStatusInfo = (status: ContentStatus) => {
        const statuses = {
            pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
            approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
            rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
        };
        return statuses[status] || statuses.pending;
    };

    const getDayName = (day: number): string => {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return days[day] || '';
    };

    const formatTime = (time: string): string => {
        // "17:30:00" -> "17:30"
        return time.slice(0, 5);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // ============ RENDER ============
    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Lịch lễ</h1>
                    <p className="text-slate-500 mt-1">Quản lý lịch lễ của site</p>
                </div>
                <button
                    onClick={fetchScheduleList}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Làm mới
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value as ContentStatus | ''); setCurrentPage(1); }}
                            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Chờ duyệt</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="rejected">Từ chối</option>
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
                            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tất cả ngày</option>
                            <option value="0">Chủ nhật</option>
                            <option value="1">Thứ 2</option>
                            <option value="2">Thứ 3</option>
                            <option value="3">Thứ 4</option>
                            <option value="4">Thứ 5</option>
                            <option value="5">Thứ 6</option>
                            <option value="6">Thứ 7</option>
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
                            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tất cả (Active/Deleted)</option>
                            <option value="true">Đang hoạt động</option>
                            <option value="false">Đã xóa</option>
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
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <>
                    {/* Content */}
                    {scheduleList.length === 0 ? (
                        /* Empty State */
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Chưa có lịch lễ nào
                            </h3>
                            <p className="text-slate-500">
                                Các Local Guide chưa tạo lịch lễ cho site
                            </p>
                        </div>
                    ) : (
                        /* Table Layout */
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="text-left py-4 px-6 font-semibold text-slate-700">Mã</th>
                                            <th className="text-left py-4 px-6 font-semibold text-slate-700">Ngày</th>
                                            <th className="text-left py-4 px-6 font-semibold text-slate-700">Giờ</th>
                                            <th className="text-left py-4 px-6 font-semibold text-slate-700">Ghi chú</th>
                                            <th className="text-left py-4 px-6 font-semibold text-slate-700">Trạng thái</th>
                                            <th className="text-left py-4 px-6 font-semibold text-slate-700">Người tạo</th>
                                            <th className="text-left py-4 px-6 font-semibold text-slate-700">Ngày tạo</th>
                                            <th className="text-center py-4 px-6 font-semibold text-slate-700">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scheduleList.map((schedule) => {
                                            const statusInfo = getStatusInfo(schedule.status);
                                            const StatusIcon = statusInfo.icon;

                                            return (
                                                <tr
                                                    key={schedule.id}
                                                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${!schedule.is_active ? 'opacity-60 bg-red-50/30' : ''}`}
                                                >
                                                    <td className="py-4 px-6">
                                                        <span className="font-mono text-sm text-slate-600">{schedule.code}</span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex flex-wrap gap-1">
                                                            {schedule.days_of_week.map(day => (
                                                                <span
                                                                    key={day}
                                                                    className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                                                                >
                                                                    {getDayName(day)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                                                            <Clock className="w-4 h-4 text-slate-400" />
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
                                                                    Đã xóa
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {schedule.creator ? (
                                                            <div className="flex items-center gap-2">
                                                                <User className="w-4 h-4 text-slate-400" />
                                                                <span className="text-slate-600 text-sm truncate max-w-[120px]">
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
                                                            className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors mx-auto"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            Chi tiết
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
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Hiển thị {(currentPage - 1) * limit + 1} đến {Math.min(currentPage * limit, totalItems)} trong tổng số {totalItems} lịch lễ
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                    ? 'bg-blue-600 text-white'
                                                    : 'hover:bg-slate-100 text-slate-600'
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
                                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
