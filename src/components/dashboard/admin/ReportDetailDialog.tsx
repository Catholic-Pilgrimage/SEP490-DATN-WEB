/* eslint-disable react-refresh/only-export-components -- shared report helpers + ReportDetailDialog in one file */
import React, { useState } from 'react';
import {
  Loader2,
  Shield,
  Hash,
  CalendarClock,
  Target,
  FileText,
  StickyNote,
  Users,
  ImageIcon,
  Star,
  CheckCircle,
  Clock,
  XCircle,
  Flag,
  MessageSquare,
  BookOpen,
  MapPin,
} from 'lucide-react';
import { ReportDetail, isReportSiteReviewTarget, type ReportTargetType } from '../../../types/admin.types';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ImagePreviewDialog } from '../../shared/ImagePreviewDialog';

/** Helpers dùng chung cho bảng & dialog báo cáo */
export function formatReportDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getReportStatusIcon(status: string): React.ReactNode {
  switch (status) {
    case 'pending':
      return <Clock className="w-3.5 h-3.5" />;
    case 'resolved':
      return <CheckCircle className="w-3.5 h-3.5" />;
    case 'dismissed':
      return <XCircle className="w-3.5 h-3.5" />;
    case 'reject':
      return <XCircle className="w-3.5 h-3.5" />;
    default:
      return <Flag className="w-3.5 h-3.5" />;
  }
}

export function getReportStatusStyle(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'resolved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'dismissed':
      return 'bg-slate-50 text-slate-600 border-slate-200';
    case 'reject':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

export function getReportStatusLabel(status: string, t: (key: string) => string): string {
  const labels: Record<string, string> = {
    pending: t('rpt.status.pending'),
    resolved: t('rpt.status.resolved'),
    dismissed: t('rpt.status.dismissed'),
    reject: t('rpt.status.reject'),
  };
  return labels[status] || status;
}

export function getReportTargetTypeIcon(type: string): React.ReactNode {
  switch (type) {
    case 'post':
      return <FileText className="w-3.5 h-3.5" />;
    case 'comment':
      return <MessageSquare className="w-3.5 h-3.5" />;
    case 'journal':
      return <BookOpen className="w-3.5 h-3.5" />;
    case 'site_review':
      return <Star className="w-3.5 h-3.5" />;
    case 'nearby_place_review':
      return <MapPin className="w-3.5 h-3.5" />;
    default:
      return <FileText className="w-3.5 h-3.5" />;
  }
}

export function getReportTargetTypeStyle(type: string): string {
  switch (type) {
    case 'post':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'comment':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'journal':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'site_review':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'nearby_place_review':
      return 'bg-teal-50 text-teal-800 border-teal-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

export function getReportTargetTypeLabel(type: ReportTargetType | string, t: (key: string) => string): string {
  const labels: Record<string, string> = {
    post: t('rpt.targetType.post'),
    comment: t('rpt.targetType.comment'),
    journal: t('rpt.targetType.journal'),
    site_review: t('rpt.targetType.site_review'),
    nearby_place_review: t('rpt.targetType.nearby_place_review'),
  };
  return labels[type] || type;
}

export function getReportReasonLabel(reason: string, t: (key: string) => string): string {
  const labels: Record<string, string> = {
    spam: t('rpt.reason.spam'),
    inappropriate: t('rpt.reason.inappropriate'),
    harassment: t('rpt.reason.harassment'),
    misinformation: t('rpt.reason.misinformation'),
    other: t('rpt.reason.other'),
  };
  return labels[reason] || reason;
}

export interface ReportDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  data: ReportDetail | null;
}

function SectionCard({
  icon: Icon,
  title,
  children,
  className = '',
  tone = 'default' as 'default' | 'gold' | 'emerald',
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
  tone?: 'default' | 'gold' | 'emerald';
}) {
  const toneBar =
    tone === 'gold'
      ? 'from-[#d4af37]/80 to-[#c9a227]/60'
      : tone === 'emerald'
        ? 'from-emerald-500/70 to-emerald-600/50'
        : 'from-slate-400/50 to-slate-300/40';
  const titleColor =
    tone === 'gold' ? 'text-[#6b5420]' : tone === 'emerald' ? 'text-emerald-900' : 'text-slate-700';
  const iconWrap =
    tone === 'gold'
      ? 'bg-[#d4af37]/12 text-[#8a6d1c]'
      : tone === 'emerald'
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-slate-100 text-slate-600';

  return (
    <section
      className={`report-detail-section rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden ${className}`}
    >
      <div className={`h-1 w-full bg-gradient-to-r ${toneBar}`} aria-hidden />
      <div className="px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
          <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconWrap}`}>
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
          <h3 className={`text-xs font-bold uppercase tracking-wide ${titleColor}`}>{title}</h3>
        </div>
        {children}
      </div>
    </section>
  );
}

function MetaItem({
  label,
  children,
  emphasis = false,
}: {
  label: string;
  children: React.ReactNode;
  /** Nổi bật giá trị (ID, thời gian quan trọng) */
  emphasis?: boolean;
}) {
  return (
    <div className={`min-w-0 space-y-1.5 ${emphasis ? 'rounded-xl border border-slate-200/90 bg-slate-50/90 p-3 shadow-sm' : ''}`}>
      <p
        className={`text-[11px] font-bold uppercase tracking-wide ${emphasis ? 'text-slate-600' : 'text-slate-400'}`}
      >
        {label}
      </p>
      <div className={`min-w-0 ${emphasis ? 'text-base font-semibold text-slate-900' : 'text-sm text-slate-800'}`}>
        {children}
      </div>
    </div>
  );
}

function StarRating({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${v}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < v ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
          strokeWidth={i < v ? 0 : 1.5}
        />
      ))}
    </div>
  );
}

/** Modal chi tiết báo cáo (GET /api/reports/:id). */
export const ReportDetailDialog: React.FC<ReportDetailDialogProps> = ({
  open,
  onOpenChange,
  loading,
  data,
}) => {
  const { t } = useLanguage();
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <>
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setPreviewImageUrl(null);
      }}
    >
      <DialogContent className="report-detail-dialog flex max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        {/* Header */}
        <div className="relative shrink-0 border-b border-slate-200/90 bg-gradient-to-br from-[#faf8f4] via-white to-slate-50/80 px-5 pb-4 pt-5 pr-14 sm:px-6 sm:pb-5 sm:pt-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#c9a227]" />
          <DialogHeader className="space-y-3 text-left">
            <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              {t('rpt.detail.title')}
            </DialogTitle>
            {data && !loading ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
                <div className="inline-flex max-w-full flex-col gap-1 rounded-xl border-2 border-[#d4af37]/45 bg-gradient-to-br from-white via-amber-50/40 to-[#faf8f4] px-4 py-3 shadow-md ring-1 ring-[#c9a227]/15">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a6d1c]">
                    {t('rpt.detail.code')}
                  </span>
                  <span className="break-all font-mono text-lg font-bold leading-tight tracking-tight text-slate-900 sm:text-xl">
                    {data.code}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:pt-0.5">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-sm font-bold shadow-sm ring-1 ring-black/[0.04] ${getReportStatusStyle(data.status)}`}
                  >
                    {getReportStatusIcon(data.status)}
                    {getReportStatusLabel(data.status, t)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-sm font-bold shadow-sm ring-1 ring-black/[0.04] ${getReportTargetTypeStyle(data.target_type)}`}
                  >
                    {getReportTargetTypeIcon(data.target_type)}
                    {getReportTargetTypeLabel(data.target_type, t)}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border-2 border-rose-300/80 bg-gradient-to-r from-rose-50 to-rose-100/80 px-3.5 py-1.5 text-sm font-bold text-rose-900 shadow-sm ring-1 ring-rose-200/60">
                    {getReportReasonLabel(data.reason, t)}
                  </span>
                </div>
              </div>
            ) : null}
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="report-detail-body min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-9 w-9 animate-spin text-[#d4af37]" />
              <p className="text-sm text-slate-500">{t('rpt.detail.loading')}</p>
            </div>
          ) : data ? (
            <div className="space-y-5 sm:space-y-6">
              {/* Thông tin & định danh */}
              <SectionCard icon={Hash} title={t('rpt.detail.metaSection')} className="shadow-md ring-1 ring-slate-200/60">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <MetaItem label={t('rpt.col.date')} emphasis>
                    <p className="flex items-center gap-2.5 tabular-nums text-slate-900">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                        <CalendarClock className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <span className="font-semibold">{formatReportDate(data.created_at)}</span>
                    </p>
                  </MetaItem>
                  <MetaItem label={t('rpt.detail.updatedAt')} emphasis>
                    <p className="tabular-nums font-semibold text-slate-900">{formatReportDate(data.updated_at)}</p>
                  </MetaItem>
                </div>
              </SectionCard>

              {/* Mô tả */}
              <SectionCard icon={FileText} title={t('rpt.col.description')} className="shadow-md ring-1 ring-slate-200/50">
                <div className="rounded-xl border-l-4 border-l-rose-500/90 bg-white px-4 py-4 shadow-inner ring-1 ring-slate-200/80">
                  <p className="whitespace-pre-wrap text-base font-medium leading-relaxed text-slate-900">
                    {data.description?.trim() ? data.description : '—'}
                  </p>
                </div>
              </SectionCard>

              {data.admin_note != null && data.admin_note !== '' ? (
                <SectionCard icon={StickyNote} title={t('rpt.detail.adminNote')} tone="gold" className="shadow-md ring-1 ring-amber-200/50">
                  <div className="rounded-xl border-l-4 border-l-[#c9a227] bg-gradient-to-r from-amber-50/90 to-amber-50/30 px-4 py-4 shadow-sm">
                    <p className="whitespace-pre-wrap text-base font-semibold leading-relaxed text-[#3d2f0a]">
                      {data.admin_note}
                    </p>
                  </div>
                </SectionCard>
              ) : null}

              {/* Người liên quan */}
              <SectionCard icon={Users} title={t('rpt.detail.peopleSection')}>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-[#faf8f4]/80 p-4">
                    {data.reporter.avatar_url ? (
                      <img
                        src={data.reporter.avatar_url}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-slate-200/80"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37]/25 to-[#c9a227]/15 text-base font-bold text-[#6b5420] ring-2 ring-white shadow-sm">
                        {data.reporter.full_name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a6d1c]">
                        {t('rpt.col.reporter')}
                      </p>
                      <p className="mt-1 truncate text-lg font-bold tracking-tight text-slate-900">
                        {data.reporter.full_name}
                      </p>
                      <p className="truncate text-sm font-medium text-slate-600">{data.reporter.email}</p>
                    </div>
                  </div>

                  {data.resolver ? (
                    <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-emerald-100">
                        <Shield className="h-6 w-6 text-emerald-600" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-800">
                          {t('rpt.col.resolver')}
                        </p>
                        <p className="mt-1 truncate text-lg font-bold tracking-tight text-slate-900">
                          {data.resolver.full_name}
                        </p>
                        <p className="truncate text-sm font-medium text-slate-600">{data.resolver.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-[5.5rem] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 text-center text-xs text-slate-400">
                      {t('rpt.detail.noResolver')}
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* Nội dung đối tượng */}
              {isReportSiteReviewTarget(data.target_content) ? (
                <SectionCard icon={Target} title={t('rpt.detail.targetContent')} tone="gold">
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                        <p className="text-[11px] font-semibold uppercase text-slate-400">{t('rpt.detail.reviewRating')}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <StarRating value={data.target_content.rating} />
                          <span className="text-2xl font-bold tabular-nums text-slate-900">{data.target_content.rating}</span>
                          <span className="text-sm font-semibold text-slate-500">/5</span>
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                        <p className="text-[11px] font-semibold uppercase text-slate-400">{t('rpt.detail.reviewVerified')}</p>
                        <p className="mt-2 text-sm font-semibold text-slate-800">
                          {data.target_content.verified_visit ? t('common.yes') : t('common.no')}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white p-4">
                      <p className="text-[11px] font-semibold uppercase text-slate-400">{t('rpt.detail.reviewReviewer')}</p>
                      <p className="mt-1.5 font-semibold text-slate-900">{data.target_content.reviewer.full_name}</p>
                      <p className="text-xs text-slate-500">{data.target_content.reviewer.email}</p>
                    </div>

                    <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{t('rpt.detail.reviewFeedback')}</p>
                      <p className="mt-2 whitespace-pre-wrap text-base font-medium leading-relaxed text-slate-900">
                        {data.target_content.feedback}
                      </p>
                    </div>

                    {data.target_content.image_urls?.length > 0 ? (
                      <div>
                        <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase text-slate-400">
                          <ImageIcon className="h-3.5 w-3.5" />
                          {t('rpt.detail.reviewImages')}
                        </p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                          {data.target_content.image_urls.map((url) => (
                            <button
                              key={url}
                              type="button"
                              onClick={() => setPreviewImageUrl(url)}
                              className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-left shadow-sm transition hover:border-[#d4af37]/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2"
                              title={t('media.view')}
                            >
                              <img src={url} alt="" className="pointer-events-none h-full w-full object-cover transition group-hover:scale-[1.02]" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </SectionCard>
              ) : null}

              {data.target_content && !isReportSiteReviewTarget(data.target_content) ? (
                <SectionCard icon={Target} title={t('rpt.detail.targetContent')}>
                  <pre className="max-h-56 overflow-auto rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
                    {JSON.stringify(data.target_content, null, 2)}
                  </pre>
                </SectionCard>
              ) : null}
            </div>
          ) : (
            <div className="py-14 text-center text-sm text-slate-500">{t('rpt.detail.loadError')}</div>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t border-slate-200/90 bg-slate-50/90 px-5 py-4 sm:px-6">
          <Button
            type="button"
            className="w-full bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] font-semibold text-white shadow-sm hover:from-[#735a18] hover:to-[#c9a227] sm:w-auto"
            onClick={handleClose}
          >
            {t('rpt.detail.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <ImagePreviewDialog
      open={!!previewImageUrl}
      onOpenChange={(next) => {
        if (!next) setPreviewImageUrl(null);
      }}
      src={previewImageUrl}
    />
    </>
  );
};
