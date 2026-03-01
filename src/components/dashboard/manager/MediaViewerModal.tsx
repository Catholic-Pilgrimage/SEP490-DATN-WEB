import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Box } from 'lucide-react';
import { Media } from '../../../types/manager.types';
import { useLanguage } from '../../../contexts/LanguageContext';

interface MediaViewerModalProps {
    isOpen: boolean;
    media: Media | null;
    onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
    isOpen,
    media,
    onClose
}) => {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !media || !mounted) return null;

    const isYoutubeUrl = (url: string) => {
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const getYoutubeEmbedUrl = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const videoId = match && match[2].length === 11 ? match[2] : null;
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" onClick={onClose} style={{ zIndex: 9999 }}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

            {/* Close Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                title={t('common.close')}
            >
                <X className="w-8 h-8" />
            </button>

            {/* Content Container */}
            <div
                className="relative z-10 w-full max-w-6xl max-h-[90vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                {media.type === 'video' && isYoutubeUrl(media.url) ? (
                    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                        <iframe
                            src={getYoutubeEmbedUrl(media.url) || ''}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : media.type === 'video' && !isYoutubeUrl(media.url) ? (
                    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl flex items-center justify-center">
                        <video
                            src={media.url}
                            controls
                            className="w-full h-full object-contain"
                            autoPlay
                        />
                    </div>
                ) : media.type === 'image' ? (
                    <img
                        src={media.url}
                        alt={media.caption || 'Media Preview'}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    />
                ) : media.type === 'model_3d' ? (
                    <div className="w-full aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex flex-col items-center justify-center shadow-2xl border border-slate-700">
                        <Box className="w-20 h-20 text-[#d4af37] mb-6 animate-pulse" />
                        <span className="text-white/90 text-xl font-medium mb-4">3D Model Viewer</span>
                        <a
                            href={media.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2.5 bg-[#d4af37] text-white rounded-xl hover:bg-[#c4a133] transition-colors font-medium shadow-lg shadow-[#d4af37]/20"
                        >
                            {t('media.openInNewTab') || 'Mở trong thẻ mới'}
                        </a>
                    </div>
                ) : (
                    <div className="w-full aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
                        <span className="text-white/50">{t('media.unsupportedFormat') || 'Định dạng không được hỗ trợ'}</span>
                    </div>
                )}

                {/* Caption Overlay */}
                {media.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                        <p className="text-white text-center max-w-3xl mx-auto drop-shadow-md">
                            {media.caption}
                        </p>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
