import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, MapPin, Clock, Calendar, User, AlertCircle, Filter, Sparkles } from 'lucide-react';
import { AdminService } from '../../../../services/admin.service';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { SiteEvent, SiteEventsResponse, EventStatus } from '../../../../types/admin.types';
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

interface SiteEventsTabProps {
    siteId: string;
}

export const SiteEventsTab: React.FC<SiteEventsTabProps> = ({ siteId }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SiteEventsResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<EventStatus | ''>('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await AdminService.getSiteEvents(siteId, {
                page: currentPage,
                limit,
                status: statusFilter || undefined
            });

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Không thể tải danh sách sự kiện');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể tải danh sách sự kiện';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [siteId, currentPage, limit, statusFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatTime = (time: string): string => {
        return time.substring(0, 5); // HH:mm
    };

    const getStatusBadge = (status: EventStatus) => {
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

    const events = data?.events || [];
    const pagination = data?.pagination;
    const totalPages = pagination?.totalPages || 1;

    return (
        <div className="p-6 space-y-4">
            {/* Header with Filter */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-slate-500">
                    {pagination?.total || 0} {t('events.items')}
                </p>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <Select
                        value={statusFilter || 'all'}
                        onValueChange={(value) => {
                            setStatusFilter(value === 'all' ? '' : (value as EventStatus));
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
            {events.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-medium text-slate-900 mb-1">
                        {t('events.noEvents')}
                    </h3>
                    <p className="text-sm text-slate-500">
                        {t('events.noEventsDesc')}
                    </p>
                </div>
            ) : (
                <>
                    {/* Events List */}
                    <div className="space-y-4">
                        {events.map((event: SiteEvent) => {
                            const statusBadge = getStatusBadge(event.status);

                            return (
                                <div
                                    key={event.id}
                                    className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    {/* Banner */}
                                    {event.banner_url && (
                                        <div className="relative h-32 bg-slate-100">
                                            <img
                                                src={event.banner_url}
                                                alt={event.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                                                    {statusBadge.label}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="p-4">
                                        {/* Header without banner */}
                                        {!event.banner_url && (
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs text-slate-500 font-mono">{event.code}</span>
                                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                                                    {statusBadge.label}
                                                </span>
                                            </div>
                                        )}

                                        {event.banner_url && (
                                            <p className="text-xs text-slate-500 font-mono mb-1">{event.code}</p>
                                        )}

                                        <h4 className="font-semibold text-slate-900 text-lg mb-2">{event.name}</h4>

                                        {event.description && (
                                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{event.description}</p>
                                        )}

                                        {/* Date & Time */}
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-3">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        {event.location && (
                                            <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-3">
                                                <MapPin className="w-4 h-4 text-slate-400" />
                                                <span>{event.location}</span>
                                            </div>
                                        )}

                                        {/* Creator */}
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <User className="w-3.5 h-3.5" />
                                            <span>{event.creator.full_name}</span>
                                        </div>

                                        {/* Rejection reason */}
                                        {event.status === 'rejected' && event.rejection_reason && (
                                            <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                                                <strong>Lý do từ chối:</strong> {event.rejection_reason}
                                            </div>
                                        )}
                                    </div>
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
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                                                    className="cursor-pointer"
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
                                            onClick={() => currentPage < totalPages && setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
