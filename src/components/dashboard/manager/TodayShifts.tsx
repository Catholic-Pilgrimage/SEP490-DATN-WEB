import React, { useEffect, useState, useCallback } from 'react';
import {
  Clock,
  User,
  Phone,
  CheckCircle,
  Loader2,
  Calendar,
  Mail
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { Shift, ShiftSubmission } from '../../../types/manager.types';

interface ShiftWithGuide {
  shift: Shift;
  submission: ShiftSubmission;
}

export const TodayShifts: React.FC = () => {
  const [shifts, setShifts] = useState<ShiftWithGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============ HELPER ============
  const isSameDay = (d1: Date, d2: Date): boolean => {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  };

  const getWeekStart = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  };

  const formatTime = (timeString: string) => timeString.slice(0, 5);

  // ============ FETCH DATA ============
  const fetchTodayShifts = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date();
      // Get shifts for current week
      const response = await ManagerService.getShiftSubmissions({
        limit: 100,
        status: 'approved', // Only show approved shifts
        week_start_date: getWeekStart(today)
      });

      if (response.success && response.data) {
        const todayShifts: ShiftWithGuide[] = [];

        response.data.data.forEach(submission => {
          submission.shifts.forEach(shift => {
            // Calculate shift date
            const weekStart = new Date(submission.week_start_date);
            weekStart.setHours(0, 0, 0, 0);

            let daysToAdd = shift.day_of_week - 1;
            if (shift.day_of_week === 0) daysToAdd = 6;

            const shiftDate = new Date(weekStart);
            shiftDate.setDate(shiftDate.getDate() + daysToAdd);

            // If shift is today, add to list
            if (isSameDay(shiftDate, today)) {
              todayShifts.push({ shift, submission });
            }
          });
        });

        // Sort by start time
        todayShifts.sort((a, b) => a.shift.start_time.localeCompare(b.shift.start_time));

        setShifts(todayShifts);
      }
    } catch (err) {
      console.error('Error fetching today shifts:', err);
      setError('Không thể tải lịch trực hôm nay');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayShifts();
  }, [fetchTodayShifts]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Ca trực hôm nay
        </h2>
        <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
          {new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: 'numeric',
            month: 'numeric'
          })}
        </span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-red-500 min-h-[200px]">
          {error}
        </div>
      ) : shifts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 min-h-[200px]">
          <Calendar className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Không có ca trực nào</p>
          <p className="text-sm text-slate-400">Hôm nay không có Local Guide nào đăng ký</p>
        </div>
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto pr-2 max-h-[400px]">
          {shifts.map(({ shift, submission }, index) => (
            <div
              key={`${submission.id} -${shift.id} -${index} `}
              className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors bg-slate-50"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  {submission.guide.avatar_url ? (
                    <img
                      src={submission.guide.avatar_url}
                      alt={submission.guide.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-slate-900 truncate">
                        {submission.guide.full_name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-medium text-blue-700">
                            {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3" />
                      Đang hoạt động
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                      <Mail className="w-3.5 h-3.5" />
                      {submission.guide.email}
                    </div>
                    {submission.guide.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone className="w-3.5 h-3.5" />
                        {submission.guide.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};