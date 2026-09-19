import React from "react";
import {
  BookOpen,
  BarChart3,
  Sparkles,
  Bot,
  User as UserIcon,
  GraduationCap,
  Cloud,
  CheckCircle2,
  LogOut,
  Layers,
  Palette,
  Smartphone,
} from "lucide-react";
import { User } from "firebase/auth";
import { googleSignIn, logout } from "../services/firebaseAuth";
import { CurrentUserSession, StudentAccount, TeacherAccount } from "../types";
import { KeyRound, ShieldCheck, LogIn } from "lucide-react";
import { StreakBadge } from "./StreakBadge";
import { StreakData } from "../services/streakService";

interface NavbarProps {
  currentTab: "lessons" | "analytics" | "roadmap" | "chat" | "teacher";
  setCurrentTab: (tab: "lessons" | "analytics" | "roadmap" | "chat" | "teacher") => void;
  userRole: "student" | "teacher";
  setUserRole: (role: "student" | "teacher") => void;
  user: User | null;
  setUser: (user: User | null) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  studentName: string;
  currentSession?: CurrentUserSession;
  streakData?: StreakData;
  onOpenLoginModal?: () => void;
  onOpenProfileModal?: () => void;
  onLogoutSession?: () => void;
  currentThemeColor?: string;
  onOpenFlashcard?: () => void;
  onOpenMobileInstall?: () => void;
  onOpenInactivityReminder?: () => void;
  onSimulateInactive?: (days: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  user,
  setUser,
  accessToken,
  setAccessToken,
  studentName,
  currentSession,
  streakData,
  onOpenLoginModal,
  onOpenProfileModal,
  onLogoutSession,
  currentThemeColor,
  onOpenFlashcard,
  onOpenMobileInstall,
  onOpenInactivityReminder,
  onSimulateInactive,
}) => {
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const safeSession: CurrentUserSession = currentSession || {
    role: userRole,
    account: userRole === "teacher"
      ? ({
          id: "gv-01",
          username: "hanhpt",
          name: "Phạm Thị Hạnh",
          school: "THPT Kết Nối Tri Thức",
          email: "",
        } as TeacherAccount)
      : ({
          id: "hs-default",
          studentCode: "12A101",
          name: studentName || "Nguyễn Văn An",
          className: "12A1",
          password: "******",
          createdAt: "",
        } as StudentAccount),
  };

  const handleSignIn = async () => {
    try {
      setIsLoggingIn(true);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      console.error("Sign in failed:", err);
      alert("Đăng nhập Google thất bại: " + (err.message || "Vui lòng thử lại"));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div
            id="brand-logo"
            onClick={() => setCurrentTab("lessons")}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform"
              style={{ background: "var(--theme-primary-gradient)" }}
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight leading-tight">
                  TIN HỌC 12
                </span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Kết Nối Tri Thức
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Luyện Thi Trắc Nghiệm & Quản Lý Tiến Độ Tự Động
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="nav-lessons"
              onClick={() => setCurrentTab("lessons")}
              style={{
                backgroundColor:
                  currentTab === "lessons" ? (currentThemeColor || "var(--theme-primary)") : undefined,
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === "lessons"
                  ? "text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Bài Kiểm Tra (28 Bài)
            </button>

            {userRole === "student" && (
              <>
                <button
                  id="nav-analytics"
                  onClick={() => setCurrentTab("analytics")}
                  style={{
                    backgroundColor:
                      currentTab === "analytics" ? (currentThemeColor || "var(--theme-primary)") : undefined,
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    currentTab === "analytics"
                      ? "text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Tiến Độ Học Tập
                </button>

                <button
                  id="nav-roadmap"
                  onClick={() => setCurrentTab("roadmap")}
                  style={{
                    backgroundColor:
                      currentTab === "roadmap" ? (currentThemeColor || "var(--theme-primary)") : undefined,
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    currentTab === "roadmap"
                      ? "text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Lộ Trình AI
                </button>
              </>
            )}

            {userRole === "teacher" && (
              <button
                id="nav-teacher-dashboard"
                onClick={() => setCurrentTab("teacher")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  currentTab === "teacher"
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                Bảng Điểm Giáo Viên
              </button>
            )}

            <button
              id="nav-chat"
              onClick={() => setCurrentTab("chat")}
              style={{
                backgroundColor:
                  currentTab === "chat"
                    ? userRole === "student"
                      ? (currentThemeColor || "var(--theme-primary)")
                      : "#4f46e5"
                    : undefined,
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === "chat"
                  ? "text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              Gia Sư AI
            </button>
          </nav>

          {/* Right Actions: Account, Role Switcher & Google Drive Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Badge (Học sinh) */}
            {streakData && safeSession.role === "student" && (
              <StreakBadge
                streakData={streakData}
                compact={true}
                onOpenInactivityReminder={onOpenInactivityReminder}
                onSimulateInactive={onSimulateInactive}
              />
            )}

            {/* Quick Flashcard Review Button (Học sinh) */}
            {safeSession.role === "student" && onOpenFlashcard && (
              <button
                id="nav-quick-flashcard-btn"
                type="button"
                onClick={onOpenFlashcard}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold text-amber-900 shadow-2xs transition-all"
                title="Ôn tập câu hỏi sai từ bài kiểm tra gần nhất bằng Flashcard"
              >
                <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="hidden xl:inline text-[11px]">Flashcard Câu Sai</span>
              </button>
            )}

            {/* Quick Theme Color Picker Button (Học sinh) */}
            {safeSession.role === "student" && onOpenProfileModal && (
              <button
                id="nav-quick-palette-btn"
                type="button"
                onClick={onOpenProfileModal}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300"
                title="Tùy chỉnh màu sắc giao diện & Hồ sơ học sinh"
              >
                <Palette
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: currentThemeColor || "var(--theme-primary)" }}
                />
                <span className="hidden xl:inline text-[11px]">Đổi màu</span>
              </button>
            )}

            {/* Dùng Trên Điện Thoại / Cài App / Mã QR */}
            {onOpenMobileInstall && (
              <button
                id="nav-mobile-app-btn"
                type="button"
                onClick={onOpenMobileInstall}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold text-blue-900 shadow-2xs transition-all"
                title="Mở mã QR quét trên điện thoại hoặc xem hướng dẫn cài đặt như App"
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="hidden md:inline text-[11px]">Dùng Trên Điện Thoại</span>
              </button>
            )}

            {/* Account Badge / Login Button */}
            <div className="flex items-center gap-1">
              <button
                id="account-session-btn"
                onClick={() => {
                  if (safeSession.role === "student" && onOpenProfileModal) {
                    onOpenProfileModal();
                  } else if (onOpenLoginModal) {
                    onOpenLoginModal();
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs transition-colors"
                title={
                  safeSession.role === "student"
                    ? "Nhấn để mở Hồ sơ & Tùy chỉnh màu sắc hoặc Đổi tài khoản"
                    : "Nhấn để đổi tài khoản giáo viên"
                }
              >
                <KeyRound
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: safeSession.role === "student" ? (currentThemeColor || "var(--theme-primary)") : "#4f46e5" }}
                />
                <div className="text-left hidden sm:block leading-tight">
                  {safeSession.role === "student" ? (
                    <>
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <span>{(safeSession.account as StudentAccount).studentCode || "Học Sinh"}</span>
                        {(safeSession.account as StudentAccount).className && (
                          <span className="text-[10px] text-blue-700 font-bold bg-blue-50 border border-blue-200 px-1 rounded">
                            {(safeSession.account as StudentAccount).className}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[95px]">
                        {safeSession.account.name || studentName}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-bold text-indigo-700">Giáo Viên</div>
                      <div className="text-[10px] text-slate-700 font-semibold truncate max-w-[120px]">
                        {safeSession.account.name || "Phạm Thị Hạnh"}
                      </div>
                    </>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-700 sm:hidden">
                  {safeSession.role === "student" ? (safeSession.account as StudentAccount).studentCode || "HS" : "GV"}
                </span>
              </button>

              {onLogoutSession && (
                <button
                  id="logout-session-btn"
                  onClick={onLogoutSession}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all shadow-2xs"
                  title="Đăng xuất khỏi hệ thống"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Đăng xuất</span>
                </button>
              )}
            </div>

            {/* Nút Đổi Tài Khoản */}
            {onOpenLoginModal && (
              <button
                id="unified-login-btn"
                onClick={onOpenLoginModal}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-all"
                title="Đổi tài khoản đăng nhập khác"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                <span>Đổi TK</span>
              </button>
            )}

            {/* Google Drive Status & Login */}
            {user && accessToken ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs"
                  title={`Đã kết nối Google Drive: ${user.email}`}
                >
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden lg:inline font-medium">Drive Sẵn Sàng</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                </div>
                <div className="flex items-center gap-1.5">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-8 h-8 rounded-full border border-blue-500/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 border border-blue-300 flex items-center justify-center font-bold text-xs">
                      {user.displayName?.[0] || "U"}
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    title="Đăng xuất"
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="google-signin-btn"
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-all"
                title="Đăng nhập để tự động lưu kết quả và xuất báo cáo sang Google Drive"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span className="hidden sm:inline">
                  {isLoggingIn ? "Đang kết nối..." : "Google Drive"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-200 text-xs font-medium bg-white">
          <button
            onClick={() => setCurrentTab("lessons")}
            style={{
              color: currentTab === "lessons" ? (currentThemeColor || "var(--theme-primary)") : undefined,
            }}
            className={`flex flex-col items-center gap-1 ${
              currentTab === "lessons" ? "font-bold" : "text-slate-500"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Bài test</span>
          </button>
          {userRole === "student" ? (
            <>
              <button
                onClick={() => setCurrentTab("analytics")}
                style={{
                  color: currentTab === "analytics" ? (currentThemeColor || "var(--theme-primary)") : undefined,
                }}
                className={`flex flex-col items-center gap-1 ${
                  currentTab === "analytics" ? "font-bold" : "text-slate-500"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Tiến độ</span>
              </button>
              <button
                onClick={() => setCurrentTab("roadmap")}
                style={{
                  color: currentTab === "roadmap" ? (currentThemeColor || "var(--theme-primary)") : undefined,
                }}
                className={`flex flex-col items-center gap-1 ${
                  currentTab === "roadmap" ? "font-bold" : "text-slate-500"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Lộ trình AI</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setCurrentTab("teacher")}
              className={`flex flex-col items-center gap-1 ${
                currentTab === "teacher" ? "text-indigo-600 font-bold" : "text-slate-500"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Bảng điểm</span>
            </button>
          )}
          <button
            onClick={() => setCurrentTab("chat")}
            style={{
              color: currentTab === "chat" ? (currentThemeColor || "var(--theme-primary)") : undefined,
            }}
            className={`flex flex-col items-center gap-1 ${
              currentTab === "chat" ? "font-bold" : "text-slate-500"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Gia sư AI</span>
          </button>
        </div>
      </div>
    </header>
  );
};
