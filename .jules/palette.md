# Palette's Journal

## 2025-05-18 - Accessibility in Custom UI Components

**Learning:** When building custom UI components like "Tool Cards" that are wrapped in a single `Link`, multiple interactive or informational elements inside can confuse screen readers.
- Decorative icons should be aggressively hidden (`aria-hidden="true"`).
- Status indicators (like pulsing dots) need non-visual labels (`sr-only` text or `aria-label`).
- "Visual-only" text like "RDY" should be replaced with full words ("Status: Ready") for screen readers.

**Action:** For all future card components, audit the "screen reader story" - what is the full text content read out? Add `sr-only` text to clarify status or metadata that is communicated purely visually.
