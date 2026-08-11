# ANTIGRAVITY IDE - CUSTOM AGENTS REGISTRY

## 1. AVAILABLE AGENTS DIRECTORY
Tất cả các Sub-Agent được đăng ký và sẵn sàng khởi chạy tự động:

- **[Planning Architect](file:///.agents/agents/task-planner-agent.md)** (`.agents/agents/task-planner-agent.md`)
  - **Mục tiêu:** Chuyên trách phân tích codebase, phỏng vấn yêu cầu, lập kiến trúc và lên kế hoạch thực thi (Strict Zero-Code Execution).

- **[Product Data Auto-Scraper Agent](file:///.agents/agents/product-data-scraper-agent.md)** (`.agents/agents/product-data-scraper-agent.md`)
  - **Mục tiêu:** Tự động cào dữ liệu sản phẩm từ đường link Hàn Quốc (Olive Young/Naver/Coupang), trích xuất thông tin & ảnh HD, định dạng chuẩn 11 cột Google Sheet và tự động đẩy lên Website.

## 2. HOW TO ADD A NEW AGENT (HƯỚNG DẪN THÊM AGENT MỚI)
Khi muốn tạo một Agent mới (ví dụ: `security-auditor-agent.md`, `qa-tester-agent.md`):

1. Tạo file cấu hình tại: `.agents/agents/<tên-agent>.md`
2. Cấu hình YAML Frontmatter ở đầu file:
```yaml
---
name: Tên Agent
description: Mô tả ngắn gọn nhiệm vụ chính của Agent
tools:
  - terminal
  - file_editor
  - browser_agent
---
```
3. Đăng ký thông tin Agent mới vào danh sách tại file này (`.agents/AGENTS.md`) và tạo link tương tự tại `.antigravity/rules.md`.
