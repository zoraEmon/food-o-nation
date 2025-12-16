      "use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  displayName: string;
  email?: string;
  status: string;
  roles: string[];
  isVerified?: boolean;
  donorId?: string;
  beneficiaryId?: string;
}

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (token: string, user: UserData) => void;
  logout: () => void;
  loading: boolean; // To indicate if auth state is being loaded
  donorId?: string;
  beneficiaryId?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // On mount, check if user data exists in localStorage
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser: UserData = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (newToken: string, newUser: UserData) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    
    // Store donorId and beneficiaryId separately for easy access
    if (newUser.donorId) {
      localStorage.setItem("donorId", newUser.donorId);
    }
    if (newUser.beneficiaryId) {
      localStorage.setItem("beneficiaryId", newUser.beneficiaryId);
    }
    
    setToken(newToken);
    setUser(newUser);
    setIsLoggedIn(true);
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("donorId");
    localStorage.removeItem("beneficiaryId");
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    router.push("/"); // Redirect to home page after logout
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoggedIn,
      login: loginUser,
      logout: logoutUser,
      loading,
      donorId: user?.donorId,
      beneficiaryId: user?.beneficiaryId,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
