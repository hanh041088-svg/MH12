import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { TestResult, Lesson } from "../types";
import { ALL_LESSONS } from "../data/curriculumData";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Award,
  BookOpen,
  Target,
  Sparkles,
  Info,
  ChevronRight,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
} from "lucide-react";

export interface MonthlyProgressViewProps {
  testHistory: TestResult[];
  onSelectLesson?: (lesson: Lesson) => void;
  currentThemeColor?: string;
}

export interface WeekProgressData {
  weekKey: string;
  weekLabel: string;
  shortLabel: string;
  dateRange: string;
  avgScore: number | null;
  testsCount: number;
  totalQuestions: number;
  totalCorrect: number;
  accuracy: number;
  bestScore: number | null;
  scoreDiff: number | null;
  trend: "up" | "down" | "neutral" | "empty";
  tests: TestResult[];
}

export const MonthlyProgressView: React.FC<MonthlyProgressViewProps> = ({
  testHistory,
  onSelectLesson,
  currentThemeColor,
}) => {
  // Mode selection: 4 rolling weeks vs Specific calendar month
  const [timeframe, setTimeframe] = useState<"rolling4" | "thisMonth" | "lastMonth">("rolling4");
  const [chartType, setChartType] = useState<"composed" | "lineOnly">("composed");
  const [selectedWeekKey, setSelectedWeekKey] = useState<string | null>(null);

  const themePrimary = currentThemeColor || "#2563eb";

  // Calculate 4 weekly buckets based on selected timeframe
  const weeklyData = useMemo<WeekProgressData[]>(() => {
    const now = new Date();
    const buckets: {
      weekKey: string;
      weekLabel: string;
      shortLabel: string;
      startDate: Date;
      endDate: Date;
    }[] = [];

    if (timeframe === "rolling4") {
      // 4 rolling 7-day windows ending today
      for (let i = 3; i >= 0; i--) {
        const end = new Date(now.getTime() - i * 7 * 86400000);
        end.setHours(23, 59, 59, 999);
        const start = new Date(now.getTime() - (i + 1) * 7 * 86400000 + 86400000);
        start.setHours(0, 0, 0, 0);

        const weekNum = 4 - i;
        buckets.push({
          weekKey: `w-${weekNum}`,
          weekLabel: `Tuần ${weekNum}`,
          shortLabel: `T${weekNum}`,
          startDate: start,
          endDate: end,
        });
      }
    } else {
      // Calendar month: thisMonth or lastMonth
      const targetMonthDate = new Date(now);
      if (timeframe === "lastMonth") {
        targetMonthDate.setMonth(targetMonthDate.getMonth() - 1);
      }
      const year = targetMonthDate.getFullYear();
      const month = targetMonthDate.getMonth();

      // Divide month into 4 equal segments: 1-7, 8-14, 15-21, 22-end
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const intervals = [
        { start: 1, end: 7, label: "Tuần 1", short: "T1" },
        { start: 8, end: 14, label: "Tuần 2", short: "T2" },
        { start: 15, end: 21, label: "Tuần 3", short: "T3" },
        { start: 22, end: daysInMonth, label: "Tuần 4", short: "T4" },
      ];

      intervals.forEach((it, idx) => {
        const s = new Date(year, month, it.start, 0, 0, 0, 0);
        const e = new Date(year, month, it.end, 23, 59, 59, 999);
        buckets.push({
          weekKey: `w-${idx + 1}`,
          weekLabel: it.label,
          shortLabel: it.short,
          startDate: s,
          endDate: e,
        });
      });
    }

    // Format date string dd/MM
    const formatDate = (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

    // Populate tests for each week bucket
    let prevScore: number | null = null;

    return buckets.map((bucket) => {
      const testsInWeek = testHistory.filter((t) => {
        const tDate = new Date(t.completedAt).getTime();
        return tDate >= bucket.startDate.getTime() && tDate <= bucket.endDate.getTime();
      });

      const testsCount = testsInWeek.length;
      let avgScore: number | null = null;
      let accuracy = 0;
      let bestScore: number | null = null;
      let totalQuestions = 0;
      let totalCorrect = 0;

      if (testsCount > 0) {
        const sumScore = testsInWeek.reduce((sum, t) => sum + t.score, 0);
        avgScore = Number((sumScore / testsCount).toFixed(1));

        totalQuestions = testsInWeek.reduce((sum, t) => sum + t.totalQuestions, 0);
        totalCorrect = testsInWeek.reduce((sum, t) => sum + t.correctCount, 0);
        accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
        bestScore = Math.max(...testsInWeek.map((t) => t.score));
      }

      let scoreDiff: number | null = null;
      let trend: "up" | "down" | "neutral" | "empty" = "empty";

      if (avgScore !== null) {
        if (prevScore !== null) {
          scoreDiff = Number((avgScore - prevScore).toFixed(1));
          if (scoreDiff > 0.1) trend = "up";
          else if (scoreDiff < -0.1) trend = "down";
          else trend = "neutral";
        } else {
          trend = "neutral";
        }
        prevScore = avgScore;
      }

      return {
        weekKey: bucket.weekKey,
        weekLabel: bucket.weekLabel,
        shortLabel: bucket.shortLabel,
        dateRange: `${formatDate(bucket.startDate)} - ${formatDate(bucket.endDate)}`,
        avgScore,
        testsCount,
        totalQuestions,
        totalCorrect,
        accuracy,
        bestScore,
        scoreDiff,
        trend,
        tests: testsInWeek,
      };
    });
  }, [testHistory, timeframe]);

  // Overall monthly metrics
  const monthlyMetrics = useMemo(() => {
    const activeWeeks = weeklyData.filter((w) => w.avgScore !== null);
    const totalTestsInMonth = weeklyData.reduce((sum, w) => sum + w.testsCount, 0);

    const allScores = weeklyData.flatMap((w) => w.tests.map((t) => t.score));
    const overallAvgScore =
      allScores.length > 0
        ? Number((allScores.reduce((sum, s) => sum + s, 0) / allScores.length).toFixed(1))
        : 0;

    // First active week score vs latest active week score
    let overallTrend: "up" | "down" | "stable" | "empty" = "empty";
    let scoreChange = 0;

    if (activeWeeks.length >= 2) {
      const firstScore = activeWeeks[0].avgScore!;
      const lastScore = activeWeeks[activeWeeks.length - 1].avgScore!;
      scoreChange = Number((lastScore - firstScore).toFixed(1));
      if (scoreChange >= 0.5) overallTrend = "up";
      else if (scoreChange <= -0.5) overallTrend = "down";
      else overallTrend = "stable";
    } else if (activeWeeks.length === 1) {
      overallTrend = "stable";
    }

    // Find best week
    let bestWeek: WeekProgressData | null = null;
    let maxAvg = -1;
    for (const w of activeWeeks) {
      if (w.avgScore !== null && w.avgScore > maxAvg) {
        maxAvg = w.avgScore;
        bestWeek = w;
      }
    }

    return {
      totalTests: totalTestsInMonth,
      overallAvgScore,
      overallTrend,
      scoreChange,
      bestWeek,
      activeWeeksCount: activeWeeks.length,
    };
  }, [weeklyData]);

  // Transform data for recharts
  const chartData = useMemo(() => {
    return weeklyData.map((w) => ({
      name: w.weekLabel,
      shortName: w.shortLabel,
      dateRange: w.dateRange,
      avgScore: w.avgScore !== null ? w.avgScore : null,
      testsCount: w.testsCount,
      targetScore: 8.0,
      accuracy: w.accuracy,
    }));
  }, [weeklyData]);

  // Selected week details
  const activeSelectedWeek = useMemo(() => {
    if (!selectedWeekKey) return weeklyData[weeklyData.length - 1] || null;
    return weeklyData.find((w) => w.weekKey === selectedWeekKey) || null;
  }, [weeklyData, selectedWeekKey]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-200">
              Monthly Progress
            </span>
            <span className="text-xs text-slate-400 font-medium">Xu hướng học tập theo tuần</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Tiến Độ Học Tập Theo Tháng (Recharts)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Biểu đồ trực quan hóa điểm trung bình và số bài kiểm tra qua các tuần để theo dõi xu hướng phát triển năng lực.
          </p>
        </div>

        {/* Filters / Timeframe Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe pill selector */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTimeframe("rolling4")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === "rolling4"
                  ? "bg-white text-blue-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              4 tuần gần nhất
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("thisMonth")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === "thisMonth"
                  ? "bg-white text-blue-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tháng này
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("lastMonth")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === "lastMonth"
                  ? "bg-white text-blue-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tháng trước
            </button>
          </div>

          {/* Chart Display Mode Toggle */}
          <button
            type="button"
            onClick={() => setChartType(chartType === "composed" ? "lineOnly" : "composed")}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
            title="Chuyển đổi chế độ hiển thị"
          >
            {chartType === "composed" ? "Cột + Đường" : "Chỉ đường Điểm"}
          </button>
        </div>
      </div>

      {/* Monthly Summary KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Điểm TB Tháng
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span
              className={`text-2xl sm:text-3xl font-black ${
                monthlyMetrics.overallAvgScore >= 8
                  ? "text-emerald-600"
                  : monthlyMetrics.overallAvgScore >= 6.5
                  ? "text-blue-600"
                  : "text-amber-600"
              }`}
            >
              {monthlyMetrics.overallAvgScore > 0 ? monthlyMetrics.overallAvgScore : "--"}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 10đ</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Đánh giá:{" "}
            {monthlyMetrics.overallAvgScore >= 8
              ? "Giỏi / Xuất sắc"
              : monthlyMetrics.overallAvgScore >= 6.5
              ? "Khá / Tiến bộ"
              : monthlyMetrics.overallAvgScore > 0
              ? "Cần bứt phá"
              : "Chưa có dữ liệu"}
          </div>
        </div>

        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Xu Hướng Tiến Bộ
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            {monthlyMetrics.overallTrend === "up" ? (
              <>
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-lg font-black text-emerald-600">
                    +{monthlyMetrics.scoreChange}đ
                  </span>
                  <span className="text-[10px] text-emerald-700 block font-bold">Tăng trưởng</span>
                </div>
              </>
            ) : monthlyMetrics.overallTrend === "down" ? (
              <>
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-lg font-black text-rose-600">
                    {monthlyMetrics.scoreChange}đ
                  </span>
                  <span className="text-[10px] text-rose-700 block font-bold">Cần củng cố</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                  <Minus className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-lg font-black text-blue-600">Ổn định</span>
                  <span className="text-[10px] text-slate-500 block font-medium">Giữ vững phong độ</span>
                </div>
              </>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">So với tuần đầu tháng</div>
        </div>

        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Tổng Lượt Luyện Tập
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {monthlyMetrics.totalTests}
            </span>
            <span className="text-xs font-semibold text-slate-500">bài test</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {monthlyMetrics.activeWeeksCount}/4 tuần có học
          </div>
        </div>

        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Tuần Bứt Phá Nhất
          </div>
          <div className="mt-1.5">
            {monthlyMetrics.bestWeek && monthlyMetrics.bestWeek.avgScore !== null ? (
              <div>
                <span className="text-lg font-black text-amber-600 flex items-center gap-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  {monthlyMetrics.bestWeek.weekLabel}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  TB {monthlyMetrics.bestWeek.avgScore}đ ({monthlyMetrics.bestWeek.testsCount} bài)
                </span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-slate-400">Chưa xác định</span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {monthlyMetrics.bestWeek?.dateRange || "Chưa có dữ liệu"}
          </div>
        </div>
      </div>

      {/* Recharts Chart Visualization */}
      <div className="bg-slate-50/50 rounded-2xl border border-slate-200/90 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span>Biểu đồ kết hợp: Điểm trung bình tuần (Đường cong) & Số bài làm (Cột)</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-500 inline-block border-t border-dashed border-emerald-500" />
              <span>Ngưỡng Giỏi (8.0đ)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-500 inline-block border-t border-dashed border-amber-500" />
              <span>Ngưỡng Đạt (5.0đ)</span>
            </span>
          </div>
        </div>

        {/* Main Chart Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 15, right: 20, bottom: 5, left: -10 }}>
              <defs>
                {/* Area Gradient for average score */}
                <linearGradient id="scoreTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={themePrimary} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={themePrimary} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="barCountGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#93c5fd" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#bfdbfe" stopOpacity={0.6} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

              <XAxis
                dataKey="name"
                tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
              />

              {/* Primary Y-Axis: Score (0 - 10) */}
              <YAxis
                yAxisId="score"
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
                unit="đ"
              />

              {/* Secondary Y-Axis: Test Count */}
              {chartType === "composed" && (
                <YAxis
                  yAxisId="count"
                  orientation="right"
                  domain={[0, (dataMax: number) => Math.max(dataMax + 2, 6)]}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={false}
                  unit=" bài"
                />
              )}

              {/* Reference Threshold Lines */}
              <ReferenceLine
                yAxisId="score"
                y={8.0}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
              <ReferenceLine
                yAxisId="score"
                y={5.0}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />

              {/* Custom Tooltip */}
              <Tooltip content={<CustomChartTooltip />} />

              {/* Bar for Number of Tests Completed (Only in Composed Mode) */}
              {chartType === "composed" && (
                <Bar
                  yAxisId="count"
                  dataKey="testsCount"
                  name="Số bài kiểm tra"
                  fill="url(#barCountGradient)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                />
              )}

              {/* Area Under the Score Curve */}
              <Area
                yAxisId="score"
                type="monotone"
                dataKey="avgScore"
                name="Vùng điểm"
                fill="url(#scoreTrendGradient)"
                stroke="none"
              />

              {/* Main Trend Line for Average Score */}
              <Line
                yAxisId="score"
                type="monotone"
                dataKey="avgScore"
                name="Điểm trung bình"
                stroke={themePrimary}
                strokeWidth={3}
                dot={{ r: 5, fill: themePrimary, stroke: "#ffffff", strokeWidth: 2 }}
                activeDot={{ r: 7, fill: themePrimary, stroke: "#ffffff", strokeWidth: 3 }}
                connectNulls={true}
              />

              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => (
                  <span className="text-xs font-semibold text-slate-700 mr-2">{value}</span>
                )}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Breakdown Cards (Interactive Selection) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span>Chi tiết điểm số & kết quả qua 4 tuần</span>
          </h3>
          <span className="text-xs text-slate-400">Bấm vào tuần để xem danh sách bài kiểm tra</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {weeklyData.map((week) => {
            const isSelected = selectedWeekKey === week.weekKey;
            const hasData = week.avgScore !== null;

            return (
              <div
                key={week.weekKey}
                onClick={() => setSelectedWeekKey(week.weekKey)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? "bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{week.weekLabel}</span>
                  {week.trend === "up" && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      <TrendingUp className="w-3 h-3" />
                      +{week.scoreDiff}đ
                    </span>
                  )}
                  {week.trend === "down" && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                      <TrendingDown className="w-3 h-3" />
                      {week.scoreDiff}đ
                    </span>
                  )}
                  {week.trend === "neutral" && hasData && (
                    <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      Ổn định
                    </span>
                  )}
                  {!hasData && (
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      Chưa học
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{week.dateRange}</div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Điểm TB</div>
                    <div
                      className={`text-xl font-black ${
                        !hasData
                          ? "text-slate-300"
                          : week.avgScore! >= 8
                          ? "text-emerald-600"
                          : week.avgScore! >= 6.5
                          ? "text-blue-600"
                          : "text-amber-600"
                      }`}
                    >
                      {hasData ? `${week.avgScore}đ` : "--"}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Đã làm</div>
                    <div className="text-xs font-bold text-slate-700">
                      {week.testsCount > 0 ? `${week.testsCount} bài test` : "0 bài"}
                    </div>
                    {week.testsCount > 0 && (
                      <div className="text-[10px] text-slate-500 font-medium">
                        Đúng {week.accuracy}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Week Detailed Drill-down */}
      {activeSelectedWeek && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Danh sách bài kiểm tra {activeSelectedWeek.weekLabel}</span>
                <span className="text-xs font-normal text-slate-500">
                  ({activeSelectedWeek.dateRange})
                </span>
              </h4>
            </div>

            {activeSelectedWeek.testsCount > 0 && (
              <div className="text-xs font-semibold text-slate-600">
                Cao nhất:{" "}
                <span className="font-bold text-emerald-600">
                  {activeSelectedWeek.bestScore}đ
                </span>{" "}
                • Độ chính xác:{" "}
                <span className="font-bold text-blue-600">{activeSelectedWeek.accuracy}%</span>
              </div>
            )}
          </div>

          {activeSelectedWeek.tests.length > 0 ? (
            <div className="space-y-2">
              {activeSelectedWeek.tests.map((test, idx) => {
                const targetLesson = ALL_LESSONS.find((l) => l.id === test.lessonId);

                return (
                  <div
                    key={test.id || idx}
                    className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          test.score >= 8
                            ? "bg-emerald-100 text-emerald-800"
                            : test.score >= 6.5
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {test.score}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {test.lessonTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>
                            {new Date(test.completedAt).toLocaleDateString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                          <span>•</span>
                          <span>
                            Đúng {test.correctCount}/{test.totalQuestions} câu
                          </span>
                        </div>
                      </div>
                    </div>

                    {onSelectLesson && targetLesson && (
                      <button
                        type="button"
                        onClick={() => onSelectLesson(targetLesson)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-[11px] font-bold text-slate-700 transition-colors shrink-0"
                      >
                        <span>Luyện lại</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-500 text-xs bg-white rounded-xl border border-dashed border-slate-200">
              <BookOpen className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
              <p className="font-medium text-slate-600">
                Trong {activeSelectedWeek.weekLabel} ({activeSelectedWeek.dateRange}), bạn chưa thực hiện bài kiểm tra nào.
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Hãy làm bài trắc nghiệm ngay hôm nay để duy trì xu hướng tăng điểm liên tục!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Learning Trend Recommendations */}
      <div className="bg-gradient-to-r from-blue-50/80 via-slate-50 to-white rounded-2xl border border-blue-200/60 p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-slate-900 text-sm">
            Đánh giá xu hướng học tập & Khuyến nghị của Gia Sư AI
          </h4>
          <p className="text-slate-600 leading-relaxed">
            {monthlyMetrics.overallTrend === "up" ? (
              <>
                <strong className="text-emerald-700">Xu hướng tiến bộ rất rõ rệt:</strong> Điểm số trung bình qua các tuần tăng đều đặn (+{monthlyMetrics.scoreChange}đ). Bạn đang nắm vững các chủ đề SGK Tin học 12. Hãy tiếp tục làm các đề thi thử tổng hợp để rèn luyện tốc độ phản xạ!
              </>
            ) : monthlyMetrics.overallTrend === "down" ? (
              <>
                <strong className="text-rose-700">Điểm số có xu hướng chững lại:</strong> Cần chú ý củng cố lại các nội dung khó như Cơ sở dữ liệu quan hệ (Chủ đề 5) hoặc An toàn mạng (Chủ đề 2). Hãy mở tính năng Flashcard câu sai để ôn lại ngay.
              </>
            ) : monthlyMetrics.totalTests > 0 ? (
              <>
                <strong className="text-blue-700">Phong độ học tập ổn định:</strong> Bạn duy trì điểm số khá đồng đều giữa các tuần. Để đạt điểm 9-10, hãy thử sức với các câu hỏi điền từ hoặc trả lời ngắn mang tính vận dụng cao.
              </>
            ) : (
              <>
                Bạn mới bắt đầu học trên hệ thống. Hãy hoàn thành ít nhất 2 bài kiểm tra trắc nghiệm mỗi tuần để hệ thống vẽ biểu đồ đường xu hướng chi tiết và đưa ra lời khuyên tối ưu nhất cho bạn!
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

// Custom Tooltip for Recharts
interface TooltipPayloadItem {
  dataKey: string;
  name: string;
  value: number | null;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  const avgScoreItem = payload.find((p) => p.dataKey === "avgScore");
  const countItem = payload.find((p) => p.dataKey === "testsCount");

  const avgScore = avgScoreItem?.value;
  const count = countItem?.value || 0;

  return (
    <div className="bg-slate-900/95 text-white text-xs p-3.5 rounded-xl shadow-xl border border-slate-700 backdrop-blur-md min-w-[190px]">
      <div className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-1.5 flex items-center justify-between">
        <span>{label}</span>
        <span className="text-[10px] font-normal text-slate-400">Báo cáo tuần</span>
      </div>

      <div className="mt-2 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            Điểm trung bình:
          </span>
          <span className="font-black text-amber-300 text-sm">
            {avgScore !== null && avgScore !== undefined ? `${avgScore}đ` : "Chưa làm"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-200 inline-block" />
            Số bài kiểm tra:
          </span>
          <span className="font-bold text-white">{count} bài</span>
        </div>

        <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Mục tiêu tuần:</span>
          <span className="font-semibold text-emerald-400">&gt;= 8.0đ</span>
        </div>
      </div>
    </div>
  );
};
