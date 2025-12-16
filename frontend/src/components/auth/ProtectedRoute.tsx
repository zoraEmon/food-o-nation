"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[]; // Optional: specific roles required (e.g., ['DONOR'], ['BENEFICIARY'])
  redirectTo?: string; // Where to redirect if not authenticated
}

export default function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoggedIn, loading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    if (!isLoggedIn || !user) {
      // Not authenticated at all
      router.push(redirectTo);
      return;
    }

    // Check if user has required roles (if specified)
    if (requiredRoles.length > 0) {
      const userRoles = user.roles || [];
      const hasRequiredRole = requiredRoles.some(role => 
        userRoles.includes(role)
      );
      
      if (!hasRequiredRole) {
        // User doesn't have required role
        router.push('/unauthorized');
        return;
      }
    }

    // User is authenticated and has required role
    setIsAuthenticated(true);
  }, [isLoggedIn, user, loading, router, requiredRoles, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#ffb000] mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router will redirect
  }

  return <>{children}</>;
}
