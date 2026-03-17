import React, { useEffect, useState, useCallback } from 'react';
import { KPICards } from './KPICards';
import { ChartsSection } from './ChartsSection';
import { AdminService } from '../../../services/admin.service';
import { DashboardOverviewData, DashboardPeriod } from '../../../types/admin.types';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [dashboardData, setDashboardData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<DashboardPeriod>('month');
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const fetchDashboardData = useCallback(async (
    selectedPeriod?: DashboardPeriod,
    fDate?: Date,
    tDate?: Date
  ) => {
    setLoading(true);
    try {
      const response = await AdminService.getDashboardOverview({
        period: selectedPeriod,
        from_date: fDate ? format(fDate, 'yyyy-MM-dd') : undefined,
        to_date: tDate ? format(tDate, 'yyyy-MM-dd') : undefined
      });

      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        showToast('error', 'Error', response.message || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      showToast('error', 'Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboardData(period, fromDate, toDate);
  }, [period, fromDate, toDate, fetchDashboardData]);

  const handlePeriodChange = (newPeriod: DashboardPeriod | undefined) => {
    if (newPeriod) {
      setPeriod(newPeriod);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-slate-600 mt-1">
            {t('dashboard.welcome')}
          </p>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500">{t('dashboard.lastUpdated')}</p>
            <p className="text-sm font-medium text-slate-700">
              {new Date().toLocaleDateString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
          <Button
            onClick={() => fetchDashboardData(period, fromDate, toDate)}
            disabled={loading}
            className="flex items-center gap-2 h-10 px-4 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white font-medium rounded-lg hover:brightness-110 transition-all disabled:opacity-50 shadow-sm shadow-[#d4af37]/20"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Charts Section - Full Width */}
        <div className="w-full">
          <ChartsSection period={period} fromDate={fromDate} toDate={toDate} />
        </div>
      </div>
    </div>
  );
};
