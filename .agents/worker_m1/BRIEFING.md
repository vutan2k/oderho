# BRIEFING — 2026-08-26T01:17:00Z

## Mission
Implement `src/services/guestTrackingService.js` for Milestone M1 (Search & Lookup Data Service) with robust phone normalization, case-insensitive Order ID matching, multi-order sorting, step progress calculation, and proof badges extraction.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: /Users/tan/Downloads/tavy/.agents/worker_m1
- Original parent: f7c223dd-7c77-4fd9-8d1a-a866c5f90f91
- Milestone: M1 (Search & Lookup Data Service)

## 🔒 Key Constraints
- Genuine implementation with no hardcoding or dummy facades.
- Must pass `node tests/run_all_tests.js` and `npm run build` with zero regressions and zero errors.
- Minimal change principle.

## Current Parent
- Conversation ID: f7c223dd-7c77-4fd9-8d1a-a866c5f90f91
- Updated: 2026-08-26T01:17:00Z

## Task Summary
- **What to build**: `src/services/guestTrackingService.js` providing `normalizePhone`, `findGuestOrders`, `calculateStepProgress`, `getProofBadges`.
- **Success criteria**: Comprehensive unit and boundary tests passing, 0 build errors, robust handling of all edge cases.
- **Interface contracts**: PROJECT.md § Interface Contracts.
- **Code layout**: `src/services/guestTrackingService.js`.

## Key Decisions Made
- Implemented `normalizePhone(rawPhone)` supporting all Vietnamese formats (+84, 84, 840, spaces, dashes, parentheses, missing leading 0).
- Implemented `findGuestOrders(searchTerm, ordersList)` supporting exact & substring Order IDs, prefix-stripped IDs, normalized phones, domestic tracking codes, Air AWBs, and flight codes, returning orders sorted newest first (`createdAt` descending).
- Implemented `calculateStepProgress(order, orderStatuses)` calculating stepIndex (0 to 7, -1 for cancelled) and percentage string `${((currentStep + 1) / 8) * 100}%`.
- Implemented `getProofBadges(order)` extracting POV video, store bill, packing video, package weight, flight code, Air AWB, and domestic tracking codes.
- Added comprehensive Tier 1 unit tests (`[F6-6]` to `[F6-9]`) and Tier 2 boundary tests (`[F6-B6]` to `[F6-B8]`).

## Artifact Index
- `/Users/tan/Downloads/tavy/src/services/guestTrackingService.js` — Core guest tracking lookup and normalization service.
- `/Users/tan/Downloads/tavy/tests/tier1/f06_order_tracking.test.js` — Unit tests for guestTrackingService functions.
- `/Users/tan/Downloads/tavy/tests/tier2/f06_order_tracking_boundary.test.js` — Boundary & edge tests for guestTrackingService.

## Change Tracker
- **Files modified**:
  - `src/services/guestTrackingService.js` (Created service)
  - `tests/tier1/f06_order_tracking.test.js` (Added unit tests)
  - `tests/tier2/f06_order_tracking_boundary.test.js` (Added boundary tests)
- **Build status**: PASS (195/195 tests PASS, Vite build 0 errors in 579ms)
- **Pending issues**: None

## Quality Status
- **Build/test result**: 195/195 PASS across all 4 Tiers (Exit code 0)
- **Lint status**: 0 errors, 0 warnings on modified files
- **Tests added/modified**: 7 new test cases ([F6-6]..[F6-9], [F6-B6]..[F6-B8])

## Loaded Skills
- **Source**: fullstack-web-dev, autonomous-self-correction-loop
- **Core methodology**: Quality-driven development, continuous verification, robust error handling.
