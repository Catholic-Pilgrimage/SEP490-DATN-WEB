import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Filter,
  User as UserIcon,
  UserCheck,
  Crown,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  AlertTriangle,
  X
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import { AdminUser, Pagination, UserListParams } from '../../../types/admin.types';
import { UserDetailModal } from './UserDetailModal';
import { UserEditModal } from './UserEditModal';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';

export const UserManagement: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // Modal states
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Edit modal states
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<AdminUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Status toggle states
  const [userToToggle, setUserToToggle] = useState<AdminUser | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // Debounce search
  const [searchDebounce, setSearchDebounce] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: UserListParams = {
        page: currentPage,
        limit: limit,
      };

      if (searchDebounce) params.search = searchDebounce;
      if (roleFilter) params.role = roleFilter as UserListParams['role'];
      if (statusFilter) params.status = statusFilter as UserListParams['status'];

      const response = await AdminService.getUsers(params);

      if (response.success && response.data) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to load users');
      }
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchDebounce, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleManualRefresh = async () => {
    await fetchUsers();
    showToast('success', t('toast.refreshSuccess'), t('toast.refreshSuccessMsg'));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (!pagination || newPage <= pagination.totalPages)) {
      setCurrentPage(newPage);
    }
  };

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUserId(null);
  };

  // Handler để mở Edit modal
  const handleEditUser = (user: AdminUser) => {
    setSelectedUserForEdit(user);
    setIsEditModalOpen(true);
  };

  // Handler để đóng Edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUserForEdit(null);
  };

  // Handler khi edit thành công - refresh lại danh sách
  // Toast đã được hiển thị trong UserEditModal nên không cần gọi lại ở đây
  const handleEditSuccess = () => {
    fetchUsers();
  };

  // Handler mở confirm dialog cho ban/unban
  const handleToggleStatusClick = (user: AdminUser) => {
    // Không cho phép thay đổi status của admin
    if (user.role === 'admin') return;
    setUserToToggle(user);
    setIsConfirmOpen(true);
  };

  // Handler xác nhận ban/unban
  const handleConfirmToggleStatus = async () => {
    if (!userToToggle) return;

    try {
      setStatusLoading(true);
      const newStatus = userToToggle.status === 'active' ? 'banned' : 'active';
      const response = await AdminService.updateUserStatus(userToToggle.id, { status: newStatus });

      if (response.success) {
        showToast('success', newStatus === 'active' ? t('toast.unbanUserSuccess') : t('toast.banUserSuccess'));
        fetchUsers(); // Refresh list
      } else {
        showToast('error', newStatus === 'active' ? t('toast.unbanUserFailed') : t('toast.banUserFailed'), response.message);
        setError(response.message || 'Failed to update status');
      }
    } catch (err: any) {
      showToast('error', t('common.error'), err?.error?.message);
      setError(err?.error?.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
      setIsConfirmOpen(false);
      setUserToToggle(null);
    }
  };

  const getRoleInfo = (role: string) => {
    const roles = {
      admin: { label: t('role.admin'), icon: Crown, color: 'bg-purple-100 text-purple-700' },
      manager: { label: t('role.manager'), icon: UserCheck, color: 'bg-blue-100 text-blue-700' },
      pilgrim: { label: t('role.pilgrim'), icon: UserIcon, color: 'bg-amber-100 text-amber-700' },
      local_guide: { label: t('role.localGuide'), icon: UserCheck, color: 'bg-green-100 text-green-700' }
    };
    return roles[role as keyof typeof roles] || roles.pilgrim;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-700 border-green-200',
      banned: 'bg-red-100 text-red-700 border-red-200'
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#8a6d1c]">{t('users.title')}</h1>
          <p className="text-gray-500 mt-1">{t('users.subtitle')}</p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white font-medium rounded-xl hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-[#d4af37]/20"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#d4af37]/20 p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#8a6d1c] transition-colors" />
              <input
                type="text"
                placeholder={t('users.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-gray-700 placeholder:text-gray-400 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#8a6d1c]/50" />
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-3 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-gray-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all cursor-pointer"
            >
              <option value="">{t('users.allRoles')}</option>
              <option value="admin">{t('role.admin')}</option>
              <option value="manager">{t('role.manager')}</option>
              <option value="pilgrim">{t('role.pilgrim')}</option>
              <option value="local_guide">{t('role.localGuide')}</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-3 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-gray-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all cursor-pointer"
          >
            <option value="">{t('users.allStatus')}</option>
            <option value="active">{t('status.active')}</option>
            <option value="banned">{t('status.banned')}</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#d4af37]/20 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <UserIcon className="w-12 h-12 mb-4 text-[#d4af37]/40" />
            <p>{t('users.noUsers')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f5f3ee] border-b-2 border-[#d4af37]/30">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#8a6d1c] border-r border-[#d4af37]/20">{t('table.user')}</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#8a6d1c] border-r border-[#d4af37]/20">{t('table.email')}</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#8a6d1c] border-r border-[#d4af37]/20">{t('table.phone')}</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-[#8a6d1c] border-r border-[#d4af37]/20">{t('table.role')}</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-[#8a6d1c] border-r border-[#d4af37]/20">{t('table.status')}</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-[#8a6d1c] border-r border-[#d4af37]/20">{t('table.created')}</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-[#8a6d1c]">{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4af37]/10">
                {users.map((user) => {
                  const roleInfo = getRoleInfo(user.role);
                  const RoleIcon = roleInfo.icon;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar_url || 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=50'}
                            alt={user.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span className="font-medium text-slate-900">{user.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{user.email}</td>
                      <td className="px-6 py-4 text-slate-600">{user.phone || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                          <RoleIcon className="w-3 h-3" />
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(user.status)}`}>
                          {user.status === 'active' ? t('status.active') : t('status.banned')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{formatDate(user.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewUser(user.id)}
                            className="p-2 hover:bg-[#d4af37]/10 rounded-lg transition-colors group"
                            title={t('common.view')}
                          >
                            <Eye className="w-4 h-4 text-gray-400 group-hover:text-[#8a6d1c]" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 hover:bg-[#d4af37]/10 rounded-lg transition-colors group"
                            title={t('common.edit')}
                          >
                            <Edit className="w-4 h-4 text-gray-400 group-hover:text-[#8a6d1c]" />
                          </button>
                          {/* Ban/Unban button - không hiện cho admin */}
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleStatusClick(user)}
                              className={`p-2 rounded-lg transition-colors group ${user.status === 'active'
                                ? 'hover:bg-red-50'
                                : 'hover:bg-green-50'
                                }`}
                              title={user.status === 'active' ? t('user.banButton') : t('user.unbanButton')}
                            >
                              {user.status === 'active' ? (
                                <Ban className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-slate-400 group-hover:text-green-600" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#d4af37]/20 bg-[#f5f3ee]">
            <div className="text-sm text-gray-500">
              {t('users.showing')} {((pagination.page - 1) * pagination.limit) + 1} {t('users.to')} {Math.min(pagination.page * pagination.limit, pagination.total)} {t('users.of')} {pagination.total} {t('users.users')}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-[#d4af37]/30 text-[#8a6d1c] hover:bg-[#d4af37]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                        ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white shadow-md'
                        : 'border border-[#d4af37]/30 text-[#8a6d1c] hover:bg-[#d4af37]/10'
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
                className="p-2 rounded-lg border border-[#d4af37]/30 text-[#8a6d1c] hover:bg-[#d4af37]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        userId={selectedUserId}
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
      />

      {/* User Edit Modal */}
      <UserEditModal
        user={selectedUserForEdit}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />

      {/* Confirm Ban/Unban Dialog */}
      {isConfirmOpen && userToToggle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setIsConfirmOpen(false); setUserToToggle(null); }}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-[#d4af37]/20 flex-shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37]">
              <div className="text-white">
                <h2 className="text-lg font-semibold">
                  {userToToggle.status === 'active' ? t('user.banTitle') : t('user.unbanTitle')}
                </h2>
                <p className="text-sm opacity-80">{userToToggle.full_name}</p>
              </div>
              <button
                onClick={() => { setIsConfirmOpen(false); setUserToToggle(null); }}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-full flex-shrink-0 ${userToToggle.status === 'active' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                  <AlertTriangle className={`w-6 h-6 ${userToToggle.status === 'active' ? 'text-red-500' : 'text-green-500'}`} />
                </div>
                <p className="text-gray-600">
                  {userToToggle.status === 'active' ? t('user.banConfirm') : t('user.unbanConfirm')}
                </p>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#d4af37]/20">
                <button
                  onClick={() => { setIsConfirmOpen(false); setUserToToggle(null); }}
                  disabled={statusLoading}
                  className="flex-1 px-4 py-2.5 border border-[#d4af37]/30 text-[#8a6d1c] rounded-xl hover:bg-[#d4af37]/10 transition-colors disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleConfirmToggleStatus}
                  disabled={statusLoading}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl transition-all disabled:opacity-50 shadow-sm ${userToToggle.status === 'active'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                    }`}
                >
                  {statusLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('edit.saving')}
                    </>
                  ) : (
                    <>
                      {userToToggle.status === 'active' ? (
                        <>
                          <Ban className="w-4 h-4" />
                          {t('user.banButton')}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          {t('user.unbanButton')}
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};