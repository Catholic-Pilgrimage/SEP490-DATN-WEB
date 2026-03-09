import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    Church,
    Building,
    Mountain,
    Home,
    HelpCircle,
    CheckCircle,
    XCircle,
    Loader2,
    BookOpen,
    Users,
    Image,
    Clock,
    Calendar,
    Sparkles,
} from 'lucide-react';
import { AdminService } from '../../../../services/admin.service';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { SiteDetail, SiteType, SiteRegion } from '../../../../types/admin.types';

const SiteInfoTab = lazy(() => import('./SiteInfoTab').then(m => ({ default: m.SiteInfoTab })));
const SiteLocalGuidesTab = lazy(() => import('./SiteLocalGuidesTab').then(m => ({ default: m.SiteLocalGuidesTab })));
const SiteShiftsTab = lazy(() => import('./SiteShiftsTab').then(m => ({ default: m.SiteShiftsTab })));
const SiteMediaTab = lazy(() => import('./SiteMediaTab').then(m => ({ default: m.SiteMediaTab })));
const SiteSchedulesTab = lazy(() => import('./SiteSchedulesTab').then(m => ({ default: m.SiteSchedulesTab })));
const SiteEventsTab = lazy(() => import('./SiteEventsTab').then(m => ({ default: m.SiteEventsTab })));
const SiteNearbyPlacesTab = lazy(() => import('./SiteNearbyPlacesTab').then(m => ({ default: m.SiteNearbyPlacesTab })));

type TabType = 'info' | 'local-guides' | 'shifts' | 'media' | 'schedules' | 'events' | 'nearby-places';

interface TabConfig {
    id: TabType;
    label: string;
    icon: React.ElementType;
}

const TabLoader = () => (
    <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
    </div>
);

export const SiteDetailPage: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [site, setSite] = useState<SiteDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('info');

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
        if (siteId) fetchSiteDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteId]);

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
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load site details';
            setError(message);
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-[#d4af37] mb-4" />
                <p className="text-slate-500">{t('modal.loading')}</p>
            </div>
        );
    }

    if (error || !site) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] p-6">
                <XCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-600 text-center mb-4">{error || 'Site not found'}</p>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/dashboard/sites')}
                        className="px-4 py-2 border border-[#d4af37]/30 text-[#8a6d1c] rounded-lg hover:bg-[#d4af37]/10 transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            {t('common.back')}
                        </span>
                    </button>
                    <button
                        onClick={fetchSiteDetail}
                        className="px-4 py-2 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-lg hover:brightness-110 transition-all"
                    >
                        {t('modal.retry')}
                    </button>
                </div>
            </div>
        );
    }

    const typeInfo = getTypeInfo(site.type);
    const TypeIcon = typeInfo.icon;
    const regionInfo = getRegionInfo(site.region);

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'info':
                return <SiteInfoTab site={site} regionInfo={regionInfo} formatDate={formatDate} />;
            case 'local-guides':
                return siteId ? <SiteLocalGuidesTab siteId={siteId} /> : null;
            case 'shifts':
                return siteId ? <SiteShiftsTab siteId={siteId} /> : null;
            case 'media':
                return siteId ? <SiteMediaTab siteId={siteId} /> : null;
            case 'schedules':
                return siteId ? <SiteSchedulesTab siteId={siteId} /> : null;
            case 'events':
                return siteId ? <SiteEventsTab siteId={siteId} /> : null;
            case 'nearby-places':
                return siteId ? <SiteNearbyPlacesTab siteId={siteId} /> : null;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb & Back */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/dashboard/sites')}
                    className="p-2 rounded-lg border border-[#d4af37]/30 text-[#8a6d1c] hover:bg-[#d4af37]/10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <nav className="flex items-center gap-2 text-sm">
                    <button onClick={() => navigate('/dashboard/sites')} className="text-[#8a6d1c] hover:underline">
                        {t('sites.title')}
                    </button>
                    <span className="text-slate-400">/</span>
                    <span className="text-slate-600 font-medium truncate max-w-[300px]">{site.name}</span>
                </nav>
            </div>

            {/* Header Card with Cover */}
            <div className="bg-white rounded-2xl border border-[#d4af37]/20 overflow-hidden shadow-sm">
                <div className="relative h-48 md:h-56">
                    {site.cover_image ? (
                        <img src={site.cover_image} alt={site.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-r ${regionInfo.gradient}`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${site.is_active ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                            {site.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {site.is_active ? t('common.active') : t('common.inactive')}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm bg-white/90 ${typeInfo.color}`}>
                            <TypeIcon className="w-3.5 h-3.5" />
                            {typeInfo.label}
                        </span>
                    </div>

                    <div className="absolute bottom-4 left-6 right-6 text-white">
                        <p className="text-sm opacity-80 font-mono">{site.code}</p>
                        <h1 className="text-2xl md:text-3xl font-bold mb-1">{site.name}</h1>
                        {site.patron_saint && (
                            <p className="text-sm opacity-90">🙏 {site.patron_saint}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Content: Sidebar Tabs (desktop) + Horizontal Tabs (mobile) */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Tabs - Desktop */}
                <div className="hidden lg:block w-56 flex-shrink-0">
                    <div className="bg-white rounded-2xl border border-[#d4af37]/20 p-3 sticky top-6">
                        <nav className="space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                            ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white shadow-md shadow-[#d4af37]/20'
                                            : 'text-slate-600 hover:bg-[#f5f3ee] hover:text-[#8a6d1c]'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Horizontal Tabs - Mobile */}
                <div className="lg:hidden bg-white rounded-2xl border border-[#d4af37]/20 overflow-hidden">
                    <div className="flex items-center gap-1 overflow-x-auto px-3 border-b border-[#d4af37]/10">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1.5 px-3 py-3 font-medium text-xs whitespace-nowrap border-b-2 transition-colors ${isActive
                                        ? 'border-[#d4af37] text-[#8a6d1c]'
                                        : 'border-transparent text-slate-500 hover:text-[#8a6d1c] hover:border-[#d4af37]/50'
                                        }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                    <Suspense fallback={<TabLoader />}>
                        {renderActiveTab()}
                    </Suspense>
                </div>

                {/* Tab Content - Desktop */}
                <div className="hidden lg:block flex-1 min-w-0">
                    <div className="bg-white rounded-2xl border border-[#d4af37]/20 overflow-hidden min-h-[400px]">
                        <Suspense fallback={<TabLoader />}>
                            {renderActiveTab()}
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
};
