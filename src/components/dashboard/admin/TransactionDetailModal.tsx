import React, { useEffect, useState } from 'react';
import {
  RefreshCw,
  ArrowUpCircle,
  ArrowDownCircle,
  Lock,
  Unlock,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Clock,
  CreditCard,
  RotateCcw,
  Wallet,
  Landmark,
  Shield,
  X,
  Hash,
  FileText,
  User,
  CalendarDays,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminService } from '../../../services/admin.service';
import { ApiService } from '../../../services/api.service';
import { WalletTransaction, TransactionType, TransactionStatus, TransactionReferenceType, BankInfo } from '../../../types/admin.types';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { extractErrorMessage } from '../../../lib/utils';

interface TransactionDetailModalProps {
  transactionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transactionId,
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [detailData, setDetailData] = useState<WalletTransaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState<BankInfo[]>([]);

  useEffect(() => {
    if (isOpen && transactionId) {
      fetchDetail(transactionId);
    } else {
      setDetailData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, transactionId]);

  // Fetch banks on mount
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await ApiService.getBanks();
        if (response.success && response.data) {
          setBanks(response.data);
        }
      } catch (err) {
        console.error('Error fetching banks:', err);
      }
    };
    fetchBanks();
  }, []);

  const fetchDetail = async (id: string) => {
    setLoading(true);
    try {
      const response = await AdminService.getWalletTransactionById(id);
      if (response.success && response.data) {
        setDetailData(response.data);
      } else {
        showToast('error', t('txn.title'), response.message || 'Lỗi tải chi tiết');
        onClose();
      }
    } catch (err) {
      console.error('Error fetching transaction detail:', err);
      showToast('error', t('txn.title'), extractErrorMessage(err));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // ============ Helper Functions ============

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('vi-VN').format(parseFloat(String(amount))) + ' ₫';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'escrow_lock': return <Lock className="w-4 h-4" />;
      case 'escrow_refund': return <Unlock className="w-4 h-4" />;
      case 'withdraw': return <ArrowUpCircle className="w-4 h-4" />;
      case 'deposit': case 'topup': return <ArrowDownCircle className="w-4 h-4" />;
      case 'penalty_applied': return <AlertTriangle className="w-4 h-4" />;
      case 'penalty_received': return <CreditCard className="w-4 h-4" />;
      case 'penalty_refunded': return <RotateCcw className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const getTypeStyle = (type: TransactionType) => {
    switch (type) {
      case 'escrow_lock': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'escrow_refund': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'withdraw': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'deposit': case 'topup': return 'bg-green-100 text-green-700 border-green-200';
      case 'penalty_applied': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'penalty_received': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'penalty_refunded': return 'bg-violet-100 text-violet-700 border-violet-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeLabel = (type: TransactionType) => {
    const labels: Record<string, string> = {
      escrow_lock: t('txn.type.escrowLock'),
      escrow_refund: t('txn.type.escrowRefund'),
      withdraw: t('txn.type.withdraw'),
      deposit: t('txn.type.deposit'),
      topup: t('txn.type.topup'),
      penalty_applied: t('txn.type.penaltyApplied'),
      penalty_received: t('txn.type.penaltyReceived'),
      penalty_refunded: t('txn.type.penaltyRefunded'),
    };
    return labels[type] || type;
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusStyle = (status: TransactionStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled': return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getStatusLabel = (status: TransactionStatus) => {
    const labels: Record<string, string> = {
      completed: t('txn.status.completed'),
      pending: t('txn.status.pending'),
      failed: t('txn.status.failed'),
      cancelled: t('txn.status.cancelled'),
    };
    return labels[status] || status;
  };

  const getRefTypeLabel = (refType: TransactionReferenceType) => {
    const labels: Record<string, string> = {
      planner_deposit: t('txn.refType.plannerDeposit'),
      planner: t('txn.refType.planner'),
      planner_penalty: t('txn.refType.plannerPenalty'),
      payos_payout: t('txn.refType.payosPayout'),
      payos_topup: t('txn.refType.payosTopup'),
      wallet: t('txn.refType.wallet'),
    };
    return labels[refType] || refType;
  };

  const getBankInfo = (bankCode: string) => {
    // Try to match by bin first (e.g., "970423"), then by code (e.g., "VBA")
    return banks.find(b => b.bin === bankCode || b.code === bankCode);
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden border-[#d4af37]/20 rounded-2xl p-0 gap-0 [&>button]:hidden">
        {/* ─── Header ─── */}
        <DialogHeader className="p-5 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 text-left">
              <DialogTitle className="text-lg font-semibold text-slate-900">
                {t('txn.title')}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t('txn.title')}
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* ─── Body ─── */}
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading && (
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="w-8 h-8 animate-spin text-[#d4af37]" />
            </div>
          )}

          {!loading && !detailData && (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
              <p className="text-gray-600 font-medium">Không thể tải chi tiết giao dịch</p>
            </div>
          )}

          {!loading && detailData && (
            <div className="space-y-5">
              {/* ── Amount hero ── */}
              <div className="bg-gradient-to-br from-[#f5f3ee] to-[#ede8db] rounded-2xl p-5 text-center border border-[#d4af37]/15">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#8a6d1c]/70 mb-2">
                  {t('txn.col.amount')}
                </p>
                <p className={`text-3xl font-extrabold tracking-tight ${Number(detailData.amount) < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {formatCurrency(detailData.amount)}
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge
                    variant="outline"
                    className={`gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getTypeStyle(detailData.type)}`}
                  >
                    {getTypeIcon(detailData.type)}
                    {getTypeLabel(detailData.type)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(detailData.status)}`}
                  >
                    {getStatusIcon(detailData.status)}
                    {getStatusLabel(detailData.status)}
                  </Badge>
                </div>
              </div>

              {/* ── Transaction info ── */}
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Thông tin giao dịch</h4>

                {/* Code */}
                <div className="flex items-center gap-3 py-2.5">
                  <div className="p-2 bg-[#f5f3ee] rounded-lg">
                    <Hash className="w-4 h-4 text-[#8a6d1c]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500">{t('txn.col.code')}</p>
                    <p className="text-sm font-mono font-semibold text-slate-800">{detailData.code}</p>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Description */}
                <div className="flex items-start gap-3 py-2.5">
                  <div className="p-2 bg-[#f5f3ee] rounded-lg mt-0.5">
                    <FileText className="w-4 h-4 text-[#8a6d1c]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500">{t('txn.col.description')}</p>
                    <p className="text-sm font-medium text-slate-800 break-words leading-relaxed">
                      {detailData.description || '—'}
                    </p>
                  </div>
                </div>

                {/* Reference Type */}
                {detailData.reference_type && (
                  <>
                    <hr className="border-slate-100" />
                    <div className="flex items-center gap-3 py-2.5">
                      <div className="p-2 bg-[#f5f3ee] rounded-lg">
                        <Lock className="w-4 h-4 text-[#8a6d1c]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500">{t('txn.col.refType')}</p>
                        <p className="text-sm font-semibold text-slate-800">{getRefTypeLabel(detailData.reference_type)}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ── User ── */}
              <div className="bg-[#f5f3ee] rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    {detailData.wallet?.user?.avatar_url ? (
                      <img
                        src={detailData.wallet.user.avatar_url}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#d4af37]/30"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#8a6d1c] to-[#d4af37] flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {detailData.wallet?.user?.full_name || t('txn.unknownUser')}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {detailData.wallet?.user?.email || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Bank info ── */}
              {detailData.bank_info && (
                <div className="bg-gradient-to-br from-[#f5f3ee] via-white to-[#f5f3ee] rounded-xl p-4 border border-[#d4af37]/20">
                  <div className="flex items-center gap-2 text-[#8a6d1c] mb-3">
                    <Landmark className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Thông tin ngân hàng</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    {getBankInfo(detailData.bank_info.bank_code)?.logo && (
                      <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 flex items-center justify-center p-2.5 shrink-0 shadow-md hover:shadow-lg transition-shadow">
                        <img 
                          src={getBankInfo(detailData.bank_info.bank_code)?.logo} 
                          alt={detailData.bank_info.bank_code}
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-transparent to-slate-100/20 pointer-events-none" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-slate-900 mb-0.5">
                        {getBankInfo(detailData.bank_info.bank_code)?.name || detailData.bank_info.bank_code}
                      </p>
                      <p className="text-xs text-[#8a6d1c] font-medium">
                        {getBankInfo(detailData.bank_info.bank_code)?.short_name}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 bg-white/60 rounded-lg p-3 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Số tài khoản</span>
                      <span className="text-sm text-slate-900 font-bold font-mono">{detailData.bank_info.account_number}</span>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Chủ tài khoản</span>
                      <span className="text-sm text-slate-900 font-semibold">{detailData.bank_info.account_name}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Wallet summary ── */}
              {detailData.wallet && (
                <div className="bg-[#f5f3ee] rounded-xl p-4">
                  <div className="flex items-center gap-2 text-[#8a6d1c] mb-3">
                    <Wallet className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Ví người dùng</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-white rounded-lg p-2.5 border border-[#d4af37]/10">
                      <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Số dư</p>
                      <p className="text-xs font-bold text-slate-800">{formatCurrency(detailData.wallet.balance)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 border border-[#d4af37]/10">
                      <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Đang giữ</p>
                      <p className="text-xs font-bold text-amber-600">{formatCurrency(detailData.wallet.locked_balance)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 border border-[#d4af37]/10">
                      <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Trạng thái</p>
                      <Badge
                        variant="outline"
                        className={`gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                          detailData.wallet.status === 'active'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-red-100 text-red-700 border-red-200'
                        }`}
                      >
                        <Shield className="w-2.5 h-2.5" />
                        {detailData.wallet.status === 'active' ? 'Hoạt động' : 'Khóa'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Timestamps ── */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f5f3ee] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-[#8a6d1c] mb-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{t('txn.col.date')}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{formatDate(detailData.created_at)}</p>
                </div>
                <div className="bg-[#f5f3ee] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-[#8a6d1c] mb-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{t('userDetail.updated') || 'Cập nhật'}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{formatDate(detailData.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Footer ─── */}
        {!loading && detailData && (
          <div className="p-4 border-t border-slate-200 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Đóng
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
