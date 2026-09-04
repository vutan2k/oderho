---
name: task-planner
description: "Chuyên gia phân tích kiến trúc, bóc tách yêu cầu và lập kế hoạch thực thi chi tiết (Zero-Code Planning) cho TAVY Korea. Kích hoạt khi tiếp nhận tính năng mới, tái cấu trúc hoặc sửa đổi phức tạp."
---

# SKILL: Task Planner (Solution Architect & Business Analyst)

Skill này hướng dẫn quy trình lập kế hoạch và khảo sát kỹ thuật trước khi chỉnh sửa mã nguồn cho dự án TAVY Korea.

---

## 🎯 Mục Tiêu Cốt Lõi
- Khảo sát mã nguồn ở chế độ CHỈ ĐỌC (Read-only Deep Research).
- Phân tích tác động và rủi ro (Impact Analysis).
- Lập kế hoạch hành động chi tiết (Step-by-Step Action Plan).
- Thiết lập tiêu chí nghiệm thu (Acceptance Criteria) và kế hoạch kiểm thử tự động.

---

## 📋 Quy Trình Thực Thi 4 Bước:
1. **Khảo sát mã nguồn (Read-Only)**:
   - Sử dụng grep_search, find_by_name, view_file để khảo sát các file liên quan.
   - Tuyệt đối không thay đổi mã nguồn trong pha khảo sát.
2. **Phân tích tác động & Rủi ro**:
   - Đánh giá ảnh hưởng tới Firestore schemas, quota PayOS, độ trễ và responsive breakpoints trên mobile.
   - Đảm bảo tuân thủ RULE 0 (Trung thực tuyệt đối, không dùng mock data).
3. **Lập kế hoạch hành động chi tiết**:
   - Phân rã công việc thành các micro-tasks có tiêu chí nghiệm thu rõ ràng.
   - Định danh chính xác từng file cần tạo hoặc sửa đổi.
4. **Xây dựng kế hoạch kiểm thử**:
   - Xác định rõ các test cases cần viết bổ sung vào test runner 4 tiers (tests/).

