import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shuffle,
  BookOpen,
  Award,
  Sparkles,
  Layers,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  FlashcardItem,
  LatestWrongQuestionsData,
  setCardMastered,
} from "../services/flashcardService";

interface WrongQuestionsFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: LatestWrongQuestionsData | null;
  onRetakeTest?: (lessonId?: string) => void;
  currentThemeColor?: string;
}

export const WrongQuestionsFlashcardModal: React.FC<WrongQuestionsFlashcardModalProps> = ({
  isOpen,
  onClose,
  data,
  onRetakeTest,
  currentThemeColor = "#2563eb",
}) => {
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [filterUnmasteredOnly, setFilterUnmasteredOnly] = useState<boolean>(false);
  const [justMasteredAnim, setJustMasteredAnim] = useState<boolean>(false);

  // Khởi tạo danh sách thẻ khi data thay đổi
  useEffect(() => {
    if (data && data.cards) {
      setCards(data.cards);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [data, isOpen]);

  // Lọc thẻ hiển thị (tất cả hoặc chỉ câu chưa nắm vững)
  const displayedCards = filterUnmasteredOnly
    ? cards.filter((c) => !c.isMastered)
    : cards;

  // Đảm bảo currentIndex luôn hợp lệ
  useEffect(() => {
    if (currentIndex >= displayedCards.length && displayedCards.length > 0) {
      setCurrentIndex(displayedCards.length - 1);
    }
  }, [displayedCards.length, currentIndex]);

  const currentCard = displayedCards[currentIndex];
  const masteredCount = cards.filter((c) => c.isMastered).length;
  const totalCount = cards.length;
  const isAllMastered = totalCount > 0 && masteredCount === totalCount;

  // Lật thẻ
  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  // Tiến / lùi
  const handleNext = useCallback(() => {
    if (currentIndex < displayedCards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, displayedCards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Đảo ngẫu nhiên thứ tự thẻ
  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  // Đánh dấu đã hiểu / chưa hiểu câu này
  const handleToggleMastered = () => {
    if (!currentCard) return;
    const newMasteredState = !currentCard.isMastered;

    setCardMastered(currentCard.id, newMasteredState);

    // Cập nhật state local
    setCards((prev) =>
      prev.map((c) => (c.id === currentCard.id ? { ...c, isMastered: newMasteredState } : c))
    );

    if (newMasteredState) {
      setJustMasteredAnim(true);
      setTimeout(() => setJustMasteredAnim(false), 1500);

      // Nếu vừa đạt 100% câu đã nắm vững
      if (masteredCount + 1 === totalCount) {
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }
    }
  };

  // Hỗ trợ phím tắt bàn phím (Mũi tên trái/phải để chuyển câu, Space để lật thẻ)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu đang gõ trong input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200 text-slate-800">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white relative flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-md shrink-0"
              style={{ backgroundColor: currentThemeColor }}
            >
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Chế Độ Flashcard Ôn Câu Hỏi Sai
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {totalCount} câu cần củng cố
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate max-w-xs sm:max-w-md">
                Bài kiểm tra: <strong className="text-white">{data?.lessonTitle || "Tin học 12"}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Đóng chế độ Flashcard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-header Controls: Progress & Filter */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">
              Tiến độ nắm vững:
            </span>
            <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {masteredCount} / {totalCount} câu
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Nút lọc câu chưa thuộc */}
            <button
              type="button"
              onClick={() => {
                setFilterUnmasteredOnly(!filterUnmasteredOnly);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-2.5 py-1 rounded-lg border font-semibold transition-colors flex items-center gap-1.5 ${
                filterUnmasteredOnly
                  ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>{filterUnmasteredOnly ? "Đang lọc câu chưa thuộc" : "Chỉ câu chưa thuộc"}</span>
            </button>

            {/* Nút xáo trộn */}
            <button
              type="button"
              onClick={handleShuffle}
              className="p-1.5 bg-white text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              title="Xáo trộn ngẫu nhiên thứ tự thẻ"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${totalCount > 0 ? (masteredCount / totalCount) * 100 : 0}%`,
            }}
          />
        </div>

        {/* Modal Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col justify-center">
          {displayedCards.length === 0 ? (
            /* Khi đã nắm vững toàn bộ các câu hỏi */
            <div className="text-center py-10 px-4 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Chúc mừng bạn! Toàn bộ câu hỏi sai đã được củng cố!
              </h4>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Bạn đã đánh dấu hiểu toàn bộ {totalCount} câu hỏi cần khắc phục của bài này. Bạn có thể làm lại bài kiểm tra để chinh phục điểm 10 tuyệt đối!
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFilterUnmasteredOnly(false);
                    setCurrentIndex(0);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Xem lại toàn bộ thẻ
                </button>
                {onRetakeTest && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRetakeTest(data?.lessonId);
                    }}
                    className="px-5 py-2 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                    style={{ backgroundColor: currentThemeColor }}
                  >
                    Làm lại bài kiểm tra ngay
                  </button>
                )}
              </div>
            </div>
          ) : currentCard ? (
            <div className="space-y-4">
              {/* Card Meta Bar */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    Thẻ {currentIndex + 1} / {displayedCards.length}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {currentCard.level}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {currentCard.isMastered ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã nắm vững</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Cần củng cố</span>
                    </span>
                  )}
                </div>
              </div>

              {/* The Interactive Flip Card */}
              <div
                onClick={handleFlip}
                className="group relative cursor-pointer select-none transition-all duration-300 rounded-3xl border-2 shadow-sm hover:shadow-md min-h-[260px] sm:min-h-[290px] flex flex-col justify-between p-6 overflow-hidden bg-white"
                style={{
                  borderColor: isFlipped ? "#10b981" : "#3b82f6",
                }}
                title="Nhấn để lật thẻ (hoặc bấm phím Space)"
              >
                {/* Flip Badge Indicator */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    {isFlipped ? (
                      <span className="text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>MẶT SAU: ĐÁP ÁN ĐÚNG & GIẢI THÍCH</span>
                      </span>
                    ) : (
                      <span className="text-blue-700 flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>MẶT TRƯỚC: CÂU HỎI KIỂM TRA</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 transition-colors">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold">Bấm để lật (Space)</span>
                  </div>
                </div>

                {/* Card Content - Front vs Back */}
                {!isFlipped ? (
                  /* FRONT: Question & What you chose */
                  <div className="my-auto py-3 space-y-4">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                      {currentCard.question}
                    </h3>

                    {/* What student selected previously */}
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-rose-700">
                        <AlertCircle className="w-4 h-4" />
                        <span>Lựa chọn của bạn trong bài kiểm tra:</span>
                      </div>
                      <p className="font-medium pl-5 text-rose-800">
                        {currentCard.selectedOption !== undefined && currentCard.selectedOption >= 0
                          ? `${String.fromCharCode(65 + currentCard.selectedOption)}. ${
                              currentCard.options[currentCard.selectedOption] || "Chưa chọn"
                            }`
                          : "Bạn đã bỏ qua chưa chọn câu này"}
                      </p>
                    </div>

                    <div className="text-center pt-2">
                      <span className="text-xs text-blue-600 font-bold inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors">
                        <RotateCw className="w-3.5 h-3.5" /> Xem đáp án chuẩn SGK & giải thích
                      </span>
                    </div>
                  </div>
                ) : (
                  /* BACK: Correct Answer & In-depth Textbook Explanation */
                  <div className="my-auto py-3 space-y-4 animate-in fade-in duration-200">
                    {/* Correct Option */}
                    <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 space-y-1 shadow-xs">
                      <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Đáp án chính xác theo SGK:</span>
                      </div>
                      <div className="text-sm font-black text-emerald-900 pl-5">
                        {String.fromCharCode(65 + currentCard.correctIndex)}.{" "}
                        {currentCard.options[currentCard.correctIndex]}
                      </div>
                    </div>

                    {/* Textbook Explanation */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>Giải thích & Kiến thức trọng tâm:</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                        {currentCard.explanation ||
                          "Ghi nhớ kỹ khái niệm trong bài học SGK Tin học 12 để làm tốt dạng câu hỏi này trong các bài thi tiếp theo."}
                      </p>
                    </div>

                    <div className="text-center pt-1">
                      <span className="text-xs text-slate-500 font-semibold inline-flex items-center gap-1">
                        <RotateCw className="w-3 h-3" /> Bấm để lật lại câu hỏi
                      </span>
                    </div>
                  </div>
                )}

                {/* Bottom Card Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{currentCard.lessonTitle}</span>
                  <span>Nhấn Space hoặc Click để lật thẻ</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Bottom Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Previous Button */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0 || displayedCards.length === 0}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold text-slate-700 transition-colors shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Câu trước</span>
          </button>

          {/* Center Action: Toggle Mastered & Flip Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFlip}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{isFlipped ? "Xem Câu Hỏi" : "Lật Đáp Án"}</span>
            </button>

            {currentCard && (
              <button
                type="button"
                onClick={handleToggleMastered}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  currentCard.isMastered
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-white border-2 border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-700"
                } ${justMasteredAnim ? "scale-105" : ""}`}
              >
                <CheckCircle2 className="w-4 h-4 text-inherit" />
                <span>{currentCard.isMastered ? "Đã Thuộc Câu Này" : "Đánh Dấu Đã Hiểu"}</span>
              </button>
            )}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex >= displayedCards.length - 1 || displayedCards.length === 0}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold text-slate-700 transition-colors shadow-2xs"
          >
            <span className="hidden sm:inline">Câu tiếp</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
