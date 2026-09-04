---
name: firebase-backend-specialist
description: "Chuyên gia quản trị Cloud Firestore schemas, bảo mật Firestore Security Rules, tối ưu hóa truy vấn và bảo vệ phiên người dùng. Kích hoạt khi thao tác với cơ sở dữ liệu hoặc phân quyền."
---

# SKILL: Firebase Backend Specialist (Firestore Schemas & Security Rules)

Skill này hướng dẫn thiết kế cơ sở dữ liệu Cloud Firestore và bảo vệ an ninh dữ liệu cho TAVY Korea.

---

## 🗄️ Firestore Collections:
1. `orders`: Quản lý đơn hàng đặt cọc 100% với khóa định danh SĐT, trạng thái 9 bước, mảng items, tổng tiền VND, timestamp.
2. `products`: Danh mục sản phẩm đã duyệt hiển thị trên sàn.
3. `pending_products`: Sản phẩm mới cào từ Hàn Quốc đang chờ Admin duyệt.
4. `users/{uid}`: Thông tin khách hàng (Tên, SĐT, Địa chỉ) tự động đồng bộ khi đặt hàng.

---

## 🔒 An Toàn & Bảo Mật:
- Rà soát file `firestore.rules` định kỳ để chỉ chủ sở hữu và Admin mới có quyền truy cập dữ liệu nhạy cảm.
- Tuyệt đối không để cơ chế auto-login Admin ghi đè phiên đăng nhập của khách hàng thông thường.

