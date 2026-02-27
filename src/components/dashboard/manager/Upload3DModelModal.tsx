import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, AlertCircle, Box } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ManagerService } from '../../../services/manager.service';
import { useToast } from '../../../contexts/ToastContext';

interface Upload3DModelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const Upload3DModelModal: React.FC<Upload3DModelModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const { t } = useLanguage();
    const { showToast } = useToast();

    // State
    const [file, setFile] = useState<File | null>(null);
    const [caption, setCaption] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Xử lý đóng modal: reset state
    const handleClose = () => {
        setFile(null);
        setCaption('');
        setError(null);
        setIsSubmitting(false);
        setIsDragging(false);
        onClose();
    };

    // Hàm dùng chung để validate và set file
    const processFile = (selectedFile: File) => {
        // Kiểm tra định dạng (.glb, .gltf)
        const allowedTypes = ['.glb', '.gltf'];
        const fileName = selectedFile.name.toLowerCase();
        const isValidType = allowedTypes.some(ext => fileName.endsWith(ext));

        if (!isValidType) {
            setError(t('upload3D.errorType') || 'Chỉ hỗ trợ file .glb hoặc .gltf');
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
            return;
        }

        // Kiểm tra dung lượng (max 100MB)
        const maxSize = 100 * 1024 * 1024; // 100MB in bytes
        if (selectedFile.size > maxSize) {
            setError(t('upload3D.errorSize') || 'Dung lượng file tối đa là 100MB');
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
            return;
        }

        setError(null);
        setFile(selectedFile);
    };

    // Xử lý chọn file
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    // Xử lý kéo thả (Drag & Drop)
    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    // Xử lý gửi form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setError(t('upload3D.requireFile') || 'Vui lòng chọn file 3D Model');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const response = await ManagerService.upload3DModel({
                file,
                caption: caption.trim() || undefined
            });

            if (response.success) {
                showToast('success', t('upload3D.success') || 'Tải lên 3D Model thành công');
                onSuccess();
                handleClose();
            } else {
                setError(response.message || t('common.error'));
            }
        } catch (err: any) {
            setError(err?.error?.message || t('common.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Định dạng kích thước file
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={!isSubmitting ? handleClose : undefined}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#f5f3ee] text-[#d4af37] flex items-center justify-center">
                            <Box className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {t('upload3D.title') || 'Tải lên 3D Model'}
                            </h2>
                            <p className="text-sm text-slate-500">
                                {t('upload3D.subtitle') || 'Hỗ trợ định dạng .glb, .gltf (Tối đa 100MB)'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <form id="upload-3d-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* File Upload Area */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                File 3D Model <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".glb,.gltf"
                                className="hidden"
                                id="3d-file-upload"
                            />

                            <label
                                htmlFor="3d-file-upload"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${isDragging
                                    ? 'border-[#8a6d1c] bg-[#f5f3ee]/80'
                                    : file
                                        ? 'border-[#d4af37] bg-[#f5f3ee]/50'
                                        : 'border-slate-300 hover:border-[#d4af37]/50 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {file ? (
                                        <>
                                            <Box className="w-10 h-10 text-[#d4af37] mb-3" />
                                            <p className="text-sm font-medium text-slate-700 truncate max-w-[200px] mb-1">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-10 h-10 text-slate-400 mb-3" />
                                            <p className="text-sm text-slate-500 mb-1">
                                                <span className="font-medium text-[#d4af37]">Nhấn để tải lên</span> hoặc kéo thả file
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                .GLB, .GLTF (max 100MB)
                                            </p>
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* Caption */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t('upload3D.caption') || 'Mô tả'} ({t('upload3D.optional') || 'tùy chọn'})
                            </label>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all"
                                placeholder={t('upload3D.captionPlaceholder') || 'Nhập mô tả cho 3D Model...'}
                                disabled={isSubmitting}
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 rounded-b-3xl">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="submit"
                        form="upload-3d-form"
                        disabled={isSubmitting || !file}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#8a6d1c] via-[#d4af37] to-[#8a6d1c] rounded-xl hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:brightness-100 transition-all flex items-center justify-center min-w-[120px]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t('upload3D.uploading') || 'Đang tải lên...'}
                            </>
                        ) : (
                            t('upload3D.upload') || 'Tải lên'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
