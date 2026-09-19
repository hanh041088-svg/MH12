import React, { useState } from "react";
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  LogIn,
} from "lucide-react";
import {
  loginUnified,
} from "../services/accountService";
import { CurrentUserSession, StudentAccount, TeacherAccount } from "../types";
import { ZaloSupportWidget } from "./ZaloSupportWidget";

interface LoginScreenProps {
  onLoginSuccess: (session: CurrentUserSession) => void;
  savedStudentCode?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  savedStudentCode = "",
}) => {
  // Unified login state - không lưu sẵn thông tin
  const [loginIdentifier, setLoginIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);

  const handleUnifiedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginIdentifier.trim()) {
      setLoginError("Vui lòng nhập Tên đăng nhập hoặc Mã học sinh!");
      return;
    }

    if (!password.trim()) {
      setLoginError("Vui lòng nhập Mật khẩu!");
      return;
    }

    const res = loginUnified(loginIdentifier, password);
    if (res.success && res.session) {
      if (res.session.role === "teacher") {
        const teacherAcc = res.session.account as TeacherAccount;
        setLoginSuccessMessage(`Đăng nhập thành công! Xin chào cô ${teacherAcc.name || "Phạm Thị Hạnh"}.`);
      } else {
        const studentAcc = res.session.account as StudentAccount;
        setLoginSuccessMessage(`Đăng nhập thành công! Chào mừng học sinh ${studentAcc.name} (${studentAcc.className}).`);
      }

      setTimeout(() => {
        onLoginSuccess(res.session!);
      }, 400);
    } else {
      setLoginError(res.error || "Tên đăng nhập hoặc mật khẩu không chính xác.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-between text-slate-100 relative overflow-hidden">
      {/* Decorative background grid and blurs */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-black text-base shadow-md shadow-blue-500/20">
            T12
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-none">
              Tin Học 12 • Kết Nối Tri Thức
            </div>
            <div className="text-[11px] text-blue-200/80 font-medium mt-0.5">
              Hệ thống trắc nghiệm & ôn thi tốt nghiệp THPT
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-medium">
            <Lock className="w-3 h-3 text-blue-300" />
            Yêu cầu đăng nhập tài khoản
          </span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-300">
          {/* Card Top Title Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-7 relative">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" />
              <span>Cổng Học Tập Trực Tuyến</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Chào mừng bạn đến với Tin Học 12
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 leading-relaxed">
              Vui lòng đăng nhập để lưu kết quả bài làm, tích lũy điểm thi đua và tham gia Bảng Xếp Hạng của lớp.
            </p>
          </div>

          {/* Unified Tab: Đăng Nhập */}
          <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-center">
            <div className="py-2.5 px-6 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 bg-white text-blue-700 shadow-xs border border-slate-200 w-full sm:w-auto">
              <LogIn className="w-4 h-4 text-blue-600" />
              <span>Đăng Nhập</span>
            </div>
          </div>

          {/* Form Area */}
          <div className="p-6 sm:p-8 space-y-6">
            {loginSuccessMessage && (
              <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{loginSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleUnifiedSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên Đăng Nhập / Mã Học Sinh *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Nhập mã học sinh hoặc tên đăng nhập"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mật Khẩu *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 text-sm sm:text-base transition-all transform active:scale-[0.99]"
              >
                <span>Đăng Nhập</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Footer Info */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-600">
            <p className="font-medium">
              Học sinh và giáo viên vui lòng đăng nhập tài khoản để vào hệ thống học tập.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Nếu quên hoặc chưa có tài khoản, vui lòng liên hệ giáo viên phụ trách bộ môn.
            </p>
          </div>
        </div>
      </main>

      {/* App Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 text-center text-xs text-slate-400">
        © 2026 Tin Học 12 (Kết Nối Tri Thức Với Cuộc Sống) • Trợ lý AI & Luyện thi trắc nghiệm THPT
      </footer>

      {/* Floating Zalo Support */}
      <ZaloSupportWidget phoneNumber="0978944184" teacherName="Cô Minh Hạnh" />
    </div>
  );
};
