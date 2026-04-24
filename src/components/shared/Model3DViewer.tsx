import { useCallback, useEffect, useRef, useState } from 'react';
import '@google/model-viewer';
import { Box, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Model3DViewerProps {
    src: string;
    alt?: string;
    className?: string;
    audioUrl?: string | null;
    narrationText?: string | null;
}

interface ModelViewerElementHandle extends HTMLElement {
    updateFraming: () => Promise<void>;
    jumpCameraToGoal: () => void;
}

export function Model3DViewer({
    src,
    alt = '3D model preview',
    className,
    audioUrl,
    narrationText
}: Model3DViewerProps) {
    const modelViewerRef = useRef<ModelViewerElementHandle | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isTextExpanded, setIsTextExpanded] = useState(false);

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

    // Audio controls
    const togglePlay = () => {
        if (!audioRef.current) return;
        
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!audioRef.current) return;
        audioRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (!audioRef.current) return;
        setDuration(audioRef.current.duration);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const time = parseFloat(e.target.value);
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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

            {/* Audio Player */}
            {audioUrl && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <audio
                        ref={audioRef}
                        src={audioUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => setIsPlaying(false)}
                    />
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                        {/* Narration Text - Only show when expanded */}
                        {narrationText && isTextExpanded && (
                            <div className="mb-3 p-3 bg-black/30 rounded-lg">
                                <p className="text-xs text-white/90 leading-relaxed">
                                    {narrationText}
                                </p>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-3">
                            {/* Play/Pause Button */}
                            <button
                                onClick={togglePlay}
                                className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#d4af37] hover:bg-[#b8962e] rounded-full transition-colors"
                            >
                                {isPlaying ? (
                                    <Pause className="w-5 h-5 text-white" fill="white" />
                                ) : (
                                    <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                                )}
                            </button>

                            {/* Progress Bar */}
                            <div className="flex-1 flex items-center gap-2">
                                <span className="text-xs text-white/80 font-mono">{formatTime(currentTime)}</span>
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 0}
                                    value={currentTime}
                                    onChange={handleSeek}
                                    className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#d4af37] [&::-webkit-slider-thumb]:cursor-pointer"
                                />
                                <span className="text-xs text-white/80 font-mono">{formatTime(duration)}</span>
                            </div>

                            {/* Text Toggle Button */}
                            {narrationText && (
                                <button
                                    onClick={() => setIsTextExpanded(!isTextExpanded)}
                                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                                    title={isTextExpanded ? 'Ẩn văn bản' : 'Hiện văn bản'}
                                >
                                    <svg 
                                        className="w-5 h-5 text-white/80" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M4 6h16M4 12h16M4 18h16" 
                                        />
                                    </svg>
                                </button>
                            )}

                            {/* Mute Button */}
                            <button
                                onClick={toggleMute}
                                className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                            >
                                {isMuted ? (
                                    <VolumeX className="w-5 h-5 text-white/80" />
                                ) : (
                                    <Volume2 className="w-5 h-5 text-white/80" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
