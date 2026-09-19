export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "matching"
  | "fill_in_the_blank"
  | "short_answer";

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  level: "Nhận biết" | "Thông hiểu" | "Vận dụng";
  type?: QuestionType;

  // Thuộc tính mở rộng cho câu hỏi Ghép nối (matching)
  matchingPairs?: MatchingPair[];

  // Thuộc tính mở rộng cho Điền vào chỗ trống (fill_in_the_blank) và Câu trả lời ngắn (short_answer)
  acceptedAnswers?: string[];
  blanksCount?: number;
  placeholder?: string;
  wordBank?: string[]; // Ngân hàng từ khóa gợi ý nếu có
}

export interface Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  themeId: string;
  themeTitle: string;
  keyConcepts: string[];
  summary: string;
  questions: Question[];
}

export interface Theme {
  id: string;
  themeNumber: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface TestResult {
  id: string;
  lessonId: string;
  lessonTitle: string;
  themeId: string;
  score: number; // 0 - 10 scale
  totalQuestions: number;
  correctCount: number;
  timeSpentSeconds: number;
  completedAt: string;
  answers: {
    questionId: string;
    selectedOption: number;
    userAnswer?: any;
    isCorrect: boolean;
  }[];
}

export interface AchievementBadge {
  id: string;
  name: string;
  englishName: string;
  description: string;
  category: "streak" | "accuracy" | "completion" | "mastery" | "speed";
  iconName: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  colorGradient: string;
  bgLight: string;
  borderColor: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  className: string;
  avatar?: string;
  testResults: TestResult[];
  savedRoadmap?: string;
}

export interface TeacherStudentSummary {
  id: string;
  name: string;
  email: string;
  className: string;
  testsCompleted: number;
  averageScore: number;
  highestScore: number;
  lastActive: string;
  weakTopics: string[];
  recentScores: { lessonTitle: string; score: number }[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  relatedLesson?: string;
}

export interface StudentAccount {
  id: string;
  studentCode: string; // Mã học sinh / Số báo danh đăng nhập (ví dụ: 12A101, 12A102)
  name: string;
  className: string;
  password: string;
  email?: string;
  createdAt: string;
  lastLogin?: string;
  testResults?: TestResult[];
}

export interface TeacherAccount {
  id: string;
  username: string; // Tên đăng nhập (ví dụ: giaovien, cohanh)
  name: string;
  school?: string;
  password: string;
  email?: string;
}

export interface CurrentUserSession {
  role: "student" | "teacher";
  account: StudentAccount | TeacherAccount;
}
