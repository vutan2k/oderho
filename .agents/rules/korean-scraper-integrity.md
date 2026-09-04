# QUY CHUẨN BÓC TÁCH DỮ LIỆU NGUỒN HÀN QUỐC (KOREAN SCRAPER INTEGRITY)

> Áp dụng cho: Tác tử `korean-scraper-specialist` và các engine cào dữ liệu tại `src/services/`.

---

## 1. Bóc Tách Ảnh HD Sạch 100% (Zero Junk Images)
- **Ảnh sản phẩm HD**: Ưu tiên link CDN gốc, phân giải cao, bóc tách từ `#repImageContainer img`, `.prd_thumb_list img`.
- **Bộ lọc loại trừ tuyệt đối**:
  - Chặn 100% banner, logo, icon, ảnh khuyến mãi (`/display/`, `/event/`, `/banner/`, `/static/`).
  - Chặn ảnh quà tặng kèm không phải sản phẩm chính (`/item/` chứa túi xách, khăn, tai nghe...).

## 2. Ảnh Review Người Dùng Thực (Genuine User Reviews)
- Chỉ lấy ảnh đánh giá chụp sản phẩm thực tế của khách hàng (từ GDAS Olive Young, Naver Pay, Hwahae).
- Loại bỏ tham số nén thu nhỏ (ví dụ loại bỏ `RS=64x0`) để lấy ảnh gốc rõ nét.
- Nếu không có ảnh review hợp lệ: Fallback về mảng rỗng `[]` kèm log minh bạch, TUYỆT ĐỐI KHÔNG dùng ảnh giả.

## 3. Tuân Thủ Rule 0 Tuyệt Đối
- Không hardcode đánh giá (`rating: 4.9`), không fake số lượng review.
- Dùng Gemini Multimodal Vision và OCR để trích xuất trung thực thành phần (`ingredients`), mô tả công dụng (`description`) và thương hiệu tiếng Hàn.
