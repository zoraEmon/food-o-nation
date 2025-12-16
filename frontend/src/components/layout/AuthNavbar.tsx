"use client";

import { useRouter } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';
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
