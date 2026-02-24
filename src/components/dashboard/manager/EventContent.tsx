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
    User,
    MapPin,
    Sparkles
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { Event, ContentStatus } from '../../../types/manager.types';
import { EventDetailModal } from './EventDetailModal';
import { useLanguage } from '../../../contexts/LanguageContext';

/**
 * EventContent Component
 * 
 * Hiển thị danh sách sự kiện của site với card layout
 * Filter theo: status, is_active
 */
export const EventContent: React.FC = () => {
    const { t, language } = useLanguage();
    // ============ STATE ============
    const [eventList, setEventList] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(10);

    // Filters
    const [statusFilter, setStatusFilter] = useState<ContentStatus | ''>('');
    const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

    // Selected event for detail modal
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    // ============ FETCH DATA ============
    const fetchEventList = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await ManagerService.getEventList({
                page: currentPage,
                limit,
                status: statusFilter || undefined,
                is_active: activeFilter
            });

            if (response.success && response.data) {
                setEventList(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalItems(response.data.pagination.totalItems);
            } else {
                setError(response.message || t('event.loadError'));
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('event.loadError');
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, statusFilter, activeFilter]);

    useEffect(() => {
        fetchEventList();
    }, [fetchEventList]);

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (time: string): string => {
        return time.slice(0, 5);
    };

    const formatDateRange = (startDate: string, endDate: string): string => {
        if (startDate === endDate) {
            return formatDate(startDate);
        }
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    };

    // ============ RENDER ============
    return (
        <div className="h-full flex flex-col p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('event.title')}</h1>
                    <p className="text-slate-500 mt-1">{t('event.subtitle')}</p>
                </div>
                <button
                    onClick={fetchEventList}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white rounded-xl shadow-lg shadow-[#d4af37]/20 hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {t('common.refresh')}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#d4af37]/20 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-[#8a6d1c]/50" />
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value as ContentStatus | ''); setCurrentPage(1); }}
                            className="px-4 py-2.5 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent hover:border-[#d4af37]/50 transition-colors"
                        >
                            <option value="">{t('content.allStatus')}</option>
                            <option value="pending">{t('status.pending')}</option>
                            <option value="approved">{t('status.approved')}</option>
                            <option value="rejected">{t('status.rejected')}</option>
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
                            className="px-4 py-2.5 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent hover:border-[#d4af37]/50 transition-colors"
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
                    {eventList.length === 0 ? (
                        /* Empty State */
                        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-[#d4af37]/20 text-center p-12">
                            <div className="w-16 h-16 bg-[#f5f3ee] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-8 h-8 text-[#d4af37]/40" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                {t('event.empty')}
                            </h3>
                            <p className="text-slate-500">
                                {t('event.emptyDesc')}
                            </p>
                        </div>
                    ) : (
                        /* Card Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {eventList.map((event) => {
                                const statusInfo = getStatusInfo(event.status);
                                const StatusIcon = statusInfo.icon;

                                return (
                                    <div
                                        key={event.id}
                                        className={`group bg-white rounded-2xl shadow-sm border border-[#d4af37]/20 overflow-hidden hover:shadow-xl hover:border-[#d4af37]/40 hover:-translate-y-1 transition-all duration-300 ${!event.is_active ? 'opacity-60' : ''}`}
                                    >
                                        {/* Banner Image */}
                                        <div className="relative h-44 bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] overflow-hidden">
                                            {event.banner_url ? (
                                                <img
                                                    src={event.banner_url}
                                                    alt={event.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Sparkles className="w-12 h-12 text-white/30" />
                                                </div>
                                            )}

                                            {/* Dark gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                            {/* Status Badge */}
                                            <div className="absolute top-3 left-3 flex items-center gap-2">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm bg-white/90 ${statusInfo.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusInfo.label}
                                                </span>
                                                {!event.is_active && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                                                        <Trash2 className="w-3 h-3" />
                                                        {t('content.deleted')}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Code */}
                                            <span className="absolute top-3 right-3 px-2.5 py-1 bg-black/40 backdrop-blur-md text-white text-xs rounded-lg font-mono border border-white/10">
                                                {event.code}
                                            </span>

                                            {/* Name overlay on banner */}
                                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                                <h3 className="font-bold text-white text-lg line-clamp-1 drop-shadow-md">
                                                    {event.name}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            {/* Description */}
                                            <p className="text-slate-500 text-sm line-clamp-2 mb-4 min-h-[40px] leading-relaxed">
                                                {event.description}
                                            </p>

                                            {/* Info chips */}
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2.5 text-sm text-slate-700">
                                                    <div className="w-7 h-7 rounded-lg bg-[#f5f3ee] flex items-center justify-center flex-shrink-0">
                                                        <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                                                    </div>
                                                    <span className="font-medium">{formatDateRange(event.start_date, event.end_date)}</span>
                                                </div>
                                                <div className="flex items-center gap-2.5 text-sm text-slate-700">
                                                    <div className="w-7 h-7 rounded-lg bg-[#f5f3ee] flex items-center justify-center flex-shrink-0">
                                                        <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                                                    </div>
                                                    <span className="font-medium">{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                                                </div>
                                                <div className="flex items-center gap-2.5 text-sm text-slate-700">
                                                    <div className="w-7 h-7 rounded-lg bg-[#f5f3ee] flex items-center justify-center flex-shrink-0">
                                                        <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                                                    </div>
                                                    <span className="truncate font-medium">{event.location}</span>
                                                </div>
                                            </div>

                                            {/* Creator */}
                                            {event.creator && (
                                                <div className="flex items-center gap-2 text-xs mb-4 pt-3 border-t border-[#d4af37]/10">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center flex-shrink-0">
                                                        <User className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="truncate font-medium text-slate-700">{event.creator.full_name}</span>
                                                </div>
                                            )}

                                            {/* Action Button */}
                                            <button
                                                onClick={() => setSelectedEvent(event)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#f5f3ee] text-[#8a6d1c] border border-[#d4af37]/20 rounded-xl hover:bg-[#ece8dc] hover:border-[#d4af37]/40 hover:shadow-sm transition-all duration-200"
                                            >
                                                <Eye className="w-4 h-4" />
                                                {t('content.detail')}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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
            <EventDetailModal
                isOpen={selectedEvent !== null}
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onStatusChange={() => {
                    fetchEventList();
                }}
            />
        </div>
    );
};
