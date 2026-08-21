# TAVY KOREA - QUY CHUẨN CÔNG TY & QUY TRÌNH PHÒNG BAN CHUYÊN TRÁCH

Hệ thống vận hành theo mô hình **Software Engineering Team tiêu chuẩn Công ty Công nghệ**, phối hợp nhịp nhàng giữa các vai trò chuyên biệt. Nguyên tắc cốt lõi: **Làm chậm mà chắc, code ra là phải pass kiểm thử 100% (Zero-Defect Policy).**

---

## 🏢 1. Sơ Đồ Phòng Ban Chuyên Trách (Agent Roles)

```
[1. Task Planner (BA / Solution Architect)]
               │
               ▼  (Kế hoạch rõ ràng, định danh file)
[2. Frontend & UI/UX Designer] / [Fullstack Dev]
               │
               ▼  (Code tuần tự, đúng bảng màu Ivory/Purple)
[3. Security & Code Reviewer]
               │
               ▼  (Kiểm tra logic, signature PayOS, schema)
[4. QC Automation Engineer (Quality Control Gatekeeper)]
               │
               ├──> [npm run build] -> PASS?
               ├──> [node tests/run_all_tests.js (180/180)] -> PASS?
               │
               ▼
[5. Release & Production Deploy]
```

### Chi tiết nhiệm vụ từng vị trí:
1. **`task-planner` (Solution Architect / BA)**: 
   - Khảo sát mã nguồn, phân tích tác động, lập kế hoạch chi tiết (Step-by-step) trước khi bắt tay vào code.
   - Ghi nhớ trạng thái vào Memory (`active-task-state.md`) để không bao giờ bị quên khi gián đoạn phiên.
2. **`ui-designer` & Developer**:
   - Viết code sạch, đúng chuẩn Responsive, bám sát Design System Ivory & Gold/Purple.
3. **`code-reviewer` (Security & Logic Auditor)**:
   - Rà soát lỗ hổng bảo mật, tính toàn vẹn Firestore rules, logic thanh toán Webhook.
4. **`qc-automation-engineer` (QA/QC Gatekeeper ⭐)**:
   - Chạy toàn bộ 180 bài test E2E.
   - Chạy `npm run build` xác nhận zero-error.
   - Thử nghiệm các ca biên (Boundary/Corner cases) trước khi xác nhận bàn giao.

---

## 🛡️ 2. Quy Tắc Bất Di Bất Dịch (Zero-Defect Pipeline)

Mỗi khi phát triển một tính năng hoặc chỉnh sửa bất kỳ file nào:
1. **Lên Kế Hoạch & Phân Tích Trước**: Không code bừa, luôn ghi chép vào `active-task-state.md`.
2. **Thực Hiện Tuần Tự & Tiết Kiệm Tài Nguyên (Lightweight Execution)**:
   - Thao tác từng file một, nhẹ nhàng, tránh gây giật lag máy.
   - **CẤM DÙNG Playwright / Headless Browser / Chụp ảnh màn hình để inspect UI**: Tiết kiệm tối đa API tokens và CPU/RAM của người dùng. Thay vào đó, phân tích code JSX/CSS tĩnh, chạy test logic và hướng dẫn người dùng tự mở trình duyệt xem trực tiếp.
3. **Kiểm Thử Nghiệm Thu (QC Phase)**:
   - `npm run build` -> Đạt.
   - `node tests/run_all_tests.js` -> 180/180 PASS.
4. **Lưu Vết Ký Ức (Memory Sync)**: Cập nhật `active-task-state.md` và `MEMORY.md` ngay sau mỗi bước hoàn thành.

---

## 🚀 3. Tech Stack & Công Nghệ
- **Frontend**: React 19, Vite 8, React Router v7, Tailwind CSS, Lucide Icons.
- **Backend**: Firebase Cloud Functions v2 (Node.js 20), Cloud Firestore.
- **Thanh toán**: VietQR tự động & Woori Bank (KRW) kết hợp Webhook PayOS.
- **Testing Suite**: 180 bài test tự động phủ 4 Tiers (`node tests/run_all_tests.js`).
