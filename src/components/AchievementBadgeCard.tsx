import React from "react";
import {
  Flame,
  Trophy,
  Sparkles,
  Calendar,
  BookOpen,
  Target,
  Zap,
  GraduationCap,
  Lock,
  CheckCircle2,
  Award,
  ChevronRight,
} from "lucide-react";
import { AchievementBadge } from "../types";

interface AchievementBadgeCardProps {
  badge: AchievementBadge;
  onSelect?: (badge: AchievementBadge) => void;
  compact?: boolean;
}

export const renderBadgeIcon = (iconName: string, className = "w-6 h-6 text-white") => {
  switch (iconName) {
    case "flame":
      return <Flame className={className} />;
    case "trophy":
      return <Trophy className={className} />;
    case "sparkles":
      return <Sparkles className={className} />;
    case "calendar":
      return <Calendar className={className} />;
    case "book-open":
      return <BookOpen className={className} />;
    case "target":
      return <Target className={className} />;
    case "zap":
      return <Zap className={className} />;
    case "graduation-cap":
      return <GraduationCap className={className} />;
    default:
      return <Award className={className} />;
  }
};

const getRarityBadge = (rarity: AchievementBadge["rarity"]) => {
  switch (rarity) {
    case "legendary":
      return {
        label: "Huyền Thoại",
        bg: "bg-amber-100 text-amber-800 border-amber-300",
      };
    case "epic":
      return {
        label: "Sử Thi",
        bg: "bg-purple-100 text-purple-800 border-purple-300",
      };
    case "rare":
      return {
        label: "Hiếm",
        bg: "bg-blue-100 text-blue-800 border-blue-300",
      };
    default:
      return {
        label: "Cơ Bản",
        bg: "bg-slate-100 text-slate-700 border-slate-300",
      };
  }
};

export const AchievementBadgeCard: React.FC<AchievementBadgeCardProps> = ({
  badge,
  onSelect,
  compact = false,
}) => {
  const rarityInfo = getRarityBadge(badge.rarity);
  const progressPercent = Math.min(
    100,
    Math.round((badge.currentValue / badge.targetValue) * 100)
  );

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => onSelect && onSelect(badge)}
        className={`group relative p-2.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
          badge.isUnlocked
            ? "bg-white border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md"
            : "bg-slate-50/80 border-slate-200/70 opacity-75 hover:opacity-100"
        }`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 ${
            badge.isUnlocked
              ? `bg-gradient-to-br ${badge.colorGradient} text-white`
              : "bg-slate-200 text-slate-400"
          }`}
        >
          {badge.isUnlocked ? (
            renderBadgeIcon(badge.iconName, "w-5 h-5")
          ) : (
            <Lock className="w-4 h-4 text-slate-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900 truncate">
              {badge.name}
            </span>
            {badge.isUnlocked && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            )}
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            {badge.englishName}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div
      onClick={() => onSelect && onSelect(badge)}
      className={`relative rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between cursor-pointer group ${
        badge.isUnlocked
          ? "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300"
          : "bg-slate-50/70 border-slate-200/80 opacity-80 hover:opacity-100 hover:bg-slate-50"
      }`}
    >
      {/* Top row: Icon & Status / Rarity */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="relative">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-105 ${
                badge.isUnlocked
                  ? `bg-gradient-to-br ${badge.colorGradient} text-white ring-4 ring-slate-100`
                  : "bg-slate-200 text-slate-400"
              }`}
            >
              {badge.isUnlocked ? (
                renderBadgeIcon(badge.iconName, "w-6 h-6")
              ) : (
                <Lock className="w-5 h-5 text-slate-400" />
              )}
            </div>

            {badge.isUnlocked && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs">
                <CheckCircle2 className="w-3 h-3 stroke-[3]" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rarityInfo.bg}`}
            >
              {rarityInfo.label}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {badge.englishName}
            </span>
          </div>
        </div>

        {/* Title and description */}
        <h4 className="text-sm font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
          {badge.name}
        </h4>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
          {badge.description}
        </p>
      </div>

      {/* Bottom row: Progress Bar or Unlocked status */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        {badge.isUnlocked ? (
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã mở khóa</span>
            </span>
            {badge.unlockedAt && (
              <span className="text-[10px] text-slate-400 font-medium">
                {new Date(badge.unlockedAt).toLocaleDateString("vi-VN")}
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Tiến độ</span>
              <span className="font-bold text-slate-700">
                {badge.currentValue} / {badge.targetValue} {badge.unit} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${badge.colorGradient}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
