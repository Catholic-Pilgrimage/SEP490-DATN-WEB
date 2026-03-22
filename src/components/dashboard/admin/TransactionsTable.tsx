import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
  ArrowUpCircle,
  ArrowDownCircle,
  Lock,
  Unlock,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Clock,
  CreditCard,
  RotateCcw,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminService } from '../../../services/admin.service';
import {
  WalletTransaction,
  TransactionType,
  TransactionStatus,
  TransactionReferenceType,
} from '../../../types/admin.types';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';

export const TransactionsTable: React.FC = () => {
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const tRef = useRef(t);
  tRef.current = t;

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [search, setSearch] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | ''>('');
  const [refTypeFilter, setRefTypeFilter] = useState<TransactionReferenceType | ''>('');
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search.trim());
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTransactions = useCallback(async (showSuccessToast = false) => {
    setLoading(true);
    try {
      const response = await AdminService.getWalletTransactions({
        page: currentPage,
        limit,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        reference_type: refTypeFilter || undefined,
        search: searchDebounce || undefined,
        date_from: fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined,
        date_to: toDate ? format(toDate, 'yyyy-MM-dd') : undefined,
      });
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
        if (showSuccessToast) {
          showToast('success', tRef.current('toast.refreshSuccess'), tRef.current('toast.refreshSuccessMsg'));
        }
      } else {
        showToast('error', tRef.current('txn.title'), response.message || tRef.current('txn.loadError'));
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      showToast('error', tRef.current('txn.title'), tRef.current('txn.loadError'));
    } finally {
      setLoading(false);
    }
  }, [showToast, currentPage, limit, typeFilter, statusFilter, refTypeFilter, searchDebounce, fromDate, toDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

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

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'escrow_lock': return <Lock className="w-4 h-4" />;
      case 'escrow_refund': return <Unlock className="w-4 h-4" />;
      case 'withdraw': return <ArrowUpCircle className="w-4 h-4" />;
      case 'deposit': case 'topup': return <ArrowDownCircle className="w-4 h-4" />;
      case 'penalty_applied': return <AlertTriangle className="w-4 h-4" />;
      case 'penalty_received': return <CreditCard className="w-4 h-4" />;
      case 'penalty_refunded': return <RotateCcw className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const getTypeStyle = (type: TransactionType) => {
    switch (type) {
      case 'escrow_lock': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'escrow_refund': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'withdraw': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'deposit': case 'topup': return 'bg-green-50 text-green-700 border-green-200';
      case 'penalty_applied': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'penalty_received': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'penalty_refunded': return 'bg-violet-50 text-violet-700 border-violet-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getTypeLabel = (type: TransactionType) => {
    const labels: Record<string, string> = {
      escrow_lock: t('txn.type.escrowLock'),
      escrow_refund: t('txn.type.escrowRefund'),
      withdraw: t('txn.type.withdraw'),
      deposit: t('txn.type.deposit'),
      topup: t('txn.type.topup'),
      penalty_applied: t('txn.type.penaltyApplied'),
      penalty_received: t('txn.type.penaltyReceived'),
      penalty_refunded: t('txn.type.penaltyRefunded'),
    };
    return labels[type] || type;
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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('txn.title')}</h1>
          <p className="text-slate-600 mt-1">{t('txn.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => fetchTransactions(true)}
          disabled={loading}
          className="flex items-center gap-2 h-10 px-4 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white font-medium rounded-lg hover:brightness-110 transition-all disabled:opacity-50 shadow-sm shadow-[#d4af37]/20"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#d4af37]/20 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:flex-wrap gap-4 lg:items-end lg:justify-between">
            <div className="flex flex-wrap items-end gap-4 flex-1">
              <div className="flex-1 min-w-[250px]">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#8a6d1c] transition-colors" />
                  <Input
                    type="text"
                    placeholder={t('txn.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-11 pl-12 pr-4 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-gray-700 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#d4af37] focus-visible:border-[#d4af37] hover:border-[#d4af37]/50 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#8a6d1c]/50 shrink-0" />
                <Select
                  value={typeFilter || 'all'}
                  onValueChange={(value) => {
                    setTypeFilter(value === 'all' ? '' : (value as TransactionType));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[220px] h-11 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-gray-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all cursor-pointer">
                    <SelectValue placeholder={t('txn.allTypes')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('txn.allTypes')}</SelectItem>
                    <SelectItem value="escrow_lock">{t('txn.type.escrowLock')}</SelectItem>
                    <SelectItem value="escrow_refund">{t('txn.type.escrowRefund')}</SelectItem>
                    <SelectItem value="withdraw">{t('txn.type.withdraw')}</SelectItem>
                    <SelectItem value="deposit">{t('txn.type.deposit')}</SelectItem>
                    <SelectItem value="topup">{t('txn.type.topup')}</SelectItem>
                    <SelectItem value="penalty_applied">{t('txn.type.penaltyApplied')}</SelectItem>
                    <SelectItem value="penalty_received">{t('txn.type.penaltyReceived')}</SelectItem>
                    <SelectItem value="penalty_refunded">{t('txn.type.penaltyRefunded')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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

              <Select
                value={refTypeFilter || 'all'}
                onValueChange={(value) => {
                  setRefTypeFilter(value === 'all' ? '' : (value as TransactionReferenceType));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[220px] h-11 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-gray-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all cursor-pointer">
                  <SelectValue placeholder={t('txn.allRefTypes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('txn.allRefTypes')}</SelectItem>
                  <SelectItem value="planner">{t('txn.refType.planner')}</SelectItem>
                  <SelectItem value="planner_deposit">{t('txn.refType.plannerDeposit')}</SelectItem>
                  <SelectItem value="planner_penalty">{t('txn.refType.plannerPenalty')}</SelectItem>
                  <SelectItem value="payos_payout">{t('txn.refType.payosPayout')}</SelectItem>
                  <SelectItem value="payos_topup">{t('txn.refType.payosTopup')}</SelectItem>
                  <SelectItem value="wallet">{t('txn.refType.wallet')}</SelectItem>
                </SelectContent>
              </Select>

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
              {total} {t('txn.totalSuffix')}
            </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#d4af37]/20">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f5f3ee]/50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('txn.col.code')}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('txn.col.user')}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('txn.col.type')}</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('txn.col.amount')}</th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('txn.col.status')}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('txn.col.description')}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('txn.col.date')}</th>
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
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <CreditCard className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-medium text-slate-500">{t('txn.noData')}</p>
                </td>
              </tr>
            ) : (
              transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-[#f5f3ee]/50 transition-colors">
                  {/* Code */}
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">{txn.code}</span>
                  </td>
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {txn.wallet.user.avatar_url ? (
                        <img src={txn.wallet.user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-[#8a6d1c]">{txn.wallet.user.full_name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]">{txn.wallet.user.full_name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[120px]">{txn.wallet.user.email}</p>
                      </div>
                    </div>
                  </td>
                  {/* Type */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getTypeStyle(txn.type)}`}>
                      {getTypeIcon(txn.type)}
                      {getTypeLabel(txn.type)}
                    </span>
                  </td>
                  {/* Amount */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(txn.amount)}</span>
                  </td>
                  {/* Status */}
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusStyle(txn.status)}`}>
                      {getStatusIcon(txn.status)}
                      {getStatusLabel(txn.status)}
                    </span>
                  </td>
                  {/* Description */}
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-600 max-w-[200px] truncate" title={txn.description}>{txn.description}</p>
                  </td>
                  {/* Date */}
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-500">{formatDate(txn.created_at)}</span>
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
