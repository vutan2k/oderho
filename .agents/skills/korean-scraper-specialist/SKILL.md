---
name: korean-scraper-specialist
description: "Chuyên gia bóc tách dữ liệu mỹ phẩm và thực phẩm chức năng từ 7 sàn Hàn Quốc (Olive Young, Naver, Coupang, Hwahae, Musinsa, Gmarket, 11st). Kích hoạt khi nâng cấp engine cào dữ liệu hoặc lọc ảnh HD/review."
---

# SKILL: Korean Scraper Specialist (Multi-Source E-Commerce Engine)

Skill này hướng dẫn vận hành và bảo trì bộ cào dữ liệu đa nguồn từ các sàn thương mại điện tử Hàn Quốc.

---

## 🚀 Các Nguồn Dữ Liệu Hỗ Trợ:
1. **Olive Young**: Bóc tách chi tiết sản phẩm, ảnh HD từ CDN gốc, review GDAS.
2. **Naver Brand Store / SmartStore**: Lấy giá Won, ảnh gốc, mô tả sản phẩm.
3. **Coupang, Hwahae, Musinsa, Gmarket, 11st**: Multi-source cascade fallback.

---

## 🧹 Thuật Toán Lọc Ảnh Sạch 100%:
- **Loại trừ**: Chặn toàn bộ URL chứa `/display/`, `/event/`, `/banner/`, `/static/`, quà tặng kèm `/item/`.
- **Review thực**: Bóc tách ảnh chụp thực tế từ GDAS hoặc Naver Pay (loại bỏ tham số nén `RS=64x0`).
- **Thành phần & Mô tả**: Trích xuất trung thực qua Gemini Vision OCR, tuyệt đối không bịa đặt dữ liệu (RULE 0).

