# QUY TẮC ĐỒNG BỘ VERCEL & FIREBASE (DEPLOYMENT PARITY)

> Áp dụng cho: Mọi tác tử xử lý backend, serverless functions, cấu hình build và triển khai.

---

## 1. Đồng Bộ Triển Khai Song Song (Auto Parity)
- Dự án chạy song song hai môi trường:
  - **Firebase Hosting**: `https://tavyorder.web.app`
  - **Vercel**: `https://oderho.vercel.app`
- Mọi thay đổi về mã nguồn, cấu hình hệ thống, biến môi trường BẮT BUỘC phải hoạt động hoàn hảo trên cả 2 nền tảng.

## 2. Vercel Serverless Functions (`api/`)
- Toàn bộ backend xử lý cổng thanh toán PayOS chạy trên Vercel Serverless:
  - `api/createPayOSPaymentLink.js`: Tạo link thanh toán PayOS.
  - `api/payosWebhook.js`: Tiếp nhận webhook đối soát đơn hàng.
- Cấu hình CORS headers đầy đủ trong `vercel.json` để cho phép domain Firebase gọi chéo API sang Vercel mà không bị chặn.

## 3. Hỗ Trợ Đa Tên Miền (Multi-Origin Support)
- URL chuyển hướng callback (`returnUrl`, `cancelUrl`) tự động nhận diện domain hiện tại (`req.headers.origin` / `req.headers.referer`), đảm bảo trải nghiệm liền mạch trên cả 2 domain và local preview.
