---
name: formisch-react signals SSR bug
description: @formisch/react's signal-based isSubmitting reads as true during client hydration in Next.js canary, permanently disabling submit buttons
---

# @formisch/react signals SSR incompatibility

## The rule
Never use `formStore.isSubmitting` to control a button's `disabled` prop in Next.js (especially canary/v16). Use the React Query mutation's `isPending` instead.

## Why
`@formisch/react` uses a custom signal system with a global `listener` variable. During client-side hydration in Next.js 16 canary, the signal evaluates `isSubmitting` as `true` on first render. React 19 applies the client version, permanently disabling the button. The root cause is in `useSignals()` calling `setListener()` synchronously during render, which interacts badly with React 19's hydration.

## How to apply
Replace:
```tsx
disabled={signInForm.isSubmitting}
```
With:
```tsx
disabled={signInMutation.isPending}  // from useMutation(@tanstack/react-query)
```
React Query uses regular useState internally — no hydration mismatch.
