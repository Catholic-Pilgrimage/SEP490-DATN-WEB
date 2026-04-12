import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Lock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { AdminService } from '../../../services/admin.service';
import { WalletEscrowPlannerItem } from '../../../types/admin.types';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { extractErrorMessage } from '../../../lib/utils';

/** Backend may return total/totalPages as 0 while escrow[] is populated. */
function normalizeEscrowPagination(
  data: {
    escrow: WalletEscrowPlannerItem[];
    total: number;
    totalPages: number;
    currentPage: number;
  },
  pageLimit: number
) {
  const { escrow, total: rawTotal, totalPages: rawPages, currentPage } = data;
  const page = currentPage || 1;

  if (rawTotal > 0) {
    const totalPages =
      rawPages > 0 ? rawPages : Math.max(1, Math.ceil(rawTotal / pageLimit));
    return { escrow, total: rawTotal, totalPages, currentPage: page };
  }

  if (escrow.length > 0) {
    return {
      escrow,
      total: escrow.length,
      totalPages: 1,
      currentPage: 1,
    };
  }

  return { escrow, total: 0, totalPages: 0, currentPage: page };
}

export const EscrowTable: React.FC = () => {
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const tRef = useRef(t);
  tRef.current = t;

  const [rows, setRows] = useState<WalletEscrowPlannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const fetchEscrow = useCallback(async (showSuccessToast = false) => {
    setLoading(true);
    try {
      const response = await AdminService.getWalletEscrow({
        page: currentPage,
        limit,
      });
      if (response.success && response.data) {
        const norm = normalizeEscrowPagination(response.data, limit);
        setRows(norm.escrow);
        setTotal(norm.total);
        setTotalPages(norm.totalPages);
        setCurrentPage(norm.currentPage);
        if (showSuccessToast) {
          showToast('success', tRef.current('toast.refreshSuccess'), tRef.current('toast.refreshSuccessMsg'));
        }
      } else {
        showToast('error', tRef.current('esc.title'), response.message || tRef.current('esc.loadError'));
      }
    } catch (err) {
      console.error('Error fetching escrow:', err);
      showToast('error', tRef.current('esc.title'), extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [showToast, currentPage, limit]);

  useEffect(() => {
    fetchEscrow();
  }, [fetchEscrow]);

  const handlePageChange = (page: number) => {
    if (page >= 1) setCurrentPage(page);
  };

  const numberLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(numberLocale).format(value) + ' ' + t('finance.currency');
  };

  const formatDeposit = (v: string | number) => {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    return formatCurrency(Number.isFinite(n) ? n : 0);
  };

  const formatDateRange = (start: string, end: string) => {
    const fmtDate = (d: string) => {
      try { return format(parseISO(d), 'dd/MM/yyyy'); } catch { return d; }
    };
    return `${fmtDate(start)} ${t('esc.dateRangeSep')} ${fmtDate(end)}`;
  };

  const plannerStatusLabel = (status: string) => {
    const key = `esc.plannerStatus.${status}`;
    const label = t(key);
    return label === key ? status.replace(/_/g, ' ') : label;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('esc.title')}</h1>
          <p className="text-slate-600 mt-1">{t('esc.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => fetchEscrow(true)}
          disabled={loading}
          className="flex items-center gap-2 h-10 px-4 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white font-medium rounded-lg hover:brightness-110 transition-all disabled:opacity-50 shadow-sm shadow-[#d4af37]/20"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-sm text-gray-500">
          {total} {t('esc.totalSuffix')}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#d4af37]/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f3ee]/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('esc.col.planner')}
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('esc.col.owner')}
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('esc.col.status')}
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('esc.col.dates')}
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('esc.col.members')}
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('esc.col.deposit')}
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('esc.col.netLocked')}
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('esc.col.penalty')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div
                          className="h-4 bg-slate-100 rounded animate-pulse"
                          style={{ width: `${50 + (j * 7) % 40}%` }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Lock className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">{t('esc.noData')}</p>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.planner_id} className="hover:bg-[#f5f3ee]/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900 max-w-[200px] truncate" title={row.planner_name}>
                        {row.planner_name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {row.owner.avatar_url ? (
                          <img
                            src={row.owner.avatar_url}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-[#8a6d1c]">
                              {row.owner.full_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate max-w-[140px]">
                            {row.owner.full_name}
                          </p>
                          <p className="text-xs text-slate-400 truncate max-w-[140px]">{row.owner.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full border bg-amber-50 text-amber-800 border-amber-200">
                        {plannerStatusLabel(row.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-600 whitespace-nowrap">
                        {formatDateRange(row.start_date, row.end_date)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-slate-800">{row.member_count}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-slate-900">{formatDeposit(row.deposit_amount)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-amber-800">{formatCurrency(row.net_locked)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-slate-700">{formatCurrency(row.penalty_pending)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              {t('txn.showing')} {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, total)} {t('txn.of')}{' '}
              {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((page, idx, arr) => (
                  <React.Fragment key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-1 text-slate-400">…</span>}
                    <button
                      type="button"
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
                type="button"
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
