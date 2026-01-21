import React, { useState } from 'react';
import { ChevronRight, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../types/auth.types';

interface LoginFormProps {
  onLogin: (profile: UserProfile) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginResponse = await AuthService.login({ email, password });

      if (loginResponse.success && loginResponse.data) {
        // Fetch user profile after successful login
        const profileResponse = await AuthService.getProfile();

        if (profileResponse.success && profileResponse.data) {
          onLogin(profileResponse.data);
        } else {
          triggerError('Không thể lấy thông tin người dùng');
        }
      } else {
        triggerError(loginResponse.error?.message || 'Đăng nhập thất bại');
      }
    } catch (err: any) {
      console.error('Login error:', err);

      if (err.status === 401) {
        triggerError('Email hoặc mật khẩu không đúng');
      } else if (err.status === 403) {
        triggerError('Tài khoản của bạn đã bị khóa');
      } else if (err.status === 500) {
        triggerError('Lỗi server. Vui lòng thử lại sau.');
      } else if (err.error?.message) {
        triggerError(err.error.message);
      } else {
        triggerError('Không thể kết nối đến server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerError = (message: string) => {
    setError(message);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const fillDemoCredentials = () => {
    setEmail('admin@gmail.com');
    setPassword('Admin@123');
    setError('');
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Login Card */}
      <div className={`max-w-md w-full animate-fadeIn ${shake ? 'animate-shake' : ''}`}>
        <div className="glass rounded-3xl p-8 shadow-2xl">
          {/* Logo & Title */}
          <div className="text-center mb-8 animate-slideIn">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-6 shadow-lg animate-pulse-glow">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v20M5 8h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              Pilgrimage Guide
            </h1>
            <p className="text-slate-400">Dashboard Portal</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 mb-6 animate-slideIn">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="relative animate-slideIn" style={{ animationDelay: '0.1s' }}>
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 input-glow transition-all duration-300"
                placeholder="Email Address"
                required
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div className="relative animate-slideIn" style={{ animationDelay: '0.2s' }}>
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 input-glow transition-all duration-300"
                placeholder="Password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 btn-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed animate-slideIn"
              style={{ animationDelay: '0.3s' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-slate-500 text-sm">hoặc</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Demo Login */}
          <button
            type="button"
            onClick={fillDemoCredentials}
            disabled={loading}
            className="w-full py-3 border border-white/10 rounded-xl text-slate-300 hover:bg-white/5 hover:border-amber-500/30 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 animate-slideIn"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-medium text-white">Demo Admin</div>
              <div className="text-xs text-slate-500">admin@gmail.com</div>
            </div>
          </button>

          {/* Footer */}
          <p className="text-center text-slate-500 text-sm mt-6 animate-slideIn" style={{ animationDelay: '0.5s' }}>
            © 2026 Pilgrimage Guide. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};