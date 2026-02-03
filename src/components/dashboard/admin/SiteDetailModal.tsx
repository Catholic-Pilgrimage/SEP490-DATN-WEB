import React, { useEffect, useState, useCallback } from 'react';
import {
    X,
    MapPin,
    Phone,
    Mail,
    Clock,
    Calendar,
    User,
    Church,
    Building,
    Mountain,
    Home,
    HelpCircle,
    CheckCircle,
    XCircle,
    Loader2,
    ExternalLink,
    BookOpen,
    Users,
    Image,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Filter,
    Play,
    Eye
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import { useLanguage } from '../../../contexts/LanguageContext';
import { SiteDetail, SiteType, SiteRegion, SiteLocalGuide, SiteLocalGuidesResponse, SiteShiftSubmission, SiteShiftsResponse, ShiftSubmissionStatus, SiteMedia, SiteMediaResponse, MediaStatus, MediaType, SiteSchedule, SiteSchedulesResponse, ScheduleStatus, SiteEvent, SiteEventsResponse, EventStatus, SiteNearbyPlace, SiteNearbyPlacesResponse, NearbyPlaceStatus, NearbyPlaceCategory } from '../../../types/admin.types';

interface SiteDetailModalProps {
    siteId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'info' | 'local-guides' | 'shifts' | 'media' | 'schedules' | 'events' | 'nearby-places';

interface TabConfig {
    id: TabType;
    label: string;
    icon: React.ElementType;
    disabled?: boolean;
}

export const SiteDetailModal: React.FC<SiteDetailModalProps> = ({
    siteId,
    isOpen,
    onClose
}) => {
    const [site, setSite] = useState<SiteDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('info');
    const { t } = useLanguage();

    const tabs: TabConfig[] = [
        { id: 'info', label: t('tab.info'), icon: BookOpen },
        { id: 'local-guides', label: t('tab.localGuides'), icon: Users },
        { id: 'shifts', label: t('tab.shifts'), icon: Clock },
        { id: 'media', label: t('tab.media'), icon: Image },
        { id: 'schedules', label: t('tab.schedules'), icon: Calendar },
        { id: 'events', label: t('tab.events'), icon: Sparkles },
        { id: 'nearby-places', label: t('tab.nearbyPlaces'), icon: MapPin },
    ];

    useEffect(() => {
        if (isOpen && siteId) {
            fetchSiteDetail();
            setActiveTab('info');
        } else {
            setSite(null);
            setError(null);
        }
    }, [isOpen, siteId]);

    const fetchSiteDetail = async () => {
        if (!siteId) return;

        try {
            setLoading(true);
            setError(null);
            const response = await AdminService.getSiteById(siteId);

            if (response.success && response.data) {
                setSite(response.data);
            } else {
                setError(response.message || 'Failed to load site details');
            }
        } catch (err: any) {
            setError(err?.error?.message || 'Failed to load site details');
        } finally {
            setLoading(false);
        }
    };

    const getTypeInfo = (type: SiteType) => {
        const types = {
            church: { labelKey: 'type.church', icon: Church, color: 'bg-blue-100 text-blue-700' },
            shrine: { labelKey: 'type.shrine', icon: Mountain, color: 'bg-purple-100 text-purple-700' },
            monastery: { labelKey: 'type.monastery', icon: Building, color: 'bg-amber-100 text-amber-700' },
            center: { labelKey: 'type.center', icon: Home, color: 'bg-green-100 text-green-700' },
            other: { labelKey: 'type.other', icon: HelpCircle, color: 'bg-slate-100 text-slate-700' }
        };
        const info = types[type] || types.other;
        return { ...info, label: t(info.labelKey) };
    };

    const getRegionInfo = (region: SiteRegion) => {
        const regions = {
            Bac: { label: 'Miền Bắc', color: 'bg-red-50 text-red-600', gradient: 'from-red-500 to-rose-600' },
            Trung: { label: 'Miền Trung', color: 'bg-yellow-50 text-yellow-600', gradient: 'from-yellow-500 to-amber-600' },
            Nam: { label: 'Miền Nam', color: 'bg-blue-50 text-blue-600', gradient: 'from-blue-500 to-indigo-600' }
        };
        return regions[region] || regions.Nam;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const openGoogleMaps = () => {
        if (site?.latitude && site?.longitude) {
            window.open(`https://www.google.com/maps?q=${site.latitude},${site.longitude}`, '_blank');
        }
    };

    if (!isOpen) return null;

    const typeInfo = site ? getTypeInfo(site.type) : null;
    const TypeIcon = typeInfo?.icon || Church;
    const regionInfo = site ? getRegionInfo(site.region) : null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 my-8 max-h-[90vh] overflow-hidden flex flex-col border border-[#d4af37]/20 flex-shrink-0">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-[#d4af37]/20 rounded-full shadow-lg transition-all hover:scale-110"
                >
                    <X className="w-5 h-5 text-[#8a6d1c]" />
                </button>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-80">
                        <Loader2 className="w-10 h-10 animate-spin text-[#d4af37] mb-4" />
                        <p className="text-slate-500">{t('modal.loading')}</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-80 p-6">
                        <XCircle className="w-12 h-12 text-red-500 mb-4" />
                        <p className="text-red-600 text-center">{error}</p>
                        <button
                            onClick={fetchSiteDetail}
                            className="mt-4 px-4 py-2 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-lg hover:brightness-110 transition-all"
                        >
                            {t('modal.retry')}
                        </button>
                    </div>
                ) : site ? (
                    <>
                        {/* Header with cover image */}
                        <div className="relative h-40 flex-shrink-0">
                            {site.cover_image ? (
                                <img
                                    src={site.cover_image}
                                    alt={site.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className={`w-full h-full bg-gradient-to-r ${regionInfo?.gradient}`} />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                            {/* Badges on image */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${site.is_active
                                    ? 'bg-green-500/90 text-white'
                                    : 'bg-red-500/90 text-white'
                                    }`}>
                                    {site.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                    {site.is_active ? t('common.active') : t('common.inactive')}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm bg-white/90 ${typeInfo?.color}`}>
                                    <TypeIcon className="w-3 h-3" />
                                    {typeInfo?.label}
                                </span>
                            </div>

                            {/* Site info on image */}
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <p className="text-sm opacity-80 font-mono">{site.code}</p>
                                <h2 className="text-xl font-bold mb-1">{site.name}</h2>
                                {site.patron_saint && (
                                    <p className="text-sm opacity-90">🙏 {site.patron_saint}</p>
                                )}
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="bg-white border-b border-[#d4af37]/20 px-4 flex-shrink-0">
                            <div className="flex items-center gap-1 overflow-x-auto">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;

                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => !tab.disabled && setActiveTab(tab.id)}
                                            disabled={tab.disabled}
                                            className={`
                                                flex items-center gap-1.5 px-3 py-3 font-medium text-xs whitespace-nowrap
                                                border-b-2 transition-colors
                                                ${isActive
                                                    ? 'border-[#d4af37] text-[#8a6d1c]'
                                                    : tab.disabled
                                                        ? 'border-transparent text-slate-300 cursor-not-allowed'
                                                        : 'border-transparent text-slate-500 hover:text-[#8a6d1c] hover:border-[#d4af37]/50'
                                                }
                                            `}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto">
                            {activeTab === 'info' && (
                                <SiteInfoTab
                                    site={site}
                                    regionInfo={regionInfo}
                                    formatDate={formatDate}
                                    openGoogleMaps={openGoogleMaps}
                                />
                            )}
                            {activeTab === 'local-guides' && siteId && (
                                <SiteLocalGuidesTab siteId={siteId} />
                            )}
                            {activeTab === 'shifts' && siteId && (
                                <SiteShiftsTab siteId={siteId} />
                            )}
                            {activeTab === 'media' && siteId && (
                                <SiteMediaTab siteId={siteId} />
                            )}
                            {activeTab === 'schedules' && siteId && (
                                <SiteSchedulesTab siteId={siteId} />
                            )}
                            {activeTab === 'events' && siteId && (
                                <SiteEventsTab siteId={siteId} />
                            )}
                            {activeTab === 'nearby-places' && siteId && (
                                <SiteNearbyPlacesTab siteId={siteId} />
                            )}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};

// ============ INFO TAB ============
interface SiteInfoTabProps {
    site: SiteDetail;
    regionInfo: { label: string; color: string; gradient: string } | null;
    formatDate: (date: string) => string;
    openGoogleMaps: () => void;
}

const SiteInfoTab: React.FC<SiteInfoTabProps> = ({ site, regionInfo, formatDate, openGoogleMaps }) => {
    const { t } = useLanguage();
    return (
        <div className="p-6 space-y-5">
            {/* Location */}
            <div className="flex items-start gap-3 p-4 bg-[#f5f3ee] rounded-xl border border-[#d4af37]/10">
                <div className="p-2 bg-[#d4af37]/20 rounded-lg">
                    <MapPin className="w-5 h-5 text-[#8a6d1c]" />
                </div>
                <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-1">{t('edit.address')}</p>
                    <p className="text-sm font-medium text-slate-900">
                        {site.address && `${site.address}, `}
                        {site.district && `${site.district}, `}
                        {site.province}
                    </p>
                    <span className={`inline-flex items-center mt-2 px-2 py-0.5 rounded text-xs font-medium ${regionInfo?.color}`}>
                        {regionInfo?.label}
                    </span>
                </div>
                {site.latitude && site.longitude && (
                    <button
                        onClick={openGoogleMaps}
                        className="p-2 text-[#8a6d1c] hover:bg-[#d4af37]/20 rounded-lg transition-colors"
                        title="Open in Google Maps"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </button>
                )}
            </div>

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
                {/* Contact Info */}
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

                {/* Opening Hours */}
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

// ============ LOCAL GUIDES TAB ============
interface SiteLocalGuidesTabProps {
    siteId: string;
}

const SiteLocalGuidesTab: React.FC<SiteLocalGuidesTabProps> = ({ siteId }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SiteLocalGuidesResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await AdminService.getSiteLocalGuides(siteId, {
                page: currentPage,
                limit
            });

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Không thể tải danh sách Local Guides');
            }
        } catch (err: any) {
            setError(err?.error?.message || 'Không thể tải danh sách Local Guides');
        } finally {
            setLoading(false);
        }
    }, [siteId, currentPage, limit]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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

    const guides = data?.guides || [];
    const pagination = data?.pagination;
    const totalPages = pagination?.totalPages || 1;

    return (
        <div className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    {pagination?.total || 0} {t('localGuide.workingAtSite')}
                </p>
            </div>

            {/* Content */}
            {guides.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-slate-900 mb-1">
                        {t('localGuide.noGuides')}
                    </h3>
                    <p className="text-sm text-slate-500">
                        {t('localGuide.noGuidesAssigned')}
                    </p>
                </div>
            ) : (
                <>
                    {/* Guides List */}
                    <div className="space-y-3">
                        {guides.map((guide: SiteLocalGuide) => (
                            <div
                                key={guide.id}
                                className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                {/* Avatar */}
                                {guide.avatar_url ? (
                                    <img
                                        src={guide.avatar_url}
                                        alt={guide.full_name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-slate-900">{guide.full_name}</h4>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1 text-sm text-slate-500">
                                            <Mail className="w-3.5 h-3.5" />
                                            <span className="truncate">{guide.email}</span>
                                        </div>
                                        {guide.phone && (
                                            <div className="flex items-center gap-1 text-sm text-slate-500">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>{guide.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Badge */}
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                    {t('role.localGuide')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-sm text-slate-500">
                                {t('pagination.page')} {currentPage} / {totalPages}
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

// ============ SHIFTS TAB ============
interface SiteShiftsTabProps {
    siteId: string;
}

const SiteShiftsTab: React.FC<SiteShiftsTabProps> = ({ siteId }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SiteShiftsResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<ShiftSubmissionStatus | ''>('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await AdminService.getSiteShifts(siteId, {
                page: currentPage,
                limit,
                status: statusFilter || undefined
            });

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Không thể tải danh sách lịch trực');
            }
        } catch (err: any) {
            setError(err?.error?.message || 'Không thể tải danh sách lịch trực');
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

    const getStatusBadge = (status: ShiftSubmissionStatus) => {
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

    const submissions = data?.submissions || [];
    const pagination = data?.pagination;
    const totalPages = pagination?.totalPages || 1;

    return (
        <div className="p-6 space-y-4">
            {/* Header with Filter */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-slate-500">
                    {pagination?.total || 0} {t('shifts.shiftRegistrations')}
                </p>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value as ShiftSubmissionStatus | '');
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
            {submissions.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-slate-900 mb-1">
                        {t('shifts.noShifts')}
                    </h3>
                    <p className="text-sm text-slate-500">
                        Không có đăng ký lịch trực nào
                    </p>
                </div>
            ) : (
                <>
                    {/* Submissions List */}
                    <div className="space-y-3">
                        {submissions.map((submission: SiteShiftSubmission) => {
                            const statusBadge = getStatusBadge(submission.status);

                            return (
                                <div
                                    key={submission.id}
                                    className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">{submission.guide.full_name}</h4>
                                                <p className="text-xs text-slate-500">{submission.guide.email}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                                            {statusBadge.label}
                                        </span>
                                    </div>

                                    {/* Week Info */}
                                    <div className="flex items-center gap-4 mb-3 text-sm text-slate-600">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span>Tuần {new Date(submission.week_start_date).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <span>{submission.total_shifts} ca</span>
                                        </div>
                                    </div>

                                    {/* Shifts */}
                                    <div className="flex flex-wrap gap-2">
                                        {submission.shifts.map((shift) => (
                                            <div
                                                key={shift.id}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                                            >
                                                <span className="font-medium text-blue-600">{getDayName(shift.day_of_week)}</span>
                                                <span className="text-slate-400">|</span>
                                                <span className="text-slate-600">
                                                    {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Rejection reason if rejected */}
                                    {submission.status === 'rejected' && submission.rejection_reason && (
                                        <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                                            <strong>Lý do từ chối:</strong> {submission.rejection_reason}
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

// ============ MEDIA TAB ============
interface SiteMediaTabProps {
    siteId: string;
}

const SiteMediaTab: React.FC<SiteMediaTabProps> = ({ siteId }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SiteMediaResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(12);
    const [statusFilter, setStatusFilter] = useState<MediaStatus | ''>('');
    const [typeFilter, setTypeFilter] = useState<MediaType | ''>('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await AdminService.getSiteMedia(siteId, {
                page: currentPage,
                limit,
                status: statusFilter || undefined,
                type: typeFilter || undefined
            });

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Không thể tải danh sách media');
            }
        } catch (err: any) {
            setError(err?.error?.message || 'Không thể tải danh sách media');
        } finally {
            setLoading(false);
        }
    }, [siteId, currentPage, limit, statusFilter, typeFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStatusBadge = (status: MediaStatus) => {
        const configs = {
            pending: { color: 'bg-yellow-100 text-yellow-700', labelKey: 'status.pending' },
            approved: { color: 'bg-green-100 text-green-700', labelKey: 'status.approved' },
            rejected: { color: 'bg-red-100 text-red-700', labelKey: 'status.rejected' }
        };
        const config = configs[status] || configs.pending;
        return { ...config, label: t(config.labelKey) };
    };

    const getTypeBadge = (type: MediaType) => {
        const configs = {
            image: { color: 'bg-blue-100 text-blue-700', labelKey: 'media.image', icon: Image },
            video: { color: 'bg-purple-100 text-purple-700', labelKey: 'media.video', icon: Play },
            panorama: { color: 'bg-amber-100 text-amber-700', labelKey: 'media.panorama', icon: Eye }
        };
        const config = configs[type] || configs.image;
        return { ...config, label: t(config.labelKey) };
    };

    const isYouTubeUrl = (url: string): boolean => {
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const getYouTubeThumbnail = (url: string): string => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        if (match) {
            return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
        }
        return '';
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

    const mediaList = data?.media || [];
    const pagination = data?.pagination;
    const totalPages = pagination?.totalPages || 1;

    return (
        <div className="p-6 space-y-4">
            {/* Header with Filters */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-slate-500">
                    {pagination?.total || 0} media files
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value as MediaStatus | '');
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
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value as MediaType | '');
                            setCurrentPage(1);
                        }}
                        className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">{t('media.allTypes')}</option>
                        <option value="image">{t('media.image')}</option>
                        <option value="video">{t('media.video')}</option>
                        <option value="panorama">{t('media.panorama')}</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            {mediaList.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Image className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-slate-900 mb-1">
                        Chưa có media
                    </h3>
                    <p className="text-sm text-slate-500">
                        Không có media nào
                    </p>
                </div>
            ) : (
                <>
                    {/* Media Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {mediaList.map((media: SiteMedia) => {
                            const statusBadge = getStatusBadge(media.status);
                            const typeBadge = getTypeBadge(media.type);
                            const TypeIcon = typeBadge.icon;

                            const thumbnailUrl = media.type === 'video' && isYouTubeUrl(media.url)
                                ? getYouTubeThumbnail(media.url)
                                : media.type === 'image' || media.type === 'panorama'
                                    ? media.url
                                    : '';

                            return (
                                <div
                                    key={media.id}
                                    className="relative group rounded-xl overflow-hidden bg-slate-100 aspect-video cursor-pointer"
                                    onClick={() => setPreviewUrl(media.url)}
                                >
                                    {/* Thumbnail */}
                                    {thumbnailUrl ? (
                                        <img
                                            src={thumbnailUrl}
                                            alt={media.caption || 'Media'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                            <TypeIcon className="w-8 h-8 text-slate-400" />
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {/* Type Badge */}
                                    <div className="absolute top-2 left-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${typeBadge.color}`}>
                                            <TypeIcon className="w-3 h-3" />
                                            {typeBadge.label}
                                        </span>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge.color}`}>
                                            {statusBadge.label}
                                        </span>
                                    </div>

                                    {/* Video Play Button */}
                                    {media.type === 'video' && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                                <Play className="w-5 h-5 text-slate-700 ml-1" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Caption on hover */}
                                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {media.caption && (
                                            <p className="text-xs text-white truncate">{media.caption}</p>
                                        )}
                                        <p className="text-xs text-white/70">{media.creator.full_name}</p>
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

            {/* Preview Modal */}
            {previewUrl && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={() => setPreviewUrl(null)}
                >
                    <button
                        onClick={() => setPreviewUrl(null)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>

                    {isYouTubeUrl(previewUrl) ? (
                        <iframe
                            src={previewUrl.replace('watch?v=', 'embed/')}
                            className="w-full max-w-4xl aspect-video rounded-lg"
                            allowFullScreen
                        />
                    ) : (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

// ============ SCHEDULES TAB ============
interface SiteSchedulesTabProps {
    siteId: string;
}

const SiteSchedulesTab: React.FC<SiteSchedulesTabProps> = ({ siteId }) => {
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
            )
            }
        </div >
    );
};

// ============ EVENTS TAB ============
interface SiteEventsTabProps {
    siteId: string;
}

const SiteEventsTab: React.FC<SiteEventsTabProps> = ({ siteId }) => {
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
        } catch (err: any) {
            setError(err?.error?.message || 'Không thể tải danh sách sự kiện');
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
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value as EventStatus | '');
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

// ============ NEARBY PLACES TAB ============
interface SiteNearbyPlacesTabProps {
    siteId: string;
}

const SiteNearbyPlacesTab: React.FC<SiteNearbyPlacesTabProps> = ({ siteId }) => {
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
        } catch (err: any) {
            setError(err?.error?.message || 'Không thể tải danh sách địa điểm lân cận');
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
                                        <span>Đề xuất bởi: {place.proposer.full_name}</span>
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

