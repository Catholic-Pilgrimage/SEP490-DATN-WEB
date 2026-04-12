import React, { useEffect, useState, useCallback } from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import {
  ManagerCheckinsAnalyticsData,
  ManagerDashboardPeriod,
} from '../../../types/manager.types';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { extractErrorMessage } from '../../../lib/utils';
import { format } from 'date-fns';

interface ManagerChartsSectionProps {
  period: ManagerDashboardPeriod | 'all';
  fromDate?: Date;
  toDate?: Date;
}

// ─── Day name helpers ─────────────────────────────────────────────────────────

const DAY_NAMES_VI: Record<number, string> = {
  0: 'CN',
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7',
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const LoadingSkeleton = () => (
  <div className="h-44 flex items-end justify-between gap-2">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-2">
        <div
          className="w-full bg-slate-100 rounded-t-lg animate-pulse"
          style={{ height: `${30 + Math.random() * 60}%` }}
        />
        <div className="h-3 w-6 bg-slate-100 rounded animate-pulse" />
      </div>
    ))}
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ message }: { message: string }) => (
  <div className="h-44 flex items-center justify-center">
    <div className="text-center">
      <BarChart3 className="w-10 h-10 mx-auto mb-2 text-slate-200" />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  </div>
);

// ─── Bar Chart ────────────────────────────────────────────────────────────────

interface ChartItem {
  label: string;  // day label e.g. "T2"
  date: string;   // full date for tooltip
  value: number;
}

const BarChart = ({ data, maxValue }: { data: ChartItem[]; maxValue: number }) => (
  <div className="flex items-end justify-between gap-1 h-44">
    {data.map((item, idx) => {
      const heightPct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
      return (
        <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center group">
          {/* Bar */}
          <div className="relative w-full max-w-[80px] flex-1 flex items-end justify-center">
            <div
              className="w-full bg-gradient-to-t from-[#8a6d1c] to-[#d4af37] rounded-t-md transition-all duration-500 hover:opacity-80"
              style={{
                height: `${heightPct}%`,
                minHeight: item.value > 0 ? '4px' : '2px',
              }}
            >
              {/* Tooltip */}
              {item.value > 0 && (
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg">
                  <span className="font-semibold">{item.value}</span> check-in
                  <br />
                  <span className="text-slate-400 text-[10px]">{item.date}</span>
                </div>
              )}
            </div>
          </div>
          {/* Label */}
          <div className="mt-1.5 text-[10px] font-medium text-slate-400 truncate w-full text-center">
            {item.label}
          </div>
        </div>
      );
    })}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const ManagerChartsSection: React.FC<ManagerChartsSectionProps> = ({
  period,
  fromDate,
  toDate,
}) => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [checkinsData, setCheckinsData] = useState<ManagerCheckinsAnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCheckins = useCallback(async () => {
    setLoading(true);
    try {
      // Map period → API params
      const apiPeriod = period === 'all' ? undefined : period;

      const response = await ManagerService.getCheckinsAnalytics({
        period: apiPeriod,
        from_date: fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined,
        to_date: toDate ? format(toDate, 'yyyy-MM-dd') : undefined,
        // Use days=30 as fallback when no period
        days: apiPeriod ? undefined : 30,
      });

      if (response.success && Array.isArray(response.data)) {
        setCheckinsData(response.data);
      } else {
        showToast('error', t('managerDash.chartTitle'), response.message || t('managerDash.chartEmpty'));
      }
    } catch (err) {
      console.error('Error fetching checkins analytics:', err);
      showToast('error', t('managerDash.chartTitle'), extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period, fromDate, toDate]);

  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins]);

  // ── Derived chart data ──────────────────────────────────────────────

  const chartItems: ChartItem[] = checkinsData.map((item) => {
    const d = new Date(item.date);
    // Show short date (dd/MM) if many points, else day name
    const dayLabel = checkinsData.length <= 7
      ? DAY_NAMES_VI[d.getDay()]
      : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { label: dayLabel, date: item.date, value: item.count };
  });

  const maxValue = Math.max(...chartItems.map((d) => d.value), 1);
  const total = checkinsData.reduce((s, d) => s + d.count, 0);
  const avg = checkinsData.length > 0 ? Math.round(total / checkinsData.length) : 0;
  const peak = checkinsData.reduce(
    (best, d) => (d.count > best.count ? d : best),
    { date: '', count: 0 }
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#d4af37]/20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-xl">
            <TrendingUp className="w-5 h-5 text-[#8a6d1c]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{t('managerDash.chartTitle')}</h3>
            <p className="text-xs text-slate-500">{t('managerDash.chartDesc')}</p>
          </div>
        </div>

        {/* Summary badges */}
        <div className="hidden sm:flex items-end flex-col gap-0.5">
          <div className="text-2xl font-bold text-slate-900">{total.toLocaleString()}</div>
          <div className="text-xs text-slate-500">
            {avg > 0
              ? t('managerDash.chartAvgPerDay').replace('{avg}', avg.toString())
              : t('kpi.noData')}
          </div>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <LoadingSkeleton />
      ) : checkinsData.length === 0 ? (
        <EmptyState message={t('managerDash.chartEmpty')} />
      ) : (
        <BarChart data={chartItems} maxValue={maxValue} />
      )}

      {/* Footer stats */}
      {!loading && checkinsData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">{total.toLocaleString()}</p>
            <p className="text-xs text-slate-400">{t('managerDash.chartTotal')}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#8a6d1c]">{avg.toLocaleString()}</p>
            <p className="text-xs text-slate-400">{t('managerDash.chartAvg')}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-amber-600">{peak.count.toLocaleString()}</p>
            <p className="text-xs text-slate-400 truncate">{t('managerDash.chartPeak')}{peak.date ? ` (${peak.date})` : ''}</p>
          </div>
        </div>
      )}
    </div>
  );
};
