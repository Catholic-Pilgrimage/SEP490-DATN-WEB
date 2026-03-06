import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, X, Image, ChevronLeft, ChevronRight, AlertCircle, Filter, Play, Box } from 'lucide-react';
import { AdminService } from '../../../../services/admin.service';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { SiteMedia, SiteMediaResponse, MediaStatus, MediaType } from '../../../../types/admin.types';

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
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
        } catch (err: any) {
            setError(err?.error?.message || 'Không thể tải danh sách media');
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
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value as MediaStatus | '');
                            setCurrentPage(1);
                        }}
                        className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">{t('status.allStatus')}</option>
                        <option value="pending">{t('status.pending')}</option>
                        <option value="approved">{t('status.approved')}</option>
                        <option value="rejected">{t('status.rejected')}</option>
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value as MediaType | '');
                            setCurrentPage(1);
                        }}
                        className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">{t('media.allTypes')}</option>
                        <option value="image">{t('media.image')}</option>
                        <option value="video">{t('media.video')}</option>
                        <option value="model_3d">{t('media.model3d')}</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            {mediaList.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Image className="w-6 h-6 text-blue-600" />
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
                                    onClick={() => setPreviewUrl(media.url)}
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
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Preview Modal */}
            {previewUrl && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={() => setPreviewUrl(null)}
                >
                    <button
                        onClick={() => setPreviewUrl(null)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>

                    {isYouTubeUrl(previewUrl) ? (
                        <iframe
                            src={previewUrl.replace('watch?v=', 'embed/')}
                            className="w-full max-w-4xl aspect-video rounded-lg"
                            allowFullScreen
                        />
                    ) : (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
