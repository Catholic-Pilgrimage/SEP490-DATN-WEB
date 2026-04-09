import React, { useState, useEffect, useCallback } from 'react';
import {
    Loader2,
    MapPin,
    Clock,
    Calendar,
    User,
    AlertCircle,
    Filter,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Trash2,
    Timer,
    Play,
    CheckSquare
} from 'lucide-react';
import { AdminService } from '../../../../services/admin.service';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { SiteEvent, SiteEventsResponse, EventStatus, EventTimeState } from '../../../../types/admin.types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SiteEventsTabProps {
    siteId: string;
}

export const SiteEventsTab: React.FC<SiteEventsTabProps> = ({ siteId }) => {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SiteEventsResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<EventStatus | ''>('');
    const [timeStateFilter, setTimeStateFilter] = useState<EventTimeState | ''>('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await AdminService.getSiteEvents(siteId, {
                page: currentPage,
                limit,
                status: statusFilter || undefined,
                time_state: timeStateFilter || undefined
            });

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || t('event.loadError'));
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : t('event.loadError');
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [siteId, currentPage, limit, statusFilter, timeStateFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ============ HELPERS ============
    const formatDate = (dateStr: string): string => {
        return new Date(dateStr).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (time: string): string => {
        return time.substring(0, 5);
    };

    const formatDateRange = (startDate: string, endDate: string): string => {
        if (startDate === endDate) return formatDate(startDate);
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    };

    const getStatusInfo = (status: EventStatus) => {
        const statuses = {
            pending: { label: t('status.pending'), color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
            approved: { label: t('status.approved'), color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
            rejected: { label: t('status.rejected'), color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
        };
        return statuses[status] || statuses.pending;
    };

    const getTimeStateInfo = (timeState: EventTimeState) => {
        const states = {
            upcoming: { label: t('event.upcoming'), color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Timer },
            ongoing: { label: t('event.ongoing'), color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Play },
            ended: { label: t('event.ended'), color: 'bg-slate-100 text-slate-600 border-slate-200', icon: CheckSquare }
        };
        return states[timeState] || states.upcoming;
    };

    const handlePageChange = (page: number) => {
        const totalPages = data?.pagination?.totalPages || 1;
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // ============ RENDER ============
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
    const totalItems = pagination?.total || 0;

    return (
        <div className="p-6 space-y-5">
            {/* Header with Filters */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-slate-500">
                    {totalItems} {t('events.items')}
                </p>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#8a6d1c]/50" />
                    <Select
                        value={statusFilter || 'all'}
                        onValueChange={(value) => {
                            setStatusFilter(value === 'all' ? '' : (value as EventStatus));
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="h-9 w-[170px] rounded-xl border-[#d4af37]/30 bg-[#f5f3ee] text-slate-700 focus:ring-[#d4af37] text-sm">
                            <SelectValue placeholder={t('status.allStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('status.allStatus')}</SelectItem>
                            <SelectItem value="pending">{t('status.pending')}</SelectItem>
                            <SelectItem value="approved">{t('status.approved')}</SelectItem>
                            <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={timeStateFilter || 'all'}
                        onValueChange={(value) => {
                            setTimeStateFilter(value === 'all' ? '' : (value as EventTimeState));
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="h-9 w-[170px] rounded-xl border-[#d4af37]/30 bg-[#f5f3ee] text-slate-700 focus:ring-[#d4af37] text-sm">
                            <SelectValue placeholder={t('event.allTimeState')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('event.allTimeState')}</SelectItem>
                            <SelectItem value="upcoming">{t('event.upcoming')}</SelectItem>
                            <SelectItem value="ongoing">{t('event.ongoing')}</SelectItem>
                            <SelectItem value="ended">{t('event.ended')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Content */}
            {events.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-[#f5f3ee] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-[#d4af37]/40" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">
                        {t('events.noEvents')}
                    </h3>
                    <p className="text-sm text-slate-500">
                        {t('events.noEventsDesc')}
                    </p>
                </div>
            ) : (
                <>
                    {/* Card Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {events.map((event: SiteEvent) => {
                            const statusInfo = getStatusInfo(event.status);
                            const StatusIcon = statusInfo.icon;
                            const timeStateInfo = event.time_state ? getTimeStateInfo(event.time_state) : null;
                            const TimeStateIcon = timeStateInfo?.icon;

                            return (
                                <div
                                    key={event.id}
                                    className={`group bg-white rounded-2xl shadow-sm border border-[#d4af37]/15 overflow-hidden hover:shadow-lg hover:border-[#d4af37]/30 hover:-translate-y-0.5 transition-all duration-300 ${!event.is_active ? 'opacity-60' : ''}`}
                                >
                                    {/* Banner Image */}
                                    <div className="relative h-36 bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] overflow-hidden">
                                        {event.banner_url ? (
                                            <img
                                                src={event.banner_url}
                                                alt={event.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Sparkles className="w-10 h-10 text-white/25" />
                                            </div>
                                        )}

                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                        {/* Badges */}
                                        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                                            <Badge className={`px-2 py-0.5 text-[11px] font-medium border backdrop-blur-sm bg-white/90 hover:bg-white/90 ${statusInfo.color}`}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {statusInfo.label}
                                            </Badge>
                                            {timeStateInfo && TimeStateIcon && (
                                                <Badge className={`px-2 py-0.5 text-[11px] font-medium border backdrop-blur-sm bg-white/90 hover:bg-white/90 ${timeStateInfo.color}`}>
                                                    <TimeStateIcon className="w-3 h-3 mr-1" />
                                                    {timeStateInfo.label}
                                                </Badge>
                                            )}
                                            {!event.is_active && (
                                                <Badge variant="destructive" className="px-2 py-0.5 text-[11px] font-medium">
                                                    <Trash2 className="w-3 h-3 mr-1" />
                                                    {t('content.deleted')}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Code */}
                                        <Badge variant="outline" className="absolute top-3 right-3 px-2 py-0.5 bg-black/40 backdrop-blur-md text-white text-[11px] rounded-lg font-mono border-white/10 hover:bg-black/50">
                                            {event.code}
                                        </Badge>

                                        {/* Name overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <h4 className="font-bold text-white text-base line-clamp-1 drop-shadow-md">
                                                {event.name}
                                            </h4>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        {/* Description */}
                                        {event.description && (
                                            <p className="text-slate-500 text-sm line-clamp-2 mb-3 leading-relaxed">
                                                {event.description}
                                            </p>
                                        )}

                                        {/* Info chips */}
                                        <div className="space-y-1.5 mb-3">
                                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                                <div className="w-6 h-6 rounded-lg bg-[#f5f3ee] flex items-center justify-center flex-shrink-0">
                                                    <Calendar className="w-3 h-3 text-[#d4af37]" />
                                                </div>
                                                <span className="font-medium text-xs">{formatDateRange(event.start_date, event.end_date)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                                <div className="w-6 h-6 rounded-lg bg-[#f5f3ee] flex items-center justify-center flex-shrink-0">
                                                    <Clock className="w-3 h-3 text-[#d4af37]" />
                                                </div>
                                                <span className="font-medium text-xs">{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                                            </div>
                                            {event.location && (
                                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                                    <div className="w-6 h-6 rounded-lg bg-[#f5f3ee] flex items-center justify-center flex-shrink-0">
                                                        <MapPin className="w-3 h-3 text-[#d4af37]" />
                                                    </div>
                                                    <span className="truncate font-medium text-xs">{event.location}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Creator */}
                                        <div className="flex items-center gap-2 text-xs pt-3 border-t border-[#d4af37]/10">
                                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center flex-shrink-0">
                                                <User className="w-2.5 h-2.5 text-white" />
                                            </div>
                                            <span className="truncate font-medium text-slate-600">{event.creator.full_name}</span>
                                        </div>

                                        {/* Rejection reason */}
                                        {event.status === 'rejected' && event.rejection_reason && (
                                            <div className="mt-3 p-2.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                                                <strong>{t('content.rejectionReason')}:</strong> {event.rejection_reason}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-2">
                            <p className="text-sm text-slate-500">
                                {t('media.showing')} <span className="font-medium text-slate-900">{(currentPage - 1) * limit + 1}</span> {t('media.to')} <span className="font-medium text-slate-900">{Math.min(currentPage * limit, totalItems)}</span> {t('media.of')} <span className="font-medium text-slate-900">{totalItems}</span> {t('events.items')}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="border-[#d4af37]/20 hover:bg-[#f5f3ee] text-slate-600 rounded-lg h-9 w-9"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
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
                                            <Button
                                                key={pageNum}
                                                variant={pageNum === currentPage ? "default" : "ghost"}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-9 h-9 rounded-lg font-medium transition-colors ${pageNum === currentPage
                                                    ? 'bg-[#d4af37] hover:bg-[#b5952f] text-white shadow-md shadow-[#d4af37]/20'
                                                    : 'text-slate-600 hover:text-[#8a6d1c] hover:bg-[#f5f3ee]'
                                                    }`}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="border-[#d4af37]/20 hover:bg-[#f5f3ee] text-slate-600 rounded-lg h-9 w-9"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
