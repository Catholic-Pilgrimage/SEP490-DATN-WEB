import React from 'react';
import { TodayShifts } from './TodayShifts';

export const ManagerDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Site Manager Dashboard
        </h1>
        <p className="text-slate-600 mt-2">
          Manage your assigned sites and guide operations
        </p>
      </div>

      <TodayShifts />
    </div>
  );
};
