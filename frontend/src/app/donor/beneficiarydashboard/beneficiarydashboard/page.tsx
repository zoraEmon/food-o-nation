'use client'; 

import React, { useState, useEffect } from 'react';
import { 
  X, MapPin, Calendar, Clock, ArrowRight, ChevronRight, ChevronDown, ChevronUp, Star, 
  Loader2, Home, HelpCircle, CheckCircle, RefreshCw, UploadCloud, FileText, Info, History
} from 'lucide-react';
import Link from 'next/link';

// --- Imported Layout Components ---
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { authService } from "@/services/authService";
import BeneficiaryApplicationForm from "@/components/features/beneficiary/BeneficiaryApplicationForm";

// --- MOCK DATA: ACTIVE PROGRAMS ---
const MOCK_ACTIVE_PROGRAMS = [
  {
    id: 1,
    title: "Barangay San Jose Community Feeding",
    description: "A comprehensive feeding program targeting undernourished children aged 4-12. Includes nutritional talks for parents.",
    fullDetails: "This program aims to provide nutritious meals to 200 children in Barangay San Jose. The menu is prepared by nutritionists to ensure balanced diet. Parents are required to attend a short seminar on affordable nutrition before the feeding session.",
    location: "San Jose Barangay Hall",
    mapQuery: "San+Jose+Barangay+Hall+Davao", 
    date: "December 25, 2024",
    time: "10:00 AM - 2:00 PM",
    status: "Active"
  },
  {
    id: 2,
    title: "Relief Goods Distribution - Zone 4",
    description: "Distribution of essential food packs (Rice, Canned Goods, Noodles) for families affected by recent flooding.",
    fullDetails: "Emergency relief operation for Zone 4 residents. Each family will receive a pack containing 5kg of rice, 6 canned goods, 5 packs of noodles, and hygiene kits. Please bring your QR code and valid ID for verification.",
    location: "Davao City Recreation Center",
    mapQuery: "Davao+City+Recreation+Center",
    date: "December 28, 2024",
    time: "08:00 AM - 5:00 PM",
    status: "Active"
  },
  {
    id: 3,
    title: "Weekend Surplus Food Pantry",
    description: "Distribution of rescued surplus vegetables and bakery items from partner establishments.",
    fullDetails: "Join us this weekend for our surplus rescue drive. We will be distributing fresh vegetables (kalabasa, sitaw, talong) sourced from local farms and day-old bread from partner bakeries. Bring your own eco-bag.",
    location: "People's Park Davao",
    mapQuery: "Peoples+Park+Davao",
    date: "January 05, 2025",
    time: "09:00 AM - 12:00 PM",
    status: "Active"
  }
];

// --- MOCK DATA: PAST / COMPLETED CHARITY EVENTS ---
const MOCK_PAST_PROGRAMS = [
  {
    id: 101,
    title: "Grand Charity Lunch Mission",
    description: "Served hot, nutritious meals (Chicken Tinola & Rice) to over 500 homeless individuals.",
    fullDetails: "Our largest feeding mission of the quarter. Partnering with local restaurants, we provided hot lunch meals to 500 homeless individuals and street dwellers in the downtown area. Leftover supplies were packed for their dinner.",
    location: "Rizal Park",
    mapQuery: "Rizal+Park+Davao", 
    date: "November 15, 2024",
    time: "11:00 AM - 1:00 PM",
    status: "Completed"
  },
  {
    id: 102,
    title: "Rice & Canned Goods Drive",
    description: "Distributed 300 sacks of rice and canned goods to low-income families in Brgy. 76-A.",
    fullDetails: "A targeted food donation drive for 300 registered indigent families. Each family received 10kg of commercial rice, 10 cans of sardines, and 5 cans of corned beef to supplement their monthly pantry needs.",
    location: "Brgy. 76-A Gym",
    mapQuery: "Barangay+76-A+Gym",
    date: "October 30, 2024",
    time: "08:00 AM - 11:00 AM",
    status: "Completed"
  },
  {
    id: 103,
    title: "Nutrition Month Feeding Program",
    description: "Month-end culmination activity providing milk and nutritional biscuits to toddlers.",
    fullDetails: " focused on combating malnutrition among toddlers (ages 1-3). We distributed fortified milk powder, vitamin supplements, and high-fiber biscuits to 150 identified beneficiaries.",
    location: "Agdao Health Center",
    mapQuery: "Agdao+Health+Center",
    date: "October 15, 2024",
    time: "09:00 AM - 12:00 PM",
    status: "Completed"
  }
];

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
                    Our team is verifying your submitted documents. This usually takes <strong>24-48 hours</strong>.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={onShowForm} className="px-8 py-3 rounded-xl bg-[#FFB000] text-[#004225] font-bold hover:bg-yellow-500 transition-all shadow-md flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5" /> Complete Application Form
                </button>
                <Link href="/" className="px-8 py-3 rounded-xl border-2 border-[#004225] text-[#004225] font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                    <Home className="w-5 h-5" /> Back to Home
                </Link>
            </div>
        </div>
    </div>
);

// --- 🔴 REJECTED VIEW COMPONENT ---
const RejectedView = ({ reason, actionCode }: { reason: string, actionCode: string }) => {
    const action = actionCode === 'UPLOAD_DOCS' 
        ? { label: "Update Documents", href: "/beneficiary/settings/documents", icon: UploadCloud }
        : { label: "Contact Support", href: "/contact", icon: HelpCircle };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
            <div className="bg-white border-4 border-[#004225] p-8 lg:p-12 rounded-3xl shadow-2xl max-w-3xl w-full text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-4 bg-red-600"></div> 
                <div className="flex justify-center mb-4"><X className="w-16 h-16 text-red-600" /></div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-[#004225] mb-2">Status: <span className="text-red-600">Rejected</span></h2>
                <p className="text-gray-600 text-lg font-medium mb-8">Your application was not approved</p>
                <div className="bg-[#FAF7F0] border-2 border-gray-300 rounded-xl p-6 mb-8 text-left shadow-inner">
                    <span className="font-bold text-[#004225] text-sm uppercase tracking-wide mb-2 block border-b border-gray-300 pb-2">Reason:</span>
                    <p className="text-gray-700 leading-relaxed">{reason}</p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link href="/" className="px-8 py-3 rounded-xl border-2 border-[#004225] text-[#004225] font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"><Home className="w-5 h-5" /> Home</Link>
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
            <div className="bg-[#FAF7F0] border-2 border-gray-300 rounded-xl p-6 mb-8 text-left shadow-inner">
                <p className="text-gray-700 leading-relaxed">Congratulations <strong>{name}</strong>! You can now access available programs.</p>
            </div>
            <button onClick={onContinue} className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#004225] text-white font-bold hover:bg-[#005a33] transition-all shadow-md flex items-center justify-center gap-2 text-lg">Continue to Dashboard <ChevronRight className="w-5 h-5" /></button>
        </div>
    </div>
);

// --- 🆕 DETAILED PROGRAM CARD MODAL ---
const ProgramDetailsModal = ({ program, onClose, onConfirm }: { program: any, onClose: () => void, onConfirm: () => void }) => {
    // Disable join button if status is Completed
    const isCompleted = program.status === 'Completed';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative border-4 border-[#004225] flex flex-col">
                
                {/* Header */}
                <div className={`${isCompleted ? 'bg-gray-600' : 'bg-[#004225]'} text-white p-6 sticky top-0 z-10 flex justify-between items-start transition-colors duration-300`}>
                    <div>
                        <h2 className="text-2xl lg:text-3xl font-bold font-heading text-[#FFB000]">{program.title}</h2>
                        <div className="flex gap-4 mt-2 text-sm lg:text-base opacity-90">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {program.date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {program.time}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 lg:p-8 space-y-8 flex-grow bg-[#FAF7F0]">
                    
                    {/* Status Badge for Completed */}
                    {isCompleted && (
                        <div className="bg-gray-200 border-l-4 border-gray-600 p-4 rounded-r-lg flex items-center gap-3">
                            <History className="w-6 h-6 text-gray-600" />
                            <div>
                                <p className="font-bold text-gray-700">Event Ended</p>
                                <p className="text-sm text-gray-600">This food donation event has successfully concluded.</p>
                            </div>
                        </div>
                    )}

                    {/* Details Section */}
                    <div className="bg-white p-6 rounded-2xl border-2 border-[#004225]/10 shadow-sm">
                        <h3 className="text-xl font-bold text-[#004225] mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-[#FFB000]" /> Program Details
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            {program.fullDetails}
                        </p>
                    </div>

                    {/* Map & Location Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border-2 border-[#004225]/10 shadow-sm flex flex-col justify-center">
                            <h3 className="text-xl font-bold text-[#004225] mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-[#FFB000]" /> Venue Location
                            </h3>
                            <p className="text-2xl font-bold text-gray-800 mb-2">{program.location}</p>
                            <p className="text-gray-500">Please arrive 15 minutes before the scheduled time.</p>
                        </div>

                        {/* Embedded Google Map */}
                        <div className="h-64 lg:h-full min-h-[250px] w-full border-2 border-[#004225] rounded-xl overflow-hidden shadow-md relative bg-gray-200">
                            <iframe 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                loading="lazy" 
                                allowFullScreen 
                                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=$?q=$${program.mapQuery}&output=embed`}
                            ></iframe>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-[#e6e6e6] -z-10">
                                <div className="text-center">
                                    <MapPin className="w-12 h-12 text-[#004225] mx-auto mb-2 animate-bounce" />
                                    <p className="font-bold text-[#004225] opacity-50">Loading Map...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 bg-white border-t-2 border-[#004225]/10 sticky bottom-0 z-10 flex flex-col sm:flex-row justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl border-2 border-gray-300 font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                        Close
                    </button>
                    {!isCompleted && (
                        <button onClick={onConfirm} className="px-8 py-3 rounded-xl bg-[#FFB000] text-[#004225] font-bold text-lg hover:bg-yellow-500 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                            Confirm Application <CheckCircle className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- MAIN PAGE ---
export default function BeneficiaryDashboard() {
  const [isActivityHistoryOpen, setIsActivityHistoryOpen] = useState(false);
  const [hasSeenApprovedModal, setHasSeenApprovedModal] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  
  // State for toggling view
  const [showAllPrograms, setShowAllPrograms] = useState(false);
  
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const simulateFetch = () => {
        setTimeout(() => {
            setUserData({
                id: '123',
                name: 'Juan Dela Cruz',
                email: 'juan@example.com',
                status: 'APPROVED' 
            });
            setIsLoading(false);
        }, 1500);
    };
    simulateFetch();
  }, []);

  const handleJoinProgram = () => {
      alert(`Successfully applied for: ${selectedProgram?.title}`);
      setSelectedProgram(null);
  }

  // Determine which programs to show based on "View More" toggle
  const visibleActivePrograms = showAllPrograms ? MOCK_ACTIVE_PROGRAMS : MOCK_ACTIVE_PROGRAMS.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col">
      <Navbar />

      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {isLoading && <Loader2 className="w-16 h-16 text-[#004225] animate-spin mx-auto mt-20" />}

        {!isLoading && userData && (
            <>
                {userData.status === 'PENDING' && <PendingView userData={userData} onShowForm={() => setShowApplicationForm(true)} />}
                
                {userData.status === 'APPROVED' && hasSeenApprovedModal && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-bold text-[#004225] mb-2">Welcome, {userData.name.split(' ')[0]}!</h1>
                                <p className="text-[#004225]/70 text-lg">Browse available programs and join activities</p>
                            </div>
                            <button 
                                onClick={() => setIsActivityHistoryOpen(true)}
                                className="bg-[#FFB000] text-[#004225] px-6 py-3 rounded-xl font-bold hover:bg-yellow-500 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                            >
                                View Activity Log <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* --- ACTIVE PROGRAMS SECTION --- */}
                        <div className="bg-white border-2 border-[#004225] w-full rounded-2xl overflow-hidden shadow-2xl mb-8">
                            <div className="text-center font-bold bg-[#004225] text-[#FFB000] p-6 text-2xl shadow-lg">
                                Available Programs
                            </div>

                            <div className="divide-y-2 divide-[#004225]/20">
                                {visibleActivePrograms.map((program) => (
                                    <div key={program.id} className="p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 relative transition-all hover:bg-[#FAF7F0] group">
                                        <div className="space-y-4">
                                            <div>
                                                <p className="font-bold text-[#004225] text-xl lg:text-2xl mb-2 group-hover:text-[#FFB000] transition-colors">{program.title}</p>
                                                <p className="text-[#004225]/80 text-base leading-relaxed line-clamp-2">{program.description}</p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4">
                                                <div className="flex items-center gap-2 text-[#004225]/80 bg-[#FFB000]/10 px-3 py-2 rounded-lg">
                                                    <MapPin className="w-5 h-5 text-[#FFB000]" />
                                                    <span className="font-semibold">{program.location}</span>
                                                </div>
                                                <span className="bg-[#FFB000] text-[#004225] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                    {program.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 flex flex-col justify-center items-start md:items-end">
                                            <div className="flex items-center gap-4 w-full md:w-auto md:justify-end">
                                                <div className="flex items-center gap-2 text-[#004225]">
                                                    <Calendar className="w-5 h-5 text-[#FFB000]" />
                                                    <span className="font-bold">{program.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[#004225]">
                                                    <Clock className="w-5 h-5 text-[#FFB000]" />
                                                    <span className="font-bold">{program.time}</span>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={() => setSelectedProgram(program)}
                                                className="w-full md:w-auto bg-[#FFB000] text-[#004225] px-8 py-3 rounded-xl font-bold hover:bg-yellow-500 transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 z-10"
                                            >
                                                View Details & Apply <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* View More / View Less Button */}
                            <button 
                                onClick={() => setShowAllPrograms(!showAllPrograms)}
                                className="w-full p-6 text-center bg-[#FFB000]/10 border-t-2 border-[#004225] font-bold text-[#004225] hover:bg-[#FFB000]/20 transition-all cursor-pointer flex items-center justify-center gap-2 group text-lg"
                            >
                                {showAllPrograms ? (
                                    <>Show Less <ChevronUp className="w-6 h-6" /></>
                                ) : (
                                    <>View More Programs <ChevronDown className="w-6 h-6" /></>
                                )}
                            </button>
                        </div>

                        {/* --- DONE/COMPLETED PROGRAMS SECTION (Revealed on Toggle) --- */}
                        {showAllPrograms && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
                                <div className="bg-gray-100 border-2 border-gray-400 w-full rounded-2xl overflow-hidden shadow-inner">
                                    <div className="text-center font-bold bg-gray-600 text-white p-4 text-xl shadow-lg flex items-center justify-center gap-2">
                                        <History className="w-6 h-6" /> Past / Completed Charity Events
                                    </div>

                                    <div className="divide-y-2 divide-gray-300">
                                        {MOCK_PAST_PROGRAMS.map((program) => (
                                            <div key={program.id} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative bg-gray-50 opacity-80 hover:opacity-100 transition-opacity">
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="font-bold text-gray-700 text-lg mb-1">{program.title}</p>
                                                        <p className="text-gray-600 text-sm leading-relaxed">{program.description}</p>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                            <MapPin className="w-4 h-4 text-gray-500" />
                                                            <span>{program.location}</span>
                                                        </div>
                                                        <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs font-bold uppercase">
                                                            {program.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 flex flex-col justify-center items-start md:items-end">
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {program.date}</span>
                                                    </div>
                                                    
                                                    {/* View Details Only (No Apply) */}
                                                    <button 
                                                        onClick={() => setSelectedProgram(program)}
                                                        className="w-full md:w-auto border-2 border-gray-400 text-gray-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all text-sm flex items-center justify-center gap-2"
                                                    >
                                                        View Recap <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Modal Injection */}
                        {selectedProgram && (
                            <ProgramDetailsModal 
                                program={selectedProgram} 
                                onClose={() => setSelectedProgram(null)} 
                                onConfirm={handleJoinProgram} 
                            />
                        )}

                    </div>
                )}
                
                {userData.status === 'APPROVED' && !hasSeenApprovedModal && (
                    <ApprovedSuccessView name={userData.name} onContinue={() => setHasSeenApprovedModal(true)} />
                )}
            </>
        )}
      </div>
      <Footer />
    </div>
  );
}