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
} from 'lucide-react';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AdminService } from '../../../services/admin.service';
import {
  Withdrawal,
  TransactionStatus,
} from '../../../types/admin.types';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
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

  const [statusFilter, setStatusFilter] = useState<TransactionStatus | ''>('');
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const limit = 10;

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
      showToast('error', tRef.current('wd.title'), tRef.current('wd.loadError'));
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

  return (
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
                    }}
                    initialFocus
                    locale={language === 'vi' ? vi : enUS}
                    className="bg-white"
                  />
                </PopoverContent>
              </Popover>

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
                    }}
                    initialFocus
                    locale={language === 'vi' ? vi : enUS}
                    className="bg-white"
                  />
                </PopoverContent>
              </Popover>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((__, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${50 + Math.random() * 50}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : withdrawals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
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
                      <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-700">{wd.bank_info.bank_code}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[100px]">{wd.bank_info.account_number}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[100px]">{wd.bank_info.account_name}</p>
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
  );
};
