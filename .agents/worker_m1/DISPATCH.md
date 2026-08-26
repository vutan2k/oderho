## 2026-08-26T01:13:55Z
You are Worker 1 for Milestone M1 (Search & Lookup Data Service).
Working directory: /Users/tan/Downloads/tavy/.agents/worker_m1
Original Request: /Users/tan/Downloads/tavy/.agents/ORIGINAL_REQUEST.md
Scope Document: /Users/tan/Downloads/tavy/PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Task:
1. Read /Users/tan/Downloads/tavy/.agents/ORIGINAL_REQUEST.md and /Users/tan/Downloads/tavy/PROJECT.md.
2. Review findings in /Users/tan/Downloads/tavy/.agents/explorer_survey_2/handoff.md and /Users/tan/Downloads/tavy/.agents/spec_miner_survey_1/handoff.md.
3. Create `/Users/tan/Downloads/tavy/src/services/guestTrackingService.js` containing:
   - `normalizePhone(rawPhone)`: Robust phone normalization converting Vietnamese formats (+84, 84, spaces, dashes, parentheses, missing leading 0) to clean 10-digit format (e.g. `0912345678`), handling edge cases.
   - `findGuestOrders(searchTerm, ordersList)`: Case-insensitive Order ID matching (with `ORD-`, `ord-`, or numeric only), normalized phone number matching (`customerPhone`, `phone`), and tracking code matching (`trackingCode`, `domesticTrackingCode`). Returns matching orders sorted by `createdAt` descending (newest first).
   - `calculateStepProgress(order, orderStatuses)`: Helper calculating current step index (0 to 7, or -1 for cancelled) and progress bar percentage `${((currentStep + 1) / 8) * 100}%`.
   - `getProofBadges(order)`: Helper extracting proof media URLs (POV video, bill store image, packing video, package weight, air AWB, domestic tracking code).
4. Run `node tests/run_all_tests.js` and `npm run build` to verify that there are zero regressions and zero syntax/build errors.
5. Document all changes and test outputs in `/Users/tan/Downloads/tavy/.agents/worker_m1/handoff.md` and send a message back when complete.
