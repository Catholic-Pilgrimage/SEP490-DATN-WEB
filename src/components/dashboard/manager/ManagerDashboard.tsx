import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  ClipboardList,
  RefreshCw,
  MapPin,
  Image,
  Calendar,
  Star,
  Navigation,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock3,
  Building2,
  Calendar as CalendarIcon,
  X,
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import {
  ManagerDashboardOverviewData,
  ManagerDashboardPeriod,
} from '../../../types/manager.types';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TodayShifts } from './TodayShifts';
import { ManagerChartsSection } from './ManagerChartsSection';

// ─── Period Selector ─────────────────────────────────────────────────────────

interface PeriodSelectorProps {
  period: ManagerDashboardPeriod | 'all';
  onPeriodChange: (p: ManagerDashboardPeriod | undefined) => void;
  fromDate?: Date;
  toDate?: Date;
  onFromDateChange: (d?: Date) => void;
  onToDateChange: (d?: Date) => void;
  language: string;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  period,
  onPeriodChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  language,
}) => {
  const { t } = useLanguage();
  const tabs: { key: ManagerDashboardPeriod; label: string }[] = [
    { key: 'today', label: t('dashboard.today') },
    { key: 'week', label: t('dashboard.week') },
    { key: 'month', label: t('dashboard.month') },
    { key: 'custom', label: t('dashboard.custom') },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 p-1 bg-[#f5f3ee] border border-[#d4af37]/20 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onPeriodChange(tab.key)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            period === tab.key
              ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white shadow-sm'
              : 'text-[#8a6d1c] hover:bg-[#d4af37]/10'
          }`}
        >
          {tab.label}
        </button>
      ))}

      {period === 'custom' && (
        <div className="flex items-center gap-2 pl-2 border-l border-[#d4af37]/30 ml-1">
          <Popover>
            <PopoverTrigger asChild>
              <button
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
            <PopoverContent className="w-auto p-0 border-[#d4af37]/20 rounded-xl overflow-hidden" align="end">
              <CalendarPicker
                mode="single"
                selected={fromDate}
                onSelect={onFromDateChange}
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
            <PopoverContent className="w-auto p-0 border-[#d4af37]/20 rounded-xl overflow-hidden" align="end">
              <CalendarPicker
                mode="single"
                selected={toDate}
                onSelect={onToDateChange}
                initialFocus
                locale={language === 'vi' ? vi : enUS}
                className="bg-white"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  alert?: boolean;
  children?: React.ReactNode;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  alert,
  children,
}) => (
  <div className="group bg-white rounded-2xl p-5 shadow-sm border border-[#d4af37]/20 hover:shadow-lg hover:border-[#d4af37]/40 transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div
        className={`p-2.5 rounded-xl border ${iconBg} ${
          alert ? 'animate-pulse' : ''
        }`}
      >
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      {alert && (
        <div className="flex items-center gap-1 px-2 py-1 bg-rose-50 rounded-full">
          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-rose-600">Alert</span>
        </div>
      )}
    </div>
    <div className="mb-1">
      <span className="text-3xl font-bold text-slate-900">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
    <h3 className="text-sm font-semibold text-slate-900 mb-0.5">{title}</h3>
    {subtitle && (
      <p className={`text-xs ${alert ? 'text-rose-600' : 'text-slate-500'}`}>{subtitle}</p>
    )}
    {children && (
      <div className="mt-4 pt-3 border-t border-slate-100">{children}</div>
    )}
  </div>
);

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d4af37]/20 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 bg-[#d4af37]/10 rounded-xl" />
      <div className="w-16 h-4 bg-slate-100 rounded" />
    </div>
    <div className="h-8 w-20 bg-slate-100 rounded mb-2" />
    <div className="h-4 w-24 bg-slate-100 rounded" />
  </div>
);

// ─── Content Stats Row ────────────────────────────────────────────────────────

interface ContentStatRowProps {
  icon: React.ElementType;
  label: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const ContentStatRow: React.FC<ContentStatRowProps> = ({
  icon: Icon,
  label,
  total,
  pending,
  approved,
  rejected,
}) => (
  <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
    <div className="p-2 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 shrink-0">
      <Icon className="w-4 h-4 text-[#8a6d1c]" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-800 truncate">{label}</p>
      <p className="text-xs text-slate-400">Tổng: {total}</p>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      {pending > 0 && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700">
          <Clock3 className="w-3 h-3" />
          {pending}
        </span>
      )}
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-xs font-medium text-green-700">
        <CheckCircle2 className="w-3 h-3" />
        {approved}
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
        <XCircle className="w-3 h-3" />
        {rejected}
      </span>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const ManagerDashboard: React.FC = () => {
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const [data, setData] = useState<ManagerDashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [period, setPeriod] = useState<ManagerDashboardPeriod | 'all'>('month');
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const fetchData = useCallback(
    async (
      selectedPeriod?: ManagerDashboardPeriod,
      fDate?: Date,
      tDate?: Date,
      notifyUser = false
    ) => {
      setLoading(true);
      try {
        const response = await ManagerService.getDashboardOverview({
          period: selectedPeriod,
          from_date: fDate ? format(fDate, 'yyyy-MM-dd') : undefined,
          to_date: tDate ? format(tDate, 'yyyy-MM-dd') : undefined,
        });

        if (response.success && response.data) {
          setData(response.data);
          setFetchError(null);
          if (notifyUser) {
            showToast('success', 'Cập nhật thành công', 'Dữ liệu dashboard đã được làm mới.');
          }
        } else {
          const msg = response.message || 'Không thể tải dữ liệu dashboard';
          if (notifyUser) {
            showToast('error', 'Lỗi tải dữ liệu', msg);
          } else {
            setFetchError(msg);
          }
        }
      } catch (error) {
        console.error('Error fetching manager dashboard:', error);
        const msg = 'Không thể kết nối đến server. Vui lòng thử lại.';
        if (notifyUser) {
          showToast('error', 'Lỗi kết nối', msg);
        } else {
          setFetchError(msg);
        }
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchData(
      period === 'all' ? undefined : period,
      fromDate,
      toDate,
      false
    );
  }, [period, fromDate, toDate, fetchData]);

  const handlePeriodChange = (p?: ManagerDashboardPeriod) => {
    if (p) setPeriod(p);
  };

  const pendingSOS = data?.sos.by_status.pending ?? 0;
  const cs = data?.content_stats;

  const siteTypeLabel: Record<string, string> = {
    church: t('siteType.church'),
    shrine: t('siteType.shrine'),
    monastery: t('siteType.monastery'),
    center: t('siteType.center'),
    other: t('siteType.other'),
  };
  const siteRegionLabel: Record<string, string> = {
    Bac: t('region.bac'),
    Trung: t('region.trung'),
    Nam: t('region.nam'),
  };

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-slate-600 mt-1">{t('dashboard.welcome')}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500">{t('dashboard.lastUpdated')}</p>
            <p className="text-sm font-medium text-slate-700">
              {new Date().toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={() =>
              fetchData(
                period === 'all' ? undefined : period,
                fromDate,
                toDate,
                true
              )
            }
            disabled={loading}
            className="flex items-center gap-2 h-10 px-4 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white font-medium rounded-lg hover:brightness-110 transition-all disabled:opacity-50 shadow-sm shadow-[#d4af37]/20"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </button>
        </div>
      </div>

      {fetchError && !loading && (
        <div
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-amber-950 shadow-sm"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-900">{t('dashboard.loadErrorTitle')}</p>
            <p className="mt-1 text-sm text-amber-800/90">{fetchError}</p>
          </div>
          <button
            type="button"
            onClick={() => setFetchError(null)}
            className="shrink-0 rounded-lg p-1 text-amber-700 transition-colors hover:bg-amber-100/80"
            aria-label={t('common.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* ── Period Filter ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.overview')}</h2>
        <PeriodSelector
          period={period}
          onPeriodChange={handlePeriodChange}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          language={language}
        />
      </div>

      {/* ── Site Info Banner ────────────────────────────────────────────── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#d4af37]/20 overflow-hidden animate-pulse h-32" />
      ) : data?.site ? (
        <div className="relative bg-white rounded-2xl border border-[#d4af37]/20 overflow-hidden shadow-sm">
          {data.site.cover_image && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10"
              style={{ backgroundImage: `url(${data.site.cover_image})` }}
            />
          )}
          <div className="relative flex items-center gap-4 p-5">
            {data.site.cover_image ? (
              <img
                src={data.site.cover_image}
                alt={data.site.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-[#d4af37]/30 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[#d4af37]/10 border-2 border-[#d4af37]/30 flex items-center justify-center shrink-0">
                <Building2 className="w-7 h-7 text-[#8a6d1c]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900 truncate">{data.site.name}</h3>
                <span className="text-xs font-mono px-2 py-0.5 bg-[#d4af37]/10 text-[#8a6d1c] rounded-md border border-[#d4af37]/20">
                  {data.site.code}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {siteRegionLabel[data.site.region] ?? data.site.region}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5" />
                  {siteTypeLabel[data.site.type] ?? data.site.type}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Checkins Today */}
          <KPICard
            title={t('managerDash.checkinsToday')}
            value={data?.checkins.today ?? 0}
            subtitle={`${t('managerDash.checkinsWeek')}: ${data?.checkins.this_week ?? 0} · ${t('managerDash.checkinsMonth')}: ${data?.checkins.this_month ?? 0}`}
            icon={TrendingUp}
            iconBg="bg-amber-50 border-amber-200"
            iconColor="text-amber-600"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-700">{data?.checkins.total ?? 0}</span>
              <span className="text-xs text-slate-400">{t('managerDash.checkinsTotal')}</span>
            </div>
          </KPICard>

          {/* Local Guides */}
          <KPICard
            title={t('managerDash.localGuides')}
            value={data?.local_guides.total ?? 0}
            subtitle={t('managerDash.localGuidesDesc')}
            icon={Users}
            iconBg="bg-violet-50 border-violet-200"
            iconColor="text-violet-600"
          />

          {/* SOS Pending */}
          <KPICard
            title={t('managerDash.sosPending')}
            value={pendingSOS}
            subtitle={pendingSOS > 0 ? t('managerDash.sosAlert') : t('managerDash.sosOk')}
            icon={AlertTriangle}
            iconBg={pendingSOS > 0 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}
            iconColor={pendingSOS > 0 ? 'text-rose-600' : 'text-slate-400'}
            alert={pendingSOS > 0}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs text-slate-500">{data?.sos.by_status.resolved ?? 0} {t('managerDash.sosResolved')}</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">{data?.sos.by_status.cancelled ?? 0} {t('managerDash.sosCancelled')}</span>
              </div>
            </div>
          </KPICard>

          {/* Pending Tasks */}
          <KPICard
            title={t('managerDash.pendingTasks')}
            value={data?.pending_tasks.total ?? 0}
            subtitle={t('managerDash.pendingTasksDesc')}
            icon={ClipboardList}
            iconBg={
              (data?.pending_tasks.total ?? 0) > 0
                ? 'bg-orange-50 border-orange-200'
                : 'bg-slate-50 border-slate-200'
            }
            iconColor={
              (data?.pending_tasks.total ?? 0) > 0 ? 'text-orange-600' : 'text-slate-400'
            }
          />
        </div>
      )}

      {/* ── Content Stats + SOS Detail ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Stats */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d4af37]/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20">
              <Navigation className="w-4 h-4 text-[#8a6d1c]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{t('managerDash.contentStats')}</h3>
              <p className="text-xs text-slate-500">{t('managerDash.contentStatsDesc')}</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
            <span className="inline-flex items-center gap-1 text-xs text-amber-700">
              <Clock3 className="w-3 h-3" /> {t('managerDash.contentPending')}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-green-700">
              <CheckCircle2 className="w-3 h-3" /> {t('managerDash.contentApproved')}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-rose-700">
              <XCircle className="w-3 h-3" /> {t('managerDash.contentRejected')}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div>
              <ContentStatRow
                icon={Image}
                label={t('managerDash.media')}
                total={cs?.media.total ?? 0}
                pending={cs?.media.pending ?? 0}
                approved={cs?.media.approved ?? 0}
                rejected={cs?.media.rejected ?? 0}
              />
              <ContentStatRow
                icon={Calendar}
                label={t('managerDash.schedules')}
                total={cs?.schedules.total ?? 0}
                pending={cs?.schedules.pending ?? 0}
                approved={cs?.schedules.approved ?? 0}
                rejected={cs?.schedules.rejected ?? 0}
              />
              <ContentStatRow
                icon={CalendarDays}
                label={t('managerDash.events')}
                total={cs?.events.total ?? 0}
                pending={cs?.events.pending ?? 0}
                approved={cs?.events.approved ?? 0}
                rejected={cs?.events.rejected ?? 0}
              />
              <ContentStatRow
                icon={MapPin}
                label={t('managerDash.nearbyPlaces')}
                total={cs?.nearby_places.total ?? 0}
                pending={cs?.nearby_places.pending ?? 0}
                approved={cs?.nearby_places.approved ?? 0}
                rejected={cs?.nearby_places.rejected ?? 0}
              />
              <ContentStatRow
                icon={Users}
                label={t('managerDash.shifts')}
                total={cs?.shifts.total ?? 0}
                pending={cs?.shifts.pending ?? 0}
                approved={cs?.shifts.approved ?? 0}
                rejected={cs?.shifts.rejected ?? 0}
              />
            </div>
          )}
        </div>

        {/* SOS Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d4af37]/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{t('managerDash.sosOverview')}</h3>
              <p className="text-xs text-slate-500">{t('managerDash.sosOverviewDesc')}</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                {
                  label: t('managerDash.sosStatusPending'),
                  value: data?.sos.by_status.pending ?? 0,
                  bg: 'bg-amber-50',
                  border: 'border-amber-200',
                  text: 'text-amber-700',
                  icon: Clock3,
                  barColor: 'bg-amber-400',
                },
                {
                  label: t('managerDash.sosStatusAccepted'),
                  value: data?.sos.by_status.accepted ?? 0,
                  bg: 'bg-blue-50',
                  border: 'border-blue-200',
                  text: 'text-blue-700',
                  icon: Navigation,
                  barColor: 'bg-blue-400',
                },
                {
                  label: t('managerDash.sosStatusResolved'),
                  value: data?.sos.by_status.resolved ?? 0,
                  bg: 'bg-green-50',
                  border: 'border-green-200',
                  text: 'text-green-700',
                  icon: CheckCircle2,
                  barColor: 'bg-green-400',
                },
                {
                  label: t('managerDash.sosStatusCancelled'),
                  value: data?.sos.by_status.cancelled ?? 0,
                  bg: 'bg-slate-50',
                  border: 'border-slate-200',
                  text: 'text-slate-500',
                  icon: XCircle,
                  barColor: 'bg-slate-300',
                },
              ].map((item) => {
                const IconComp = item.icon;
                const total = data?.sos.total || 1;
                const pct = Math.round((item.value / total) * 100);
                return (
                  <div
                    key={item.label}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${item.bg} ${item.border}`}
                  >
                    <IconComp className={`w-4 h-4 ${item.text} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${item.text}`}>{item.label}</span>
                        <span className={`text-lg font-bold ${item.text}`}>{item.value}</span>
                      </div>
                      <div className="w-full bg-white/60 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-700 ${item.barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${item.text} shrink-0`}>{pct}%</span>
                  </div>
                );
              })}

              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-500">Tổng SOS</span>
                <span className="text-lg font-bold text-slate-900">{data?.sos.total ?? 0}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Charts Section ──────────────────────────────────────────── */}
      <ManagerChartsSection
        period={period}
        fromDate={fromDate}
        toDate={toDate}
      />

      {/* ── Today's Shifts ──────────────────────────────────────────────── */}
      <TodayShifts />
    </div>
  );
};
