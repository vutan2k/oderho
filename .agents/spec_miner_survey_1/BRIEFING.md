# BRIEFING — 2026-08-26T01:12:00Z

## Mission
Extract exhaustive specifications, architecture requirements, edge cases, and 4-tier test harness integration for the Guest Order Status & Tracking Bar (Tra Cứu Tiến Độ Đơn Hàng Không Cần Đăng Nhập) on TAVY Korea customer Home Page.

## 🔒 My Identity
- Archetype: spec_miner
- Roles: Specification Miner, Test Suite Architect, Quality Assurance Analyst
- Working directory: /Users/tan/Downloads/tavy/.agents/spec_miner_survey_1
- Original parent: f7c223dd-7c77-4fd9-8d1a-a866c5f90f91
- Milestone: Survey & Specification Extraction

## 🔒 Key Constraints
- Read-only investigation: do NOT implement code or modify application source files.
- Deliver exhaustive coverage of R1, R2, R3, R4.
- Enumerate 4-tier test harness (Tier 1: Feature Coverage, Tier 2: Boundary & Corner Cases, Tier 3: Pairwise Integration, Tier 4: Real-World Scenarios).
- Comply strictly with CLAUDE.md: Zero-Defect Policy, `npm run build` clean, `node tests/run_all_tests.js` 100% pass, Ivory & Gold/Purple design system.
- Produce self-contained `handoff.md` with 5 standard sections (Observation, Logic Chain, Caveats, Conclusion, Verification Method).

## Current Parent
- Conversation ID: f7c223dd-7c77-4fd9-8d1a-a866c5f90f91
- Updated: 2026-08-26T01:12:00Z

## Task Summary
- **What to build**: Transform legacy product search into an intuitive Guest Order Status & Tracking Bar on `KROrderHomePage.jsx` with real-time 8-step visual timeline, phone/order ID lookup, multi-order toggle, quote details, shipping proof hub, and zero-login access.
- **Success criteria**: 
  - Valid phone or Order ID immediately reveals 8-step timeline & status card.
  - Multi-order switching supported for matching phone numbers.
  - Friendly not-found and validation error messages.
  - Clean dismiss / reset to catalog browse mode.
  - Production build (`npm run build`) passes cleanly.
  - Automated tests (`node tests/run_all_tests.js`) pass 100%.
- **Interface contracts**: `src/data/orderStatuses.js`, `src/context/AppContext.js`, `src/services/dbService.js`, `src/pages/KROrderHomePage.jsx`.
- **Code layout**: React 19 / Vite 8 SPA in `src/`, automated tests in `tests/`.

## Key Decisions Made
- Discovered and analyzed all 188 existing tests across 4 tiers.
- Confirmed 8-step order fulfillment sequence (`pending` -> `deposit_paid` -> `confirmed` -> `purchased` -> `packed_kr` -> `in_transit_air` -> `customs_cleared` -> `completed`).
- Extracted normalization algorithms for Vietnamese phone numbers and case-insensitive Order IDs.
- Designed comprehensive 4-tier test specifications covering all happy and edge paths.

## Artifact Index
- `/Users/tan/Downloads/tavy/.agents/spec_miner_survey_1/DISPATCH.md` — Initial assignment recording
- `/Users/tan/Downloads/tavy/.agents/spec_miner_survey_1/BRIEFING.md` — Situational awareness & memory
- `/Users/tan/Downloads/tavy/.agents/spec_miner_survey_1/progress.md` — Heartbeat & task progress log
- `/Users/tan/Downloads/tavy/.agents/spec_miner_survey_1/handoff.md` — Final 5-component handoff report
