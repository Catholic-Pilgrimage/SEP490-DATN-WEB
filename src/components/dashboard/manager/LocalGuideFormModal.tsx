import React, { useState, useEffect } from 'react';
import {
    X,
    Loader2,
    User,
    Mail,
    Phone,
    UserPlus,
    AlertCircle,
    CheckCircle,
    Info
} from 'lucide-react';
import { ManagerService } from '../../../services/manager.service';
import { CreateLocalGuideData } from '../../../types/manager.types';

/**
 * LocalGuideFormModal - Form tạo Local Guide mới
 * 
 * Giải thích các props:
 * - isOpen: boolean - Modal có đang mở không?
 * - onClose: function - Gọi khi đóng modal
 * - onSuccess: function - Gọi khi tạo thành công (để refresh danh sách)
 */
interface LocalGuideFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const LocalGuideFormModal: React.FC<LocalGuideFormModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    // ============ STATE ============
    // Lưu trữ dữ liệu form
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');

    // Trạng thái loading và error
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // ============ EFFECTS ============
    // Reset form khi modal đóng/mở
    useEffect(() => {
        if (isOpen) {
            // Reset tất cả khi mở modal
            setEmail('');
            setFullName('');
            setPhone('');
            setError(null);
            setSuccess(false);
        }
    }, [isOpen]);

    // ============ VALIDATION ============
    /**
     * Kiểm tra email có đúng format không
     * Regex này kiểm tra: có @ và có phần domain sau @
     */
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    /**
     * Validate toàn bộ form trước khi submit
     */
    const validateForm = (): boolean => {
        // Kiểm tra email
        if (!email.trim()) {
            setError('Vui lòng nhập email');
            return false;
        }
        if (!isValidEmail(email.trim())) {
            setError('Email không hợp lệ');
            return false;
        }

        // Kiểm tra họ tên
        if (!fullName.trim()) {
            setError('Vui lòng nhập họ tên');
            return false;
        }
        if (fullName.trim().length < 2) {
            setError('Họ tên phải có ít nhất 2 ký tự');
            return false;
        }

        // Phone là optional, nhưng nếu có thì kiểm tra format
        if (phone.trim() && !/^[0-9]{10,11}$/.test(phone.trim())) {
            setError('Số điện thoại phải có 10-11 chữ số');
            return false;
        }

        return true;
    };

    // ============ SUBMIT ============
    /**
     * Xử lý khi bấm nút "Tạo Local Guide"
     */
    const handleSubmit = async () => {
        // Bước 1: Validate form
        if (!validateForm()) return;

        try {
            // Bước 2: Set loading = true để hiện spinner
            setLoading(true);
            setError(null);

            // Bước 3: Chuẩn bị dữ liệu gửi lên API
            const data: CreateLocalGuideData = {
                email: email.trim(),
                full_name: fullName.trim(),
                // Chỉ gửi phone nếu có giá trị
                ...(phone.trim() && { phone: phone.trim() })
            };

            // Bước 4: Gọi API
            const response = await ManagerService.createLocalGuide(data);

            // Bước 5: Xử lý response
            if (response.success) {
                setSuccess(true);
                // Đợi 1.5 giây để user thấy thông báo thành công
                setTimeout(() => {
                    onSuccess();  // Gọi callback để refresh danh sách
                    onClose();    // Đóng modal
                }, 1500);
            } else {
                setError(response.message || 'Có lỗi xảy ra');
            }
        } catch (err: any) {
            // Bước 6: Xử lý lỗi từ API
            // err?.error?.message là format lỗi từ backend
            const errorMessage = err?.error?.message || err?.message || 'Có lỗi xảy ra';

            // Xử lý các lỗi đặc biệt
            if (errorMessage.includes('đã tồn tại') || err?.error?.statusCode === 409) {
                setError('Email này đã được sử dụng cho tài khoản khác');
            } else if (err?.error?.statusCode === 400) {
                setError('Bạn cần tạo địa điểm trước khi thêm Local Guide');
            } else {
                setError(errorMessage);
            }
        } finally {
            // Bước 7: Tắt loading dù thành công hay thất bại
            setLoading(false);
        }
    };

    // ============ RENDER ============
    // Không render gì nếu modal đang đóng
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto">
            {/* Backdrop - Lớp nền tối phía sau modal */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}  // Click vào nền sẽ đóng modal
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 my-8 overflow-hidden flex-shrink-0">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <div className="text-white">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <UserPlus className="w-5 h-5" />
                            Thêm Local Guide
                        </h2>
                        <p className="text-sm opacity-80">
                            Mật khẩu sẽ được gửi qua email
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Thông báo info */}
                    <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
                        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p>Local Guide sẽ nhận được email với mật khẩu tạm thời để đăng nhập vào hệ thống.</p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Success message */}
                    {success && (
                        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <span>Tạo Local Guide thành công! Đang đóng...</span>
                        </div>
                    )}

                    {/* Form fields */}
                    {!success && (
                        <>
                            {/* Email field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="localguide@email.com"
                                        disabled={loading}
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Mật khẩu sẽ được gửi đến email này
                                </p>
                            </div>

                            {/* Full name field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Nguyễn Văn A"
                                        disabled={loading}
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Phone field (optional) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Số điện thoại <span className="text-slate-400">(tùy chọn)</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="0987654321"
                                        disabled={loading}
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer - Buttons */}
                {!success && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    Tạo Local Guide
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
