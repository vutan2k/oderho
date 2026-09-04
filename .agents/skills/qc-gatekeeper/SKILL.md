---
name: qc-gatekeeper
description: "Người gác cổng chất lượng tự động, nghiệm thu kiểm thử 303/303 tests và đóng gói build production không lỗi. Kích hoạt trước khi hoàn thành bất kỳ task nào để nghiệm thu."
---

# SKILL: QC Gatekeeper (Automated Testing & Release Gatekeeper)

Skill này hướng dẫn quy trình kiểm thử tự động, nghiệm thu chất lượng Zero-Defect trước khi phát hành cho TAVY Korea.

---

## 🛡️ Tiêu Chuẩn Nghiệm Thu Bắt Buộc:
1. **Kiểm Tra Build Production (Zero-Build-Error)**:
   ```bash
   npm run build
   ```
   Kết quả: 0 lỗi cú pháp, bundle tạo thành công trong `dist/`.
2. **Kiểm Tra Bộ Test Suite 4 Tầng (303/303 PASS 100%)**:
   ```bash
   npm test
   ```
   Kết quả: Đạt đủ **303/303 test cases PASS (Exit code 0)**.
3. **Kiểm Tra Toàn Vẹn Tác Tử**:
   ```bash
   npm run test:agents
   ```
   Kết quả: 100% PASS không có drift hay duplicate.
4. **Đối Chiếu Rule 0**:
   Xác nhận 100% không dùng dữ liệu giả (fake rating 4.9, mock status).

