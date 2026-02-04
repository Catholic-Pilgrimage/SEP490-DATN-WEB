import React, { useState } from 'react';
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
import { SOSCenter } from './shared/SOSCenter';
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
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    if (user.role === 'admin') {
      switch (activeView) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'sites':
          return <SiteManagement />;
        case 'users':
          return <UserManagement />;
        case 'verifications':
          return <VerificationRequests />;
        case 'sos':
          return <SOSCenter />;
        case 'profile':
          return <ProfilePage />;
        case 'settings':
          return <SettingsPage />;
        default:
          return <AdminDashboard />;
      }
    } else {
      switch (activeView) {
        case 'dashboard':
          return <ManagerDashboard />;
        case 'mysite':
          return <MySite />;
        case 'guides':
          return <LocalGuides />;
        case 'shifts':
          return <ShiftSubmissions />;
        case 'content':
          return <ContentManagement />;
        case 'sos':
          return <SOSCenter />;
        case 'profile':
          return <ProfilePage />;
        case 'settings':
          return <SettingsPage />;
        default:
          return <ManagerDashboard />;
      }
    }
  };

  return (
    <div className="h-screen bg-[#f5f3ee] flex overflow-hidden">
      <Sidebar
        user={user}
        activeView={activeView}
        onViewChange={setActiveView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          user={user}
          activeView={activeView}
          onLogout={onLogout}
          onViewChange={setActiveView}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
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