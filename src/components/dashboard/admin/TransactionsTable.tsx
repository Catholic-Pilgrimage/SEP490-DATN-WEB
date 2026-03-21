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
  Calendar,
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import {
  WalletTransaction,
  WalletTransactionParams,
  TransactionType,
  TransactionStatus,
  TransactionReferenceType,
} from '../../../types/admin.types';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';

export const TransactionsTable: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const tRef = useRef(t);
  tRef.current = t;

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | ''>('');
  const [refTypeFilter, setRefTypeFilter] = useState<TransactionReferenceType | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const limit = 10;

  const buildParams = useCallback((page: number): WalletTransactionParams => ({
    page,
    limit,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
    reference_type: refTypeFilter || undefined,
    search: search || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  }), [typeFilter, statusFilter, refTypeFilter, search, dateFrom, dateTo]);

  const fetchTransactions = useCallback(async (params: WalletTransactionParams = {}) => {
    setLoading(true);
    try {
      const response = await AdminService.getWalletTransactions({
        page: params.page || 1,
        limit,
        type: params.type || undefined,
        status: params.status || undefined,
        reference_type: params.reference_type || undefined,
        search: params.search || undefined,
        date_from: params.date_from || undefined,
        date_to: params.date_to || undefined,
      });
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
      } else {
        showToast('error', tRef.current('txn.title'), response.message || tRef.current('txn.loadError'));
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      showToast('error', tRef.current('txn.title'), tRef.current('txn.loadError'));
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTransactions({ page: 1 });
  }, [fetchTransactions]);

  const handleSearch = () => {
    fetchTransactions(buildParams(1));
  };

  const handlePageChange = (page: number) => {
    fetchTransactions(buildParams(page));
  };

  const handleFilterApply = () => {
    fetchTransactions(buildParams(1));
  };

  const handleReset = () => {
    setSearch('');
    setTypeFilter('');
    setStatusFilter('');
    setRefTypeFilter('');
    setDateFrom('');
    setDateTo('');
    fetchTransactions({ page: 1 });
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

  // Count active filters
  const activeFilterCount = [typeFilter, statusFilter, refTypeFilter, dateFrom, dateTo, search].filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#d4af37]/20">
      {/* Header */}
      <div className="p-6 border-b border-[#d4af37]/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('txn.title')}</h2>
            <p className="text-sm text-slate-500">{t('txn.subtitle')} ({total})</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                showFilters ? 'bg-[#d4af37]/10 text-[#8a6d1c] border-[#d4af37]/30' : 'text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              {t('txn.filter')}
              {activeFilterCount > 0 && (
                <span className="ml-1 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full bg-[#d4af37] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={() => fetchTransactions(buildParams(currentPage))}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#8a6d1c] bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg hover:bg-[#d4af37]/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-[#f5f3ee] rounded-xl border border-[#d4af37]/10 space-y-3">
            {/* Row 1: Search + Type + Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={t('txn.searchPlaceholder')}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] bg-white"
                />
              </div>

              {/* Type filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TransactionType | '')}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] bg-white"
              >
                <option value="">{t('txn.allTypes')}</option>
                <option value="escrow_lock">{t('txn.type.escrowLock')}</option>
                <option value="escrow_refund">{t('txn.type.escrowRefund')}</option>
                <option value="withdraw">{t('txn.type.withdraw')}</option>
                <option value="deposit">{t('txn.type.deposit')}</option>
                <option value="topup">{t('txn.type.topup')}</option>
                <option value="penalty_applied">{t('txn.type.penaltyApplied')}</option>
                <option value="penalty_received">{t('txn.type.penaltyReceived')}</option>
                <option value="penalty_refunded">{t('txn.type.penaltyRefunded')}</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | '')}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] bg-white"
              >
                <option value="">{t('txn.allStatuses')}</option>
                <option value="completed">{t('txn.status.completed')}</option>
                <option value="pending">{t('txn.status.pending')}</option>
                <option value="failed">{t('txn.status.failed')}</option>
              </select>
            </div>

            {/* Row 2: Reference Type + Date From + Date To */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Reference Type */}
              <select
                value={refTypeFilter}
                onChange={(e) => setRefTypeFilter(e.target.value as TransactionReferenceType | '')}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] bg-white"
              >
                <option value="">{t('txn.allRefTypes')}</option>
                <option value="planner">{t('txn.refType.planner')}</option>
                <option value="planner_deposit">{t('txn.refType.plannerDeposit')}</option>
                <option value="planner_penalty">{t('txn.refType.plannerPenalty')}</option>
                <option value="payos_payout">{t('txn.refType.payosPayout')}</option>
                <option value="payos_topup">{t('txn.refType.payosTopup')}</option>
                <option value="wallet">{t('txn.refType.wallet')}</option>
              </select>

              {/* Date From */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder={t('txn.dateFrom')}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] bg-white"
                />
              </div>

              {/* Date To */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder={t('txn.dateTo')}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleFilterApply}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] rounded-lg hover:brightness-110 transition-all"
              >
                {t('txn.apply')}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
              >
                {t('txn.reset')}
              </button>
            </div>
          </div>
        )}
      </div>

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
  );
};
