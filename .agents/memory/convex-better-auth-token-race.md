---
name: Convex Better Auth token race
description: Why mutation buttons (e.g. "add page") can silently fail right after navigation/login in a Convex + Better Auth app, and how to guard against it.
---

In this app, `ConvexBetterAuthProvider` attaches the Better Auth JWT to the
`ConvexReactClient` asynchronously (it fetches `/api/auth/convex/token` and
calls `client.setAuth(...)` after mount/navigation). There is a real window —
observed to be several hundred ms up to ~2s on cold Turbopack compiles or
slow networks — during which the UI is already interactive but the Convex
client has no auth token attached yet.

If a user clicks a mutation-triggering button (e.g. "add page", "New page")
during that window, `ctx.auth.getUserIdentity()` on the server returns
`null`, the mutation throws `"Not authenticated"`, and a generic catch block
shows a translated error toast (e.g. "Gagal membuat halaman") with no
indication of the real cause.

**Why:** the race is invisible in most manual testing because the window is
short, but it reproduces reliably right after sign-up/sign-in redirects or
on slower connections — exactly when users are most likely to immediately
click something.

**How to apply:** use `useConvexAuth()` from `convex/react` (`{ isAuthenticated,
isLoading }`) to gate any button that triggers an authenticated mutation —
disable it until `isAuthenticated` is true, rather than relying on component
`mounted` state alone (mounted only proves React hydrated, not that the auth
token is attached). Pair this with a one-shot retry in the catch block for
errors matching `/auth/i`, since the token can attach in the few hundred ms
between the click and the request. This is the same class of bug as the
earlier native-form pre-hydration submit race — anything gated only on
mount/hydration timing, rather than the actual async readiness signal, will
eventually race.
