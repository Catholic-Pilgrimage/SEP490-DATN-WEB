import { useState } from 'react';
import { Image, Calendar, MapPin, Sparkles } from 'lucide-react';
import { MediaContent } from './MediaContent';
import { ScheduleContent } from './ScheduleContent';
import { EventContent } from './EventContent';
import { NearbyPlaceContent } from './NearbyPlaceContent';
import { useLanguage } from '../../../contexts/LanguageContext';

type ContentTab = 'media' | 'schedules' | 'events' | 'nearby';

interface TabConfig {
    id: ContentTab;
    label: string;
    icon: React.ElementType;
    component: React.ReactNode;
    disabled?: boolean;
}

/**
 * ContentManagement Component
 * 
 * Giải thích:
 * - Wrapper component với tabs để chuyển đổi giữa các loại content
 * - Media, Schedules, Events, Nearby Places
 */
export const ContentManagement: React.FC = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<ContentTab>('media');

    const tabs: TabConfig[] = [
        { id: 'media', label: t('content.tab.media'), icon: Image, component: <MediaContent /> },
        { id: 'schedules', label: t('content.tab.schedules'), icon: Calendar, component: <ScheduleContent /> },
        { id: 'events', label: t('content.tab.events'), icon: Sparkles, component: <EventContent /> },
        { id: 'nearby', label: t('content.tab.nearby'), icon: MapPin, component: <NearbyPlaceContent /> },
    ];

    const activeTabConfig = tabs.find(tab => tab.id === activeTab);

    return (
        <div className="h-full flex flex-col bg-[#fcfbf8]">
            {/* Tabs Header */}
            <div className="bg-white border-b border-[#d4af37]/20 px-6 pt-2 sticky top-0 z-10 shadow-sm shadow-[#d4af37]/5">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                                disabled={tab.disabled}
                                className={`
                                    flex items-center gap-2.5 px-5 py-3.5 font-medium text-sm
                                    border-b-2 transition-all duration-200 whitespace-nowrap outline-none
                                    ${isActive
                                        ? 'border-[#8a6d1c] text-[#8a6d1c] bg-[#f5f3ee]/50 rounded-t-xl'
                                        : tab.disabled
                                            ? 'border-transparent text-slate-300 cursor-not-allowed'
                                            : 'border-transparent text-slate-500 hover:text-[#8a6d1c] hover:bg-[#f5f3ee]/30 rounded-t-xl hover:border-[#d4af37]/30'
                                    }
                                `}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-[#8a6d1c]' : 'text-slate-400 group-hover:text-[#8a6d1c]'}`} />
                                {tab.label}
                                {tab.disabled && (
                                    <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-md ml-1">
                                        Soon
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">
                <div className="h-full">
                    {activeTabConfig?.component}
                </div>
            </div>
        </div>
    );
};

