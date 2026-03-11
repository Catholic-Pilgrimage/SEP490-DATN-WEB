import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Church,
  Building,
  Mountain,
  Home,
  HelpCircle,
  Loader2,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  X,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Map as MapIcon,
  List
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import { AdminSite, Pagination, SiteListParams, SiteRegion, SiteType, SiteDetail } from '../../../types/admin.types';
import { SiteEditModal } from './SiteEditModal';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import VietMapView from '../../../components/shared/VietMapView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export const SiteManagement: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [sites, setSites] = useState<AdminSite[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<SiteRegion | ''>('');
  const [typeFilter, setTypeFilter] = useState<SiteType | ''>('');
  const [activeFilter, setActiveFilter] = useState<boolean | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(9);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const [mapSites, setMapSites] = useState<AdminSite[]>([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapMarkersCount, setMapMarkersCount] = useState(0);

  const [siteForEdit, setSiteForEdit] = useState<SiteDetail | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [siteToDelete, setSiteToDelete] = useState<AdminSite | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState<string | null>(null);

  const [searchDebounce, setSearchDebounce] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchSites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: SiteListParams = { page: currentPage, limit };
      if (searchDebounce) params.search = searchDebounce;
      if (regionFilter) params.region = regionFilter;
      if (typeFilter) params.type = typeFilter;
      if (activeFilter !== '') params.is_active = activeFilter;

      const response = await AdminService.getSites(params);

      if (response.success && response.data) {
        setSites(response.data.sites);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to load sites');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load sites';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchDebounce, regionFilter, typeFilter, activeFilter]);

  const fetchSitesForMap = useCallback(async () => {
    try {
      setMapLoading(true);
      setMapMarkersCount(0);

      const params: SiteListParams = { page: 1, limit: 500 };
      if (searchDebounce) params.search = searchDebounce;
      if (regionFilter) params.region = regionFilter;
      if (typeFilter) params.type = typeFilter;
      if (activeFilter !== '') params.is_active = activeFilter;

      const response = await AdminService.getSites(params);
      if (response.success && response.data) {
        const sitesFromApi = response.data.sites;
        setMapSites(sitesFromApi);

        // Ưu tiên dùng luôn lat/lng từ list nếu BE đã trả
        const directCoords = sitesFromApi.filter(s => s.latitude && s.longitude);
        if (directCoords.length > 0) {
          setMapMarkersCount(directCoords.length);
        } else if (sitesFromApi.length > 0) {
          // Fallback: gọi thêm chi tiết cho một số site để lấy toạ độ
          const limitedSites = sitesFromApi.slice(0, 50); // tránh gọi quá nhiều
          try {
            const detailsResponses = await Promise.all(
              limitedSites.map((s) => AdminService.getSiteById(s.id))
            );
            const sitesWithCoords: SiteDetail[] = [];
            detailsResponses.forEach((res) => {
              if (res.success && res.data && res.data.latitude && res.data.longitude) {
                sitesWithCoords.push(res.data);
              }
            });

            if (sitesWithCoords.length > 0) {
              // Gán lại mapSites bằng bản detail cho việc render marker
              setMapSites(sitesWithCoords);
              setMapMarkersCount(sitesWithCoords.length);
            }
          } catch {
            // bỏ qua lỗi fallback, chỉ không có marker
          }
        }
      } else {
        setMapSites([]);
      }
    } catch {
      setMapSites([]);
    } finally {
      setMapLoading(false);
    }
  }, [searchDebounce, regionFilter, typeFilter, activeFilter]);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  useEffect(() => {
    if (viewMode === 'map') {
      fetchSitesForMap();
    }
  }, [viewMode, fetchSitesForMap]);

  const handleManualRefresh = async () => {
    await fetchSites();
    showToast('success', t('toast.refreshSuccess'), t('toast.refreshSuccessMsg'));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (!pagination || newPage <= pagination.totalPages)) {
      setCurrentPage(newPage);
    }
  };

  const getTypeInfo = (type: SiteType) => {
    const types = {
      church: { label: t('type.church'), icon: Church, color: 'bg-[#d4af37]/10 text-[#8a6d1c] border border-[#d4af37]/30' },
      shrine: { label: t('type.shrine'), icon: Mountain, color: 'bg-purple-50 text-purple-700 border border-purple-200' },
      monastery: { label: t('type.monastery'), icon: Building, color: 'bg-amber-50 text-amber-700 border border-amber-200' },
      center: { label: t('type.center'), icon: Home, color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
      other: { label: t('type.other'), icon: HelpCircle, color: 'bg-gray-50 text-gray-700 border border-gray-200' }
    };
    return types[type] || types.other;
  };

  const getRegionInfo = (region: SiteRegion) => {
    const regions = {
      Bac: { label: t('region.bac'), color: 'bg-red-50 text-red-700 border-red-200' },
      Trung: { label: t('region.trung'), color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      Nam: { label: t('region.nam'), color: 'bg-blue-50 text-blue-700 border-blue-200' }
    };
    return regions[region] || regions.Nam;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#8a6d1c]">{t('sites.title')}</h1>
          <p className="text-gray-500 mt-1">{t('sites.subtitle')}</p>
        </div>
        <Button
          onClick={handleManualRefresh}
          disabled={loading}
          className="flex items-center gap-2 h-[46px] px-6 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white font-medium rounded-xl hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-[#d4af37]/20"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </Button>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white rounded-2xl border border-[#d4af37]/20 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="flex-1 min-w-[250px]">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#8a6d1c] transition-colors" />
                <Input
                  type="text"
                  placeholder={t('sites.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-12 pr-4 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-gray-700 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#d4af37] focus-visible:border-[#d4af37] hover:border-[#d4af37]/50 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#8a6d1c]/50" />
              <Select
                value={regionFilter || 'all'}
                onValueChange={(value) => { setRegionFilter(value === 'all' ? '' : (value as SiteRegion)); setCurrentPage(1); }}
              >
                <SelectTrigger className="w-[180px] h-11 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-gray-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all cursor-pointer">
                  <SelectValue placeholder={t('sites.allRegions')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('sites.allRegions')}</SelectItem>
                  <SelectItem value="Bac">{t('region.bac')}</SelectItem>
                  <SelectItem value="Trung">{t('region.trung')}</SelectItem>
                  <SelectItem value="Nam">{t('region.nam')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select
              value={typeFilter || 'all'}
              onValueChange={(value) => { setTypeFilter(value === 'all' ? '' : (value as SiteType)); setCurrentPage(1); }}
            >
              <SelectTrigger className="w-[190px] h-11 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-gray-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all cursor-pointer">
                <SelectValue placeholder={t('sites.allTypes')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('sites.allTypes')}</SelectItem>
                <SelectItem value="church">{t('type.church')}</SelectItem>
                <SelectItem value="shrine">{t('type.shrine')}</SelectItem>
                <SelectItem value="monastery">{t('type.monastery')}</SelectItem>
                <SelectItem value="center">{t('type.center')}</SelectItem>
                <SelectItem value="other">{t('type.other')}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={activeFilter === '' ? 'all' : activeFilter.toString()}
              onValueChange={(value) => {
                setActiveFilter(value === 'all' ? '' : value === 'true');
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[190px] h-11 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-gray-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all cursor-pointer">
                <SelectValue placeholder={t('sites.allStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('sites.allStatus')}</SelectItem>
                <SelectItem value="true">{t('common.active')}</SelectItem>
                <SelectItem value="false">{t('common.inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-[#f5f3ee] p-1 rounded-xl border border-[#d4af37]/30">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'list'
                ? 'bg-white text-[#8a6d1c] shadow-sm'
                : 'text-gray-500 hover:text-[#8a6d1c]'
                }`}
            >
              <List className="w-4 h-4" />
              {t('common.list')}
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'map'
                ? 'bg-white text-[#8a6d1c] shadow-sm'
                : 'text-gray-500 hover:text-[#8a6d1c]'
                }`}
            >
              <MapIcon className="w-4 h-4" />
              {t('common.map')}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Sites Grid/Map */}
      {viewMode === 'map' ? (
        <>
          {mapLoading ? (
            <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-[#d4af37]/20">
              <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
            </div>
          ) : mapSites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-[#d4af37]/20 text-gray-400">
              <MapPin className="w-12 h-12 mb-4 text-[#d4af37]/40" />
              <p>{t('sites.noSites')}</p>
            </div>
          ) : (
            <div className="bg-white p-2 rounded-2xl border border-[#d4af37]/20 shadow-sm">
              <div className="flex items-center justify-between px-3 pt-2 pb-3">
                <div className="text-xs text-gray-500">
                  Đang hiển thị{' '}
                  <span className="font-semibold text-[#8a6d1c]">
                    {mapMarkersCount}
                  </span>{' '}
                  địa điểm có tọa độ trên bản đồ
                </div>
              </div>
              <VietMapView
                latitude={16.0544}
                longitude={108.2022}
                zoom={5}
                markers={mapSites
                  .filter(s => s.latitude && s.longitude)
                  .map(s => ({
                    id: s.id,
                    lat: Number(s.latitude),
                    lng: Number(s.longitude),
                    title: s.name,
                    color: s.is_active ? '#22c55e' : '#ef4444',
                    icon: s.is_active ? '⛪' : '⛔',
                  }))}
                onMarkerClick={(m) => navigate(`/dashboard/sites/${m.id}`)}
                className="w-full h-[560px] rounded-xl overflow-hidden"
              />
            </div>
          )}
        </>
      ) : loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-[#d4af37]/20">
          <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
        </div>
      ) : sites.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-[#d4af37]/20 text-gray-400">
          <MapPin className="w-12 h-12 mb-4 text-[#d4af37]/40" />
          <p>{t('sites.noSites')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sites.map((site) => {
              const typeInfo = getTypeInfo(site.type);
              const TypeIcon = typeInfo.icon;
              const regionInfo = getRegionInfo(site.region);

              return (
                <div
                  key={site.id}
                  className="bg-white rounded-2xl border border-[#d4af37]/20 overflow-hidden hover:border-[#d4af37]/50 hover:shadow-xl hover:shadow-[#d4af37]/10 transition-all duration-300 group"
                >
                  {/* Cover Image */}
                  <div className="relative h-48 overflow-hidden">
                    {site.cover_image ? (
                      <img
                        src={site.cover_image}
                        alt={site.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#f5f3ee] to-[#e8e4db] flex items-center justify-center">
                        <Church className="w-12 h-12 text-[#d4af37]/40" />
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${site.is_active
                        ? 'bg-emerald-500 text-white'
                        : 'bg-red-500 text-white'
                        }`}>
                        {site.is_active ? (
                          <><CheckCircle className="w-3 h-3" /> {t('common.active')}</>
                        ) : (
                          <><XCircle className="w-3 h-3" /> {t('common.inactive')}</>
                        )}
                      </span>
                    </div>

                    {/* Region badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm bg-white/90 ${regionInfo.color}`}>
                        {regionInfo.label}
                      </span>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/dashboard/sites/${site.id}`)}
                          className="h-11 w-11 rounded-full bg-white border border-[#d4af37]/50 hover:scale-110 hover:bg-[#d4af37] transition-all group/btn shadow-none"
                          title={t('common.view')}
                        >
                          <Eye className="w-5 h-5 text-[#8a6d1c] group-hover/btn:text-white" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            setEditLoading(true);
                            try {
                              const response = await AdminService.getSiteById(site.id);
                              if (response.success && response.data) {
                                setSiteForEdit(response.data);
                                setIsEditModalOpen(true);
                              }
                            } catch (error) {
                              console.error('Failed to load site for edit:', error);
                            } finally {
                              setEditLoading(false);
                            }
                          }}
                          className="h-11 w-11 rounded-full bg-white border border-[#d4af37]/50 hover:scale-110 hover:bg-[#d4af37] transition-all group/btn shadow-none"
                          title={t('common.edit')}
                          disabled={editLoading}
                        >
                          {editLoading ? (
                            <Loader2 className="w-5 h-5 text-[#8a6d1c] animate-spin" />
                          ) : (
                            <Edit className="w-5 h-5 text-[#8a6d1c] group-hover/btn:text-white" />
                          )}
                        </Button>
                        {site.is_active && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setSiteToDelete(site); setIsDeleteConfirmOpen(true); }}
                            className="h-11 w-11 rounded-full bg-white border border-red-300 hover:scale-110 hover:bg-red-500 transition-all group/btn shadow-none"
                            title={t('common.delete')}
                          >
                            <Trash2 className="w-5 h-5 text-red-500 group-hover/btn:text-white" />
                          </Button>
                        )}
                        {!site.is_active && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              setRestoreLoading(site.id);
                              try {
                                const response = await AdminService.restoreSite(site.id);
                                if (response.success) {
                                  showToast('success', t('toast.restoreSiteSuccess'), t('toast.restoreSiteSuccessMsg'));
                                  fetchSites();
                                } else {
                                  showToast('error', t('toast.restoreSiteFailed'), response.message || t('toast.restoreSiteFailedMsg'));
                                  setError(response.message || 'Failed to restore site');
                                }
                              } catch (error) {
                                const message = error instanceof Error ? error.message : t('toast.restoreSiteFailedMsg');
                                showToast('error', t('toast.restoreSiteFailed'), message);
                                setError(message);
                              } finally {
                                setRestoreLoading(null);
                              }
                            }}
                            className="h-11 w-11 rounded-full bg-white border border-emerald-300 hover:scale-110 hover:bg-emerald-500 transition-all group/btn shadow-none"
                            title={t('common.restore')}
                            disabled={restoreLoading === site.id}
                          >
                            {restoreLoading === site.id ? (
                              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                            ) : (
                              <RotateCcw className="w-5 h-5 text-emerald-500 group-hover/btn:text-white" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-[#8a6d1c] bg-[#d4af37]/10 px-2 py-1 rounded border border-[#d4af37]/20">
                        {site.code}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                        <TypeIcon className="w-3 h-3" />
                        {typeInfo.label}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">{site.name}</h3>

                    {site.patron_saint && (
                      <p className="text-sm text-[#8a6d1c] mb-2 line-clamp-1">🙏 {site.patron_saint}</p>
                    )}

                    <div className="flex items-start gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#d4af37]" />
                      <span className="line-clamp-2">
                        {site.address && `${site.address}, `}
                        {site.district && `${site.district}, `}
                        {site.province}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-white rounded-2xl border border-[#d4af37]/20">
              <div className="text-sm text-gray-500">
                {t('sites.showing')} {((pagination.page - 1) * pagination.limit) + 1} {t('sites.to')} {Math.min(pagination.page * pagination.limit, pagination.total)} {t('sites.of')} {pagination.total} {t('sites.sites')}
              </div>

              <ShadcnPagination className="justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className={`cursor-pointer ${currentPage === pageNum ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white hover:text-white hover:brightness-110' : ''}`}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < pagination.totalPages && handlePageChange(currentPage + 1)}
                      className={currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </ShadcnPagination>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <SiteEditModal
        site={siteForEdit}
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSiteForEdit(null); }}
        onSuccess={() => fetchSites()}
      />

      {/* Delete Confirm Dialog */}
      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDeleteConfirmOpen(false);
            setSiteToDelete(null);
          }
        }}
      >
        <AlertDialogContent className="p-0 overflow-hidden border-[#d4af37]/20 rounded-2xl max-w-md">
          {siteToDelete && (
            <>
              <AlertDialogHeader className="px-6 py-4 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37]">
                <div className="flex items-center justify-between">
                  <div className="text-white text-left">
                    <AlertDialogTitle className="text-lg font-semibold">{t('delete.title')}</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm opacity-80 text-white/90">
                      {siteToDelete.code} - {siteToDelete.name}
                    </AlertDialogDescription>
                  </div>
                  <button
                    onClick={() => { setIsDeleteConfirmOpen(false); setSiteToDelete(null); }}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </AlertDialogHeader>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-full bg-red-50 border border-red-200">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-gray-600">
                    {t('delete.confirm')}
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#d4af37]/20">
                  <Button
                    variant="outline"
                    onClick={() => { setIsDeleteConfirmOpen(false); setSiteToDelete(null); }}
                    disabled={deleteLoading}
                    className="flex-1 px-4 py-2.5 border-[#d4af37]/30 text-[#8a6d1c] rounded-xl hover:bg-[#d4af37]/10"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!siteToDelete) return;
                      try {
                        setDeleteLoading(true);
                        const response = await AdminService.deleteSite(siteToDelete.id);
                        if (response.success) {
                          showToast('success', t('toast.deleteSiteSuccess'), t('toast.deleteSiteSuccessMsg'));
                          fetchSites();
                        } else {
                          showToast('error', t('toast.deleteSiteFailed'), response.message || t('toast.deleteSiteFailedMsg'));
                          setError(response.message || 'Failed to delete site');
                        }
                      } catch (error) {
                        const message = error instanceof Error ? error.message : t('toast.deleteSiteFailedMsg');
                        showToast('error', t('toast.deleteSiteFailed'), message);
                        setError(message);
                      } finally {
                        setDeleteLoading(false);
                        setIsDeleteConfirmOpen(false);
                        setSiteToDelete(null);
                      }
                    }}
                    disabled={deleteLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50"
                  >
                    {deleteLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> {t('delete.deleting')}</>
                    ) : (
                      <><Trash2 className="w-4 h-4" /> {t('delete.deleteSite')}</>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};