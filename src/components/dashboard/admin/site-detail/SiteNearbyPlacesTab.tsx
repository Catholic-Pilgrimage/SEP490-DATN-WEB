import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, MapPin, User, ChevronLeft, ChevronRight, AlertCircle, Filter } from 'lucide-react';
import { AdminService } from '../../../../services/admin.service';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { SiteNearbyPlace, SiteNearbyPlacesResponse, NearbyPlaceStatus, NearbyPlaceCategory } from '../../../../types/admin.types';

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
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value as NearbyPlaceStatus | '');
                            setCurrentPage(1);
                        }}
                        className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">{t('status.allStatus')}</option>
                        <option value="pending">{t('status.pending')}</option>
                        <option value="approved">{t('status.approved')}</option>
                        <option value="rejected">{t('status.rejected')}</option>
                    </select>
                    <select
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value as NearbyPlaceCategory | '');
                            setCurrentPage(1);
                        }}
                        className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">{t('nearbyPlaces.allCategories')}</option>
                        <option value="food">{t('nearbyPlaces.food')}</option>
                        <option value="lodging">{t('nearbyPlaces.lodging')}</option>
                        <option value="medical">{t('nearbyPlaces.medical')}</option>
                    </select>
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
