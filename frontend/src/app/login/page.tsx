"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/authService";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginType = searchParams.get('type') || 'beneficiary'; // 'beneficiary' or 'donor'
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // OTP states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingUserId, setPendingUserId] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  
  // Warning modal for back button
  const [showWarningModal, setShowWarningModal] = useState(false);

  const handleOtpVerification = async () => {
    setOtpLoading(true);
    try {
      const response = await authService.verifyDonorOtp(pendingUserId, otp);
      if (response.success && response.data?.token && response.data?.user) {
        // Store user data via AuthContext
        login(response.data.token, response.data.user);
        
        setShowOtpModal(false);
        
        // Redirect to unified dashboard
        router.push("/dashboard");
      } else {
        setError(response.message || "OTP verification failed");
      }
    } catch (err: any) {
      setError(err?.message || "OTP verification error");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const roleType = loginType === 'donor' ? 'DONOR' : 'BENEFICIARY';
      const response = await authService.login(email, password, roleType);
      
      if (response.requiresOtpVerification && response.userId) {
        // Show OTP modal instead of logging in
        setPendingUserId(response.userId);
        setPendingEmail(response.email || email);
        setShowOtpModal(true);
        setOtp("");
      } else if (response.token && response.user) {
        // Standard login succeeded - save session via AuthContext
        login(response.token, response.user);
        
        // Redirect to unified dashboard
        router.push("/dashboard");
      } else {
        setError(response.message || "Login failed. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-[#ffb000] focus:outline-none transition-all";

  const pageTitle = loginType === 'donor' ? 'Donor Login' : 'Beneficiary Login';
  const registerLink = loginType === 'donor' ? '/register/donor' : '/register/beneficiary';
  
  const handleBackClick = () => {
    const hasFormData = email !== "" || password !== "";
    if (hasFormData) {
      setShowWarningModal(true);
    } else {
      router.push('/');
    }
  };
  
  const handleConfirmLeave = () => {
    setShowWarningModal(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
        <AuthNavbar 
          showSignUpButton={true} 
          signUpLink={registerLink}
        />
        
        <main className="flex-1 flex flex-col items-center justify-center py-16 px-4">
          {/* Back Button Outside Card */}
          <div className="w-full max-w-md mb-4">
            <Button
              onClick={handleBackClick}
              variant="ghost"
              className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-secondary flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </Button>
          </div>
          
          <div className="w-full max-w-md bg-white dark:bg-[#0a291a] p-8 rounded-2xl shadow-xl border border-primary/10">
            <h1 className="font-heading text-3xl font-bold text-primary dark:text-white mb-6 text-center">{pageTitle}</h1>
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={12}
                  className={inputClass}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#ffb000] text-black hover:bg-[#ffc107]">
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Not verified yet? Check your email for the OTP after registration.
          </p>
        </div>
      </main>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0a291a] rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-[#004225] dark:text-white mb-4">Verify Your Email</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We've sent a 6-digit verification code to <strong>{pendingEmail}</strong>. Please enter it below.
            </p>

            {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit OTP"
              className={`${inputClass} text-center text-2xl tracking-widest mb-6`}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleOtpVerification}
                disabled={otpLoading || otp.length !== 6}
                className="flex-1 bg-[#ffb000] text-black hover:bg-[#ffc107]"
              >
                {otpLoading ? "Verifying..." : "Verify"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp("");
                  setError("");
                }}
                className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Warning Modal */}
      <Modal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title="Leave Page?"
      >
        <div className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300">
            You have unsaved login information. Are you sure you want to leave?
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              onClick={() => setShowWarningModal(false)}
              variant="outline"
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmLeave}
              className="bg-red-600 hover:bg-red-700 text-white px-6"
            >
              Yes, Leave
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
