import React, { useState } from "react";
import { Flame, Trophy, Calendar, Sparkles, Bell, AlertTriangle, RefreshCw } from "lucide-react";
import { StreakData, getDaysSinceLastActive } from "../services/streakService";

interface StreakBadgeProps {
  streakData: StreakData;
  compact?: boolean;
  onOpenInactivityReminder?: () => void;
  onSimulateInactive?: (days: number) => void;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  streakData,
  compact = false,
  onOpenInactivityReminder,
  onSimulateInactive,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const daysInactive = getDaysSinceLastActive(streakData.lastActiveDate);
  const isInactive = daysInactive >= 2;

  // Lấy các ngày từ Thứ 2 đến Chủ nhật của tuần hiện tại
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 = CN, 1 = T2,...
  const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((label, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const isCompleted = streakData.activeDates.includes(dateStr);
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    return { label, dateStr, isCompleted, isToday };
  });

  if (compact) {
    return (
      <div className="relative inline-block">
        <button
          type="button"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all shadow-xs ${
            isInactive
              ? "bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 text-amber-900 animate-pulse"
              : "bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900"
          }`}
        >
          {isInactive ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          ) : (
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse shrink-0" />
          )}
          <span>{streakData.currentStreak} ngày</span>
          {isInactive && (
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Đã 2+ ngày chưa vào học" />
          )}
        </button>

        {showTooltip && (
          <div className="absolute right-0 mt-2 z-50 w-72 bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold flex items-center gap-1.5 text-amber-400">
                <Flame className="w-4 h-4 fill-amber-400" />
                Chuỗi học tập: {streakData.currentStreak} ngày liên tiếp
              </span>
            </div>

            {/* Inactivity Warning if >= 2 days */}
            {isInactive && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Bell className="w-3.5 h-3.5" />
                  <span>Đã {daysInactive} ngày chưa vào học!</span>
                </div>
                <p className="text-[11px] text-amber-100/90 mt-1">
                  Đừng để ngọn lửa học tập bị ngắt quãng, ôn tập ngay hôm nay nhé!
                </p>
                {onOpenInactivityReminder && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTooltip(false);
                      onOpenInactivityReminder();
                    }}
                    className="mt-2 w-full py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] transition-colors"
                  >
                    Xem lời nhắc & Ôn tập ngay
                  </button>
                )}
              </div>
            )}

            <p className="text-[11px] text-slate-300 mt-2">
              Luyện bài trắc nghiệm mỗi ngày để giữ lửa chuỗi học tập và đạt kỷ lục cá nhân!
            </p>

            <div className="flex items-center justify-between gap-1 mt-3 pt-2 border-t border-slate-800">
              {daysOfWeek.map((day) => (
                <div key={day.label} className="text-center flex-1">
                  <div
                    className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold ${
                      day.isCompleted
                        ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                        : day.isToday
                        ? "border border-amber-400 text-amber-400"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {day.isCompleted ? "✓" : day.label}
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">{day.label}</span>
                </div>
              ))}
            </div>

            {/* Simulation test action for user/teacher */}
            {onSimulateInactive && (
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>Kiểm thử tính năng:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSimulateInactive(isInactive ? 0 : 2);
                  }}
                  className="hover:text-amber-300 flex items-center gap-1 underline underline-offset-2"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  {isInactive ? "Đặt lại về hôm nay" : "Mô phỏng 2 ngày chưa học"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-amber-600/20 border border-amber-300/40 rounded-2xl p-3.5 backdrop-blur-md text-white flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center text-amber-300">
            {isInactive ? (
              <AlertTriangle className="w-5 h-5 text-amber-300 animate-pulse" />
            ) : (
              <Flame className="w-5 h-5 fill-amber-400 text-amber-300 animate-pulse" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-amber-200">
              {isInactive ? `Đã vắng ${daysInactive} ngày` : "Chuỗi học liên tiếp"}
            </div>
            <div className="text-xl font-black text-amber-300 tracking-tight">
              {streakData.currentStreak} ngày 🔥
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-amber-200/80 font-medium">Kỷ lục</div>
          <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
            <Trophy className="w-3 h-3 text-amber-300" />
            <span>{streakData.longestStreak} ngày</span>
          </div>
        </div>
      </div>

      {isInactive && onOpenInactivityReminder && (
        <button
          type="button"
          onClick={onOpenInactivityReminder}
          className="mt-2.5 py-1 px-2.5 rounded-lg bg-amber-400/30 hover:bg-amber-400/50 border border-amber-300/40 text-[11px] font-bold text-amber-100 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Bell className="w-3.5 h-3.5 text-amber-300" />
          <span>Nhắc nhở nhẹ nhàng: Bấm để thắp lại lửa 🔥</span>
        </button>
      )}

      {/* Days of week tracker */}
      <div className="grid grid-cols-7 gap-1 mt-3 pt-2 border-t border-white/10">
        {daysOfWeek.map((day) => (
          <div key={day.label} className="text-center">
            <div
              className={`w-6 h-6 mx-auto rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                day.isCompleted
                  ? "bg-amber-400 text-slate-900 font-extrabold shadow-xs"
                  : day.isToday
                  ? "border border-amber-300 text-amber-200 bg-white/10"
                  : "bg-white/10 text-white/50"
              }`}
            >
              {day.isCompleted ? "🔥" : day.label}
            </div>
            <span className="text-[9px] text-white/70 block mt-0.5">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
