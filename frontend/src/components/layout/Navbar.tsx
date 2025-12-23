"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';
import Modal from '../ui/Modal';
import { HandHeart, HeartHandshake, LogOut, User, ChevronDown, ArrowLeft } from 'lucide-react';
import DonorManagement from '@/app/admin/dashboard/components/DonorManagement';
import AnonymousDonationModal from '@/components/ui/AnonymousDonationModal';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // --- STATE MANAGEMENT ---
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAnonymousModal, setShowAnonymousModal] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showDonorPanel, setShowDonorPanel] = useState(false);

  const isActive = (path: string) => pathname === path;
  // Hide donate button when already in any donate flow (/donate and its children)
  const hideDonate = !!(pathname && pathname.startsWith('/donate'));

  // Handle Logout
  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  // ✅ New Handler for Donate Click
  const handleDonateClick = () => {
    if (user) {
      // If logged in, go straight to donate page
      router.push('/donate');
    } else {
      // If NOT logged in, show the Heads Up modal
      setShowAnonymousModal(true);
    }
  };

  // ✅ Handle "Yes" on Anonymous Modal
  const handleAnonymousConfirm = () => {
    setShowAnonymousModal(false);
    router.push('/donate');
  };

  // Public links (always visible)
  const publicNavLinks = [
    { name: "About Us", href: "/" },
    { name: "Programs", href: "/programs" },
    { name: "Newsletter", href: "/impact-newsletter" },
    { name: "Acknowledgement", href: "/acknowledgement" },
    { name: "Contact Us", href: "/contact" },
  ];

  // Authenticated links (only when logged in)
  const authNavLinks = [
    { name: "Home", href: "/dashboard" },
    ...publicNavLinks
  ];

  const navLinks = user ? authNavLinks : publicNavLinks;

  const getUserInitials = () => {
    if (!user) return "U";
    const name = user.displayName || user.name || "User";
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <nav className="bg-primary text-white border-b border-primary/20 sticky top-0 z-50 transition-colors duration-300">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {(/^\/(login|register)/).test(pathname || '/') && (
              <button aria-label="Go back" onClick={() => router.back()} className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <Link href="/" className="font-hand text-4xl text-secondary hover:text-white transition-colors no-underline">
              Logo
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex gap-8 font-heading font-medium text-sm tracking-wide">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={cn(
                  "transition-colors duration-200 cursor-pointer",
                  isActive(link.href) 
                    ? "text-secondary font-bold border-b-2 border-secondary" 
                    : "text-white hover:text-secondary"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-white hover:text-secondary">
               <ThemeToggle />
            </div>

            {/* ✅ DONATE BUTTON - Visible for everyone (guests and authenticated users) */}
            {!hideDonate && (
              <button 
                onClick={handleDonateClick}
                className="font-hand text-2xl text-secondary hover:text-white transition-colors hidden sm:block bg-transparent border-none cursor-pointer"
              >
                Donate!
              </button>
            )}

            {/* Show small back button on mobile when on login/register as well */}
            {(/^\/(login|register)/).test(pathname || '/') && (
              <button aria-label="Go back" onClick={() => router.back()} className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center sm:hidden">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            {/* --- CONDITIONAL RENDERING --- */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary text-primary font-bold text-lg flex items-center justify-center border-2 border-white shadow-md hover:bg-yellow-400 transition-all">
                    {getUserInitials()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-white" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 mb-2">
                      <p className="text-sm font-bold text-[#004225] truncate">
                        {user.displayName || user.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    
                    <Link 
                      href="/dashboard" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#004225] flex items-center gap-2"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="w-4 h-4" /> My Dashboard
                    </Link>
                    {/* Admin links */}
                    {user?.roles?.includes('ADMIN') && (
                      <>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button onClick={() => { setShowDonorPanel(!showDonorPanel); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#004225] flex items-center gap-2">
                          <HeartHandshake className="w-4 h-4" /> Donor Management
                        </button>
                        {/* Drop-off Schedule moved into Donor Management accordion in the sidebar */}
                      </>
                    )}
                    
                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button 
                  onClick={() => setShowLoginModal(true)}
                  className="bg-secondary text-black hover:bg-yellow-400 font-heading font-bold rounded-full px-6"
                >
                  Login
                </Button>
                
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary font-heading font-bold rounded-full px-6 hidden sm:inline-flex"
                  onClick={() => setShowRegisterModal(true)}
                >
                  Sign-Up
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* --- LOGIN SELECTION MODAL --- */}
      <Modal 
        isOpen={showLoginModal} 
        onClose={closeLoginModal}
        title="Welcome Back"
      >
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
          <p className="text-center text-gray-600 dark:text-gray-300 font-sans">
            Please select your account type to continue.
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div 
              onClick={() => {
                setShowLoginModal(false);
                router.push('/login?type=beneficiary');
              }}
              className="group cursor-pointer p-4 border-2 border-primary/10 hover:border-[#004225] hover:bg-[#004225]/5 rounded-xl transition-all flex items-center gap-4"
            >
              <div className="bg-[#004225]/10 p-3 rounded-full text-[#004225] dark:text-[#ffb000]">
                <HandHeart size={28} />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-bold text-lg text-primary dark:text-white">Beneficiary</h4>
                <p className="text-xs text-gray-500 font-sans">Login to access aid programs.</p>
              </div>
              <div className="text-primary/20 group-hover:text-[#004225]">➜</div>
            </div>

            <div 
              onClick={() => {
                setShowLoginModal(false);
                router.push('/login?type=donor');
              }}
              className="group cursor-pointer p-4 border-2 border-primary/10 hover:border-blue-600 hover:bg-blue-50 rounded-xl transition-all flex items-center gap-4"
            >
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600">
                <HeartHandshake size={28} />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-bold text-lg text-primary dark:text-white group-hover:text-blue-600 transition-colors">Donor Partner</h4>
                <p className="text-xs text-gray-500 font-sans">Login to manage donations.</p>
              </div>
              <div className="text-primary/20 group-hover:text-blue-600">➜</div>
            </div>
          </div>
        </div>
      </Modal>

      {/* --- REGISTER MODAL --- */}
      <Modal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)}
        title="Join Our Community"
      >
        <div className="space-y-6">
          <p className="text-center text-gray-600 dark:text-gray-300 font-sans">
            How would you like to get involved?
          </p>
          <div className="grid grid-cols-1 gap-4">
            <div 
              onClick={() => { setShowRegisterModal(false); router.push('/register/beneficiary'); }}
              className="group cursor-pointer p-4 border-2 border-primary/10 hover:border-secondary rounded-xl transition-all hover:bg-primary/5 flex items-center gap-4"
            >
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400">
                <HandHeart size={28} />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-bold text-lg text-primary dark:text-white group-hover:text-secondary transition-colors">I Need Assistance</h4>
              </div>
              <div className="text-primary/20 group-hover:text-secondary">➜</div>
            </div>

            <div 
              onClick={() => { setShowRegisterModal(false); router.push('/register/donor'); }}
              className="group cursor-pointer p-4 border-2 border-primary/10 hover:border-secondary rounded-xl transition-all hover:bg-primary/5 flex items-center gap-4"
            >
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-600 dark:text-green-400">
                <HeartHandshake size={28} />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-bold text-lg text-primary dark:text-white group-hover:text-secondary transition-colors">I Want to Donate</h4>
              </div>
              <div className="text-primary/20 group-hover:text-secondary">➜</div>
            </div>
          </div>
        </div>
      </Modal>

      {/* --- ✅ ANONYMOUS DONATION MODAL --- */}
      <AnonymousDonationModal 
        isOpen={showAnonymousModal} 
        onClose={() => setShowAnonymousModal(false)} 
        onConfirm={handleAnonymousConfirm} 
      />
      {/* Donor Management slide-out panel (admin) */}
      {showDonorPanel && (
        <div className="fixed right-0 top-0 h-full w-full md:w-2/5 bg-black/40 z-50 flex">
          <div className="ml-auto w-full md:w-2/5 bg-white dark:bg-[#022] p-6 overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#004225]">Donor Management</h3>
              <button onClick={() => setShowDonorPanel(false)} className="text-gray-600">Close</button>
            </div>
            <DonorManagement />
          </div>
        </div>
      )}
    </>
  );
}