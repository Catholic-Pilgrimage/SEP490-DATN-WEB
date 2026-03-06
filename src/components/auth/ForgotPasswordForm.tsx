import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Mail, Lock, ArrowLeft, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';
import { AuthService } from '../../services/auth.service';
import { useToast } from '../../contexts/ToastContext';

interface ForgotPasswordFormProps {
  onBack: () => void;
  language: 'vi' | 'en';
}

type Step = 'email' | 'otp' | 'reset';

const texts = {
  vi: {
    title: {
      email: 'Quên Mật Khẩu',
      otp: 'Xác Minh OTP',
      reset: 'Đặt Mật Khẩu Mới',
    },
    subtitle: {
      email: 'Nhập email của bạn để nhận mã OTP.',
      otp: 'Nhập mã OTP đã được gửi đến email của bạn.',
      reset: 'Nhập mật khẩu mới cho tài khoản của bạn.',
    },
    emailLabel: 'Email',
    emailPlaceholder: 'admin@pilgrimage.vn',
    otpLabel: 'Mã OTP',
    otpPlaceholder: 'Nhập mã 6 số',
    newPasswordLabel: 'Mật khẩu mới',
    newPasswordPlaceholder: '••••••••',
    confirmPasswordLabel: 'Xác nhận mật khẩu',
    confirmPasswordPlaceholder: '••••••••',
    sendOtp: 'Gửi Mã OTP',
    sendingOtp: 'Đang gửi...',
    verifyOtp: 'Xác Minh',
    verifyingOtp: 'Đang xác minh...',
    resetPassword: 'Đặt Lại Mật Khẩu',
    resettingPassword: 'Đang đặt lại...',
    backToLogin: 'Quay lại Đăng nhập',
    resendOtp: 'Gửi lại mã',
    resendIn: 'Gửi lại sau',
    seconds: 'giây',
    successTitle: 'Đặt Lại Mật Khẩu Thành Công!',
    successMessage: 'Mật khẩu của bạn đã được đặt lại. Bạn có thể đăng nhập với mật khẩu mới.',
    goToLogin: 'Đăng Nhập Ngay',
    passwordMismatch: 'Mật khẩu xác nhận không khớp.',
    passwordTooShort: 'Mật khẩu phải có ít nhất 6 ký tự.',
    step: 'Bước',
    of: 'của',
  },
  en: {
    title: {
      email: 'Forgot Password',
      otp: 'Verify OTP',
      reset: 'Set New Password',
    },
    subtitle: {
      email: 'Enter your email to receive an OTP code.',
      otp: 'Enter the OTP code sent to your email.',
      reset: 'Enter a new password for your account.',
    },
    emailLabel: 'Email',
    emailPlaceholder: 'admin@pilgrimage.vn',
    otpLabel: 'OTP Code',
    otpPlaceholder: 'Enter 6-digit code',
    newPasswordLabel: 'New Password',
    newPasswordPlaceholder: '••••••••',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: '••••••••',
    sendOtp: 'Send OTP',
    sendingOtp: 'Sending...',
    verifyOtp: 'Verify',
    verifyingOtp: 'Verifying...',
    resetPassword: 'Reset Password',
    resettingPassword: 'Resetting...',
    backToLogin: 'Back to Login',
    resendOtp: 'Resend code',
    resendIn: 'Resend in',
    seconds: 's',
    successTitle: 'Password Reset Successful!',
    successMessage: 'Your password has been reset. You can now log in with your new password.',
    goToLogin: 'Go to Login',
    passwordMismatch: 'Passwords do not match.',
    passwordTooShort: 'Password must be at least 6 characters.',
    step: 'Step',
    of: 'of',
  },
};

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack, language }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showToast } = useToast();

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const t = texts[language];

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const triggerError = (title: string, message?: string) => {
    showToast('error', title, message);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const extractErrorMessage = (err: unknown): string => {
    const error = err as Record<string, unknown>;
    const nested = error?.error as Record<string, unknown> | undefined;
    const details = nested?.details;

    if (Array.isArray(details) && details.length > 0) {
      const messages = details
        .map((d: unknown) => {
          const detail = d as Record<string, unknown>;
          return typeof detail?.message === 'string' ? detail.message : null;
        })
        .filter(Boolean);
      if (messages.length > 0) return messages.join('. ');
    }

    if (typeof nested?.message === 'string') return nested.message;
    if (typeof error?.message === 'string' && error.message !== '') return error.message;
    return language === 'vi' ? 'Đã xảy ra lỗi không xác định.' : 'An unknown error occurred.';
  };

  const otpString = otp.join('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await AuthService.forgotPassword({ email });
      if (response.success) {
        setStep('otp');
        setCountdown(60);
      } else {
        triggerError(
          language === 'vi' ? 'Gửi OTP thất bại' : 'Failed to Send OTP',
          response.error?.message || (language === 'vi' ? 'Không thể gửi mã OTP đến email của bạn.' : 'Could not send OTP to your email.')
        );
      }
    } catch (err: unknown) {
      triggerError(
        language === 'vi' ? 'Gửi OTP thất bại' : 'Failed to Send OTP',
        extractErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);

    try {
      const response = await AuthService.forgotPassword({ email });
      if (response.success) {
        setCountdown(60);
        setOtp(['', '', '', '', '', '']);
        showToast('success', language === 'vi' ? 'Đã gửi lại mã OTP' : 'OTP Resent', language === 'vi' ? 'Vui lòng kiểm tra email của bạn.' : 'Please check your email.');
      } else {
        triggerError(
          language === 'vi' ? 'Gửi lại OTP thất bại' : 'Resend OTP Failed',
          response.error?.message || (language === 'vi' ? 'Không thể gửi lại mã OTP.' : 'Could not resend OTP.')
        );
      }
    } catch (err: unknown) {
      triggerError(
        language === 'vi' ? 'Gửi lại OTP thất bại' : 'Resend OTP Failed',
        extractErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await AuthService.verifyOtp({ email, otp: otpString });
      if (response.success) {
        setStep('reset');
      } else {
        triggerError(
          language === 'vi' ? 'Xác minh thất bại' : 'Verification Failed',
          response.error?.message || (language === 'vi' ? 'Mã OTP không hợp lệ hoặc đã hết hạn.' : 'Invalid or expired OTP code.')
        );
      }
    } catch (err: unknown) {
      triggerError(
        language === 'vi' ? 'Xác minh thất bại' : 'Verification Failed',
        extractErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      triggerError(
        language === 'vi' ? 'Mật khẩu không hợp lệ' : 'Invalid Password',
        t.passwordTooShort
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerError(
        language === 'vi' ? 'Mật khẩu không khớp' : 'Password Mismatch',
        t.passwordMismatch
      );
      return;
    }

    setLoading(true);

    try {
      const response = await AuthService.resetPassword({
        email,
        otp: otpString,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      if (response.success) {
        setSuccess(true);
      } else {
        triggerError(
          language === 'vi' ? 'Đặt lại mật khẩu thất bại' : 'Reset Password Failed',
          response.error?.message || (language === 'vi' ? 'Không thể đặt lại mật khẩu.' : 'Could not reset password.')
        );
      }
    } catch (err: unknown) {
      triggerError(
        language === 'vi' ? 'Đặt lại mật khẩu thất bại' : 'Reset Password Failed',
        extractErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtp(newOtp);
    const focusIndex = Math.min(pasted.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  const stepNumber = step === 'email' ? 1 : step === 'otp' ? 2 : 3;

  if (success) {
    return (
      <div className="w-full max-w-[440px] space-y-8 relative z-10 animate-fadeIn">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-[#d4af37] text-3xl font-serif font-bold tracking-tight">
            {t.successTitle}
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            {t.successMessage}
          </p>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-black hover:brightness-110 h-12 w-full shadow-lg shadow-[#d4af37]/10 tracking-widest uppercase border border-[#d4af37]/50"
        >
          {t.goToLogin}
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-[440px] space-y-8 relative z-10 ${shake ? 'animate-shake' : ''}`}>
      {/* Header */}
      <div className="text-center lg:text-left animate-fadeIn">
        <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
          <img src="/logo.png" alt="Logo" className="w-14 h-14 rounded-lg object-cover shadow-lg shadow-[#d4af37]/20" />
          <span className="text-white font-serif font-bold text-2xl tracking-wide">Pilgrimage Guide</span>
        </div>
        <h1 className="text-[#d4af37] text-4xl font-serif font-bold tracking-tight mb-2">
          {t.title[step]}
        </h1>
        <p className="text-gray-400 text-sm">{t.subtitle[step]}</p>

        {/* Step Indicator */}
        <div className="flex items-center gap-3 mt-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                s < stepNumber
                  ? 'bg-green-500/20 border-2 border-green-500/50 text-green-400'
                  : s === stepNumber
                    ? 'bg-[#d4af37]/20 border-2 border-[#d4af37] text-[#d4af37]'
                    : 'bg-white/5 border-2 border-white/10 text-gray-500'
              }`}>
                {s < stepNumber ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 transition-all duration-300 ${
                  s < stepNumber ? 'bg-green-500/50' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
          <span className="text-xs text-gray-500 ml-2">
            {t.step} {stepNumber} {t.of} 3
          </span>
        </div>
      </div>

      {/* Step 1: Email */}
      {step === 'email' && (
        <form onSubmit={handleSendOtp} className="space-y-6 animate-slideIn">
          <div className="space-y-2 group">
            <label className="text-[#d4af37]/90 text-xs font-medium tracking-wide uppercase" htmlFor="forgot-email">
              {t.emailLabel}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]/50 transition-colors group-focus-within:text-[#d4af37]" />
              <input
                id="forgot-email"
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

          <button
            type="submit"
            disabled={loading}
            className="relative overflow-hidden inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-black hover:brightness-110 h-12 w-full shadow-lg shadow-[#d4af37]/10 tracking-widest uppercase border border-[#d4af37]/50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.sendingOtp}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <KeyRound className="w-5 h-5" />
                {t.sendOtp}
              </span>
            )}
          </button>
        </form>
      )}

      {/* Step 2: OTP */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-6 animate-slideIn">
          <div className="space-y-2">
            <label className="text-[#d4af37]/90 text-xs font-medium tracking-wide uppercase">
              {t.otpLabel}
            </label>
            <p className="text-xs text-gray-500 mb-3">
              {language === 'vi' ? `Đã gửi đến ${email}` : `Sent to ${email}`}
            </p>
            <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-[#d4af37]/30 bg-black/30 text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-inner hover:border-[#d4af37]/50"
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          <div className="text-center">
            {countdown > 0 ? (
              <span className="text-xs text-gray-500">
                {t.resendIn} {countdown}{t.seconds}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-xs text-[#d4af37] hover:text-white transition-colors underline decoration-[#d4af37]/30 hover:decoration-[#d4af37] disabled:opacity-50"
              >
                {t.resendOtp}
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || otpString.length !== 6}
            className="relative overflow-hidden inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-black hover:brightness-110 h-12 w-full shadow-lg shadow-[#d4af37]/10 tracking-widest uppercase border border-[#d4af37]/50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.verifyingOtp}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                {t.verifyOtp}
              </span>
            )}
          </button>
        </form>
      )}

      {/* Step 3: Reset Password */}
      {step === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-6 animate-slideIn">
          <div className="space-y-2 group">
            <label className="text-[#d4af37]/90 text-xs font-medium tracking-wide uppercase" htmlFor="new-password">
              {t.newPasswordLabel}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]/50 transition-colors group-focus-within:text-[#d4af37]" />
              <input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex h-12 w-full rounded-lg border border-[#d4af37]/30 bg-black/30 px-3 py-2 pl-10 pr-12 text-sm placeholder:text-gray-500 text-white focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-inner hover:border-[#d4af37]/50"
                placeholder={t.newPasswordPlaceholder}
                required
                disabled={loading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d4af37]/50 hover:text-[#d4af37] focus:outline-none transition-colors"
              >
                {showNewPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-[#d4af37]/90 text-xs font-medium tracking-wide uppercase" htmlFor="confirm-password">
              {t.confirmPasswordLabel}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]/50 transition-colors group-focus-within:text-[#d4af37]" />
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex h-12 w-full rounded-lg border border-[#d4af37]/30 bg-black/30 px-3 py-2 pl-10 pr-12 text-sm placeholder:text-gray-500 text-white focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-inner hover:border-[#d4af37]/50"
                placeholder={t.confirmPasswordPlaceholder}
                required
                disabled={loading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d4af37]/50 hover:text-[#d4af37] focus:outline-none transition-colors"
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative overflow-hidden inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] text-black hover:brightness-110 h-12 w-full shadow-lg shadow-[#d4af37]/10 tracking-widest uppercase border border-[#d4af37]/50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.resettingPassword}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                {t.resetPassword}
              </span>
            )}
          </button>
        </form>
      )}

      {/* Back to Login */}
      <div className="text-center animate-slideIn">
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-[#d4af37] transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.backToLogin}
        </button>
      </div>
    </div>
  );
};
