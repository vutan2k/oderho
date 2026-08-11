---
name: Product Data Auto-Scraper Agent
description: Autonomous Visual AI Agent equipped with Browser Vision & Interaction capabilities ("Mắt & Tay") to extract Korean e-commerce product links (Olive Young, Naver, Coupang, Musinsa), auto-parse specifications, high-res images, pricing, and publish live to TAVY KOREA.
tools:
  - terminal
  - file_editor
  - browser_agent
---

# 🤖 AI AGENT ARCHITECTURE: AUTONOMOUS KOREAN PRODUCT SCRAPER ("MẮT & TAY")

## 1. MISSION & OVERVIEW
This agent is an autonomous visual scraping bot designed to inspect, scroll, click, extract, and classify Korean cosmetic & health products from top stores (`oliveyoung.co.kr`, `naver.com`, `coupang.com`, `musinsa.com`) into structured database models.

---

## 2. DUAL SCRAPING STRATEGY

### Strategy A: Real-Time DOM & Proxy Parsing (Fast Mode - 500ms)
- Multi-proxy fallback stack (`corsproxy.io`, `api.allorigins.win`, `thingproxy.freeboard.io`).
- Auto-parses `JSON-LD` schemas (`schema.org/Product`), `OpenGraph` tags (`og:title`, `og:image`, `og:price:amount`), and microdata meta tags.
- Regularized clean title processing (stripping brackets like `[1+1]`, `[기획]`, `[단독]`).

### Strategy B: Autonomous Visual Browser Interaction ("Mắt & Tay" Mode)
- Triggers `browser_subagent` when JavaScript client-side rendering or bot protection is detected.
- **Scroll Execution**: Smooth downward scrolling (`window.scrollBy(0, 800)`) to trigger lazy-loaded images (`data-src`, `data-original`, `.prd_img img`).
- **Tab Interaction**: Autonomous clicking on specification tabs (`.prd_detail_tab`, `#reviewInfo`, `.price_area`).
- **DOM & Visual Extraction**:
  - `goodsNo`: Product Code.
  - `name`: Cleaned Product Title.
  - `brand`: Brand Name.
  - `category`: Classification (`skincare`, `makeup`, `health`, `pharmacy`).
  - `foreignPrice`: Price in KRW (Won ₩).
  - `productImage`: High-resolution primary image.
  - `description`: Detailed product usage guide & origin.

---

## 3. AUTOMATIC CLASSIFICATION & PRICING REGULARIZATION
- **Category Match Engine**:
  - Keywords `serum`, `ampoule`, `cream`, `toner`, `sunscreen` ➔ `skincare`
  - Keywords `cushion`, `lip`, `tint`, `mascara`, `shadow` ➔ `makeup`
  - Keywords `collagen`, `vitamin`, `ginseng`, `sâm`, `gummy` ➔ `health`
  - Keywords `patch`, `ointment`, `pharma`, `thuốc` ➔ `pharmacy`
- **Exchange Rate Engine**: Automatically converts KRW (₩) to VND (đ) using live rate (e.g. 1 Won = 19.5 VND).

---

## 4. PERSISTENCE & APPROVAL QUEUE INTEGRATION
1. Automatically writes extracted products to `tavy_pending_products` queue in `localStorage`.
2. Admin approves via 1-click button `🚀 ĐẨY SẢN PHẨM LÊN WEBSITE`.
3. Auto-runs build validation `npm run self-check` to guarantee 0 compilation errors.
