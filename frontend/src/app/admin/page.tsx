"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { Lock, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await authService.login(email, password, "ADMIN");
      if (response.user.roles.includes("ADMIN")) {
        router.push("/admin/dashboard");
      } else {
        setError("You are not authorized to access the admin panel.");
      }
    } catch (err: any) { 
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="bg-card p-8 rounded-lg shadow-xl w-full max-w-md border border-border">
        <div className="flex flex-col items-center mb-6">
          <Shield className="w-12 h-12 text-primary mb-3" />
          <h1 className="text-3xl font-bold">System Admin Login</h1>
          <p className="text-muted-foreground text-sm mt-1">Access the Food-O-Nation Administration Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {
            error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm border border-destructive">
                {error}
              </div>
            )
          }
          <div>
            <label className="block text-muted-foreground text-sm font-semibold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              placeholder="admin@foodonation.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-muted-foreground text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-md transition duration-300 ease-in-out flex items-center justify-center gap-2"
          >
            <Lock className="w-5 h-5" />
            Login as Admin
          </button>
        </form>
      </div>
    </div>
  );
}
