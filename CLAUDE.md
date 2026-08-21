# TAVY KOREA - CLAUDE CODE NATIVE CONFIGURATION & AI ARCHITECTURE

Nền tảng thương mại điện tử / mua hộ mỹ phẩm Olive Young, thực phẩm chức năng & thuốc nội địa Hàn Quốc chính hãng 100% (TAVY Korea).

## 🚀 Công Nghệ Chính (Tech Stack)
- **Frontend**: React 19, Vite 8, React Router v7, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend / Serverless**: Firebase Cloud Functions v2 (Node.js 20), Cloud Firestore (với offline persistence), Firebase Authentication (Google & Password).
- **Thanh toán**: Cổng thanh toán QR Code VietQR (VND) & Woori Bank (KRW) kết hợp Webhook tự động PayOS (`@payos/node`).
- **Testing Suite**: 180 bài test tự động phủ 4 Tiers (`node tests/run_all_tests.js`).

---

## 🤖 Cấu Trúc AI & Agent Kiến Trúc Chuẩn Claude Code

### 1. Phân Tầng AI Scraper Engine (`src/services/aiScraperAgentEngine.js`)
- **Tầng 1 (Extractor)**: Sử dụng Jina AI Reader (`https://r.jina.ai/`) để vượt WAF và lấy Markdown thật từ Olive Young / Musinsa.
- **Tầng 2 (LLM Extraction)**:
  - Gọi LLM để trích xuất JSON: tên Việt chuẩn SEO, tên Hàn, Brand, phân loại danh mục, giá sale làm tròn, danh sách ảnh sản phẩm HD (loại bỏ ảnh rác/banner).
  - Sử dụng chuỗi Fallback thông minh: Custom Endpoint -> Google Gemini (`gemini-3.5-flash`, `gemini-3.6-flash`, `gemini-3.7-flash`).
- **Tầng 3 (Data Validation)**: Xác thực không sinh dữ liệu ảo (No Fake Data).

---

## 🛠️ Nguyên Tắc Làm Việc Dành Cho Claude Code (Pacing & Workflow)
1. **Làm tuần tự, nhẹ nhàng (Pacing Rule)**:
   - Tuyệt đối không chạy ồ ạt nhiều sub-agents song song cùng lúc để tránh làm nóng / đơ máy người dùng.
   - Thao tác từng bước một, kiểm tra kỹ lưỡng trước khi chuyển bước tiếp theo.
2. **Kiểm tra chất lượng trước khi bàn giao**:
   - Chạy `npm run build` để đảm bảo không lỗi biên dịch.
   - Chạy `node tests/run_all_tests.js` (180/180 PASS).
   - Kiểm tra giao diện qua Playwright khi có thay đổi lớn về layout.
3. **Triển khai & Backup**:
   - Luôn commit sạch sẽ lên GitHub: `git push origin main`.
   - Deploy trực tiếp lên Firebase Hosting: `npx firebase deploy --only hosting,firestore`.
