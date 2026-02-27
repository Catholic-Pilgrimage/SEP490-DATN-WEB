import React, { useState } from 'react';
import { AlertCircle, Loader2, Eye, EyeOff, Mail, Lock, LogIn, Church, Check } from 'lucide-react';
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
  const [rememberMe, setRememberMe] = useState(false);
  const [shake, setShake] = useState(false);
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginResponse = await AuthService.login({ email, password });

      if (loginResponse.success && loginResponse.data) {
        const profileResponse = await AuthService.getProfile();

        if (profileResponse.success && profileResponse.data) {
          if (['local_guide', 'pilgrim'].includes(profileResponse.data.role)) {
            await AuthService.logout();
            triggerError(language === 'vi' ? 'Bạn không có quyền truy cập vào hệ thống này.' : 'You do not have permission to access this system.');
          } else {
            onLogin(profileResponse.data);
          }
        } else {
          triggerError(language === 'vi' ? 'Không thể lấy thông tin người dùng' : 'Unable to get user information');
        }
      } else {
        triggerError(loginResponse.error?.message || (language === 'vi' ? 'Đăng nhập thất bại' : 'Login failed'));
      }
    } catch (err: any) {
      console.error('Login error:', err);

      if (err.status === 401) {
        triggerError(language === 'vi' ? 'Email hoặc mật khẩu không đúng' : 'Invalid email or password');
      } else if (err.status === 403) {
        triggerError(language === 'vi' ? 'Tài khoản của bạn đã bị khóa' : 'Your account has been locked');
      } else if (err.status === 500) {
        triggerError(language === 'vi' ? 'Lỗi server. Vui lòng thử lại sau.' : 'Server error. Please try again later.');
      } else if (err.error?.message) {
        triggerError(err.error.message);
      } else {
        triggerError(language === 'vi' ? 'Không thể kết nối đến server.' : 'Cannot connect to server.');
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

  const texts = {
    vi: {
      welcome: 'Chào Mừng Trở Lại',
      subtitle: 'Đăng nhập để truy cập hệ thống quản trị.',
      emailLabel: 'Email hoặc Tên đăng nhập',
      emailPlaceholder: 'admin@pilgrimage.vn',
      passwordLabel: 'Mật khẩu',
      passwordPlaceholder: '••••••••',
      rememberMe: 'Ghi nhớ đăng nhập',
      forgotPassword: 'Quên mật khẩu?',
      signIn: 'Đăng Nhập',
      signingIn: 'Đang đăng nhập...',
      quote: '"Ta đã chọn và thánh hiến đền thờ này để danh Ta ở đó mãi mãi."',
      quoteSource: '— 2 Sử Ký 7:16',
      copyright: '© 2026 Catholic Pilgrimage Guide. Bản quyền được bảo lưu.',
      privacy: 'Chính sách bảo mật',
      terms: 'Điều khoản sử dụng',
    },
    en: {
      welcome: 'Welcome Back',
      subtitle: 'Enter your credentials to access the admin sanctuary.',
      emailLabel: 'Email or Username',
      emailPlaceholder: 'admin@pilgrimage.vn',
      passwordLabel: 'Password',
      passwordPlaceholder: '••••••••',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      signIn: 'Sign In',
      signingIn: 'Signing in...',
      quote: '"I have chosen and consecrated this temple so that my Name may be there forever."',
      quoteSource: '— 2 Chronicles 7:16',
      copyright: '© 2026 Catholic Pilgrimage Guide. All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
    }
  };

  const t = texts[language];

  return (
    <div className="min-h-screen flex w-full bg-[#1a1610]">
      {/* Left Panel - Image & Quote */}
      <div className="hidden lg:flex w-1/2 relative border-r border-[#aa8c30]/30">
        {/* Background Image */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1548625149-fc4a29cf7092?q=80&w=1920&auto=format&fit=crop')`
          }}
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1610]/95 via-[#1a1610]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Quote & Branding */}
        <div className="absolute bottom-0 left-0 p-16 w-full text-white z-10">
          <blockquote className="border-l-4 border-[#d4af37] pl-6 mb-6">
            <p className="text-xl font-serif italic opacity-90 leading-relaxed text-[#fdf5e6]" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {t.quote}
            </p>
            <footer className="text-sm mt-2 text-[#d4af37] font-medium">{t.quoteSource}</footer>
          </blockquote>
          <h2 className="text-4xl font-serif font-bold tracking-tight text-white mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            Catholic Pilgrimage Guide
          </h2>
          <div className="flex items-center gap-2 text-[#d4af37]/80">
            <Check className="w-4 h-4" />
            <p className="text-sm font-medium tracking-wide uppercase">Web Administration Portal v2.4</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div
        className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1507692812060-98338d07aca3?q=80&w=1920&auto=format&fit=crop')`
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-[#2a2216]/95 backdrop-blur-[2px]" />

        {/* Language Switcher */}
        <div className="absolute top-8 right-8 z-20">
          <div className="flex h-10 items-center justify-center rounded-lg bg-black/20 p-1 border border-[#d4af37]/20 backdrop-blur-sm">
            <button
              onClick={() => setLanguage('vi')}
              className={`flex h-full items-center justify-center rounded-md px-3 text-xs font-medium transition-all duration-300 ${language === 'vi'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'text-[#d4af37]/70 hover:text-[#d4af37]'
                }`}
            >
              Tiếng Việt
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`flex h-full items-center justify-center rounded-md px-3 text-xs font-medium transition-all duration-300 ${language === 'en'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'text-[#d4af37]/70 hover:text-[#d4af37]'
                }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className={`w-full max-w-[440px] space-y-8 relative z-10 ${shake ? 'animate-shake' : ''}`}>
          {/* Header */}
          <div className="text-center lg:text-left animate-fadeIn">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
              <div className="bg-gradient-to-br from-[#d4af37] to-[#8a6d1c] p-3 rounded-lg shadow-lg shadow-[#d4af37]/20">
                <Church className="w-8 h-8 text-white" />
              </div>
              <span className="text-white font-serif font-bold text-2xl tracking-wide">Pilgrimage Guide</span>
            </div>
            <h1 className="text-[#d4af37] text-4xl font-serif font-bold tracking-tight mb-2">
              {t.welcome}
            </h1>
            <p className="text-gray-400 text-sm">{t.subtitle}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3 animate-slideIn">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2 group animate-slideIn" style={{ animationDelay: '0.1s' }}>
              <label className="text-[#d4af37]/90 text-xs font-medium tracking-wide uppercase" htmlFor="email">
                {t.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]/50 transition-colors group-focus-within:text-[#d4af37]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex h-12 w-full rounded-lg border border-[#d4af37]/30 bg-black/30 px-3 py-2 pl-10 text-sm placeholder:text-gray-500 text-white focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-inner hover:border-[#d4af37]/50"
                  placeholder={t.emailPlaceholder}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2 group animate-slideIn" style={{ animationDelay: '0.2s' }}>
              <label className="text-[#d4af37]/90 text-xs font-medium tracking-wide uppercase" htmlFor="password">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]/50 transition-colors group-focus-within:text-[#d4af37]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-12 w-full rounded-lg border border-[#d4af37]/30 bg-black/30 px-3 py-2 pl-10 pr-12 text-sm placeholder:text-gray-500 text-white focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-inner hover:border-[#d4af37]/50"
                  placeholder={t.passwordPlaceholder}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d4af37]/50 hover:text-[#d4af37] focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between animate-slideIn" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#d4af37]/40 text-[#d4af37] bg-black/30 focus:ring-[#d4af37] focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="remember" className="text-sm font-medium leading-none text-gray-400 hover:text-[#d4af37] transition-colors cursor-pointer select-none">
                  {t.rememberMe}
                </label>
              </div>
              <button type="button" className="text-sm font-semibold text-[#d4af37] hover:text-white transition-colors underline decoration-[#d4af37]/30 hover:decoration-[#d4af37]">
                {t.forgotPassword}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative overflow-hidden inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-black hover:brightness-110 h-12 w-full shadow-lg shadow-[#d4af37]/10 tracking-widest uppercase border border-[#d4af37]/50 animate-slideIn"
              style={{ animationDelay: '0.4s' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.signingIn}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {t.signIn}
                  <LogIn className="w-5 h-5" />
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="pt-8 text-center border-t border-[#d4af37]/10 mt-8 animate-slideIn" style={{ animationDelay: '0.5s' }}>
            <p className="text-xs text-gray-500 font-serif italic">
              {t.copyright}
              <br className="hidden sm:inline" />
              <span className="not-italic font-sans mt-2 inline-block">
                <button className="hover:text-[#d4af37] transition-colors">{t.privacy}</button>
                {' · '}
                <button className="hover:text-[#d4af37] transition-colors">{t.terms}</button>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};