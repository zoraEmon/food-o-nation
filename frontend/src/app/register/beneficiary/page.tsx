"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Plus, X, ArrowLeft, AlertTriangle } from "lucide-react";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/authService";
import Modal from "@/components/ui/Modal";

interface HouseholdMember {
  id: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  relationship: string;
}

export default function BeneficiaryRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  const inputClass = "w-full p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-[#ffb000] focus:outline-none transition-all";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const maxDate = yesterday.toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    // Personal
    firstName: "",
    middleName: "",
    lastName: "",
    householdPosition: "",
    householdPositionSpecify: "",
    contactNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    
    // Address (Home Address) - Now all manual inputs
    streetNumber: "",
    barangay: "",
    municipality: "",
    region: "",
    zipCode: "",
    
    governmentIdFile: null as File | null,
    
    // Household
    householdNumber: 1,
    householdMembers: [{ id: '1', fullName: '', dateOfBirth: '', age: 0, relationship: '' }] as HouseholdMember[],
    childrenCount: 0,
    adultsCount: 0,
    seniorsCount: 0,
    pwdCount: 0,
    hasSpecialDiet: false,
    specialDietSpecify: "",
    
    // Economic Status
    annualSalary: "", 
    incomeSources: [] as string[],
    employmentStatus: "",
    receivingAid: false,
    receivingAidSpecify: "",
    
    // Interview
    worriedAboutFood: "",
    ateSmallerPortion: "",
    reliedOnLowCostFood: "",
    skippedMeals: "",
    noFoodAvailable: "",
    childNotEatingEnough: "",
    
    // Authorization
    declarationAccepted: false,
    privacyAccepted: false,
    signature: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      // Simple update for all fields
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setHasUnsavedChanges(true);
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (e.target.name === 'governmentIdFile') setFormData({ ...formData, governmentIdFile: file });
    else if (e.target.name === 'signature') setFormData({ ...formData, signature: file });
  };

  const preventNonInteger = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const addHouseholdMember = () => {
    const newMember: HouseholdMember = { id: Date.now().toString(), fullName: '', dateOfBirth: '', age: 0, relationship: '' };
    setFormData({ ...formData, householdMembers: [...formData.householdMembers, newMember] });
  };

  const removeHouseholdMember = (id: string) => {
    setFormData({ ...formData, householdMembers: formData.householdMembers.filter(m => m.id !== id) });
  };

  const updateHouseholdMember = (id: string, field: keyof HouseholdMember, value: any) => {
    const updated = formData.householdMembers.map(m => {
      if (m.id === id) {
        const updatedMember = { ...m, [field]: value };
        if (field === 'dateOfBirth') updatedMember.age = calculateAge(value);
        return updatedMember;
      }
      return m;
    });
    setFormData({ ...formData, householdMembers: updated });
  };

  const handleIncomeSourceChange = (source: string, checked: boolean) => {
    if (checked) setFormData({ ...formData, incomeSources: [...formData.incomeSources, source] });
    else setFormData({ ...formData, incomeSources: formData.incomeSources.filter(s => s !== source) });
  };
  
  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowWarningModal(true);
    } else {
      router.push('/');
    }
  };
  
  const handleConfirmLeave = () => {
    setShowWarningModal(false);
    router.push('/');
  };

  // Navigation warning
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate passwords
    if (!formData.password || formData.password.length < 12) {
      setError("Password must be at least 12 characters long");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Basic Validation
    if (!formData.firstName || !formData.lastName || !formData.contactNumber || !formData.email || !formData.birthDate || 
        !formData.householdPosition || !formData.streetNumber || !formData.barangay || !formData.municipality ||
        !formData.region || !formData.zipCode || !formData.annualSalary || 
        !formData.employmentStatus || !formData.declarationAccepted || !formData.privacyAccepted || 
        !formData.signature || !formData.governmentIdFile) {
      return setError("Please fill in all required fields and upload necessary documents.");
    }

    setLoading(true);
    
    try {
      // Calculate age from birthDate
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // Map annual salary range to numeric value (convert to float)
      const salaryMap: Record<string, number> = {
        'below_60000': 50000.0,
        '60000_120000': 90000.0,
        '120000_200000': 160000.0,
        '200000_above': 200000.0,
      };
      const householdAnnualSalary = salaryMap[formData.annualSalary] || parseFloat(formData.annualSalary) || 0.0;

      // Prepare household members with proper date formatting
      const householdMembers = formData.householdMembers
        .filter(member => member.fullName && member.dateOfBirth)
        .map(member => ({
          fullName: member.fullName,
          birthDate: new Date(member.dateOfBirth).toISOString(),
          age: member.age,
          relationship: member.relationship
        }));

      // Prepare payload matching backend validator
      const payload = {
        // Required by registerBeneficiarySchema
        email: formData.email,
        password: formData.password,
        
        // Personal
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || '',
        birthDate: birthDate.toISOString(),
        age,
        contactNumber: formData.contactNumber,
        gender: 'OTHER',
        civilStatus: 'SINGLE',
        occupation: 'Applicant',
        
        // Household
        householdNumber: Number(formData.householdNumber),
        householdAnnualSalary,
        householdPosition: formData.householdPosition,
        primaryPhone: formData.contactNumber,
        householdMembers: householdMembers.length > 0 ? householdMembers : undefined,
        
        // Household counts
        childrenCount: formData.childrenCount || 0,
        adultCount: formData.adultsCount || 0,
        seniorCount: formData.seniorsCount || 0,
        pwdCount: formData.pwdCount || 0,
        
        // Diet
        specialDietRequired: formData.hasSpecialDiet || false,
        specialDietDescription: formData.specialDietSpecify || '',
        
        // Economic
        monthlyIncome: householdAnnualSalary / 12,
        incomeSources: formData.incomeSources || [],
        mainEmploymentStatus: formData.employmentStatus || 'UNEMPLOYED',
        receivingAid: formData.receivingAid || false,
        receivingAidDetail: formData.receivingAidSpecify || '',
        
        // Consent
        declarationAccepted: formData.declarationAccepted,
        privacyAccepted: formData.privacyAccepted,
        
        // Address
        streetNumber: formData.streetNumber,
        barangay: formData.barangay,
        municipality: formData.municipality,
        region: formData.region || 'NCR',
        zipCode: formData.zipCode || '0000',
        
        // Files
        governmentIdFile: formData.governmentIdFile,
        signature: formData.signature,
      };

      // Call backend API
      const response = await authService.registerBeneficiary(payload);
      
      if (!response.success) {
        setError(response.message || "Registration failed. Please try again.");
        return;
      }
      
      setRegisteredUserId(response.userId);
      setShowOtpModal(true);
      setHasUnsavedChanges(false);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || "Application failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setOtpLoading(true);
    setError("");

    try {
      await authService.verifyOtp({ email: formData.email, otp });
      alert("Verification successful! Please log in.");
      setShowOtpModal(false);
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
        <AuthNavbar 
          showLoginButton={true}
          loginLink="/login?type=beneficiary"
        />
        <main className="flex-1 flex flex-col items-center justify-center py-16 px-4">
          {/* Back Button Outside Card */}
          <div className="w-full max-w-4xl mb-4">
            <Button
              onClick={handleBackClick}
              variant="ghost"
              className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-secondary flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </Button>
          </div>
          
          <div className="w-full max-w-4xl bg-white dark:bg-[#0a291a] p-8 md:p-12 rounded-2xl shadow-xl border border-primary/10">
            
            <div className="text-center mb-10">
              <h1 className="font-heading text-3xl font-bold text-primary dark:text-white mb-2">
                Beneficiary Application
              </h1>
              <p className="font-sans text-gray-500 dark:text-gray-400">
                Please fill out your details accurately.
              </p>
            </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-bold flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. PERSONAL INFORMATION */}
            <div className="space-y-6">
              <h2 className="font-heading text-2xl font-bold text-[#004225] dark:text-white border-b-2 border-[#004225] pb-2">
                PERSONAL INFORMATION
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Applicant’s Household Position (Select 1 Only) <span className="text-red-500">*</span></label>
                <select name="householdPosition" value={formData.householdPosition} onChange={handleChange} className={inputClass} required>
                  <option value="">Select one...</option>
                  <option value="MOTHER">Mother</option>
                  <option value="FATHER">Father</option>
                  <option value="SON">Son</option>
                  <option value="DAUGHTER">Daughter</option>
                  <option value="GRANDMOTHER">Grandmother</option>
                  <option value="GRANDFATHER">Grandfather</option>
                  <option value="UNCLE">Uncle</option>
                  <option value="AUNTIE">Auntie</option>
                  <option value="OTHER_RELATIVE">Other Relative</option>
                  <option value="NON_RELATIVE_GUARDIAN">Non-Relative Guardian</option>
                </select>
              </div>

              {(formData.householdPosition === 'OTHER_RELATIVE' || formData.householdPosition === 'NON_RELATIVE_GUARDIAN') && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Specify Relationship <span className="text-red-500">*</span></label>
                  <input name="householdPositionSpecify" value={formData.householdPositionSpecify} onChange={handleChange} className={inputClass} placeholder="e.g., Cousin, Nephew, Family Friend" required />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Primary Phone Number <span className="text-red-500">*</span></label>
                <input required name="contactNumber" value={formData.contactNumber} onChange={handleChange} onKeyDown={preventNonInteger} maxLength={11} className={inputClass} placeholder="09XX-XXX-XXXX" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Active Email Address <span className="text-red-500">*</span></label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="hellopuh@gmail.com" />

                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500">Password (minimum 12 characters) <span className="text-red-500">*</span></label>
                              <div className="relative">
                                <input 
                                  required 
                                  type={showPassword ? "text" : "password"} 
                                  name="password" 
                                  value={formData.password} 
                                  onChange={handleChange} 
                                  minLength={12}
                                  className={inputClass} 
                                  placeholder="Enter strong password" 
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

                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500">Confirm Password <span className="text-red-500">*</span></label>
                              <div className="relative">
                                <input 
                                  required 
                                  type={showConfirmPassword ? "text" : "password"} 
                                  name="confirmPassword" 
                                  value={formData.confirmPassword} 
                                  onChange={handleChange} 
                                  minLength={12}
                                  className={inputClass} 
                                  placeholder="Re-enter password" 
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                                </button>
                              </div>
                            </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Date of Birth <span className="text-red-500">*</span></label>
                <input required type="date" name="birthDate" max={maxDate} value={formData.birthDate} onChange={handleChange} className={inputClass} onKeyDown={(e) => e.preventDefault()} />
              </div>

              {/* Home Address Section */}
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <label className="text-sm font-bold text-[#004225]">Home Address</label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Street / House No.</label>
                        <input required name="streetNumber" value={formData.streetNumber} onChange={handleChange} className={inputClass} placeholder="123 Street Name" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">City / Municipality</label>
                        <input required name="municipality" value={formData.municipality} onChange={handleChange} className={inputClass} placeholder="Enter City/Municipality" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Barangay</label>
                        <input required name="barangay" value={formData.barangay} onChange={handleChange} className={inputClass} placeholder="Enter Barangay" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Zip Code</label>
                        <input 
                          name="zipCode" 
                          value={formData.zipCode} 
                          onChange={handleChange} 
                          onKeyDown={preventNonInteger} 
                          maxLength={4} 
                          className={inputClass} 
                          placeholder="e.g. 1101" 
                          required 
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-gray-500">Region</label>
                    <input required name="region" value={formData.region} onChange={handleChange} className={inputClass} placeholder="Enter Region (e.g., NCR)" />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-gray-500">Government ID Verification: [Submit Digital Copy] <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-[#004225] mx-auto mb-2" />
                  <input type="file" accept="image/*,.pdf" name="governmentIdFile" onChange={handleFileChange} className="hidden" id="governmentId" required />
                  <label htmlFor="governmentId" className="cursor-pointer text-[#004225] font-bold hover:text-[#ffb000] text-sm">Click to upload or drag and drop</label>
                  {formData.governmentIdFile && <p className="text-xs text-gray-600 mt-2">{formData.governmentIdFile.name}</p>}
                </div>
              </div>
            </div>

            {/* 2. HOUSEHOLD DETAILS */}
            <div className="space-y-6">
              <h2 className="font-heading text-2xl font-bold text-[#004225] dark:text-white border-b-2 border-[#004225] pb-2">HOUSEHOLD DETAILS</h2>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">A. Total number of people currently living and eating in the household <span className="text-red-500">*</span></label>
                <input required type="number" min="1" name="householdNumber" value={formData.householdNumber} onChange={handleChange} onKeyDown={preventNonInteger} className={inputClass} />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">B. Member List (Add as much as needed)</label>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left font-bold text-[#004225]">Full Name</th>
                        <th className="border border-gray-300 p-2 text-left font-bold text-[#004225]">Date of Birth</th>
                        <th className="border border-gray-300 p-2 text-left font-bold text-[#004225]">Age</th>
                        <th className="border border-gray-300 p-2 text-left font-bold text-[#004225]">Relationship</th>
                        <th className="border border-gray-300 p-2 text-center font-bold text-[#004225]">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.householdMembers.map((member) => (
                        <tr key={member.id}>
                          <td className="border border-gray-300 p-2"><input type="text" value={member.fullName} onChange={(e) => updateHouseholdMember(member.id, 'fullName', e.target.value)} className="w-full p-1 rounded border border-gray-300 text-sm" /></td>
                          <td className="border border-gray-300 p-2"><input type="date" value={member.dateOfBirth} onChange={(e) => updateHouseholdMember(member.id, 'dateOfBirth', e.target.value)} className="w-full p-1 rounded border border-gray-300 text-sm" /></td>
                          <td className="border border-gray-300 p-2"><input type="number" value={member.age || ''} readOnly className="w-full p-1 rounded border border-gray-300 bg-gray-50 text-sm" /></td>
                          <td className="border border-gray-300 p-2">
                            <select value={member.relationship} onChange={(e) => updateHouseholdMember(member.id, 'relationship', e.target.value)} className="w-full p-1 rounded border border-gray-300 text-sm">
                              <option value="">Select...</option>
                              <option value="MOTHER">Mother</option>
                              <option value="FATHER">Father</option>
                              <option value="SON">Son</option>
                              <option value="DAUGHTER">Daughter</option>
                              <option value="GRANDMOTHER">Grandmother</option>
                              <option value="GRANDFATHER">Grandfather</option>
                              <option value="UNCLE">Uncle</option>
                              <option value="AUNTIE">Auntie</option>
                              <option value="OTHER_RELATIVE">Other Relative</option>
                              <option value="NON_RELATIVE_GUARDIAN">Non-Relative Guardian</option>
                            </select>
                          </td>
                          <td className="border border-gray-300 p-2 text-center">{formData.householdMembers.length > 1 && (<button type="button" onClick={() => removeHouseholdMember(member.id)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" onClick={addHouseholdMember} className="mt-2 p-2 border-2 border-dashed border-[#004225] rounded-lg text-[#004225] font-bold hover:bg-[#ffb000]/10 flex items-center justify-center gap-2 text-sm"><Plus className="w-4 h-4" /> Add More</button>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">C. Household Members Age Categories</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1"><label className="text-xs text-gray-500">Children (0-17)</label><input type="number" min="0" name="childrenCount" value={formData.childrenCount} onChange={handleChange} className={inputClass} /></div>
                  <div className="space-y-1"><label className="text-xs text-gray-500">Adults (18-64)</label><input type="number" min="0" name="adultsCount" value={formData.adultsCount} onChange={handleChange} className={inputClass} /></div>
                  <div className="space-y-1"><label className="text-xs text-gray-500">Seniors (65+)</label><input type="number" min="0" name="seniorsCount" value={formData.seniorsCount} onChange={handleChange} className={inputClass} /></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">D. How many people in the household are officially registered as a Person With Disability (PWD)?</label>
                <input type="number" min="0" name="pwdCount" value={formData.pwdCount} onChange={handleChange} className={inputClass} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">E. Does anyone in the household have a medically required special diet or food allergy?</label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2"><input type="radio" name="hasSpecialDiet" checked={formData.hasSpecialDiet === true} onChange={() => setFormData({ ...formData, hasSpecialDiet: true })} className="w-4 h-4" /> Yes</label>
                  <label className="flex items-center gap-2"><input type="radio" name="hasSpecialDiet" checked={formData.hasSpecialDiet === false} onChange={() => setFormData({ ...formData, hasSpecialDiet: false })} className="w-4 h-4" /> No</label>
                </div>
                {formData.hasSpecialDiet && <input name="specialDietSpecify" value={formData.specialDietSpecify} onChange={handleChange} placeholder="Specify" className={inputClass} />}
              </div>
            </div>

            {/* 3. ECONOMIC STATUS */}
            <div className="space-y-6">
              <h2 className="font-heading text-2xl font-bold text-[#004225] dark:text-white border-b-2 border-[#004225] pb-2">ECONOMIC STATUS</h2>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">
                  A. What is the total combined gross annual income of all household members from all sources? <span className="text-red-500">*</span>
                </label>
                <select 
                  name="annualSalary" 
                  value={formData.annualSalary} 
                  onChange={handleChange} 
                  className={inputClass} 
                  required
                >
                  <option value="">Select Range</option>
                  <option value="below_60000">Below ₱60,000</option>
                  <option value="60000_120000">₱60,000 - ₱120,000</option>
                  <option value="120000_200000">₱120,000 - ₱200,000</option>
                  <option value="200000_above">₱200,000 and Above</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">B. Current sources of income (Select all that apply)</label>
                <div className="space-y-2">
                  {['Formal/Salaried Employment', 'Informal/Gig Work (e.g., occasional jobs, vending)', 'Government Assistance/Benefits (e.g., Pension, Disability)', 'Remittances/Financial Help from Family/Friends', 'None (Unemployed and not receiving benefits)'].map((source) => (
                    <label key={source} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input type="checkbox" checked={formData.incomeSources.includes(source)} onChange={(e) => handleIncomeSourceChange(source, e.target.checked)} className="w-4 h-4" />
                      <span className="text-sm">{source}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">C. Employment status of the main working adult (Last 3 months) <span className="text-red-500">*</span></label>
                <select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} className={inputClass} required>
                  <option value="">Select one...</option>
                  <option value="Employed Full-Time">Employed Full-Time</option>
                  <option value="Employed Part-Time">Employed Part-Time</option>
                  <option value="Recently Unemployed">Recently Unemployed</option>
                  <option value="Long-Term Unemployed">Long-Term Unemployed</option>
                  <option value="Retired/Disabled">Retired/Disabled</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">D. Are you currently receiving, or have you recently applied for, any government or NGO food/cash aid?</label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2"><input type="radio" name="receivingAid" checked={formData.receivingAid === true} onChange={() => setFormData({ ...formData, receivingAid: true })} className="w-4 h-4" /> Yes</label>
                  <label className="flex items-center gap-2"><input type="radio" name="receivingAid" checked={formData.receivingAid === false} onChange={() => setFormData({ ...formData, receivingAid: false })} className="w-4 h-4" /> No</label>
                </div>
                {formData.receivingAid && <input name="receivingAidSpecify" value={formData.receivingAidSpecify} onChange={handleChange} placeholder="Specify aid program" className={inputClass} />}
              </div>
            </div>

            {/* 4. BENEFICIARY INTERVIEW */}
            <div className="space-y-6">
              <h2 className="font-heading text-2xl font-bold text-[#004225] dark:text-white border-b-2 border-[#004225] pb-2">BENEFICIARY INTERVIEW</h2>
              <p className="text-sm text-gray-600 italic">Instruction: Indicate how often this happened in the past 30 days.</p>
              {[
                { key: 'worriedAboutFood', label: 'We are worried that the household would not have enough food to eat.' },
                { key: 'ateSmallerPortion', label: 'An adult member had to eat a smaller portion than they felt necessary because there wasn\'t enough food.' },
                { key: 'reliedOnLowCostFood', label: 'We had to rely on just a few kinds of low-cost food (or monotonous food) to feed the household.' },
                { key: 'skippedMeals', label: 'An adult member had to skip entire meals because there wasn\'t enough money or food.' },
                { key: 'noFoodAvailable', label: 'There was never any food to eat of any kind in our household because of a lack of resources.' },
                { key: 'childNotEatingEnough', label: 'A child in the household was not eating enough because we could not afford more food.' },
              ].map((q) => (
                <div key={q.key}>
                  <label className="block text-sm font-bold text-[#004225] mb-2">{q.label}</label>
                  <div className="flex gap-4 flex-wrap">
                    {['Never', 'Rarely', 'Sometimes', 'Often'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2">
                        <input type="radio" name={q.key} value={opt} checked={formData[q.key as keyof typeof formData] === opt} onChange={handleChange} className="w-4 h-4" />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 5. AUTHORIZATION AND DECLARATION */}
            <div className="space-y-6">
              <h2 className="font-heading text-2xl font-bold text-[#004225] dark:text-white border-b-2 border-[#004225] pb-2">AUTHORIZATION AND DECLARATION</h2>
              
              <div className="bg-[#FAF7F0] border-2 border-[#004225] rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="declarationAccepted" checked={formData.declarationAccepted} onChange={handleChange} className="mt-1 w-5 h-5" required />
                  <span className="text-sm"><strong>Declaration:</strong> I declare that all information provided is true and accurate to the best of my knowledge.</span>
                </label>
              </div>

              <div className="bg-[#FAF7F0] border-2 border-[#004225] rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="privacyAccepted" checked={formData.privacyAccepted} onChange={handleChange} className="mt-1 w-5 h-5" required />
                  <span className="text-sm"><strong>Privacy Consent:</strong> I understand and consent that my information will be used solely for program administration, reporting, and coordination of services.</span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Signature: [Insert e-signature] <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-[#004225] mx-auto mb-2" />
                  <input type="file" accept="image/*,.pdf" name="signature" onChange={handleFileChange} className="hidden" id="signatureUpload" required />
                  <label htmlFor="signatureUpload" className="cursor-pointer text-[#004225] font-bold hover:text-[#ffb000] text-sm">Click to upload signature</label>
                  {formData.signature && <p className="text-xs text-gray-600 mt-2">{formData.signature.name}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-white/10">
              <Button type="submit" disabled={loading} className="bg-[#ffb000] text-black hover:bg-[#ffc107] px-8 py-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all">
                {loading ? "Processing..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </div>
      </main>
      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0a291a] rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-[#004225] dark:text-white mb-4">Verify Your Email</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We've sent a 6-digit verification code to <strong>{formData.email}</strong>. Please enter it below.
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