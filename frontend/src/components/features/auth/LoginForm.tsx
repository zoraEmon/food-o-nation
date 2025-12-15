"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff, ChevronLeft, LogIn } from "lucide-react";

interface LoginFormProps {
  role: "BENEFICIARY" | "DONOR";
  onBack: () => void;
  onClose: () => void;
}

export default function LoginForm({ role, onBack, onClose }: LoginFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Pre-fill credentials based on role
  const defaultCredentials = {
    BENEFICIARY: {
      email: "beneficiary@test.com",
      password: "testpassword123"
    },
    DONOR: {
      email: "donor@test.com",
      password: "testpassword123"
    }
  };
  
  const [formData, setFormData] = useState({
    email: defaultCredentials[role].email,
    password: defaultCredentials[role].password
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Call Login API
      await authService.login(formData.email, formData.password, role);
      
      // 2. Success Actions
      onClose(); // Close the modal
      
      // Redirect based on role
      if (role === "BENEFICIARY") {
        router.push("/donor/beneficiarydashboard/beneficiarydashboard");
      } else if (role === "DONOR") {
        router.push("/donor/beneficiarydashboard/donordashboard");
      } else {
        router.push("/dashboard");
      }
      
    } catch (err: any) {
      console.error(err);
      // Handle generic or specific errors
      const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick login bypass - directly navigate to dashboard
  const handleQuickLogin = () => {
    // Set mock token and user data for bypass
    localStorage.setItem('token', 'dev-bypass-token');
    localStorage.setItem('user', JSON.stringify({
      id: role === "BENEFICIARY" ? 'dev-beneficiary-id' : 'dev-donor-id',
      email: formData.email,
      role: role,
      status: 'APPROVED',
      displayName: role === "BENEFICIARY" ? 'Test Beneficiary' : 'Test Donor'
    }));
    
    onClose();
    
    // Redirect based on role
    if (role === "BENEFICIARY") {
      router.push("/donor/beneficiarydashboard/beneficiarydashboard");
    } else if (role === "DONOR") {
      router.push("/donor/beneficiarydashboard/donordashboard");
    } else {
      router.push("/dashboard");
    }
  };

  // Dynamic Styles based on Role
  const isDonor = role === "DONOR";
  const themeColor = isDonor ? "text-blue-600" : "text-[#004225]";
  const btnColor = isDonor 
    ? "bg-blue-600 hover:bg-blue-700 text-white" 
    : "bg-[#ffb000] hover:bg-[#ffc107] text-black";

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header with Back Button */}
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={onBack} 
          type="button"
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-500" />
        </button>
        <div>
          <h3 className={`font-heading text-xl font-bold ${themeColor} dark:text-white`}>
            {isDonor ? "Partner Login" : "Beneficiary Login"}
          </h3>
          <p className="text-xs text-gray-500">Welcome back! Please enter your details.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
          <input 
            required 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            className="w-full p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-current focus:outline-none transition-all" 
            placeholder="name@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
          <div className="relative">
            <input 
              required 
              type={showPassword ? "text" : "password"} 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-current focus:outline-none transition-all" 
              placeholder="••••••••" 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading} 
          className={`w-full ${btnColor} font-bold text-lg h-12 mt-4 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2`}
        >
          {loading ? "Signing in..." : "Login"} {!loading && <LogIn size={18} />}
        </Button>

      </form>

      {/* Quick Login Bypass Button */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
        <Button 
          type="button"
          onClick={handleQuickLogin}
          className={`w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold text-sm h-10 shadow transition-all`}
        >
          Quick Login (Bypass)
        </Button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Click to skip login and go directly to dashboard
        </p>
      </div>
    </div>
  );
}