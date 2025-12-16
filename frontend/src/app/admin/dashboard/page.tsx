
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  LogOut, 
  CircleUserRound,
  Shield
} from "lucide-react";

interface User {
  id: string;
  email: string;
  status: string;
  adminProfile?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  beneficiaryProfile?: any;
  donorProfile?: any;
}

function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const currentUser = await authService.getMe();
        if (!currentUser || !currentUser.adminProfile) {
          // Not an admin or not logged in, redirect to home
          authService.logout();
          router.push("/");
          return;
        }
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user data:", error);
        authService.logout();
      
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    checkAdminStatus();
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
        Loading Admin Dashboard...
      </div>
    );
  }

  if (!user) {
    return null; // Should have redirected by now
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 shadow-lg border-r border-gray-700 flex flex-col">
        <div className="flex items-center mb-10">
          <Shield className="w-8 h-8 text-blue-400 mr-3" />
          <h2 className="text-2xl font-bold text-gray-50">Admin Panel</h2>
        </div>
        <nav className="flex-grow">
          <ul>
            <li className="mb-4">
              <a href="#" className="flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200">
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Dashboard
              </a>
            </li>
            <li className="mb-4">
              <a href="#" className="flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200">
                <Users className="w-5 h-5 mr-3" />
                Manage Users
              </a>
            </li>
            <li className="mb-4">
              <a href="#" className="flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200">
                <ClipboardList className="w-5 h-5 mr-3" />
                Pending Approvals
              </a>
            </li>
          </ul>
        </nav>
        <div className="mt-auto">
          <div className="flex items-center text-gray-300 mb-4">
            <CircleUserRound className="w-6 h-6 mr-3 text-green-400" />
            <span>{user.adminProfile?.firstName} {user.adminProfile?.lastName}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-4xl font-extrabold text-gray-50 mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stat Card 1 */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-300">Total Users</h3>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-5xl font-bold text-white">1,234</p>
            <p className="text-gray-400 text-sm mt-2">Registered across all roles</p>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-300">Pending Approvals</h3>
              <ClipboardList className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-5xl font-bold text-white">45</p>
            <p className="text-gray-400 text-sm mt-2">Beneficiaries and Donors awaiting review</p>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-300">Active Programs</h3>
              <LayoutDashboard className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-5xl font-bold text-white">12</p>
            <p className="text-gray-400 text-sm mt-2">Currently running food aid programs</p>
          </div>
        </div>

        {/* Add more dashboard sections here */}
        <div className="mt-10 bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h3 className="text-2xl font-semibold text-gray-300 mb-4">Recent Activity</h3>
          <ul className="space-y-3">
            <li className="text-gray-400">[Timestamp] User John Doe registered as Beneficiary.</li>
            <li className="text-gray-400">[Timestamp] Donation from XYZ Corp for &quot;Winter Drive&quot; program.</li>
            <li className="text-gray-400">[Timestamp] Admin Jane Smith approved 3 pending users.</li>
          </ul>
        </div>

      </main>
    </div>
  );
}

// Wrap with ProtectedRoute for authentication
export default function ProtectedAdminDashboard() {
  return (
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <AdminDashboardPage />
    </ProtectedRoute>
  );
}
