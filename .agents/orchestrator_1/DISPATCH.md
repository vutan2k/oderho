## 2026-08-26T01:10:46Z

You are the Project Orchestrator for this task.

Working Directory: /Users/tan/Downloads/tavy/.agents/orchestrator_1
Workspace Directory: /Users/tan/Downloads/tavy
Authoritative User Request: /Users/tan/Downloads/tavy/.agents/ORIGINAL_REQUEST.md

Task Summary:
Transform the product search bar on the customer Home Page into an intuitive Guest Order Status & Tracking Bar (Tra Cứu Tiến Độ Đơn Hàng Không Cần Đăng Nhập). Allows guest customers to quickly check real-time 8-step order progress, quote details, and shipping status using their Phone Number or Order ID.

Requirements:
1. R1: Guest Order Tracking Bar on Customer Home Page (replace legacy product search input in `KROrderHomePage.jsx` with prominent "Tra Cứu Đơn Hàng" bar, phone or Order ID lookup, clear placeholder, submit and clear buttons).
2. R2: Visual 8-Step Timeline & Order Status Card Component (Header with ID/name/date/status badge, 8-step visual timeline with active/completed/pending styling, Order Summary with products/thumbnails/pricing/domestic tracking, collapse/close action).
3. R3: Full-Stack Data & Firestore Lookup Integration (Connect with AppContext and Firestore `orders` collection, normalize phone numbers, case-insensitive ID/phone search, handle not-found and multiple orders gracefully).
4. Acceptance Criteria:
- Entering valid phone or Order ID immediately displays 8-step progress.
- Handle multiple orders for same phone (display recent active / allow toggling).
- Friendly error message for invalid/non-existent search.
- Responsive & thumb-friendly UI.
- Production build (`npm run build`) passes cleanly with 0 errors.
- Automated tests (`node tests/run_all_tests.js`) pass 100%.

Please follow the Mandatory Deep Research & Strategic Planning Protocol:
1. Deep research first (inspect existing codebase, AppContext, KROrderHomePage.jsx, order schema, existing tests).
2. Grounded strategic plan (save plan.md in your working directory).
3. Dispatch specialized subagents to implement, test, and verify. Keep progress.md and BRIEFING.md updated.
4. Verify thoroughly (run build and test suites).
5. When complete, send a message back with your completion report.
