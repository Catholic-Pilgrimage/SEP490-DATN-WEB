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
  Calendar,
  Landmark,
  AlertTriangle,
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import {
  Withdrawal,
  WithdrawalParams,
  TransactionStatus,
} from '../../../types/admin.types';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';

export const WithdrawalsTable: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const tRef = useRef(t);
  tRef.current = t;

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const limit = 10;

  const buildParams = useCallback((page: number): WithdrawalParams => ({
    page,
    limit,
    status: statusFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  }), [statusFilter, dateFrom, dateTo]);

  const fetchWithdrawals = useCallback(async (params: WithdrawalParams = {}) => {
    setLoading(true);
    try {
      const response = await AdminService.getWalletWithdrawals({
        page: params.page || 1,
        limit,
        status: params.status || undefined,
        date_from: params.date_from || undefined,
        date_to: params.date_to || undefined,
      });
      if (response.success && response.data) {
        setWithdrawals(response.data.withdrawals);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
      } else {
        showToast('error', tRef.current('wd.title'), response.message || tRef.current('wd.loadError'));
      }
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
      showToast('error', tRef.current('wd.title'), tRef.current('wd.loadError'));
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchWithdrawals({ page: 1 });
  }, [fetchWithdrawals]);

  const handlePageChange = (page: number) => {
    fetchWithdrawals(buildParams(page));
  };

  const handleFilterApply = () => {
    fetchWithdrawals(buildParams(1));
  };

  const handleReset = () => {
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    fetchWithdrawals({ page: 1 });
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

  const activeFilterCount = [statusFilter, dateFrom, dateTo].filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#d4af37]/20">
      {/* Header */}
      <div className="p-6 border-b border-[#d4af37]/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('wd.title')}</h2>
            <p className="text-sm text-slate-500">{t('wd.subtitle')} ({total})</p>
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
              onClick={() => fetchWithdrawals(buildParams(currentPage))}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Status */}
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

              {/* Date From */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
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
  );
};
