/**
 * iPlace Global — SE Technical Assessment
 * ========================================
 * Three tests are currently failing. Fix the bugs in the source files so that
 * all three pass. DO NOT modify this file.
 *
 * Run `npm test` to see the failure messages — each one describes exactly
 * what the expected behaviour should be.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// ─── Mock Stripe before any imports that use it ───────────────────────────────
const mockSessionCreate = jest.fn();

jest.mock('stripe', () =>
  jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: { create: mockSessionCreate },
    },
  })),
);

// ─── Mock window.location (jsdom does not support navigation) ─────────────────
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
});

// ─── Import modules under test (after mocks are registered) ──────────────────
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getPriceInPence, createCheckoutSession } = require('../lib/checkout');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { default: CheckoutPage } = require('../app/page');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 1 — Price unit conversion
// ─────────────────────────────────────────────────────────────────────────────
// Stripe requires amounts in the smallest currency unit.
// For GBP that is pence: £99 must be sent as 9900, not 99.
// Without this conversion, a £99 listing would be charged at £0.99.
// ─────────────────────────────────────────────────────────────────────────────
describe('getPriceInPence', () => {
  it('should convert a GBP amount to pence by multiplying by 100', () => {
    expect(getPriceInPence(99)).toBe(9900);
    expect(getPriceInPence(149)).toBe(14900);
    expect(getPriceInPence(1)).toBe(100);
    expect(getPriceInPence(0)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST 2 — Stripe error handling
// ─────────────────────────────────────────────────────────────────────────────
// When Stripe is unavailable (network outage, rate limit, invalid key, etc.),
// createCheckoutSession should throw a clean, user-friendly error rather than
// leaking the raw internal Stripe error message to callers.
// ─────────────────────────────────────────────────────────────────────────────
describe('createCheckoutSession — error handling', () => {
  beforeEach(() => mockSessionCreate.mockReset());

  it('should throw "Payment service unavailable" when Stripe throws', async () => {
    mockSessionCreate.mockRejectedValueOnce(new Error('connect ECONNREFUSED'));

    await expect(
      createCheckoutSession('Senior React Developer', 'hiring@example.com'),
    ).rejects.toThrow('Payment service unavailable');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST 3 — React component loading state
// ─────────────────────────────────────────────────────────────────────────────
// After a failed checkout attempt the Checkout button must re-enable so the
// user can try again without having to refresh the page.
// ─────────────────────────────────────────────────────────────────────────────
describe('CheckoutPage — loading state after error', () => {
  it('should re-enable the checkout button after a failed API call', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Payment failed. Please try again.' }),
    });

    render(React.createElement(CheckoutPage));

    // Fill in both required fields
    fireEvent.change(
      screen.getByPlaceholderText('e.g. Senior React Developer'),
      { target: { value: 'Frontend Engineer' } },
    );
    fireEvent.change(screen.getByPlaceholderText('you@company.com'), {
      target: { value: 'test@example.com' },
    });

    // Trigger checkout
    fireEvent.click(screen.getByTestId('checkout-button'));

    // Error message must appear
    await waitFor(() =>
      expect(screen.getByText(/payment failed/i)).toBeInTheDocument(),
    );

    // Button must be re-enabled so the user can try again
    expect(screen.getByTestId('checkout-button')).not.toBeDisabled();
  });
});
