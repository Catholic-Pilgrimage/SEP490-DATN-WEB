import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/auth/LoginForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { AuthService } from './services/auth.service';
import { STORAGE_KEYS } from './config/api';
import { UserProfile } from './types/auth.types';

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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;