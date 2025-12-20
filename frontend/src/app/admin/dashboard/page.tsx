
"use client";


import React, { useState, useEffect } from "react";
import { BeneficiaryManagement } from "./components/BeneficiaryManagement";
import { DonorManagement } from "./components/DonorManagement";
import { ProgramManagement } from "./components/ProgramManagement";
import { AnalyticsTrends } from "./components/AnalyticsTrends";
import { ContentManagement } from "./components/ContentManagement";
import { DashboardStatsCard } from "./components/DashboardStatsCard";
import { ActivityLogList } from "./components/ActivityLogList";
import { adminService } from "@/services/adminService";


const sidebarTabs = [
	{ key: "beneficiary", label: "Beneficiary Management" },
	{ key: "donor", label: "Donor Management" },
	{ key: "program", label: "Program Management" },
	{ key: "analytics", label: "Analytics & Trends" },
	{ key: "content", label: "Content Management" },
];


function AdminDashboardPage() {
	const [activeTab, setActiveTab] = useState("beneficiary");
	const [siteContent, setSiteContent] = useState({ aboutHeading: "", aboutBody: "", aboutImage: "" });
	const [programEntries, setProgramEntries] = useState([]);
	const [activity, setActivity] = useState([]);
	const [stats, setStats] = useState(null);
	const [darkMode, setDarkMode] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		setDarkMode(prefersDark);
	}, []);

	useEffect(() => {
		if (mounted) {
			document.documentElement.classList.toggle('dark', darkMode);
		}
	}, [darkMode, mounted]);

	useEffect(() => {
		async function fetchDashboardData() {
			try {
				const [statsRes, activityRes] = await Promise.all([
					adminService.getDashboardStats(),
					adminService.getRecentActivity(10),
				]);
				setStats(statsRes);
				setActivity(activityRes);
			} catch {}
		}
		fetchDashboardData();
	}, []);

	const statsCards = stats ? [
		{ title: "Total Users", value: stats.totalUsers, icon: () => <span>👤</span>, note: "Registered across all roles" },
		{ title: "Pending Approvals", value: stats.pendingUsers, icon: () => <span>⏳</span>, note: "Beneficiaries and Donors awaiting review", tone: "text-yellow-400" },
		{ title: "All Programs", value: stats.allPrograms, icon: () => <span>📦</span>, note: "Total food aid programs" },
		{ title: "Monetary Donations", value: `₱${stats.totalMonetaryDonations}`, icon: () => <span>💰</span>, note: "Total verified donations", tone: "text-emerald-400" },
	] : [];

	const renderContent = () => {
		switch (activeTab) {
			case "beneficiary":
				return <BeneficiaryManagement />;
			case "donor":
				return <DonorManagement />;
			case "program":
				return <ProgramManagement programEntries={programEntries} setProgramModal={() => {}} />;
			case "analytics":
				return <AnalyticsTrends resourceSummary={[]} trendHighlights={[]} />;
			case "content":
				return <ContentManagement siteContent={siteContent} setSiteContent={setSiteContent} />;
			default:
				return null;
		}
	};

	return (
		<div className={`admin-dashboard-container min-h-screen font-body transition-colors duration-300 ${darkMode ? 'dark bg-[#051A10] text-[#e2e8f0]' : 'bg-[#FAF7F0] text-[#1c1c1c]'}`}>
			<aside className={`fixed left-0 top-0 h-full w-64 p-6 shadow-lg border-r transition-colors duration-300 ${darkMode ? 'bg-[#0a291a] border-yellow-700' : 'bg-[#fff] border-yellow-500'}`}> 
				<div className="flex items-center justify-between mb-8">
					<h2 className="text-2xl font-bold font-heading">Admin Panel</h2>
					{mounted ? (
						<button
							aria-label="Toggle dark mode"
							className="rounded-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#16202a] hover:bg-gray-100 dark:hover:bg-[#1a2a2a] transition"
							onClick={() => setDarkMode((d) => !d)}
						>
							{darkMode ? (
								<span role="img" aria-label="Light mode">🌞</span>
							) : (
								<span role="img" aria-label="Dark mode">🌙</span>
							)}
						</button>
					) : (
						<span className="rounded-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#16202a] text-xl opacity-0">🌙</span>
					)}
				</div>
				<nav className="flex-1">
					<ul>
						{sidebarTabs.map((tab) => (
							<li key={tab.key} className="mb-3">
								<button
									onClick={() => setActiveTab(tab.key)}
									className={`w-full text-left px-3 py-2 rounded-md font-semibold transition-colors ${activeTab === tab.key ? (darkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-900') : (darkMode ? 'hover:bg-[#1a2a2a]' : 'hover:bg-yellow-50')}`}
								>
									{tab.label}
								</button>
							</li>
						))}
					</ul>
				</nav>
			</aside>
			<main className="ml-64 p-8 transition-colors duration-300">
				<h1 className="text-4xl font-extrabold mb-6 font-heading">{sidebarTabs.find(t => t.key === activeTab)?.label || "Admin Dashboard"}</h1>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
					{statsCards.map((stat, idx) => (
						<DashboardStatsCard key={idx} {...stat} />
					))}
				</div>
				<div className="mb-10">
					{renderContent()}
				</div>
				<ActivityLogList activity={activity} />
			</main>
		</div>
	);
}

export default AdminDashboardPage;
