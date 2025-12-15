"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Plus, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

// --- MOCK DATA FOR LOCATIONS ---
interface LocationData {
  barangays: Record<string, string>;
}

const MOCK_LOCATIONS: Record<string, LocationData> = {
  "Quezon City": {
    barangays: {
      "Bagumbayan": "1110", "Batasan Hills": "1126", "Commonwealth": "1121", 
      "Holy Spirit": "1127", "Loyola Heights": "1108", "Pinyahan": "1100", 
      "San Jose": "1115", "Tandang Sora": "1116"
    }
  },
  "Manila": {
    barangays: {
      "Binondo": "1006", "Ermita": "1000", "Intramuros": "1002", "Malate": "1004", 
      "Paco": "1007", "Pandacan": "1011", "Port Area": "1018", "Quiapo": "1001", 
      "Sampaloc": "1008", "San Miguel": "1005"
    }
  },
  "Makati": {
    barangays: {
      "Bangkal": "1233", "Bel-Air": "1209", "Carmona": "1207", "Dasmarinas": "1222", 
      "Forbes Park": "1219", "Poblacion": "1210"
    }
  },
  "Taguig": {
    barangays: {
      "Fort Bonifacio": "1630", "Upper Bicutan": "1633", "Western Bicutan": "1630", "Pinagsama": "1630"
    }
  },
  "Taytay": {
    barangays: { "Dolores": "1920", "Muzon": "1920", "San Isidro": "1920", "San Juan": "1920" }
  }
};

const PH_REGIONS = [
  "NCR (National Capital Region)", "CAR (Cordillera Administrative Region)", "Region I (Ilocos Region)",
  "Region II (Cagayan Valley)", "Region III (Central Luzon)", "Region IV-A (CALABARZON)",
  "Region IV-B (MIMAROPA)", "Region V (Bicol Region)", "Region VI (Western Visayas)",
  "Region VII (Central Visayas)", "Region VIII (Eastern Visayas)", "Region IX (Zamboanga Peninsula)",
  "Region X (Northern Mindanao)", "Region XI (Davao Region)", "Region XII (SOCCSKSARGEN)",
  "Region XIII (Caraga)", "BARMM"
];

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
  const [availableBarangays, setAvailableBarangays] = useState<string[]>([]);
  
  const inputClass = "w-full p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-[#ffb000] focus:outline-none transition-all";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const maxDate = yesterday.toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    // Personal
    applicantName: "",
    householdPosition: "",
    householdPositionSpecify: "",
    contactNumber: "",
    email: "",
    birthDate: "",
    
    // Address (Home Address)
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
    monthlyIncomeRange: "", // Changed from number to string for Range
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
      setFormData(prev => ({ ...prev, [name]: value }));

      // Auto-Populate Logic
      if (name === 'municipality') {
        const cityData = MOCK_LOCATIONS[value];
        if (cityData) {
            setAvailableBarangays(Object.keys(cityData.barangays));
            setFormData(prev => ({ ...prev, municipality: value, barangay: "", zipCode: "" }));
        } else {
            setAvailableBarangays([]);
            setFormData(prev => ({ ...prev, municipality: value, barangay: "", zipCode: "" }));
        }
      }

      if (name === 'barangay') {
        const currentCity = formData.municipality;
        const cityData = MOCK_LOCATIONS[currentCity];
        if (cityData && cityData.barangays[value]) {
            setFormData(prev => ({ ...prev, barangay: value, zipCode: cityData.barangays[value] }));
        }
      }
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic Validation
    if (!formData.applicantName || !formData.contactNumber || !formData.email || !formData.birthDate || 
        !formData.householdPosition || !formData.streetNumber || !formData.barangay || !formData.municipality ||
        !formData.region || !formData.zipCode || !formData.monthlyIncomeRange || 
        !formData.employmentStatus || !formData.declarationAccepted || !formData.privacyAccepted || 
        !formData.signature || !formData.governmentIdFile) {
      return setError("Please fill in all required fields and upload necessary documents.");
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const nameParts = formData.applicantName.split(',');
      const lastName = nameParts[0]?.trim() || '';
      const firstName = nameParts[1]?.trim().split(' ')[0] || '';

      localStorage.setItem('token', 'dev-bypass-token');
      localStorage.setItem('user', JSON.stringify({
        id: `beneficiary-${Date.now()}`,
        email: formData.email,
        role: 'BENEFICIARY',
        status: 'PENDING',
        displayName: `${firstName} ${lastName}`
      }));
      
      alert("Application Submitted! Redirecting to your dashboard...");
      router.push("/donor/beneficiarydashboard/beneficiarydashboard");
    } catch (err: any) {
      setError("Application failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
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
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">
                  Applicant Name: [Surname, First Name, Middle Name] <span className="text-red-500">*</span>
                </label>
                <input required name="applicantName" value={formData.applicantName} onChange={handleChange} className={inputClass} placeholder="Dela Cruz, Juan Santos" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Applicant’s Household Position (Select 1 Only) <span className="text-red-500">*</span></label>
                <select name="householdPosition" value={formData.householdPosition} onChange={handleChange} className={inputClass} required>
                  <option value="">Select one...</option>
                  <option value="parent_mother">Parent/Legal Guardian (Mother)</option>
                  <option value="parent_father">Parent/Legal Guardian (Father)</option>
                  <option value="other_relative">Other Adult Relative</option>
                  <option value="non_relative">Non-Relative Guardian</option>
                </select>
              </div>

              {(formData.householdPosition === 'other_relative' || formData.householdPosition === 'non_relative') && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Specify <span className="text-red-500">*</span></label>
                  <input name="householdPositionSpecify" value={formData.householdPositionSpecify} onChange={handleChange} className={inputClass} placeholder="Specify relationship" required />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Primary Phone Number <span className="text-red-500">*</span></label>
                <input required name="contactNumber" value={formData.contactNumber} onChange={handleChange} onKeyDown={preventNonInteger} maxLength={11} className={inputClass} placeholder="09XX-XXX-XXXX" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Active Email Address <span className="text-red-500">*</span></label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="hellopuh@gmail.com" />
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
                        <select required name="municipality" value={formData.municipality} onChange={handleChange} className={inputClass}>
                            <option value="">Select City</option>
                            {Object.keys(MOCK_LOCATIONS).map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Barangay</label>
                        <select required name="barangay" value={formData.barangay} onChange={handleChange} className={inputClass} disabled={!formData.municipality}>
                            <option value="">{formData.municipality ? "Select Barangay" : "Select City First"}</option>
                            {availableBarangays.map((brgy) => <option key={brgy} value={brgy}>{brgy}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Zip Code (Auto)</label>
                        <input name="zipCode" value={formData.zipCode} onChange={handleChange} onKeyDown={preventNonInteger} maxLength={4} className={inputClass} placeholder="e.g. 1101" required />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-gray-500">Region</label>
                    <select name="region" value={formData.region} onChange={handleChange} className={inputClass} required>
                        <option value="">Select Region</option>
                        {PH_REGIONS.map((region) => <option key={region} value={region}>{region}</option>)}
                    </select>
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
                          <td className="border border-gray-300 p-2"><input type="text" value={member.relationship} onChange={(e) => updateHouseholdMember(member.id, 'relationship', e.target.value)} className="w-full p-1 rounded border border-gray-300 text-sm" /></td>
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
                  A. What is the total combined gross monthly income of all household members from all sources? <span className="text-red-500">*</span>
                </label>
                <select 
                  name="monthlyIncomeRange" 
                  value={formData.monthlyIncomeRange} 
                  onChange={handleChange} 
                  className={inputClass} 
                  required
                >
                  <option value="">Select Range</option>
                  <option value="P5,000 and Below">P5,000 and Below</option>
                  <option value="P5,001 to P13,100">P5,001 to P13,100</option>
                  <option value="P13,101 to P19,650">P13,101 to P19,650</option>
                  <option value="P19,651 and Above">P19,651 and Above</option>
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
      <Footer />
    </div>
  );
}