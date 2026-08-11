---
name: fullstack-web-dev
description: Full-Stack Web Development & Visual Standards. Guidelines for building UI/UX, responsive layouts, modular React components, and visual verification protocols.
---

# SKILL: Full-Stack Web Development & Visual Precision

## 1. Frontend & Layout Safety Rules
- ALWAYS use modern layout systems (Tailwind CSS, Flexbox, or CSS Grid). Avoid hardcoded absolute pixel positioning for main content layouts.
- Always include responsive breakpoints (sm:, md:, lg:) when building layout structures.
- Components MUST be modularized in single files under `src/components/`. Avoid writing monolithic 500-line JSX files.
- Before suggesting UI fixes, check existing CSS variables / theme configs (`tailwind.config.js` or `globals.css`) to maintain design consistency.

## 2. Visual Verification Protocol
- After updating any UI component, use the Browser Agent / MCP Browser to open `http://localhost:[PORT]` and capture a screenshot.
- Inspect padding, margin, and alignment against the design request before marking the task complete.
- If an element is misaligned, extract the Computed CSS from the browser inspector log instead of guessing utility classes.
