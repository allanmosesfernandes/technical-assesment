# iPlace Global — SE Technical Assessment Starter

A minimal Next.js 14 + TypeScript job listing payment app used as the starter
project for the iPlace Global Software Engineer technical assessment.

## Getting Started

```bash
# 1. Use this repo as a template on GitHub, then clone your copy
# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local — add your Stripe test keys
# Get them at https://dashboard.stripe.com/test/apikeys

# 4. Run the tests (three should fail — that's expected)
npm test

# 5. Run the dev server
npm run dev
```

## Project Structure

```
app/
  page.tsx                  ← Checkout form (React client component)
  api/checkout/route.ts     ← Next.js API route — calls Stripe
  success/page.tsx          ← Post-payment success page
lib/
  checkout.ts               ← Business logic: price calculation + Stripe session
__tests__/
  checkout.test.ts          ← Assessment tests — DO NOT MODIFY
```

## Environment Variables

| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe test secret key (`sk_test_…`) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe test publishable key (`pk_test_…`) |
| `NEXT_PUBLIC_BASE_URL` | Base URL for redirects (e.g. `http://localhost:3000`) |

## Assessment

See the brief you received by email. Three tests in `__tests__/checkout.test.ts`
are failing — fix the bugs causing them to fail, then add the billing period
feature described in Part 2.

**Do not modify `__tests__/checkout.test.ts`.**

When you are done, share your repository with eric@iplaceglobal.com.
