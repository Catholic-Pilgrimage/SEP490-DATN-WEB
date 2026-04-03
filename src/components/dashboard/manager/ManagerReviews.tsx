import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { ManagerService } from '../../../services/manager.service';
import { ManagerReviewData, ReviewItem } from '../../../types/manager.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Filter, MessageSquare, Clock, MapPin, Search, RefreshCw, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

export const ManagerReviews: React.FC = () => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const dateLocale = language === 'vi' ? vi : enUS;

    const [data, setData] = useState<ManagerReviewData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [page] = useState(1);
    const [typeFilter, setTypeFilter] = useState<string>('--');
    const [hasReplyFilter, setHasReplyFilter] = useState<string>('--');
    const [sortFilter, setSortFilter] = useState<string>('--');

    const [activeTab, setActiveTab] = useState<'site' | 'nearby'>('site');

    useEffect(() => {
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, typeFilter, hasReplyFilter, sortFilter]);

    const fetchReviews = async (showSuccessToast = false) => {
        setIsLoading(true);
        try {
            const response = await ManagerService.getReviews({
                page,
                limit: 10,
                type: typeFilter !== '--' ? typeFilter : undefined,
                has_reply: hasReplyFilter !== '--' ? hasReplyFilter : undefined,
                sort: sortFilter !== '--' ? sortFilter : undefined,
            });

            if (response.success && response.data) {
                setData(response.data);
                if (showSuccessToast) {
                    showToast('success', t('toast.refreshSuccess'), t('toast.refreshSuccessMsg'));
                }
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            showToast('error', t('reviews.loadError'), t('reviews.loadErrorMsg'));
        } finally {
            setIsLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`}
                    />
                ))}
            </div>
        );
    };

    const renderReviewCard = (review: ReviewItem, isNearby: boolean = false) => {
        return (
            <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                layout
            >
                <Card className="overflow-hidden border border-[#d4af37]/20 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="p-5">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                {review.reviewer?.avatar_url ? (
                                    <img src={review.reviewer.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-[#d4af37]/20" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8a6d1c] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                        {review.reviewer?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-900">{review.reviewer?.full_name || t('reviews.anonymous')}</span>
                                        {review.verified_visit && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                                <CheckCircle className="w-3 h-3" />
                                                {t('reviews.verified')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        {renderStars(review.rating)}
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(review.created_at), 'PPP', { locale: dateLocale })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {review.has_reply ? (
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border-blue-200"
                                    >
                                        <MessageSquare className="w-3 h-3 mr-1" />
                                        {t('reviews.replied')}
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border-amber-200"
                                    >
                                        {t('reviews.noReply')}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Target Info (for nearby places) */}
                        {isNearby && review.related_info && (
                            <div className="mb-3">
                                <div className="flex items-center gap-1.5 text-xs text-[#8a6d1c] bg-[#fbfaf6] border border-[#d4af37]/15 inline-flex px-2 py-1 rounded-md">
                                    <MapPin className="w-3 h-3" />
                                    <span>{review.related_info.name}</span>
                                    {review.related_info.type && <span className="opacity-70 px-1">({review.related_info.type})</span>}
                                </div>
                            </div>
                        )}

                        {/* Feedback Content */}
                        <div className="text-slate-600 text-[15px] leading-relaxed relative">
                            {review.feedback ? (
                                <p className="italic bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700">
                                    "{review.feedback}"
                                </p>
                            ) : (
                                <p className="text-slate-400 italic text-sm">{t('reviews.noContent')}</p>
                            )}
                        </div>

                        {/* Image URLs */}
                        {review.image_urls && review.image_urls.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {review.image_urls.map((url, idx) => (
                                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block">
                                        <img
                                            src={url}
                                            alt={`Review ${idx + 1}`}
                                            className="w-20 h-20 rounded-lg object-cover border border-slate-200 hover:border-[#d4af37]/50 hover:shadow-md transition-all cursor-pointer"
                                        />
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* Reply (single object, not array) */}
                        {review.reply && (
                            <div className="mt-4 pt-4 border-t border-slate-100 pl-4 border-l-2 border-l-[#d4af37]/50">
                                <div className="text-xs font-semibold text-[#8a6d1c] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5" /> {t('reviews.managerReply')}
                                </div>
                                <div className="bg-[#fbfaf6] p-3 rounded-xl border border-[#d4af37]/10">
                                    <p className="text-sm text-slate-700">{review.reply.content}</p>
                                    <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                                        <span>{review.reply.replier?.full_name}</span> • <span>{format(new Date(review.reply.created_at), 'PPP', { locale: dateLocale })}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </motion.div>
        );
    };

    return (
        <div className="p-2 sm:p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-slate-900">
                        {t('reviews.title')}
                    </h1>
                    <p className="text-slate-600">{t('reviews.subtitle')}</p>
                </div>

                <Button
                    size="lg"
                    onClick={() => fetchReviews(true)}
                    disabled={isLoading}
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white hover:brightness-110 shadow-md shadow-[#d4af37]/20"
                >
                    <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>{t('common.refresh') || 'Làm mới'}</span>
                </Button>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-[#fdfbf7] to-white border border-[#d4af37]/30 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-sm font-semibold text-[#8a6d1c] uppercase tracking-wider">{t('reviews.avgRating')}</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl font-extrabold text-[#d4af37]">
                                {data?.site_reviews?.summary?.avg_rating?.toFixed(1) || '0.0'}
                            </span>
                            <div className="flex flex-col">
                                {renderStars(Math.round(data?.site_reviews?.summary?.avg_rating || 0))}
                                <span className="text-xs text-slate-500 font-medium mt-1">{t('reviews.scale5')}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm hover:border-[#d4af37]/40 transition-colors">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('reviews.totalSite')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-800">
                            {data?.site_reviews?.summary?.total_reviews || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm hover:border-[#d4af37]/40 transition-colors">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('reviews.totalNearby')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-800">
                            {data?.nearby_place_reviews?.pagination?.total || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border border-slate-200 shadow-sm bg-white">
                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
                    <div className="flex items-center gap-2 text-[#8a6d1c] font-semibold md:col-span-1">
                        <Filter className="w-5 h-5" />
                        <span>{t('reviews.filterTitle')}</span>
                    </div>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-700">
                            <SelectValue placeholder={t('reviews.typePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="--">{t('reviews.typeAll')}</SelectItem>
                            <SelectItem value="all">{t('reviews.typeAllApi')}</SelectItem>
                            <SelectItem value="site">{t('reviews.typeSite')}</SelectItem>
                            <SelectItem value="nearby_place">{t('reviews.typeNearby')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={hasReplyFilter} onValueChange={setHasReplyFilter}>
                        <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-700">
                            <SelectValue placeholder={t('reviews.replyPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="--">{t('reviews.replyAll')}</SelectItem>
                            <SelectItem value="true">{t('reviews.replyTrue')}</SelectItem>
                            <SelectItem value="false">{t('reviews.replyFalse')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sortFilter} onValueChange={setSortFilter}>
                        <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-700">
                            <SelectValue placeholder={t('reviews.sortPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="--">{t('reviews.sortDefault')}</SelectItem>
                            <SelectItem value="newest">{t('reviews.sortNewest')}</SelectItem>
                            <SelectItem value="oldest">{t('reviews.sortOldest')}</SelectItem>
                            <SelectItem value="highest">{t('reviews.sortHighest')}</SelectItem>
                            <SelectItem value="lowest">{t('reviews.sortLowest')}</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={(val: string) => setActiveTab(val as 'site' | 'nearby')} className="w-full">
                <TabsList className="bg-white border border-[#d4af37]/20 p-1 mb-6 rounded-xl w-full justify-start h-auto flex flex-wrap shadow-sm">
                    <TabsTrigger
                        value="site"
                        className="rounded-lg data-[state=active]:bg-[#d4af37]/10 data-[state=active]:text-[#8a6d1c] text-slate-600 px-6 py-2.5 font-semibold transition-all"
                    >
                        {t('reviews.tabSite')}
                        <Badge variant="secondary" className="ml-2 bg-[#d4af37]/20 text-[#8a6d1c] border-none font-bold">
                            {data?.site_reviews?.pagination?.total || 0}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                        value="nearby"
                        className="rounded-lg data-[state=active]:bg-[#d4af37]/10 data-[state=active]:text-[#8a6d1c] text-slate-600 px-6 py-2.5 font-semibold transition-all"
                    >
                        {t('reviews.tabNearby')}
                        <Badge variant="secondary" className="ml-2 bg-[#d4af37]/20 text-[#8a6d1c] border-none font-bold">
                            {data?.nearby_place_reviews?.pagination?.total || 0}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Site Reviews */}
                <TabsContent value="site" className="space-y-6 outline-none focus:ring-0">
                    {isLoading ? (
                        <div className="flex justify-center flex-col items-center py-20 text-slate-400">
                            <Search className="w-10 h-10 animate-pulse text-[#d4af37]/50 mb-3" />
                            {t('reviews.loading')}
                        </div>
                    ) : !data?.site_reviews?.reviews?.length ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-slate-700">{t('reviews.emptySiteTitle')}</h3>
                            <p className="text-slate-500 mt-1">{t('reviews.emptySiteDesc')}</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.site_reviews.reviews.map((r) => renderReviewCard(r))}
                            </div>
                        </AnimatePresence>
                    )}
                </TabsContent>

                {/* Tab: Nearby Place Reviews */}
                <TabsContent value="nearby" className="space-y-6 outline-none focus:ring-0">
                    {isLoading ? (
                        <div className="flex justify-center flex-col items-center py-20 text-slate-400">
                            <Search className="w-10 h-10 animate-pulse text-[#d4af37]/50 mb-3" />
                            {t('reviews.loading')}
                        </div>
                    ) : !data?.nearby_place_reviews?.reviews?.length ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                            <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-slate-700">{t('reviews.emptyNearbyTitle')}</h3>
                            <p className="text-slate-500 mt-1">{t('reviews.emptyNearbyDesc')}</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.nearby_place_reviews.reviews.map((r) => renderReviewCard(r, true))}
                            </div>
                        </AnimatePresence>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};
