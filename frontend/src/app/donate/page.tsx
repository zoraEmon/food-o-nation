"use client";

import React from "react";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function DonateSelectionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0]">
      <Navbar />
      <main className="flex-grow flex flex-col justify-center items-center py-12 px-4 sm:px-6">
        <div className="max-w-4xl w-full">
          
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-[#004225] mb-4 font-heading">Make a Difference Today</h1>
            <p className="text-gray-700 text-lg font-medium">Choose how you would like to support our cause.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* LINK TO SCHEDULE DONATION PAGE */}
            <Link href="/donate/schedule" className="group">
              <div className="bg-white rounded-3xl p-10 border-2 border-transparent hover:border-[#ffb000] shadow-xl hover:shadow-2xl transition-all h-full flex flex-col items-center gap-6 text-center transform hover:-translate-y-1">
                <div className="bg-green-100 p-8 rounded-full group-hover:bg-[#004225] transition-colors duration-300">
                  <Package className="w-16 h-16 text-[#004225] group-hover:text-[#ffb000]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Donate Produce</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Donate food, canned goods, and essential supplies to our drop-off centers.
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center gap-2 text-[#004225] font-bold bg-[#ffb000]/20 px-6 py-3 rounded-full group-hover:bg-[#ffb000] transition-colors">
                  Donate Goods <ChevronRight className="w-5 h-5" />
                </span>
              </div>
            </Link>

            {/* LINK TO MONETARY PAGE */}
            <Link href="/donate/monetary" className="group">
              <div className="bg-white rounded-3xl p-10 border-2 border-transparent hover:border-[#ffb000] shadow-xl hover:shadow-2xl transition-all h-full flex flex-col items-center gap-6 text-center transform hover:-translate-y-1">
                               <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Monetary Donation</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Support our operations financially securely via credit card or e-wallet.
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center gap-2 text-[#004225] font-bold bg-[#ffb000]/20 px-6 py-3 rounded-full group-hover:bg-[#ffb000] transition-colors">
                  Donate Money <ChevronRight className="w-5 h-5" />
                </span>
              </div>
            </Link>

          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}