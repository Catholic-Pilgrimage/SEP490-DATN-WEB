import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    RefreshCw,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    User,
    MapPin,
    Church,
    Building,
    Mountain,
    Home,
    HelpCircle
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import {
    VerificationRequest,
    Pagination,
    VerificationListParams,
    VerificationStatus,
    SiteType,
    SiteRegion
} from '../../../types/admin.types';
import { VerificationDetailModal } from './VerificationDetailModal';

export const VerificationRequests: React.FC = () => {
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<VerificationStatus | ''>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);

    // Debounce search
    const [searchDebounce, setSearchDebounce] = useState('');

    // Detail modal
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(search);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params: VerificationListParams = {
                page: currentPage,
                limit,
                status: statusFilter,
                search: searchDebounce,
            };

            const response = await AdminService.getVerificationRequests(params);

            if (response.success && response.data) {
                setRequests(response.data.requests);
                setPagination(response.data.pagination);
            } else {
                setError(response.message || 'Failed to load verification requests');
            }
        } catch (err: any) {
            setError(err?.error?.message || 'Failed to load verification requests');
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, statusFilter, searchDebounce]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && pagination && page <= pagination.totalPages) {
            setCurrentPage(page);
        }
    };

    const getStatusInfo = (status: VerificationStatus) => {
        const statuses = {
            pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
            approved: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
            rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
        };
        return statuses[status] || statuses.pending;
    };

    const getTypeIcon = (type: SiteType) => {
        const icons = {
            church: Church,
            shrine: Mountain,
            monastery: Building,
            center: Home,
            other: HelpCircle
        };
        return icons[type] || HelpCircle;
    };

    const getRegionInfo = (region: SiteRegion) => {
        const regions = {
            Bac: { label: 'Miền Bắc', color: 'text-red-600' },
            Trung: { label: 'Miền Trung', color: 'text-yellow-600' },
            Nam: { label: 'Miền Nam', color: 'text-blue-600' }
        };
        return regions[region] || regions.Nam;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Verification Requests</h1>
                    <p className="text-slate-500 mt-1">Manage site verification requests from pilgrims</p>
                </div>
                <button
                    onClick={fetchRequests}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[250px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by code or site name..."
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value as VerificationStatus | ''); setCurrentPage(1); }}
                            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 flex items-center gap-2">
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Site</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Applicant</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                                No verification requests found
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.map((request) => {
                                            const statusInfo = getStatusInfo(request.status);
                                            const StatusIcon = statusInfo.icon;
                                            const TypeIcon = getTypeIcon(request.site_type);
                                            const regionInfo = getRegionInfo(request.site_region);

                                            return (
                                                <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                                                    {/* Code */}
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono text-sm font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded">
                                                            {request.code}
                                                        </span>
                                                    </td>

                                                    {/* Site */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                                <TypeIcon className="w-4 h-4 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900 text-sm">{request.site_name}</p>
                                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    <span>{request.site_province}</span>
                                                                    <span className={`font-medium ${regionInfo.color}`}>• {regionInfo.label}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Applicant */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {request.applicant.avatar_url ? (
                                                                <img
                                                                    src={request.applicant.avatar_url}
                                                                    alt={request.applicant.full_name}
                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                                                    <User className="w-4 h-4 text-white" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-slate-900 text-sm">{request.applicant.full_name}</p>
                                                                <p className="text-xs text-slate-500">{request.applicant.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                                            <StatusIcon className="w-3.5 h-3.5" />
                                                            {statusInfo.label}
                                                        </span>
                                                    </td>

                                                    {/* Date */}
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-600">{formatDate(request.created_at)}</span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedRequestId(request.id);
                                                                    setIsDetailModalOpen(true);
                                                                }}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, pagination.total)} of {pagination.total} requests
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${pageNum === currentPage
                                                ? 'bg-blue-600 text-white'
                                                : 'hover:bg-slate-100 text-slate-600'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
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

            {/* Detail Modal */}
            <VerificationDetailModal
                requestId={selectedRequestId}
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedRequestId(null);
                }}
                onSuccess={() => {
                    fetchRequests(); // Refresh list after approve/reject
                }}
            />
        </div>
    );
};
