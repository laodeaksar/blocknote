---
name: iOS Safari transform hit-testing
description: translateX(-50%) centering on fixed elements breaks touch event hit-testing on iOS Safari — touch area stays at pre-transform position
---

## Rule
Never use `transform: translateX(-50%)` to center a fixed-position interactive element. Use a flex centering wrapper instead.

**Why:** iOS Safari performs touch-event hit-testing at the element's **pre-transform** (untransformed) position. So `left: 50%; transform: translateX(-50%)` visually centers the element, but touch events only fire when tapping at `left: 50%` (right half of screen). The visual pill bar is centered but untappable — gives zero feedback.

**How to apply:** Any time a fixed element is centered with `translateX(-50%)` AND needs to receive touch events:
```jsx
{/* Outer: flex centering — no transform */}
<div className="fixed bottom-6 left-0 right-0 flex justify-center z-[9999]">
  {/* Inner: only scale() — center point stays fixed */}
  <div style={{ transform: `scale(${open ? 0.92 : 1})`, touchAction: "manipulation" }}>
    {/* buttons */}
  </div>
</div>
```

Also: do NOT put `pointer-events: none` on the outer wrapper even if it has no handlers — iOS Safari does not forward touch events from `pointer-events: none` parents to `pointer-events: auto` children (another Safari bug).

**Related:** The mobile sidebar also portals backdrop+sheet to `document.body` (via `createPortal`) to bypass `overflow: hidden` ancestor containers that can break fixed-position touch events on iOS.
