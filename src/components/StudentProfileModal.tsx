import React, { useState } from "react";
import {
  X,
  User,
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Award,
  Flame,
  BookOpen,
  GraduationCap,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Trophy,
  Target,
  Zap,
  Lock,
  History,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { StudentAccount, TestResult, AchievementBadge } from "../types";
import { StreakData } from "../services/streakService";
import {
  THEME_PRESETS,
  DEFAULT_THEME_COLOR,
  calculateColorShades,
  applyThemeColor,
} from "../services/themeService";
import { calculateBadges } from "../services/badgeService";
import { AchievementBadgeCard } from "./AchievementBadgeCard";
import { BadgeCelebrationModal } from "./BadgeCelebrationModal";
import { getLatestWrongQuestions } from "../services/flashcardService";

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentAccount?: StudentAccount;
  testHistory: TestResult[];
  streakData?: StreakData;
  currentThemeColor: string;
  onThemeColorChange: (newColor: string) => void;
  onSwitchAccount?: () => void;
  initialTab?: "badges" | "theme" | "flashcard";
  onUpdateStreak?: (newStreak: number) => void;
  onOpenFlashcard?: () => void;
  onLogout?: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  studentAccount,
  testHistory,
  streakData,
  currentThemeColor,
  onThemeColorChange,
  onSwitchAccount,
  initialTab = "badges",
  onOpenFlashcard,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<"badges" | "theme" | "flashcard">(initialTab);
  const [selectedColor, setSelectedColor] = useState<string>(currentThemeColor || DEFAULT_THEME_COLOR);
  const [hexInput, setHexInput] = useState<string>(currentThemeColor || DEFAULT_THEME_COLOR);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Huy hiệu & Trạng thái modal chi tiết
  const [selectedBadgeForDetail, setSelectedBadgeForDetail] = useState<AchievementBadge | null>(null);
  const [badgeFilter, setBadgeFilter] = useState<"all" | "unlocked" | "locked">("all");

  if (!isOpen) return null;

  // Tính toán nhanh số liệu học sinh
  const completedCount = testHistory.length;
  const avgScore =
    completedCount > 0
      ? Number((testHistory.reduce((sum, r) => sum + r.score, 0) / completedCount).toFixed(1))
      : 0;
  const totalQuestions = testHistory.reduce((sum, r) => sum + r.totalQuestions, 0);
  const totalCorrect = testHistory.reduce((sum, r) => sum + r.correctCount, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Tính toán danh sách huy hiệu
  const badges = calculateBadges(testHistory, streakData, studentAccount?.id);
  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  const filteredBadges = badges.filter((b) => {
    if (badgeFilter === "unlocked") return b.isUnlocked;
    if (badgeFilter === "locked") return !b.isUnlocked;
    return true;
  });

  // Lấy dữ liệu câu hỏi sai gần nhất cho tab Flashcard
  const latestWrongData = getLatestWrongQuestions(testHistory);

  const previewShades = calculateColorShades(selectedColor);

  const handleSelectColor = (hex: string) => {
    setSelectedColor(hex);
    setHexInput(hex);
    onThemeColorChange(hex);
    applyThemeColor(hex, studentAccount?.studentCode);
    showToastNotification();
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith("#")) {
      val = "#" + val;
    }
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setSelectedColor(val);
      onThemeColorChange(val);
      applyThemeColor(val, studentAccount?.studentCode);
      showToastNotification();
    }
  };

  const handleResetDefault = () => {
    handleSelectColor(DEFAULT_THEME_COLOR);
  };

  const showToastNotification = () => {
    setSaveToast("Đã lưu và đổi màu giao diện thành công!");
    setTimeout(() => {
      setSaveToast(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 text-slate-800">
        
        {/* Header Hồ Sơ */}
        <div
          className="p-6 text-white relative transition-all duration-300"
          style={{ background: previewShades.gradient }}
        >
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-bold text-xl shadow-inner shrink-0">
                {studentAccount?.avatar || <User className="w-7 h-7" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    {studentAccount?.name || "Học Sinh"}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 border border-white/30 text-white backdrop-blur-xs">
                    {studentAccount?.studentCode || "HS12"}
                  </span>
                  {studentAccount?.className && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-900 shadow-2xs">
                      Lớp {studentAccount.className}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/80 mt-1 flex items-center gap-2">
                  <span>{studentAccount?.school || "THPT Kết Nối Tri Thức"}</span>
                  <span>•</span>
                  <span className="font-semibold text-amber-200">
                    {unlockedCount} / {badges.length} Huy hiệu đạt được
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
              title="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-5 grid grid-cols-4 gap-2 bg-slate-900/30 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-center">
            <div>
              <div className="text-xs text-white/75 font-medium">Bài đã làm</div>
              <div className="text-lg font-black text-white">{completedCount}/28</div>
            </div>
            <div className="border-l border-white/15">
              <div className="text-xs text-white/75 font-medium">Điểm TB</div>
              <div className="text-lg font-black text-amber-300">{avgScore}/10</div>
            </div>
            <div className="border-l border-white/15">
              <div className="text-xs text-white/75 font-medium">Tỷ lệ đúng</div>
              <div className="text-lg font-black text-emerald-300">{accuracy}%</div>
            </div>
            <div className="border-l border-white/15">
              <div className="text-xs text-white/75 font-medium">Chuỗi Streak</div>
              <div className="text-lg font-black text-orange-300 flex items-center justify-center gap-0.5">
                <Flame className="w-4 h-4 fill-orange-300 text-orange-300 inline" />
                <span>{streakData?.currentStreak || 1}d</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("badges")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === "badges"
                ? "bg-white text-blue-700 shadow-2xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Huy Hiệu Thành Tích ({unlockedCount}/{badges.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("flashcard")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === "flashcard"
                ? "bg-white text-amber-800 shadow-2xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>Flashcard Câu Sai Gần Nhất</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("theme")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === "theme"
                ? "bg-white text-blue-700 shadow-2xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Palette className="w-3.5 h-3.5" style={{ color: previewShades.hex }} />
            <span>Tùy Chỉnh Màu Sắc</span>
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Toast Notification */}
          {saveToast && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs sm:text-sm font-semibold animate-in fade-in duration-200">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveToast}</span>
            </div>
          )}

          {/* TAB 1: HUY HIỆU THÀNH TÍCH (ACHIEVEMENT BADGES) */}
          {activeTab === "badges" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Bộ Sưu Tập Huy Hiệu Đạt Được</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chinh phục chuỗi ngày học liên tục (Streak) và độ chính xác cao để mở khóa danh hiệu
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setBadgeFilter("all")}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      badgeFilter === "all"
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Tất cả ({badges.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBadgeFilter("unlocked")}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      badgeFilter === "unlocked"
                        ? "bg-white text-emerald-700 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Đã mở ({unlockedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBadgeFilter("locked")}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      badgeFilter === "locked"
                        ? "bg-white text-slate-700 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Chưa đạt ({badges.length - unlockedCount})
                  </button>
                </div>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredBadges.map((badge) => (
                  <AchievementBadgeCard
                    key={badge.id}
                    badge={badge}
                    onSelect={(b) => setSelectedBadgeForDetail(b)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CHẾ ĐỘ FLASHCARD CỦNG CỐ CÂU HỎI SAI */}
          {activeTab === "flashcard" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                        Bài kiểm tra gần nhất
                      </span>
                      <h4 className="font-bold text-slate-900 text-base sm:text-lg mt-1">
                        {latestWrongData?.lessonTitle || "Tin học 12 - Ôn tập kiến thức"}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Điểm số: <strong className="text-amber-700">{latestWrongData?.score || 0}/10</strong> • Tổng số câu cần khắc phục: <strong className="text-rose-600">{latestWrongData?.totalWrong || 0} câu</strong>
                      </p>
                    </div>
                  </div>

                  {onOpenFlashcard && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenFlashcard();
                      }}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0"
                    >
                      <span>Mở Thẻ Flashcard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="border-t border-amber-200/60 pt-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    💡 <strong>Phương pháp Flashcard lật mặt:</strong> Giúp học sinh khắc sâu kiến thức trọng tâm SGK Tin học 12, phân biệt các khái niệm hay nhầm lẫn và biến những lỗi sai thành điểm số vững chắc.
                  </p>
                </div>
              </div>

              {/* Danh sách câu hỏi cần củng cố */}
              {latestWrongData && latestWrongData.cards.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Các câu hỏi sai cần lưu ý ({latestWrongData.cards.length} câu):
                  </h4>
                  <div className="space-y-2.5">
                    {latestWrongData.cards.map((card, idx) => (
                      <div
                        key={card.id || idx}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition-colors space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            Câu {idx + 1}: {card.question}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                            {card.level}
                          </span>
                        </div>
                        <div className="text-xs text-rose-700 font-medium">
                          ❌ Lựa chọn trước đó:{" "}
                          <span className="font-semibold">
                            {card.selectedOption !== undefined && card.selectedOption >= 0
                              ? card.options[card.selectedOption]
                              : "Chưa chọn"}
                          </span>
                        </div>
                        <div className="text-xs text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                          ✅ Đáp án đúng SGK: {card.options[card.correctIndex]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TÙY CHỈNH MÀU SẮC GIAO DIỆN (THEME PICKER) */}
          {activeTab === "theme" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: previewShades.hex }}
                  >
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                      Tùy Chỉnh Màu Sắc Giao Diện (Theme Color)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Chọn màu chủ đạo theo sở thích riêng của bạn để làm mới ứng dụng
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
                  title="Khôi phục màu mặc định"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mặc định</span>
                </button>
              </div>

              {/* Presets Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
                  Bảng Màu Gợi Ý (Presets):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = selectedColor.toLowerCase() === preset.color.toLowerCase();
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectColor(preset.color)}
                        className={`p-2.5 rounded-2xl border text-left flex items-center gap-3 transition-all relative group ${
                          isSelected
                            ? "bg-slate-50 border-slate-800 shadow-xs ring-2 ring-slate-800/10"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-xl shrink-0 shadow-xs flex items-center justify-center text-white"
                          style={{ backgroundColor: preset.color }}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">
                            {preset.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono uppercase">
                            {preset.color}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Input Controls */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Màu Tự Chọn Bất Kỳ (Custom Hex):
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                    <input
                      id="theme-native-color-picker"
                      type="color"
                      value={selectedColor}
                      onChange={(e) => handleSelectColor(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <label
                      htmlFor="theme-native-color-picker"
                      className="text-xs font-bold text-slate-700 cursor-pointer select-none"
                    >
                      Bấm chọn màu trực quan
                    </label>
                  </div>

                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-xs font-bold text-slate-400 font-mono">HEX</span>
                    <input
                      type="text"
                      value={hexInput}
                      onChange={handleHexInputChange}
                      placeholder="#2563eb"
                      maxLength={7}
                      className="w-24 text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none"
                    />
                  </div>

                  <div
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-2xs"
                    style={{ backgroundColor: previewShades.hex }}
                  >
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>Màu đang áp dụng</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Details & Switch Option */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Đang đăng nhập: <strong className="text-slate-800">{studentAccount?.name}</strong> ({studentAccount?.studentCode})
            </div>
            {onSwitchAccount && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchAccount();
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
              >
                Đổi tài khoản khác
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              Đóng Lại
            </button>
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5"
                title="Đăng xuất khỏi tài khoản học sinh"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng Xuất</span>
              </button>
            )}
          </div>

          {activeTab === "theme" && (
            <button
              type="button"
              onClick={() => {
                onThemeColorChange(selectedColor);
                applyThemeColor(selectedColor, studentAccount?.studentCode);
                showToastNotification();
                setTimeout(() => {
                  onClose();
                }, 400);
              }}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md transition-all flex items-center gap-2 active:scale-95"
              style={{ backgroundColor: previewShades.hex }}
            >
              <Check className="w-4 h-4" />
              <span>Áp Dụng Màu Giao Diện</span>
            </button>
          )}

          {activeTab === "flashcard" && onOpenFlashcard && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFlashcard();
              }}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md transition-all flex items-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95"
            >
              <Layers className="w-4 h-4" />
              <span>Bắt Đầu Luyện Thẻ Flashcard</span>
            </button>
          )}
        </div>

      </div>

      {/* Badge Celebration / Detail Modal */}
      {selectedBadgeForDetail && (
        <BadgeCelebrationModal
          isOpen={!!selectedBadgeForDetail}
          onClose={() => setSelectedBadgeForDetail(null)}
          badge={selectedBadgeForDetail}
        />
      )}
    </div>
  );
};
