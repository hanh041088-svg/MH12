import React, { useEffect } from "react";
import { X, Sparkles, CheckCircle2, Calendar, Award, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { AchievementBadge } from "../types";
import { renderBadgeIcon } from "./AchievementBadgeCard";

interface BadgeCelebrationModalProps {
  badge: AchievementBadge | null;
  isOpen: boolean;
  onClose: () => void;
  isCelebration?: boolean;
  onViewProfile?: () => void;
}

export const BadgeCelebrationModal: React.FC<BadgeCelebrationModalProps> = ({
  badge,
  isOpen,
  onClose,
  isCelebration = false,
  onViewProfile,
}) => {
  useEffect(() => {
    if (isOpen && isCelebration) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"],
        });
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen, isCelebration]);

  if (!isOpen || !badge) return null;

  const progressPercent = Math.min(
    100,
    Math.round((badge.currentValue / badge.targetValue) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200 text-slate-800">
        {/* Decorative Header Banner */}
        <div
          className={`p-6 text-white text-center relative overflow-hidden bg-gradient-to-br ${badge.colorGradient}`}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 text-white hover:bg-black/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badge Icon Glowing Orb */}
          <div className="flex justify-center my-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/50 flex items-center justify-center shadow-xl ring-8 ring-white/10 animate-bounce duration-1000">
                {renderBadgeIcon(badge.iconName, "w-10 h-10 text-white")}
              </div>
              {badge.isUnlocked && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-md">
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                </div>
              )}
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {isCelebration ? "Mở Khóa Huy Hiệu Mới!" : "Huy Hiệu Thành Tích"}
            </span>
          </div>

          <h3 className="text-xl font-black text-white tracking-tight">
            {badge.name}
          </h3>
          <div className="text-xs text-white/80 font-medium">
            {badge.englishName}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Yêu Cầu & Điều Kiện Mở Khóa:
            </div>
            <p className="text-sm font-medium text-slate-700 leading-relaxed">
              {badge.description}
            </p>
          </div>

          {/* Status Details */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-400">Trạng Thái</div>
              <div className="text-sm font-bold mt-0.5">
                {badge.isUnlocked ? (
                  <span className="text-emerald-600 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã sở hữu
                  </span>
                ) : (
                  <span className="text-amber-600">Đang phấn đấu</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-400">Độ Hiếm</div>
              <div className="text-sm font-bold text-slate-800 capitalize mt-0.5">
                {badge.rarity === "legendary"
                  ? "Huyền Thoại 👑"
                  : badge.rarity === "epic"
                  ? "Sử Thi ⚡"
                  : badge.rarity === "rare"
                  ? "Hiếm ⭐"
                  : "Cơ Bản"}
              </div>
            </div>
          </div>

          {/* Progress bar if not unlocked */}
          {!badge.isUnlocked && (
            <div className="space-y-1.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Tiến độ thực hiện:</span>
                <span className="font-bold text-amber-700">
                  {badge.currentValue} / {badge.targetValue} {badge.unit} ({progressPercent}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${badge.colorGradient} transition-all duration-500`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {badge.isUnlocked && badge.unlockedAt && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium pt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Đạt được ngày:{" "}
                <strong className="text-slate-600">
                  {new Date(badge.unlockedAt).toLocaleDateString("vi-VN")}
                </strong>
              </span>
            </div>
          )}

          {/* Action button */}
          <div className="pt-2 flex items-center gap-2">
            {onViewProfile && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewProfile();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>Xem Tất Cả Huy Hiệu</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm"
            >
              Tuyệt Vời!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
