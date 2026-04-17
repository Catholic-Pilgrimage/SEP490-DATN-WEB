import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    Loader2,
    MapPin,
    Church,
    Building,
    Mountain,
    Home,
    HelpCircle,
    Upload,
    Clock,
    Phone,
    Mail,
    Save,
    Map,
    Sparkles
} from 'lucide-react';
import MapLocationPicker, { LocationResult } from '@/components/shared/MapLocationPicker';
import { geocodeAddress } from '@/services/vietmap.service';
import { ManagerService } from '../../../services/manager.service';
import { extractErrorMessage } from '../../../lib/utils';
import { ManagerSite, CreateManagerSiteData, UpdateManagerSiteData } from '../../../types/manager.types';
import { SiteType, SiteRegion, SiteOpeningHours, SiteContactInfo } from '../../../types/admin.types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { AIGeneratorModal } from './AIGeneratorModal';

interface SiteFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    mode: 'create' | 'edit';
    existingSite?: ManagerSite | null;
}

const SITE_TYPES: { value: SiteType; labelKey: string; icon: React.ElementType }[] = [
    { value: 'church', labelKey: 'siteType.church', icon: Church },
    { value: 'shrine', labelKey: 'siteType.shrine', icon: Mountain },
    { value: 'monastery', labelKey: 'siteType.monastery', icon: Building },
    { value: 'center', labelKey: 'siteType.center', icon: Home },
    { value: 'other', labelKey: 'siteType.other', icon: HelpCircle }
];

const REGIONS: { value: SiteRegion; labelKey: string }[] = [
    { value: 'Bac', labelKey: 'region.bac' },
    { value: 'Trung', labelKey: 'region.trung' },
    { value: 'Nam', labelKey: 'region.nam' }
];

const DAYS_OF_WEEK = [
    { key: 'monday', labelKey: 'day.monday' },
    { key: 'tuesday', labelKey: 'day.tuesday' },
    { key: 'wednesday', labelKey: 'day.wednesday' },
    { key: 'thursday', labelKey: 'day.thursday' },
    { key: 'friday', labelKey: 'day.friday' },
    { key: 'saturday', labelKey: 'day.saturday' },
    { key: 'sunday', labelKey: 'day.sunday' }
];

export const SiteFormModal: React.FC<SiteFormModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    mode,
    existingSite
}) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [history, setHistory] = useState('');
    const [address, setAddress] = useState('');
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [region, setRegion] = useState<SiteRegion>('Nam');
    const [type, setType] = useState<SiteType>('church');
    const [patronSaint, setPatronSaint] = useState('');
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [showMapPicker, setShowMapPicker] = useState(false);

    // AI Generation state
    const [showAIGenerator, setShowAIGenerator] = useState(false);
    const [aiTargetField, setAiTargetField] = useState<'description' | 'history'>('description');

    // Opening hours
    const [openingHours, setOpeningHours] = useState<Record<string, string>>({});

    // Contact info
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const addressGeocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const coordsRef = useRef<{ lat?: number; lng?: number }>({});

    // Populate form when editing
    useEffect(() => {
        if (mode === 'edit' && existingSite) {
            setName(existingSite.name);
            setDescription(existingSite.description || '');
            setHistory(existingSite.history || '');
            setAddress(existingSite.address);
            setProvince(existingSite.province);
            setDistrict(existingSite.district || '');
            setLatitude(existingSite.latitude);
            setLongitude(existingSite.longitude);
            setRegion(existingSite.region);
            setType(existingSite.type);
            setPatronSaint(existingSite.patron_saint || '');
            setCoverImagePreview(existingSite.cover_image || null);
            setShowMapPicker(false);

            if (existingSite.opening_hours) {
                setOpeningHours(existingSite.opening_hours as Record<string, string>);
            }
            if (existingSite.contact_info) {
                setContactPhone(existingSite.contact_info.phone || '');
                setContactEmail(existingSite.contact_info.email || '');
            }
        } else {
            resetForm();
        }
    }, [mode, existingSite, isOpen]);

    const resetForm = () => {
        setName('');
        setDescription('');
        setHistory('');
        setAddress('');
        setProvince('');
        setDistrict('');
        setLatitude('');
        setLongitude('');
        setRegion('Nam');
        setType('church');
        setPatronSaint('');
        setCoverImage(null);
        setCoverImagePreview(null);
        setShowMapPicker(false);
        setOpeningHours({});
        setContactPhone('');
        setContactEmail('');
        setSubmitted(false);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverImage(file);
            setCoverImagePreview(URL.createObjectURL(file));
        }
    };

    const handleLocationSelect = (location: LocationResult) => {
        setLatitude(location.latitude.toString());
        setLongitude(location.longitude.toString());
        if (location.address) {
            setAddress(location.address);
        }
        if (location.district) {
            setDistrict(location.district);
        }
        if (location.province) {
            setProvince(location.province);
        }
    };

    useEffect(() => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        coordsRef.current = {
            lat: Number.isNaN(lat) ? undefined : lat,
            lng: Number.isNaN(lng) ? undefined : lng,
        };
    }, [latitude, longitude]);

    // Geocode when user types address to sync map coordinates
    useEffect(() => {
        const trimmedAddress = address.trim();
        if (!trimmedAddress || trimmedAddress.length < 3) return;

        if (addressGeocodeTimerRef.current) {
            clearTimeout(addressGeocodeTimerRef.current);
        }

        addressGeocodeTimerRef.current = setTimeout(async () => {
            addressGeocodeTimerRef.current = null;
            const focus = coordsRef.current.lat != null && coordsRef.current.lng != null
                ? { lat: coordsRef.current.lat, lng: coordsRef.current.lng }
                : undefined;

            const result = await geocodeAddress(trimmedAddress, focus);
            if (result) {
                setLatitude(result.latitude.toString());
                setLongitude(result.longitude.toString());
                if (result.district) {
                    setDistrict(result.district);
                }
                if (result.province) {
                    setProvince(result.province);
                }
            }
        }, 600);

        return () => {
            if (addressGeocodeTimerRef.current) {
                clearTimeout(addressGeocodeTimerRef.current);
            }
        };
    }, [address]);

    const handleOpeningHourChange = (day: string, value: string) => {
        setOpeningHours(prev => ({
            ...prev,
            [day]: value
        }));
    };

    const validateForm = (): boolean => {
        if (!name.trim()) {
            showToast('error', t('siteForm.requiredName'));
            return false;
        }
        if (!address.trim()) {
            showToast('error', t('siteForm.requiredAddress'));
            return false;
        }
        if (!province.trim()) {
            showToast('error', t('siteForm.requiredProvince'));
            return false;
        }
        if (!latitude || !longitude) {
            showToast('error', t('siteForm.requiredCoordinates'));
            return false;
        }
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (isNaN(lat) || isNaN(lng)) {
            showToast('error', t('siteForm.invalidCoordinates'));
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        if (!validateForm()) return;

        try {
            setLoading(true);

            // Build opening hours object (only non-empty)
            const openingHoursData: SiteOpeningHours = {};
            Object.entries(openingHours).forEach(([day, hours]) => {
                if (hours.trim()) {
                    openingHoursData[day as keyof SiteOpeningHours] = hours.trim();
                }
            });

            // Build contact info (only if provided)
            const contactInfo: SiteContactInfo | undefined =
                (contactPhone.trim() || contactEmail.trim())
                    ? { phone: contactPhone.trim() || undefined, email: contactEmail.trim() || undefined }
                    : undefined;

            const formData: CreateManagerSiteData = {
                name: name.trim(),
                description: description.trim() || undefined,
                history: history.trim() || undefined,
                address: address.trim(),
                province: province.trim(),
                district: district.trim() || undefined,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                region,
                type,
                patron_saint: patronSaint.trim() || undefined,
                cover_image: coverImage || undefined,
                opening_hours: Object.keys(openingHoursData).length > 0 ? openingHoursData : undefined,
                contact_info: contactInfo
            };

            let response;
            if (mode === 'create') {
                response = await ManagerService.createSite(formData);
            } else {
                response = await ManagerService.updateSite(formData as UpdateManagerSiteData);
            }

            if (response.success) {
                showToast('success',
                    mode === 'create' ? t('toast.createSiteSuccess') : t('toast.updateSiteSuccess'),
                    mode === 'create' ? t('toast.createSiteSuccessMsg') : t('toast.updateSiteSuccessMsg')
                );
                onSuccess();
                onClose();
            } else {
                showToast('error',
                    mode === 'create' ? t('toast.createSiteFailed') : t('toast.updateSiteFailed'),
                    response.message
                );
            }
        } catch (error) {
            const message = extractErrorMessage(error, t('common.error'));
            showToast('error',
                mode === 'create' ? t('toast.createSiteFailed') : t('toast.updateSiteFailed'),
                message
            );
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden border border-[#d4af37]/20 flex-shrink-0">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37]">
                    <div className="text-white">
                        <h2 className="text-lg font-semibold">
                            {mode === 'create' ? t('siteForm.createTitle') : t('siteForm.editTitle')}
                        </h2>
                        <p className="text-sm opacity-80">
                            {mode === 'create' ? t('siteForm.createSubtitle') : t('siteForm.editSubtitle')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[calc(90vh-10rem)] overflow-y-auto space-y-6">

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-[#8a6d1c] uppercase tracking-wider">{t('siteForm.basicInfo')}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('siteForm.name')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nhà thờ Đức Bà Sài Gòn"
                                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent ${submitted && !name.trim() ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('siteForm.type')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {SITE_TYPES.map(({ value, labelKey, icon: Icon }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setType(value)}
                                            disabled={mode === 'edit'}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${type === value
                                                ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                } ${mode === 'edit' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {t(labelKey)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Region */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('siteForm.region')}</label>
                                <div className="flex gap-2">
                                    {REGIONS.map(({ value, labelKey }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setRegion(value)}
                                            disabled={mode === 'edit'}
                                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${region === value
                                                ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                } ${mode === 'edit' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        >
                                            {t(labelKey)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Patron Saint */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('siteForm.patronSaint')}</label>
                                <input
                                    type="text"
                                    value={patronSaint}
                                    onChange={(e) => setPatronSaint(e.target.value)}
                                    placeholder="Đức Mẹ Vô Nhiễm Nguyên Tội"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                                />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-gray-700">{t('siteForm.description')}</label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAiTargetField('description');
                                            setShowAIGenerator(true);
                                        }}
                                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#8a6d1c] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 rounded-lg transition-colors border border-[#d4af37]/30"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        {t('ai.btnWrite')}
                                    </button>
                                </div>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Mô tả ngắn về địa điểm..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent resize-none"
                                />
                            </div>

                            {/* History */}
                            <div className="md:col-span-2">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-gray-700">{t('siteForm.history')}</label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAiTargetField('history');
                                            setShowAIGenerator(true);
                                        }}
                                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#8a6d1c] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 rounded-lg transition-colors border border-[#d4af37]/30"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        {t('ai.btnWrite')}
                                    </button>
                                </div>
                                <textarea
                                    value={history}
                                    onChange={(e) => setHistory(e.target.value)}
                                    placeholder="Lịch sử hình thành và phát triển..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> {t('siteForm.location')}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowMapPicker(prev => !prev)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all"
                                style={showMapPicker
                                    ? { background: 'linear-gradient(to right, #8a6d1c, #d4af37)', color: 'white', borderColor: 'transparent' }
                                    : { background: 'transparent', color: '#8a6d1c', borderColor: '#d4af37' }
                                }
                            >
                                <Map className="w-3.5 h-3.5" />
                                {showMapPicker ? 'Ẩn bản đồ' : 'Chọn trên bản đồ'}
                            </button>
                        </div>

                        {showMapPicker && (
                            <MapLocationPicker
                                initialLat={Number.isNaN(parseFloat(latitude)) ? 10.7769 : parseFloat(latitude)}
                                initialLng={Number.isNaN(parseFloat(longitude)) ? 106.7009 : parseFloat(longitude)}
                                onLocationSelect={handleLocationSelect}
                            />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {t('siteForm.address')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="01 Công xã Paris, Bến Nghé"
                                    className={`w-full h-11 px-4 bg-white border rounded-xl focus-visible:ring-1 focus-visible:ring-[#d4af37] focus-visible:border-[#d4af37] hover:border-[#d4af37]/50 transition-all ${submitted && !address.trim() ? 'border-red-400 bg-red-50 hover:border-red-400' : 'border-[#d4af37]/30'}`}
                                />
                            </div>

                            <div className="hidden">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {t('siteForm.province')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={province}
                                    onChange={(e) => setProvince(e.target.value)}
                                    placeholder="Hồ Chí Minh"
                                    className={`w-full h-11 px-4 bg-white border rounded-xl focus-visible:ring-1 focus-visible:ring-[#d4af37] focus-visible:border-[#d4af37] hover:border-[#d4af37]/50 transition-all ${submitted && !province.trim() ? 'border-red-400 bg-red-50 hover:border-red-400' : 'border-[#d4af37]/30'}`}
                                />
                            </div>

                            <div className="hidden">
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('siteForm.district')}</label>
                                <input
                                    type="text"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    placeholder="Quận 1"
                                    className="w-full h-11 px-4 bg-white border border-[#d4af37]/30 rounded-xl focus-visible:ring-1 focus-visible:ring-[#d4af37] focus-visible:border-[#d4af37] hover:border-[#d4af37]/50 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {t('siteForm.latitude')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    step="any"
                                    disabled
                                    className={`w-full h-11 px-4 bg-white border rounded-xl focus-visible:ring-1 focus-visible:ring-[#d4af37] focus-visible:border-[#d4af37] hover:border-[#d4af37]/50 transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed disabled:hover:border-[#d4af37]/30 ${submitted && !latitude.trim() ? 'border-red-400 bg-red-50 hover:border-red-400' : 'border-[#d4af37]/30'}`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {t('siteForm.longitude')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    step="any"
                                    disabled
                                    className={`w-full h-11 px-4 bg-white border rounded-xl focus-visible:ring-1 focus-visible:ring-[#d4af37] focus-visible:border-[#d4af37] hover:border-[#d4af37]/50 transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed disabled:hover:border-[#d4af37]/30 ${submitted && !longitude.trim() ? 'border-red-400 bg-red-50 hover:border-red-400' : 'border-[#d4af37]/30'}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-[#8a6d1c] uppercase tracking-wider flex items-center gap-2">
                            <Upload className="w-4 h-4" /> {t('siteForm.coverImage')}
                        </h3>

                        <div className="space-y-3">
                            <input
                                id="cover-image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />

                            <div className="flex items-stretch gap-4">
                                <label
                                    htmlFor="cover-image-upload"
                                    className="relative w-40 h-28 rounded-xl overflow-hidden border border-[#d4af37]/30 bg-[#f5f3ee] cursor-pointer group"
                                >
                                    {coverImagePreview ? (
                                        <img src={coverImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-1">
                                            <Upload className="w-5 h-5 text-[#d4af37]" />
                                            <span className="text-xs">{t('siteForm.selectImage')}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                </label>

                                <label
                                    htmlFor="cover-image-upload"
                                    className="flex-1 h-28 rounded-2xl border-2 border-dashed border-[#d4af37]/40 bg-[#fcfbf8] hover:bg-[#f8f4ea] hover:border-[#d4af37]/70 transition-colors cursor-pointer flex flex-col items-center justify-center text-[#8a6d1c]"
                                >
                                    <Upload className="w-8 h-8 mb-2" />
                                    <span className="text-sm font-medium">
                                        {t('edit.uploadImage')}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Opening Hours */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-[#8a6d1c] uppercase tracking-wider flex items-center gap-2">
                                <Clock className="w-4 h-4" /> {t('siteForm.openingHours')}
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const firstValue = openingHours[DAYS_OF_WEEK[0].key] || '';
                                        if (firstValue) {
                                            const allDays: Record<string, string> = {};
                                            DAYS_OF_WEEK.forEach(({ key }) => {
                                                allDays[key] = firstValue;
                                            });
                                            setOpeningHours(allDays);
                                        }
                                    }}
                                    className="px-2.5 py-1 text-xs font-medium text-[#8a6d1c] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 rounded-lg transition-colors border border-[#d4af37]/30"
                                >
                                    {t('openingHours.applyAll')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const firstValue = openingHours[DAYS_OF_WEEK[0].key] || '';
                                        if (firstValue) {
                                            const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
                                            const updated = { ...openingHours };
                                            weekdays.forEach(day => {
                                                updated[day] = firstValue;
                                            });
                                            setOpeningHours(updated);
                                        }
                                    }}
                                    className="px-2.5 py-1 text-xs font-medium text-[#8a6d1c] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 rounded-lg transition-colors border border-[#d4af37]/30"
                                >
                                    {t('openingHours.applyWeekdays')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const firstValue = openingHours[DAYS_OF_WEEK[0].key] || '';
                                        if (firstValue) {
                                            setOpeningHours(prev => ({
                                                ...prev,
                                                saturday: firstValue,
                                                sunday: firstValue
                                            }));
                                        }
                                    }}
                                    className="px-2.5 py-1 text-xs font-medium text-[#8a6d1c] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 rounded-lg transition-colors border border-[#d4af37]/30"
                                >
                                    {t('openingHours.applyWeekend')}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {DAYS_OF_WEEK.map(({ key, labelKey }) => (
                                <div key={key}>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">{t(labelKey)}</label>
                                    <input
                                        type="text"
                                        value={openingHours[key] || ''}
                                        onChange={(e) => handleOpeningHourChange(key, e.target.value)}
                                        placeholder="05:00-18:00"
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-[#8a6d1c] uppercase tracking-wider">{t('siteForm.contactInfo')}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <Phone className="w-4 h-4" /> {t('siteForm.phone')}
                                </label>
                                <input
                                    type="text"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                    placeholder="028-3822-0477"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <Mail className="w-4 h-4" /> {t('siteForm.email')}
                                </label>
                                <input
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    placeholder="contact@example.com"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#d4af37]/20 bg-[#f5f3ee]">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2.5 border border-[#d4af37]/30 text-[#8a6d1c] rounded-xl hover:bg-[#d4af37]/10 transition-colors disabled:opacity-50"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-[#d4af37]/20"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> {t('siteForm.processing')}</>
                        ) : (
                            <><Save className="w-4 h-4" /> {mode === 'create' ? t('siteForm.createButton') : t('siteForm.saveButton')}</>
                        )}
                    </button>
                </div>
            </div>

            {/* AI Generator Modal */}
            <AIGeneratorModal
                isOpen={showAIGenerator}
                onClose={() => setShowAIGenerator(false)}
                modalTitle={aiTargetField === 'description' ? t('ai.titleDesc') : t('ai.titleHistory')}
                defaultTopic={name || t('ai.topicPlaceholder')}
                onApply={(content) => {
                    if (aiTargetField === 'description') {
                        setDescription(content);
                    } else {
                        setHistory(content);
                    }
                }}
            />
        </div>
    );
};
