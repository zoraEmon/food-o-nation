"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function DonorRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Mock response - no backend call
      const mockResponse = {
        userId: `donor-${Date.now()}`,
        message: "Registration successful!",
        requireVerification: false
      };
      
      // Set bypass token and user data for immediate dashboard access
      localStorage.setItem('token', 'dev-bypass-token');
      localStorage.setItem('user', JSON.stringify({
        id: mockResponse.userId,
        email: formData.email,
        role: 'DONOR',
        status: 'APPROVED',
        displayName: formData.displayName
      }));
      
      alert("Registration Successful! Redirecting to your dashboard...");
      router.push("/donor/beneficiarydashboard/donordashboard");
    } catch (err: any) {
      console.error(err);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
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
              <input
                required
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
                placeholder="••••••••••••"
              />
              <p className="text-[10px] text-gray-400">Must be at least 12 characters.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={inputClass}
                placeholder="••••••••••••"
              />
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
      <Footer />
    </div>
  );
}