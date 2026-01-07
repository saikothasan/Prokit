## 2024-05-23 - Image Optimizer Slider Performance
**Learning:** React state updates on high-frequency events (like `mousemove` during drag operations) can cause performance bottlenecks if they trigger re-renders of large component trees.
**Action:** Extract the interactive element (slider) into a separate component to isolate the state and re-renders, preventing the entire parent component (with complex UI like sidebars) from re-rendering on every frame.
## 2024-05-23 - React Component Optimization
**Learning:** Defining components inside other components (like `CustomTooltip` inside `TestAgent`) causes unnecessary unmounting and remounting on every render, hurting performance. Moving them outside and using `useMemo` for derived data significantly improves render efficiency.
**Action:** Always define helper components outside the main component function and memoize expensive calculations.
