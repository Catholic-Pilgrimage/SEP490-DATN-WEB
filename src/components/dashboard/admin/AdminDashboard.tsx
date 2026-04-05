import React, { useEffect, useState, useCallback } from 'react';
import { KPICards } from './KPICards';
import { DashboardOverviewPanel } from './DashboardOverviewPanel';
import { ChartsSection } from './ChartsSection';
import { AdminService } from '../../../services/admin.service';
import { DashboardOverviewData, AdminDashboardPeriod } from '../../../types/admin.types';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { dash } from './dashboardTheme';

export const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [dashboardData, setDashboardData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<AdminDashboardPeriod>('all');
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const fetchDashboardData = useCallback(async (
    selectedPeriod?: AdminDashboardPeriod,
    fDate?: Date,
    tDate?: Date,
    notifyUser = false
  ) => {
    setLoading(true);
    try {
      const response = await AdminService.getDashboardOverview({
        period:
          selectedPeriod && selectedPeriod !== 'all' ? selectedPeriod : undefined,
        from_date: fDate ? format(fDate, 'yyyy-MM-dd') : undefined,
        to_date: tDate ? format(tDate, 'yyyy-MM-dd') : undefined
      });

      if (response.success && response.data) {
        setDashboardData(response.data);
        if (notifyUser) {
          showToast('success', t('toast.refreshSuccess'), t('toast.refreshSuccessMsg'));
        }
      } else {
        showToast('error', t('common.error'), response.message || t('dashboard.loadError') || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      showToast('error', t('common.error'), t('dashboard.loadError') || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [showToast, t]);

  useEffect(() => {
    fetchDashboardData(period, fromDate, toDate, false);
  }, [period, fromDate, toDate, fetchDashboardData]);

  const handlePeriodChange = (newPeriod: AdminDashboardPeriod | undefined) => {
    if (newPeriod) {
      setPeriod(newPeriod);
      if (newPeriod !== 'custom') {
        setFromDate(undefined);
        setToDate(undefined);
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className={`text-2xl font-semibold tracking-tight sm:text-3xl ${dash.textAccent}`}>
            {t('dashboard.title')}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            {t('dashboard.welcome')}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => fetchDashboardData(period, fromDate, toDate, true)}
          disabled={loading}
          className="flex h-[46px] shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] px-6 font-medium text-white shadow-lg shadow-[#d4af37]/20 transition-all hover:brightness-110 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </Button>
      </div>

      <KPICards
        data={dashboardData || undefined}
        loading={loading}
        period={period}
        onPeriodChange={handlePeriodChange}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
      />

      <DashboardOverviewPanel data={dashboardData} loading={loading} />

      <section className="space-y-3">
        <h2 className={`text-xs font-semibold uppercase tracking-[0.2em] ${dash.textAccentSoft}`}>
          {t('menu.analytics')}
        </h2>
        <ChartsSection period={period} fromDate={fromDate} toDate={toDate} />
      </section>
    </div>
  );
};
