import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, MapPin, User, AlertCircle, Filter } from 'lucide-react';
import { AdminService } from '../../../../services/admin.service';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { SiteNearbyPlace, SiteNearbyPlacesResponse, NearbyPlaceStatus, NearbyPlaceCategory } from '../../../../types/admin.types';
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

interface SiteNearbyPlacesTabProps {
    siteId: string;
}

export const SiteNearbyPlacesTab: React.FC<SiteNearbyPlacesTabProps> = ({ siteId }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SiteNearbyPlacesResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<NearbyPlaceStatus | ''>('');
    const [categoryFilter, setCategoryFilter] = useState<NearbyPlaceCategory | ''>('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await AdminService.getSiteNearbyPlaces(siteId, {
                page: currentPage,
                limit,
                status: statusFilter || undefined,
                category: categoryFilter || undefined
            });

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Không thể tải danh sách địa điểm lân cận');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể tải danh sách địa điểm lân cận';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [siteId, currentPage, limit, statusFilter, categoryFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStatusBadge = (status: NearbyPlaceStatus) => {
        const configs = {
            pending: { color: 'bg-yellow-100 text-yellow-700', labelKey: 'status.pending' },
            approved: { color: 'bg-green-100 text-green-700', labelKey: 'status.approved' },
            rejected: { color: 'bg-red-100 text-red-700', labelKey: 'status.rejected' }
        };
        const config = configs[status] || configs.pending;
        return { ...config, label: t(config.labelKey) };
    };

    const getCategoryInfo = (category: NearbyPlaceCategory) => {
        const configs = {
            food: { color: 'bg-orange-100 text-orange-700', labelKey: 'nearbyPlaces.food', icon: '🍴' },
            lodging: { color: 'bg-blue-100 text-blue-700', labelKey: 'nearbyPlaces.lodging', icon: '🏨' },
            medical: { color: 'bg-red-100 text-red-700', labelKey: 'nearbyPlaces.medical', icon: '🏥' }
        };
        const config = configs[category] || configs.food;
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

    const places = data?.nearby_places || [];
    const pagination = data?.pagination;
    const totalPages = pagination?.totalPages || 1;

    return (
        <div className="p-6 space-y-4">
            {/* Header with Filters */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-slate-500">
                    {pagination?.total || 0} {t('nearbyPlaces.items')}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <Select
                        value={statusFilter || 'all'}
                        onValueChange={(value) => {
                            setStatusFilter(value === 'all' ? '' : (value as NearbyPlaceStatus));
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

                    <Select
                        value={categoryFilter || 'all'}
                        onValueChange={(value) => {
                            setCategoryFilter(value === 'all' ? '' : (value as NearbyPlaceCategory));
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="h-9 w-[190px] bg-white border border-slate-200 rounded-lg text-sm">
                            <SelectValue placeholder={t('nearbyPlaces.allCategories')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('nearbyPlaces.allCategories')}</SelectItem>
                            <SelectItem value="food">{t('nearbyPlaces.food')}</SelectItem>
                            <SelectItem value="lodging">{t('nearbyPlaces.lodging')}</SelectItem>
                            <SelectItem value="medical">{t('nearbyPlaces.medical')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Content */}
            {places.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MapPin className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="font-medium text-slate-900 mb-1">
                        {t('nearbyPlaces.noPlaces')}
                    </h3>
                    <p className="text-sm text-slate-500">
                        {t('nearbyPlaces.noPlacesDesc')}
                    </p>
                </div>
            ) : (
                <>
                    {/* Places List */}
                    <div className="space-y-3">
                        {places.map((place: SiteNearbyPlace) => {
                            const statusBadge = getStatusBadge(place.status);
                            const categoryInfo = getCategoryInfo(place.category);

                            return (
                                <div
                                    key={place.id}
                                    className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-xl">
                                                {categoryInfo.icon}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${categoryInfo.color}`}>
                                                        {categoryInfo.label}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-mono">{place.code}</span>
                                                </div>
                                                <h4 className="font-semibold text-slate-900">{place.name}</h4>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                                            {statusBadge.label}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    {place.description && (
                                        <p className="text-sm text-slate-600 mb-3">{place.description}</p>
                                    )}

                                    {/* Details */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                        {place.address && (
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="truncate">{place.address}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <span className="text-slate-400">K/c:</span>
                                            <span className="font-medium">{place.distance_meters}m</span>
                                        </div>
                                        {place.phone && (
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <span className="text-slate-400">SĐT:</span>
                                                <span>{place.phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Proposer */}
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
                                        <User className="w-3.5 h-3.5" />
                                        <span>Đề xuất bởi: {place.proposer?.full_name || 'N/A'}</span>
                                    </div>

                                    {/* Rejection reason */}
                                    {place.status === 'rejected' && place.rejection_reason && (
                                        <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                                            <strong>Lý do từ chối:</strong> {place.rejection_reason}
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
