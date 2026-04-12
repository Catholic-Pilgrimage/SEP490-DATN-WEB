import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Mail, Phone, User, Users, AlertCircle } from 'lucide-react';
import { AdminService } from '../../../../services/admin.service';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { SiteLocalGuide, SiteLocalGuidesResponse } from '../../../../types/admin.types';
import { extractErrorMessage } from '../../../../lib/utils';
import {
    Pagination as ShadcnPagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface SiteLocalGuidesTabProps {
    siteId: string;
}

export const SiteLocalGuidesTab: React.FC<SiteLocalGuidesTabProps> = ({ siteId }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SiteLocalGuidesResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await AdminService.getSiteLocalGuides(siteId, { page: currentPage, limit });
            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Không thể tải danh sách Local Guides');
            }
        } catch (error) {
            const message = extractErrorMessage(error, 'Không thể tải danh sách Local Guides');
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [siteId, currentPage, limit]);

    useEffect(() => { fetchData(); }, [fetchData]);

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

    const guides = data?.guides || [];
    const pagination = data?.pagination;
    const totalPages = pagination?.totalPages || 1;

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    {pagination?.total || 0} {t('localGuide.workingAtSite')}
                </p>
            </div>

            {guides.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-[#d4af37]" />
                    </div>
                    <h3 className="font-medium text-slate-900 mb-1">{t('localGuide.noGuides')}</h3>
                    <p className="text-sm text-slate-500">{t('localGuide.noGuidesAssigned')}</p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {guides.map((guide: SiteLocalGuide) => (
                            <div key={guide.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                {guide.avatar_url ? (
                                    <img src={guide.avatar_url} alt={guide.full_name} className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                    <div className="w-12 h-12 bg-[#d4af37] border border-[#d4af37]/30 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-white/90" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-slate-900">{guide.full_name}</h4>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1 text-sm text-slate-500">
                                            <Mail className="w-3.5 h-3.5" />
                                            <span className="truncate">{guide.email}</span>
                                        </div>
                                        {guide.phone && (
                                            <div className="flex items-center gap-1 text-sm text-slate-500">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>{guide.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                    {t('role.localGuide')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-sm text-slate-500">{t('pagination.page')} {currentPage} / {totalPages}</p>
                            <ShadcnPagination className="justify-end">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => currentPage > 1 && setCurrentPage(p => Math.max(1, p - 1))}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                                                    className="cursor-pointer"
                                                >
                                                    {pageNum}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}

                                    {totalPages > 5 && currentPage < totalPages - 2 && (
                                        <PaginationItem>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => currentPage < totalPages && setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </ShadcnPagination>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
