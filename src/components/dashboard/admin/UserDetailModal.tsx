import React, { useEffect, useState } from 'react';
import {
    X,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Shield,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    User as UserIcon,
    Crown,
    UserCheck,
    Globe,
    Edit2
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import { AdminUser } from '../../../types/admin.types';
import { useLanguage } from '../../../contexts/LanguageContext';

interface UserDetailModalProps {
    userId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: (user: AdminUser) => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
    userId,
    isOpen,
    onClose,
    onEdit
}) => {
    const { t } = useLanguage();
    const [user, setUser] = useState<AdminUser | null>(null);
    const [siteName, setSiteName] = useState<string | null>(null);
    const [siteLoading, setSiteLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && userId) {
            fetchUserDetail();
        } else {
            // Reset state when modal closes
            setUser(null);
            setSiteName(null);
            setError(null);
        }
    }, [isOpen, userId]);

    const fetchUserDetail = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);
            const response = await AdminService.getUserById(userId);

            if (response.success && response.data) {
                setUser(response.data);
                // Fetch site name if user has site_id
                if (response.data.site_id) {
                    fetchSiteName(response.data.site_id);
                }
            } else {
                setError(response.message || 'Failed to load user details');
            }
        } catch (err: any) {
            setError(err?.error?.message || 'Failed to load user details');
        } finally {
            setLoading(false);
        }
    };

    const fetchSiteName = async (siteId: string) => {
        try {
            setSiteLoading(true);
            const response = await AdminService.getSiteById(siteId);
            if (response.success && response.data) {
                setSiteName(response.data.name);
            }
        } catch (err) {
            // Fallback to site_id if fetch fails
            setSiteName(null);
        } finally {
            setSiteLoading(false);
        }
    };

    const getRoleInfo = (role: string) => {
        const roles = {
            admin: { labelKey: 'role.admin', icon: Crown, color: 'bg-purple-100 text-purple-700', bgGradient: 'from-[#8a6d1c] to-[#d4af37]' },
            manager: { labelKey: 'role.manager', icon: UserCheck, color: 'bg-blue-100 text-blue-700', bgGradient: 'from-[#8a6d1c] to-[#d4af37]' },
            pilgrim: { labelKey: 'role.pilgrim', icon: UserIcon, color: 'bg-amber-100 text-amber-700', bgGradient: 'from-[#8a6d1c] to-[#d4af37]' },
            local_guide: { labelKey: 'role.localGuide', icon: UserCheck, color: 'bg-green-100 text-green-700', bgGradient: 'from-[#8a6d1c] to-[#d4af37]' }
        };
        const config = roles[role as keyof typeof roles] || roles.pilgrim;
        return { ...config, label: t(config.labelKey) };
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    const roleInfo = user ? getRoleInfo(user.role) : null;
    const RoleIcon = roleInfo?.icon || UserIcon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-[#d4af37]/20 flex-shrink-0">
                {/* Actions container (Close) */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110 border border-[#d4af37]/20"
                    >
                        <X className="w-5 h-5 text-[#8a6d1c]" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-80">
                        <Loader2 className="w-10 h-10 animate-spin text-[#d4af37] mb-4" />
                        <p className="text-gray-500">{t('modal.loading')}</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-80 p-6">
                        <XCircle className="w-12 h-12 text-red-500 mb-4" />
                        <p className="text-red-600 text-center">{error}</p>
                        <button
                            onClick={fetchUserDetail}
                            className="mt-4 px-4 py-2 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-lg hover:brightness-110 transition-all shadow-lg shadow-[#d4af37]/20"
                        >
                            {t('modal.retry')}
                        </button>
                    </div>
                ) : user ? (
                    <>
                        {/* Header with gradient background */}
                        <div className={`bg-gradient-to-r ${roleInfo?.bgGradient} p-6 pb-16`}>
                            <div className="flex items-center gap-2 text-white/90">
                                <RoleIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">{roleInfo?.label}</span>
                            </div>
                        </div>

                        {/* Avatar - overlapping header */}
                        <div className="flex justify-center -mt-12">
                            <div className="relative">
                                <img
                                    src={user.avatar_url || 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150'}
                                    alt={user.full_name}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                                />
                                <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'} border-2 border-white`}>
                                    {user.status === 'active' ? (
                                        <CheckCircle className="w-3 h-3 text-white" />
                                    ) : (
                                        <XCircle className="w-3 h-3 text-white" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* User name and status */}
                        <div className="text-center px-6 pt-3 pb-4">
                            <div className="flex items-center justify-center gap-2">
                                <h2 className="text-xl font-bold text-[#8a6d1c]">{user.full_name}</h2>
                                {onEdit && user && (
                                    <button
                                        onClick={() => {
                                            onClose();
                                            onEdit(user);
                                        }}
                                        className="p-1.5 bg-[#f5f3ee] hover:bg-[#d4af37]/20 rounded-full transition-colors text-[#8a6d1c]/70 hover:text-[#8a6d1c]"
                                        title={t('common.edit')}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <span className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {user.status === 'active' ? t('status.active') : t('status.banned')}
                            </span>
                        </div>

                        <div className="px-6 pb-6 space-y-4 max-h-[40vh] overflow-y-auto">
                            {/* Email */}
                            <div className="flex items-center gap-3 p-3 bg-[#f5f3ee] rounded-xl border border-[#d4af37]/10">
                                <div className="p-2 bg-[#d4af37]/20 rounded-lg">
                                    <Mail className="w-4 h-4 text-[#8a6d1c]" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('table.email')}</p>
                                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-3 p-3 bg-[#f5f3ee] rounded-xl border border-[#d4af37]/10">
                                <div className="p-2 bg-[#d4af37]/20 rounded-lg">
                                    <Phone className="w-4 h-4 text-[#8a6d1c]" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('table.phone')}</p>
                                    <p className="text-sm font-medium text-gray-900">{user.phone || '—'}</p>
                                </div>
                            </div>

                            {/* Date of Birth */}
                            <div className="flex items-center gap-3 p-3 bg-[#f5f3ee] rounded-xl border border-[#d4af37]/10">
                                <div className="p-2 bg-[#d4af37]/20 rounded-lg">
                                    <Calendar className="w-4 h-4 text-[#8a6d1c]" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('userDetail.dateOfBirth')}</p>
                                    <p className="text-sm font-medium text-gray-900">{formatDate(user.date_of_birth)}</p>
                                </div>
                            </div>

                            {/* Language */}
                            <div className="flex items-center gap-3 p-3 bg-[#f5f3ee] rounded-xl border border-[#d4af37]/10">
                                <div className="p-2 bg-[#d4af37]/20 rounded-lg">
                                    <Globe className="w-4 h-4 text-[#8a6d1c]" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('userDetail.language')}</p>
                                    <p className="text-sm font-medium text-gray-900">{user.language === 'vi' ? 'Tiếng Việt' : user.language === 'en' ? 'English' : user.language}</p>
                                </div>
                            </div>

                            {/* Site */}
                            {user.site_id && (
                                <div className="flex items-center gap-3 p-3 bg-[#f5f3ee] rounded-xl border border-[#d4af37]/10">
                                    <div className="p-2 bg-[#d4af37]/20 rounded-lg">
                                        <MapPin className="w-4 h-4 text-[#8a6d1c]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500">{t('userDetail.site')}</p>
                                        {siteLoading ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-3 h-3 animate-spin text-[#d4af37]" />
                                                <span className="text-sm text-gray-400">{t('modal.loading')}</span>
                                            </div>
                                        ) : (
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {siteName || user.site_id}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            <hr className="border-[#d4af37]/20" />

                            {/* Dates section */}
                            <div className="grid grid-cols-3 gap-3">
                                {/* Created At */}
                                <div className="p-3 bg-[#f5f3ee] rounded-xl border border-[#d4af37]/10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-3 h-3 text-[#8a6d1c]/50" />
                                        <p className="text-xs text-gray-500">{t('userDetail.created')}</p>
                                    </div>
                                    <p className="text-xs font-medium text-gray-700">{formatDateTime(user.created_at)}</p>
                                </div>

                                {/* Updated At */}
                                <div className="p-3 bg-[#f5f3ee] rounded-xl border border-[#d4af37]/10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-3 h-3 text-[#8a6d1c]/50" />
                                        <p className="text-xs text-gray-500">{t('userDetail.updated')}</p>
                                    </div>
                                    <p className="text-xs font-medium text-gray-700">{formatDateTime(user.updated_at)}</p>
                                </div>

                                {/* Verified At */}
                                <div className="p-3 bg-[#f5f3ee] rounded-xl border border-[#d4af37]/10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Shield className="w-3 h-3 text-[#8a6d1c]/50" />
                                        <p className="text-xs text-gray-500">{t('userDetail.verified')}</p>
                                    </div>
                                    <p className="text-xs font-medium text-gray-700">{formatDateTime(user.verified_at)}</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};
