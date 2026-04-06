import React, { useState } from 'react';
import {
    Sparkles,
    Loader2,
    Palette,
    AlignLeft,
    Globe,
    ChevronDown,
    X,
    CheckCircle2
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { ArticleStyle, ArticleLength } from '../../../types/manager.types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';

interface AIGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (content: string) => void;
    defaultTopic?: string;
    modalTitle?: string;
}

const STYLE_OPTIONS: { value: ArticleStyle; iconKey: string }[] = [
    { value: 'devotional', iconKey: 'devotional' },
    { value: 'informational', iconKey: 'informational' },
    { value: 'historical', iconKey: 'historical' },
    { value: 'youth', iconKey: 'youth' },
];

const LENGTH_OPTIONS: ArticleLength[] = ['short', 'medium', 'long'];



export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
    isOpen,
    onClose,
    onApply,
    defaultTopic = '',
    modalTitle = 'AI Writer'
}) => {
    const { t, language: uiLang } = useLanguage();
    const { showToast } = useToast();

    const [topic, setTopic] = useState(defaultTopic);
    const [additionalContext, setAdditionalContext] = useState('');
    const [outputLanguage, setOutputLanguage] = useState<'vi' | 'en'>(uiLang as 'vi' | 'en');
    const [length, setLength] = useState<ArticleLength>('medium');
    const [style, setStyle] = useState<ArticleStyle>('devotional');

    const [generating, setGenerating] = useState(false);
    const [resultContent, setResultContent] = useState('');

    // Reset when opened
    React.useEffect(() => {
        if (isOpen) {
            setTopic(defaultTopic);
            setAdditionalContext('');
            setResultContent('');
        }
    }, [isOpen, defaultTopic]);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!topic.trim()) {
            showToast('error', t('ai.errorTopicRequired'), t('ai.errorTopicRequiredMsg'));
            return;
        }

        setGenerating(true);
        setResultContent('');

        try {
            const response = await ManagerService.generateArticle({
                topic: topic.trim(),
                additional_context: additionalContext.trim() || undefined,
                language: outputLanguage,
                length,
                style,
            });

            if (response.success && response.data) {
                // Return main content + summary
                const contentText = response.data.content;
                setResultContent(contentText);
                showToast('success', t('ai.generateSuccess'), t('ai.generateSuccessMsg'));
            } else {
                showToast('error', t('ai.generateFailed'), response.message || t('ai.generateFailedMsg'));
            }
        } catch (error) {
            const err = error as { status?: number; message?: string; error?: { message?: string } };
            const status = err?.status;
            const msg = err?.error?.message || err?.message || '';

            if (status === 400) {
                showToast('error', t('ai.error400Title'), msg || t('ai.error400Msg'));
            } else if (status === 403) {
                showToast('error', t('ai.error403Title'), t('ai.error403Msg'));
            } else if (status === 502) {
                showToast('error', t('ai.error502Title'), t('ai.error502Msg'));
            } else if (status === 503) {
                showToast('error', t('ai.error503Title'), t('ai.error503Msg'));
            } else {
                showToast('error', t('ai.generateFailed'), msg || t('ai.generateFailedMsg'));
            }
        } finally {
            setGenerating(false);
        }
    };

    const handleApply = () => {
        onApply(resultContent);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 my-8 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] rounded-t-2xl">
                    <div className="flex items-center gap-3 text-white">
                        <Sparkles className="w-5 h-5 text-white/90" />
                        <h2 className="text-lg font-semibold">{modalTitle}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-5">
                    {/* Topic */}
                    <div>
                        <label className="block text-sm font-semibold text-[#8a6d1c] uppercase tracking-wider mb-1.5">
                            {t('ai.topicLabel')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={t('ai.topicPlaceholder')}
                            className="w-full px-4 py-2.5 bg-[#faf8f3] border border-[#d4af37]/30 rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all font-medium"
                            disabled={generating}
                        />
                    </div>

                    {/* Additional Context */}
                    <div>
                        <label className="block text-sm font-semibold text-[#8a6d1c] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                            {t('ai.contextLabel')}
                            <span className="text-xs font-normal normal-case text-slate-500 bg-[#f5f3ee] px-2 py-0.5 rounded-full">{t('ai.optional')}</span>
                        </label>
                        <textarea
                            value={additionalContext}
                            onChange={(e) => setAdditionalContext(e.target.value)}
                            placeholder={t('ai.contextPlaceholder')}
                            rows={3}
                            className="w-full px-4 py-2.5 bg-[#faf8f3] border border-[#d4af37]/30 rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all resize-none text-sm"
                            disabled={generating}
                        />
                    </div>

                    {/* Quick Options */}
                    <div className="grid grid-cols-3 gap-3">
                        {/* Style */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-[#8a6d1c] uppercase tracking-wider mb-1.5">
                                <Palette className="w-3.5 h-3.5" />
                                {t('ai.styleLabel')}
                            </label>
                            <div className="relative">
                                <select
                                    value={style}
                                    onChange={(e) => setStyle(e.target.value as ArticleStyle)}
                                    disabled={generating}
                                    className="w-full appearance-none px-3 py-2 pr-8 border border-[#d4af37]/30 rounded-xl bg-[#faf8f3] focus:ring-1 focus:ring-[#d4af37] text-sm cursor-pointer"
                                >
                                    {STYLE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{t(`ai.style.${opt.value}`)}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a6d1c] pointer-events-none" />
                            </div>
                        </div>

                        {/* Length */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-[#8a6d1c] uppercase tracking-wider mb-1.5">
                                <AlignLeft className="w-3.5 h-3.5" />
                                {t('ai.lengthLabel')}
                            </label>
                            <div className="relative">
                                <select
                                    value={length}
                                    onChange={(e) => setLength(e.target.value as ArticleLength)}
                                    disabled={generating}
                                    className="w-full appearance-none px-3 py-2 pr-8 border border-[#d4af37]/30 rounded-xl bg-[#faf8f3] focus:ring-1 focus:ring-[#d4af37] text-sm cursor-pointer"
                                >
                                    {LENGTH_OPTIONS.map((len) => (
                                        <option key={len} value={len}>{t(`ai.length.${len}`)}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a6d1c] pointer-events-none" />
                            </div>
                        </div>

                        {/* Language */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-[#8a6d1c] uppercase tracking-wider mb-1.5">
                                <Globe className="w-3.5 h-3.5" />
                                {t('ai.languageLabel')}
                            </label>
                            <div className="relative">
                                <select
                                    value={outputLanguage}
                                    onChange={(e) => setOutputLanguage(e.target.value as 'vi' | 'en')}
                                    disabled={generating}
                                    className="w-full appearance-none px-3 py-2 pr-8 border border-[#d4af37]/30 rounded-xl bg-[#faf8f3] focus:ring-1 focus:ring-[#d4af37] text-sm cursor-pointer"
                                >
                                    <option value="vi">Tiếng Việt</option>
                                    <option value="en">English</option>
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a6d1c] pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Result Area */}
                    {generating ? (
                        <div className="bg-[#f5f3ee] rounded-xl p-8 flex flex-col items-center justify-center border border-[#d4af37]/20">
                            <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin mb-3" />
                            <p className="text-[#8a6d1c] font-medium">{t('ai.aiWorking')}</p>
                            <p className="text-sm text-[#8a6d1c]/80 mt-1 text-center">{t('ai.aiWorkingDesc')}</p>
                        </div>
                    ) : resultContent ? (
                        <div className="space-y-2 animate-fadeIn">
                            <label className="flex items-center justify-between text-sm font-semibold text-[#8a6d1c]">
                                <span>{t('ai.resultTitle')}</span>
                            </label>
                            <textarea
                                value={resultContent}
                                onChange={(e) => setResultContent(e.target.value)}
                                className="w-full h-48 px-4 py-3 bg-[#faf8f3] border border-[#d4af37]/30 rounded-xl focus:ring-1 focus:ring-[#d4af37] transition-all text-sm leading-relaxed"
                            />
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#f5f3ee] border-t border-[#d4af37]/20 rounded-b-2xl">
                    <button
                        onClick={handleGenerate}
                        disabled={generating || !topic.trim()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#d4af37]/30 text-[#8a6d1c] rounded-xl hover:bg-[#faf8f3] transition-colors disabled:opacity-50 font-medium shadow-sm"
                    >
                        <Wand2 className="w-4 h-4" />
                        {resultContent ? t('ai.generateBtn') + ' lại' : t('ai.generateBtn')}
                    </button>

                    {resultContent && (
                        <button
                            onClick={handleApply}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white rounded-xl hover:brightness-110 transition-colors shadow-lg shadow-[#d4af37]/20 font-medium"
                        >
                            {t('common.save')} <CheckCircle2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Internal icon proxy for Wand2 since it's not exported at the top
import { Wand2 } from 'lucide-react';
