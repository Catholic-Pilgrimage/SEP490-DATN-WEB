import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Calendar, User, ChevronLeft, ChevronRight, AlertCircle, Filter } from 'lucide-react';
import { AdminService } from '../../../../services/admin.service';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { SiteSchedule, SiteSchedulesResponse, ScheduleStatus } from '../../../../types/admin.types';

interface SiteSchedulesTabProps {
    siteId: string;
}

export const SiteSchedulesTab: React.FC<SiteSchedulesTabProps> = ({ siteId }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SiteSchedulesResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(20);
    const [statusFilter, setStatusFilter] = useState<ScheduleStatus | ''>('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await AdminService.getSiteSchedules(siteId, {
                page: currentPage,
                limit,
                status: statusFilter || undefined
            });

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Không thể tải danh sách lịch lễ');
            }
        } catch (err: any) {
            setError(err?.error?.message || 'Không thể tải danh sách lịch lễ');
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

    const getStatusBadge = (status: ScheduleStatus) => {
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
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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

    const schedules = data?.schedules || [];
    const pagination = data?.pagination;
    const totalPages = pagination?.totalPages || 1;

    return (
        <div className="p-6 space-y-4">
            {/* Header with Filter */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-slate-500">
                    {pagination?.total || 0} {t('schedules.items')}
                </p>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value as ScheduleStatus | '');
                            setCurrentPage(1);
                        }}
                        className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">{t('status.allStatus')}</option>
                        <option value="pending">{t('status.pending')}</option>
                        <option value="approved">{t('status.approved')}</option>
                        <option value="rejected">{t('status.rejected')}</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            {schedules.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-slate-900 mb-1">
                        {t('schedules.noSchedules')}
                    </h3>
                    <p className="text-sm text-slate-500">
                        {t('schedules.noSchedulesDesc')}
                    </p>
                </div>
            ) : (
                <>
                    {/* Schedules List */}
                    <div className="space-y-3">
                        {schedules.map((schedule: SiteSchedule) => {
                            const statusBadge = getStatusBadge(schedule.status);

                            return (
                                <div
                                    key={schedule.id}
                                    className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                                <span className="text-white font-bold text-lg">{formatTime(schedule.time)}</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-mono">{schedule.code}</p>
                                                {schedule.note && (
                                                    <h4 className="font-medium text-slate-900">{schedule.note}</h4>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                                            {statusBadge.label}
                                        </span>
                                    </div>

                                    {/* Days */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs text-slate-500">Ngày lễ:</span>
                                        <div className="flex flex-wrap gap-1">
                                            {schedule.days_of_week.map((day) => (
                                                <span
                                                    key={day}
                                                    className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded"
                                                >
                                                    {getDayName(day)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Creator info */}
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <User className="w-3.5 h-3.5" />
                                        <span>{schedule.creator.full_name}</span>
                                    </div>

                                    {/* Rejection reason if rejected */}
                                    {schedule.status === 'rejected' && schedule.rejection_reason && (
                                        <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                                            <strong>Lý do từ chối:</strong> {schedule.rejection_reason}
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
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
