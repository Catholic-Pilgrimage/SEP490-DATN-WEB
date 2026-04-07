/* eslint-disable react-refresh/only-export-components -- shared report helpers + ReportDetailDialog in one file */
import React, { useState } from 'react';
import {
  Loader2,
  X,
  Hash,
  CalendarDays,
  Clock,
  FileText,
  StickyNote,
  ImageIcon,
  Star,
  CheckCircle,
  XCircle,
  Flag,
  MessageSquare,
  BookOpen,
  MapPin,
  ThumbsUp,
  Volume2,
  Video,
  Eye,
  EyeOff,
  User,
  AlertTriangle,
  Target,
} from 'lucide-react';
import {
  ReportDetail,
  isReportSiteReviewTarget,
  isReportPostTarget,
  isReportCommentTarget,
  isReportJournalTarget,
  isReportNearbyPlaceReviewTarget,
} from '../../../types/admin.types';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImagePreviewDialog } from '../../shared/ImagePreviewDialog';

// ─── Props ────────────────────────────────────────────────────
export interface ReportDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  data: ReportDetail | null;
}

// ─── Helpers (exported for ReportsManagement table reuse) ──────

export function getReportStatusIcon(status: string) {
  switch (status) {
    case 'pending':
      return <Clock className="w-3.5 h-3.5" />;
    case 'resolved':
      return <CheckCircle className="w-3.5 h-3.5" />;
    case 'dismissed':
      return <XCircle className="w-3.5 h-3.5" />;
    case 'reject':
      return <XCircle className="w-3.5 h-3.5" />;
    case 'cancelled':
      return <XCircle className="w-3.5 h-3.5" />;
    default:
      return <Flag className="w-3.5 h-3.5" />;
  }
}

export function getReportStatusStyle(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'resolved':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'dismissed':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'reject':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'cancelled':
      return 'bg-slate-100 text-slate-500 border-slate-300';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export function getReportStatusLabel(status: string, t: (k: string) => string) {
  const labels: Record<string, string> = {
    pending: t('rpt.status.pending'),
    resolved: t('rpt.status.resolved'),
    dismissed: t('rpt.status.dismissed'),
    reject: t('rpt.status.reject'),
    cancelled: t('rpt.status.cancelled'),
  };
  return labels[status] || status;
}

export function getReportTargetTypeIcon(type: string) {
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

export function getReportTargetTypeStyle(type: string) {
  switch (type) {
    case 'post':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'comment':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'journal':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'site_review':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'nearby_place_review':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

export function getReportTargetTypeLabel(type: string, t: (k: string) => string) {
  const labels: Record<string, string> = {
    post: t('rpt.targetType.post'),
    comment: t('rpt.targetType.comment'),
    journal: t('rpt.targetType.journal'),
    site_review: t('rpt.targetType.site_review'),
    nearby_place_review: t('rpt.targetType.nearby_place_review'),
  };
  return labels[type] || type;
}

export function getReportReasonLabel(reason: string, t: (k: string) => string) {
  const labels: Record<string, string> = {
    spam: t('rpt.reason.spam'),
    inappropriate: t('rpt.reason.inappropriate'),
    harassment: t('rpt.reason.harassment'),
    misinformation: t('rpt.reason.misinformation'),
    other: t('rpt.reason.other'),
  };
  return labels[reason] || reason;
}

// ─── Internal helpers ─────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
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

/** Reusable info row — icon box + label/value */
function InfoRow({ icon: Icon, label, children }: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="p-2 bg-[#f5f3ee] rounded-lg mt-0.5 shrink-0">
        <Icon className="w-4 h-4 text-[#8a6d1c]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <div className="text-sm font-semibold text-slate-800 mt-0.5">{children}</div>
      </div>
    </div>
  );
}

/** User / person card matching project gold style */
function PersonCard({ name, email, avatarUrl, roleLabel, roleColor = 'text-[#8a6d1c]', bgClass = 'bg-[#f5f3ee]' }: {
  name: string;
  email: string;
  avatarUrl?: string | null;
  roleLabel: string;
  roleColor?: string;
  bgClass?: string;
}) {
  return (
    <div className={`${bgClass} rounded-xl p-4 border border-[#d4af37]/10`}>
      <div className="flex items-center gap-2 mb-3">
        <User className="w-4 h-4 text-[#8a6d1c]" />
        <h4 className={`text-xs font-semibold uppercase tracking-wider ${roleColor}`}>{roleLabel}</h4>
      </div>
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#d4af37]/30" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center">
            <span className="text-sm font-bold text-white">{name.charAt(0)}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate text-sm">{name}</p>
          <p className="text-xs text-gray-500 truncate">{email}</p>
        </div>
      </div>
    </div>
  );
}

/** Image grid component */
function ImageGrid({ urls, onPreview, viewLabel }: {
  urls: string[];
  onPreview: (url: string) => void;
  viewLabel: string;
}) {
  if (!urls || urls.length === 0) return null;
  return (
    <div className="bg-[#f5f3ee] rounded-xl p-4 border border-[#d4af37]/10">
      <div className="flex items-center gap-2 text-[#8a6d1c] mb-3">
        <ImageIcon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">{viewLabel}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {urls.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => onPreview(url)}
            className="group relative aspect-square overflow-hidden rounded-lg border border-[#d4af37]/20 bg-white shadow-sm transition hover:border-[#d4af37]/50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
          >
            <img src={url} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

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
    setPreviewImageUrl(null);
  };

  const handleDialogChange = (next: boolean) => {
    if (!next) handleClose();
    else onOpenChange(next);
  };

  if (!open) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden border-[#d4af37]/20 rounded-2xl p-0 gap-0 [&>button]:hidden">
          {/* ─── Header ─── */}
          <DialogHeader className="px-6 py-4 bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div className="text-white text-left">
                <DialogTitle className="text-lg font-semibold">
                  {t('rpt.detail.title')}
                </DialogTitle>
                <DialogDescription className="text-sm opacity-80 mt-0.5">
                  {data?.code || ''}
                </DialogDescription>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          {/* ─── Body ─── */}
          <div className="p-5 overflow-y-auto max-h-[calc(90vh-140px)]">
            {loading && (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
              </div>
            )}

            {!loading && !data && (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
                <p className="text-gray-600 font-medium">{t('rpt.detail.loadError')}</p>
              </div>
            )}

            {!loading && data && (
              <div className="space-y-5">
                {/* ── Status badges hero ── */}
                <div className="bg-gradient-to-br from-[#f5f3ee] to-[#ede8db] rounded-2xl p-5 text-center border border-[#d4af37]/15">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getReportStatusStyle(data.status)}`}
                    >
                      {getReportStatusIcon(data.status)}
                      {getReportStatusLabel(data.status, t)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getReportTargetTypeStyle(data.target_type)}`}
                    >
                      {getReportTargetTypeIcon(data.target_type)}
                      {getReportTargetTypeLabel(data.target_type, t)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border-rose-200"
                    >
                      <Flag className="w-3 h-3" />
                      {getReportReasonLabel(data.reason, t)}
                    </Badge>
                  </div>
                </div>

                {/* ── Report info ── */}
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                    {t('rpt.detail.metaSection')}
                  </h4>

                  <InfoRow icon={Hash} label={t('rpt.detail.code')}>
                    <span className="font-mono">{data.code}</span>
                  </InfoRow>
                  <hr className="border-slate-100" />

                  <InfoRow icon={CalendarDays} label={t('rpt.col.date')}>
                    {formatDate(data.created_at)}
                  </InfoRow>
                  <hr className="border-slate-100" />

                  <InfoRow icon={Clock} label={t('rpt.detail.updatedAt')}>
                    {formatDate(data.updated_at)}
                  </InfoRow>

                  {data.description?.trim() && (
                    <>
                      <hr className="border-slate-100" />
                      <InfoRow icon={FileText} label={t('rpt.col.description')}>
                        <p className="break-words leading-relaxed whitespace-pre-wrap">{data.description}</p>
                      </InfoRow>
                    </>
                  )}
                </div>

                {/* ── Admin note ── */}
                {data.admin_note != null && data.admin_note !== '' && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/60">
                    <div className="flex items-center gap-2 text-[#8a6d1c] mb-2">
                      <StickyNote className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">{t('rpt.detail.adminNote')}</span>
                    </div>
                    <p className="text-sm font-medium text-[#3d2f0a] leading-relaxed whitespace-pre-wrap">{data.admin_note}</p>
                  </div>
                )}

                {/* ── People ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PersonCard
                    name={data.reporter.full_name}
                    email={data.reporter.email}
                    avatarUrl={data.reporter.avatar_url}
                    roleLabel={t('rpt.col.reporter')}
                  />
                  {data.resolver ? (
                    <PersonCard
                      name={data.resolver.full_name}
                      email={data.resolver.email}
                      roleLabel={t('rpt.col.resolver')}
                      bgClass="bg-[#d4af37]/10"
                    />
                  ) : (
                    <div className="flex items-center justify-center rounded-xl border border-dashed border-[#d4af37]/30 bg-[#faf8f4]/50 p-4 text-center">
                      <p className="text-xs text-slate-400">{t('rpt.detail.noResolver')}</p>
                    </div>
                  )}
                </div>

                {/* ── Target content ── */}
                {data.target_content && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#8a6d1c]">
                      <Target className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">{t('rpt.detail.targetContent')}</span>
                    </div>

                    {/* site_review */}
                    {isReportSiteReviewTarget(data.target_content) && (
                      <div className="space-y-3">
                        <div className="bg-[#f5f3ee] rounded-xl p-4 border border-[#d4af37]/10">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-semibold uppercase text-slate-400 mb-2">{t('rpt.detail.reviewRating')}</p>
                              <div className="flex items-center gap-2">
                                <StarRating value={data.target_content.rating} />
                                <span className="text-xl font-bold tabular-nums text-slate-800">{data.target_content.rating}</span>
                                <span className="text-xs font-semibold text-slate-400">/5</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold uppercase text-slate-400 mb-2">{t('rpt.detail.reviewVerified')}</p>
                              <Badge variant="outline" className={`gap-1 rounded-full text-xs font-semibold ${data.target_content.verified_visit ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                {data.target_content.verified_visit ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {data.target_content.verified_visit ? t('common.yes') : t('common.no')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <PersonCard
                          name={data.target_content.reviewer.full_name}
                          email={data.target_content.reviewer.email}
                          avatarUrl={data.target_content.reviewer.avatar_url}
                          roleLabel={t('rpt.detail.reviewReviewer')}
                        />
                        <div className="bg-[#f5f3ee] rounded-xl p-4 border border-[#d4af37]/10">
                          <div className="flex items-center gap-2 text-[#8a6d1c] mb-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">{t('rpt.detail.reviewFeedback')}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{data.target_content.feedback}</p>
                        </div>
                        <ImageGrid urls={data.target_content.image_urls} onPreview={setPreviewImageUrl} viewLabel={t('rpt.detail.reviewImages')} />
                      </div>
                    )}

                    {/* post */}
                    {isReportPostTarget(data.target_content) && (
                      <div className="space-y-3">
                        <div className="bg-[#f5f3ee] rounded-xl p-4 border border-[#d4af37]/10">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {data.target_content.author.avatar_url ? (
                                <img src={data.target_content.author.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#d4af37]/30" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center shrink-0">
                                  <span className="text-sm font-bold text-white">{data.target_content.author.full_name.charAt(0)}</span>
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-[#8a6d1c] uppercase tracking-wider">{t('rpt.detail.postAuthor')}</p>
                                <p className="font-medium text-gray-900 truncate text-sm">{data.target_content.author.full_name}</p>
                                <p className="text-xs text-gray-500 truncate">{data.target_content.author.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white rounded-full border border-[#d4af37]/20 px-2.5 py-1 text-xs font-semibold text-[#8a6d1c] shrink-0">
                              <ThumbsUp className="w-3 h-3" />
                              {data.target_content.likes_count}
                            </div>
                          </div>
                        </div>

                        {data.target_content.title && (
                          <div className="bg-[#f5f3ee] rounded-xl p-4 border border-[#d4af37]/10">
                            <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">{t('rpt.detail.postTitle')}</p>
                            <p className="text-sm font-bold text-slate-900">{data.target_content.title}</p>
                          </div>
                        )}

                        <div className="bg-[#f5f3ee] rounded-xl p-4 border border-[#d4af37]/10">
                          <div className="flex items-center gap-2 text-[#8a6d1c] mb-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">{t('rpt.detail.postContent')}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{data.target_content.content}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                          <div className="bg-white rounded-lg p-2.5 border border-[#d4af37]/10">
                            <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">{t('rpt.detail.postStatus')}</p>
                            <p className="text-xs font-bold text-slate-800 capitalize">{data.target_content.status}</p>
                          </div>
                          <div className="bg-white rounded-lg p-2.5 border border-[#d4af37]/10">
                            <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">{t('rpt.detail.postActive')}</p>
                            <Badge variant="outline" className={`gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${data.target_content.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                              {data.target_content.is_active ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                              {data.target_content.is_active ? t('common.active') : t('common.inactive')}
                            </Badge>
                          </div>
                          <div className="bg-white rounded-lg p-2.5 border border-[#d4af37]/10">
                            <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Media</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                              <ImageIcon className="w-3 h-3" />{data.target_content.image_urls?.length || 0}
                              {data.target_content.audio_url && <Volume2 className="w-3 h-3 ml-1" />}
                              {data.target_content.video_url && <Video className="w-3 h-3 ml-1" />}
                            </div>
                          </div>
                        </div>

                        <ImageGrid urls={data.target_content.image_urls} onPreview={setPreviewImageUrl} viewLabel={t('rpt.detail.reviewImages')} />
                      </div>
                    )}

                    {/* comment */}
                    {isReportCommentTarget(data.target_content) && (
                      <div className="space-y-3">
                        <div className="bg-[#f5f3ee] rounded-xl p-4 border border-[#d4af37]/10">
                          <div className="flex items-center gap-3">
                            {data.target_content.author.avatar_url ? (
                              <img src={data.target_content.author.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#d4af37]/30" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center shrink-0">
                                <span className="text-sm font-bold text-white">{data.target_content.author.full_name.charAt(0)}</span>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-[#8a6d1c] uppercase tracking-wider">{t('rpt.detail.commentAuthor')}</p>
                              <p className="font-medium text-gray-900 truncate text-sm">{data.target_content.author.full_name}</p>
                              <p className="text-xs text-gray-500 truncate">{data.target_content.author.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-[#f5f3ee] rounded-xl p-4 border border-[#d4af37]/10">
                          <div className="flex items-center gap-2 text-[#8a6d1c] mb-2">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">{t('rpt.detail.commentContent')}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{data.target_content.content}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 border border-[#d4af37]/10 inline-flex items-center gap-2">
                          <p className="text-[10px] font-semibold uppercase text-slate-400">{t('rpt.detail.postActive')}:</p>
                          <Badge variant="outline" className={`gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${data.target_content.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                            {data.target_content.is_active ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                            {data.target_content.is_active ? t('common.active') : t('common.inactive')}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* journal */}
                    {isReportJournalTarget(data.target_content) && (
                      <div className="space-y-3">
                        <div className="bg-[#f5f3ee] rounded-xl p-4 border border-[#d4af37]/10">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {data.target_content.author.avatar_url ? (
                                <img src={data.target_content.author.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#d4af37]/30" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center shrink-0">
                                  <span className="text-sm font-bold text-white">{data.target_content.author.full_name.charAt(0)}</span>
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-[#8a6d1c] uppercase tracking-wider">{t('rpt.detail.journalAuthor')}</p>
                                <p className="font-medium text-gray-900 truncate text-sm">{data.target_content.author.full_name}</p>
                                <p className="text-xs text-gray-500 truncate">{data.target_content.author.email}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className={`gap-1 rounded-full text-xs font-semibold shrink-0 ${data.target_content.visibility === 'public' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                              {data.target_content.visibility === 'public' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              {data.target_content.visibility === 'public' ? t('rpt.detail.journalPublic') : t('rpt.detail.journalPrivate')}
                            </Badge>
                          </div>
                        </div>

                        {data.target_content.title && (
                          <div className="bg-[#f5f3ee] rounded-xl p-4 border border-[#d4af37]/10">
                            <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">{t('rpt.detail.postTitle')}</p>
                            <p className="text-sm font-bold text-slate-900">{data.target_content.title}</p>
                          </div>
                        )}

                        <div className="bg-[#f5f3ee] rounded-xl p-4 border border-[#d4af37]/10">
                          <div className="flex items-center gap-2 text-[#8a6d1c] mb-2">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">{t('rpt.detail.journalContent')}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{data.target_content.content}</p>
                        </div>

                        <ImageGrid urls={data.target_content.image_urls} onPreview={setPreviewImageUrl} viewLabel={t('rpt.detail.reviewImages')} />
                      </div>
                    )}

                    {/* nearby_place_review */}
                    {isReportNearbyPlaceReviewTarget(data.target_content) && (
                      <div className="space-y-3">
                        <div className="bg-[#f5f3ee] rounded-xl p-4 border border-[#d4af37]/10">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-semibold uppercase text-slate-400 mb-2">{t('rpt.detail.reviewRating')}</p>
                              <div className="flex items-center gap-2">
                                <StarRating value={data.target_content.rating} />
                                <span className="text-xl font-bold tabular-nums text-slate-800">{data.target_content.rating}</span>
                                <span className="text-xs font-semibold text-slate-400">/5</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold uppercase text-slate-400 mb-2">{t('rpt.detail.postActive')}</p>
                              <Badge variant="outline" className={`gap-1 rounded-full text-xs font-semibold ${data.target_content.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                {data.target_content.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                {data.target_content.is_active ? t('common.active') : t('common.inactive')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <PersonCard
                          name={data.target_content.reviewer.full_name}
                          email={data.target_content.reviewer.email}
                          avatarUrl={data.target_content.reviewer.avatar_url}
                          roleLabel={t('rpt.detail.reviewReviewer')}
                        />
                        <div className="bg-[#f5f3ee] rounded-xl p-4 border border-[#d4af37]/10">
                          <div className="flex items-center gap-2 text-[#8a6d1c] mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">{t('rpt.detail.nearbyComment')}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{data.target_content.comment}</p>
                        </div>
                        <ImageGrid urls={data.target_content.image_urls} onPreview={setPreviewImageUrl} viewLabel={t('rpt.detail.reviewImages')} />
                      </div>
                    )}

                    {/* Fallback: unknown target types */}
                    {!isReportSiteReviewTarget(data.target_content)
                      && !isReportPostTarget(data.target_content)
                      && !isReportCommentTarget(data.target_content)
                      && !isReportJournalTarget(data.target_content)
                      && !isReportNearbyPlaceReviewTarget(data.target_content)
                      && (
                        <div className="bg-[#f5f3ee] rounded-xl p-4 border border-[#d4af37]/10">
                          <pre className="max-h-40 overflow-auto text-xs text-slate-600 leading-relaxed whitespace-pre-wrap break-words">
                            {JSON.stringify(data.target_content, null, 2)}
                          </pre>
                        </div>
                      )}
                  </div>
                )}

                {/* ── Timestamps ── */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#f5f3ee] rounded-xl p-3.5">
                    <div className="flex items-center gap-2 text-[#8a6d1c] mb-1.5">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">{t('rpt.col.date')}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700">{formatDate(data.created_at)}</p>
                  </div>
                  <div className="bg-[#f5f3ee] rounded-xl p-3.5">
                    <div className="flex items-center gap-2 text-[#8a6d1c] mb-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">{t('rpt.detail.updatedAt')}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700">{formatDate(data.updated_at)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── Footer ─── */}
          {!loading && data && (
            <div className="p-4 border-t border-slate-200 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                {t('rpt.detail.close')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image preview overlay */}
      <ImagePreviewDialog
        open={!!previewImageUrl}
        onOpenChange={(o) => { if (!o) setPreviewImageUrl(null); }}
        src={previewImageUrl}
      />
    </>
  );
};
