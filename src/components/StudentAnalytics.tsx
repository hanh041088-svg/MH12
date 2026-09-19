import React from "react";
import { TestResult, Lesson } from "../types";
import { THEMES_DATA, ALL_LESSONS } from "../data/curriculumData";
import {
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Calendar,
  Layers,
  Palette,
} from "lucide-react";
import { MiniLeaderboard } from "./MiniLeaderboard";
import { StreakData } from "../services/streakService";
import { MonthlyProgressView } from "./MonthlyProgressView";

interface StudentAnalyticsProps {
  testHistory: TestResult[];
  onSelectLesson: (lesson: Lesson) => void;
  studentName: string;
  currentStudentCode?: string;
  streakData?: StreakData;
  onOpenProfile?: () => void;
  currentThemeColor?: string;
  onOpenFlashcard?: () => void;
}

export const StudentAnalytics: React.FC<StudentAnalyticsProps> = ({
  testHistory,
  onSelectLesson,
  studentName,
  currentStudentCode,
  streakData,
  onOpenProfile,
  currentThemeColor,
  onOpenFlashcard,
}) => {
  const [progressViewMode, setProgressViewMode] = React.useState<"monthly" | "recent">("monthly");
  const totalCompleted = testHistory.length;
  const uniqueLessonsCompleted = new Set(testHistory.map((t) => t.lessonId)).size;
  const avgScore =
    totalCompleted > 0
      ? Number((testHistory.reduce((sum, r) => sum + r.score, 0) / totalCompleted).toFixed(1))
      : 0;

  const totalQuestionsAnswered = testHistory.reduce((sum, r) => sum + r.totalQuestions, 0);
  const totalCorrectAnswered = testHistory.reduce((sum, r) => sum + r.correctCount, 0);
  const accuracyRate =
    totalQuestionsAnswered > 0
      ? Math.round((totalCorrectAnswered / totalQuestionsAnswered) * 100)
      : 0;

  // Compute theme mastery
  const themeStats = THEMES_DATA.map((theme) => {
    const themeResults = testHistory.filter((r) => r.themeId === theme.id);
    const completedCount = new Set(themeResults.map((r) => r.lessonId)).size;
    const avgThemeScore =
      themeResults.length > 0
        ? Number((themeResults.reduce((s, r) => s + r.score, 0) / themeResults.length).toFixed(1))
        : 0;

    return {
      id: theme.id,
      number: theme.themeNumber,
      title: theme.title,
      totalLessons: theme.lessons.length,
      completedCount,
      avgScore: avgThemeScore,
      progressPercent: Math.round((completedCount / theme.lessons.length) * 100),
    };
  });

  // Identify weak lessons (score < 7.0)
  const weakResults = testHistory.filter((r) => r.score < 7.0);

  return (
    <div className="space-y-8 pb-16">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Phân Tích Tiến Độ Học Tập - {studentName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hệ thống tự động thống kê điểm số, phân tích năng lực theo từng chủ đề SGK Tin học 12.
          </p>
        </div>

        {onOpenProfile && (
          <button
            type="button"
            onClick={onOpenProfile}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all hover:opacity-90 self-start sm:self-auto"
            style={{ backgroundColor: currentThemeColor || "var(--theme-primary)" }}
          >
            <Palette className="w-4 h-4" />
            <span>Hồ Sơ & Tùy Chỉnh Màu Sắc</span>
          </button>
        )}
      </div>

      {/* Flashcard Củng cố câu sai Banner */}
      {onOpenFlashcard && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50/50 to-white border border-amber-200/80 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200/70 text-amber-900 border border-amber-300">
                  Ghi nhớ chủ động
                </span>
                <span className="text-xs text-slate-500 font-medium">Chế độ Flashcard</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg mt-1">
                Ôn Lại Các Câu Hỏi Sai Từ Bài Kiểm Tra Gần Nhất
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-xl">
                Củng cố kiến thức còn hổng, lật thẻ để xem giải thích SGK Tin học 12 chi tiết và đánh dấu câu đã thuộc để nâng cao điểm số.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenFlashcard}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-2 self-stretch sm:self-auto justify-center"
          >
            <span>Mở Flashcard Ngay</span>
            <Layers className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Điểm trung bình</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold ${
                avgScore >= 8 ? "text-emerald-600" : avgScore >= 6.5 ? "text-blue-600" : "text-amber-600"
              }`}
            >
              {avgScore}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ 10</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Xếp loại: {avgScore >= 8 ? "Giỏi" : avgScore >= 6.5 ? "Khá" : "Cần bồi dưỡng"}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Số bài đã luyện</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-600">
              {uniqueLessonsCompleted}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ 28 bài SGK</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Tổng số lượt làm bài: {totalCompleted} lần
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Độ chính xác</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-600">{accuracyRate}%</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalCorrectAnswered}/{totalQuestionsAnswered} câu trắc nghiệm đúng
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cần hỗ trợ</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600">
              {weakResults.length < 10 ? `0${weakResults.length}` : weakResults.length}
            </span>
            <span className="text-xs text-slate-400 font-semibold">bài &lt; 7.0đ</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {weakResults.length > 0 ? "Nên xem lại lộ trình AI" : "Phong độ xuất sắc"}
          </div>
        </div>
      </div>

      {/* Visual Analytics Segmented Switcher & Views */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setProgressViewMode("monthly")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                progressViewMode === "monthly"
                  ? "bg-white text-blue-700 shadow-2xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>Tiến Độ Theo Tháng (Recharts)</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-blue-100 text-blue-800 font-extrabold">
                Xu Hướng
              </span>
            </button>

            <button
              type="button"
              onClick={() => setProgressViewMode("recent")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                progressViewMode === "recent"
                  ? "bg-white text-blue-700 shadow-2xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Lịch Sử Từng Bài Test Gần Nhất</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-medium px-3 hidden sm:inline">
            {progressViewMode === "monthly"
              ? "Tổng hợp điểm trung bình theo tuần để nhận diện xu hướng học tập qua thời gian"
              : "Xem diễn biến điểm số từng bài thi trắc nghiệm riêng lẻ"}
          </span>
        </div>

        {/* View 1: Monthly Progress View (Recharts) */}
        {progressViewMode === "monthly" ? (
          <MonthlyProgressView
            testHistory={testHistory}
            onSelectLesson={onSelectLesson}
            currentThemeColor={currentThemeColor}
          />
        ) : (
          /* View 2: Recent Tests Timeline Chart */
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Biểu đồ tiến trình điểm số các bài kiểm tra gần nhất
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi sự cải thiện điểm số qua từng lượt làm bài trắc nghiệm riêng biệt
                </p>
              </div>
            </div>

            {testHistory.length > 0 ? (
              <div className="space-y-4">
                {/* SVG Visual Progress Chart */}
                <div className="h-44 w-full flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-200">
                  {testHistory.slice(-12).map((item, idx) => {
                    const heightPercent = Math.max((item.score / 10) * 100, 8);
                    const barColor =
                      item.score >= 8
                        ? "bg-emerald-500 hover:bg-emerald-400"
                        : item.score >= 6.5
                        ? "bg-blue-600 hover:bg-blue-500"
                        : "bg-amber-500 hover:bg-amber-400";

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-white text-[10px] font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 shadow-md">
                          {item.lessonTitle}: {item.score.toFixed(1)}đ
                        </div>

                        <span className="text-[10px] font-bold text-slate-700">
                          {item.score.toFixed(1)}
                        </span>

                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-300 ${barColor}`}
                        />

                        <span className="text-[9px] text-slate-500 truncate w-full text-center mt-1">
                          {item.lessonTitle.split(":")[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>← Các bài làm trước</span>
                  <span>Bài làm gần đây nhất →</span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm">
                Bạn chưa thực hiện bài kiểm tra nào. Hãy chọn một bài học để bắt đầu!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Biểu đồ Năng lực theo từng Chủ đề (Theme Mastery) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Năng lực nắm bắt kiến thức theo 7 Chủ đề SGK
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Đánh giá mức độ thành thạo các mảng kiến thức theo chương trình SGK Tin học 12
        </p>

        <div className="space-y-4">
          {themeStats.map((theme) => {
            const hasData = theme.completedCount > 0;
            return (
              <div key={theme.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 truncate max-w-md">
                    Chủ đề {theme.number}: {theme.title.replace(/Chủ đề \d+: /, "")}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">
                      Đã làm: {theme.completedCount}/{theme.totalLessons} bài
                    </span>
                    <span
                      className={`font-bold ${
                        theme.avgScore >= 8
                          ? "text-emerald-600"
                          : theme.avgScore >= 6.5
                          ? "text-blue-600"
                          : "text-amber-600"
                      }`}
                    >
                      {hasData ? `${theme.avgScore}đ` : "Chưa làm"}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${theme.progressPercent}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      theme.avgScore >= 8
                        ? "bg-emerald-500"
                        : theme.avgScore >= 6.5
                        ? "bg-blue-600"
                        : "bg-amber-500"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lịch sử làm bài chi tiết */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>Lịch sử các lần kiểm tra gần đây</span>
        </h2>

        {testHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Bài học</th>
                  <th className="py-3 px-4 text-center">Điểm số</th>
                  <th className="py-3 px-4 text-center">Số câu đúng</th>
                  <th className="py-3 px-4 text-center">Thời gian</th>
                  <th className="py-3 px-4">Ngày làm</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {testHistory.slice().reverse().map((test) => {
                  const lessonObj = ALL_LESSONS.find((l) => l.id === test.lessonId);
                  return (
                    <tr key={test.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {test.lessonTitle}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full ${
                            test.score >= 8
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : test.score >= 6.5
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {test.score.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-700">
                        {test.correctCount} / {test.totalQuestions}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500">
                        {Math.floor(test.timeSpentSeconds / 60)}p {test.timeSpentSeconds % 60}s
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(test.completedAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {lessonObj && (
                          <button
                            onClick={() => onSelectLesson(lessonObj)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-xs"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Thi lại</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            Chưa có lịch sử làm bài kiểm tra.
          </div>
        )}
      </div>

      {/* Mini Leaderboard Section in Analytics */}
      <div className="pt-2">
        <MiniLeaderboard
          currentStudentCode={currentStudentCode}
          testHistory={testHistory}
          streakData={streakData}
        />
      </div>
    </div>
  );
};
