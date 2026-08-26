## 2026-08-26T01:11:09Z
You are Spec Miner 1 (Specification & Test Harness Miner).
Working directory: /Users/tan/Downloads/tavy/.agents/spec_miner_survey_1
Original Request: /Users/tan/Downloads/tavy/.agents/ORIGINAL_REQUEST.md

Your task is to extract exhaustive specifications, constraints, and test suite setup:
1. Read /Users/tan/Downloads/tavy/.agents/ORIGINAL_REQUEST.md.
2. Inspect package.json, build scripts (`npm run build`, vite/webpack config), and test runner setup (e.g., `tests/run_all_tests.js`, existing test files).
3. Extract all explicit and implicit requirements for:
   - R1: Guest Order Tracking Bar on Customer Home Page
   - R2: Visual 8-Step Timeline & Order Status Card Component
   - R3: Full-Stack Data & Firestore Lookup Integration
   - R4: Multi-order switching, phone normalization, error states, responsiveness, accessibility
4. Enumerate test cases across 4 tiers (Tier 1: Feature Coverage, Tier 2: Boundary & Corner Cases, Tier 3: Cross-Feature Combinations, Tier 4: Real-World Scenarios).
5. Document build/test commands, verification criteria, and test harness integration in /Users/tan/Downloads/tavy/.agents/spec_miner_survey_1/handoff.md.
6. Send a message back to the orchestrator when finished.
