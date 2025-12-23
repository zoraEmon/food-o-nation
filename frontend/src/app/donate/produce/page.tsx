"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
const QRCode = dynamic(() => import('react-qr-code'), { ssr: false }); 
import { 
  MapPin, Calendar, ArrowLeft, CheckCircle, Download, Clock, AlignLeft, ChevronDown, Loader2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { createProduceDonation, DonationItem } from "@/services/produceService";

// --- TYPES ---
interface Location { 
  id: string; 
  name: string; 
  address: string; 
}

// --- CONSTANTS ---
const TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", 
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
];

// --- SUCCESS MODAL ---
const SuccessModal = ({ isOpen, onClose, qrData, email, donationId }: { isOpen: boolean; onClose: () => void; qrData: string, email: string, donationId?: string }) => {
  if (!isOpen) return null;

  const downloadQRCode = () => {
    const svg = document.getElementById("qr-code-svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        if(ctx) {
            ctx.fillStyle = "white"; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `appointment-qr-${Date.now()}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center border-4 border-[#004225] relative overflow-hidden transform transition-all scale-100">
        {/* Top Gold Strip */}
        <div className="absolute top-0 left-0 w-full h-4 bg-[#ffb000]"></div>
        
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-24 w-24 border-4 border-[#004225] rounded-lg mb-6 mt-4">
           {/* Wireframe Style Box with X */}
           <div className="relative w-full h-full">
              <div className="absolute inset-0 border-t-2 border-b-2 border-[#004225] rotate-45 scale-x-125 top-[45%]"></div>
              <div className="absolute inset-0 border-t-2 border-b-2 border-[#004225] -rotate-45 scale-x-125 top-[45%]"></div>
           </div>
        </div>

        <h3 className="text-2xl font-extrabold text-[#004225] mb-2 font-heading">Appointment Created!</h3>
        <p className="text-sm text-gray-600 font-bold mb-2">
          Please show this QR Code at the center.
        </p>
        {donationId && (
          <p className="text-xs text-gray-500 mb-6 bg-gray-100 py-2 px-3 rounded">
            Donation ID: <span className="font-mono font-bold">{donationId}</span>
          </p>
        )}
        
        <div className="bg-white p-4 border-2 border-dashed border-gray-300 rounded-xl mb-6 inline-block shadow-sm">
          <Suspense fallback={<div className="w-[140px] h-[140px] bg-gray-200 rounded flex items-center justify-center">Loading...</div>}>
            <QRCode id="qr-code-svg" value={qrData} size={140} level="H" bgColor="#FFFFFF" fgColor="#004225" />
          </Suspense>
        </div>
        
        <div className="flex flex-col gap-3">
          <Button onClick={downloadQRCode} className="w-full py-3 rounded-xl bg-[#ffb000] text-black font-bold shadow-md hover:bg-[#ffc107] flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download QR Code
          </Button>
          <Button onClick={onClose} className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-bold hover:bg-gray-50 bg-transparent">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
export default function ProduceDonationPage() {
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // --- DYNAMIC DATA STATE ---
  const [locations, setLocations] = useState<Location[]>([]);
  const [fetchingLocations, setFetchingLocations] = useState(true);

  // Form State
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setCurrentUser(JSON.parse(storedUser)); } catch (e) { console.error(e); }
    }

    const fetchCenters = async () => {
      setFetchingLocations(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        const data = [
          { id: "loc1", name: "Downtown Relief Center", address: "123 Main St, Centro" },
          { id: "loc2", name: "Westside Food Bank", address: "45 West Ave, Brgy. West" },
          { id: "loc3", name: "Eastside Shelter", address: "88 East Blvd, Riverside" },
          { id: "loc4", name: "North Harbor Hub", address: "Pier 4, North Harbor" },
        ];
        setLocations(data);
      } catch (error) {
        console.error("Failed to fetch locations");
      } finally {
        setFetchingLocations(false);
      }
    };

    fetchCenters();
  }, []);

  const getFormattedDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long', 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSchedule = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    const uniqueId = `APT-${Date.now()}-${selectedLocationId}`;
    setQrCodeData(uniqueId);
    setShowSuccessModal(true);
    setLoading(false);
  };

  // Styles
  const inputClass = "w-full p-3 pl-10 rounded-lg bg-gray-50 border-2 border-gray-300 focus:border-[#ffb000] focus:outline-none transition-all text-sm font-bold text-gray-900";
  const selectClass = "w-full p-3 pl-10 rounded-lg bg-gray-50 border-2 border-gray-300 focus:border-[#ffb000] focus:outline-none transition-all text-sm font-bold text-gray-900 appearance-none cursor-pointer";
  const labelClass = "text-xs font-bold text-[#004225] mb-1 block uppercase tracking-wider";
  const iconClass = "absolute left-3 top-9 text-gray-500 w-5 h-5 pointer-events-none z-10"; 
  const arrowClass = "absolute right-4 top-9 text-gray-500 pointer-events-none w-5 h-5";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
        qrData={qrCodeData} 
        email={currentUser?.email || "guest"}
      />

      <main className="flex-grow py-12 px-4 sm:px-6 flex justify-center items-center">
        <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl border-2 border-gray-200 overflow-hidden relative min-h-[600px] flex flex-col">
          
          {/* Header Bar */}
          <div className="bg-white border-b border-gray-200 p-6 flex justify-end items-center">
             <Link href="/donate" className="p-2 hover:bg-gray-100 rounded-full transition-colors border-2 border-black">
                <ArrowLeft className="w-5 h-5 text-black" />
             </Link>
          </div>

          <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 h-full">
            
            {/* LEFT SIDE: MAP & LOCATION */}
            <div className="flex flex-col gap-6">
               <div className="bg-gray-100 w-full h-64 md:h-80 border-2 border-gray-400 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none">
                     <svg width="100%" height="100%">
                        <line x1="0" y1="0" x2="100%" y2="100%" stroke="#cbd5e1" strokeWidth="2" />
                        <line x1="100%" y1="0" x2="0" y2="100%" stroke="#cbd5e1" strokeWidth="2" />
                     </svg>
                  </div>
                  <MapPin className="w-16 h-16 text-[#004225] z-10 drop-shadow-xl" fill="currentColor" />
               </div>

               <div className="relative">
                  <label className={labelClass}>Drop-off Location</label>
                  <div className="relative">
                    <select 
                        className={selectClass + " text-center pl-4"} 
                        value={selectedLocationId}
                        onChange={(e) => setSelectedLocationId(e.target.value)}
                        disabled={fetchingLocations}
                    >
                        <option value="">
                            {fetchingLocations ? "Loading locations..." : "Select Donation Center"}
                        </option>
                        {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>
                    {fetchingLocations ? (
                        <div className="absolute right-4 top-3">
                            <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                        </div>
                    ) : (
                        <ChevronDown className="absolute right-4 top-3.5 text-black pointer-events-none" />
                    )}
                  </div>
               </div>
            </div>

            {/* RIGHT SIDE: FORM */}
            <div className="flex flex-col justify-center space-y-6">
               <div>
                  <h2 className="text-3xl font-extrabold text-black font-heading mb-6">Schedule Donation Appointment</h2>
               </div>

               <div className="space-y-4">
                  
                  {/* Date Picker - Starts in 2025 */}
                  <div className="relative">
                     <label className={labelClass}>Pick Date (2025 onwards)</label>
                     <Calendar className={iconClass} />
                     <input 
                        type="date" 
                        className={inputClass}
                        value={date}
                        min="2025-01-01" 
                        onChange={(e) => setDate(e.target.value)}
                     />
                     {date && (
                        <p className="text-[#004225] text-sm font-bold mt-2 ml-1 flex items-center gap-1 animate-in fade-in">
                           <span className="bg-[#004225]/10 px-2 py-0.5 rounded text-xs uppercase tracking-wide">Selected:</span> 
                           {getFormattedDate(date)}
                        </p>
                     )}
                  </div>

                  {/* Time Dropdown */}
                  <div className="relative">
                     <label className={labelClass}>Pick Time</label>
                     <Clock className={iconClass + " text-[#ffb000] animate-pulse"} /> 
                     <select 
                        className={selectClass + " cursor-pointer hover:border-[#ffb000] transition-colors shadow-sm"}
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                     >
                        <option value="" disabled className="text-gray-400">Select an appointment time...</option>
                        {TIME_SLOTS.map((slot) => (
                           <option key={slot} value={slot}>{slot}</option>
                        ))}
                     </select>
                     <ChevronDown className={arrowClass} />
                  </div>

                  {/* Description Text Area */}
                  <div className="relative">
                     <label className={labelClass}>Details</label>
                     <AlignLeft className="absolute left-3 top-9 text-gray-500 w-5 h-5" />
                     <textarea 
                        className="w-full p-3 pl-10 rounded-lg bg-gray-50 border-2 border-gray-300 focus:border-[#ffb000] focus:outline-none transition-all text-sm font-bold text-gray-900 h-32 resize-none"
                        placeholder="Describe the produce..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                     />
                  </div>
               </div>

               <div className="pt-4">
                  {/* ✅ UPDATED BUTTON: YELLOW BG + BLACK TEXT */}
                  <Button 
                    onClick={handleSchedule}
                    disabled={loading || !selectedLocationId || !date || !time}
                    className="w-full bg-[#ffb000] text-black hover:bg-[#ffc107] font-bold py-4 rounded-xl text-lg shadow-lg transition-transform hover:-translate-y-1"
                  >
                    {loading ? "Scheduling..." : "Schedule"}
                  </Button>
               </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}