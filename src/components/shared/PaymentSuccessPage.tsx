import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentSuccessPage = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [searchParams] = useSearchParams();
  
  const orderCode = searchParams.get('orderCode');
  const status = searchParams.get('status');
  
  const deepLink = orderCode 
    ? `pilgrimapp://payment/success?orderCode=${orderCode}&status=${status || 'PAID'}`
    : `pilgrimapp://payment/success`;

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
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-[#4a0e4e]">
          Thanh toán thành công!
        </h2>
        <p className="text-gray-600 mt-2">
          Hãy quay lại ứng dụng để tiếp tục.
        </p>
        {orderCode && (
          <p className="text-sm text-gray-500 mt-4">
            Mã đơn hàng: {orderCode}
          </p>
        )}
        {isMobile && (
          <a 
            href={deepLink} 
            className="mt-6 inline-block bg-[#4a0e4e] text-white px-6 py-3 rounded-xl hover:bg-[#6b1a6b] transition-colors"
          >
            Mở ứng dụng
          </a>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
