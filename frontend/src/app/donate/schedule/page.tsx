"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Search, Calendar, Clock, X, CheckCircle, Package, Camera, Image } from "lucide-react";
import ProgressIndicator from '@/components/features/beneficiary/formSections/ProgressIndicator';
import { Button } from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import axios from "axios";
import { authService } from '@/services/authService';
import DonationQrCard from '@/components/donation/DonationQrCard';
import { useNotification } from '@/components/ui/NotificationProvider';

// Using server-provided QR image URL to avoid client-side generation

// Types
interface DonationItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  imageUrl?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface DonationCenter {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  contactInfo?: string;
  contactNumber?: string;
}

interface TimeSlot {
  start: string;
  end: string;
  display: string;
}

const CATEGORIES = [
  "Canned Goods",
  "Fresh Produce",
  "Dry Goods",
  "Beverages",
  "Dairy Products",
  "Frozen Items",
  "Baked Goods",
  "Condiments",
  "Baby Food",
  "Other"
];

const UNITS = ["pieces", "kg", "lbs", "cans", "boxes", "bags", "bottles", "jars", "liter"];
const INTEGER_UNITS = new Set(["pieces", "cans", "boxes", "bags", "bottles", "jars"]);
const FLOAT_UNITS = new Set(["kg", "lbs", "liter"]);

const TIME_SLOTS: TimeSlot[] = [
  { start: "08:00", end: "08:30", display: "8:00 AM - 8:30 AM" },
  { start: "08:30", end: "09:00", display: "8:30 AM - 9:00 AM" },
  { start: "09:00", end: "09:30", display: "9:00 AM - 9:30 AM" },
  { start: "09:30", end: "10:00", display: "9:30 AM - 10:00 AM" },
  { start: "10:00", end: "10:30", display: "10:00 AM - 10:30 AM" },
  { start: "10:30", end: "11:00", display: "10:30 AM - 11:00 AM" },
  { start: "11:00", end: "11:30", display: "11:00 AM - 11:30 AM" },
  { start: "11:30", end: "12:00", display: "11:30 AM - 12:00 PM" },
  { start: "13:00", end: "13:30", display: "1:00 PM - 1:30 PM" },
  { start: "13:30", end: "14:00", display: "1:30 PM - 2:00 PM" },
  { start: "14:00", end: "14:30", display: "2:00 PM - 2:30 PM" },
  { start: "14:30", end: "15:00", display: "2:30 PM - 3:00 PM" },
  { start: "15:00", end: "15:30", display: "3:00 PM - 3:30 PM" },
  { start: "15:30", end: "16:00", display: "3:30 PM - 4:00 PM" },
];

export default function DonationSchedulePage() {
  const { showNotification } = useNotification();
  const [currentStep, setCurrentStep] = useState(1);
  const [items, setItems] = useState<DonationItem[]>([]);
  const [donationCenters, setDonationCenters] = useState<DonationCenter[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Item form
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  // New item image (attached when creating the item)
  const [newItemFile, setNewItemFile] = useState<File | null>(null);
  
  // Step 2: Location & Time
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<DonationCenter | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  
  // Step 3: Contact info (optional for guests)
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  // Per-item image files (optional) keyed by item id
  const [itemFiles, setItemFiles] = useState<Record<string, File | null>>({});
  // Optional overall donation image
  const [donationImageFile, setDonationImageFile] = useState<File | null>(null);
  // Success Modal
  const [showSuccess, setShowSuccess] = useState(false);
  const [qrValue, setQrValue] = useState<string | null>(null);
  
  // Fetch donation centers
  useEffect(() => {
    fetchDonationCenters();
  }, []);

  const fetchDonationCenters = async () => {
    try {
      const apiBase = getApiBase();
      const response = await axios.get(`${apiBase}/api/places`);
      if (response.data.success) {
        const centers = response.data.data
          .filter((place: any) => place.donationCenter)
          .map((place: any) => ({
            id: place.donationCenter.id,
            name: place.name,
            address: place.address,
            latitude: place.latitude,
            longitude: place.longitude,
            contactInfo: place.donationCenter.contactInfo,
            contactNumber: place.donationCenter.contactNumber,
            distance: calculateDistance(place.latitude, place.longitude)
          }))
          .sort((a: DonationCenter, b: DonationCenter) => (a.distance || 0) - (b.distance || 0));
        
        setDonationCenters(centers);
      }
    } catch (error) {
      console.error("Error fetching donation centers:", error);
    }
  };

  // Determine API base URL robustly to avoid mixed-content/network errors in dev
  const getApiBase = () => {
    if (process?.env?.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL as string;
    if (typeof window === 'undefined') return '';
    const { protocol, hostname } = window.location;
    // prefer backend on same host when developing locally
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:5000`;
    }
    // default to same origin (relative)
    return `${protocol}//${hostname}`;
  };

  // Simple distance calculation (placeholder)
  const calculateDistance = (lat: number, lng: number): number => {
    // This would normally use actual user location
    // For now, return a random distance between 0.5 and 5 miles
    return Math.random() * 4.5 + 0.5;
  };

  const addItem = () => {
    if (!itemName || !category || !quantity || !unit) {
      showNotification({ title: 'Invalid input', message: 'Please fill in item name, quantity and unit', type: 'error' });
      return;
    }

    // Quantity parsing based on unit type
    const parsedQty = INTEGER_UNITS.has(unit)
      ? parseInt(quantity, 10)
      : parseFloat(quantity);

    if (Number.isNaN(parsedQty) || parsedQty <= 0) {
      showNotification({ title: 'Invalid quantity', message: 'Quantity must be a number greater than 0', type: 'error' });
      return;
    }

    const newId = Date.now().toString();
    const newItem: DonationItem = {
      id: newId,
      name: itemName,
      category,
      quantity: parsedQty,
      unit
    };

    setItems(prev => [...prev, newItem]);
    // initialize file slot for this item (attach any image selected in the Add Item form)
    setItemFiles(prev => ({ ...prev, [newId]: newItemFile || null }));
    // reset new item image input
    setNewItemFile(null);
    
    // Reset form
    setItemName("");
    setCategory("");
    setQuantity("");
    setUnit("");
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    setItemFiles(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (items.length === 0) {
        showNotification({ title: 'No items', message: 'Please add at least one item to donate', type: 'error' });
        return;
      }
    } else if (currentStep === 2) {
      if (!selectedCenter || !selectedDate || !selectedTimeSlot) {
        showNotification({ title: 'Missing fields', message: 'Please select location, date, and time slot', type: 'error' });
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const apiBase = getApiBase();
      const token = localStorage.getItem("authToken");
      // Prefer an explicit donorId (donorProfile id). If not available, try to fetch current user
      // and use `donorProfile.id`. Avoid sending `userId` which may cause "Donor not found".
      const donorIdFromStorage = localStorage.getItem("donorId");
      let donorIdToSend: string | undefined = donorIdFromStorage || undefined;
      if (!donorIdToSend && token) {
        try {
          const me = await authService.getMe();
          if (me?.donorProfile && (me as any).donorProfile.id) {
            donorIdToSend = (me as any).donorProfile.id;
          }
        } catch (e) {
          // ignore - we'll treat as guest if no donor profile
        }
      }
      
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTimeSlot?.start}:00`);
      const baseItems = items.map(item => ({ name: item.name, category: item.category, quantity: item.quantity, unit: item.unit }));

      // Gather files: per-item files in items order + overall donation image if present
      const filesToUpload: File[] = [];
      const fileIndexMap: number[] = [];
      const fileMeta: Array<{ originalName?: string; note?: string; itemIndex?: number }> = [];
      // Ensure we iterate items in order so mapping is deterministic
      items.forEach((item, idx) => {
        const f = itemFiles[item.id];
        if (f) {
          filesToUpload.push(f);
          fileIndexMap.push(idx); // file maps to this item index
          fileMeta.push({ originalName: f.name, note: item.name, itemIndex: idx });
        }
      });
      if (donationImageFile) {
        filesToUpload.push(donationImageFile);
        fileIndexMap.push(-1); // donation-level image
        fileMeta.push({ originalName: donationImageFile.name, note: 'donation-image', itemIndex: -1 });
      }

      let response;
      if (filesToUpload.length > 0) {
        const form = new FormData();
        form.append('donationCenterId', selectedCenter?.id || '');
        form.append('scheduledDate', scheduledDateTime.toISOString());
        form.append('items', JSON.stringify(baseItems));
        if (donorIdToSend) form.append('donorId', donorIdToSend);
        else {
          if (guestName) form.append('guestName', guestName);
          if (guestEmail) form.append('guestEmail', guestEmail);
        }
        filesToUpload.forEach(f => form.append('images', f));
        // attach explicit mapping array so backend can map files to items
        form.append('fileIndexMap', JSON.stringify(fileIndexMap));
        // attach optional per-file metadata
        form.append('fileMeta', JSON.stringify(fileMeta));

        response = await axios.post(
          `${apiBase}/api/donations/produce`,
          form,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              // Let browser set multipart Content-Type
            }
          }
        );
      } else {
        const donationData = {
          donorId: donorIdToSend || undefined,
          donationCenterId: selectedCenter?.id,
          scheduledDate: scheduledDateTime.toISOString(),
          items: baseItems,
          guestName: !donorId && guestName ? guestName : undefined,
          guestEmail: !donorId && guestEmail ? guestEmail : undefined,
        };
        response = await axios.post(
          `${apiBase}/api/donations/produce`,
          donationData,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json"
            }
          }
        );
      }

      if (response.data.success) {
        const donation = response.data?.data?.donation;
        if (donation?.qrCodeRef) {
          setQrValue(donation.qrCodeRef);
          setShowSuccess(true);
        }
        // Reset form
        setItems([]);
        setSelectedCenter(null);
        setSelectedDate("");
        setSelectedTimeSlot(null);
        setGuestName("");
        setGuestEmail("");
        setCurrentStep(1);
      }
    } catch (error: any) {
      console.error("Error scheduling donation:", error);
      const apiBase = getApiBase();
      const networkMessage = !error?.response
        ? `Network Error: could not reach ${apiBase}. Is the backend running?`
        : error.response?.data?.message;
      showNotification({ title: 'Error', message: networkMessage || "Failed to schedule donation. Please try again.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = donationCenters.filter(center =>
    center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    center.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0a291a]">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Progress Steps */}
        {/** Use shared ProgressIndicator component for consistent visuals */}
        <ProgressIndicator
          sections={[
            { id: 1, title: 'Items', icon: Package },
            { id: 2, title: 'Location', icon: MapPin },
            { id: 3, title: 'Confirm', icon: CheckCircle },
          ]}
          currentSection={currentStep}
        />

        {/* Step 1: What are you donating? */}
        {currentStep === 1 && (
          <div className="bg-white dark:bg-[#0f3a26] rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-primary dark:text-white mb-6">
              PAGE 1: What are you donating?
            </h2>

            {/* Add New Item Form */}
            <div className="border-2 border-gray-200 dark:border-white/10 rounded-lg p-6 mb-6">
              <h3 className="font-heading font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">Add New Item</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Item Name / Description
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[a-zA-Z\s\-.,()&']*$/.test(value)) {
                        setItemName(value);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-[#0a291a] dark:border-white/10 dark:text-white"
                    placeholder="e.g., Canned Tomatoes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-[#0a291a] dark:border-white/10 dark:text-white"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity {INTEGER_UNITS.has(unit) ? '(Whole number)' : '(Decimal allowed)'}
                    </label>
                    <input
                      type="number"
                      step={INTEGER_UNITS.has(unit) ? 1 : 0.1}
                      min={INTEGER_UNITS.has(unit) ? 1 : 0.1}
                      value={quantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        const integerPattern = /^\d*$/;
                        const floatPattern = /^\d*\.?\d*$/;
                        const valid = INTEGER_UNITS.has(unit)
                          ? (value === '' || integerPattern.test(value))
                          : (value === '' || floatPattern.test(value));
                        if (valid) setQuantity(value);
                      }}
                      onKeyPress={(e) => {
                        if (INTEGER_UNITS.has(unit)) {
                          if (!/[\d]/.test(e.key)) e.preventDefault();
                        } else {
                          if (!/[\d.]/.test(e.key)) e.preventDefault();
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-[#0a291a] dark:border-white/10 dark:text-white"
                      placeholder={INTEGER_UNITS.has(unit) ? '0' : '0.0'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unit
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-[#0a291a] dark:border-white/10 dark:text-white"
                    >
                      <option value="">Select unit</option>
                      {UNITS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Item Photo (optional)</label>
                  <label className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-[#072117] flex items-center justify-center border-2 border-dashed cursor-pointer overflow-hidden relative">
                    {newItemFile ? (
                      <img src={URL.createObjectURL(newItemFile)} alt="new-item-preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-xs text-gray-500 dark:text-gray-400">
                        <Camera className="w-5 h-5 mb-1" />
                        <span>Add photo</span>
                      </div>
                    )}
                    <input className="hidden" type="file" accept="image/*" capture="environment" onChange={(e) => setNewItemFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <Button
                  onClick={addItem}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  Add Item to List
                </Button>
              </div>
            </div>

            {/* Your Donation List */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
                Your Donation List
              </h3>
              
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No items added yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-gray-50 dark:bg-[#0a291a] p-4 rounded-lg border border-gray-200 dark:border-white/10"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {item.name}
                          </span>
                          <div className="text-gray-600 dark:text-gray-400 text-sm">
                            {item.category} • {item.quantity} {item.unit}
                          </div>
                        </div>
                        <div className="flex flex-col items-start">
                          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">Item photo (optional)</label>
                          <label className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-[#072117] flex items-center justify-center border-2 border-dashed cursor-pointer overflow-hidden relative">
                            {itemFiles[item.id] ? (
                                <>
                                  <img src={URL.createObjectURL(itemFiles[item.id] as File)} alt="preview" className="w-full h-full object-cover" />
                                  <div className="absolute top-1 right-1 bg-white/80 rounded-full p-1">
                                    <Camera className="w-4 h-4 text-gray-700 dark:text-white" />
                                  </div>
                                </>
                              ) : (
                              <div className="flex flex-col items-center text-xs text-gray-500">
                                <Camera className="w-5 h-5 mb-1" />
                                <span>Upload</span>
                              </div>
                            )}
                            <input
                              className="hidden"
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setItemFiles(prev => ({ ...prev, [item.id]: file }));
                              }}
                            />
                          </label>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleNextStep}
                className="bg-primary hover:bg-primary/90 text-white px-8"
              >
                Next: Select Location →
              </Button>
            </div>
          </div>
        )}

            {/* Optional overall donation image */}
            <div className="bg-white dark:bg-[#0f3a26] rounded-lg border border-gray-200 dark:border-white/10 p-4 mb-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="flex-shrink-0">
                    <h3 className="font-heading font-bold text-base text-gray-700 dark:text-gray-300 mb-3">Donation photo (optional)</h3>
                    <label className="w-full md:w-80 h-56 rounded-xl bg-gray-100 dark:bg-[#072117] flex items-center justify-center border-4 border-dashed cursor-pointer overflow-hidden relative shadow-lg dark:shadow-none">
                      {donationImageFile ? (
                        <>
                          <img src={URL.createObjectURL(donationImageFile)} alt="donation-preview" className="w-full h-full object-cover" />
                          <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/60 rounded-full p-2">
                            <Image className="w-5 h-5 text-gray-700 dark:text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-sm text-gray-500 dark:text-gray-400">
                          <Camera className="w-7 h-7 mb-2" />
                          <div className="font-medium">Upload donation image</div>
                          <div className="text-xs">Tap to open camera or choose file</div>
                        </div>
                      )}
                      <input className="hidden" type="file" accept="image/*" capture="environment" onChange={(e) => setDonationImageFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-sm text-gray-700 dark:text-gray-300 mb-2">Item Photos</h3>
                    <div className="flex flex-row md:flex-col gap-3">
                      {items.map((it) => {
                        const f = itemFiles[it.id];
                        if (!f) return null;
                        return (
                          <div key={it.id} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
                            <img src={URL.createObjectURL(f as File)} alt={`item-${it.id}`} className="w-full h-full object-cover" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
            </div>
        {/* Step 2: Where and When? */}
        {currentStep === 2 && (
          <div className="bg-white dark:bg-[#0f3a26] rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-primary dark:text-white mb-6">
              PAGE 2: Where and When?
            </h2>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search near you"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-[#0a291a] dark:border-white/10 dark:text-white"
                />
              </div>
            </div>

            {/* Results List */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
                Results List
              </h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredCenters.map(center => (
                  <div
                    key={center.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedCenter?.id === center.id
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-gray-200 dark:border-white/10 hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedCenter(center)}
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          {center.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          ({center.distance?.toFixed(1)} miles)
                        </div>
                      </div>
                    </div>
                    <button className="text-primary hover:text-primary/80 font-medium">
                      [Select]
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Your Drop-off */}
            <div className="border-2 border-gray-200 dark:border-white/10 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
                Schedule Your Drop-off
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-[#0a291a] dark:border-white/10 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Slot
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {TIME_SLOTS.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm transition-colors ${
                          selectedTimeSlot?.start === slot.start
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 dark:border-white/10 hover:border-primary dark:text-gray-200'
                        }`}
                      >
                        {slot.display}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedTimeSlot && (
                  <div className="bg-primary/10 dark:bg-primary/20 border border-primary rounded-lg p-3 text-sm text-primary dark:text-secondary font-medium">
                    {selectedTimeSlot.display} [Selected]
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button
                onClick={handlePreviousStep}
                variant="outline"
                className="px-8"
              >
                ← Back
              </Button>
              <Button
                onClick={handleNextStep}
                className="bg-primary hover:bg-primary/90 text-white px-8"
              >
                Next: Review Donation →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {currentStep === 3 && (
          <div className="bg-white dark:bg-[#0f3a26] rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-primary dark:text-white mb-6">
              PAGE 3: Review & Confirm
            </h2>

            {/* Drop-off Details */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                  Drop-off Details
                </h3>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  [Edit]
                </button>
              </div>
              
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-5 h-5 mt-0.5 text-primary" />
                  <div>
                    <span className="font-medium">Location:</span> {selectedCenter?.name}
                    {selectedCenter?.distance && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {' '}({selectedCenter.distance.toFixed(1)} miles)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Clock className="w-5 h-5 mt-0.5 text-primary" />
                  <div>
                    <span className="font-medium">Scheduled Time:</span>{' '}
                    {selectedDate && selectedTimeSlot && 
                      `${new Date(selectedDate).toLocaleDateString()} ${selectedTimeSlot.display}`
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Items to be Donated */}
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                  Items to be Donated
                </h3>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  [Edit]
                </button>
              </div>
              
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="text-gray-700 dark:text-gray-300">
                    {item.name} ({item.category}) - {item.quantity} {item.unit} [x]
                  </div>
                ))}
              </div>
            </div>

            {/* Guest Contact Info */}
            {!localStorage.getItem("userId") && (
              <div className="bg-gray-50 dark:bg-[#0a291a] border-2 border-gray-200 dark:border-white/10 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
                  Guest Contact Info (optional)
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Display Name
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">For safety, please do not use your real name.</p>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow letters, spaces, hyphens, and apostrophes for names
                        if (/^[a-zA-Z\s\-']*$/.test(value)) {
                          setGuestName(value);
                        }
                      }}
                      onKeyPress={(e) => {
                        // Prevent numbers and special characters except hyphen and apostrophe
                        if (!/[a-zA-Z\s\-']/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-[#0f3a26] dark:border-white/10 dark:text-white"
                      placeholder="Enter a display name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Email
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-[#0f3a26] dark:border-white/10 dark:text-white"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                onClick={handlePreviousStep}
                variant="outline"
                className="px-8"
              >
                ← Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-white px-8 text-lg font-semibold"
              >
                {loading ? "Processing..." : "CONFIRM SCHEDULED DONATION"}
              </Button>
            </div>
          </div>
        )}
      </main>
      
      {/* Success Modal with QR Code */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0f3a26] rounded-2xl p-6 md:p-8 max-w-md w-full border border-gray-200 dark:border-white/10 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-primary dark:text-white mb-2">Donation Scheduled!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Show this QR code at the center during drop-off. A copy was sent to your email.</p>
            {qrValue && (
              <DonationQrCard qrValue={qrValue} filename={`donation-qr-${Date.now()}`} />
            )}
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setShowSuccess(false)} className="bg-primary text-white px-6">Done</Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
