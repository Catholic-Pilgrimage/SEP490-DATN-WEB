import React, { useEffect, useState, useCallback } from 'react';
import { TrendingUp, MapPin, Users, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import { CheckinsAnalyticsData, PopularSiteData, SOSBySiteData, AdminDashboardPeriod, UsersGrowthData } from '../../../types/admin.types';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { extractErrorMessage } from '../../../lib/utils';
import { format } from 'date-fns';

interface ChartsSectionProps {
  period: AdminDashboardPeriod;
  fromDate?: Date;
  toDate?: Date;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ period, fromDate, toDate }) => {
  const apiPeriod = period === 'all' ? undefined : period;
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [usersGrowthData, setUsersGrowthData] = useState<UsersGrowthData[]>([]);
  const [checkinsData, setCheckinsData] = useState<CheckinsAnalyticsData[]>([]);
  const [popularSitesData, setPopularSitesData] = useState<PopularSiteData[]>([]);
  const [sosBySiteData, setSOSBySiteData] = useState<SOSBySiteData[]>([]);
  const [loadingUsersGrowth, setLoadingUsersGrowth] = useState(true);
  const [loadingCheckins, setLoadingCheckins] = useState(true);
  const [loadingPopularSites, setLoadingPopularSites] = useState(true);
  const [loadingSOSBySite, setLoadingSOSBySite] = useState(true);

  const fetchCheckins = useCallback(async () => {
    setLoadingCheckins(true);
    try {
      const response = await AdminService.getCheckinsAnalytics({ 
        period: apiPeriod,
        from_date: fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined,
        to_date: toDate ? format(toDate, 'yyyy-MM-dd') : undefined
      });

      if (response.success && response.data) {
        setCheckinsData(response.data);
      } else {
        showToast('error', 'Failed to load check-ins data', response.message);
      }
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      showToast('error', 'Failed to load check-ins data', extractErrorMessage(error));
    } finally {
      setLoadingCheckins(false);
    }
  }, [apiPeriod, fromDate, toDate, showToast]);

  const fetchUsersGrowth = useCallback(async () => {
    setLoadingUsersGrowth(true);
    try {
      const response = await AdminService.getUsersGrowth({ 
        period: apiPeriod,
        from_date: fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined,
        to_date: toDate ? format(toDate, 'yyyy-MM-dd') : undefined
      });

      if (response.success && response.data) {
        setUsersGrowthData(response.data);
      } else {
        showToast('error', 'Failed to load users growth data', response.message);
      }
    } catch (error) {
      console.error('Error fetching users growth:', error);
      showToast('error', 'Failed to load users growth data', extractErrorMessage(error));
    } finally {
      setLoadingUsersGrowth(false);
    }
  }, [apiPeriod, fromDate, toDate, showToast]);

  const fetchPopularSites = useCallback(async () => {
    setLoadingPopularSites(true);
    try {
      const response = await AdminService.getPopularSites({ 
        period: apiPeriod, 
        limit: 5,
        from_date: fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined,
        to_date: toDate ? format(toDate, 'yyyy-MM-dd') : undefined
      });

      if (response.success && response.data) {
        setPopularSitesData(response.data);
      } else {
        showToast('error', 'Failed to load popular sites data', response.message);
      }
    } catch (error) {
      console.error('Error fetching popular sites:', error);
      showToast('error', 'Failed to load popular sites data', extractErrorMessage(error));
    } finally {
      setLoadingPopularSites(false);
    }
  }, [apiPeriod, fromDate, toDate, showToast]);

  const fetchSOSBySite = useCallback(async () => {
    setLoadingSOSBySite(true);
    try {
      const response = await AdminService.getSOSBySite({ 
        period: apiPeriod, 
        limit: 5,
        from_date: fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined,
        to_date: toDate ? format(toDate, 'yyyy-MM-dd') : undefined
      });

      if (response.success && response.data) {
        setSOSBySiteData(response.data);
      } else {
        showToast('error', 'Failed to load SOS data', response.message);
      }
    } catch (error) {
      console.error('Error fetching SOS by site:', error);
      showToast('error', 'Failed to load SOS data', extractErrorMessage(error));
    } finally {
      setLoadingSOSBySite(false);
    }
  }, [apiPeriod, fromDate, toDate, showToast]);

  useEffect(() => {
    fetchUsersGrowth();
    fetchCheckins();
    fetchPopularSites();
    fetchSOSBySite();
  }, [fetchUsersGrowth, fetchCheckins, fetchPopularSites, fetchSOSBySite]);

  // Transform check-ins data for chart
  const checkinsChartData = checkinsData.map(item => {
    const date = new Date(item.date);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      day: dayNames[date.getDay()],
      date: item.date,
      value: item.count
    };
  });

  const displayCheckinsData = checkinsChartData.length > 0 ? checkinsChartData : [
    { day: 'Mon', date: '', value: 0 },
    { day: 'Tue', date: '', value: 0 },
    { day: 'Wed', date: '', value: 0 },
    { day: 'Thu', date: '', value: 0 },
    { day: 'Fri', date: '', value: 0 },
    { day: 'Sat', date: '', value: 0 },
    { day: 'Sun', date: '', value: 0 }
  ];

  const maxCheckIns = Math.max(...displayCheckinsData.map(d => d.value), 1);
  const totalCheckIns = checkinsData.reduce((sum, d) => sum + d.count, 0);
  const avgDailyCheckIns = checkinsData.length > 0 ? Math.round(totalCheckIns / checkinsData.length) : 0;

  // Transform users growth data for chart
  const usersGrowthChartData = usersGrowthData.map(item => {
    const date = new Date(item.date);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      day: dayNames[date.getDay()],
      date: item.date,
      value: item.count
    };
  });

  const displayUsersGrowthData = usersGrowthChartData.length > 0 ? usersGrowthChartData : [
    { day: 'Mon', date: '', value: 0 },
    { day: 'Tue', date: '', value: 0 },
    { day: 'Wed', date: '', value: 0 },
    { day: 'Thu', date: '', value: 0 },
    { day: 'Fri', date: '', value: 0 },
    { day: 'Sat', date: '', value: 0 },
    { day: 'Sun', date: '', value: 0 }
  ];

  const maxUsersGrowth = Math.max(...displayUsersGrowthData.map(d => d.value), 1);
  const totalNewUsers = usersGrowthData.reduce((sum, d) => sum + d.count, 0);

  // Render bar chart
  const renderBarChart = (
    data: typeof displayCheckinsData,
    maxValue: number,
    colorClass: string,
    label: string
  ) => (
    <div className="flex h-40 justify-between gap-2">
      {data.map((item, index) => {
        const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={index} className="group flex min-w-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col justify-end">
              <div
                className={`relative w-full rounded-t-lg transition-all duration-300 ${colorClass} hover:opacity-90`}
                style={{
                  height: `${pct}%`,
                  minHeight: item.value > 0 ? '6px' : '2px',
                }}
              >
                {item.value > 0 && (
                  <div className="absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {item.value} {label}
                    <br />
                    <span className="text-slate-400">{item.date}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 shrink-0 text-center text-xs font-medium text-slate-500">{item.day}</div>
          </div>
        );
      })}
    </div>
  );

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="h-40 flex items-end justify-between gap-4">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div className="w-full bg-slate-100 rounded-t-lg animate-pulse" style={{ height: '60%' }} />
          <div className="mt-2 h-3 w-8 bg-slate-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );

  // Render empty state
  const renderEmptyState = (message: string) => (
    <div className="h-40 flex items-center justify-center text-slate-400">
      <div className="text-center">
        <BarChart3 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* User Growth Chart */}
      <div className="rounded-2xl border border-[#d4af37]/20 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[#d4af37]/25 bg-[#d4af37]/10 p-2.5">
              <Users className="h-5 w-5 text-[#8a6d1c]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">{t('chart.userGrowth')}</h3>
              <p className="text-xs text-slate-500">{t('chart.newRegistrations')}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">{totalNewUsers}</div>
            <div className="text-xs text-slate-500">{t('chart.totalNewUsers')}</div>
          </div>
        </div>

        {loadingUsersGrowth ? renderLoadingSkeleton() :
          usersGrowthData.length === 0 ? renderEmptyState(t('chart.noUserData')) :
            renderBarChart(displayUsersGrowthData, maxUsersGrowth, 'bg-gradient-to-t from-[#8a6d1c] to-[#d4af37]', t('chart.newUsers'))}
      </div>

      {/* Check-ins Chart */}
      <div className="rounded-2xl border border-[#d4af37]/20 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[#d4af37]/25 bg-[#d4af37]/10 p-2.5">
              <TrendingUp className="h-5 w-5 text-[#8a6d1c]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">{t('chart.dailyCheckins')}</h3>
              <p className="text-xs text-slate-500">{t('chart.siteVisits')}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">{totalCheckIns}</div>
            <div className="text-xs text-slate-500">{avgDailyCheckIns > 0 ? t('chart.dayAvg').replace('{avg}', avgDailyCheckIns.toString()) : t('kpi.noData')}</div>
          </div>
        </div>

        {loadingCheckins ? renderLoadingSkeleton() :
          checkinsData.length === 0 ? renderEmptyState(t('chart.noCheckinData')) :
            renderBarChart(displayCheckinsData, maxCheckIns, 'bg-gradient-to-t from-[#8a6d1c] to-[#d4af37]', t('chart.checkins'))}
      </div>

      {/* Popular Sites */}
      <div className="rounded-2xl border border-[#d4af37]/20 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[#d4af37]/25 bg-[#d4af37]/10 p-2.5">
              <MapPin className="h-5 w-5 text-[#8a6d1c]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">{t('chart.popularSites')}</h3>
              <p className="text-xs text-slate-500">{t('chart.mostVisited')}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">{popularSitesData.length}</div>
            <div className="text-xs text-slate-500">{t('chart.activeSites')}</div>
          </div>
        </div>

        {loadingPopularSites ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2 animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
                </div>
                <div className="w-12 h-6 bg-slate-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : popularSitesData.length === 0 ? (
          renderEmptyState('No site data available')
        ) : (
          <div className="space-y-3">
            {popularSitesData.map((data, index) => (
              <div key={data.site.id} className="flex items-center gap-3 group p-2 -mx-2 rounded-xl hover:bg-[#f5f3ee] transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shadow-sm border border-[#d4af37]/20">
                  {data.site.cover_image ? (
                    <img src={data.site.cover_image} alt={data.site.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#d4af37]/10">
                      <MapPin className="w-4 h-4 text-[#8a6d1c]/45" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">#{index + 1}</span>
                    <p className="text-sm font-medium text-slate-900 truncate">{data.site.name}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-500">{data.site.region}</span>
                    <span className="text-xs text-slate-400">{data.site.code}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-slate-900">{data.visit_count}</div>
                  <div className="text-xs text-slate-400">{t('chart.visits')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SOS Alerts by Site */}
      <div className="rounded-2xl border border-[#d4af37]/20 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[#d4af37]/25 bg-[#d4af37]/10 p-2.5">
              <AlertCircle className="h-5 w-5 text-[#8a6d1c]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">{t('chart.sosByLocation')}</h3>
              <p className="text-xs text-slate-500">{t('chart.emergencyRequests')}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-rose-600">
              {sosBySiteData.reduce((sum, d) => sum + d.sos_count, 0)}
            </div>
            <div className="text-xs text-slate-500">{t('chart.totalAlerts')}</div>
          </div>
        </div>

        {loadingSOSBySite ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2 animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
                </div>
                <div className="w-12 h-6 bg-slate-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : sosBySiteData.length === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <CheckCircle className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
              <p className="text-sm text-slate-600 font-medium">{t('kpi.allClear')}!</p>
              <p className="text-xs text-slate-400">{t('chart.noSOSData')}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {sosBySiteData.map((data) => {
              const maxSOS = Math.max(...sosBySiteData.map(d => d.sos_count), 1);
              return (
                <div key={data.site.id} className="flex items-center gap-3 group p-2 -mx-2 rounded-xl hover:bg-[#f5f3ee] transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shadow-sm border border-[#d4af37]/20">
                    {data.site.cover_image ? (
                      <img src={data.site.cover_image} alt={data.site.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#d4af37]/10">
                        <MapPin className="w-4 h-4 text-[#8a6d1c]/45" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{data.site.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-500">{data.site.region}</span>
                      <span className="text-xs text-slate-400">{data.site.code}</span>
                    </div>
                    <div className="mt-2">
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#8a6d1c] to-[#d4af37]"
                          style={{ width: `${(data.sos_count / maxSOS) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-rose-600">{data.sos_count}</div>
                    <div className="text-xs text-slate-400">
                      {data.resolved_count > 0 && (
                        <span className="text-emerald-500">{data.resolved_count} {t('kpi.resolved').toLowerCase()}</span>
                      )}
                      {data.pending_count > 0 && (
                        <span className="text-amber-500 ml-1">{data.pending_count} {t('chart.pending')}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
