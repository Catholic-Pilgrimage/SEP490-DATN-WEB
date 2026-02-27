import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '../../../App';
import { useLanguage } from '../../../contexts/LanguageContext';
import { NotificationPanel } from '../shared/NotificationPanel';

interface TopBarProps {
  user: User;
  onLogout: () => void;
  sidebarCollapsed: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  onLogout,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract current view from URL path
  const pathParts = location.pathname.split('/');
  const activeView = pathParts[pathParts.length - 1] || 'dashboard';

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: t('menu.dashboard'),
      sites: t('menu.sites'),
      mysite: t('menu.mysite'),
      users: t('menu.users'),
      verifications: t('menu.verifications'),
      sos: t('menu.sos'),
      guides: t('menu.guides'),
      content: t('menu.content'),
      analytics: t('menu.analytics'),
      profile: t('menu.profile'),
      settings: t('menu.settings'),
      shifts: t('menu.shifts')
    };
    return titles[activeView] || t('menu.dashboard');
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [t('nav.dashboard')];
    if (activeView !== 'dashboard') {
      breadcrumbs.push(getPageTitle());
    }
    return breadcrumbs;
  };

  return (
    <header className="bg-white border-b border-[#d4af37]/20 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side - Breadcrumbs */}
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-2 text-sm">
            {getBreadcrumbs().map((crumb, index) => (
              <React.Fragment key={crumb}>
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-[#8a6d1c]/50" />
                )}
                <span className={
                  index === getBreadcrumbs().length - 1
                    ? 'font-semibold text-[#8a6d1c]'
                    : 'text-gray-500 hover:text-[#8a6d1c] cursor-pointer'
                }>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right side - Language, Search, Notifications, User */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex h-9 items-center justify-center rounded-lg bg-[#f5f3ee] p-1 border border-[#d4af37]/20">
            <button
              onClick={() => setLanguage('vi')}
              className={`flex h-full items-center justify-center rounded-md px-3 text-xs font-medium transition-all duration-300 ${language === 'vi'
                ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white shadow-sm'
                : 'text-[#8a6d1c] hover:bg-[#d4af37]/10'
                }`}
            >
              VI
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`flex h-full items-center justify-center rounded-md px-3 text-xs font-medium transition-all duration-300 ${language === 'en'
                ? 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37] text-white shadow-sm'
                : 'text-[#8a6d1c] hover:bg-[#d4af37]/10'
                }`}
            >
              EN
            </button>
          </div>

          {/* Notifications */}
          <NotificationPanel />

          {/* User Menu */}
          <div className="relative group">
            <button className="flex items-center gap-3 p-2 hover:bg-[#d4af37]/10 rounded-lg transition-colors border border-[#d4af37]/20">
              <img
                src={user.avatar || 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150'}
                alt={user.name}
                className="w-8 h-8 rounded-lg object-cover border border-[#d4af37]/30"
              />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-800">{user.name}</div>
                <div className="text-xs text-[#8a6d1c] capitalize">{user.role}</div>
              </div>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#d4af37]/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2">
                <button
                  onClick={() => navigate('/dashboard/profile')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#d4af37]/10 hover:text-[#8a6d1c] rounded-lg transition-colors"
                >
                  {t('common.profile')}
                </button>
                <button
                  onClick={() => navigate('/dashboard/settings')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#d4af37]/10 hover:text-[#8a6d1c] rounded-lg transition-colors"
                >
                  {t('common.settings')}
                </button>
                <hr className="my-2 border-[#d4af37]/20" />
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  {t('common.signOut')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};