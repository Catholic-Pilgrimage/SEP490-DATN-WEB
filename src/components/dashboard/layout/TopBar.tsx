import React from 'react';
import { Search, Bell, ChevronRight, AlertTriangle } from 'lucide-react';
import { User } from '../../../App';
import { ActiveView } from '../Dashboard';

interface TopBarProps {
  user: User;
  activeView: ActiveView;
  onLogout: () => void;
  onViewChange: (view: ActiveView) => void;
  sidebarCollapsed: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  activeView,
  onLogout,
  onViewChange,
}) => {
  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      sites: 'Sites Management',
      users: 'User Management',
      sos: 'SOS Emergency Center',
      guides: 'My Guides',
      content: 'Content Review',
      analytics: 'Site Analytics',
      profile: 'Profile',
      settings: 'Settings'
    };
    return titles[activeView] || 'Dashboard';
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = ['Dashboard'];
    if (activeView !== 'dashboard') {
      breadcrumbs.push(getPageTitle());
    }
    return breadcrumbs;
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Breadcrumbs */}
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-2 text-sm">
            {getBreadcrumbs().map((crumb, index) => (
              <React.Fragment key={crumb}>
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
                <span className={
                  index === getBreadcrumbs().length - 1
                    ? 'font-semibold text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 cursor-pointer'
                }>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right side - Search, Notifications, User */}
        <div className="flex items-center gap-4">
          {/* Global Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search sites, users, content..."
              className="pl-10 pr-4 py-2 w-64 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-slate-600" />
              {/* SOS Badge */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-2 h-2 text-white" />
              </div>
            </button>
          </div>

          {/* User Menu */}
          <div className="relative group">
            <button className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <img
                src={user.avatar || 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150'}
                alt={user.name}
                className="w-8 h-8 rounded-lg object-cover"
              />
              <div className="text-left">
                <div className="text-sm font-medium text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-600 capitalize">{user.role}</div>
              </div>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2">
                <button
                  onClick={() => onViewChange('profile')}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Profile
                </button>
                <button
                  onClick={() => onViewChange('settings')}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Settings
                </button>
                <hr className="my-2 border-slate-200" />
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};