# 📘 HƯỚNG DẪN SỬ DỤNG CHI TIẾT HỆ THỐNG TAVY KOREA & DATABASE FIRESTORE
*(Dành cho Quản Trị Viên, Kỹ Thuật Viên & Chủ Cửa Hàng)*

---

## 📌 MỤC LỤC
1. [Hướng Dẫn Chi Tiết Truy Cập Trang Admin (Quản Trị Viên)](#1-hướng-dẫn-chi-tiết-truy-cập-trang-admin)
2. [Hướng Dẫn Quản Lý Sản Phẩm Bằng Google Trang Tính (Google Sheet)](#2-hướng-dẫn-quản-lý-sản-phẩm-bằng-google-trang-tính)
3. [Hướng Dẫn Sử Dụng Trang Quản Trị Admin Dashboard](#3-hướng-dẫn-sử-dụng-trang-quản-trị-admin-dashboard)
4. [Hướng Dẫn Cấu Trúc & Quản Lý CSDL Firebase Firestore (Database)](#4-hướng-dẫn-cấu-trúc--quản-lý-csdl-firebase-firestore)
5. [Hướng Dẫn Quy Trình Đặt Hàng & Quản Lý Đơn Hàng Dành Cho Khách Hàng](#5-hướng-dẫn-quy-trình-đặt-hàng--quản-lý-đơn-hàng)
6. [Cấu Trúc Cột Mẫu Google Sheet (Copy Dán Nhanh)](#6-cấu-trúc-cột-mẫu-google-sheet)

---

## 1. HƯỚNG DẪN CHI TIẾT TRUY CẬP TRANG ADMIN

### 🔑 Bước 1: Mở đường dẫn trang Quản trị
Mở trình duyệt web và nhập chính xác một trong các đường dẫn sau:
- **Truy cập trực tiếp đường dẫn Admin**: `https://<ten-mien-website>/admin/login` (hoặc `http://localhost:3000/admin/login` khi chạy máy nội bộ).
- **Mẹo truy cập nhanh**: Trên bàn phím, gõ trực tiếp đuôi `/admin/login` vào sau tên miền website của bạn.

### 🔑 Bước 2: Nhập thông tin xác thực Admin
- **Mật khẩu Quản Trị (Admin Password)**: `admin123`
- Bấm nút **ĐĂNG NHẬP ADMIN**.

### 🔑 Bước 3: Chuyển hướng vào Admin Dashboard (`/admin/dashboard`)
Sau khi đăng nhập thành công, bạn sẽ được tự động chuyển vào trang điều hành **TAVY KOREA ADMIN PORTAL** với 2 phân khu chính:
1. **Phân Khu 1: QUẢN LÝ ĐƠN HÀNG (Shopping Bag)**: Quản lý yêu cầu mua hộ, duyệt cọc, nhập cước Air và theo dõi vận đơn.
2. **Phân Khu 2: QUẢN LÝ SẢN PHẨM & GOOGLE SHEET (Spreadsheet)**: Nhập link Google Sheet để đồng bộ sản phẩm tự động hoặc chỉnh sửa bảng giá trực tiếp.

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

## 4. HƯỚNG DẪN CẤU TRÚC & QUẢN LÝ CSDL FIREBASE FIRESTORE (DATABASE)

Hệ thống sử dụng **Google Firebase Firestore** thế hệ mới (Modular v10+) để lưu trữ CSDL thời gian thực (Realtime Sync) với chế độ lưu đệm ngoại tuyến (Offline Persistence via IndexedDB).

### 🗄️ Các Tập Hợp CSDL (Collections):

#### 1. Collection `orders` (Quản lý Đơn Hàng)
Lưu trữ thông tin chi tiết các đơn đặt mua hộ của khách hàng:
- `id` (String): Mã đơn hàng (VD: `ORD-827192`).
- `userEmail` (String): Email khách hàng.
- `customerName` (String), `customerPhone` (String), `customerAddress` (String): Thông tin nhận hàng tại Việt Nam.
- `productName` (String), `brand` (String), `qty` (Number), `foreignPrice` (Number): Thông tin sản phẩm mua hộ tại Hàn Quốc.
- `status` (String): Trạng thái đơn (`pending` -> `quoted` -> `purchased` -> `transit` -> `completed`).
- `trackingCode` (String): Mã vận đơn AirSeoul.
- `createdAt` (Timestamp), `updatedAt` (Timestamp).

#### 2. Collection `users` (Quản lý Tài Khoản & Sổ Địa Chỉ)
- `uid` (String): Mã tài khoản người dùng.
- `email` (String), `name` (String), `phone` (String), `address` (String): Sổ địa chỉ mặc định.
- `role` (String): Phân quyền (`user` / `admin`).

#### 3. Collection `system_config` (Cấu Hình Tỷ Giá Hệ Thống)
- Doc `rates`:
  - `KRW` (Object): `{ code: 'KRW', rate: 19.5, shippingFee: 180000 }`
  - `updatedAt` (Timestamp).

### 🛡️ Quy Tắc Bảo Mật Firestore (`firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /orders/{orderId} {
      allow read, write: if true; // Cho phép khách hàng gửi đơn & Admin quản lý
    }
    match /system_config/{configId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 5. HƯỚNG DẪN QUY TRÌNH ĐẶT HÀNG & QUẢN LÝ ĐƠN HÀNG

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

## 6. CẤU TRÚC CỘT MẪU GOOGLE SHEET
*(Có thể copy bảng bên dưới dán trực tiếp vào Google Trang Tính)*

```csv
goodsNo,name,brand,category,foreignPrice,productImage,description,origin,rating
A001,Serum Dưỡng Ẩm Torriden Dive-In 50ml,Torriden,skincare,18000,https://images.unsplash.com/photo-1620916566398-39f1143ab7be,Cấp nước đa tầng làm dịu da tức thì,Olive Young Seoul,4.9
A002,Toner Lá Rau Diếp Cá Anua 77% 250ml,Anua,skincare,28000,https://images.unsplash.com/photo-1556229174-5e42a09e45af,Làm dịu da mẩn đỏ kiềm dầu mụn,Olive Young Seoul,4.8
A003,Son Tint Lì Bóng Romand Juicy Lasting,Romand,makeup,9900,https://images.unsplash.com/photo-1586495777744-4413f21062fa,Son tint bóng lâu trôi mọng môi,Store Myeongdong,4.7
P001,Cao Hắc Sâm Chính Phủ KGC Everytime,KGC,health,98000,https://images.unsplash.com/photo-1584308666744-24d5c474f2ae,Bồi bổ sức khỏe tăng đề kháng,KGC Korea,5.0
P002,Chai Xịt Mũi Viêm Xoang Hanmi 30ml,Hanmi,pharmacy,12000,https://images.unsplash.com/photo-1584017911766-d451b3d0e843,Giảm nghẹt mũi sổ mũi tức thì,Nhà thuốc Seoul,4.8
```

---
*Tài liệu này được tự động tạo và lưu trữ trên hệ thống TAVY KOREA.*
