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
    const { t, language } = useLanguage();
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
            pending: { label: t('status.pending'), color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
            approved: { label: t('status.approved'), color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
            rejected: { label: t('status.rejected'), color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
        };
        return statuses[status] || statuses.pending;
    };

    const getCategoryInfo = (category: NearbyPlaceCategory) => {
        const categories = {
            food: { label: t('category.food'), icon: Utensils, color: 'bg-orange-100 text-orange-700' },
            lodging: { label: t('category.lodging'), icon: Hotel, color: 'bg-blue-100 text-blue-700' },
            medical: { label: t('category.medical'), icon: Heart, color: 'bg-red-100 text-red-700' }
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
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('nearby.title')}</h1>
                    <p className="text-slate-500 mt-1">{t('nearby.subtitle')}</p>
                </div>
                <button
                    onClick={fetchPlaceList}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {t('common.refresh')}
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
                            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">{t('content.allActive')}</option>
                            <option value="true">Đang hoạt động</option>
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
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <>
                    {/* Content */}
                    {placeList.length === 0 ? (
                        /* Empty State */
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <MapPin className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                {t('nearby.empty')}
                            </h3>
                            <p className="text-slate-500">
                                {t('nearby.emptyDesc')}
                            </p>
                        </div>
                    ) : (
                        /* Card Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {placeList.map((place) => {
                                const statusInfo = getStatusInfo(place.status);
                                const StatusIcon = statusInfo.icon;
                                const categoryInfo = getCategoryInfo(place.category);
                                const CategoryIcon = categoryInfo.icon;

                                return (
                                    <div
                                        key={place.id}
                                        className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all ${!place.is_active ? 'opacity-60' : ''}`}
                                    >
                                        {/* Header */}
                                        <div className="p-4 border-b border-slate-100">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                {/* Category Badge */}
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${categoryInfo.color}`}>
                                                    <CategoryIcon className="w-3 h-3" />
                                                    {categoryInfo.label}
                                                </span>
                                                {/* Status Badge */}
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusInfo.label}
                                                </span>
                                            </div>

                                            {/* Name */}
                                            <h3 className="font-semibold text-slate-900 line-clamp-1 mb-1">
                                                {place.name}
                                            </h3>

                                            {/* Code */}
                                            <span className="text-xs text-slate-400 font-mono">{place.code}</span>

                                            {/* Deleted badge */}
                                            {!place.is_active && (
                                                <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-medium">
                                                    <Trash2 className="w-3 h-3" />
                                                    {t('content.deleted')}
                                                </span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 space-y-2">
                                            {/* Address */}
                                            <div className="flex items-start gap-2 text-sm text-slate-600">
                                                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                                <span className="line-clamp-2">{place.address}</span>
                                            </div>

                                            {/* Distance */}
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg font-medium text-xs">
                                                    {formatDistance(place.distance_meters)}
                                                </span>
                                            </div>

                                            {/* Phone */}
                                            {place.phone && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                    <span>{place.phone}</span>
                                                </div>
                                            )}

                                            {/* Proposer */}
                                            {place.proposer && (
                                                <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                                                    <User className="w-3.5 h-3.5" />
                                                    <span className="truncate">{place.proposer.full_name}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <div className="px-4 pb-4">
                                            <button
                                                onClick={() => setSelectedPlace(place)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
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
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                {t('media.showing')} {(currentPage - 1) * limit + 1} {t('media.to')} {Math.min(currentPage * limit, totalItems)} {t('media.of')} {totalItems} {language === 'vi' ? 'địa điểm' : 'places'}
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
