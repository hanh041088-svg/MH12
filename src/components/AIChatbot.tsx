import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles, Trash2, HelpCircle, BookOpen } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  "Phân biệt chức năng của Switch và Router trong mạng?",
  "Mô hình hộp (Box model) trong CSS gồm những phần nào?",
  "Cách dùng thuộc tính colspan và rowspan trong bảng HTML?",
  "Trí tuệ nhân tạo hẹp (ANI) khác gì với AI tổng quát (AGI)?",
  "Độ ưu tiên (specificity) của các bộ chọn CSS được tính thế nào?",
  "Giao thức IP đóng vai trò gì trong bộ giao thức TCP/IP?",
];

export const AIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      text: "Xin chào em! Cô là trợ lý Gia sư AI môn Tin học. Em đang gặp khó khăn hay cần giải đáp khái niệm nào trong chương trình (Mạng máy tính, HTML/CSS, AI, An toàn thông tin, v.v.), hãy hỏi ngay nhé!",
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue("");
    setLoading(true);

    try {
      // Build history for context
      const chatHistory = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: chatHistory,
        }),
      });

      const data = await res.json();
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: "model",
        text: data.reply || "Xin lỗi, đã có lỗi xảy ra. Hãy thử lại câu hỏi nhé.",
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: "model",
          text: "Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra lại kết nối hoặc API Key.",
          timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                Gia Sư AI Tin Học 12
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-slate-500">
              Chuyên sâu SGK Kết Nối Tri Thức & Ôn Thi Tốt Nghiệp THPT
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: "welcome",
                role: "model",
                text: "Xin chào em! Cô là trợ lý Gia sư AI môn Tin học. Em đang gặp khó khăn hay cần giải đáp khái niệm nào trong chương trình (Mạng máy tính, HTML/CSS, AI, An toàn thông tin, v.v.), hãy hỏi ngay nhé!",
                timestamp: new Date().toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ])
          }
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded-xl transition-colors"
          title="Xóa đoạn chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                  isUser
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-blue-600 text-white shadow-xs"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? "bg-blue-600 text-white rounded-tr-none shadow-xs"
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-2xs"
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[10px] mt-2 text-right ${
                    isUser ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none p-4 text-xs text-slate-600 border border-slate-200 shadow-2xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
              <div
                className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                style={{ animationDelay: "0.4s" }}
              />
              <span className="ml-1 font-medium">Gia sư AI đang tra cứu SGK và soạn câu trả lời...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-white flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
        <span className="text-slate-500 font-semibold shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-blue-600" /> Hỏi nhanh:
        </span>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-full border border-slate-200 whitespace-nowrap transition-colors shrink-0 font-medium shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Hỏi về HTML, CSS, Mạng máy tính, An toàn số, AI..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gửi</span>
          </button>
        </form>
      </div>
    </div>
  );
};
