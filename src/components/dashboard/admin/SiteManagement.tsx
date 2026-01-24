import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Church,
  Building,
  Mountain,
  Home,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import { AdminSite, Pagination, SiteListParams, SiteRegion, SiteType, SiteDetail } from '../../../types/admin.types';
import { SiteDetailModal } from './SiteDetailModal';
import { SiteEditModal } from './SiteEditModal';

export const SiteManagement: React.FC = () => {
  const [sites, setSites] = useState<AdminSite[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<SiteRegion | ''>('');
  const [typeFilter, setTypeFilter] = useState<SiteType | ''>('');
  const [activeFilter, setActiveFilter] = useState<boolean | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(9); // 3x3 grid

  // Detail modal states
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Edit modal states
  const [siteForEdit, setSiteForEdit] = useState<SiteDetail | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Delete states
  const [siteToDelete, setSiteToDelete] = useState<AdminSite | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce search
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

      const params: SiteListParams = {
        page: currentPage,
        limit: limit,
      };

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
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to load sites');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchDebounce, regionFilter, typeFilter, activeFilter]);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (!pagination || newPage <= pagination.totalPages)) {
      setCurrentPage(newPage);
    }
  };

  const getTypeInfo = (type: SiteType) => {
    const types = {
      church: { label: 'Church', icon: Church, color: 'bg-blue-100 text-blue-700' },
      shrine: { label: 'Shrine', icon: Mountain, color: 'bg-purple-100 text-purple-700' },
      monastery: { label: 'Monastery', icon: Building, color: 'bg-amber-100 text-amber-700' },
      center: { label: 'Center', icon: Home, color: 'bg-green-100 text-green-700' },
      other: { label: 'Other', icon: HelpCircle, color: 'bg-slate-100 text-slate-700' }
    };
    return types[type] || types.other;
  };

  const getRegionInfo = (region: SiteRegion) => {
    const regions = {
      Bac: { label: 'Miền Bắc', color: 'bg-red-50 text-red-600 border-red-200' },
      Trung: { label: 'Miền Trung', color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
      Nam: { label: 'Miền Nam', color: 'bg-blue-50 text-blue-600 border-blue-200' }
    };
    return regions[region] || regions.Nam;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Site Management</h1>
          <p className="text-slate-600 mt-1">Manage pilgrimage sites across Vietnam</p>
        </div>
        <button
          onClick={fetchSites}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, code, or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={regionFilter}
              onChange={(e) => { setRegionFilter(e.target.value as SiteRegion | ''); setCurrentPage(1); }}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Regions</option>
              <option value="Bac">Miền Bắc</option>
              <option value="Trung">Miền Trung</option>
              <option value="Nam">Miền Nam</option>
            </select>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as SiteType | ''); setCurrentPage(1); }}
            className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="church">Church</option>
            <option value="shrine">Shrine</option>
            <option value="monastery">Monastery</option>
            <option value="center">Center</option>
            <option value="other">Other</option>
          </select>

          {/* Active Filter */}
          <select
            value={activeFilter === '' ? '' : activeFilter.toString()}
            onChange={(e) => {
              const val = e.target.value;
              setActiveFilter(val === '' ? '' : val === 'true');
              setCurrentPage(1);
            }}
            className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
        </div>
      )}

      {/* Sites Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : sites.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-500">
          <MapPin className="w-12 h-12 mb-4 text-slate-300" />
          <p>No sites found</p>
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
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
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
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <MapPin className="w-12 h-12 text-slate-400" />
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${site.is_active
                        ? 'bg-green-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                        }`}>
                        {site.is_active ? (
                          <><CheckCircle className="w-3 h-3" /> Active</>
                        ) : (
                          <><XCircle className="w-3 h-3" /> Inactive</>
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
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedSiteId(site.id);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                          title="View"
                        >
                          <Eye className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={async () => {
                            // Load site detail trước khi mở edit modal
                            setEditLoading(true);
                            try {
                              const response = await AdminService.getSiteById(site.id);
                              if (response.success && response.data) {
                                setSiteForEdit(response.data);
                                setIsEditModalOpen(true);
                              }
                            } catch (err) {
                              console.error('Failed to load site for edit:', err);
                            } finally {
                              setEditLoading(false);
                            }
                          }}
                          className="p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                          title="Edit"
                          disabled={editLoading}
                        >
                          {editLoading ? (
                            <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                          ) : (
                            <Edit className="w-5 h-5 text-amber-600" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSiteToDelete(site);
                            setIsDeleteConfirmOpen(true);
                          }}
                          className="p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Code & Type */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {site.code}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                        <TypeIcon className="w-3 h-3" />
                        {typeInfo.label}
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-1">
                      {site.name}
                    </h3>

                    {/* Patron Saint */}
                    {site.patron_saint && (
                      <p className="text-sm text-slate-500 mb-2 line-clamp-1">
                        🙏 {site.patron_saint}
                      </p>
                    )}

                    {/* Address */}
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
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
            <div className="flex items-center justify-between px-6 py-4 bg-white rounded-2xl shadow-sm border border-slate-200">
              <div className="text-sm text-slate-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} sites
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
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
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium ${currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-200 hover:bg-slate-100'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Site Detail Modal */}
      <SiteDetailModal
        siteId={selectedSiteId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSiteId(null);
        }}
      />

      {/* Site Edit Modal */}
      <SiteEditModal
        site={siteForEdit}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSiteForEdit(null);
        }}
        onSuccess={() => {
          fetchSites(); // Refresh list after edit
        }}
      />

      {/* Delete Confirm Dialog */}
      {isDeleteConfirmOpen && siteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setIsDeleteConfirmOpen(false); setSiteToDelete(null); }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Delete Site</h3>
                <p className="text-sm text-slate-500">{siteToDelete.code} - {siteToDelete.name}</p>
              </div>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this site? This action will mark the site as inactive (soft delete).
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setIsDeleteConfirmOpen(false); setSiteToDelete(null); }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    setDeleteLoading(true);
                    const response = await AdminService.deleteSite(siteToDelete.id);
                    if (response.success) {
                      fetchSites();
                    } else {
                      setError(response.message || 'Failed to delete site');
                    }
                  } catch (err: any) {
                    setError(err?.error?.message || 'Failed to delete site');
                  } finally {
                    setDeleteLoading(false);
                    setIsDeleteConfirmOpen(false);
                    setSiteToDelete(null);
                  }
                }}
                disabled={deleteLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 className="w-4 h-4" /> Delete Site</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};