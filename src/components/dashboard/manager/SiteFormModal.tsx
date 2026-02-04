import React, { useState, useEffect } from 'react';
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
    AlertCircle
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { ManagerSite, CreateManagerSiteData, UpdateManagerSiteData } from '../../../types/manager.types';
import { SiteType, SiteRegion, SiteOpeningHours, SiteContactInfo } from '../../../types/admin.types';
import { useLanguage } from '../../../contexts/LanguageContext';

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    // Opening hours
    const [openingHours, setOpeningHours] = useState<Record<string, string>>({});

    // Contact info
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');

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
        setOpeningHours({});
        setContactPhone('');
        setContactEmail('');
        setError(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverImage(file);
            setCoverImagePreview(URL.createObjectURL(file));
        }
    };

    const handleOpeningHourChange = (day: string, value: string) => {
        setOpeningHours(prev => ({
            ...prev,
            [day]: value
        }));
    };

    const validateForm = (): boolean => {
        if (!name.trim()) {
            setError('Vui lòng nhập tên địa điểm');
            return false;
        }
        if (!address.trim()) {
            setError('Vui lòng nhập địa chỉ');
            return false;
        }
        if (!province.trim()) {
            setError('Vui lòng nhập tỉnh/thành phố');
            return false;
        }
        if (!latitude || !longitude) {
            setError('Vui lòng nhập tọa độ (latitude, longitude)');
            return false;
        }
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (isNaN(lat) || isNaN(lng)) {
            setError('Tọa độ phải là số hợp lệ');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            setError(null);

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
                onSuccess();
                onClose();
            } else {
                setError(response.message || 'Có lỗi xảy ra');
            }
        } catch (err: any) {
            setError(err?.error?.message || err?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 my-8 max-h-[90vh] overflow-hidden flex-shrink-0">
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
                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

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
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
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
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${type === value
                                                ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
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
                                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${region === value
                                                ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('siteForm.description')}</label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('siteForm.history')}</label>
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
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-[#8a6d1c] uppercase tracking-wider flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> {t('siteForm.location')}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('siteForm.address')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="01 Công xã Paris, Bến Nghé"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('siteForm.province')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={province}
                                    onChange={(e) => setProvince(e.target.value)}
                                    placeholder="Hồ Chí Minh"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('siteForm.district')}</label>
                                <input
                                    type="text"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    placeholder="Quận 1"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('siteForm.latitude')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    placeholder="10.779733"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('siteForm.longitude')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    placeholder="106.699092"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-[#8a6d1c] uppercase tracking-wider flex items-center gap-2">
                            <Upload className="w-4 h-4" /> {t('siteForm.coverImage')}
                        </h3>

                        <div className="flex items-center gap-4">
                            {coverImagePreview ? (
                                <div className="relative w-32 h-32 rounded-xl overflow-hidden">
                                    <img src={coverImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => { setCoverImage(null); setCoverImagePreview(null); }}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-[#d4af37]/50 rounded-xl cursor-pointer hover:border-[#d4af37] transition-colors">
                                    <Upload className="w-6 h-6 text-[#d4af37]" />
                                    <span className="text-xs text-gray-500 mt-1">{t('siteForm.selectImage')}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Opening Hours */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-[#8a6d1c] uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-4 h-4" /> {t('siteForm.openingHours')}
                        </h3>

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
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
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
                            <><Save className="w-4 h-4" /> {mode === 'create' ? t('siteForm.createButton') : t('common.save')}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
