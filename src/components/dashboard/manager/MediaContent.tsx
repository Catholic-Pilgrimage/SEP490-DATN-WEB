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
    ExternalLink,
    Box,
    Upload,
    AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ManagerService } from '../../../services/manager.service';
import { Media, MediaType, ContentStatus } from '../../../types/manager.types';
import { MediaDetailModal } from './MediaDetailModal';
import { Upload3DModelModal } from './Upload3DModelModal';

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
    const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

    // Selected media for detail modal
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

    // Upload 3D Model Modal Modal state
    const [isUpload3DModalOpen, setIsUpload3DModalOpen] = useState(false);

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
                is_active: activeFilter
            });

            if (response.success && response.data) {
                setMediaList(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalItems(response.data.pagination.totalItems);
            } else {
                setError(response.message || 'Không thể tải danh sách media');
            }
        } catch (err: any) {
            setError(err?.error?.message || 'Không thể tải danh sách media');
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, typeFilter, statusFilter, activeFilter]);

    useEffect(() => {
        fetchMediaList();
    }, [fetchMediaList]);

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
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('media.title')}</h1>
                    <p className="text-slate-500 mt-1">{t('media.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsUpload3DModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-[#d4af37]/40 text-[#8a6d1c] rounded-xl hover:bg-[#f8f5ee] active:scale-95 transition-all duration-200"
                    >
                        <Upload className="w-4 h-4" />
                        Tải lên 3D Model
                    </button>
                    <button
                        onClick={fetchMediaList}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white rounded-xl shadow-lg shadow-[#d4af37]/20 hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        {t('common.refresh')}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-[#d4af37]/20 shadow-sm mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Type Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-[#8a6d1c]/50" />
                        <select
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value as MediaType | ''); setCurrentPage(1); }}
                            className="px-4 py-2.5 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-slate-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all cursor-pointer"
                        >
                            <option value="">{t('media.filterType')}</option>
                            <option value="image">{t('media.image')}</option>
                            <option value="video">{t('media.video')}</option>
                            <option value="model_3d">{t('media.model3d')}</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value as ContentStatus | ''); setCurrentPage(1); }}
                            className="px-4 py-2.5 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-slate-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all cursor-pointer"
                        >
                            <option value="">{t('media.filterStatus')}</option>
                            <option value="pending">{t('status.pending')}</option>
                            <option value="approved">{t('status.approved')}</option>
                            <option value="rejected">{t('status.rejected')}</option>
                        </select>
                    </div>

                    {/* Active Filter */}
                    <div className="flex items-center gap-2">
                        <select
                            value={activeFilter === undefined ? '' : activeFilter.toString()}
                            onChange={(e) => {
                                const val = e.target.value;
                                setActiveFilter(val === '' ? undefined : val === 'true');
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-slate-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all cursor-pointer"
                        >
                            <option value="">{t('media.filterActive')}</option>
                            <option value="true">{t('media.activeTrue')}</option>
                            <option value="false">{t('media.activeFalse')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-[#d4af37]/20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
                </div>
            ) : (
                <>
                    {/* Content */}
                    {mediaList.length === 0 ? (
                        /* Empty State */
                        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-[#d4af37]/20 text-center p-12">
                            <div className="w-16 h-16 bg-[#f5f3ee] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Image className="w-8 h-8 text-[#d4af37]/40" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                {t('media.emptyTitle')}
                            </h3>
                            <p className="text-slate-500">
                                {t('media.emptyDesc')}
                            </p>
                        </div>
                    ) : (
                        /* Grid Layout */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                                    <div
                                        key={media.id}
                                        className={`bg-white rounded-2xl border overflow-hidden hover:shadow-xl hover:shadow-[#d4af37]/10 transition-all duration-300 group ${!media.is_active ? 'opacity-60 border-red-200' : 'border-[#d4af37]/20 hover:border-[#d4af37]/50'
                                            }`}
                                    >
                                        {/* Media Preview */}
                                        <div className="relative aspect-video bg-slate-100">
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
                                            <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg flex items-center gap-1 text-xs font-medium">
                                                <TypeIcon className={`w-3.5 h-3.5 ${typeInfo.color}`} />
                                                {typeInfo.label}
                                            </div>

                                            {/* Deleted Badge */}
                                            {!media.is_active && (
                                                <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white rounded-lg flex items-center gap-1 text-xs font-medium">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Đã xóa
                                                </div>
                                            )}

                                            {/* Video Play Button */}
                                            {media.type === 'video' && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                                                        <Video className="w-6 h-6 text-red-600" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            {/* Caption */}
                                            <p className="text-sm text-slate-700 line-clamp-2 mb-3" title={media.caption}>
                                                {media.caption}
                                            </p>

                                            {/* Status */}
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusInfo.label}
                                                </span>
                                                <span className="text-xs text-slate-400 font-mono">{media.code}</span>
                                            </div>

                                            {/* Creator */}
                                            {media.creator && (
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                                    <User className="w-3.5 h-3.5" />
                                                    <span className="truncate">{media.creator.full_name}</span>
                                                </div>
                                            )}

                                            {/* Date */}
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{formatDate(media.created_at)}</span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                                                <a
                                                    href={media.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium border border-[#d4af37]/20 text-slate-600 rounded-lg hover:bg-[#f5f3ee] hover:text-[#8a6d1c] hover:border-[#d4af37]/40 transition-colors"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    {t('media.view')}
                                                </a>
                                                <button
                                                    onClick={() => setSelectedMedia(media)}
                                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium bg-[#f5f3ee] text-[#8a6d1c] rounded-lg hover:bg-[#ece8dc] transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    {t('common.details')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
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
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-[#d4af37]/20 hover:bg-[#f5f3ee] text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
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
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-10 h-10 rounded-lg font-medium transition-colors ${pageNum === currentPage
                                                    ? 'bg-[#d4af37] text-white shadow-lg shadow-[#d4af37]/20'
                                                    : 'hover:bg-[#f5f3ee] text-slate-600 hover:text-[#8a6d1c]'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-[#d4af37]/20 hover:bg-[#f5f3ee] text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
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
        </div>
    );
};
