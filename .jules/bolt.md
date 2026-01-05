## 2024-05-23 - Image Optimizer Slider Performance
**Learning:** React state updates on high-frequency events (like `mousemove` during drag operations) can cause performance bottlenecks if they trigger re-renders of large component trees.
**Action:** Extract the interactive element (slider) into a separate component to isolate the state and re-renders, preventing the entire parent component (with complex UI like sidebars) from re-rendering on every frame.
