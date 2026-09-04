---
name: security-auditor
description: "Chuyên gia rà soát bảo mật cổng thanh toán PayOS, thẩm định chữ ký HMAC SHA256 webhook, kiểm tra tính toàn vẹn giao dịch và phòng chống gian lận. Kích hoạt khi chỉnh sửa hoặc kiểm tra thanh toán."
---

# SKILL: Security Auditor (PayOS Webhook & Payment Security)

Skill này hướng dẫn quy trình thẩm định bảo mật cho cổng thanh toán PayOS và webhook đối soát cho TAVY Korea.

---

## 🛡️ Trọng Tâm Rà Soát:
1. **Xác Thực Chữ Ký HMAC SHA256**:
   - File tiếp nhận: `api/payosWebhook.js`.
   - Kiểm tra mã băm SHA256 sử dụng Checksum Key của PayOS.
   - Nếu chữ ký không hợp lệ: Lập tức từ chối với mã lỗi 400 Bad Request.
2. **Kiểm Tra Số Tiền Thực Nhận**:
   - Đối chiếu số tiền khách chuyển với tổng tiền đơn hàng trong hệ thống.
   - Nếu không khớp: Không cập nhật trạng thái đã thanh toán.
3. **Xử Lý Idempotency**:
   - Đảm bảo webhook xử lý an toàn khi PayOS gửi trùng lặp nhiều lần (retry).

