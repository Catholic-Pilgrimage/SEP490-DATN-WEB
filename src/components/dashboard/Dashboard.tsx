import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './layout/Sidebar';
import { TopBar } from './layout/TopBar';
import { AdminDashboard } from './admin/AdminDashboard';
import { ManagerDashboard } from './manager/ManagerDashboard';
import { SiteManagement } from './admin/SiteManagement';
import { UserManagement } from './admin/UserManagement';
import { VerificationRequests } from './admin/VerificationRequests';
import { MySite } from './manager/MySite';
import { LocalGuides } from './manager/LocalGuides';
import { ShiftSubmissions } from './manager/ShiftSubmissions';
import { ContentManagement } from './manager/ContentManagement';
import { AdminSOSCenter } from './admin/AdminSOSCenter';
import { ManagerSOSCenter } from './manager/ManagerSOSCenter';
import { ProfilePage } from './profile/ProfilePage';
import { SettingsPage } from './settings/SettingsPage';
import { User } from '../../App';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { NotificationProvider } from '../../contexts/NotificationContext';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export type ActiveView = 'dashboard' | 'sites' | 'mysite' | 'users' | 'verifications' | 'sos' | 'guides' | 'shifts' | 'content' | 'analytics' | 'profile' | 'settings';

const DashboardContent: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Determine active view based on current path for Sidebar & TopBar
  const pathParts = location.pathname.split('/');
  const currentPath = pathParts[pathParts.length - 1];

  // Default to dashboard if we are at root or just /dashboard
  if (currentPath && currentPath !== 'dashboard' && currentPath !== '') {
    // We don't need activeView anymore since Routes handle the view,
    // but the Sidebar could theoretically use it if we wanted to pass it down.
    // However we removed it from SidebarProps, so we do nothing here.
  }

  return (
    <div className="h-screen bg-[#f5f3ee] flex overflow-hidden">
      <Sidebar
        user={user}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          user={user}
          onLogout={onLogout}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="flex-1 overflow-auto p-6">
          <Routes>
            {user.role === 'admin' ? (
              <>
                <Route index element={<AdminDashboard />} />
                <Route path="sites" element={<SiteManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="verifications" element={<VerificationRequests />} />
                <Route path="sos" element={<AdminSOSCenter />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </>
            ) : (
              <>
                <Route index element={<ManagerDashboard />} />
                <Route path="mysite" element={<MySite />} />
                <Route path="guides" element={<LocalGuides />} />
                <Route path="shifts" element={<ShiftSubmissions />} />
                <Route path="content" element={<ContentManagement />} />
                <Route path="sos" element={<ManagerSOSCenter />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = (props) => {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <DashboardContent {...props} />
      </NotificationProvider>
    </LanguageProvider>
  );
};