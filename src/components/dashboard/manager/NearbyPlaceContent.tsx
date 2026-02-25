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
    MapPin,
    User,
    Utensils,
    Hotel,
    Heart,
    Phone
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { NearbyPlace, ContentStatus, NearbyPlaceCategory } from '../../../types/manager.types';
import { NearbyPlaceDetailModal } from './NearbyPlaceDetailModal';
import { useLanguage } from '../../../contexts/LanguageContext';

/**
 * NearbyPlaceContent Component
 * 
 * Hiển thị danh sách địa điểm lân cận của site với card layout
 * Filter theo: status, category, is_active
 */
export const NearbyPlaceContent: React.FC = () => {
    const { t } = useLanguage();
    // ============ STATE ============
    const [placeList, setPlaceList] = useState<NearbyPlace[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(12);

    // Filters
    const [statusFilter, setStatusFilter] = useState<ContentStatus | ''>('');
    const [categoryFilter, setCategoryFilter] = useState<NearbyPlaceCategory | ''>('');
    const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

    // Selected place for detail modal
    const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);

    // ============ FETCH DATA ============
    const fetchPlaceList = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await ManagerService.getNearbyPlaceList({
                page: currentPage,
                limit,
                status: statusFilter || undefined,
                category: categoryFilter || undefined,
                is_active: activeFilter
            });

            if (response.success && response.data) {
                setPlaceList(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalItems(response.data.pagination.totalItems);
            } else {
                setError(response.message || t('nearby.loadError'));
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('nearby.loadError');
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, statusFilter, categoryFilter, activeFilter]);

    useEffect(() => {
        fetchPlaceList();
    }, [fetchPlaceList]);

    // ============ HELPERS ============
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getStatusInfo = (status: ContentStatus) => {
        const statuses = {
            pending: { label: t('status.pending'), color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
            approved: { label: t('status.approved'), color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
            rejected: { label: t('status.rejected'), color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle }
        };
        return statuses[status] || statuses.pending;
    };

    const getCategoryInfo = (category: NearbyPlaceCategory) => {
        const categories = {
            food: { label: t('category.food'), icon: Utensils, color: 'bg-orange-100 text-orange-700', gradient: 'from-amber-500 via-orange-500 to-red-400', iconBg: 'bg-white/20' },
            lodging: { label: t('category.lodging'), icon: Hotel, color: 'bg-sky-100 text-sky-700', gradient: 'from-sky-500 via-blue-500 to-indigo-400', iconBg: 'bg-white/20' },
            medical: { label: t('category.medical'), icon: Heart, color: 'bg-rose-100 text-rose-700', gradient: 'from-rose-500 via-pink-500 to-fuchsia-400', iconBg: 'bg-white/20' }
        };
        return categories[category] || categories.food;
    };

    const formatDistance = (meters: number): string => {
        if (meters < 1000) {
            return `${meters}m`;
        }
        return `${(meters / 1000).toFixed(1)}km`;
    };

    // ============ RENDER ============
    return (
        <div className="h-full flex flex-col p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('nearby.title')}</h1>
                    <p className="text-slate-500 mt-1">{t('nearby.subtitle')}</p>
                </div>
                <button
                    onClick={fetchPlaceList}
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
                            className="px-4 py-2.5 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-slate-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all cursor-pointer"
                        >
                            <option value="">{t('content.allStatus')}</option>
                            <option value="pending">{t('status.pending')}</option>
                            <option value="approved">{t('status.approved')}</option>
                            <option value="rejected">{t('status.rejected')}</option>
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-2">
                        <select
                            value={categoryFilter}
                            onChange={(e) => { setCategoryFilter(e.target.value as NearbyPlaceCategory | ''); setCurrentPage(1); }}
                            className="px-4 py-2.5 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-slate-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all cursor-pointer"
                        >
                            <option value="">{t('nearby.allCategories')}</option>
                            <option value="food">{t('category.food')}</option>
                            <option value="lodging">{t('category.lodging')}</option>
                            <option value="medical">{t('category.medical')}</option>
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
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 flex items-center gap-2 mb-4">
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
                    {placeList.length === 0 ? (
                        /* Empty State */
                        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-[#d4af37]/20 text-center p-12">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#f5f3ee] to-[#ece8dc] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#d4af37]/20">
                                <MapPin className="w-10 h-10 text-[#d4af37]/40" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                {t('nearby.empty')}
                            </h3>
                            <p className="text-slate-500 max-w-sm">
                                {t('nearby.emptyDesc')}
                            </p>
                        </div>
                    ) : (
                        /* Card Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {placeList.map((place) => {
                                const statusInfo = getStatusInfo(place.status);
                                const StatusIcon = statusInfo.icon;
                                const categoryInfo = getCategoryInfo(place.category);
                                const CategoryIcon = categoryInfo.icon;

                                return (
                                    <div
                                        key={place.id}
                                        onClick={() => setSelectedPlace(place)}
                                        className={`group bg-white rounded-2xl shadow-sm border border-[#d4af37]/15 overflow-hidden hover:shadow-xl hover:shadow-[#d4af37]/10 hover:border-[#d4af37]/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer ${!place.is_active ? 'opacity-60' : ''}`}
                                    >
                                        {/* Gradient Hero Header */}
                                        <div className={`relative h-28 bg-gradient-to-br ${categoryInfo.gradient} overflow-hidden`}>
                                            {/* Decorative pattern */}
                                            <div className="absolute inset-0 opacity-10">
                                                <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-white rounded-full" />
                                                <div className="absolute -bottom-6 -left-6 w-32 h-32 border-2 border-white rounded-full" />
                                            </div>

                                            {/* Category Icon */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className={`w-14 h-14 rounded-2xl ${categoryInfo.iconBg} backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                                    <CategoryIcon className="w-7 h-7 text-white drop-shadow-md" />
                                                </div>
                                            </div>

                                            {/* Status Badge - top left */}
                                            <div className="absolute top-2.5 left-2.5">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border backdrop-blur-sm bg-white/90 shadow-sm ${statusInfo.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusInfo.label}
                                                </span>
                                            </div>

                                            {/* Distance Badge - top right */}
                                            <span className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-black/30 backdrop-blur-md text-white text-xs rounded-lg font-semibold border border-white/10 shadow-sm">
                                                {formatDistance(place.distance_meters)}
                                            </span>

                                            {/* Deleted badge */}
                                            {!place.is_active && (
                                                <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-1 bg-red-500/90 backdrop-blur-sm text-white rounded-full text-xs font-medium shadow-sm">
                                                    <Trash2 className="w-3 h-3" />
                                                    {t('content.deleted')}
                                                </span>
                                            )}
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-4">
                                            {/* Name + Code Row */}
                                            <div className="mb-3">
                                                <h3 className="font-bold text-slate-900 text-[15px] line-clamp-1 mb-1.5 group-hover:text-[#8a6d1c] transition-colors">
                                                    {place.name}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center px-2 py-0.5 bg-[#f5f3ee] border border-[#d4af37]/20 rounded-md text-xs text-[#8a6d1c] font-mono font-medium">
                                                        {place.code}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${categoryInfo.color}`}>
                                                        <CategoryIcon className="w-3 h-3" />
                                                        {categoryInfo.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Info Section */}
                                            <div className="space-y-2.5 mb-3">
                                                {/* Address */}
                                                <div className="flex items-start gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-[#f5f3ee] flex items-center justify-center flex-shrink-0 border border-[#d4af37]/10">
                                                        <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                                                    </div>
                                                    <span className="text-sm text-slate-600 line-clamp-2 leading-relaxed mt-0.5">{place.address}</span>
                                                </div>

                                                {/* Phone */}
                                                {place.phone && (
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-lg bg-[#f5f3ee] flex items-center justify-center flex-shrink-0 border border-[#d4af37]/10">
                                                            <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                                                        </div>
                                                        <span className="text-sm text-slate-600 font-medium">{place.phone}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Proposer */}
                                            {place.proposer && (
                                                <div className="flex items-center gap-2 text-xs pt-3 border-t border-[#d4af37]/10">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center flex-shrink-0 shadow-sm shadow-[#d4af37]/20">
                                                        <User className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="truncate font-medium text-slate-700">{place.proposer.full_name}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Footer */}
                                        <div className="px-4 pb-4">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedPlace(place); }}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-[#f5f3ee] to-[#ece8dc] text-[#8a6d1c] border border-[#d4af37]/20 rounded-xl hover:from-[#ece8dc] hover:to-[#e3ddd0] hover:border-[#d4af37]/40 hover:shadow-md hover:shadow-[#d4af37]/10 active:scale-[0.98] transition-all duration-200"
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
            <NearbyPlaceDetailModal
                isOpen={selectedPlace !== null}
                place={selectedPlace}
                onClose={() => setSelectedPlace(null)}
                onStatusChange={() => {
                    fetchPlaceList();
                }}
            />
        </div>
    );
};
