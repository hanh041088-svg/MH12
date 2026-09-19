import { initializeApp, getApps, getApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile,
  User,
  signOut,
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App safely (avoid duplicate init)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
const studentCreatorApp =
  getApps().find((firebaseApp) => firebaseApp.name === "student-account-creator") ||
  initializeApp(firebaseConfig, "student-account-creator");
const studentCreatorAuth = getAuth(studentCreatorApp);

const studentCodeToEmail = (studentCode: string) =>
  `${studentCode.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "-")}@student.mhtin12.app`;

const encodeStudentProfile = (profile: { name: string; className: string; studentCode: string }) =>
  JSON.stringify(profile);

const decodeStudentProfile = (displayName: string | null) => {
  try {
    return displayName ? JSON.parse(displayName) : null;
  } catch {
    return null;
  }
};

export async function createFirebaseStudentAccount(data: {
  studentCode: string;
  password: string;
  name: string;
  className: string;
}): Promise<{ success: boolean; uid?: string; error?: string }> {
  try {
    const credential = await createUserWithEmailAndPassword(
      studentCreatorAuth,
      studentCodeToEmail(data.studentCode),
      data.password
    );
    await updateProfile(credential.user, {
      displayName: encodeStudentProfile({
        name: data.name,
        className: data.className,
        studentCode: data.studentCode.trim().toUpperCase(),
      }),
    });
    await studentCreatorAuth.signOut();
    return { success: true, uid: credential.user.uid };
  } catch (error: any) {
    if (error?.code === "auth/email-already-in-use") {
      return { success: false, error: `Mã học sinh "${data.studentCode}" đã tồn tại trên hệ thống.` };
    }
    if (error?.code === "auth/operation-not-allowed") {
      return { success: false, error: "Chức năng tài khoản học sinh chưa được bật trên Firebase." };
    }
    return { success: false, error: error?.message || "Không thể tạo tài khoản dùng chung." };
  }
}

export async function loginFirebaseStudent(studentCode: string, password: string) {
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      studentCodeToEmail(studentCode),
      password
    );
    const profile = decodeStudentProfile(credential.user.displayName);
    return {
      success: true,
      uid: credential.user.uid,
      profile: profile || {
        name: studentCode.trim().toUpperCase(),
        className: "Chưa xếp lớp",
        studentCode: studentCode.trim().toUpperCase(),
      },
    };
  } catch (error: any) {
    const invalidCodes = ["auth/invalid-credential", "auth/user-not-found", "auth/wrong-password"];
    return {
      success: false,
      error: invalidCodes.includes(error?.code)
        ? "Tên đăng nhập hoặc mật khẩu không chính xác."
        : error?.message || "Không thể đăng nhập tài khoản học sinh.",
    };
  }
}

export const provider = new GoogleAuthProvider();
// Workspace Drive scope configured
provider.addScope("https://www.googleapis.com/auth/drive.file");

let isSigningIn = false;
let cachedAccessToken: string | null = (typeof window !== "undefined" ? sessionStorage.getItem("drive_access_token") : null);

export const getCachedToken = (): string | null => {
  return cachedAccessToken || (typeof window !== "undefined" ? sessionStorage.getItem("drive_access_token") : null);
};

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token might need re-prompt or user is signed in without fresh drive token in memory
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Không lấy được Access Token từ Google/Firebase Auth.");
    }

    cachedAccessToken = credential.accessToken;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("drive_access_token", credential.accessToken);
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Lỗi đăng nhập Google:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("drive_access_token");
  }
};
