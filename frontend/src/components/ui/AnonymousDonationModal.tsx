"use client";

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AnonymousDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function AnonymousDonationModal({ isOpen, onClose, onConfirm }: AnonymousDonationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      {/* Main Container - Matches the "Success Modal" design style */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center border-4 border-[#004225] relative overflow-hidden transform transition-all scale-100">
        
        {/* Top Gold Decorative Strip */}
        <div className="absolute top-0 left-0 w-full h-4 bg-[#ffb000]"></div>

        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 mb-6 mt-4">
          <AlertTriangle className="h-10 w-10 text-[#ffb000]" />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-[#004225] mb-4 font-heading">
          Heads Up!
        </h2>
        
        {/* Content Body */}
        <div className="space-y-4 mb-8">
          <p className="text-gray-600 font-medium leading-relaxed">
            You have not yet logged in.
          </p>
          <p className="text-gray-800 text-sm bg-gray-50 p-4 rounded-xl border border-gray-200">
            Are you sure you want to donate anonymously? 
            <span className="block mt-2 font-bold text-[#004225]">
              Your points and activity will not be audited.
            </span>
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-200 text-black-500 font-bold hover:bg-gray-50 hover:text-gray-700 transition-all"
          >
            No, Log In
          </button>
          
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 px-6 rounded-xl bg-[#ffb000] text-black font-bold shadow-md hover:bg-[#ffc107] hover:-translate-y-0.5 transition-all"
          >
            Yes, Continue
          </button>
        </div>

      </div>
    </div>
  );
}