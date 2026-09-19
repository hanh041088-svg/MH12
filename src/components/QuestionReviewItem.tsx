import React from "react";
import { Question } from "../types";
import {
  CheckCircle2,
  XCircle,
  Bot,
  Sparkles,
  Edit3,
  Check,
  X,
  FileText,
} from "lucide-react";
import {
  checkQuestionCorrectness,
  formatUserAnswerDisplay,
  formatCorrectAnswerDisplay,
} from "../utils/questionEvaluation";

interface QuestionReviewItemProps {
  question: Question;
  index: number;
  userAnswer: any;
  aiExplanation?: string;
  isAiExplaining?: boolean;
  onRequestAiExplanation: () => void;
}

export const QuestionReviewItem: React.FC<QuestionReviewItemProps> = ({
  question,
  index,
  userAnswer,
  aiExplanation,
  isAiExplaining,
  onRequestAiExplanation,
}) => {
  const isCorrect = checkQuestionCorrectness(question, userAnswer);
  const type = question.type || "multiple_choice";

  // Badge loại câu hỏi
  const getTypeBadge = () => {
    switch (type) {
      case "fill_in_the_blank":
        return (
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
            <FileText className="w-3 h-3 text-amber-600" />
            Điền từ khuyết
          </span>
        );
      case "short_answer":
        return (
          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
            <Edit3 className="w-3 h-3 text-purple-600" />
            Trả lời ngắn
          </span>
        );
      case "true_false":
        return (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Đúng / Sai
          </span>
        );
      case "multiple_choice":
      default:
        return (
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            4 Lựa chọn
          </span>
        );
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border p-6 transition-all shadow-xs ${
        isCorrect ? "border-emerald-200" : "border-rose-200"
      }`}
    >
      {/* Header câu hỏi */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            Câu {index + 1}
          </span>
          {isCorrect ? (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              <XCircle className="w-3.5 h-3.5" /> Chưa đúng
            </span>
          )}
          <span className="text-xs text-slate-500">({question.level})</span>
          {getTypeBadge()}
        </div>

        {/* Nút AI giải thích chuyên sâu */}
        <button
          type="button"
          onClick={onRequestAiExplanation}
          disabled={isAiExplaining}
          className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors shrink-0"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>{isAiExplaining ? "AI đang phân tích..." : "AI Giải thích chuyên sâu"}</span>
        </button>
      </div>

      {/* Đề bài */}
      <h4 className="font-bold text-slate-900 text-base mt-3 leading-relaxed">
        {question.question}
      </h4>

      {/* Hiển thị chi tiết theo từng loại câu hỏi */}
      <div className="mt-4">
        {/* 1. Dạng Điền từ khuyết */}
        {type === "fill_in_the_blank" && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-700 shrink-0">Từ bạn đã điền:</span>
                <span className={`font-bold ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                  {formatUserAnswerDisplay(question, userAnswer)}
                </span>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-slate-200">
                <span className="font-bold text-emerald-800 shrink-0">Đáp án chuẩn SGK:</span>
                <span className="font-bold text-emerald-700">
                  {formatCorrectAnswerDisplay(question)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Dạng Trả lời ngắn */}
        {type === "short_answer" && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-700 shrink-0">Câu trả lời của bạn:</span>
                <span className={`font-bold ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                  "{formatUserAnswerDisplay(question, userAnswer)}"
                </span>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-slate-200">
                <span className="font-bold text-emerald-800 shrink-0">Các đáp án được chấp nhận:</span>
                <span className="font-bold text-emerald-700">
                  {formatCorrectAnswerDisplay(question)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Dạng Trắc nghiệm 4 lựa chọn hoặc Đúng/Sai */}
        {(type === "multiple_choice" || type === "true_false") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {question.options.map((opt, optIdx) => {
              const isThisSelected = userAnswer === optIdx;
              const isThisCorrect = question.correctIndex === optIdx;

              let style = "border-slate-200 bg-slate-50 text-slate-700";
              if (isThisCorrect) {
                style = "border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold";
              } else if (isThisSelected && !isThisCorrect) {
                style = "border-rose-300 bg-rose-50 text-rose-800 font-semibold line-through";
              }

              return (
                <div
                  key={optIdx}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${style}`}
                >
                  <span>
                    <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                  </span>
                  {isThisCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {isThisSelected && !isThisCorrect && (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lời giải thích SGK */}
      <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
        <strong className="text-blue-700">Giải thích SGK:</strong> {question.explanation}
      </div>

      {/* Phân tích AI chuyên sâu */}
      {aiExplanation && (
        <div className="mt-3 p-4 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-950 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 font-bold text-blue-800 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Phân tích mở rộng từ AI Gia Sư:</span>
          </div>
          <div className="whitespace-pre-line leading-relaxed">{aiExplanation}</div>
        </div>
      )}
    </div>
  );
};
