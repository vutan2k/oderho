# Original User Request

## Initial Request — 2026-08-18T22:38:28+09:00

Công cụ cào dữ liệu mỹ phẩm Olive Young Hàn Quốc chính xác cao: tự động bóc tách đầy đủ thông tin chi tiết sản phẩm, thu thập tổng cộng ~20 ảnh (bao gồm ảnh sản phẩm HD và ảnh đánh giá thực tế từ người dùng), lọc triệt để 100% ảnh rác (quà tặng, banner, logo) và đồng bộ lên database Firestore.

Working directory: /Users/tan/.gemini/antigravity/scratch/tavy-korea

## Requirements

### R1. Bộ cào dữ liệu chi tiết & bóc tách đa phương tiện (Deep Data & Multi-Image Scraper)
Công cụ Playwright bóc tách đầy đủ thuộc tính sản phẩm (Tên Việt/Hàn, Thương hiệu, Danh mục, Giá Won/VND, Mô tả, Đánh giá) và thu thập số lượng lớn ảnh (~20 ảnh/sản phẩm) bao gồm ảnh góc sản phẩm HD và album ảnh review chân thực của khách hàng.

### R2. Bộ lọc ảnh rác & Kiểm định AI Quality Control (Zero Junk & AI QC Filter)
Áp dụng bộ lọc đa tầng (DOM Selector + Regex CDN + AI Quality Control) để đảm bảo không lọt bất kỳ ảnh rác nào (ảnh quà tặng tai nghe/túi xách, logo cửa hàng, banner quảng cáo). AI QC tự động đánh giá tiêu chuẩn chất lượng dữ liệu trước khi đồng bộ.

### R3. Đồng bộ dữ liệu Firebase Firestore thời gian thực (Firestore Realtime Sync)
Đồng bộ dữ liệu sản phẩm sạch sau khi cào và kiểm định trực tiếp vào Cloud Firestore (pending_products collection) để hiển thị tức thì trên Web Admin.

## Acceptance Criteria

### Tính chính xác & Đầy đủ thông tin
- [ ] Mọi sản phẩm cào về đều có đủ Tên Việt/Hàn, Thương hiệu chính xác, Danh mục, Giá Won/VND, Mô tả.

### Số lượng & Chất lượng ảnh (~20 ảnh/sản phẩm)
- [ ] Thu thập tổng số ảnh (Ảnh đại diện + Album sản phẩm + Ảnh review GDAS) đạt mục tiêu ~20 ảnh/sản phẩm (hoặc tối đa số ảnh thực tế có trên trang).
- [ ] 100% link ảnh là URL ảnh gốc HD, không bị thu nhỏ (loại bỏ RS=64x0).

### Khả năng lọc rác 100%
- [ ] 0% ảnh rác (không dính logo Olive Young, không dính banner quảng cáo /display/, không dính ảnh quà tặng kèm /item/ như tai nghe, khăn tắm).
