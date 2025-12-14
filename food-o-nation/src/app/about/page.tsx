'use client';

import React, { useState } from 'react';
import { Star, Mail, Phone, MapPin, FileText, Send } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const [email, setEmail] = useState('');
  const [applicationType, setApplicationType] = useState('volunteer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Submitted:', { email, applicationType });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0]">
      {/* Header - Dark Green Background */}
      <header className="bg-[#004225] text-white py-4 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="text-[#FFB000] font-bold text-xl lg:text-2xl">
            Logo
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="/" className="text-white hover:text-[#FFB000] transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-[#FFB000] border-b-2 border-[#FFB000] pb-1 font-semibold">
              About Us
            </Link>
            <Link href="/programs" className="text-white hover:text-[#FFB000] transition-colors">
              Programs
            </Link>
            <Link href="/acknowledgement" className="text-white hover:text-[#FFB000] transition-colors">
              Acknowledgement
            </Link>
            <Link href="/contact" className="text-white hover:text-[#FFB000] transition-colors">
              Contact Us
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 text-[#FFB000] hover:text-yellow-300 transition-colors">
              <Star className="w-4 h-4" />
              <span className="font-semibold">Donate!</span>
            </button>
            <button className="bg-[#FFB000] text-white px-4 py-2 rounded font-semibold hover:bg-yellow-500 transition-colors">
              Login
            </button>
            <button className="border-2 border-[#FFB000] text-white px-4 py-2 rounded font-semibold hover:bg-[#FFB000] hover:text-[#004225] transition-colors">
              Sign-Up
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Light Beige Background */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Image Placeholder */}
          <div className="w-full h-96 lg:h-[500px] border-2 border-[#004225] bg-white flex items-center justify-center relative">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-full">
                <svg width="100%" height="100%" className="opacity-20">
                  <line x1="0" y1="0" x2="100%" y2="100%" stroke="#004225" strokeWidth="2" />
                  <line x1="100%" y1="0" x2="0" y2="100%" stroke="#004225" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <p className="text-gray-400 text-sm">Image Placeholder</p>
          </div>

          {/* Right Side - About Us Content */}
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-[#FFB000] mb-6">
              About Us
            </h1>
            
            <div className="space-y-4 text-[#004225] text-base lg:text-lg leading-relaxed">
              <p>
                We are a dedicated non-profit organization committed to bridging the gap in the food aid ecosystem. Our mission is to transparently connect donors, volunteers, and beneficiaries to ensure no one goes hungry.
              </p>
              
              <p>
                Established in 2024, our core activities focus on efficient food distribution, community pantry management, and rapid response aid programs.
              </p>
              
              <p>
                Through this platform, we aim to build public trust by providing real-time transparency on where donations go and how they impact lives.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Dark Green Background */}
      <footer className="bg-[#004225] text-white py-12 lg:py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left Side - FoodONation Information */}
            <div className="space-y-6">
              {/* Logo/Name */}
              <h2 className="text-4xl lg:text-5xl font-bold text-[#FFB000] font-hand">
                FoodONation
              </h2>
              
              {/* Mission Statement */}
              <p className="text-white/90 text-base lg:text-lg leading-relaxed">
                Bridging the gap in the food aid ecosystem. We connect resources to those who need them most through transparency and care.
              </p>
              
              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/90">
                  <Phone className="w-5 h-5 text-[#FFB000]" />
                  <span>+63 923 123 456</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <MapPin className="w-5 h-5 text-[#FFB000]" />
                  <span>Davao City, PH</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <Mail className="w-5 h-5 text-[#FFB000]" />
                  <span>info@foodonation.org</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <FileText className="w-5 h-5 text-[#FFB000]" />
                  <span>User Policy & DPU</span>
                </div>
              </div>
              
              {/* Footer Navigation */}
              <div className="flex flex-wrap gap-4 text-sm text-white/80">
                <Link href="/" className="hover:text-[#FFB000] transition-colors">Home</Link>
                <Link href="/about" className="hover:text-[#FFB000] transition-colors">About Us</Link>
                <Link href="/programs" className="hover:text-[#FFB000] transition-colors">Programs</Link>
                <Link href="/contact" className="hover:text-[#FFB000] transition-colors">Contact</Link>
              </div>
            </div>

            {/* Right Side - Get Involved Section */}
            <div className="space-y-6">
              <h3 className="text-3xl lg:text-4xl font-bold text-[#FFB000]">
                Get Involved
              </h3>
              
              <p className="text-white/90 text-base lg:text-lg leading-relaxed">
                Select Apply if you're a beneficiary, seeking aid, or Partner if you wish to collaborate.
              </p>
              
              {/* Email Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-white/10 border-2 border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-[#FFB000] transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <select
                    value={applicationType}
                    onChange={(e) => setApplicationType(e.target.value)}
                    className="w-full bg-white/10 border-2 border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFB000] transition-colors"
                  >
                    <option value="volunteer" className="bg-[#004225] text-white">Apply for Volunteer</option>
                    <option value="beneficiary" className="bg-[#004225] text-white">Apply as Beneficiary</option>
                    <option value="partner" className="bg-[#004225] text-white">Apply as Partner</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-[#FFB000] text-[#004225] px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Submit</span>
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-white/20 text-center">
            <p className="text-white/60 text-sm">
              © 2023 FoodONation. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}






