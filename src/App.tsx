import { useState, useEffect, useCallback } from 'react';
import { LoginForm } from './components/auth/LoginForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { AuthService } from './services/auth.service';
import { STORAGE_KEYS } from './config/api';
import { UserProfile } from './types/auth.types';
import { ToastNotification, ToastData } from './components/shared/ToastNotification';

export type UserRole = 'admin' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

// Convert backend profile to frontend User format
const mapProfileToUser = (profile: UserProfile): User => ({
  id: profile.id,
  name: profile.full_name,
  email: profile.email,
  role: profile.role as UserRole,
  avatar: profile.avatar_url || undefined,
  phone: profile.phone || undefined,
});

// Toast message translations (read from localStorage to work outside LanguageProvider)
const getToastTexts = () => {
  const lang = localStorage.getItem('language') || 'vi';
  if (lang === 'en') {
    return {
      loginSuccess: 'Login successful!',
      welcomeBack: 'Welcome back, the system is ready.',
      logoutSuccess: 'Logged out successfully!',
      logoutMessage: 'See you again soon.',
    };
  }
  return {
    loginSuccess: 'Đăng nhập thành công!',
    welcomeBack: 'Chào mừng trở lại, hệ thống đã sẵn sàng.',
    logoutSuccess: 'Đăng xuất thành công!',
    logoutMessage: 'Hẹn gặp lại bạn sớm.',
  };
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((type: ToastData['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = AuthService.getAccessToken();

      if (token) {
        try {
          // Try to get fresh profile from backend
          const response = await AuthService.getProfile();
          if (response.success && response.data) {
            const userData = mapProfileToUser(response.data);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
            setUser(userData);
          } else {
            // Token might be expired, clear storage
            AuthService.logout();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // Try to use cached user data
          const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch {
              AuthService.logout();
            }
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (profile: UserProfile) => {
    const userData = mapProfileToUser(profile);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    setUser(userData);
    const texts = getToastTexts();
    showToast('success', texts.loginSuccess, texts.welcomeBack);
  };

  const handleLogout = async () => {
    const texts = getToastTexts();
    await AuthService.logout();
    setUser(null);
    showToast('success', texts.logoutSuccess, texts.logoutMessage);
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f3ee] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#d4af37] border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginForm onLogin={handleLogin} />
        <ToastNotification toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  return (
    <>
      <Dashboard user={user} onLogout={handleLogout} />
      <ToastNotification toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export default App;