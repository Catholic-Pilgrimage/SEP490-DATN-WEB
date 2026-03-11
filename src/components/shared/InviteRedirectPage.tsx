import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const InviteRedirectPage = () => {
  const { token } = useParams<{ token: string }>();
  const [isMobile, setIsMobile] = useState(false);
  
  const deepLink = `pilgrimapp://planners/invite/${token}`;

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
        <img 
          src="/logo.png" 
          alt="Catholic Pilgrimage Logo" 
          className="w-24 h-24 mx-auto mb-6 object-contain"
        />

        {isMobile ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#4a0e4e] border-t-transparent mx-auto"></div>
            <h2 className="text-2xl font-bold text-[#4a0e4e]">
              Đang chuyển hướng...
            </h2>
            <p className="text-gray-600">
              Đang mở ứng dụng Catholic Pilgrimage
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#4a0e4e]">
              Tính năng này chỉ hỗ trợ trên điện thoại!
            </h2>
            
            <p className="text-gray-700">
              Vui lòng dùng điện thoại quét mã QR bên dưới để xem lời mời:
            </p>

            <div className="bg-white p-6 rounded-xl shadow-lg inline-block mx-auto border-4 border-[#d4af37]">
              <QRCodeSVG 
                value={deepLink} 
                size={250} 
                level="H"
              />
            </div>

            <div className="text-sm text-gray-500 mt-6 pt-6 border-t border-gray-200">
              <p>Vui lòng mở link này trên điện thoại của bạn</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteRedirectPage;
