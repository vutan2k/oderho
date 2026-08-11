---
name: autonomous-self-correction-loop
description: Autonomous Task Execution & Continuous Self-Correction Verification Loop. Ensures AI agents run build/lint checks, inspect console/UI logs, detect runtime errors, and auto-correct iteratively until 100% bug-free.
---

# SKILL: Autonomous Execution & Self-Correction Verification Loop

## 1. Core Verification Loop Standard (Rule-Driven Execution)
Whenever executing any task or code change, ALWAYS follow this 4-step autonomous loop:

```
[Write/Edit Code] ➔ [Build & Lint Check] ➔ [Inspect Runtime Logs/UI] ➔ [Self-Correct if Error]
       ▲                                                                       │
       └─────────────────────────── (Repeat until 0 Errors) ───────────────────┘
```

## 2. Mandatory Verification Protocol Steps
1. **Pre-flight Check:** Run `npm run lint` or type check after code updates.
2. **Production Build Verification:** Run `npm run build` to confirm zero compilation or bundler failures.
3. **Runtime & UI Inspection:**
   - Launch dev server if needed (`npm run dev`).
   - Check console output & terminal logs for unhandled exceptions (ReferenceError, TypeError, SyntaxError).
   - Capture UI screenshots across standard viewports (Desktop 1440px, Mobile 375px) to verify responsive alignment.
4. **Self-Correction Loop:**
   - If ANY lint error, build failure, broken image, or layout misalignment is detected:
     1. Analyze log trace immediately.
     2. Apply targeted code fix.
     3. Re-run verification until 0 errors remain.
   - NEVER declare completion until empirical verification succeeds.

## 3. Automation Helper Script
You can trigger the automated verification script:
`npm run lint && npm run build`
