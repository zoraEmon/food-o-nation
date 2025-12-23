"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Eye, EyeOff, ArrowLeft, AlertTriangle } from "lucide-react";
import AuthNavbar from "@/components/layout/AuthNavbar";
import { cn } from '@/lib/utils';
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/authService";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from '@/components/ui/NotificationProvider';

export default function DonorRegisterPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  const inputClass = "w-full p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-[#ffb000] focus:outline-none transition-all";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    donorType: "INDIVIDUAL" as "INDIVIDUAL" | "ORGANIZATION" | "BUSINESS",
    profileImage: null as File | null,
    primaryPhone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits and limit to 11 characters (local format e.g., 09171234567)
    const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
    setFormData({ ...formData, primaryPhone: raw });
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (e.target.name === 'profileImage') {
      setFormData({ ...formData, profileImage: file });
    }
  };
  
  const handleBackClick = () => {
    const hasFormData = formData.email !== "" || formData.displayName !== "" || formData.password !== "";
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

  // OTP verification removed - now handled on login page

  const PASSWORD_REGEX = /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/\?]).+/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validation
    if (!formData.email || !formData.password || !formData.displayName) {
      return setError("Please fill in all required fields.");
    }

    if (formData.password.length < 12 || !PASSWORD_REGEX.test(formData.password)) {
      return setError("Password must be at least 12 characters and include uppercase, lowercase, a digit, and a special character.");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    
    try {
      // Validate phone: must be 11 digits and start with 09
      if (!/^[0][9]\d{9}$/.test(formData.primaryPhone)) {
        setError('Phone number must be 11 digits and start with 09');
        setLoading(false);
        return;
      }

      // Format to E.164 (+63) before sending
      const formattedPhone = '+63' + formData.primaryPhone.slice(1);

      const response = await authService.registerDonor({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        donorType: formData.donorType,
        primaryPhone: formattedPhone,
      });
      
      if (response.success) {
        // Show notification and redirect immediately
        showNotification({ title: 'Registration successful', message: 'Registration successful! Please check your email for the verification code.', type: 'success', autoClose: 5000 });
        router.push("/login?type=donor&registered=true");
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
        <AuthNavbar 
          showLoginButton={true}
          loginLink="/login?type=donor"
        />
        <main className="flex-1 flex flex-col items-center justify-center py-16 px-4">
          {/* Back Button Outside Card */}
          <div className="w-full max-w-xl mb-4">
            <Button
              onClick={handleBackClick}
              variant="ghost"
              className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-secondary flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </Button>
          </div>
          
          <div className="w-full max-w-xl bg-white dark:bg-[#0a291a] p-8 md:p-12 rounded-2xl shadow-xl border border-primary/10">
            
            <div className="text-center mb-10">
              <h1 className="font-heading text-3xl font-bold text-primary dark:text-white mb-2">
                Become a Partner Donor
              </h1>
              <p className="font-sans text-gray-500 dark:text-gray-400">
                Join our community of givers. Your contribution changes lives.
              </p>
            </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-bold flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className={inputClass}
                placeholder="Your name or organization name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">
                Donor Type <span className="text-red-500">*</span>
              </label>
              <select
                name="donorType"
                value={formData.donorType}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="ORGANIZATION">Organization</option>
                <option value="BUSINESS">Business</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="donor@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">
                Profile Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-[#004225] mx-auto mb-2" />
                <input
                  type="file"
                  accept="image/*"
                  name="profileImage"
                  onChange={handleFileChange}
                  className="hidden"
                  id="profileImage"
                />
                <label htmlFor="profileImage" className="cursor-pointer text-[#004225] font-bold hover:text-[#ffb000] text-sm">
                  Click to upload profile image
                </label>
                {formData.profileImage && (
                  <p className="text-xs text-gray-600 mt-2">{formData.profileImage.name}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center px-3 py-3 rounded-l-lg bg-gray-100 dark:bg-white/5 border border-r-0 border-gray-200 dark:border-white/10 text-sm font-bold text-gray-700">
                  +63
                </div>
                <input
                  required
                  name="primaryPhone"
                  value={formData.primaryPhone ? formData.primaryPhone.slice(1) : ''}
                  onChange={(e) => {
                    // User types the 10-digit local part without leading 0 (e.g., 9171234567)
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                    // Prepend leading 0 to store consistent local format (0917...)
                    const local = raw ? '0' + raw : '';
                    setFormData({ ...formData, primaryPhone: local });
                    setError('');
                  }}
                  className={cn(inputClass, 'rounded-r-lg')}
                  placeholder="9XXXXXXXXX"
                  inputMode="tel"
                />
              </div>
              <p className="text-[10px] text-gray-400">Enter 10 digits (e.g. 9123456789). We'll send it as <code>+63XXXXXXXXXX</code>.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400">Password must be at least 12 characters and include an uppercase, lowercase, a number, and a special character.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ffb000] text-black hover:bg-[#ffc107] px-8 py-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? "Processing..." : "Register as Donor"}
            </Button>
          </form>
        </div>
      </main>

      {/* OTP verification now handled on login page */}
      
      {/* Warning Modal */}
      <Modal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title="Unsaved Changes"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 dark:text-gray-300">
                You have unsaved changes in your registration form. Are you sure you want to leave? All your progress will be lost.
              </p>
            </div>
          </div>

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