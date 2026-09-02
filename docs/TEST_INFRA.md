# E2E Test Infra: Tavy Korea Smart Product Research Tab

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.
- Architecture: Zero-dependency Node ESM test runner (`tests/framework/runner.js`, `assert.js`, `loader.js`).

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|---------------------|:------:|:------:|:------:|:------:|
| F1 | Rule 0 Compliance & Zero Fake Data | ORIGINAL_REQUEST §R7 | 5 | 5 | ✓ | ✓ |
| F2 | Smart Input Box (URL auto-detect) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| F3 | Smart Input Box (Image & Vision) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| F4 | Multi-Source Scraper Cascade | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| F5 | HD Image Extraction & Filtering | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| F6 | Real User Review Photo Collection | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| F7 | 10 Required Fields Validation | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |
| F8 | Live Step-by-Step Log Console | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ | ✓ |
| F9 | Auto-Save to Pending Queue | ORIGINAL_REQUEST §R6 | 5 | 5 | ✓ | ✓ |
| F10 | UI Tab 4 Navigation & Integration | ORIGINAL_REQUEST §UI/UX | 5 | 5 | ✓ | ✓ |

## Test Architecture
- Test runner: `node tests/run_all_tests.js`
- Test files to add/update:
  - `tests/tier1/f23_smart_product_research.test.js`: Feature isolation tests for domain detection, vision payload, multi-source routing, 10-field output, Rule 0 zero fake data assertions.
  - `tests/tier2/f23_smart_product_research_boundary.test.js`: Boundary cases: invalid URLs, corrupt images, WAF 403 fallback cascade, missing fields handling (`photoReviews: []`, `ingredients: []`), network timeouts.
  - `tests/tier3/pairwise_integration_test.js`: Tab 4 interaction + Pending queue auto-save (`F23+F3` & `F23+F16`).
  - `tests/tier4/application_scenarios_test.js`: `SCENARIO-11` (End-to-end admin workflow: Korean URL input -> multi-source scraping -> review photo extraction -> pending queue review -> approval).

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 11 | Smart Sourcing & Deep Review Pipeline | F1, F2, F3, F4, F5, F6, F7, F8, F9, F10 | High |

## Coverage Thresholds
- Tier 1: >=5 per feature (Total: 8+ dedicated tests in F23)
- Tier 2: >=5 per feature (Total: 8+ dedicated boundary tests in F23)
- Tier 3: Pairwise coverage of major feature interactions
- Tier 4: Complete end-to-end admin workflow scenario
