"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { authService } from "../../services/authService"; // Corrected path

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "", inquiryType: "General Inquiry" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await authService.getMe();
        if (user) {
          // Determine name based on role (Beneficiary vs Donor vs Admin)
          const name = user.beneficiaryProfile?.firstName || user.donorProfile?.displayName || user.adminProfile?.firstName || "";
          
          setFormData(prev => ({
            ...prev,
            email: user.email,
            name: name
          }));
        }
      } catch (error) {
        // User not logged in, ignore
        console.log("User not logged in or error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Implement actual form submission logic here
    alert("Message sent! (Simulated)");
    setFormData({ name: "", email: "", message: "", inquiryType: "General Inquiry" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12 shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-[#0a291a] border border-primary/10">
            
            {/* LEFT SIDE: The Form (Clean, Modern, Trustworthy) */}
            <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              <div className="mb-8">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary dark:text-secondary rounded-full text-xs font-bold tracking-wider uppercase mb-3">
                  Contact Us
                </span>
                <h1 className="font-heading text-4xl font-bold text-primary dark:text-white mb-2">
                  Let's Get In Touch.
                </h1>
                <p className="font-sans text-gray-500 dark:text-gray-400">
                  Or just reach out manually to <a href="mailto:hello@foodonation.org" className="text-secondary font-bold hover:underline">hello@foodonation.org</a>
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                
                {/* Name Field */}
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name</label>
                    <input 
                      id="name" 
                      name="name" 
                      type="text" 
                      placeholder="Juan Dela Cruz" 
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-[#ffb000] focus:ring-1 focus:ring-[#ffb000] transition-all"
                    />
                </div>

                {/* Email & Inquiry Type Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                    <input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="juan@example.com" 
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-[#ffb000] focus:ring-1 focus:ring-[#ffb000] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="inquiryType" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Inquiry Type</label>
                    <div className="relative">
                        <select 
                          id="inquiryType" 
                          name="inquiryType" 
                          value={formData.inquiryType}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-[#ffb000] focus:ring-1 focus:ring-[#ffb000] appearance-none cursor-pointer"
                        >
                            <option>General Inquiry</option>
                            <option>Partnership Proposal</option>
                            <option>Volunteering Question</option>
                            <option>Report an Issue</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Message</label>
                    <textarea 
                      id="message" 
                      name="message" 
                      rows={4}
                      placeholder="How can we help you?" 
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-[#ffb000] focus:ring-1 focus:ring-[#ffb000] transition-all resize-none"
                    />
                </div>

                <Button 
                  type="submit" 
                  onClick={handleSubmit}
                  className="w-full bg-[#ffb000] text-black hover:bg-[#e6a000] h-12 text-lg font-bold"
                >
                    Send Message
                </Button>

              </form>
            </div>

            {/* RIGHT SIDE: Visual/Image Section (Matches the architectural vibe) */}
            <div className="relative hidden lg:block bg-primary overflow-hidden">
                {/* Background Pattern/Image */}
                <div className="absolute inset-0 bg-[#004225]">
                     {/* Abstract Lines / Placeholder for Building Image */}
                     <svg className="w-full h-full text-white/5" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 L50 0 L100 100 Z" fill="currentColor" />
                        <rect x="20" y="50" width="10" height="50" fill="currentColor" />
                        <rect x="70" y="30" width="15" height="70" fill="currentColor" />
                     </svg>
                </div>
                
                {/* Overlay Content */}
                <div className="absolute bottom-12 left-12 right-12 text-white z-10">
                    <h3 className="font-hand text-5xl text-secondary mb-4">Visit Us</h3>
                    <p className="font-sans text-lg text-gray-300 mb-8 leading-relaxed">
                        We love meeting our community. Drop by our headquarters to see our operations in action.
                    </p>
                    
                    <div className="space-y-4 font-sans border-t border-white/20 pt-8">
                        <div className="flex items-start gap-4">
                            <div className="bg-white/10 p-2 rounded-full">📍</div>
                            <div>
                                <p className="font-bold text-secondary">Headquarters</p>
                                <p className="text-sm text-gray-300">123 Charity Lane, Diliman<br/>Quezon City, Metro Manila</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                             <div className="bg-white/10 p-2 rounded-full">📞</div>
                            <div>
                                <p className="font-bold text-secondary">Phone Support</p>
                                <p className="text-sm text-gray-300">+63 (02) 8123 4567</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
