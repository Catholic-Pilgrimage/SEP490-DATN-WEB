import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    AlertTriangle,
    Phone,
    MapPin,
    Clock,
    User,
    CheckCircle,
    CalendarIcon,
    RefreshCw,
    Filter,
    X,
    Search,
    UserCheck,
    Loader2,
    FileText,
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { extractErrorMessage } from '../../../lib/utils';
import { ManagerService } from '../../../services/manager.service';
import { AdminSOSRequest, SOSStatus } from '../../../types/admin.types';
import { ManagerSOSStats, LocalGuide } from '../../../types/manager.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import VietMapView from '@/components/shared/VietMapView';
import {
    Pagination as ShadcnPagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

export const ManagerSOSCenter: React.FC = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();

    const [sosAlerts, setSosAlerts] = useState<AdminSOSRequest[]>([]);
    const [stats, setStats] = useState<ManagerSOSStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState<SOSStatus | ''>('');
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const listRef = useRef<HTMLDivElement>(null);
    const hasNavigated = useRef(false);

    // Assign Guide Modal state
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [assigningSosAlert, setAssigningSosAlert] = useState<AdminSOSRequest | null>(null);
    const [guides, setGuides] = useState<LocalGuide[]>([]);
    const [guidesLoading, setGuidesLoading] = useState(false);
    const [guideSearch, setGuideSearch] = useState('');
    const [selectedGuideId, setSelectedGuideId] = useState<string>('');
    const [isAssigning, setIsAssigning] = useState(false);

    const fetchSOSData = async (isManualRefresh = false) => {
        if (isManualRefresh) {
            setRefreshing(true);
        } else {
            setIsLoading(true);
        }

        try {
            const [listRes, statsRes] = await Promise.all([
                ManagerService.getSOSRequests({
                    page: currentPage,
                    limit: 10,
                    status: statusFilter,
                    from_date: fromDate || undefined,
                    to_date: toDate || undefined,
                }),
                ManagerService.getSOSStats({
                    from_date: fromDate || undefined,
                    to_date: toDate || undefined,
                })
            ]);

            if (listRes.success && listRes.data) {
                const data = listRes.data as { sosRequests?: AdminSOSRequest[]; pagination?: { total: number; totalPages: number } };
                setSosAlerts(data.sosRequests || []);
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages);
                }
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
                showToast('error', t('common.error') || 'Đã xảy ra lỗi', extractErrorMessage(error));
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, fromDate, toDate, currentPage]);

    // Smooth scroll to top of list when page changes
    useEffect(() => {
        if (hasNavigated.current && listRef.current) {
            listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        hasNavigated.current = true;
    }, [currentPage]);

    // ====== Assign Guide Modal Logic ======

    const fetchGuides = useCallback(async () => {
        setGuidesLoading(true);
        try {
            const res = await ManagerService.getLocalGuides({ status: 'active', limit: 100 });
            if (res.success && res.data) {
                setGuides(res.data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch guides:', error);
            setGuides([]);
        } finally {
            setGuidesLoading(false);
        }
    }, []);

    const handleOpenAssignModal = (alert: AdminSOSRequest) => {
        setAssigningSosAlert(alert);
        setSelectedGuideId('');
        setGuideSearch('');
        setAssignModalOpen(true);
        fetchGuides();
    };

    const handleCloseAssignModal = () => {
        setAssignModalOpen(false);
        setAssigningSosAlert(null);
        setSelectedGuideId('');
        setGuideSearch('');
    };

    const handleAssignGuide = async () => {
        if (!assigningSosAlert || !selectedGuideId) return;

        setIsAssigning(true);
        try {
            const res = await ManagerService.assignGuideToSOS(assigningSosAlert.id, selectedGuideId);
            if (res.success) {
                showToast('success', t('sos.assignSuccess'), t('sos.assignSuccessMsg'));
                handleCloseAssignModal();
                // Refresh data to reflect the change
                fetchSOSData(false);
            } else {
                showToast('error', t('sos.assignFailed'), extractErrorMessage(res));
            }
        } catch (error) {
            showToast('error', t('sos.assignFailed'), extractErrorMessage(error));
        } finally {
            setIsAssigning(false);
        }
    };

    const filteredGuides = guides.filter((g) => {
        if (!guideSearch.trim()) return true;
        const q = guideSearch.toLowerCase();
        return (
            g.full_name.toLowerCase().includes(q) ||
            g.email.toLowerCase().includes(q) ||
            (g.phone || '').toLowerCase().includes(q)
        );
    });

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
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl">
                        {t('sos.title')}
                    </h1>
                    <p className="text-slate-600 mt-2 text-sm">{t('sos.subtitleManager')}</p>
                </div>

                <div className="flex flex-col lg:flex-row justify-between gap-4 bg-white p-3 rounded-2xl shadow-sm border border-[#d4af37]/20">
                    <div className="flex flex-wrap items-center gap-3 xl:gap-5">
                        <div className="flex items-center justify-center p-2 bg-[#fdfbf7] rounded-lg border border-[#d4af37]/10">
                            <Filter className="w-5 h-5 text-[#8a6d1c]/80" />
                        </div>

                        {/* Date Range Filter */}
                        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#f5f3ee] border border-[#d4af37]/20 rounded-xl">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium border transition-all ${
                                            fromDate
                                                ? 'border-[#d4af37] text-[#8a6d1c] bg-white'
                                                : 'border-[#d4af37]/30 text-slate-500 bg-white hover:bg-[#d4af37]/5'
                                        }`}
                                    >
                                        <CalendarIcon className="h-3.5 w-3.5 text-[#d4af37]" />
                                        {fromDate ? format(new Date(fromDate), 'dd/MM/yyyy') : t('dashboard.fromDate')}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto overflow-hidden rounded-xl border border-[#d4af37]/20 p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={fromDate ? new Date(fromDate) : undefined}
                                        onSelect={(date) => {
                                            setFromDate(date ? format(date, "yyyy-MM-dd") : '');
                                            if (date && toDate && date > new Date(toDate)) setToDate('');
                                            setCurrentPage(1);
                                        }}
                                        disabled={toDate ? { after: new Date(toDate) } : undefined}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {fromDate && (
                                <button
                                    type="button"
                                    onClick={() => { setFromDate(''); setCurrentPage(1); }}
                                    className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <span className="text-[#d4af37]/50">—</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium border transition-all ${
                                            toDate
                                                ? 'border-[#d4af37] text-[#8a6d1c] bg-white'
                                                : 'border-[#d4af37]/30 text-slate-500 bg-white hover:bg-[#d4af37]/5'
                                        }`}
                                    >
                                        <CalendarIcon className="h-3.5 w-3.5 text-[#d4af37]" />
                                        {toDate ? format(new Date(toDate), 'dd/MM/yyyy') : t('dashboard.toDate')}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto overflow-hidden rounded-xl border border-[#d4af37]/20 p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={toDate ? new Date(toDate) : undefined}
                                        onSelect={(date) => {
                                            setToDate(date ? format(date, "yyyy-MM-dd") : '');
                                            if (date && fromDate && date < new Date(fromDate)) setFromDate('');
                                            setCurrentPage(1);
                                        }}
                                        disabled={fromDate ? { before: new Date(fromDate) } : undefined}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {toDate && (
                                <button
                                    type="button"
                                    onClick={() => { setToDate(''); setCurrentPage(1); }}
                                    className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Status Dropdown */}
                        <div className="relative">
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => { setStatusFilter(value === 'all' ? '' : value as SOSStatus); setCurrentPage(1); }}
                            >
                                <SelectTrigger className="w-[150px] h-[38px] bg-[#f5f3ee] hover:bg-[#d4af37]/10 transition-colors rounded-xl text-slate-700 font-medium focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] border border-[#d4af37]/30 hover:border-[#d4af37]/50 cursor-pointer">
                                    <SelectValue placeholder={t('sos.allStatuses')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('sos.allStatuses')}</SelectItem>
                                    <SelectItem value="pending">{t('sos.statusPending')}</SelectItem>
                                    <SelectItem value="accepted">{t('sos.statusAccepted')}</SelectItem>
                                    <SelectItem value="resolved">{t('sos.statusResolved')}</SelectItem>
                                    <SelectItem value="cancelled">{t('sos.statusCancelled')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 lg:border-l border-slate-100 lg:pl-4">
                        <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-xl border border-red-100 flex-1 lg:flex-none justify-center">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-sm font-bold">
                                {stats?.pending || 0} <span className="font-medium text-red-600/80">{t('sos.activeAlerts')}</span>
                            </span>
                        </div>

                        <Button
                            type="button"
                            onClick={handleManualRefresh}
                            disabled={isLoading || refreshing}
                            className="flex-1 lg:flex-none rounded-xl bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white hover:brightness-110 shadow-md shadow-[#d4af37]/20"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading || refreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">{t('common.refresh')}</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Emergency Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6">
                {[
                    { label: t('sos.statTotal'), value: stats?.total || 0, color: 'gold', icon: AlertTriangle },
                    { label: t('sos.statPending'), value: stats?.pending || 0, color: 'red', icon: Phone },
                    { label: t('sos.statInProgress'), value: stats?.accepted || 0, color: 'amber', icon: Clock },
                    { label: t('sos.statResolved'), value: stats?.resolved || 0, color: 'green', icon: CheckCircle },
                    { label: t('sos.statusCancelled'), value: stats?.cancelled || 0, color: 'gray', icon: RefreshCw }
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                        <Card className={`
              h-full relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
              ${stat.color === 'gold' ? 'border-[#d4af37]/30 shadow-md shadow-[#d4af37]/10 bg-gradient-to-br from-white to-[#fdfbf7]' : 'border-slate-100/60 shadow-sm bg-white hover:border-slate-200'}
            `}>
                            <div className={`absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-[0.25] pointer-events-none transition-transform group-hover:scale-110 
               ${stat.color === 'gold' ? 'bg-[#d4af37]' :
                                    stat.color === 'red' ? 'bg-red-500' :
                                        stat.color === 'amber' ? 'bg-amber-500' :
                                            stat.color === 'green' ? 'bg-green-500' : 'bg-slate-500'
                                }
             `} />

                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-3">
                                <CardTitle className={`text-xs font-bold uppercase tracking-wider ${stat.color === 'gold' ? 'text-[#8a6d1c]' : 'text-slate-500'}`}>
                                    {stat.label}
                                </CardTitle>
                                <stat.icon className={`h-4 w-4 relative z-10 ${stat.color === 'gold' ? 'text-[#d4af37]' :
                                    stat.color === 'red' ? 'text-red-400' :
                                        stat.color === 'amber' ? 'text-amber-400' :
                                            stat.color === 'green' ? 'text-green-400' : 'text-slate-400'
                                    }`} />
                            </CardHeader>

                            <CardContent className="p-5 pt-0">
                                <div className={`text-4xl font-extrabold ${stat.color === 'gold' ? 'text-[#8a6d1c]' :
                                    stat.color === 'red' ? 'text-red-600' :
                                        stat.color === 'amber' ? 'text-amber-600' :
                                            stat.color === 'green' ? 'text-green-600' : 'text-slate-600'
                                    }`}>
                                    {isLoading ? '-' : stat.value}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* SOS Alerts List */}
            <div ref={listRef} className={`space-y-4 transition-opacity duration-300 ${isLoading && sosAlerts.length > 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
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
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`page-${currentPage}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                        {sosAlerts.map((alert) => {
                            const statusInfo = getStatusInfo(alert.status);
                            const StatusIcon = statusInfo.icon;
                            // Determine severity for visual emphasis based on status
                            const severity = alert.status === 'pending' ? 'high' : alert.status === 'accepted' ? 'medium' : 'low';

                            return (
                                <div
                                    key={alert.id}
                                >
                                    <Card
                                        className={`
                      relative shadow-sm border-0 border-l-[6px] transition-all hover:shadow-md
                      ${getSeverityColor(severity)}
                    `}
                                    >
                                        <CardContent className="p-6">
                                            {alert.status === 'pending' && (
                                                <span className="absolute top-0 right-0 -mt-2 -mr-2 flex h-5 w-5 z-10">
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
                                                            Code: <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs ml-1">{alert.code}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 pl-14 sm:pl-0">
                                                    <Badge
                                                        variant="outline"
                                                        className={`
                        gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider
                        ${severity === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            severity === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                'bg-slate-50 text-slate-700 border-slate-200'}
                      `}
                                                    >
                                                        {severity === 'high' ? t('sos.severityHigh') : severity === 'medium' ? t('sos.severityMedium') : t('sos.severityLow')}
                                                    </Badge>

                                                    <Badge
                                                        variant="outline"
                                                        className={`
                        gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider
                        ${statusInfo.color === 'red' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            statusInfo.color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                statusInfo.color === 'green' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-700 border-slate-200'}
                      `}
                                                    >
                                                        <StatusIcon className="w-3.5 h-3.5" />
                                                        {statusInfo.label}
                                                    </Badge>
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
                                                <div className="bg-[#fbfaf6] p-2 rounded-xl border border-[#d4af37]/15 overflow-hidden">
                                                    <div className="flex items-center justify-between px-2 pt-2 mb-2">
                                                        <div className="flex items-center gap-2 text-[#8a6d1c]/70 font-semibold uppercase tracking-wider text-xs">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            <span>{t('sos.location')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="rounded-lg overflow-hidden">
                                                        <VietMapView
                                                            latitude={Number(alert.latitude)}
                                                            longitude={Number(alert.longitude)}
                                                            zoom={15}
                                                            interactive={false}
                                                            className="!h-[120px] rounded-lg"
                                                            markers={[{
                                                                id: alert.id,
                                                                lat: Number(alert.latitude),
                                                                lng: Number(alert.longitude),
                                                                title: alert.message || 'SOS',
                                                                color: '#ef4444',
                                                                icon: '🚨',
                                                            }]}
                                                        />
                                                    </div>
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
                                                    {alert.assigned_at && (
                                                        <div className="text-sm text-slate-600 flex items-center gap-1.5 mt-1">
                                                            <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                                                            <span className="text-slate-400">{t('sos.assignedAt') || 'Phân công lúc'}</span>{' '}
                                                            {new Date(alert.assigned_at).toLocaleString('vi-VN')}
                                                        </div>
                                                    )}
                                                    <div className="text-sm text-slate-600 mt-1">
                                                        <span className="text-slate-400 mr-1">{t('sos.created')}</span>{' '}
                                                        {new Date(alert.created_at).toLocaleString('vi-VN')}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            {alert.notes && (
                                                <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-100 mb-2">
                                                    <div className="flex items-center gap-2 text-blue-700/70 font-semibold uppercase tracking-wider text-xs mb-1.5">
                                                        <FileText className="w-3.5 h-3.5" />
                                                        <span>{t('sos.notes') || 'Ghi chú xử lý'}</span>
                                                    </div>
                                                    <p className="text-sm text-blue-900 leading-relaxed">{alert.notes}</p>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                                                {alert.status === 'pending' && (
                                                    <Button
                                                        type="button"
                                                        onClick={() => handleOpenAssignModal(alert)}
                                                        className="h-auto rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/20"
                                                    >
                                                        <UserCheck className="w-4 h-4" />
                                                        {t('sos.assignGuide')}
                                                    </Button>
                                                )}



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
                                        </CardContent>
                                    </Card>
                                </div>
                            );
                        })}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-slate-500">
                        {t('pagination.page') || 'Trang'} {currentPage} / {totalPages}
                    </p>
                    <ShadcnPagination className="justify-end">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => currentPage > 1 && setCurrentPage(p => Math.max(1, p - 1))}
                                    className={`cursor-pointer text-[#8a6d1c] hover:text-[#8a6d1c] hover:bg-[#d4af37]/10 ${currentPage === 1 ? "pointer-events-none opacity-40" : ""}`}
                                />
                            </PaginationItem>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum: number;
                                if (totalPages <= 5) pageNum = i + 1;
                                else if (currentPage <= 3) pageNum = i + 1;
                                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                else pageNum = currentPage - 2 + i;

                                return (
                                    <PaginationItem key={pageNum}>
                                        <PaginationLink
                                            onClick={() => setCurrentPage(pageNum)}
                                            isActive={currentPage === pageNum}
                                            className={`cursor-pointer rounded-lg border border-[#d4af37]/30 text-sm px-3 py-2 ${currentPage === pageNum
                                                ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white hover:text-white hover:brightness-110'
                                                : 'text-[#8a6d1c] bg-white hover:bg-[#d4af37]/10'
                                                }`}
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}

                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <PaginationItem>
                                    <PaginationEllipsis className="text-[#8a6d1c]" />
                                </PaginationItem>
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => currentPage < totalPages && setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className={`cursor-pointer text-[#8a6d1c] hover:text-[#8a6d1c] hover:bg-[#d4af37]/10 ${currentPage === totalPages ? "pointer-events-none opacity-40" : ""}`}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </ShadcnPagination>
                </div>
            )}

            {/* ====== Assign Guide Dialog ====== */}
            <Dialog open={assignModalOpen} onOpenChange={(open) => { if (!open) handleCloseAssignModal(); }}>
                <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden rounded-2xl border border-[#d4af37]/20">
                    {/* Header */}
                    <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-[#fdfbf7] to-white border-b border-[#d4af37]/10">
                        <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center border border-amber-200">
                                <UserCheck className="w-5 h-5 text-amber-600" />
                            </div>
                            {t('sos.assignGuideTitle')}
                        </DialogTitle>
                        <DialogDescription className="text-slate-600 mt-2">
                            {t('sos.assignGuideSubtitle')}
                        </DialogDescription>
                        {assigningSosAlert && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs font-semibold">
                                    {t('sos.sosCode')}: {assigningSosAlert.code}
                                </Badge>
                                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs">
                                    {assigningSosAlert.pilgrim?.full_name}
                                </Badge>
                            </div>
                        )}
                    </DialogHeader>

                    {/* Content */}
                    <div className="px-6 py-4 space-y-4">
                        {/* Search input */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={guideSearch}
                                onChange={(e) => setGuideSearch(e.target.value)}
                                placeholder={t('sos.searchGuide')}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 outline-none text-sm transition-all bg-white"
                            />
                        </div>

                        {/* Guide list */}
                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                            {guidesLoading ? (
                                <div className="flex items-center justify-center py-10 text-slate-500">
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    <span className="text-sm">{t('sos.loadingGuides')}</span>
                                </div>
                            ) : filteredGuides.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <User className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">{t('sos.noGuidesAvailable')}</p>
                                </div>
                            ) : (
                                filteredGuides.map((guide) => {
                                    const isSelected = selectedGuideId === guide.id;
                                    return (
                                        <button
                                            key={guide.id}
                                            type="button"
                                            onClick={() => setSelectedGuideId(guide.id)}
                                            className={`
                                                w-full p-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer
                                                ${isSelected
                                                    ? 'border-[#d4af37] bg-[#fdfbf7] shadow-md shadow-[#d4af37]/10 ring-1 ring-[#d4af37]/30'
                                                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/80'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Avatar / Initials */}
                                                <div className={`
                                                    w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold uppercase
                                                    ${isSelected
                                                        ? 'bg-[#d4af37] text-white'
                                                        : 'bg-slate-100 text-slate-600'
                                                    }
                                                `}>
                                                    {guide.full_name.charAt(0)}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className={`font-semibold text-sm truncate ${isSelected ? 'text-[#8a6d1c]' : 'text-slate-900'}`}>
                                                            {guide.full_name}
                                                        </span>
                                                        {isSelected && (
                                                            <CheckCircle className="w-5 h-5 text-[#d4af37] shrink-0" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-0.5">
                                                        <span className="text-xs text-slate-500 truncate">{guide.email}</span>
                                                        {guide.phone && (
                                                            <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                                                                <Phone className="w-3 h-3" />
                                                                {guide.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-[#fdfbf7] border-t border-[#d4af37]/10 flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloseAssignModal}
                            disabled={isAssigning}
                            className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                            {t('common.close')}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAssignGuide}
                            disabled={!selectedGuideId || isAssigning}
                            className="rounded-xl bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-white hover:brightness-110 shadow-md shadow-[#d4af37]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAssigning ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('sos.assigning')}
                                </>
                            ) : (
                                <>
                                    <UserCheck className="w-4 h-4" />
                                    {t('sos.confirmAssign')}
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
