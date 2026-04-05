import React, { useEffect, useState, useRef } from 'react';
import { User, Mail, Phone, Calendar, Clock, Camera, Save, Loader2, X, Edit3, Globe, CircleUserRound } from 'lucide-react';
import { AuthService } from '../../../services/auth.service';
import { UserProfile } from '../../../types/auth.types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';

interface ProfilePageProps {
    /** Cập nhật user toàn cục (TopBar, Sidebar) sau khi lưu hồ sơ thành công */
    onProfileUpdated?: (profile: UserProfile) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onProfileUpdated }) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Edit form state
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [language, setLanguage] = useState('vi');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProfile();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await AuthService.getProfile();
            if (response.success && response.data) {
                setProfile(response.data);
                // Initialize form with current values
                setFullName(response.data.full_name || '');
                setPhone(response.data.phone || '');
                setDateOfBirth(response.data.date_of_birth || '');
                setLanguage(response.data.language || 'vi');
            } else {
                const msg = response.message || t('profile.loadError');
                setError(msg);
                showToast('error', t('profile.title'), msg);
            }
        } catch {
            const msg = t('profile.loadError');
            setError(msg);
            showToast('error', t('profile.title'), msg);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const response = await AuthService.updateProfile({
                full_name: fullName,
                phone: phone || undefined,
                date_of_birth: dateOfBirth || undefined,
                language: language,
                avatar: avatarFile || undefined,
            });

            if (response.success && response.data) {
                setProfile(response.data);
                onProfileUpdated?.(response.data);
                setIsEditing(false);
                setAvatarFile(null);
                setAvatarPreview(null);
                showToast('success', t('profile.title'), t('profile.success'));
            } else {
                showToast('error', t('profile.title'), response.message || t('profile.error'));
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : t('profile.error');
            showToast('error', t('profile.title'), message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setFullName(profile.full_name || '');
            setPhone(profile.phone || '');
            setDateOfBirth(profile.date_of_birth || '');
            setLanguage(profile.language || 'vi');
            setAvatarFile(null);
            setAvatarPreview(null);
        }
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center justify-center min-h-[320px] bg-white rounded-2xl border border-[#d4af37]/20 shadow-sm overflow-hidden">
                    <div className="w-full h-2 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c]" />
                    <div className="flex flex-col items-center gap-4 py-16 px-6">
                        <div className="p-4 rounded-2xl bg-[#f5f3ee] border border-[#d4af37]/20">
                            <Loader2 className="w-10 h-10 animate-spin text-[#d4af37]" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">{t('profile.title')}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="max-w-6xl xl:max-w-7xl mx-auto w-full">
                <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50 to-white p-8 text-center shadow-sm">
                    <p className="text-rose-700 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return t('profile.notProvided');
        return new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const displayAvatar = avatarPreview || profile.avatar_url;

    const fieldLabelClass = 'flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500';
    const inputReadClass =
        'w-full h-11 px-4 rounded-xl text-sm text-slate-800 bg-[#faf8f4] border border-[#d4af37]/15 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] focus:outline-none';
    const inputEditClass =
        'w-full h-11 px-4 rounded-xl text-sm text-slate-900 bg-white border border-[#d4af37]/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/25 focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-colors';

    return (
        <div className="max-w-6xl xl:max-w-7xl mx-auto w-full space-y-4 pb-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{t('profile.title')}</h1>
                <p className="text-slate-600 mt-1 text-sm sm:text-base max-w-2xl leading-snug">{t('profile.subtitle')}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md shadow-[#d4af37]/10 border border-[#d4af37]/25 overflow-hidden">
                <div className="relative overflow-hidden bg-gradient-to-br from-[#5c4a16] via-[#d4af37] to-[#a6892d] px-5 py-5 sm:px-8 sm:py-6">
                    <div className="absolute inset-0 opacity-35 bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,255,255,0.4),transparent_55%)] pointer-events-none" />
                    <div className="absolute -right-20 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />

                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
                            <div className="relative shrink-0 mx-auto sm:mx-0">
                                {displayAvatar ? (
                                    <img
                                        src={displayAvatar}
                                        alt={profile.full_name}
                                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-white/90 object-cover shadow-lg shadow-black/20"
                                    />
                                ) : (
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-white/90 bg-white/20 flex items-center justify-center shadow-lg shadow-black/20 backdrop-blur-sm">
                                        <User className="w-10 h-10 sm:w-11 sm:h-11 text-white" />
                                    </div>
                                )}
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#6b5420] shadow-md hover:bg-[#faf8f4] transition-colors ring-2 ring-white/80"
                                        aria-label="Change avatar"
                                    >
                                        <Camera className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </div>
                            <div className="min-w-0 text-center sm:text-left">
                                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-sm truncate">
                                    {profile.full_name}
                                </h2>
                                <p className="text-sm text-white/85 mt-0.5 truncate">{profile.email}</p>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2.5">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/35 backdrop-blur-sm">
                                        {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/35 backdrop-blur-sm">
                                        {profile.status === 'active'
                                            ? t('common.active')
                                            : profile.status?.toLowerCase() === 'banned'
                                              ? t('status.banned')
                                              : t('common.inactive')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full lg:w-auto lg:justify-end">
                            {isEditing ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="inline-flex items-center justify-center gap-2 px-4 h-10 border border-white/40 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors text-sm font-medium backdrop-blur-sm"
                                    >
                                        <X className="w-4 h-4" />
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="inline-flex items-center justify-center gap-2 px-4 h-10 bg-white text-[#5c4a16] rounded-xl hover:bg-[#faf8f4] transition-all disabled:opacity-50 shadow-md text-sm font-semibold"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {saving ? `${t('common.save')}…` : t('common.save')}
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex items-center justify-center gap-2 px-4 h-10 bg-white text-[#5c4a16] rounded-xl hover:bg-[#faf8f4] transition-all shadow-md text-sm font-semibold w-full sm:w-auto"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    {t('profile.editProfile')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-5 py-5 sm:px-8 sm:py-6 bg-gradient-to-b from-[#faf9f6] to-white">
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-5">
                        <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        <div className="rounded-xl border border-[#d4af37]/12 bg-white p-4 shadow-sm space-y-2">
                            <label className={fieldLabelClass}>
                                <Mail className="w-3.5 h-3.5 text-[#b8962e]" />
                                {t('profile.email')}
                            </label>
                            <input type="email" value={profile.email} readOnly className={inputReadClass} />
                        </div>

                        <div className="rounded-xl border border-[#d4af37]/12 bg-white p-4 shadow-sm space-y-2">
                            <label className={fieldLabelClass}>
                                <Phone className="w-3.5 h-3.5 text-[#b8962e]" />
                                {t('profile.phone')}
                            </label>
                            <input
                                type="tel"
                                value={isEditing ? phone : profile.phone || ''}
                                onChange={(e) => setPhone(e.target.value)}
                                readOnly={!isEditing}
                                placeholder={isEditing ? t('profile.phonePlaceholder') : undefined}
                                className={isEditing ? inputEditClass : `${inputReadClass} ${!profile.phone ? 'text-slate-400 italic' : ''}`}
                            />
                            {!isEditing && !profile.phone && (
                                <p className="text-xs text-slate-400 pt-0.5">{t('profile.notProvided')}</p>
                            )}
                        </div>

                        <div className="rounded-xl border border-[#d4af37]/12 bg-white p-4 shadow-sm space-y-2">
                            <label className={fieldLabelClass}>
                                <User className="w-3.5 h-3.5 text-[#b8962e]" />
                                {t('profile.fullName')}
                            </label>
                            <input
                                type="text"
                                value={isEditing ? fullName : profile.full_name}
                                onChange={(e) => setFullName(e.target.value)}
                                readOnly={!isEditing}
                                placeholder={t('profile.namePlaceholder')}
                                className={isEditing ? inputEditClass : inputReadClass}
                            />
                        </div>

                        <div className="rounded-xl border border-[#d4af37]/12 bg-white p-4 shadow-sm space-y-2">
                            <label className={fieldLabelClass}>
                                <Globe className="w-3.5 h-3.5 text-[#b8962e]" />
                                {t('profile.language')}
                            </label>
                            {isEditing ? (
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className={`${inputEditClass} cursor-pointer`}
                                >
                                    <option value="vi">Tiếng Việt</option>
                                    <option value="en">English</option>
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={profile.language === 'en' ? 'English' : 'Tiếng Việt'}
                                    readOnly
                                    className={inputReadClass}
                                />
                            )}
                        </div>

                        <div className="rounded-xl border border-[#d4af37]/12 bg-white p-4 shadow-sm space-y-2">
                            <label className={fieldLabelClass}>
                                <Calendar className="w-3.5 h-3.5 text-[#b8962e]" />
                                {t('profile.dateOfBirth')}
                            </label>
                            {isEditing ? (
                                <input
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                    className={inputEditClass}
                                />
                            ) : (
                                <input type="text" value={formatDate(profile.date_of_birth)} readOnly className={inputReadClass} />
                            )}
                        </div>

                        <div className="rounded-xl border border-[#d4af37]/12 bg-white p-4 shadow-sm space-y-2">
                            <label className={fieldLabelClass}>
                                <Clock className="w-3.5 h-3.5 text-[#b8962e]" />
                                {t('profile.accountCreated')}
                            </label>
                            <input type="text" value={formatDate(profile.created_at)} readOnly className={inputReadClass} />
                        </div>
                        </div>

                        <aside className="xl:col-span-1 flex flex-col gap-3">
                            <div className="relative overflow-hidden rounded-2xl border border-amber-200/45 bg-gradient-to-br from-amber-50/95 via-white to-[#faf7ef] shadow-[0_12px_40px_-12px_rgba(138,109,28,0.18),0_4px_16px_-4px_rgba(15,23,42,0.06)] ring-1 ring-amber-100/60 xl:sticky xl:top-4">
                                <div
                                    className="pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-full bg-gradient-to-b from-[#e8c547] via-[#d4af37] to-[#6b5614]"
                                    aria-hidden
                                />
                                <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.22)_0%,transparent_70%)]" />
                                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.85)_0%,transparent_42%,rgba(212,175,55,0.04)_100%)]" />

                                <div className="relative pl-6 pr-5 py-5 sm:pl-7 sm:pr-6 sm:py-6">
                                    <div className="flex items-start gap-3.5 mb-5">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#d4af37]/25 bg-gradient-to-br from-white to-amber-50/80 text-[#7a6218] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(212,175,55,0.15)]">
                                            <CircleUserRound className="w-5 h-5" strokeWidth={2.25} />
                                        </div>
                                        <div className="min-w-0 pt-0.5">
                                            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7a6218]">
                                                {t('profile.summaryTitle')}
                                            </p>
                                            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-amber-800/45">
                                                {t('profile.summaryBadge')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="border-t border-amber-200/40 pt-4">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 mb-2">
                                            {t('profile.lastUpdated')}
                                        </p>
                                        <p className="text-[15px] font-semibold text-slate-800 leading-snug tracking-tight">
                                            {formatDate(profile.updated_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
};
