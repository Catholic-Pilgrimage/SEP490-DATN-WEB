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
import { useToast } from '../../../contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

/**
 * NearbyPlaceContent Component
 * 
 * Hiển thị danh sách địa điểm lân cận của site với card layout
 * Filter theo: status, category, is_active
 */
export const NearbyPlaceContent: React.FC = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();
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
    const [refreshing, setRefreshing] = useState(false);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, limit, statusFilter, categoryFilter, activeFilter]);

    useEffect(() => {
        fetchPlaceList();
    }, [fetchPlaceList]);

    const handleManualRefresh = async () => {
        setRefreshing(true);
        await fetchPlaceList();
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
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] shadow-lg shadow-[#d4af37]/25 ring-4 ring-[#d4af37]/10">
                        <MapPin className="h-7 w-7 text-white" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{t('nearby.title')}</h1>
                        <p className="mt-1 max-w-xl text-sm text-slate-600 sm:text-base">{t('nearby.subtitle')}</p>
                    </div>
                </div>
                <Button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={loading || refreshing}
                    className="h-11 shrink-0 gap-2 rounded-xl bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] px-6 text-white shadow-md shadow-[#d4af37]/25 hover:brightness-110 disabled:opacity-70"
                >
                    <RefreshCw className={`h-5 w-5 ${loading || refreshing ? 'animate-spin' : ''}`} />
                    {t('common.refresh')}
                </Button>
            </div>

            {/* Filters */}
            <Card className="rounded-2xl border-[#d4af37]/20 shadow-sm mb-6">
                <CardContent className="flex flex-wrap items-center gap-3 p-4 sm:gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 shrink-0 text-[#8a6d1c]/50" />
                        <Select
                            value={statusFilter === '' ? 'all' : statusFilter}
                            onValueChange={(v) => {
                                setStatusFilter(v === 'all' ? '' : (v as ContentStatus));
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="h-9 w-[min(100vw-4rem,240px)] rounded-xl border-[#d4af37]/30 bg-[#f5f3ee] text-slate-700 focus:ring-[#d4af37] sm:w-[240px]">
                                <SelectValue placeholder={t('content.allStatus')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('content.allStatus')}</SelectItem>
                                <SelectItem value="pending">{t('status.pending')}</SelectItem>
                                <SelectItem value="approved">{t('status.approved')}</SelectItem>
                                <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Select
                        value={categoryFilter === '' ? 'all' : categoryFilter}
                        onValueChange={(v) => {
                            setCategoryFilter(v === 'all' ? '' : (v as NearbyPlaceCategory));
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="h-9 w-[min(100vw-4rem,240px)] rounded-xl border-[#d4af37]/30 bg-[#f5f3ee] text-slate-700 focus:ring-[#d4af37] sm:w-[240px]">
                            <SelectValue placeholder={t('nearby.allCategories')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('nearby.allCategories')}</SelectItem>
                            <SelectItem value="food">{t('category.food')}</SelectItem>
                            <SelectItem value="lodging">{t('category.lodging')}</SelectItem>
                            <SelectItem value="medical">{t('category.medical')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={activeFilter === undefined ? 'all' : activeFilter ? 'true' : 'false'}
                        onValueChange={(v) => {
                            setActiveFilter(v === 'all' ? undefined : v === 'true');
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="h-9 w-[min(100vw-4rem,240px)] rounded-xl border-[#d4af37]/30 bg-[#f5f3ee] text-slate-700 focus:ring-[#d4af37] sm:w-[240px]">
                            <SelectValue placeholder={t('content.allActive')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('content.allActive')}</SelectItem>
                            <SelectItem value="true">{t('content.activeTrue')}</SelectItem>
                            <SelectItem value="false">{t('content.activeFalse')}</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

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
                                                <Badge className={`px-2 py-1 text-xs font-medium border backdrop-blur-sm bg-white/90 shadow-sm hover:bg-white/90 ${statusInfo.color}`}>
                                                    <StatusIcon className="w-3.5 h-3.5 mr-1" />
                                                    {statusInfo.label}
                                                </Badge>
                                            </div>

                                            {/* Distance Badge - top right */}
                                            <Badge variant="outline" className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-black/30 backdrop-blur-md text-white text-xs font-semibold border-white/10 shadow-sm hover:bg-black/40">
                                                {formatDistance(place.distance_meters)}
                                            </Badge>

                                            {/* Deleted badge */}
                                            {!place.is_active && (
                                                <Badge variant="destructive" className="absolute bottom-2.5 left-2.5 px-2 py-1 bg-red-500/90 backdrop-blur-sm text-white text-xs font-medium shadow-sm hover:bg-red-500/90">
                                                    <Trash2 className="w-3 h-3 mr-1" />
                                                    {t('content.deleted')}
                                                </Badge>
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
                                                    <Badge variant="outline" className="bg-[#f5f3ee] border-[#d4af37]/20 text-[#8a6d1c] font-mono hover:bg-[#ece8dc] px-2 py-0.5">
                                                        {place.code}
                                                    </Badge>
                                                    <Badge className={`px-2 py-0.5 border-0 hover:bg-opacity-80 shadow-none ${categoryInfo.color}`}>
                                                        <CategoryIcon className="w-3 h-3 mr-1" />
                                                        {categoryInfo.label}
                                                    </Badge>
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
                                            <Button
                                                variant="outline"
                                                onClick={(e) => { e.stopPropagation(); setSelectedPlace(place); }}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-5 text-sm font-semibold bg-gradient-to-r from-[#f5f3ee] to-[#ece8dc] text-[#8a6d1c] border-[#d4af37]/20 rounded-xl hover:from-[#ece8dc] hover:to-[#e3ddd0] hover:border-[#d4af37]/40 hover:shadow-md hover:shadow-[#d4af37]/10 active:scale-[0.98] transition-all duration-200"
                                            >
                                                <Eye className="w-4 h-4" />
                                                {t('content.detail')}
                                            </Button>
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
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="border-[#d4af37]/20 hover:bg-[#f5f3ee] text-slate-600 rounded-lg"
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
                                    className="border-[#d4af37]/20 hover:bg-[#f5f3ee] text-slate-600 rounded-lg"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
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
