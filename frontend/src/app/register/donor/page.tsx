"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Eye, EyeOff, ArrowLeft, AlertTriangle } from "lucide-react";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/authService";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/contexts/AuthContext";

export default function DonorRegisterPage() {
  const router = useRouter();
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validation
    if (!formData.email || !formData.password || !formData.displayName) {
      return setError("Please fill in all required fields.");
    }

    if (formData.password.length < 12) {
      return setError("Password must be at least 12 characters.");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    
    try {
      const response = await authService.registerDonor({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        donorType: formData.donorType,
      });
      
      if (response.success) {
        setSuccessMessage("Registration successful! Redirecting to login...");
        // Redirect to login page after short delay
        setTimeout(() => {
          router.push("/login?type=donor&registered=true");
        }, 1500);
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
              <p className="text-[10px] text-gray-400">Must be at least 12 characters.</p>
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