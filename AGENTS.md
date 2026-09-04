# TAVY KOREA — HIẾN PHÁP VẬN HÀNH TÁC TỬ (ANTIGRAVITY 2.0 AGENT CONSTITUTION)

> **VĂN BẢN HIẾN PHÁP TỐI THƯỢNG CỦA DỰ ÁN**:
> Đây là văn bản quy chuẩn duy nhất và có hiệu lực cao nhất áp dụng cho mọi Tác tử (Agent / Subagent) hoạt động trong dự án TAVY Korea trên môi trường Antigravity 2.0. Mọi tác tử BẮT BUỘC phải đọc và tuân thủ tuyệt đối quy chế này trước khi thực hiện bất kỳ tác vụ nào.

---

## 🏛️ ĐIỀU KHOẢN 0: TRUNG THỰC TUYỆT ĐỐI & ZERO MOCK (RULE 0)
1. **Tuyệt Đối Không Dùng Dữ Liệu Giả (Zero Fake / Mock Data)**:
   - Nghiêm cấm hardcode dữ liệu giả, đánh giá sao giả (`rating: 4.9`), số lượng review giả (`reviewsCount: 120`), hoặc tạo tích xanh "thành công" ảo khi tính năng chưa thực sự hoạt động hay chưa kết nối dịch vụ thật.
2. **Minh Bạch Kỹ Thuật 100% (No Hidden Errors)**:
   - Khi gặp bất kỳ lỗi runtime, rào cản kỹ thuật (bị chặn CORS, Cloudflare WAF, Rate Limit PayOS, Firestore Quota, thiếu API key...), tác tử phải thông báo thẳng thắn, rõ ràng cho người dùng ngay lập tức. Tuyệt đối không được "đi đường tắt" bằng dữ liệu giả để báo cáo hoàn thành ảo.
3. **Kiểm Định Thực Tế Trên Dữ Liệu Thật (Live Verification)**:
   - Tính năng chỉ được coi là hoàn tất khi đã được đối chiếu thực tế với dữ liệu sống (Live Web, Firestore thật, Webhook thật, link nguồn Hàn Quốc thật), không dựa trên phỏng đoán.

---

## 🛡️ ĐIỀU KHOẢN 1: QUY CHẾ KIỂM SOÁT RULE 2 ĐẦU (TWO-WAY COMPLIANCE PROTOCOL)

Mọi tác tử khi tiếp nhận yêu cầu từ người dùng BẮT BUỘC phải thực thi quy trình kiểm soát 2 đầu nghiêm ngặt:

### 1.1. PRE-EXECUTION CHECKLIST (BẢNG KIỂM ĐẦU VÀO — ĐỌC ĐẦU TIÊN)
Trước khi tạo/chỉnh sửa bất kỳ file mã nguồn nào, tác tử phải tự kiểm tra bảng danh mục sau:

| Loại | Quy Tắc | Mô Tả Ràng Buộc Kỹ Thuật |
|:---|:---|:---|
| **DO** | **Lập Kế Hoạch Trước** | Khảo sát mã nguồn ở chế độ đọc (Read-only), phân tích tác động và lập kế hoạch rõ ràng trước khi sửa code. |
| **DO** | **Single Source of Truth cho Giá Tiền** | Mọi giá trị VND hiển thị ở thẻ sản phẩm, chi tiết sản phẩm, giỏ hàng, đơn hàng và mã QR thanh toán 100% phải được tính toán từ một hàm thống nhất (`getVndFromWon` / `getOrderTotalVnd`). |
| **DO** | **Định Danh Bằng Số Điện Thoại** | SĐT là khóa định danh chính trong toàn bộ UX tra cứu đơn hàng. Bắt buộc kiểm tra định dạng SĐT Việt Nam 10 số chuẩn: `^0(3|5|7|8|9)[0-9]{8}$`. |
| **DO** | **Chuẩn Hóa Cú Pháp Chuyển Khoản** | Nội dung chuyển khoản trên mã QR tự động theo cú pháp duy nhất: `TAVY <Số_điện_thoại>` (Ví dụ: `TAVY 0912345678`). |
| **DO** | **Bảo Mật PayOS Webhook HMAC** | Xác thực chữ ký HMAC SHA256 trên mọi webhook gửi đến `api/payosWebhook.js`. Giao dịch phải có tính Idempotent. |
| **DO** | **Cô Lập Sự Kiện Modal LIFO** | Mọi Lightbox/Modal lồng nhau phải có `e.stopPropagation()` tại backdrop và nút đóng. Phím `Escape` đóng lần lượt từ trong ra ngoài (LIFO). |
| **DO** | **Đồng Bộ Song Song Vercel & Firebase** | Đảm bảo mã nguồn hoạt động hoàn hảo trên cả `https://tavyorder.web.app` và `https://oderho.vercel.app`. Cấu hình CORS `vercel.json` đầy đủ. |
| **DO** | **Tiêu Chuẩn QC Tuyệt Đối** | Bắt buộc bộ kiểm thử đạt **303/303 test cases PASS 100%** (`npm test`) và `npm run build` đạt ZERO error. |
| **DON'T** | **CẤM Dữ Liệu Ảo** | Tuyệt đối không chèn `Math.random()`, rating cứng, trạng thái fake vào code logic. |
| **DON'T** | **CẤM Delta Tiền Lẻ** | Tuyệt đối không tự ý cộng/trừ số tiền lẻ delta (101đ - 990đ) vào số tiền chuyển khoản của khách. Số tiền trên QR phải khớp 100% tổng tiền giỏ hàng. |
| **DON'T** | **CẤM Tiền Tố Mã Đơn Cũ** | Loại bỏ hoàn toàn tiền tố mã đơn dạng `ORD-` trên giao diện người dùng. |
| **DON'T** | **CẤM Session Hijack** | Không để cơ chế auto-login của admin ghi đè hoặc đá phiên đăng nhập của khách hàng thường. |
| **DON'T** | **CẤM Sửa Code Bừa Bãi** | Không được nhảy vào sửa code khi chưa phân tích kiến trúc và rủi ro tác động. |

---

### 1.2. POST-EXECUTION AUDIT PROTOCOL (ĐỐI CHIẾU NGHIỆM THU ĐẦU RA)
Sau khi hoàn tất việc viết code hoặc thực hiện thay đổi, tác tử KHÔNG ĐƯỢC báo cáo hoàn thành ngay mà BẮT BUỘC phải thực hiện các bước đối chiếu sau:
1. **Đối Chiếu Rule**: Rà soát lại bảng kiểm DO/DON'T ở trên xem giải pháp vừa triển khai có vi phạm bất kỳ điều nào không.
2. **Kiểm Tra Toàn Vẹn Tác Tử**: Chạy lệnh `npm run test:agents` (hoặc `node scripts/verify_agent_system.js`) để đảm bảo không có file cấu hình nào bị lỗi hoặc bị duplicate.
3. **Kiểm Thử Toàn Bộ Hệ Thống**: Chạy lệnh `npm test` và kiểm tra kết quả: Bắt buộc đạt **303/303 PASS (Exit Code 0)**.
4. **Kiểm Tra Build Production**: Chạy lệnh `npm run build` và xác nhận bundle trong `dist/` hoàn tất không lỗi.
5. **Báo Cáo Minh Bạch**: Trình bày rõ ràng các file đã sửa, kết quả các lệnh kiểm thử và bằng chứng đối chiếu.

---

## 👥 ĐIỀU KHOẢN 2: HỆ THỐNG 8 SUBAGENTS CHUYÊN TRÁCH TRONG ANTIGRAVITY 2.0

Dự án thiết lập 8 vai trò Subagents độc lập tại thư mục `.agents/subagents/`. Tác tử chính đóng vai trò **Orchestrator** sẽ kích hoạt hoặc ủy quyền theo đúng chuyên môn:

| Subagent ID | Tên Vai Trò | Phạm Vi Chuyên Trách | Phân Quyền Công Cụ | Model Đề Xuất |
|:---|:---|:---|:---|:---|
| **`task-planner`** | Solution Architect & BA | Khảo sát mã nguồn, phân tích tác động, lập kế hoạch chi tiết từng bước, đánh giá rủi ro (Zero-Code Planning). | Read tools, Search, Gemini Notebook | `pro` / `inherit` |
| **`ui-ux-artisan`** | Luxury Minimalist UI Designer | Thiết kế UI/UX Luxury Ivory (`#FAF8F5`), Gold (`#C5A059`), Purple (`#7A4B9E`), Live Green (`#10B981`). Mobile-first 100%, hiệu ứng `.active-step-pulse-ring`. | Write tools, Read tools | `inherit` |
| **`fullstack-developer`** | Senior React 19 Fullstack Dev | Triển khai UI Component, state `AppProvider`, logic giỏ hàng, checkout, Single Source of Truth cho giá tiền, SĐT 10 số. | Write tools, Run command | `inherit` / `pro` |
| **`firebase-backend-specialist`** | Cloud Firestore & Auth Expert | Quản trị schema Firestore (`orders`, `products`, `users`), Firestore Security Rules, session protection, offline sync. | Write tools, Read tools, MCP | `pro` |
| **`security-auditor`** | PayOS & Security Auditor | Thẩm định chữ ký HMAC SHA256 webhook PayOS (`api/payosWebhook.js`), QR syntax `TAVY <SĐT>`, đối soát đơn hàng, zero-tampering. | Read tools, Write tools | `pro` |
| **`qc-gatekeeper`** | Lead QA/QC Gatekeeper | Người gác cổng phát hành. Đảm bảo `npm run build` PASS, 303/303 tests PASS 100% (`npm test`), fuzzing ca biên, Vercel/Firebase parity. | Run command, Write tools | `inherit` |
| **`korean-scraper-specialist`** | Korean Multi-Source Scraper | Cào dữ liệu Olive Young, Naver, Coupang, Hwahae, Musinsa, Gmarket, 11st. Lọc ảnh HD sạch 100%, review thật GDAS, Rule 0. | Run command, Write tools, Read tools | `pro` / `inherit` |
| **`devops-deployment-engineer`** | DevOps & Parity Engineer | Duy trì tính khả dụng song song giữa `tavyorder.web.app` và `oderho.vercel.app`. Cấu hình `vercel.json` CORS, serverless APIs. | Run command, Write tools | `inherit` |

---

## 📂 ĐIỀU KHOẢN 3: CƠ CẤU THƯ MỤC CẤU HÌNH CHUẨN ANTIGRAVITY 2.0

Toàn bộ cấu hình tác tử được chuẩn hóa bên trong thư mục `.agents/` tại gốc dự án:
```text
.agents/
├── rules/                           # Các quy tắc kỹ thuật mô-đun hóa
│   ├── ecommerce-guardrails.md      # Quy tắc giá tiền, SĐT, giỏ hàng, thanh toán
│   ├── deployment-parity.md         # Quy tắc đồng bộ song song Vercel & Firebase
│   ├── qc-quality-gate.md           # Tiêu chuẩn kiểm thử 303/303 tests & Zero-Build-Error
│   └── korean-scraper-integrity.md  # Quy chuẩn bóc tách dữ liệu nguồn Hàn Quốc sạch 100%
├── skills/                          # Kỹ năng dạng Runbook (Progressive Disclosure)
│   ├── task-planner/SKILL.md
│   ├── ui-ux-artisan/SKILL.md
│   ├── fullstack-developer/SKILL.md
│   ├── firebase-backend-specialist/SKILL.md
│   ├── security-auditor/SKILL.md
│   ├── qc-gatekeeper/SKILL.md
│   ├── korean-scraper-specialist/SKILL.md
│   └── devops-deployment-engineer/SKILL.md
└── subagents/                       # Hồ sơ Subagents độc lập cho Antigravity 2.0
    ├── manifest.json                # Danh mục toàn bộ 8 Subagents
    ├── task-planner.json
    ├── ui-ux-artisan.json
    ├── fullstack-developer.json
    ├── firebase-backend-specialist.json
    ├── security-auditor.json
    ├── qc-gatekeeper.json
    ├── korean-scraper-specialist.json
    └── devops-deployment-engineer.json
```

---

## ⚡ ĐIỀU KHOẢN 4: LỆNH KIỂM TOÀN BỘ HỆ THỐNG
Mỗi khi phát triển xong tính năng, chạy chuỗi kiểm định bắt buộc:
```bash
npm run test:agents   # Kiểm tra tính toàn vẹn của Rules, Subagents, Skills (Zero Drift)
npm test              # Kiểm tra 303/303 bài test tự động 4 tầng (Exit Code 0)
npm run build         # Kiểm tra đóng gói build production Vite (Zero-Build-Error)
```
Tác tử chỉ được bàn giao cho người dùng khi cả 3 lệnh trên đều trả về kết quả thành công rực rỡ 100%.
