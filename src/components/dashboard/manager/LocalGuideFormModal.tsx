import React, { useState, useEffect } from 'react';
import {
    X,
    Loader2,
    User,
    Mail,
    Phone,
    UserPlus,
    Info
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { CreateLocalGuideData } from '../../../types/manager.types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LocalGuideFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const LocalGuideFormModal: React.FC<LocalGuideFormModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const { t } = useLanguage();
    const { showToast } = useToast();

    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setEmail('');
            setFullName('');
            setPhone('');
            setSubmitted(false);
        }
    }, [isOpen]);

    const isValidEmail = (value: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    const validateForm = (): boolean => {
        if (!email.trim()) {
            showToast('error', t('localGuideForm.requiredEmail'));
            return false;
        }
        if (!isValidEmail(email.trim())) {
            showToast('error', t('localGuideForm.invalidEmail'));
            return false;
        }
        if (!fullName.trim()) {
            showToast('error', t('localGuideForm.requiredName'));
            return false;
        }
        if (fullName.trim().length < 2) {
            showToast('error', t('localGuideForm.nameMinLength'));
            return false;
        }
        if (phone.trim() && !/^[0-9]{10,11}$/.test(phone.trim())) {
            showToast('error', t('localGuideForm.invalidPhone'));
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        if (!validateForm()) return;

        try {
            setLoading(true);

            const data: CreateLocalGuideData = {
                email: email.trim(),
                full_name: fullName.trim(),
                ...(phone.trim() && { phone: phone.trim() })
            };

            const response = await ManagerService.createLocalGuide(data);

            if (response.success) {
                showToast('success', t('toast.createGuideSuccess'), t('toast.createGuideSuccessMsg'));
                onSuccess();
                onClose();
            } else {
                showToast('error', t('toast.createGuideFailed'), response.message);
            }
        } catch (error) {
            const err = error as { error?: { statusCode?: number } };
            const statusCode = err?.error?.statusCode;
            const errorMessage = error instanceof Error ? error.message : String(error);

            if (errorMessage?.includes('đã tồn tại') || statusCode === 409) {
                showToast('error', t('toast.createGuideFailed'), t('localGuideForm.emailExists'));
            } else if (statusCode === 400) {
                showToast('error', t('toast.createGuideFailed'), t('localGuideForm.needSiteFirst'));
            } else {
                showToast('error', t('toast.createGuideFailed'), errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open && !loading) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="p-0 overflow-hidden border-[#d4af37]/20 rounded-2xl max-w-md gap-0 outline-none [&>button]:hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37]">
                    <div className="text-white">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <UserPlus className="w-5 h-5" />
                            {t('localGuideForm.title')}
                        </h2>
                        <p className="text-sm opacity-80">
                            {t('localGuideForm.subtitle')}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        disabled={loading}
                        className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">
                        <div className="flex items-start gap-3 p-3 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-xl text-[#8a6d1c] text-sm">
                            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p>{t('localGuideForm.info')}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                {t('localGuideForm.email')} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="localguide@email.com"
                                    disabled={loading}
                                    className={`pl-10 h-11 rounded-xl bg-white ${submitted && (!email.trim() || !isValidEmail(email.trim()))
                                        ? 'border-red-400 bg-red-50'
                                        : 'border-gray-200'
                                        }`}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5">
                                {t('localGuideForm.emailHint')}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                {t('localGuideForm.fullName')} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Nguyen Van A"
                                    disabled={loading}
                                    className={`pl-10 h-11 rounded-xl bg-white ${submitted && !fullName.trim()
                                        ? 'border-red-400 bg-red-50'
                                        : 'border-gray-200'
                                        }`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                {t('localGuideForm.phone')} <span className="text-gray-400">({t('localGuideForm.phoneOptional')})</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="0987654321"
                                    disabled={loading}
                                    className={`pl-10 h-11 rounded-xl bg-white ${submitted && phone.trim() && !/^[0-9]{10,11}$/.test(phone.trim())
                                        ? 'border-red-400 bg-red-50'
                                        : 'border-gray-200'
                                        }`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#d4af37]/20 bg-[#f5f3ee]">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="border-[#d4af37]/30 text-[#8a6d1c] rounded-xl hover:bg-[#d4af37]/10"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl hover:brightness-110 shadow-lg shadow-[#d4af37]/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('localGuideForm.creating')}
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    {t('localGuideForm.createButton')}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
