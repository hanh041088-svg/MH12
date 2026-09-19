import React, { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, getCachedToken } from "./services/firebaseAuth";
import { Lesson, TestResult, CurrentUserSession, StudentAccount, TeacherAccount } from "./types";
import { ALL_LESSONS } from "./data/curriculumData";
import { Navbar } from "./components/Navbar";
import { LessonList } from "./components/LessonList";
import { TestView } from "./components/TestView";
import { StudentAnalytics } from "./components/StudentAnalytics";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { PersonalizedRoadmap } from "./components/PersonalizedRoadmap";
import { AIChatbot } from "./components/AIChatbot";
import { LoginModal } from "./components/LoginModal";
import { LoginScreen } from "./components/LoginScreen";
import { StudentProfileModal } from "./components/StudentProfileModal";
import { ZaloSupportWidget } from "./components/ZaloSupportWidget";
import {
  getCurrentSession,
  saveCurrentSession,
  logoutAccount,
  getLastStudentCode,
  getStudentAccounts,
} from "./services/accountService";
import {
  getStreakData,
  recordStudyActivity,
  StreakData,
  checkInactivityStatus,
  getDaysSinceLastActive,
  isReminderDismissed,
  simulateInactiveDays,
} from "./services/streakService";
import {
  applyThemeColor,
  getSavedThemeColor,
  saveThemeColor,
} from "./services/themeService";
import {
  getLatestWrongQuestions,
  LatestWrongQuestionsData,
} from "./services/flashcardService";
import { WrongQuestionsFlashcardModal } from "./components/WrongQuestionsFlashcardModal";
import { InactivityReminder } from "./components/InactivityReminder";
import { MobileAppInstallModal } from "./components/MobileAppInstallModal";

// Initial mock test results to make the charts and analytics immediately visually rich!
const INITIAL_TEST_HISTORY: TestResult[] = [
  // Tuần 1 (khoảng 22-26 ngày trước)
  {
    id: "res-init-w1-1",
    lessonId: "bai-10",
    lessonTitle: "Bài 10: Cơ sở dữ liệu quan hệ",
    themeId: "theme-5",
    score: 6.0,
    totalQuestions: 4,
    correctCount: 2,
    timeSpentSeconds: 220,
    completedAt: new Date(Date.now() - 86400000 * 24).toISOString(),
    answers: [],
  },
  {
    id: "res-init-w1-2",
    lessonId: "bai-4",
    lessonTitle: "Bài 4: Thực hành kết nối và sử dụng mạng",
    themeId: "theme-2",
    score: 6.5,
    totalQuestions: 4,
    correctCount: 3,
    timeSpentSeconds: 200,
    completedAt: new Date(Date.now() - 86400000 * 22).toISOString(),
    answers: [],
  },
  // Tuần 2 (khoảng 14-18 ngày trước)
  {
    id: "res-init-w2-1",
    lessonId: "bai-13",
    lessonTitle: "Bài 13: Khái niệm về hệ quản trị cơ sở dữ liệu",
    themeId: "theme-5",
    score: 7.0,
    totalQuestions: 4,
    correctCount: 3,
    timeSpentSeconds: 210,
    completedAt: new Date(Date.now() - 86400000 * 16).toISOString(),
    answers: [],
  },
  {
    id: "res-init-w2-2",
    lessonId: "bai-16",
    lessonTitle: "Bài 16: Định dạng văn bản với CSS",
    themeId: "theme-6",
    score: 7.5,
    totalQuestions: 4,
    correctCount: 3,
    timeSpentSeconds: 190,
    completedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    answers: [],
  },
  // Tuần 3 (khoảng 7-11 ngày trước)
  {
    id: "res-init-w3-1",
    lessonId: "bai-19",
    lessonTitle: "Bài 19: Dịch vụ lưu trữ trực tuyến",
    themeId: "theme-6",
    score: 8.0,
    totalQuestions: 4,
    correctCount: 4,
    timeSpentSeconds: 175,
    completedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    answers: [],
  },
  {
    id: "res-init-w3-2",
    lessonId: "bai-1",
    lessonTitle: "Bài 1: Làm quen với Trí tuệ nhân tạo",
    themeId: "theme-1",
    score: 8.5,
    totalQuestions: 4,
    correctCount: 4,
    timeSpentSeconds: 180,
    completedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    answers: [],
  },
  // Tuần 4 (tuần gần đây nhất)
  {
    id: "res-init-w4-1",
    lessonId: "bai-2",
    lessonTitle: "Bài 2: Trí tuệ nhân tạo trong đời sống",
    themeId: "theme-1",
    score: 7.5,
    totalQuestions: 4,
    correctCount: 3,
    timeSpentSeconds: 210,
    completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    answers: [],
  },
  {
    id: "res-init-w4-2",
    lessonId: "bai-3",
    lessonTitle: "Bài 3: Thiết bị mạng",
    themeId: "theme-2",
    score: 8.0,
    totalQuestions: 4,
    correctCount: 3,
    timeSpentSeconds: 190,
    completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    answers: [],
  },
  {
    id: "res-init-w4-3",
    lessonId: "bai-7",
    lessonTitle: "Bài 7: Tạo trang web và định dạng văn bản",
    themeId: "theme-4",
    score: 9.0,
    totalQuestions: 4,
    correctCount: 4,
    timeSpentSeconds: 140,
    completedAt: new Date().toISOString(),
    answers: [],
  },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    "lessons" | "analytics" | "roadmap" | "chat" | "teacher"
  >("lessons");
  
  // Check if student & teacher are authenticated in the current browser session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const hasSessionAuth = sessionStorage.getItem("tinhoc12_session_authenticated");
      const session = getCurrentSession();
      return hasSessionAuth === "true" && !!session;
    } catch {
      return false;
    }
  });

  // Student & Teacher accounts session state
  const [currentSession, setCurrentSession] = useState<CurrentUserSession | null>(() => getCurrentSession());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<"student" | "teacher">(currentSession?.role || "student");
  const [activeLessonForTest, setActiveLessonForTest] = useState<Lesson | null>(null);

  // Student & Teacher display names
  const [studentName, setStudentName] = useState<string>(() => {
    if (currentSession?.role === "teacher") {
      return currentSession.account?.name || "Phạm Thị Hạnh";
    }
    return currentSession?.role === "student"
      ? currentSession.account?.name || "Nguyễn Văn An"
      : "Nguyễn Văn An";
  });
  const [teacherName, setTeacherName] = useState<string>(() => {
    return currentSession?.role === "teacher"
      ? currentSession.account?.name || "Phạm Thị Hạnh"
      : "Phạm Thị Hạnh";
  });

  // Custom Primary Theme Color
  const [themeColor, setThemeColor] = useState<string>(() => {
    const studentCode =
      currentSession?.role === "student"
        ? (currentSession.account as StudentAccount)?.studentCode
        : undefined;
    return getSavedThemeColor(studentCode);
  });

  // Apply theme color on mount & sync when current student changes
  useEffect(() => {
    const studentCode =
      currentSession?.role === "student"
        ? (currentSession.account as StudentAccount)?.studentCode
        : undefined;
    const currentTheme = getSavedThemeColor(studentCode);
    setThemeColor(currentTheme);
    applyThemeColor(currentTheme);
  }, [currentSession]);

  const handleThemeColorChange = (newColor: string) => {
    const studentCode =
      currentSession?.role === "student"
        ? (currentSession.account as StudentAccount)?.studentCode
        : undefined;
    saveThemeColor(newColor, studentCode);
    setThemeColor(newColor);
    applyThemeColor(newColor);
  };

  // Daily study streak
  const [streakData, setStreakData] = useState<StreakData>(() =>
    getStreakData(currentSession?.role === "student" ? currentSession.account?.id : undefined)
  );

  // Inactivity Reminder state (for >= 2 days without studying)
  const [showInactivityReminder, setShowInactivityReminder] = useState<boolean>(false);
  const [inactivityMode, setInactivityMode] = useState<"toast" | "modal">("toast");
  const [daysInactive, setDaysInactive] = useState<number>(0);

  // Check inactivity on mount / session / streak change:
  useEffect(() => {
    if (!streakData || currentSession?.role !== "student") return;
    const { isInactive, daysInactive: count } = checkInactivityStatus(streakData);
    setDaysInactive(count);
    if (isInactive && !isReminderDismissed()) {
      const timer = setTimeout(() => {
        setInactivityMode("toast");
        setShowInactivityReminder(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [streakData, currentSession]);

  const handleOpenInactivityReminder = (mode: "toast" | "modal" = "modal") => {
    const count = getDaysSinceLastActive(streakData?.lastActiveDate);
    setDaysInactive(count >= 2 ? count : 2);
    setInactivityMode(mode);
    setShowInactivityReminder(true);
  };

  const handleSimulateInactive = (days: number = 2) => {
    const studentId = currentSession?.role === "student" ? currentSession.account?.id : undefined;
    const simulated = simulateInactiveDays(days, studentId);
    setStreakData({ ...simulated });
    setDaysInactive(days);
    if (days >= 2) {
      setInactivityMode("toast");
      setShowInactivityReminder(true);
    } else {
      setShowInactivityReminder(false);
    }
  };

  // Sync session changes with student/teacher names & role
  const handleSessionChange = (newSession: CurrentUserSession) => {
    if (!newSession) return;
    setCurrentSession(newSession);
    setUserRole(newSession.role);
    if (newSession.role === "student") {
      setStudentName(newSession.account?.name || "Học Sinh");
      setStreakData(getStreakData(newSession.account?.id));
      const studentCode = (newSession.account as StudentAccount)?.studentCode;
      const studentTheme = getSavedThemeColor(studentCode);
      setThemeColor(studentTheme);
      applyThemeColor(studentTheme);
      setCurrentTab("lessons");
    } else {
      const tName = newSession.account?.name || "Phạm Thị Hạnh";
      setTeacherName(tName);
      setStudentName(tName);
      setCurrentTab("teacher");
    }
  };

  const handleLoginSuccess = (newSession: CurrentUserSession) => {
    saveCurrentSession(newSession);
    try {
      sessionStorage.setItem("tinhoc12_session_authenticated", "true");
    } catch {}
    handleSessionChange(newSession);
    setIsAuthenticated(true);
  };

  const handleLogoutSession = () => {
    logoutAccount();
    setCurrentSession(null);
    setIsAuthenticated(false);
    setActiveLessonForTest(null);
    setCurrentTab("lessons");
  };

  // Google Auth user & token
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(getCachedToken());

  // Test results history
  const [testHistory, setTestHistory] = useState<TestResult[]>(() => {
    try {
      const saved = localStorage.getItem("tinhoc12_test_history");
      return saved ? JSON.parse(saved) : INITIAL_TEST_HISTORY;
    } catch {
      return INITIAL_TEST_HISTORY;
    }
  });

  // Save test history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("tinhoc12_test_history", JSON.stringify(testHistory));
    } catch (e) {
      console.warn("Could not save test history to localStorage", e);
    }
  }, [testHistory]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.displayName) {
        setStudentName(currentUser.displayName);
      }
      const token = getCachedToken();
      if (token) setAccessToken(token);
    });
    return () => unsubscribe();
  }, []);

  // Chế độ Flashcard ôn câu hỏi sai
  const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState<boolean>(false);
  const [flashcardData, setFlashcardData] = useState<LatestWrongQuestionsData | null>(null);

  // Modal hướng dẫn cài đặt trên điện thoại & chia sẻ mã QR
  const [isMobileInstallOpen, setIsMobileInstallOpen] = useState<boolean>(false);

  const handleOpenFlashcard = (customData?: LatestWrongQuestionsData) => {
    if (customData) {
      setFlashcardData(customData);
    } else {
      const data = getLatestWrongQuestions(testHistory);
      setFlashcardData(data);
    }
    setIsFlashcardModalOpen(true);
  };

  // Handle finish test -> Tăng chuỗi ngày học streak 🔥 và lưu lịch sử làm bài
  const handleFinishTest = (result: TestResult) => {
    setTestHistory((prev) => [result, ...prev]);
    // Ghi nhận chuỗi ngày học liên tiếp
    const updatedStreak = recordStudyActivity(
      currentSession?.role === "student" ? currentSession.account?.id : undefined
    );
    setStreakData({ ...updatedStreak });
  };

  // Nếu chưa đăng nhập trong phiên duyệt này, hiển thị Giao diện Đăng Nhập trước
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        savedStudentCode={getLastStudentCode()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setActiveLessonForTest(null); // Return to standard view when switching tab
          setCurrentTab(tab);
        }}
        userRole={userRole}
        setUserRole={(role) => {
          setUserRole(role);
          if (role === "teacher") {
            setCurrentTab("teacher");
          } else {
            setCurrentTab("lessons");
          }
        }}
        user={user}
        setUser={setUser}
        accessToken={accessToken}
        setAccessToken={setAccessToken}
        studentName={studentName}
        currentSession={currentSession || undefined}
        streakData={streakData}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onLogoutSession={handleLogoutSession}
        currentThemeColor={themeColor}
        onOpenFlashcard={handleOpenFlashcard}
        onOpenMobileInstall={() => setIsMobileInstallOpen(true)}
        onOpenInactivityReminder={() => handleOpenInactivityReminder("modal")}
        onSimulateInactive={handleSimulateInactive}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* If user is taking a test, show TestView */}
        {activeLessonForTest ? (
          <TestView
            lesson={activeLessonForTest}
            studentName={studentName}
            accessToken={accessToken}
            onFinishTest={handleFinishTest}
            onExit={() => setActiveLessonForTest(null)}
          />
        ) : (
          <>
            {/* Tab: Bài kiểm tra theo bài học */}
            {currentTab === "lessons" && (
              <LessonList
                onStartTest={(lesson) => setActiveLessonForTest(lesson)}
                testHistory={testHistory}
                studentName={studentName}
                currentStudentCode={
                  currentSession?.role === "student"
                    ? (currentSession.account as StudentAccount).studentCode
                    : undefined
                }
                streakData={streakData}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                currentThemeColor={themeColor}
                onOpenInactivityReminder={() => handleOpenInactivityReminder("modal")}
                onSimulateInactive={handleSimulateInactive}
              />
            )}

            {/* Tab: Thống kê & Biểu đồ tiến độ (Học sinh) */}
            {currentTab === "analytics" && (
              <StudentAnalytics
                testHistory={testHistory}
                onSelectLesson={(lesson) => setActiveLessonForTest(lesson)}
                studentName={studentName}
                currentStudentCode={
                  currentSession?.role === "student"
                    ? (currentSession.account as StudentAccount).studentCode
                    : undefined
                }
                streakData={streakData}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                currentThemeColor={themeColor}
                onOpenFlashcard={handleOpenFlashcard}
              />
            )}

            {/* Tab: Lộ trình ôn tập cá nhân hóa AI */}
            {currentTab === "roadmap" && (
              <PersonalizedRoadmap
                studentName={studentName}
                testHistory={testHistory}
                accessToken={accessToken}
                onSelectLesson={(lesson) => setActiveLessonForTest(lesson)}
              />
            )}

            {/* Tab: Bảng điều khiển quản lý điểm giáo viên */}
            {currentTab === "teacher" && (
              <TeacherDashboard
                accessToken={accessToken}
                teacherName={teacherName}
              />
            )}

            {/* Tab: Chatbot giải đáp thắc mắc SGK */}
            {currentTab === "chat" && <AIChatbot />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="w-5 h-5 rounded-md text-white font-bold inline-flex items-center justify-center text-[10px]"
              style={{ backgroundColor: themeColor || "var(--theme-primary)" }}
            >
              E
            </span>
            <strong className="text-slate-800">Tin Học 12 (Kết Nối Tri Thức)</strong> — Hệ thống luyện thi trắc nghiệm & quản lý điểm số tự động
          </div>
          <div className="text-slate-500">
            Tích hợp Gemini AI & Google Drive Cloud Backup
          </div>
        </div>
      </footer>

      {/* Student Profile & Theme Customizer Modal */}
      {isProfileModalOpen && (
        <StudentProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          studentAccount={
            currentSession?.role === "student"
              ? (currentSession.account as StudentAccount)
              : undefined
          }
          testHistory={testHistory}
          streakData={streakData}
          currentThemeColor={themeColor}
          onThemeColorChange={handleThemeColorChange}
          onSwitchAccount={() => {
            setIsProfileModalOpen(false);
            setIsLoginModalOpen(true);
          }}
          onLogout={() => {
            setIsProfileModalOpen(false);
            handleLogoutSession();
          }}
          onOpenFlashcard={handleOpenFlashcard}
        />
      )}

      {/* Global Wrong Questions Flashcard Modal */}
      <WrongQuestionsFlashcardModal
        isOpen={isFlashcardModalOpen}
        onClose={() => setIsFlashcardModalOpen(false)}
        data={flashcardData}
        currentThemeColor={themeColor}
        onRetakeTest={(lessonId) => {
          setIsFlashcardModalOpen(false);
          if (lessonId) {
            const target = ALL_LESSONS.find((l) => l.id === lessonId);
            if (target) {
              setActiveLessonForTest(target);
              setCurrentTab("lessons");
            }
          }
        }}
      />

      {/* Login / Switch Account Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentSession={currentSession || undefined}
        onLoginSuccess={(session) => {
          handleLoginSuccess(session);
        }}
      />

      {/* Inactivity Reminder Toast or Modal (>= 2 days inactive) */}
      {showInactivityReminder && streakData && (
        <InactivityReminder
          streakData={streakData}
          daysInactive={daysInactive}
          initialMode={inactivityMode}
          currentThemeColor={themeColor}
          onStartLearning={() => {
            setShowInactivityReminder(false);
            setActiveLessonForTest(null);
            setCurrentTab("lessons");
          }}
          onOpenFlashcard={() => {
            setShowInactivityReminder(false);
            handleOpenFlashcard();
          }}
          onDismiss={() => {
            setShowInactivityReminder(false);
          }}
        />
      )}

      {/* Mobile App PWA Install Guide & QR Code Modal */}
      <MobileAppInstallModal
        isOpen={isMobileInstallOpen}
        onClose={() => setIsMobileInstallOpen(false)}
      />

      {/* Floating Zalo Learning Support */}
      <ZaloSupportWidget phoneNumber="0978944184" teacherName="Cô Minh Hạnh" />
    </div>
  );
}
