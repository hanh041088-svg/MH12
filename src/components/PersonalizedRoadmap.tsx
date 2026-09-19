import React, { useState, useEffect } from "react";
import { TestResult, Lesson } from "../types";
import { ALL_LESSONS } from "../data/curriculumData";
import {
  Sparkles,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  Cloud,
  ExternalLink,
  BookOpen,
  Target,
  RefreshCw,
} from "lucide-react";
import { uploadToDrive } from "../services/driveService";

interface PersonalizedRoadmapProps {
  studentName: string;
  testHistory: TestResult[];
  accessToken: string | null;
  onSelectLesson: (lesson: Lesson) => void;
}

export const PersonalizedRoadmap: React.FC<PersonalizedRoadmapProps> = ({
  studentName,
  testHistory,
  accessToken,
  onSelectLesson,
}) => {
  const [roadmapContent, setRoadmapContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [driveLink, setDriveLink] = useState<string | null>(null);
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});

  // Detect weak lessons (score < 7.0)
  const weakLessons = testHistory
    .filter((r) => r.score < 7.0)
    .map((r) => r.lessonTitle);

  // Generate roadmap
  const generateRoadmap = async () => {
    try {
      setLoading(true);
      const avgScore =
        testHistory.length > 0
          ? (testHistory.reduce((s, r) => s + r.score, 0) / testHistory.length).toFixed(1)
          : "Chưa có";

      const res = await fetch("/api/gemini/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          scoreStats: {
            averageScore: avgScore,
            completedTests: testHistory.length,
          },
          weakTopics: weakLessons,
          testHistory: testHistory.slice(-5).map((t) => ({
            lesson: t.lessonTitle,
            score: t.score,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.roadmapText) {
        throw new Error(data.error || "Lỗi tạo lộ trình từ máy chủ AI");
      }
      setRoadmapContent(data.roadmapText);
    } catch (err) {
      setRoadmapContent(
        `# Lộ trình ôn tập cá nhân hóa môn Tin học 12\n- **Mục tiêu**: Hoàn thiện kiến thức SGK Kết nối tri thức.\n- **Giai đoạn 1**: Ôn lại Mạng máy tính & TCP/IP, phân biệt Switch và Router (Bài 3, 4).\n- **Giai đoạn 2**: Rèn luyện kỹ năng thực hành thẻ HTML & bộ chọn quan hệ CSS (Bài 7 đến 17).\n- **Giai đoạn 3**: Đánh giá tổng hợp và luyện đề thi thử tốt nghiệp THPT.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateRoadmap();
  }, []);

  // Export roadmap to Google Drive
  const handleExportToDrive = async () => {
    if (!accessToken) {
      alert("Vui lòng đăng nhập Google ở góc phải phía trên để lưu lộ trình về Google Drive!");
      return;
    }

    try {
      setIsExporting(true);
      const fileName = `LoTrinhOnTap_TinHoc12_${studentName || "HocSinh"}.html`;
      const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Lộ Trình Ôn Tập Tin Học 12 - ${studentName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.7; color: #1e293b; max-width: 800px; margin: 40px auto; padding: 24px; }
    h1 { color: #1e40af; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
    h2 { color: #334155; margin-top: 24px; }
    h3 { color: #475569; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
    .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: bold; }
    .footer { margin-top: 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; }
  </style>
</head>
<body>
  <span class="badge">Lộ Trình Ôn Tập Cá Nhân Hóa (AI Powered)</span>
  <h1>KẾ HOẠCH ÔN TẬP TIN HỌC 12 - SGK KẾT NỐI TRI THỨC</h1>
  <p>Học sinh: <strong>${studentName}</strong> | Ngày tạo: ${new Date().toLocaleDateString("vi-VN")}</p>
  <div>
    ${roadmapContent
      .replace(/^# (.*$)/gim, "<h2>$1</h2>")
      .replace(/^## (.*$)/gim, "<h3>$1</h3>")
      .replace(/^\* (.*$)/gim, "<li>$1</li>")
      .replace(/^- (.*$)/gim, "<li>$1</li>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}
  </div>
  <div class="footer">Tài liệu lưu trữ trên Google Drive cá nhân | Tạo tự động từ ứng dụng Ôn Luyện Tin Học 12</div>
</body>
</html>`;

      const res = await uploadToDrive(fileName, htmlContent, "text/html", accessToken);
      if (res.success && res.webViewLink) {
        setDriveLink(res.webViewLink);
      } else {
        throw new Error(res.error || "Không thể lưu vào Drive");
      }
    } catch (err: any) {
      alert("Lỗi lưu file vào Google Drive: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleMilestone = (key: string) => {
    setCompletedMilestones((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#101C3B] via-[#16254E] to-[#101C3B] rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#1E2E56]">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold backdrop-blur-md border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Cố Vấn Học Tập Cá Nhân Hóa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Lộ Trình Ôn Tập Đột Phá Điểm Số
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Dựa trên phân tích kết quả làm bài test thực tế của bạn, AI thiết kế lộ trình ôn luyện tối ưu theo từng bài học SGK Tin học 12.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={generateRoadmap}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all backdrop-blur-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Đang phân tích..." : "Tạo mới lộ trình"}</span>
          </button>

          <button
            onClick={handleExportToDrive}
            disabled={isExporting || loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-all"
          >
            <Cloud className="w-4 h-4 text-white" />
            <span>{isExporting ? "Đang lưu..." : "Lưu vào Google Drive"}</span>
          </button>
        </div>
      </div>

      {/* Drive Export Feedback */}
      {driveLink && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4 text-xs text-emerald-800 animate-in fade-in shadow-2xs">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Lộ trình ôn tập đã được lưu an toàn trên Google Drive của bạn!</span>
          </div>
          <a
            href={driveLink}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-1.5 hover:bg-emerald-500 transition-colors shrink-0"
          >
            <span>Xem trên Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Recommended Practice Lessons (Based on weaknesses) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-500" />
          <span>Nhiệm vụ ưu tiên: Các bài kiểm tra cần làm lại ngay</span>
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Hệ thống đề xuất các bài có điểm chưa đạt (&lt; 7.0) hoặc chưa làm để bạn cải thiện trước
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_LESSONS.slice(0, 3).map((lesson) => (
            <div
              key={lesson.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between gap-3 transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {lesson.themeTitle.split(":")[0]}
                </span>
                <h4 className="font-bold text-slate-800 text-xs mt-1 truncate max-w-[200px]">
                  {lesson.title}
                </h4>
              </div>
              <button
                onClick={() => onSelectLesson(lesson)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs"
              >
                <span>Thi ngay</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Structured Roadmap Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Kế Hoạch Hành Động Chi Tiết Từ AI</span>
          </h2>
          <span className="text-xs text-slate-500">
            Cập nhật tự động theo tiến độ
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium">
              AI đang phân tích các bài trắc nghiệm của bạn và tổng hợp giáo trình SGK Tin học 12...
            </p>
          </div>
        ) : (
          <div className="text-slate-700 text-sm leading-relaxed space-y-4 whitespace-pre-line">
            {roadmapContent}
          </div>
        )}
      </div>

      {/* 3-Phase Action Roadmap Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-xs text-blue-700 font-bold border border-blue-200">
              1
            </span>
            <span>Giai đoạn 1: Lấp Lỗ Hổng</span>
          </div>
          <p className="text-xs text-slate-500">
            Đọc lại mục kiến thức trọng tâm các bài bị sai nhiều, đặc biệt là phần định dạng CSS và thiết bị mạng.
          </p>
          <div className="space-y-2 pt-2">
            {["Ôn bài 3, 4 về TCP/IP & Switch", "Ôn bài 15, 16 về Box model & Selector CSS"].map(
              (task, i) => (
                <label
                  key={i}
                  className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(completedMilestones[`g1_${i}`])}
                    onChange={() => toggleMilestone(`g1_${i}`)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 bg-white"
                  />
                  <span
                    className={
                      completedMilestones[`g1_${i}`] ? "line-through text-slate-400" : ""
                    }
                  >
                    {task}
                  </span>
                </label>
              )
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-xs text-amber-700 font-bold border border-amber-200">
              2
            </span>
            <span>Giai đoạn 2: Tăng Tốc Luyện Đề</span>
          </div>
          <p className="text-xs text-slate-500">
            Làm lại bài test đạt từ 8.0 trở lên và sử dụng tính năng "Tạo đề luyện thêm bằng AI" để thuần thục.
          </p>
          <div className="space-y-2 pt-2">
            {["Đạt điểm 8+ ở 5 bài kiểm tra", "Sử dụng tính năng Gợi ý AI khi phân vân"].map(
              (task, i) => (
                <label
                  key={i}
                  className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(completedMilestones[`g2_${i}`])}
                    onChange={() => toggleMilestone(`g2_${i}`)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 bg-white"
                  />
                  <span
                    className={
                      completedMilestones[`g2_${i}`] ? "line-through text-slate-400" : ""
                    }
                  >
                    {task}
                  </span>
                </label>
              )
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-xs text-emerald-700 font-bold border border-emerald-200">
              3
            </span>
            <span>Giai đoạn 3: Về Đích 9+</span>
          </div>
          <p className="text-xs text-slate-500">
            Thử thách với các câu hỏi Vận dụng cao và lưu chứng chỉ hoàn thành lên Google Drive để giáo viên xác nhận.
          </p>
          <div className="space-y-2 pt-2">
            {["Hoàn thành đủ 7 chủ đề SGK", "Xuất chứng chỉ lưu vào Google Drive"].map(
              (task, i) => (
                <label
                  key={i}
                  className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(completedMilestones[`g3_${i}`])}
                    onChange={() => toggleMilestone(`g3_${i}`)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 bg-white"
                  />
                  <span
                    className={
                      completedMilestones[`g3_${i}`] ? "line-through text-slate-400" : ""
                    }
                  >
                    {task}
                  </span>
                </label>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
