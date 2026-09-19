import React, { useState } from "react";
import { Lesson, TestResult } from "../types";
import {
  X,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Sliders,
  Award,
  Zap,
  CheckSquare,
  Square,
  GraduationCap,
} from "lucide-react";
import {
  getLearnedLessons,
  countLearnedQuestions,
  generateComprehensiveExam,
  PRESET_MOCK_EXAMS,
  PresetMockExam,
} from "../services/mockExamService";
import { ALL_LESSONS } from "../data/curriculumData";

interface ComprehensiveExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExam: (examLesson: Lesson) => void;
  testHistory: TestResult[];
  currentThemeColor?: string;
}

export const ComprehensiveExamModal: React.FC<ComprehensiveExamModalProps> = ({
  isOpen,
  onClose,
  onStartExam,
  testHistory,
  currentThemeColor,
}) => {
  const learnedLessons = getLearnedLessons(testHistory);
  const learnedCount = learnedLessons.length;
  const stats = countLearnedQuestions(testHistory);

  // Tab mode: "presets" | "custom"
  const [modalTab, setModalTab] = useState<"presets" | "custom">("presets");

  // Custom configuration states
  const [sourceMode, setSourceMode] = useState<"learned_only" | "all_curriculum" | "custom_selection">(
    learnedCount > 0 ? "learned_only" : "all_curriculum"
  );
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>(
    ALL_LESSONS.map((l) => l.id)
  );

  if (!isOpen) return null;

  const totalCurriculumQuestions = ALL_LESSONS.reduce(
    (acc, l) => acc + l.questions.length,
    0
  );

  const availableQuestions =
    sourceMode === "learned_only" && learnedCount > 0
      ? stats.totalQuestionsCount
      : sourceMode === "custom_selection"
      ? ALL_LESSONS.filter((l) => selectedLessonIds.includes(l.id)).reduce(
          (acc, l) => acc + l.questions.length,
          0
        )
      : totalCurriculumQuestions;

  const handleStartPreset = (preset: PresetMockExam) => {
    const examLesson = generateComprehensiveExam(testHistory, {
      questionCount: preset.questionCount,
      selectedLessonIds: preset.lessonIds,
      examTitle: `${preset.title} (${preset.questionCount} câu)`,
      themeTitle: preset.title,
    });
    onStartExam(examLesson);
    onClose();
  };

  const handleStartCustom = () => {
    let finalLessonIds: string[] | undefined = undefined;
    if (sourceMode === "custom_selection") {
      finalLessonIds = selectedLessonIds.length > 0 ? selectedLessonIds : ALL_LESSONS.map((l) => l.id);
    }

    const examLesson = generateComprehensiveExam(testHistory, {
      questionCount,
      sourceMode: sourceMode === "custom_selection" ? undefined : sourceMode,
      selectedLessonIds: finalLessonIds,
      examTitle: `Thi Thử Tổng Hợp Tin Học 12 (${questionCount} câu)`,
      themeTitle: "Đề Thi Thử Tổng Hợp Tin Học 12",
    });
    onStartExam(examLesson);
    onClose();
  };

  const toggleLesson = (id: string) => {
    setSelectedLessonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllLessons = () => {
    setSelectedLessonIds(ALL_LESSONS.map((l) => l.id));
  };

  const clearAllLessons = () => {
    setSelectedLessonIds([]);
  };

  const selectTerm1 = () => {
    // Bài 1 đến Bài 12
    setSelectedLessonIds(
      ALL_LESSONS.filter((l) => l.lessonNumber >= 1 && l.lessonNumber <= 12).map((l) => l.id)
    );
  };

  const selectTerm2 = () => {
    // Bài 13 trở đi
    setSelectedLessonIds(
      ALL_LESSONS.filter((l) => l.lessonNumber >= 13).map((l) => l.id)
    );
  };

  const presetCounts = [
    { count: 10, label: "10 câu", time: "10 phút", desc: "Luyện nhanh" },
    { count: 20, label: "20 câu", time: "20 phút", desc: "Chuẩn kiểm tra", recommended: true },
    { count: 28, label: "28 câu", time: "35 phút", desc: "Chuẩn THPT 2025" },
    { count: 40, label: "40 câu", time: "45 phút", desc: "Đề thi toàn diện" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div
          className="p-6 text-white relative overflow-hidden shrink-0"
          style={{ background: "var(--theme-primary-gradient)" }}
        >
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/15 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Kiểm tra & Đánh giá năng lực tự động</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Thi Thử Tổng Hợp Tin Học 12
              </h2>
              <p className="text-white/90 text-xs sm:text-sm">
                Làm bài kiểm tra tổng hợp từ nhiều bài học trong chương trình để chuẩn bị tốt nhất cho kỳ thi chính thức.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors shrink-0"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab switch */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/15">
            <button
              type="button"
              onClick={() => setModalTab("presets")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                modalTab === "presets"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Đề thi thử theo kì (Có sẵn)</span>
            </button>
            <button
              type="button"
              onClick={() => setModalTab("custom")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                modalTab === "custom"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Tự chọn bài học & Số câu</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {modalTab === "presets" ? (
            /* PRESET EXAMS VIEW */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Chọn một bộ đề thi thử được thiết kế sẵn</span>
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Bấm giờ & chấm điểm tự động
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {PRESET_MOCK_EXAMS.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/20 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${preset.badgeColor}`}
                        >
                          {preset.badge}
                        </span>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <span className="flex items-center gap-1 text-blue-600">
                            <CheckCircle2 className="w-3 h-3" />
                            {preset.questionCount} câu
                          </span>
                          <span className="flex items-center gap-1 text-amber-600">
                            <Clock className="w-3 h-3" />
                            {preset.timeMinutes}p
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                        {preset.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {preset.description}
                      </p>
                      <div className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg mt-2.5 inline-block">
                        📚 {preset.lessonRangeText}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartPreset(preset)}
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>Bắt đầu thi đề này</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* CUSTOM EXAM BUILDER VIEW */
            <div className="space-y-6">
              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-black text-blue-700">
                    {sourceMode === "custom_selection"
                      ? selectedLessonIds.length
                      : sourceMode === "learned_only"
                      ? learnedCount
                      : ALL_LESSONS.length}{" "}
                    / {ALL_LESSONS.length}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">Bài học trong đề</div>
                </div>
                <div className="text-center border-x border-slate-200">
                  <div className="text-lg sm:text-xl font-black text-emerald-700">
                    {availableQuestions}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">Câu hỏi khả dụng</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-black text-purple-700">
                    {questionCount} câu
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">Quy mô đề thi</div>
                </div>
              </div>

              {/* Setting 1: Nguồn câu hỏi */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>1. Phạm vi bài học đưa vào đề</span>
                  </label>
                  <span className="text-xs text-slate-500 font-medium">
                    {sourceMode === "learned_only"
                      ? "Chỉ bài đã học"
                      : sourceMode === "custom_selection"
                      ? `Tự chọn (${selectedLessonIds.length} bài)`
                      : "Toàn bộ SGK"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option A: Chỉ từ các bài đã học */}
                  <button
                    type="button"
                    onClick={() => setSourceMode("learned_only")}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      sourceMode === "learned_only"
                        ? "border-blue-600 bg-blue-50/70 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                      <span>Từ bài đã học</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {learnedCount} bài
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Các bài bạn đã làm bài kiểm tra trước đây.
                    </p>
                  </button>

                  {/* Option B: Toàn bộ SGK Tin học 12 */}
                  <button
                    type="button"
                    onClick={() => setSourceMode("all_curriculum")}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      sourceMode === "all_curriculum"
                        ? "border-blue-600 bg-blue-50/70 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                      <span>Toàn bộ 17 bài</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        17 bài
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Trộn ngẫu nhiên câu hỏi từ tất cả các bài SGK.
                    </p>
                  </button>

                  {/* Option C: Tự chọn bài học */}
                  <button
                    type="button"
                    onClick={() => setSourceMode("custom_selection")}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      sourceMode === "custom_selection"
                        ? "border-blue-600 bg-blue-50/70 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                      <span>Tự tích chọn bài</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        Tùy ý
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Chọn các bài theo nhu cầu ôn tập của bạn.
                    </p>
                  </button>
                </div>

                {/* Checklist of lessons when custom_selection */}
                {sourceMode === "custom_selection" && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-700">
                        Tích chọn các bài học muốn thi thử:
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <button
                          type="button"
                          onClick={selectAllLessons}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-blue-600 hover:bg-blue-50"
                        >
                          Chọn tất cả
                        </button>
                        <button
                          type="button"
                          onClick={selectTerm1}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Học kì 1
                        </button>
                        <button
                          type="button"
                          onClick={selectTerm2}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Học kì 2
                        </button>
                        <button
                          type="button"
                          onClick={clearAllLessons}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {ALL_LESSONS.map((l) => {
                        const isChecked = selectedLessonIds.includes(l.id);
                        return (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => toggleLesson(l.id)}
                            className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs transition-all border ${
                              isChecked
                                ? "bg-white border-blue-400 text-slate-900 shadow-2xs font-semibold"
                                : "bg-white/50 border-slate-200 text-slate-500 hover:bg-white hover:text-slate-700"
                            }`}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
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
                )}
              </div>

              {/* Setting 2: Số lượng câu hỏi */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>2. Chọn số lượng câu hỏi & Thời gian</span>
                  </label>
                  <span className="text-xs text-slate-500 font-medium">
                    Thời gian làm bài: ~{questionCount === 28 ? "35" : questionCount} phút
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {presetCounts.map((preset) => {
                    const isSelected = questionCount === preset.count;
                    return (
                      <button
                        key={preset.count}
                        type="button"
                        onClick={() => setQuestionCount(preset.count)}
                        className={`p-3 rounded-2xl border-2 text-center transition-all relative ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/80 shadow-xs"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {preset.recommended && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                            Đề xuất
                          </span>
                        )}
                        <div className="text-base font-black text-slate-900 mt-0.5">
                          {preset.label}
                        </div>
                        <div className="text-[11px] font-semibold text-blue-600">
                          {preset.time}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {preset.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Features info callout */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Award className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Đặc điểm đề thi thử tổng hợp tự động</span>
                </div>
                <ul className="text-xs text-amber-900/90 space-y-1 pl-5 list-disc leading-relaxed">
                  <li>
                    <strong>Đảm bảo tính đại diện:</strong> Lấy ít nhất 1 câu hỏi từ mỗi bài học đã chọn để không bỏ sót nội dung.
                  </li>
                  <li>
                    <strong>Chuẩn cấu trúc thi:</strong> Kết hợp trắc nghiệm 4 lựa chọn và câu hỏi trắc nghiệm Đúng/Sai.
                  </li>
                  <li>
                    <strong>Tự động lưu & Flashcard:</strong> Sau khi nộp bài, các câu trả lời sai sẽ được tự động đồng bộ vào bộ thẻ Flashcard ôn tập.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-white text-xs font-bold transition-all"
          >
            Đóng
          </button>

          {modalTab === "custom" && (
            <button
              type="button"
              onClick={handleStartCustom}
              style={{
                backgroundColor: currentThemeColor || "var(--theme-primary)",
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-90 hover:shadow-lg transition-all"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Bắt đầu thi thử ({questionCount} câu)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
