import React, { useEffect, useState } from 'react';
import {
    Loader2,
    MapPin,
    Clock,
    Phone,
    Mail,
    Church,
    Building,
    Mountain,
    Home,
    HelpCircle,
    Plus,
    Edit,
    CheckCircle,
    XCircle,
    RefreshCw
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { ManagerSite } from '../../../types/manager.types';
import { SiteType, SiteRegion } from '../../../types/admin.types';
import { SiteFormModal } from './SiteFormModal';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';

export const MySite: React.FC = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [site, setSite] = useState<ManagerSite | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSite, setHasSite] = useState<boolean | null>(null);

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    useEffect(() => {
        fetchMySite();
    }, []);

    const fetchMySite = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);
            const response = await ManagerService.getMySite();

            if (response.success && response.data) {
                setSite(response.data);
                setHasSite(true);
            } else {
                setSite(null);
                setHasSite(false);
            }
        } catch (err: any) {
            if (err?.error?.statusCode === 404 || err?.status === 404) {
                setSite(null);
                setHasSite(false);
            } else {
                setError(err?.error?.message || 'Failed to load site');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleOpenCreateModal = () => {
        setFormMode('create');
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = () => {
        setFormMode('edit');
        setIsFormModalOpen(true);
    };

    const handleFormSuccess = () => {
        fetchMySite(true); // Refresh data after create/edit
    };

    const handleManualRefresh = async () => {
        await fetchMySite(true);
        showToast('success', t('toast.refreshSuccess'), t('toast.refreshSuccessMsg'));
    };

    const getTypeInfo = (type: SiteType) => {
        const types = {
            church: { label: t('siteType.church'), icon: Church, color: 'text-[#8a6d1c] bg-[#d4af37]/20' },
            shrine: { label: t('siteType.shrine'), icon: Mountain, color: 'text-[#8a6d1c] bg-[#d4af37]/20' },
            monastery: { label: t('siteType.monastery'), icon: Building, color: 'text-[#8a6d1c] bg-[#d4af37]/20' },
            center: { label: t('siteType.center'), icon: Home, color: 'text-[#8a6d1c] bg-[#d4af37]/20' },
            other: { label: t('siteType.other'), icon: HelpCircle, color: 'text-gray-600 bg-gray-100' }
        };
        return types[type] || types.other;
    };

    const getRegionLabel = (region: SiteRegion) => {
        const labels = { Bac: t('region.bac'), Trung: t('region.trung'), Nam: t('region.nam') };
        return labels[region] || region;
    };

    const getDayLabel = (day: string) => {
        const dayKey = day.toLowerCase();
        const dayMap: Record<string, string> = {
            monday: t('day.monday'),
            tuesday: t('day.tuesday'),
            wednesday: t('day.wednesday'),
            thursday: t('day.thursday'),
            friday: t('day.friday'),
            saturday: t('day.saturday'),
            sunday: t('day.sunday')
        };
        return dayMap[dayKey] || day;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
            </div>
        );
    }

    // No site yet - show create button
    if (hasSite === false) {
        return (
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-gradient-to-br from-[#f5f3ee] to-[#d4af37]/20 rounded-3xl p-12 text-center border border-[#d4af37]/20">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#d4af37]/20">
                            <Church className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#8a6d1c] mb-3">
                            {t('mySite.noSiteTitle')}
                        </h2>
                        <p className="text-gray-600 mb-8">
                            {t('mySite.noSiteDesc')}
                        </p>
                        <button
                            onClick={handleOpenCreateModal}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl hover:brightness-110 transition-all font-medium shadow-lg shadow-[#d4af37]/25"
                        >
                            <Plus className="w-5 h-5" />
                            {t('mySite.createNew')}
                        </button>
                        <p className="text-sm text-gray-500 mt-4">
                            {t('mySite.note')}
                        </p>
                    </div>
                </div>

                {/* Form Modal */}
                <SiteFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSuccess={handleFormSuccess}
                    mode={formMode}
                    existingSite={null}
                />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 flex items-center gap-2">
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                    <button onClick={() => fetchMySite()} className="ml-auto px-3 py-1 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                        {t('mySite.retry')}
                    </button>
                </div>
            </div>
        );
    }

    // Show site details
    if (!site) return null;

    const typeInfo = getTypeInfo(site.type);
    const TypeIcon = typeInfo.icon;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('mySite.title')}</h1>
                    <p className="text-slate-500 mt-1">{t('mySite.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleManualRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 border border-[#d4af37]/30 text-[#8a6d1c] rounded-xl hover:bg-[#f5f3ee] transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {t('common.refresh')}
                    </button>
                    <button
                        onClick={handleOpenEditModal}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl hover:brightness-110 transition-all shadow-lg shadow-[#d4af37]/20"
                    >
                        <Edit className="w-4 h-4" />
                        {t('common.edit')}
                    </button>
                </div>
            </div>

            {/* Site Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#d4af37]/20 overflow-hidden">
                {/* Cover Image */}
                <div className="relative h-64 bg-gradient-to-br from-[#8a6d1c] to-[#d4af37]">
                    {site.cover_image && (
                        <img
                            src={site.cover_image}
                            alt={site.name}
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                        <div>
                            <span className="text-xs font-mono bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded">
                                {site.code}
                            </span>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${site.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}>
                            {site.is_active ? (
                                <><CheckCircle className="w-4 h-4" /> {t('mySite.active')}</>
                            ) : (
                                <><XCircle className="w-4 h-4" /> {t('mySite.inactive')}</>
                            )}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Name & Type */}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                                <TypeIcon className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-slate-500">{typeInfo.label}</span>
                            <span className="text-sm text-slate-400">•</span>
                            <span className="text-sm text-slate-500">{getRegionLabel(site.region)}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">{site.name}</h2>
                        {site.patron_saint && (
                            <p className="text-slate-600 mt-1">{t('mySite.patronSaint')}: {site.patron_saint}</p>
                        )}
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-3 p-4 bg-[#f5f3ee] rounded-xl border border-[#d4af37]/10">
                        <MapPin className="w-5 h-5 text-[#d4af37] mt-0.5" />
                        <div>
                            <p className="font-medium text-gray-900">{site.address}</p>
                            <p className="text-sm text-gray-500">
                                {site.district && `${site.district}, `}{site.province}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    {site.description && (
                        <div>
                            <h3 className="text-sm font-semibold text-[#8a6d1c] uppercase tracking-wider mb-2">{t('mySite.description')}</h3>
                            <p className="text-gray-600">{site.description}</p>
                        </div>
                    )}

                    {/* History */}
                    {site.history && (
                        <div>
                            <h3 className="text-sm font-semibold text-[#8a6d1c] uppercase tracking-wider mb-2">{t('mySite.history')}</h3>
                            <p className="text-gray-600">{site.history}</p>
                        </div>
                    )}

                    {/* Opening Hours & Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Opening Hours */}
                        {site.opening_hours && Object.keys(site.opening_hours).length > 0 && (
                            <div className="p-4 border border-[#d4af37]/20 rounded-xl bg-[#f5f3ee]">
                                <h3 className="text-sm font-semibold text-[#8a6d1c] uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {t('mySite.openingHours')}
                                </h3>
                                <div className="space-y-1 text-sm">
                                    {Object.entries(site.opening_hours).map(([day, hours]) => (
                                        <div key={day} className="flex justify-between">
                                            <span className="text-gray-500">{getDayLabel(day)}</span>
                                            <span className="text-gray-900 font-medium">{hours}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Contact Info */}
                        {site.contact_info && (
                            <div className="p-4 border border-[#d4af37]/20 rounded-xl bg-[#f5f3ee]">
                                <h3 className="text-sm font-semibold text-[#8a6d1c] uppercase tracking-wider mb-3">
                                    {t('mySite.contactInfo')}
                                </h3>
                                <div className="space-y-2 text-sm">
                                    {site.contact_info.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-[#d4af37]" />
                                            <span className="text-gray-900">{site.contact_info.phone}</span>
                                        </div>
                                    )}
                                    {site.contact_info.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-[#d4af37]" />
                                            <span className="text-gray-900">{site.contact_info.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timestamps */}
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-[#d4af37]/20">
                        <span>{t('mySite.createdAt')}: {formatDate(site.created_at)}</span>
                        <span>{t('mySite.updatedAt')}: {formatDate(site.updated_at)}</span>
                    </div>
                </div>
            </div>

            {/* Form Modal */}
            <SiteFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSuccess={handleFormSuccess}
                mode={formMode}
                existingSite={site}
            />
        </div>
    );
};

