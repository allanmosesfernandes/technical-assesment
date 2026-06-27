import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

const BASE_PRICE_GBP = 99;

/**
 * Converts a GBP price to the smallest currency unit for Stripe.
 * Stripe requires amounts in pence (e.g. £99 → 9900).
 */
export function getPriceInPence(priceGbp: number): number {
  return priceGbp;
}

/**
 * Creates a Stripe Checkout session for a single job listing.
 * Returns the Stripe-hosted checkout URL to redirect the user to.
 */
export async function createCheckoutSession(
  jobTitle: string,
  email: string,
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          unit_amount: getPriceInPence(BASE_PRICE_GBP),
          product_data: {
            name: `Job Listing — ${jobTitle}`,
            description: 'Single job posting on iPlace Global (30 days)',
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    metadata: { jobTitle, email },
  });

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL');
  }

  return session.url;
}
