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
    Globe
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import { AdminUser } from '../../../types/admin.types';

interface UserDetailModalProps {
    userId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
    userId,
    isOpen,
    onClose
}) => {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && userId) {
            fetchUserDetail();
        } else {
            // Reset state when modal closes
            setUser(null);
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
            } else {
                setError(response.message || 'Failed to load user details');
            }
        } catch (err: any) {
            setError(err?.error?.message || 'Failed to load user details');
        } finally {
            setLoading(false);
        }
    };

    const getRoleInfo = (role: string) => {
        const roles = {
            admin: { label: 'Admin', icon: Crown, color: 'bg-purple-100 text-purple-700', bgGradient: 'from-purple-500 to-indigo-600' },
            manager: { label: 'Manager', icon: UserCheck, color: 'bg-blue-100 text-blue-700', bgGradient: 'from-blue-500 to-cyan-600' },
            pilgrim: { label: 'Pilgrim', icon: UserIcon, color: 'bg-amber-100 text-amber-700', bgGradient: 'from-amber-500 to-orange-600' },
            local_guide: { label: 'Local Guide', icon: UserCheck, color: 'bg-green-100 text-green-700', bgGradient: 'from-green-500 to-emerald-600' }
        };
        return roles[role as keyof typeof roles] || roles.pilgrim;
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
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 my-8 max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex-shrink-0">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
                >
                    <X className="w-5 h-5 text-slate-600" />
                </button>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-80">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                        <p className="text-slate-500">Loading user details...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-80 p-6">
                        <XCircle className="w-12 h-12 text-red-500 mb-4" />
                        <p className="text-red-600 text-center">{error}</p>
                        <button
                            onClick={fetchUserDetail}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
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
                            <h2 className="text-xl font-bold text-slate-900">{user.full_name}</h2>
                            <span className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {user.status === 'active' ? 'Active' : 'Banned'}
                            </span>
                        </div>

                        {/* User details */}
                        <div className="px-6 pb-6 space-y-4 max-h-[40vh] overflow-y-auto">
                            {/* Email */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Email</p>
                                    <p className="text-sm font-medium text-slate-900">{user.email}</p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Phone className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Phone</p>
                                    <p className="text-sm font-medium text-slate-900">{user.phone || '—'}</p>
                                </div>
                            </div>

                            {/* Date of Birth */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <Calendar className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Date of Birth</p>
                                    <p className="text-sm font-medium text-slate-900">{formatDate(user.date_of_birth)}</p>
                                </div>
                            </div>

                            {/* Language */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Globe className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Language</p>
                                    <p className="text-sm font-medium text-slate-900">{user.language === 'vi' ? 'Tiếng Việt' : user.language === 'en' ? 'English' : user.language}</p>
                                </div>
                            </div>

                            {/* Site ID */}
                            {user.site_id && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <MapPin className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Site ID</p>
                                        <p className="text-sm font-medium text-slate-900 truncate max-w-[280px]">{user.site_id}</p>
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            <hr className="border-slate-200" />

                            {/* Dates section */}
                            <div className="grid grid-cols-3 gap-3">
                                {/* Created At */}
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        <p className="text-xs text-slate-500">Created</p>
                                    </div>
                                    <p className="text-xs font-medium text-slate-700">{formatDateTime(user.created_at)}</p>
                                </div>

                                {/* Updated At */}
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        <p className="text-xs text-slate-500">Updated</p>
                                    </div>
                                    <p className="text-xs font-medium text-slate-700">{formatDateTime(user.updated_at)}</p>
                                </div>

                                {/* Verified At */}
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Shield className="w-3 h-3 text-slate-400" />
                                        <p className="text-xs text-slate-500">Verified</p>
                                    </div>
                                    <p className="text-xs font-medium text-slate-700">{formatDateTime(user.verified_at)}</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};
