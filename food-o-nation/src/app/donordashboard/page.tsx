// ./food-o-nation/src/app/donordashboard/page.tsx

'use client'; 

import React, { useState, useEffect } from 'react';
import { 
  MapPin, Clock, Star, CheckCircle, X, AlertTriangle, Coins, Banknote, 
  Loader2, XCircle, Home, HelpCircle, RefreshCw, ChevronRight, FileText, UploadCloud 
} from 'lucide-react'; 
import Link from 'next/link';
import { QRCodeCanvas as QRCode } from 'qrcode.react'; 

// --- 🟡 PENDING VIEW COMPONENT ---
const PendingView = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
        <div className="bg-white border-4 border-[#004225] p-8 lg:p-12 rounded-3xl shadow-2xl max-w-3xl w-full text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-4 bg-[#FFB000]"></div> 
            
            <h1 className="text-3xl lg:text-4xl font-extrabold text-[#004225] mb-2">
                Status: <span className="text-[#FFB000]">Pending Verification</span>
            </h1>
            <p className="text-gray-600 text-lg font-medium mb-8">
                Your donor account is currently under review
            </p>

            <div className="bg-[#FAF7F0] border-2 border-gray-300 rounded-xl p-6 mb-8 text-left shadow-inner min-h-[120px] flex flex-col">
                <span className="font-bold text-[#004225] text-sm uppercase tracking-wide mb-2 block border-b border-gray-300 pb-2">
                    Validation Process:
                </span>
                <p className="text-gray-700 leading-relaxed flex-grow">
                    We are currently verifying your organization details. This usually takes <strong>24-48 hours</strong>.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
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

// --- 🔴 REJECTED VIEW COMPONENT (Dynamic Action) ---
const RejectedView = ({ reason, actionCode }: { reason: string, actionCode: string }) => {
    
    const getActionConfig = (code: string) => {
        switch (code) {
            case 'UPLOAD_DOCS':
                return { label: "Update Documents", href: "/donor/settings/documents", icon: UploadCloud };
            case 'VERIFY_ID':
                return { label: "Verify Identity", href: "/donor/settings/profile", icon: FileText };
            case 'CONTACT_SUPPORT':
            default:
                return { label: "Contact Support", href: "/contact", icon: HelpCircle };
        }
    };

    const action = getActionConfig(actionCode || 'CONTACT_SUPPORT');

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
            <div className="bg-white border-4 border-[#004225] p-8 lg:p-12 rounded-3xl shadow-2xl max-w-3xl w-full text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-4 bg-red-600"></div> 

                <div className="flex justify-center mb-4">
                    <XCircle className="w-16 h-16 text-red-600" />
                </div>

                <h2 className="text-3xl lg:text-4xl font-extrabold text-[#004225] mb-2">
                    Status: <span className="text-red-600">Rejected</span>
                </h2>
                <p className="text-gray-600 text-lg font-medium mb-8">
                    Your Donor Application was not approved
                </p>

                <div className="bg-[#FAF7F0] border-2 border-gray-300 rounded-xl p-6 mb-8 text-left shadow-inner min-h-[120px] flex flex-col">
                    <span className="font-bold text-[#004225] text-sm uppercase tracking-wide mb-2 block border-b border-gray-300 pb-2">
                        Reason for Rejection:
                    </span>
                    <p className="text-gray-800 leading-relaxed flex-grow font-medium">
                        {reason}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link href="/" className="px-8 py-3 rounded-xl border-2 border-[#004225] text-[#004225] font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                        <Home className="w-5 h-5" /> Back to Home
                    </Link>
                    
                    <Link href={action.href} className="px-8 py-3 rounded-xl bg-[#004225] text-white font-bold hover:bg-[#005a33] transition-all shadow-md flex items-center justify-center gap-2">
                        <action.icon className="w-5 h-5" /> {action.label}
                    </Link>
                </div>
            </div>
        </div>
    );
};

// --- 🟢 APPROVED SUCCESS MODAL ---
const ApprovedSuccessModal = ({ name, onContinue }: { name: string, onContinue: () => void }) => (
    <div className="fixed inset-0 z-[100] bg-[#FAF7F0]/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white border-4 border-[#004225] rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in duration-300 text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center border-4 border-green-600 shadow-inner">
                <CheckCircle className="w-12 h-12 text-green-700 animate-bounce" />
            </div>
            <div>
                <h2 className="text-3xl font-extrabold text-[#004225]">Account Verified!</h2>
                <p className="text-green-600 font-bold text-lg mt-1">Welcome, {name}</p>
            </div>
            <p className="text-gray-600">
                Your donor documentation has been approved. You now have full access to create donation programs.
            </p>
            <button 
                onClick={onContinue}
                className="w-full bg-[#004225] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg"
            >
                Continue to Dashboard <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    </div>
);

// --- MAIN PAGE COMPONENT ---
export default function DonorDashboardPage() {
  // 1. STATE FOR DATA FETCHING
  // This replaces the hardcoded MOCK_CURRENT_USER constant
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dashboard States
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isStallReservationEnabled, setIsStallReservationEnabled] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasSeenApprovedModal, setHasSeenApprovedModal] = useState(false);
  
  const [formData, setFormData] = useState({
      title: '', details: '', participantLimit: 1 as number | string, stallLimit: 1 as number | string, venue: ''
  });

  // 2. EFFECT: SIMULATE FETCHING DATA FROM DATABASE
  useEffect(() => {
    // In a real app, this would be: await fetch('/api/user/status')
    const fakeApiCall = setTimeout(() => {
        
        // 🔄 CHANGE THIS OBJECT TO TEST DIFFERENT SCENARIOS 🔄
        const dbResponse = {
            id: 'donor-123',
            name: 'Juan Dela Cruz',
            // TRY: 'PENDING', 'REJECTED', or 'APPROVED'
            status: 'PENDING', 
            rejectionReason: "The DTI Business Permit uploaded was expired (dated 2023).",
            rejectionAction: 'UPLOAD_DOCS'
        };

        setUserData(dbResponse);
        setIsLoading(false); // Stop loading once data is "fetched"
    }, 1500); // Simulate 1.5s delay

    return () => clearTimeout(fakeApiCall);
  }, []);

  // --- Form Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (name === 'participantLimit' || name === 'stallLimit') {
          const parsed = parseInt(value);
          setFormData({ ...formData, [name]: isNaN(parsed) ? '' : parsed });
      } else {
          setFormData({ ...formData, [name]: value });
      }
  };

  const handleReviewProgram = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    setFormData({
        ...formData,
        participantLimit: Number(formData.participantLimit) || 1,
        stallLimit: isStallReservationEnabled ? (Number(formData.stallLimit) || 1) : 0, 
    });
    setShowReviewModal(true);
  };
  
  const handleConfirmCreate = () => {
    setShowReviewModal(false); 
    const uniqueProgramId = `PROG-${Date.now()}-${formData.title.substring(0, 5).toUpperCase()}`;
    setQrCodeData(uniqueProgramId); 
    setFormData({ title: '', details: '', participantLimit: 1, stallLimit: 1, venue: '' });
    setIsStallReservationEnabled(false);
  };

  // --- Modals Renderers ---
  const ReviewItem = ({ title, value }: { title: string, value: string | number }) => (
      <div className="flex justify-between items-center border-b border-gray-200 pb-1">
          <p className="font-semibold text-gray-700">{title}:</p>
          <p className="font-medium text-[#004225] text-right">{value}</p>
      </div>
  );

  const ReviewConfirmationModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
        <div className="bg-white border-4 border-[#004225] rounded-2xl p-8 max-w-lg w-full relative shadow-2xl animate-in zoom-in">
            <button onClick={() => setShowReviewModal(false)} className="absolute top-4 right-4 text-gray-500 hover:bg-red-500 hover:text-white rounded-full p-2 transition-all"><X className="w-5 h-5" /></button>
            <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-[#FFB000] mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-[#004225] mb-2">Please Review Program Details</h3>
            </div>
            <div className="bg-[#FAF7F0] p-4 rounded-xl space-y-3 mb-6 border-2 border-[#FFB000]">
                <ReviewItem title="Title" value={formData.title} />
                <ReviewItem title="Venue" value={formData.venue} />
                <ReviewItem title="Participants" value={formData.participantLimit.toLocaleString()} />
                <ReviewItem title="Stall Reservation" value={isStallReservationEnabled ? `Enabled (Limit: ${formData.stallLimit})` : 'Disabled'} />
            </div>
            <button onClick={handleConfirmCreate} className="w-full bg-[#004225] text-white px-4 py-3 rounded-xl font-bold text-lg hover:bg-[#005a33] transition-all shadow-md">Confirm and Create Program</button>
        </div>
    </div>
  );

  const QRCodeConfirmation = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white border-4 border-[#FFB000] rounded-2xl p-8 max-w-sm w-full relative shadow-2xl animate-in zoom-in">
        <button onClick={() => setQrCodeData(null)} className="absolute top-4 right-4 text-gray-500 hover:bg-red-500 hover:text-white rounded-full p-2 transition-all"><X className="w-5 h-5" /></button>
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-[#004225] mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-[#004225] mb-2">Program Created!</h3>
          <p className="text-gray-600 mb-6">Your donation schedule is confirmed. Use this QR code for fast check-in.</p>
          <div className="bg-[#FAF7F0] p-4 rounded-lg border-4 border-[#004225]/50 flex justify-center items-center shadow-inner">
            <QRCode value={qrCodeData as string} size={220} level="H" bgColor="#FFFFFF" fgColor="#004225" />
          </div>
          <p className="text-sm font-mono text-gray-500 mt-3 break-all font-semibold">Program ID: {qrCodeData}</p>
          <button onClick={() => {}} className="mt-6 w-full bg-[#FFB000] text-[#004225] px-4 py-3 rounded-xl font-bold text-lg hover:bg-yellow-500 transition-all shadow-md">Download QR Code</button>
        </div>
      </div>
    </div>
  );

  // 3. LOADING STATE VIEW
  if (isLoading) {
      return (
          <div className="min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-center">
              <Loader2 className="w-16 h-16 text-[#004225] animate-spin mb-4" />
              <p className="text-[#004225] font-bold text-xl">Loading Dashboard...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] pb-16">
      
      {/* Header */}
      <header className="bg-[#004225] text-white py-4 px-6 lg:px-12 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="text-[#FFB000] font-bold text-xl lg:text-2xl hover:scale-105 transition-transform cursor-pointer">Logo</div>
          <nav className="flex flex-wrap items-center justify-center gap-4 lg:gap-6 lg:gap-8">
            <Link href="/" className="text-white hover:text-[#FFB000] transition-colors font-medium px-2 py-1 rounded hover:bg-white/10">Home</Link>
            <Link href="/about" className="text-white hover:text-[#FFB000] transition-colors font-medium px-2 py-1 rounded hover:bg-white/10">About Us</Link>
            <Link href="/programs" className="text-white hover:text-[#FFB000] transition-colors font-medium px-2 py-1 rounded hover:bg-white/10">Programs</Link>
            <Link href="/acknowledgement" className="text-white hover:text-[#FFB000] transition-colors font-medium px-2 py-1 rounded hover:bg-white/10">Acknowledgement</Link>
            <Link href="/contact" className="text-white hover:text-[#FFB000] transition-colors font-medium px-2 py-1 rounded hover:bg-white/10">Contact Us</Link>
          </nav>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 text-[#FFB000] hover:text-yellow-300 transition-all font-semibold px-3 py-1.5 rounded hover:bg-white/10"><Star className="w-4 h-4" /><span>Donate!</span></button>
            <button className="bg-[#FFB000] text-white px-4 py-2 rounded font-semibold hover:bg-yellow-500 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Login</button>
            <button className="border-2 border-[#FFB000] text-white px-4 py-2 rounded font-semibold hover:bg-[#FFB000] hover:text-[#004225] transition-all">Sign-Up</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
        
        {/* CASE 1: PENDING */}
        {userData?.status === 'PENDING' && <PendingView />}

        {/* CASE 2: REJECTED (Pass Reason & Action Dynamically) */}
        {userData?.status === 'REJECTED' && (
            <RejectedView reason={userData.rejectionReason} actionCode={userData.rejectionAction} />
        )}

        {/* CASE 3: APPROVED (Success Modal First) */}
        {userData?.status === 'APPROVED' && !hasSeenApprovedModal && (
            <ApprovedSuccessModal name={userData.name} onContinue={() => setHasSeenApprovedModal(true)} />
        )}

        {/* CASE 4: APPROVED & CONFIRMED (Dashboard) */}
        {userData?.status === 'APPROVED' && hasSeenApprovedModal && (
            <>
                {showReviewModal && <ReviewConfirmationModal />}
                {qrCodeData && <QRCodeConfirmation />}

                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-4xl lg:text-5xl font-bold text-[#004225] mb-2">Program Management</h1>
                    <p className="text-[#004225]/70 text-lg">Create and manage your donation programs</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white border-2 border-[#004225] p-6 lg:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between group">
                                <div><p className="text-sm font-medium text-[#004225]/70 mb-2">Total Donation Made (in ₱)</p><p className="text-4xl lg:text-5xl font-bold text-[#004225]"><span className="text-[#FFB000]">₱</span>XX</p></div>
                                <div className="bg-[#FFB000]/10 p-4 rounded-lg"><Coins className="w-10 h-10 text-[#FFB000]" /></div> 
                            </div>
                            <div className="bg-white border-2 border-[#004225] p-6 lg:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between group">
                                <div><p className="text-sm font-medium text-[#004225]/70 mb-2">Total Amount Donated (in ₱)</p><p className="text-4xl lg:text-5xl font-bold text-[#004225]"><span className="text-[#FFB000]">₱</span>XX</p></div>
                                <div className="bg-[#FFB000]/10 p-4 rounded-lg"><Banknote className="w-10 h-10 text-[#FFB000]" /></div>
                            </div>
                        </div>

                        <form onSubmit={handleReviewProgram} className="bg-white border-2 border-[#004225] p-8 lg:p-10 rounded-2xl shadow-xl space-y-6">
                            <div className="border-b-2 border-[#004225] pb-4"><h2 className="text-2xl lg:text-3xl font-bold text-[#004225]">New Program Creation</h2></div>
                            <label className="block"><span className="text-[#004225] font-semibold text-lg mb-2 block">Program Title:</span><input type="text" name="title" value={formData.title} placeholder="Enter program title" onChange={handleInputChange} className="mt-2 block w-full border-2 border-[#004225] rounded-lg p-4 shadow-sm focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20 bg-white text-[#004225] text-lg transition-all" required /></label>
                            <label className="block"><span className="text-[#004225] font-semibold text-lg mb-2 block">Program Details:</span><textarea rows={5} name="details" value={formData.details} placeholder="Describe your program in detail..." onChange={handleInputChange} className="mt-2 block w-full border-2 border-[#004225] rounded-lg p-4 shadow-sm focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20 bg-white text-[#004225] text-lg transition-all resize-none" required></textarea></label>
                            <div className="bg-[#FAF7F0] p-6 rounded-xl border-2 border-[#004225]/30">
                                <div className="flex flex-wrap gap-6 lg:gap-8 items-start mb-6"><div className="flex items-center space-x-3"><input type="checkbox" id="stall" checked={isStallReservationEnabled} onChange={(e) => setIsStallReservationEnabled(e.target.checked)} className="w-5 h-5 text-[#FFB000] focus:ring-[#FFB000] accent-[#FFB000] cursor-pointer rounded-md" /><label htmlFor="stall" className="text-[#004225] font-semibold text-lg cursor-pointer">Enable Stall Reservation</label></div></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <label className="block"><span className="text-[#004225] font-semibold mb-2 block">Participant Limit:</span><input type="number" name="participantLimit" min="1" value={formData.participantLimit} placeholder="Enter a limit (e.g., 50)" onChange={handleInputChange} className="mt-2 block w-full border-2 border-[#004225] rounded-lg p-3.5 shadow-sm focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20 bg-white text-[#004225] font-medium transition-all" required /></label>
                                    <label className={`block transition-opacity duration-300 ${!isStallReservationEnabled ? 'opacity-50' : ''}`}><span className="text-[#004225] font-semibold mb-2 block">Donor Stall Limit:</span><input type="number" name="stallLimit" min="1" value={formData.stallLimit} placeholder="Enter a limit (e.g., 10)" onChange={handleInputChange} className="mt-2 block w-full border-2 border-[#004225] rounded-lg p-3.5 shadow-sm focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20 bg-white text-[#004225] font-medium transition-all" disabled={!isStallReservationEnabled} required />{!isStallReservationEnabled && (<p className="text-sm text-red-600 mt-1">Enable Stall Reservation above to set a limit.</p>)}</label>
                                </div>
                            </div>
                            <label className="block"><span className="text-[#004225] font-semibold text-lg mb-2 block">Program Venue:</span><input type="text" name="venue" value={formData.venue} placeholder="Enter venue address" onChange={handleInputChange} className="mt-2 block w-full border-2 border-[#004225] rounded-lg p-4 shadow-sm focus:border-[#FFB000] focus:ring-4 focus:ring-[#FFB000]/20 bg-white text-[#004225] text-lg transition-all" required /></label>
                            <div className="h-56 lg:h-64 bg-white border-2 border-[#004225] rounded-xl flex items-center justify-center relative overflow-hidden group"><div className="absolute inset-0"><svg width="100%" height="100%" className="opacity-20 group-hover:opacity-30 transition-opacity"><line x1="0" y1="0" x2="100%" y2="100%" stroke="#004225" strokeWidth="2" /><line x1="100%" y1="0" x2="0" y2="100%" stroke="#004225" strokeWidth="2" /></svg></div><div className="relative z-10 flex items-center gap-3"><MapPin className="w-10 h-10 text-[#FFB000] group-hover:scale-110 transition-transform" /><p className="text-[#004225] font-medium">Program Venue Map Placeholder</p></div></div>
                            <button type="submit" className="w-full bg-[#FFB000] text-[#004225] px-6 py-4 rounded-xl font-bold text-lg hover:bg-yellow-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">Review & Create Program</button>
                        </form>
                    </div>
                    
                    {/* Right Column */}
                    <div className="space-y-8">
                        <div className="bg-white border-2 border-[#004225] p-6 lg:p-8 rounded-2xl shadow-xl">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-[#004225]"><h3 className="text-xl lg:text-2xl font-bold text-[#004225]">Donation History</h3><button className="text-[#FFB000] text-sm hover:text-yellow-500 font-bold hover:underline transition-all">View All</button></div>
                            <div className="space-y-4">{[1, 2, 3, 4].map(id => (<div key={id} className="border-2 border-[#004225] p-4 rounded-xl flex justify-between items-center bg-white hover:bg-[#FAF7F0] hover:shadow-md transition-all group cursor-pointer"><div className="flex-1"><p className="font-semibold text-[#004225] mb-1">Program Title</p><p className="text-[#004225]/70 text-sm">Date: XX/XX/XX</p></div><div className="bg-[#FFB000]/10 p-2 rounded-lg group-hover:bg-[#FFB000]/20 transition-colors"><Clock className="w-5 h-5 text-[#FFB000]" /></div></div>))}</div>
                        </div>
                        <div className="bg-white border-2 border-[#004225] p-6 lg:p-8 rounded-2xl shadow-xl">
                            <h3 className="text-xl lg:text-2xl font-bold text-[#004225] mb-6 pb-4 border-b-2 border-[#004225]">Donation Center Map</h3>
                            <div className="h-64 lg:h-80 bg-white border-2 border-[#004225] rounded-xl flex items-center justify-center relative overflow-hidden group"><div className="absolute inset-0"><svg width="100%" height="100%" className="opacity-20 group-hover:opacity-30 transition-opacity"><line x1="0" y1="0" x2="100%" y2="100%" stroke="#004225" strokeWidth="2" /><line x1="100%" y1="0" x2="0" y2="100%" stroke="#004225" strokeWidth="2" /></svg></div><MapPin className="w-10 h-10 text-[#FFB000] absolute top-1/2 left-1/4 -mt-5 -ml-5 z-10 group-hover:scale-125 transition-transform" /><MapPin className="w-10 h-10 text-[#FFB000] absolute top-3/4 right-1/4 -mt-5 -ml-5 z-10 group-hover:scale-125 transition-transform" /><MapPin className="w-10 h-10 text-[#FFB000] absolute top-1/4 right-1/2 -mt-5 -ml-5 z-10 group-hover:scale-125 transition-transform" /><p className="text-[#004225] font-medium relative z-10">Global Map View</p></div>
                        </div>
                    </div>
                </div>
            </>
        )}
      </main>
    </div>
  );
}