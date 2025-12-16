"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.login(email, password, "BENEFICIARY");
      router.push("/programs");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-[#ffb000] focus:outline-none transition-all";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md bg-white dark:bg-[#0a291a] p-8 rounded-2xl shadow-xl border border-primary/10">
          <h1 className="font-heading text-3xl font-bold text-primary dark:text-white mb-6 text-center">Beneficiary Login</h1>
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
                  {showPassword ? "👁️" : "👁️‍🗨️"}
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
      <Footer />
    </div>
  );
}
