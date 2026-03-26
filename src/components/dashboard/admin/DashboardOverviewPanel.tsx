import React from 'react';
import {
  DashboardFilterApplied,
  DashboardOverviewData,
  DashboardReportsStats,
} from '../../../types/admin.types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { dash } from './dashboardTheme';
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FileWarning,
  Flag,
  Layers,
  MapPinned,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface DashboardOverviewPanelProps {
  data: DashboardOverviewData | null;
  loading: boolean;
}

function reportRejectedCount(s: DashboardReportsStats['by_status']): number {
  return s.reject ?? s.dismissed ?? 0;
}

function formatFilterApplied(filter: DashboardFilterApplied, tr: (k: string) => string): string {
  if (filter.period === 'custom') {
    if (filter.from_date && filter.to_date) {
      return `${filter.from_date} → ${filter.to_date}`;
    }
    return tr('dashboard.custom');
  }
  const labels: Record<string, string> = {
    all: tr('dashboard.allTime'),
    today: tr('dashboard.today'),
    week: tr('dashboard.week'),
    month: tr('dashboard.month'),
  };
  return labels[filter.period] ?? String(filter.period);
}

function MiniBars({
  items,
}: {
  items: { key: string; label: string; value: number }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const pct = Math.min(100, Math.round((item.value / max) * 100));
        return (
          <div key={item.key} className="space-y-1">
            <div className="flex justify-between gap-2 text-xs">
              <span className="truncate text-[#8a6d1c]/85">{item.label}</span>
              <span className="shrink-0 font-semibold tabular-nums text-[#8a6d1c]">
                {item.value.toLocaleString()}
              </span>
            </div>
            <div className={cn('h-1.5 overflow-hidden rounded-full', dash.barTrack)}>
              <div
                className={cn('h-full rounded-full transition-all', dash.barFill)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#d4af37]/10 py-2 text-sm last:border-0">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold tabular-nums text-[#8a6d1c]">{value.toLocaleString()}</span>
    </div>
  );
}

/** Màu icon từng panel — dễ phân biệt, vẫn hài hòa với nền sáng */
const panelIconClass: Record<
  'emerald' | 'teal' | 'violet' | 'sky' | 'amber' | 'rose' | 'orange' | 'red' | 'indigo' | 'gold',
  string
> = {
  emerald: 'border-emerald-200/90 bg-emerald-50 text-emerald-700',
  teal: 'border-teal-200/90 bg-teal-50 text-teal-700',
  violet: 'border-violet-200/90 bg-violet-50 text-violet-700',
  sky: 'border-sky-200/90 bg-sky-50 text-sky-700',
  amber: 'border-amber-200/90 bg-amber-50 text-amber-800',
  rose: 'border-rose-200/90 bg-rose-50 text-rose-700',
  orange: 'border-orange-200/90 bg-orange-50 text-orange-700',
  red: 'border-red-200/90 bg-red-50 text-red-700',
  indigo: 'border-indigo-200/90 bg-indigo-50 text-indigo-700',
  gold: 'border-[#d4af37]/30 bg-[#d4af37]/10 text-[#8a6d1c]',
};

function PanelShell({
  title,
  icon: Icon,
  children,
  className,
  iconTone = 'gold',
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
  iconTone?: keyof typeof panelIconClass;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-[#d4af37]/[0.08]',
        dash.border,
        className
      )}
    >
      <div className="mb-4 flex items-center gap-2.5 border-b border-[#d4af37]/10 pb-3">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border',
            panelIconClass[iconTone]
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <h3 className={cn('text-sm font-semibold tracking-tight', dash.textAccent)}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export const DashboardOverviewPanel: React.FC<DashboardOverviewPanelProps> = ({
  data,
  loading,
}) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-[#f5f3ee]" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`h-56 animate-pulse rounded-2xl border bg-[#faf8f3] ${dash.border}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { sites, planners, checkins, journals, sos, reports } = data;

  const siteRegions = (
    ['Bac', 'Trung', 'Nam'] as const
  ).map((k) => ({
    key: k,
    label: t(`region.${k.toLowerCase() as 'bac' | 'trung' | 'nam'}`),
    value: sites.by_region[k],
  }));

  const siteTypes = (
    ['church', 'shrine', 'monastery', 'center', 'other'] as const
  ).map((k) => ({
    key: k,
    label: t(`siteType.${k}`),
    value: sites.by_type[k],
  }));

  const sosRegions = (['Bac', 'Trung', 'Nam', 'unknown'] as const).map((k) => ({
    key: k,
    label: k === 'unknown' ? t('region.unknown') : t(`region.${k.toLowerCase() as 'bac' | 'trung' | 'nam'}`),
    value: sos.by_region[k],
  }));

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-500" />
        <h2 className={cn('text-base font-semibold', dash.textAccent)}>{t('dashboard.dataBreakdown')}</h2>
      </div>

      <div
        className={`flex flex-wrap items-center gap-2 rounded-xl border border-dashed px-4 py-2.5 text-sm ${dash.borderInput} ${dash.bgMuted} text-slate-600`}
      >
        <span className={`font-medium ${dash.textAccentSoft}`}>{t('dashboard.filterApplied')}</span>
        <span
          className={`rounded-md bg-white px-2 py-0.5 font-medium shadow-sm ring-1 ring-[#d4af37]/20 ${dash.textAccent}`}
        >
          {formatFilterApplied(data.filter_applied, t)}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <PanelShell title={t('dashboard.sitesByRegion')} icon={MapPinned} iconTone="emerald">
          <MiniBars items={siteRegions} />
        </PanelShell>

        <PanelShell title={t('dashboard.sitesByType')} icon={Layers} iconTone="teal">
          <MiniBars items={siteTypes} />
        </PanelShell>

        <PanelShell title={t('dashboard.plannersTitle')} icon={CalendarCheck} iconTone="violet">
          <StatLine label={t('kpi.total')} value={planners.total} />
          <StatLine label={t('esc.plannerStatus.planning')} value={planners.planning} />
          <StatLine label={t('esc.plannerStatus.ongoing')} value={planners.ongoing} />
          <StatLine label={t('esc.plannerStatus.completed')} value={planners.completed} />
          <p className="mt-3 text-xs text-[#8a6d1c]/55">{t('dashboard.plannersHint')}</p>
        </PanelShell>

        <PanelShell title={t('dashboard.checkinsDetail')} icon={ClipboardList} iconTone="sky">
          <StatLine label={t('dashboard.checkinsTotal')} value={checkins.total} />
          <StatLine label={t('dashboard.today')} value={checkins.today} />
          <StatLine label={t('kpi.thisWeek')} value={checkins.this_week} />
          <StatLine label={t('kpi.thisMonth')} value={checkins.this_month} />
        </PanelShell>

        <PanelShell title={t('rpt.targetType.journal')} icon={BookOpen}>
          <StatLine label={t('kpi.total')} value={journals.total} />
          <StatLine label={t('dashboard.journalsPublic')} value={journals.public} />
          <StatLine label={t('dashboard.journalsPrivate')} value={journals.private} />
          <StatLine label={t('kpi.thisMonth')} value={journals.this_month} />
        </PanelShell>

        <PanelShell title={t('dashboard.sosDetail')} icon={ShieldAlert} iconTone="rose">
          <StatLine label={t('sos.statusPending')} value={sos.by_status.pending} />
          <StatLine label={t('sos.statusAccepted')} value={sos.by_status.accepted} />
          <StatLine label={t('sos.statusResolved')} value={sos.by_status.resolved} />
          <StatLine label={t('sos.statusCancelled')} value={sos.by_status.cancelled} />
          <div className="mt-2 border-t border-[#d4af37]/10 pt-2 text-xs font-medium text-slate-500">
            {t('kpi.responseTime')}:{' '}
            <span className={dash.textAccent}>
              {sos.avg_resolution_minutes > 0
                ? `${Math.round(sos.avg_resolution_minutes)} ${t('kpi.minutesAvg')}`
                : t('kpi.noData')}
            </span>
          </div>
        </PanelShell>

        <PanelShell
          title={`${t('kpi.sosAlerts')} — ${t('dashboard.sitesByRegion')}`}
          icon={Flag}
          iconTone="orange"
        >
          <MiniBars items={sosRegions} />
        </PanelShell>

        <PanelShell title={t('menu.reports')} icon={FileWarning} iconTone="red">
          <StatLine label={t('kpi.total')} value={reports.total} />
          <StatLine label={t('rpt.status.pending')} value={reports.by_status.pending} />
          <StatLine label={t('rpt.status.resolved')} value={reports.by_status.resolved} />
          <StatLine label={t('rpt.status.reject')} value={reportRejectedCount(reports.by_status)} />
          <div className="my-2 border-t border-[#d4af37]/10" />
          <StatLine label={t('rpt.reason.spam')} value={reports.by_reason.spam} />
          <StatLine label={t('rpt.reason.inappropriate')} value={reports.by_reason.inappropriate} />
          <StatLine label={t('rpt.reason.harassment')} value={reports.by_reason.harassment} />
          <StatLine label={t('rpt.reason.other')} value={reports.by_reason.other} />
        </PanelShell>
      </div>
    </section>
  );
};
