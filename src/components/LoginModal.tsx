import React, { useState } from "react";
import {
  X,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  LogIn,
} from "lucide-react";
import {
  loginUnified,
  getCurrentSession,
} from "../services/accountService";
import { CurrentUserSession, StudentAccount, TeacherAccount } from "../types";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession?: CurrentUserSession;
  onLoginSuccess: (session: CurrentUserSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onLoginSuccess,
}) => {
  const fallbackSession: CurrentUserSession = {
    role: "student",
    account: {
      id: "hs-default",
      studentCode: "12A101",
      name: "Học Sinh",
      className: "12A1",
      password: "******",
      createdAt: "",
    },
  };
  const safeSession: CurrentUserSession =
    currentSession || getCurrentSession() || fallbackSession;

  // Unified login state - không lưu sẵn thông tin
  const [loginIdentifier, setLoginIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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

    const res = await loginUnified(loginIdentifier, password);
    if (res.success && res.session) {
      if (res.session.role === "teacher") {
        const teacherAcc = res.session.account as TeacherAccount;
        setLoginSuccessMessage(`Đăng nhập thành công! Xin chào cô ${teacherAcc.name || "Phạm Thị Hạnh"}.`);
      } else {
        const studentAcc = res.session.account as StudentAccount;
        setLoginSuccessMessage(`Đăng nhập thành công! Chào mừng học sinh ${studentAcc.name}.`);
      }

      setTimeout(() => {
        onLoginSuccess(res.session!);
        onClose();
      }, 500);
    } else {
      setLoginError(res.error || "Tên đăng nhập hoặc mật khẩu không chính xác.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-slate-800">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Đăng Nhập Hệ Thống Tin Học 12
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cấp & quản lý tài khoản theo SGK Kết Nối Tri Thức
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unified Tab: Đăng Nhập */}
        <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-center">
          <div className="py-2 px-6 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-white text-blue-700 shadow-xs border border-slate-200">
            <LogIn className="w-4 h-4 text-blue-600" />
            <span>Đăng Nhập</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {loginSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{loginSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tên Đăng Nhập / Mã Học Sinh *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Nhập mã học sinh hoặc tên đăng nhập"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mật Khẩu *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
              >
                Đăng Nhập
              </button>
            </div>
          </form>

          {/* Current Session Note */}
          <div className="pt-2 text-center text-xs text-slate-500">
            Đang đăng nhập với vai trò:{" "}
            <strong className="text-slate-800">
              {safeSession?.role === "teacher"
                ? `Giáo Viên (${(safeSession.account as TeacherAccount)?.name || "Giáo Viên"})`
                : `Học Sinh (${(safeSession?.account as StudentAccount)?.name || "Học Sinh"} - ${(safeSession?.account as StudentAccount)?.studentCode || ""})`}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
