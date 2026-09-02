# TEST_READY: Tavy Korea E2E Test Suite Specification & Status

**Status**: READY (278 / 278 Tests Passing, 100% Zero-Defect)  
**Execution Command**: `node tests/run_all_tests.js`  
**Test Framework**: Zero-Dependency Node ESM Test Harness (`tests/framework/runner.js`, `assert.js`, `loader.js`)

---

## 1. Test Suite Architecture & Summary

| Tier | Focus | Test Files | Total Tests | Status |
|---|---|---|:---:|:---:|
| **Tier 1** | Feature Isolation & Functional Coverage | 24 files (`f01` - `f23`, `smoke_test`) | 135 | **PASS (135/135)** |
| **Tier 2** | Boundary Values & Error Cascade | 19 files (`f01_boundary` - `f23_boundary`, `smoke_test`) | 108 | **PASS (108/108)** |
| **Tier 3** | Cross-Feature Pairwise Integration | `tests/tier3/pairwise_integration_test.js` | 23 | **PASS (23/23)** |
| **Tier 4** | Real-World Application End-to-End Scenarios | `tests/tier4/application_scenarios_test.js` | 12 | **PASS (12/12)** |
| **TOTAL** | **Full System E2E Coverage** | **45 test files** | **278** | **PASS (278/278)** |

---

## 2. Feature 23: Smart Product Research (Tab 4) Test Coverage

### Tier 1: Unit & Functional Coverage (`tests/tier1/f23_smart_product_research.test.js`)
- `[F23-01]` **Smart URL domain auto-detection**: Recognizes all 7 Korean e-commerce platforms (`oliveyoung`, `naver`, `coupang`, `hwahae`, `gmarket`, `11st`, `musinsa`), desktop & mobile URL patterns, direct goodsNo inputs, and keyword inputs.
- `[F23-02]` **OliveYoung goodsNo extractor**: Accurately extracts and standardizes 12-char goodsNo (e.g. `A000000223414`, `A000000185934`), handles lowercase normalization and URL hash anchors.
- `[F23-03]` **Image upload & Gemini Vision payload builder**: Builds structured multimodal payload (`inlineData`, mime types `image/jpeg`, `image/png`, `image/webp`), enforces JSON schema output, and rejects invalid file types.
- `[F23-04]` **Quality-first multi-source fallback cascade order**: Strictly enforces quality priority `['oliveyoung', 'naver', 'coupang', 'hwahae', 'gmarket', '11st', 'musinsa']` with automatic advancement on failure.
- `[F23-05]` **10 required fields structure verification**: Validates `name`, `nameKr`, `brand`, `foreignPrice` (> 0), `productImage` (valid URL), `images` (>= 1 HD), `photoReviews` (`[]` or genuine reviews), `ingredients` (`[]` or string array), `description`, and `rating` + `reviewsCount`.
- `[F23-06]` **Rule 0 Compliance (Zero Fake Data)**: Verifies honest defaults (`reviewsCount: 0`, `rating: 0`, `photoReviews: []`), statically audits source code to guarantee zero `Math.random()` fake generation.
- `[F23-07]` **HD image CDN cleaning & junk banner filtering**: Strips `RS=64x0` compression queries, upgrades quality to `QT=100`, upgrades Naver CDN to `type=f800`, filters promo banners, free gift towels/cups, icons, and badges.
- `[F23-08]` **Real user review photo collection**: Collects genuine customer unboxing/review photos (`gdasEditor`, Naver Pay, Hwahae) and cleanly returns `[]` without throwing when none exist.

### Tier 2: Boundary & Corner Cases (`tests/tier2/f23_smart_product_research_boundary.test.js`)
- `[F23-B01]` **Invalid / unsupported URL rejection**: Gracefully handles empty, null, undefined strings, foreign platforms (Amazon, Shopee), and unsupported links.
- `[F23-B02]` **Corrupt / oversized / invalid image file handling**: Enforces 10MB file size ceiling, rejects non-image mime types (`application/pdf`, `text/plain`).
- `[F23-B03]` **Source WAF 403 / 500 error cascade**: Gracefully catches HTTP 403/500 errors on primary sources (e.g. Olive Young WAF block) and advances to Naver without crashing.
- `[F23-B04]` **Multi-loop retry (max 3 loops per source)**: Retries transient network failures up to 3 times per source before cascading to next fallback source.
- `[F23-B05]` **Missing optional fields (`photoReviews: []`, `ingredients: []`)**: Ensures scraper output remains valid and safe without throwing when optional sections are missing.
- `[F23-B06]` **Missing required fields trigger cascade**: Missing prices (`0`) or empty product titles trigger automatic switch to the next fallback source.
- `[F23-B07]` **Timeout / network abort handling**: Uses `AbortSignal` with timeout handling to prevent hanging requests.
- `[F23-B08]` **Special Korean characters & HTML entity escaping**: Decodes HTML entities (`&amp;`, `&quot;`, `&#39;`, `&lt;`, `&gt;`) and cleans promo brackets (`[1+1]`, `[단독기획]`).

### Tier 3: Pairwise Integration (`tests/tier3/pairwise_integration_test.js`)
- `[T20-PAIR-20]` **F23+F03**: Smart Product Research output auto-saves to AppProvider `addPendingProduct()`, properly entering `pending_products` collection with status `pending_review`.
- `[T21-PAIR-21]` **F23+F16**: Smart Product Research multi-source cascade integrates with Scraper Quality Engine validation (price bounds, CDN HD check, Rule 0 compliance).
- `[T22-PAIR-22]` **F23+F10**: Smart Input domain auto-detection streams real-time step logs with timestamps `[HH:mm:ss]` into Live Log Console.

### Tier 4: Real-World Application Scenario (`tests/tier4/application_scenarios_test.js`)
- `[SCENARIO-11]` **Smart Product Research & Real Review Sourcing Workflow**: End-to-end admin workflow starting from URL input on Tab 4 -> auto-detection -> multi-source scraping -> review photo extraction -> 10-field validation -> auto-save to pending queue -> admin review on 'pending' tab -> approval into published catalog.

---

## 3. How to Run the Tests

```bash
# Execute entire test suite across all 4 tiers
node tests/run_all_tests.js

# Run individual test files with Node ESM
node --loader ./tests/framework/loader.js tests/tier1/f23_smart_product_research.test.js
node --loader ./tests/framework/loader.js tests/tier2/f23_smart_product_research_boundary.test.js
```

---

## 4. Test Verification Report

- **Total Test Cases**: 278
- **Passed**: 278
- **Failed**: 0
- **Execution Time**: ~2.5 seconds
- **Zero Mock / Zero Fake Data (Rule 0)**: Fully verified both statically and dynamically.
