import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** URL ảnh đầy đủ; khi null/đóng không render nội dung */
  src: string | null;
  alt?: string;
}

/**
 * Overlay toàn màn xem ảnh (portal → body), dùng được cả khi đang mở Dialog khác.
 */
export const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({
  open,
  onOpenChange,
  src,
  alt = '',
}) => {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted || !open || !src) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={t('media.image')}
      onClick={() => onOpenChange(false)}
    >
      <div className="absolute inset-0 bg-black/88 backdrop-blur-sm" aria-hidden />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenChange(false);
        }}
        className="absolute right-4 top-4 z-10 cursor-pointer rounded-full bg-white/10 p-2.5 text-white/90 shadow-md ring-1 ring-white/25 transition-all duration-200 hover:scale-110 hover:bg-white/35 hover:text-white hover:shadow-[0_0_24px_rgba(255,255,255,0.35)] hover:ring-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50 active:scale-95"
        title={t('common.close')}
      >
        <X className="h-7 w-7" strokeWidth={2} />
      </button>

      <div
        className="relative z-[1] flex max-h-[90vh] w-full max-w-5xl items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl ring-1 ring-white/10"
        />
      </div>
    </div>,
    document.body,
  );
};
