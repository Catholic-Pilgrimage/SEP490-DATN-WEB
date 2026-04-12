import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
  CheckCircle,
  XCircle,
  Flag,
  Shield,
  Eye,
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import {
  Report,
  ReportDetail,
  ReportQueryStatus,
  ReportTargetType,
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
import {
  getReportReasonLabel,
  getReportStatusIcon,
  getReportStatusLabel,
  getReportStatusStyle,
  getReportTargetTypeIcon,
  getReportTargetTypeLabel,
  getReportTargetTypeStyle,
  ReportDetailDialog,
} from './ReportDetailDialog';

export const ReportsManagement: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const tRef = useRef(t);
  tRef.current = t;

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState<ReportQueryStatus | ''>('');
  const [targetTypeFilter, setTargetTypeFilter] = useState<ReportTargetType | ''>('');
  const limit = 10;

  const [resolvingReport, setResolvingReport] = useState<Report | null>(null);
  const [resolveAction, setResolveAction] = useState<'resolved' | 'reject'>('resolved');
  const [resolveNote, setResolveNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reportDetail, setReportDetail] = useState<ReportDetail | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await AdminService.getReports({
        page: currentPage,
        limit,
        status: statusFilter || undefined,
        target_type: targetTypeFilter || undefined,
      });
      if (response.success && response.data) {
        setReports(response.data.reports);
        setTotalItems(response.data.pagination.total_items);
        setTotalPages(response.data.pagination.total_pages);
        setCurrentPage(response.data.pagination.current_page);
        return true;
      }
      showToast('error', tRef.current('rpt.title'), response.message || tRef.current('rpt.loadError'));
      return false;
    } catch (err) {
      console.error('Error fetching reports:', err);
      showToast('error', tRef.current('rpt.title'), extractErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast, currentPage, limit, statusFilter, targetTypeFilter]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    const ok = await fetchReports();
    setRefreshing(false);
    if (ok) {
      showToast(
        'success',
        tRef.current('toast.refreshSuccess'),
        tRef.current('toast.refreshSuccessMsg')
      );
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1) {
      setCurrentPage(page);
    }
  };

  const handleResolveSubmit = async () => {
    if (!resolvingReport) return;
    
    // Validate: note is required when rejecting
    if (resolveAction === 'reject' && !resolveNote.trim()) {
      showToast('error', tRef.current('rpt.title'), 'Note is required when rejecting a report');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await AdminService.resolveReport(resolvingReport.id, {
        action: resolveAction,
        note: resolveNote.trim() || undefined,
      });
      if (response.success) {
        showToast('success', tRef.current('rpt.title'), tRef.current('rpt.resolveSuccess'));
        setResolvingReport(null);
        setResolveNote('');
        void fetchReports();
      } else {
        showToast('error', tRef.current('rpt.title'), response.message || tRef.current('rpt.resolveError'));
      }
    } catch (err) {
      console.error('Error resolving report:', err);
      showToast('error', tRef.current('rpt.title'), extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openReportDetail = async (id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setReportDetail(null);
    try {
      const response = await AdminService.getReportById(id);
      if (response.success && response.data) {
        setReportDetail(response.data);
      } else {
        showToast('error', tRef.current('rpt.detail.title'), response.message || tRef.current('rpt.detail.loadError'));
        setDetailOpen(false);
      }
    } catch (err) {
      showToast('error', tRef.current('rpt.detail.title'), extractErrorMessage(err));
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {t('rpt.title')}
          </h1>
          <p className="text-slate-600 mt-1">{t('rpt.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => void handleManualRefresh()}
          disabled={loading || refreshing}
          className="flex items-center gap-2 h-10 px-4 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white font-medium rounded-lg hover:brightness-110 transition-all disabled:opacity-50 shadow-sm shadow-[#d4af37]/20"
        >
          <RefreshCw className={`w-4 h-4 ${loading || refreshing ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </button>
      </div>

      {/* Filters — aligned with Site Management */}
      <div className="bg-white rounded-2xl border border-[#d4af37]/20 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#8a6d1c]/50" />
              <Select
                value={statusFilter || 'all'}
                onValueChange={(value) => {
                  setStatusFilter(value === 'all' ? '' : (value as ReportQueryStatus));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[200px] h-11 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-gray-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all cursor-pointer">
                  <SelectValue placeholder={t('rpt.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('rpt.allStatuses')}</SelectItem>
                  <SelectItem value="pending">{t('rpt.status.pending')}</SelectItem>
                  <SelectItem value="resolved">{t('rpt.status.resolved')}</SelectItem>
                  <SelectItem value="reject">{t('rpt.status.reject')}</SelectItem>
                  <SelectItem value="cancelled">{t('rpt.status.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select
              value={targetTypeFilter || 'all'}
              onValueChange={(value) => {
                setTargetTypeFilter(value === 'all' ? '' : (value as ReportTargetType));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[200px] h-11 bg-[#f5f3ee] border border-[#d4af37]/30 rounded-xl text-gray-700 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] hover:border-[#d4af37]/50 transition-all cursor-pointer">
                <SelectValue placeholder={t('rpt.allTargetTypes')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('rpt.allTargetTypes')}</SelectItem>
                <SelectItem value="post">{t('rpt.targetType.post')}</SelectItem>
                <SelectItem value="comment">{t('rpt.targetType.comment')}</SelectItem>
                <SelectItem value="journal">{t('rpt.targetType.journal')}</SelectItem>
                <SelectItem value="site_review">{t('rpt.targetType.site_review')}</SelectItem>
                <SelectItem value="nearby_place_review">{t('rpt.targetType.nearby_place_review')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-gray-500 lg:text-right shrink-0">
            {totalItems} {t('rpt.totalReports')}
          </p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#d4af37]/20 overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#f5f3ee] to-[#ede8db] border-b-2 border-[#d4af37]/20">
                <th className="text-left px-5 py-3.5 text-[11px] font-bold text-[#8a6d1c] uppercase tracking-widest">{t('rpt.col.reporter')}</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-bold text-[#8a6d1c] uppercase tracking-widest">{t('rpt.col.targetType')}</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-bold text-[#8a6d1c] uppercase tracking-widest">{t('rpt.col.reason')}</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-bold text-[#8a6d1c] uppercase tracking-widest">{t('rpt.col.description')}</th>
                <th className="text-center px-4 py-3.5 text-[11px] font-bold text-[#8a6d1c] uppercase tracking-widest">{t('rpt.col.status')}</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-bold text-[#8a6d1c] uppercase tracking-widest">{t('rpt.col.resolver')}</th>
                <th className="text-center px-4 py-3.5 text-[11px] font-bold text-[#8a6d1c] uppercase tracking-widest">{t('rpt.col.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-full" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 bg-slate-100 rounded w-20" />
                          <div className="h-2.5 bg-slate-50 rounded w-28" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><div className="h-6 bg-slate-100 rounded-full w-16" /></td>
                    <td className="px-4 py-4"><div className="h-6 bg-slate-100 rounded-full w-20" /></td>
                    <td className="px-4 py-4"><div className="h-3.5 bg-slate-100 rounded w-32" /></td>
                    <td className="px-4 py-4 text-center"><div className="h-6 bg-slate-100 rounded-full w-16 mx-auto" /></td>
                    <td className="px-4 py-4"><div className="h-3.5 bg-slate-100 rounded w-24" /></td>
                    <td className="px-4 py-4"><div className="h-7 bg-slate-100 rounded-lg w-20 mx-auto" /></td>
                  </tr>
                ))
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-[#f5f3ee] flex items-center justify-center mb-4">
                        <Flag className="w-7 h-7 text-[#d4af37]/60" />
                      </div>
                      <p className="text-sm font-medium text-slate-500">{t('rpt.noData')}</p>
                      <p className="text-xs text-slate-400 mt-1">{statusFilter || targetTypeFilter ? t('common.adjustFilters') || 'Thử thay đổi bộ lọc' : ''}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((rpt) => (
                  <tr key={rpt.id} className="group hover:bg-[#f5f3ee]/40 transition-all duration-200 border-l-2 border-l-transparent hover:border-l-[#d4af37]">
                    {/* Reporter */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        {rpt.reporter.avatar_url ? (
                          <img src={rpt.reporter.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-[#d4af37]/20 group-hover:border-[#d4af37]/40 transition-colors" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8a6d1c]/20 to-[#d4af37]/20 border border-[#d4af37]/20 flex items-center justify-center group-hover:from-[#8a6d1c]/30 group-hover:to-[#d4af37]/30 transition-all">
                            <span className="text-xs font-bold text-[#8a6d1c]">{rpt.reporter.full_name.charAt(0)}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate max-w-[140px]">{rpt.reporter.full_name}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{rpt.reporter.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Target Type */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full border ${getReportTargetTypeStyle(rpt.target_type)}`}>
                        {getReportTargetTypeIcon(rpt.target_type)}
                        {getReportTargetTypeLabel(rpt.target_type, t)}
                      </span>
                    </td>
                    {/* Reason */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
                        <Flag className="w-3 h-3" />
                        {getReportReasonLabel(rpt.reason, t)}
                      </span>
                    </td>
                    {/* Description */}
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-slate-600 max-w-[200px] truncate" title={rpt.description || '—'}>
                        {rpt.description || <span className="text-slate-300 italic">—</span>}
                      </p>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full border ${getReportStatusStyle(rpt.status)}`}>
                        {getReportStatusIcon(rpt.status)}
                        {getReportStatusLabel(rpt.status, t)}
                      </span>
                    </td>
                    {/* Resolver */}
                    <td className="px-4 py-3.5">
                      {rpt.resolver ? (
                        <div className="flex min-w-[9rem] items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                            <Shield className="h-3 w-3 text-emerald-600" />
                          </div>
                          <p
                            className="text-sm font-medium text-slate-800 truncate"
                            title={rpt.resolver.full_name}
                          >
                            {rpt.resolver.full_name}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openReportDetail(rpt.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all whitespace-nowrap shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {t('rpt.action.view')}
                        </button>
                        {rpt.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setResolvingReport(rpt);
                              setResolveAction('resolved');
                              setResolveNote('');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-white bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] rounded-lg hover:brightness-110 transition-all whitespace-nowrap shadow-sm shadow-[#d4af37]/20"
                          >
                            {t('rpt.action.resolve')}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#d4af37]/10 bg-[#faf8f4]/50">
            <p className="text-xs text-slate-500">
              {t('txn.showing')} <span className="font-semibold text-slate-700">{((currentPage - 1) * limit) + 1}–{Math.min(currentPage * limit, totalItems)}</span> {t('txn.of')} <span className="font-semibold text-slate-700">{totalItems}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((page, idx, arr) => (
                  <React.Fragment key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="px-1 text-slate-400 text-xs">…</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 text-xs font-semibold rounded-lg transition-all ${
                        page === currentPage
                          ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white shadow-sm shadow-[#d4af37]/20'
                          : 'text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ReportDetailDialog
        open={detailOpen}
        onOpenChange={(open: boolean) => {
          setDetailOpen(open);
          if (!open) setReportDetail(null);
        }}
        loading={detailLoading}
        data={reportDetail}
      />

      {/* Resolve Modal */}
      {resolvingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{t('rpt.modal.title')}</h3>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Action Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('rpt.modal.action')}
                </label>
                <div className="flex gap-3">
                  <label className="flex-1">
                    <input
                      type="radio"
                      className="peer sr-only"
                      name="resolveAction"
                      checked={resolveAction === 'resolved'}
                      onChange={() => setResolveAction('resolved')}
                    />
                    <div className="p-3 text-center border rounded-xl cursor-pointer transition-all peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 text-slate-600 hover:bg-slate-50">
                      <CheckCircle className="w-5 h-5 mx-auto mb-1 opacity-70" />
                      <span className="text-sm font-medium">{t('rpt.modal.actionResolved')}</span>
                    </div>
                  </label>
                  <label className="flex-1">
                    <input
                      type="radio"
                      className="peer sr-only"
                      name="resolveAction"
                      checked={resolveAction === 'reject'}
                      onChange={() => setResolveAction('reject')}
                    />
                    <div className="p-3 text-center border rounded-xl cursor-pointer transition-all peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:text-red-700 text-slate-600 hover:bg-slate-50">
                      <XCircle className="w-5 h-5 mx-auto mb-1 opacity-70" />
                      <span className="text-sm font-medium">{t('rpt.modal.actionRejected')}</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('rpt.modal.note')}
                </label>
                <textarea
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  placeholder={t('rpt.modal.notePlaceholder')}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] resize-none h-24"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setResolvingReport(null)}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {t('rpt.modal.cancel')}
              </button>
              <button
                onClick={handleResolveSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] rounded-lg hover:brightness-110 transition-colors disabled:opacity-50 shadow-sm"
              >
                {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                {t('rpt.modal.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
