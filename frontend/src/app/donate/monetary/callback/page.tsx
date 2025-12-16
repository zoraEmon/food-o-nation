"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { finalizeMonetaryDonation } from '@/services/monetaryService';

export default function MonetaryCallbackPage() {
  const params = useSearchParams();
  const router = useRouter();

  const provider = params.get('provider');
  const status = params.get('status');
  const ref = params.get('ref');
  const amountParam = params.get('amount');

  const amount = useMemo(() => {
    const v = Number(amountParam);
    return Number.isFinite(v) ? v : undefined;
  }, [amountParam]);

  const [state, setState] = useState<{ loading: boolean; error?: string; success?: boolean; receiptId?: string }>({ loading: true });

  useEffect(() => {
    async function run() {
      try {
        if (status !== 'success') {
          setState({ loading: false, error: 'Payment was not successful.' });
          return;
        }
        if (!ref || !amount) {
          setState({ loading: false, error: 'Missing payment reference or amount.' });
          return;
        }
        // Get donorId and user info from localStorage if available (logged in users)
        let donorId: string | null = null;
        let guestName: string | undefined;
        let guestEmail: string | undefined;

        try {
          donorId = localStorage.getItem('donorId');
          // For guest users, retrieve from session storage (set during donation flow)
          if (!donorId) {
            guestName = sessionStorage.getItem('guestDonorName') || undefined;
            guestEmail = sessionStorage.getItem('guestDonorEmail') || undefined;
          }
        } catch {}

        // Determine payment method from provider
        let paymentMethod = provider || 'maya';
        if (provider === 'paypal') paymentMethod = 'PayPal';
        else if (provider === 'maya') paymentMethod = 'Maya';
        else if (provider === 'stripe') paymentMethod = 'Credit Card';

        const result = await finalizeMonetaryDonation(donorId, amount, paymentMethod, ref, guestName, guestEmail);
        if (!result.success) {
          setState({ loading: false, error: result.message || 'Failed to finalize donation.' });
          return;
        }
        setState({ loading: false, success: true, receiptId: result.data?.id });

        // Clear guest session data
        try {
          sessionStorage.removeItem('guestDonorName');
          sessionStorage.removeItem('guestDonorEmail');
        } catch {}
      } catch (e: any) {
        setState({ loading: false, error: e?.message || 'Unexpected error.' });
      }
    }
    run();
  }, [provider, status, ref, amount]);

  if (state.loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Processing payment...</h1>
        <p className="mt-2 text-gray-600">Please wait while we confirm your donation.</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-red-600">Payment Failed</h1>
        <p className="mt-2">{state.error}</p>
        <button className="mt-4 px-4 py-2 rounded bg-gray-800 text-white" onClick={() => router.push('/donate/monetary')}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-green-700">Thank you for your donation!</h1>
      <p className="mt-2">Your payment has been confirmed. Reference: <span className="font-mono">{ref}</span></p>
      {state.receiptId && (
        <p className="mt-1">Receipt ID: <span className="font-mono">{state.receiptId}</span></p>
      )}
      <button className="mt-4 px-4 py-2 rounded bg-gray-800 text-white" onClick={() => router.push('/donate')}>Go back to Donate</button>
    </div>
  );
}
