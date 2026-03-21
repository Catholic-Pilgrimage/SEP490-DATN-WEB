import React from 'react';
import {
  MapPin,
  Users,
  UserCheck,
  AlertTriangle,
  TrendingUp,
  Clock,
  FileText,
  MessageSquare,
  Calendar as CalendarIcon
} from 'lucide-react';
import { DashboardOverviewData, DashboardPeriod } from '../../../types/admin.types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface KPICardsProps {
  data?: DashboardOverviewData;
  loading?: boolean;
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod | undefined) => void;
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
  onToDateChange
}) => {
  const { t, language } = useLanguage();

  // Default values if no data
  const defaultData = {
    users: { total: 0, by_role: { pilgrim: 0, local_guide: 0, manager: 0, admin: 0 }, new_this_month: 0, banned: 0 },
    sites: { total: 0, active: 0, inactive: 0, by_region: { Bac: 0, Trung: 0, Nam: 0 }, by_type: { church: 0, shrine: 0, monastery: 0, center: 0, other: 0 } },
    planners: { total: 0, planning: 0, ongoing: 0, completed: 0 },
    checkins: { total: 0, today: 0, this_week: 0, this_month: 0 },
    journals: { total: 0, public: 0, private: 0, this_month: 0 },
    posts: { total: 0, this_month: 0, total_likes: 0, total_comments: 0 },
    sos: { total: 0, by_status: { pending: 0, accepted: 0, resolved: 0, cancelled: 0 }, by_region: { Bac: 0, Trung: 0, Nam: 0, unknown: 0 }, avg_resolution_minutes: 0 },
    reports: { total: 0, by_status: { pending: 0, resolved: 0, dismissed: 0 }, by_reason: { spam: 0, inappropriate: 0, harassment: 0, other: 0 } },
    content_pending_review: { verification_requests: 0, media: 0, schedules: 0, events: 0, nearby_places: 0, shifts: 0 }
  };

  const stats = data || defaultData;

  // Calculate key metrics
  const totalUsers = stats.users.total;
  const activePilgrims = stats.users.by_role.pilgrim;
  const activeGuides = stats.users.by_role.local_guide;
  const managers = stats.users.by_role.manager;
  const newUsers = stats.users.new_this_month;

  const activeSites = stats.sites.active;
  const totalSites = stats.sites.total;
  const inactiveSites = stats.sites.inactive;

  const pendingSOS = stats.sos.by_status.pending;
  const resolvedSOS = stats.sos.by_status.resolved;
  const totalSOS = stats.sos.total;
  const avgResponseTime = Math.round(stats.sos.avg_resolution_minutes);

  const todayCheckins = stats.checkins.today;
  const weekCheckins = stats.checkins.this_week;

  const pendingContent = stats.content_pending_review.verification_requests +
    stats.content_pending_review.media +
    stats.content_pending_review.schedules +
    stats.content_pending_review.events +
    stats.content_pending_review.nearby_places +
    stats.content_pending_review.shifts;

  const totalPosts = stats.posts.total;
  const postsThisMonth = stats.posts.this_month;
  const totalLikes = stats.posts.total_likes;
  const totalComments = stats.posts.total_comments;

  const kpiData = [
    {
      title: t('kpi.activeSites'),
      value: activeSites,
      subtitle: t('kpi.ofTotal').replace('{total}', totalSites.toString()),
      icon: MapPin,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      iconBg: 'bg-emerald-100',
      iconBorder: 'border-emerald-200',
      iconColor: 'text-emerald-600',
      stats: [
        { label: t('common.inactive'), value: inactiveSites, color: 'text-slate-500' }
      ]
    },
    {
      title: t('kpi.totalUsers'),
      value: totalUsers,
      subtitle: `${newUsers > 0 ? '+' : ''}${newUsers} ${t('kpi.thisMonth')}`,
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-100',
      iconBorder: 'border-blue-200',
      iconColor: 'text-blue-600',
      stats: [
        { label: t('kpi.pilgrims'), value: activePilgrims, color: 'text-blue-600' },
        { label: t('kpi.guides'), value: activeGuides, color: 'text-purple-600' }
      ]
    },
    {
      title: t('kpi.activeGuides'),
      value: activeGuides,
      subtitle: `${managers} ${t('kpi.managers').toLowerCase()}`,
      icon: UserCheck,
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-50 to-purple-50',
      iconBg: 'bg-violet-100',
      iconBorder: 'border-violet-200',
      iconColor: 'text-violet-600',
      stats: [
        { label: t('kpi.certified'), value: activeGuides, color: 'text-violet-600' }
      ]
    },
    {
      title: t('kpi.sosAlerts'),
      value: pendingSOS,
      subtitle: pendingSOS > 0 ? t('kpi.requiresAttention') : t('kpi.allClear'),
      icon: AlertTriangle,
      gradient: pendingSOS > 0 ? 'from-rose-500 to-red-600' : 'from-slate-500 to-slate-600',
      bgGradient: pendingSOS > 0 ? 'from-rose-50 to-red-50' : 'from-slate-50 to-slate-100',
      iconBg: pendingSOS > 0 ? 'bg-rose-100' : 'bg-slate-100',
      iconBorder: pendingSOS > 0 ? 'border-rose-200' : 'border-slate-200',
      iconColor: pendingSOS > 0 ? 'text-rose-600' : 'text-slate-600',
      alert: pendingSOS > 0,
      stats: [
        { label: t('kpi.resolved'), value: resolvedSOS, color: 'text-green-600' },
        { label: t('kpi.total'), value: totalSOS, color: 'text-slate-500' }
      ]
    },
    {
      title: t('kpi.checkins'),
      value: todayCheckins,
      subtitle: t('dashboard.today'),
      icon: TrendingUp,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      iconBg: 'bg-amber-100',
      iconBorder: 'border-amber-200',
      iconColor: 'text-amber-600',
      stats: [
        { label: t('kpi.thisWeek'), value: weekCheckins, color: 'text-amber-600' }
      ]
    },
    {
      title: t('kpi.responseTime'),
      value: avgResponseTime > 0 ? avgResponseTime : t('kpi.noData'),
      subtitle: avgResponseTime > 0 ? t('kpi.minutesAvg') : t('kpi.noData'),
      icon: Clock,
      gradient: avgResponseTime < 30 ? 'from-emerald-500 to-green-600' :
        avgResponseTime < 60 ? 'from-amber-500 to-orange-600' : 'from-rose-500 to-red-600',
      bgGradient: avgResponseTime < 30 ? 'from-emerald-50 to-green-50' :
        avgResponseTime < 60 ? 'from-amber-50 to-orange-50' : 'from-rose-50 to-red-50',
      iconBg: avgResponseTime < 30 ? 'bg-emerald-100' :
        avgResponseTime < 60 ? 'bg-amber-100' : 'bg-rose-100',
      iconBorder: avgResponseTime < 30 ? 'border-emerald-200' :
        avgResponseTime < 60 ? 'border-amber-200' : 'border-rose-200',
      iconColor: avgResponseTime < 30 ? 'text-emerald-600' :
        avgResponseTime < 60 ? 'text-amber-600' : 'text-rose-600',
      suffix: avgResponseTime > 0 ? 'm' : '',
      stats: avgResponseTime > 0 ? [
        { label: t('kpi.avg'), value: `${Math.round(avgResponseTime / 60)}h`, color: 'text-slate-600' }
      ] : []
    },
    {
      title: t('kpi.pendingReview'),
      value: pendingContent,
      subtitle: t('kpi.contentAwaiting'),
      icon: FileText,
      gradient: pendingContent > 0 ? 'from-orange-500 to-amber-600' : 'from-slate-500 to-slate-600',
      bgGradient: pendingContent > 0 ? 'from-orange-50 to-amber-50' : 'from-slate-50 to-slate-100',
      iconBg: pendingContent > 0 ? 'bg-orange-100' : 'bg-slate-100',
      iconBorder: pendingContent > 0 ? 'border-orange-200' : 'border-slate-200',
      iconColor: pendingContent > 0 ? 'text-orange-600' : 'text-slate-600',
      stats: [
        { label: t('menu.verifications'), value: stats.content_pending_review.verification_requests, color: 'text-orange-600' },
        { label: t('kpi.media'), value: stats.content_pending_review.media, color: 'text-purple-600' }
      ]
    },
    {
      title: t('kpi.communityPosts'),
      value: totalPosts,
      subtitle: `+${postsThisMonth} ${t('kpi.thisMonth')}`,
      icon: MessageSquare,
      gradient: 'from-cyan-500 to-blue-600',
      bgGradient: 'from-cyan-50 to-blue-50',
      iconBg: 'bg-cyan-100',
      iconBorder: 'border-cyan-200',
      iconColor: 'text-cyan-600',
      stats: [
        { label: t('kpi.likes'), value: totalLikes, color: 'text-rose-500' },
        { label: t('kpi.comments'), value: totalComments, color: 'text-blue-500' }
      ]
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header with Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.overview')}</h2>
          <p className="text-sm text-slate-500">{t('dashboard.keyMetrics')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 p-1 bg-[#f5f3ee] border border-[#d4af37]/20 rounded-xl">
          {([
            { key: 'today', label: t('dashboard.today'), period: 'today' as const },
            { key: 'week', label: t('dashboard.week'), period: 'week' as const },
            { key: 'month', label: t('dashboard.month'), period: 'month' as const },
            { key: 'custom', label: t('dashboard.custom'), period: 'custom' as const }
          ] as const).map((item) => (
            <button
              key={item.key}
              onClick={() => onPeriodChange(item.period)}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${period === item.key
                  ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white shadow-sm'
                  : 'text-[#8a6d1c] hover:bg-[#d4af37]/10'
                }
              `}
            >
              {item.label}
            </button>
          ))}
          
          {period === 'custom' && (
            <div className="flex items-center gap-2 pl-2 border-l border-[#d4af37]/30 ml-1">
              {/* From Date Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all ${fromDate ? 'border-[#d4af37] text-[#8a6d1c] bg-white' : 'border-[#d4af37]/30 text-slate-500 bg-white hover:bg-[#d4af37]/5'}`}>
                    <CalendarIcon className="w-4 h-4 text-[#d4af37]" />
                    {fromDate ? format(fromDate, 'dd/MM/yyyy') : t('dashboard.fromDate')}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-[#d4af37]/20 rounded-xl overflow-hidden" align="end">
                  <Calendar
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

              {/* To Date Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all ${toDate ? 'border-[#d4af37] text-[#8a6d1c] bg-white' : 'border-[#d4af37]/30 text-slate-500 bg-white hover:bg-[#d4af37]/5'}`}>
                    <CalendarIcon className="w-4 h-4 text-[#d4af37]" />
                    {toDate ? format(toDate, 'dd/MM/yyyy') : t('dashboard.toDate')}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-[#d4af37]/20 rounded-xl overflow-hidden" align="end">
                  <Calendar
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
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-[#d4af37]/20 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#d4af37]/10 rounded-xl" />
                <div className="w-16 h-4 bg-slate-100 rounded" />
              </div>
              <div className="h-8 w-20 bg-slate-100 rounded mb-2" />
              <div className="h-4 w-24 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;
            // Map the old tailwind colors to the new theme
            return (
              <div
                key={kpi.title}
                className="group bg-white rounded-2xl p-5 shadow-sm border border-[#d4af37]/20 hover:shadow-lg hover:border-[#d4af37]/40 transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Icon & Trend */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl border ${kpi.alert ? 'animate-pulse bg-rose-50 border-rose-200' : `${kpi.iconBg} ${kpi.iconBorder}`}`}>
                    <Icon className={`w-5 h-5 ${kpi.alert ? 'text-rose-600' : kpi.iconColor}`} />
                  </div>

                  {kpi.alert && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-rose-50 rounded-full">
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-rose-600">Alert</span>
                    </div>
                  )}
                </div>

                {/* Value */}
                <div className="mb-1">
                  <span className="text-3xl font-bold text-slate-900">
                    {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                  </span>
                  {kpi.suffix && <span className="text-lg font-semibold text-slate-600">{kpi.suffix}</span>}
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-sm font-semibold text-slate-900 mb-0.5">{kpi.title}</h3>
                <p className={`text-xs ${kpi.alert ? 'text-rose-600' : 'text-slate-500'}`}>
                  {kpi.subtitle}
                </p>

                {/* Stats Row */}
                {kpi.stats.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3">
                    {kpi.stats.map((stat, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className="text-lg font-bold" style={{ color: stat.color.replace('text-', '') }}>
                          {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                        </span>
                        <span className={`text-xs ${stat.color}`}>{stat.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
