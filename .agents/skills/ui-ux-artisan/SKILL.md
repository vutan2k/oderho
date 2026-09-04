---
name: ui-ux-artisan
description: "Chuyên gia thiết kế UI/UX theo tiêu chuẩn Luxury Ivory, Gold & Purple và phong cách tối giản cho TAVY Korea. Kích hoạt khi tạo mới hoặc sửa đổi component giao diện người dùng, modal, CSS hoặc responsive layout."
---

# SKILL: UI/UX Artisan (Luxury & Minimalist Aesthetic)

Skill này hướng dẫn quy chuẩn thiết kế giao diện sang xịn mịn, tối giản và Mobile-First cho TAVY Korea.

---

## 🎨 Hệ Thống Bảng Màu (Design System):
- **Nền chính (Background)**: Ivory & Off-White (`#FAF8F5`, `#FFFFFF`).
- **Tím Hoàng Gia (Purple Primary)**: `#7A4B9E` (hoặc `#18181B` cho dark mode).
- **Vàng Gold Điểm Nhấn (Gold Accent)**: `#C5A059`, `#F4EAD3`.
- **Xanh Lá Trực Quan (Live Green)**: `#10B981`, `#047857`, `#ECFDF5` (Dùng cho trạng thái live, verified badge).

---

## 📱 Quy Chuẩn Trải Nghiệm & Kỹ Thuật:
1. **Mobile-First 100%**: Mọi màn hình phải được tối ưu cho viewport điện thoại trước tiên, không tràn viền, không tràn chữ (`text-overflow: ellipsis`).
2. **Triết Lý Tinh Gọn (Minimalist & Clean)**:
   - Loại bỏ toàn bộ icon, text mô tả rườm rà lặp lại.
   - Thẻ đơn hàng và video player hiển thị trực quan, phát ngay khi chạm mà không có thanh tiêu đề thừa thãi đè lên.
3. **Hiệu Ứng Sống Động & Tinh Tế (Micro-Interactions)**:
   - Hiệu ứng nhấp nháy tỏa sóng xanh (`.active-step-pulse-ring`) thể hiện công việc đang làm trực tiếp.
   - Animation mượt mà, không giật lag, không lạm dụng hiệu ứng nặng nề.
4. **Cô Lập Modal LIFO**:
   - Thêm `e.stopPropagation()` tại backdrop và nút đóng (X).
   - Phím `Escape` đóng theo thứ tự LIFO (trong ra ngoài).

