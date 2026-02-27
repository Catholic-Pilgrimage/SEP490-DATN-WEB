import React from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';

export const ChartsSection: React.FC = () => {
  // Mock chart data
  const checkInData = [
    { day: 'Mon', value: 45 },
    { day: 'Tue', value: 52 },
    { day: 'Wed', value: 38 },
    { day: 'Thu', value: 67 },
    { day: 'Fri', value: 73 },
    { day: 'Sat', value: 89 },
    { day: 'Sun', value: 134 }
  ];

  const sosData = [
    { site: 'Fatima', count: 5 },
    { site: 'Lourdes', count: 3 },
    { site: 'Medjugorje', count: 7 },
    { site: 'Santiago', count: 2 },
    { site: 'Vatican', count: 1 }
  ];

  const maxCheckIn = Math.max(...checkInData.map(d => d.value));
  const maxSOS = Math.max(...sosData.map(d => d.count));

  return (
    <div className="space-y-6">
      {/* Check-ins Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Daily Check-ins
              </h2>
              <p className="text-sm text-slate-600">
                Pilgrims visiting sites this week
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">498</div>
            <div className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12.5%
            </div>
          </div>
        </div>

        <div className="h-64 flex items-end justify-between gap-4">
          {checkInData.map((data) => (
            <div key={data.day} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-700"
                style={{
                  height: `${(data.value / maxCheckIn) * 100}%`,
                  minHeight: '4px'
                }}
              />
              <div className="mt-2 text-sm font-medium text-slate-600">
                {data.day}
              </div>
              <div className="text-xs text-slate-500">
                {data.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SOS Alerts Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                SOS Alerts by Site
              </h2>
              <p className="text-sm text-slate-600">
                Emergency responses this month
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">18</div>
            <div className="text-sm text-red-600 flex items-center gap-1">
              Total alerts
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {sosData.map((data) => (
            <div key={data.site} className="flex items-center gap-4">
              <div className="w-20 text-sm font-medium text-slate-700">
                {data.site}
              </div>
              <div className="flex-1">
                <div className="relative">
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${(data.count / maxSOS) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="w-8 text-right text-sm font-semibold text-slate-900">
                {data.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};