"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // Import Image component
import { ArrowLeft, CheckCircle, Mail, CreditCard, Smartphone, Globe, Lock, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";import { useNotification } from '@/components/ui/NotificationProvider';import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { initMayaCheckout, initPayPalCheckout } from "@/services/monetaryService";
import { useAuth } from "@/contexts/AuthContext";

// --- CONSTANTS ---
const PRESET_AMOUNTS = [100, 250, 500, 1000, 2000, 5000];

// --- INTERNAL SUCCESS MODAL COMPONENT ---
const SuccessModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  email, 
  phone 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  amount: string; 
  email: string; 
  phone: string; 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center border-4 border-[#004225] relative overflow-hidden transform transition-all scale-100">
        
        {/* Top Gold Strip */}
        <div className="absolute top-0 left-0 w-full h-4 bg-[#ffb000]"></div>
        
        {/* Animated Heart Icon */}
        <div className="mx-auto flex items-center justify-center h-24 w-24 bg-green-50 rounded-full mb-6 mt-4 border-2 border-[#004225]">
           <Heart className="w-12 h-12 text-[#004225] fill-[#004225] animate-pulse" />
        </div>

        <h3 className="text-3xl font-extrabold text-[#004225] mb-2 font-heading">Thank You!</h3>
        <p className="text-lg text-gray-900 font-bold mb-6">
          Your donation of ₱{parseInt(amount).toLocaleString()} was successful.
        </p>
        
        {/* Receipt Message */}
        <div className="bg-[#fffbf0] p-4 border border-[#ffb000] rounded-xl mb-8 text-sm text-gray-700 leading-relaxed">
          <p>
            A receipt has been sent to <strong>{email}</strong>
            {phone && (
              <> and via text message to <strong>{phone}</strong></>
            )}.
          </p>
        </div>
        
        <Button 
          onClick={onClose} 
          className="w-full py-4 rounded-xl bg-[#ffb000] text-black font-bold shadow-md hover:bg-[#ffc107] text-lg"
        >
          Done
        </Button>
      </div>
    </div>
  );
};

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
export default function MonetaryDonationPage() {
  const { showNotification } = useNotification();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user, isLoggedIn, token } = useAuth();
  
  // Form State
  const [amount, setAmount] = useState<string>("");
  const [frequency, setFrequency] = useState<"ONCE" | "MONTHLY" | "YEARLY">("ONCE");
  const [donorName, setDonorName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "GCASH" | "PAYPAL">("CARD");
  const [cardExpiry, setCardExpiry] = useState("");

  // Load user data if logged in via AuthContext
  useEffect(() => {
    if (user) {
      setDonorName(user.displayName || "");
      if (user.email) {
        setEmail(user.email);
      }
    }
  }, [user]);

  // --- HANDLERS ---

  // 1. Strict Text Input for Donor Name
  const handleDonorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow letters, spaces, and common name characters
    const textValue = value.replace(/[^a-zA-Z\s\-'\.]/g, '');
    setDonorName(textValue);
  };

  // 2. Strict Number Input for Phone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Regex: Only allow numbers 0-9
    const numericValue = value.replace(/[^0-9]/g, '');
    setPhone(numericValue);
  };

  const goToConfirmation = () => {
    if (!amount || !donorName) return;
    setStep(2);
  };

  // Safely read donorId from context or from JWT if missing
  const getDonorId = (): string | null => {
    if (user?.donorId) return user.donorId;
    if (!token) return null;
    try {
      const [, payload] = token.split(".");
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const json = JSON.parse(typeof window !== 'undefined' ? atob(base64) : Buffer.from(base64, 'base64').toString());
      return json?.donorId || null;
    } catch {
      return null;
    }
  };

  const goToReceipt = () => {
    // If logged in and we have a user, skip contact details
    if (isLoggedIn) {
      setStep(4);
    } else {
      setStep(3);
    }
  };

  const goToPayment = () => {
    if (!email.includes('@')) return; 
    setStep(4);
  };

  const handleFinalDonate = async () => {
    setLoading(true);
    try {
      // Get donorId from AuthContext or JWT fallback if logged in
      const donorId: string | null = getDonorId();

      // For guest users, store name and email in sessionStorage for callback
      if (!donorId) {
        try {
          sessionStorage.setItem('guestDonorName', donorName);
          sessionStorage.setItem('guestDonorEmail', email);
        } catch {}
      }

      // For Maya: initiate checkout and redirect to provider
      if (paymentMethod === 'GCASH') {
        // Store amount for callback retrieval
        try {
          sessionStorage.setItem('paymentAmount', amount);
          sessionStorage.setItem('paymentMethod', 'maya');
        } catch {}
        const data = await initMayaCheckout(
          donorId,
          parseFloat(amount),
          `Donation - ${frequency}`,
          email || user?.email || undefined,
          phone || undefined
        );
        // Redirect to Maya payment page
        window.location.href = data.redirectUrl!;
        return;
      }

      // For PayPal: initiate checkout and redirect to provider
      if (paymentMethod === 'PAYPAL') {
        // Store amount for callback retrieval
        try {
          sessionStorage.setItem('paymentAmount', amount);
          sessionStorage.setItem('paymentMethod', 'paypal');
        } catch {}
        const data = await initPayPalCheckout(
          donorId,
          parseFloat(amount),
          `Donation - ${frequency}`,
          email || user?.email || undefined,
          phone || undefined
        );
        // Redirect to PayPal payment page
        window.location.href = data.redirectUrl!;
        return;
      }

      // For credit card: simulate processing or call backend
      if (paymentMethod === 'CARD') {
        // In production, this would call a backend Stripe endpoint
        // For now, simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
        setShowSuccess(true);
      }
    } catch (e: any) {
      showNotification({ title: 'Payment failed', message: e?.message || 'Payment initiation failed.', type: 'error' });
      setLoading(false);
    }
  };

  const closeSuccessAndRedirect = () => {
    setShowSuccess(false);
    window.location.href = "/"; // Redirect to home
  };

  // --- STYLES ---
  const inputClass = "w-full p-4 rounded-xl bg-gray-50 border-2 border-gray-300 focus:border-[#ffb000] focus:ring-0 focus:outline-none transition-all text-base font-bold text-gray-900 placeholder:text-gray-400";
  const labelClass = "text-xs font-bold text-[#004225] mb-2 block uppercase tracking-wider";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Success Modal Overlay */}
      <SuccessModal 
        isOpen={showSuccess} 
        onClose={closeSuccessAndRedirect} 
        amount={amount}
        email={email}
        phone={phone}
      />

      <main className="flex-grow py-12 px-4 sm:px-6 flex justify-center items-center">
        <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl border-2 border-gray-200 overflow-hidden relative min-h-[600px] flex flex-col md:flex-row">
          
          {/* Top Gold Strip (Mobile) / Left Border (Desktop) */}
          <div className="absolute top-0 left-0 w-full h-3 md:w-3 md:h-full bg-[#ffb000] z-20"></div>

          {/* =======================
              LEFT SIDE: VISUAL
          ======================== */}
          <div className="md:w-1/2 bg-gray-100 relative flex flex-col items-center justify-center p-8 md:p-12 border-r border-gray-200">
             <div className="absolute top-6 left-6 z-10">
                <Link href="/donate" className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#004225] transition-colors bg-white/80 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Link>
             </div>
             
             {/* Decorative Box (Wireframe Style) */}
             <div className="w-full aspect-square max-w-sm bg-white border-4 border-[#004225] relative flex items-center justify-center shadow-inner rounded-xl overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#004225 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="absolute inset-0 border-t-2 border-[#004225]/20 -rotate-45 scale-150 origin-center"></div>
                <div className="absolute inset-0 border-t-2 border-[#004225]/20 rotate-45 scale-150 origin-center"></div>
                
                {/* Dynamic Icon based on step */}
                <div className="z-10 bg-[#004225] p-6 rounded-full shadow-2xl animate-in zoom-in duration-300">
                  {step === 1 && (
                    <Image 
                      src="/icons/peso.png" 
                      alt="Peso" 
                      width={64} 
                      height={64} 
                      className="w-16 h-16" 
                    />
                  )}
                  {step === 2 && <CheckCircle className="w-16 h-16 text-[#ffb000]" />}
                  {step === 3 && <Mail className="w-16 h-16 text-[#ffb000]" />}
                  {step === 4 && <Lock className="w-16 h-16 text-[#ffb000]" />}
                </div>
             </div>
             
             <div className="mt-8 text-center max-w-xs">
                <h3 className="font-heading text-2xl text-[#004225] font-bold mb-2">
                  {step === 4 ? "Secure Payment" : "Secure Giving"}
                </h3>
                <p className="text-gray-500 text-sm">Your contribution directly supports our community outreach programs.</p>
             </div>
          </div>

          {/* =======================
              RIGHT SIDE: FORM
          ======================== */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
            
            {/* STEP 1: DONATION INPUT */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                <div>
                  <h2 className="text-3xl font-extrabold text-[#004225] mb-1 font-heading">Monetary Donation</h2>
                  <p className="text-gray-500 text-sm">Fill in the details below to proceed.</p>
                </div>

                {/* Donor Name */}
                <div>
                  <label className={labelClass}>Display Name</label>
                  <input 
                    value={donorName} 
                    onChange={handleDonorNameChange} 
                    className={inputClass} 
                    placeholder="Enter your full name" 
                  />
                  <p className="text-xs text-gray-500 mt-1">For your safety, avoid using your real name</p>
                </div>

                {/* Amount */}
                <div>
                  <label className={labelClass}>Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-gray-500 font-bold text-lg">₱</span>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={`${inputClass} pl-10 text-xl`} placeholder="0.00" />
                  </div>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button key={amt} onClick={() => setAmount(amt.toString())} className={`py-2 px-2 rounded-lg font-bold border-2 transition-all text-sm ${amount === amt.toString() ? 'border-[#ffb000] bg-[#ffb000]/10 text-[#004225]' : 'border-gray-200 text-gray-500 hover:border-[#004225]'}`}>₱{amt}</button>
                  ))}
                </div>

                {/* Frequency & Action */}
                <div className="pt-4 space-y-4">
                  <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden p-1 bg-gray-50">
                    {['ONCE', 'MONTHLY', 'YEARLY'].map((freq) => (
                      <button key={freq} onClick={() => setFrequency(freq as any)} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${frequency === freq ? 'bg-[#004225] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>{freq === 'ONCE' ? 'Give Once' : freq.charAt(0) + freq.slice(1).toLowerCase()}</button>
                    ))}
                  </div>
                  <Button onClick={goToConfirmation} disabled={!amount || !donorName} className="w-full bg-[#ffb000] text-black hover:bg-[#ffc107] font-bold py-4 rounded-xl shadow-lg text-lg transition-transform hover:-translate-y-1">Donate</Button>
                </div>
              </div>
            )}

            {/* STEP 2: FREQUENCY CONFIRMATION */}
            {step === 2 && (
              <div className="text-center space-y-8 animate-in fade-in zoom-in duration-300 px-4">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl">
                   <CreditCard className="w-10 h-10 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-2">Confirmation</h3>
                  <h2 className="text-3xl font-bold text-gray-900 leading-tight">You are going to give:<br/><span className="text-[#004225] text-5xl mt-2 block font-heading">{frequency}!</span></h2>
                  <p className="mt-4 text-lg font-medium text-gray-600">Amount: <span className="text-black font-bold">₱{parseInt(amount).toLocaleString()}</span></p>
                </div>
                <Button onClick={goToReceipt} className="w-full bg-[#004225] text-white hover:bg-[#005a33] font-bold py-4 rounded-xl shadow-lg text-lg">Continue</Button>
                <button onClick={() => setStep(1)} className="text-gray-400 font-bold text-sm hover:text-gray-600">Cancel</button>
              </div>
            )}

            {/* STEP 3: RECEIPT INFO */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                <div>
                  <h2 className="text-3xl font-extrabold text-[#004225] mb-2 font-heading">We Will Send the Receipt at</h2>
                  <p className="text-gray-600 font-medium">Please provide your contact details.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="name@example.com" />
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number (Optional)</label>
                    <input 
                        type="tel" 
                        value={phone} 
                        onChange={handlePhoneChange} 
                        className={inputClass} 
                        placeholder="09XX XXX XXXX" 
                        maxLength={11}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={goToPayment} disabled={!email.includes('@')} className="w-full bg-[#ffb000] text-black hover:bg-[#ffc107] font-bold py-4 rounded-xl shadow-lg text-lg transition-transform hover:-translate-y-1">Continue</Button>
                  <button onClick={() => setStep(2)} className="w-full text-center mt-4 text-gray-400 font-bold text-sm hover:text-gray-600">Back</button>
                </div>
              </div>
            )}

            {/* STEP 4: PAYMENT METHOD SELECTION */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                <div>
                  <h2 className="text-3xl font-extrabold text-[#004225] mb-2 font-heading">Choose Payment Method</h2>
                  <p className="text-gray-600 font-medium">Securely complete your donation.</p>
                </div>

                <div className="space-y-3">
                  {/* Credit Card Option */}
                  <div onClick={() => setPaymentMethod('CARD')} className={`cursor-pointer p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${paymentMethod === 'CARD' ? 'border-[#004225] bg-[#004225] text-white shadow-lg' : 'border-gray-200 bg-white text-gray-600 hover:border-[#004225]'}`}>
                    <CreditCard className="w-6 h-6" />
                    <span className="font-bold text-lg">Credit Card</span>
                  </div>

                  {/* Maya Option */}
                  <div onClick={() => setPaymentMethod('GCASH')} className={`cursor-pointer p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${paymentMethod === 'GCASH' ? 'border-[#004225] bg-[#004225] text-white shadow-lg' : 'border-gray-200 bg-white text-gray-600 hover:border-[#004225]'}`}>
                    <Smartphone className="w-6 h-6" />
                    <span className="font-bold text-lg">Maya</span>
                  </div>

                  {/* PayPal Option */}
                  <div onClick={() => setPaymentMethod('PAYPAL')} className={`cursor-pointer p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${paymentMethod === 'PAYPAL' ? 'border-[#004225] bg-[#004225] text-white shadow-lg' : 'border-gray-200 bg-white text-gray-600 hover:border-[#004225]'}`}>
                    <Globe className="w-6 h-6" />
                    <span className="font-bold text-lg">PayPal</span>
                  </div>
                </div>

                {/* Conditional Payment Inputs */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-4">
                  {paymentMethod === 'CARD' && (
                    <div className="space-y-4 animate-in fade-in">
                      <input
                        className={inputClass}
                        placeholder="Card Number"
                        maxLength={16}
                        onChange={(e) => {
                          e.target.value = e.target.value.replace(/[^0-9]/g, '');
                        }}
                      />
                      <div className="flex gap-4">
                        <input
                          className={inputClass}
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                            const mm = digits.slice(0, 2);
                            const yy = digits.slice(2, 4);
                            const formatted = yy ? `${mm}/${yy}` : mm;
                            setCardExpiry(formatted);
                          }}
                        />
                        <input
                          className={inputClass}
                          placeholder="CVC"
                          maxLength={3}
                          onChange={(e) => {
                            e.target.value = e.target.value.replace(/[^0-9]/g, '');
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {paymentMethod === 'GCASH' && (
                    <div className="text-center py-4 animate-in fade-in">
                      <p className="text-gray-600 mb-4 font-medium">You will be redirected to Maya to complete the payment.</p>
                    </div>
                  )}
                  {paymentMethod === 'PAYPAL' && (
                    <div className="text-center py-4 animate-in fade-in">
                      <p className="text-gray-600 mb-4 font-medium">You will be redirected to PayPal to complete the payment.</p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button onClick={handleFinalDonate} disabled={loading} className="w-full bg-[#ffb000] text-black hover:bg-[#ffc107] font-bold py-4 rounded-xl shadow-lg text-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2">
                    {loading ? "Processing..." : `Donate ₱${amount}`}
                  </Button>
                  <button onClick={() => setStep(3)} className="w-full text-center mt-4 text-gray-400 font-bold text-sm hover:text-gray-600">Back</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}