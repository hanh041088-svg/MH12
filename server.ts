import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is missing.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Resilient content generator with model fallback in case of transient 503 spikes
async function generateGeminiContentWithFallback(params: {
  contents: any;
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: string;
}) {
  const ai = getGemini();
  const models = [
    "gemini-3.6-flash",
    "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
  ];
  let lastError: any = null;

  for (const model of models) {
    try {
      const config: any = {};
      if (params.systemInstruction) config.systemInstruction = params.systemInstruction;
      if (params.temperature !== undefined) config.temperature = params.temperature;
      if (params.responseMimeType) config.responseMimeType = params.responseMimeType;

      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: Object.keys(config).length > 0 ? config : undefined,
      });
      return response;
    } catch (err: any) {
      console.warn(`Gemini model ${model} error, checking fallback:`, err?.message || err);
      lastError = err;
      // If error is 404 (not found) or 503 (high demand), proceed to next fallback model
    }
  }
  throw lastError;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Chatbot endpoint for SGK Tin học 12 Tutor
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, currentLesson, message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        reply:
          "Chào bạn! Trợ lý AI đang chạy ở chế độ ngoại tuyến. Để kích hoạt đầy đủ tính năng thông minh của Gemini, vui lòng thêm `GEMINI_API_KEY` trong bảng điều khiển Settings > Secrets.",
      });
    }

    const systemInstruction = `Bạn là Trợ lý Gia sư AI chuyên sâu môn Tin học lớp 12 (Bộ sách Kết nối tri thức với cuộc sống - Định hướng Tin học ứng dụng).
Kiến thức trọng tâm gồm 7 chủ đề:
1. Máy tính và xã hội tri thức: AI, đặc trưng AI (học, suy luận, nhận thức, hiểu ngôn ngữ, giải quyết vấn đề), AI hẹp vs AI tổng quát, MYCIN, Asimo, Watson, ChatGPT, đạo đức AI.
2. Mạng máy tính & Internet: Hub, Switch, Router, Modem, WAP, cáp UTP, RJ45, giao thức TCP/IP, địa chỉ IPv4/IPv6, MAC, Ethernet, HTTP, DNS, ICMP/Ping, chia sẻ tài nguyên và máy in.
3. Đạo đức, pháp luật & văn hoá số: Ứng xử không gian mạng theo QĐ 874/QĐ-BTTTT (Tôn trọng, Lịch sự, Thấu hiểu, Hỗ trợ).
4. HTML & CSS: Cấu trúc trang HTML (<head>, <body>, <h1>..<h6>, <p>, <div>, thẻ định dạng văn bản), danh sách (<ol>, <ul>, <dl>), bảng (<table>, <tr>, <td>, <th>, rowspan, colspan), liên kết (<a>, id bookmark, đường dẫn tuyệt đối/tương đối), đa phương tiện (<img>, <video>, <audio>, <iframe>), biểu mẫu (<form>, <input>, <select>, <textarea>), CSS cú pháp selector và declaration, phông chữ, màu sắc HEX/RGB/HSL, box model (margin, border, padding, width, height), độ ưu tiên bộ chọn (!important, inline, id, class, element), các bộ chọn quan hệ (E F, E > F, E + F, E ~ F), pseudo-class/pseudo-element.
5. Hướng nghiệp: Sửa chữa bảo trì máy tính, quản trị mạng, an toàn thông tin.
6. Thiết bị số: Kết nối cáp VGA, HDMI, các chế độ Duplicate, Extend, Second Screen, Bluetooth, thiết bị Smart Home.
7. Google Sites & Forms: Xây dựng web, nhúng forms, phân tích kết quả.

Hãy trả lời học sinh bằng tiếng Việt rõ ràng, ngắn gọn, sư phạm, chuẩn xác theo SGK Tin học 12. Khi giải thích code HTML/CSS, hãy kèm ví dụ code minh họa dễ hiểu.
${currentLesson ? `Học sinh hiện đang học/làm bài kiểm tra: ${currentLesson}` : ""}`;

    let formattedContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (messages && Array.isArray(messages)) {
      formattedContents = messages.map((m: { role: string; content?: string; text?: string }) => ({
        role: m.role === "assistant" || m.role === "model" ? "model" : "user",
        parts: [{ text: m.content || m.text || "" }],
      }));
    } else if (history && Array.isArray(history)) {
      formattedContents = history.map((m: any) => ({
        role: m.role === "assistant" || m.role === "model" ? "model" : "user",
        parts: [{ text: m.parts?.[0]?.text || m.text || m.content || "" }],
      }));
      if (message) {
        formattedContents.push({
          role: "user",
          parts: [{ text: message }],
        });
      }
    } else if (message) {
      formattedContents.push({
        role: "user",
        parts: [{ text: message }],
      });
    }

    if (formattedContents.length === 0) {
      return res.status(400).json({ error: "Nội dung câu hỏi không hợp lệ." });
    }

    const response = await generateGeminiContentWithFallback({
      contents: formattedContents,
      systemInstruction,
      temperature: 0.7,
    });

    const reply = response.text || "Xin lỗi, tôi chưa thể trả lời câu hỏi này ngay bây giờ.";
    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini chat error:", error);
    res.status(500).json({
      error: "Không thể kết nối với Gemini API.",
      details: error.message,
    });
  }
});

// AI Question Hint & Explanation endpoint
app.post("/api/gemini/explain", async (req, res) => {
  try {
    const { question, options, selectedAnswer, correctAnswer, lessonTitle, isHintOnly } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        explanation: isHintOnly
          ? `Gợi ý: Hãy nhớ lại khái niệm cốt lõi trong bài "${lessonTitle}" được trình bày trong SGK Tin học 12.`
          : `Đáp án đúng là: ${correctAnswer}. Kiến thức này được nêu rõ trong bài học "${lessonTitle}" SGK Tin học 12.`,
      });
    }

    let prompt = "";
    if (isHintOnly) {
      prompt = `Bạn là giáo viên Tin học 12. Học sinh đang làm câu hỏi trắc nghiệm sau và cần 1 gợi ý ngắn gọn (2-3 câu) để tự tìm ra đáp án, TUYỆT ĐỐI KHÔNG TIẾT LỘ TRỰC TIẾP ĐÁP ÁN:
Bài học: ${lessonTitle}
Câu hỏi: ${question}
Các lựa chọn:
${options.map((opt: string, i: number) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n")}
Đáp án đúng là: ${correctAnswer}

Hãy đưa ra gợi ý khơi gợi tư duy giúp học sinh nhớ lại kiến thức SGK Tin học 12 mà không nêu rõ A, B, C hay D.`;
    } else {
      prompt = `Bạn là giáo viên Tin học 12. Hãy giải thích chi tiết câu trắc nghiệm sau cho học sinh:
Bài học: ${lessonTitle}
Câu hỏi: ${question}
Các lựa chọn:
${options.map((opt: string, i: number) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n")}
Học sinh đã chọn: ${selectedAnswer || "Chưa chọn"}
Đáp án đúng: ${correctAnswer}

Hãy:
1. Khẳng định đáp án đúng và trích dẫn chuẩn kiến thức từ SGK Tin học 12.
2. Phân tích vì sao đáp án đúng lại chính xác.
3. Nếu học sinh chọn sai, phân tích ngắn gọn lý do vì sao lựa chọn đó chưa đúng.
Trình bày khoa học, dễ hiểu, dùng gạch đầu dòng ngắn gọn.`;
    }

    const response = await generateGeminiContentWithFallback({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    res.json({ explanation: response.text || "Đã có lỗi khi tạo lời giải thích." });
  } catch (error: any) {
    console.error("Gemini explain error:", error);
    res.status(500).json({ error: error.message });
  }
});

// AI Personalized Roadmap Generator endpoint
app.post("/api/gemini/roadmap", async (req, res) => {
  try {
    const { studentName, scoreStats, weakTopics, testHistory } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        roadmapText: `# Lộ trình ôn tập Tin học 12 cho học sinh ${studentName || "Bạn"}
- **Mục tiêu**: Nâng cao điểm số các chủ đề còn yếu.
- **Tuần 1**: Ôn tập lại kiến thức cơ bản về Mạng máy tính & Thiết bị mạng (Bài 3, Bài 4).
- **Tuần 2**: Rèn luyện kỹ năng thực hành thẻ HTML & bộ chọn CSS (Bài 7 đến Bài 17).
- **Tuần 3**: Luyện giải đề tổng hợp và cập nhật kiến thức về Trí tuệ nhân tạo (Bài 1, Bài 2).
*Lưu ý: Bạn có thể cấu hình API key để nhận lộ trình phân tích thông minh sâu sắc hơn!*`,
      });
    }

    const prompt = `Bạn là chuyên gia cố vấn học tập môn Tin học lớp 12 (chương trình GDPT 2018 - Kết nối tri thức).
Hãy xây dựng một Lộ trình ôn tập cá nhân hóa (Personalized Study Roadmap) chi tiết cho học sinh dựa trên dữ liệu học tập thực tế:
- Tên học sinh: ${studentName || "Học sinh"}
- Điểm trung bình hiện tại: ${scoreStats?.averageScore || "Chưa có"}/10
- Tổng số bài đã hoàn thành: ${scoreStats?.completedTests || 0} bài
- Các chủ đề/bài học có điểm thấp hoặc chưa đạt: ${weakTopics?.length ? weakTopics.join(", ") : "Học sinh cần duy trì điểm cao và ôn luyện nâng cao"}
- Lịch sử gần đây: ${JSON.stringify(testHistory?.slice(-5) || [])}

Hãy xuất ra kế hoạch ôn tập chi tiết định dạng Markdown gồm:
1. 🎯 **Đánh giá tổng quan năng lực**: Điểm mạnh và các phần kiến thức hổng theo chuẩn SGK Tin học 12.
2. 🗓️ **Kế hoạch hành động 3 giai đoạn**:
   - Giai đoạn 1: Củng cố kiến thức nền tảng các bài yếu (nêu rõ đọc mục nào trong SGK).
   - Giai đoạn 2: Luyện đề trọng điểm theo từng dạng câu hỏi (nhận biết, thông hiểu, vận dụng).
   - Giai đoạn 3: Tổng ôn và thi thử toàn diện.
3. 💡 **Mẹo ghi nhớ & thủ thuật thi trắc nghiệm**: Đặc biệt lưu ý các bẫy thường gặp (ví dụ: phân biệt Hub/Switch, độ ưu tiên selector CSS, cú pháp thẻ HTML, v.v.).
4. ⭐ **Mục tiêu điểm số kỳ vọng**: Lời động viên truyền cảm hứng.`;

    const response = await generateGeminiContentWithFallback({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    res.json({ roadmapText: response.text || "Đã tạo lộ trình ôn tập." });
  } catch (error: any) {
    console.error("Gemini roadmap error:", error);
    res.status(500).json({ error: error.message });
  }
});

// AI Drill Questions Generator endpoint
app.post("/api/gemini/generate-drill", async (req, res) => {
  try {
    const { lessonId, lessonTitle, count = 3 } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({ questions: [] });
    }

    const prompt = `Bạn là chuyên gia khảo thí môn Tin học 12. Hãy biên soạn ${count} câu hỏi trắc nghiệm mới toanh, bám sát SGK Tin học 12 bài: "${lessonTitle}" (Bộ sách Kết nối tri thức).
Mỗi câu hỏi có 4 lựa chọn (A, B, C, D), chỉ 1 đáp án đúng và có giải thích chi tiết.
Trả về định dạng JSON thuần túy (không dùng markdown code blocks):
[
  {
    "id": "drill_1",
    "question": "Nội dung câu hỏi...",
    "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
    "correctIndex": 0,
    "explanation": "Giải thích chi tiết..."
  }
]`;

    const response = await generateGeminiContentWithFallback({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      responseMimeType: "application/json",
    });

    let text = response.text || "[]";
    // Strip possible markdown fences if returned
    text = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const questions = JSON.parse(text);
    res.json({ questions });
  } catch (error: any) {
    console.error("Gemini drill error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Google Drive Upload Proxy (takes user's OAuth access token in Authorization header)
app.post("/api/drive/save-report", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Google OAuth token" });
    }

    const accessToken = authHeader.split(" ")[1];
    const { fileName, content, contentBase64, mimeType = "text/html" } = req.body;

    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelim = "\r\n--" + boundary + "--";

    const metadata = {
      name: fileName || `TinHoc12_BaoCao_${Date.now()}.html`,
      mimeType: mimeType,
    };

    const fileContent = contentBase64
      ? Buffer.from(contentBase64, "base64")
      : Buffer.from(content || "", "utf8");
    const multipartRequestBody = Buffer.concat([
      Buffer.from(
        delimiter +
          "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
          JSON.stringify(metadata) +
          delimiter +
          `Content-Type: ${mimeType}\r\n\r\n`
      ),
      fileContent,
      Buffer.from(closeDelim),
    ]);

    const driveResponse = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    const result = await driveResponse.json();
    if (!driveResponse.ok) {
      console.error("Google Drive API error:", result);
      return res.status(driveResponse.status).json({ error: result.error?.message || "Lỗi lưu file lên Google Drive" });
    }

    res.json({
      success: true,
      fileId: result.id,
      fileName: result.name,
      webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
    });
  } catch (error: any) {
    console.error("Drive upload handler error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start server with Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tin Học 12 App Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
