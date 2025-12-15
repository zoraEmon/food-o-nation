// ./food-o-nation/src/app/beneficiarydashboard/page.tsx

'use client'; 

import React, { useState, useEffect } from 'react';
import { 
  X, MapPin, Calendar, Clock, ArrowRight, ChevronRight, Star, 
  Loader2, Home, HelpCircle, CheckCircle, RefreshCw, UploadCloud, FileText 
} from 'lucide-react';
import Link from 'next/link';

// --- Imported Layout Components ---
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { authService } from "@/services/authService";
import BeneficiaryApplicationForm from "@/components/features/beneficiary/BeneficiaryApplicationForm";

// --- 🟡 PENDING VIEW COMPONENT ---
const PendingView = ({ userData, onShowForm }: { userData: any, onShowForm: () => void }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
        <div className="bg-white border-4 border-[#004225] p-8 lg:p-12 rounded-3xl shadow-2xl max-w-3xl w-full text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-4 bg-[#FFB000]"></div> 

            <h1 className="text-3xl lg:text-4xl font-extrabold text-[#004225] mb-2">
                Status: <span className="text-[#FFB000]">Pending Review</span>
            </h1>
            <p className="text-gray-600 text-lg font-medium mb-8">
                Your application is currently being processed
            </p>

            <div className="bg-[#FAF7F0] border-2 border-gray-300 rounded-xl p-6 mb-8 text-left shadow-inner min-h-[120px] flex flex-col">
                <span className="font-bold text-[#004225] text-sm uppercase tracking-wide mb-2 block border-b border-gray-300 pb-2">
                    What to expect:
                </span>
                <p className="text-gray-700 leading-relaxed flex-grow">
                    Our team is verifying your submitted documents (Barangay Indigency & Valid ID). This usually takes <strong>24-48 hours</strong>.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                    onClick={onShowForm}
                    className="px-8 py-3 rounded-xl bg-[#FFB000] text-[#004225] font-bold hover:bg-yellow-500 transition-all shadow-md flex items-center justify-center gap-2"
                >
                    <FileText className="w-5 h-5" /> Complete Application Form
                </button>
                <Link href="/" className="px-8 py-3 rounded-xl border-2 border-[#004225] text-[#004225] font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                    <Home className="w-5 h-5" /> Back to Home
                </Link>
                <Link href="/contact" className="px-8 py-3 rounded-xl bg-[#004225] text-white font-bold hover:bg-[#005a33] transition-all shadow-md flex items-center justify-center gap-2">
                    <HelpCircle className="w-5 h-5" /> Contact Support
                </Link>
            </div>
        </div>
    </div>
);

// --- 🔴 REJECTED VIEW COMPONENT (Dynamic Props) ---
const RejectedView = ({ reason, actionCode }: { reason: string, actionCode: string }) => {
    const getActionConfig = (code: string) => {
        switch (code) {
            case 'UPLOAD_DOCS': return { label: "Update Documents", href: "/beneficiary/settings/documents", icon: UploadCloud };
            default: return { label: "Contact Support", href: "/contact", icon: HelpCircle };
        }
    };
    
    const action = getActionConfig(actionCode || 'CONTACT_SUPPORT');

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
            <div className="bg-white border-4 border-[#004225] p-8 lg:p-12 rounded-3xl shadow-2xl max-w-3xl w-full text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-4 bg-red-600"></div> 
                <div className="flex justify-center mb-4"><X className="w-16 h-16 text-red-600" /></div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-[#004225] mb-2">Status: <span className="text-red-600">Rejected</span></h2>
                <p className="text-gray-600 text-lg font-medium mb-8">Your application was not approved</p>
                <div className="bg-[#FAF7F0] border-2 border-gray-300 rounded-xl p-6 mb-8 text-left shadow-inner min-h-[120px] flex flex-col">
                    <span className="font-bold text-[#004225] text-sm uppercase tracking-wide mb-2 block border-b border-gray-300 pb-2">Reason for Rejection:</span>
                    <p className="text-gray-700 leading-relaxed flex-grow">{reason}</p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link href="/" className="px-8 py-3 rounded-xl border-2 border-[#004225] text-[#004225] font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"><Home className="w-5 h-5" /> Back to Home</Link>
                    <Link href={action.href} className="px-8 py-3 rounded-xl bg-[#004225] text-white font-bold hover:bg-[#005a33] transition-all shadow-md flex items-center justify-center gap-2"><action.icon className="w-5 h-5" /> {action.label}</Link>
                </div>
            </div>
        </div>
    );
};

// --- 🟢 APPROVED SUCCESS VIEW ---
const ApprovedSuccessView = ({ name, onContinue }: { name: string, onContinue: () => void }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
        <div className="bg-white border-4 border-[#004225] p-8 lg:p-12 rounded-3xl shadow-2xl max-w-3xl w-full text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-4 bg-green-600"></div> 
            <div className="flex justify-center mb-4"><CheckCircle className="w-16 h-16 text-green-600 animate-bounce" /></div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#004225] mb-2">Status: <span className="text-green-600">Approved</span></h2>
            <p className="text-gray-600 text-lg font-medium mb-8">Welcome to Food-O-Nation!</p>
            <div className="bg-[#FAF7F0] border-2 border-gray-300 rounded-xl p-6 mb-8 text-left shadow-inner min-h-[120px] flex flex-col">
                <span className="font-bold text-[#004225] text-sm uppercase tracking-wide mb-2 block border-b border-gray-300 pb-2">Next Steps:</span>
                <p className="text-gray-700 leading-relaxed flex-grow">Congratulations <strong>{name}</strong>! You are now eligible to receive food assistance. You can now access your dashboard to find programs and reserve food packs.</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={onContinue} className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#004225] text-white font-bold hover:bg-[#005a33] transition-all shadow-md flex items-center justify-center gap-2 text-lg">Continue to Dashboard <ChevronRight className="w-5 h-5" /></button>
            </div>
        </div>
    </div>
);

// --- MAIN PAGE ---
export default function BeneficiaryDashboard() {
  const [isActivityHistoryOpen, setIsActivityHistoryOpen] = useState(false);
  const [hasSeenApprovedModal, setHasSeenApprovedModal] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  // 1. DATA FETCHING STATE
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. FETCH USER DATA FROM BACKEND
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if user has a token
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to access your dashboard.');
          setIsLoading(false);
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return;
        }
        
        // Fetch user profile from backend
        const profile = await authService.getMe();
        
        if (!profile) {
          setError('Failed to load user data. Please log in again.');
          setIsLoading(false);
          // Clear invalid token and redirect
          authService.logout();
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return;
        }

        // Verify user is a beneficiary
        if (!profile.beneficiaryProfile) {
          setError('This dashboard is only available for beneficiaries.');
          setIsLoading(false);
          return;
        }

        // Map backend response to frontend format
        const mappedData = {
          id: profile.id,
          name: `${profile.beneficiaryProfile.firstName} ${profile.beneficiaryProfile.lastName}`,
          email: profile.email,
          status: profile.status, // PENDING, APPROVED, REJECTED, DEACTIVATED
          // Note: rejectionReason and rejectionAction are not in the current schema
          // You may need to add these fields to the User model if needed
          rejectionReason: "The Certificate of Indigency uploaded was blurred. Please upload a clear copy.",
          rejectionAction: 'UPLOAD_DOCS'
        };

        setUserData(mappedData);
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again.');
        // If it's an authentication error, clear token and redirect
        if (err.response?.status === 401 || err.response?.status === 403) {
          authService.logout();
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col">
      {/* Replaced hardcoded header with Navbar component */}
      <Navbar />

      {/* CONTENT AREA */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* LOADING STATE */}
        {isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-16 h-16 text-[#004225] animate-spin mb-4" />
                <p className="text-[#004225] font-bold text-xl">Checking Account Status...</p>
            </div>
        )}

        {/* ERROR STATE */}
        {error && !isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-white border-4 border-red-500 p-8 lg:p-12 rounded-3xl shadow-2xl max-w-3xl w-full text-center">
                    <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl lg:text-3xl font-bold text-[#004225] mb-4">Error Loading Dashboard</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            onClick={() => window.location.reload()} 
                            className="px-8 py-3 rounded-xl bg-[#004225] text-white font-bold hover:bg-[#005a33] transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" /> Retry
                        </button>
                        <Link 
                            href="/" 
                            className="px-8 py-3 rounded-xl border-2 border-[#004225] text-[#004225] font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                        >
                            <Home className="w-5 h-5" /> Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        )}

        {!isLoading && userData && (
            <>
                {/* CASE 1: PENDING */}
                {userData.status === 'PENDING' && !showApplicationForm && (
                    <PendingView userData={userData} onShowForm={() => setShowApplicationForm(true)} />
                )}
                {userData.status === 'PENDING' && showApplicationForm && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl lg:text-4xl font-bold text-[#004225]">Beneficiary Application Form</h1>
                            <button
                                onClick={() => setShowApplicationForm(false)}
                                className="px-4 py-2 rounded-lg border-2 border-[#004225] text-[#004225] font-bold hover:bg-gray-100 transition-all"
                            >
                                <X className="w-5 h-5" /> Close
                            </button>
                        </div>
                        <BeneficiaryApplicationForm 
                            userData={userData} 
                         onSubmit={(data) => {
                      console.log('Application submitted:', data);
                      
                      // 1. Force the status to APPROVED so the view changes
                      setUserData((prev: any) => ({ ...prev, status: 'APPROVED' }));
                      
                      // 2. Make sure the "Success" modal pops up first
                      setHasSeenApprovedModal(false);
                      
                      // 3. Close the form window
                      setShowApplicationForm(false);
                  }}
                        />
                    </div>
                )}

                {/* CASE 2: REJECTED */}
                {userData.status === 'REJECTED' && (
                    <RejectedView reason={userData.rejectionReason} actionCode={userData.rejectionAction} />
                )}

                {/* CASE 3: APPROVED (First Time View) */}
                {userData.status === 'APPROVED' && !hasSeenApprovedModal && (
                    <ApprovedSuccessView name={userData.name} onContinue={() => setHasSeenApprovedModal(true)} />
                )}

                {/* CASE 4: APPROVED & CLICKED CONTINUE (DASHBOARD) */}
                {userData.status === 'APPROVED' && hasSeenApprovedModal && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        
                        {/* Header Section with Activity Log Button */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-[#004225] mb-2">Welcome Back!</h1>
                            <p className="text-[#004225]/70 text-lg">Browse available programs and join activities</p>
                        </div>
                        <button 
                            onClick={() => setIsActivityHistoryOpen(true)}
                            className="bg-[#FFB000] text-[#004225] px-6 py-3 rounded-xl font-bold hover:bg-yellow-500 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:-translate-y-1 w-full sm:w-auto justify-center text-lg"
                        >
                            View Activity Log <ArrowRight className="w-5 h-5" />
                        </button>
                        </div>

                        {/* Available Programs */}
                        <div className="bg-white border-2 border-[#004225] w-full rounded-2xl overflow-hidden shadow-2xl mb-8">
                        <div className="text-center font-bold bg-[#004225] text-[#FFB000] p-6 lg:p-8 text-2xl lg:text-3xl shadow-lg">
                            Available Programs
                        </div>

                        {/* Program Cards */}
                        <div className="divide-y-2 divide-[#004225]/20">
                            {[1, 2, 3].map((item, index) => (
                            <div 
                                key={item} 
                                className="p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 relative transition-all hover:bg-[#FAF7F0] group"
                            >
                                <div className="space-y-4">
                                <div>
                                    <p className="font-bold text-[#004225] text-xl lg:text-2xl mb-3">Program Title:</p>
                                    <p className="text-[#004225]/80 text-base lg:text-lg leading-relaxed">Program Details - Comprehensive description of the program activities and objectives</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2 text-[#004225]/80 bg-[#FFB000]/10 px-3 py-2 rounded-lg">
                                    <MapPin className="w-5 h-5 text-[#FFB000]" />
                                    <span className="font-semibold">Venue Location</span>
                                    </div>
                                    <span className="bg-[#FFB000] text-[#004225] px-5 py-2 rounded-full text-sm font-bold shadow-md">
                                    Status: Active
                                    </span>
                                </div>
                                </div>

                                <div className="space-y-4">
                                <div className="flex items-center gap-3 text-[#004225] bg-[#FAF7F0] p-4 rounded-xl border-2 border-[#004225]/20">
                                    <div className="bg-[#FFB000]/20 p-3 rounded-lg">
                                    <Clock className="w-6 h-6 text-[#FFB000]" />
                                    </div>
                                    <div>
                                    <p className="text-sm text-[#004225]/70 font-medium">Time</p>
                                    <p className="font-bold text-lg">10:00 AM - 2:00 PM</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-[#004225] bg-[#FAF7F0] p-4 rounded-xl border-2 border-[#004225]/20">
                                    <div className="bg-[#FFB000]/20 p-3 rounded-lg">
                                    <Calendar className="w-6 h-6 text-[#FFB000]" />
                                    </div>
                                    <div>
                                    <p className="text-sm text-[#004225]/70 font-medium">Date</p>
                                    <p className="font-bold text-lg">December 25, 2024</p>
                                    </div>
                                </div>
                                </div>

                                <button className="absolute right-6 top-1/2 -translate-y-1/2 bg-[#FFB000] text-[#004225] px-8 lg:px-10 py-4 rounded-xl font-bold hover:bg-yellow-500 transition-all shadow-xl hover:shadow-2xl transform hover:scale-110 group-hover:scale-110 text-lg">
                                Join
                                </button>
                            </div>
                            ))}
                        </div>

                        <div className="p-6 text-center bg-[#FFB000]/10 border-t-2 border-[#004225] font-bold text-[#004225] hover:bg-[#FFB000]/20 transition-all cursor-pointer flex items-center justify-center gap-2 group text-lg">
                            View More <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </div>
                        </div>

                        {/* Activity History Popup/Modal */}
                        {isActivityHistoryOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                            <div className="bg-white border-4 border-[#004225] rounded-2xl p-6 lg:p-8 max-w-lg w-full mx-4 relative shadow-2xl">
                            <button 
                                onClick={() => setIsActivityHistoryOpen(false)}
                                className="absolute top-4 right-4 text-[#004225] hover:bg-red-500 hover:text-white rounded-full p-2 transition-all transform hover:rotate-90 w-10 h-10 flex items-center justify-center"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            
                            <h3 className="text-2xl lg:text-3xl font-bold bg-[#004225] text-[#FFB000] p-5 rounded-xl mb-6 text-center shadow-lg">
                                Activity History
                            </h3>
                            
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {[1, 2, 3, 4, 5].map(id => (
                                <div key={id} className="border-2 border-[#004225] rounded-xl p-5 hover:border-[#FFB000] hover:bg-[#FFB000]/10 hover:shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer">
                                    <div className="bg-[#FFB000]/20 border-2 border-[#FFB000] rounded-xl p-4 mb-4">
                                    <p className="text-sm font-bold text-[#004225]">Activity/s</p>
                                    </div>
                                    <div className="text-sm text-[#004225] flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-[#FFB000]" />
                                    <span className="font-semibold">Date: </span>
                                    <span className="bg-white border-2 border-[#004225] rounded-lg px-4 py-2 inline-block min-w-[160px] text-[#004225] font-bold"></span>
                                    </div>
                                </div>
                                ))}
                            </div>

                            <button className="mt-6 w-full bg-[#FFB000] text-[#004225] px-4 py-4 rounded-xl font-bold hover:bg-yellow-500 transition-all shadow-lg hover:shadow-xl text-lg">
                                View more
                            </button>
                            </div>
                        </div>
                        )}

                        {/* Donation Center Map */}
                        <div className="mt-8 bg-white border-2 border-[#004225] rounded-2xl p-6 lg:p-8 shadow-2xl">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b-2 border-[#004225]">
                            <h3 className="text-xl lg:text-2xl font-bold text-[#004225] flex items-center gap-3">
                            <div className="bg-[#FFB000]/20 p-3 rounded-xl">
                                <MapPin className="w-7 h-7 text-[#FFB000]" />
                            </div>
                            Donation Center Map
                            </h3>
                            <button className="bg-[#FFB000] text-[#004225] px-6 py-3 rounded-xl font-bold hover:bg-yellow-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto">
                            View Details
                            </button>
                        </div>

                        <div className="w-full h-64 lg:h-80 border-2 border-[#004225] rounded-xl relative bg-white overflow-hidden shadow-inner group">
                            {/* Modern Map Pattern */}
                            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                            <svg width="100%" height="100%">
                                <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#004225" strokeWidth="1"/>
                                </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />
                            </svg>
                            </div>

                            {/* Map Pins with Animation */}
                            <div className="absolute left-8 lg:left-12 top-32 lg:top-40 animate-bounce">
                            <div className="bg-[#FFB000] text-[#004225] rounded-full p-4 shadow-2xl border-4 border-white transform hover:scale-125 transition-transform cursor-pointer">
                                <MapPin className="w-7 h-7" />
                            </div>
                            </div>
                            <div className="absolute right-12 lg:right-16 top-16 lg:top-20 animate-bounce" style={{ animationDelay: '0.2s' }}>
                            <div className="bg-[#FFB000] text-[#004225] rounded-full p-4 shadow-2xl border-4 border-white transform hover:scale-125 transition-transform cursor-pointer">
                                <MapPin className="w-7 h-7" />
                            </div>
                            </div>
                            <div className="absolute left-1/2 bottom-8 lg:bottom-12 -translate-x-1/2 animate-bounce" style={{ animationDelay: '0.4s' }}>
                            <div className="bg-[#FFB000] text-[#004225] rounded-full p-4 shadow-2xl border-4 border-white transform hover:scale-125 transition-transform cursor-pointer">
                                <MapPin className="w-7 h-7" />
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                )}
            </>
        )}
      </div>

      <Footer />
    </div>
  );
}