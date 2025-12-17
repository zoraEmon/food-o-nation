"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
/* eslint-disable @next/next/no-img-element */
import { authService } from "@/services/authService";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  LogOut,
  CircleUserRound,
  Shield,
  BarChart3,
  Sun,
  Moon,
} from "lucide-react";
import QrScanner from "qr-scanner";

interface User {
  id: string;
  email: string;
  status: string;
  adminProfile?: {
    firstName: string;
    lastName: string;
  };
  beneficiaryProfile?: unknown;
  donorProfile?: unknown;
}

const resourceSummary = [
  { label: "Food Inventory", used: 68, color: "bg-goldenyellow" },
  { label: "Funds Allocated", used: 52, color: "bg-amber-400" },
  { label: "Volunteers Scheduled", used: 81, color: "bg-emerald-300" },
];

const trendHighlights = [
  { title: "Donations", value: "+18%", note: "vs. last month", tone: "text-emerald-200" },
  { title: "Approvals", value: "+7%", note: "faster onboarding", tone: "text-emerald-200" },
  { title: "Requests", value: "-5%", note: "open tickets", tone: "text-amber-200" },
  { title: "Fulfillment", value: "92%", note: "on-time deliveries", tone: "text-emerald-200" },
];

const beneficiaryApplications = [
  {
    name: "Aisha Bello",
    date: "Dec 02, 2025",
    portrait: "/placeholder-profile.png",
    details: "Household of 5, located in Kano. Needs monthly rice and beans support.",
    location: "Kano, NG",
    phone: "+234 801 234 5678",
    householdSize: 5,
    income: "Below NGN 80,000 / month",
  },
  {
    name: "John Okafor",
    date: "Dec 05, 2025",
    portrait: "/placeholder-profile.png",
    details: "Single parent, 2 children. Seeking school meal assistance.",
    location: "Lagos, NG",
    phone: "+234 809 876 5432",
    householdSize: 3,
    income: "Below NGN 120,000 / month",
  },
];

const officialBeneficiaries = [
  {
    name: "Maryam Yusuf",
    date: "Approved Nov 15, 2025",
    portrait: "/placeholder-profile.png",
    details: "Receives staple basket bi-weekly, school meals for 1 child.",
    location: "Abuja, NG",
    phone: "+234 802 345 6789",
    householdSize: 4,
    income: "Below NGN 100,000 / month",
  },
  {
    name: "Samuel James",
    date: "Approved Oct 28, 2025",
    portrait: "/placeholder-profile.png",
    details: "Elderly, requires home delivery of essentials.",
    location: "Port Harcourt, NG",
    phone: "+234 803 111 2222",
    householdSize: 1,
    income: "Pension-dependent",
  },
];

const donorApplications = [
  {
    name: "Hope Foods Ltd.",
    date: "Dec 03, 2025",
    portrait: "/placeholder-profile.png",
    details: "Corporate donor focusing on grains. Interested in quarterly commitments.",
    location: "Lagos, NG",
    phone: "+234 700 111 0000",
    donationFocus: "Grains & staples",
  },
  {
    name: "Kind Hearts Foundation",
    date: "Dec 06, 2025",
    portrait: "/placeholder-profile.png",
    details: "NGO partner offering logistics support and packaged meals.",
    location: "Abuja, NG",
    phone: "+234 701 222 3333",
    donationFocus: "Prepared meals, logistics",
  },
];

const officialDonors = [
  {
    name: "AgroServe PLC",
    date: "Partner since Sep 2025",
    portrait: "/placeholder-profile.png",
    details: "Provides 200kg grains monthly; supports warehouse staffing.",
    location: "Kano, NG",
    phone: "+234 800 555 1212",
    donationFocus: "Grains, staffing",
  },
  {
    name: "Riverbank Church",
    date: "Partner since Aug 2025",
    portrait: "/placeholder-profile.png",
    details: "Funds weekend feeding programs and volunteers for delivery.",
    location: "Port Harcourt, NG",
    phone: "+234 811 444 7777",
    donationFocus: "Funds, volunteers",
  },
];

const dropOffAppointments = [
  { what: "50kg Rice (10 bags)", when: "Dec 10, 2025 — 2:00 PM", location: "Warehouse A - Lagos", contact: "AgroServe PLC" },
  { what: "Canned Beans (200 units)", when: "Dec 12, 2025 — 11:00 AM", location: "Warehouse B - Abuja", contact: "Hope Foods Ltd." },
  { what: "Fresh Produce (mixed crates)", when: "Dec 14, 2025 — 9:30 AM", location: "Community Hub - Kano", contact: "Kind Hearts Foundation" },
];

const initialPrograms = [
  {
    id: "prog-1",
    title: "Winter Relief Drive",
    summary: "Seasonal food baskets and warm meal stations across key hubs.",
    maxBeneficiaries: 250,
    maxDonorStalls: 12,
    beneficiaries: ["Maryam Yusuf", "Samuel James"],
    donorStalls: ["AgroServe PLC"],
  },
  {
    id: "prog-2",
    title: "School Meals Pilot",
    summary: "Daily lunches for public primary schools in Lagos and Abuja.",
    maxBeneficiaries: 400,
    maxDonorStalls: 8,
    beneficiaries: ["Maryam Yusuf"],
    donorStalls: ["Riverbank Church"],
  },
];

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<"beneficiary" | "donor" | "program" | "analytics" | "content">("beneficiary");
  const [beneficiarySubtab, setBeneficiarySubtab] = useState<"applications" | "official">("applications");
  const [donorSubtab, setDonorSubtab] = useState<"applications" | "official" | "appointments">("applications");
  const [detailModal, setDetailModal] = useState<null | {
    title: string;
    name: string;
    portrait?: string;
    details: string;
    meta?: Record<string, string | number>;
  }>(null);
  const [programEntries, setProgramEntries] = useState(initialPrograms);
  const [programModal, setProgramModal] = useState<null | (typeof initialPrograms)[number]>(null);
  const [selectedProgramBeneficiary, setSelectedProgramBeneficiary] = useState("");
  const [selectedProgramDonor, setSelectedProgramDonor] = useState("");
  const [siteContent, setSiteContent] = useState({
    aboutHeading: "About Us",
    aboutBody:
      "We distribute nutritious food to vulnerable households, partnering with local donors and volunteers to keep communities nourished.",
    aboutImage:
      "https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?auto=format&fit=crop&w=800&q=80",
  });
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [qrScanType, setQrScanType] = useState<"beneficiary" | "donor" | null>(null);
  const [qrResult, setQrResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<{
    start: () => Promise<void>;
    stop: () => void;
    destroy: () => void;
  } | null>(null);
  const router = useRouter();

  const openScanner = (type: "beneficiary" | "donor") => {
    setQrResult(null);
    setQrScanType(type);
    setQrScannerOpen(true);
  };

  const closeScanner = () => {
    setQrScannerOpen(false);
    setQrScanType(null);
  };

  useEffect(() => {
    if (!qrScannerOpen) {
      scannerRef.current?.stop();
      scannerRef.current?.destroy();
      scannerRef.current = null;
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const scanner = new QrScanner(
      video,
      (result: { data: string }) => {
        setQrResult(result.data);
        scanner.stop();
      },
      { highlightScanRegion: true, highlightCodeOutline: true }
    );

    scannerRef.current = scanner;
    scanner
      .start()
      .catch((err: unknown) => {
        console.error("Failed to start QR scanner", err);
        setQrResult("Camera unavailable or permission denied.");
      });

    return () => {
      scanner.stop();
      scanner.destroy();
    };
  }, [qrScannerOpen]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const currentUser = await authService.getMe();
        if (!currentUser || !currentUser.adminProfile) {
          authService.logout();
          router.push("/");
          return;
        }
        setUser(currentUser as User);
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

  useEffect(() => {
    const savedTheme = localStorage.getItem("adminTheme");
    if (savedTheme === "light") {
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      localStorage.setItem("adminTheme", newValue ? "dark" : "light");
      return newValue;
    });
  };

  const bgMain = isDarkMode ? "bg-[#0d3d2a]" : "bg-[#FAF7F0]";
  const bgSidebar = isDarkMode ? "bg-[#0d3d2a]" : "bg-[#0a7a4a]";
  const bgCard = isDarkMode ? "bg-[#0f4f34]" : "bg-white";
  const textPrimary = isDarkMode ? "text-gray-100" : "text-[#0b2e1c]";
  const textSecondary = isDarkMode ? "text-gray-200" : "text-[#1f3d2b]";
  const textMuted = isDarkMode ? "text-gray-400" : "text-[#2f5f46]";
  const borderColor = isDarkMode ? "border-gray-700" : "border-gray-200";
  const headingFont = "font-[var(--font-heading)]";
  const bodyFont = "font-[var(--font-sans)]";

  const openDetails = (payload: {
    title: string;
    name: string;
    portrait?: string;
    details: string;
    meta?: Record<string, string | number>;
  }) => setDetailModal(payload);

  const closeDetails = () => setDetailModal(null);

  const handleLogout = () => {
    authService.logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgMain} ${textPrimary} ${bodyFont}`}>
        Loading Admin Dashboard...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const sidebarTabs = [
    { key: "beneficiary", label: "Beneficiary Management", icon: Users },
    { key: "donor", label: "Donor Management", icon: Users },
    { key: "program", label: "Program Management", icon: LayoutDashboard },
    { key: "analytics", label: "Resource & Trend Analytics", icon: BarChart3 },
    { key: "content", label: "Content Management", icon: ClipboardList },
  ] as const;

  const activeTabLabel = sidebarTabs.find((t) => t.key === activeTab)?.label ?? "Admin Dashboard";

  const saveProgramModal = () => {
    if (!programModal) return;
    setProgramEntries((prev) => prev.map((p) => (p.id === programModal.id ? programModal : p)));
    setProgramModal(null);
    setSelectedProgramBeneficiary("");
    setSelectedProgramDonor("");
  };

  const addBeneficiaryToProgram = () => {
    if (!programModal || !selectedProgramBeneficiary) return;
    if (programModal.beneficiaries.includes(selectedProgramBeneficiary)) return;
    setProgramModal({
      ...programModal,
      beneficiaries: [...programModal.beneficiaries, selectedProgramBeneficiary],
    });
    setSelectedProgramBeneficiary("");
  };

  const removeBeneficiaryFromProgram = (name: string) => {
    if (!programModal) return;
    setProgramModal({
      ...programModal,
      beneficiaries: programModal.beneficiaries.filter((b) => b !== name),
    });
  };

  const addDonorToProgram = () => {
    if (!programModal || !selectedProgramDonor) return;
    if (programModal.donorStalls.includes(selectedProgramDonor)) return;
    setProgramModal({
      ...programModal,
      donorStalls: [...programModal.donorStalls, selectedProgramDonor],
    });
    setSelectedProgramDonor("");
  };

  const removeDonorFromProgram = (name: string) => {
    if (!programModal) return;
    setProgramModal({
      ...programModal,
      donorStalls: programModal.donorStalls.filter((d) => d !== name),
    });
  };

  const availableBeneficiaries = programModal
    ? officialBeneficiaries
        .map((b) => b.name)
        .filter((name) => !programModal.beneficiaries.includes(name))
    : [];

  const availableDonors = programModal
    ? officialDonors
        .map((d) => d.name)
        .filter((name) => !programModal.donorStalls.includes(name))
    : [];

  const renderContent = () => {
    switch (activeTab) {
      case "beneficiary":
        return (
          <div className={`${bgCard} p-6 rounded-lg shadow-md border ${borderColor}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h3 className={`text-2xl font-semibold text-[#FFB000] ${headingFont}`}>Beneficiary Management</h3>
                <p className={`${textSecondary} text-sm`}>Review applications and manage approved beneficiaries.</p>
              </div>
              <div className="flex gap-2">
                {[{ key: "applications", label: "Application Review" }, { key: "official", label: "Official Beneficiaries" }].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setBeneficiarySubtab(tab.key as typeof beneficiarySubtab)}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                      beneficiarySubtab === tab.key ? "bg-[#FFB000] text-[#004225]" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {beneficiarySubtab === "applications" && (
              <div className={`overflow-hidden rounded-lg border ${borderColor} bg-white/5`}>
                <div className="grid grid-cols-3 text-sm font-semibold text-white border-b border-gray-700 px-4 py-3">
                  <span>Applicant</span>
                  <span>Date Applied</span>
                  <span className="text-right">Actions</span>
                </div>
                {beneficiaryApplications.map((app) => (
                  <div key={app.name} className="grid grid-cols-3 items-center px-4 py-3 text-sm text-gray-200 border-b border-gray-800 last:border-b-0">
                    <button
                      onClick={() =>
                        openDetails({
                          title: "Beneficiary Application",
                          name: app.name,
                          portrait: app.portrait,
                          details: app.details,
                          meta: {
                            "Date Applied": app.date,
                            Location: app.location,
                            Phone: app.phone,
                            "Household Size": app.householdSize,
                            Income: app.income,
                          },
                        })
                      }
                      className="text-goldenyellow font-semibold hover:underline text-left"
                    >
                      {app.name}
                    </button>
                    <span>{app.date}</span>
                    <div className="flex justify-end gap-2">
                      <button className="px-3 py-1 rounded-md bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600">Accept</button>
                      <button className="px-3 py-1 rounded-md bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {beneficiarySubtab === "official" && (
              <div className={`overflow-hidden rounded-lg border ${borderColor} bg-white/5`}>
                <div className="grid grid-cols-3 text-sm font-semibold text-white border-b border-gray-700 px-4 py-3">
                  <span>Beneficiary</span>
                  <span>Status / Since</span>
                  <span className="text-right">Actions</span>
                </div>
                {officialBeneficiaries.map((bene) => (
                  <div key={bene.name} className="grid grid-cols-3 items-center px-4 py-3 text-sm text-gray-200 border-b border-gray-800 last:border-b-0">
                    <button
                      onClick={() =>
                        openDetails({
                          title: "Official Beneficiary",
                          name: bene.name,
                          portrait: bene.portrait,
                          details: bene.details,
                          meta: {
                            "Approved / Since": bene.date,
                            Location: bene.location,
                            Phone: bene.phone,
                            "Household Size": bene.householdSize,
                            Income: bene.income,
                          },
                        })
                      }
                      className="text-goldenyellow font-semibold hover:underline text-left"
                    >
                      {bene.name}
                    </button>
                    <span>{bene.date}</span>
                    <div className="flex justify-end">
                      <button className="px-3 py-1 rounded-md bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "donor":
        return (
          <div className={`${bgCard} p-6 rounded-lg shadow-md border ${borderColor}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h3 className={`text-2xl font-semibold text-[#FFB000] ${headingFont}`}>Donor Management</h3>
                <p className={`${textSecondary} text-sm`}>Evaluate donor applications, manage partners, and monitor drop-offs.</p>
              </div>
              <div className="flex gap-2">
                {[{ key: "applications", label: "Application Review" }, { key: "official", label: "Official Donors" }, { key: "appointments", label: "Drop-off Appointments" }].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setDonorSubtab(tab.key as typeof donorSubtab)}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                      donorSubtab === tab.key ? "bg-goldenyellow text-gray-900" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {donorSubtab === "applications" && (
              <div className={`overflow-hidden rounded-lg border ${borderColor} bg-white/5`}>
                <div className="grid grid-cols-3 text-sm font-semibold text-white border-b border-gray-700 px-4 py-3">
                  <span>Donor</span>
                  <span>Date Applied</span>
                  <span className="text-right">Actions</span>
                </div>
                {donorApplications.map((app) => (
                  <div key={app.name} className="grid grid-cols-3 items-center px-4 py-3 text-sm text-gray-200 border-b border-gray-800 last:border-b-0">
                    <button
                      onClick={() =>
                        openDetails({
                          title: "Donor Application",
                          name: app.name,
                          portrait: app.portrait,
                          details: app.details,
                          meta: {
                            "Date Applied": app.date,
                            Location: app.location,
                            Phone: app.phone,
                            "Donation Focus": app.donationFocus,
                          },
                        })
                      }
                      className="text-goldenyellow font-semibold hover:underline text-left"
                    >
                      {app.name}
                    </button>
                    <span>{app.date}</span>
                    <div className="flex justify-end gap-2">
                      <button className="px-3 py-1 rounded-md bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600">Accept</button>
                      <button className="px-3 py-1 rounded-md bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {donorSubtab === "official" && (
              <div className={`overflow-hidden rounded-lg border ${borderColor} bg-white/5`}>
                <div className="grid grid-cols-3 text-sm font-semibold text-white border-b border-gray-700 px-4 py-3">
                  <span>Donor</span>
                  <span>Status / Since</span>
                  <span className="text-right">Actions</span>
                </div>
                {officialDonors.map((donor) => (
                  <div key={donor.name} className="grid grid-cols-3 items-center px-4 py-3 text-sm text-gray-200 border-b border-gray-800 last:border-b-0">
                    <button
                      onClick={() =>
                        openDetails({
                          title: "Official Donor",
                          name: donor.name,
                          portrait: donor.portrait,
                          details: donor.details,
                          meta: {
                            "Partner Since": donor.date,
                            Location: donor.location,
                            Phone: donor.phone,
                            "Donation Focus": donor.donationFocus,
                          },
                        })
                      }
                      className="text-goldenyellow font-semibold hover:underline text-left"
                    >
                      {donor.name}
                    </button>
                    <span>{donor.date}</span>
                    <div className="flex justify-end">
                      <button className="px-3 py-1 rounded-md bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {donorSubtab === "appointments" && (
              <div className={`overflow-hidden rounded-lg border ${borderColor} bg-white/5`}>
                <div className="grid grid-cols-4 text-sm font-semibold text-white border-b border-gray-700 px-4 py-3">
                  <span>What</span>
                  <span>When</span>
                  <span>Location</span>
                  <span className="text-right">Contact</span>
                </div>
                {dropOffAppointments.map((appt) => (
                  <div key={`${appt.what}-${appt.when}`} className="grid grid-cols-4 items-center px-4 py-3 text-sm text-gray-200 border-b border-gray-800 last:border-b-0">
                    <span>{appt.what}</span>
                    <span>{appt.when}</span>
                    <span>{appt.location}</span>
                    <span className="text-right">{appt.contact}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "program":
        return (
          <div className={`${bgCard} p-6 rounded-lg shadow-md border ${borderColor}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h3 className={`text-2xl font-semibold text-[#FFB000] ${headingFont}`}>Program Management</h3>
                <p className={`${textSecondary} text-sm`}>View programs, adjust capacity, and manage assigned beneficiaries and donor stalls.</p>
              </div>
            </div>

            <div className={`overflow-hidden rounded-lg border ${borderColor} bg-white/5`}>
              <div className="grid grid-cols-3 text-sm font-semibold text-white border-b border-gray-700 px-4 py-3">
                <span>Program</span>
                <span>Summary</span>
                <span className="text-right">Actions</span>
              </div>
              {programEntries.map((program) => (
                <div key={program.id} className="grid grid-cols-3 items-center px-4 py-3 text-sm text-gray-200 border-b border-gray-800 last:border-b-0">
                  <button onClick={() => setProgramModal(program)} className="text-goldenyellow font-semibold hover:underline text-left">
                    {program.title}
                  </button>
                  <span className="text-gray-300 truncate">{program.summary}</span>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setProgramModal(program)}
                      className="px-3 py-1 rounded-md bg-white/10 text-white text-xs font-semibold hover:bg-white/20"
                    >
                      View / Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "content":
        return (
          <div className={`${bgCard} p-6 rounded-lg shadow-md border ${borderColor}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h3 className={`text-2xl font-semibold text-[#FFB000] ${headingFont}`}>Content Management</h3>
                <p className={`${textSecondary} text-sm`}>Edit client-facing copy and imagery for the About section.</p>
              </div>
              <span className="text-xs text-gray-300 bg-white/5 border border-gray-700 rounded-md px-3 py-1">Local preview</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-sm text-gray-300 flex flex-col gap-2">
                  Section Heading
                  <input
                    type="text"
                    value={siteContent.aboutHeading}
                    onChange={(e) => setSiteContent((prev) => ({ ...prev, aboutHeading: e.target.value }))}
                    className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-goldenyellow"
                  />
                </label>
                <label className="text-sm text-gray-300 flex flex-col gap-2">
                  Body Copy
                  <textarea
                    value={siteContent.aboutBody}
                    onChange={(e) => setSiteContent((prev) => ({ ...prev, aboutBody: e.target.value }))}
                    rows={6}
                    className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-goldenyellow resize-none"
                  />
                </label>
                <label className="text-sm text-gray-300 flex flex-col gap-2">
                  Image URL
                  <input
                    type="url"
                    value={siteContent.aboutImage}
                    onChange={(e) => setSiteContent((prev) => ({ ...prev, aboutImage: e.target.value }))}
                    className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-goldenyellow"
                  />
                </label>
              </div>

              <div className="border border-gray-700 rounded-lg bg-white/5 overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-goldenyellow">Preview</h4>
                  <span className="text-xs text-gray-400">About Us section</span>
                </div>
                <div className="p-4 space-y-4">
                  <div className="aspect-video w-full rounded-md overflow-hidden bg-gray-800 border border-gray-700">
                    {siteContent.aboutImage ? (
                      <img src={siteContent.aboutImage} alt="About section" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">Image preview</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-xl font-semibold text-white">{siteContent.aboutHeading || "About Us"}</h5>
                    <p className="text-gray-200 text-sm leading-relaxed">
                      {siteContent.aboutBody || "Enter body copy to update the About section."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-300 bg-white/5 border border-gray-700 rounded-md p-4">
              <p className="font-semibold text-goldenyellow mb-1">Notes</p>
              <p>Values are stored locally for now. Wire this form to your API or CMS to persist updates to the live site.</p>
            </div>
          </div>
        );
      case "analytics":
      default:
        return (
          <>
            <div className={`${bgCard} p-6 rounded-lg shadow-md border ${borderColor}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h3 className={`text-2xl font-semibold text-[#FFB000] ${headingFont}`}>Resource Utilization</h3>
                <p className={`${textSecondary} text-sm`}>How core resources are being consumed this week</p>
              </div>
              <div className="grid gap-4">
                {resourceSummary.map((item) => (
                  <div key={item.label} className={`bg-white/5 border ${borderColor} rounded-md p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">{item.label}</span>
                      <span className="text-goldenyellow font-bold">{item.used}%</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                      <div className={`${item.color} h-3`} style={{ width: `${item.used}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`${bgCard} lg:col-span-2 p-6 rounded-lg shadow-md border ${borderColor}`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <h3 className={`text-2xl font-semibold text-[#FFB000] ${headingFont}`}>Trend Analytics</h3>
                  <p className={`${textSecondary} text-sm`}>Recent movement across key KPIs</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {trendHighlights.map((trend) => (
                    <div key={trend.title} className={`bg-white/5 border ${borderColor} rounded-md p-4`}>
                      <p className="text-gray-200 text-sm uppercase tracking-wide">{trend.title}</p>
                      <p className={`text-3xl font-bold mt-2 ${trend.tone}`}>{trend.value}</p>
                      <p className="text-gray-300 text-sm mt-1">{trend.note}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`${bgCard} p-6 rounded-lg shadow-md border ${borderColor}`}>
                <h4 className={`text-xl font-semibold text-[#FFB000] mb-4 ${headingFont}`}>Alerts & Insights</h4>
                <ul className={`space-y-3 ${textSecondary} text-sm`}>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-amber-300" />
                    Stock for rice drops below buffer in 2 regions.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
                    Volunteer engagement up 12% after outreach campaign.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-amber-300" />
                    Donation processing time trending higher on Fridays.
                  </li>
                </ul>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className={`flex min-h-screen ${bgMain} ${textPrimary} ${bodyFont} relative transition-colors duration-300`}>
      <aside className={`fixed inset-y-0 left-0 w-64 ${bgSidebar} p-6 shadow-lg border-r border-[#FFB000] flex flex-col transition-colors duration-300 ${bodyFont}`}>
        <div className="flex items-center mb-10">
          <Shield className="w-8 h-8 text-[#FFB000] mr-3" />
          <h2 className="text-2xl font-bold text-gray-50">Admin Panel</h2>
        </div>
        <nav className="grow">
          <ul>
            {sidebarTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <li key={tab.key} className="mb-3">
                  <button
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center text-left rounded-md px-3 py-2 transition-colors duration-200 ${
                      isActive ? "bg-white/10 text-[#FFB000]" : "text-white hover:text-[#FFB000] hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto space-y-4">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-md transition duration-200 gap-2"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-5 h-5" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          <div className="flex items-center text-white">
            <CircleUserRound className="w-6 h-6 mr-3 text-[#FFB000]" />
            <span>
              {user.adminProfile?.firstName} {user.adminProfile?.lastName}
            </span>
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

      <main className="ml-64 p-8 overflow-y-auto">
        <h1 className={`text-4xl font-extrabold mb-6 ${headingFont} ${isDarkMode ? "text-[#FFB000]" : "text-[#004225]"}`}>
          {activeTabLabel}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={`${bgCard} p-6 rounded-lg shadow-md border ${borderColor}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold text-[#FFB000] ${headingFont}`}>Total Users</h3>
              <Users className="w-8 h-8 text-[#FFB000]" />
            </div>
            <p className={`text-5xl font-bold ${textPrimary}`}>1,234</p>
            <p className={`${textMuted} text-sm mt-2`}>Registered across all roles</p>
          </div>

          <div className={`${bgCard} p-6 rounded-lg shadow-md border ${borderColor}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold text-[#FFB000] ${headingFont}`}>Pending Approvals</h3>
              <ClipboardList className="w-8 h-8 text-yellow-400" />
            </div>
            <p className={`text-5xl font-bold ${textPrimary}`}>45</p>
            <p className={`${textMuted} text-sm mt-2`}>Beneficiaries and Donors awaiting review</p>
          </div>

          <div className={`${bgCard} p-6 rounded-lg shadow-md border ${borderColor}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold text-[#FFB000] ${headingFont}`}>Active Programs</h3>
              <LayoutDashboard className="w-8 h-8 text-[#FFB000]" />
            </div>
            <p className={`text-5xl font-bold ${textPrimary}`}>12</p>
            <p className={`${textMuted} text-sm mt-2`}>Currently running food aid programs</p>
          </div>
        </div>

        <div className="mt-10 space-y-8">{renderContent()}</div>

        <div className={`${bgCard} mt-10 p-6 rounded-lg shadow-md border ${borderColor}`}>
          <h3 className={`text-2xl font-semibold text-[#FFB000] mb-4 ${headingFont}`}>Recent Activity</h3>
          <ul className="space-y-3">
            <li className={textMuted}>[Timestamp] User John Doe registered as Beneficiary.</li>
            <li className={textMuted}>[Timestamp] Donation from XYZ Corp for &quot;Winter Drive&quot; program.</li>
            <li className={textMuted}>[Timestamp] Admin Jane Smith approved 3 pending users.</li>
          </ul>
        </div>
      </main>

      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl p-6 relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase text-gray-400">{detailModal.title}</p>
                <h3 className={`text-2xl font-semibold text-goldenyellow ${headingFont}`}>{detailModal.name}</h3>
              </div>
              <button onClick={closeDetails} className="text-gray-400 hover:text-white transition" aria-label="Close details">
                ✕
              </button>
            </div>

            <div className="mt-4 flex flex-col md:flex-row gap-4">
              <div className="w-28 h-28 rounded-lg bg-white/5 border border-gray-700 flex items-center justify-center overflow-hidden">
                <span className="text-gray-500 text-sm">Portrait</span>
              </div>
              <div className="flex-1 space-y-2 text-sm text-gray-200">
                {detailModal.meta &&
                  Object.entries(detailModal.meta).map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-white font-semibold">{value}</span>
                    </div>
                  ))}
                <div className="pt-2 border-t border-gray-800">
                  <p className="text-gray-300 whitespace-pre-line">{detailModal.details}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {programModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden p-8 relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase text-gray-400">Program Details</p>
                <h3 className={`text-2xl font-semibold text-goldenyellow ${headingFont}`}>{programModal.title}</h3>
                <p className="text-gray-300 mt-1">{programModal.summary}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveProgramModal}
                  className="px-4 py-2 rounded-md bg-goldenyellow text-gray-900 font-semibold hover:bg-yellow-300"
                >
                  Save
                </button>
                <button onClick={() => setProgramModal(null)} className="text-gray-400 hover:text-white transition" aria-label="Close program modal">
                  ✕
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm text-gray-300 flex flex-col gap-2">
                Max Beneficiaries
                <input
                  type="number"
                  min={0}
                  value={programModal.maxBeneficiaries}
                  onChange={(e) => setProgramModal({ ...programModal, maxBeneficiaries: Number(e.target.value) || 0 })}
                  className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-goldenyellow"
                />
              </label>
              <label className="text-sm text-gray-300 flex flex-col gap-2">
                Max Donor Stalls
                <input
                  type="number"
                  min={0}
                  value={programModal.maxDonorStalls}
                  onChange={(e) => setProgramModal({ ...programModal, maxDonorStalls: Number(e.target.value) || 0 })}
                  className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-goldenyellow"
                />
              </label>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-1" style={{ maxHeight: "50vh" }}>
              <div className="border border-gray-800 rounded-lg p-4 bg-white/5 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`text-lg font-semibold text-goldenyellow ${headingFont}`}>Beneficiaries</h4>
                  <div className="flex gap-2">
                    <select
                      value={selectedProgramBeneficiary}
                      onChange={(e) => setSelectedProgramBeneficiary(e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-sm text-white"
                    >
                      <option value="">Add from approved list</option>
                      {availableBeneficiaries.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={addBeneficiaryToProgram}
                      className="px-3 py-1 rounded-md bg-goldenyellow text-gray-900 text-xs font-semibold hover:bg-yellow-300"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-200 max-h-52 overflow-y-auto pr-1">
                  {programModal.beneficiaries.length === 0 && <li className="text-gray-400">No beneficiaries assigned yet.</li>}
                  {programModal.beneficiaries.map((name) => (
                    <li key={name} className="flex items-center justify-between bg-white/5 border border-gray-800 rounded-md px-3 py-2">
                      <span>{name}</span>
                      <button onClick={() => removeBeneficiaryFromProgram(name)} className="text-xs text-red-400 hover:text-red-200">
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-gray-800 rounded-lg p-4 bg-white/5 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`text-lg font-semibold text-goldenyellow ${headingFont}`}>Donor Stalls</h4>
                  <div className="flex gap-2">
                    <select
                      value={selectedProgramDonor}
                      onChange={(e) => setSelectedProgramDonor(e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-sm text-white"
                    >
                      <option value="">Add from donor list</option>
                      {availableDonors.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={addDonorToProgram}
                      className="px-3 py-1 rounded-md bg-goldenyellow text-gray-900 text-xs font-semibold hover:bg-yellow-300"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-200 max-h-52 overflow-y-auto pr-1">
                  {programModal.donorStalls.length === 0 && <li className="text-gray-400">No donor stalls assigned yet.</li>}
                  {programModal.donorStalls.map((name) => (
                    <li key={name} className="flex items-center justify-between bg-white/5 border border-gray-800 rounded-md px-3 py-2">
                      <span>{name}</span>
                      <button onClick={() => removeDonorFromProgram(name)} className="text-xs text-red-400 hover:text-red-200">
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-white/5 border border-gray-800 rounded-lg p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-goldenyellow font-semibold">Quick QR Intake</p>
                <p className="text-sm text-gray-300">Scan applications directly from the field using the appropriate code.</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <button
                  onClick={() => openScanner("beneficiary")}
                  className="px-4 py-2 rounded-md bg-goldenyellow text-gray-900 text-sm font-semibold hover:bg-yellow-300 transition"
                >
                  Scan Beneficiary QR
                </button>
                <button
                  onClick={() => openScanner("donor")}
                  className="px-4 py-2 rounded-md bg-white/10 text-white text-sm font-semibold border border-gray-700 hover:bg-white/20 transition"
                >
                  Scan Donor QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {qrScannerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-3xl p-6 relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase text-gray-400">QR Scanner</p>
                <h3 className={`text-2xl font-semibold text-goldenyellow ${headingFont}`}>
                  {qrScanType === "beneficiary" ? "Beneficiary Application" : "Donor Stall Request"}
                </h3>
                <p className="text-gray-300 mt-1">Grant camera permission and align the code within the frame.</p>
              </div>
              <button onClick={closeScanner} className="text-gray-400 hover:text-white transition text-xl" aria-label="Close QR scanner">
                ✕
              </button>
            </div>

            <div className="mt-4 aspect-video w-full rounded-md overflow-hidden bg-gray-800 border border-gray-700">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
            </div>

            <div className="mt-3 text-sm text-gray-200">
              {qrResult ? (
                <div className="flex items-start gap-2">
                  <span className="text-emerald-300 font-semibold">Result:</span>
                  <span className="break-all">{qrResult}</span>
                </div>
              ) : (
                <p className="text-gray-400">Point the camera at a QR code to capture the data.</p>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setQrResult(null);
                  scannerRef.current?.start().catch((err: unknown) => {
                    console.error("Failed to restart QR scanner", err);
                    setQrResult("Camera unavailable or permission denied.");
                  });
                }}
                className="px-4 py-2 rounded-md bg-white/10 text-white text-sm font-semibold border border-gray-700 hover:bg-white/20 transition"
              >
                Restart Scan
              </button>
              <button onClick={closeScanner} className="px-4 py-2 rounded-md bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
