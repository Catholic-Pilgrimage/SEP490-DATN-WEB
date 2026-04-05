import React from 'react';
import {
  MapPin,
  Users,
  AlertTriangle,
  TrendingUp,
  FileText,
  MessageSquare,
  Calendar as CalendarIcon,
  Route,
} from 'lucide-react';
import { DashboardOverviewData, AdminDashboardPeriod } from '../../../types/admin.types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { dash } from './dashboardTheme';

interface KPICardsProps {
  data?: DashboardOverviewData;
  loading?: boolean;
  period: AdminDashboardPeriod;
  onPeriodChange: (period: AdminDashboardPeriod | undefined) => void;
  fromDate?: Date;
  toDate?: Date;
  onFromDateChange: (date?: Date) => void;
  onToDateChange: (date?: Date) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  data,
  loading = false,
  period,
  onPeriodChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}) => {
  const { t, language } = useLanguage();

  const defaultData: DashboardOverviewData = {
    filter_applied: { period: 'all', from_date: null, to_date: null },
    users: {
      total: 0,
      by_role: { pilgrim: 0, local_guide: 0, manager: 0, admin: 0 },
      new_this_month: 0,
      banned: 0,
    },
    sites: {
      total: 0,
      active: 0,
      inactive: 0,
      by_region: { Bac: 0, Trung: 0, Nam: 0 },
      by_type: { church: 0, shrine: 0, monastery: 0, center: 0, other: 0 },
    },
    planners: { total: 0, planning: 0, ongoing: 0, completed: 0 },
    checkins: { total: 0, today: 0, this_week: 0, this_month: 0 },
    journals: { total: 0, public: 0, private: 0, this_month: 0 },
    posts: { total: 0, this_month: 0, total_likes: 0, total_comments: 0 },
    sos: {
      total: 0,
      by_status: { pending: 0, accepted: 0, resolved: 0, cancelled: 0 },
      by_region: { Bac: 0, Trung: 0, Nam: 0, unknown: 0 },
      avg_resolution_minutes: 0,
    },
    reports: {
      total: 0,
      by_status: { pending: 0, resolved: 0, dismissed: 0, reject: 0 },
      by_reason: { spam: 0, inappropriate: 0, harassment: 0, other: 0 },
    },
    content_pending_review: {
      verification_requests: 0,
      media: 0,
      schedules: 0,
      events: 0,
      nearby_places: 0,
      shifts: 0,
    },
  };

  const stats = data ?? defaultData;

  const pendingContent =
    stats.content_pending_review.verification_requests +
    stats.content_pending_review.media +
    stats.content_pending_review.schedules +
    stats.content_pending_review.events +
    stats.content_pending_review.nearby_places +
    stats.content_pending_review.shifts;

  const avgSos = Math.round(stats.sos.avg_resolution_minutes);

  const kpiData = [
    {
      title: t('kpi.activeSites'),
      value: stats.sites.active,
      subtitle: t('kpi.ofTotal').replace('{total}', stats.sites.total.toString()),
      icon: MapPin,
      iconWrap: 'rounded-xl border border-emerald-200/90 bg-emerald-50',
      iconGlyph: 'text-emerald-700',
      alert: false,
      stats: [{ label: t('common.inactive'), value: stats.sites.inactive, color: 'text-emerald-700/80' }],
    },
    {
      title: t('kpi.totalUsers'),
      value: stats.users.total,
      subtitle: `${stats.users.new_this_month > 0 ? '+' : ''}${stats.users.new_this_month} ${t('kpi.thisMonth')}`,
      icon: Users,
      iconWrap: 'rounded-xl border border-blue-200/90 bg-blue-50',
      iconGlyph: 'text-blue-700',
      alert: false,
      stats: [
        { label: t('kpi.pilgrims'), value: stats.users.by_role.pilgrim, color: 'text-blue-700' },
        { label: t('kpi.guides'), value: stats.users.by_role.local_guide, color: 'text-violet-600' },
        { label: t('kpi.managers'), value: stats.users.by_role.manager, color: 'text-slate-600' },
        { label: t('dashboard.roleAdmin'), value: stats.users.by_role.admin, color: 'text-amber-800' },
        { label: t('dashboard.usersBanned'), value: stats.users.banned, color: 'text-rose-600' },
      ],
    },
    {
      title: t('dashboard.plannersTitle'),
      value: stats.planners.total,
      subtitle: t('dashboard.plannersHint'),
      icon: Route,
      iconWrap: 'rounded-xl border border-violet-200/90 bg-violet-50',
      iconGlyph: 'text-violet-700',
      alert: false,
      stats: [
        { label: t('esc.plannerStatus.planning'), value: stats.planners.planning, color: 'text-violet-700' },
        { label: t('esc.plannerStatus.ongoing'), value: stats.planners.ongoing, color: 'text-violet-700' },
        { label: t('esc.plannerStatus.completed'), value: stats.planners.completed, color: 'text-violet-700' },
      ],
    },
    {
      title: t('kpi.sosAlerts'),
      value: stats.sos.by_status.pending,
      subtitle:
        stats.sos.by_status.pending > 0
          ? t('kpi.requiresAttention')
          : avgSos > 0
            ? `${avgSos} ${t('kpi.minutesAvg')}`
            : t('kpi.allClear'),
      icon: AlertTriangle,
      iconWrap:
        stats.sos.by_status.pending > 0
          ? 'rounded-xl border border-rose-200/90 bg-rose-50'
          : 'rounded-xl border border-amber-200/90 bg-amber-50',
      iconGlyph: stats.sos.by_status.pending > 0 ? 'text-rose-700' : 'text-amber-700',
      alert: stats.sos.by_status.pending > 0,
      stats: [
        { label: t('kpi.resolved'), value: stats.sos.by_status.resolved, color: 'text-emerald-600' },
        { label: t('kpi.total'), value: stats.sos.total, color: 'text-amber-800/80' },
      ],
    },
    {
      title: t('kpi.checkins'),
      value: stats.checkins.total,
      subtitle: `${t('dashboard.today')}: ${stats.checkins.today.toLocaleString()}`,
      icon: TrendingUp,
      iconWrap: 'rounded-xl border border-sky-200/90 bg-sky-50',
      iconGlyph: 'text-sky-700',
      alert: false,
      stats: [
        { label: t('kpi.thisWeek'), value: stats.checkins.this_week, color: 'text-sky-700' },
        { label: t('kpi.thisMonth'), value: stats.checkins.this_month, color: 'text-cyan-700' },
      ],
    },
    {
      title: t('kpi.communityPosts'),
      value: stats.posts.total,
      subtitle: `+${stats.posts.this_month} ${t('kpi.thisMonth')}`,
      icon: MessageSquare,
      iconWrap: 'rounded-xl border border-cyan-200/90 bg-cyan-50',
      iconGlyph: 'text-cyan-800',
      alert: false,
      stats: [
        { label: t('rpt.targetType.journal'), value: stats.journals.total, color: 'text-amber-800/90' },
        { label: t('kpi.likes'), value: stats.posts.total_likes, color: 'text-rose-500' },
        { label: t('kpi.comments'), value: stats.posts.total_comments, color: 'text-sky-600' },
      ],
    },
    {
      title: t('kpi.pendingReview'),
      value: pendingContent,
      subtitle: t('kpi.contentAwaiting'),
      icon: FileText,
      iconWrap:
        pendingContent > 0
          ? 'rounded-xl border border-orange-300/90 bg-orange-50'
          : 'rounded-xl border border-indigo-200/60 bg-indigo-50/50',
      iconGlyph: pendingContent > 0 ? 'text-orange-700' : 'text-indigo-600',
      alert: pendingContent > 0,
      /** 6 ô trong footer — lưới 2 cột để vừa card tiêu chuẩn */
      denseFooter: true,
      stats: [
        {
          label: t('menu.verifications'),
          value: stats.content_pending_review.verification_requests,
          color: 'text-orange-700',
        },
        { label: t('kpi.media'), value: stats.content_pending_review.media, color: 'text-indigo-700' },
        { label: t('tab.schedules'), value: stats.content_pending_review.schedules, color: 'text-violet-700' },
        { label: t('tab.events'), value: stats.content_pending_review.events, color: 'text-teal-700' },
        {
          label: t('tab.nearbyPlaces'),
          value: stats.content_pending_review.nearby_places,
          color: 'text-emerald-700',
        },
        { label: t('menu.shifts'), value: stats.content_pending_review.shifts, color: 'text-amber-800' },
      ],
    },
  ];

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={`text-sm font-medium ${dash.textAccentSoft}`}>{t('dashboard.keyMetrics')}</p>
        </div>

        <div
          className={`flex flex-wrap items-center gap-1 rounded-xl border p-1 ${dash.border} ${dash.bgMuted}`}
        >
          {(
            [
              { key: 'all', label: t('dashboard.allTime'), p: 'all' as const },
              { key: 'today', label: t('dashboard.today'), p: 'today' as const },
              { key: 'week', label: t('dashboard.week'), p: 'week' as const },
              { key: 'month', label: t('dashboard.month'), p: 'month' as const },
              { key: 'custom', label: t('dashboard.custom'), p: 'custom' as const },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onPeriodChange(item.p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:text-sm ${
                period === item.key
                  ? `${dash.gradient} text-white ${dash.gradientShadow}`
                  : `${dash.textAccent} hover:bg-[#d4af37]/12`
              }`}
            >
              {item.label}
            </button>
          ))}

          {period === 'custom' && (
            <div className="flex flex-wrap items-center gap-1 border-l border-[#d4af37]/25 pl-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs sm:text-sm ${
                      fromDate ? `font-medium ${dash.textAccent}` : 'text-slate-500'
                    }`}
                  >
                    <CalendarIcon className="h-3.5 w-3.5 text-[#d4af37]" />
                    {fromDate ? format(fromDate, 'dd/MM/yyyy') : t('dashboard.fromDate')}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden rounded-xl border border-[#d4af37]/20 p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={(d) => {
                      onFromDateChange(d);
                      if (d && toDate && d > toDate) onToDateChange(undefined);
                    }}
                    disabled={toDate ? { after: toDate } : undefined}
                    initialFocus
                    locale={language === 'vi' ? vi : enUS}
                    className="bg-white"
                  />
                </PopoverContent>
              </Popover>
              <span className="text-[#d4af37]/50">—</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs sm:text-sm ${
                      toDate ? `font-medium ${dash.textAccent}` : 'text-slate-500'
                    }`}
                  >
                    <CalendarIcon className="h-3.5 w-3.5 text-[#d4af37]" />
                    {toDate ? format(toDate, 'dd/MM/yyyy') : t('dashboard.toDate')}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden rounded-xl border border-[#d4af37]/20 p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(d) => {
                      onToDateChange(d);
                      if (d && fromDate && d < fromDate) onFromDateChange(undefined);
                    }}
                    disabled={fromDate ? { before: fromDate } : undefined}
                    initialFocus
                    locale={language === 'vi' ? vi : enUS}
                    className="bg-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`animate-pulse rounded-2xl border bg-white p-5 shadow-sm ${dash.border}`}
            >
              <div className="mb-4 flex justify-between">
                <div className="h-10 w-10 rounded-xl bg-[#f5f3ee]" />
              </div>
              <div className="mb-2 h-8 w-24 rounded bg-[#f5f3ee]" />
              <div className="h-4 w-32 rounded bg-[#f5f3ee]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;
            const denseFooter = 'denseFooter' in kpi && kpi.denseFooter;
            return (
              <div
                key={kpi.title + String(index)}
                className={`rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5 ${dash.border} ${dash.borderHover}`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className={`p-2.5 ${kpi.iconWrap}`}>
                    <Icon className={`h-5 w-5 ${kpi.iconGlyph}`} />
                  </div>
                  {kpi.alert && (
                    <span className="max-w-[9rem] truncate rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700">
                      {t('kpi.requiresAttention')}
                    </span>
                  )}
                </div>

                <div className="mb-1">
                  <span className="text-2xl font-semibold tabular-nums text-slate-900 sm:text-3xl">
                    {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                  </span>
                </div>

                <h3 className="text-sm font-medium text-slate-800">{kpi.title}</h3>
                <p
                  className={`mt-0.5 text-xs leading-snug ${
                    kpi.alert ? 'text-rose-600' : 'text-slate-500'
                  }`}
                >
                  {kpi.subtitle}
                </p>

                {kpi.stats.length > 0 && (
                  <div
                    className={`mt-3 border-t border-[#d4af37]/10 pt-3 ${
                      denseFooter
                        ? 'grid grid-cols-2 gap-x-2 gap-y-2'
                        : 'flex flex-wrap gap-x-3 gap-y-2'
                    }`}
                  >
                    {kpi.stats.map((stat, idx) => (
                      <div
                        key={idx}
                        className={`flex min-w-0 flex-col gap-0.5 ${denseFooter ? '' : 'min-w-[4.5rem]'}`}
                      >
                        <span
                          className={`font-semibold tabular-nums ${stat.color} ${
                            denseFooter ? 'text-xs sm:text-sm' : 'text-sm'
                          }`}
                        >
                          {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                        </span>
                        <span
                          className={`font-medium leading-snug ${stat.color} ${
                            denseFooter ? 'text-[9px] sm:text-[10px]' : 'text-[10px]'
                          }`}
                        >
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
