import { Question, TestResult } from "../types";
import { ALL_LESSONS } from "../data/curriculumData";

export interface FlashcardItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  selectedOption?: number;
  explanation: string;
  lessonId?: string;
  lessonTitle: string;
  level: "Nhận biết" | "Thông hiểu" | "Vận dụng";
  isMastered?: boolean;
}

export interface LatestWrongQuestionsData {
  testId?: string;
  lessonId?: string;
  lessonTitle: string;
  score: number;
  totalWrong: number;
  completedAt: string;
  cards: FlashcardItem[];
}

const STORAGE_KEY = "tinhoc12_latest_wrong_questions";
const MASTERED_KEY = "tinhoc12_mastered_flashcards";

/**
 * Lấy danh sách các câu đã đánh dấu "Đã hiểu / Đã nắm vững"
 */
export function getMasteredCardIds(): Set<string> {
  try {
    const raw = localStorage.getItem(MASTERED_KEY);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch (e) {
    console.warn("Could not read mastered flashcards", e);
  }
  return new Set();
}

/**
 * Lưu trạng thái đã hiểu của 1 câu hỏi
 */
export function setCardMastered(cardId: string, isMastered: boolean): void {
  try {
    const current = getMasteredCardIds();
    if (isMastered) {
      current.add(cardId);
    } else {
      current.delete(cardId);
    }
    localStorage.setItem(MASTERED_KEY, JSON.stringify(Array.from(current)));
  } catch (e) {
    console.warn("Could not save card mastered state", e);
  }
}

/**
 * Lưu danh sách câu hỏi sai từ bài kiểm tra vừa hoàn thành
 */
export function saveLatestTestWrongQuestions(
  testResult: TestResult,
  questions: Question[],
  selectedAnswers: Record<number, any>
): LatestWrongQuestionsData {
  const masteredSet = getMasteredCardIds();
  const wrongCards: FlashcardItem[] = [];

  questions.forEach((q, idx) => {
    const selected = selectedAnswers[idx];
    const isCorrect = testResult.answers[idx]?.isCorrect ?? false;

    if (!isCorrect) {
      wrongCards.push({
        id: q.id || `q-${idx}`,
        question: q.question,
        options: q.options || [],
        correctIndex: q.correctIndex ?? 0,
        selectedOption: typeof selected === "number" ? selected : -1,
        explanation: q.explanation,
        lessonId: testResult.lessonId,
        lessonTitle: testResult.lessonTitle,
        level: q.level,
        isMastered: masteredSet.has(q.id),
      });
    }
  });

  const data: LatestWrongQuestionsData = {
    testId: testResult.id,
    lessonId: testResult.lessonId,
    lessonTitle: testResult.lessonTitle,
    score: testResult.score,
    totalWrong: wrongCards.length,
    completedAt: testResult.completedAt || new Date().toISOString(),
    cards: wrongCards,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Could not save latest wrong questions to localStorage", e);
  }

  return data;
}

/**
 * Dữ liệu dự phòng mặc định từ Bài 3: Thiết bị mạng (đáp ứng ngay khi học sinh chưa làm bài nào)
 */
const DEFAULT_FALLBACK_WRONG_QUESTIONS: FlashcardItem[] = [
  {
    id: "fb-1",
    question: "Thiết bị mạng nào hoạt động ở tầng Liên kết dữ liệu (Data Link) và sử dụng địa chỉ MAC để chuyển tiếp khung dữ liệu?",
    options: [
      "Switch (Bộ chuyển mạch)",
      "Hub (Bộ tập trung)",
      "Router (Bộ định tuyến)",
      "Repeater (Bộ lặp)",
    ],
    correctIndex: 0,
    selectedOption: 2, // Học sinh từng nhầm sang Router
    explanation: "Switch hoạt động ở tầng Data Link (tầng 2) và dùng bảng địa chỉ MAC để chuyển tiếp khung (frame). Router hoạt động ở tầng Network (tầng 3) và dùng địa chỉ IP.",
    lessonId: "bai-3",
    lessonTitle: "Bài 3: Thiết bị mạng",
    level: "Thông hiểu",
  },
  {
    id: "fb-2",
    question: "Điểm khác biệt cơ bản nhất giữa Hub và Switch khi truyền tải dữ liệu trong mạng cục bộ LAN là gì?",
    options: [
      "Hub gửi dữ liệu đến mọi cổng (broadcast), Switch chỉ gửi đến cổng của thiết bị đích",
      "Hub hỗ trợ truyền dữ liệu không dây, Switch chỉ hỗ trợ có dây",
      "Hub có tốc độ xử lý nhanh hơn Switch rất nhiều",
      "Hub sử dụng địa chỉ IP còn Switch sử dụng tên miền",
    ],
    correctIndex: 0,
    selectedOption: 1, // Học sinh từng nhầm
    explanation: "Hub là thiết bị truyền tin quảng bá đơn giản (broadcast) tới tất cả các cổng, gây xung đột và lãng phí băng thông; trong khi Switch có khả năng phân biệt cổng đích qua địa chỉ MAC.",
    lessonId: "bai-3",
    lessonTitle: "Bài 3: Thiết bị mạng",
    level: "Nhận biết",
  },
  {
    id: "fb-3",
    question: "Trong mạng máy tính, Modem có vai trò chủ yếu nào sau đây?",
    options: [
      "Chuyển đổi tín hiệu số từ máy tính thành tín hiệu tương tự để truyền qua đường truyền viễn thông và ngược lại",
      "Định tuyến các gói tin qua nhiều mạng khác nhau trên toàn cầu",
      "Cung cấp địa chỉ IP động cho tất cả các thiết bị trong mạng gia đình",
      "Ngăn chặn hoàn toàn các cuộc tấn công mã độc từ Internet",
    ],
    correctIndex: 0,
    selectedOption: 2, // Học sinh từng nhầm với DHCP Server
    explanation: "Modem viết tắt của Modulator/Demodulator, có chức năng điều chế và giải điều chế tín hiệu giữa tín hiệu số (digital) của thiết bị và tín hiệu tương tự (analog) của nhà mạng viễn thông.",
    lessonId: "bai-3",
    lessonTitle: "Bài 3: Thiết bị mạng",
    level: "Thông hiểu",
  },
];

/**
 * Lấy danh sách câu hỏi sai từ bài kiểm tra gần nhất
 */
export function getLatestWrongQuestions(testHistory: TestResult[] = []): LatestWrongQuestionsData {
  const masteredSet = getMasteredCardIds();

  // 1. Kiểm tra trong localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: LatestWrongQuestionsData = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.cards)) {
        // Cập nhật trạng thái mastered mới nhất
        parsed.cards = parsed.cards.map((c) => ({
          ...c,
          isMastered: masteredSet.has(c.id),
        }));
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Error reading stored latest wrong questions", e);
  }

  // 2. Tìm trong testHistory nếu có bài kiểm tra gần nhất
  if (testHistory.length > 0) {
    for (const test of testHistory) {
      // Tìm bài học tương ứng
      const lesson = ALL_LESSONS.find((l) => l.id === test.lessonId);
      if (lesson && test.answers && test.answers.length > 0) {
        const wrongAnswers = test.answers.filter((a) => !a.isCorrect);
        if (wrongAnswers.length > 0) {
          const cards: FlashcardItem[] = [];
          wrongAnswers.forEach((wa) => {
            const q = lesson.questions.find((quest) => quest.id === wa.questionId);
            if (q) {
              cards.push({
                id: q.id,
                question: q.question,
                options: q.options,
                correctIndex: q.correctIndex,
                selectedOption: wa.selectedOption,
                explanation: q.explanation,
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                level: q.level,
                isMastered: masteredSet.has(q.id),
              });
            }
          });

          if (cards.length > 0) {
            return {
              testId: test.id,
              lessonId: test.lessonId,
              lessonTitle: test.lessonTitle,
              score: test.score,
              totalWrong: cards.length,
              completedAt: test.completedAt,
              cards,
            };
          }
        }
      }
    }
  }

  // 3. Nếu chưa có bài nào sai hoặc mới bắt đầu, trả về bộ câu hỏi củng cố mẫu của bài gần nhất
  return {
    testId: "default-recent",
    lessonId: "bai-3",
    lessonTitle: "Bài 3: Thiết bị mạng",
    score: 6.0,
    totalWrong: DEFAULT_FALLBACK_WRONG_QUESTIONS.length,
    completedAt: new Date().toISOString(),
    cards: DEFAULT_FALLBACK_WRONG_QUESTIONS.map((c) => ({
      ...c,
      isMastered: masteredSet.has(c.id),
    })),
  };
}
