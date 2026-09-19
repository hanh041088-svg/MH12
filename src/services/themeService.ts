// Theme color service for student personalization

export interface ThemePreset {
  id: string;
  name: string;
  color: string; // Primary Hex
  hoverColor: string;
  lightColor: string;
  gradient: string;
  badgeBg: string;
  description: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "blue",
    name: "Xanh Lam Công Nghệ",
    color: "#2563eb", // blue-600
    hoverColor: "#1d4ed8", // blue-700
    lightColor: "#eff6ff", // blue-50
    badgeBg: "#dbeafe",
    gradient: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #4338ca 100%)",
    description: "Màu mặc định hiện đại, chuẩn Tin học & Công nghệ thông tin",
  },
  {
    id: "cyan",
    name: "Xanh Ngọc Tri Thức",
    color: "#0891b2", // cyan-600
    hoverColor: "#0e7490", // cyan-700
    lightColor: "#ecfeff", // cyan-50
    badgeBg: "#cffafe",
    gradient: "linear-gradient(135deg, #0e7490 0%, #06b6d4 50%, #0284c7 100%)",
    description: "Tươi sáng, năng động và kích thích tư duy logic",
  },
  {
    id: "violet",
    name: "Tím Tinh Vân",
    color: "#7c3aed", // violet-600
    hoverColor: "#6d28d9", // violet-700
    lightColor: "#f5f3ff", // violet-50
    badgeBg: "#ede9fe",
    gradient: "linear-gradient(135deg, #6d28d9 0%, #8b5cf6 50%, #4338ca 100%)",
    description: "Sáng tạo, công nghệ AI và mang chiều sâu học thuật",
  },
  {
    id: "emerald",
    name: "Xanh Lục Năng Động",
    color: "#059669", // emerald-600
    hoverColor: "#047857", // emerald-700
    lightColor: "#ecfdf5", // emerald-50
    badgeBg: "#d1fae5",
    gradient: "linear-gradient(135deg, #047857 0%, #10b981 50%, #0d9488 100%)",
    description: "Cảm giác tươi mát, tập trung cao độ và giảm mỏi mắt",
  },
  {
    id: "rose",
    name: "Hồng San Hô",
    color: "#e11d48", // rose-600
    hoverColor: "#be123c", // rose-700
    lightColor: "#fff1f2", // rose-50
    badgeBg: "#ffe4e6",
    gradient: "linear-gradient(135deg, #be123c 0%, #f43f5e 50%, #db2777 100%)",
    description: "Ngọt ngào, ấm áp và truyền cảm hứng tự tin",
  },
  {
    id: "amber",
    name: "Cam Hổ Phách",
    color: "#d97706", // amber-600
    hoverColor: "#b45309", // amber-700
    lightColor: "#fffbeb", // amber-50
    badgeBg: "#fef3c7",
    gradient: "linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #ea580c 100%)",
    description: "Tràn đầy năng lượng, nhiệt huyết và quyết tâm",
  },
  {
    id: "indigo",
    name: "Chàm Quý Phái",
    color: "#4f46e5", // indigo-600
    hoverColor: "#4338ca", // indigo-700
    lightColor: "#eef2ff", // indigo-50
    badgeBg: "#e0e7ff",
    gradient: "linear-gradient(135deg, #3730a3 0%, #6366f1 50%, #4f46e5 100%)",
    description: "Lịch thiệp, chuẩn mực và phong thái học sinh xuất sắc",
  },
  {
    id: "crimson",
    name: "Đỏ Quyết Tâm",
    color: "#dc2626", // red-600
    hoverColor: "#b91c1c", // red-700
    lightColor: "#fef2f2", // red-50
    badgeBg: "#fee2e2",
    gradient: "linear-gradient(135deg, #b91c1c 0%, #ef4444 50%, #be123c 100%)",
    description: "Mục tiêu điểm 10 rực rỡ và bứt phá kỳ thi THPT",
  },
];

export const DEFAULT_THEME_COLOR = "#2563eb";

/**
 * Tính toán màu hover và màu nền nhạt từ mã Hex tùy ý
 */
export function calculateColorShades(hex: string) {
  // Chuẩn hóa hex
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (cleanHex.length !== 6) {
    cleanHex = "2563eb";
  }

  const r = parseInt(cleanHex.substring(0, 2), 16) || 37;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 99;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 235;

  // Darker for hover (khoảng 85% độ sáng)
  const hoverR = Math.max(0, Math.floor(r * 0.85));
  const hoverG = Math.max(0, Math.floor(g * 0.85));
  const hoverB = Math.max(0, Math.floor(b * 0.85));
  const hoverHex = `#${hoverR.toString(16).padStart(2, "0")}${hoverG.toString(16).padStart(2, "0")}${hoverB.toString(16).padStart(2, "0")}`;

  // Light tint for card backgrounds / badges (khoảng 10-12% opacity trên nền trắng)
  const lightR = Math.min(255, Math.floor(r * 0.12 + 255 * 0.88));
  const lightG = Math.min(255, Math.floor(g * 0.12 + 255 * 0.88));
  const lightB = Math.min(255, Math.floor(b * 0.12 + 255 * 0.88));
  const lightHex = `#${lightR.toString(16).padStart(2, "0")}${lightG.toString(16).padStart(2, "0")}${lightB.toString(16).padStart(2, "0")}`;

  // Slightly stronger tint for badges
  const badgeR = Math.min(255, Math.floor(r * 0.22 + 255 * 0.78));
  const badgeG = Math.min(255, Math.floor(g * 0.22 + 255 * 0.78));
  const badgeB = Math.min(255, Math.floor(b * 0.22 + 255 * 0.78));
  const badgeBg = `#${badgeR.toString(16).padStart(2, "0")}${badgeG.toString(16).padStart(2, "0")}${badgeB.toString(16).padStart(2, "0")}`;

  // Gradient: từ hoverHex qua hex đến một sắc độ phong phú
  const gradient = `linear-gradient(135deg, ${hoverHex} 0%, #${cleanHex} 50%, ${hoverHex} 100%)`;

  return {
    hex: `#${cleanHex}`,
    hoverHex,
    lightHex,
    badgeBg,
    gradient,
  };
}

/**
 * Lấy màu đã lưu từ localStorage
 */
export function getSavedThemeColor(studentCode?: string): string {
  try {
    if (studentCode) {
      const perStudent = localStorage.getItem(`tinhoc12_theme_color_${studentCode}`);
      if (perStudent) return perStudent;
    }
    const globalColor = localStorage.getItem("tinhoc12_theme_color");
    if (globalColor) return globalColor;
  } catch {}
  return DEFAULT_THEME_COLOR;
}

/**
 * Áp dụng màu sắc chủ đạo lên toàn bộ ứng dụng (CSS Variables trên :root)
 */
export function applyThemeColor(hex: string, studentCode?: string): void {
  try {
    const shades = calculateColorShades(hex);

    // Lưu vào localStorage
    localStorage.setItem("tinhoc12_theme_color", shades.hex);
    if (studentCode) {
      localStorage.setItem(`tinhoc12_theme_color_${studentCode}`, shades.hex);
    }

    // Thiết lập CSS Variables trên :root
    const root = document.documentElement;
    root.style.setProperty("--theme-primary", shades.hex);
    root.style.setProperty("--theme-primary-hover", shades.hoverHex);
    root.style.setProperty("--theme-primary-light", shades.lightHex);
    root.style.setProperty("--theme-primary-badge", shades.badgeBg);
    root.style.setProperty("--theme-primary-gradient", shades.gradient);
  } catch (err) {
    console.warn("Could not apply theme color:", err);
  }
}

/**
 * Lưu màu và áp dụng (alias thuận tiện)
 */
export const saveThemeColor = applyThemeColor;
