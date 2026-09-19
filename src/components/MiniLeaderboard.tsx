import React, { useState, useMemo } from "react";
import {
  Trophy,
  Flame,
  Award,
  Crown,
  Medal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  UserCheck,
  Zap,
} from "lucide-react";
import { TestResult } from "../types";
import { StreakData } from "../services/streakService";
import {
  getLeaderboardData,
  LeaderboardStudent,
  getAvatarColor,
} from "../services/leaderboardService";
import { ALL_CLASSES } from "../services/accountService";

interface MiniLeaderboardProps {
  currentStudentCode?: string;
  testHistory: TestResult[];
  streakData?: StreakData;
  className?: string;
}

export const MiniLeaderboard: React.FC<MiniLeaderboardProps> = ({
  currentStudentCode = "12A101",
  testHistory,
  streakData,
  className = "",
}) => {
  const [sortBy, setSortBy] = useState<"points" | "streak">("points");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Lấy dữ liệu xếp hạng được tính toán
  const leaderboard = useMemo(() => {
    return getLeaderboardData({
      currentStudentCode,
      currentTestHistory: testHistory,
      currentStreakData: streakData,
      classNameFilter: selectedClass,
      sortBy,
    });
  }, [currentStudentCode, testHistory, streakData, selectedClass, sortBy]);

  // Tìm vị trí của học sinh hiện tại
  const currentUserEntry = useMemo(() => {
    return leaderboard.find((s) => s.isCurrentUser);
  }, [leaderboard]);

  // Người đứng ngay trước học sinh hiện tại để tính khoảng cách điểm/ngày
  const studentAhead = useMemo(() => {
    if (!currentUserEntry || !currentUserEntry.rank || currentUserEntry.rank <= 1) {
      return null;
    }
    return leaderboard[currentUserEntry.rank - 2];
  }, [leaderboard, currentUserEntry]);

  const top3 = leaderboard.slice(0, 3);
  const displayList = isExpanded ? leaderboard : leaderboard.slice(0, 5);
  const isCurrentUserInTop5 = currentUserEntry && currentUserEntry.rank && currentUserEntry.rank <= 5;

  return (
    <div
      id="mini-leaderboard"
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all ${className}`}
    >
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs transition-all ${
                sortBy === "streak"
                  ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
                  : "bg-yellow-500/20 border-yellow-400/40 text-yellow-300"
              }`}
            >
              {sortBy === "streak" ? (
                <Flame className="w-5 h-5 fill-amber-400 text-amber-300 animate-pulse" />
              ) : (
                <Trophy className="w-5 h-5 fill-yellow-400 text-yellow-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Bảng Xếp Hạng Thi Đua
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/15">
                  Khối 12
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {sortBy === "streak"
                  ? "Thi đua duy trì ngọn lửa học tập đều đặn mỗi ngày"
                  : "Tổng điểm bài làm & tích lũy năng lực kiến thức SGK"}
              </p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-2xl border border-white/10 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSortBy("points")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sortBy === "points"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Điểm Số</span>
            </button>
            <button
              type="button"
              onClick={() => setSortBy("streak")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sortBy === "streak"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-amber-300" />
              <span>Streak 🔥</span>
            </button>
          </div>
        </div>

        {/* Filter Pills: Class */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/10 overflow-x-auto scrollbar-none text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1 shrink-0">Lớp:</span>
          {["all", ...ALL_CLASSES].map((cls) => {
            const isSelected = selectedClass === cls;
            return (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClass(cls)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-xs"
                    : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                }`}
              >
                {cls === "all" ? "Tất cả lớp" : cls}
              </button>
            );
          })}

          {currentUserEntry && (
            <div className="ml-auto text-[11px] text-amber-300 font-medium flex items-center gap-1 shrink-0 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              <UserCheck className="w-3 h-3 text-amber-300" />
              <span>
                Bạn: <strong>Hạng #{currentUserEntry.rank}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Podium Showcase for Top 3 (Compact Visual) */}
      <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end max-w-2xl mx-auto">
          {/* Rank 2 (Silver) */}
          {top3[1] && (
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-2">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-slate-200 via-slate-100 to-white border-2 border-slate-300 flex items-center justify-center font-bold text-slate-700 shadow-xs">
                  {top3[1].name.split(" ").pop()?.charAt(0) || "B"}
                </div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-300 text-slate-800 text-[11px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                  2
                </div>
              </div>
              <div className="font-bold text-slate-800 text-xs truncate max-w-[90px] sm:max-w-[120px]">
                {top3[1].isCurrentUser ? `${top3[1].name} (Bạn)` : top3[1].name}
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">{top3[1].className}</span>
              <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-black text-xs border border-slate-200">
                {sortBy === "streak" ? `${top3[1].streakDays} ngày` : `${top3[1].totalPoints} pts`}
              </div>
            </div>
          )}

          {/* Rank 1 (Gold - Center & Elevated) */}
          {top3[0] && (
            <div className="flex flex-col items-center text-center -mt-2">
              <div className="relative mb-2">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                  <Crown className="w-5 h-5 fill-amber-400 text-amber-500" />
                </div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-300 via-yellow-100 to-amber-200 border-2 border-amber-400 flex items-center justify-center font-black text-amber-900 shadow-md">
                  {top3[0].name.split(" ").pop()?.charAt(0) || "A"}
                </div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-amber-400 text-amber-950 text-xs font-black flex items-center justify-center border-2 border-white shadow-xs">
                  1
                </div>
              </div>
              <div className="font-extrabold text-slate-900 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[140px] flex items-center gap-1">
                <span>{top3[0].isCurrentUser ? `${top3[0].name} (Bạn)` : top3[0].name}</span>
              </div>
              <span className="text-[10px] text-amber-700 font-bold">{top3[0].className}</span>
              <div className="mt-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 font-black text-xs border border-amber-300 shadow-xs flex items-center gap-1">
                {sortBy === "streak" ? (
                  <>
                    <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{top3[0].streakDays} ngày 🔥</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>{top3[0].totalPoints} pts</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {top3[2] && (
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-2">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-100 via-orange-100 to-amber-200/50 border-2 border-amber-300/80 flex items-center justify-center font-bold text-amber-800 shadow-xs">
                  {top3[2].name.split(" ").pop()?.charAt(0) || "C"}
                </div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-600 text-white text-[11px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                  3
                </div>
              </div>
              <div className="font-bold text-slate-800 text-xs truncate max-w-[90px] sm:max-w-[120px]">
                {top3[2].isCurrentUser ? `${top3[2].name} (Bạn)` : top3[2].name}
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">{top3[2].className}</span>
              <div className="mt-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-black text-xs border border-amber-200">
                {sortBy === "streak" ? `${top3[2].streakDays} ngày` : `${top3[2].totalPoints} pts`}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed List */}
      <div className="divide-y divide-slate-100">
        {displayList.map((student) => {
          const isMe = student.isCurrentUser;
          const avatar = getAvatarColor(student.id);

          return (
            <div
              key={student.id}
              className={`flex items-center justify-between p-3 sm:px-5 sm:py-3.5 transition-colors ${
                isMe
                  ? "bg-blue-50/70 hover:bg-blue-50 border-l-4 border-l-blue-600"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Rank Badge */}
                <div className="w-7 text-center shrink-0">
                  {student.rank === 1 ? (
                    <span className="inline-block text-lg" title="Hạng 1">
                      🥇
                    </span>
                  ) : student.rank === 2 ? (
                    <span className="inline-block text-lg" title="Hạng 2">
                      🥈
                    </span>
                  ) : student.rank === 3 ? (
                    <span className="inline-block text-lg" title="Hạng 3">
                      🥉
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500">#{student.rank}</span>
                  )}
                </div>

                {/* Avatar & Info */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border shrink-0 ${avatar.bg} ${avatar.text}`}
                >
                  {student.name.split(" ").pop()?.charAt(0) || "H"}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-xs sm:text-sm font-bold truncate ${
                        isMe ? "text-blue-900 font-extrabold" : "text-slate-800"
                      }`}
                    >
                      {student.name}
                    </span>
                    {isMe && (
                      <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[10px] font-bold">
                        Bạn
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
                      {student.className}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Mã: {student.studentCode} • {student.lastActive}
                  </div>
                </div>
              </div>

              {/* Stats Column */}
              <div className="text-right shrink-0 ml-2">
                {sortBy === "streak" ? (
                  <div>
                    <div className="flex items-center justify-end gap-1 text-sm font-black text-amber-600">
                      <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>{student.streakDays} ngày</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Kỷ lục: {student.longestStreak} ngày
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm font-black text-indigo-700">
                      {student.totalPoints}{" "}
                      <span className="text-[11px] font-medium text-slate-400">pts</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {student.testsCompleted} bài • ĐTB: {student.averageScore}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pinned Current User Bar (If user is not in top 5 and list is collapsed) */}
      {!isExpanded && currentUserEntry && !isCurrentUserInTop5 && (
        <div className="p-3 sm:px-5 bg-blue-50 border-t-2 border-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
              #{currentUserEntry.rank}
            </span>
            <div className="text-xs text-blue-950 font-bold">
              Vị trí của bạn:{" "}
              <span className="font-extrabold text-blue-700">{currentUserEntry.name}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-black text-blue-900">
              {sortBy === "streak"
                ? `${currentUserEntry.streakDays} ngày 🔥`
                : `${currentUserEntry.totalPoints} pts`}
            </div>
            <div className="text-[10px] text-blue-700">
              {currentUserEntry.testsCompleted} bài hoàn thành
            </div>
          </div>
        </div>
      )}

      {/* Footer Controls & Encouragement Banner */}
      <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Nudge motivation */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            {studentAhead ? (
              <>
                Bạn chỉ cách <strong>{studentAhead.name}</strong> (Hạng #{studentAhead.rank}){" "}
                {sortBy === "streak"
                  ? `${studentAhead.streakDays - (currentUserEntry?.streakDays || 0)} ngày streak!`
                  : `${studentAhead.totalPoints - (currentUserEntry?.totalPoints || 0)} điểm!`}{" "}
                Làm thêm 1 bài để bứt phá 🚀
              </>
            ) : currentUserEntry?.rank === 1 ? (
              <span className="text-amber-700 font-bold">
                🎉 Bạn đang dẫn đầu bảng xếp hạng! Tiếp tục giữ vững phong độ nhé!
              </span>
            ) : (
              <span>Hoàn thành thêm bài kiểm tra để tích lũy điểm và giữ lửa chuỗi ngày!</span>
            )}
          </span>
        </div>

        {/* Toggle Expand / Collapse button */}
        {leaderboard.length > 5 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-all border border-blue-200/60 shrink-0"
          >
            <span>{isExpanded ? "Thu gọn bảng" : `Xem đầy đủ (${leaderboard.length} bạn)`}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
};
