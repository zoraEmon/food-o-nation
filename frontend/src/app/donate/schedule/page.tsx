"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Search, Calendar, Clock, X, CheckCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import axios from "axios";
import { useNotification } from '@/components/ui/NotificationProvider';

// Using server-provided QR image URL to avoid client-side generation

// Types
interface DonationItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
}

interface DonationCenter {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  contactInfo?: string;
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

const UNITS = ["pieces", "kg", "lbs", "cans", "boxes", "bags", "bottles", "jars", "liter", "liters"];
const INTEGER_UNITS = new Set(["pieces", "cans", "boxes", "bags", "bottles", "jars"]);
const FLOAT_UNITS = new Set(["kg", "lbs", "liters"]);

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
  
  // Step 2: Location & Time
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<DonationCenter | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  
  // Step 3: Contact info (optional for guests)
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  // Success Modal
  const [showSuccess, setShowSuccess] = useState(false);
  const [qrValue, setQrValue] = useState<string | null>(null);
  
  // Fetch donation centers
  useEffect(() => {
    fetchDonationCenters();
  }, []);

  const fetchDonationCenters = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/places");
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
            distance: calculateDistance(place.latitude, place.longitude)
          }))
          .sort((a: DonationCenter, b: DonationCenter) => (a.distance || 0) - (b.distance || 0));
        
        setDonationCenters(centers);
      }
    } catch (error) {
      console.error("Error fetching donation centers:", error);
    }
  };

  // Simple distance calculation (placeholder)
  const calculateDistance = (lat: number, lng: number): number => {
    // This would normally use actual user location
    // For now, return a random distance between 0.5 and 5 miles
    return Math.random() * 4.5 + 0.5;
  };

  const addItem = () => {
    if (!itemName || !category || !quantity || !unit) {
      showNotification({ title: 'Invalid input', message: 'Please fill in all item fields', type: 'error' });
      return;
    }

    // Quantity parsing based on unit type
    const parsedQty = INTEGER_UNITS.has(unit)
      ? parseInt(quantity, 10)
      : parseFloat(quantity);

    const newItem: DonationItem = {
      id: Date.now().toString(),
      name: itemName,
      category,
      quantity: parsedQty,
      unit
    };

    setItems([...items, newItem]);
    
    // Reset form
    setItemName("");
    setCategory("");
    setQuantity("");
    setUnit("");
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
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
      const token = localStorage.getItem("authToken");
      const donorId = localStorage.getItem("userId");
      
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTimeSlot?.start}:00`);
      
      const donationData = {
        donorId: donorId || undefined,
        donationCenterId: selectedCenter?.id,
        scheduledDate: scheduledDateTime.toISOString(),
        items: items.map(item => ({
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit
        })),
        guestName: !donorId && guestName ? guestName : undefined,
        guestEmail: !donorId && guestEmail ? guestEmail : undefined,
      };

      const response = await axios.post(
        "http://localhost:5000/api/donations/produce",
        donationData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json"
          }
        }
      );

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
      showNotification({ title: 'Error', message: error.response?.data?.message || "Failed to schedule donation. Please try again.", type: 'error' });
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
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 1 ? 'border-primary bg-primary text-white' : 'border-gray-400'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Items</span>
            </div>
            
            <div className="w-16 h-0.5 bg-gray-300"></div>
            
            <div className={`flex items-center ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 2 ? 'border-primary bg-primary text-white' : 'border-gray-400'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Location & Time</span>
            </div>
            
            <div className="w-16 h-0.5 bg-gray-300"></div>
            
            <div className={`flex items-center ${currentStep >= 3 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 3 ? 'border-primary bg-primary text-white' : 'border-gray-400'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Confirm</span>
            </div>
          </div>
        </div>

        {/* Step 1: What are you donating? */}
        {currentStep === 1 && (
          <div className="bg-white dark:bg-[#0f3a26] rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-primary dark:text-white mb-6">
              PAGE 1: What are you donating?
            </h2>

            {/* Add New Item Form */}
            <div className="border-2 border-gray-200 dark:border-white/10 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">Add New Item</h3>
              
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
                      // Only allow letters, spaces, hyphens, and common punctuation
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
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-gray-50 dark:bg-[#0a291a] p-4 rounded-lg border border-gray-200 dark:border-white/10"
                    >
                      <div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {item.name}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          ({item.category})
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          - {item.quantity} {item.unit}
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
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
              <div className="bg-white p-4 rounded-xl inline-block mx-auto mb-4">
                <img src={qrValue} alt="Donation QR" className="w-[180px] h-[180px] object-contain" />
              </div>
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
