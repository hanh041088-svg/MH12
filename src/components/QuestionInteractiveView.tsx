import React from "react";
import { Question } from "../types";
import {
  Check,
  X,
  Edit3,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Tag,
  ArrowRight,
} from "lucide-react";

interface QuestionInteractiveViewProps {
  question: Question;
  selectedAnswer: any;
  onAnswerChange: (answer: any) => void;
  isSubmitted?: boolean;
}

export const QuestionInteractiveView: React.FC<QuestionInteractiveViewProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  isSubmitted = false,
}) => {
  const type = question.type || "multiple_choice";

  // 1. DẠNG TRẮC NGHIỆM ĐÚNG / SAI
  if (
    type === "true_false" ||
    (question.options.length === 2 &&
      question.options[0].toLowerCase().includes("đúng") &&
      question.options[1].toLowerCase().includes("sai"))
  ) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {question.options.map((option, optIdx) => {
          const isSelected = selectedAnswer === optIdx;
          const isTrueOpt = optIdx === 0 || option.toLowerCase().includes("đúng");

          return (
            <div
              key={optIdx}
              onClick={() => {
                if (!isSubmitted) onAnswerChange(optIdx);
              }}
              className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? isTrueOpt
                    ? "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm"
                    : "border-rose-600 bg-rose-50 text-rose-950 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                  isSelected
                    ? isTrueOpt
                      ? "bg-emerald-600 text-white"
                      : "bg-rose-600 text-white"
                    : isTrueOpt
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {isTrueOpt ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <X className="w-5 h-5 stroke-[2.5]" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-base font-bold">{option}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {isTrueOpt ? "Mệnh đề trên là ĐÚNG" : "Mệnh đề trên là SAI"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 2. DẠNG ĐIỀN TỪ VÀO CHỖ TRỐNG (FILL IN THE BLANK)
  if (type === "fill_in_the_blank") {
    const blanksCount = question.blanksCount || question.acceptedAnswers?.length || 1;
    const currentAnswers: string[] = Array.isArray(selectedAnswer)
      ? selectedAnswer
      : typeof selectedAnswer === "string"
      ? [selectedAnswer]
      : [];

    const handleBlankChange = (index: number, val: string) => {
      if (isSubmitted) return;
      const updated = [...currentAnswers];
      // Đảm bảo mảng đủ kích thước
      while (updated.length < blanksCount) updated.push("");
      updated[index] = val;
      onAnswerChange(updated);
    };

    return (
      <div className="space-y-6">
        <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
          <strong>Hướng dẫn điền từ:</strong> Nhập từ hoặc cụm từ thích hợp theo SGK vào từng ô trống tương ứng dưới đây.
        </div>

        {/* Các ô nhập từ khuyết */}
        <div className="space-y-3.5">
          {Array.from({ length: blanksCount }).map((_, idx) => {
            const val = currentAnswers[idx] || "";

            return (
              <div
                key={idx}
                className="p-4 bg-white rounded-2xl border-2 border-slate-200 focus-within:border-blue-600 focus-within:bg-blue-50/20 transition-all"
              >
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>Từ cần điền cho vị trí ({idx + 1}):</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={val}
                    onChange={(e) => handleBlankChange(idx, e.target.value)}
                    placeholder={`Nhập từ khóa cho vị trí (${idx + 1})...`}
                    className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-hidden focus:bg-white focus:border-blue-600"
                  />
                  {val && !isSubmitted && (
                    <button
                      type="button"
                      onClick={() => handleBlankChange(idx, "")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ngân hàng từ khóa gợi ý nếu có */}
        {question.wordBank && question.wordBank.length > 0 && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>Ngân hàng từ khóa gợi ý (Nhấp để chèn):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {question.wordBank.map((word, wIdx) => (
                <button
                  key={wIdx}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => {
                    // Tìm ô trống đầu tiên chưa có dữ liệu để điền
                    const emptyIdx = Array.from({ length: blanksCount }).findIndex(
                      (_, i) => !currentAnswers[i] || currentAnswers[i].trim() === ""
                    );
                    if (emptyIdx !== -1) {
                      handleBlankChange(emptyIdx, word);
                    } else {
                      // Nếu đã điền hết thì điền vào ô đầu tiên
                      handleBlankChange(0, word);
                    }
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 text-xs font-bold rounded-xl shadow-2xs transition-all active:scale-95"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. DẠNG CÂU TRẢ LỜI NGẮN (SHORT ANSWER)
  if (type === "short_answer") {
    const textVal = typeof selectedAnswer === "string" ? selectedAnswer : "";

    return (
      <div className="space-y-4">
        <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200 text-xs text-purple-950 leading-relaxed">
          <strong>Câu hỏi tự luận ngắn:</strong> Hãy gõ câu trả lời chính xác theo thuật ngữ SGK Tin học 12 (Ví dụ: tên thiết bị, tên giao thức, thuộc tính CSS, thẻ HTML...).
        </div>

        <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 focus-within:border-purple-600 focus-within:bg-purple-50/10 transition-all space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <Edit3 className="w-4 h-4 text-purple-600" />
              <span>Nhập câu trả lời của bạn:</span>
            </span>
            <span>{textVal.trim().length} ký tự</span>
          </div>

          <input
            type="text"
            disabled={isSubmitted}
            value={textVal}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder={question.placeholder || "Ví dụ: Router, Switch, TCP/IP, <a>, color..."}
            className="w-full text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-hidden focus:bg-white focus:border-purple-600"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Hệ thống không phân biệt chữ in hoa hay chữ thường.</span>
            {textVal && !isSubmitted && (
              <button
                type="button"
                onClick={() => onAnswerChange("")}
                className="text-rose-600 hover:underline font-semibold"
              >
                Xóa câu trả lời
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 5. MẶC ĐỊNH: TRẮC NGHIỆM 4 LỰA CHỌN (MULTIPLE CHOICE)
  return (
    <div className="space-y-3">
      {question.options.map((option, optIdx) => {
        const isSelected = selectedAnswer === optIdx;
        const optionLabel = String.fromCharCode(65 + optIdx);

        return (
          <div
            key={optIdx}
            onClick={() => {
              if (!isSubmitted) onAnswerChange(optIdx);
            }}
            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              isSelected
                ? "border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs"
                : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/30"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {optionLabel}
            </div>
            <div className="text-sm pt-0.5 leading-relaxed font-medium">
              {option}
            </div>
          </div>
        );
      })}
    </div>
  );
};
