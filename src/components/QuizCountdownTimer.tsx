import React, { useEffect, useState, useRef } from "react";
import {
  Clock,
  AlertTriangle,
  Flame,
  Zap,
  Volume2,
  VolumeX,
  Gauge,
  Timer as TimerIcon,
} from "lucide-react";

export type ChallengeMode = "standard" | "exam" | "blitz" | "hardcore";

export interface ChallengePreset {
  id: ChallengeMode;
  name: string;
  secondsPerQuestion: number;
  badge: string;
  description: string;
  colorClass: string;
}

export const CHALLENGE_PRESETS: Record<ChallengeMode, ChallengePreset> = {
  standard: {
    id: "standard",
    name: "Tiêu Chuẩn",
    secondsPerQuestion: 90,
    badge: "90s/câu",
    description: "Thời gian thư thả, đọc kỹ lý thuyết SGK",
    colorClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  exam: {
    id: "exam",
    name: "Thi Thử THPT",
    secondsPerQuestion: 45,
    badge: "45s/câu",
    description: "Tốc độ chuẩn phòng thi tốt nghiệp THPT",
    colorClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  blitz: {
    id: "blitz",
    name: "Tốc Độ (Blitz)",
    secondsPerQuestion: 30,
    badge: "30s/câu",
    description: "Thử thách phản xạ nhanh, bứt phá thời gian",
    colorClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  hardcore: {
    id: "hardcore",
    name: "Cực Hạn",
    secondsPerQuestion: 15,
    badge: "15s/câu",
    description: "Chế độ siêu thử thách dành cho học sinh giỏi",
    colorClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

interface QuizCountdownTimerProps {
  totalSeconds: number;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  onTimeUp: () => void;
  isSubmitted: boolean;
  currentMode: ChallengeMode;
  onChangeMode?: (mode: ChallengeMode) => void;
  allowChangeMode?: boolean;
}

export const QuizCountdownTimer: React.FC<QuizCountdownTimerProps> = ({
  totalSeconds,
  timeLeft,
  setTimeLeft,
  onTimeUp,
  isSubmitted,
  currentMode,
  onChangeMode,
  allowChangeMode = false,
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const hasTriggeredTimeUpRef = useRef<boolean>(false);

  // Play subtle synth tick/alarm using Web Audio API (no external asset needed)
  const playSound = (type: "tick" | "warning" | "timeup") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "tick") {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === "warning") {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === "timeup") {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(330, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch {
      // Audio autoplay policy or not supported
    }
  };

  // Timer Tick Hook
  useEffect(() => {
    if (isSubmitted) return;
    hasTriggeredTimeUpRef.current = false;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!hasTriggeredTimeUpRef.current) {
            hasTriggeredTimeUpRef.current = true;
            playSound("timeup");
            onTimeUp();
          }
          return 0;
        }

        // Warning sound in last 10 seconds
        if (prev <= 11 && prev > 1) {
          playSound(prev <= 5 ? "warning" : "tick");
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted, onTimeUp, setTimeLeft]);

  const percentage = Math.max(0, Math.min(100, Math.round((timeLeft / (totalSeconds || 1)) * 100)));
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft <= 30 || percentage <= 15;
  const isWarning = !isUrgent && (timeLeft <= 60 || percentage <= 35);

  // SVG Circular ring math
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let timerColor = "#2563eb"; // Blue
  let timerBadgeBg = "bg-blue-50 text-blue-700 border-blue-200";
  if (isUrgent) {
    timerColor = "#e11d48"; // Rose/Red
    timerBadgeBg = "bg-rose-50 text-rose-700 border-rose-300 animate-pulse";
  } else if (isWarning) {
    timerColor = "#d97706"; // Amber
    timerBadgeBg = "bg-amber-50 text-amber-700 border-amber-300";
  }

  const currentPreset = CHALLENGE_PRESETS[currentMode] || CHALLENGE_PRESETS.standard;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Challenge Level Selector Dropdown / Badges */}
      {allowChangeMode && onChangeMode && !isSubmitted && (
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <span className="text-[11px] font-bold text-slate-500 px-1.5 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Thử thách:</span>
          </span>
          {(Object.keys(CHALLENGE_PRESETS) as ChallengeMode[]).map((mode) => {
            const p = CHALLENGE_PRESETS[mode];
            const active = currentMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onChangeMode(mode)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  active
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-300"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
                }`}
                title={`${p.name}: ${p.description} (${p.badge})`}
              >
                {mode === "hardcore" && <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />}
                {mode === "blitz" && <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />}
                <span>{p.name}</span>
                <span className="text-[10px] opacity-75 hidden lg:inline">({p.badge})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Countdown Pill with SVG Ring & Text */}
      <div
        className={`flex items-center justify-between sm:justify-start gap-3 px-3.5 py-1.5 rounded-2xl border transition-all shadow-2xs ${timerBadgeBg}`}
      >
        {/* Left: Circular SVG Countdown Ring */}
        <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
          <svg className="w-9 h-9 -rotate-90" viewBox="0 0 52 52">
            {/* Background circle track */}
            <circle
              cx="26"
              cy="26"
              r={radius}
              className="stroke-slate-200"
              strokeWidth="4"
              fill="transparent"
            />
            {/* Animated progress circle */}
            <circle
              cx="26"
              cy="26"
              r={radius}
              stroke={timerColor}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {isUrgent ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
            ) : (
              <TimerIcon className="w-4 h-4" style={{ color: timerColor }} />
            )}
          </div>
        </div>

        {/* Center: Digital Time Display & Progress Bar */}
        <div className="flex flex-col min-w-[90px]">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-base sm:text-lg font-black tracking-tight leading-none">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-[10px] font-bold opacity-80 uppercase">
              {isUrgent ? "Sắp hết giờ!" : isWarning ? "Gấp rút" : currentPreset.name}
            </span>
          </div>
          <div className="text-[10px] opacity-75 font-medium flex items-center gap-1 mt-0.5">
            <span>Còn {percentage}% thời gian</span>
          </div>
        </div>

        {/* Sound Toggle Button */}
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-black/5 transition-colors"
          title={soundEnabled ? "Tắt âm thanh đếm ngược" : "Bật âm thanh đếm ngược"}
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 opacity-60" />
          )}
        </button>
      </div>
    </div>
  );
};
