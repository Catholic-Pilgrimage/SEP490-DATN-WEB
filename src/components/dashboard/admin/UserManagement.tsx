import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Filter,
  User as UserIcon,
  UserCheck,
  Crown,
  Eye,
  Ban,
  CheckCircle,
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

// shadcn/ui components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
      if (roleFilter && roleFilter !== 'all') params.role = roleFilter as UserListParams['role'];
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter as UserListParams['status'];

      const response = await AdminService.getUsers(params);

      if (response.success && response.data) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to load users');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load users';
      setError(message);
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update status';
      showToast('error', t('common.error'), message);
      setError(message);
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl">{t('users.title')}</h1>
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#8a6d1c] transition-colors" />
              <Input
                type="text"
                placeholder={t('users.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-gray-700 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#d4af37] focus-visible:border-[#d4af37] hover:border-[#d4af37]/50 transition-all h-11"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#8a6d1c]/50" />
            <Select
              value={roleFilter}
              onValueChange={(value) => { setRoleFilter(value); setCurrentPage(1); }}
            >
              <SelectTrigger className="w-[180px] h-11 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-gray-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all">
                <SelectValue placeholder={t('users.allRoles')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('users.allRoles')}</SelectItem>
                <SelectItem value="admin">{t('role.admin')}</SelectItem>
                <SelectItem value="manager">{t('role.manager')}</SelectItem>
                <SelectItem value="pilgrim">{t('role.pilgrim')}</SelectItem>
                <SelectItem value="local_guide">{t('role.localGuide')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}
          >
            <SelectTrigger className="w-[180px] h-11 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-gray-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all">
              <SelectValue placeholder={t('users.allStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('users.allStatus')}</SelectItem>
              <SelectItem value="active">{t('status.active')}</SelectItem>
              <SelectItem value="banned">{t('status.banned')}</SelectItem>
            </SelectContent>
          </Select>
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
          <div className="overflow-x-auto rounded-md border border-[#d4af37]/20">
            <Table>
              <TableHeader className="bg-[#f5f3ee]">
                <TableRow className="border-b-[#d4af37]/30 hover:bg-transparent">
                  <TableHead className="font-semibold text-[#8a6d1c] h-12">{t('table.user')}</TableHead>
                  <TableHead className="font-semibold text-[#8a6d1c] h-12">{t('table.email')}</TableHead>
                  <TableHead className="font-semibold text-[#8a6d1c] h-12">{t('table.phone')}</TableHead>
                  <TableHead className="font-semibold text-[#8a6d1c] text-center h-12">{t('table.role')}</TableHead>
                  <TableHead className="font-semibold text-[#8a6d1c] text-center h-12">{t('table.status')}</TableHead>
                  <TableHead className="font-semibold text-[#8a6d1c] text-center h-12">{t('table.created')}</TableHead>
                  <TableHead className="font-semibold text-[#8a6d1c] text-right h-12">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const roleInfo = getRoleInfo(user.role);
                  const RoleIcon = roleInfo.icon;

                  return (
                    <TableRow key={user.id} className="hover:bg-slate-50 border-b-[#d4af37]/10 transition-colors">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              aria-label="User"
                              className="w-10 h-10 rounded-full bg-[#d4af37] border border-[#d4af37]/30 flex items-center justify-center"
                            >
                              <UserIcon className="w-5 h-5 text-white/90" />
                            </div>
                          )}
                          <span className="font-medium text-slate-900">{user.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 py-3">{user.email}</TableCell>
                      <TableCell className="text-slate-600 py-3">{user.phone || '—'}</TableCell>
                      <TableCell className="text-center py-3">
                        <span className={`inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit mx-auto ${roleInfo.color}`}>
                          <RoleIcon className="w-3 h-3" />
                          {roleInfo.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <Badge variant={user.status === 'active' ? 'outline' : 'destructive'} className={`mx-auto ${user.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'} hover:opacity-80`}>
                          {user.status === 'active' ? t('status.active') : t('status.banned')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-slate-600 py-3">{formatDate(user.created_at)}</TableCell>
                      <TableCell className="text-right py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewUser(user.id)}
                            className="hover:bg-[#d4af37]/10 text-gray-400 hover:text-[#8a6d1c]"
                            title={t('common.view')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {/* Ban/Unban button - không hiện cho admin */}
                          {user.role !== 'admin' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleStatusClick(user)}
                              className={`${user.status === 'active'
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
                                : 'bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700'
                                }`}
                              title={user.status === 'active' ? t('user.banButton') : t('user.unbanButton')}
                            >
                              {user.status === 'active' ? (
                                <Ban className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#d4af37]/20 bg-[#f5f3ee]">
            <div className="text-sm text-gray-500">
              {t('users.showing')} {((pagination.page - 1) * pagination.limit) + 1} {t('users.to')} {Math.min(pagination.page * pagination.limit, pagination.total)} {t('users.of')} {pagination.total} {t('users.users')}
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
                        className={`cursor-pointer ${currentPage === pageNum ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white hover:text-white hover:brightness-110' : ''
                          }`}
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
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        userId={selectedUserId}
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
        onEdit={handleEditUser}
      />

      {/* User Edit Modal */}
      <UserEditModal
        user={selectedUserForEdit}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />

      {/* Confirm Ban/Unban Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={(open) => {
        if (!open) {
          setIsConfirmOpen(false);
          setUserToToggle(null);
        }
      }}>
        <AlertDialogContent className="p-0 overflow-hidden border-[#d4af37]/20 rounded-2xl max-w-md">
          {userToToggle && (
            <>
              <AlertDialogHeader className="px-6 py-4 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37]">
                <div className="flex items-center justify-between">
                  <div className="text-white text-left">
                    <AlertDialogTitle className="text-lg font-semibold">
                      {userToToggle.status === 'active' ? t('user.banTitle') : t('user.unbanTitle')}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm opacity-80 text-white/90">
                      {userToToggle.full_name}
                    </AlertDialogDescription>
                  </div>
                  <button
                    onClick={() => { setIsConfirmOpen(false); setUserToToggle(null); }}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </AlertDialogHeader>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-full flex-shrink-0 ${userToToggle.status === 'active' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                    <AlertTriangle className={`w-6 h-6 ${userToToggle.status === 'active' ? 'text-red-500' : 'text-green-500'}`} />
                  </div>
                  <p className="text-gray-600 text-left">
                    {userToToggle.status === 'active' ? t('user.banConfirm') : t('user.unbanConfirm')}
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#d4af37]/20">
                  <Button
                    variant="outline"
                    onClick={() => { setIsConfirmOpen(false); setUserToToggle(null); }}
                    disabled={statusLoading}
                    className="flex-1 px-4 py-2.5 border-[#d4af37]/30 text-[#8a6d1c] rounded-xl hover:bg-[#d4af37]/10"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={handleConfirmToggleStatus}
                    disabled={statusLoading}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl shadow-sm ${userToToggle.status === 'active'
                      ? 'bg-red-500 hover:bg-red-600 focus-visible:ring-red-500'
                      : 'bg-green-500 hover:bg-green-600 focus-visible:ring-green-500'
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