import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    RefreshCw,
    Users,
    User,
    Mail,
    Phone,
    Plus,
    CheckCircle,
    XCircle,
    AlertCircle,
    Ban,
    UserCheck
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { LocalGuide, LocalGuideStatus } from '../../../types/manager.types';
import { LocalGuideFormModal } from './LocalGuideFormModal';

export const LocalGuides: React.FC = () => {
    const [guides, setGuides] = useState<LocalGuide[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(10);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<LocalGuideStatus | ''>('');

    // ============ MODAL STATE ============
    // isFormModalOpen: kiểm soát modal có đang mở hay không
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    // ============ TOGGLE STATUS STATE ============
    // togglingId: lưu ID của Local Guide đang được toggle status
    // Để hiển loading spinner trên nút cụ thể đó
    const [togglingId, setTogglingId] = useState<string | null>(null);

    // Debounce search
    const [searchDebounce, setSearchDebounce] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(search);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchLocalGuides = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await ManagerService.getLocalGuides({
                page: currentPage,
                limit,
                status: statusFilter,
                search: searchDebounce
            });

            if (response.success && response.data) {
                setGuides(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalItems(response.data.pagination.totalItems);
            } else {
                setError(response.message || 'Không thể tải danh sách Local Guide');
            }
        } catch (err: any) {
            // Check if manager has no site
            if (err?.error?.statusCode === 400) {
                setError('Bạn cần tạo địa điểm trước khi quản lý Local Guide');
            } else {
                setError(err?.error?.message || 'Không thể tải danh sách Local Guide');
            }
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, statusFilter, searchDebounce]);

    useEffect(() => {
        fetchLocalGuides();
    }, [fetchLocalGuides]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getStatusInfo = (status: LocalGuideStatus) => {
        // Chỉ có 2 trạng thái theo API:
        // - active: đang hoạt động (màu xanh)
        // - banned: bị cấm/khóa (màu đỏ)
        const statuses = {
            active: { label: 'Hoạt động', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
            banned: { label: 'Bị cấm', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
        };
        return statuses[status] || statuses.active;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // ============ TOGGLE STATUS HANDLER ============
    /**
     * Xử lý khi click nút Ban/Unban
     * 
     * Giải thích:
     * - Nếu đang active -> chuyển sang banned
     * - Nếu đang banned -> chuyển sang active
     * - Hiện confirm dialog trước khi thực hiện
     */
    const handleToggleStatus = async (guide: LocalGuide) => {
        // Bước 1: Xác định status mới (ngược với status hiện tại)
        const newStatus = guide.status === 'active' ? 'banned' : 'active';
        const actionText = newStatus === 'banned' ? 'cấm' : 'kích hoạt lại';

        // Bước 2: Hiện confirm dialog
        const confirmed = window.confirm(
            `Bạn có chắc muốn ${actionText} Local Guide "${guide.full_name}"?`
        );
        if (!confirmed) return;

        try {
            // Bước 3: Set loading cho nút cụ thể
            setTogglingId(guide.id);
            setError(null);

            // Bước 4: Gọi API
            const response = await ManagerService.updateLocalGuideStatus(
                guide.id,
                { status: newStatus }
            );

            // Bước 5: Nếu thành công, cập nhật danh sách
            if (response.success) {
                // Cách 1: Refresh toàn bộ danh sách
                fetchLocalGuides();
                // Hoặc Cách 2: Cập nhật trực tiếp trong state (nhanh hơn)
                // setGuides(prev => prev.map(g => 
                //     g.id === guide.id ? { ...g, status: newStatus } : g
                // ));
            } else {
                setError(response.message || 'Không thể cập nhật trạng thái');
            }
        } catch (err: any) {
            setError(err?.error?.message || 'Không thể cập nhật trạng thái');
        } finally {
            // Bước 6: Tắt loading
            setTogglingId(null);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Local Guides</h1>
                    <p className="text-slate-500 mt-1">Quản lý đội ngũ hướng dẫn viên địa phương</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchLocalGuides}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                    <button
                        onClick={() => setIsFormModalOpen(true)}  // Mở modal khi click
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm Local Guide
                    </button>
                </div>
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
                            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value as LocalGuideStatus | ''); setCurrentPage(1); }}
                            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="active">Hoạt động</option>
                            <option value="banned">Bị cấm</option>
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
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <>
                    {/* Content */}
                    {guides.length === 0 ? (
                        /* Empty State */
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Chưa có Local Guide nào
                            </h3>
                            <p className="text-slate-500 mb-6">
                                Bắt đầu thêm Local Guide để hỗ trợ người hành hương tại địa điểm của bạn
                            </p>
                            <button
                                onClick={() => setIsFormModalOpen(true)}  // Mở modal khi click
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                Thêm Local Guide đầu tiên
                            </button>
                        </div>
                    ) : (
                        /* Table */
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Local Guide</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Liên hệ</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày tạo</th>
                                            <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {guides.map((guide) => {
                                            const statusInfo = getStatusInfo(guide.status);
                                            const StatusIcon = statusInfo.icon;

                                            return (
                                                <tr key={guide.id} className="hover:bg-slate-50 transition-colors">
                                                    {/* Name */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                                                <User className="w-5 h-5 text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900">{guide.full_name}</p>
                                                                <p className="text-xs text-slate-500 font-mono">{guide.id.slice(0, 8)}...</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Contact */}
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                                <Mail className="w-4 h-4 text-slate-400" />
                                                                {guide.email}
                                                            </div>
                                                            {guide.phone && (
                                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                                    {guide.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                                            <StatusIcon className="w-3.5 h-3.5" />
                                                            {statusInfo.label}
                                                        </span>
                                                    </td>

                                                    {/* Created At */}
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-600">{formatDate(guide.created_at)}</span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {/* Nút Ban/Unban */}
                                                            <button
                                                                onClick={() => handleToggleStatus(guide)}
                                                                disabled={togglingId === guide.id}
                                                                className={`
                                                                    flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors
                                                                    disabled:opacity-50 disabled:cursor-not-allowed
                                                                    ${guide.status === 'active'
                                                                        ? 'border border-red-200 text-red-600 hover:bg-red-50'
                                                                        : 'border border-green-200 text-green-600 hover:bg-green-50'
                                                                    }
                                                                `}
                                                                title={guide.status === 'active' ? 'Cấm Local Guide' : 'Kích hoạt lại'}
                                                            >
                                                                {togglingId === guide.id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : guide.status === 'active' ? (
                                                                    <>
                                                                        <Ban className="w-4 h-4" />
                                                                        Cấm
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserCheck className="w-4 h-4" />
                                                                        Kích hoạt
                                                                    </>
                                                                )}
                                                            </button>

                                                            {/* Nút Chi tiết */}
                                                            <button
                                                                className="px-3 py-1.5 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                                                            >
                                                                Chi tiết
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Hiển thị {(currentPage - 1) * limit + 1} đến {Math.min(currentPage * limit, totalItems)} trong tổng số {totalItems} Local Guide
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
                                                    ? 'bg-blue-600 text-white'
                                                    : 'hover:bg-slate-100 text-slate-600'
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
                                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ============ MODAL ============ */}
            {/* Form Modal để tạo Local Guide mới */}
            <LocalGuideFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}  // Đóng modal
                onSuccess={() => {
                    // Khi tạo thành công:
                    // 1. Đóng modal (đã xử lý trong modal)
                    // 2. Refresh danh sách để hiện Local Guide mới
                    fetchLocalGuides();
                }}
            />
        </div>
    );
};
