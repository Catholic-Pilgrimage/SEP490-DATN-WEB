import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Save, Loader2, CheckCircle } from 'lucide-react';
import { AuthService } from '../../../services/auth.service';
import { useLanguage } from '../../../contexts/LanguageContext';

export const SettingsPage: React.FC = () => {
    const { t } = useLanguage();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError(t('settings.errorMismatch'));
            return;
        }

        if (newPassword.length < 6) {
            setError(t('settings.errorLength'));
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const response = await AuthService.changePassword({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });

            if (response.success) {
                setSuccess(t('settings.success'));
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(response.error?.message || t('settings.errorFailed'));
            }
        } catch (err: any) {
            setError(err?.error?.message || t('settings.errorFailed'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-[#8a6d1c]">{t('settings.title')}</h1>
                    <p className="text-gray-500 mt-1">{t('settings.subtitle')}</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Change Password Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#d4af37]/20 overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#d4af37]/10 bg-[#f5f3ee]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#d4af37]/20 rounded-xl">
                                <Lock className="w-5 h-5 text-[#8a6d1c]" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">{t('settings.changePassword')}</h2>
                                <p className="text-sm text-slate-500">{t('settings.changePasswordDesc')}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 justify-self-start text-sm shadow-sm w-full">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 flex items-center gap-2 text-sm shadow-sm w-full">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                {success}
                            </div>
                        )}

                        {/* Current Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{t('settings.currentPassword')}</label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-[#d4af37]/30 rounded-xl focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all focus:outline-none hover:border-[#d4af37]/50 bg-white"
                                    placeholder={t('settings.currentPasswordPlaceholder')}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#8a6d1c] transition-colors"
                                >
                                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{t('settings.newPassword')}</label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-[#d4af37]/30 rounded-xl focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all focus:outline-none hover:border-[#d4af37]/50 bg-white"
                                    placeholder={t('settings.newPasswordPlaceholder')}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#8a6d1c] transition-colors"
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{t('settings.confirmPassword')}</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-[#d4af37]/30 rounded-xl focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all focus:outline-none hover:border-[#d4af37]/50 bg-white"
                                    placeholder={t('settings.confirmPasswordPlaceholder')}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#8a6d1c] transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-[#d4af37]/20 border border-[#d4af37]/50"
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {saving ? t('settings.saving') : t('settings.changePasswordBtn')}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};
