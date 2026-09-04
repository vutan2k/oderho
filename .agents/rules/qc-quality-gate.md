# TIÊU CHUẨN NGHIỆM THU CHẤT LƯỢNG QC (QUALITY GATE)

> Áp dụng cho: Tác tử `qc-gatekeeper` và mọi tác tử trước khi bàn giao công việc.

---

## 1. Kiểm Tra Build Production (Zero-Build-Error)
- Lệnh thực thi: `npm run build`
- Tiêu chí:
  - 0 lỗi cú pháp (syntax errors).
  - 0 lỗi import module hoặc thiếu dependencies.
  - Thư mục `dist/` được tạo hoàn tất với dung lượng tối ưu.

## 2. Bộ Kiểm Thử Tự Động 4 Tầng (303/303 PASS 100%)
- Lệnh thực thi: `npm test`
- Tiêu chí:
  - Tier 1 (Feature Coverage): 152/152 PASS.
  - Tier 2 (Boundary & Corner Cases): 111/111 PASS.
  - Tier 3 (Pairwise Integration): 23/23 PASS.
  - Tier 4 (Real-World Scenarios): 12/12 PASS.
  - Tổng cộng: **303/303 PASS (Exit Code 0)**.
- Khi có tính năng mới: BẮT BUỘC bổ sung test case tương ứng để duy trì nguyên tắc Zero Untested Code.

## 3. Kiểm Định Tính Toàn Vẹn Tác Tử
- Lệnh thực thi: `npm run test:agents` (hoặc `node scripts/verify_agent_system.js`).
- Tiêu chí: 100% tệp rules, skills và subagents đạt chuẩn, không có duplicate hoặc cú pháp sai lệch.
