<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Tin học 12 Online

Ứng dụng ôn tập và luyện thi Tin học 12, được xuất từ Google AI Studio.

View your app in AI Studio: https://ai.studio/apps/9f864940-1de9-4dbc-8b13-4c0ee5dd455d

## Chạy trên máy tính

Yêu cầu: Node.js 20 trở lên.

1. Cài thư viện: `npm install`
2. Sao chép `.env.example` thành `.env.local`.
3. Điền `GEMINI_API_KEY` vào `.env.local`. Không đưa file này lên GitHub.
4. Chạy ứng dụng: `npm run dev`
5. Mở `http://localhost:3000`.

## Kiểm tra và đóng gói

- Kiểm tra TypeScript: `npm run lint`
- Tạo bản production: `npm run build`
- Chạy bản production: `NODE_ENV=production npm start`

## Biến môi trường

| Tên | Bắt buộc | Mục đích |
| --- | --- | --- |
| `GEMINI_API_KEY` | Có, nếu dùng trợ lý AI | Gọi Gemini từ máy chủ |
| `APP_URL` | Không | URL công khai của ứng dụng |
| `PORT` | Không | Cổng máy chủ, mặc định `3000` |

## Lưu ý bảo mật

- Không commit `.env`, `.env.local` hoặc API key lên GitHub.
- Cơ chế tài khoản hiện tại lưu dữ liệu trong `localStorage`, chỉ phù hợp để minh họa. Không dùng để lưu tài khoản hoặc mật khẩu thật của học sinh.
- Tài khoản giáo viên mặc định trong mã nguồn chỉ là dữ liệu minh họa. Hãy thay hệ thống đăng nhập bằng Firebase Authentication hoặc một dịch vụ xác thực phía máy chủ trước khi dùng thực tế.
- Cấu hình Firebase phía trình duyệt không thay thế cho quy tắc bảo mật Firestore/Storage và giới hạn API key trên Google Cloud Console.
