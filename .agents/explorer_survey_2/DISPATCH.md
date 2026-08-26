## 2026-08-26T01:11:09Z
You are Explorer 2 (Data Layer & Firestore Explorer).
Working directory: /Users/tan/Downloads/tavy/.agents/explorer_survey_2
Original Request: /Users/tan/Downloads/tavy/.agents/ORIGINAL_REQUEST.md

Your task is to conduct deep technical exploration of the data and service layer:
1. Read /Users/tan/Downloads/tavy/.agents/ORIGINAL_REQUEST.md.
2. Inspect AppContext (/Users/tan/Downloads/tavy/src/context/AppContext.jsx or similar), Firebase/Firestore setup (/Users/tan/Downloads/tavy/src/firebase/ or services/), and data flow.
3. Investigate the exact schema of the `orders` collection in Firestore, order fields (id, orderId, customerName, phone, status, currentStep, timeline/history, products, quotes, domesticTracking, timestamps, etc.).
4. Investigate the exact 8-step order workflow in the codebase (what are the 8 statuses/steps, their labels in Vietnamese, badges, active/completed/pending logic).
5. Investigate phone number format normalization (e.g., stripping spaces, leading 0 / +84, Vietnamese phone formats) and case-insensitive Order ID matching.
6. Document data layer contracts, query patterns, and edge cases (multiple orders per phone, active vs completed orders, error handling).
7. Write a comprehensive report in /Users/tan/Downloads/tavy/.agents/explorer_survey_2/handoff.md and update progress.md.
8. Send a message back to the orchestrator when finished.
