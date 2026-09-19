import { TestResult, StudentAccount } from "../types";
import { StreakData } from "./streakService";
import { getStudentAccounts } from "./accountService";
import { INITIAL_STUDENTS_MOCK } from "../data/curriculumData";

export interface LeaderboardStudent {
  id: string;
  studentCode: string;
  name: string;
  className: string;
  testsCompleted: number;
  averageScore: number;
  totalPoints: number;
  streakDays: number;
  longestStreak: number;
  lastActive: string;
  isCurrentUser: boolean;
  rank?: number;
}

// Màu avatar sinh động cho từng học sinh
const AVATAR_COLORS: Record<string, { bg: string; text: string }> = {
  "hs-01": { bg: "bg-blue-100 border-blue-300", text: "text-blue-700" },
  "hs-02": { bg: "bg-purple-100 border-purple-300", text: "text-purple-700" },
  "hs-03": { bg: "bg-amber-100 border-amber-300", text: "text-amber-700" },
  "hs-04": { bg: "bg-emerald-100 border-emerald-300", text: "text-emerald-700" },
  "hs-05": { bg: "bg-rose-100 border-rose-300", text: "text-rose-700" },
  "hs-06": { bg: "bg-cyan-100 border-cyan-300", text: "text-cyan-700" },
  "hs-07": { bg: "bg-indigo-100 border-indigo-300", text: "text-indigo-700" },
  "hs-08": { bg: "bg-pink-100 border-pink-300", text: "text-pink-700" },
  "hs-09": { bg: "bg-teal-100 border-teal-300", text: "text-teal-700" },
  "hs-10": { bg: "bg-violet-100 border-violet-300", text: "text-violet-700" },
  "hs-11": { bg: "bg-sky-100 border-sky-300", text: "text-sky-700" },
  "hs-12": { bg: "bg-fuchsia-100 border-fuchsia-300", text: "text-fuchsia-700" },
  "hs-13": { bg: "bg-lime-100 border-lime-300", text: "text-lime-700" },
  "hs-14": { bg: "bg-orange-100 border-orange-300", text: "text-orange-700" },
  "hs-15": { bg: "bg-yellow-100 border-yellow-300", text: "text-yellow-700" },
  "hs-16": { bg: "bg-emerald-100 border-emerald-300", text: "text-emerald-700" },
};

// Dữ liệu streak mẫu ổn định cho các bạn cùng lớp để tạo không khí thi đua
const MOCK_PEER_STREAKS: Record<string, { currentStreak: number; longestStreak: number; lastActive: string }> = {
  "hs-02": { currentStreak: 7, longestStreak: 12, lastActive: "1 giờ trước" },
  "hs-06": { currentStreak: 6, longestStreak: 9, lastActive: "30 phút trước" },
  "hs-04": { currentStreak: 5, longestStreak: 8, lastActive: "3 giờ trước" },
  "hs-03": { currentStreak: 2, longestStreak: 4, lastActive: "Hôm qua" },
  "hs-05": { currentStreak: 1, longestStreak: 3, lastActive: "2 ngày trước" },
  "hs-07": { currentStreak: 6, longestStreak: 10, lastActive: "10 phút trước" },
  "hs-08": { currentStreak: 3, longestStreak: 6, lastActive: "5 giờ trước" },
  "hs-09": { currentStreak: 8, longestStreak: 14, lastActive: "45 phút trước" },
  "hs-10": { currentStreak: 4, longestStreak: 7, lastActive: "Hôm qua" },
  "hs-11": { currentStreak: 5, longestStreak: 9, lastActive: "2 giờ trước" },
  "hs-12": { currentStreak: 9, longestStreak: 15, lastActive: "15 phút trước" },
  "hs-13": { currentStreak: 3, longestStreak: 5, lastActive: "1 ngày trước" },
  "hs-14": { currentStreak: 7, longestStreak: 11, lastActive: "3 giờ trước" },
  "hs-15": { currentStreak: 6, longestStreak: 10, lastActive: "Hôm nay" },
  "hs-16": { currentStreak: 4, longestStreak: 8, lastActive: "4 giờ trước" },
};

/**
 * Lấy danh sách bảng xếp hạng kết hợp giữa dữ liệu thực của học sinh đang đăng nhập
 * và các bạn trong lớp / khối.
 */
export function getLeaderboardData(params: {
  currentStudentCode?: string;
  currentTestHistory: TestResult[];
  currentStreakData?: StreakData;
  classNameFilter?: string; // "all" hoặc "12A1", "12A2", v.v.
  sortBy?: "points" | "streak";
}): LeaderboardStudent[] {
  const {
    currentStudentCode,
    currentTestHistory,
    currentStreakData,
    classNameFilter = "all",
    sortBy = "points",
  } = params;

  const accounts = getStudentAccounts();
  const studentsMap = new Map<string, LeaderboardStudent>();

  // 1. Nạp dữ liệu từ danh sách tài khoản học sinh
  accounts.forEach((acc) => {
    // Tìm thông tin mẫu tương ứng nếu có
    const mockInfo = INITIAL_STUDENTS_MOCK.find(
      (m) => m.id === acc.id || m.name.toLowerCase() === acc.name.toLowerCase()
    );

    const peerStreak = MOCK_PEER_STREAKS[acc.id] || {
      currentStreak: Math.max(1, (acc.name.length * 3) % 6),
      longestStreak: Math.max(3, (acc.name.length * 4) % 10),
      lastActive: "Gần đây",
    };

    const testsCount = mockInfo ? mockInfo.testsCompleted : 3;
    const avg = mockInfo ? mockInfo.averageScore : 7.5;
    const totalPts = Math.round(testsCount * avg * 10);

    studentsMap.set(acc.studentCode.toUpperCase(), {
      id: acc.id,
      studentCode: acc.studentCode,
      name: acc.name,
      className: acc.className,
      testsCompleted: testsCount,
      averageScore: avg,
      totalPoints: totalPts,
      streakDays: peerStreak.currentStreak,
      longestStreak: peerStreak.longestStreak,
      lastActive: mockInfo?.lastActive || peerStreak.lastActive,
      isCurrentUser: false,
    });
  });

  // 2. Cập nhật số liệu THỰC TẾ của học sinh đang đăng nhập
  const currentUserKey = (currentStudentCode || "12A101").toUpperCase();
  const currentStudent = studentsMap.get(currentUserKey);

  const completedTestsCount = currentTestHistory.length;
  const currentAvg =
    completedTestsCount > 0
      ? Number((currentTestHistory.reduce((s, r) => s + r.score, 0) / completedTestsCount).toFixed(1))
      : 0;
  // Tổng điểm tích lũy: mỗi bài 10 điểm = 100 điểm tích lũy
  const currentTotalPts = currentTestHistory.reduce(
    (sum, t) => sum + Math.round(t.score * 10),
    0
  );

  const currentStreakDays = currentStreakData ? currentStreakData.currentStreak : 3;
  const currentLongest = currentStreakData ? currentStreakData.longestStreak : 5;

  if (currentStudent) {
    currentStudent.testsCompleted = completedTestsCount;
    currentStudent.averageScore = currentAvg;
    currentStudent.totalPoints = currentTotalPts;
    currentStudent.streakDays = currentStreakDays;
    currentStudent.longestStreak = currentLongest;
    currentStudent.lastActive = "Đang trực tuyến";
    currentStudent.isCurrentUser = true;
  } else {
    // Nếu chưa có trong danh sách thì tự thêm vào
    studentsMap.set(currentUserKey, {
      id: "hs-current",
      studentCode: currentUserKey,
      name: "Bạn (Học Sinh)",
      className: "12A1",
      testsCompleted: completedTestsCount,
      averageScore: currentAvg,
      totalPoints: currentTotalPts,
      streakDays: currentStreakDays,
      longestStreak: currentLongest,
      lastActive: "Đang trực tuyến",
      isCurrentUser: true,
    });
  }

  // 3. Lọc theo lớp
  let list = Array.from(studentsMap.values());
  if (classNameFilter && classNameFilter !== "all") {
    list = list.filter((s) => s.className.toLowerCase() === classNameFilter.toLowerCase());
  }

  // 4. Sắp xếp thứ hạng
  if (sortBy === "streak") {
    list.sort((a, b) => {
      if (b.streakDays !== a.streakDays) return b.streakDays - a.streakDays;
      if (b.longestStreak !== a.longestStreak) return b.longestStreak - a.longestStreak;
      return b.totalPoints - a.totalPoints;
    });
  } else {
    // Sort by points
    list.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.averageScore !== a.averageScore) return b.averageScore - a.averageScore;
      return b.testsCompleted - a.testsCompleted;
    });
  }

  // 5. Gán thứ hạng
  return list.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}

export function getAvatarColor(id: string) {
  return AVATAR_COLORS[id] || { bg: "bg-slate-100 border-slate-300", text: "text-slate-700" };
}
