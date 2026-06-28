'use client';

// AI-assisted — v2 visual remix of app/page.tsx; data flow mirrors v1.

import { useState } from 'react';
import type { BillingPeriod } from '@/types/types';

const MONTHLY_PRICE_GBP = 99;
const ANNUAL_PRICE_GBP = 990;

export default function CheckoutPageV2() {
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayPrice = billingPeriod === 'annually' ? ANNUAL_PRICE_GBP : MONTHLY_PRICE_GBP;
  const periodSuffix = billingPeriod === 'annually' ? 'year' : 'month';

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
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          'radial-gradient(circle at 15% 20%, rgba(255, 195, 170, 0.55) 0%, rgba(249, 250, 251, 0) 45%), linear-gradient(135deg, #f4f4f5 0%, #fafafa 100%)',
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Post a Job</p>
          {billingPeriod === 'annually' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-700">
              2 months free
            </span>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCheckout();
          }}
        >
          <div
            role="radiogroup"
            aria-label="Billing period"
            className="inline-flex w-full bg-gray-100 rounded-full p-0.5 mb-5"
          >
            <button
              type="button"
              role="radio"
              aria-checked={billingPeriod === 'monthly'}
              onClick={() => setBillingPeriod('monthly')}
              disabled={isLoading}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-colors disabled:cursor-not-allowed ${
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
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                billingPeriod === 'annually'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Annual
            </button>
          </div>

          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-5xl font-bold text-gray-900 tracking-tight">£{displayPrice}</span>
            <span className="text-base text-gray-500">/{periodSuffix}</span>
          </div>

          <hr className="my-6 border-gray-100" />

          {error && (
            <div
              role="alert"
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
            >
              {error}
            </div>
          )}

          <div className="space-y-5 mb-7">
            <div>
              <label htmlFor="v2-jobTitle" className="block text-xs font-medium text-gray-500 mb-1">
                Job Title
              </label>
              <input
                id="v2-jobTitle"
                type="text"
                value={jobTitle}
                disabled={isLoading}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full border-0 border-b border-gray-200 bg-transparent px-0 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
                placeholder="e.g. Senior React Developer"
                required
              />
            </div>

            <div>
              <label htmlFor="v2-email" className="block text-xs font-medium text-gray-500 mb-1">
                Email Address
              </label>
              <input
                id="v2-email"
                type="email"
                value={email}
                disabled={isLoading}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-0 border-b border-gray-200 bg-transparent px-0 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
                placeholder="you@company.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            data-testid="checkout-button-v2"
            aria-busy={isLoading}
            disabled={isLoading || !jobTitle.trim() || !email.trim()}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl py-3 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              <>Continue to checkout — £{displayPrice}</>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
