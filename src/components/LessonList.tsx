import React, { useState } from "react";
import { THEMES_DATA, ALL_LESSONS } from "../data/curriculumData";
import { Lesson, TestResult } from "../types";
import {
  Search,
  BookOpen,
  CheckCircle2,
  Clock,
  Play,
  Award,
  Sparkles,
  Layers,
  ChevronRight,
  Palette,
  Trophy,
  Zap,
  GraduationCap,
  Sliders,
  CheckSquare,
  Square,
  ArrowRight,
  RotateCcw,
  History,
} from "lucide-react";
import { LessonDetailModal } from "./LessonDetailModal";
import { StreakBadge } from "./StreakBadge";
import { StreakData } from "../services/streakService";
import { MiniLeaderboard } from "./MiniLeaderboard";
import { ComprehensiveExamModal } from "./ComprehensiveExamModal";
import {
  getLearnedLessons,
  generateComprehensiveExam,
  PRESET_MOCK_EXAMS,
  PresetMockExam,
} from "../services/mockExamService";

interface LessonListProps {
  onStartTest: (lesson: Lesson) => void;
  testHistory: TestResult[];
  studentName: string;
  currentStudentCode?: string;
  streakData?: StreakData;
  onOpenProfile?: () => void;
  currentThemeColor?: string;
  onOpenInactivityReminder?: () => void;
  onSimulateInactive?: (days: number) => void;
}

export const LessonList: React.FC<LessonListProps> = ({
  onStartTest,
  testHistory,
  studentName,
  currentStudentCode,
  streakData,
  onOpenProfile,
  currentThemeColor,
  onOpenInactivityReminder,
  onSimulateInactive,
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeModalLesson, setActiveModalLesson] = useState<Lesson | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(true);
  const [showComprehensiveModal, setShowComprehensiveModal] = useState<boolean>(false);

  // Custom exam builder states within mock_exams tab
  const [customQuestionCount, setCustomQuestionCount] = useState<number>(20);
  const [customSelectedLessonIds, setCustomSelectedLessonIds] = useState<string[]>(
    ALL_LESSONS.map((l) => l.id)
  );

  const learnedLessons = getLearnedLessons(testHistory);
  const mockExamResults = testHistory.filter((t) =>
    t.lessonId.startsWith("thi-thu-tong-hop")
  );
  const bestMockScore =
    mockExamResults.length > 0
      ? Math.max(...mockExamResults.map((r) => r.score))
      : undefined;

  // Helper to get highest score for a lesson
  const getLessonScore = (lessonId: string): number | undefined => {
    const results = testHistory.filter((r) => r.lessonId === lessonId);
    if (results.length === 0) return undefined;
    return Math.max(...results.map((r) => r.score));
  };

  // Filter lessons
  const filteredThemes = THEMES_DATA.map((theme) => {
    const filteredLessons = theme.lessons.filter((lesson) => {
      const matchSearch =
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.keyConcepts.some((c) =>
          c.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchSearch;
    });

    return {
      ...theme,
      lessons: filteredLessons,
    };
  }).filter((theme) => {
    if (selectedThemeId === "all") return theme.lessons.length > 0;
    return theme.id === selectedThemeId && theme.lessons.length > 0;
  });

  const totalLessons = THEMES_DATA.reduce((acc, t) => acc + t.lessons.length, 0);
  const completedCount = new Set(
    testHistory
      .filter((t) => !t.lessonId.startsWith("thi-thu-tong-hop"))
      .map((t) => t.lessonId)
  ).size;
  const avgScore =
    testHistory.length > 0
      ? (testHistory.reduce((acc, t) => acc + t.score, 0) / testHistory.length).toFixed(1)
      : "0.0";

  // Quick start a preset exam
  const handleStartPreset = (preset: PresetMockExam) => {
    const examLesson = generateComprehensiveExam(testHistory, {
      questionCount: preset.questionCount,
      selectedLessonIds: preset.lessonIds,
      examTitle: `${preset.title} (${preset.questionCount} câu)`,
      themeTitle: preset.title,
    });
    onStartTest(examLesson);
  };

  // Quick start custom exam
  const handleStartCustomExam = () => {
    const lessonIds =
      customSelectedLessonIds.length > 0
        ? customSelectedLessonIds
        : ALL_LESSONS.map((l) => l.id);

    const examLesson = generateComprehensiveExam(testHistory, {
      questionCount: customQuestionCount,
      selectedLessonIds: lessonIds,
      examTitle: `Thi Thử Tổng Hợp Tin Học 12 (${customQuestionCount} câu)`,
      themeTitle: "Đề Thi Thử Tổng Hợp Tin Học 12",
    });
    onStartTest(examLesson);
  };

  const toggleLessonSelection = (id: string) => {
    setCustomSelectedLessonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isSearchingMockExam =
    searchQuery.trim().length > 0 &&
    (searchQuery.toLowerCase().includes("thi") ||
      searchQuery.toLowerCase().includes("thử") ||
      searchQuery.toLowerCase().includes("tổng hợp") ||
      searchQuery.toLowerCase().includes("đề") ||
      searchQuery.toLowerCase().includes("exam"));

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Student Progress Card */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden transition-all duration-300"
        style={{ background: "var(--theme-primary-gradient)" }}
      >
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Chương trình GDPT 2018 - Định hướng Tin học ứng dụng</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Xin chào, {studentName}!
            </h1>
            <p className="text-white/90 text-sm leading-relaxed">
              Hệ thống bài kiểm tra trắc nghiệm theo từng bài học SGK Tin học 12 và luyện thi thử tổng hợp liên bài học. Tích hợp AI giải thích kiến thức, bấm giờ phòng thi và tự động thống kê năng lực.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedThemeId("mock_exams")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-black transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                title="Luyện thi thử tổng hợp từ nhiều bài học trong chương trình"
              >
                <Sparkles className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                <span>🎯 Thi Thử Tổng Hợp ({PRESET_MOCK_EXAMS.length} đề)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-sm"
              >
                <Trophy className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                <span>{showLeaderboard ? "Thu gọn BXH Lớp" : "🏆 Mở Bảng Xếp Hạng Lớp"}</span>
              </button>

              {onOpenProfile && (
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all shadow-sm backdrop-blur-md border border-white/30"
                  title="Mở hồ sơ cá nhân và bộ chọn màu sắc chủ đạo"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>🎨 Đổi Màu Giao Diện</span>
                </button>
              )}
            </div>
          </div>

          {/* Streak & Quick Metrics */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {streakData && (
              <StreakBadge
                streakData={streakData}
                onOpenInactivityReminder={onOpenInactivityReminder}
                onSimulateInactive={onSimulateInactive}
              />
            )}

            <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-slate-900/30 p-3 rounded-2xl backdrop-blur-md border border-white/20">
              <div className="text-center px-2">
                <div className="text-2xl sm:text-3xl font-black text-amber-300">
                  {completedCount}/{totalLessons}
                </div>
                <div className="text-[11px] text-blue-100 font-medium mt-0.5">Bài đã làm</div>
              </div>
              <div className="text-center px-2 border-x border-white/20">
                <div className="text-2xl sm:text-3xl font-black text-emerald-300">
                  {avgScore}
                </div>
                <div className="text-[11px] text-blue-100 font-medium mt-0.5">Điểm TB</div>
              </div>
              <div className="text-center px-2">
                <div className="text-2xl sm:text-3xl font-black text-cyan-200">
                  {mockExamResults.length}
                </div>
                <div className="text-[11px] text-blue-100 font-medium mt-0.5">Lần thi thử</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Leaderboard Card */}
      {showLeaderboard && (
        <MiniLeaderboard
          currentStudentCode={currentStudentCode}
          testHistory={testHistory}
          streakData={streakData}
        />
      )}

      {/* Filter & Search Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm bài học, khái niệm (HTML, CSS, IP, Hub...) hoặc gõ 'thi thử'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-xs"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <span>Hiển thị bài học theo 7 chủ đề SGK & các đề thi thử</span>
          </div>
        </div>

        {/* Theme Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {/* Tất cả bài học */}
          <button
            onClick={() => setSelectedThemeId("all")}
            style={{
              backgroundColor:
                selectedThemeId === "all"
                  ? currentThemeColor || "var(--theme-primary)"
                  : undefined,
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedThemeId === "all"
                ? "text-white shadow-xs font-bold"
                : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-xs"
            }`}
          >
            Tất cả chủ đề ({totalLessons} bài)
          </button>

          {/* Tab THI THỬ TỔNG HỢP */}
          <button
            onClick={() => setSelectedThemeId("mock_exams")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedThemeId === "mock_exams"
                ? "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-md scale-[1.02]"
                : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 shadow-xs"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>🎯 Thi Thử Tổng Hợp ({PRESET_MOCK_EXAMS.length} đề mẫu)</span>
          </button>

          {/* Theme list */}
          {THEMES_DATA.map((theme) => {
            const isSelected = selectedThemeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => setSelectedThemeId(theme.id)}
                style={{
                  backgroundColor: isSelected
                    ? currentThemeColor || "var(--theme-primary)"
                    : undefined,
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "text-white shadow-xs font-bold"
                    : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-xs"
                }`}
              >
                Chủ đề {theme.themeNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. DEDICATED MOCK EXAMS VIEW (Khi chọn tab 'Thi Thử Tổng Hợp') */}
      {/* ========================================================= */}
      {selectedThemeId === "mock_exams" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Mock Exam Section Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-indigo-500/30 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>Khu Vực Luyện & Thi Thử Tổng Hợp Tin Học 12</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Chuẩn Bị Tối Đa Cho Kì Thi Chính Thức
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Thi thử tổng hợp trích xuất ngẫu nhiên câu hỏi từ các bài học khác nhau trong chương trình SGK Tin học 12. Mô phỏng phòng thi thật với đồng hồ đếm ngược, tự động chấm điểm thang 10 và hỗ trợ AI giải thích từng câu hỏi.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Cấu trúc đề chuẩn Bộ GD&ĐT 2018
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    Bấm giờ tự động
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                    <Award className="w-3.5 h-3.5 text-cyan-300" />
                    Tự động lưu câu sai vào Flashcard
                  </span>
                </div>
              </div>

              {/* Quick stats badge */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[200px] shrink-0">
                <div className="text-xs text-slate-300 font-medium mb-1">
                  Điểm thi thử cao nhất của bạn
                </div>
                <div className="text-3xl sm:text-4xl font-black text-amber-300">
                  {bestMockScore !== undefined ? `${bestMockScore.toFixed(1)}` : "—"}
                  {bestMockScore !== undefined && (
                    <span className="text-lg text-slate-400 font-normal">/10</span>
                  )}
                </div>
                <div className="text-[11px] text-emerald-300 font-medium mt-1">
                  Đã hoàn thành {mockExamResults.length} lượt thi thử
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Preset Mock Exams Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span>1. Các Bộ Đề Thi Thử Chuẩn Hóa Theo Kì Thi</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Các đề thi được cấu hình sẵn theo trọng tâm từng giai đoạn năm học
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                {PRESET_MOCK_EXAMS.length} bộ đề
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {PRESET_MOCK_EXAMS.map((preset) => (
                <div
                  key={preset.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${preset.badgeColor}`}
                      >
                        {preset.badge}
                      </span>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <span className="flex items-center gap-1 text-blue-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {preset.questionCount} câu
                        </span>
                        <span className="flex items-center gap-1 text-amber-600">
                          <Clock className="w-3.5 h-3.5" />
                          {preset.timeMinutes}p
                        </span>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                      {preset.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                      {preset.description}
                    </p>
                    <div className="mt-3 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{preset.lessonRangeText}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleStartPreset(preset)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>Bắt đầu thi đề này</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Custom Mock Exam Builder */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-600" />
                  <span>2. Bộ Tự Tạo Đề Thi Thử Tùy Chọn</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Tự chọn các bài học bạn muốn ôn luyện và điều chỉnh số lượng câu hỏi
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowComprehensiveModal(true)}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 transition-colors"
              >
                Mở cửa sổ chi tiết
              </button>
            </div>

            {/* Step A: Select questions count */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                A. Chọn số lượng câu hỏi
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { count: 10, label: "10 câu", time: "10 phút", desc: "Luyện nhanh" },
                  { count: 20, label: "20 câu", time: "20 phút", desc: "Chuẩn kiểm tra", recommended: true },
                  { count: 28, label: "28 câu", time: "35 phút", desc: "Chuẩn THPT 2025" },
                  { count: 40, label: "40 câu", time: "45 phút", desc: "Toàn diện nâng cao" },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setCustomQuestionCount(item.count)}
                    className={`p-3.5 rounded-2xl border-2 text-center transition-all relative ${
                      customQuestionCount === item.count
                        ? "border-purple-600 bg-purple-50/80 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {item.recommended && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                        Phổ biến
                      </span>
                    )}
                    <div className="text-base font-black text-slate-900">{item.label}</div>
                    <div className="text-[11px] font-bold text-purple-600">{item.time}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step B: Select lessons */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  B. Chọn danh sách bài học đưa vào đề ({customSelectedLessonIds.length}/{ALL_LESSONS.length} bài)
                </label>
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setCustomSelectedLessonIds(ALL_LESSONS.map((l) => l.id))}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition-colors"
                  >
                    Chọn tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomSelectedLessonIds(
                        ALL_LESSONS.filter(
                          (l) => l.lessonNumber >= 1 && l.lessonNumber <= 12
                        ).map((l) => l.id)
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 font-semibold text-blue-700 border border-blue-200 transition-colors"
                  >
                    Học kì 1 (Bài 1-12)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomSelectedLessonIds(
                        ALL_LESSONS.filter((l) => l.lessonNumber >= 13).map((l) => l.id)
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 font-semibold text-purple-700 border border-purple-200 transition-colors"
                  >
                    Học kì 2 (Bài 13-23)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomSelectedLessonIds(learnedLessons.map((l) => l.id))
                    }
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 font-semibold text-emerald-700 border border-emerald-200 transition-colors"
                  >
                    Chỉ bài đã học ({learnedLessons.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomSelectedLessonIds([])}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 font-semibold text-rose-700 border border-rose-200 transition-colors"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-200">
                {ALL_LESSONS.map((l) => {
                  const isSelected = customSelectedLessonIds.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => toggleLessonSelection(l.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs transition-all border ${
                        isSelected
                          ? "bg-white border-purple-400 text-slate-900 font-semibold shadow-2xs"
                          : "bg-white/50 border-slate-200 text-slate-500 hover:bg-white hover:text-slate-700"
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-purple-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">
                        <strong>Bài {l.lessonNumber}:</strong> {l.title.replace(/Bài \d+: /, "")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Launch button */}
            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={handleStartCustomExam}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>
                  Khởi tạo đề & Bắt đầu thi ({customQuestionCount} câu từ{" "}
                  {customSelectedLessonIds.length} bài)
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Section 3: History of mock exam attempts */}
          {mockExamResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-600" />
                  <span>3. Lịch Sử Các Lần Thi Thử Gần Nhất</span>
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {mockExamResults.length} lần thi
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockExamResults.slice(-6).reverse().map((res, idx) => (
                  <div
                    key={res.id || idx}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {res.lessonTitle || "Thi Thử Tổng Hợp"}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {res.completedAt
                          ? new Date(res.completedAt).toLocaleDateString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                            })
                          : "Gần đây"}{" "}
                        • {res.correctCount}/{res.totalQuestions} câu đúng
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-lg font-black ${
                          res.score >= 8.0
                            ? "text-emerald-600"
                            : res.score >= 5.0
                            ? "text-blue-600"
                            : "text-amber-600"
                        }`}
                      >
                        {res.score.toFixed(1)}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowComprehensiveModal(true)}
                        className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5 justify-end mt-0.5"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Làm lại</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. REGULAR LESSON LIST VIEW (Khi chọn 'all' hoặc từng theme) */}
      {/* ========================================================= */}
      {selectedThemeId !== "mock_exams" && (
        <div className="space-y-10">
          {/* FEATURED MOCK EXAM CARD - Khi ở tab 'Tất cả' hoặc khi tìm kiếm 'thi thử' */}
          {(selectedThemeId === "all" || isSearchingMockExam) && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-md border border-indigo-500/30 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-2 max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-400/30">
                  <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span>TÍNH NĂNG MỚI: THI THỬ TỔNG HỢP</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>Thi Thử Tổng Hợp Kiến Thức Tin Học 12</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Luyện làm bài kiểm tra tổng hợp từ nhiều bài học khác nhau trong chương trình Tin học 12 để chuẩn bị tốt hơn cho kỳ thi chính thức. Bấm giờ phòng thi, trắc nghiệm 4 phương án & Đúng/Sai, tự động chữa bài bằng AI.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 text-slate-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {learnedLessons.length > 0
                      ? `${learnedLessons.length} bài đã học`
                      : "Toàn bộ 17 bài SGK"}
                  </span>
                  <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 text-slate-200">
                    <Clock className="w-3 h-3 text-amber-300" />
                    10 - 45 phút
                  </span>
                  <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 text-slate-200">
                    <Award className="w-3 h-3 text-cyan-300" />
                    Chấm điểm chuẩn GDPT 2018
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 relative z-10">
                <button
                  type="button"
                  onClick={() => setSelectedThemeId("mock_exams")}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition-all w-full sm:w-auto"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Xem {PRESET_MOCK_EXAMS.length} bộ đề mẫu</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowComprehensiveModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Bắt đầu thi thử ngay</span>
                </button>
              </div>
            </div>
          )}

          {/* Lesson List grouped by Themes */}
          {filteredThemes.map((theme) => (
            <section key={theme.id} className="space-y-4">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 text-xs flex items-center justify-center font-bold border border-blue-200">
                      {theme.themeNumber}
                    </span>
                    {theme.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">{theme.description}</p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {theme.lessons.length} bài
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {theme.lessons.map((lesson) => {
                  const score = getLessonScore(lesson.id);
                  const hasTaken = score !== undefined;

                  return (
                    <div
                      key={lesson.id}
                      className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Card Header: Badges */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                            Bài {lesson.lessonNumber}
                          </span>

                          {hasTaken ? (
                            <div className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Award className="w-3 h-3 text-emerald-600" />
                              <span>{score.toFixed(1)}/10</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium border border-slate-200">
                              Chưa làm
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors line-clamp-2">
                          {lesson.title}
                        </h3>

                        {/* Summary preview */}
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {lesson.summary}
                        </p>

                        {/* Concepts pills */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {lesson.keyConcepts.slice(0, 2).map((concept, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md truncate max-w-[200px]"
                              title={concept}
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setActiveModalLesson(lesson)}
                          className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1 transition-colors py-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span>Kiến thức</span>
                        </button>

                        <button
                          onClick={() => onStartTest(lesson)}
                          style={{
                            backgroundColor: !hasTaken
                              ? currentThemeColor || "var(--theme-primary)"
                              : undefined,
                          }}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                            hasTaken
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                              : "hover:opacity-90 text-white"
                          }`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{hasTaken ? "Làm lại test" : "Làm test"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {filteredThemes.length === 0 && !isSearchingMockExam && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">
                Không tìm thấy bài học nào phù hợp.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedThemeId("all");
                }}
                className="mt-3 text-xs text-blue-600 font-semibold hover:underline"
              >
                Đặt lại bộ lọc tìm kiếm
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lesson Theory Modal */}
      {activeModalLesson && (
        <LessonDetailModal
          lesson={activeModalLesson}
          highestScore={getLessonScore(activeModalLesson.id)}
          onClose={() => setActiveModalLesson(null)}
          onStartTest={onStartTest}
        />
      )}

      {/* Comprehensive Exam Modal */}
      {showComprehensiveModal && (
        <ComprehensiveExamModal
          isOpen={showComprehensiveModal}
          onClose={() => setShowComprehensiveModal(false)}
          onStartExam={onStartTest}
          testHistory={testHistory}
          currentThemeColor={currentThemeColor}
        />
      )}
    </div>
  );
};
