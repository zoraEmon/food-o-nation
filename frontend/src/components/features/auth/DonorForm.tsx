"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeartHandshake, Lock, Check, ChevronRight, ChevronLeft, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import ImageUpload from "@/components/ui/ImageUpload";
import Modal from "@/components/ui/Modal"; // Assuming a Modal component exists

const STEPS = [
  { id: 1, title: "Identity", icon: HeartHandshake },
  { id: 2, title: "Account", icon: Lock },
];

export default function DonorForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState(""); // To store email for OTP verification

  const inputClass = "w-full p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-[#ffb000] focus:outline-none transition-all";

  const [formData, setFormData] = useState({
    email: "", 
    password: "", 
    confirmPassword: "",
    profileImage: null as File | null,
    displayName: "",
    donorType: "INDIVIDUAL",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validateStep = (step: number) => {
    const { displayName, email, password, confirmPassword } = formData;
    
    if (step === 1) {
      if (!displayName || displayName.length < 2) return "Display Name is required (min 2 chars).";
    }
    
    if (step === 2) {
      if (!email || !password) return "Email and Password are required.";
      if (password.length < 8) return "Password must be at least 8 characters.";
      if (password !== confirmPassword) return "Passwords do not match.";
    }
    return null;
  };

  const handleNext = () => {
    const errorMsg = validateStep(currentStep);
    if (errorMsg) return setError(errorMsg);
    setError("");
    setCurrentStep((p) => Math.min(p + 1, 2));
  };

  const handleBack = () => {
    setError("");
    setCurrentStep((p) => Math.max(p - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validateStep(2);
    if (errorMsg) return setError(errorMsg);

    setLoading(true);
    try {
      const { confirmPassword, ...dataToSend } = formData;
      
      const response = await authService.registerDonor(dataToSend);
      if (response.requireVerification) {
        setRegisteredEmail(formData.email);
        setOtpSent(true); // Show OTP modal/form
        alert("Registration successful! Please check your email for your verification code.");
      } else {
        alert("Registration Successful!");
        router.push("/"); // Or redirect to dashboard directly if no OTP
      }
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data) {
          const backendMsg = err.response.data.message || JSON.stringify(err.response.data.errors);
          setError(`Server Error: ${backendMsg}`);
      } else {
          setError("Registration failed. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOtpError("");
    try {
      const response = await authService.verifyOtp({ email: registeredEmail, otp });
      alert(response.message);
      router.push("/dashboard"); // Redirect to dashboard on successful OTP verification
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data) {
          setOtpError(err.response.data.message || "Incorrect or expired OTP.");
      } else {
          setOtpError("OTP verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      
      {/* MILESTONE TRACKER */}
      <div className="mb-10 max-w-sm mx-auto">
        <div className="flex items-center justify-between relative z-10">
          {STEPS.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ease-in-out ${isActive ? "bg-[#ffb000] border-[#ffb000] text-black scale-110 shadow-lg" : isCompleted ? "bg-[#004225] border-[#004225] text-white" : "bg-white border-gray-200 text-gray-400"}`}>
                  {isCompleted ? <Check size={20} /> : <step.icon size={20} />}
                </div>
                <span className={`text-xs font-bold mt-2 uppercase tracking-wider ${isActive ? "text-[#004225] dark:text-[#ffb000]" : "text-gray-400"}`}>{step.title}</span>
              </div>
            );
          })}
        </div>
        <div className="relative -top-9 mx-12 h-1 bg-gray-200 dark:bg-gray-700 -z-0">
          <div className="h-full bg-[#004225] transition-all duration-500 ease-in-out" style={{ width: `${((currentStep - 1) / 1) * 100}%` }} />
        </div>
      </div>

      {error && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-bold flex items-center gap-2">⚠️ {error}</div>}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0a291a] p-8 rounded-2xl shadow-xl border border-[#004225]/10 min-h-[350px]">
        
        {/* STEP 1: IDENTITY */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="text-center mb-6">
                <h3 className="font-heading text-2xl font-bold text-[#004225] dark:text-white">Partner Identity</h3>
                <p className="text-sm text-gray-500">How should we recognize your contributions?</p>
             </div>

             <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex gap-3 text-yellow-800 text-sm">
                <ShieldAlert className="shrink-0" size={20} />
                <p>
                  <strong>Privacy Tip:</strong> We recommend using an alias, organization name, or &quot;Anonymous&quot; instead of your full legal name for public recognition lists.
                </p>
             </div>

             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Display Name <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    name="displayName" 
                    value={formData.displayName} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="e.g. The Green Foundation" 
                  />
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500 uppercase">Donor Type</label>
                   <select name="donorType" value={formData.donorType} onChange={handleChange} className={inputClass}>
                     <option value="INDIVIDUAL">Individual</option>
                     <option value="ORGANIZATION">Organization / Company</option>
                     <option value="GOVERNMENT">Government Unit</option>
                   </select>
                </div>
             </div>
          </div>
        )}

        {/* STEP 2: ACCOUNT */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="text-center mb-6">
                <h3 className="font-heading text-2xl font-bold text-[#004225] dark:text-white">Secure Your Account</h3>
                <p className="text-sm text-gray-500">Set up your login credentials.</p>
             </div>

             {/* Profile Picture Upload */}
             <ImageUpload 
               label="Company Logo / Avatar"
               currentImage={formData.profileImage}
               onImageSelect={(file) => setFormData({ ...formData, profileImage: file })}
             />

             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500 uppercase">Email Address <span className="text-red-500">*</span></label>
                   <input required type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="partner@example.com" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500 uppercase">Password <span className="text-red-500">*</span></label>
                     <input 
                       required 
                       type={showPassword ? "text" : "password"} 
                       name="password" 
                       value={formData.password} 
                       onChange={handleChange} 
                       className={inputClass} 
                       placeholder="••••••••" 
                     />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[10px] text-[#ffb000] font-bold uppercase hover:underline mt-1">
                        {showPassword ? "Hide" : "Show"} Password
                     </button>
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500 uppercase">Confirm Password <span className="text-red-500">*</span></label>
                     <input 
                       required 
                       type={showConfirmPassword ? "text" : "password"} 
                       name="confirmPassword" 
                       value={formData.confirmPassword} 
                       onChange={handleChange} 
                       className={inputClass} 
                       placeholder="••••••••" 
                     />
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* NAVIGATION */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100 dark:border-white/10">
          <Button type="button" variant="ghost" onClick={handleBack} disabled={currentStep === 1} className={`flex items-center gap-2 text-gray-500 hover:text-black ${currentStep === 1 ? "invisible" : ""}`}>
            <ChevronLeft size={18} /> Back
          </Button>
          
          {currentStep < 2 ? (
            <Button type="button" onClick={handleNext} className="bg-[#004225] text-white hover:bg-[#005c35] px-8 py-6 rounded-xl font-bold text-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
              Continue <ChevronRight size={18} />
            </Button>
          ) : (
            <Button type="submit" disabled={loading} className="bg-[#ffb000] text-black hover:bg-[#ffc107] px-8 py-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all w-full md:w-auto">
              {loading ? "Register as Donor" : "Complete Registration"}
            </Button>
          )}
        </div>

      </form>

      {/* OTP Verification Modal */}
      <Modal isOpen={otpSent} onClose={() => setOtpSent(false)} title="Verify Your Account">
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">A 6-digit verification code has been sent to your email address ({registeredEmail}). Please enter it below to complete your registration.</p>
          <input 
            type="text" 
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-[#ffb000] focus:outline-none transition-all text-center text-xl tracking-widest"
            placeholder="_ _ _ _ _ _"
            required
          />
          {otpError && <div className="text-red-500 text-sm">{otpError}</div>}
          <Button type="submit" disabled={loading} className="w-full bg-[#004225] text-white hover:bg-[#005c35] h-12 text-lg font-bold">
            {loading ? "Verifying..." : "Verify Account"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
