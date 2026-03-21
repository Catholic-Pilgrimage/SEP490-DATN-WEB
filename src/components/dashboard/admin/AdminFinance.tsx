import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Wallet,
  Lock,
  Clock,
  ArrowUpCircle,
  AlertTriangle,
  Users,
  RefreshCw,
  TrendingUp,
  XCircle,
  BarChart3,
  ArrowDownToLine,
  CreditCard,
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import { FinanceOverviewData } from '../../../types/admin.types';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { TransactionsTable } from './TransactionsTable';
import { WithdrawalsTable } from './WithdrawalsTable';

type FinanceTab = 'overview' | 'transactions' | 'withdrawals';

export const AdminFinance: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const tRef = useRef(t);
  tRef.current = t;

  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
  const [data, setData] = useState<FinanceOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AdminService.getFinanceOverview();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        const msg = response.message || tRef.current('finance.loadError');
        setError(msg);
        showToast('error', tRef.current('finance.title'), msg);
      }
    } catch (err) {
      console.error('Error fetching finance:', err);
      setError(tRef.current('finance.loadError'));
      showToast('error', tRef.current('finance.title'), tRef.current('finance.loadError'));
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchFinance();
  }, [fetchFinance]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + ' ' + t('finance.currency');
  };

  const tabs: { id: FinanceTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: t('finance.tab.overview'), icon: BarChart3 },
    { id: 'transactions', label: t('finance.tab.transactions'), icon: CreditCard },
    { id: 'withdrawals', label: t('finance.tab.withdrawals'), icon: ArrowDownToLine },
  ];

  const kpiCards = data
    ? [
        {
          title: t('finance.escrowLocked'),
          subtitle: t('finance.escrowLockedDesc'),
          value: formatCurrency(data.total_escrow_locked),
          icon: Lock,
          iconBg: 'bg-amber-50',
          iconBorder: 'border-amber-200',
          iconColor: 'text-amber-600',
          valueColor: 'text-amber-700',
        },
        {
          title: t('finance.pendingPayouts'),
          subtitle: t('finance.pendingPayoutsDesc'),
          value: formatCurrency(data.total_pending_payouts),
          icon: Clock,
          iconBg: 'bg-orange-50',
          iconBorder: 'border-orange-200',
          iconColor: 'text-orange-600',
          valueColor: 'text-orange-700',
        },
        {
          title: t('finance.withdrawnToday'),
          subtitle: t('finance.withdrawnTodayDesc'),
          value: formatCurrency(data.total_withdrawn_today),
          icon: ArrowUpCircle,
          iconBg: 'bg-emerald-50',
          iconBorder: 'border-emerald-200',
          iconColor: 'text-emerald-600',
          valueColor: 'text-emerald-700',
        },
        {
          title: t('finance.transactionsToday'),
          subtitle: t('finance.transactionsTodayDesc'),
          value: data.total_transactions_today.toString(),
          icon: TrendingUp,
          iconBg: 'bg-blue-50',
          iconBorder: 'border-blue-200',
          iconColor: 'text-blue-600',
          valueColor: 'text-blue-700',
        },
        {
          title: t('finance.failedPayouts'),
          subtitle: t('finance.failedPayoutsDesc'),
          value: data.failed_payouts_today.toString(),
          icon: XCircle,
          iconBg: data.failed_payouts_today > 0 ? 'bg-rose-50' : 'bg-slate-50',
          iconBorder: data.failed_payouts_today > 0 ? 'border-rose-200' : 'border-slate-200',
          iconColor: data.failed_payouts_today > 0 ? 'text-rose-600' : 'text-slate-500',
          valueColor: data.failed_payouts_today > 0 ? 'text-rose-700' : 'text-slate-700',
          alert: data.failed_payouts_today > 0,
        },
        {
          title: t('finance.walletBalance'),
          subtitle: t('finance.walletBalanceDesc'),
          value: formatCurrency(data.total_wallet_balance),
          icon: Wallet,
          iconBg: 'bg-violet-50',
          iconBorder: 'border-violet-200',
          iconColor: 'text-violet-600',
          valueColor: 'text-violet-700',
        },
        {
          title: t('finance.withdrawFailed'),
          subtitle: t('finance.withdrawFailedDesc'),
          value: formatCurrency(data.total_withdraw_failed),
          icon: AlertTriangle,
          iconBg: data.total_withdraw_failed > 0 ? 'bg-rose-50' : 'bg-slate-50',
          iconBorder: data.total_withdraw_failed > 0 ? 'border-rose-200' : 'border-slate-200',
          iconColor: data.total_withdraw_failed > 0 ? 'text-rose-600' : 'text-slate-500',
          valueColor: data.total_withdraw_failed > 0 ? 'text-rose-700' : 'text-slate-700',
        },
        {
          title: t('finance.activeEscrow'),
          subtitle: t('finance.activeEscrowDesc'),
          value: data.active_escrow_planners.toString(),
          icon: Users,
          iconBg: 'bg-cyan-50',
          iconBorder: 'border-cyan-200',
          iconColor: 'text-cyan-600',
          valueColor: 'text-cyan-700',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {t('finance.title')}
          </h1>
          <p className="text-slate-600 mt-1">{t('finance.subtitle')}</p>
        </div>

        {activeTab === 'overview' && (
          <button
            onClick={fetchFinance}
            disabled={loading}
            className="flex items-center gap-2 h-10 px-4 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white font-medium rounded-lg hover:brightness-110 transition-all disabled:opacity-50 shadow-sm shadow-[#d4af37]/20"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#d4af37]/20 p-1.5 inline-flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white shadow-sm shadow-[#d4af37]/20'
                  : 'text-slate-600 hover:text-[#8a6d1c] hover:bg-[#d4af37]/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Error State */}
          {error && !loading && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-100 rounded-xl border border-rose-200">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-rose-800">{t('finance.loadError')}</p>
                  <p className="text-xs text-rose-600">{error}</p>
                </div>
              </div>
              <button
                onClick={fetchFinance}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#8a6d1c] bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg hover:bg-[#d4af37]/20 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('finance.retry')}
              </button>
            </div>
          )}

          {/* KPI Cards */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-[#d4af37]/20 animate-pulse"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-[#d4af37]/10 rounded-xl" />
                  </div>
                  <div className="h-8 w-28 bg-slate-100 rounded mb-2" />
                  <div className="h-4 w-24 bg-slate-100 rounded mb-1" />
                  <div className="h-3 w-32 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="group bg-white rounded-2xl p-5 shadow-sm border border-[#d4af37]/20 hover:shadow-lg hover:border-[#d4af37]/40 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Icon */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`p-2.5 rounded-xl border ${card.iconBg} ${card.iconBorder} ${card.alert ? 'animate-pulse' : ''}`}
                      >
                        <Icon className={`w-5 h-5 ${card.iconColor}`} />
                      </div>
                      {card.alert && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-rose-50 rounded-full">
                          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                          <span className="text-xs font-medium text-rose-600">Alert</span>
                        </div>
                      )}
                    </div>

                    {/* Value */}
                    <div className="mb-1">
                      <span className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</span>
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="text-sm font-semibold text-slate-900 mb-0.5">{card.title}</h3>
                    <p className="text-xs text-slate-500">{card.subtitle}</p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'transactions' && <TransactionsTable />}

      {activeTab === 'withdrawals' && <WithdrawalsTable />}
    </div>
  );
};
