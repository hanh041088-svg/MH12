export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  activeDates: string[]; // List of YYYY-MM-DD
}

const STORAGE_KEY_STREAK = "tinhoc12_study_streak";
const STORAGE_KEY_INACTIVITY_DISMISSED = "tinhoc12_inactivity_reminder_dismissed";

/**
 * Tính số ngày kể từ lần học gần nhất dựa trên lastActiveDate
 */
export function getDaysSinceLastActive(lastActiveDate?: string): number {
  if (!lastActiveDate) return 0;
  try {
    const todayStr = getLocalDateString();
    if (lastActiveDate === todayStr) return 0;

    const [y1, m1, d1] = todayStr.split("-").map(Number);
    const [y2, m2, d2] = lastActiveDate.split("-").map(Number);

    const dToday = new Date(y1, m1 - 1, d1);
    const dLast = new Date(y2, m2 - 1, d2);

    const diffTime = dToday.getTime() - dLast.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch {
    return 0;
  }
}

/**
 * Kiểm tra xem có nên hiển thị thông báo nhắc nhở vắng học hay không (>= 2 ngày)
 */
export function checkInactivityStatus(streakData: StreakData): {
  isInactive: boolean;
  daysInactive: number;
  lastActiveDate: string;
} {
  const daysInactive = getDaysSinceLastActive(streakData.lastActiveDate);
  return {
    isInactive: daysInactive >= 2,
    daysInactive,
    lastActiveDate: streakData.lastActiveDate,
  };
}

/**
 * Đánh dấu người dùng đã tắt nhắc nhở trong phiên làm việc hiện tại
 */
export function dismissInactivityReminder(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY_INACTIVITY_DISMISSED, "true");
  } catch {}
}

/**
 * Kiểm tra xem người dùng đã tắt nhắc nhở trong phiên hiện tại chưa
 */
export function isReminderDismissed(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY_INACTIVITY_DISMISSED) === "true";
  } catch {
    return false;
  }
}

/**
 * Mô phỏng trạng thái vắng học N ngày (phục vụ kiểm thử trực tiếp)
 */
export function simulateInactiveDays(daysAgo: number, studentId?: string): StreakData {
  const key = studentId ? `${STORAGE_KEY_STREAK}_${studentId}` : STORAGE_KEY_STREAK;
  const current = getStreakData(studentId);
  const targetDate = new Date(Date.now() - 86400000 * daysAgo);
  const targetDateStr = getLocalDateString(targetDate);

  current.lastActiveDate = targetDateStr;
  if (daysAgo >= 2) {
    current.currentStreak = 0;
  }

  try {
    localStorage.setItem(key, JSON.stringify(current));
    sessionStorage.removeItem(STORAGE_KEY_INACTIVITY_DISMISSED);
  } catch {}

  return current;
}

/**
 * Lấy chuỗi ngày định dạng YYYY-MM-DD theo giờ địa phương
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Lấy dữ liệu streak hiện tại của học sinh
 */
export function getStreakData(studentId?: string): StreakData {
  const key = studentId ? `${STORAGE_KEY_STREAK}_${studentId}` : STORAGE_KEY_STREAK;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const data: StreakData = JSON.parse(raw);
      // Kiểm tra xem streak có bị đứt không (nếu ngày cuối cách xa hơn 1 ngày)
      const today = getLocalDateString();
      const yesterday = getLocalDateString(new Date(Date.now() - 86400000));
      
      if (data.lastActiveDate && data.lastActiveDate !== today && data.lastActiveDate !== yesterday) {
        // Đã quá 1 ngày không học -> streak quay về 0 (hoặc nếu mở hôm nay thì thành 1 khi ghi nhận)
        data.currentStreak = 0;
      }
      return data;
    }
  } catch (e) {
    console.warn("Could not load streak data", e);
  }

  // Khởi tạo mặc định: kích hoạt streak 3 ngày để học sinh thấy hào hứng ban đầu
  const today = getLocalDateString();
  const yesterday = getLocalDateString(new Date(Date.now() - 86400000));
  const dayBeforeYesterday = getLocalDateString(new Date(Date.now() - 86400000 * 2));
  
  const defaultStreak: StreakData = {
    currentStreak: 3,
    longestStreak: 5,
    lastActiveDate: today,
    activeDates: [dayBeforeYesterday, yesterday, today],
  };
  try {
    localStorage.setItem(key, JSON.stringify(defaultStreak));
  } catch {}
  return defaultStreak;
}

/**
 * Ghi nhận một ngày học tập / hoàn thành bài kiểm tra
 */
export function recordStudyActivity(studentId?: string): StreakData {
  const key = studentId ? `${STORAGE_KEY_STREAK}_${studentId}` : STORAGE_KEY_STREAK;
  const current = getStreakData(studentId);
  const today = getLocalDateString();
  const yesterday = getLocalDateString(new Date(Date.now() - 86400000));

  if (!current.activeDates.includes(today)) {
    current.activeDates.push(today);
  }

  if (current.lastActiveDate === today) {
    // Đã học hôm nay rồi, giữ nguyên streak
  } else if (current.lastActiveDate === yesterday) {
    // Học ngày tiếp theo liền kề -> tăng streak
    current.currentStreak += 1;
    if (current.currentStreak > current.longestStreak) {
      current.longestStreak = current.currentStreak;
    }
    current.lastActiveDate = today;
  } else {
    // Bị ngắt quãng hoặc lần đầu -> streak = 1
    current.currentStreak = 1;
    if (current.longestStreak < 1) current.longestStreak = 1;
    current.lastActiveDate = today;
  }

  try {
    localStorage.setItem(key, JSON.stringify(current));
  } catch (e) {
    console.warn("Could not save streak", e);
  }

  return current;
}
