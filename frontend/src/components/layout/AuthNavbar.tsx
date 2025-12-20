"use client";

import { useRouter, usePathname } from 'next/navigation';
import { Moon, Sun, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface AuthNavbarProps {
  showLoginButton?: boolean;
  showSignUpButton?: boolean;
  loginLink?: string;
  signUpLink?: string;
}

export default function AuthNavbar({ 
  showLoginButton = false,
  showSignUpButton = false,
  loginLink = '/login?type=beneficiary',
  signUpLink = '/register/beneficiary'
}: AuthNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <nav className="bg-primary text-white border-b border-primary/20 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            {( /^\/(login|register)/ ).test(pathname || '/') && (
              <button aria-label="Go back" onClick={() => router.back()} className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center mr-2">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <span className="font-hand text-4xl text-secondary">Logo</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <Button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              variant="ghost"
              className="text-white hover:text-secondary p-2"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </Button>

            {showLoginButton && (
              <Button
                onClick={() => router.push(loginLink)}
                className="bg-secondary text-black hover:bg-yellow-400 font-heading font-bold rounded-full px-6"
              >
                Login
              </Button>
            )}
            {showSignUpButton && (
              <Button
                onClick={() => router.push(signUpLink)}
                className="bg-secondary text-black hover:bg-yellow-400 font-heading font-bold rounded-full px-6"
              >
                Sign Up
              </Button>
            )}
          </div>
        </div>
      </nav>

    </>
  );
}
