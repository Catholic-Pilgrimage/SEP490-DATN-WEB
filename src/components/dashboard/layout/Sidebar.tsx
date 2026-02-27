import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Users,
  AlertTriangle,
  UserCheck,
  FileText,
  BarChart3,
  ChevronLeft,
  Church,
  ClipboardCheck,
  Calendar
} from 'lucide-react';
import { User } from '../../../App';
import { useLanguage } from '../../../contexts/LanguageContext';

interface SidebarProps {
  user: User;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  collapsed,
  onToggleCollapse,
}) => {
  const { t } = useLanguage();

  const adminMenuItems = [
    { id: 'dashboard', path: '/dashboard', label: t('menu.dashboard'), icon: LayoutDashboard, exact: true },
    { id: 'sites', path: '/dashboard/sites', label: t('menu.sites'), icon: MapPin },
    { id: 'users', path: '/dashboard/users', label: t('menu.users'), icon: Users },
    { id: 'verifications', path: '/dashboard/verifications', label: t('menu.verifications'), icon: ClipboardCheck },
    { id: 'sos', path: '/dashboard/sos', label: t('menu.sos'), icon: AlertTriangle },
  ];

  const managerMenuItems = [
    { id: 'dashboard', path: '/dashboard', label: t('menu.dashboard'), icon: LayoutDashboard, exact: true },
    { id: 'mysite', path: '/dashboard/mysite', label: t('menu.mysite'), icon: MapPin },
    { id: 'guides', path: '/dashboard/guides', label: t('menu.guides'), icon: UserCheck },
    { id: 'shifts', path: '/dashboard/shifts', label: t('menu.shifts'), icon: Calendar },
    { id: 'content', path: '/dashboard/content', label: t('menu.content'), icon: FileText },
    { id: 'sos', path: '/dashboard/sos', label: t('menu.sos'), icon: AlertTriangle },
    { id: 'analytics', path: '/dashboard/analytics', label: t('menu.analytics'), icon: BarChart3 },
  ];

  const menuItems = user.role === 'admin' ? adminMenuItems : managerMenuItems;
  const portalText = user.role === 'admin' ? t('portal.admin') : t('portal.manager');

  return (
    <div className={`
      bg-gradient-to-b from-[#1a1610] to-[#2a2216] text-white 
      transition-all duration-300 ease-in-out flex flex-col
      border-r border-[#d4af37]/20
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-[#d4af37]/20">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#8a6d1c] rounded-xl flex items-center justify-center shadow-lg shadow-[#d4af37]/20">
                <Church className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-serif font-semibold tracking-tight text-[#d4af37]">Pilgrimage</h1>
                <p className="text-xs text-[#d4af37]/70">{portalText}</p>
              </div>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-[#d4af37]/10 rounded-lg transition-colors border border-[#d4af37]/20"
          >
            <ChevronLeft className={`w-4 h-4 text-[#d4af37] transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSOSItem = item.id === 'sos';

            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) => `
                    w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left
                    transition-all duration-200 group relative
                    ${isActive
                      ? 'bg-[#d4af37]/10 text-[#d4af37] shadow-lg border border-[#d4af37]/30'
                      : 'text-white/70 hover:text-[#d4af37] hover:bg-[#d4af37]/5'
                    }
                    ${isSOSItem && !isActive ? 'hover:bg-red-500/10' : ''}
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#d4af37] rounded-r-full" />
                      )}

                      <Icon className={`
                        w-5 h-5 flex-shrink-0 relative z-10
                        ${isSOSItem ? 'text-red-400' : ''}
                        ${isActive ? 'text-[#d4af37]' : ''}
                      `} />

                      {!collapsed && (
                        <span className="font-medium relative z-10">{item.label}</span>
                      )}

                      {isSOSItem && !collapsed && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-[#d4af37]/20">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar || 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150'}
            alt={user.name}
            className="w-10 h-10 rounded-xl object-cover border-2 border-[#d4af37]/30"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium truncate text-white">{user.name}</h3>
              <p className="text-xs text-[#d4af37]/70 truncate">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};