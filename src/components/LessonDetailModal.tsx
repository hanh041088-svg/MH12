import React from "react";
import { Lesson } from "../types";
import { X, BookOpen, CheckCircle, ArrowRight, Lightbulb } from "lucide-react";

interface LessonDetailModalProps {
  lesson: Lesson;
  onClose: () => void;
  onStartTest: (lesson: Lesson) => void;
  highestScore?: number;
}

export const LessonDetailModal: React.FC<LessonDetailModalProps> = ({
  lesson,
  onClose,
  onStartTest,
  highestScore,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 text-slate-800">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/80">
          <div>
            <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              {lesson.themeTitle}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">{lesson.title}</h2>
            <p className="text-xs text-slate-500 mt-1">
              Bộ sách: Kết nối tri thức với cuộc sống (Định hướng Tin học ứng dụng)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Summary */}
          <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100">
            <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wide flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Tổng quan nội dung
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">{lesson.summary}</p>
          </div>

          {/* Key Concepts from Textbook */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Kiến thức trọng tâm (SGK Tin học 12)
            </h3>
            <ul className="space-y-2.5">
              {lesson.keyConcepts.map((concept, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-2xs"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{concept}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Status info */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-800">Số lượng câu hỏi:</span>{" "}
              {lesson.questions.length} câu trắc nghiệm chuẩn hóa
            </div>
            {highestScore !== undefined && (
              <div>
                <span className="font-semibold text-slate-800">Điểm cao nhất:</span>{" "}
                <span
                  className={`font-bold text-sm ${
                    highestScore >= 8
                      ? "text-emerald-600"
                      : highestScore >= 6.5
                      ? "text-blue-600"
                      : "text-amber-600"
                  }`}
                >
                  {highestScore.toFixed(1)}/10
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              onClose();
              onStartTest(lesson);
            }}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-500 shadow-xs transition-colors"
          >
            <span>Bắt đầu làm bài test</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
