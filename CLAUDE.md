# TAVY KOREA - QUY CHUẨN CÔNG TY & HỆ THỐNG KỸ NĂNG CHUYÊN TRÁCH

Hệ thống vận hành theo mô hình **Software Engineering Team tiêu chuẩn Công ty Công nghệ**, phối hợp nhịp nhàng giữa các vai trò chuyên biệt. Nguyên tắc cốt lõi: **Làm chậm mà chắc, code ra là phải pass kiểm thử 100% (Zero-Defect Policy).**

---

## 🏢 1. Sơ Đồ Phòng Ban & Kỹ Năng Chuyên Trách (Specialized Skills)

```
[1. Task Planner (BA / Solution Architect)]
               │
               ▼  (Kế hoạch rõ ràng, định danh file)
[2. Frontend & UI/UX Designer] / [Fullstack Dev]
               │
               ▼  (Code tuần tự, đúng bảng màu Ivory/Gold/Purple, tối giản)
[3. Security & Code Reviewer]
               │
               ▼  (Kiểm tra logic, signature PayOS, schema Firestore, Rule 4)
[4. QC Automation Engineer (Quality Control Gatekeeper)]
               │
               ├──> [npm run build] -> PASS?
               ├──> [npm test (285/285)] -> PASS?
               │
               ▼
[5. Release & Production Deploy (Vercel + Firebase)]
```

### Chi tiết nhiệm vụ từng vị trí:
1. **`task-planner` (Solution Architect / BA)**: 
   - Khảo sát mã nguồn, phân tích tác động, lập kế hoạch chi tiết (Step-by-step) trước khi bắt tay vào code.
   - Định danh file chính xác, đánh giá rủi ro và xác lập kế hoạch kiểm thử.
2. **`ui-designer` & Developer**:
   - Viết code sạch, đúng chuẩn Responsive mobile-first, bám sát Design System Ivory, Gold & Purple.
   - Triết lý tối giản: Không dùng icon/text rườm rà, tích hợp hiệu ứng tinh tế (`.active-step-pulse-ring`).
3. **`code-reviewer` (Security & Logic Auditor)**:
   - Rà soát lỗ hổng bảo mật, chữ ký HMAC webhook PayOS, tính toàn vẹn Firestore rules.
   - Bảo đảm Single Source of Truth cho giá tiền (RULE 4.1) và định danh SĐT 10 số.
   - Ngăn chặn lỗi session hijacking của admin auto-login.
4. **`qc-automation-engineer` (QA/QC Gatekeeper ⭐)**:
   - Chạy toàn bộ **285/285 bài test tự động** (`npm test`).
   - Chạy `npm run build` xác nhận zero-error.
   - Thử nghiệm các ca biên (Boundary/Corner cases) và kiểm tra live song song trên Vercel + Firebase.

---

## 🛡️ 2. Quy Tắc Bất Di Bất Dịch (Zero-Defect Pipeline)

Mỗi khi phát triển một tính năng hoặc chỉnh sửa bất kỳ file nào:
1. **Lên Kế Hoạch & Phân Tích Trước**: Không code bừa, tuân thủ nguyên tắc lập kế hoạch trước khi thay đổi.
2. **Thực Hiện Tuần Tự & Tiết Kiệm Tài Nguyên (Lightweight Execution)**:
   - Thao tác từng file một, nhẹ nhàng, tránh gây giật lag máy.
   - Phân tích code JSX/CSS tĩnh, chạy test logic và đối chiếu với môi trường live.
3. **Kiểm Thử Nghiệm Thu (QC Phase)**:
   - `npm run build` -> Đạt 100%.
   - `npm test` -> 285/285 Test Cases PASS.
4. **Đồng Bộ Song Song Vercel & Firebase (RULE 5)**:
   - `https://tavyorder.web.app` (Firebase Hosting).
   - `https://oderho.vercel.app` (Vercel).

---

## 🚀 3. Tech Stack & Công Nghệ
- **Frontend**: React 19, Vite 8, React Router v7, Tailwind CSS, Lucide Icons.
- **Backend**: Firebase Cloud Functions v2 (Node.js 20), Cloud Firestore, Vercel Serverless Functions (`api/`).
- **Thanh toán**: VietQR tự động & Woori Bank (KRW) kết hợp Webhook PayOS.
- **Media & Evidence**: Nhúng Google Drive POV Video trực tiếp vào đơn hàng.
- **Testing Suite**: 285 bài test tự động phủ 4 Tiers (`node tests/run_all_tests.js`).
