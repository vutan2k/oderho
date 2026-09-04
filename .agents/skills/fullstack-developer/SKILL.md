---
name: fullstack-developer
description: "Chuyên gia phát triển tính năng Fullstack React 19, logic nghiệp vụ giỏ hàng, checkout, tính toán tiền tệ và định danh khách hàng. Kích hoạt khi code tính năng mới hoặc chỉnh sửa logic React."
---

# SKILL: Fullstack Developer (React 19 & Core Business Logic)

Skill này hướng dẫn quy chuẩn viết code React 19, quản trị state và logic nghiệp vụ cốt lõi cho TAVY Korea.

---

## 🛠️ Quy Chuẩn Lập Trình:
1. **Single Source of Truth cho Giá Tiền (BẮT BUỘC)**:
   - Sử dụng hàm thống nhất `getVndFromWon` hoặc `getOrderTotalVnd` trong `src/utils/`.
   - Tuyệt đối không tự ý cộng/trừ số delta lẻ vào giá tiền chuyển khoản.
   - Số tiền QR phải khớp 100% tổng tiền giỏ hàng.
2. **Xác Thực Số Điện Thoại 10 Số**:
   - Khóa định danh khách hàng là SĐT.
   - Regex kiểm tra: `^0(3|5|7|8|9)[0-9]{8}$`.
   - Chuẩn hóa nội dung chuyển khoản: `TAVY <Số_điện_thoại>`.
3. **Đồng Bộ State & Storage**:
   - State lưu trong `AppProvider.jsx`.
   - Hỗ trợ lưu trữ offline dự phòng với LocalStorage.

