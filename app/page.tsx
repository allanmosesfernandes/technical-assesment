'use client';

import { useState } from 'react';

type BillingPeriod = 'monthly' | 'annually';

const MONTHLY_PRICE_GBP = 99;
const ANNUAL_PRICE_GBP = 990;

export default function CheckoutPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayPrice = billingPeriod === 'annually' ? ANNUAL_PRICE_GBP : MONTHLY_PRICE_GBP;
  const listingDuration = billingPeriod === 'annually' ? '12 months' : '30 days';

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, email, billingPeriod }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setError('Unable to connect. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Post a Job</h1>
          <p className="text-sm text-gray-500 mt-1">
            £{displayPrice} · Billed {billingPeriod} · Listed for {listingDuration}
          </p>
        </div>

        {/* AI-assisted - Wrapping the inline elements into native HTML form element */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCheckout();
          }}
        >
          <div className="mb-5">
            <div
              role="radiogroup"
              aria-label="Billing period"
              className="inline-flex w-full bg-gray-100 rounded-lg p-1"
            >
              {/* AI-assisted - Building the UI for the toggle */}
              <button
                type="button"
                role="radio"
                aria-checked={billingPeriod === 'monthly'}
                onClick={() => setBillingPeriod('monthly')}
                disabled={isLoading}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={billingPeriod === 'annually'}
                aria-label="Annual (2 months free)"
                onClick={() => setBillingPeriod('annually')}
                disabled={isLoading}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                  billingPeriod === 'annually'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Annual
                <span className="ml-1.5 text-xs text-green-600 font-semibold">2 months free</span>
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                id="jobTitle"
                type="text"
                value={jobTitle}
                disabled={isLoading}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Senior React Developer"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled={isLoading}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@company.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            data-testid="checkout-button"
            aria-busy={isLoading}
            disabled={isLoading || !jobTitle.trim() || !email.trim()}
            className="mt-6 w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Processing…
              </>
            ) : (
              `Checkout — £${displayPrice}`
            )}
          </button>
        </form>
      </div>
    </main>
  );
}