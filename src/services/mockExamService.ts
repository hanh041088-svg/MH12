import { Lesson, Question, TestResult } from "../types";
import { ALL_LESSONS } from "../data/curriculumData";

export interface MockExamOptions {
  questionCount?: number; // Số câu hỏi muốn tạo (mặc định 20)
  sourceMode?: "learned_only" | "all_curriculum" | "custom_selection"; // Nguồn câu hỏi
  selectedLessonIds?: string[]; // Danh sách bài học cụ thể do người dùng chọn hoặc từ preset
  examTitle?: string;
  themeTitle?: string;
}

export interface PresetMockExam {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  lessonRangeText: string;
  lessonIds: string[];
  questionCount: number;
  timeMinutes: number;
  description: string;
  iconType?: "midterm" | "final" | "thpt" | "speed" | "master";
}

export const PRESET_MOCK_EXAMS: PresetMockExam[] = [
  {
    id: "mock-midterm-1",
    title: "Đề Thi Thử Giữa Học Kì 1",
    badge: "Giữa HK1",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    lessonRangeText: "Bài 1 đến Bài 6 (Chủ đề 1, 2, 3)",
    lessonIds: ["bai-1", "bai-2", "bai-3", "bai-4", "bai-5", "bai-6"],
    questionCount: 20,
    timeMinutes: 20,
    description: "Tổng hợp kiến thức Trí tuệ nhân tạo (AI), Thiết bị mạng, Giao thức TCP/IP, Chia sẻ tài nguyên & Văn hóa mạng.",
    iconType: "midterm",
  },
  {
    id: "mock-final-1",
    title: "Đề Thi Thử Cuối Học Kì 1",
    badge: "Cuối HK1",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    lessonRangeText: "Bài 1 đến Bài 12 (Chủ đề 1, 2, 3, 4)",
    lessonIds: [
      "bai-1", "bai-2", "bai-3", "bai-4", "bai-5", "bai-6",
      "bai-7", "bai-8", "bai-9", "bai-10", "bai-11", "bai-12",
    ],
    questionCount: 28,
    timeMinutes: 30,
    description: "Bao quát toàn bộ học kì 1: Trí tuệ nhân tạo, Mạng máy tính, Đạo đức số và Lập trình cấu trúc trang Web HTML.",
    iconType: "final",
  },
  {
    id: "mock-midterm-2",
    title: "Đề Thi Thử Giữa Học Kì 2",
    badge: "Giữa HK2",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    lessonRangeText: "Bài 13 đến Bài 17 (Chủ đề 5 - CSS & Giao diện Web)",
    lessonIds: ["bai-13", "bai-14", "bai-15", "bai-16", "bai-17"],
    questionCount: 20,
    timeMinutes: 20,
    description: "Định dạng trang web nâng cao với CSS: Màu sắc, Khung viền (Box model), Ưu tiên bộ chọn và Thiết kế Menu.",
    iconType: "midterm",
  },
  {
    id: "mock-thpt-2025",
    title: "Đề Thi Thử Tốt Nghiệp THPT 2025 (Cấu trúc mới)",
    badge: "Tốt Nghiệp THPT",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
    lessonRangeText: "Toàn bộ 17 bài học SGK Tin học 12",
    lessonIds: ALL_LESSONS.map((l) => l.id),
    questionCount: 28,
    timeMinutes: 35,
    description: "Mô phỏng đề thi chính thức Tốt nghiệp THPT với định dạng trắc nghiệm 4 lựa chọn và trắc nghiệm Đúng/Sai.",
    iconType: "thpt",
  },
  {
    id: "mock-quick-10",
    title: "Đề Luyện Nhanh Phản Xạ (10 câu)",
    badge: "Luyện Nhanh",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    lessonRangeText: "Toàn bộ chương trình (Bốc ngẫu nhiên)",
    lessonIds: ALL_LESSONS.map((l) => l.id),
    questionCount: 10,
    timeMinutes: 10,
    description: "10 câu hỏi ngẫu nhiên kiểm tra nhanh phản xạ và mức độ nhớ bài, phù hợp ôn tập nhanh 10 phút.",
    iconType: "speed",
  },
  {
    id: "mock-comprehensive-40",
    title: "Đề Thi Thử Toàn Diện 40 Câu (Nâng Cao)",
    badge: "Toàn Diện",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    lessonRangeText: "Toàn bộ 17 bài học SGK Tin học 12",
    lessonIds: ALL_LESSONS.map((l) => l.id),
    questionCount: 40,
    timeMinutes: 45,
    description: "Đề thi thử chuyên sâu 40 câu trắc nghiệm tổng hợp toàn bộ chương trình lớp 12, đánh giá mức độ thuần thục tối đa.",
    iconType: "master",
  },
];

/**
 * Lấy danh sách các bài học mà học sinh đã từng làm bài kiểm tra
 */
export function getLearnedLessons(testHistory: TestResult[]): Lesson[] {
  const completedLessonIds = new Set(
    testHistory
      .filter((t) => !t.lessonId.startsWith("thi-thu-tong-hop"))
      .map((t) => t.lessonId)
  );
  return ALL_LESSONS.filter((l) => completedLessonIds.has(l.id));
}

/**
 * Đếm tổng số câu hỏi khả dụng từ các bài học đã học
 */
export function countLearnedQuestions(testHistory: TestResult[]): {
  learnedLessonsCount: number;
  totalQuestionsCount: number;
  mcCount: number;
  tfCount: number;
  matchingCount: number;
  fillBlankCount: number;
  shortAnswerCount: number;
} {
  const learnedLessons = getLearnedLessons(testHistory);
  let totalQuestionsCount = 0;
  let mcCount = 0;
  let tfCount = 0;
  let matchingCount = 0;
  let fillBlankCount = 0;
  let shortAnswerCount = 0;

  for (const lesson of learnedLessons) {
    for (const q of lesson.questions) {
      totalQuestionsCount++;
      if (q.type === "matching") {
        matchingCount++;
      } else if (q.type === "fill_in_the_blank") {
        fillBlankCount++;
      } else if (q.type === "short_answer") {
        shortAnswerCount++;
      } else if (
        q.type === "true_false" ||
        (q.options &&
          q.options.length === 2 &&
          q.options[0].toLowerCase().includes("đúng") &&
          q.options[1].toLowerCase().includes("sai"))
      ) {
        tfCount++;
      } else {
        mcCount++;
      }
    }
  }

  return {
    learnedLessonsCount: learnedLessons.length,
    totalQuestionsCount,
    mcCount,
    tfCount,
    matchingCount,
    fillBlankCount,
    shortAnswerCount,
  };
}

/**
 * Thuật toán xáo trộn Fisher-Yates
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Tự động tạo một bài kiểm tra tổng hợp từ các bài học đã học
 */
export function generateComprehensiveExam(
  testHistory: TestResult[],
  options: MockExamOptions = {}
): Lesson {
  const {
    questionCount = 20,
    sourceMode = "learned_only",
    selectedLessonIds,
    examTitle,
    themeTitle,
  } = options;

  const learnedLessons = getLearnedLessons(testHistory);

  let targetLessons: Lesson[] = [];
  let isCustom = false;

  if (selectedLessonIds && selectedLessonIds.length > 0) {
    targetLessons = ALL_LESSONS.filter((l) => selectedLessonIds.includes(l.id));
    isCustom = true;
  } else if (sourceMode === "learned_only" && learnedLessons.length > 0) {
    targetLessons = learnedLessons;
  } else {
    targetLessons = ALL_LESSONS;
  }

  // Nếu targetLessons trống vì lý do nào đó, fallback về ALL_LESSONS
  if (targetLessons.length === 0) {
    targetLessons = ALL_LESSONS;
  }

  const isAllFallback = !isCustom && sourceMode === "learned_only" && learnedLessons.length === 0;

  // Thu thập toàn bộ câu hỏi từ các bài học mục tiêu kèm thông tin bài gốc
  type QuestionWithMeta = Question & {
    sourceLessonId: string;
    sourceLessonTitle: string;
    sourceLessonNumber: number;
  };

  const poolByLesson: Record<string, QuestionWithMeta[]> = {};
  const allPool: QuestionWithMeta[] = [];

  for (const lesson of targetLessons) {
    poolByLesson[lesson.id] = [];
    for (const q of lesson.questions) {
      const item: QuestionWithMeta = {
        ...q,
        options: [...q.options],
        sourceLessonId: lesson.id,
        sourceLessonTitle: lesson.title,
        sourceLessonNumber: lesson.lessonNumber,
      };
      poolByLesson[lesson.id].push(item);
      allPool.push(item);
    }
  }

  const selectedPool: QuestionWithMeta[] = [];
  const pickedIds = new Set<string>();

  // Bước 1: Đảm bảo tính đại diện - lấy ít nhất 1 câu từ mỗi bài học đã chọn nếu số lượng yêu cầu đủ lớn
  const shuffledLessons = shuffleArray(targetLessons);
  if (questionCount >= targetLessons.length) {
    for (const lesson of shuffledLessons) {
      const lessonQuestions = shuffleArray(poolByLesson[lesson.id] || []);
      if (lessonQuestions.length > 0) {
        const picked = lessonQuestions[0];
        selectedPool.push(picked);
        pickedIds.add(picked.id);
      }
    }
  }

  // Bước 2: Lấy thêm các câu hỏi ngẫu nhiên còn lại trong kho cho đến khi đủ số lượng yêu cầu
  const remainingCandidates = shuffleArray(allPool.filter((q) => !pickedIds.has(q.id)));
  const needed = questionCount - selectedPool.length;

  for (let i = 0; i < needed && i < remainingCandidates.length; i++) {
    selectedPool.push(remainingCandidates[i]);
  }

  // Bước 3: Xáo trộn toàn bộ danh sách câu hỏi đã chọn để các câu không bị xếp theo bài
  const finalShuffled = shuffleArray(selectedPool);

  // Tạo các đối tượng Question hoàn chỉnh với id duy nhất và ghi chú bài gốc trong lời giải
  const examQuestions: Question[] = finalShuffled.map((q, idx) => {
    const lessonShortName = q.sourceLessonNumber > 0 ? `Bài ${q.sourceLessonNumber}` : "SGK Tin 12";
    const enhancedExplanation = q.explanation.includes("[")
      ? q.explanation
      : `[${lessonShortName}: ${q.sourceLessonTitle.replace(/Bài \d+: /, "")}] ${q.explanation}`;

    return {
      id: `mock-q-${idx + 1}-${q.id}`,
      question: q.question,
      options: [...q.options],
      correctIndex: q.correctIndex,
      explanation: enhancedExplanation,
      level: q.level,
      type: q.type,
      matchingPairs: q.matchingPairs ? [...q.matchingPairs] : undefined,
      acceptedAnswers: q.acceptedAnswers ? [...q.acceptedAnswers] : undefined,
      blanksCount: q.blanksCount,
      placeholder: q.placeholder,
      wordBank: q.wordBank ? [...q.wordBank] : undefined,
    };
  });

  const mcCount = examQuestions.filter(
    (q) =>
      q.type !== "true_false" &&
      !(
        q.options.length === 2 &&
        q.options[0].toLowerCase().includes("đúng") &&
        q.options[1].toLowerCase().includes("sai")
      )
  ).length;
  const tfCount = examQuestions.length - mcCount;

  const sourceDesc = isCustom
    ? `${targetLessons.length} bài học được chọn`
    : isAllFallback
    ? "toàn bộ 17 bài học SGK (do chưa làm bài lẻ)"
    : sourceMode === "learned_only"
    ? `${targetLessons.length} bài học bạn đã ôn tập`
    : "toàn bộ chương trình SGK Tin học 12";

  const resolvedTitle =
    examTitle || `Thi Thử Tổng Hợp Tin Học 12 (${examQuestions.length} câu)`;
  const resolvedThemeTitle =
    themeTitle || "Đề Thi Thử Tổng Hợp Toàn Diện";

  return {
    id: `thi-thu-tong-hop-${Date.now()}`,
    lessonNumber: 0,
    title: resolvedTitle,
    themeId: "theme-tong-hop",
    themeTitle: resolvedThemeTitle,
    keyConcepts: [
      `Đề kiểm tra ngẫu nhiên tạo từ ${sourceDesc}`,
      `Cấu trúc đề gồm ${mcCount} câu 4 lựa chọn và ${tfCount} câu Đúng/Sai`,
      "Mô phỏng áp lực phòng thi thật, tự động chấm điểm và đánh giá năng lực",
    ],
    summary: `Đề thi thử tổng hợp gồm ${examQuestions.length} câu hỏi được chọn ngẫu nhiên từ ${sourceDesc}. Rèn luyện phản xạ và kiểm tra mức độ ghi nhớ kiến thức tổng thể.`,
    questions: examQuestions,
  };
}
