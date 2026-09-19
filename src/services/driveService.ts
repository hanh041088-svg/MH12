export interface DriveUploadResponse {
  success: boolean;
  fileId?: string;
  fileName?: string;
  webViewLink?: string;
  error?: string;
}

export async function uploadToDrive(
  fileName: string,
  content: string,
  mimeType: string = "text/html",
  accessToken: string
): Promise<DriveUploadResponse> {
  try {
    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelim = "\r\n--" + boundary + "--";

    const metadata = {
      name: fileName,
      mimeType: mimeType,
    };

    const multipartRequestBody =
      delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
      content +
      closeDelim;

    const driveRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    const data = await driveRes.json();
    if (!driveRes.ok) {
      throw new Error(data.error?.message || "Không thể lưu tệp lên Google Drive");
    }

    return {
      success: true,
      fileId: data.id,
      fileName: data.name,
      webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
    };
  } catch (err: any) {
    console.error("Direct drive upload error, fallback to server:", err);
    // Fallback through backend route
    const serverRes = await fetch("/api/drive/save-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ fileName, content, mimeType }),
    });
    const serverData = await serverRes.json();
    if (!serverRes.ok) {
      return { success: false, error: serverData.error || err.message };
    }
    return serverData;
  }
}

// Generate an elegant HTML gradebook report for Google Drive
export function generateGradebookHTML(
  teacherName: string,
  students: Array<{
    name: string;
    className: string;
    testsCompleted: number;
    averageScore: number;
    highestScore: number;
    weakTopics: string[];
  }>
): string {
  const rows = students
    .map(
      (s, idx) => `
    <tr>
      <td style="padding:10px;border:1px solid #cbd5e1;text-align:center;">${idx + 1}</td>
      <td style="padding:10px;border:1px solid #cbd5e1;font-weight:600;">${s.name}</td>
      <td style="padding:10px;border:1px solid #cbd5e1;text-align:center;">${s.className}</td>
      <td style="padding:10px;border:1px solid #cbd5e1;text-align:center;">${s.testsCompleted}</td>
      <td style="padding:10px;border:1px solid #cbd5e1;text-align:center;font-weight:700;color:${
        s.averageScore >= 8 ? "#16a34a" : s.averageScore >= 6.5 ? "#2563eb" : "#dc2626"
      };">${s.averageScore.toFixed(1)}</td>
      <td style="padding:10px;border:1px solid #cbd5e1;text-align:center;">${s.highestScore.toFixed(1)}</td>
      <td style="padding:10px;border:1px solid #cbd5e1;font-size:12px;color:#64748b;">${
        s.weakTopics.length > 0 ? s.weakTopics.join("; ") : "Nắm vững toàn diện"
      }</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Bảng Điểm Môn Tin Học 12 - SGK Kết Nối Tri Thức</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; padding: 32px; }
    h1 { color: #1e40af; margin-bottom: 4px; }
    .subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #f1f5f9; padding: 12px; border: 1px solid #cbd5e1; text-align: left; font-size: 13px; text-transform: uppercase; }
    .footer { margin-top: 32px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  </style>
</head>
<body>
  <h1>BẢNG ĐIỂM TỔNG HỢP KIỂM TRA TIN HỌC 12</h1>
  <div class="subtitle">
    Chương trình SGK Kết Nối Tri Thức với Cuộc Sống (Định hướng Tin học ứng dụng)<br/>
    Giáo viên quản lý: <strong>${teacherName || "Giáo viên bộ môn"}</strong> | Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:40px;text-align:center;">STT</th>
        <th>Họ và Tên Học Sinh</th>
        <th style="text-align:center;">Lớp</th>
        <th style="text-align:center;">Số bài đã làm</th>
        <th style="text-align:center;">Điểm TB</th>
        <th style="text-align:center;">Điểm Cao Nhất</th>
        <th>Chủ đề cần cải thiện</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <div class="footer">
    Báo cáo được tạo tự động từ Ứng dụng Ôn luyện & Đánh giá Năng lực Tin học 12 | Đã lưu trữ trên Google Drive.
  </div>
</body>
</html>`;
}

// Generate Test Certificate HTML
export function generateCertificateHTML(
  studentName: string,
  lessonTitle: string,
  score: number,
  correctCount: number,
  totalQuestions: number,
  timeSpentSeconds: number
): string {
  const gradeLabel =
    score >= 9 ? "Xuất Sắc" : score >= 8 ? "Giỏi" : score >= 6.5 ? "Khá" : "Đạt";
  const gradeColor =
    score >= 8 ? "#15803d" : score >= 6.5 ? "#1d4ed8" : "#d97706";

  const minutes = Math.floor(timeSpentSeconds / 60);
  const seconds = timeSpentSeconds % 60;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <title>Phiếu Kết Quả Kiểm Tra - ${lessonTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; padding: 40px 20px; display: flex; justify-content: center; }
    .cert { max-width: 650px; width: 100%; background: #ffffff; border: 2px solid #e2e8f0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
    .badge { display: inline-block; background: #e0f2fe; color: #0284c7; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
    h1 { margin: 0; color: #0f172a; font-size: 24px; }
    .student { font-size: 20px; color: #1e40af; font-weight: 700; margin: 20px 0 8px; text-align: center; }
    .lesson { font-size: 16px; color: #475569; text-align: center; margin-bottom: 24px; }
    .score-box { background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px; text-align: center; margin-bottom: 24px; }
    .score-num { font-size: 48px; font-weight: 900; color: ${gradeColor}; line-height: 1; }
    .score-label { font-size: 14px; color: #64748b; margin-top: 8px; }
    .details { display: flex; justify-content: space-around; text-align: center; margin-top: 16px; }
    .metric-val { font-size: 18px; font-weight: 700; color: #0f172a; }
    .metric-name { font-size: 12px; color: #64748b; }
    .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="cert">
    <div class="header">
      <span class="badge">Chứng Nhận Hoàn Thành Bài Kiểm Tra</span>
      <h1>TIN HỌC 12 - KẾT NỐI TRI THỨC</h1>
    </div>
    <div class="student">Học sinh: ${studentName || "Thí sinh"}</div>
    <div class="lesson">Bài kiểm tra: <strong>${lessonTitle}</strong></div>
    <div class="score-box">
      <div class="score-num">${score.toFixed(1)} <span style="font-size:24px;color:#94a3b8;">/ 10</span></div>
      <div class="score-label" style="font-weight:600;color:${gradeColor};">Xếp loại: ${gradeLabel}</div>
      <div class="details">
        <div>
          <div class="metric-val">${correctCount} / ${totalQuestions}</div>
          <div class="metric-name">Số câu trả lời đúng</div>
        </div>
        <div>
          <div class="metric-val">${minutes}p ${seconds}s</div>
          <div class="metric-name">Thời gian hoàn thành</div>
        </div>
        <div>
          <div class="metric-val">${((correctCount / totalQuestions) * 100).toFixed(0)}%</div>
          <div class="metric-name">Tỷ lệ chính xác</div>
        </div>
      </div>
    </div>
    <div class="footer">
      Chứng nhận tự động được lưu vào Google Drive lúc: ${new Date().toLocaleString("vi-VN")}<br/>
      Nền tảng Ôn luyện Tin học 12 - Định hướng Tin học ứng dụng
    </div>
  </div>
</body>
</html>`;
}
