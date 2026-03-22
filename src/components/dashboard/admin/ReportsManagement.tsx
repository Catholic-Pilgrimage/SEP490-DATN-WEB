import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Flag,
  FileText,
  MessageSquare,
  BookOpen,
  Shield,
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import {
  Report,
  ReportStatus,
  ReportTargetType,
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

  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');
  const [targetTypeFilter, setTargetTypeFilter] = useState<ReportTargetType | ''>('');
  const limit = 10;

  const [resolvingReport, setResolvingReport] = useState<Report | null>(null);
  const [resolveAction, setResolveAction] = useState<'resolved' | 'dismissed'>('resolved');
  const [resolveNote, setResolveNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = useCallback(async () => {
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
      } else {
        showToast('error', tRef.current('rpt.title'), response.message || tRef.current('rpt.loadError'));
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      showToast('error', tRef.current('rpt.title'), tRef.current('rpt.loadError'));
    } finally {
      setLoading(false);
    }
  }, [showToast, currentPage, limit, statusFilter, targetTypeFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handlePageChange = (page: number) => {
    if (page >= 1) {
      setCurrentPage(page);
    }
  };

  const handleResolveSubmit = async () => {
    if (!resolvingReport) return;
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
        fetchReports();
      } else {
        showToast('error', tRef.current('rpt.title'), response.message || tRef.current('rpt.resolveError'));
      }
    } catch (err) {
      console.error('Error resolving report:', err);
      showToast('error', tRef.current('rpt.title'), tRef.current('rpt.resolveError'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-3.5 h-3.5" />;
      case 'resolved': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'dismissed': return <XCircle className="w-3.5 h-3.5" />;
    }
  };

  const getStatusStyle = (status: ReportStatus) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'dismissed': return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusLabel = (status: ReportStatus) => {
    const labels: Record<string, string> = {
      pending: t('rpt.status.pending'),
      resolved: t('rpt.status.resolved'),
      dismissed: t('rpt.status.dismissed'),
    };
    return labels[status] || status;
  };

  const getTargetTypeIcon = (type: ReportTargetType) => {
    switch (type) {
      case 'post': return <FileText className="w-3.5 h-3.5" />;
      case 'comment': return <MessageSquare className="w-3.5 h-3.5" />;
      case 'journal': return <BookOpen className="w-3.5 h-3.5" />;
    }
  };

  const getTargetTypeStyle = (type: ReportTargetType) => {
    switch (type) {
      case 'post': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'comment': return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'journal': return 'bg-orange-50 text-orange-700 border-orange-200';
    }
  };

  const getTargetTypeLabel = (type: ReportTargetType) => {
    const labels: Record<string, string> = {
      post: t('rpt.targetType.post'),
      comment: t('rpt.targetType.comment'),
      journal: t('rpt.targetType.journal'),
    };
    return labels[type] || type;
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      spam: t('rpt.reason.spam'),
      inappropriate: t('rpt.reason.inappropriate'),
      harassment: t('rpt.reason.harassment'),
      misinformation: t('rpt.reason.misinformation'),
      other: t('rpt.reason.other'),
    };
    return labels[reason] || reason;
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
          onClick={() => fetchReports()}
          disabled={loading}
          className="flex items-center gap-2 h-10 px-4 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white font-medium rounded-lg hover:brightness-110 transition-all disabled:opacity-50 shadow-sm shadow-[#d4af37]/20"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
                  setStatusFilter(value === 'all' ? '' : (value as ReportStatus));
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
                  <SelectItem value="dismissed">{t('rpt.status.dismissed')}</SelectItem>
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
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-gray-500 lg:text-right shrink-0">
            {totalItems} {t('rpt.totalReports')}
          </p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#d4af37]/20">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f3ee]/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('rpt.col.reporter')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('rpt.col.targetType')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('rpt.col.reason')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('rpt.col.description')}</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('rpt.col.status')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('rpt.col.resolver')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('rpt.col.date')}</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('rpt.col.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${50 + Math.random() * 50}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Flag className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">{t('rpt.noData')}</p>
                  </td>
                </tr>
              ) : (
                reports.map((rpt) => (
                  <tr key={rpt.id} className="hover:bg-[#f5f3ee]/50 transition-colors">
                    {/* Reporter */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {rpt.reporter.avatar_url ? (
                          <img src={rpt.reporter.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-[#8a6d1c]">{rpt.reporter.full_name.charAt(0)}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]">{rpt.reporter.full_name}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[120px]">{rpt.reporter.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Target Type */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getTargetTypeStyle(rpt.target_type)}`}>
                        {getTargetTypeIcon(rpt.target_type)}
                        {getTargetTypeLabel(rpt.target_type)}
                      </span>
                    </td>
                    {/* Reason */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
                        <Flag className="w-3 h-3" />
                        {getReasonLabel(rpt.reason)}
                      </span>
                    </td>
                    {/* Description */}
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600 max-w-[180px] truncate" title={rpt.description || '—'}>
                        {rpt.description || <span className="text-slate-400">—</span>}
                      </p>
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusStyle(rpt.status)}`}>
                        {getStatusIcon(rpt.status)}
                        {getStatusLabel(rpt.status)}
                      </span>
                    </td>
                    {/* Resolver */}
                    <td className="px-6 py-4">
                      {rpt.resolver ? (
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-700 truncate max-w-[100px]">{rpt.resolver.full_name}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    {/* Date */}
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-500">{formatDate(rpt.created_at)}</span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      {rpt.status === 'pending' ? (
                        <button
                          onClick={() => {
                            setResolvingReport(rpt);
                            setResolveAction('resolved');
                            setResolveNote('');
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-[#8a6d1c] bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-lg hover:bg-[#d4af37]/20 transition-all whitespace-nowrap"
                        >
                          {t('rpt.action.resolve')}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
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
              {t('txn.showing')} {((currentPage - 1) * limit) + 1}–{Math.min(currentPage * limit, totalItems)} {t('txn.of')} {totalItems}
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
                      checked={resolveAction === 'dismissed'}
                      onChange={() => setResolveAction('dismissed')}
                    />
                    <div className="p-3 text-center border rounded-xl cursor-pointer transition-all peer-checked:border-slate-500 peer-checked:bg-slate-50 peer-checked:text-slate-700 text-slate-600 hover:bg-slate-50">
                      <XCircle className="w-5 h-5 mx-auto mb-1 opacity-70" />
                      <span className="text-sm font-medium">{t('rpt.modal.actionDismissed')}</span>
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
