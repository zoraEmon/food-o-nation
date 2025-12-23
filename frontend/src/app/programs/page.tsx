"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  X, MapPin, Calendar, Clock, ArrowRight, ChevronRight, ChevronDown, ChevronUp,
  Loader2, Home, HelpCircle, CheckCircle, UploadCloud, FileText, History, Download, Mail
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QrModal from "@/components/qr/QrModal";
import { authService } from "@/services/authService";
import BeneficiaryApplicationForm from "@/components/features/beneficiary/BeneficiaryApplicationForm";
import axios from "axios";
import { useNotification } from '@/components/ui/NotificationProvider';

// Dynamically import LocationMap to avoid SSR issues with Leaflet
const LocationMap = dynamic(() => import("@/components/features/programs/LocationMap").then(m => m.LocationMap), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 animate-pulse">Loading map with route...</div>
});

// --- helpers ---
const getLocationFromProgram = (program: any) => {
  if (program.location) return program.location;
  if (program.place?.address) return program.place.address;
  if (program.place?.name) return program.place.name;
  return null;
};

const formatDateDisplay = (value: any) => {
  if (!value) return "Date not provided";
  const dateObj = new Date(value);
  if (!isNaN(dateObj.getTime())) {
    return dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }
  return String(value);
};

const formatDateShort = (value: any) => {
  if (!value) return "Date not provided";
  const dateObj = new Date(value);
  if (!isNaN(dateObj.getTime())) {
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return String(value);
};

const formatTimeDisplay = (value: any) => {
  if (!value) return "";
  const dateObj = new Date(value);
  if (!isNaN(dateObj.getTime())) {
    return dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }
  return String(value);
};

const buildTimeRange = (start: any, end: any) => {
  const startTime = formatTimeDisplay(start);
  const endTime = formatTimeDisplay(end);
  if (startTime && endTime) return `${startTime} - ${endTime}`;
  if (startTime) return startTime;
  if (endTime) return endTime;
  return "Time not provided";
};

// --- 🟡 PENDING VIEW COMPONENT ---
const PendingView = ({ userData, onShowForm }: { userData: any; onShowForm: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
    <div className="bg-white border-4 border-[#004225] p-8 lg:p-12 rounded-3xl shadow-2xl max-w-3xl w-full text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-4 bg-[#FFB000]"></div>
      <h1 className="text-3xl lg:text-4xl font-extrabold text-[#004225] mb-2">
        Status: <span className="text-[#FFB000]">Pending Review</span>
      </h1>
      <p className="text-gray-600 text-lg font-medium mb-8">
        Your application is currently being processed
      </p>
      <div className="bg-background border-2 border-gray-300 rounded-xl p-6 mb-8 text-left shadow-inner min-h-[120px] flex flex-col">
        <span className="font-bold text-[#004225] text-sm uppercase tracking-wide mb-2 block border-b border-gray-300 pb-2">
          What to expect:
        </span>
        <p className="text-gray-700 leading-relaxed flex-grow">
          Our team is verifying your submitted documents. This usually takes <strong>24-48 hours</strong>.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={onShowForm}
          className="px-8 py-3 rounded-xl bg-[#FFB000] text-[#004225] font-bold hover:bg-yellow-500 transition-all shadow-md flex items-center justify-center gap-2"
        >
          <FileText className="w-5 h-5" /> Complete Application Form
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
);

// --- 🔴 REJECTED VIEW COMPONENT ---
const RejectedView = ({ reason, actionCode }: { reason: string; actionCode: string }) => {
  const action =
    actionCode === "UPLOAD_DOCS"
      ? { label: "Update Documents", href: "/beneficiary/settings/documents", icon: UploadCloud }
      : { label: "Contact Support", href: "/contact", icon: HelpCircle };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
      <div className="bg-white border-4 border-[#004225] p-8 lg:p-12 rounded-3xl shadow-2xl max-w-3xl w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-4 bg-red-600"></div>
        <div className="flex justify-center mb-4">
          <X className="w-16 h-16 text-red-600" />
        </div>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-[#004225] mb-2">
          Status: <span className="text-red-600">Rejected</span>
        </h2>
        <p className="text-gray-600 text-lg font-medium mb-8">Your application was not approved</p>
        <div className="bg-background border-2 border-gray-300 rounded-xl p-6 mb-8 text-left shadow-inner">
          <span className="font-bold text-[#004225] text-sm uppercase tracking-wide mb-2 block border-b border-gray-300 pb-2">
            Reason:
          </span>
          <p className="text-gray-700 leading-relaxed">{reason}</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/"
            className="px-8 py-3 rounded-xl border-2 border-[#004225] text-[#004225] font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" /> Home
          </Link>
          <Link
            href={action.href}
            className="px-8 py-3 rounded-xl bg-[#004225] text-white font-bold hover:bg-[#005a33] transition-all shadow-md flex items-center justify-center gap-2"
          >
            <action.icon className="w-5 h-5" /> {action.label}
          </Link>
        </div>
      </div>
    </div>
  );
};

// --- 🟢 APPROVED SUCCESS VIEW ---
const ApprovedSuccessView = ({ name, onContinue }: { name: string; onContinue: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
    <div className="bg-white border-4 border-[#004225] p-8 lg:p-12 rounded-3xl shadow-2xl max-w-3xl w-full text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-4 bg-green-600"></div>
      <div className="flex justify-center mb-4">
        <CheckCircle className="w-16 h-16 text-green-600 animate-bounce" />
      </div>
      <h2 className="text-3xl lg:text-4xl font-extrabold text-[#004225] mb-2">
        Status: <span className="text-green-600">Approved</span>
      </h2>
      <p className="text-gray-600 text-lg font-medium mb-8">Welcome to Food-O-Nation!</p>
      <div className="bg-[#FAF7F0] border-2 border-gray-300 rounded-xl p-6 mb-8 text-left shadow-inner">
        <p className="text-gray-700 leading-relaxed">
          Congratulations <strong>{name}</strong>! You can now access available programs.
        </p>
      </div>
      <button
        onClick={onContinue}
        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#004225] text-white font-bold hover:bg-[#005a33] transition-all shadow-md flex items-center justify-center gap-2 text-lg"
      >
        Continue to Programs <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  </div>
);

// --- PROGRAM DETAILS MODAL ---
const ProgramDetailsModal = ({ program, onClose, onConfirm, userRole, userStatus }: { program: any; onClose: () => void; onConfirm: () => void; userRole?: string; userStatus?: string }) => {
  const isCompleted = program.status === "COMPLETED" || program.status === "Completed";
  const location = getLocationFromProgram(program);
  const isMapLink = typeof location === "string" && location.startsWith("http");
  // Handle both 'date' and 'startDate' field names
  const programDate = program.date || program.startDate || program.datetime;
  const formattedDate = formatDateDisplay(programDate);
  const timeRange = buildTimeRange(programDate, program.endDate || program.end_time);
  const programTitle = program.name || program.title || "Program Details";
  
  // Beneficiary-specific fields
  const userHasApplied = program.userHasApplied || false;
  const applicationStatus = program.userApplicationStatus;
  const claimedSlots = program.claimedSlots || 0;
  const beneficiaryAvailableSlots = program.availableSlots;
  const isBeneficiaryFull = program.isFull || false;
  
  // Donor-specific fields
  const donorHasReserved = program.donorHasReserved || false;
  const reservationStatus = program.donorReservationStatus;
  const stallCapacity = program.stallCapacity || 0;
  const reservedStalls = program.reservedStalls || 0;
  const availableStalls = program.availableStalls || 0;
  const isStallsFull = program.isFull || false;
  const slotNumber = program.donorSlotNumber;
  
  const isDonor = userRole === "DONOR";
  const isFull = isDonor ? isStallsFull : isBeneficiaryFull;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative border-4 border-[#004225] flex flex-col">
        {/* Header */}
        <div className={`${isCompleted ? "bg-gray-600" : "bg-[#004225]"} text-white p-6 sticky top-0 z-10 flex justify-between items-start transition-colors duration-300`}>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold font-heading text-[#FFB000]">{programTitle}</h2>
            <div className="flex gap-4 mt-2 text-sm lg:text-base opacity-90">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {formatDateDisplay(programDate)}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 lg:p-8 space-y-8 flex-grow bg-background">
          {isCompleted && (
            <div className="bg-gray-200 border-l-4 border-gray-600 p-4 rounded-r-lg flex items-center gap-3">
              <History className="w-6 h-6 text-gray-600" />
              <div>
                <p className="font-bold text-gray-700">Event Ended</p>
                <p className="text-sm text-gray-600">This food donation event has successfully concluded.</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#004225]">Program Details</h3>
            <div className="bg-white p-6 border-l-4 border-[#FFB000] rounded-lg">
              <p className="text-gray-700 leading-relaxed">{program.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg border border-[#004225]/20 space-y-3">
                <p className="text-sm font-bold text-[#004225] uppercase tracking-wide mb-2">Location</p>
                {location ? (
                  <div className="space-y-3">
                    <p className="text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#FFB000]" /> {location}
                    </p>
                    {program.place?.donationCenter?.contactNumber && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#FFB000]" /> Contact: {program.place.donationCenter.contactNumber}
                      </p>
                    )}
                    <LocationMap
                      location={location}
                      latitude={program.place?.latitude}
                      longitude={program.place?.longitude}
                      placeName={program.place?.name}
                      height="h-64"
                      showRoute={true}
                    />
                  </div>
                ) : (
                  <p className="text-gray-500">Location not provided</p>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg border border-[#004225]/20">
                <p className="text-sm font-bold text-[#004225] uppercase tracking-wide mb-2">Date & Time</p>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-[#FFB000]" />
                  <div>
                    <p>{formattedDate}</p>
                    {timeRange && <p className="text-sm text-gray-600">{timeRange}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Slots Information */}
            <div className="bg-background p-4 rounded-lg border-l-4 border-[#FFB000]">
              <p className="font-bold text-[#004225] mb-2">
                {isDonor ? "Stall Availability" : "Participant Slots"}
              </p>
              <div className="flex items-center gap-4">
                {isDonor ? (
                  <p className="text-gray-700">
                    <span className="font-bold text-[#004225]">{reservedStalls}</span> reserved
                    {stallCapacity > 0 && <span> • <span className="font-bold text-[#FFB000]">{availableStalls}</span> available</span>}
                    <span className="text-sm text-gray-500 block mt-1">Total capacity: {stallCapacity}</span>
                  </p>
                ) : (
                  <p className="text-gray-700">
                    <span className="font-bold text-[#004225]">{claimedSlots}</span> claimed
                    {beneficiaryAvailableSlots !== null && <span> • <span className="font-bold text-[#FFB000]">{beneficiaryAvailableSlots}</span> available</span>}
                  </p>
                )}
                {isFull && <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">FULL</span>}
              </div>
            </div>

            {/* Status for Donor */}
            {isDonor && donorHasReserved && (
              <div className={`p-4 rounded-lg border-l-4 ${
                reservationStatus === 'CONFIRMED' ? 'bg-green-50 border-green-500' :
                reservationStatus === 'CANCELLED' ? 'bg-red-50 border-red-500' :
                'bg-yellow-50 border-yellow-500'
              }`}>
                <p className="font-bold text-sm uppercase tracking-wide mb-1">Your Stall Reservation</p>
                <p className={`font-bold ${
                  reservationStatus === 'CONFIRMED' ? 'text-green-700' :
                  reservationStatus === 'CANCELLED' ? 'text-red-700' :
                  'text-yellow-700'
                }`}>{reservationStatus || 'PENDING'}</p>
                {slotNumber && <p className="text-sm text-gray-600 mt-1">Stall #{slotNumber}</p>}
              </div>
            )}

            {/* Status for Beneficiary */}
            {!isDonor && userHasApplied && (
              <div className={`p-4 rounded-lg border-l-4 ${
                applicationStatus === 'APPROVED' ? 'bg-green-50 border-green-500' :
                applicationStatus === 'REJECTED' ? 'bg-red-50 border-red-500' :
                'bg-yellow-50 border-yellow-500'
              }`}>
                <p className="font-bold text-sm uppercase tracking-wide mb-1">Your Application Status</p>
                <p className={`font-bold ${
                  applicationStatus === 'APPROVED' ? 'text-green-700' :
                  applicationStatus === 'REJECTED' ? 'text-red-700' :
                  'text-yellow-700'
                }`}>{applicationStatus || 'PENDING'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t-2 border-[#004225]/10 sticky bottom-0 z-10 flex flex-col sm:flex-row justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border-2 border-gray-300 font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          {!isCompleted && (
            <>
              {userStatus === 'PENDING' && (
                <div className="px-8 py-3 rounded-xl bg-yellow-50 border-2 border-yellow-500 text-yellow-700 font-bold text-sm flex items-center gap-2">
                  <span>⚠️ Account pending approval</span>
                </div>
              )}
              <button
                onClick={onConfirm}
                disabled={(isDonor ? donorHasReserved : userHasApplied) || isFull || userStatus === 'PENDING'}
                aria-disabled={(isDonor ? donorHasReserved : userHasApplied) || isFull || userStatus === 'PENDING'}
                title={
                  userStatus === 'PENDING' ? 'Your account is pending admin approval' :
                  (isDonor ? (donorHasReserved ? 'You already have a reservation' : (isFull ? 'All stalls reserved' : '')) : (userHasApplied ? 'You have already applied for this program' : (isFull ? 'Program is full' : '')))
                }
                className={`px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                  (isDonor ? donorHasReserved : userHasApplied) || isFull || userStatus === 'PENDING'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#FFB000] text-[#004225] hover:bg-yellow-500 hover:shadow-xl transform hover:-translate-y-1'
                }`}
              >
                {userStatus === 'PENDING' ? 'Approval Required' :
                 isDonor ? (
                  donorHasReserved ? 'Already Reserved' : isFull ? 'All Stalls Reserved' : 'Reserve Stall'
                ) : (
                  userHasApplied ? 'Already Applied' : isFull ? 'Program Full' : 'Confirm Application'
                )} <CheckCircle className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- PUBLIC FACEBOOK-STYLE PROGRAMS VIEW ---
const PublicProgramsView = ({ scheduledPrograms, pastPrograms, isLoading }: { scheduledPrograms: any[]; pastPrograms: any[]; isLoading: boolean }) => {
  const [selectedProgram, setSelectedProgram] = useState<any>(null);

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#004225] to-[#005a33] text-white py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Our Programs</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Discover our charity initiatives and community food distribution programs. Join us in making a difference!
          </p>
        </div>
      </div>

      {/* Programs Feed */}
      <div className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-16 h-16 text-[#004225] animate-spin" />
          </div>
        ) : scheduledPrograms.length === 0 && pastPrograms.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-[#004225]/20">
            <p className="text-gray-500 text-lg">No programs available at the moment.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Scheduled (upcoming) programs */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#004225] text-white flex items-center justify-center font-bold">UP</div>
                <div>
                  <p className="text-[#004225] font-bold text-xl">Scheduled Programs</p>
                  <p className="text-gray-500 text-sm">Happening soon (from today onward)</p>
                </div>
              </div>
              {scheduledPrograms.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-[#004225]/20 p-6 text-gray-500 text-center">No scheduled programs yet.</div>
              ) : (
                scheduledPrograms.map((program) => {
                  const programDate = program.date || program.startDate || program.datetime;
                  const startDate = formatDateShort(programDate);
                  const startTime = formatTimeDisplay(programDate);
                  const location = getLocationFromProgram(program);

                  return (
                    <div
                      key={program.id}
                      className="bg-white rounded-2xl shadow-lg border-2 border-[#004225]/10 overflow-hidden hover:shadow-xl transition-shadow duration-300 animate-in fade-in slide-in-from-bottom-4"
                    >
                      {/* Post Header */}
                      <div className="p-6 border-b-2 border-[#004225]/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#004225] to-[#FFB000] flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">📦</span>
                          </div>
                          <div>
                            <p className="font-bold text-[#004225] text-lg">{program.name || program.title || "Program"}</p>
                            <p className="text-gray-500 text-sm">Food-O-Nation</p>
                          </div>
                        </div>
                        <span className="px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider bg-[#FFB000] text-[#004225]">
                          Scheduled
                        </span>
                      </div>

                      {/* Post Content */}
                      <div className="p-6 space-y-4">
                        <div>
                          <h2 className="text-2xl lg:text-3xl font-bold text-[#004225] mb-3">{program.name || program.title || "Program Details"}</h2>
                          <p className="text-gray-700 text-base lg:text-lg leading-relaxed">{program.description}</p>
                        </div>

                        {/* Program Details */}
                        <div className="space-y-3 py-4 border-y-2 border-[#004225]/10">
                          <div className="flex items-center gap-3 text-[#004225]">
                            <Calendar className="w-5 h-5 text-[#FFB000] flex-shrink-0" />
                            <div>
                              <p className="font-semibold">{startDate}</p>
                              {startTime && <p className="text-sm text-gray-600">{startTime}</p>}
                            </div>
                          </div>

                          {location && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-[#004225]">
                                <MapPin className="w-5 h-5 text-[#FFB000] flex-shrink-0" />
                                <p className="font-semibold text-sm">{location}</p>
                              </div>
                              <LocationMap
                                location={location}
                                latitude={program.place?.latitude}
                                longitude={program.place?.longitude}
                                placeName={program.place?.name}
                                height="h-64"
                                showRoute={true}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Post Footer - Action Button */}
                      <div className="px-6 py-4 bg-background border-t-2 border-[#004225]/10">
                        <button
                          onClick={() => setSelectedProgram(program)}
                          className="w-full bg-gradient-to-r from-[#004225] to-[#005a33] text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                          Learn More <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Past programs */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center font-bold">PA</div>
                <div>
                  <p className="text-gray-800 font-bold text-xl">Past Programs</p>
                  <p className="text-gray-500 text-sm">Already completed events</p>
                </div>
              </div>
              {pastPrograms.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-6 text-gray-500 text-center">No past programs yet.</div>
              ) : (
                pastPrograms.map((program) => {
                  const programDate = program.date || program.startDate || program.datetime;
                  const startDate = formatDateShort(programDate);
                  const startTime = formatTimeDisplay(programDate);
                  const location = getLocationFromProgram(program);
                  const isMapLink = typeof location === "string" && location.startsWith("http");

                  return (
                    <div
                      key={program.id}
                      className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 animate-in fade-in slide-in-from-bottom-4"
                    >
                      <div className="p-6 border-b-2 border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">📦</span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-lg">{program.name || program.title || "Program"}</p>
                            <p className="text-gray-500 text-sm">Food-O-Nation</p>
                          </div>
                        </div>
                        <span className="px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider bg-gray-200 text-gray-700">
                          Completed
                        </span>
                      </div>

                      <div className="p-6 space-y-4">
                        <div>
                          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-3">{program.name || program.title || "Program Details"}</h2>
                          <p className="text-gray-700 text-base lg:text-lg leading-relaxed">{program.description}</p>
                        </div>

                        <div className="space-y-3 py-4 border-y border-gray-200">
                          <div className="flex items-center gap-3 text-gray-700">
                            <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0" />
                            <div>
                              <p className="font-semibold">{startDate}</p>
                              {startTime && <p className="text-sm text-gray-500">{startTime}</p>}
                            </div>
                          </div>

                          {location && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                <p className="font-semibold text-sm">{location}</p>
                              </div>
                              <LocationMap
                                location={location}
                                latitude={program.place?.latitude}
                                longitude={program.place?.longitude}
                                placeName={program.place?.name}
                                height="h-56"
                                showRoute={true}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <button
                          onClick={() => setSelectedProgram(program)}
                          className="w-full border-2 border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                        >
                          View Details <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Modal */}
        {selectedProgram && (
          <ProgramDetailsModal
            program={selectedProgram}
            onClose={() => setSelectedProgram(null)}
            onConfirm={() => {
              alert("Please log in to apply for this program");
              setSelectedProgram(null);
            }}
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

// --- MAIN PAGE ---
function ProgramsPage() {
  const [isActivityHistoryOpen, setIsActivityHistoryOpen] = useState(false);
  const [hasSeenApprovedModal, setHasSeenApprovedModal] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showAllPrograms, setShowAllPrograms] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scheduledPrograms, setScheduledPrograms] = useState<any[]>([]);
  const [pastPrograms, setPastPrograms] = useState<any[]>([]);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<any>(null);
  const [showPendingModal, setShowPendingModal] = useState(false);

  const fetchData = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      let userRole = null;
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          // Check if user has roles array or role string
          const roles = user.roles || [];
          const role = user.role || (roles.length > 0 ? roles[0] : null);
          userRole = role;
          
          setUserData({
            id: user.id,
            name: user.displayName || "User",
            email: user.email || "",
            status: user.status || "PENDING",
            role: role,
            roles: roles
          });
          setHasSeenApprovedModal(user.status === "APPROVED");
          setShowPendingModal(user.status === "PENDING");
        } catch (parseError) {
          console.error('[fetchData] Error parsing user data:', parseError);
        }
      }

      // Use authenticated endpoint based on user role, with fallback to public
      let response;
      
      // Try authenticated endpoints first for logged-in users
      if (token && userRole) {
        try {
          console.log('[fetchData] User role:', userRole);
          
          if (userRole === "DONOR") {
            // Fetch programs with stall reservation status for donors
            const url = `http://localhost:5000/api/stalls/programs-with-donor-status`;
            console.log('[fetchData] Calling donor endpoint:', url);
            response = await axios.get(url, {
              headers: { 
                Authorization: `Bearer ${token}`
              },
              timeout: 10000
            });
          } else if (userRole === "BENEFICIARY") {
            // Fetch programs with application status for beneficiaries
            console.log('[fetchData] Calling beneficiary endpoint');
            response = await axios.get(`http://localhost:5000/api/program-applications/with-status`, {
              headers: { 
                Authorization: `Bearer ${token}`
              },
              timeout: 10000
            });
          }
        } catch (authError: any) {
          console.warn('[fetchData] Authenticated endpoint failed, falling back to public:', authError.message);
          // Fall back to public endpoint if authenticated request fails
          response = null;
        }
      }
      
      // If no response yet (no auth or auth failed), use public endpoint
      if (!response) {
        console.log('[fetchData] Using public endpoint');
        response = await axios.get(`http://localhost:5000/api/programs`, {
          timeout: 10000
        });
      }
      
      console.log('[fetchData] Response received, success:', response?.data?.success);

      const allPrograms = response.data.data || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming: any[] = [];
      const past: any[] = [];

      allPrograms.forEach((p: any) => {
        // Handle both 'date' and 'startDate' field names
        const programDate = p.date || p.startDate;
        const start = programDate ? new Date(programDate) : null;
        const isUpcoming = start ? start >= today : p.status !== "COMPLETED";
        if (isUpcoming) {
          upcoming.push(p);
        } else {
          past.push(p);
        }
      });

      setScheduledPrograms(upcoming);
      setPastPrograms(past);
    } catch (err: any) {
      // Only log meaningful errors, suppress axios internal errors
      if (err.response) {
        console.error("[fetchData] API Error:", err.response.status, err.response.data?.message || err.message);
      } else if (err.request) {
        console.error("[fetchData] No response from server:", err.message);
      } else if (err.message) {
        console.error("[fetchData] Error:", err.message);
      }
      // Set empty arrays so the page still renders
      setScheduledPrograms([]);
      setPastPrograms([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Re-fetch data when page becomes visible (handles tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData();
      }
    };

    // Re-fetch when window gains focus
    const handleFocus = () => {
      fetchData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const { showNotification } = useNotification();

  const handleJoinProgram = async () => {
    if (!selectedProgram) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showNotification({ title: 'Login required', message: 'Please log in to apply for programs', type: 'info', autoClose: 4000 });
        return;
      }

      let response;
      
      if (userData?.role === "DONOR") {
        // Donor: Reserve a stall
        response = await axios.post(
          `http://localhost:5000/api/stalls/programs/${selectedProgram.id}/reserve`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // If backend returned QR data (qrCodeUrl / qrCodeRef), show the same QR modal used for beneficiaries
        const resData = response.data?.data;
        if (resData && (resData.qrCodeUrl || resData.qrCode)) {
          setQrCodeData({
            qrCode: resData.qrCodeUrl || resData.qrCode || null,
            programTitle: selectedProgram.title,
            programDate: selectedProgram.date || selectedProgram.startDate,
          });
          setShowQRCode(true);
        } else {
          showNotification({ title: 'Stall reserved', message: 'Stall reserved successfully! Check your email for the QR code.', type: 'success', autoClose: 5000 });
        }
      } else {
        // Beneficiary: Apply for food program
        response = await axios.post(
          "http://localhost:5000/api/program-applications/apply",
          { programId: selectedProgram.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Show QR code modal for beneficiaries
        setQrCodeData(response.data.data);
        setShowQRCode(true);
        showNotification({ title: 'Applied', message: `Successfully applied for: ${selectedProgram.title}`, type: 'success', autoClose: 5000 });
      }

      setSelectedProgram(null);
      
      // Re-fetch programs to update status
      fetchData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to process request";
      showNotification({ title: 'Error', message: errorMessage, type: 'error' });
    }
  };

  const visibleActivePrograms = showAllPrograms ? scheduledPrograms : scheduledPrograms.slice(0, 3);

  // Show public view for non-users
  if (!isLoading && !userData) {
    return <PublicProgramsView scheduledPrograms={scheduledPrograms} pastPrograms={pastPrograms} isLoading={false} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col">
      <Navbar />

      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {isLoading && <Loader2 className="w-16 h-16 text-[#004225] animate-spin mx-auto mt-20" />}

        {!isLoading && userData && (
          <>
            {/* Pending status notice shows as modal; cards remain visible */}

            {((userData.status === "PENDING") || (userData.status === "APPROVED" && hasSeenApprovedModal)) && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-[#004225] mb-2">Welcome, {userData.name.split(" ")[0]}!</h1>
                    <p className="text-[#004225]/70 text-lg">
                      {userData.role === "DONOR" 
                        ? "Browse available programs and reserve stalls for your donations" 
                        : "Browse available programs and join activities"}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setIsLoading(true);
                        fetchData();
                      }}
                      className="bg-white border-2 border-[#004225] text-[#004225] px-6 py-3 rounded-xl font-bold hover:bg-[#004225]/10 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                      title="Refresh programs"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                    <button
                      onClick={() => setIsActivityHistoryOpen(true)}
                      className="bg-[#FFB000] text-[#004225] px-6 py-3 rounded-xl font-bold hover:bg-yellow-500 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      View Activity Log <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* --- SCHEDULED PROGRAMS SECTION --- */}
                <div className="bg-white border-2 border-[#004225] w-full rounded-2xl overflow-hidden shadow-2xl mb-8">
                  <div className="text-center font-bold bg-[#004225] text-[#FFB000] p-6 text-2xl shadow-lg">
                    {userData.role === "DONOR" ? "Available Programs - Reserve Your Stall" : "Scheduled Programs"}
                  </div>

                  <div className="divide-y-2 divide-[#004225]/20">
                    {visibleActivePrograms.length === 0 ? (
                      <div className="p-12 text-center text-gray-500">No active programs available at the moment.</div>
                    ) : (
                      visibleActivePrograms.map((program) => {
                        const programDate = program.date || program.startDate || program.datetime;
                        const startDate = formatDateDisplay(programDate);
                        const timeRange = buildTimeRange(programDate, program.endDate || program.end_time);
                        const location = getLocationFromProgram(program);
                        const isMapLink = typeof location === "string" && location.startsWith("http");

                        return (
                          <div
                            key={program.id}
                            className="relative overflow-hidden rounded-2xl border-2 border-[#004225]/15 bg-white shadow-sm hover:shadow-md transition-shadow"
                          >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4 p-6 border-b border-[#004225]/10">
                              <div className="min-w-0">
                                <h3 className="text-2xl font-extrabold text-[#004225] truncate">
                                  {program.name || program.title || 'Program'}
                                </h3>
                                <p className="mt-1 text-[#004225]/80 line-clamp-2">
                                  {program.description || 'No description provided.'}
                                </p>
                              </div>
                              <span className="shrink-0 px-3 py-1 rounded-full bg-[#FFB000] text-[#004225] text-xs font-bold tracking-wider">
                                SCHEDULED
                              </span>
                            </div>

                            {/* Body */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                              {/* Left: Details */}
                              <div className="md:col-span-2 space-y-4">
                                {location && (
                                  <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                      <MapPin className="w-5 h-5 text-[#FFB000] mt-0.5" />
                                      <p className="font-semibold text-[#004225] break-words">{location}</p>
                                    </div>
                                    {/* Map with Route */}
                                    <LocationMap
                                      location={location}
                                      latitude={program.place?.latitude}
                                      longitude={program.place?.longitude}
                                      placeName={program.place?.name}
                                      height="h-64"
                                      showRoute={true}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Right: Date/Time */}
                              <div className="rounded-xl border border-[#004225]/15 bg-background p-4">
                                <div className="flex items-center gap-2 text-[#004225]">
                                  <Calendar className="w-5 h-5 text-[#FFB000]" />
                                  <span className="font-bold">{startDate}</span>
                                </div>
                                {timeRange && (
                                  <div className="mt-2 flex items-center gap-2 text-[#004225]">
                                    <Clock className="w-5 h-5 text-[#FFB000]" />
                                    <span className="font-semibold">{timeRange}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 border-t border-[#004225]/10 bg-[#FAF7F0] p-4">
                              <button
                                onClick={() => setSelectedProgram(program)}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#FFB000] px-6 py-3 font-bold text-[#004225] hover:bg-yellow-500 shadow-sm"
                              >
                                {userData?.status === 'PENDING' ? 'View Details' : 'View Details & Apply'}
                                <ArrowRight className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* View More Button */}
                  <button
                    onClick={() => setShowAllPrograms(!showAllPrograms)}
                    className="w-full p-6 text-center bg-[#FFB000]/10 border-t-2 border-[#004225] font-bold text-[#004225] hover:bg-[#FFB000]/20 transition-all cursor-pointer flex items-center justify-center gap-2 group text-lg"
                  >
                    {showAllPrograms ? (
                      <>
                        Show Less <ChevronUp className="w-6 h-6" />
                      </>
                    ) : (
                      <>
                        View More Programs <ChevronDown className="w-6 h-6" />
                      </>
                    )}
                  </button>
                </div>

                {/* --- COMPLETED PROGRAMS SECTION --- */}
                {showAllPrograms && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
                    <div className="bg-gray-100 border-2 border-gray-400 w-full rounded-2xl overflow-hidden shadow-inner">
                      <div className="text-center font-bold bg-gray-600 text-white p-4 text-xl shadow-lg flex items-center justify-center gap-2">
                        <History className="w-6 h-6" /> Past / Completed Charity Events
                      </div>

                      <div className="divide-y-2 divide-gray-300">
                        {pastPrograms.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">No completed programs yet.</div>
                        ) : (
                          pastPrograms.map((program) => {
                            const completedDate = formatDateDisplay(program.endDate || program.date);
                            const location = getLocationFromProgram(program);
                            return (
                              <div key={program.id} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative bg-gray-50 opacity-80 hover:opacity-100 transition-opacity">
                                <div className="space-y-3">
                                  <div>
                                    <p className="font-bold text-gray-700 text-lg mb-1">{program.name}</p>
                                    <p className="text-gray-600 text-sm leading-relaxed">{program.description}</p>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                      <MapPin className="w-4 h-4 text-gray-500" />
                                      <span>{location || "Location TBA"}</span>
                                    </div>
                                    <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs font-bold uppercase">COMPLETED</span>
                                  </div>
                                  {location && (
                                    <div className="flex items-center gap-2 text-gray-600 text-sm mt-2 mb-3">
                                      <MapPin className="w-4 h-4 text-gray-500" />
                                      <span>{location}</span>
                                    </div>
                                  )}
                                  {location && (
                                    <LocationMap
                                      location={location}
                                      latitude={program.place?.latitude}
                                      longitude={program.place?.longitude}
                                      placeName={program.place?.name}
                                      height="h-56"
                                      showRoute={true}
                                    />
                                  )}
                                </div>

                                <div className="space-y-4 flex flex-col justify-center items-start md:items-end">
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" /> {completedDate}
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => setSelectedProgram(program)}
                                    className="w-full md:w-auto border-2 border-gray-400 text-gray-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all text-sm flex items-center justify-center gap-2"
                                  >
                                    View Recap <ArrowRight className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal */}
                {selectedProgram && <ProgramDetailsModal program={selectedProgram} onClose={() => setSelectedProgram(null)} onConfirm={handleJoinProgram} userRole={userData?.role} userStatus={userData?.status} />}
                
                {/* QR Code Modal */}
                <QrModal
                  open={showQRCode && !!qrCodeData}
                  onClose={() => { setShowQRCode(false); setQrCodeData(null); }}
                  qrImage={qrCodeData?.qrCode || qrCodeData?.qrCodeUrl || qrCodeData?.qrCodeImageUrl || null}
                  title={qrCodeData?.programTitle || 'Registration Successful!'}
                  subtitle={qrCodeData?.programTitle ? `You have successfully registered for ${qrCodeData.programTitle}` : undefined}
                  details={qrCodeData ? [{ label: 'Program Date', value: formatDateDisplay(qrCodeData.programDate || qrCodeData.programDate) }] : undefined}
                  emailed={true}
                />
              </div>
            )}

            {userData.status === "APPROVED" && !hasSeenApprovedModal && (
              <ApprovedSuccessView name={userData.name} onContinue={() => setHasSeenApprovedModal(true)} />
            )}

            {userData.status === "REJECTED" && (
              <RejectedView reason="Your documents did not meet our requirements." actionCode="UPLOAD_DOCS" />
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

// Programs page is now public for transparency
export default ProgramsPage;