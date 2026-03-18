import { useCallback, useEffect, useRef } from 'react';
import '@google/model-viewer';
import { Box } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Model3DViewerProps {
    src: string;
    alt?: string;
    className?: string;
}

interface ModelViewerElementHandle extends HTMLElement {
    updateFraming: () => Promise<void>;
    jumpCameraToGoal: () => void;
}

export function Model3DViewer({
    src,
    alt = '3D model preview',
    className
}: Model3DViewerProps) {
    const modelViewerRef = useRef<ModelViewerElementHandle | null>(null);

    const reframeModel = useCallback(async () => {
        const element = modelViewerRef.current;
        if (!element) return;

        try {
            await element.updateFraming();
            element.jumpCameraToGoal();
        } catch {
            // Best-effort fallback only; malformed models still need fixing at source.
        }
    }, []);

    useEffect(() => {
        const element = modelViewerRef.current;
        if (!element) return;

        const handleLoad = () => {
            void reframeModel();
        };

        element.addEventListener('load', handleLoad);
        return () => {
            element.removeEventListener('load', handleLoad);
        };
    }, [reframeModel, src]);

    return (
        <div
            className={cn(
                'relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_top,#9b7a1d_0%,#7b6116_45%,#5d4910_100%)]',
                className
            )}
        >
            <model-viewer
                ref={modelViewerRef}
                src={src}
                alt={alt}
                camera-controls
                auto-rotate
                camera-target="auto auto auto"
                camera-orbit="0deg 75deg auto"
                loading="eager"
                reveal="auto"
                bounds="tight"
                shadow-intensity="1"
                touch-action="pan-y"
                className="block w-full h-full outline-none"
                style={{ width: '100%', height: '100%', minHeight: '300px' }}
            >
                <div
                    slot="poster"
                    className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#9b7a1d_0%,#7b6116_45%,#5d4910_100%)] text-white"
                >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                        <Box className="h-8 w-8 text-[#d4af37]" />
                    </div>
                    <span className="text-sm font-medium text-white/80">Loading 3D model...</span>
                </div>
            </model-viewer>
        </div>
    );
}
