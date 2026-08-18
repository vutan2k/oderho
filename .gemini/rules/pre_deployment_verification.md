# QUY TẮC BẮT BUỘC: KIỂM THỬ TỰ ĐỘNG & BẢO VỆ CHẤT LƯỢNG TRƯỚC KHU NẠP CODE (PRE-DEPLOYMENT VERIFICATION RULE)

> **MỤC TIÊU**: Đảm bảo 100% tính năng trong dự án TAVY KOREA (cào dữ liệu, giỏ hàng, tính giá hối đoái, thanh toán VietQR, quản lý đơn hàng, xuất báo cáo CSV) hoạt động hoàn hảo và KHÔNG BAO GIỜ PHÁT SINH LỖI SAU KHI SỬA (ZERO REGRESSION).

---

## 1. QUY TRÌNH KIỂM THỬ BẮT BUỘC TRƯỚC KHI DEPLOY
Trước khi chạy `firebase deploy` hoặc `git push`, AI Agent BẮT BUỘC phải thực hiện đủ 4 bước kiểm thử nghiêm ngặt sau:

### 1.1. Chạy Bộ Kiểm Thử Tự Động (Automation Test Suite)
- **Lệnh bắt buộc**: `npm test`
- **Yêu cầu bắt buộc**: Tất cả **180/180 Test Cases** trên 4 Tier (Feature Coverage, Boundary Cases, Pairwise Integration, Real-World Scenarios) phải đạt **PASS 100%** (Exit Code 0).
- **Tuyệt đối không**: Không được nảy trang, bỏ qua test lỗi, hoặc dùng mock tạm thời để qua mặt bộ test.

### 1.2. Kích Hoạt Subagent Kiểm Thử Độc Lập (Subagent E2E Audit)
- Trước khi chốt kết quả công việc, phải spawn **Subagent chuyên trách** (`invoke_subagent`) để soi lại toàn bộ diff code:
  - Kiểm tra xem thay đổi mới có ảnh hưởng đến các tính năng đã chạy trước đó không.
  - Đảm bảo không có các điều kiện lọc đoán mò (heuristic string checks) gây xoá nhầm dữ liệu thật của người dùng.

### 1.3. Kiểm Tra Đóng Gói Sản Phẩm (Production Build Verification)
- **Lệnh bắt buộc**: `npm run build`
- **Yêu cầu bắt buộc**: Trình biên dịch Vite/Rollup phải biên dịch thành công 100% không chứa lỗi cú pháp (0 Syntax Errors, 0 Missing Module Imports).

### 1.4. Bảo Vệ Dữ Liệu An Toàn (Accidental Data Loss Prevention)
- Tuyệt đối không xóa bớt trường dữ liệu hoặc tự ý loại bỏ sản phẩm dựa trên chuỗi tên (ví dụ: `brand === 'Korea Brand'`).
- Mọi dữ liệu cào từ Olive Young hoặc dữ liệu từ khách hàng phải được lưu giữ nguyên bản 100%.

---

## 2. BẢNG DANH MỤC 15 TÍNH NĂNG NÒNG CỐT CẦN BẢO VỆ (ZERO BUG LIST)
1. **Catalog Browsing & Search**: Tìm kiếm sản phẩm theo tên Việt/Hàn/mã SP + Lọc danh mục.
2. **Product Detail & Won Conversion**: Hiển thị giá Won gốc, tự động quy đổi VND theo tỷ giá Admin.
3. **Cart & Options**: Thêm sản phẩm vào giỏ, điều chỉnh số lượng, lưu giỏ hàng offline.
4. **Cascading Address Selector**: Chọn Tỉnh/Thành ➔ Quận/Huyện ➔ Phường/Xã từ Vietnam Open API.
5. **Checkout & Quote Calculation**: Tính tổng tiền bao gồm Phí Mua Hộ, Phí Vận Chuyển Hàn-Việt.
6. **9-Step Order Tracking**: Theo dõi trạng thái đơn hàng 9 bước từ Chờ Duyệt ➔ Đã Thanh Toán ➔ Hoàn Tất.
7. **VietQR Payment System**: Hiển thị mã QR thanh toán ngân hàng chính xác số tiền và nội dung đơn.
8. **Admin Exchange Rate Config**: Cài đặt tỷ giá ₩ Won, $ USD và % Phí Dịch Vụ thời gian thực.
9. **Admin Product Inventory**: Quản lý kho hàng sản phẩm, thêm/sửa/xoá/xuất CSV.
10. **Admin Order Manager**: Báo giá đơn hàng, cập nhật mã vận đơn, duyệt đơn hàng.
11. **Extension Auto-Ranking Scraper**: Cào tự động 50 sản phẩm Top Best Ranking Olive Young.
12. **Extension Zero-Flicker Messaging**: Bắn tin nhắn trực tiếp qua RAM trình duyệt (Zero URL Limit, Zero Tab Flicker).
13. **WAF Anti-Bot Challenge Filtering**: Tự động bỏ qua các trang bot challenge (`잠시만 기다려 주세요`).
14. **Firestore Realtime Sync**: Đồng bộ thời gian thực 2 chiều giữa Extension, Admin và Khách hàng.
15. **Gemini AI Professional Translator**: Dịch tên sản phẩm sang 100% Tiếng Việt mượt mà chuẩn mỹ phẩm.
