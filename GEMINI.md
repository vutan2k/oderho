# GLOBAL RULE: MANDATORY INTEGRITY, DEEP RESEARCH & STRATEGIC PLANNING PROTOCOL

> **QUY TẮC TỐI THƯỢNG & BẮT BUỘC TOÀN CỤC ÁP DỤNG CHO MỌI DỰ ÁN TRÊN HỆ THỐNG**:
> Trước khi thực hiện bất kỳ tác vụ (task), thay đổi mã nguồn, hay giải pháp nào, Agent BẮT BUỘC phải đọc và tuân thủ tuyệt đối quy tắc này đầu tiên:

---

## 0. QUY TẮC BẮT BUỘC SỐ 0: TRUNG THỰC TUYỆT ĐỐI, MINH BẠCH & KHÔNG CHE GIẤU LỖI (ZERO-TOLERANCE HONESTY & TRANSPARENCY)
- **TUYỆT ĐỐI KHÔNG DÙNG DỮ LIỆU GIẢ / MOCK / FAKE STATUS**: Không bao giờ được hardcode dữ liệu giả, giá giả, tích xanh thành công giả, hoặc tạo ảo giác tính năng đã chạy thật khi thực tế chưa kết nối hoặc chưa hoạt động.
- **KHÔNG CHE GIẤU LỖI & RÀO CẢN KỸ THUẬT**: Khi gặp bất kỳ lỗi nào, hoặc gặp rào cản kỹ thuật (như bị chặn CORS, WAF/Cloudflare, rate limit, dung lượng Firestore/LocalStorage, thiếu API Key...), BẮT BUỘC phải **thông báo thẳng thắn, rõ ràng và trung thực 100% cho người dùng ngay lập tức**. Tuyệt đối không tự ý "đi đường tắt" bằng dữ liệu giả để báo cáo xong việc.
- **ĐỒNG HÀNH & CÙNG BÀN BẠC GIẢI PHÁP**: Khi có vướng mắc kỹ thuật, trình bày nguyên nhân cốt lõi và đề xuất các phương án khả thi để cùng người dùng thống nhất giải pháp xử lý triệt để.
- **KIỂM ĐỊNH THỰC TẾ TRÊN MÔI TRƯỜNG THẬT (LIVE VERIFICATION)**: Chỉ được xác nhận tính năng hoàn tất khi đã đối chiếu trực tiếp với dữ liệu thực tế (Live Web, Database thật, link gốc nguồn), không phỏng đoán mơ hồ.

---

## 1. BƯỚC 1: NGHIÊN CỨU CHUYÊN SÂU TRƯỚC TIÊN (DEEP RESEARCH FIRST)
- Sử dụng **Gemini Notebook / NotebookLM MCP** (`gemini-notebook`) để tra cứu tài liệu, kiến thức chuyên sâu và dữ liệu nền tảng liên quan đến tác vụ.
- Đối chiếu đa nguồn và tìm kiếm thông tin bổ sung để nắm rõ 100% bối cảnh kỹ thuật, chuẩn công nghệ, kiến trúc và ràng buộc trước khi bắt tay vào làm.
- Tuyệt đối không phỏng đoán mơ hồ hoặc làm tắt khi chưa có căn cứ thông tin vững chắc.

---

## 2. BƯỚC 2: XÂY DỰNG KẾ HOẠCH SIÊU CHI TIẾT (GROUNDED STRATEGIC PLAN)
- Dựa trực tiếp vào dữ liệu và tri thức đã nghiên cứu ở Bước 1 để xây dựng **Kế hoạch hành động chi tiết**:
  1. **Mục tiêu cốt lõi & Tiêu chí nghiệm thu (Acceptance Criteria)**.
  2. **Phân rã giai đoạn thực thi (Phase-by-Phase)**.
  3. **Chi tiết từng bước làm cụ thể (Step-by-Step Micro-Tasks)**: Công cụ, file chỉnh sửa, đầu ra mong đợi.
  4. **Ma trận quản trị rủi ro & Phương án dự phòng (Risk Matrix & Fallback Plan)**.

---

## 3. BƯỚC 3: THỰC THI CHÍNH XÁC & KIỂM ĐỊNH TỰ ĐỘNG
- Triển khai code/task bám sát 100% theo bản kế hoạch đã lập.
- Tự động kiểm tra chất lượng (Verification Loop), đối chiếu dữ liệu thật, đảm bảo không phát sinh lỗi trước khi bàn giao kết quả.

---

## 4. QUY TẮC ĐẶC THÙ HỆ THỐNG E-COMMERCE & THANH TOÁN (SYSTEM GUARDRAILS)
- **4.1. Single Source of Truth cho Giá Tiền**:
  - Giá VND hiển thị ở thẻ sản phẩm, chi tiết sản phẩm, giỏ hàng và thanh toán chuyển khoản cọc 100% phải được tính toán từ một hàm thống nhất (`getVndFromWon` / `getOrderTotalVnd`).
  - Tuyệt đối không tự ý thêm bớt số lẻ delta (như 101đ - 990đ) vào số tiền chuyển khoản của khách hàng.
  - Số tiền chuyển khoản trên mã QR phải trùng khớp 100% với tổng tiền giỏ hàng hiển thị.
- **4.2. Định Danh & Tra Cứu Đơn Hàng Theo Số Điện Thoại**:
  - Số điện thoại là khóa định danh chính (Primary Identifier) trong toàn bộ UX và tra cứu đơn hàng.
  - Loại bỏ hoàn toàn tiền tố mã đơn dạng `ORD-` trên giao diện người dùng.
- **4.3. Kiểm Tra Dữ Liệu Khách Vãng Lai**:
  - Bắt buộc kiểm tra định dạng Số điện thoại Việt Nam chuẩn 10 số (`^0(3|5|7|8|9)[0-9]{8}$`).
  - Bắt buộc kiểm tra Họ tên và Địa chỉ giao hàng đầy đủ trước khi cho phép tạo đơn hàng.
- **4.4. Chuẩn Hóa Nội Dung Chuyển Khoản**:
  - Nội dung chuyển khoản chuẩn hóa tự động theo cú pháp: `TAVY <Số_điện_thoại>` (Ví dụ: `TAVY 0912345678`).

---

## 5. QUY TẮC BẮT BUỘC ĐỒNG BỘ & HỖ TRỢ VERCEL (MANDATORY VERCEL DEPLOYMENT & PARITY RULE)
- **5.1. Tự Động Đồng Bộ & Triển Khai Vercel (Auto Vercel Parity)**:
  - Dự án sử dụng song song hai nền tảng: **Firebase Hosting** (`https://tavyorder.web.app`) và **Vercel** (`https://oderho.vercel.app`).
  - Mọi thay đổi về mã nguồn, cấu hình hệ thống, biến môi trường, hoặc triển khai (deploy) **BẮT BUỘC phải thực hiện và đồng bộ song song cho cả Vercel và Firebase**.
  - Mỗi khi thực hiện deploy hoặc push git, luôn đảm bảo nhánh `main` được cập nhật để Vercel tự động build và triển khai, đồng thời kiểm tra tính khả dụng trên `https://oderho.vercel.app`.
- **5.2. Vercel Serverless Functions (`api/`)**:
  - Toàn bộ backend xử lý cổng thanh toán PayOS (tạo link thanh toán `api/createPayOSPaymentLink.js` và webhook đối soát `api/payosWebhook.js`) chạy trên Vercel Serverless Functions.
  - Luôn đảm bảo cấu hình CORS headers đầy đủ trong `vercel.json` để cho phép `tavyorder.web.app` gọi chéo API sang `oderho.vercel.app` mà không bị chặn.
  - Khi thay đổi logic mã đơn hàng, giá tiền hoặc trạng thái đơn, BẮT BUỘC phải cập nhật tương ứng trong các Serverless Functions trong thư mục `api/`.
- **5.3. Hỗ Trợ Đa Tên Miền (Multi-Origin Support)**:
  - Mọi URL chuyển hướng callback (`returnUrl`, `cancelUrl`) và metadata phải tự động phát hiện tên miền hiện tại của khách hàng (`req.headers.origin` / `req.headers.referer`), đảm bảo hoạt động hoàn hảo trên cả `tavyorder.web.app`, `oderho.vercel.app` và môi trường local/preview.


