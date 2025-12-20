"use client";

import React from "react";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Footer from "@/components/layout/Footer";
import BeneficiaryApplicationForm from '@/components/features/beneficiary/BeneficiaryApplicationForm';

export default function BeneficiaryRegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AuthNavbar showLoginButton={true} loginLink="/login?type=beneficiary" />
      <main className="flex-1 flex flex-col items-center justify-center py-16 px-4">
        <div className="w-full max-w-4xl bg-white dark:bg-[#0a291a] p-8 md:p-12 rounded-2xl shadow-xl border border-primary/10">
          <div className="text-center mb-10">
            <h1 className="font-heading text-3xl font-bold text-primary dark:text-white mb-2">Beneficiary Application</h1>
            <p className="font-sans text-gray-500 dark:text-gray-400">Please fill out your details accurately.</p>
          </div>

          <BeneficiaryApplicationForm userData={{ name: '', email: '' }} />
        </div>
      </main>
      <Footer />
    </div>
  );
}