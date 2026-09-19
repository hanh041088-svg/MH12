import React, { useState, useEffect } from "react";
import {
  Users,
  KeyRound,
  Plus,
  Layers,
  Search,
  Filter,
  Eye,
  EyeOff,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  getStudentAccounts,
  addStudentAccount,
  batchCreateStudents,
  resetStudentPassword,
  deleteStudentAccount,
  ALL_CLASSES,
} from "../services/accountService";
import { StudentAccount } from "../types";

interface StudentAccountManagerProps {
  onAccountCreated?: (newAccount: StudentAccount) => void;
}

export const StudentAccountManager: React.FC<StudentAccountManagerProps> = ({
  onAccountCreated,
}) => {
  const [accounts, setAccounts] = useState<StudentAccount[]>(() => getStudentAccounts());
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [showSingleModal, setShowSingleModal] = useState<boolean>(false);
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);
  const [showExportCardsModal, setShowExportCardsModal] = useState<boolean>(false);

  // Single form state
  const [singleName, setSingleName] = useState<string>("");
  const [singleClass, setSingleClass] = useState<string>("12A1");
  const [singleCode, setSingleCode] = useState<string>("");
  const [singlePassword, setSinglePassword] = useState<string>("123456");
  const [singleError, setSingleError] = useState<string | null>(null);

  // Batch form state
  const [batchClass, setBatchClass] = useState<string>("12A4");
  const [batchCount, setBatchCount] = useState<number>(35);
  const [batchPrefix, setBatchPrefix] = useState<string>("12A4_");
  const [batchPassword, setBatchPassword] = useState<string>("123456");

  // Notifications
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const refreshAccounts = () => {
    setAccounts(getStudentAccounts());
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Toggle password visibility
  const toggleShowPassword = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Copy account details
  const handleCopyAccount = (acc: StudentAccount) => {
    const text = `Học sinh: ${acc.name} | Lớp: ${acc.className} | Mã HS: ${acc.studentCode} | Mật khẩu: ${acc.password}`;
    navigator.clipboard.writeText(text);
    setCopiedId(acc.id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast(`Đã sao chép tài khoản của học sinh ${acc.name}`);
  };

  // Reset password
  const handleResetPassword = (acc: StudentAccount) => {
    if (
      window.confirm(
        `Thầy/Cô có chắc chắn muốn đặt lại mật khẩu cho học sinh "${acc.name}" (${acc.studentCode}) về mặc định "123456"?`
      )
    ) {
      const ok = resetStudentPassword(acc.id, "123456");
      if (ok) {
        refreshAccounts();
        showToast(`Đã đặt lại mật khẩu của ${acc.name} về "123456"`);
      }
    }
  };

  // Delete account
  const handleDeleteAccount = (acc: StudentAccount) => {
    if (
      window.confirm(
        `Thầy/Cô có chắc chắn muốn xóa tài khoản học sinh "${acc.name}" (${acc.studentCode})?`
      )
    ) {
      const ok = deleteStudentAccount(acc.id);
      if (ok) {
        refreshAccounts();
        showToast(`Đã xóa tài khoản ${acc.studentCode}`, "success");
      }
    }
  };

  // Submit Single Form
  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSingleError(null);
    if (!singleName.trim() || !singleCode.trim()) {
      setSingleError("Vui lòng điền đầy đủ Họ tên và Mã học sinh!");
      return;
    }

    const res = addStudentAccount({
      name: singleName,
      className: singleClass,
      studentCode: singleCode,
      password: singlePassword,
    });

    if (res.success && res.account) {
      refreshAccounts();
      if (onAccountCreated) onAccountCreated(res.account);
      setShowSingleModal(false);
      setSingleName("");
      setSingleCode("");
      setSinglePassword("123456");
      showToast(`Đã cấp thành công tài khoản mã "${res.account.studentCode}" cho ${res.account.name}`);
    } else {
      setSingleError(res.error || "Không thể tạo tài khoản");
    }
  };

  // Submit Batch Form
  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = batchCreateStudents({
      className: batchClass,
      count: Number(batchCount) || 10,
      prefix: batchPrefix,
      defaultPassword: batchPassword,
    });

    refreshAccounts();
    setShowBatchModal(false);
    showToast(`Đã cấp thành công ${created.length} tài khoản cho lớp ${batchClass}!`);
  };

  // Generate suggested student code when typing class
  useEffect(() => {
    const cleanClass = singleClass.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const existing = accounts.filter((a) => a.className === singleClass).length;
    setSingleCode(`${cleanClass}${String(existing + 1).padStart(2, "0")}`);
  }, [singleClass, accounts]);

  // Update batch prefix when batchClass changes
  useEffect(() => {
    setBatchPrefix(`${batchClass.toUpperCase()}_`);
  }, [batchClass]);

  // Filter accounts
  const filteredAccounts = accounts.filter((acc) => {
    const matchClass = selectedClass === "all" || acc.className === selectedClass;
    const matchSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.studentCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchSearch;
  });

  const uniqueClasses = Array.from(new Set([...ALL_CLASSES, ...accounts.map((a) => a.className)])).sort();

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in shadow-sm ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Quản Lý Tài Khoản Học Sinh Theo Mã & Mật Khẩu
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              {accounts.length} tài khoản
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Học sinh chỉ cần nhập Mã học sinh và Mật khẩu là có thể làm bài và lưu điểm số cá nhân.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowSingleModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cấp 1 tài khoản</span>
          </button>

          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span>Cấp hàng loạt cho lớp</span>
          </button>

          <button
            onClick={() => setShowExportCardsModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition-colors"
            title="In hoặc xuất thẻ tài khoản phát cho học sinh"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>In thẻ phát học sinh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã học sinh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-500">Lớp:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
          >
            <option value="all">Tất cả các lớp ({accounts.length})</option>
            {uniqueClasses.map((cls) => (
              <option key={cls} value={cls}>
                Lớp {cls} ({accounts.filter((a) => a.className === cls).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Mã Học Sinh</th>
                <th className="py-3 px-4">Họ Và Tên</th>
                <th className="py-3 px-4">Lớp</th>
                <th className="py-3 px-4">Mật Khẩu</th>
                <th className="py-3 px-4">Đăng Nhập Lần Cuối</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Không tìm thấy tài khoản học sinh nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const isVisible = visiblePasswords[acc.id] || false;
                  const isCopied = copiedId === acc.id;

                  return (
                    <tr
                      key={acc.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
                          {acc.studentCode}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{acc.name}</div>
                        <div className="text-[10px] text-slate-500">{acc.email || "—"}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {acc.className}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                            {isVisible ? acc.password : "••••••••"}
                          </span>
                          <button
                            onClick={() => toggleShowPassword(acc.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                            title={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {acc.lastLogin || "Chưa đăng nhập"}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopyAccount(acc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Sao chép thông tin tài khoản"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleResetPassword(acc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Đặt lại mật khẩu về 123456"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteAccount(acc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CẤP 1 TÀI KHOẢN */}
      {showSingleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-800">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Cấp Tài Khoản Học Sinh Mới
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tạo tài khoản cá nhân cho học sinh tham gia làm bài
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSingleModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {singleError && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{singleError}</span>
              </div>
            )}

            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên học sinh *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hoàng Minh Châu"
                  value={singleName}
                  onChange={(e) => setSingleName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lớp *
                  </label>
                  <select
                    value={singleClass}
                    onChange={(e) => setSingleClass(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 font-semibold"
                  >
                    {ALL_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã học sinh (Tên đăng nhập) *
                  </label>
                  <input
                    type="text"
                    required
                    value={singleCode}
                    onChange={(e) => setSingleCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu khởi tạo *
                </label>
                <input
                  type="text"
                  required
                  value={singlePassword}
                  onChange={(e) => setSinglePassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Mật khẩu mặc định: 123456 (học sinh có thể dùng ngay mà không cần email)
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSingleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs"
                >
                  Xác nhận cấp tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CẤP HÀNG LOẠT THEO LỚP */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-800">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Cấp Hàng Loạt Cho Cả Lớp
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tự động tạo danh sách tài khoản theo số thứ tự lớp
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBatchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn Lớp Cần Cấp *
                </label>
                <select
                  value={batchClass}
                  onChange={(e) => setBatchClass(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold"
                >
                  {ALL_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      Lớp {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số lượng học sinh *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={batchCount}
                    onChange={(e) => setBatchCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tiền tố mã HS *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchPrefix}
                    onChange={(e) => setBatchPrefix(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono uppercase font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu chung ban đầu *
                </label>
                <input
                  type="text"
                  required
                  value={batchPassword}
                  onChange={(e) => setBatchPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
                />
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 space-y-1">
                <span className="font-bold block">Ví dụ danh sách sẽ sinh ra:</span>
                <p className="font-mono text-[11px] text-indigo-800">
                  {batchPrefix}01, {batchPrefix}02, ... đến {batchPrefix}{String(batchCount).padStart(2, "0")} (Mật khẩu: {batchPassword})
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs"
                >
                  Sinh hàng loạt ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: IN / XUẤT THẺ PHÁT HỌC SINH */}
      {showExportCardsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col text-slate-800">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Phiếu Thẻ Tài Khoản Phát Cho Học Sinh
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Định dạng thẻ in phát cho từng em hoặc sao chép gửi nhóm lớp
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExportCardsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between gap-3 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600">
                Tổng cộng: <strong className="text-slate-900">{filteredAccounts.length}</strong> học sinh ({selectedClass === "all" ? "Tất cả các lớp" : `Lớp ${selectedClass}`})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const text = filteredAccounts
                      .map(
                        (a, idx) =>
                          `${idx + 1}. [${a.className}] ${a.name} | Mã HS: ${a.studentCode} | Mật khẩu: ${a.password}`
                      )
                      .join("\n");
                    navigator.clipboard.writeText(text);
                    showToast("Đã sao chép danh sách tài khoản vào bộ nhớ tạm!");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl font-bold text-slate-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép danh sách</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In phiếu (Print)</span>
                </button>
              </div>
            </div>

            {/* Cards Grid Preview */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-3.5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 space-y-2 hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-200 pb-1.5 font-semibold">
                      <span>THPT KẾT NỐI TRI THỨC</span>
                      <span className="font-bold text-blue-700">{acc.className}</span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {acc.name}
                      </div>
                      <div className="text-[10px] text-slate-500">Môn: Tin Học 12</div>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">Mã đăng nhập:</span>
                        <span className="font-mono font-bold text-blue-700">
                          {acc.studentCode}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">Mật khẩu:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {acc.password}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
