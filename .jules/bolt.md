## 2024-05-23 - Image Optimizer Slider Performance
**Learning:** React state updates on high-frequency events (like `mousemove` during drag operations) can cause performance bottlenecks if they trigger re-renders of large component trees.
**Action:** Extract the interactive element (slider) into a separate component to isolate the state and re-renders, preventing the entire parent component (with complex UI like sidebars) from re-rendering on every frame.

## 2025-02-18 - Heavy Chart Library Bundle Splitting
**Learning:** Large visualization libraries like `recharts` can significantly bloat component bundle size, delaying hydration even if the charts aren't immediately visible (e.g., in tabs).
**Action:** Extract heavy chart components into separate files and use `next/dynamic` to split them into separate chunks, allowing the main interface to load instantly.
