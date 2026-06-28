import Stripe from 'stripe';
import type { BillingPeriod } from '@/types/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

const BASE_PRICE_GBP = 99;
const PLAN_MULTIPLIER = 10;

/**
 * Converts a GBP price to the smallest currency unit for Stripe.
 * Stripe requires amounts in pence (e.g. £99 → 9900).
 */
export function getPriceInPence(priceGbp: number): number {
  return Math.round(priceGbp * 100);
}

export function getPlanPriceInPence(billingPeriod: BillingPeriod): number {
  return billingPeriod === 'monthly'
    ? getPriceInPence(BASE_PRICE_GBP)
    : PLAN_MULTIPLIER * getPriceInPence(BASE_PRICE_GBP);
}

function productDescriptionGenerator(billingPeriod: BillingPeriod): string {
  return billingPeriod === 'monthly'
    ? 'Single job posting on iPlace Global (30 days)'
    : 'Single job posting on iPlace Global (12 months)';
}
/**
 * Creates a Stripe Checkout session for a single job listing.
 * Returns the Stripe-hosted checkout URL to redirect the user to.
 */

export async function createCheckoutSession(
  jobTitle: string,
  email: string,
  billingPeriod: BillingPeriod
): Promise<string> {
  const unitAmount = getPlanPriceInPence(billingPeriod);
  const productDescription = productDescriptionGenerator(billingPeriod);
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            unit_amount: unitAmount,
            product_data: {
              name: `Job Listing — ${jobTitle}`,
              description: productDescription,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      metadata: { jobTitle, email, billingPeriod, finalPriceGbp: String(unitAmount / 100) },
    });

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL');
    }

    return session.url;
  } catch (err) {
    console.error('Stripe checkout session creation failed:', err);
    throw new Error('Payment service unavailable');
  }
}