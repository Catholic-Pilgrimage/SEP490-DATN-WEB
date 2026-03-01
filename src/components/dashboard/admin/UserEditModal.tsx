import React, { useEffect, useState } from 'react';
import {
    X,
    Save,
    Loader2
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import { AdminUser, UpdateUserData } from '../../../types/admin.types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';

interface UserEditModalProps {
    user: AdminUser | null;      // User hiện tại để edit
    isOpen: boolean;             // Modal có đang mở không
    onClose: () => void;         // Callback khi đóng modal
    onSuccess: () => void;       // Callback khi update thành công (để refresh list)
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
    user,
    isOpen,
    onClose,
    onSuccess
}) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    // Form state - lưu giá trị các field trong form
    const [formData, setFormData] = useState<UpdateUserData>({
        full_name: '',
        phone: '',
        date_of_birth: '',
        role: 'pilgrim',
        site_id: null
    });

    // Loading state - khi đang gọi API
    const [loading, setLoading] = useState(false);
    // Site name state
    const [siteName, setSiteName] = useState<string | null>(null);
    const [siteLoading, setSiteLoading] = useState(false);

    // Khi user thay đổi (mở modal với user khác), cập nhật form
    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                phone: user.phone || '',
                date_of_birth: user.date_of_birth || '',
                role: user.role,
                site_id: user.site_id
            });
            // Fetch site name if user has site_id
            if (user.site_id) {
                fetchSiteName(user.site_id);
            } else {
                setSiteName(null);
            }
        }
    }, [user]);

    const fetchSiteName = async (siteId: string) => {
        try {
            setSiteLoading(true);
            const response = await AdminService.getSiteById(siteId);
            if (response.success && response.data) {
                setSiteName(response.data.name);
            }
        } catch (err) {
            setSiteName(null);
        } finally {
            setSiteLoading(false);
        }
    };

    // Xử lý khi thay đổi giá trị input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value === '' ? null : value  // Nếu rỗng thì set null
        }));
    };

    // Xử lý khi submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();  // Ngăn form reload trang

        if (!user) return;

        try {
            setLoading(true);

            // Clean up formData - chỉ gửi các field được phép update
            const cleanData: UpdateUserData = {};
            if (formData.full_name) cleanData.full_name = formData.full_name;
            if (formData.phone) cleanData.phone = formData.phone;
            if (formData.date_of_birth) cleanData.date_of_birth = formData.date_of_birth;
            // Không gửi role và site_id vì đã disable chức năng này trong form

            // Gọi API update user
            const response = await AdminService.updateUser(user.id, cleanData);

            if (response.success) {
                showToast('success', t('toast.updateUserSuccess') || 'Cập nhật thành công!');
                onSuccess();  // Gọi callback để refresh danh sách
                onClose();    // Đóng modal
            }
        } catch (err: any) {
            console.error('Update user error:', err);
            // API service throws object from response.json(), so the message is usually inside `err.message`
            const errorMessage = err?.message || err?.error?.message || t('common.error');
            showToast('error', t('common.error'), errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Nếu modal không mở thì không render gì
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto">
            {/* Backdrop - click để đóng modal */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal container */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-[#d4af37]/20 flex-shrink-0">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37]">
                    <div className="flex items-center gap-3">
                        <img
                            src={user.avatar_url || 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=50'}
                            alt={user.full_name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white/50"
                        />
                        <div className="text-white">
                            <h2 className="text-lg font-semibold">{t('userEdit.title')}</h2>
                            <p className="text-sm opacity-80">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-[#8a6d1c] mb-1">
                            {t('userEdit.fullName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name || ''}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2.5 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all"
                            placeholder="Nguyen Van A"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-[#8a6d1c] mb-1">
                            {t('table.phone')}
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all"
                            placeholder="0123456789"
                        />
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-medium text-[#8a6d1c] mb-1">
                            {t('userDetail.dateOfBirth')}
                        </label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-[#8a6d1c] mb-1">
                            {t('table.role')} <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="role"
                            value={formData.role || 'pilgrim'}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl transition-all cursor-not-allowed opacity-70"
                            disabled
                        >
                            <option value="pilgrim">{t('role.pilgrim')}</option>
                            <option value="local_guide">{t('role.localGuide')}</option>
                            <option value="manager">{t('role.manager')}</option>
                            <option value="admin">{t('role.admin')}</option>
                        </select>
                    </div>

                    {/* Site - chỉ hiện khi role là manager hoặc local_guide */}
                    {(formData.role === 'manager' || formData.role === 'local_guide') && user?.site_id && (
                        <div>
                            <label className="block text-sm font-medium text-[#8a6d1c] mb-1">
                                {t('userDetail.site')}
                            </label>
                            <div className="w-full px-4 py-2.5 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl flex items-center gap-2">
                                {siteLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
                                        <span className="text-gray-400">{t('modal.loading')}</span>
                                    </>
                                ) : (
                                    <span className="text-gray-900 font-medium">{siteName || user.site_id}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-[#d4af37]/20">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 border border-[#d4af37]/30 text-[#8a6d1c] rounded-xl hover:bg-[#d4af37]/10 transition-colors disabled:opacity-50"
                        >
                            {t('userEdit.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-[#d4af37]/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('userEdit.saving')}
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {t('userEdit.saveChanges')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
