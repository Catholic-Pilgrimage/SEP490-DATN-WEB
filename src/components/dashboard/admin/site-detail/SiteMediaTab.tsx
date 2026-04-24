import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, X, Image, AlertCircle, Filter, Play, Box } from 'lucide-react';
import { AdminService } from '../../../../services/admin.service';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { SiteMedia, SiteMediaResponse, MediaStatus, MediaType } from '../../../../types/admin.types';
import { extractErrorMessage } from '../../../../lib/utils';
import { Model3DViewer } from '../../../shared/Model3DViewer';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Pagination as ShadcnPagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface SiteMediaTabProps {
    siteId: string;
}

export const SiteMediaTab: React.FC<SiteMediaTabProps> = ({ siteId }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SiteMediaResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(12);
    const [statusFilter, setStatusFilter] = useState<MediaStatus | ''>('');
    const [typeFilter, setTypeFilter] = useState<MediaType | ''>('');
    const [previewMedia, setPreviewMedia] = useState<SiteMedia | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await AdminService.getSiteMedia(siteId, {
                page: currentPage,
                limit,
                status: statusFilter || undefined,
                type: typeFilter || undefined
            });

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Không thể tải danh sách media');
            }
        } catch (error) {
            const message = extractErrorMessage(error, 'Không thể tải danh sách media');
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [siteId, currentPage, limit, statusFilter, typeFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStatusBadge = (status: MediaStatus) => {
        const configs = {
            pending: { color: 'bg-yellow-100 text-yellow-700', labelKey: 'status.pending' },
            approved: { color: 'bg-green-100 text-green-700', labelKey: 'status.approved' },
            rejected: { color: 'bg-red-100 text-red-700', labelKey: 'status.rejected' }
        };
        const config = configs[status] || configs.pending;
        return { ...config, label: t(config.labelKey) };
    };

    const getTypeBadge = (type: MediaType) => {
        const configs = {
            image: { color: 'bg-blue-100 text-blue-700', labelKey: 'media.image', icon: Image },
            video: { color: 'bg-purple-100 text-purple-700', labelKey: 'media.video', icon: Play },
            model_3d: { color: 'bg-amber-100 text-amber-700', labelKey: 'media.model3d', icon: Box }
        };
        const config = configs[type] || configs.image;
        return { ...config, label: t(config.labelKey) };
    };

    const isYouTubeUrl = (url: string): boolean => {
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const getYouTubeThumbnail = (url: string): string => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        if (match) {
            return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
        }
        return '';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    const mediaList = data?.media || [];
    const pagination = data?.pagination;
    const totalPages = pagination?.totalPages || 1;

    return (
        <div className="p-6 space-y-4">
            {/* Header with Filters */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-slate-500">
                    {pagination?.total || 0} media files
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <Select
                        value={statusFilter || 'all'}
                        onValueChange={(value) => {
                            setStatusFilter(value === 'all' ? '' : (value as MediaStatus));
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="h-9 w-[170px] bg-white border border-slate-200 rounded-lg text-sm">
                            <SelectValue placeholder={t('status.allStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('status.allStatus')}</SelectItem>
                            <SelectItem value="pending">{t('status.pending')}</SelectItem>
                            <SelectItem value="approved">{t('status.approved')}</SelectItem>
                            <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={typeFilter || 'all'}
                        onValueChange={(value) => {
                            setTypeFilter(value === 'all' ? '' : (value as MediaType));
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="h-9 w-[170px] bg-white border border-slate-200 rounded-lg text-sm">
                            <SelectValue placeholder={t('media.allTypes')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('media.allTypes')}</SelectItem>
                            <SelectItem value="image">{t('media.image')}</SelectItem>
                            <SelectItem value="video">{t('media.video')}</SelectItem>
                            <SelectItem value="model_3d">{t('media.model3d')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Content */}
            {mediaList.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Image className="w-6 h-6 text-[#d4af37]" />
                    </div>
                    <h3 className="font-medium text-slate-900 mb-1">
                        Chưa có media
                    </h3>
                    <p className="text-sm text-slate-500">
                        Không có media nào
                    </p>
                </div>
            ) : (
                <>
                    {/* Media Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {mediaList.map((media: SiteMedia) => {
                            const statusBadge = getStatusBadge(media.status);
                            const typeBadge = getTypeBadge(media.type);
                            const TypeIcon = typeBadge.icon;

                            const thumbnailUrl = media.type === 'video' && isYouTubeUrl(media.url)
                                ? getYouTubeThumbnail(media.url)
                                : media.type === 'image'
                                    ? media.url
                                    : '';

                            return (
                                <div
                                    key={media.id}
                                    className="relative group rounded-xl overflow-hidden bg-slate-100 aspect-video cursor-pointer"
                                    onClick={() => setPreviewMedia(media)}
                                >
                                    {/* Thumbnail */}
                                    {thumbnailUrl ? (
                                        <img
                                            src={thumbnailUrl}
                                            alt={media.caption || 'Media'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                            <TypeIcon className="w-8 h-8 text-slate-400" />
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {/* Type Badge */}
                                    <div className="absolute top-2 left-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${typeBadge.color}`}>
                                            <TypeIcon className="w-3 h-3" />
                                            {typeBadge.label}
                                        </span>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge.color}`}>
                                            {statusBadge.label}
                                        </span>
                                    </div>

                                    {/* Video Play Button */}
                                    {media.type === 'video' && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                                <Play className="w-5 h-5 text-slate-700 ml-1" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Caption on hover */}
                                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {media.caption && (
                                            <p className="text-xs text-white truncate">{media.caption}</p>
                                        )}
                                        <p className="text-xs text-white/70">{media.creator.full_name}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-sm text-slate-500">
                                Trang {currentPage} / {totalPages}
                            </p>
                            <ShadcnPagination className="justify-end">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => currentPage > 1 && setCurrentPage(p => Math.max(1, p - 1))}
                                            className={`cursor-pointer text-[#8a6d1c] hover:text-[#8a6d1c] hover:bg-[#d4af37]/10 ${currentPage === 1 ? "pointer-events-none opacity-40" : ""}`}
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum: number;
                                        if (totalPages <= 5) pageNum = i + 1;
                                        else if (currentPage <= 3) pageNum = i + 1;
                                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                        else pageNum = currentPage - 2 + i;

                                        return (
                                            <PaginationItem key={pageNum}>
                                                <PaginationLink
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    isActive={currentPage === pageNum}
                                                    className={`cursor-pointer rounded-lg border border-[#d4af37]/30 text-sm px-3 py-2 ${currentPage === pageNum
                                                        ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white hover:text-white hover:brightness-110'
                                                        : 'text-[#8a6d1c] bg-white hover:bg-[#d4af37]/10'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}

                                    {totalPages > 5 && currentPage < totalPages - 2 && (
                                        <PaginationItem>
                                            <PaginationEllipsis className="text-[#8a6d1c]" />
                                        </PaginationItem>
                                    )}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => currentPage < totalPages && setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            className={`cursor-pointer text-[#8a6d1c] hover:text-[#8a6d1c] hover:bg-[#d4af37]/10 ${currentPage === totalPages ? "pointer-events-none opacity-40" : ""}`}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </ShadcnPagination>
                        </div>
                    )}
                </>
            )}

            {/* Preview Modal */}
            <Dialog open={!!previewMedia} onOpenChange={(open) => { if (!open) setPreviewMedia(null); }}>
                <DialogContent className={`p-0 overflow-hidden bg-black/90 border-white/10 [&>button]:hidden ${previewMedia?.type === 'model_3d' ? 'max-w-4xl' : 'max-w-5xl'}`}>
                    <DialogHeader className="sr-only">
                        <DialogTitle>Preview</DialogTitle>
                    </DialogHeader>
                    <div className="relative w-full">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setPreviewMedia(null)}
                            className="absolute top-3 right-3 z-10 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white shadow-none"
                        >
                            <X className="w-5 h-5" />
                        </Button>

                        {previewMedia && (
                            previewMedia.type === 'video' && isYouTubeUrl(previewMedia.url) ? (
                                <iframe
                                    src={previewMedia.url.replace('watch?v=', 'embed/')}
                                    className="w-full aspect-video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : previewMedia.type === 'video' && !isYouTubeUrl(previewMedia.url) ? (
                                <div className="w-full aspect-video bg-black flex items-center justify-center">
                                    <video
                                        src={previewMedia.url}
                                        controls
                                        autoPlay
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            ) : previewMedia.type === 'model_3d' ? (
                                <div className="w-full aspect-video">
                                    <Model3DViewer
                                        src={previewMedia.url}
                                        alt={previewMedia.caption || '3D Model Viewer'}
                                        className="w-full h-full rounded-lg"
                                        audioUrl={previewMedia.audio_url}
                                        narrationText={previewMedia.narration_text}
                                    />
                                </div>
                            ) : (
                                <div className="w-full max-h-[85vh] flex items-center justify-center p-4">
                                    <img
                                        src={previewMedia.url}
                                        alt="Preview"
                                        className="max-w-full max-h-[80vh] object-contain rounded-lg"
                                    />
                                </div>
                            )
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
