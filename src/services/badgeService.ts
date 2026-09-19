import { AchievementBadge, TestResult } from "../types";
import { StreakData } from "./streakService";

const BADGE_STORAGE_PREFIX = "tinhoc12_unlocked_badges";

/**
 * Lấy danh sách thời gian mở khóa các huy hiệu đã lưu
 */
export function getUnlockedBadgeTimestamps(studentId?: string): Record<string, string> {
  const key = studentId ? `${BADGE_STORAGE_PREFIX}_${studentId}` : `${BADGE_STORAGE_PREFIX}_default`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Could not read unlocked badges", e);
  }
  return {};
}

/**
 * Lưu thời gian mở khóa một huy hiệu
 */
export function saveUnlockedBadgeTimestamp(badgeId: string, studentId?: string, timestamp?: string): void {
  const key = studentId ? `${BADGE_STORAGE_PREFIX}_${studentId}` : `${BADGE_STORAGE_PREFIX}_default`;
  try {
    const records = getUnlockedBadgeTimestamps(studentId);
    if (!records[badgeId]) {
      records[badgeId] = timestamp || new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(records));
    }
  } catch (e) {
    console.warn("Could not save unlocked badge", e);
  }
}

/**
 * Tính toán toàn bộ danh sách huy hiệu và trạng thái tiến độ của học sinh
 */
export function calculateBadges(
  testHistory: TestResult[],
  streakData?: StreakData,
  studentId?: string
): AchievementBadge[] {
  const timestamps = getUnlockedBadgeTimestamps(studentId);
  const nowISO = new Date().toISOString();

  // Metrics tính toán
  const totalCompleted = testHistory.length;
  const totalQuestions = testHistory.reduce((s, t) => s + t.totalQuestions, 0);
  const totalCorrect = testHistory.reduce((s, t) => s + t.correctCount, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const avgScore = totalCompleted > 0 ? Number((testHistory.reduce((s, t) => s + t.score, 0) / totalCompleted).toFixed(1)) : 0;
  
  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || currentStreak;
  const effectiveStreak = Math.max(currentStreak, longestStreak);

  const distinctLessons = new Set(testHistory.map((t) => t.lessonId)).size;
  const hasPerfect10 = testHistory.some((t) => t.score >= 10.0);
  const hasFastGoodTest = testHistory.some((t) => t.score >= 8.0 && t.timeSpentSeconds > 0 && t.timeSpentSeconds <= 60);

  // 1. Hard Worker: Hitting a 7-day streak
  const hardWorkerUnlocked = effectiveStreak >= 7;
  if (hardWorkerUnlocked && !timestamps["hard_worker"]) {
    saveUnlockedBadgeTimestamp("hard_worker", studentId, nowISO);
    timestamps["hard_worker"] = nowISO;
  }

  // 2. Top Scorer: High accuracy (>= 90% with at least 2 tests or achieving a 10/10 perfect score)
  const topScorerUnlocked = (totalCompleted >= 2 && accuracy >= 90) || hasPerfect10;
  if (topScorerUnlocked && !timestamps["top_scorer"]) {
    saveUnlockedBadgeTimestamp("top_scorer", studentId, nowISO);
    timestamps["top_scorer"] = nowISO;
  }

  // 3. First Step: Hoàn thành bài trắc nghiệm đầu tiên
  const firstStepUnlocked = totalCompleted >= 1;
  if (firstStepUnlocked && !timestamps["first_step"]) {
    saveUnlockedBadgeTimestamp("first_step", studentId, nowISO);
    timestamps["first_step"] = nowISO;
  }

  // 4. Persistent Learner: Đạt streak 3 ngày
  const persistentUnlocked = effectiveStreak >= 3;
  if (persistentUnlocked && !timestamps["persistent_learner"]) {
    saveUnlockedBadgeTimestamp("persistent_learner", studentId, nowISO);
    timestamps["persistent_learner"] = nowISO;
  }

  // 5. Master Explorer: Hoàn thành 5 bài học khác nhau trong SGK
  const explorerUnlocked = distinctLessons >= 5;
  if (explorerUnlocked && !timestamps["master_explorer"]) {
    saveUnlockedBadgeTimestamp("master_explorer", studentId, nowISO);
    timestamps["master_explorer"] = nowISO;
  }

  // 6. Speed Runner: Đạt điểm >= 8.0 trong dưới 60 giây
  const speedRunnerUnlocked = hasFastGoodTest;
  if (speedRunnerUnlocked && !timestamps["speed_runner"]) {
    saveUnlockedBadgeTimestamp("speed_runner", studentId, nowISO);
    timestamps["speed_runner"] = nowISO;
  }

  // 7. Century Club: Trả lời đúng tích lũy >= 25 câu hỏi
  const centuryClubUnlocked = totalCorrect >= 25;
  if (centuryClubUnlocked && !timestamps["century_club"]) {
    saveUnlockedBadgeTimestamp("century_club", studentId, nowISO);
    timestamps["century_club"] = nowISO;
  }

  // 8. Tech Master: Đạt điểm trung bình >= 8.5 với ít nhất 3 bài đã làm
  const techMasterUnlocked = totalCompleted >= 3 && avgScore >= 8.5;
  if (techMasterUnlocked && !timestamps["tech_master"]) {
    saveUnlockedBadgeTimestamp("tech_master", studentId, nowISO);
    timestamps["tech_master"] = nowISO;
  }

  const badges: AchievementBadge[] = [
    {
      id: "hard_worker",
      name: "Chăm Chỉ Bền Bỉ",
      englishName: "Hard Worker",
      description: "Duy trì chuỗi học tập liên tiếp đạt mốc 7 ngày (7-day streak)",
      category: "streak",
      iconName: "flame",
      rarity: "epic",
      colorGradient: "from-amber-500 via-orange-500 to-red-500",
      bgLight: "bg-orange-50",
      borderColor: "border-orange-200",
      targetValue: 7,
      currentValue: effectiveStreak,
      unit: "ngày",
      isUnlocked: hardWorkerUnlocked,
      unlockedAt: timestamps["hard_worker"],
    },
    {
      id: "top_scorer",
      name: "Thủ Khoa Đỉnh Cao",
      englishName: "Top Scorer",
      description: "Độ chính xác xuất sắc >= 90% (tối thiểu 2 bài) hoặc đạt điểm 10 tuyệt đối",
      category: "accuracy",
      iconName: "trophy",
      rarity: "legendary",
      colorGradient: "from-yellow-400 via-amber-500 to-yellow-600",
      bgLight: "bg-amber-50",
      borderColor: "border-amber-200",
      targetValue: 90,
      currentValue: hasPerfect10 ? 100 : accuracy,
      unit: "%",
      isUnlocked: topScorerUnlocked,
      unlockedAt: timestamps["top_scorer"],
    },
    {
      id: "first_step",
      name: "Khởi Đầu Vững Chắc",
      englishName: "First Step",
      description: "Hoàn thành bài kiểm tra trắc nghiệm SGK Tin học 12 đầu tiên",
      category: "completion",
      iconName: "sparkles",
      rarity: "common",
      colorGradient: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50",
      borderColor: "border-blue-200",
      targetValue: 1,
      currentValue: totalCompleted,
      unit: "bài",
      isUnlocked: firstStepUnlocked,
      unlockedAt: timestamps["first_step"],
    },
    {
      id: "persistent_learner",
      name: "Học Tập Đều Đặn",
      englishName: "Persistent Learner",
      description: "Xây dựng thói quen với chuỗi 3 ngày học tập liên tiếp",
      category: "streak",
      iconName: "calendar",
      rarity: "common",
      colorGradient: "from-rose-500 to-orange-500",
      bgLight: "bg-rose-50",
      borderColor: "border-rose-200",
      targetValue: 3,
      currentValue: Math.min(3, effectiveStreak),
      unit: "ngày",
      isUnlocked: persistentUnlocked,
      unlockedAt: timestamps["persistent_learner"],
    },
    {
      id: "master_explorer",
      name: "Nhà Thám Hiểm Tri Thức",
      englishName: "Master Explorer",
      description: "Chinh phục và hoàn thành trắc nghiệm ở 5 bài học khác nhau trong chương trình",
      category: "completion",
      iconName: "book-open",
      rarity: "rare",
      colorGradient: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50",
      borderColor: "border-emerald-200",
      targetValue: 5,
      currentValue: distinctLessons,
      unit: "bài",
      isUnlocked: explorerUnlocked,
      unlockedAt: timestamps["master_explorer"],
    },
    {
      id: "century_club",
      name: "Bách Phát Bách Trúng",
      englishName: "Century Club",
      description: "Tích lũy trả lời đúng từ 25 câu hỏi trắc nghiệm trở lên",
      category: "accuracy",
      iconName: "target",
      rarity: "rare",
      colorGradient: "from-cyan-500 to-blue-600",
      bgLight: "bg-cyan-50",
      borderColor: "border-cyan-200",
      targetValue: 25,
      currentValue: totalCorrect,
      unit: "câu đúng",
      isUnlocked: centuryClubUnlocked,
      unlockedAt: timestamps["century_club"],
    },
    {
      id: "speed_runner",
      name: "Tia Chớp Nhạy Bén",
      englishName: "Speed Runner",
      description: "Hoàn thành bài thi đạt điểm từ 8.0 trở lên trong thời gian dưới 60 giây",
      category: "speed",
      iconName: "zap",
      rarity: "rare",
      colorGradient: "from-purple-500 to-indigo-600",
      bgLight: "bg-purple-50",
      borderColor: "border-purple-200",
      targetValue: 1,
      currentValue: hasFastGoodTest ? 1 : 0,
      unit: "lần",
      isUnlocked: speedRunnerUnlocked,
      unlockedAt: timestamps["speed_runner"],
    },
    {
      id: "tech_master",
      name: "Bậc Thầy Tin Học 12",
      englishName: "Tech Master",
      description: "Đạt điểm trung bình từ 8.5/10 trở lên sau khi hoàn thành ít nhất 3 bài học",
      category: "mastery",
      iconName: "graduation-cap",
      rarity: "legendary",
      colorGradient: "from-fuchsia-600 via-pink-600 to-purple-700",
      bgLight: "bg-fuchsia-50",
      borderColor: "border-fuchsia-200",
      targetValue: 8.5,
      currentValue: avgScore,
      unit: "điểm",
      isUnlocked: techMasterUnlocked,
      unlockedAt: timestamps["tech_master"],
    },
  ];

  return badges;
}

/**
 * Kiểm tra các huy hiệu vừa được mở khóa sau khi hoàn thành một bài test
 */
export function detectNewlyUnlockedBadges(
  previousBadges: AchievementBadge[],
  updatedBadges: AchievementBadge[]
): AchievementBadge[] {
  const prevMap = new Map(previousBadges.map((b) => [b.id, b.isUnlocked]));
  return updatedBadges.filter((b) => b.isUnlocked && !prevMap.get(b.id));
}
