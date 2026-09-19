import React, { useState, useEffect } from "react";
import { Lesson, Question, TestResult } from "../types";
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Award,
  RotateCcw,
  Cloud,
  ExternalLink,
  Bot,
  Flag,
  Lightbulb,
  AlertTriangle,
  Timer,
  Zap,
  Layers,
  Check,
  X,
  FileText,
  Edit3,
} from "lucide-react";
import confetti from "canvas-confetti";
import { uploadToDrive, generateCertificateHTML } from "../services/driveService";
import {
  QuizCountdownTimer,
  ChallengeMode,
  CHALLENGE_PRESETS,
} from "./QuizCountdownTimer";
import {
  saveLatestTestWrongQuestions,
  LatestWrongQuestionsData,
} from "../services/flashcardService";
import { WrongQuestionsFlashcardModal } from "./WrongQuestionsFlashcardModal";
import { QuestionInteractiveView } from "./QuestionInteractiveView";
import { QuestionReviewItem } from "./QuestionReviewItem";
import {
  isQuestionAnswered,
  checkQuestionCorrectness,
} from "../utils/questionEvaluation";

interface TestViewProps {
  lesson: Lesson;
  studentName: string;
  accessToken: string | null;
  onFinishTest: (result: TestResult) => void;
  onExit: () => void;
}

export const TestView: React.FC<TestViewProps> = ({
  lesson,
  studentName,
  accessToken,
  onFinishTest,
  onExit,
}) => {
  // Test state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  
  // Challenge Mode & Countdown Timer
  const [challengeMode, setChallengeMode] = useState<ChallengeMode>("standard");
  const initialSeconds = lesson.questions.length * CHALLENGE_PRESETS.standard.secondsPerQuestion;
  const [totalSeconds, setTotalSeconds] = useState<number>(initialSeconds);
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [timeoutSubmitted, setTimeoutSubmitted] = useState<boolean>(false);

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // AI Hint state
  const [hintLoading, setHintLoading] = useState<boolean>(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [showHintModal, setShowHintModal] = useState<boolean>(false);

  // AI Detailed Explanation state (per question in review mode)
  const [explainingQuestionId, setExplainingQuestionId] = useState<string | null>(null);
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});

  // AI Extra Drill state
  const [drillQuestions, setDrillQuestions] = useState<Question[]>([]);
  const [drillLoading, setDrillLoading] = useState<boolean>(false);
  const [activeDrillMode, setActiveDrillMode] = useState<boolean>(false);

  // Google Drive upload state
  const [isUploadingToDrive, setIsUploadingToDrive] = useState<boolean>(false);
  const [driveFileLink, setDriveFileLink] = useState<string | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);

  // Flashcard mode state for wrong questions
  const [showFlashcardModal, setShowFlashcardModal] = useState<boolean>(false);
  const [testWrongQuestionsData, setTestWrongQuestionsData] = useState<LatestWrongQuestionsData | null>(null);

  const questions = activeDrillMode && drillQuestions.length > 0 ? drillQuestions : lesson.questions;
  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (answer: any) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: answer,
    }));
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  // Change Challenge Mode (Adjusts time limit per question)
  const handleChangeChallengeMode = (newMode: ChallengeMode) => {
    if (isSubmitted) return;
    setChallengeMode(newMode);
    const newTotal = questions.length * CHALLENGE_PRESETS[newMode].secondsPerQuestion;
    setTotalSeconds(newTotal);
    setTimeLeft(newTotal);
  };

  // Submit test and compute scores
  const handleSubmitTest = (isTimeout: boolean = false) => {
    if (isTimeout) {
      setTimeoutSubmitted(true);
    }

    const total = questions.length;
    let correct = 0;
    const answersBreakdown = questions.map((q, idx) => {
      const selected = selectedAnswers[idx];
      const isCorrect = checkQuestionCorrectness(q, selected);
      if (isCorrect) correct += 1;
      return {
        questionId: q.id,
        selectedOption: typeof selected === "number" ? selected : -1,
        userAnswer: selected,
        isCorrect,
      };
    });

    const score = Number(((correct / total) * 10).toFixed(1));
    const timeSpent = Math.max(5, totalSeconds - timeLeft);

    const result: TestResult = {
      id: `res-${Date.now()}`,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      themeId: lesson.themeId,
      score,
      totalQuestions: total,
      correctCount: correct,
      timeSpentSeconds: timeSpent,
      completedAt: new Date().toISOString(),
      answers: answersBreakdown,
    };

    setTestResult(result);
    setIsSubmitted(true);
    onFinishTest(result);

    // Lưu danh sách câu hỏi sai cho chế độ Flashcard
    const flashcardData = saveLatestTestWrongQuestions(result, questions, selectedAnswers);
    setTestWrongQuestionsData(flashcardData);

    // Confetti effect if score is high
    if (score >= 8.0) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }
  };

  // Fetch AI Hint
  const handleRequestHint = async () => {
    try {
      setHintLoading(true);
      setShowHintModal(true);
      setHintText(null);

      const res = await fetch("/api/gemini/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.question,
          options: currentQuestion.options,
          correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
          lessonTitle: lesson.title,
          isHintOnly: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.explanation) {
        throw new Error(data.error || "Không thể tải gợi ý từ AI");
      }
      setHintText(data.explanation);
    } catch (err) {
      setHintText("Gợi ý: Đọc kỹ phần in đậm trong sách giáo khoa để tìm mối liên hệ giữa các khái niệm.");
    } finally {
      setHintLoading(false);
    }
  };

  // Fetch AI Detailed Explanation for a question in review
  const handleRequestAiExplanation = async (q: Question, qIdx: number) => {
    try {
      setExplainingQuestionId(q.id);
      const selectedOpt = selectedAnswers[qIdx];
      const selectedText = selectedOpt !== undefined ? q.options[selectedOpt] : "Chưa chọn";

      const res = await fetch("/api/gemini/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q.question,
          options: q.options,
          selectedAnswer: selectedText,
          correctAnswer: q.options[q.correctIndex],
          lessonTitle: lesson.title,
          isHintOnly: false,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.explanation) {
        throw new Error(data.error || "Không thể tạo phân tích chi tiết");
      }
      setAiExplanations((prev) => ({
        ...prev,
        [q.id]: data.explanation,
      }));
    } catch (err: any) {
      setAiExplanations((prev) => ({
        ...prev,
        [q.id]: `Giải thích SGK: ${q.explanation}`,
      }));
    } finally {
      setExplainingQuestionId(null);
    }
  };

  // Save Test Certificate to Google Drive
  const handleSaveToDrive = async () => {
    if (!testResult) return;
    if (!accessToken) {
      alert("Vui lòng đăng nhập Google ở góc phải phía trên để lưu chứng chỉ lên Google Drive!");
      return;
    }

    try {
      setIsUploadingToDrive(true);
      setDriveError(null);

      const fileName = `ChungNhan_${lesson.id}_${studentName || "HocSinh"}.html`;
      const htmlContent = generateCertificateHTML(
        studentName,
        lesson.title,
        testResult.score,
        testResult.correctCount,
        testResult.totalQuestions,
        testResult.timeSpentSeconds
      );

      const uploadRes = await uploadToDrive(fileName, htmlContent, "text/html", accessToken);
      if (uploadRes.success && uploadRes.webViewLink) {
        setDriveFileLink(uploadRes.webViewLink);
      } else {
        throw new Error(uploadRes.error || "Không thể tải lên Google Drive");
      }
    } catch (err: any) {
      setDriveError(err.message || "Lỗi lưu file lên Drive");
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  // Generate 3 Extra AI Drill Questions
  const handleGenerateDrill = async () => {
    try {
      setDrillLoading(true);
      const res = await fetch("/api/gemini/generate-drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          count: 3,
        }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setDrillQuestions(data.questions);
        setActiveDrillMode(true);
        setIsSubmitted(false);
        setTimeoutSubmitted(false);
        setCurrentIndex(0);
        setSelectedAnswers({});
        setFlaggedQuestions({});
        const newTotal = data.questions.length * CHALLENGE_PRESETS[challengeMode].secondsPerQuestion;
        setTotalSeconds(newTotal);
        setTimeLeft(newTotal);
        setTestResult(null);
      } else {
        alert("AI chưa thể tạo thêm câu hỏi lúc này. Vui lòng kiểm tra API Key.");
      }
    } catch (err: any) {
      alert("Lỗi khi tạo đề bổ sung: " + err.message);
    } finally {
      setDrillLoading(false);
    }
  };

  const answeredCount = questions.filter((q, idx) =>
    isQuestionAnswered(q, selectedAnswers[idx])
  ).length;

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Quiz Top Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Thoát bài test"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                {activeDrillMode
                  ? "Luyện tập bổ sung AI"
                  : lesson.lessonNumber === 0
                  ? "🎯 Thi thử tổng hợp"
                  : `Bài ${lesson.lessonNumber}`}
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                {lesson.themeTitle}
              </span>
            </div>
            <h1 className="font-bold text-slate-900 text-base sm:text-lg truncate max-w-md">
              {lesson.title}
            </h1>
          </div>
        </div>

        {/* Timer & Submit Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {!isSubmitted && (
            <QuizCountdownTimer
              totalSeconds={totalSeconds}
              timeLeft={timeLeft}
              setTimeLeft={setTimeLeft}
              onTimeUp={() => handleSubmitTest(true)}
              isSubmitted={isSubmitted}
              currentMode={challengeMode}
              onChangeMode={handleChangeChallengeMode}
              allowChangeMode={Object.keys(selectedAnswers).length === 0}
            />
          )}

          {!isSubmitted && (
            <button
              onClick={() => {
                if (answeredCount < questions.length) {
                  if (
                    confirm(
                      `Bạn mới làm ${answeredCount}/${questions.length} câu. Bạn có chắc chắn muốn nộp bài sớm không?`
                    )
                  ) {
                    handleSubmitTest(false);
                  }
                } else {
                  handleSubmitTest(false);
                }
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
            >
              Nộp bài ({answeredCount}/{questions.length})
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {!isSubmitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question View (Left 3 Columns) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    Câu {currentIndex + 1} / {questions.length}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                    {currentQuestion.level}
                  </span>
                  {currentQuestion.type === "fill_in_the_blank" ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-amber-600" />
                      Điền từ khuyết
                    </span>
                  ) : currentQuestion.type === "short_answer" ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200 flex items-center gap-1">
                      <Edit3 className="w-3 h-3 text-purple-600" />
                      Trả lời ngắn
                    </span>
                  ) : currentQuestion.type === "true_false" ||
                    (currentQuestion.options &&
                      currentQuestion.options.length === 2 &&
                      currentQuestion.options[0].toLowerCase().includes("đúng") &&
                      currentQuestion.options[1].toLowerCase().includes("sai")) ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Đúng / Sai
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium border border-blue-200">
                      4 Lựa chọn
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* AI Hint Button */}
                  <button
                    onClick={handleRequestHint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Gợi ý AI</span>
                  </button>

                  {/* Flag Question */}
                  <button
                    onClick={handleToggleFlag}
                    className={`p-1.5 rounded-xl border transition-colors ${
                      flaggedQuestions[currentIndex]
                        ? "bg-amber-500 text-white border-amber-600"
                        : "text-slate-400 border-slate-200 hover:bg-slate-50"
                    }`}
                    title="Đánh dấu xem lại câu này"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="py-6">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Question Interactive Options View */}
              <QuestionInteractiveView
                question={currentQuestion}
                selectedAnswer={selectedAnswers[currentIndex]}
                onAnswerChange={handleSelectOption}
                isSubmitted={isSubmitted}
              />

              {/* Bottom Nav: Prev / Next */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Câu trước</span>
                </button>

                <button
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Palette: Question Navigator */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Danh sách câu hỏi
              </h3>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = isQuestionAnswered(q, selectedAnswers[idx]);
                  const isCurrent = currentIndex === idx;
                  const isFlagged = flaggedQuestions[idx];

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative h-10 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? "ring-2 ring-blue-600 ring-offset-2 ring-offset-white"
                          : ""
                      } ${
                        isAnswered
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-blue-600" />
                  <span>Đã trả lời ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300" />
                  <span>Chưa trả lời ({questions.length - answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Đã đánh dấu xem lại</span>
                </div>
              </div>
            </div>

            {/* Quick SGK Summary Card */}
            <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-4 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-bold mb-1.5 text-amber-800">
                <Bot className="w-4 h-4 text-amber-600" />
                <span>Mẹo từ Giáo Viên Tin 12</span>
              </div>
              <p className="text-amber-800/90 leading-relaxed">
                Đọc kỹ câu hỏi và loại trừ phương án sai. Nếu phân vân, hãy nhấn nút <strong className="text-amber-900 font-bold">"Gợi ý AI"</strong> để xem định hướng tư duy theo SGK mà không lộ đáp án!
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Test Completed Review Screen */
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Result Banner */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs text-center relative overflow-hidden">
            {timeoutSubmitted && (
              <div className="max-w-md mx-auto mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs sm:text-sm font-semibold text-rose-800 flex items-center justify-center gap-2 animate-bounce">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Hết thời gian làm bài! Hệ thống đã tự động nộp bài và chấm điểm.</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Kết Quả Kiểm Tra Tự Động</span>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${CHALLENGE_PRESETS[challengeMode].colorClass}`}>
                <Zap className="w-3.5 h-3.5" />
                <span>Chế độ: {CHALLENGE_PRESETS[challengeMode].name} ({CHALLENGE_PRESETS[challengeMode].badge})</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {lesson.title}
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              Học sinh: <strong className="text-slate-800">{studentName}</strong> | Hoàn thành lúc:{" "}
              {new Date().toLocaleTimeString("vi-VN")}
            </p>

            {/* Score Big Display */}
            <div className="inline-block p-6 rounded-3xl bg-slate-50 border border-slate-200 mb-6">
              <div
                className={`text-5xl sm:text-6xl font-black ${
                  (testResult?.score || 0) >= 8
                    ? "text-emerald-600"
                    : (testResult?.score || 0) >= 6.5
                    ? "text-blue-600"
                    : "text-amber-600"
                }`}
              >
                {testResult?.score.toFixed(1)}{" "}
                <span className="text-2xl text-slate-400 font-bold">/ 10</span>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-2">
                {(testResult?.score || 0) >= 9
                  ? "Xuất sắc"
                  : (testResult?.score || 0) >= 8
                  ? "Giỏi"
                  : (testResult?.score || 0) >= 6.5
                  ? "Khá"
                  : "Cần rèn luyện thêm"}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 max-w-md mx-auto gap-4 py-4 border-y border-slate-200 text-center mb-6">
              <div>
                <div className="text-xl font-bold text-slate-900">
                  {testResult?.correctCount} / {testResult?.totalQuestions}
                </div>
                <div className="text-xs text-slate-500">Số câu đúng</div>
              </div>
              <div className="border-x border-slate-200">
                <div className="text-xl font-bold text-blue-600">
                  {Math.round(
                    ((testResult?.correctCount || 0) / (testResult?.totalQuestions || 1)) * 100
                  )}
                  %
                </div>
                <div className="text-xs text-slate-500">Độ chính xác</div>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">
                  {Math.floor((testResult?.timeSpentSeconds || 0) / 60)}p{" "}
                  {(testResult?.timeSpentSeconds || 0) % 60}s
                </div>
                <div className="text-xs text-slate-500">Thời gian làm</div>
              </div>
            </div>

            {/* Action Buttons: Google Drive Export & AI Drill */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {testResult && testResult.correctCount < testResult.totalQuestions && (
                <button
                  type="button"
                  onClick={() => setShowFlashcardModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all animate-pulse hover:animate-none"
                >
                  <Layers className="w-4 h-4" />
                  <span>Ôn tập Flashcard ({testResult.totalQuestions - testResult.correctCount} câu sai)</span>
                </button>
              )}

              <button
                onClick={handleSaveToDrive}
                disabled={isUploadingToDrive}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-all"
              >
                <Cloud className="w-4 h-4" />
                <span>
                  {isUploadingToDrive
                    ? "Đang lưu lên Drive..."
                    : "Lưu chứng chỉ lên Google Drive"}
                </span>
              </button>

              <button
                onClick={handleGenerateDrill}
                disabled={drillLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs transition-all"
              >
                <Sparkles className="w-4 h-4 text-blue-100" />
                <span>{drillLoading ? "AI đang tạo đề..." : "Tạo 3 câu hỏi luyện thêm bằng AI"}</span>
              </button>

              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setCurrentIndex(0);
                  setSelectedAnswers({});
                  setFlaggedQuestions({});
                  setTimeLeft(lesson.questions.length * 90);
                  setActiveDrillMode(false);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm lại bài này</span>
              </button>

              <button
                onClick={onExit}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors shadow-2xs"
              >
                Trở về danh sách bài
              </button>
            </div>

            {/* Drive Upload Notification */}
            {driveFileLink && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl inline-flex items-center gap-2 text-xs text-emerald-800 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Đã lưu thành công vào Google Drive của bạn!</span>
                <a
                  href={driveFileLink}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline flex items-center gap-1 hover:text-emerald-950"
                >
                  Mở tệp trên Drive <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            {driveError && (
              <div className="mt-3 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl max-w-md mx-auto border border-rose-200">
                {driveError}
              </div>
            )}
          </div>

          {/* Flashcard Quick Review Callout */}
          {testResult && testResult.correctCount < testResult.totalQuestions && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/60 text-amber-900 text-[11px] font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    <span>Phương Pháp Ghi Nhớ Nhanh</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base sm:text-lg">
                    Củng Cố {testResult.totalQuestions - testResult.correctCount} Câu Sai Bằng Thẻ Flashcard
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                    Lật mở từng thẻ hai mặt để ôn lại lựa chọn sai, đối chiếu với đáp án chuẩn SGK và nắm vững kiến thức cốt lõi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFlashcardModal(true)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-2 self-stretch sm:self-auto justify-center"
              >
                <span>Bắt Đầu Ôn Flashcard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Question Breakdown List */}
          <div className="space-y-6">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <span>Chi tiết đáp án & Giải thích kiến thức</span>
            </h3>

            {questions.map((q, idx) => (
              <QuestionReviewItem
                key={q.id}
                question={q}
                index={idx}
                userAnswer={selectedAnswers[idx]}
                aiExplanation={aiExplanations[q.id]}
                isAiExplaining={explainingQuestionId === q.id}
                onRequestAiExplanation={() => handleRequestAiExplanation(q, idx)}
              />
            ))}
          </div>
        </div>
      )}

      {/* AI Hint Modal */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 text-slate-800">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-3">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span>Gợi ý tư duy từ AI (SGK Tin học 12)</span>
            </div>

            {hintLoading ? (
              <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span>AI đang phân tích câu hỏi để đưa ra gợi ý phù hợp...</span>
              </div>
            ) : (
              <div className="text-sm text-amber-950 bg-amber-50 p-4 rounded-xl border border-amber-200 leading-relaxed">
                {hintText}
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowHintModal(false)}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-500 transition-colors shadow-xs"
              >
                Đã hiểu, quay lại làm bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chế độ Flashcard Ôn tập câu hỏi sai */}
      <WrongQuestionsFlashcardModal
        isOpen={showFlashcardModal}
        onClose={() => setShowFlashcardModal(false)}
        data={testWrongQuestionsData}
        onRetakeTest={() => {
          setShowFlashcardModal(false);
          setIsSubmitted(false);
          setCurrentIndex(0);
          setSelectedAnswers({});
          setFlaggedQuestions({});
          setTimeLeft(lesson.questions.length * 90);
          setActiveDrillMode(false);
        }}
      />
    </div>
  );
};
