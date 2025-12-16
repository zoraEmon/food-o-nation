"use client";

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { finalizeMonetaryDonation } from '@/services/monetaryService';

export default function MonetaryCallbackPage() {
  const params = useSearchParams();
  const router = useRouter();

  const provider = params.get('provider');
  const status = params.get('status');
  const ref = params.get('ref');
  const amountParam = params.get('amount');
  const token = params.get('token'); // PayPal token
  const payerID = params.get('PayerID'); // PayPal payer ID

  const amount = useMemo(() => {
    // Try to get amount from URL parameter first
    let v = Number(amountParam);
    if (Number.isFinite(v) && v > 0) return v;
    
    // Fallback to sessionStorage (for PayPal which doesn't pass amount back)
    try {
      const stored = sessionStorage.getItem('paymentAmount');
      if (stored) {
        v = Number(stored);
        if (Number.isFinite(v) && v > 0) return v;
      }
    } catch {}
    
    return undefined;
  }, [amountParam]);

  const [state, setState] = useState<{ loading: boolean; error?: string; success?: boolean; receiptId?: string }>({ loading: true });

  useEffect(() => {
    async function run() {
      try {
        if (status !== 'success') {
          setState({ loading: false, error: 'Payment was not successful.' });
          return;
        }
        
        // For PayPal, use token parameter; for Maya use ref
        let paymentRef = ref || token;
        
        if (!paymentRef || !amount) {
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

        const result = await finalizeMonetaryDonation(donorId, amount, paymentMethod, paymentRef, guestName, guestEmail);
        if (!result.success) {
          setState({ loading: false, error: result.message || 'Failed to finalize donation.' });
          return;
        }
        setState({ loading: false, success: true, receiptId: result.data?.id });

        // Clear guest session data and payment data
        try {
          sessionStorage.removeItem('guestDonorName');
          sessionStorage.removeItem('guestDonorEmail');
          sessionStorage.removeItem('paymentAmount');
          sessionStorage.removeItem('paymentMethod');
        } catch {}
      } catch (e: any) {
        setState({ loading: false, error: e?.message || 'Unexpected error.' });
      }
    }
    run();
  }, [provider, status, ref, amount]);

  if (state.loading) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
           <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
             <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
           </div>
           <h1 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment</h1>
           <p className="text-gray-600">Please wait while we confirm your donation...</p>
           <div className="mt-4 flex justify-center gap-1">
             <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
             <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
             <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
           </div>
         </div>
       </div>
    );
  }

  if (state.error) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
           <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
             <XCircle className="w-10 h-10 text-red-600" />
           </div>
           <h1 className="text-2xl font-bold text-red-600 mb-3">Payment Failed</h1>
           <p className="text-gray-700 mb-6">{state.error}</p>
           <div className="space-y-3">
             <button 
               className="w-full py-3 px-6 rounded-xl bg-[#004225] text-white font-semibold hover:bg-[#005a33] transition-colors flex items-center justify-center gap-2"
               onClick={() => router.push('/donate/monetary')}
             >
               Try Again
             </button>
             <button 
               className="w-full py-3 px-6 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
               onClick={() => router.push('/donate')}
             >
               <ArrowLeft className="w-4 h-4" />
               Back to Donate
             </button>
           </div>
         </div>
       </div>
    );
  }

  return (
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
       <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
         <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
           <CheckCircle className="w-12 h-12 text-green-600" />
         </div>
         <h1 className="text-3xl font-bold text-green-700 mb-3">Thank You!</h1>
         <p className="text-lg text-gray-700 mb-6">Your donation has been confirmed successfully.</p>
       
         <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
           {amount && (
             <div className="flex justify-between items-center">
               <span className="text-gray-600 font-medium">Amount:</span>
               <span className="text-xl font-bold text-[#004225]">₱{amount.toLocaleString()}</span>
             </div>
           )}
           {(ref || token) && (
             <div className="flex justify-between items-center">
               <span className="text-gray-600 font-medium">Reference:</span>
               <span className="font-mono text-sm text-gray-800">{ref || token}</span>
             </div>
           )}
           {state.receiptId && (
             <div className="flex justify-between items-center">
               <span className="text-gray-600 font-medium">Receipt ID:</span>
               <span className="font-mono text-sm text-gray-800">{state.receiptId}</span>
             </div>
           )}
         </div>

         <p className="text-sm text-gray-600 mb-6">
           A confirmation email has been sent with your receipt details.
         </p>
       
         <div className="space-y-3">
           <button 
             className="w-full py-3 px-6 rounded-xl bg-[#ffb000] text-black font-semibold hover:bg-[#ffc107] transition-colors"
             onClick={() => router.push('/')}
           >
             Go to Home
           </button>
           <button 
             className="w-full py-3 px-6 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
             onClick={() => router.push('/donate')}
           >
             Make Another Donation
           </button>
         </div>
       </div>
     </div>
  );
}
