import React, { useState } from "react";
import {
  Flame,
  Calendar,
  Sparkles,
  ArrowRight,
  X,
  BookOpen,
  RotateCcw,
  Bell,
  HeartHandshake,
  CheckCircle2,
} from "lucide-react";
import { StreakData, dismissInactivityReminder } from "../services/streakService";

interface InactivityReminderProps {
  streakData: StreakData;
  daysInactive: number;
  onStartLearning: () => void;
  onOpenFlashcard?: () => void;
  onDismiss: () => void;
  currentThemeColor?: string;
  // If true, automatically opens modal view; otherwise defaults to toast
  initialMode?: "toast" | "modal";
}

export const InactivityReminder: React.FC<InactivityReminderProps> = ({
  streakData,
  daysInactive,
  onStartLearning,
  onOpenFlashcard,
  onDismiss,
  currentThemeColor = "#2563eb",
  initialMode = "toast",
}) => {
  const [viewMode, setViewMode] = useState<"toast" | "modal">(initialMode);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    dismissInactivityReminder();
    setTimeout(() => {
      onDismiss();
    }, 250);
  };

  const handleAction = (callback: () => void) => {
    dismissInactivityReminder();
    onDismiss();
    callback();
  };

  // Format the last active date nicely in Vietnamese
  const formatLastActive = (dateStr?: string) => {
    if (!dateStr) return "Gần đây";
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      const dayOfWeek = [
        "Chủ nhật",
        "Thứ hai",
        "Thứ ba",
        "Thứ tư",
        "Thứ năm",
        "Thứ sáu",
        "Thứ bảy",
      ][d.getDay()];
      return `${dayOfWeek}, ${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // 1. Toast Notification View
  if (viewMode === "toast") {
    return (
      <div
        className={`fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] transition-all duration-300 transform ${
          isClosing
            ? "opacity-0 translate-y-4 scale-95"
            : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-amber-200/90 shadow-2xl p-4 sm:p-5 relative overflow-hidden">
          {/* Subtle amber accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />

          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            {/* Animated Flame / Bell Badge */}
            <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300/60 flex items-center justify-center shrink-0 shadow-inner">
              <Flame className="w-6 h-6 text-amber-600 fill-amber-500 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Nhắc nhở nhẹ nhàng
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-600">
                  {daysInactive} ngày chưa học
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Bạn đã vắng mặt {daysInactive} ngày rồi đấy!
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed">
                Đừng để kiến thức Tin học 12 bị ngắt quãng. Chỉ cần 3-5 phút ôn tập hôm nay để thắp lại chuỗi học tập nhé!
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setViewMode("modal")}
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Xem chi tiết
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Để sau
              </button>

              <button
                type="button"
                onClick={() => handleAction(onStartLearning)}
                style={{ backgroundColor: currentThemeColor }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-bold shadow-sm hover:opacity-90 transition-all hover:shadow"
              >
                <span>Học ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Modal Reminder View
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden transition-all duration-300 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Header with Warm Aesthetic Gradient */}
        <div className="relative p-6 sm:p-7 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/15 rounded-full blur-xl pointer-events-none" />
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-48 h-12 bg-white/20 blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
            title="Đóng nhắc nhở"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg shrink-0">
              <Flame className="w-8 h-8 text-amber-200 fill-amber-300 animate-pulse" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-amber-100 text-[11px] font-bold backdrop-blur-sm border border-white/20 mb-1">
                <HeartHandshake className="w-3 h-3" />
                <span>Nhắc nhở học tập nhẹ nhàng</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                Chào mừng bạn trở lại! ☕
              </h3>
              <p className="text-amber-100 text-xs sm:text-sm mt-0.5">
                Đã {daysInactive} ngày bạn chưa vào ôn bài Tin học 12
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-slate-800">
          {/* Status Breakdown Box */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Lần học gần nhất:
              </div>
              <div className="text-xs font-bold text-slate-800">
                {formatLastActive(streakData.lastActiveDate)}
              </div>
            </div>

            <div className="space-y-0.5 border-l border-slate-200 pl-3">
              <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Kỷ lục chuỗi đạt được:
              </div>
              <div className="text-xs font-bold text-amber-600">
                {streakData.longestStreak > 0
                  ? `${streakData.longestStreak} ngày liên tiếp`
                  : "Chưa ghi nhận"}
              </div>
            </div>
          </div>

          {/* Encouragement Message */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Bell className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Duy trì thói quen học tập nhỏ mỗi ngày</span>
            </div>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              Theo quy luật trí nhớ, việc ôn tập ngắt quãng quá 2 ngày dễ làm giảm phản xạ kiến thức lý thuyết và các lệnh thực hành. Bạn chỉ cần dành <strong>3 - 5 phút</strong> hoàn thành một thử thách nhỏ để kích hoạt lại chuỗi học tập ngay hôm nay!
            </p>
          </div>

          {/* Quick Actions List */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chọn cách ôn tập nhanh:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleAction(onStartLearning)}
                className="p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                      Làm bài kiểm tra
                    </div>
                    <div className="text-[11px] text-slate-500">
                      5-10 câu hỏi theo bài
                    </div>
                  </div>
                </div>
              </button>

              {onOpenFlashcard && (
                <button
                  type="button"
                  onClick={() => handleAction(onOpenFlashcard)}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800">
                        Ôn Flashcard câu sai
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Lật thẻ ghi nhớ nhanh
                      </div>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-white text-xs font-bold transition-all"
          >
            Để sau nhé
          </button>

          <button
            type="button"
            onClick={() => handleAction(onStartLearning)}
            style={{ backgroundColor: currentThemeColor }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-90 hover:shadow-lg transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Vào học ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
