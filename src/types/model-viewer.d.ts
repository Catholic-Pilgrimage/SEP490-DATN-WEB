import type * as React from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            > & {
                src?: string;
                alt?: string;
                poster?: string;
                loading?: 'auto' | 'eager' | 'lazy';
                reveal?: 'auto' | 'interaction' | 'manual';
                autoplay?: boolean | string;
                ar?: boolean | string;
                'ar-modes'?: string;
                'camera-controls'?: boolean | string;
                'auto-rotate'?: boolean | string;
                'shadow-intensity'?: number | string;
                exposure?: number | string;
                'environment-image'?: string;
                'interaction-prompt'?: string;
                'touch-action'?: string;
                'camera-orbit'?: string;
                'min-camera-orbit'?: string;
                'max-camera-orbit'?: string;
                'disable-zoom'?: boolean | string;
                bounds?: 'tight' | 'auto';
            };
        }
    }
}

export {};
