"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Home, MapPin, Lock, Check, ChevronRight, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import ImageUpload from "@/components/ui/ImageUpload";
import Modal from "@/components/ui/Modal"; // Assuming a Modal component exists

const STEPS = [
  { id: 1, title: "Personal", icon: User },
  { id: 2, title: "Household", icon: Home },
  { id: 3, title: "Address", icon: MapPin },
  { id: 4, title: "Account", icon: Lock },
];

export default function BeneficiaryForm() {
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

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const maxDate = yesterday.toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    email: "", 
    password: "", 
    confirmPassword: "",
    profileImage: null as File | null,
    firstName: "", lastName: "", middleName: "", contactNumber: "",
    birthDate: "", gender: "MALE", civilStatus: "SINGLE", occupation: "",
    householdNumber: 1, householdAnnualSalary: 0,
    streetNumber: "", barangay: "", municipality: "", region: "", zipCode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const preventNonInteger = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  };

  const preventNonCurrency = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    if (e.key === "." && !formData.householdAnnualSalary.toString().includes(".")) return;
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  };

  const validateStep = (step: number) => {
    const { firstName, lastName, birthDate, contactNumber, occupation, householdNumber, streetNumber, barangay, municipality, email, password, confirmPassword } = formData;
    
    if (step === 1 && (!firstName || !lastName || !birthDate || !contactNumber)) return "Please fill in all required personal details.";
    if (step === 2 && (!occupation || householdNumber < 1)) return "Please provide valid household information.";
    if (step === 3 && (!streetNumber || !barangay || !municipality)) return "Please provide a complete address.";
    
    if (step === 4) {
      if (!email || !password) return "Email and Password are required.";
      if (password.length < 6) return "Password must be at least 6 characters.";
      if (password !== confirmPassword) return "Passwords do not match.";
    }
    return null;
  };

  const handleNext = () => {
    const errorMsg = validateStep(currentStep);
    if (errorMsg) return setError(errorMsg);
    setError("");
    setCurrentStep((p) => Math.min(p + 1, 4));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setError("");
    setCurrentStep((p) => Math.max(p - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validateStep(4);
    if (errorMsg) return setError(errorMsg);

    setLoading(true);
    try {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      if (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) age--;

      const { confirmPassword, ...dataToSend } = formData;

      const payload = {
        ...dataToSend,
        age,
        householdAnnualSalary: Number(formData.householdAnnualSalary),
        householdNumber: Number(formData.householdNumber),
        birthDate: birthDate.toISOString(),
      };

      const response = await authService.registerBeneficiary(payload);
      console.log("Beneficiary Registration Response:", response);
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
      <div className="mb-8">
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
        <div className="relative -top-9 mx-10 h-1 bg-gray-200 dark:bg-gray-700 -z-0">
          <div className="h-full bg-[#004225] transition-all duration-500 ease-in-out" style={{ width: `${((currentStep - 1) / 3) * 100}%` }} />
        </div>
      </div>

      {error && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-bold flex items-center gap-2">⚠️ {error}</div>}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0a291a] p-8 rounded-2xl shadow-xl border border-[#004225]/10 min-h-[400px]">
        
        {/* STEP 1: PERSONAL */}
        {currentStep === 1 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <h3 className="font-heading text-2xl font-bold text-[#004225] dark:text-white">Personal Information</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">First Name <span className="text-red-500">*</span></label>
                  <input required name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} placeholder="Juan" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Middle Name</label>
                  <input name="middleName" value={formData.middleName} onChange={handleChange} className={inputClass} placeholder="Santos" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Last Name <span className="text-red-500">*</span></label>
                  <input required name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} placeholder="Dela Cruz" />
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Birth Date <span className="text-red-500">*</span></label>
                  <input required type="date" name="birthDate" max={maxDate} value={formData.birthDate} onChange={handleChange} className={inputClass} onKeyDown={(e) => e.preventDefault()} />
                  <p className="text-[10px] text-gray-400">Must be a date before today.</p>
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500">Mobile Number <span className="text-red-500">*</span></label>
                   <input required name="contactNumber" value={formData.contactNumber} onChange={handleChange} className={inputClass} placeholder="0912..." />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">Civil Status</label>
                    <select name="civilStatus" value={formData.civilStatus} onChange={handleChange} className={inputClass}>
                      <option value="SINGLE">Single</option>
                      <option value="MARRIED">Married</option>
                      <option value="WIDOWED">Widowed</option>
                      <option value="SEPARATED">Separated</option>
                    </select>
                 </div>
             </div>
          </div>
        )}

        {/* STEP 2: HOUSEHOLD */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="font-heading text-2xl font-bold text-[#004225] dark:text-white">Household Details</h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">Occupation <span className="text-red-500">*</span></label>
              <input required name="occupation" value={formData.occupation} onChange={handleChange} className={inputClass} placeholder="e.g. Farmer, Tricycle Driver" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Household Members <span className="text-red-500">*</span></label>
                <input required type="number" min="1" name="householdNumber" value={formData.householdNumber} onChange={handleChange} onKeyDown={preventNonInteger} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Annual Income (PHP)</label>
                <input required type="number" min="0" step="0.01" name="householdAnnualSalary" value={formData.householdAnnualSalary} onChange={handleChange} onKeyDown={preventNonCurrency} className={inputClass} placeholder="0.00" />
              </div>
            </div>
          </div>
        </div>
        )}

        {/* STEP 3: ADDRESS */}
        {currentStep === 3 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <h3 className="font-heading text-2xl font-bold text-[#004225] dark:text-white">Current Address</h3>
             <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Street / House No. <span className="text-red-500">*</span></label>
                  <input required name="streetNumber" value={formData.streetNumber} onChange={handleChange} className={inputClass} placeholder="123 Street Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Barangay <span className="text-red-500">*</span></label>
                  <input required name="barangay" value={formData.barangay} onChange={handleChange} className={inputClass} placeholder="Barangay Name" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500">City / Municipality <span className="text-red-500">*</span></label>
                      <input required name="municipality" value={formData.municipality} onChange={handleChange} className={inputClass} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500">Zip Code</label>
                      <input name="zipCode" value={formData.zipCode} onChange={handleChange} className={inputClass} />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500">Region</label>
                   <input name="region" value={formData.region} onChange={handleChange} className={inputClass} placeholder="e.g. NCR" />
                </div>
             </div>
          </div>
        )}

        {/* STEP 4: ACCOUNT */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <h3 className="font-heading text-2xl font-bold text-[#004225] dark:text-white">Account Security</h3>
             
             {/* ✅ REUSABLE CAMERA COMPONENT */}
             <ImageUpload 
               currentImage={formData.profileImage}
               onImageSelect={(file) => setFormData({ ...formData, profileImage: file })}
             />

             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500">Email Address <span className="text-red-500">*</span></label>
                   <input required type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="juan@example.com" />
                </div>
                
                {/* PASSWORD */}
                <div className="space-y-2 relative">
                   <label className="text-xs font-bold text-gray-500">Password <span className="text-red-500">*</span></label>
                   <div className="relative">
                     <input 
                       required 
                       type={showPassword ? "text" : "password"} 
                       name="password" 
                       value={formData.password} 
                       onChange={handleChange} 
                       className={inputClass} 
                       placeholder="••••••••" 
                     />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                       {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                     </button>
                   </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="space-y-2 relative">
                   <label className="text-xs font-bold text-gray-500">Confirm Password <span className="text-red-500">*</span></label>
                   <div className="relative">
                     <input 
                       required 
                       type={showConfirmPassword ? "text" : "password"} 
                       name="confirmPassword" 
                       value={formData.confirmPassword} 
                       onChange={handleChange} 
                       className={inputClass} 
                       placeholder="••••••••" 
                     />
                     <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                       {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                     </button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* NAVIGATION BUTTONS */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100 dark:border-white/10">
          <Button type="button" variant="ghost" onClick={handleBack} disabled={currentStep === 1} className={`flex items-center gap-2 text-gray-500 hover:text-black ${currentStep === 1 ? "invisible" : ""}`}>
            <ChevronLeft size={18} /> Back
          </Button>
          {currentStep < 4 ? (
            <Button type="button" onClick={handleNext} className="bg-[#004225] text-white hover:bg-[#005c35] px-8 py-6 rounded-xl font-bold text-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
              Continue <ChevronRight size={18} />
            </Button>
          ) : (
            <Button type="submit" disabled={loading} className="bg-[#ffb000] text-black hover:bg-[#ffc107] px-8 py-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all w-full md:w-auto">
              {loading ? "Processing..." : "Complete Registration"}
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
