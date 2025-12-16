"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { User, MapPin, Users, DollarSign } from "lucide-react";

function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getMe();
        if (!data) {
          // If no data (token invalid), kick them out
          authService.logout();
          router.push("/"); 
        } else {
          setUser(data);
        }
      } catch (err) {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004225]"></div>
      </div>
    );
  }

  // Determine if Beneficiary or Donor
  const beneficiary = user?.beneficiaryProfile;
  const donor = user?.donorProfile;
  
  // Construct Image URL (pointing to your backend)
  const imageUrl = user?.profileImage 
    ? `http://localhost:5000/${user.profileImage}` 
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] dark:bg-[#051A10]">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 py-12">
        
        {/* WELCOME BANNER */}
        <div className="bg-[#004225] rounded-3xl p-8 md:p-12 text-white shadow-xl mb-12 flex flex-col md:flex-row items-center gap-8">
          
          {/* Profile Picture */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#ffb000] overflow-hidden bg-white/10 flex items-center justify-center">
              {imageUrl ? (
                <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={64} className="text-white/50" />
              )}
            </div>
            <div className="absolute bottom-2 right-2 bg-[#ffb000] text-[#004225] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {user?.status}
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center md:text-left space-y-2">
            <h1 className="font-heading text-3xl md:text-5xl font-bold">
              {beneficiary 
                ? `Welcome, ${beneficiary.firstName}!` 
                : `Welcome, ${donor?.displayName || "Partner"}!`}
            </h1>
            <p className="font-sans text-gray-200 text-lg max-w-xl">
              {beneficiary 
                ? "Here is your personal dashboard. You can view your application status and profile details below."
                : "Thank you for being a partner in our mission to end hunger."}
            </p>
          </div>
        </div>

        {/* --- BENEFICIARY VIEW --- */}
        {beneficiary && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="card">
              <h3 className="card-title"><User size={20}/> Personal Details</h3>
              <div className="space-y-4 text-sm">
                <InfoRow label="Full Name" value={`${beneficiary.firstName} ${beneficiary.lastName}`} />
                <InfoRow label="Email" value={user.email} />
                <InfoRow label="Phone" value={beneficiary.contactNumber} />
                <InfoRow label="Gender" value={beneficiary.gender} />
                <InfoRow label="Civil Status" value={beneficiary.civilStatus} />
              </div>
            </div>

            <div className="card">
              <h3 className="card-title"><Users size={20}/> Household Info</h3>
              <div className="space-y-4 text-sm">
                <InfoRow label="Occupation" value={beneficiary.occupation} />
                <InfoRow label="Household Size" value={beneficiary.householdNumber} />
                <InfoRow label="Annual Income" value={`₱ ${beneficiary.householdAnnualSalary}`} />
              </div>
            </div>

            <div className="card">
              <h3 className="card-title"><MapPin size={20}/> Address</h3>
              {beneficiary.address ? (
                <div className="space-y-4 text-sm">
                  <InfoRow label="Street" value={beneficiary.address.streetNumber} />
                  <InfoRow label="Barangay" value={beneficiary.address.barangay} />
                  <InfoRow label="City" value={beneficiary.address.municipality} />
                  <InfoRow label="Region" value={beneficiary.address.region} />
                </div>
              ) : <p>No address.</p>}
            </div>
          </div>
        )}

        {/* --- DONOR VIEW --- */}
        {donor && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="card">
               <h3 className="card-title"><User size={20}/> Partner Details</h3>
               <div className="space-y-4 text-sm">
                 <InfoRow label="Display Name" value={donor.displayName} />
                 <InfoRow label="Email" value={user.email} />
                 <InfoRow label="Type" value={donor.donorType} />
               </div>
             </div>
             <div className="card">
               <h3 className="card-title"><DollarSign size={20}/> Impact Summary</h3>
               <div className="space-y-4 text-sm">
                 <InfoRow label="Total Donations" value={`₱ ${donor.totalDonation || 0}`} />
                 <InfoRow label="Status" value={user.status} />
               </div>
             </div>
           </div>
        )}

      </main>
      <Footer />
      
      {/* Local Styles for Cards */}
      <style jsx>{`
        .card { @apply bg-white dark:bg-[#0a291a] p-8 rounded-2xl shadow-sm border border-[#004225]/10; }
        .card-title { @apply font-heading text-xl font-bold text-[#004225] dark:text-[#ffb000] mb-6 flex items-center gap-2; }
      `}</style>
    </div>
  );
}

function InfoRow({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-bold text-gray-800 dark:text-gray-200">{value}</span>
    </div>
  );
}

// Wrap with ProtectedRoute for authentication
export default function ProtectedDashboard() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}