# Notes — iPlace SE Assessment

## Part 1 — The three bugs

| # | File | What was broken | Root cause |
|---|---|---|---|
| 1 | `lib/checkout.ts` (`getPriceInPence`) | Returned `priceGbp` unchanged — a £99 listing would have been charged as £0.99 by Stripe | The function was scaffolded and wired up at the call site (`unit_amount: getPriceInPence(BASE_PRICE_GBP)`) but the actual unit-conversion was never implemented. Stripe requires amounts in the smallest currency unit (pence for GBP), so the fix is `Math.round(priceGbp * 100)` — using `Math.round` rather than a plain multiply so decimal inputs (e.g. `9.99`) are robust against floating-point drift. |
| 2 | `lib/checkout.ts` (`createCheckoutSession`) | Stripe SDK errors propagated directly to the user (raw strings like `"connect ECONNREFUSED"` would have surfaced in the UI) | There was no `try/catch` around `stripe.checkout.sessions.create(...)`. Fix: wrap the function body in a try/catch, log the original error server-side for operators, and re-throw a clean `Error("Payment service unavailable")` for the caller. |
| 3 | `app/page.tsx` (`handleCheckout`) | After a failed checkout attempt the button stayed disabled forever; users had to refresh to try again | `setIsLoading(true)` at the start of the handler had no matching `setIsLoading(false)` on the failure paths. The clean fix is a `finally { setIsLoading(false); }` block — it runs even when the handler exits via early `return` or `throw`, covering all exit paths in one place rather than duplicating the cleanup at each branch. |

## Part 2 — One design decision

**Decision:** Pricing always lives on the server. The client posts only the selected billing period (`'monthly'` or `'annually'`); `lib/checkout.ts` independently derives the £ amount before passing it to Stripe.

**Why:** Anything in a request body is editable from browser DevTools — it's just text. If the client computed the price and posted it along, an attacker could intercept the request, change `finalPrice: 990` to `finalPrice: 1`, and pay 1p for the £990 plan. By only ever trusting the period (an enum the API route validates against a strict allowlist) and computing the charge server-side, the price the user pays becomes impossible to influence from the client. The UI still computes a display number for the live preview as the user toggles between Monthly and Annual, but that number never leaves the browser.

**Trade-off / cost:** Pricing constants are duplicated — `MONTHLY_PRICE_GBP` / `ANNUAL_PRICE_GBP` in `app/page.tsx` for display, and `BASE_PRICE_GBP` + `PLAN_MULTIPLIER` in `lib/checkout.ts` for the authoritative charge. In a larger codebase I'd extract a shared `lib/pricing.ts` module and enforce server-authoritative usage in code review — but at this scale, deliberate duplication is the simplest way to keep the two paths from being accidentally coupled.

## Part 3 — What I'd do differently with more time

- **Runtime validation via a schema library** — the API route currently hand-validates `billingPeriod` with an inline equality check. With a library like Zod I'd define one schema for the request body that gives me runtime parsing, narrowed TypeScript types, and useful error messages for free.
- **Single source of truth for prices** — the monthly/annual prices are duplicated between `app/page.tsx` (for display) and `lib/checkout.ts` (for the authoritative server-side value). The duplication is deliberate (server stays authoritative even if a malicious client meddles with the imports) but I'd extract a `lib/pricing.ts` module and discipline the boundary in code review rather than via copy-paste.
- **Full WAI-ARIA radio group keyboard support** — I added `role="radiogroup"` + `role="radio"` + `aria-checked` to the billing toggle, but didn't implement arrow-key navigation between options. A production-grade implementation would either handle that manually or swap to a primitive like Radix UI's `ToggleGroup`.
- Rewrite tests for this using vitest and playwright

## Access (HTTP Basic Auth)

The app is gated behind HTTP Basic Auth via `middleware.ts`. To view it locally or on any deployed URL, use:

- **Username:** `eric`
- **Password:** `erici3`

The browser will prompt for credentials on the first request; subsequent requests in the same session reuse them automatically.

## AI usage notes

What the AI was used for:

- Drafting the markdown table that summarizes the three bugs in Part 1.
- Creating the UI for the segmented Monthly / Annual toggle component.
- Wrapping the original layout in a semantic HTML `<form>` element with `onSubmit`.
- Building a themed `/v2` route as a visual remix of the original page.
