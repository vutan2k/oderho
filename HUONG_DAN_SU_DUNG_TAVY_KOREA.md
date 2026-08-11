# 📘 HƯỚNG DẪN SỬ DỤNG CHI TIẾT HỆ THỐNG TAVY KOREA
*(Dành cho Quản Trị Viên & Chủ Cửa Hàng Mua Hàng Hộ Hàn Quốc)*

---

## 📌 MỤC LỤC
1. [Giới Thiệu Tổng Quan](#1-giới-thiệu-tổng-quan)
2. [Hướng Dẫn Quản Lý Sản Phẩm Bằng Google Trang Tính (Google Sheet)](#2-hướng-dẫn-quản-lý-sản-phẩm-bằng-google-trang-tính-google-sheet)
3. [Hướng Dẫn Sử Dụng Trang Quản Trị Admin Dashboard](#3-hướng-dẫn-sử-dụng-trang-quản-trị-admin-dashboard)
4. [Hướng Dẫn Quy Trình Đặt Hàng & Quản Lý Đơn Hàng](#4-hướng-dẫn-quy-trình-đặt-hàng--quản-lý-đơn-hàng)
5. [Cấu Trúc Cột Mẫu Google Sheet (Sao Chép Vào Google Docs / Sheet)](#5-cấu-trúc-cột-mẫu-google-sheet)

---

## 1. GIỚI THIỆU TỔNG QUAN

Website **TAVY KOREA** (`https://github.com/vutan2k/oderho.git`) là nền tảng chuyên mua hộ mỹ phẩm Olive Young, thực phẩm chức năng và thuốc nội địa Hàn Quốc chính hãng cho người Việt.

### Các Tính Năng Nổi Bật:
- **Đồng bộ dữ liệu thời gian thực từ Google Sheet**: Nhập/sửa sản phẩm trên Google Trang Tính, website tự động cập nhật sản phẩm và tỷ giá Won ₩ -> VNĐ.
- **Bảng Quản lý Admin Spreadsheet Editor**: Chỉnh sửa trực tiếp từng ô giá, tên, danh mục sản phẩm theo dạng bảng Excel ngay trên website.
- **Hệ thống Đăng nhập & Sổ Địa chỉ Khách hàng**: Lưu địa chỉ giao hàng mặc định, tự động điền form đặt hàng.
- **Theo dõi tiến trình vận chuyển 5 Bước**: Chờ cọc ➔ Đã cọc ➔ Đã mua tại Hàn ➔ Đang bay Air ➔ Đã giao thành công (kèm Mã vận đơn Air Seoul - Việt Nam).

---

## 2. HƯỚNG DẪN QUẢN LÝ SẢN PHẨM BẰNG GOOGLE TRANG TÍNH (GOOGLE SHEET)

### Bước 1: Tạo tệp Google Trang Tính mới
1. Truy cập [Google Sheets (docs.google.com/spreadsheets)](https://docs.google.com/spreadsheets).
2. Bấm **Trống (+)** để tạo một trang tính mới.
3. Đặt tên trang tính: `TAVY KOREA - Danh Mục Sản Phẩm`.

### Bước 2: Thiết lập danh sách cột tiêu chuẩn (Dòng 1)
Nhập các tên cột ở dòng đầu tiên (Hàng 1) chính xác như sau:

| A (goodsNo) | B (name) | C (brand) | D (category) | E (foreignPrice) | F (productImage) | G (description) | H (origin) | I (rating) |
|---|---|---|---|---|---|---|---|---|
| **Mã SP** | **Tên Sản Phẩm** | **Thương Hiệu** | **Danh Mục** | **Giá Won (₩)** | **Link Ảnh SP** | **Mô Tả Sản Phẩm** | **Xuất Xứ** | **Đánh Giá** |

*Lưu ý về Cột Danh Mục (`category`):*
- `skincare`: Mỹ phẩm Dưỡng da
- `makeup`: Mỹ phẩm Trang điểm
- `health`: Thực phẩm chức năng & Collagen
- `pharmacy`: Thuốc hiệu thuốc Hàn Quốc

### Bước 3: Chia sẻ công khai Google Sheet
1. Ở góc trên bên phải màn hình Google Sheet, bấm nút **Chia sẻ (Share)**.
2. Tại mục *Quyền truy cập chung*, đổi từ *Bị hạn chế* thành **"Bất kỳ ai có liên kết" (Anyone with the link)**.
3. Bấm **Sao chép liên kết (Copy link)**.

### Bước 4: Nhập link Google Sheet vào Website TAVY KOREA
1. Đăng nhập trang Admin (`/admin/login`).
2. Chọn Tab **QUẢN LÝ SẢN PHẨM & GOOGLE SHEET**.
3. Dán liên kết vừa sao chép vào ô *Link Google Sheet*.
4. Bấm nút **ĐỒNG BỘ NGAY**. Website sẽ tự động nạp tất cả sản phẩm từ Google Trang Tính lên trang chủ!

---

## 3. HƯỚNG DẪN SỬ DỤNG TRANG QUẢN TRỊ ADMIN DASHBOARD

### 🔑 Đăng nhập Admin Portal
- Đường dẫn: `/admin/login`
- Mật khẩu mặc định: `admin123` (hoặc tài khoản Admin cấu hình).

### 🛠️ Các tính năng trang Admin Dashboard (`/admin/dashboard`):
1. **Cập nhật Tỷ Giá Won (KRW/VND)**:
   - Nhập tỷ giá hôm nay (ví dụ: `19.5`) và bấm **Lưu Tỷ Giá**. Toàn bộ giá quy đổi VNĐ trên website sẽ tự động cập nhật chính xác theo tỷ giá mới.
2. **Quản lý Đơn hàng & Gửi Báo Giá**:
   - Khi có khách hàng gửi đơn mua hộ, đơn hàng xuất hiện ở Tab **Chờ cọc**.
   - Bấm **Sửa Báo Giá** để nhập cước Air, phí mua hộ và bấm **Lưu Báo Giá**.
   - Điền **Mã Vận Đơn Air** (VD: `VN-KR-882910`) để khách hàng tự kiểm tra lộ trình bay.
3. **Bảng Chỉnh Sửa Sản Phẩm (Spreadsheet Editor)**:
   - Click đúp vào bất kỳ ô nào (Tên SP, Thương hiệu, Giá Won) để chỉnh sửa nhanh.
   - Bấm **Thêm Hàng Mới** hoặc nút biểu tượng Thùng rác để xóa sản phẩm.
   - Bấm **LƯU DỮ LIỆU** để lưu tức thì.

---

## 4. HƯỚNG DẪN QUY TRÌNH ĐẶT HÀNG & QUẢN LÝ ĐƠN HÀNG

### 🛒 Dành cho Khách Hàng:
1. **Tìm kiếm & Chọn sản phẩm**: Xem danh mục Mỹ phẩm & Thực phẩm chức năng Hàn Quốc trên trang chủ TAVY KOREA.
2. **Xem chi tiết & Đặt mua**:
   - Bấm **Xem Chi Tiết** để đọc thành phần, hướng dẫn sử dụng và ảnh phóng to.
   - Bấm **Đặt mua sản phẩm này** (Giá hiển thị rõ VNĐ + Won ₩).
3. **Nhập thông tin giao hàng**:
   - Điền Họ tên, Số điện thoại và Địa chỉ nhận hàng tại Việt Nam.
   - Khách hàng đã đăng nhập tài khoản sẽ được **tự động điền sổ địa chỉ**.
4. **Chuyển khoản cọc & Theo dõi**:
   - Màn hình xác nhận đơn hiển thị ngay mã QR VietQR (MB Bank) và Tài khoản ngân hàng Hàn Quốc (Woori Bank).
   - Truy cập **Đơn Hàng Của Tôi** (`/orders`) để xem trạng thái bay Air real-time.

---

## 5. CẤU TRÚC CỘT MẪU GOOGLE SHEET
*(Có thể copy bảng bên dưới dán trực tiếp vào Google Trang Tính)*

```text
goodsNo	name	brand	category	foreignPrice	productImage	description	origin	rating
A001	Serum Dưỡng Ẩm Torriden Dive-In 50ml	Torriden	skincare	18000	https://images.unsplash.com/photo-1620916566398-39f1143ab7be	Cấp nước đa tầng làm dịu da tức thì	Olive Young Seoul	4.9
A002	Toner Lá Rau Diếp Cá Anua 77% 250ml	Anua	skincare	28000	https://images.unsplash.com/photo-1556229174-5e42a09e45af	Làm dịu da mẩn đỏ kiềm dầu mụn	Olive Young Seoul	4.8
A003	Son Tint Lì Bóng Romand Juicy Lasting	Romand	makeup	9900	https://images.unsplash.com/photo-1586495777744-4413f21062fa	Son tint bóng lâu trôi mọng môi	Store Myeongdong	4.7
P001	Cao Hắc Sâm Chính Phủ KGC Everytime	KGC	health	98000	https://images.unsplash.com/photo-1584308666744-24d5c474f2ae	Bồi bổ sức khỏe tăng đề kháng	KGC Korea	5.0
P002	Chai Xịt Mũi Viêm Xoang Hanmi 30ml	Hanmi	pharmacy	12000	https://images.unsplash.com/photo-1584017911766-d451b3d0e843	Giảm nghẹt mũi sổ mũi tức thì	Nhà thuốc Seoul	4.8
```

---
*Tài liệu này được tự động tạo và lưu trữ trên hệ thống TAVY KOREA.*
