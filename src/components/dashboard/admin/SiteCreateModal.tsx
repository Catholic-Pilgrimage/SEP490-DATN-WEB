import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, MapPin, Upload, Map } from 'lucide-react';
import MapLocationPicker, { LocationResult } from '@/components/shared/MapLocationPicker';
import { geocodeAddress } from '@/services/vietmap.service';
import { AdminService } from '../../../services/admin.service';
import { CreateSiteData, SiteRegion, SiteType, SiteOpeningHours } from '../../../types/admin.types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { extractErrorMessage } from '../../../lib/utils';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface SiteCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const SiteCreateModal: React.FC<SiteCreateModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const { t } = useLanguage();
    const { showToast } = useToast();

    const [saving, setSaving] = useState(false);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

    // Form data
    const [name, setName] = useState('');
    const [province, setProvince] = useState('');
    const [region, setRegion] = useState<SiteRegion>('Nam');
    const [type, setType] = useState<SiteType>('church');
    const [description, setDescription] = useState('');
    const [history, setHistory] = useState('');
    const [address, setAddress] = useState('');
    const [district, setDistrict] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [patronSaint, setPatronSaint] = useState('');
    const [showMapPicker, setShowMapPicker] = useState(false);

    const addressGeocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const coordsRef = useRef<{ lat?: number; lng?: number }>({});

    useEffect(() => {
        coordsRef.current = {
            lat: latitude ? parseFloat(latitude) : undefined,
            lng: longitude ? parseFloat(longitude) : undefined,
        };
    }, [latitude, longitude]);

    useEffect(() => {
        const addr = address.trim();
        if (!addr || addr.length < 3) return;

        if (addressGeocodeTimerRef.current) {
            clearTimeout(addressGeocodeTimerRef.current);
        }

        addressGeocodeTimerRef.current = setTimeout(async () => {
            addressGeocodeTimerRef.current = null;
            const focus = coordsRef.current.lat != null && coordsRef.current.lng != null
                ? { lat: coordsRef.current.lat, lng: coordsRef.current.lng }
                : undefined;
            const result = await geocodeAddress(addr, focus);
            if (result) {
                setLatitude(result.latitude.toString());
                setLongitude(result.longitude.toString());
                if (result.district) setDistrict(result.district);
                if (result.province) setProvince(result.province);
            }
        }, 600);

        return () => {
            if (addressGeocodeTimerRef.current) {
                clearTimeout(addressGeocodeTimerRef.current);
            }
        };
    }, [address]);

    const handleLocationSelect = (location: LocationResult) => {
        setLatitude(location.latitude.toString());
        setLongitude(location.longitude.toString());
        if (location.address) setAddress(location.address);
        if (location.district) setDistrict(location.district);
        if (location.province) setProvince(location.province);
    };

    // Opening hours
    const [openingHours, setOpeningHours] = useState<SiteOpeningHours>({
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: '',
    });

    // Contact info
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setCoverImageFile(null);
        setCoverImagePreview(null);
    };

    const handleSave = async () => {
        // Validation
        if (!name.trim() || name.length < 2 || name.length > 255) {
            showToast('error', t('common.error'), 'Tên site phải từ 2-255 ký tự');
            return;
        }
        if (!province.trim()) {
            showToast('error', t('common.error'), 'Vui lòng nhập tỉnh/thành phố');
            return;
        }

        try {
            setSaving(true);

            const data: CreateSiteData = {
                name: name.trim(),
                province: province.trim(),
                region,
                type,
            };

            // Optional fields
            if (description.trim()) data.description = description.trim();
            if (history.trim()) data.history = history.trim();
            if (address.trim()) data.address = address.trim();
            if (district.trim()) data.district = district.trim();
            if (latitude.trim()) data.latitude = parseFloat(latitude);
            if (longitude.trim()) data.longitude = parseFloat(longitude);
            if (patronSaint.trim()) data.patron_saint = patronSaint.trim();
            if (coverImageFile) data.cover_image = coverImageFile;

            // Opening hours (only if at least one day is filled)
            const hasOpeningHours = Object.values(openingHours).some(v => v.trim());
            if (hasOpeningHours) {
                data.opening_hours = openingHours;
            }

            // Contact info (only if at least one field is filled)
            if (contactEmail.trim() || contactPhone.trim()) {
                data.contact_info = {};
                if (contactEmail.trim()) data.contact_info.email = contactEmail.trim();
                if (contactPhone.trim()) data.contact_info.phone = contactPhone.trim();
            }

            const response = await AdminService.createSite(data);

            if (response.success) {
                showToast('success', t('sites.createSuccess'), t('sites.createSuccessMsg'));
                onSuccess();
                handleClose();
            } else {
                showToast('error', t('sites.createFailed'), response.message || t('sites.createFailedMsg'));
            }
        } catch (err) {
            showToast('error', t('sites.createFailed'), extractErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        if (!saving) {
            // Reset form
            setName('');
            setProvince('');
            setRegion('Nam');
            setType('church');
            setDescription('');
            setHistory('');
            setAddress('');
            setDistrict('');
            setLatitude('');
            setLongitude('');
            setPatronSaint('');
            setShowMapPicker(false);
            setOpeningHours({
                monday: '',
                tuesday: '',
                wednesday: '',
                thursday: '',
                friday: '',
                saturday: '',
                sunday: '',
            });
            setContactEmail('');
            setContactPhone('');
            setCoverImageFile(null);
            setCoverImagePreview(null);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
            <DialogContent className="p-0 overflow-hidden border-[#d4af37]/20 rounded-2xl max-w-4xl max-h-[90vh] flex flex-col gap-0 outline-none [&>button]:hidden">
                <DialogHeader className="px-6 py-4 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] m-0">
                    <div className="flex items-center justify-between w-full">
                        <DialogTitle className="text-lg font-semibold text-white">
                            {t('sites.createTitle')}
                        </DialogTitle>
                        <button
                            onClick={handleClose}
                            disabled={saving}
                            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </DialogHeader>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-[#8a6d1c] uppercase tracking-wide">
                            {t('edit.basicInfo')}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {t('edit.name')} <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nhà thờ Đức Bà..."
                                    className="border-[#d4af37]/30 focus-visible:ring-[#d4af37]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {t('edit.type')} <span className="text-red-500">*</span>
                                </label>
                                <Select value={type} onValueChange={(value) => setType(value as SiteType)}>
                                    <SelectTrigger className="border-[#d4af37]/30 focus:ring-[#d4af37]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="church">{t('type.church')}</SelectItem>
                                        <SelectItem value="shrine">{t('type.shrine')}</SelectItem>
                                        <SelectItem value="monastery">{t('type.monastery')}</SelectItem>
                                        <SelectItem value="center">{t('type.center')}</SelectItem>
                                        <SelectItem value="other">{t('type.other')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {t('edit.region')} <span className="text-red-500">*</span>
                                </label>
                                <Select value={region} onValueChange={(value) => setRegion(value as SiteRegion)}>
                                    <SelectTrigger className="border-[#d4af37]/30 focus:ring-[#d4af37]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Bac">{t('region.bac')}</SelectItem>
                                        <SelectItem value="Trung">{t('region.trung')}</SelectItem>
                                        <SelectItem value="Nam">{t('region.nam')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {t('edit.patronSaint')}
                                </label>
                                <Input
                                    value={patronSaint}
                                    onChange={(e) => setPatronSaint(e.target.value)}
                                    placeholder="Đức Mẹ Maria..."
                                    className="border-[#d4af37]/30 focus-visible:ring-[#d4af37]"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {t('edit.description')}
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-[#d4af37]/30 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent resize-none"
                                    placeholder="Mô tả ngắn gọn về địa điểm..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {t('edit.history')}
                                </label>
                                <textarea
                                    value={history}
                                    onChange={(e) => setHistory(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-[#d4af37]/30 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent resize-none"
                                    placeholder="Lịch sử hình thành và phát triển..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-[#8a6d1c] uppercase tracking-wide flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {t('edit.location')}
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

                        {/* Map Picker */}
                        {showMapPicker && (
                            <MapLocationPicker
                                initialLat={latitude ? parseFloat(latitude) : 10.7769}
                                initialLng={longitude ? parseFloat(longitude) : 106.7009}
                                onLocationSelect={handleLocationSelect}
                            />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="hidden">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {t('edit.province')} <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={province}
                                    onChange={(e) => setProvince(e.target.value)}
                                    placeholder="TP. Hồ Chí Minh..."
                                    className="border-[#d4af37]/30 focus-visible:ring-[#d4af37]"
                                />
                            </div>

                            <div className="hidden">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {t('edit.district')}
                                </label>
                                <Input
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    placeholder="Quận 1..."
                                    className="border-[#d4af37]/30 focus-visible:ring-[#d4af37]"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {t('edit.address')}
                                </label>
                                <Input
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="01 Công xã Paris, Bến Nghé..."
                                    className="border-[#d4af37]/30 focus-visible:ring-[#d4af37]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {t('edit.latitude')}
                                </label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    disabled
                                    placeholder="10.7769"
                                    className="border-[#d4af37]/30 focus-visible:ring-[#d4af37]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {t('edit.longitude')}
                                </label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    disabled
                                    placeholder="106.7009"
                                    className="border-[#d4af37]/30 focus-visible:ring-[#d4af37]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-[#8a6d1c] uppercase tracking-wide flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            {t('edit.coverImage')}
                        </h3>

                        {coverImagePreview ? (
                            <div className="relative">
                                <img
                                    src={coverImagePreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg border border-[#d4af37]/30"
                                />
                                <button
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-[#d4af37]/30 rounded-lg p-8 text-center hover:border-[#d4af37] transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="cover-image-upload"
                                />
                                <label
                                    htmlFor="cover-image-upload"
                                    className="cursor-pointer flex flex-col items-center gap-2"
                                >
                                    <Upload className="w-8 h-8 text-[#8a6d1c]/50" />
                                    <span className="text-sm text-slate-600">
                                        Click để chọn ảnh bìa
                                    </span>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-[#8a6d1c] uppercase tracking-wide">
                            {t('edit.contactInfo')}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    placeholder="contact@example.com"
                                    className="border-[#d4af37]/30 focus-visible:ring-[#d4af37]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {t('edit.phone')}
                                </label>
                                <Input
                                    type="tel"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                    placeholder="0123456789"
                                    className="border-[#d4af37]/30 focus-visible:ring-[#d4af37]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 px-6 py-4 border-t border-[#d4af37]/20 bg-[#f5f3ee]">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={saving}
                        className="flex-1 h-11 border-[#d4af37]/30 text-[#8a6d1c] rounded-xl hover:bg-[#d4af37]/10"
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || !name.trim() || !province.trim()}
                        className="flex-1 h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl hover:brightness-110 transition-all disabled:opacity-50 shadow-none"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t('sites.creating')}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {t('sites.createSite')}
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
