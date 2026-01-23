import React, { useEffect, useState } from 'react';
import {
    X,
    Save,
    Loader2,
    User as UserIcon,
    Crown,
    UserCheck,
    AlertCircle
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import { AdminUser, UpdateUserData } from '../../../types/admin.types';

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
    // Error state - hiển thị lỗi nếu có
    const [error, setError] = useState<string | null>(null);

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
            setError(null);
        }
    }, [user]);

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
            setError(null);

            // Gọi API update user
            const response = await AdminService.updateUser(user.id, formData);

            if (response.success) {
                onSuccess();  // Gọi callback để refresh danh sách
                onClose();    // Đóng modal
            } else {
                setError(response.message || 'Failed to update user');
            }
        } catch (err: any) {
            setError(err?.error?.message || 'Failed to update user');
        } finally {
            setLoading(false);
        }
    };

    // Lấy thông tin role để hiển thị icon và màu
    const getRoleInfo = (role: string) => {
        const roles = {
            admin: { label: 'Admin', icon: Crown, color: 'text-purple-600' },
            manager: { label: 'Manager', icon: UserCheck, color: 'text-blue-600' },
            pilgrim: { label: 'Pilgrim', icon: UserIcon, color: 'text-amber-600' },
            local_guide: { label: 'Local Guide', icon: UserCheck, color: 'text-green-600' }
        };
        return roles[role as keyof typeof roles] || roles.pilgrim;
    };

    // Nếu modal không mở thì không render gì
    if (!isOpen || !user) return null;

    const roleInfo = getRoleInfo(user.role);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop - click để đóng modal */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal container */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <img
                            src={user.avatar_url || 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=50'}
                            alt={user.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Edit User</h2>
                            <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Error message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name || ''}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Nguyen Van A"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Phone
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="0123456789"
                        />
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="role"
                            value={formData.role || 'pilgrim'}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            disabled={user.role === 'admin'}  // Không cho đổi role admin
                        >
                            <option value="pilgrim">Pilgrim</option>
                            <option value="local_guide">Local Guide</option>
                            <option value="manager">Manager</option>
                            {user.role === 'admin' && <option value="admin">Admin</option>}
                        </select>
                        {user.role === 'admin' && (
                            <p className="text-xs text-amber-600 mt-1">
                                ⚠️ Cannot change admin role
                            </p>
                        )}
                    </div>

                    {/* Site ID - chỉ hiện khi role là manager hoặc local_guide */}
                    {(formData.role === 'manager' || formData.role === 'local_guide') && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Site ID
                            </label>
                            <input
                                type="text"
                                name="site_id"
                                value={formData.site_id || ''}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter site UUID"
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
