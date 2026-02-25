import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastData {
    id: string;
    type: 'success' | 'error' | 'info';
    title: string;
    message?: string;
}

interface ToastNotificationProps {
    toasts: ToastData[];
    onRemove: (id: string) => void;
}

const ToastItem: React.FC<{ toast: ToastData; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onRemove(toast.id), 300);
        }, 3000);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onRemove(toast.id), 300);
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
    };

    const styles = {
        success: {
            bg: 'linear-gradient(135deg, #1a1610 0%, #2a2216 100%)',
            border: '#d4af37',
            iconColor: '#d4af37',
            titleColor: '#f5e6b8',
            messageColor: '#d4af37cc',
            glow: '0 0 20px rgba(212, 175, 55, 0.15)',
        },
        error: {
            bg: 'linear-gradient(135deg, #1a1014 0%, #2a1620 100%)',
            border: '#ef4444',
            iconColor: '#ef4444',
            titleColor: '#fca5a5',
            messageColor: '#ef4444cc',
            glow: '0 0 20px rgba(239, 68, 68, 0.15)',
        },
        info: {
            bg: 'linear-gradient(135deg, #101418 0%, #162028 100%)',
            border: '#3b82f6',
            iconColor: '#3b82f6',
            titleColor: '#93c5fd',
            messageColor: '#3b82f6cc',
            glow: '0 0 20px rgba(59, 130, 246, 0.15)',
        },
    };

    const s = styles[toast.type];

    return (
        <div
            style={{
                background: s.bg,
                borderLeft: `3px solid ${s.border}`,
                boxShadow: `${s.glow}, 0 10px 40px rgba(0,0,0,0.4)`,
                backdropFilter: 'blur(12px)',
                animation: isExiting ? 'toastSlideOut 0.3s ease-in forwards' : 'toastSlideIn 0.4s ease-out',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                minWidth: '320px',
                maxWidth: '420px',
                position: 'relative' as const,
                overflow: 'hidden',
            }}
        >
            {/* Progress bar */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '2px',
                    background: `linear-gradient(90deg, ${s.border}, transparent)`,
                    animation: 'toastProgress 3s linear forwards',
                    borderRadius: '0 0 12px 12px',
                }}
            />

            {/* Icon */}
            <div style={{ color: s.iconColor, flexShrink: 0, marginTop: '1px' }}>
                {icons[toast.type]}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: s.titleColor, fontWeight: 600, fontSize: '14px', lineHeight: '20px' }}>
                    {toast.title}
                </div>
                {toast.message && (
                    <div style={{ color: s.messageColor, fontSize: '13px', marginTop: '2px', lineHeight: '18px' }}>
                        {toast.message}
                    </div>
                )}
            </div>

            {/* Close button */}
            <button
                onClick={handleClose}
                style={{
                    color: s.iconColor,
                    opacity: 0.5,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    flexShrink: 0,
                    transition: 'opacity 0.2s',
                    lineHeight: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; }}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onRemove }) => {
    if (toasts.length === 0) return null;

    return (
        <>
            {/* Keyframes */}
            <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes toastSlideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(120%); opacity: 0; }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

            {/* Toast container */}
            <div
                style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    zIndex: 99999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    pointerEvents: 'none',
                }}
            >
                {toasts.map((toast) => (
                    <div key={toast.id} style={{ pointerEvents: 'auto' }}>
                        <ToastItem toast={toast} onRemove={onRemove} />
                    </div>
                ))}
            </div>
        </>
    );
};
