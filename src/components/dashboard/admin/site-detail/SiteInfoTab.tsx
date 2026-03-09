import React from 'react';
import { MapPin, Phone, Mail, Clock, Calendar, User, BookOpen } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { SiteDetail } from '../../../../types/admin.types';
import VietMapView from '../../../../components/shared/VietMapView';

interface SiteInfoTabProps {
    site: SiteDetail;
    regionInfo: { label: string; color: string; gradient: string } | null;
    formatDate: (date: string) => string;
}

export const SiteInfoTab: React.FC<SiteInfoTabProps> = ({ site, regionInfo, formatDate }) => {
    const { t } = useLanguage();
    return (
        <div className="p-6 space-y-6">
            {/* Location */}
            <div className="flex items-start gap-3 p-4 bg-[#f5f3ee] rounded-xl border border-[#d4af37]/10">
                <div className="p-2 bg-[#d4af37]/20 rounded-lg">
                    <MapPin className="w-5 h-5 text-[#8a6d1c]" />
                </div>
                <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-1">{t('edit.address')}</p>
                    <p className="text-sm font-medium text-slate-900">
                        {site.address && `${site.address}, `}
                        {site.district && `${site.district}, `}
                        {site.province}
                    </p>
                    <span className={`inline-flex items-center mt-2 px-2 py-0.5 rounded text-xs font-medium ${regionInfo?.color}`}>
                        {regionInfo?.label}
                    </span>
                </div>
            </div>

            {/* Map View */}
            {site.latitude && site.longitude && (
                <VietMapView
                    latitude={Number(site.latitude)}
                    longitude={Number(site.longitude)}
                    zoom={15}
                    markers={[{
                        id: site.id,
                        lat: Number(site.latitude),
                        lng: Number(site.longitude),
                        title: site.name,
                        color: '#c8a951',
                    }]}
                    className="w-full h-[400px] rounded-xl overflow-hidden border border-[#d4af37]/20 shadow-sm"
                />
            )}

            {/* Description */}
            {site.description && (
                <div className="p-4 bg-[#f5f3ee] rounded-xl border border-[#d4af37]/10">
                    <p className="text-xs text-slate-500 mb-2">{t('detail.description')}</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{site.description}</p>
                </div>
            )}

            {/* History */}
            {site.history && (
                <div className="p-4 bg-[#d4af37]/10 rounded-xl border border-[#d4af37]/20">
                    <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-[#8a6d1c]" />
                        <p className="text-xs text-[#8a6d1c] font-medium">{t('detail.history')}</p>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{site.history}</p>
                </div>
            )}

            {/* Contact & Opening Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {site.contact_info && (site.contact_info.phone || site.contact_info.email) && (
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-3">{t('detail.contact')}</p>
                        {site.contact_info.phone && (
                            <div className="flex items-center gap-2 mb-2">
                                <Phone className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-slate-700">{site.contact_info.phone}</span>
                            </div>
                        )}
                        {site.contact_info.email && (
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-slate-700">{site.contact_info.email}</span>
                            </div>
                        )}
                    </div>
                )}

                {site.opening_hours && Object.keys(site.opening_hours).length > 0 && (
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <p className="text-xs text-slate-500">{t('detail.openingHours')}</p>
                        </div>
                        <div className="space-y-1 text-sm">
                            {Object.entries(site.opening_hours).map(([day, hours]) => (
                                <div key={day} className="flex justify-between">
                                    <span className="text-slate-500 capitalize">{t(`day.${day}`)}</span>
                                    <span className="text-slate-700 font-medium">{hours}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Created By & Dates */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                {site.created_by && (
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                            <p className="text-xs text-slate-500">{t('detail.createdBy')}</p>
                            <p className="text-sm font-medium text-slate-700">{site.created_by.full_name}</p>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                        <p className="text-xs text-slate-500">{t('detail.createdAt')}</p>
                        <p className="text-sm font-medium text-slate-700">{formatDate(site.created_at)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
