import { StudentAccount, TeacherAccount, CurrentUserSession, TestResult } from "../types";
import { createFirebaseStudentAccount, loginFirebaseStudent } from "./firebaseAuth";

const STORAGE_KEY_STUDENTS = "tinhoc12_student_accounts";
const STORAGE_KEY_TEACHER = "tinhoc12_teacher_account";
const STORAGE_KEY_SESSION = "tinhoc12_current_session";
const STORAGE_KEY_SCORES_MAP = "tinhoc12_scores_by_student";

// Danh sách toàn bộ các lớp hỗ trợ từ 12A1 đến 12A8
export const ALL_CLASSES = [
  "12A1",
  "12A2",
  "12A3",
  "12A4",
  "12A5",
  "12A6",
  "12A7",
  "12A8",
] as const;

// Danh sách tài khoản học sinh khởi tạo mẫu (12A1 đến 12A8)
export const INITIAL_STUDENT_ACCOUNTS: StudentAccount[] = [
  {
    id: "hs-01",
    studentCode: "12A101",
    name: "Nguyễn Văn An",
    className: "12A1",
    password: "123456",
    email: "vanan.12a1@thpt.edu.vn",
    createdAt: "2026-09-01T08:00:00.000Z",
    lastLogin: "Hôm nay",
  },
  {
    id: "hs-02",
    studentCode: "12A102",
    name: "Trần Thị Mai",
    className: "12A1",
    password: "123456",
    email: "thimai.12a1@thpt.edu.vn",
    createdAt: "2026-09-01T08:00:00.000Z",
    lastLogin: "1 giờ trước",
  },
  {
    id: "hs-03",
    studentCode: "12A103",
    name: "Lê Hoàng Nam",
    className: "12A1",
    password: "123456",
    email: "hoangnam.12a1@thpt.edu.vn",
    createdAt: "2026-09-01T08:00:00.000Z",
    lastLogin: "Hôm qua",
  },
  {
    id: "hs-04",
    studentCode: "12A201",
    name: "Phạm Minh Trang",
    className: "12A2",
    password: "123456",
    email: "minhtrang.12a2@thpt.edu.vn",
    createdAt: "2026-09-01T08:00:00.000Z",
    lastLogin: "3 giờ trước",
  },
  {
    id: "hs-05",
    studentCode: "12A202",
    name: "Vũ Tuấn Kiệt",
    className: "12A2",
    password: "123456",
    email: "tuankiet.12a2@thpt.edu.vn",
    createdAt: "2026-09-01T08:00:00.000Z",
    lastLogin: "2 ngày trước",
  },
  {
    id: "hs-06",
    studentCode: "12A301",
    name: "Đỗ Bảo Ngọc",
    className: "12A3",
    password: "123456",
    email: "baongoc.12a3@thpt.edu.vn",
    createdAt: "2026-09-01T08:00:00.000Z",
    lastLogin: "30 phút trước",
  },
  {
    id: "hs-07",
    studentCode: "12A401",
    name: "Hoàng Minh Khôi",
    className: "12A4",
    password: "123456",
    email: "minhkhoi.12a4@thpt.edu.vn",
    createdAt: "2026-09-01T08:00:00.000Z",
    lastLogin: "Hôm nay",
  },
  {
    id: "hs-08",
    studentCode: "12A402",
    name: "Lê Thảo My",
    className: "12A4",
    password: "123456",
    email: "thaomy.12a4@thpt.edu.vn",
    createdAt: "2026-09-01T08:00:00.000Z",
    lastLogin: "5 giờ trước",
  },
  {
    id: "hs-09",
    studentCode: "12A501",
    name: "Ngô Gia Huy",
    className: "12A5",
    password: "123456",
    email: "giahuy.12a5@thpt.edu.vn",
    createdAt: "2026-09-01T08:00:00.000Z",
    lastLogin: "45 phút trước",
  },
  {
    id: "hs-10",
    studentCode: "12A502",
    name: "Đặng Phương Linh",
    className: "12A5",
    password: "123456",
    email: "phuonglinh.12a5@thpt.edu.vn",
    createdAt: "2026-09-01T08:00:00.000Z",
    lastLogin: "Hôm qua",
  },
  {
    id: "hs-11",
    studentCode: "12A601",
    name: "Bùi Nhật Minh",
    className: "12A6",
    password: "123456",
    email: "nhatminh.12a6@thpt.edu.vn",
    createdAt: "2026-09-01T08:00:00.000Z",
    lastLogin: "2 giờ trước",
  },
  {
    id: "hs-12",
    studentCode: "12A602",
    name: "Dương Quỳnh Anh",
    className: "12A6",
    password: "123456",
    email: "quynhanh.12a6@thpt.edu.vn",
    createdAt: "2026-09-01T08:00:00.000Z",
    lastLogin: "Hôm nay",
  },
  {
    id: "hs-13",
    studentCode: "12A701",
    name: "Trịnh Đức Thắng",
    className: "12A7",
    password: "123456",
    email: "ducthang.12a7@thpt.edu.vn",
    createdAt: "2026-09-01T08:00:00.000Z",
    lastLogin: "1 ngày trước",
  },
  {
    id: "hs-14",
    studentCode: "12A702",
    name: "Phan Khánh Vy",
    className: "12A7",
    password: "123456",
    email: "khanhvy.12a7@thpt.edu.vn",
    createdAt: "2026-09-01T08:00:00.000Z",
    lastLogin: "3 giờ trước",
  },
  {
    id: "hs-15",
    studentCode: "12A801",
    name: "Võ Hoàng Yến",
    className: "12A8",
    password: "123456",
    email: "hoangyen.12a8@thpt.edu.vn",
    createdAt: "2026-09-01T08:00:00.000Z",
    lastLogin: "Hôm nay",
  },
  {
    id: "hs-16",
    studentCode: "12A802",
    name: "Lý Hải Đăng",
    className: "12A8",
    password: "123456",
    email: "haidang.12a8@thpt.edu.vn",
    createdAt: "2026-09-01T08:00:00.000Z",
    lastLogin: "4 giờ trước",
  },
];

// Tài khoản giáo viên mặc định
export const INITIAL_TEACHER_ACCOUNT: TeacherAccount = {
  id: "gv-01",
  username: "hanhpt",
  name: "Phạm Thị Hạnh",
  school: "THPT Kết Nối Tri Thức",
  password: "041088@abc",
  email: "hanh041088@gmail.com",
};

/**
 * Lấy toàn bộ danh sách tài khoản học sinh
 */
export function getStudentAccounts(): StudentAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(INITIAL_STUDENT_ACCOUNTS));
      return INITIAL_STUDENT_ACCOUNTS;
    }
    const parsed: StudentAccount[] = JSON.parse(raw);
    // Tự động đồng bộ các tài khoản lớp mới (12A1 đến 12A8) nếu bộ nhớ cũ chưa có
    const existingCodes = new Set(parsed.map((p) => p.studentCode.toUpperCase()));
    let hasNew = false;
    for (const initAcc of INITIAL_STUDENT_ACCOUNTS) {
      if (!existingCodes.has(initAcc.studentCode.toUpperCase())) {
        parsed.push(initAcc);
        hasNew = true;
      }
    }
    if (hasNew) {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return INITIAL_STUDENT_ACCOUNTS;
  }
}

/**
 * Lưu danh sách tài khoản học sinh
 */
export function saveStudentAccounts(accounts: StudentAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(accounts));
  } catch (e) {
    console.warn("Could not save student accounts", e);
  }
}

/**
 * Lấy thông tin tài khoản giáo viên
 */
export function getTeacherAccount(): TeacherAccount {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEACHER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TEACHER, JSON.stringify(INITIAL_TEACHER_ACCOUNT));
      return INITIAL_TEACHER_ACCOUNT;
    }
    const acc = JSON.parse(raw);
    let changed = false;
    // Cập nhật tên đăng nhập giáo viên thành hanhpt
    if (acc.username !== "hanhpt") {
      acc.username = "hanhpt";
      changed = true;
    }
    // Cập nhật tên giáo viên thành Phạm Thị Hạnh
    if (acc.name !== "Phạm Thị Hạnh") {
      acc.name = "Phạm Thị Hạnh";
      changed = true;
    }
    // Cập nhật mật khẩu quản trị thành 041088@abc
    if (acc.password !== "041088@abc") {
      acc.password = "041088@abc";
      changed = true;
    }
    if (changed) {
      localStorage.setItem(STORAGE_KEY_TEACHER, JSON.stringify(acc));
    }
    return acc;
  } catch {
    return INITIAL_TEACHER_ACCOUNT;
  }
}

/**
 * Cập nhật mật khẩu giáo viên
 */
export function updateTeacherPassword(newPassword: string): boolean {
  try {
    const current = getTeacherAccount();
    current.password = newPassword;
    localStorage.setItem(STORAGE_KEY_TEACHER, JSON.stringify(current));
    return true;
  } catch {
    return false;
  }
}

/**
 * Lấy phiên đăng nhập hiện tại (trả về null nếu chưa đăng nhập)
 */
export function getCurrentSession(): CurrentUserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.role === "student" || parsed.role === "teacher") && parsed.account) {
        if (parsed.role === "teacher" && parsed.account.name !== "Phạm Thị Hạnh") {
          parsed.account.name = "Phạm Thị Hạnh";
          localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch {}
  return null;
}

/**
 * Lấy mã học sinh gần nhất đã từng đăng nhập (mặc định trống, không tự động điền)
 */
export function getLastStudentCode(): string {
  return "";
}

/**
 * Lưu phiên đăng nhập hiện tại
 */
export function saveCurrentSession(session: CurrentUserSession | null): void {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY_SESSION);
      localStorage.removeItem("tinhoc12_last_student_code");
    }
  } catch (e) {
    console.warn("Could not save session", e);
  }
}

/**
 * Đăng nhập học sinh bằng Mã học sinh và Mật khẩu
 */
export function loginStudent(
  studentCode: string,
  password: string
): { success: boolean; student?: StudentAccount; error?: string } {
  const accounts = getStudentAccounts();
  const trimmedCode = studentCode.trim().toUpperCase();
  const student = accounts.find(
    (acc) => acc.studentCode.toUpperCase() === trimmedCode
  );

  if (!student) {
    return {
      success: false,
      error: `Không tìm thấy mã học sinh "${studentCode}". Vui lòng kiểm tra lại với Giáo viên bộ môn.`,
    };
  }

  if (student.password !== password) {
    return {
      success: false,
      error: "Mật khẩu không chính xác. Mật khẩu mặc định là 123456.",
    };
  }

  // Cập nhật lastLogin
  student.lastLogin = new Date().toLocaleString("vi-VN");
  saveStudentAccounts(accounts);

  const session: CurrentUserSession = {
    role: "student",
    account: student,
  };
  saveCurrentSession(session);

  return { success: true, student };
}

/**
 * Đăng nhập giáo viên
 */
export function loginTeacher(
  username: string,
  password: string
): { success: boolean; teacher?: TeacherAccount; error?: string } {
  const teacher = getTeacherAccount();
  const trimmed = username.trim().toLowerCase();

  const validUsernames = [
    "hanhpt",
    teacher.username.toLowerCase(),
  ];

  if (!validUsernames.includes(trimmed)) {
    return {
      success: false,
      error: "Tên đăng nhập hoặc mật khẩu không chính xác.",
    };
  }

  const trimmedPassword = password.trim();
  const isPasswordValid =
    teacher.password === trimmedPassword ||
    trimmedPassword === "041088@abc" ||
    trimmedPassword === "041088@Abc";

  if (!isPasswordValid) {
    return {
      success: false,
      error: "Tên đăng nhập hoặc mật khẩu không chính xác.",
    };
  }

  const session: CurrentUserSession = {
    role: "teacher",
    account: teacher,
  };
  saveCurrentSession(session);

  return { success: true, teacher };
}

/**
 * Đăng nhập hợp nhất: tự động nhận diện tài khoản Học Sinh hoặc Giáo Viên
 */
export async function loginUnified(
  identifier: string,
  password: string
): Promise<{ success: boolean; session?: CurrentUserSession; error?: string }> {
  const trimmedId = (identifier || "").trim();
  const trimmedPass = (password || "").trim();

  if (!trimmedId) {
    return {
      success: false,
      error: "Vui lòng nhập Tên đăng nhập hoặc Mã học sinh!",
    };
  }

  if (!trimmedPass) {
    return {
      success: false,
      error: "Vui lòng nhập Mật khẩu!",
    };
  }

  // 1. Kiểm tra tài khoản giáo viên quản trị (hanhpt)
  const teacher = getTeacherAccount();
  const isTeacherUsername =
    trimmedId.toLowerCase() === "hanhpt" ||
    trimmedId.toLowerCase() === teacher.username.toLowerCase();

  if (isTeacherUsername) {
    const isTeacherPass =
      trimmedPass === teacher.password ||
      trimmedPass === "041088@abc" ||
      trimmedPass === "041088@Abc";

    if (isTeacherPass) {
      const session: CurrentUserSession = {
        role: "teacher",
        account: teacher,
      };
      saveCurrentSession(session);
      return { success: true, session };
    } else {
      return {
        success: false,
        error: "Tên đăng nhập hoặc mật khẩu không chính xác.",
      };
    }
  }

  // 2. Kiểm tra tài khoản học sinh
  const studentRes = loginStudent(trimmedId, trimmedPass);
  if (studentRes.success && studentRes.student) {
    return {
      success: true,
      session: {
        role: "student",
        account: studentRes.student,
      },
    };
  }

  // 3. Tài khoản dùng chung trên Firebase (đăng nhập được từ mọi thiết bị)
  const firebaseRes = await loginFirebaseStudent(trimmedId, trimmedPass);
  if (firebaseRes.success && firebaseRes.profile && firebaseRes.uid) {
    const student: StudentAccount = {
      id: firebaseRes.uid,
      studentCode: firebaseRes.profile.studentCode,
      name: firebaseRes.profile.name,
      className: firebaseRes.profile.className,
      password: "******",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toLocaleString("vi-VN"),
    };
    const session: CurrentUserSession = { role: "student", account: student };
    saveCurrentSession(session);
    return { success: true, session };
  }

  // 4. Không trùng khớp
  return {
    success: false,
    error: "Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại!",
  };
}

/**
 * Đăng xuất
 */
export function logoutAccount(): void {
  saveCurrentSession(null);
  try {
    sessionStorage.removeItem("tinhoc12_session_authenticated");
  } catch {}
}

/**
 * Giáo viên cấp 1 tài khoản học sinh mới
 */
export async function addStudentAccount(data: {
  studentCode: string;
  name: string;
  className: string;
  password?: string;
  email?: string;
}): Promise<{ success: boolean; account?: StudentAccount; error?: string }> {
  const accounts = getStudentAccounts();
  const codeUpper = data.studentCode.trim().toUpperCase();

  // Kiểm tra trùng mã học sinh
  if (accounts.some((acc) => acc.studentCode.toUpperCase() === codeUpper)) {
    return {
      success: false,
      error: `Mã học sinh "${codeUpper}" đã tồn tại trên hệ thống. Vui lòng chọn mã khác!`,
    };
  }

  const newAcc: StudentAccount = {
    id: `hs-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    studentCode: codeUpper,
    name: data.name.trim(),
    className: data.className.trim(),
    password: data.password?.trim() || "123456",
    email: data.email?.trim() || `${codeUpper.toLowerCase()}@thpt.edu.vn`,
    createdAt: new Date().toISOString(),
    lastLogin: "Chưa đăng nhập",
  };

  const firebaseResult = await createFirebaseStudentAccount({
    studentCode: newAcc.studentCode,
    password: newAcc.password,
    name: newAcc.name,
    className: newAcc.className,
  });
  if (!firebaseResult.success) {
    return { success: false, error: firebaseResult.error };
  }
  newAcc.id = firebaseResult.uid || newAcc.id;

  accounts.unshift(newAcc);
  saveStudentAccounts(accounts);
  return { success: true, account: newAcc };
}

/**
 * Giáo viên cấp tài khoản hàng loạt cho 1 lớp
 * Ví dụ: Lớp 12A4, số lượng 35 em, tiền tố 12A4_, mật khẩu mặc định 123456
 */
export async function batchCreateStudents(options: {
  className: string;
  count: number;
  prefix?: string;
  defaultPassword?: string;
}): Promise<StudentAccount[]> {
  const accounts = getStudentAccounts();
  const created: StudentAccount[] = [];
  const prefix = (options.prefix || options.className).toUpperCase().replace(/[^A-Z0-9]/g, "");
  const pwd = options.defaultPassword || "123456";

  let nextIndex = 1;
  while (created.length < options.count) {
    const code = `${prefix}${String(nextIndex).padStart(2, "0")}`;
    const isExist = accounts.some((a) => a.studentCode.toUpperCase() === code);
    if (!isExist) {
      const newAcc: StudentAccount = {
        id: `hs-${Date.now()}-${nextIndex}-${Math.random().toString(36).substr(2, 3)}`,
        studentCode: code,
        name: `Học sinh ${options.className} (${String(nextIndex).padStart(2, "0")})`,
        className: options.className,
        password: pwd,
        email: `${code.toLowerCase()}@thpt.edu.vn`,
        createdAt: new Date().toISOString(),
        lastLogin: "Chưa đăng nhập",
      };
      const firebaseResult = await createFirebaseStudentAccount({
        studentCode: newAcc.studentCode,
        password: newAcc.password,
        name: newAcc.name,
        className: newAcc.className,
      });
      if (firebaseResult.success) {
        newAcc.id = firebaseResult.uid || newAcc.id;
        created.push(newAcc);
        accounts.push(newAcc);
      } else {
        throw new Error(firebaseResult.error || `Không thể tạo tài khoản ${code}`);
      }
    }
    nextIndex++;
  }

  saveStudentAccounts(accounts);
  return created;
}

/** Đồng bộ các tài khoản đã tạo trước đây từ trình duyệt giáo viên lên Firebase. */
export async function syncStudentAccountsToFirebase(): Promise<{ synced: number; skipped: number }> {
  const accounts = getStudentAccounts();
  let synced = 0;
  let skipped = 0;
  for (const account of accounts) {
    const result = await createFirebaseStudentAccount({
      studentCode: account.studentCode,
      password: account.password,
      name: account.name,
      className: account.className,
    });
    if (result.success) synced++;
    else if (result.error?.includes("đã tồn tại")) skipped++;
    else throw new Error(result.error || `Không thể đồng bộ ${account.studentCode}`);
  }
  return { synced, skipped };
}

/**
 * Đặt lại mật khẩu học sinh (mặc định về 123456 hoặc mật khẩu mới)
 */
export function resetStudentPassword(studentId: string, newPassword = "123456"): boolean {
  const accounts = getStudentAccounts();
  const student = accounts.find((a) => a.id === studentId);
  if (!student) return false;
  student.password = newPassword;
  saveStudentAccounts(accounts);
  return true;
}

/**
 * Xóa tài khoản học sinh
 */
export function deleteStudentAccount(studentId: string): boolean {
  const accounts = getStudentAccounts();
  const filtered = accounts.filter((a) => a.id !== studentId);
  if (filtered.length === accounts.length) return false;
  saveStudentAccounts(filtered);
  return true;
}

/**
 * Quản lý lịch sử bài kiểm tra cho từng học sinh riêng biệt
 */
export function getStudentTestHistory(studentId: string): TestResult[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_SCORES_MAP}_${studentId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveStudentTestHistory(studentId: string, results: TestResult[]): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_SCORES_MAP}_${studentId}`, JSON.stringify(results));
  } catch (e) {
    console.warn("Failed to save student test history", e);
  }
}
