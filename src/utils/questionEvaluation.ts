import { Question } from "../types";

/**
 * Chuẩn hóa chuỗi văn bản để so sánh câu trả lời ngắn hoặc điền từ
 */
export function normalizeAnswerText(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/^[.,;:!?]+|[.,;:!?]+$/g, "");
}

/**
 * Kiểm tra câu hỏi đã được người học trả lời hay chưa
 */
export function isQuestionAnswered(question: Question, answer: any): boolean {
  if (answer === undefined || answer === null) return false;

  const type = question.type || "multiple_choice";

  switch (type) {
    case "short_answer":
      return typeof answer === "string" && answer.trim().length > 0;

    case "fill_in_the_blank":
      if (Array.isArray(answer)) {
        const count = question.blanksCount || question.acceptedAnswers?.length || 1;
        return (
          answer.length >= count &&
          answer.every((val) => typeof val === "string" && val.trim().length > 0)
        );
      }
      return typeof answer === "string" && answer.trim().length > 0;

    case "matching":
      if (typeof answer === "object" && answer !== null) {
        const targetCount = question.matchingPairs?.length || 0;
        return Object.keys(answer).length === targetCount && targetCount > 0;
      }
      return false;

    case "true_false":
    case "multiple_choice":
    default:
      return typeof answer === "number";
  }
}

/**
 * Đánh giá tính chính xác của câu trả lời học sinh
 */
export function checkQuestionCorrectness(question: Question, answer: any): boolean {
  if (!isQuestionAnswered(question, answer)) return false;

  const type = question.type || "multiple_choice";

  switch (type) {
    case "short_answer": {
      const userText = normalizeAnswerText(String(answer));
      const accepted = question.acceptedAnswers || [];
      return accepted.some((acc) => {
        const normAcc = normalizeAnswerText(acc);
        // So khớp trực tiếp hoặc bỏ qua tiền tố thường gặp
        if (userText === normAcc) return true;
        const simplifiedUser = userText.replace(/^(thẻ|giao thức|thiết bị|bộ|thuộc tính)\s+/i, "");
        const simplifiedAcc = normAcc.replace(/^(thẻ|giao thức|thiết bị|bộ|thuộc tính)\s+/i, "");
        return simplifiedUser === simplifiedAcc;
      });
    }

    case "fill_in_the_blank": {
      const accepted = question.acceptedAnswers || [];
      if (Array.isArray(answer)) {
        return accepted.every((accGroup, idx) => {
          const userWord = normalizeAnswerText(String(answer[idx] || ""));
          const validOptions = accGroup.split("|").map(normalizeAnswerText);
          return validOptions.includes(userWord);
        });
      }
      // Trường hợp chỉ có 1 ô điền từ
      const userWord = normalizeAnswerText(String(answer));
      const validOptions = accepted.flatMap((g) => g.split("|")).map(normalizeAnswerText);
      return validOptions.includes(userWord);
    }

    case "matching": {
      if (!question.matchingPairs || question.matchingPairs.length === 0) return false;
      const userMatch = (answer as Record<string, string>) || {};
      return question.matchingPairs.every((pair) => {
        const matchedRight = userMatch[pair.id];
        return (
          matchedRight === pair.right ||
          matchedRight === pair.id ||
          normalizeAnswerText(matchedRight || "") === normalizeAnswerText(pair.right)
        );
      });
    }

    case "true_false":
    case "multiple_choice":
    default:
      return answer === question.correctIndex;
  }
}

/**
 * Hiển thị mô tả câu trả lời của học sinh
 */
export function formatUserAnswerDisplay(question: Question, answer: any): string {
  if (answer === undefined || answer === null) return "(Chưa trả lời)";

  const type = question.type || "multiple_choice";

  switch (type) {
    case "short_answer":
      return String(answer).trim();

    case "fill_in_the_blank":
      if (Array.isArray(answer)) {
        return answer.map((val, i) => `(${i + 1}): "${val}"`).join(" | ");
      }
      return String(answer);

    case "matching": {
      if (!question.matchingPairs) return "";
      const userMatch = (answer as Record<string, string>) || {};
      return question.matchingPairs
        .map((p, idx) => {
          const matched = userMatch[p.id] || "(chưa nối)";
          return `${idx + 1}. [${p.left}] ➔ ${matched}`;
        })
        .join(" ; ");
    }

    case "true_false": {
      const opt = question.options[Number(answer)];
      return opt ? opt : "(Chưa chọn)";
    }

    case "multiple_choice":
    default: {
      const idx = Number(answer);
      if (idx >= 0 && idx < question.options.length) {
        return `${String.fromCharCode(65 + idx)}. ${question.options[idx]}`;
      }
      return "(Chưa chọn)";
    }
  }
}

/**
 * Hiển thị mô tả đáp án chuẩn theo SGK
 */
export function formatCorrectAnswerDisplay(question: Question): string {
  const type = question.type || "multiple_choice";

  switch (type) {
    case "short_answer":
      return (question.acceptedAnswers || []).join(" HOẶC ");

    case "fill_in_the_blank":
      return (question.acceptedAnswers || [])
        .map((acc, idx) => `(${idx + 1}): ${acc.replace(/\|/g, " / ")}`)
        .join(" | ");

    case "matching": {
      if (!question.matchingPairs) return "";
      return question.matchingPairs
        .map((p, idx) => `${idx + 1}. [${p.left}] ➔ [${p.right}]`)
        .join(" ; ");
    }

    case "true_false":
    case "multiple_choice":
    default: {
      const idx = question.correctIndex;
      if (idx >= 0 && idx < question.options.length) {
        return `${String.fromCharCode(65 + idx)}. ${question.options[idx]}`;
      }
      return "Đáp án mẫu";
    }
  }
}
