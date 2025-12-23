"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";

export default function AboutPage() {
  const { isLoggedIn, loading, logout } = useAuth();
  const [showLogoutScreen, setShowLogoutScreen] = useState(false);

  useEffect(() => {
    if (!loading && isLoggedIn) {
      setShowLogoutScreen(true);
      logout();
    } else if (!loading && !isLoggedIn) {
      setShowLogoutScreen(false);
    }
  }, [loading, isLoggedIn, logout]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {showLogoutScreen ? (
        <main className="flex-grow flex items-center justify-center px-6 lg:px-12 py-16 w-full">
          <div className="max-w-md w-full bg-white border border-[#004225]/10 shadow-lg rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 border-4 border-[#004225]/20 border-t-[#004225] rounded-full animate-spin"></div>
            <div className="space-y-1">
              <p className="text-xl font-semibold text-[#004225]">Logging you out</p>
              <p className="text-sm text-[#004225]/70">Clearing your session and returning you home.</p>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-grow max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16 w-full flex flex-col gap-16">
          {/* TOP SECTION: Image & Text */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Image Placeholder */}
            <div className="w-full h-96 lg:h-[500px] border-2 border-[#004225] bg-white flex items-center justify-center relative shadow-lg rounded-xl overflow-hidden">
              {/* Placeholder Visuals */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#004225_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="flex flex-col items-center justify-center text-gray-400 z-10">
                <svg className="w-20 h-20 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-bold text-lg text-[#004225]/40 uppercase tracking-widest">Image Placeholder</span>
              </div>
            </div>

            {/* Right Side - About Us Content */}
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-[#FFB000] mb-6 font-heading">
                About Us
              </h1>

              <div className="space-y-4 text-[#004225] text-base lg:text-lg leading-relaxed font-sans text-justify">
                <p className="border-b border-[#004225]/10 pb-4">
                  We are a dedicated non-profit organization committed to bridging the gap in the food aid ecosystem. Our mission is to transparently connect donors, volunteers, and beneficiaries to ensure no one goes hungry.
                </p>

                <p className="border-b border-[#004225]/10 pb-4">
                  Established in 2024, our core activities focus on efficient food distribution, community pantry management, and rapid response aid programs.
                </p>

                <p>
                  Through this platform, we aim to build public trust by providing real-time transparency on where donations go and how they impact lives.
                </p>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: Map */}
          <div className="w-full space-y-4">
            <h2 className="text-2xl font-bold text-[#004225] font-heading">Our Location</h2>
            <div className="w-full h-80 lg:h-96 border-2 border-[#004225] bg-gray-200 overflow-hidden relative shadow-lg rounded-xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.999999999999!2d121.033333!3d14.633333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b7a8a8a8a8a9%3A0x1234567890abcdef!2sQuezon%20City%2C%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1234567890123!5m2!1sen!2sph"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Quezon City Map"
                className="w-full h-full object-cover"
              ></iframe>
            </div>
          </div>
        </main>
      )}

      <Footer />
    </div>
  );
}