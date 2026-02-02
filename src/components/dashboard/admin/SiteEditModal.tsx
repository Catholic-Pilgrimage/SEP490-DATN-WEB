import React, { useEffect, useState } from 'react';
import {
    X,
    Save,
    Loader2,
    Upload,
    MapPin,
    Phone,
    Mail,
    Clock,
    AlertCircle,
    Image as ImageIcon
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import { SiteDetail, UpdateSiteData, SiteOpeningHours, SiteContactInfo } from '../../../types/admin.types';
import { useLanguage } from '../../../contexts/LanguageContext';

interface SiteEditModalProps {
    site: SiteDetail | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const SiteEditModal: React.FC<SiteEditModalProps> = ({
    site,
    isOpen,
    onClose,
    onSuccess
}) => {
    const { t } = useLanguage();
    // Form state
    const [formData, setFormData] = useState<UpdateSiteData>({});
    const [openingHours, setOpeningHours] = useState<SiteOpeningHours>({});
    const [contactInfo, setContactInfo] = useState<SiteContactInfo>({});
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Khởi tạo form khi site thay đổi
    useEffect(() => {
        if (site) {
            setFormData({
                name: site.name || '',
                description: site.description || '',
                history: site.history || '',
                address: site.address || '',
                province: site.province || '',
                district: site.district || '',
                latitude: site.latitude ? parseFloat(site.latitude) : undefined,
                longitude: site.longitude ? parseFloat(site.longitude) : undefined,
                region: site.region,
                type: site.type,
                patron_saint: site.patron_saint || '',
                is_active: site.is_active,
            });
            setOpeningHours(site.opening_hours || {});
            setContactInfo(site.contact_info || {});
            setImagePreview(site.cover_image || null);
            setError(null);
        }
    }, [site]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: value ? parseFloat(value) : undefined }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, cover_image: file }));
            // Tạo preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOpeningHoursChange = (day: string, value: string) => {
        setOpeningHours(prev => ({ ...prev, [day]: value }));
    };

    const handleContactChange = (field: 'phone' | 'email', value: string) => {
        setContactInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!site) return;

        try {
            setLoading(true);
            setError(null);

            const dataToSend: UpdateSiteData = {
                ...formData,
                opening_hours: Object.keys(openingHours).length > 0 ? openingHours : undefined,
                contact_info: (contactInfo.phone || contactInfo.email) ? contactInfo : undefined,
            };

            const response = await AdminService.updateSite(site.id, dataToSend);

            if (response.success) {
                onSuccess();
                onClose();
            } else {
                setError(response.message || 'Failed to update site');
            }
        } catch (err: any) {
            setError(err?.error?.message || 'Failed to update site');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !site) return null;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 my-8 overflow-hidden border border-[#d4af37]/20 flex-shrink-0">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37]">
                    <div className="text-white">
                        <h2 className="text-lg font-semibold">{t('modal.editSite')}</h2>
                        <p className="text-sm opacity-80">{site.code} - {site.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Basic Info Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{t('edit.basicInfo')}</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {t('edit.name')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name || ''}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('edit.type')}</label>
                                    <select
                                        name="type"
                                        value={formData.type || 'church'}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="church">{t('type.church')}</option>
                                        <option value="shrine">{t('type.shrine')}</option>
                                        <option value="monastery">{t('type.monastery')}</option>
                                        <option value="center">{t('type.center')}</option>
                                        <option value="other">{t('type.other')}</option>
                                    </select>
                                </div>

                                {/* Region */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('edit.region')}</label>
                                    <select
                                        name="region"
                                        value={formData.region || 'Nam'}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="Bac">{t('region.bac')}</option>
                                        <option value="Trung">{t('region.trung')}</option>
                                        <option value="Nam">{t('region.nam')}</option>
                                    </select>
                                </div>

                                {/* Patron Saint */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Patron Saint</label>
                                    <input
                                        type="text"
                                        name="patron_saint"
                                        value={formData.patron_saint || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Đức Mẹ Vô Nhiễm Nguyên Tội"
                                    />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description || ''}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                </div>

                                {/* History */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">History</label>
                                    <textarea
                                        name="history"
                                        value={formData.history || ''}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-200">
                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Location
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={formData.district || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Province</label>
                                    <input
                                        type="text"
                                        name="province"
                                        value={formData.province || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                                    <input
                                        type="number"
                                        name="latitude"
                                        value={formData.latitude || ''}
                                        onChange={handleInputChange}
                                        step="any"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                                    <input
                                        type="number"
                                        name="longitude"
                                        value={formData.longitude || ''}
                                        onChange={handleInputChange}
                                        step="any"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cover Image Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-200">
                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" /> Cover Image
                            </h3>

                            <div className="flex items-start gap-4">
                                {imagePreview && (
                                    <img src={imagePreview} alt="Preview" className="w-32 h-24 object-cover rounded-lg border border-slate-200" />
                                )}
                                <label className="flex-1 flex flex-col items-center justify-center h-24 border-2 border-dashed border-[#d4af37]/30 rounded-xl hover:border-[#d4af37] hover:bg-[#d4af37]/10 transition-colors cursor-pointer">
                                    <Upload className="w-6 h-6 text-[#8a6d1c] mb-1" />
                                    <span className="text-sm text-[#8a6d1c]">Click to upload new image</span>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                            </div>
                        </div>

                        {/* Contact Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-200">
                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Contact Info</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> Phone
                                    </label>
                                    <input
                                        type="text"
                                        value={contactInfo.phone || ''}
                                        onChange={(e) => handleContactChange('phone', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                                        <Mail className="w-3 h-3" /> Email
                                    </label>
                                    <input
                                        type="email"
                                        value={contactInfo.email || ''}
                                        onChange={(e) => handleContactChange('email', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Opening Hours Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-200">
                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Opening Hours
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {days.map(day => (
                                    <div key={day}>
                                        <label className="block text-xs font-medium text-slate-500 mb-1 capitalize">{day}</label>
                                        <input
                                            type="text"
                                            value={(openingHours as any)[day] || ''}
                                            onChange={(e) => handleOpeningHoursChange(day, e.target.value)}
                                            placeholder="05:00-18:00"
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="pt-4 border-t border-[#d4af37]/20">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active || false}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 rounded border-[#d4af37]/50 text-[#d4af37] focus:ring-[#d4af37]"
                                />
                                <span className="text-sm font-medium text-slate-700">Site is Active</span>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#d4af37]/20">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 border border-[#d4af37]/30 text-[#8a6d1c] rounded-xl hover:bg-[#d4af37]/10 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                            ) : (
                                <><Save className="w-4 h-4" /> Save Changes</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
