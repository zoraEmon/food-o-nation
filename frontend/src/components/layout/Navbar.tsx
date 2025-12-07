"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';
import Modal from '../ui/Modal';
import { HandHeart, HeartHandshake } from 'lucide-react';
import LoginForm from '@/components/features/auth/LoginForm'; // ✅ Import Form

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  // Login States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRole, setLoginRole] = useState<"BENEFICIARY" | "DONOR" | null>(null);

  const isActive = (path: string) => pathname === path;

  // Reset login state when closing modal
  const closeLoginModal = () => {
    setShowLoginModal(false);
    setLoginRole(null); // Reset role so next time it asks again
  };

  const navLinks = [
    { name: "Home", href: "/dashboard" },
    { name: "About Us", href: "/" },
    { name: "Programs", href: "/programs" },
    { name: "Acknowledgement", href: "/acknowledgement" },
    { name: "Contact Us", href: "/contact" },
  ];

  const handleNavClick = (e: React.MouseEvent, name: string, href: string) => {
    // If user is NOT logged in, block access to "Home" (Dashboard)
    // Note: In a real app, you'd check a global 'user' context here.
    const isLoggedIn = false; // Mock check
    if (name === "Home" && !isLoggedIn) {
      e.preventDefault();
      // Instead of the old "Access Denied" modal, let's open the Login Modal!
      setShowLoginModal(true); 
    }
  };

  return (
    <>
      <nav className="bg-primary text-white border-b border-primary/20 sticky top-0 z-50 transition-colors duration-300">
        <div className="container mx-auto flex items-center justify-between p-4">
          
          <Link href="/" className="font-hand text-4xl text-secondary hover:text-white transition-colors no-underline">
            Logo
          </Link>

          <div className="hidden md:flex gap-8 font-heading font-medium text-sm tracking-wide">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                onClick={(e) => handleNavClick(e, link.name, link.href)}
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

            <Link href="/donate" className="font-hand text-2xl text-secondary hover:text-white transition-colors hidden sm:block">
              Donate!
            </Link>

            {/* ✅ LOGIN BUTTON: Opens the Modal */}
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
          </div>
        </div>
      </nav>

      {/* --- LOGIN MODAL --- */}
      <Modal 
        isOpen={showLoginModal} 
        onClose={closeLoginModal}
        title={loginRole ? "Sign In" : "Welcome Back"}
      >
        {/* VIEW 1: ROLE SELECTION (Show if no role selected) */}
        {!loginRole && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <p className="text-center text-gray-600 dark:text-gray-300 font-sans">
              Please select your account type to continue.
            </p>

            <div className="grid grid-cols-1 gap-4">
              {/* Beneficiary Option */}
              <div 
                onClick={() => setLoginRole('BENEFICIARY')}
                className="group cursor-pointer p-4 border-2 border-primary/10 hover:border-[#004225] hover:bg-[#004225]/5 rounded-xl transition-all flex items-center gap-4"
              >
                <div className="bg-[#004225]/10 p-3 rounded-full text-[#004225] dark:text-[#ffb000]">
                  <HandHeart size={28} />
                </div>
                <div className="flex-1">
                  <h4 className="font-heading font-bold text-lg text-primary dark:text-white">
                    Beneficiary
                  </h4>
                  <p className="text-xs text-gray-500 font-sans">
                    Login to access aid programs and status.
                  </p>
                </div>
                <div className="text-primary/20 group-hover:text-[#004225]">➜</div>
              </div>

              {/* Donor Option */}
              <div 
                onClick={() => setLoginRole('DONOR')}
                className="group cursor-pointer p-4 border-2 border-primary/10 hover:border-blue-600 hover:bg-blue-50 rounded-xl transition-all flex items-center gap-4"
              >
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600">
                  <HeartHandshake size={28} />
                </div>
                <div className="flex-1">
                  <h4 className="font-heading font-bold text-lg text-primary dark:text-white group-hover:text-blue-600 transition-colors">
                    Donor Partner
                  </h4>
                  <p className="text-xs text-gray-500 font-sans">
                    Login to manage donations and view impact.
                  </p>
                </div>
                <div className="text-primary/20 group-hover:text-blue-600">➜</div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: LOGIN FORM (Show if role IS selected) */}
        {loginRole && (
          <LoginForm 
            role={loginRole} 
            onBack={() => setLoginRole(null)} // Clears role to go back to selection
            onClose={closeLoginModal} 
          />
        )}
      </Modal>

      {/* --- REGISTER MODAL (Existing) --- */}
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
                <h4 className="font-heading font-bold text-lg text-primary dark:text-white group-hover:text-secondary transition-colors">
                  I Need Assistance
                </h4>
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
                <h4 className="font-heading font-bold text-lg text-primary dark:text-white group-hover:text-secondary transition-colors">
                  I Want to Donate
                </h4>
              </div>
              <div className="text-primary/20 group-hover:text-secondary">➜</div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
