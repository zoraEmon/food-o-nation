"use client";

import React, { useState } from 'react';
import { Plus, X, Upload, FileText, User, Users, DollarSign, ClipboardCheck, PenTool, ChevronRight } from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';

interface HouseholdMember {
  id: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  relationship: string;
}

interface ApplicationFormData {
  // Personal Information
  applicantName: string;
  householdPosition: string;
  householdPositionSpecify: string;
  primaryPhoneNumber: string;
  activeEmailAddress: string;
  governmentIdFile: File | null;

  // Household Details
  totalHouseholdMembers: number;
  householdMembers: HouseholdMember[];
  childrenCount: number;
  adultsCount: number;
  seniorsCount: number;
  pwdCount: number;
  hasSpecialDiet: boolean;
  specialDietSpecify: string;

  // Economic Status
  totalMonthlyIncome: number;
  incomeSources: string[];
  employmentStatus: string;
  receivingAid: boolean;
  receivingAidSpecify: string;

  // Beneficiary Interview (Food Security Questions)
  worriedAboutFood: string;
  ateSmallerPortion: string;
  reliedOnLowCostFood: string;
  skippedMeals: string;
  noFoodAvailable: string;
  childNotEatingEnough: string;

  // Authorization
  declarationAccepted: boolean;
  privacyAccepted: boolean;
  signature: string;
}

export default function BeneficiaryApplicationForm({ userData, onSubmit }: { userData: any, onSubmit?: (data: ApplicationFormData) => void }) {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<ApplicationFormData>({
    applicantName: userData?.name || '',
    householdPosition: '',
    householdPositionSpecify: '',
    primaryPhoneNumber: '',
    activeEmailAddress: userData?.email || '',
    governmentIdFile: null,
    totalHouseholdMembers: 1,
    householdMembers: [{ id: '1', fullName: '', dateOfBirth: '', age: 0, relationship: '' }],
    childrenCount: 0,
    adultsCount: 0,
    seniorsCount: 0,
    pwdCount: 0,
    hasSpecialDiet: false,
    specialDietSpecify: '',
    totalMonthlyIncome: 0,
    incomeSources: [],
    employmentStatus: '',
    receivingAid: false,
    receivingAidSpecify: '',
    worriedAboutFood: '',
    ateSmallerPortion: '',
    reliedOnLowCostFood: '',
    skippedMeals: '',
    noFoodAvailable: '',
    childNotEatingEnough: '',
    declarationAccepted: false,
    privacyAccepted: false,
    signature: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof ApplicationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleArrayChange = (field: keyof ApplicationFormData, value: string, checked: boolean) => {
    const currentArray = (formData[field] as string[]) || [];
    if (checked) {
      handleInputChange(field, [...currentArray, value]);
    } else {
      handleInputChange(field, currentArray.filter(item => item !== value));
    }
  };

  const addHouseholdMember = () => {
    const newMember: HouseholdMember = {
      id: Date.now().toString(),
      fullName: '',
      dateOfBirth: '',
      age: 0,
      relationship: ''
    };
    handleInputChange('householdMembers', [...formData.householdMembers, newMember]);
  };

  const removeHouseholdMember = (id: string) => {
    handleInputChange('householdMembers', formData.householdMembers.filter(m => m.id !== id));
  };

  const updateHouseholdMember = (id: string, field: keyof HouseholdMember, value: any) => {
    const updated = formData.householdMembers.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    );
    handleInputChange('householdMembers', updated);
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const validateSection = (section: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (section === 1) {
      if (!formData.applicantName) newErrors.applicantName = 'Required';
      if (!formData.householdPosition) newErrors.householdPosition = 'Required';
      if (!formData.primaryPhoneNumber) newErrors.primaryPhoneNumber = 'Required';
      if (!formData.activeEmailAddress) newErrors.activeEmailAddress = 'Required';
    }
    
    if (section === 2) {
      if (formData.totalHouseholdMembers < 1) newErrors.totalHouseholdMembers = 'Must be at least 1';
      if (formData.householdMembers.some(m => !m.fullName || !m.dateOfBirth || !m.relationship)) {
        newErrors.householdMembers = 'Please complete all household member information';
      }
    }
    
    if (section === 3) {
      if (!formData.employmentStatus) newErrors.employmentStatus = 'Required';
    }
    
    if (section === 5) {
      if (!formData.declarationAccepted || !formData.privacyAccepted) {
        newErrors.declaration = 'Please accept both declarations';
      }
      if (!formData.signature.trim()) newErrors.signature = 'Signature is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      setCurrentSection(prev => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentSection(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSection(5)) {
      if (onSubmit) {
        onSubmit(formData);
      } else {
        // Default: log and show success message
        console.log('Form submitted:', formData);
        alert('Application submitted successfully! Your information has been saved.');
      }
    }
  };

  const sections = [
    { id: 1, title: 'Personal Information', icon: User },
    { id: 2, title: 'Household Details', icon: Users },
    { id: 3, title: 'Economic Status', icon: DollarSign },
    { id: 4, title: 'Beneficiary Interview', icon: ClipboardCheck },
    { id: 5, title: 'Authorization', icon: PenTool },
  ];

  return (
    <div className="bg-white border-2 border-[#004225] rounded-2xl p-6 lg:p-8 shadow-xl">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {sections.map((section, idx) => (
            <React.Fragment key={section.id}>
              <div className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all ${
                  currentSection === section.id 
                    ? 'bg-[#FFB000] border-[#FFB000] text-[#004225] scale-110' 
                    : currentSection > section.id
                    ? 'bg-[#004225] border-[#004225] text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {currentSection > section.id ? <X className="w-6 h-6" /> : <section.icon className="w-6 h-6" />}
                </div>
                <span className={`text-xs font-bold mt-2 ${currentSection >= section.id ? 'text-[#004225]' : 'text-gray-400'}`}>
                  {section.title}
                </span>
              </div>
              {idx < sections.length - 1 && (
                <div className={`flex-1 h-1 mx-2 ${currentSection > section.id ? 'bg-[#004225]' : 'bg-gray-300'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: PERSONAL INFORMATION */}
        {currentSection === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#004225] border-b-2 border-[#004225] pb-3">
              Personal Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#004225] mb-2">
                  Applicant Name: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.applicantName}
                  onChange={(e) => handleInputChange('applicantName', e.target.value)}
                  placeholder="Surname, First Name, Middle Name"
                  className={`w-full p-3 rounded-lg border-2 ${errors.applicantName ? 'border-red-500' : 'border-[#004225]'} focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20`}
                  required
                />
                {errors.applicantName && <p className="text-red-500 text-sm mt-1">{errors.applicantName}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#004225] mb-2">
                  Applicant's Household Position: <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.householdPosition}
                  onChange={(e) => handleInputChange('householdPosition', e.target.value)}
                  className={`w-full p-3 rounded-lg border-2 ${errors.householdPosition ? 'border-red-500' : 'border-[#004225]'} focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20`}
                  required
                >
                  <option value="">Select one...</option>
                  <option value="parent_mother">Parent/Legal Guardian (Mother)</option>
                  <option value="parent_father">Parent/Legal Guardian (Father)</option>
                  <option value="other_relative">Other Adult Relative</option>
                  <option value="non_relative">Non-Relative Guardian</option>
                </select>
                {errors.householdPosition && <p className="text-red-500 text-sm mt-1">{errors.householdPosition}</p>}
              </div>

              {(formData.householdPosition === 'other_relative' || formData.householdPosition === 'non_relative') && (
                <div>
                  <label className="block text-sm font-bold text-[#004225] mb-2">
                    Specify Relationship: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.householdPositionSpecify}
                    onChange={(e) => handleInputChange('householdPositionSpecify', e.target.value)}
                    placeholder="e.g., Grandmother, Uncle, etc."
                    className="w-full p-3 rounded-lg border-2 border-[#004225] focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-[#004225] mb-2">
                  Primary Phone Number: <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.primaryPhoneNumber}
                  onChange={(e) => handleInputChange('primaryPhoneNumber', e.target.value)}
                  placeholder="09XX-XXX-XXXX"
                  pattern="09[0-9]{2}-[0-9]{3}-[0-9]{4}"
                  className={`w-full p-3 rounded-lg border-2 ${errors.primaryPhoneNumber ? 'border-red-500' : 'border-[#004225]'} focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20`}
                  required
                />
                {errors.primaryPhoneNumber && <p className="text-red-500 text-sm mt-1">{errors.primaryPhoneNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#004225] mb-2">
                  Active Email Address: <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.activeEmailAddress}
                  onChange={(e) => handleInputChange('activeEmailAddress', e.target.value)}
                  className={`w-full p-3 rounded-lg border-2 ${errors.activeEmailAddress ? 'border-red-500' : 'border-[#004225]'} focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20`}
                  required
                />
                {errors.activeEmailAddress && <p className="text-red-500 text-sm mt-1">{errors.activeEmailAddress}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#004225] mb-2">
                  Government ID Verification: <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-[#004225] rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-[#004225] mx-auto mb-2" />
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleInputChange('governmentIdFile', e.target.files?.[0] || null)}
                    className="hidden"
                    id="governmentId"
                    required
                  />
                  <label htmlFor="governmentId" className="cursor-pointer text-[#004225] font-bold hover:text-[#FFB000]">
                    Click to upload or drag and drop
                  </label>
                  {formData.governmentIdFile && (
                    <p className="text-sm text-gray-600 mt-2">{formData.governmentIdFile.name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: HOUSEHOLD DETAILS */}
        {currentSection === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#004225] border-b-2 border-[#004225] pb-3">
              Household Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#004225] mb-2">
                  A. Total number of people currently living and eating in the household: <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalHouseholdMembers}
                  onChange={(e) => handleInputChange('totalHouseholdMembers', parseInt(e.target.value) || 1)}
                  className={`w-full p-3 rounded-lg border-2 ${errors.totalHouseholdMembers ? 'border-red-500' : 'border-[#004225]'} focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20`}
                  required
                />
                {errors.totalHouseholdMembers && <p className="text-red-500 text-sm mt-1">{errors.totalHouseholdMembers}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#004225] mb-2">
                  B. Member List:
                </label>
                <div className="space-y-4">
                  {formData.householdMembers.map((member, idx) => (
                    <div key={member.id} className="border-2 border-[#004225] rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-[#004225]">Member {idx + 1}</span>
                        {formData.householdMembers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeHouseholdMember(member.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={member.fullName}
                          onChange={(e) => updateHouseholdMember(member.id, 'fullName', e.target.value)}
                          className="p-2 rounded border-2 border-[#004225] focus:border-[#FFB000]"
                          required
                        />
                        <input
                          type="date"
                          value={member.dateOfBirth}
                          onChange={(e) => {
                            const dob = e.target.value;
                            updateHouseholdMember(member.id, 'dateOfBirth', dob);
                            updateHouseholdMember(member.id, 'age', calculateAge(dob));
                          }}
                          className="p-2 rounded border-2 border-[#004225] focus:border-[#FFB000]"
                          required
                        />
                        <input
                          type="number"
                          placeholder="Age"
                          value={member.age || ''}
                          readOnly
                          className="p-2 rounded border-2 border-gray-300 bg-gray-50"
                        />
                        <input
                          type="text"
                          placeholder="Relationship"
                          value={member.relationship}
                          onChange={(e) => updateHouseholdMember(member.id, 'relationship', e.target.value)}
                          className="p-2 rounded border-2 border-[#004225] focus:border-[#FFB000]"
                          required
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addHouseholdMember}
                    className="w-full p-3 border-2 border-dashed border-[#004225] rounded-lg text-[#004225] font-bold hover:bg-[#FFB000]/10 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Add More
                  </button>
                </div>
                {errors.householdMembers && <p className="text-red-500 text-sm mt-1">{errors.householdMembers}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#004225] mb-2">
                    C. Children (Ages 0-17):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.childrenCount}
                    onChange={(e) => handleInputChange('childrenCount', parseInt(e.target.value) || 0)}
                    className="w-full p-3 rounded-lg border-2 border-[#004225] focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#004225] mb-2">
                    Adults (Ages 18-64):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.adultsCount}
                    onChange={(e) => handleInputChange('adultsCount', parseInt(e.target.value) || 0)}
                    className="w-full p-3 rounded-lg border-2 border-[#004225] focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#004225] mb-2">
                    Seniors (Ages 65+):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.seniorsCount}
                    onChange={(e) => handleInputChange('seniorsCount', parseInt(e.target.value) || 0)}
                    className="w-full p-3 rounded-lg border-2 border-[#004225] focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#004225] mb-2">
                  D. How many people in the household are officially registered as PWD?
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.pwdCount}
                  onChange={(e) => handleInputChange('pwdCount', parseInt(e.target.value) || 0)}
                  className="w-full p-3 rounded-lg border-2 border-[#004225] focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#004225] mb-2">
                  E. Does anyone in the household have a medically required special diet or food allergy?
                </label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="hasSpecialDiet"
                      checked={formData.hasSpecialDiet === true}
                      onChange={() => handleInputChange('hasSpecialDiet', true)}
                      className="w-4 h-4 text-[#FFB000]"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="hasSpecialDiet"
                      checked={formData.hasSpecialDiet === false}
                      onChange={() => handleInputChange('hasSpecialDiet', false)}
                      className="w-4 h-4 text-[#FFB000]"
                    />
                    <span>No</span>
                  </label>
                </div>
                {formData.hasSpecialDiet && (
                  <input
                    type="text"
                    placeholder="Specify special diet or allergy"
                    value={formData.specialDietSpecify}
                    onChange={(e) => handleInputChange('specialDietSpecify', e.target.value)}
                    className="w-full p-3 rounded-lg border-2 border-[#004225] focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: ECONOMIC STATUS */}
        {currentSection === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#004225] border-b-2 border-[#004225] pb-3">
              Economic Status
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#004225] mb-2">
                  A. What is the total combined gross monthly income of all household members from all sources?
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalMonthlyIncome}
                  onChange={(e) => handleInputChange('totalMonthlyIncome', parseFloat(e.target.value) || 0)}
                  className="w-full p-3 rounded-lg border-2 border-[#004225] focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#004225] mb-2">
                  B. What are the current sources of income for the household? (Select all that apply.)
                </label>
                <div className="space-y-2">
                  {['Formal/Salaried Employment', 'Informal/Gig Work', 'Government Assistance/Benefits', 'Remittances/Financial Help from Family/Friends', 'None (Unemployed and not receiving benefits)'].map((source) => (
                    <label key={source} className="flex items-center gap-2 p-2 hover:bg-[#FAF7F0] rounded">
                      <input
                        type="checkbox"
                        checked={formData.incomeSources.includes(source)}
                        onChange={(e) => handleArrayChange('incomeSources', source, e.target.checked)}
                        className="w-4 h-4 text-[#FFB000]"
                      />
                      <span>{source}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#004225] mb-2">
                  C. What is the current employment status of the main working adult in the household? <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.employmentStatus}
                  onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
                  className={`w-full p-3 rounded-lg border-2 ${errors.employmentStatus ? 'border-red-500' : 'border-[#004225]'} focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20`}
                  required
                >
                  <option value="">Select one...</option>
                  <option value="employed_fulltime">Employed Full-Time</option>
                  <option value="employed_parttime">Employed Part-Time</option>
                  <option value="recently_unemployed">Recently Unemployed</option>
                  <option value="longterm_unemployed">Long-Term Unemployed</option>
                  <option value="retired_disabled">Retired/Disabled</option>
                </select>
                {errors.employmentStatus && <p className="text-red-500 text-sm mt-1">{errors.employmentStatus}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#004225] mb-2">
                  D. Are you currently receiving, or have you recently applied for, any government or NGO food/cash aid?
                </label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="receivingAid"
                      checked={formData.receivingAid === true}
                      onChange={() => handleInputChange('receivingAid', true)}
                      className="w-4 h-4 text-[#FFB000]"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="receivingAid"
                      checked={formData.receivingAid === false}
                      onChange={() => handleInputChange('receivingAid', false)}
                      className="w-4 h-4 text-[#FFB000]"
                    />
                    <span>No</span>
                  </label>
                </div>
                {formData.receivingAid && (
                  <input
                    type="text"
                    placeholder="Specify aid program"
                    value={formData.receivingAidSpecify}
                    onChange={(e) => handleInputChange('receivingAidSpecify', e.target.value)}
                    className="w-full p-3 rounded-lg border-2 border-[#004225] focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: BENEFICIARY INTERVIEW */}
        {currentSection === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#004225] border-b-2 border-[#004225] pb-3">
              Beneficiary Interview
            </h2>
            <p className="text-sm text-gray-600 italic">
              Instruction: For the following questions, please indicate how often this happened to your household in the past 30 days.
            </p>

            <div className="space-y-6">
              {[
                { key: 'worriedAboutFood', label: 'We are worried that the household would not have enough food to eat.' },
                { key: 'ateSmallerPortion', label: 'An adult member had to eat a smaller portion than they felt necessary because there wasn\'t enough food.' },
                { key: 'reliedOnLowCostFood', label: 'We had to rely on just a few kinds of low-cost food (or monotonous food) to feed the household.' },
                { key: 'skippedMeals', label: 'An adult member had to skip entire meals because there wasn\'t enough money or food.' },
                { key: 'noFoodAvailable', label: 'There was never any food to eat of any kind in our household because of a lack of resources.' },
                { key: 'childNotEatingEnough', label: 'A child in the household was not eating enough because we could not afford more food.' },
              ].map((question) => (
                <div key={question.key}>
                  <label className="block text-sm font-bold text-[#004225] mb-2">
                    {question.label}
                  </label>
                  <div className="flex gap-4">
                    {['Never', 'Rarely', 'Sometimes', 'Often'].map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={question.key}
                          value={option.toLowerCase()}
                          checked={(formData[question.key as keyof ApplicationFormData] as string) === option.toLowerCase()}
                          onChange={(e) => handleInputChange(question.key as keyof ApplicationFormData, e.target.value)}
                          className="w-4 h-4 text-[#FFB000]"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: AUTHORIZATION */}
        {currentSection === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#004225] border-b-2 border-[#004225] pb-3">
              Authorization and Declaration
            </h2>

            <div className="space-y-4">
              <div className="bg-[#FAF7F0] border-2 border-[#004225] rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.declarationAccepted}
                    onChange={(e) => handleInputChange('declarationAccepted', e.target.checked)}
                    className="mt-1 w-5 h-5 text-[#FFB000]"
                    required
                  />
                  <span className="text-sm">
                    <strong>Declaration:</strong> I declare that all information provided is true and accurate to the best of my knowledge.
                  </span>
                </label>
              </div>

              <div className="bg-[#FAF7F0] border-2 border-[#004225] rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.privacyAccepted}
                    onChange={(e) => handleInputChange('privacyAccepted', e.target.checked)}
                    className="mt-1 w-5 h-5 text-[#FFB000]"
                    required
                  />
                  <span className="text-sm">
                    <strong>Privacy Consent:</strong> I understand and consent that my information will be used solely for program administration, reporting, and coordination of services.
                  </span>
                </label>
              </div>
              {errors.declaration && <p className="text-red-500 text-sm">{errors.declaration}</p>}

              <div>
                <label className="block text-sm font-bold text-[#004225] mb-2">
                  Signature: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.signature}
                  onChange={(e) => handleInputChange('signature', e.target.value)}
                  placeholder="Type your full name as signature"
                  className={`w-full p-3 rounded-lg border-2 ${errors.signature ? 'border-red-500' : 'border-[#004225]'} focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20`}
                  required
                />
                {errors.signature && <p className="text-red-500 text-sm mt-1">{errors.signature}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t-2 border-[#004225] mt-8">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentSection === 1}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              currentSection === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border-2 border-[#004225] text-[#004225] hover:bg-[#FAF7F0]'
            }`}
          >
            <X className="w-5 h-5 rotate-45" /> Back
          </button>
          
          {currentSection < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-3 rounded-xl bg-[#004225] text-white font-bold hover:bg-[#005a33] transition-all shadow-lg flex items-center gap-2"
            >
              Next <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-[#FFB000] text-[#004225] font-bold hover:bg-yellow-500 transition-all shadow-lg flex items-center gap-2"
            >
              <FileText className="w-5 h-5" /> Submit Application
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

