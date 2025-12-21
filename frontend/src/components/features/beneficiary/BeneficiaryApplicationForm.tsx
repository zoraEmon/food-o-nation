"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/components/ui/NotificationProvider';
import SectionWrapper from './formSections/SectionWrapper';
import ProgressIndicator from './formSections/ProgressIndicator';
import SurveyQuestion from './fields/SurveyQuestion';
import HouseholdMemberFields from './fields/HouseholdMemberFields';
import { X, FileText, User, Users, DollarSign, ClipboardCheck, PenTool, ChevronRight, Upload, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { authService } from '@/services/authService';

interface HouseholdMember {
  id: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  relationship: string;
}

interface ApplicationFormData {
  // Personal Information (mapped to backend keys)
  firstName: string;
  lastName: string;
  middleName?: string;
  gender?: string | null;
  civilStatus?: string | null;
  birthDate: string; // ISO
  age: number;
  occupation: string;
  contactNumber: string; // contactNumber (beneficiary)
  primaryPhone: string; // primaryPhone (beneficiary)
  householdPosition?: string;
  householdPositionSpecify?: string;
  // removed householdPositionSpecify per UX
  email: string;
  password?: string;
  confirmPassword?: string;
  governmentIdFile?: File | null;
  governmentIdType?: string | null;
  governmentIdTypeSpecify?: string;
  profileImage?: File | string | null;

  // Household Details
  totalHouseholdMembers: number;
  householdMembers: HouseholdMember[];
  childrenCount: number;
  adultCount: number;
  seniorCount: number;
  pwdCount: number;
  hasSpecialDiet: boolean;
  specialDietSpecify: string;
  

  // Economic Status
  monthlyIncome: number | string;
  incomeSources: string[];
  mainEmploymentStatus?: string;
  receivingAid: boolean;
  receivingAidSpecify: string;

  // Beneficiary Interview (Food Security Questions)
  surveyAnswers: Record<string, string>;

  // Authorization
  declarationAccepted: boolean;
  privacyAccepted: boolean;
  signature?: File | string | null;

  // Address fields
  streetNumber?: string;
  barangay?: string;
  province?: string;
  municipality?: string; // Added for clarity
  region?: string; // Added for clarity
  zipCode?: string; // Added for clarity
}

export default function BeneficiaryApplicationForm({ userData, onSubmit }: { userData: any, onSubmit?: (data: ApplicationFormData) => void }) {
    const [surveyQuestions, setSurveyQuestions] = useState<{ id: string; text: string; options?: { value: string; label: string }[] }[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState<boolean>(true);
    const [surveyError, setSurveyError] = useState<string | null>(null);

    useEffect(() => {
      let mounted = true;
      async function fetchQuestions() {
        setLoadingQuestions(true);
        setSurveyError(null);
        try {
          const res = await fetch('/api/survey-questions');
          if (!res.ok) {
            const text = await res.text().catch(() => String(res.status));
            const msg = `Survey questions API returned non-OK ${res.status}${text ? ` (${text})` : ''}`;
            console.error(msg);
            if (mounted) {
              setSurveyQuestions([]);
              setSurveyError(msg);
            }
            return;
          }
          const data = await res.json();
          if (mounted) setSurveyQuestions(data.questions || []);
        } catch (err: any) {
          const msg = `Failed to load survey questions: ${err?.message || String(err)}`;
          console.error(msg);
          if (mounted) {
            setSurveyQuestions([]);
            setSurveyError(msg);
          }
        } finally {
          if (mounted) setLoadingQuestions(false);
        }
      }
      fetchQuestions();
      return () => { mounted = false; };
    }, []);

    // Retry handler used by the UI
    const retryFetchQuestions = async () => {
      setLoadingQuestions(true);
      setSurveyError(null);
      try {
        const res = await fetch('/api/survey-questions');
        if (!res.ok) {
          const text = await res.text().catch(() => String(res.status));
          const msg = `Survey questions API returned non-OK ${res.status}${text ? ` (${text})` : ''}`;
          setSurveyError(msg);
          return;
        }
        const data = await res.json();
        setSurveyQuestions(data.questions || []);
      } catch (err: any) {
        const msg = `Failed to load survey questions: ${err?.message || String(err)}`;
        setSurveyError(msg);
      } finally {
        setLoadingQuestions(false);
      }
    };

    // Load sample questions (useful when backend is down)
    const loadSampleQuestions = () => {
      // lazy import to avoid increasing bundle when not used
      const { SAMPLE_SURVEY_QUESTIONS } = require('@/constants/sampleSurveyQuestions');
      setSurveyQuestions(SAMPLE_SURVEY_QUESTIONS as any);
      setSurveyError(null);
    };
  const [currentSection, setCurrentSection] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSectionErrors, setShowSectionErrors] = useState(false);
  const router = useRouter();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState<ApplicationFormData>({
    firstName: '',
    lastName: '',
    middleName: '',
    gender: null,
    civilStatus: null,
    birthDate: '',
    age: 0,
    occupation: '',
    contactNumber: '',
    primaryPhone: '',
    email: userData?.email || '',
    password: '',
    confirmPassword: '',
    governmentIdFile: null,
    governmentIdType: '',
    governmentIdTypeSpecify: '',
    profileImage: null,
    householdPosition: '',
    totalHouseholdMembers: 1,
    householdMembers: [{ id: '1', fullName: '', dateOfBirth: '', age: 0, relationship: '' }],
    childrenCount: 0,
    adultCount: 0,
    seniorCount: 0,
    pwdCount: 0,
    hasSpecialDiet: false,
    specialDietSpecify: '',
    monthlyIncome: '',
    incomeSources: [],
    mainEmploymentStatus: undefined,
    receivingAid: false,
    receivingAidSpecify: '',
        surveyAnswers: {},
    declarationAccepted: false,
    privacyAccepted: false,
    signature: null,
    streetNumber: '',
    barangay: '',
    municipality: '',
    region: '',
    zipCode: '',
    province: '',
  });

  // PSGC address typeahead state
  const [regionQuery, setRegionQuery] = useState('');
  const [regionOptions, setRegionOptions] = useState<Array<{ code: string; name?: string; regionName?: string }>>([]);
  const [selectedRegionCode, setSelectedRegionCode] = useState<string | null>(null);
  const [selectedRegionName, setSelectedRegionName] = useState<string | null>(null);
  const [selectedRegionIsNCR, setSelectedRegionIsNCR] = useState<boolean>(false);
  const [municipalityOptions, setMunicipalityOptions] = useState<Array<{ code: string; name: string }>>([]);
  const [selectedMunicipalityCode, setSelectedMunicipalityCode] = useState<string | null>(null);
  const [selectedMunicipalityName, setSelectedMunicipalityName] = useState<string | null>(null);

  const [provinceQuery, setProvinceQuery] = useState('');
  const [provinceOptions, setProvinceOptions] = useState<Array<{ code: string; name: string }>>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | null>(null);
  const [selectedProvinceName, setSelectedProvinceName] = useState<string | null>(null);

  const [municipalityQuery, setMunicipalityQuery] = useState('');
  const [barangayQuery, setBarangayQuery] = useState('');
  const [barangayOptions, setBarangayOptions] = useState<Array<{ code: string; name: string }>>([]);

  // Fetch regions once and filter locally
  const handleRegionQuery = async (q: string) => {
    setRegionQuery(q);
    // if input cleared, reset region and downstream selections
    if (!q) {
      setRegionOptions([]);
      setSelectedRegionCode(null);
      setSelectedRegionName(null);
      setSelectedRegionIsNCR(false);
      handleInputChange('region', '');
      // reset province/municipality/barangay
      setProvinceOptions([]);
      setSelectedProvinceCode(null);
      setSelectedProvinceName(null);
      handleInputChange('province', '');
      setMunicipalityOptions([]);
      setSelectedMunicipalityCode(null);
      setSelectedMunicipalityName(null);
      handleInputChange('municipality', '');
      setBarangayOptions([]);
      handleInputChange('barangay', '');
      return;
    }
    try {
      const res = await fetch('https://psgc.gitlab.io/api/regions.json');
      if (!res.ok) return;
      const data = await res.json();
      const matches = (data || []).filter((r: any) => (r.regionName || r.name || '').toLowerCase().includes(q.toLowerCase()));
      setRegionOptions(matches.slice(0, 20));
    } catch (e) {
      console.error('Region lookup failed', e);
    }
  };

  const selectRegion = async (r: { code: string; regionName?: string; name?: string }) => {
    setSelectedRegionCode(r.code);
    const name = r.regionName || r.name || '';
    setSelectedRegionName(name);
    const isNCR = /national capital region|\bNCR\b/i.test(name);
    setSelectedRegionIsNCR(isNCR);
    handleInputChange('region', name);
    setRegionQuery(name);
    setRegionOptions([]);
    // clear downstream selections
    setProvinceOptions([]);
    setSelectedProvinceCode(null);
    setSelectedProvinceName(null);
    handleInputChange('province', isNCR ? 'Not Applied' : '');
    setMunicipalityOptions([]);
    setSelectedMunicipalityCode(null);
    setSelectedMunicipalityName(null);
    handleInputChange('municipality', '');
    handleInputChange('barangay', '');

    // If NCR, skip province fetching and fetch municipalities directly
    if (isNCR) {
      try {
        const url = `https://psgc.gitlab.io/api/regions/${r.code}/cities-municipalities.json`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        setMunicipalityOptions((data || []).map((m: any) => ({ code: m.code, name: m.name })));
      } catch (e) {
        console.error('Municipality lookup failed for NCR', e);
      }
      return;
    }

    // fetch provinces for region
    try {
      const url = `https://psgc.gitlab.io/api/regions/${r.code}/provinces.json`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProvinceOptions((data || []).map((p: any) => ({ code: p.code, name: p.name })));
      } else {
        // fallback: try general provinces list
        const fallRes = await fetch('https://psgc.gitlab.io/api/provinces.json');
        if (fallRes.ok) {
          const all = await fallRes.json();
          const matches = (all || []).filter((p: any) => String(p.regionCode || p.regCode || '').toLowerCase() === String(r.code || '').toLowerCase());
          setProvinceOptions(matches.map((p: any) => ({ code: p.code, name: p.name })));
        }
      }
    } catch (e) {
      console.error('Province lookup failed', e);
    }
  };

  const selectProvince = async (p: { code: string; name: string }) => {
    setSelectedProvinceCode(p.code);
    setSelectedProvinceName(p.name);
    handleInputChange('province', p.name);
    setProvinceQuery(p.name);
    setProvinceOptions([]);
    // when province is selected, fetch municipalities for region (same endpoint used previously)
    try {
      if (!selectedRegionCode) return;
      const url = `https://psgc.gitlab.io/api/regions/${selectedRegionCode}/cities-municipalities.json`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setMunicipalityOptions((data || []).map((m: any) => ({ code: m.code, name: m.name })));
    } catch (e) {
      console.error('Municipality lookup failed', e);
    }
  };

  const handleProvinceQuery = (q: string) => {
    setProvinceQuery(q);
    // When cleared, reset province and downstream selections
    if (!q) {
      setProvinceOptions([]);
      setSelectedProvinceCode(null);
      setSelectedProvinceName(null);
      handleInputChange('province', '');
      setMunicipalityOptions([]);
      setSelectedMunicipalityCode(null);
      setSelectedMunicipalityName(null);
      handleInputChange('municipality', '');
      setBarangayOptions([]);
      handleInputChange('barangay', '');
      return;
    }
    setProvinceOptions(prev => prev.filter(p => p.name.toLowerCase().includes(q.toLowerCase())));
  };

  const handleMunicipalityQuery = (q: string) => {
    setMunicipalityQuery(q);
    // when cleared, reset municipality and barangay selections
    if (!q) {
      setMunicipalityOptions([]);
      setSelectedMunicipalityCode(null);
      setSelectedMunicipalityName(null);
      handleInputChange('municipality', '');
      setBarangayOptions([]);
      handleInputChange('barangay', '');
      return;
    }
    setMunicipalityOptions(prev => prev.filter(m => m.name.toLowerCase().includes(q.toLowerCase())));
  };

  const selectMunicipality = async (m: { code: string; name: string }) => {
    setSelectedMunicipalityCode(m.code);
    setSelectedMunicipalityName(m.name);
    handleInputChange('municipality', m.name);
    setMunicipalityQuery(m.name);
    setMunicipalityOptions([]);
    // clear barangay
    setBarangayOptions([]);
    handleInputChange('barangay', '');
    try {
      const url = `https://psgc.gitlab.io/api/cities-municipalities/${m.code}/barangays.json`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setBarangayOptions((data || []).map((b: any) => ({ code: b.code, name: b.name })));
    } catch (e) {
      console.error('Barangay lookup failed', e);
    }
  };

  const handleBarangayQuery = (q: string) => {
    setBarangayQuery(q);
    if (!q) return setBarangayOptions(prev => prev);
    setBarangayOptions(prev => prev.filter(b => b.name.toLowerCase().includes(q.toLowerCase())));
  };

  const selectBarangay = (b: { code: string; name: string }) => {
    handleInputChange('barangay', b.name);
    setBarangayQuery(b.name);
    setBarangayOptions([]);
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Government ID types from 3rd-party (optional) with fallback
  const [govIdTypes, setGovIdTypes] = useState<string[]>([]);
  useEffect(() => {
    let mounted = true;
    async function fetchIdTypes() {
      try {
        const url = (process.env.NEXT_PUBLIC_GOV_ID_TYPES_URL as string) || '';
        if (url) {
          const res = await fetch(url);
          if (!res.ok) throw new Error('gov id types fetch failed');
          const data = await res.json();
          if (mounted && Array.isArray(data)) setGovIdTypes(data.map((d: any) => String(d)));
          return;
        }
      } catch (e) {
        // ignore, fallback to local list
      }
      if (mounted) setGovIdTypes(['PHILHEALTH','UMID','DRIVER_LICENSE','PASSPORT','SSS','TIN','VOTER_ID','OTHER']);
    }
    fetchIdTypes();
    return () => { mounted = false; };
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof ApplicationFormData]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof ApplicationFormData];
        return newErrors;
      });
    }
    // clear section error banner on any field change
    setShowSectionErrors(false);
  };

  const sanitizeLetters = (v: string) => v.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'\-\s]/g, '');
  const sanitizeDigits = (v: string) => v.replace(/[^0-9]/g, '');

  const formatCurrency = (v: number) => {
    try {
      return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch (e) {
      return String(v);
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

  const updateHouseholdMember = (id: string, field: keyof HouseholdMember, value: string | number) => {
    const updated = formData.householdMembers.map(m => {
      if (m.id !== id) return m;
      let newVal: any = value;
      if (field === 'fullName' || field === 'relationship') {
        newVal = String(value ? value : '').replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'\-\s]/g, '');
      }
      if (field === 'dateOfBirth') {
        const calcAge = calculateAge(String(value));
        return { ...m, [field]: value, age: calcAge };
      }
      return { ...m, [field]: newVal };
    });
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
      if (!formData.firstName) newErrors.firstName = 'Required';
      if (!formData.lastName) newErrors.lastName = 'Required';
      if (!formData.email) newErrors.email = 'Required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

      // Age validation (must be at least 13) and not a future date
      if (formData.birthDate) {
        const today = new Date();
        const birth = new Date(formData.birthDate);
        if (birth > today) {
          newErrors.birthDate = 'Birth date cannot be today or a future date.';
        } else {
          let age = today.getFullYear() - birth.getFullYear();
          const monthDiff = today.getMonth() - birth.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
          }
          if (age < 13) {
            newErrors.birthDate = 'Applicant must be at least 13 years old.';
          }
        }
      } else {
        newErrors.birthDate = 'Birth date is required.';
      }
    }
    
    if (section === 2) {
      if (formData.totalHouseholdMembers < 1) newErrors.totalHouseholdMembers = 'Must be at least 1';
      if (formData.householdMembers.some(m => !m.fullName || !m.dateOfBirth || !m.relationship)) {
        newErrors.householdMembers = 'Please complete all household member information';
      }
      // household members must be at least 8 months old
      const minAllowed = (() => { const d = new Date(); d.setMonth(d.getMonth() - 8); d.setHours(0,0,0,0); return d; })();
      if (formData.householdMembers.some(m => m.dateOfBirth && new Date(m.dateOfBirth) > minAllowed)) {
        newErrors.householdMembers = 'Household member birth dates must be at least 8 months old.';
      }
    }
    
    if (section === 3) {
      if (!formData.mainEmploymentStatus) newErrors.mainEmploymentStatus = 'Required';
    }
    
    if (section === 5) {
      if (!formData.declarationAccepted || !formData.privacyAccepted) {
        newErrors.declaration = 'Please accept both declarations';
      }
      if (!formData.signature) newErrors.signature = 'Signature is required';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) setShowSectionErrors(true);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      setCurrentSection(prev => Math.min(prev + 1, 5));
      setShowSectionErrors(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowSectionErrors(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentSection(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all sections before submitting to avoid server-side required field errors
    for (let s = 1; s <= 5; s++) {
      if (!validateSection(s)) {
        setCurrentSection(s);
        return;
      }
    }

    (async () => {
      try {
        // Convert dates to full ISO datetimes expected by backend validators
        const birthDateIso = formData.birthDate ? new Date(formData.birthDate).toISOString() : undefined;

        const householdMembersPayload = formData.householdMembers
          ? formData.householdMembers
              .filter((m) => m.fullName && m.dateOfBirth)
              .map((m) => ({
                fullName: m.fullName,
                birthDate: new Date(m.dateOfBirth).toISOString(),
                age: m.age,
                relationship: m.relationship,
              }))
          : undefined;

        // Format phone as +63XXXXXXXXXX and map front-end keys to backend expected keys
        const formattedPhone = formData.primaryPhone ? `+63${formData.primaryPhone.replace(/^0+/, '')}` : undefined;

        const payload: any = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          gender: formData.gender,
          civilStatus: formData.civilStatus,
          birthDate: birthDateIso,
          age: formData.age,
          contactNumber: formattedPhone,
          occupation: formData.occupation,
          householdNumber: formData.totalHouseholdMembers,
          householdAnnualSalary: formData.monthlyIncome !== '' && formData.monthlyIncome !== undefined ? Number(formData.monthlyIncome) * 12 : undefined,
          householdPosition: formData.householdPosition || undefined,
          primaryPhone: formattedPhone,
          activeEmail: formData.email,
          governmentIdType: formData.governmentIdType,
          monthlyIncome: formData.monthlyIncome !== '' && formData.monthlyIncome !== undefined ? Number(formData.monthlyIncome) : undefined,
          incomeSources: formData.incomeSources,
          mainEmploymentStatus: formData.mainEmploymentStatus,
          receivingAid: formData.receivingAid,
          receivingAidDetail: formData.receivingAidSpecify,
          childrenCount: formData.childrenCount,
          adultCount: formData.adultCount,
          seniorCount: formData.seniorCount,
          pwdCount: formData.pwdCount,
          specialDietRequired: formData.hasSpecialDiet,
          specialDietDescription: formData.specialDietSpecify,
          declarationAccepted: formData.declarationAccepted,
          privacyAccepted: formData.privacyAccepted,
          streetNumber: formData.streetNumber,
          barangay: formData.barangay,
          province: formData.province,
          municipality: formData.municipality,
          region: formData.region,
          zipCode: formData.zipCode,
          householdMembers: householdMembersPayload,
          surveyAnswers: formData.surveyAnswers,
          // Files handled by authService
          profileImage: formData.profileImage,
          governmentIdFile: formData.governmentIdFile,
          signature: formData.signature,
        };

        // Debug: build a FormData preview identical to authService to inspect what's sent
        try {
          const debugForm = new FormData();
          if (payload.profileImage instanceof File) debugForm.append('profileImage', payload.profileImage);
          if (payload.governmentIdFile instanceof File) debugForm.append('governmentIdFile', payload.governmentIdFile);
          if (payload.signature instanceof File) debugForm.append('signature', payload.signature);
          if (Array.isArray(payload.householdMembers)) debugForm.append('householdMembers', JSON.stringify(payload.householdMembers));
          if (Array.isArray(payload.incomeSources)) debugForm.append('incomeSources', JSON.stringify(payload.incomeSources));
          Object.keys(payload).forEach((key) => {
            if (key === 'profileImage' || key === 'governmentIdFile' || key === 'signature' || key === 'householdMembers' || key === 'incomeSources') return;
            const v = (payload as any)[key];
            if (v !== null && v !== undefined) debugForm.append(key, typeof v === 'boolean' ? (v ? 'true' : 'false') : String(v));
          });

          const preview: Array<{ key: string; value: string }> = [];
          for (const pair of (debugForm as any).entries()) {
            const k = pair[0];
            const val = pair[1];
            if (val instanceof File) preview.push({ key: k, value: val.name });
            else preview.push({ key: k, value: String(val) });
          }
          // Log JSON payload and FormData preview to help debugging missing fields
          // eslint-disable-next-line no-console
          console.info('DEBUG: JSON payload to send:', payload);
          // eslint-disable-next-line no-console
          console.info('DEBUG: FormData preview (key => value or filename):', preview);
        } catch (dbgErr) {
          // eslint-disable-next-line no-console
          console.warn('DEBUG: failed to build FormData preview', dbgErr);
        }

        // Quick backend reachability check to give clearer error for CORS/network issues
        const backendOk = await authService.pingBackend();
        if (!backendOk) {
          showNotification({ title: 'Submission failed', message: `Backend appears unreachable or CORS blocked requests to the backend. Ensure backend is running at ${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'} and CORS allows ${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}.`, type: 'error' });
          return;
        }

        const res = await authService.registerBeneficiary(payload);
        if (res.success) {
          // Use global notification and redirect to login for beneficiary
          showNotification({ title: 'Application submitted', message: res.message || 'Application submitted successfully. Check your email for an OTP to verify.', type: 'success', autoClose: 6000 });
          // Redirect to login page with beneficiary type
          router.push('/login?type=beneficiary');
        } else {
          showNotification({ title: 'Submission failed', message: String(res.message || 'Submission failed'), type: 'error' });
        }
      } catch (err: any) {
        showNotification({ title: 'Submission error', message: String(err?.message || String(err)), type: 'error' });
      }
    })();
  };

  const sections = [
    { id: 1, title: 'Personal Information', icon: User },
    { id: 2, title: 'Household Details', icon: Users },
    { id: 3, title: 'Economic Status', icon: DollarSign },
    { id: 4, title: 'Beneficiary Interview', icon: ClipboardCheck },
    { id: 5, title: 'Authorization', icon: PenTool },
  ];

  // Use global theme via `dark` class on <html>; avoid local theme state here.
  const containerClass = 'bg-white dark:bg-[#042617] text-current border-2 border-[#004225]';

  // max allowed birth date (applicant must be at least 13 years old)
  const maxBirthDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 13);
    return d.toISOString().split('T')[0];
  })();

  return (
    <div className={`${containerClass} rounded-2xl p-6 lg:p-8 shadow-2xl`}>
      <div className="w-full flex items-center justify-center mb-4">
        <ProgressIndicator sections={sections} currentSection={currentSection} />
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {currentSection === 1 && (
          <SectionWrapper title="Personal Information">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-bold text-current">First Name <span className="text-red-500">*</span></label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', sanitizeLetters(e.target.value))}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-gray-50 dark:bg-[#1a2b23] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm transition-colors duration-200"
                    placeholder="Juan"
                    required
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="text-sm font-bold text-current">Middle Name</label>
                  <input
                    name="middleName"
                    value={formData.middleName}
                    onChange={(e) => handleInputChange('middleName', sanitizeLetters(e.target.value))}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-gray-50 dark:bg-[#1a2b23] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm transition-colors duration-200"
                    placeholder="Santos"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-current">Last Name <span className="text-red-500">*</span></label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', sanitizeLetters(e.target.value))}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-gray-50 dark:bg-[#1a2b23] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm transition-colors duration-200"
                    placeholder="Dela Cruz"
                    required
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <label className="text-sm font-bold text-current">Address (Region → Municipality/City → Barangay) <span className="text-red-500">*</span></label>
                  <div className="space-y-2">
                    {/* Region typeahead */}
                    <div>
                      <input
                        placeholder="Type region..."
                        value={regionQuery}
                        onChange={(e) => handleRegionQuery(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-white dark:bg-[#0f2b1f] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm"
                      />
                      {regionOptions.length > 0 && regionQuery && (
                        <ul className="max-h-40 overflow-auto bg-white dark:bg-[#05261a] border border-gray-200 dark:border-[#123826] rounded-lg mt-1">
                          {regionOptions.map((r) => (
                            <li key={r.code} onClick={() => selectRegion(r)} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#0b3b2a] cursor-pointer">{r.regionName || r.name}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Province (reveals after region unless the region is NCR) */}
                    <div className={`transition-all ${selectedRegionCode && !selectedRegionIsNCR ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      <div>
                        <input
                          placeholder={selectedRegionName ? `Type province in ${selectedRegionName}...` : 'Select a region first'}
                          value={provinceQuery || formData.province || ''}
                          onChange={(e) => handleProvinceQuery(e.target.value)}
                          disabled={!selectedRegionCode}
                          className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-white dark:bg-[#0f2b1f] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm"
                        />
                        {provinceOptions.length > 0 && provinceQuery && (
                          <ul className="max-h-40 overflow-auto bg-white dark:bg-[#05261a] border border-gray-200 dark:border-[#123826] rounded-lg mt-1">
                            {provinceOptions.map((p) => (
                              <li key={p.code} onClick={() => selectProvince(p)} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#0b3b2a] cursor-pointer">{p.name}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Municipality/City (reveals after province is filled) */}
                    <div className={`transition-all ${formData.province ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      <input
                        placeholder={selectedRegionName ? `Type municipality/city in ${selectedRegionName}...` : 'Select a region first'}
                        value={municipalityQuery}
                        onChange={(e) => handleMunicipalityQuery(e.target.value)}
                        disabled={!formData.province}
                        className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-white dark:bg-[#0f2b1f] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm"
                      />
                      {municipalityOptions.length > 0 && municipalityQuery && (
                        <ul className="max-h-40 overflow-auto bg-white dark:bg-[#05261a] border border-gray-200 dark:border-[#123826] rounded-lg mt-1">
                          {municipalityOptions.map((m) => (
                            <li key={m.code} onClick={() => selectMunicipality(m)} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#0b3b2a] cursor-pointer">{m.name}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Barangay (reveals after municipality) */}
                    <div className={`transition-all ${selectedMunicipalityCode ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      <input
                        placeholder={selectedMunicipalityName ? `Type barangay in ${selectedMunicipalityName}...` : 'Select a municipality/city first'}
                        value={barangayQuery}
                        onChange={(e) => handleBarangayQuery(e.target.value)}
                        disabled={!selectedMunicipalityCode}
                        className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-white dark:bg-[#0f2b1f] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm"
                      />
                      {barangayOptions.length > 0 && barangayQuery && (
                        <ul className="max-h-40 overflow-auto bg-white dark:bg-[#05261a] border border-gray-200 dark:border-[#123826] rounded-lg mt-1">
                          {barangayOptions.map((b) => (
                            <li key={b.code} onClick={() => selectBarangay(b)} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#0b3b2a] cursor-pointer">{b.name}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="text-sm font-bold text-current">ZIP Code</label>
                  <input name="zipCode" value={formData.zipCode} onChange={(e) => handleInputChange('zipCode', e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-gray-50 dark:bg-[#1a2b23] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm transition-colors duration-200" placeholder="0000" />
                </div>

                <div>
                  {/* streetNumber appears only after barangay selected */}
                  {formData.barangay ? (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="text-sm font-bold text-current">Street / House No. <span className="text-red-500">*</span></label>
                      <input name="streetNumber" value={formData.streetNumber} onChange={(e) => handleInputChange('streetNumber', e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-gray-50 dark:bg-[#1a2b23] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm transition-colors duration-200" placeholder="1234 Example St" required />
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">Street / House No. will appear after selecting Barangay</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-bold text-current">Email <span className="text-red-500">*</span></label>
                  <input name="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-gray-50 dark:bg-[#1a2b23] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm transition-colors duration-200" placeholder="you@example.com" required />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div className="relative">
                  <label className="text-sm font-bold text-current">Password <span className="text-red-500">*</span></label>
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-gray-50 dark:bg-[#1a2b23] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm transition-colors duration-200" placeholder="Minimum 12 characters" required />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-8 text-gray-500">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                <div className="relative">
                  <label className="text-sm font-bold text-current">Confirm Password <span className="text-red-500">*</span></label>
                  <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-gray-50 dark:bg-[#1a2b23] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm transition-colors duration-200" placeholder="Re-enter password" required />
                  <button type="button" onClick={() => setShowConfirmPassword(s => !s)} className="absolute right-3 top-8 text-gray-500">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-bold text-current">Gender</label>
                  <select value={formData.gender || ''} onChange={(e) => handleInputChange('gender', e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-white dark:bg-[#0f2b1f] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm transition-colors duration-200">
                    <option value="">Select gender...</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-current">Civil Status</label>
                  <select value={formData.civilStatus || ''} onChange={(e) => handleInputChange('civilStatus', e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-white dark:bg-[#0f2b1f] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm transition-colors duration-200">
                    <option value="">Select status...</option>
                    <option value="SINGLE">Single</option>
                    <option value="MARRIED">Married</option>
                    <option value="DIVORCED">Divorced</option>
                    <option value="WIDOWED">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-current">Date of Birth <span className="text-red-500">*</span></label>
                  <input type="date" name="birthDate" max={maxBirthDate} value={formData.birthDate} onChange={(e) => {
                    const val = e.target.value;
                    handleInputChange('birthDate', val);
                    handleInputChange('age', calculateAge(val));
                  }} className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-gray-50 dark:bg-[#1a2b23] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm transition-colors duration-200" required />
                  {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-bold text-current">Occupation</label>
                  <input name="occupation" value={formData.occupation} onChange={(e) => handleInputChange('occupation', e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-gray-50 dark:bg-[#1a2b23] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm transition-colors duration-200" placeholder="Occupation" />
                </div>
                <div>
                  <label className="text-sm font-bold text-current">Phone Number <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 rounded-l-xl bg-gray-100 dark:bg-[#0f2b1f] border border-r-0 border-gray-300 dark:border-[#2e4d3d] text-sm">+63</span>
                    <input
                      name="primaryPhone"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.primaryPhone}
                      onChange={(e) => handleInputChange('primaryPhone', sanitizeDigits(e.target.value).slice(0, 10))}
                      className="w-full p-3 rounded-r-xl border border-gray-300 dark:border-[#2e4d3d] bg-gray-50 dark:bg-[#1a2b23] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm transition-colors duration-200"
                      placeholder="9XXXXXXXXX"
                      required
                      maxLength={10}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Enter 10 digits (e.g. 9123456789). We'll send it as +63XXXXXXXXXX.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-current">Profile Image</label>
                  <label htmlFor="profileImage" className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer block">
                    <Upload className="w-6 h-6 text-current mx-auto mb-2" />
                    <input
                      type="file"
                      accept="image/*"
                      name="profileImage"
                      id="profileImage"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0] || null;
                        handleInputChange('profileImage', file);
                      }}
                      className="hidden"
                    />
                    <div className="text-current font-bold hover:text-[#ffb000] text-sm">Click to upload profile image</div>
                    {formData.profileImage && (
                      typeof formData.profileImage === 'string' ? (
                        <img src={formData.profileImage} alt="Profile Preview" className="h-24 w-24 object-cover rounded-full border mt-4 mx-auto" />
                      ) : (
                        <img src={URL.createObjectURL(formData.profileImage)} alt="Profile Preview" className="h-24 w-24 object-cover rounded-full border mt-4 mx-auto" />
                      )
                    )}
                  </label>
                </div>

                <div>
                  <label className="text-sm font-bold text-current">Government ID (upload)</label>
                  <label htmlFor="governmentIdFile" className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer block">
                    <Upload className="w-6 h-6 text-current mx-auto mb-2" />
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      name="governmentIdFile"
                      id="governmentIdFile"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0] || null;
                        handleInputChange('governmentIdFile', file);
                      }}
                      className="hidden"
                    />
                    <div className="text-current font-bold hover:text-[#ffb000] text-sm">Click to upload government ID</div>
                    {formData.governmentIdFile && <p className="text-xs text-current mt-2">{(formData.governmentIdFile as File).name}</p>}
                  </label>

                  <label className="block text-sm font-bold text-current mt-2">Government ID Type</label>
                  <div>
                    <select name="governmentIdType" value={formData.governmentIdType || ''} onChange={(e) => handleInputChange('governmentIdType', e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-white dark:bg-[#0f2b1f] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm transition-colors duration-200">
                      <option value="">Select ID type...</option>
                      {govIdTypes.map((t) => (
                        <option key={t} value={t} className="bg-white dark:bg-[#0f2b1f]">{t}</option>
                      ))}
                    </select>
                    {formData.governmentIdType === 'OTHER' && (
                      <input name="governmentIdTypeSpecify" value={formData.governmentIdTypeSpecify} onChange={(e) => handleInputChange('governmentIdTypeSpecify', e.target.value)} className="w-full mt-2 p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-gray-50 dark:bg-[#1a2b23] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm transition-colors duration-200" placeholder="Specify government ID type" />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-current">Applicant’s Household Position (Select 1 Only) <span className="text-red-500">*</span></label>
                <select name="householdPosition" value={(formData as any).householdPosition || ''} onChange={(e) => handleInputChange('householdPosition', e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-white dark:bg-[#0f2b1f] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm transition-colors duration-200">
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
                {/* specify relationship when Other Relative / Non-relative guardian */}
                {(formData.householdPosition === 'OTHER_RELATIVE' || formData.householdPosition === 'NON_RELATIVE_GUARDIAN') && (
                  <input value={formData.householdPositionSpecify || ''} onChange={(e) => handleInputChange('householdPositionSpecify', e.target.value)} placeholder="Please describe your relationship" className="w-full mt-2 p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-gray-50 dark:bg-[#1a2b23] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm transition-colors duration-200" />
                )}
              </div>
            </div>
          </SectionWrapper>
        )}

        {currentSection === 2 && (
          <SectionWrapper title="Household Details">
            <div className="space-y-4">
              <HouseholdMemberFields
                members={formData.householdMembers}
                onAdd={addHouseholdMember}
                onRemove={removeHouseholdMember}
                onUpdate={updateHouseholdMember}
                calculateAge={calculateAge}
              />
              {/* Special Diet checkbox + description */}
              <div className="mt-2 p-3 border rounded-lg bg-[#FAF7F0] dark:bg-[#07311e] border-[#004225] dark:border-[#05402a]">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={formData.hasSpecialDiet} onChange={(e) => handleInputChange('hasSpecialDiet', e.target.checked)} className="w-5 h-5 accent-[#FFB000]" />
                  <span className="text-current">Special diet required</span>
                </label>
                {formData.hasSpecialDiet && (
                  <input value={formData.specialDietSpecify} onChange={(e) => handleInputChange('specialDietSpecify', e.target.value)} placeholder="Describe special diet requirements" className="w-full mt-2 p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-white dark:bg-[#0f2b1f] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30" />
                )}
              </div>
            </div>
          </SectionWrapper>
        )}

        {/* SECTION 3: ECONOMIC STATUS */}
        {currentSection === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-current border-b-2 border-[#004225] pb-3">
              Economic Status
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-current mb-2">
                  A. What is the total combined gross monthly income of all household members from all sources?
                </label>
                <input
                  name="monthlyIncome"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthlyIncome}
                  onChange={(e) => {
                    const v = e.target.value;
                    // allow clearing the field (empty string) instead of forcing 0
                    if (v === '') return handleInputChange('monthlyIncome', '');
                    const parsed = parseFloat(v);
                    handleInputChange('monthlyIncome', Number.isNaN(parsed) ? '' : parsed);
                  }}
                  className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-gray-50 dark:bg-[#1a2b23] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm transition-colors duration-200"
                  placeholder="0.00"
                />
                <div className="mt-3">
                  <label className="text-sm font-bold text-current">Estimated Annual Household Income</label>
                  <div className="w-full mt-1 p-3 rounded-xl border border-gray-200 bg-gray-50 dark:bg-[#1a2b23] text-current">
                    {formData.monthlyIncome !== '' && formData.monthlyIncome !== undefined
                      ? `₱ ${formatCurrency(Number(formData.monthlyIncome) * 12)}`
                      : '—'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Calculated as monthly income × 12 (read-only).</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-current mb-2">
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
                <label className="block text-sm font-bold text-current mb-2">
                  C. What is the current employment status of the main working adult in the household? <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.mainEmploymentStatus || ''}
                  onChange={(e) => handleInputChange('mainEmploymentStatus', e.target.value)}
                  className={`w-full p-3 rounded-lg border-2 ${errors.mainEmploymentStatus ? 'border-red-500' : 'border-[#004225]'} bg-white dark:bg-[#0f2b1f] dark:text-current focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20`}
                  required
                >
                  <option value="">Select one...</option>
                  <option value="EMPLOYED_FULL_TIME" className="bg-white dark:bg-[#0f2b1f] dark:text-current">Employed Full-Time</option>
                  <option value="EMPLOYED_PART_TIME" className="bg-white dark:bg-[#0f2b1f] dark:text-current">Employed Part-Time</option>
                  <option value="RECENTLY_UNEMPLOYED" className="bg-white dark:bg-[#0f2b1f] dark:text-current">Recently Unemployed</option>
                  <option value="LONG_TERM_UNEMPLOYED" className="bg-white dark:bg-[#0f2b1f] dark:text-current">Long-Term Unemployed</option>
                  <option value="RETIRED_DISABLED" className="bg-white dark:bg-[#0f2b1f] dark:text-current">Retired/Disabled</option>
                </select>
                {errors.mainEmploymentStatus && <p className="text-red-500 text-sm mt-1">{errors.mainEmploymentStatus}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-current mb-2">
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
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#2e4d3d] bg-gray-50 dark:bg-[#1a2b23] focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/30 shadow-sm transition-colors duration-200"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: BENEFICIARY INTERVIEW */}
        {currentSection === 4 && (
          <SectionWrapper title="Beneficiary Interview">
            <p className="text-sm text-current italic">
              Instruction: For the following questions, please select the option that best describes the situation in the past 30 days.
            </p>
            <div className="space-y-6">
              {loadingQuestions ? (
                <div>Loading questions...</div>
              ) : surveyError ? (
                <div className="mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 text-current">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <strong>Survey questions unavailable</strong>
                      <p className="text-sm mt-1">{surveyError}</p>
                      <p className="text-sm mt-1">You can retry or load sample questions for testing.</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={retryFetchQuestions} className="px-3 py-2 bg-[#004225] text-white rounded-md">Retry</button>
                      <button onClick={loadSampleQuestions} className="px-3 py-2 border-2 border-[#004225] rounded-md">Use sample questions</button>
                    </div>
                  </div>
                </div>
              ) : (
                surveyQuestions.map((q: any) => (
                  <SurveyQuestion
                    key={q.id}
                    question={q}
                    value={formData.surveyAnswers[q.id] || ''}
                    onChange={(key, value) => setFormData(prev => ({
                      ...prev,
                      surveyAnswers: { ...prev.surveyAnswers, [key]: value },
                    }))}
                  />
                ))
              )}
            </div>
          </SectionWrapper>
        )}

        {/* SECTION 5: AUTHORIZATION */}
        {currentSection === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-current border-b-2 border-[#004225] pb-3">
              Authorization and Declaration
            </h2>

            <div className="space-y-4">
              <div className="bg-[#FAF7F0] dark:bg-[#07311e] border-2 border-[#004225] dark:border-[#05402a] rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.declarationAccepted}
                    onChange={(e) => handleInputChange('declarationAccepted', e.target.checked)}
                    className="mt-1 w-5 h-5 accent-[#FFB000] rounded"
                    required
                  />
                  <span className="text-sm text-current dark:text-gray-100">
                    <strong>Declaration:</strong> I declare that all information provided is true and accurate to the best of my knowledge.
                  </span>
                </label>
              </div>

              <div className="bg-[#FAF7F0] dark:bg-[#07311e] border-2 border-[#004225] dark:border-[#05402a] rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.privacyAccepted}
                    onChange={(e) => handleInputChange('privacyAccepted', e.target.checked)}
                    className="mt-1 w-5 h-5 accent-[#FFB000] rounded"
                    required
                  />
                  <span className="text-sm text-current dark:text-gray-100">
                    <strong>Privacy Consent:</strong> I understand and consent that my information will be used solely for program administration, reporting, and coordination of services.
                  </span>
                </label>
              </div>
              {errors.declaration && <p className="text-red-500 text-sm">{errors.declaration}</p>}

              <div>
                <label className="block text-sm font-bold text-current mb-2">
                  Signature: <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-6 h-6 text-current mx-auto mb-2" />
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    name="signature"
                    id="signatureUpload"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0] || null;
                      handleInputChange('signature', file);
                    }}
                    className="hidden"
                    required
                  />
                  <label htmlFor="signatureUpload" className="cursor-pointer text-current font-bold hover:text-[#ffb000] text-sm">Click to upload signature</label>
                  {formData.signature && typeof formData.signature !== 'string' && (
                    <p className="text-xs text-current mt-2">{(formData.signature as File).name}</p>
                  )}
                </div>
                {errors.signature && <p className="text-red-500 text-sm mt-1">{errors.signature}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t-2 border-[#004225] mt-8">
          {currentSection > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 bg-white border-2 border-[#004225] text-current hover:bg-[#FAF7F0]"
            >
              <X className="w-5 h-5 rotate-45" /> Back
            </button>
          ) : <div />}

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
              className="px-8 py-3 rounded-xl bg-[#FFB000] text-current font-bold hover:bg-yellow-500 transition-all shadow-lg flex items-center gap-2"
            >
              <FileText className="w-5 h-5" /> Submit Application
            </button>
          )}
        </div>
      </form>
    </div>
  );
}