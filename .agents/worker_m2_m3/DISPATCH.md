## 2026-08-26T01:17:00Z

Task Assignment: Worker 2 for Milestones M2 and M3 (Visual 8-Step Timeline, Order Status Card, and KROrderHomePage Integration).
Working directory: /Users/tan/Downloads/tavy/.agents/worker_m2_m3
Original Request: /Users/tan/Downloads/tavy/.agents/ORIGINAL_REQUEST.md
Scope Document: /Users/tan/Downloads/tavy/PROJECT.md

1. Implement the UI components in `/Users/tan/Downloads/tavy/src/components/GuestOrderTracking/`:
   - `ProofMediaModal.jsx`: Modal popup / lightbox to display POV videos (video player/embed), receipt bill images, packing videos, with close on backdrop or Esc.
   - `GuestOrderStatusCard.jsx`:
     * Header: Order ID (bold purple), Customer Name, Order Date, Status Badge (using `getStatusConfig(order.status)` colors/labels), and Close/Dismiss button ('X').
     * Multi-Order Tab Switcher: If multiple orders match a phone, display clickable tabs (e.g. "Đơn 1 (Mới nhất) - ORD-...", "Đơn 2 - ...") allowing guest to toggle between orders.
     * 8-Step Visual Timeline: Responsive horizontal stepper rendering steps 1 to 8 with Completed (check icon), Active (glowing/pulse ring & step number), and Pending (gray) states, plus progress line fill `${((stepIndex + 1) / 8) * 100}%`.
     * Transparent Proof Hub: Buttons for POV Video, Store Receipt Bill, Packing Video, Weight badge (`Scale`), Air AWB (`Plane`), and Domestic Tracking (`Truck`) with 1-click "Sao chép" (copy to clipboard with feedback).
     * Order Summary: Item list with product thumbnails, options, quantity, prices in VNĐ, total order VNĐ amount.
     * Payment CTA: "Thanh toán cọc ngay" button linking to `/payment/${order.id}` if order is in `pending` / unpaid status.
   - `GuestOrderTrackingBar.jsx`:
     * Prominent search bar container with search icon, input with placeholder ("Nhập Số điện thoại hoặc Mã đơn (VD: 0912345678, ORD-827192)...").
     * Clear button ('X') when query is not empty.
     * Submit button ("Tra cứu") with loading/active styling.
     * Quick suggestion / sample chips (e.g. "Thử mã: ORD-100001", "Thử SĐT: 0912345678").
2. Update `/Users/tan/Downloads/tavy/src/pages/KROrderHomePage.jsx`:
   - Replace legacy `#search-input-main` with `<GuestOrderTrackingBar />`.
   - Wire up search query state, `findGuestOrders` from `guestTrackingService.js`, active order selection, and render `<GuestOrderStatusCard />` when matching order(s) found.
   - Display a friendly not-found banner ("Không tìm thấy đơn hàng nào...") when query has no match.
   - Maintain product catalog and category filters cleanly below or beside.
   - Ensure responsive, thumb-friendly design on mobile screens (viewport < 768px).
3. Run `node tests/run_all_tests.js` and `npm run build` and `npx oxlint` to verify 100% passing tests and 0 build errors.
4. Document changes and test results in `/Users/tan/Downloads/tavy/.agents/worker_m2_m3/handoff.md` and send a message back when complete.
