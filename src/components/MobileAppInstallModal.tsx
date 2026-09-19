import React, { useState } from "react";
import {
  Smartphone,
  QrCode,
  Copy,
  Check,
  X,
  Share2,
  ExternalLink,
  Download,
  Apple,
  Chrome,
  Sparkles,
} from "lucide-react";

interface MobileAppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppInstallModal: React.FC<MobileAppInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"qr" | "ios" | "android">("qr");

  if (!isOpen) return null;

  // Link hiện tại của ứng dụng
  const appUrl = typeof window !== "undefined" ? window.location.href : "";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    appUrl
  )}&bgcolor=ffffff&color=1e3a8a&margin=1`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Tin Học 12 - Luyện Thi & Quản Lý Điểm",
          text: "Mời bạn tham gia làm bài ôn tập trắc nghiệm Tin học 12 trực tuyến:",
          url: appUrl,
        });
      } catch {
        // User canceled share
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 hover:text-white transition-all"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold tracking-tight">
                  Dùng Trên Điện Thoại (App PWA)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950 uppercase tracking-wider">
                  Miễn phí
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Không cần tải từ App Store / CH Play, cài đặt tức thì chỉ với 1 chạm!
              </p>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-1.5 mt-5 bg-white/10 p-1 rounded-xl backdrop-blur-xs">
            <button
              type="button"
              onClick={() => setActiveTab("qr")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === "qr"
                  ? "bg-white text-blue-800 shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Quét mã QR</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ios")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === "ios"
                  ? "bg-white text-blue-800 shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>iPhone (iOS)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("android")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === "android"
                  ? "bg-white text-blue-800 shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Chrome className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: QR CODE & COPY LINK */}
          {activeTab === "qr" && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-600">
                Mở camera trên điện thoại của học sinh để quét mã QR bên dưới, ứng dụng sẽ mở ngay lập tức:
              </p>

              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-blue-200 shadow-sm inline-block relative group">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code ứng dụng Tin Học 12"
                    className="w-48 h-48 rounded-xl object-contain"
                  />
                  <div className="mt-2 text-[11px] font-bold text-blue-700 flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Quét để mở ứng dụng</span>
                  </div>
                </div>
              </div>

              {/* Link copy box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="bg-transparent text-xs text-slate-700 flex-1 outline-hidden select-all font-mono truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    copied
                      ? "bg-emerald-600 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã chép link!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: iPHONE (SAFARI) INSTRUCTIONS */}
          {activeTab === "ios" && (
            <div className="space-y-3.5">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 font-medium leading-relaxed">
                Trên iPhone hoặc iPad, mở liên kết này bằng trình duyệt <strong>Safari</strong> và làm theo 3 bước sau:
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div className="font-bold text-slate-900">Bấm vào biểu tượng Chia sẻ (Share)</div>
                    <div>Biểu tượng hình vuông có mũi tên chỉ lên (ở thanh công cụ dưới đáy màn hình Safari).</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div className="font-bold text-slate-900">Chọn "Thêm vào Màn hình chính"</div>
                    <div>Cuộn menu xuống và chọn <strong>"Thêm vào MH chính" (Add to Home Screen)</strong> có biểu tượng dấu cộng.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div className="font-bold text-slate-900">Nhấn "Thêm" (Add) ở góc trên</div>
                    <div>Biểu tượng ứng dụng <strong>Tin Học 12</strong> sẽ xuất hiện trên màn hình điện thoại, mở lên toàn màn hình không có thanh web!</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANDROID (CHROME) INSTRUCTIONS */}
          {activeTab === "android" && (
            <div className="space-y-3.5">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 font-medium leading-relaxed">
                Trên điện thoại Samsung, Xiaomi, Oppo,... mở liên kết bằng trình duyệt <strong>Google Chrome</strong>:
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div className="font-bold text-slate-900">Bấm biểu tượng Ba chấm (⋮)</div>
                    <div>Ở góc trên bên phải thanh địa chỉ của trình duyệt Google Chrome.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div className="font-bold text-slate-900">Chọn "Cài đặt ứng dụng" hoặc "Thêm vào Màn hình chính"</div>
                    <div>Chrome sẽ hiển thị thông báo hỏi bạn có muốn cài đặt ứng dụng hay không.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div className="font-bold text-slate-900">Xác nhận "Cài đặt" (Install)</div>
                    <div>App sẽ được cài đặt và xuất hiện cùng danh sách ứng dụng điện thoại, hoạt động độc lập và cực kỳ mượt mà.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-all shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Gửi qua Zalo / Messenger</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
