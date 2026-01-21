import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, Clock, Camera, Save, Loader2 } from 'lucide-react';
import { AuthService } from '../../../services/auth.service';
import { UserProfile } from '../../../types/auth.types';

export const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await AuthService.getProfile();
                if (response.success && response.data) {
                    setProfile(response.data);
                } else {
                    setError(response.message || 'Failed to load profile');
                }
            } catch (err) {
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not provided';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-700';
            case 'inactive':
                return 'bg-gray-100 text-gray-700';
            case 'banned':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'bg-purple-100 text-purple-700';
            case 'manager':
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
                <p className="text-slate-600 mt-1">View and manage your account information</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Cover & Avatar */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="relative">
                            <img
                                src={profile.avatar_url || 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150'}
                                alt={profile.full_name}
                                className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-lg"
                            />
                            <button className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Profile Info */}
                <div className="pt-16 px-8 pb-8">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{profile.full_name}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(profile.role)}`}>
                                    {profile.role}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(profile.status)}`}>
                                    {profile.status}
                                </span>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Mail className="w-4 h-4 text-slate-400" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={profile.email}
                                readOnly
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Phone className="w-4 h-4 text-slate-400" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={profile.phone || 'Not provided'}
                                readOnly
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                            />
                        </div>

                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <User className="w-4 h-4 text-slate-400" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={profile.full_name}
                                readOnly
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                            />
                        </div>

                        {/* Language */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <User className="w-4 h-4 text-slate-400" />
                                Language
                            </label>
                            <input
                                type="text"
                                value={profile.language === 'vi' ? 'Tiếng Việt' : 'English'}
                                readOnly
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                            />
                        </div>

                        {/* Date of Birth */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                Date of Birth
                            </label>
                            <input
                                type="text"
                                value={formatDate(profile.date_of_birth)}
                                readOnly
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                            />
                        </div>

                        {/* Account Created */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Clock className="w-4 h-4 text-slate-400" />
                                Account Created
                            </label>
                            <input
                                type="text"
                                value={formatDate(profile.created_at)}
                                readOnly
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
