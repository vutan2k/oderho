# Project: Tavy Korea Smart Product Research Tab & Multi-Source Engine

## Architecture
- **Framework**: React 19 + Vite + Tailwind CSS + Node ESM Testing Harness.
- **Service Layer**:
  - `src/services/aiScraperAgentEngine.js`: Olive Young Jina AI Reader + AI extraction (Rule 0 remediated).
  - `src/services/naverHealthScraperEngine.js`: Naver Brand Store / SmartStore scraper.
  - `src/services/oliveYoungScraperCore.js`: CDN image cleaning & junk filtering algorithms.
  - `src/services/smartProductResearchEngine.js`: Unified multi-source scraper cascade (OliveYoung, Naver, Coupang, Hwahae, Gmarket, 11st, Musinsa) + Gemini Vision OCR/multimodal search + quality-first 3-loop fallback.
- **UI Layer**:
  - `src/components/AdminProductResearchTab.jsx`: Modular Tab 4 component containing Smart Input Box (URL auto-detect vs Drag & Drop image upload), Live Step-by-Step Log Console (dark slate, auto-scrolling terminal), Product Preview Card, and auto-save handler.
  - `src/components/AdminProductSourcing.jsx`: Navigation bar integration with Tab 4 button (`activeSubTab === 'research'`), badge `MULTI-SOURCE`, and routing to `<AdminProductResearchTab />`.
- **State & Storage**:
  - `src/context/AppProvider.jsx`: `addPendingProduct(product)` for auto-queueing scraped items to Firestore / localStorage pending queue.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Rule 0 Compliance | Remove `Math.random()`, hardcoded `rating: 4.9`, fake `reviewsCount`, ensure honest defaults | M1 | Survey / R7 |
| F2 | Smart Input Box (URL) | Auto-detect 7 Korean domains (oliveyoung, naver, coupang, hwahae, gmarket, 11st, musinsa) & goodsNo | M2, M3 | Survey / R1 |
| F3 | Smart Input Box (Image) | Drag & drop + file picker + paste image upload, base64 compression & Gemini Vision analysis | M2, M3 | Survey / R1 |
| F4 | Multi-Source Scraper Cascade | Quality-first 3-loop fallback across 7 Korean e-commerce/review sources | M2 | Survey / R2 |
| F5 | HD Image Extraction | 3-8 HD product images from original CDNs, filtering junk banners/logos/gifts | M2 | Survey / R3 |
| F6 | Real User Review Photos | 2-10 genuine user review photos (GDAS, Naver Pay, Hwahae), no junk/gift, fallback to `[]` with log | M2 | Survey / R3 |
| F7 | 10 Required Fields Capture | `name`, `nameKr`, `brand`, `foreignPrice`, `productImage`, `images`, `photoReviews`, `ingredients`, `description`, `rating` + `reviewsCount` | M2 | Survey / R4 |
| F8 | Live Step-by-Step Log Console | Dark Slate terminal UI with auto-scroll, pipeline stepper, colored source badges, timestamp `[HH:mm:ss]` | M3 | Survey / R5 |
| F9 | Auto-Save to Pending Queue | Auto-dispatch `addPendingProduct()` on success, navigate/link to 'pending' sub-tab | M3 | Survey / R6 |
| F10 | UI Integration in Sourcing | Tab 4 button in `AdminProductSourcing.jsx` navbar, clean modular component mounting | M3 | Survey / R1-R6 |
| F11 | E2E Test Suite (Tiers 1-4) | Comprehensive Node ESM test coverage: Feature (T1), Boundary (T2), Pairwise (T3), Real-World (T4) | E2E Track / M4 | Survey / Acceptance |
| F12 | Adversarial Hardening (Tier 5) | White-box stress testing, coverage gap audit, adversarial test cases | M4 | Survey / Pattern |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Suite Track | Design & implement Tiers 1-4 tests (`f23_smart_product_research.test.js`, boundary, pairwise, scenario), publish `TEST_READY.md` | none | DONE |
| M1 | Rule 0 Remediation & Integrity Fixes | Clean all fake data / `Math.random` / hardcoded ratings across scrapers, establish honest fallbacks | none | DONE |
| M2 | Smart Product Research Engine & Vision Service | Implement `src/services/smartProductResearchEngine.js` with multi-source cascade, Gemini Vision, HD images & review photo collection | M1 | DONE |
| M3 | UI Component & Tab 4 Integration | Implement `src/components/AdminProductResearchTab.jsx` and integrate into `src/components/AdminProductSourcing.jsx` | M2 | DONE |
| M4 | Final Milestone E2E & Adversarial Hardening | Phase 1: 100% E2E tests passing (278/278). Phase 2: Adversarial coverage hardening (Tier 5 & stress harnesses) | M3, E2E | DONE |

## Interface Contracts
### `smartProductResearchEngine.js` ↔ `AdminProductResearchTab.jsx`
- `detectInputType(input: string | File): { type: 'url' | 'image' | 'keyword', domain?: string, goodsNo?: string, normalizedInput: string }`
- `analyzeProductImage(file: File | string, onProgress?: (msg: LogEntry) => void): Promise<{ detectedProduct: string, brand?: string, searchKeywords: string[] }>`
- `researchProduct(input: string | File, options?: { onProgress?: (log: LogEntry) => void }): Promise<ScrapeResult>`
- `ScrapeResult`:
  ```typescript
  {
    success: boolean;
    source: 'oliveyoung' | 'naver' | 'coupang' | 'hwahae' | 'gmarket' | '11st' | 'musinsa' | 'vision';
    data: {
      name: string;             // Vietnamese translation
      nameKr: string;           // Original Korean name
      brand: string;            // Brand name
      foreignPrice: number;     // KRW price (sale price prioritized, > 0)
      productImage: string;     // Primary HD image URL
      images: string[];         // 3-8 HD product images
      photoReviews: string[];   // 2-10 genuine user review photos (or [] if none)
      ingredients: string[];    // Ingredients in VN/KR (or [] if none)
      description: string;      // Vietnamese description + benefits
      rating: number;           // Actual rating (0-5)
      reviewsCount: number;     // Actual count (>= 0)
      goodsNo?: string;
      originUrl?: string;
    };
    logs: LogEntry[];
    warnings: string[];
  }
  ```

### `AdminProductResearchTab.jsx` ↔ `AppProvider.jsx` / `AdminProductSourcing.jsx`
- Props for `AdminProductResearchTab`:
  - `isDark: boolean`
  - `rates: { KRW: number, USD: number }`
  - `addPendingProduct: (product: object) => Promise<boolean>`
  - `showToast?: (msg: string, type?: string) => void`
  - `onNavigateToPending?: () => void`

## Code Layout
- `src/services/aiScraperAgentEngine.js` (Cleaned Rule 0)
- `src/services/naverHealthScraperEngine.js` (Cleaned Rule 0)
- `src/services/oliveYoungScraperCore.js` (Cleaned Rule 0)
- `src/services/smartProductResearchEngine.js` (New unified multi-source & vision engine)
- `src/components/AdminProductResearchTab.jsx` (New Tab 4 component)
- `src/components/AdminProductSourcing.jsx` (Tab 4 navigation & mount)
- `tests/tier1/f23_smart_product_research.test.js` (Tier 1 tests)
- `tests/tier2/f23_smart_product_research_boundary.test.js` (Tier 2 tests)
- `tests/tier3/pairwise_integration_test.js` (Tier 3 integration)
- `tests/tier4/application_scenarios_test.js` (Tier 4 scenario)
