import React, { useEffect, useState } from 'react';
import {
    X,
    Save,
    Loader2,
    User as UserIcon
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import { AdminUser, UpdateUserData } from '../../../types/admin.types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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
        } catch {
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
        } catch (error) {
            console.error('Update user error:', error);
            const message = error instanceof Error ? error.message : t('common.error');
            showToast('error', t('common.error'), message);
        } finally {
            setLoading(false);
        }
    };

    // Nếu modal không mở thì không render gì
    if (!isOpen || !user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="p-0 overflow-hidden border-[#d4af37]/20 rounded-2xl max-w-md [&>button]:hidden">
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] m-0">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.full_name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white/50"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-[#d4af37] border-2 border-white/50 flex items-center justify-center">
                                    <UserIcon className="w-5 h-5 text-white/90" />
                                </div>
                            )}
                            <div className="text-white text-left">
                                <DialogTitle className="text-lg font-semibold">{t('userEdit.title')}</DialogTitle>
                                <p className="text-sm opacity-80 font-normal">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </DialogHeader>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-[#8a6d1c] mb-1">
                            {t('userEdit.fullName')} <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            name="full_name"
                            value={formData.full_name || ''}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-[#f5f3ee] border-[#d4af37]/30 rounded-xl focus-visible:ring-1 focus-visible:ring-[#d4af37] focus-visible:border-[#d4af37] hover:border-[#d4af37]/50 transition-all h-11"
                            placeholder={t('userEdit.fullNamePlaceholder') || "Nguyen Van A"}
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-[#8a6d1c] mb-1">
                            {t('table.phone')}
                        </label>
                        <Input
                            type="tel"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleInputChange}
                            className="w-full bg-[#f5f3ee] border-[#d4af37]/30 rounded-xl focus-visible:ring-1 focus-visible:ring-[#d4af37] focus-visible:border-[#d4af37] hover:border-[#d4af37]/50 transition-all h-11"
                            placeholder={t('userEdit.phonePlaceholder') || "0123456789"}
                        />
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-medium text-[#8a6d1c] mb-1">
                            {t('userDetail.dateOfBirth')}
                        </label>
                        <Input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth || ''}
                            onChange={handleInputChange}
                            className="w-full bg-[#f5f3ee] border-[#d4af37]/30 rounded-xl focus-visible:ring-1 focus-visible:ring-[#d4af37] focus-visible:border-[#d4af37] hover:border-[#d4af37]/50 transition-all h-11"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-[#8a6d1c] mb-1">
                            {t('table.role')} <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={formData.role || 'pilgrim'}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as AdminUser['role'] }))}
                            disabled
                        >
                            <SelectTrigger className="w-full h-11 bg-[#f5f3ee] border-[#d4af37]/30 rounded-xl disabled:opacity-70">
                                <SelectValue placeholder={t('role.pilgrim')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pilgrim">{t('role.pilgrim')}</SelectItem>
                                <SelectItem value="local_guide">{t('role.localGuide')}</SelectItem>
                                <SelectItem value="manager">{t('role.manager')}</SelectItem>
                                <SelectItem value="admin">{t('role.admin')}</SelectItem>
                            </SelectContent>
                        </Select>
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
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 h-11 border-[#d4af37]/30 text-[#8a6d1c] rounded-xl hover:bg-[#d4af37]/10"
                        >
                            {t('userEdit.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 h-11 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl hover:brightness-110 shadow-lg shadow-[#d4af37]/20"
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
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
