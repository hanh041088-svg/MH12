import React, { useState } from "react";
import { TeacherStudentSummary, StudentAccount } from "../types";
import { INITIAL_STUDENTS_MOCK, ALL_LESSONS } from "../data/curriculumData";
import {
  Users,
  Award,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Cloud,
  ExternalLink,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  KeyRound,
  BarChart2,
} from "lucide-react";
import { uploadToDrive, generateGradebookWorkbook } from "../services/driveService";
import { StudentAccountManager } from "./StudentAccountManager";
import { getStudentAccounts, ALL_CLASSES } from "../services/accountService";

interface TeacherDashboardProps {
  accessToken: string | null;
  teacherName: string;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  accessToken,
  teacherName,
}) => {
  const [dashboardTab, setDashboardTab] = useState<"gradebook" | "accounts">("gradebook");
  const [students, setStudents] = useState<TeacherStudentSummary[]>(INITIAL_STUDENTS_MOCK);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Add new student modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newStudentName, setNewStudentName] = useState<string>("");
  const [newStudentClass, setNewStudentClass] = useState<string>("12A1");
  const [newStudentEmail, setNewStudentEmail] = useState<string>("");

  // Drive export state
  const [isExportingToDrive, setIsExportingToDrive] = useState<boolean>(false);
  const [driveExportLink, setDriveExportLink] = useState<string | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchClass = selectedClass === "all" || s.className === selectedClass;
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchSearch;
  });

  // Calculate metrics
  const totalStudents = students.length;
  const classAvgScore =
    totalStudents > 0
      ? Number((students.reduce((acc, s) => acc + s.averageScore, 0) / totalStudents).toFixed(1))
      : 0;

  const excellentCount = students.filter((s) => s.averageScore >= 8.0).length;
  const excellentRate =
    totalStudents > 0 ? Math.round((excellentCount / totalStudents) * 100) : 0;

  // Score distribution counts
  const distXuatsac = students.filter((s) => s.averageScore >= 9.0).length;
  const distGioi = students.filter((s) => s.averageScore >= 8.0 && s.averageScore < 9.0).length;
  const distKha = students.filter((s) => s.averageScore >= 6.5 && s.averageScore < 8.0).length;
  const distYeu = students.filter((s) => s.averageScore < 6.5).length;

  // Find top weak topics across the whole class
  const weakTopicFrequency: Record<string, number> = {};
  students.forEach((s) => {
    s.weakTopics.forEach((t) => {
      weakTopicFrequency[t] = (weakTopicFrequency[t] || 0) + 1;
    });
  });
  const sortedWeakTopics = Object.entries(weakTopicFrequency).sort((a, b) => b[1] - a[1]);

  // Handle Export to Drive
  const handleExportGradebookToDrive = async () => {
    if (!accessToken) {
      alert("Vui lòng nhấn 'Google Drive' ở góc trên bên phải để đăng nhập trước khi xuất báo cáo!");
      return;
    }

    try {
      setIsExportingToDrive(true);
      setDriveError(null);

      const workbook = generateGradebookWorkbook(teacherName || "Thầy Cô Bộ Môn", students);
      const fileName = `BangDiem_TinHoc12_${new Date().toISOString().slice(0, 10)}.xlsx`;

      const res = await uploadToDrive(fileName, workbook, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", accessToken);
      if (res.success && res.webViewLink) {
        setDriveExportLink(res.webViewLink);
      } else {
        throw new Error(res.error || "Không thể tải lên Google Drive");
      }
    } catch (err: any) {
      setDriveError(err.message || "Lỗi lưu file");
    } finally {
      setIsExportingToDrive(false);
    }
  };

  // Handle Add Student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newStudent: TeacherStudentSummary = {
      id: `hs-${Date.now()}`,
      name: newStudentName.trim(),
      email: newStudentEmail.trim() || `student_${Date.now()}@thpt.edu.vn`,
      className: newStudentClass,
      testsCompleted: 0,
      averageScore: 0,
      highestScore: 0,
      lastActive: "Vừa thêm",
      weakTopics: [],
      recentScores: [],
    };

    setStudents([newStudent, ...students]);
    setNewStudentName("");
    setNewStudentEmail("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2 border border-indigo-200">
            <Users className="w-3.5 h-3.5" />
            <span>Bảng Điều Khiển Dành Cho Giáo Viên</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Xin chào, {teacherName || "Phạm Thị Hạnh"}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý điểm số, phân tích năng lực học sinh các lớp và xuất báo cáo sang Google Drive.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDashboardTab("accounts")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <KeyRound className="w-4 h-4" />
            <span>Cấp tài khoản HS</span>
          </button>

          <button
            onClick={handleExportGradebookToDrive}
            disabled={isExportingToDrive}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all"
            title="Lưu toàn bộ bảng điểm lớp học vào Google Drive"
          >
            <Cloud className="w-4 h-4" />
            <span>
              {isExportingToDrive ? "Đang xuất Drive..." : "Xuất bảng điểm lên Drive"}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Switcher: Sổ điểm vs Quản lý cấp tài khoản */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setDashboardTab("gradebook")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            dashboardTab === "gradebook"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Sổ Điểm & Báo Cáo Phổ Điểm</span>
        </button>

        <button
          onClick={() => setDashboardTab("accounts")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            dashboardTab === "accounts"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Cấp & Quản Lý Tài Khoản Học Sinh</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            dashboardTab === "accounts" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-800"
          }`}>
            {getStudentAccounts().length}
          </span>
        </button>
      </div>

      {dashboardTab === "accounts" ? (
        <StudentAccountManager
          onAccountCreated={(newAcc) => {
            const newStudent: TeacherStudentSummary = {
              id: newAcc.id,
              name: newAcc.name,
              email: newAcc.email || `${newAcc.studentCode.toLowerCase()}@thpt.edu.vn`,
              className: newAcc.className,
              testsCompleted: 0,
              averageScore: 0,
              highestScore: 0,
              lastActive: "Vừa cấp tài khoản",
              weakTopics: [],
              recentScores: [],
            };
            setStudents((prev) => [newStudent, ...prev]);
          }}
        />
      ) : (
        <>
      {/* Drive Export Success banner */}
      {driveExportLink && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4 text-xs text-emerald-800 animate-in fade-in shadow-2xs">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Đã xuất bảng điểm môn Tin học 12 thành công lên Google Drive của bạn!
            </span>
          </div>
          <a
            href={driveExportLink}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-1.5 hover:bg-emerald-500 transition-colors shrink-0"
          >
            <span>Mở tệp trên Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
      {driveError && (
        <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs">
          {driveError}
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số học sinh</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{totalStudents}</span>
            <span className="text-xs text-slate-500 font-semibold">em</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Các lớp 12A1 đến 12A8</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trung bình lớp</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-600">{classAvgScore}</span>
            <span className="text-xs text-emerald-600 font-bold">↑ 12%</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Mặt bằng chung học sinh đạt loại Khá</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hoàn thành</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-600">{excellentRate}%</span>
            <span className="text-xs text-slate-500 font-medium">{excellentCount}/{totalStudents} bài</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {excellentCount}/{totalStudents} học sinh đạt từ 8.0 trở lên
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
            <span className="text-3xl font-bold text-amber-600">{distYeu < 10 ? `0${distYeu}` : distYeu}</span>
            <span className="text-xs text-slate-500 font-semibold">học sinh</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cần củng cố bài Mạng & CSS</div>
        </div>
      </div>

      {/* Analytics Charts Section (Biểu đồ phổ điểm + Điểm nóng bài học sai nhiều) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phổ điểm cả lớp */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Biểu Đồ Phân Bố Phổ Điểm Cả Lớp
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Thống kê số lượng học sinh theo từng khung xếp loại điểm số
          </p>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Xuất sắc (9.0 - 10.0)</span>
                <span className="font-bold text-emerald-600">{distXuatsac} học sinh ({Math.round((distXuatsac/totalStudents)*100)}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(distXuatsac / totalStudents) * 100}%` }}
                  className="h-full bg-emerald-500 rounded-full transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Giỏi (8.0 - 8.9)</span>
                <span className="font-bold text-blue-600">{distGioi} học sinh ({Math.round((distGioi/totalStudents)*100)}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(distGioi / totalStudents) * 100}%` }}
                  className="h-full bg-blue-600 rounded-full transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Khá (6.5 - 7.9)</span>
                <span className="font-bold text-amber-600">{distKha} học sinh ({Math.round((distKha/totalStudents)*100)}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(distKha / totalStudents) * 100}%` }}
                  className="h-full bg-amber-500 rounded-full transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Trung bình / Yếu (&lt; 6.5)</span>
                <span className="font-bold text-rose-600">{distYeu} học sinh ({Math.round((distYeu/totalStudents)*100)}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(distYeu / totalStudents) * 100}%` }}
                  className="h-full bg-rose-500 rounded-full transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Điểm nóng kiến thức học sinh hay sai */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Chủ Đề & Bài Học Học Sinh Hay Mắc Lỗi Nhất</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Giáo viên nên dành thời gian ôn tập hoặc củng cố trên lớp các nội dung này
            </p>

            <div className="space-y-3">
              {sortedWeakTopics.map(([topicName, count], idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800">{topicName}</span>
                  </div>
                  <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    {count} học sinh cần ôn lại
                  </span>
                </div>
              ))}

              {sortedWeakTopics.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Không có chủ đề nào có tỷ lệ sai vượt ngưỡng cảnh báo.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 bg-amber-50/70 p-4 rounded-2xl border border-amber-200 flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-xs font-bold text-amber-900">Khuyến nghị từ Trợ lý AI</p>
              <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                Nên tổ chức 1 tiết phụ đạo thực hành về "Bộ chọn và độ ưu tiên CSS" và "Phân biệt Hub, Switch, Router TCP/IP" để cải thiện điểm số cho nhóm học sinh còn yếu.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student List Table & Score Management */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-base">
              Bảng Điểm Học Sinh Chi Tiết
            </h2>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            {/* Class filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto max-w-full scrollbar-none">
              <button
                onClick={() => setSelectedClass("all")}
                className={`px-3 py-1 rounded-lg transition-all shrink-0 ${
                  selectedClass === "all" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tất cả lớp
              </button>
              {ALL_CLASSES.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
                    selectedClass === cls ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm học sinh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-4 text-center">Lớp</th>
                <th className="py-3 px-4 text-center">Bài đã làm</th>
                <th className="py-3 px-4 text-center">Điểm TB</th>
                <th className="py-3 px-4 text-center">Điểm cao nhất</th>
                <th className="py-3 px-4">Chủ đề cần cải thiện</th>
                <th className="py-3 px-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => {
                const isExpanded = expandedStudentId === s.id;
                return (
                  <React.Fragment key={s.id}>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-500">{s.email}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">
                        {s.className}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-600">
                        {s.testsCompleted} / 28
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-bold text-sm ${
                            s.averageScore >= 8.0
                              ? "text-emerald-600"
                              : s.averageScore >= 6.5
                              ? "text-blue-600"
                              : "text-amber-600"
                          }`}
                        >
                          {s.averageScore.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {s.highestScore.toFixed(1)}
                      </td>
                      <td className="py-3 px-4">
                        {s.weakTopics.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {s.weakTopics.map((t, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-medium">
                            ✓ Nắm vững toàn diện
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setExpandedStudentId(isExpanded ? null : s.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Xem chi tiết các bài kiểm tra"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Detail Rows */}
                    {isExpanded && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={7} className="p-4">
                          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                            <h4 className="font-bold text-slate-900 text-xs">
                              Chi tiết điểm các bài gần đây của {s.name}:
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {s.recentScores.map((scoreItem, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                                >
                                  <span className="truncate pr-2 font-medium text-slate-700">
                                    {scoreItem.lessonTitle}
                                  </span>
                                  <span
                                    className={`font-bold shrink-0 ${
                                      scoreItem.score >= 8
                                        ? "text-emerald-600"
                                        : scoreItem.score >= 6.5
                                        ? "text-blue-600"
                                        : "text-amber-600"
                                    }`}
                                  >
                                    {scoreItem.score.toFixed(1)}đ
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Lần hoạt động cuối: {s.lastActive}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 text-slate-800">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Thêm Học Sinh Vào Sổ Điểm
            </h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên học sinh *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hoàng Minh Châu"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lớp *
                </label>
                <select
                  value={newStudentClass}
                  onChange={(e) => setNewStudentClass(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-semibold"
                >
                  {ALL_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email (tùy chọn)
                </label>
                <input
                  type="email"
                  placeholder="minhchau.12a1@thpt.edu.vn"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-500 shadow-xs"
                >
                  Thêm vào danh sách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
