import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Save, Loader2, Shield } from 'lucide-react';
import { AuthService } from '../../../services/auth.service';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';

export const SettingsPage: React.FC = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [saving, setSaving] = useState(false);

    const fieldLabelClass =
        'flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500';
    const inputClass =
        'w-full h-11 pl-4 pr-12 rounded-xl text-sm text-slate-900 bg-white border border-[#d4af37]/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/25 focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-colors';

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showToast('error', t('settings.changePassword'), t('settings.errorMismatch'));
            return;
        }

        if (newPassword.length < 6) {
            showToast('error', t('settings.changePassword'), t('settings.errorLength'));
            return;
        }

        try {
            setSaving(true);

            const response = await AuthService.changePassword({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });

            if (response.success) {
                showToast('success', t('settings.title'), t('settings.success'));
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                showToast('error', t('settings.title'), response.error?.message || t('settings.errorFailed'));
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : t('settings.errorFailed');
            showToast('error', t('settings.title'), message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-6xl xl:max-w-7xl mx-auto w-full space-y-4 pb-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{t('settings.title')}</h1>
                <p className="text-slate-600 mt-1 text-sm sm:text-base max-w-2xl leading-snug">{t('settings.subtitle')}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md shadow-[#d4af37]/10 border border-[#d4af37]/25 overflow-hidden">
                <div className="relative overflow-hidden bg-gradient-to-br from-[#5c4a16] via-[#d4af37] to-[#a6892d] px-5 py-5 sm:px-8 sm:py-6">
                    <div className="absolute inset-0 opacity-35 bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,255,255,0.4),transparent_55%)] pointer-events-none" />
                    <div className="absolute -right-20 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />

                    <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/35 bg-white/15 text-white shadow-lg backdrop-blur-sm">
                            <Lock className="w-7 h-7" />
                        </div>
                        <div className="min-w-0 text-center sm:text-left">
                            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight drop-shadow-sm">
                                {t('settings.changePassword')}
                            </h2>
                            <p className="text-sm text-white/85 mt-0.5">{t('settings.changePasswordDesc')}</p>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-5 sm:px-8 sm:py-7 bg-gradient-to-b from-[#faf9f6] to-white">
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 lg:gap-6">
                        <form onSubmit={handleChangePassword} className="xl:col-span-3 space-y-4">
                            <div className="rounded-xl border border-[#d4af37]/12 bg-white p-4 shadow-sm space-y-2">
                                <label htmlFor="settings-current-pw" className={fieldLabelClass}>
                                    <Lock className="w-3.5 h-3.5 text-[#b8962e]" />
                                    {t('settings.currentPassword')}
                                </label>
                                <div className="relative">
                                    <input
                                        id="settings-current-pw"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className={inputClass}
                                        placeholder={t('settings.currentPasswordPlaceholder')}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-[#f5f3ee] hover:text-[#8a6d1c] transition-colors"
                                        aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-xl border border-[#d4af37]/12 bg-white p-4 shadow-sm space-y-2">
                                <label htmlFor="settings-new-pw" className={fieldLabelClass}>
                                    <Lock className="w-3.5 h-3.5 text-[#b8962e]" />
                                    {t('settings.newPassword')}
                                </label>
                                <div className="relative">
                                    <input
                                        id="settings-new-pw"
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className={inputClass}
                                        placeholder={t('settings.newPasswordPlaceholder')}
                                        required
                                        autoComplete="new-password"
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-[#f5f3ee] hover:text-[#8a6d1c] transition-colors"
                                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-xl border border-[#d4af37]/12 bg-white p-4 shadow-sm space-y-2">
                                <label htmlFor="settings-confirm-pw" className={fieldLabelClass}>
                                    <Lock className="w-3.5 h-3.5 text-[#b8962e]" />
                                    {t('settings.confirmPassword')}
                                </label>
                                <div className="relative">
                                    <input
                                        id="settings-confirm-pw"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={inputClass}
                                        placeholder={t('settings.confirmPasswordPlaceholder')}
                                        required
                                        autoComplete="new-password"
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-[#f5f3ee] hover:text-[#8a6d1c] transition-colors"
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-1">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 px-5 h-11 w-full sm:w-auto bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white rounded-xl hover:brightness-105 transition-all disabled:opacity-50 shadow-md shadow-[#d4af37]/25 text-sm font-semibold"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? t('settings.saving') : t('settings.changePasswordBtn')}
                                </button>
                            </div>
                        </form>

                        <aside className="xl:col-span-1">
                            <div className="relative overflow-hidden rounded-2xl border border-amber-200/45 bg-gradient-to-br from-amber-50/95 via-white to-[#faf7ef] shadow-[0_12px_40px_-12px_rgba(138,109,28,0.18),0_4px_16px_-4px_rgba(15,23,42,0.06)] ring-1 ring-amber-100/60 sticky top-4">
                                <div
                                    className="pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-full bg-gradient-to-b from-[#e8c547] via-[#d4af37] to-[#6b5614]"
                                    aria-hidden
                                />
                                <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.22)_0%,transparent_70%)]" />
                                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.85)_0%,transparent_42%,rgba(212,175,55,0.04)_100%)]" />

                                <div className="relative pl-6 pr-5 py-5 sm:pl-7 sm:pr-6 sm:py-6">
                                    <div className="flex items-start gap-3.5 mb-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#d4af37]/25 bg-gradient-to-br from-white to-amber-50/80 text-[#7a6218] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(212,175,55,0.15)]">
                                            <Shield className="w-5 h-5" strokeWidth={2.25} />
                                        </div>
                                        <div className="min-w-0 pt-0.5">
                                            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7a6218]">
                                                {t('settings.tipsTitle')}
                                            </p>
                                            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-amber-800/45">
                                                {t('settings.tipsBadge')}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-[13px] leading-[1.65] text-slate-600 border-t border-amber-200/40 pt-4">
                                        {t('settings.passwordTips')}
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
};
