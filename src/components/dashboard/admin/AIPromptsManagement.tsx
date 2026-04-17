import React, { useEffect, useState, useCallback } from 'react';
import {
    Sparkles,
    Edit,
    Loader2,
    RefreshCw,
    Save,
    X,
    AlertCircle,
    CheckCircle,
    Map,
    FileText,
    Star,
    Calendar,
    MessageCircle,
    Globe,
    BookOpen,
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import { AIPrompt, AIPromptKey } from '../../../types/admin.types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { extractErrorMessage } from '../../../lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export const AIPromptsManagement: React.FC = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();

    const [prompts, setPrompts] = useState<AIPrompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Modal state
    const [selectedPrompt, setSelectedPrompt] = useState<AIPrompt | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editDescription, setEditDescription] = useState('');
    const [editInstructionText, setEditInstructionText] = useState('');
    const [saving, setSaving] = useState(false);
    
    // Track if content has changed
    const [hasChanges, setHasChanges] = useState(false);
    const [originalDescription, setOriginalDescription] = useState('');
    const [originalInstructionText, setOriginalInstructionText] = useState('');

    // Fetch prompts
    const fetchPrompts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await AdminService.getAIPrompts();
            if (response.success && response.data) {
                setPrompts(response.data);
            } else {
                setError(response.message || t('aiPrompts.loadError'));
            }
        } catch (err) {
            setError(extractErrorMessage(err, t('aiPrompts.loadError')));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchPrompts();
    }, [fetchPrompts]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchPrompts();
        setRefreshing(false);
        showToast('success', t('toast.refreshSuccess'), t('toast.refreshSuccessMsg'));
    };

    const handleOpenModal = (prompt: AIPrompt, editMode = false) => {
        setSelectedPrompt(prompt);
        setIsEditMode(editMode);
        setEditDescription(prompt.description);
        setEditInstructionText(prompt.instruction_text);
        setOriginalDescription(prompt.description);
        setOriginalInstructionText(prompt.instruction_text);
        setHasChanges(false);
    };

    const handleCloseModal = () => {
        setSelectedPrompt(null);
        setIsEditMode(false);
        setEditDescription('');
        setEditInstructionText('');
        setOriginalDescription('');
        setOriginalInstructionText('');
        setHasChanges(false);
    };

    const handleEnterEditMode = () => {
        setIsEditMode(true);
        setHasChanges(false);
    };

    const handleDescriptionChange = (value: string) => {
        setEditDescription(value);
        setHasChanges(value !== originalDescription || editInstructionText !== originalInstructionText);
    };

    const handleInstructionChange = (value: string) => {
        setEditInstructionText(value);
        setHasChanges(editDescription !== originalDescription || value !== originalInstructionText);
    };

    const handleSave = async () => {
        if (!selectedPrompt) return;

        try {
            setSaving(true);
            const response = await AdminService.updateAIPrompt(
                selectedPrompt.prompt_key as AIPromptKey,
                {
                    instruction_text: editInstructionText,
                    description: editDescription,
                }
            );

            if (response.success) {
                showToast('success', t('aiPrompts.updateSuccess'), t('aiPrompts.updateSuccessMsg'));
                await fetchPrompts();
                handleCloseModal();
            } else {
                showToast('error', t('aiPrompts.updateFailed'), response.message || t('aiPrompts.updateFailedMsg'));
            }
        } catch (err) {
            showToast('error', t('aiPrompts.updateFailed'), extractErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const getPromptIcon = (key: string) => {
        const icons: Record<string, React.ElementType> = {
            route: Map,
            article: FileText,
            review_summary: Star,
            events: Calendar,
            prayer: BookOpen,
            translation_post_vi_en: Globe,
            translation_comment_vi_en: MessageCircle,
        };
        return icons[key] || Sparkles;
    };

    const getPromptIconColor = (key: string) => {
        const colors: Record<string, string> = {
            route: 'from-blue-500 to-blue-600',
            article: 'from-purple-500 to-purple-600',
            review_summary: 'from-amber-500 to-amber-600',
            events: 'from-green-500 to-green-600',
            prayer: 'from-rose-500 to-rose-600',
            translation_post_vi_en: 'from-cyan-500 to-cyan-600',
            translation_comment_vi_en: 'from-indigo-500 to-indigo-600',
        };
        return colors[key] || 'from-[#8a6d1c] to-[#d4af37]';
    };

    return (
        <div className="h-full flex flex-col p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] shadow-lg shadow-[#d4af37]/25 ring-4 ring-[#d4af37]/10">
                        <Sparkles className="h-7 w-7 text-white" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            {t('aiPrompts.title')}
                        </h1>
                        <p className="mt-1 max-w-xl text-sm text-slate-600 sm:text-base">
                            {t('aiPrompts.subtitle')}
                        </p>
                    </div>
                </div>
                <Button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading || refreshing}
                    className="h-11 px-6 gap-2 rounded-xl bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white shadow-md shadow-[#d4af37]/25 hover:brightness-110 disabled:opacity-70"
                >
                    <RefreshCw className={`h-5 w-5 ${loading || refreshing ? 'animate-spin' : ''}`} />
                    {t('common.refresh')}
                </Button>
            </div>

            {/* Error */}
            {error && (
                <Card className="mb-6 rounded-xl border-red-200 bg-red-50">
                    <CardContent className="flex items-center gap-2 p-4 text-red-600">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span>{error}</span>
                    </CardContent>
                </Card>
            )}

            {/* Loading */}
            {loading ? (
                <Card className="flex flex-1 items-center justify-center rounded-2xl border-[#d4af37]/20">
                    <CardContent className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
                    </CardContent>
                </Card>
            ) : (
                /* Prompts Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prompts.map((prompt) => {
                        const PromptIcon = getPromptIcon(prompt.prompt_key);
                        const iconColor = getPromptIconColor(prompt.prompt_key);
                        
                        return (
                            <Card
                                key={prompt.prompt_key}
                                className="group overflow-hidden rounded-2xl border-[#d4af37]/20 hover:border-[#d4af37] hover:shadow-xl hover:shadow-[#d4af37]/20 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                                onClick={() => handleOpenModal(prompt)}
                            >
                                <CardContent className="p-5">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${iconColor} shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300`}>
                                                <PromptIcon className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 text-sm group-hover:text-[#8a6d1c] transition-colors">
                                                    {prompt.prompt_key}
                                                </h3>
                                                <span 
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        prompt.source === 'db'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}
                                                    title={prompt.source === 'db' ? t('aiPrompts.customTooltip') : t('aiPrompts.defaultTooltip')}
                                                >
                                                    {prompt.source === 'db' ? (
                                                        <>
                                                            <CheckCircle className="w-3 h-3" />
                                                            {t('aiPrompts.custom')}
                                                        </>
                                                    ) : (
                                                        t('aiPrompts.default')
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenModal(prompt, true);
                                            }}
                                            className="h-9 w-9 p-0 text-[#8a6d1c] hover:bg-[#d4af37]/20 hover:text-[#8a6d1c] opacity-60 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                                            title={t('aiPrompts.editPrompt')}
                                        >
                                            <Edit className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    {/* Description */}
                                    <p className="text-base font-semibold text-slate-800 mb-3 line-clamp-2 leading-relaxed">
                                        {prompt.description}
                                    </p>

                                    {/* Instruction Preview */}
                                    <div className="bg-gradient-to-br from-[#f5f3ee] to-[#faf9f6] rounded-lg p-3 mb-3 border border-[#d4af37]/20 group-hover:border-[#d4af37]/40 transition-colors">
                                        <p className="text-xs text-slate-600 font-mono line-clamp-3 leading-relaxed">
                                            {prompt.instruction_text}
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" />
                                            {t('aiPrompts.version')} {prompt.version}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            {prompt.instruction_text.length} {t('aiPrompts.chars')}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Modal (View/Edit) */}
            <Dialog open={selectedPrompt !== null} onOpenChange={(open) => { if (!open) handleCloseModal(); }}>
                <DialogContent className="p-0 overflow-hidden border-[#d4af37]/20 rounded-2xl max-w-4xl max-h-[90vh] flex flex-col gap-0 outline-none [&>button]:hidden">
                    <DialogHeader className="px-6 py-4 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] m-0">
                        <div className="flex items-center justify-between w-full">
                            <div className="text-white text-left">
                                <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                                    {selectedPrompt && React.createElement(getPromptIcon(selectedPrompt.prompt_key), { className: "w-6 h-6" })}
                                    {isEditMode ? t('aiPrompts.editTitle') : t('aiPrompts.viewTitle')}: {selectedPrompt?.prompt_key}
                                </DialogTitle>
                                <p className="text-sm opacity-80 font-normal">
                                    {t('aiPrompts.version')} {selectedPrompt?.version} • {selectedPrompt?.source === 'db' ? t('aiPrompts.custom') : t('aiPrompts.default')}
                                </p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </DialogHeader>

                    <div className="p-6 overflow-y-auto space-y-4">
                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('aiPrompts.description')}
                            </label>
                            {isEditMode ? (
                                <input
                                    type="text"
                                    value={editDescription}
                                    onChange={(e) => handleDescriptionChange(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-[#d4af37]/30 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                                    placeholder={t('aiPrompts.descriptionPlaceholder')}
                                />
                            ) : (
                                <div className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700">
                                    {selectedPrompt?.description}
                                </div>
                            )}
                        </div>

                        {/* Instruction Text */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('aiPrompts.instructionText')}
                            </label>
                            {isEditMode ? (
                                <textarea
                                    value={editInstructionText}
                                    onChange={(e) => handleInstructionChange(e.target.value)}
                                    rows={20}
                                    className="w-full px-4 py-3 border border-[#d4af37]/30 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent resize-none font-mono text-sm"
                                    placeholder={t('aiPrompts.instructionPlaceholder')}
                                />
                            ) : (
                                <div className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-mono text-sm text-slate-700 whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                                    {selectedPrompt?.instruction_text}
                                </div>
                            )}
                            <p className="mt-2 text-xs text-slate-500">
                                {isEditMode ? editInstructionText.length : selectedPrompt?.instruction_text.length} {t('aiPrompts.characters')}
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-3 px-6 py-4 border-t border-[#d4af37]/20 bg-[#f5f3ee]">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloseModal}
                            disabled={saving}
                            className="flex-1 h-11 border-[#d4af37]/30 text-[#8a6d1c] rounded-xl hover:bg-[#d4af37]/10"
                        >
                            {isEditMode ? t('common.cancel') : t('common.close')}
                        </Button>
                        {!isEditMode ? (
                            <Button
                                type="button"
                                onClick={handleEnterEditMode}
                                className="flex-1 h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl hover:brightness-110 transition-all shadow-none"
                            >
                                <Edit className="w-4 h-4" />
                                {t('aiPrompts.editPrompt')}
                            </Button>
                        ) : hasChanges && (
                            <Button
                                type="button"
                                onClick={handleSave}
                                disabled={saving || !editInstructionText.trim()}
                                className="flex-1 h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl hover:brightness-110 transition-all disabled:opacity-50 shadow-none"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t('aiPrompts.saving')}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        {t('aiPrompts.saveChanges')}
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
