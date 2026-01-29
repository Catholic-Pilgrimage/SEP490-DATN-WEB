import React, { useState } from 'react';
import { Image, Calendar, MapPin, Sparkles } from 'lucide-react';
import { MediaContent } from './MediaContent';
import { ScheduleContent } from './ScheduleContent';
import { EventContent } from './EventContent';

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
    const [activeTab, setActiveTab] = useState<ContentTab>('media');

    const tabs: TabConfig[] = [
        { id: 'media', label: 'Media', icon: Image, component: <MediaContent /> },
        { id: 'schedules', label: 'Lịch lễ', icon: Calendar, component: <ScheduleContent /> },
        { id: 'events', label: 'Sự kiện', icon: Sparkles, component: <EventContent /> },
        { id: 'nearby', label: 'Địa điểm lân cận', icon: MapPin, component: <div className="p-6 text-center text-slate-500">Đang phát triển...</div>, disabled: true },
    ];

    const activeTabConfig = tabs.find(tab => tab.id === activeTab);

    return (
        <div className="h-full flex flex-col">
            {/* Tabs Header */}
            <div className="bg-white border-b border-slate-200 px-6">
                <div className="flex items-center gap-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                                disabled={tab.disabled}
                                className={`
                                    flex items-center gap-2 px-4 py-4 font-medium text-sm
                                    border-b-2 transition-colors
                                    ${isActive
                                        ? 'border-blue-600 text-blue-600'
                                        : tab.disabled
                                            ? 'border-transparent text-slate-300 cursor-not-allowed'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {tab.disabled && (
                                    <span className="text-xs bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">Soon</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto bg-slate-50">
                {activeTabConfig?.component}
            </div>
        </div>
    );
};
