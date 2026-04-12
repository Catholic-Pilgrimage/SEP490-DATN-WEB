import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Clock, Calendar, User, BookOpen, Navigation, ExternalLink, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { AdminService } from '../../../../services/admin.service';
import { SiteDetail, SiteNearbyPlace } from '../../../../types/admin.types';
import { extractErrorMessage } from '../../../../lib/utils';
import VietMapView from '../../../../components/shared/VietMapView';

interface SiteInfoTabProps {
    site: SiteDetail;
    regionInfo: { label: string; color: string; gradient: string } | null;
    formatDate: (date: string) => string;
}

export const SiteInfoTab: React.FC<SiteInfoTabProps> = ({ site, regionInfo, formatDate }) => {
    const { t } = useLanguage();
    const [nearbyLoading, setNearbyLoading] = useState(false);
    const [nearbyPlaces, setNearbyPlaces] = useState<SiteNearbyPlace[]>([]);
    const [nearbyError, setNearbyError] = useState<string | null>(null);

    const fullAddress = [
        site.address,
        site.district,
        site.province,
    ].filter(Boolean).join(', ');

    const handleOpenExternalMap = () => {
        if (site.latitude && site.longitude) {
            const url = `https://www.google.com/maps?q=${site.latitude},${site.longitude}`;
            window.open(url, '_blank');
        }
    };

    const handleCopyAddress = async () => {
        if (!fullAddress) return;
        try {
            await navigator.clipboard.writeText(fullAddress);
        } catch {
            // ignore clipboard errors silently
        }
    };

    useEffect(() => {
        let cancelled = false;
        const fetchNearby = async () => {
            try {
                setNearbyLoading(true);
                setNearbyError(null);
                const response = await AdminService.getSiteNearbyPlaces(site.id, {
                    page: 1,
                    limit: 3,
                    status: 'approved',
                });
                if (!cancelled && response.success && response.data) {
                    setNearbyPlaces(response.data.nearby_places);
                }
            } catch (error) {
                if (!cancelled) {
                    const message = extractErrorMessage(error, 'Không thể tải địa điểm lân cận');
                    setNearbyError(message);
                }
            } finally {
                if (!cancelled) {
                    setNearbyLoading(false);
                }
            }
        };

        fetchNearby();

        return () => {
            cancelled = true;
        };
    }, [site.id]);

    const markerColor = site.is_active ? '#16a34a' : '#9ca3af';
    const markerIcon = site.is_active ? '⛪' : '⛔';

    // Icon theo category cho nearby places
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'food': return '🍽️';
            case 'lodging': return '🏨';
            case 'medical': return '🏥';
            default: return '📍';
        }
    };

    // Icon color theo category
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'food': return '#f97316';
            case 'lodging': return '#8b5cf6';
            case 'medical': return '#ef4444';
            default: return '#6b7280';
        }
    };

    // Tạo markers bao gồm cả site chính và nearby places
    const allMarkers = [
        {
            id: site.id,
            lat: Number(site.latitude),
            lng: Number(site.longitude),
            title: site.name,
            address: fullAddress,
            color: markerColor,
            icon: markerIcon,
            isActive: site.is_active,
        },
        ...nearbyPlaces.map((place) => ({
            id: place.id,
            lat: Number(place.latitude),
            lng: Number(place.longitude),
            title: place.name,
            address: place.address || '',
            color: getCategoryColor(place.category),
            icon: getCategoryIcon(place.category),
            isActive: place.is_active,
        })),
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Location */}
            <div className="flex items-start gap-3 p-4 bg-[#f5f3ee] rounded-2xl border border-[#d4af37]/20 shadow-sm">
                <div className="p-2.5 bg-white rounded-xl border border-[#d4af37]/20 shadow-[0_4px_10px_rgba(0,0,0,0.04)]">
                    <MapPin className="w-5 h-5 text-[#8a6d1c]" />
                </div>
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">
                                {t('edit.address')}
                            </p>
                            <p className="text-sm font-medium text-slate-900">
                                {fullAddress}
                            </p>
                        </div>
                        {regionInfo && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${regionInfo.color}`}>
                                {regionInfo.label}
                            </span>
                        )}
                    </div>

                    {site.latitude && site.longitude && (
                        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                            <span className="px-2 py-0.5 rounded-full bg-white/80 border border-[#d4af37]/20 font-mono">
                                {Number(site.latitude).toFixed(5)}, {Number(site.longitude).toFixed(5)}
                            </span>
                            <div className="ml-auto flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleOpenExternalMap}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#d4af37]/40 bg-white text-[11px] font-medium text-[#8a6d1c] hover:bg-[#f5f3ee] transition-colors"
                                >
                                    <Navigation className="w-3.5 h-3.5" />
                                    <span>Chỉ đường</span>
                                    <ExternalLink className="w-3 h-3" />
                                </button>
                                {fullAddress && (
                                    <button
                                        type="button"
                                        onClick={handleCopyAddress}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-600 hover:bg-white transition-colors"
                                    >
                                        <span>Sao chép địa chỉ</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Map View Card */}
            {site.latitude && site.longitude && (
                <div className="bg-white rounded-2xl border border-[#d4af37]/20 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#faf5e6] via-[#f5f3ee] to-white">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                                Bản đồ vị trí
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Xem vị trí nhà thờ trên bản đồ Vietmap và các địa điểm lân cận quan trọng.
                            </p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${site.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-300'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {site.is_active ? 'Đang hoạt động' : 'Tạm ẩn'}
                        </span>
                    </div>

                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] gap-4">
                            <div className="relative">
                                <VietMapView
                                    latitude={Number(site.latitude)}
                                    longitude={Number(site.longitude)}
                                    zoom={15}
                                    markers={allMarkers}
                                    className="w-full h-[360px] rounded-xl overflow-hidden border border-[#d4af37]/20 shadow-sm"
                                />

                                {/* Overlay nhỏ trên bản đồ */}
                                <div className="pointer-events-none absolute left-4 top-4">
                                    <div className="inline-flex flex-col gap-1 px-3 py-2 rounded-xl bg-white/85 backdrop-blur shadow-md border border-[#d4af37]/30 max-w-[260px]">
                                        <span className="text-[11px] uppercase tracking-wide text-slate-400">
                                            Địa điểm chính
                                        </span>
                                        <span className="text-sm font-semibold text-slate-900 truncate">
                                            {site.name}
                                        </span>
                                        <span className="text-[11px] text-slate-500 line-clamp-2">
                                            {fullAddress}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Nearby places small list */}
                            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 flex flex-col gap-2">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center border border-slate-200">
                                            <MapPin className="w-4 h-4 text-teal-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-800">
                                                Địa điểm lân cận
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                {nearbyPlaces.length > 0
                                                    ? `${nearbyPlaces.length} địa điểm gần nhất quanh site`
                                                    : 'Chưa có địa điểm lân cận'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 min-h-[120px]">
                                    {nearbyLoading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
                                        </div>
                                    ) : nearbyError ? (
                                        <p className="text-[11px] text-red-600">
                                            {nearbyError}
                                        </p>
                                    ) : nearbyPlaces.length === 0 ? (
                                        <p className="text-[11px] text-slate-500">
                                            Chưa có địa điểm lân cận nào được duyệt.
                                        </p>
                                    ) : (
                                        <ul className="space-y-2 text-xs">
                                            {nearbyPlaces.map((place) => (
                                                <li
                                                    key={place.id}
                                                    className="rounded-lg bg-white px-2.5 py-2 border border-slate-200 flex flex-col gap-1"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-[12px] font-semibold text-slate-900 truncate">
                                                            {place.name}
                                                        </p>
                                                        <span className="text-[11px] text-teal-600 font-medium">
                                                            {place.distance_meters}m
                                                        </span>
                                                    </div>
                                                    {place.address && (
                                                        <p className="text-[11px] text-slate-500 truncate">
                                                            {place.address}
                                                        </p>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <p className="mt-1 text-[11px] text-slate-400">
                                    Xem đầy đủ danh sách và chi tiết trong tab "Địa điểm lân cận".
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Description */}
            {site.description && (
                <div className="p-4 bg-[#f5f3ee] rounded-xl border border-[#d4af37]/10">
                    <p className="text-xs text-slate-500 mb-2">{t('detail.description')}</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{site.description}</p>
                </div>
            )}

            {/* History */}
            {site.history && (
                <div className="p-4 bg-[#d4af37]/10 rounded-xl border border-[#d4af37]/20">
                    <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-[#8a6d1c]" />
                        <p className="text-xs text-[#8a6d1c] font-medium">{t('detail.history')}</p>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{site.history}</p>
                </div>
            )}

            {/* Contact & Opening Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {site.contact_info && (site.contact_info.phone || site.contact_info.email) && (
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-3">{t('detail.contact')}</p>
                        {site.contact_info.phone && (
                            <div className="flex items-center gap-2 mb-2">
                                <Phone className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-slate-700">{site.contact_info.phone}</span>
                            </div>
                        )}
                        {site.contact_info.email && (
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-slate-700">{site.contact_info.email}</span>
                            </div>
                        )}
                    </div>
                )}

                {site.opening_hours && Object.keys(site.opening_hours).length > 0 && (
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <p className="text-xs text-slate-500">{t('detail.openingHours')}</p>
                        </div>
                        <div className="space-y-1 text-sm">
                            {Object.entries(site.opening_hours).map(([day, hours]) => (
                                <div key={day} className="flex justify-between">
                                    <span className="text-slate-500 capitalize">{t(`day.${day}`)}</span>
                                    <span className="text-slate-700 font-medium">{hours}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Created By & Dates */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                {site.created_by && (
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                            <p className="text-xs text-slate-500">{t('detail.createdBy')}</p>
                            <p className="text-sm font-medium text-slate-700">{site.created_by.full_name}</p>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                        <p className="text-xs text-slate-500">{t('detail.createdAt')}</p>
                        <p className="text-sm font-medium text-slate-700">{formatDate(site.created_at)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
