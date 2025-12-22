"use client";

import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code"; 
import { 
  Plus, X, MapPin, Calendar, Clock, Search, ChevronLeft, ChevronRight, 
  Edit, Trash2, ShoppingBag, CheckCircle, Download, Mail 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// --- TYPES ---
interface DonationItem {
  id: string;
  name: string;
  foodType: string;
  quantity: number;
  unit: string;
  imageUrl?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface Location {
  id: string;
  name: string;
  distance: string;
  address: string; 
}

interface Schedule {
  date: string;
  startTime: string;
  endTime: string;
}

interface GuestInfo {
  name: string;
  email: string;
}

// --- MOCK DATA ---
const FOOD_TYPES = [
  "Canned Goods", "Rice & Grains", "Instant Noodles", 
  "Beverages", "Biscuits/Snacks", "Vegetables/Fruits", 
  "Frozen/Meat", "Baby Food", "Other"
];

const UNITS = ["pcs", "cans", "kg", "sacks", "boxes", "liters", "packs", "trays"];

const MOCK_LOCATIONS: Location[] = [
  { id: "loc1", name: "Downtown Relief Center", distance: "0.5 miles", address: "123 Main St, Centro" },
  { id: "loc2", name: "Westside Food Bank", distance: "1.2 miles", address: "45 West Ave, Brgy. West" },
  { id: "loc3", name: "Eastside Shelter", distance: "2.0 miles", address: "88 East Blvd, Riverside" },
];

// --- INTERNAL COMPONENT: SUCCESS MODAL ---
const SuccessModal = ({ isOpen, onClose, qrData, email }: { isOpen: boolean; onClose: () => void; qrData: string, email: string }) => {
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
            downloadLink.download = `donation-qr-${Date.now()}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center border-4 border-[#004225] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-4 bg-[#ffb000]"></div>
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 mt-4">
          <CheckCircle className="h-10 w-10 text-[#004225]" />
        </div>
        <h3 className="text-2xl font-extrabold text-[#004225] mb-2">Donation Scheduled!</h3>
        <p className="text-sm text-gray-800 font-medium mb-6">
          A confirmation has been sent to <span className="font-bold text-[#004225]">{email}</span>.
        </p>
        <div className="bg-white p-4 border-2 border-dashed border-gray-300 rounded-xl mb-6 inline-block shadow-sm">
          <QRCode 
            id="qr-code-svg" 
            value={qrData} 
            size={160} 
            level="H"
            bgColor="#FFFFFF"
            fgColor="#004225"
          />
        </div>
        <p className="text-sm text-gray-700 font-bold mb-6">Scan this code at the drop-off center</p>
        <div className="space-y-3">
          <Button onClick={downloadQRCode} className="w-full bg-[#ffb000] text-black hover:bg-[#ffc107] font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md">
            <Download className="w-4 h-4" /> Download QR Code
          </Button>
          <Button onClick={onClose} className="w-full bg-transparent border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-3 rounded-xl">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
function DonationProcessPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");

  // Styles - UPDATED FOR HIGH VISIBILITY
  const inputClass = "w-full p-3 rounded-xl bg-gray-50 border border-gray-300 focus:border-[#ffb000] focus:ring-2 focus:ring-[#ffb000]/20 focus:outline-none transition-all text-sm font-bold text-gray-900 placeholder:text-gray-400";
  const labelClass = "text-xs font-bold text-gray-900 mb-1.5 block uppercase tracking-wider";
  const headerClass = "text-2xl font-extrabold text-[#004225] mb-2";
  const subHeaderClass = "text-sm text-gray-800 font-medium mb-6";

  // Form State
  const [newItem, setNewItem] = useState<Omit<DonationItem, "id">>({ name: "", foodType: "", quantity: 0, unit: "" });
  const [donationItems, setDonationItems] = useState<DonationItem[]>([
    { id: '1', name: 'Corned Beef', foodType: 'Canned Goods', quantity: 10, unit: 'cans' },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(MOCK_LOCATIONS[0]);
  
  // Schedule State
  const [schedule, setSchedule] = useState<Schedule>({ 
    date: new Date().toISOString().split('T')[0], 
    startTime: "", 
    endTime: "" 
  });
  
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({ name: "", email: "" });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        setGuestInfo({
          name: parsedUser.displayName || parsedUser.name || "Donor",
          email: parsedUser.email || ""
        });
      } catch (e) { console.error(e); }
    }
  }, []);

  const handleAddItem = () => {
    if (newItem.name && newItem.foodType && newItem.quantity > 0 && newItem.unit) {
      setDonationItems([...donationItems, { ...newItem, id: Date.now().toString() }]);
      setNewItem({ name: "", foodType: "", quantity: 0, unit: "" });
    }
  };

  const handleRemoveItem = (id: string) => {
    setDonationItems(donationItems.filter((item) => item.id !== id));
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    const uniqueId = `DON-${Date.now()}-${selectedLocation?.id}`;
    setQrCodeData(uniqueId);
    
    setShowSuccessModal(true);
    setLoading(false);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8 px-4">
      {['Details', 'Location', 'Confirm'].map((stepName, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        return (
          <div key={stepNum} className="flex items-center">
            <div className={`flex flex-col items-center relative z-10`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm
                ${isActive ? 'bg-[#ffb000] text-[#004225] ring-4 ring-[#ffb000]/30 scale-110' : 
                  isCompleted ? 'bg-[#004225] text-white' : 'bg-white text-gray-500 border-2 border-gray-300'}`}>
                {isCompleted ? <CheckCircle className="w-5 h-5" /> : stepNum}
              </div>
              <span className={`absolute -bottom-6 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap
                ${isActive ? 'text-[#004225]' : 'text-gray-500'}`}>
                {stepName}
              </span>
            </div>
            {index < 2 && (
              <div className={`w-16 sm:w-24 h-1 mx-2 rounded-full transition-all duration-500
                ${isCompleted ? 'bg-[#004225]' : 'bg-gray-300'}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0]">
      <Navbar />
      
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
        qrData={qrCodeData}
        email={guestInfo.email || "your email"}
      />

      <main className="flex-grow py-12 px-4 sm:px-6">
        {/* CHANGED: bg-gray-300 for a "light dark gray" container */}
        <div className="bg-gray-300 rounded-2xl shadow-xl border border-gray-400 p-6 sm:p-8 max-w-3xl mx-auto">
          <StepIndicator />
          <div className="mt-8"></div>

          {/* STEP 1: FOOD ITEMS */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <h2 className={headerClass}>Donation Details</h2>
                <p className={subHeaderClass}>List the food items you wish to donate.</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4 shadow-sm">
                    <h3 className="font-bold text-[#004225] flex items-center gap-2 mb-2">
                      <Plus className="w-5 h-5 text-[#ffb000]" /> Add New Item
                    </h3>
                    <div>
                      <label className={labelClass}>Item Name</label>
                      <input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className={inputClass} placeholder="e.g. Corned Beef" />
                    </div>
                    <div>
                      <label className={labelClass}>Food Category</label>
                      <select value={newItem.foodType} onChange={(e) => setNewItem({ ...newItem, foodType: e.target.value })} className={inputClass}>
                        <option value="">Select Category...</option>
                        {FOOD_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Qty</label>
                        <input type="number" min="0.1" step="0.1" value={newItem.quantity || ''} onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })} className={inputClass} placeholder="0" />
                      </div>
                      <div>
                        <label className={labelClass}>Unit</label>
                        <select value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} className={inputClass}>
                          <option value="">Unit...</option>
                          {UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                        </select>
                      </div>
                    </div>
                    <Button onClick={handleAddItem} className="w-full bg-[#004225] text-white hover:bg-[#005a33] rounded-xl py-3 font-bold shadow-lg shadow-[#004225]/20 transition-all active:scale-95">
                      Add to List
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <label className={labelClass}>Your Basket</label>
                    <span className="text-xs text-gray-500 font-bold">{donationItems.length} items</span>
                  </div>
                  {donationItems.length === 0 ? (
                    <div className="h-64 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-500 bg-gray-50">
                      <ShoppingBag className="w-10 h-10 mb-2 opacity-50" />
                      <p className="text-sm font-bold">Your basket is empty</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                      {donationItems.map((item) => (
                        <div key={item.id} className="group flex flex-col justify-between bg-white border border-gray-200 p-4 rounded-2xl shadow-sm hover:border-[#ffb000] hover:shadow-md transition-all relative">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-[#ffb000] bg-[#ffb000]/10 px-2 py-1 rounded-full uppercase tracking-wide text-[10px]">{item.foodType}</span>
                              <button onClick={() => handleRemoveItem(item.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <h4 className="font-extrabold text-gray-900 text-lg leading-tight mb-1">{item.name}</h4>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                            <div className="bg-[#004225] text-white text-xs font-bold px-3 py-1 rounded-lg">{item.quantity} {item.unit}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-8 border-t border-gray-100 pt-6">
                <Button onClick={() => setCurrentStep(2)} disabled={donationItems.length === 0} className="bg-[#ffb000] text-black hover:bg-[#ffc107] font-bold py-3 px-8 rounded-xl shadow-lg shadow-orange-500/20 transition-transform transform hover:-translate-y-1 flex items-center gap-2">Next Step <ChevronRight className="w-5 h-5" /></Button>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION & TIME */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <h2 className={headerClass}>Logistics</h2>
                <p className={subHeaderClass}>Where and when should we pick up or receive the donation?</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute top-3.5 left-4 text-gray-500 w-5 h-5" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`${inputClass} pl-12`} placeholder="Search centers..." />
                  </div>
                  <div className="bg-gray-100 h-64 rounded-2xl flex items-center justify-center relative overflow-hidden border border-gray-300">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#004225 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    <MapPin className="w-12 h-12 text-[#004225] drop-shadow-lg z-10 animate-bounce" />
                    <div className="absolute bottom-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-xs font-bold text-gray-700 shadow-sm border border-gray-200">Map View</div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Select Drop-off Center</label>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {MOCK_LOCATIONS.map((loc) => (
                        <div key={loc.id} onClick={() => setSelectedLocation(loc)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center group ${selectedLocation?.id === loc.id ? 'border-[#ffb000] bg-[#fffbf0] shadow-md' : 'border-gray-200 bg-white hover:border-[#004225]/50'}`}>
                          <div><p className={`font-bold text-sm ${selectedLocation?.id === loc.id ? 'text-[#004225]' : 'text-gray-900'}`}>{loc.name}</p><p className="text-xs text-gray-700 font-medium mt-1">{loc.address}</p></div>
                          <div className="text-right"><span className="text-xs font-bold text-[#ffb000] block">{loc.distance}</span>{selectedLocation?.id === loc.id && <CheckCircle className="w-5 h-5 text-[#004225] mt-1 ml-auto" />}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                    <label className={labelClass}>Set Your Schedule</label>
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] text-gray-700 font-bold mb-1 block uppercase">Drop-off Date</label>
                            <input 
                                type="date" 
                                value={schedule.date} 
                                onChange={(e) => setSchedule({...schedule, date: e.target.value})} 
                                className="w-full p-3 rounded-lg border border-gray-300 text-sm font-bold bg-white text-gray-900 focus:border-[#ffb000] focus:outline-none" 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-gray-700 font-bold mb-1 block uppercase">Start Time</label>
                                <input 
                                    type="time" 
                                    value={schedule.startTime} 
                                    onChange={(e) => setSchedule({...schedule, startTime: e.target.value})} 
                                    className="w-full p-3 rounded-lg border border-gray-300 text-sm font-bold bg-white text-gray-900 focus:border-[#ffb000] focus:outline-none" 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-700 font-bold mb-1 block uppercase">End Time</label>
                                <input 
                                    type="time" 
                                    value={schedule.endTime} 
                                    onChange={(e) => setSchedule({...schedule, endTime: e.target.value})} 
                                    className="w-full p-3 rounded-lg border border-gray-300 text-sm font-bold bg-white text-gray-900 focus:border-[#ffb000] focus:outline-none" 
                                />
                            </div>
                        </div>
                    </div>
                  </div>

                </div>
              </div>
              <div className="flex justify-between mt-8 border-t border-gray-100 pt-6">
                <Button onClick={() => setCurrentStep(1)} className="text-gray-700 hover:text-black font-bold px-6">Back</Button>
                <Button 
                    onClick={() => setCurrentStep(3)} 
                    disabled={!selectedLocation || !schedule.startTime || !schedule.endTime} 
                    className="bg-[#ffb000] text-black hover:bg-[#ffc107] font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                    Next Step <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRM */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8"><h2 className={headerClass}>Review Donation</h2><p className={subHeaderClass}>Please review the details before confirming.</p></div>
              <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-inner relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#004225] via-[#ffb000] to-[#004225]"></div>
                <div className="p-6 sm:p-8 space-y-8">
                  <div className="flex justify-between items-start border-b border-dashed border-gray-300 pb-6">
                    <div><h3 className="text-lg font-extrabold text-[#004225]">Donation Details:</h3><p className="text-xs text-gray-700 font-bold mt-1">ID: #{Date.now().toString().slice(-6)}</p></div>
                    <div className="bg-[#ffb000]/20 text-[#004225] px-3 py-1 rounded-lg text-xs font-bold border border-[#ffb000]/30">Pending Confirmation</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between"><label className={labelClass}>Logistics</label><button onClick={() => setCurrentStep(2)} className="text-[10px] font-bold text-[#ffb000] hover:underline flex items-center gap-1"><Edit className="w-3 h-3" /> Edit</button></div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                        <div className="flex items-start gap-3"><div className="bg-green-100 p-2 rounded-lg"><MapPin className="w-5 h-5 text-[#004225]" /></div><div><p className="text-sm font-extrabold text-gray-900">{selectedLocation?.name}</p><p className="text-xs text-gray-700 font-medium">{selectedLocation?.address}</p></div></div>
                        <div className="flex items-start gap-3">
                            <div className="bg-yellow-100 p-2 rounded-lg"><Calendar className="w-5 h-5 text-yellow-700" /></div>
                            <div>
                                <p className="text-sm font-extrabold text-gray-900">{schedule.date}</p>
                                <p className="text-xs text-gray-700 font-medium">
                                    {schedule.startTime} - {schedule.endTime}
                                </p>
                            </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between"><label className={labelClass}>Food Items</label><button onClick={() => setCurrentStep(1)} className="text-[10px] font-bold text-[#ffb000] hover:underline flex items-center gap-1"><Edit className="w-3 h-3" /> Edit</button></div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm max-h-48 overflow-y-auto">
                        <ul className="space-y-3">{donationItems.map(item => (<li key={item.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0"><span className="text-gray-900 font-bold">{item.name}</span><span className="font-bold text-[#004225] bg-[#004225]/10 px-2 py-0.5 rounded text-xs">{item.quantity} {item.unit}</span></li>))}</ul>
                      </div>
                    </div>
                  </div>
                  {!currentUser && (
                    <div className="pt-2 border-t border-gray-200 mt-4">
                      <label className={labelClass}>Guest Contact Info</label><p className="text-xs text-gray-700 font-medium mb-3">You are donating as a guest. Provide details to receive updates.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2"><input value={guestInfo.name} onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})} className={inputClass} placeholder="Your Name" /><input value={guestInfo.email} onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})} className={inputClass} placeholder="Your Email" /></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-8 pt-2">
                <Button onClick={() => setCurrentStep(2)} className="text-gray-700 hover:text-black font-bold px-6">Back</Button>
                <Button onClick={handleFinalSubmit} disabled={loading} className="bg-[#004225] text-white hover:bg-[#005a33] font-bold py-4 px-10 rounded-xl shadow-xl shadow-[#004225]/30 transition-all transform hover:-translate-y-1 active:scale-95 text-lg">{loading ? "Processing..." : "Confirm & Submit"}</Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Wrap with ProtectedRoute for authentication
export default function ProtectedDonorDashboard() {
  return (
    <ProtectedRoute requiredRoles={['DONOR']}>
      <DonationProcessPage />
    </ProtectedRoute>
  );
}