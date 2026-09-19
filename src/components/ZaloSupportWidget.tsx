import React, { useState } from "react";
import { MessageCircle, Phone, Copy, Check, ExternalLink, X, HeartHandshake, Sparkles } from "lucide-react";

interface ZaloSupportWidgetProps {
  phoneNumber?: string;
  teacherName?: string;
}

export const ZaloSupportWidget: React.FC<ZaloSupportWidgetProps> = ({
  phoneNumber = "0978944184",
  teacherName = "Cô Minh Hạnh",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const zaloUrl = `https://zalo.me/${phoneNumber}`;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="zalo-support-container"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2 pointer-events-auto"
    >
      {/* Expanded Support Dialog / Card */}
      {isOpen && (
        <div
          id="zalo-support-card"
          className="w-80 bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0068FF] to-[#0051cc] p-4 text-white relative">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Đóng bảng hỗ trợ"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-white text-[#0068FF] flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                Zalo
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                    Hỗ Trợ Học Tập
                  </span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h4 className="text-base font-bold text-white leading-tight">
                  {teacherName.startsWith("Cô") ? teacherName : `Cô ${teacherName}`}
                </h4>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3.5 bg-slate-50/50">
            <p className="text-xs text-slate-600 leading-relaxed">
              Các em học sinh cần giải đáp kiến thức Tin học 12, thắc mắc bài tập hoặc tư vấn ôn thi THPT, hãy kết nối trực tiếp qua Zalo của {teacherName.startsWith("Cô") ? teacherName : `Cô ${teacherName}`} nhé:
            </p>

            {/* Phone Number Display Box */}
            <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0068FF] flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Số Zalo / Hotline</div>
                  <div className="text-sm font-black font-mono text-slate-900 tracking-wide">
                    {phoneNumber}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Sao chép số điện thoại"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 text-[11px]">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[11px]">Sao chép</span>
                  </>
                )}
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2 pt-1">
              <a
                href={zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0068FF] hover:bg-[#0058de] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nhắn tin Zalo: {phoneNumber}</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
              </a>

              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 pt-0.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Hỗ trợ giải đáp nhanh và tận tình</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Badge / Button */}
      <div className="flex items-center gap-2">
        {/* Quick Click / Expand Pill */}
        <button
          id="zalo-support-pill"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#0068FF] to-[#0051cc] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/80"
          title={`Bấm để mở thông tin Zalo hỗ trợ học tập của ${teacherName.startsWith("Cô") ? teacherName : `Cô ${teacherName}`}`}
        >
          {/* Zalo official icon badge */}
          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white text-[#0068FF] font-black text-xs shadow-xs shrink-0">
            <span>Zalo</span>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
          </div>

          <div className="flex flex-col text-left leading-tight pr-1">
            <span className="text-[10px] font-semibold text-blue-100 uppercase tracking-wider">
              Hỗ trợ học tập: {teacherName.startsWith("Cô") ? teacherName : `Cô ${teacherName}`}
            </span>
            <span className="text-xs font-black font-mono text-white tracking-wide">
              {phoneNumber}
            </span>
          </div>

          <MessageCircle className="w-4 h-4 text-white/90 group-hover:rotate-12 transition-transform hidden sm:block" />
        </button>

        {/* Direct Link Icon for Fast Access */}
        <a
          id="zalo-direct-link"
          href={zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center justify-center w-11 h-11 rounded-full bg-white hover:bg-blue-50 text-[#0068FF] border border-blue-200 shadow-md hover:shadow-lg transition-all"
          title={`Mở Zalo chat trực tiếp tới ${phoneNumber}`}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
