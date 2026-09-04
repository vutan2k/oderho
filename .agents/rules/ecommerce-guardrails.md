# QUY TẮC NGHIỆP VỤ E-COMMERCE & THANH TOÁN (ECOMMERCE GUARDRAILS)

> Áp dụng cho: Mọi tác tử xử lý sản phẩm, giỏ hàng, thông tin khách hàng, thanh toán và đơn hàng.

---

## 1. Single Source of Truth cho Giá Tiền
- Mọi giá tiền VND hiển thị ở thẻ sản phẩm (ProductCard), chi tiết sản phẩm (ProductDetailPage), giỏ hàng (CartPage), trang thanh toán (PaymentPage) và đơn hàng (OrdersPage) BẮT BUỘC phải được tính toán từ một hàm thống nhất (`getVndFromWon` / `getOrderTotalVnd`).
- Tuyệt đối không tự ý thêm bớt số lẻ delta (101đ - 990đ) vào số tiền chuyển khoản của khách hàng.
- Số tiền chuyển khoản hiển thị trên mã QR phải trùng khớp 100% với tổng tiền giỏ hàng hiển thị.

## 2. Định Danh & Tra Cứu Đơn Hàng Theo Số Điện Thoại
- Số điện thoại là khóa định danh chính (Primary Identifier) trong toàn bộ UX và tra cứu đơn hàng.
- Loại bỏ hoàn toàn tiền tố mã đơn dạng `ORD-` trên giao diện người dùng.
- Bắt buộc kiểm tra định dạng Số điện thoại Việt Nam chuẩn 10 số: `^0(3|5|7|8|9)[0-9]{8}$`.
- Bắt buộc kiểm tra Họ tên và Địa chỉ giao hàng đầy đủ trước khi cho phép tạo đơn hàng.

## 3. Chuẩn Hóa Nội Dung Chuyển Khoản
- Nội dung chuyển khoản trên mã VietQR / PayOS chuẩn hóa tự động theo cú pháp:
  `TAVY <Số_điện_thoại>` (Ví dụ: `TAVY 0912345678`).

## 4. Cô Lập Sự Kiện Modal & Lightbox Lồng Nhau (LIFO Event Isolation)
- Mọi Lightbox xem ảnh, ảnh review phóng to hoặc popup lồng bên trong Modal bắt buộc phải cô lập sự kiện click (`e.stopPropagation()`) tại vùng nền (backdrop) và nút đóng (X).
- Tuyệt đối không để sự kiện click nổi bọt lên backdrop của Modal cha dẫn đến đóng toàn bộ phiên xem của người dùng.
- Cơ chế phím Escape tuân theo thứ tự LIFO (Last-In-First-Out): Bấm lần 1 đóng lightbox phóng to; bấm lần 2 mới đóng Modal cha.

## 5. Trải Nghiệm Danh Mục Trọng Tâm
- Trang chủ ưu tiên hiển thị nhóm sản phẩm trọng tâm (mặc định là danh mục "Mỹ phẩm" / `cosmetics`), không hiển thị ồ ạt sản phẩm hỗn tạp khi mới vào trang.
- Giữ nguyên tùy chọn "Tất cả sản phẩm" cho khách hàng muốn xem toàn bộ kho hàng.
