import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Users,
  AlertTriangle,
  UserCheck,
  FileText,
  BarChart3,
  ChevronLeft,
  Cross,
  ClipboardCheck
} from 'lucide-react';
import { User } from '../../../App';
import { ActiveView } from '../Dashboard';

interface SidebarProps {
  user: User;
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeView,
  onViewChange,
  collapsed,
  onToggleCollapse,
}) => {
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sites', label: 'Sites Management', icon: MapPin },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'verifications', label: 'Verifications', icon: ClipboardCheck },
    { id: 'sos', label: 'SOS Center', icon: AlertTriangle },
  ];

  const managerMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'guides', label: 'My Guides', icon: UserCheck },
    { id: 'content', label: 'Content Review', icon: FileText },
    { id: 'sos', label: 'SOS Center', icon: AlertTriangle },
    { id: 'analytics', label: 'Site Analytics', icon: BarChart3 },
  ];

  const menuItems = user.role === 'admin' ? adminMenuItems : managerMenuItems;

  return (
    <div className={`
      bg-gradient-to-b from-slate-900 to-blue-900 text-white 
      transition-all duration-300 ease-in-out flex flex-col
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center">
                <Cross className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Pilgrimage</h1>
                <p className="text-xs text-white/70 capitalize">{user.role} Portal</p>
              </div>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const isSOSItem = item.id === 'sos';

            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id as ActiveView)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left
                    transition-all duration-200 group relative
                    ${isActive
                      ? 'bg-white/10 text-white shadow-lg border-l-4 border-amber-400'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                    }
                    ${isSOSItem ? 'hover:bg-red-500/10' : ''}
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-transparent rounded-xl" />
                  )}

                  <Icon className={`
                    w-5 h-5 flex-shrink-0 relative z-10
                    ${isSOSItem ? 'text-red-400' : ''}
                    ${isActive ? 'text-amber-400' : ''}
                  `} />

                  {!collapsed && (
                    <span className="font-medium relative z-10">{item.label}</span>
                  )}

                  {isSOSItem && !collapsed && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar || 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150'}
            alt={user.name}
            className="w-10 h-10 rounded-xl object-cover"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium truncate">{user.name}</h3>
              <p className="text-xs text-white/70 truncate">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};