---
name: Tailwind v4 PostCSS CSS relative colors
description: CSS relative color syntax oklch(from ...) causes silent PostCSS production build failure when used in globals.css with @tailwindcss/postcss.
---

**Rule:** Do not use CSS Relative Color Syntax (`oklch(from <color> l c h / alpha)`) in `globals.css` or any CSS file processed by `@tailwindcss/postcss`. Use `color-mix()` instead.

**Why:** `oklch(from var(...) l c h / 0.12)` is CSS Color Level 4 relative color syntax. Turbopack (dev mode) handles it natively and silently, but the `@tailwindcss/postcss` PostCSS plugin in production Webpack builds either fails to parse it or emits an error that Webpack catches silently — resulting in an **empty CSS output**. The site deploys successfully but with zero styling applied.

**How to apply:**
- Replace `oklch(from var(--color) l c h / 0.12)` → `color-mix(in srgb, var(--color) 15%, transparent)`
- `color-mix()` is fully supported by PostCSS v8+ and all modern browsers
- This bug is insidious: dev looks fine (Turbopack), production is completely unstyled
