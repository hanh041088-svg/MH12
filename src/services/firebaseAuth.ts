import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App safely (avoid duplicate init)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

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
