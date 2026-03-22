import { useEffect, useState } from 'react';

const PaymentCancelPage = () => {
  const [isMobile, setIsMobile] = useState(false);
  const deepLink = `pilgrimapp://payment/cancel`;

  useEffect(() => {
    const checkIsMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkIsMobile);

    if (checkIsMobile) {
      window.location.href = deepLink;
    }
  }, [deepLink]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ee] to-[#e8e4d9] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-[#4a0e4e]">
          Thanh toán đã bị hủy
        </h2>
        <p className="text-gray-600 mt-2">
          Giao dịch của bạn chưa được hoàn tất.
        </p>
        {isMobile && (
          <a 
            href={deepLink} 
            className="mt-6 inline-block bg-[#4a0e4e] text-white px-6 py-3 rounded-xl hover:bg-[#6b1a6b] transition-colors"
          >
            Quay lại ứng dụng
          </a>
        )}
      </div>
    </div>
  );
};

export default PaymentCancelPage;
