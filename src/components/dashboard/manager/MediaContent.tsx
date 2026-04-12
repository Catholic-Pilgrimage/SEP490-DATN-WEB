import React, { useEffect, useState, useCallback } from 'react';
import {
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    RefreshCw,
    Image,
    Video,
    Eye,
    User,
    Clock,
    CheckCircle,
    XCircle,
    Trash2,
    Box,
    Upload,
    AlertCircle,
    Mic
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ManagerService } from '../../../services/manager.service';
import { extractErrorMessage } from '../../../lib/utils';
import { Media, MediaType, ContentStatus } from '../../../types/manager.types';
import { MediaDetailModal } from './MediaDetailModal';
import { MediaViewerModal } from './MediaViewerModal';
import { Upload3DModelModal } from './Upload3DModelModal';
import { useToast } from '../../../contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

/**
 * MediaContent Component
 * 
 * Giải thích:
 * - Hiển thị danh sách media (hình ảnh, video, 3d model) của site
 * - Có filter theo: type, status, is_active
 * - Card layout với preview hình ảnh
 */
export const MediaContent: React.FC = () => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    // ============ STATE ============
    const [mediaList, setMediaList] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(12);  // 12 items = 3x4 grid hoặc 4x3

    // Filters
    const [typeFilter, setTypeFilter] = useState<MediaType | ''>('');
    const [statusFilter, setStatusFilter] = useState<ContentStatus | ''>('');
    const [narrativeStatusFilter, setNarrativeStatusFilter] = useState<ContentStatus | ''>('');
    const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

    // Selected media for detail modal
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

    // Upload 3D Model Modal Modal state
    const [isUpload3DModalOpen, setIsUpload3DModalOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Media Viewer Modal state
    const [viewerMedia, setViewerMedia] = useState<Media | null>(null);

    // ============ FETCH DATA ============
    const fetchMediaList = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await ManagerService.getMediaList({
                page: currentPage,
                limit,
                type: typeFilter || undefined,
                status: statusFilter || undefined,
                narrative_status: narrativeStatusFilter || undefined,
                is_active: activeFilter
            });

            if (response.success && response.data) {
                setMediaList(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalItems(response.data.pagination.totalItems);
            } else {
                setError(response.message || 'Không thể tải danh sách media');
            }
        } catch (error) {
            const message = extractErrorMessage(error, 'Không thể tải danh sách media');
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, typeFilter, statusFilter, narrativeStatusFilter, activeFilter]);

    useEffect(() => {
        fetchMediaList();
    }, [fetchMediaList]);

    const handleManualRefresh = async () => {
        setRefreshing(true);
        await fetchMediaList();
        setRefreshing(false);
        showToast('success', t('toast.refreshSuccess'), t('toast.refreshSuccessMsg'));
    };

    // ============ HELPERS ============
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getStatusInfo = (status: ContentStatus) => {
        const statuses = {
            pending: { label: t('status.pending'), color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
            approved: { label: t('status.approved'), color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
            rejected: { label: t('status.rejected'), color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
        };
        return statuses[status] || statuses.pending;
    };

    const getTypeInfo = (type: MediaType) => {
        const types = {
            image: { label: 'Hình ảnh', icon: Image, color: 'text-blue-600' },
            video: { label: 'Video', icon: Video, color: 'text-red-600' },
            model_3d: { label: 'Model 3D', icon: Box, color: 'text-[#8a6d1c]' }
        };
        return types[type] || types.image;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Kiểm tra URL có phải YouTube không
    const isYoutubeUrl = (url: string) => {
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    // Lấy YouTube thumbnail
    const getYoutubeThumbnail = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const videoId = match && match[2].length === 11 ? match[2] : null;
        return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
    };

    // ============ RENDER ============
    return (
        <div className="h-full flex flex-col p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] shadow-lg shadow-[#d4af37]/25 ring-4 ring-[#d4af37]/10">
                        <Image className="h-7 w-7 text-white" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{t('media.title')}</h1>
                        <p className="mt-1 max-w-xl text-sm text-slate-600 sm:text-base">{t('media.subtitle')}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsUpload3DModalOpen(true)}
                        className="h-11 px-6 gap-2 rounded-xl border-[#d4af37]/40 text-[#8a6d1c] hover:bg-[#f8f5ee] text-[15px]"
                    >
                        <Upload className="h-5 w-5" />
                        {t('upload3D.title') || 'Tải lên 3D Model'}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleManualRefresh}
                        disabled={loading || refreshing}
                        className="h-11 px-6 gap-2 rounded-xl bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white shadow-md shadow-[#d4af37]/25 hover:brightness-110 disabled:opacity-70 text-[15px]"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading || refreshing ? 'animate-spin' : ''}`} />
                        {t('common.refresh')}
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="mb-6 rounded-2xl border-[#d4af37]/20 shadow-sm">
                <CardContent className="flex flex-wrap items-center gap-3 p-4 sm:gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 shrink-0 text-[#8a6d1c]/50" />
                        <Select
                            value={typeFilter || 'all'}
                            onValueChange={(v) => {
                                setTypeFilter(v === 'all' ? '' : (v as MediaType));
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="h-9 w-[min(100vw-4rem,200px)] rounded-xl border-[#d4af37]/30 bg-[#f5f3ee] text-slate-700 focus:ring-[#d4af37] sm:w-[200px]">
                                <SelectValue placeholder={t('media.filterType')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('media.filterType')}</SelectItem>
                                <SelectItem value="image">{t('media.image')}</SelectItem>
                                <SelectItem value="video">{t('media.video')}</SelectItem>
                                <SelectItem value="model_3d">{t('media.model3d')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Select
                        value={statusFilter || 'all'}
                        onValueChange={(v) => {
                            setStatusFilter(v === 'all' ? '' : (v as ContentStatus));
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="h-9 w-[min(100vw-4rem,200px)] rounded-xl border-[#d4af37]/30 bg-[#f5f3ee] text-slate-700 focus:ring-[#d4af37] sm:w-[200px]">
                            <SelectValue placeholder={t('media.filterStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('media.filterStatus')}</SelectItem>
                            <SelectItem value="pending">{t('status.pending')}</SelectItem>
                            <SelectItem value="approved">{t('status.approved')}</SelectItem>
                            <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={narrativeStatusFilter || 'all'}
                        onValueChange={(v) => {
                            setNarrativeStatusFilter(v === 'all' ? '' : (v as ContentStatus));
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="h-9 w-[min(100vw-4rem,14rem)] min-w-[11rem] rounded-xl border-[#d4af37]/30 bg-[#f5f3ee] text-slate-700 focus:ring-[#d4af37] sm:w-[220px]">
                            <SelectValue placeholder={t('media.filterNarrativeStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('media.filterNarrativeStatus')}</SelectItem>
                            <SelectItem value="pending">{t('status.pending')}</SelectItem>
                            <SelectItem value="approved">{t('status.approved')}</SelectItem>
                            <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={activeFilter === undefined ? 'all' : activeFilter ? 'true' : 'false'}
                        onValueChange={(v) => {
                            setActiveFilter(v === 'all' ? undefined : v === 'true');
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="h-9 w-[min(100vw-4rem,200px)] rounded-xl border-[#d4af37]/30 bg-[#f5f3ee] text-slate-700 focus:ring-[#d4af37] sm:w-[200px]">
                            <SelectValue placeholder={t('media.filterActive')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('media.filterActive')}</SelectItem>
                            <SelectItem value="true">{t('media.activeTrue')}</SelectItem>
                            <SelectItem value="false">{t('media.activeFalse')}</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Error */}
            {error && (
                <Card className="rounded-xl border-red-200 bg-red-50">
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
                <>
                    {/* Content */}
                    {mediaList.length === 0 ? (
                        <Card className="flex flex-1 flex-col rounded-2xl border-[#d4af37]/20">
                            <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center sm:py-16">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5f3ee]">
                                    <Image className="h-8 w-8 text-[#d4af37]/40" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">{t('media.emptyTitle')}</h3>
                                <p className="max-w-sm text-slate-500">{t('media.emptyDesc')}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        /* Grid Layout */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
                            {mediaList.map((media) => {
                                const statusInfo = getStatusInfo(media.status);
                                const typeInfo = getTypeInfo(media.type);
                                const TypeIcon = typeInfo.icon;
                                const StatusIcon = statusInfo.icon;

                                // Xác định thumbnail
                                let thumbnailUrl = media.url;
                                if (media.type === 'video' && isYoutubeUrl(media.url)) {
                                    thumbnailUrl = getYoutubeThumbnail(media.url) || '';
                                }

                                return (
                                    <Card
                                        key={media.id}
                                        className={`group flex h-full min-h-0 flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-[#d4af37]/10 ${!media.is_active ? 'border-red-200 opacity-60' : 'border-[#d4af37]/20 hover:border-[#d4af37]/50'
                                            }`}
                                    >
                                        {/* Media Preview */}
                                        <div 
                                            className="relative aspect-video bg-slate-100 flex-shrink-0 cursor-pointer group/preview"
                                            onClick={() => setViewerMedia(media)}
                                        >
                                            {media.type === 'image' ? (
                                                <img
                                                    src={media.url}
                                                    alt={media.caption}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : media.type === 'model_3d' ? (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-[#f5f3ee]">
                                                    <Box className="w-12 h-12 text-[#d4af37] mb-2" />
                                                    <span className="text-sm font-medium text-[#8a6d1c]">3D Model</span>
                                                </div>
                                            ) : media.type === 'video' && !isYoutubeUrl(media.url) ? (
                                                <video
                                                    src={media.url}
                                                    className="w-full h-full object-cover"
                                                    preload="metadata"
                                                />
                                            ) : thumbnailUrl ? (
                                                <img
                                                    src={thumbnailUrl}
                                                    alt={media.caption}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Video className="w-12 h-12 text-slate-300" />
                                                </div>
                                            )}

                                            {/* Type Badge */}
                                            <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg flex items-center gap-1 text-xs font-medium leading-none min-h-[1.75rem]">
                                                <TypeIcon className={`w-3.5 h-3.5 flex-shrink-0 ${typeInfo.color}`} />
                                                {typeInfo.label}
                                            </div>

                                            {media.type === 'model_3d' &&
                                                media.narrative_status === 'pending' &&
                                                media.audio_url && (
                                                    <div className="absolute bottom-2 left-2 right-2 px-2 py-1.5 bg-amber-500/95 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-md">
                                                        <Mic className="w-3.5 h-3.5 flex-shrink-0" />
                                                        <span className="truncate">{t('media.narrativePendingBadge')}</span>
                                                    </div>
                                                )}

                                            {/* Deleted Badge */}
                                            {!media.is_active && (
                                                <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white rounded-lg flex items-center gap-1 text-xs font-medium leading-none min-h-[1.75rem]">
                                                    <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
                                                    Đã xóa
                                                </div>
                                            )}

                                            {/* Video Play Button */}
                                            {media.type === 'video' && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover/preview:bg-black/20 transition-colors">
                                                    <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover/preview:scale-110 transition-transform">
                                                        <Video className="w-5 h-5 text-red-600" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <CardContent className="flex min-h-0 flex-1 flex-col p-4 pt-3">
                                            {/* Caption: fixed block height (2 lines) so cards stay even */}
                                            <p
                                                className="text-sm text-slate-700 line-clamp-2 mb-3 min-h-[2.75rem] leading-snug"
                                                title={media.caption || undefined}
                                            >
                                                {media.caption?.trim() ? media.caption : '\u00a0'}
                                            </p>

                                            {/* Status */}
                                            <div className="flex items-center justify-between gap-2 mb-3 min-h-[1.75rem]">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 max-w-[58%] ${statusInfo.color}`}>
                                                    <StatusIcon className="w-3 h-3 flex-shrink-0" />
                                                    <span className="truncate">{statusInfo.label}</span>
                                                </span>
                                                <span className="text-xs text-slate-400 font-mono tabular-nums text-right truncate min-w-0 shrink">
                                                    {media.code}
                                                </span>
                                            </div>

                                            {/* Creator — always one row height */}
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 min-h-[1.25rem]">
                                                <User className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                                                <span className="truncate">
                                                    {media.creator?.full_name?.trim()
                                                        ? media.creator.full_name
                                                        : '\u00a0'}
                                                </span>
                                            </div>

                                            {/* Date */}
                                            <div className="flex items-center gap-2 text-xs text-slate-400 mb-0 min-h-[1.25rem]">
                                                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span>{formatDate(media.created_at)}</span>
                                            </div>

                                            <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => setSelectedMedia(media)}
                                                    className="h-8 w-full gap-1 rounded-lg bg-[#f5f3ee] text-xs text-[#8a6d1c] hover:bg-[#ece8dc]"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    {t('common.details')}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-slate-500">
                                {t('media.showing')} <span className="font-medium text-slate-900">{(currentPage - 1) * limit + 1}</span> {t('media.to')} <span className="font-medium text-slate-900">{Math.min(currentPage * limit, totalItems)}</span> {t('media.of')} <span className="font-medium text-slate-900">{totalItems}</span> {t('media.items')}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="h-9 w-9 rounded-lg border-[#d4af37]/25 text-slate-600 hover:bg-[#f5f3ee] disabled:opacity-50"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <Button
                                                key={pageNum}
                                                type="button"
                                                variant={pageNum === currentPage ? 'default' : 'ghost'}
                                                size="icon"
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`h-9 w-9 rounded-lg font-medium ${pageNum === currentPage
                                                    ? 'bg-[#d4af37] text-white shadow-md shadow-[#d4af37]/25 hover:bg-[#c9a227]'
                                                    : 'text-slate-600 hover:bg-[#f5f3ee] hover:text-[#8a6d1c]'
                                                    }`}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="h-9 w-9 rounded-lg border-[#d4af37]/25 text-slate-600 hover:bg-[#f5f3ee] disabled:opacity-50"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ============ DETAIL MODAL ============ */}
            <MediaDetailModal
                isOpen={selectedMedia !== null}
                media={selectedMedia}
                onClose={() => setSelectedMedia(null)}
                onStatusChange={() => {
                    // Refresh list sau khi approve/reject
                    fetchMediaList();
                }}
            />

            {/* ============ UPLOAD 3D MODEL MODAL ============ */}
            <Upload3DModelModal
                isOpen={isUpload3DModalOpen}
                onClose={() => setIsUpload3DModalOpen(false)}
                onSuccess={() => {
                    // Refresh list sau khi upload
                    fetchMediaList();
                }}
            />

            {/* ============ VIEWER MODAL ============ */}
            <MediaViewerModal
                isOpen={viewerMedia !== null}
                media={viewerMedia}
                onClose={() => setViewerMedia(null)}
            />
        </div>
    );
};
