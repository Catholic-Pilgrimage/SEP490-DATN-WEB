import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  User,
  CheckCircle,
  RefreshCw,
  Filter
} from 'lucide-react';
import { AdminService } from '../../../services/admin.service';
import { AdminSOSRequest, SOSStatus, AdminSite, AdminSOSStats } from '../../../types/admin.types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';

export const AdminSOSCenter: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [sosAlerts, setSosAlerts] = useState<AdminSOSRequest[]>([]);
  const [stats, setStats] = useState<AdminSOSStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<SOSStatus | ''>('');
  const [siteFilter, setSiteFilter] = useState<string>('');
  const [sites, setSites] = useState<AdminSite[]>([]);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const fetchSOSData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [listRes, statsRes] = await Promise.all([
        AdminService.getSOSRequests({
          status: statusFilter,
          site_id: siteFilter || undefined,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
          limit: 100 // Load up to 100 alerts for the view
        }),
        AdminService.getSOSStats({
          site_id: siteFilter || undefined,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
        })
      ]);

      if (listRes.success && listRes.data) {
        setSosAlerts(listRes.data.sosRequests);
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }

      if (isManualRefresh && listRes.success && statsRes.success) {
        showToast('success', t('toast.refreshSuccess') || 'Làm mới thành công!', t('toast.refreshSuccessMsg') || 'Dữ liệu đã được cập nhật mới nhất.');
      } else if (isManualRefresh && (!listRes.success || !statsRes.success)) {
        showToast('error', t('common.error') || 'Đã xảy ra lỗi');
      }
    } catch (error) {
      console.error('Failed to fetch SOS data:', error);
      if (isManualRefresh) {
        showToast('error', t('common.error') || 'Đã xảy ra lỗi');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchSOSData(true);
  };

  useEffect(() => {
    fetchSOSData();
    // Refresh every 30 seconds
    const interval = setInterval(() => fetchSOSData(false), 30000);
    return () => clearInterval(interval);
  }, [statusFilter, siteFilter, fromDate, toDate]);

  useEffect(() => {
    // Fetch sites for dropdown
    const fetchSites = async () => {
      try {
        const res = await AdminService.getSites({ limit: 100 });
        if (res.success && res.data) {
          setSites(res.data.sites);
        }
      } catch (error) {
        console.error('Failed to fetch sites', error);
      }
    };
    fetchSites();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-50/80';
      case 'medium': return 'border-amber-500 bg-amber-50/80';
      case 'low': return 'border-[#d4af37] bg-[#fdfbf7]';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: t('sos.statusPending'), color: 'red', icon: AlertTriangle };
      case 'accepted':
        return { label: t('sos.statusAccepted'), color: 'amber', icon: Clock };
      case 'resolved':
        return { label: t('sos.statusResolved'), color: 'green', icon: CheckCircle };
      case 'cancelled':
        return { label: t('sos.statusCancelled'), color: 'gray', icon: AlertTriangle };
      default:
        return { label: t('sos.unknown'), color: 'gray', icon: AlertTriangle };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] bg-clip-text text-transparent">
            {t('sos.title')}
          </h1>
          <p className="text-slate-600 mt-2 text-sm">{t('sos.subtitleAdmin')}</p>
        </div>

        <div className="flex flex-col lg:flex-row justify-between gap-4 bg-white p-3 rounded-2xl shadow-sm border border-[#d4af37]/20">
          <div className="flex flex-wrap items-center gap-3 xl:gap-5">
            <div className="flex items-center justify-center p-2 bg-[#fdfbf7] rounded-lg border border-[#d4af37]/10">
              <Filter className="w-5 h-5 text-[#8a6d1c]/80" />
            </div>

            {/* Site Dropdown */}
            <div className="relative">
              <select
                className="appearance-none pr-8 py-2 pl-3 bg-[#f8fafc] hover:bg-slate-100 transition-colors rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 border border-slate-200 cursor-pointer min-w-[150px]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23334155' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.25em 1.25em',
                }}
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
              >
                <option value="">{t('sos.allSites')}</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div className="flex items-center gap-2 bg-[#f8fafc] hover:bg-slate-100 transition-colors rounded-xl px-3 py-2 border border-slate-200 focus-within:ring-2 focus-within:ring-[#d4af37]/50">
              <span className="text-sm text-slate-500 font-medium hidden sm:inline">{t('sos.fromDate')}:</span>
              <input
                type="date"
                className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer text-sm"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            {/* To Date */}
            <div className="flex items-center gap-2 bg-[#f8fafc] hover:bg-slate-100 transition-colors rounded-xl px-3 py-2 border border-slate-200 focus-within:ring-2 focus-within:ring-[#d4af37]/50">
              <span className="text-sm text-slate-500 font-medium hidden sm:inline">{t('sos.toDate')}:</span>
              <input
                type="date"
                className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer text-sm"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <select
                className="appearance-none pr-8 py-2 pl-3 bg-[#f8fafc] hover:bg-slate-100 transition-colors rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 border border-slate-200 cursor-pointer min-w-[150px]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23334155' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.25em 1.25em',
                }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SOSStatus | '')}
              >
                <option value="">{t('sos.allStatuses')}</option>
                <option value="pending">{t('sos.statusPending')}</option>
                <option value="accepted">{t('sos.statusAccepted')}</option>
                <option value="resolved">{t('sos.statusResolved')}</option>
                <option value="cancelled">{t('sos.statusCancelled')}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 lg:border-l border-slate-100 lg:pl-4">
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-xl border border-red-100 flex-1 lg:flex-none justify-center">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm font-bold">{stats?.pending || 0} <span className="font-medium text-red-600/80">{t('sos.activeAlerts')}</span></span>
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={isLoading || refreshing}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white font-medium rounded-xl hover:brightness-110 transition-all disabled:opacity-50 shadow-md shadow-[#d4af37]/20"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading || refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t('common.refresh')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          { label: t('sos.statTotal'), value: stats?.total || 0, color: 'gold' },
          { label: t('sos.statPending'), value: stats?.pending || 0, color: 'red' },
          { label: t('sos.statInProgress'), value: stats?.accepted || 0, color: 'amber' },
          { label: t('sos.statResolved'), value: stats?.resolved || 0, color: 'green' },
          { label: t('sos.statusCancelled'), value: stats?.cancelled || 0, color: 'gray' }
        ].map((stat) => (
          <div key={stat.label} className={`bg-white rounded-2xl p-6 border transition-all hover:shadow-md ${stat.color === 'gold' ? 'border-[#d4af37]/30 shadow-sm shadow-[#d4af37]/5' : 'border-slate-100 shadow-sm'
            }`}>
            <div className={`text-sm font-semibold uppercase tracking-wider mb-2 ${stat.color === 'gold' ? 'text-[#8a6d1c]/80' : 'text-slate-500'
              }`}>{stat.label}</div>
            <div className={`text-3xl font-bold ${stat.color === 'red' ? 'text-red-600' :
              stat.color === 'amber' ? 'text-amber-500' :
                stat.color === 'green' ? 'text-green-500' :
                  stat.color === 'gray' ? 'text-slate-500' :
                    'text-slate-800'
              }`}>
              {isLoading ? '-' : stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* SOS Alerts List */}
      <div className="space-y-4">
        {isLoading && sosAlerts.length === 0 ? (
          <div className="text-center py-12 text-[#8a6d1c]">
            <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4" />
            <p className="font-medium text-lg">{t('sos.loading')}</p>
          </div>
        ) : sosAlerts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#d4af37]/10 shadow-sm">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-green-100">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <p className="text-xl font-bold text-slate-900 mb-2">{t('sos.allClear')}</p>
            <p className="text-slate-500">{t('sos.noAlerts')}</p>
          </div>
        ) : (
          sosAlerts.map((alert) => {
            const statusInfo = getStatusInfo(alert.status);
            const StatusIcon = statusInfo.icon;
            // Determine severity for visual emphasis based on status
            const severity = alert.status === 'pending' ? 'high' : alert.status === 'accepted' ? 'medium' : 'low';

            return (
              <div
                key={alert.id}
                className={`
                  relative bg-white rounded-2xl shadow-sm border-l-[6px] p-6 transition-all hover:shadow-md
                  ${getSeverityColor(severity)}
                `}
              >
                {alert.status === 'pending' && (
                  <span className="absolute top-0 right-0 -mt-2 -mr-2 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 border-2 border-white"></span>
                  </span>
                )}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border
                      ${severity === 'high' ? 'bg-red-100 border-red-200 text-red-600' :
                        severity === 'medium' ? 'bg-amber-100 border-amber-200 text-amber-600' : 'bg-[#fdfbf7] border-[#d4af37]/30 text-[#8a6d1c]'}
                    `}>
                      <AlertTriangle className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">
                        {alert.message || t('sos.emergencyRequest')}
                      </h3>
                      <p className="text-slate-600 text-sm mt-1">
                        <span className="font-semibold text-slate-800">{alert.site?.name}</span> <span className="mx-2 text-[#d4af37]">•</span> Code: <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">{alert.code}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
                      ${severity === 'high' ? 'bg-red-500/10 text-red-700 border border-red-200' :
                        severity === 'medium' ? 'bg-amber-500/10 text-amber-700 border border-amber-200' :
                          'bg-[#d4af37]/10 text-[#8a6d1c] border border-[#d4af37]/30'}
                    `}>
                      {severity === 'high' ? t('sos.severityHigh') : severity === 'medium' ? t('sos.severityMedium') : t('sos.severityLow')}
                    </span>

                    <span className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border
                      ${statusInfo.color === 'red' ? 'bg-red-50 text-red-700 border-red-200' :
                        statusInfo.color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          statusInfo.color === 'green' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}
                    `}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Pilgrim Col */}
                  <div className="bg-[#fbfaf6] p-4 rounded-xl border border-[#d4af37]/15">
                    <div className="flex items-center gap-2 text-[#8a6d1c]/70 font-semibold uppercase tracking-wider text-xs mb-2">
                      <User className="w-3.5 h-3.5" />
                      <span>{t('sos.pilgrim')}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-[15px]">{alert.pilgrim?.full_name || t('sos.unknown')}</div>
                    <div className="text-sm text-slate-600 flex items-center gap-1.5 mt-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {alert.contact_phone || alert.pilgrim?.phone || 'N/A'}
                    </div>
                  </div>

                  {/* Location Col */}
                  <div className="bg-[#fbfaf6] p-4 rounded-xl border border-[#d4af37]/15">
                    <div className="flex items-center gap-2 text-[#8a6d1c]/70 font-semibold uppercase tracking-wider text-xs mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{t('sos.location')}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm font-mono truncate">
                      {Number(alert.latitude).toFixed(5)}, {Number(alert.longitude).toFixed(5)}
                    </div>
                    <div className="text-sm text-slate-600 mt-1 truncate">{alert.site?.province || alert.site?.name}</div>
                  </div>

                  {/* Timeline Col */}
                  <div className="bg-[#fbfaf6] p-4 rounded-xl border border-[#d4af37]/15">
                    <div className="flex items-center gap-2 text-[#8a6d1c]/70 font-semibold uppercase tracking-wider text-xs mb-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t('sos.responseTimeline')}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-[15px] truncate">
                      {alert.assignedGuide ? alert.assignedGuide.full_name : t('sos.unassigned')}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      <span className="text-slate-400 mr-1">{t('sos.created')}</span> {new Date(alert.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {(alert.status === 'resolved' || alert.status === 'cancelled') && (
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                    {alert.status === 'resolved' && (
                      <div className="flex items-center gap-2 text-green-700 bg-green-50/80 px-4 py-2.5 rounded-xl border border-green-200">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-semibold text-sm">
                          {alert.resolved_at ? `${t('sos.resolvedAt')} ${new Date(alert.resolved_at).toLocaleTimeString()}` : t('sos.resolvedSuccessfully')}
                        </span>
                      </div>
                    )}
                    {alert.status === 'cancelled' && (
                      <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-semibold text-sm">{t('sos.requestCancelled')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
