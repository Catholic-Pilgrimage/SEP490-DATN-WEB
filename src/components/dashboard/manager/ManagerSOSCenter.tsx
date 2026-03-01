import React, { useState } from 'react';
import {
    AlertTriangle,
    Phone,
    MapPin,
    Clock,
    User,
    CheckCircle,
    Navigation,
    RefreshCw,
    Filter
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';

export const ManagerSOSCenter: React.FC = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('');

    const handleManualRefresh = () => {
        setRefreshing(true);
        // Simulate API call for refresh since ManagerSOSCenter currently uses mock data
        setTimeout(() => {
            setRefreshing(false);
            showToast('success', t('toast.refreshSuccess') || 'Làm mới thành công!', t('toast.refreshSuccessMsg') || 'Dữ liệu đã được cập nhật mới nhất.');
        }, 800);
    };

    const sosAlerts = [
        {
            id: 1,
            pilgrim: 'John Smith',
            location: 'Grotto Area, Section B',
            site: 'Lourdes Sanctuary',
            issue: 'Medical emergency - chest pain',
            time: '3 minutes ago',
            phone: '+1 234 567 8900',
            severity: 'high',
            status: 'active',
            assignedGuide: null,
            coordinates: { lat: 43.0942, lng: -0.0464 }
        },
        {
            id: 2,
            pilgrim: 'Maria Garcia',
            location: 'Main Basilica Entrance',
            site: 'Fatima Sanctuary',
            issue: 'Lost group, elderly pilgrim disoriented',
            time: '8 minutes ago',
            phone: '+351 912 345 678',
            severity: 'medium',
            status: 'assigned',
            assignedGuide: 'Guide Carlos',
            coordinates: { lat: 39.6319, lng: -8.6724 }
        }
    ];

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
            case 'active':
                return { label: t('sos.statActive'), color: 'red', icon: AlertTriangle };
            case 'assigned':
                return { label: t('sos.statusAccepted'), color: 'amber', icon: Clock };
            case 'resolved':
                return { label: t('sos.statusResolved'), color: 'green', icon: CheckCircle };
            default:
                return { label: t('sos.unknown'), color: 'gray', icon: AlertTriangle };
        }
    };

    const filteredAlerts = sosAlerts.filter(alert => {
        if (!statusFilter) return true;
        return alert.status === statusFilter;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] bg-clip-text text-transparent">
                        {t('sos.title')}
                    </h1>
                    <p className="text-slate-600 mt-2 text-sm">{t('sos.subtitleManager')}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-[#d4af37]/20">
                    <div className="flex items-center gap-3 px-3 pr-4 border-r border-slate-100">
                        <Filter className="w-5 h-5 text-[#8a6d1c]/80" />
                        <select
                            className="appearance-none pr-8 py-1.5 bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23334155' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: 'right center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1.25em 1.25em',
                            }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">{t('sos.allStatuses')}</option>
                            <option value="active">{t('sos.statActive')}</option>
                            <option value="assigned">{t('sos.statusAccepted')}</option>
                            <option value="resolved">{t('sos.statusResolved')}</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 px-3 border-r border-slate-100">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-sm font-bold text-slate-700">{sosAlerts.filter(alert => alert.status === 'active').length} <span className="font-medium text-slate-500">{t('sos.activeAlerts')}</span></span>
                    </div>

                    <button
                        onClick={handleManualRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white font-medium rounded-xl hover:brightness-110 transition-all disabled:opacity-50 shadow-md shadow-[#d4af37]/20 ml-1"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">{t('common.refresh')}</span>
                    </button>
                </div>
            </div>

            {/* Emergency Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: t('sos.statTotal'), value: sosAlerts.length, color: 'gold' },
                    { label: t('sos.statActive'), value: sosAlerts.filter(a => a.status === 'active').length, color: 'red' },
                    { label: t('sos.statInProgress'), value: sosAlerts.filter(a => a.status === 'assigned').length, color: 'amber' },
                    { label: t('sos.statResolved'), value: sosAlerts.filter(a => a.status === 'resolved').length, color: 'green' }
                ].map((stat) => (
                    <div key={stat.label} className={`bg-white rounded-2xl p-6 border transition-all hover:shadow-md ${stat.color === 'gold' ? 'border-[#d4af37]/30 shadow-sm shadow-[#d4af37]/5' : 'border-slate-100 shadow-sm'
                        }`}>
                        <div className={`text-sm font-semibold uppercase tracking-wider mb-2 ${stat.color === 'gold' ? 'text-[#8a6d1c]/80' : 'text-slate-500'
                            }`}>{stat.label}</div>
                        <div className={`text-3xl font-bold ${stat.color === 'red' ? 'text-red-600' :
                            stat.color === 'amber' ? 'text-amber-500' :
                                stat.color === 'green' ? 'text-green-500' :
                                    'text-slate-800'
                            }`}>
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* SOS Alerts List */}
            <div className="space-y-4">
                {filteredAlerts.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-[#d4af37]/10 shadow-sm">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-green-100">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <p className="text-xl font-bold text-slate-900 mb-2">{t('sos.allClear')}</p>
                        <p className="text-slate-500">{t('sos.noAlerts')}</p>
                    </div>
                ) : (
                    filteredAlerts.map((alert) => {
                        const statusInfo = getStatusInfo(alert.status);
                        const StatusIcon = statusInfo.icon;

                        return (
                            <div
                                key={alert.id}
                                className={`
                                    relative bg-white rounded-2xl shadow-sm border-l-[6px] p-6 transition-all hover:shadow-md
                                    ${getSeverityColor(alert.severity)}
                                `}
                            >
                                {alert.status === 'active' && (
                                    <span className="absolute top-0 right-0 -mt-2 -mr-2 flex h-5 w-5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 border-2 border-white"></span>
                                    </span>
                                )}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                        w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border
                                        ${alert.severity === 'high' ? 'bg-red-100 border-red-200 text-red-600' :
                                                alert.severity === 'medium' ? 'bg-amber-100 border-amber-200 text-amber-600' : 'bg-[#fdfbf7] border-[#d4af37]/30 text-[#8a6d1c]'}
                                    `}>
                                            <AlertTriangle className="w-6 h-6" />
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                                {alert.issue || t('sos.emergencyRequest')}
                                            </h3>
                                            <p className="text-slate-600 text-sm mt-1">
                                                <span className="font-semibold text-slate-800">{alert.site}</span> <span className="mx-2 text-[#d4af37]">•</span> {alert.time}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`
                                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
                                        ${alert.severity === 'high' ? 'bg-red-500/10 text-red-700 border border-red-200' :
                                                alert.severity === 'medium' ? 'bg-amber-500/10 text-amber-700 border border-amber-200' :
                                                    'bg-[#d4af37]/10 text-[#8a6d1c] border border-[#d4af37]/30'}
                                    `}>
                                            {alert.severity === 'high' ? t('sos.severityHigh') : alert.severity === 'medium' ? t('sos.severityMedium') : t('sos.severityLow')}
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
                                        <div className="font-bold text-slate-900 text-[15px]">{alert.pilgrim || t('sos.unknown')}</div>
                                        <div className="text-sm text-slate-600 flex items-center gap-1.5 mt-1">
                                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                                            {alert.phone}
                                        </div>
                                    </div>

                                    {/* Location Col */}
                                    <div className="bg-[#fbfaf6] p-4 rounded-xl border border-[#d4af37]/15">
                                        <div className="flex items-center gap-2 text-[#8a6d1c]/70 font-semibold uppercase tracking-wider text-xs mb-2">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span>{t('sos.location')}</span>
                                        </div>
                                        <div className="font-bold text-slate-900 text-sm truncate">{alert.location}</div>
                                        <div className="text-sm text-slate-600 mt-1 truncate">{alert.site}</div>
                                    </div>

                                    {/* Timeline Col */}
                                    <div className="bg-[#fbfaf6] p-4 rounded-xl border border-[#d4af37]/15">
                                        <div className="flex items-center gap-2 text-[#8a6d1c]/70 font-semibold uppercase tracking-wider text-xs mb-2">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{t('sos.response')}</span>
                                        </div>
                                        <div className="font-bold text-slate-900 text-[15px] truncate">
                                            {alert.assignedGuide || t('sos.unassigned')}
                                        </div>
                                        <div className="text-sm text-slate-600 mt-1">
                                            <span className="text-slate-400 mr-1">{t('sos.created')}</span> {alert.time}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                                    {alert.status === 'active' && (
                                        <>
                                            <button className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20 active:scale-95 transition-all font-medium text-sm">
                                                <Phone className="w-4 h-4" />
                                                {t('sos.callPilgrim')}
                                            </button>

                                            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-95 transition-all font-medium text-sm">
                                                <User className="w-4 h-4" />
                                                {t('sos.assignGuide')}
                                            </button>

                                            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#d4af37]/40 text-[#8a6d1c] rounded-xl hover:bg-[#fbfaf6] hover:border-[#d4af37] active:scale-95 transition-all font-medium text-sm shadow-sm">
                                                <Navigation className="w-4 h-4" />
                                                {t('sos.getDirections')}
                                            </button>
                                        </>
                                    )}

                                    {alert.status === 'assigned' && (
                                        <>
                                            <button className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/20 active:scale-95 transition-all font-medium text-sm">
                                                <CheckCircle className="w-4 h-4" />
                                                {t('sos.markResolved')}
                                            </button>

                                            <button className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all font-medium text-sm">
                                                <Phone className="w-4 h-4" />
                                                {t('sos.contactGuide')}
                                            </button>
                                        </>
                                    )}

                                    {alert.status === 'resolved' && (
                                        <div className="flex items-center gap-2 text-green-700 bg-green-50/80 px-4 py-2.5 rounded-xl border border-green-200">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="font-semibold text-sm">{t('sos.resolvedSuccessfully')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
