import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpCircle,
  Calendar as CalendarIcon,
  Landmark,
  AlertTriangle,
  X,
  Eye,
  User,
  CreditCard,
  CalendarDays,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminService } from '../../../services/admin.service';
import { ApiService } from '../../../services/api.service';
import {
  Withdrawal,
  TransactionStatus,
  BankInfo,
} from '../../../types/admin.types';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { extractErrorMessage } from '../../../lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const WithdrawalsTable: React.FC = () => {
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const tRef = useRef(t);
  tRef.current = t;

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [banks, setBanks] = useState<BankInfo[]>([]);

  const [statusFilter, setStatusFilter] = useState<TransactionStatus | ''>('');
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const limit = 10;

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setShowDetailModal(false);
      setSelectedWithdrawal(null);
    }
  };

  // Fetch banks on mount
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await ApiService.getBanks();
        if (response.success && response.data) {
          setBanks(response.data);
        }
      } catch (err) {
        console.error('Error fetching banks:', err);
      }
    };
    fetchBanks();
  }, []);

  const fetchWithdrawals = useCallback(async (showSuccessToast = false) => {
    setLoading(true);
    try {
      const response = await AdminService.getWalletWithdrawals({
        page: currentPage,
        limit,
        status: statusFilter || undefined,
        date_from: fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined,
        date_to: toDate ? format(toDate, 'yyyy-MM-dd') : undefined,
      });
      if (response.success && response.data) {
        setWithdrawals(response.data.withdrawals);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
        if (showSuccessToast) {
          showToast('success', tRef.current('toast.refreshSuccess'), tRef.current('toast.refreshSuccessMsg'));
        }
      } else {
        showToast('error', tRef.current('wd.title'), response.message || tRef.current('wd.loadError'));
      }
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
      showToast('error', tRef.current('wd.title'), extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [showToast, currentPage, limit, statusFilter, fromDate, toDate]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handlePageChange = (page: number) => {
    if (page >= 1) {
      setCurrentPage(page);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('vi-VN').format(parseFloat(amount)) + ' ₫';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'pending': return <Clock className="w-3.5 h-3.5" />;
      case 'failed': return <XCircle className="w-3.5 h-3.5" />;
    }
  };

  const getStatusStyle = (status: TransactionStatus) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'failed': return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  const getStatusLabel = (status: TransactionStatus) => {
    const labels: Record<string, string> = {
      completed: t('txn.status.completed'),
      pending: t('txn.status.pending'),
      failed: t('txn.status.failed'),
    };
    return labels[status] || status;
  };

  const getBankInfo = (bankCode: string) => {
    // Try to match by bin first (e.g., "970423"), then by code (e.g., "VBA")
    return banks.find(b => b.bin === bankCode || b.code === bankCode);
  };

  return (
    <>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('wd.title')}</h1>
          <p className="text-slate-600 mt-1">{t('wd.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => fetchWithdrawals(true)}
          disabled={loading}
          className="flex items-center gap-2 h-10 px-4 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white font-medium rounded-lg hover:brightness-110 transition-all disabled:opacity-50 shadow-sm shadow-[#d4af37]/20"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </button>
      </div>

      {/* Filters — aligned with Site Management */}
      <div className="bg-white rounded-2xl border border-[#d4af37]/20 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-end">
          <div className="flex flex-wrap items-end gap-4 flex-1">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-medium">{t('wd.col.status')}</p>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#8a6d1c]/50 shrink-0" />
                <Select
                  value={statusFilter || 'all'}
                  onValueChange={(value) => {
                    setStatusFilter(value === 'all' ? '' : (value as TransactionStatus));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[200px] h-11 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-gray-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all cursor-pointer">
                    <SelectValue placeholder={t('txn.allStatuses')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('txn.allStatuses')}</SelectItem>
                    <SelectItem value="completed">{t('txn.status.completed')}</SelectItem>
                    <SelectItem value="pending">{t('txn.status.pending')}</SelectItem>
                    <SelectItem value="failed">{t('txn.status.failed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 p-1 bg-[#f5f3ee] border border-[#d4af37]/20 rounded-xl">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                      fromDate
                        ? 'border-[#d4af37] text-[#8a6d1c] bg-white'
                        : 'border-[#d4af37]/30 text-slate-500 bg-white hover:bg-[#d4af37]/5'
                    }`}
                  >
                    <CalendarIcon className="w-4 h-4 text-[#d4af37]" />
                    {fromDate ? format(fromDate, 'dd/MM/yyyy') : t('dashboard.fromDate')}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-[#d4af37]/20 rounded-xl overflow-hidden" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={(d) => {
                      setFromDate(d);
                      setCurrentPage(1);
                      if (d && toDate && d > toDate) setToDate(undefined);
                    }}
                    disabled={toDate ? { after: toDate } : undefined}
                    initialFocus
                    locale={language === 'vi' ? vi : enUS}
                    className="bg-white"
                  />
                </PopoverContent>
              </Popover>
              {fromDate && (
                <button
                  type="button"
                  onClick={() => { setFromDate(undefined); setCurrentPage(1); }}
                  className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <span className="text-slate-400">-</span>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                      toDate
                        ? 'border-[#d4af37] text-[#8a6d1c] bg-white'
                        : 'border-[#d4af37]/30 text-slate-500 bg-white hover:bg-[#d4af37]/5'
                    }`}
                  >
                    <CalendarIcon className="w-4 h-4 text-[#d4af37]" />
                    {toDate ? format(toDate, 'dd/MM/yyyy') : t('dashboard.toDate')}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-[#d4af37]/20 rounded-xl overflow-hidden" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(d) => {
                      setToDate(d);
                      setCurrentPage(1);
                      if (d && fromDate && d < fromDate) setFromDate(undefined);
                    }}
                    disabled={fromDate ? { before: fromDate } : undefined}
                    initialFocus
                    locale={language === 'vi' ? vi : enUS}
                    className="bg-white"
                  />
                </PopoverContent>
              </Popover>
              {toDate && (
                <button
                  type="button"
                  onClick={() => { setToDate(undefined); setCurrentPage(1); }}
                  className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-500 lg:text-right shrink-0 pb-0.5">
            {total} {t('wd.totalSuffix')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#d4af37]/20">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f5f3ee]/50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('wd.col.user')}</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('wd.col.amount')}</th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('wd.col.status')}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('wd.col.bank')}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('wd.col.description')}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('wd.col.date')}</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((__, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${50 + Math.random() * 50}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : withdrawals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <ArrowUpCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-medium text-slate-500">{t('wd.noData')}</p>
                </td>
              </tr>
            ) : (
              withdrawals.map((wd) => (
                <tr key={wd.id} className="hover:bg-[#f5f3ee]/50 transition-colors">
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {wd.user.avatar_url ? (
                        <img src={wd.user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-[#8a6d1c]">{wd.user.full_name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]">{wd.user.full_name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[120px]">{wd.user.email}</p>
                      </div>
                    </div>
                  </td>
                  {/* Amount */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(wd.amount)}</span>
                  </td>
                  {/* Status */}
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusStyle(wd.status)}`}>
                      {getStatusIcon(wd.status)}
                      {getStatusLabel(wd.status)}
                    </span>
                  </td>
                  {/* Bank Info */}
                  <td className="px-6 py-4">
                    {wd.bank_info ? (
                      <div className="flex items-center gap-2.5">
                        {getBankInfo(wd.bank_info.bank_code)?.logo && (
                          <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-white to-slate-50 border border-slate-200 flex items-center justify-center p-1.5 shrink-0 shadow-sm hover:shadow-md transition-all hover:scale-105">
                            <img 
                              src={getBankInfo(wd.bank_info.bank_code)?.logo} 
                              alt={wd.bank_info.bank_code}
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-transparent to-slate-100/10 pointer-events-none" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800">
                            {getBankInfo(wd.bank_info.bank_code)?.short_name || wd.bank_info.bank_code}
                          </p>
                          <p className="text-xs text-slate-400 truncate max-w-[100px] font-mono">{wd.bank_info.account_number}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  {/* Description / Error */}
                  <td className="px-6 py-4">
                    {wd.error_message ? (
                      <div className="flex items-start gap-1.5 max-w-[220px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-rose-600 truncate" title={wd.error_message}>{wd.error_message}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 max-w-[220px] truncate" title={wd.description}>{wd.description}</p>
                    )}
                  </td>
                  {/* Date */}
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-500">{formatDate(wd.created_at)}</span>
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedWithdrawal(wd);
                        setShowDetailModal(true);
                      }}
                      title="Xem chi tiết"
                      className="p-1.5 text-slate-400 hover:text-[#d4af37] bg-slate-50 hover:bg-[#d4af37]/10 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            {t('txn.showing')} {((currentPage - 1) * limit) + 1}–{Math.min(currentPage * limit, total)} {t('txn.of')} {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((page, idx, arr) => (
                <React.Fragment key={page}>
                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                    <span className="px-1 text-slate-400">…</span>
                  )}
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}
      </div>
    </div>

    {/* Withdrawal Detail Modal */}
    <Dialog open={showDetailModal} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden border-[#d4af37]/20 rounded-2xl p-0 gap-0 [&>button]:hidden">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 text-left">
              <DialogTitle className="text-lg font-semibold text-slate-900">
                {t('wd.title')}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t('wd.title')}
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowDetailModal(false)}
              className="rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          {selectedWithdrawal && (
            <div className="space-y-5">
              {/* Amount hero */}
              <div className="bg-gradient-to-br from-[#f5f3ee] to-[#ede8db] rounded-2xl p-5 text-center border border-[#d4af37]/15">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#8a6d1c]/70 mb-2">
                  Số tiền rút
                </p>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {formatCurrency(selectedWithdrawal.amount)}
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge
                    variant="outline"
                    className={`gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(selectedWithdrawal.status)}`}
                  >
                    {getStatusIcon(selectedWithdrawal.status)}
                    {getStatusLabel(selectedWithdrawal.status)}
                  </Badge>
                </div>
              </div>

              {/* User */}
              <div className="bg-[#f5f3ee] rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    {selectedWithdrawal.user.avatar_url ? (
                      <img
                        src={selectedWithdrawal.user.avatar_url}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#d4af37]/30"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {selectedWithdrawal.user.full_name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {selectedWithdrawal.user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bank info */}
              {selectedWithdrawal.bank_info && (
                <div className="bg-gradient-to-br from-[#f5f3ee] via-white to-[#f5f3ee] rounded-xl p-4 border border-[#d4af37]/20">
                  <div className="flex items-center gap-2 text-[#8a6d1c] mb-3">
                    <Landmark className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Thông tin ngân hàng</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    {getBankInfo(selectedWithdrawal.bank_info.bank_code)?.logo && (
                      <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 flex items-center justify-center p-2.5 shrink-0 shadow-md hover:shadow-lg transition-shadow">
                        <img 
                          src={getBankInfo(selectedWithdrawal.bank_info.bank_code)?.logo} 
                          alt={selectedWithdrawal.bank_info.bank_code}
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-transparent to-slate-100/20 pointer-events-none" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-slate-900 mb-0.5">
                        {getBankInfo(selectedWithdrawal.bank_info.bank_code)?.name || selectedWithdrawal.bank_info.bank_code}
                      </p>
                      <p className="text-xs text-[#8a6d1c] font-medium">
                        {getBankInfo(selectedWithdrawal.bank_info.bank_code)?.short_name}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 bg-white/60 rounded-lg p-3 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Số tài khoản</span>
                      <span className="text-sm text-slate-900 font-bold font-mono">{selectedWithdrawal.bank_info.account_number}</span>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Chủ tài khoản</span>
                      <span className="text-sm text-slate-900 font-semibold">{selectedWithdrawal.bank_info.account_name}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-[#f5f3ee] rounded-xl p-4">
                <div className="flex items-center gap-2 text-[#8a6d1c] mb-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Mô tả</span>
                </div>
                <p className="text-sm font-medium text-slate-800 break-words leading-relaxed">
                  {selectedWithdrawal.description}
                </p>
              </div>

              {/* Error Message */}
              {selectedWithdrawal.error_message && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Lỗi</span>
                  </div>
                  <p className="text-sm text-red-600 leading-relaxed">
                    {selectedWithdrawal.error_message}
                  </p>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f5f3ee] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-[#8a6d1c] mb-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Ngày tạo</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{formatDate(selectedWithdrawal.created_at)}</p>
                </div>
                <div className="bg-[#f5f3ee] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-[#8a6d1c] mb-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Cập nhật</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{formatDate(selectedWithdrawal.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedWithdrawal && (
          <div className="p-4 border-t border-slate-200 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDetailModal(false)}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Đóng
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};
