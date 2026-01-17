## 2024-05-23 - Image Optimizer Slider Performance
**Learning:** React state updates on high-frequency events (like `mousemove` during drag operations) can cause performance bottlenecks if they trigger re-renders of large component trees.
**Action:** Extract the interactive element (slider) into a separate component to isolate the state and re-renders, preventing the entire parent component (with complex UI like sidebars) from re-rendering on every frame.

## 2024-05-24 - Quality Slider Re-render Optimization
**Learning:** Controlled inputs (like range sliders) in large parent components cause the entire parent to re-render on every `onChange` event (every pixel of drag).
**Action:** Use `useRef` in the parent for data that is only needed on submission, and extract the controlled input into a child component that manages its own display state. This isolates the high-frequency re-renders to the small child component.
