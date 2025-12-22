
"use client";


import React, { useState, useEffect } from "react";
import './scrollbar.css';
import { BeneficiaryManagement } from "./components/BeneficiaryManagement";
import { DonorManagement } from "./components/DonorManagement";
import { ProgramManagement } from "./components/ProgramManagement";
import { AnalyticsTrends } from "./components/AnalyticsTrends";
import { ContentManagement } from "./components/ContentManagement";
import DropoffManagement from "./components/DropoffManagement";
import { DashboardStatsCard } from "./components/DashboardStatsCard";
import Modal from "@/components/ui/Modal";
import ProgramModal from "./components/ProgramModal";
import { ActivityLogList } from "./components/ActivityLogList";
import type { DashboardStats, ActivityLog } from "@/services/adminService";
import { adminService } from "@/services/adminService";


const sidebarTabs = [
	{ key: "beneficiary", label: "Beneficiary Management" },
	{ key: "donor", label: "Donor Management" },
	{ key: "program", label: "Program Management" },
	{ key: "analytics", label: "Analytics & Trends" },
	{ key: "content", label: "Content Management" },
];


import { useSearchParams } from 'next/navigation';

function AdminDashboardPage() {
	const searchParams = useSearchParams();
	const [activeTab, setActiveTab] = useState("beneficiary");
	const [donorAccordionOpen, setDonorAccordionOpen] = useState(false);
	const [siteContent, setSiteContent] = useState({ aboutHeading: "", aboutBody: "", aboutImage: "" });
	const [programEntries, setProgramEntries] = useState<any[]>([]);
	const [programModal, setProgramModal] = useState<any | null>(null);
	const [activity, setActivity] = useState<ActivityLog[]>([]);
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [darkMode, setDarkMode] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [modalStat, setModalStat] = useState<any | null>(null);

	useEffect(() => {
		setMounted(true);
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		setDarkMode(prefersDark);
	}, []);

	// Allow linking directly to a specific tab via ?tab=dropoffs (or any tab key)
	useEffect(() => {
		const tabParam = searchParams?.get('tab');
		if (tabParam) setActiveTab(tabParam);
	}, [searchParams]);

	// Keep the donor accordion open when donor or dropoffs tab is active
	useEffect(() => {
		if (activeTab === 'donor' || activeTab === 'dropoffs') {
			setDonorAccordionOpen(true);
		} else {
			setDonorAccordionOpen(false);
		}
	}, [activeTab]);

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

		// fetch programs for admin dashboard list
		(async () => {
			try {
				const programs = await adminService.getPrograms();
				setProgramEntries(programs || []);
			} catch (e) {
				// ignore; non-fatal
			}
		})();
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
				return <ProgramManagement programEntries={programEntries} setProgramModal={(p: any) => setProgramModal(p || {})} />;
			case "analytics":
				return <AnalyticsTrends resourceSummary={[]} trendHighlights={[]} />;
			case "content":
				return <ContentManagement siteContent={siteContent} setSiteContent={setSiteContent} />;
			case "dropoffs":
				return <DropoffManagement />;
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
						{sidebarTabs.map((tab) => {
							if (tab.key === "donor") {
								return (
									<li key={tab.key} className="mb-3">
										<div>
											<button
												onClick={() => setDonorAccordionOpen((o) => !o)}
												aria-expanded={donorAccordionOpen}
												className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-semibold transition-colors ${donorAccordionOpen || activeTab === 'donor' || activeTab === 'dropoffs' ? (darkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-900') : (darkMode ? 'hover:bg-[#1a2a2a]' : 'hover:bg-yellow-50')}`}
											>
												<span>{tab.label}</span>
												<span className={`transform transition-transform ${donorAccordionOpen ? 'rotate-180' : ''}`}>▾</span>
											</button>
											{donorAccordionOpen && (
												<div className="mt-2 ml-2 space-y-2">
												<button onClick={() => { setActiveTab('donor'); }} className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeTab==='donor' ? (darkMode ? 'bg-yellow-900 text-yellow-300 font-bold' : 'bg-yellow-100 text-yellow-900 font-bold') : (darkMode ? 'text-gray-300 hover:bg-[#1a2a2a]' : 'text-gray-700 hover:bg-yellow-50')}`}>Manage Donors</button>
												<button onClick={() => { setActiveTab('dropoffs'); }} className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeTab==='dropoffs' ? (darkMode ? 'bg-yellow-900 text-yellow-300 font-bold' : 'bg-yellow-100 text-yellow-900 font-bold') : (darkMode ? 'text-gray-300 hover:bg-[#1a2a2a]' : 'text-gray-700 hover:bg-yellow-50')}`}>Drop-off Appointments</button>
												</div>
											)}
										</div>
									</li>
								);
							}

							return (
								<li key={tab.key} className="mb-3">
									<button onClick={() => setActiveTab(tab.key)} className={`w-full text-left px-3 py-2 rounded-md font-semibold transition-colors ${activeTab === tab.key ? (darkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-900') : (darkMode ? 'hover:bg-[#1a2a2a]' : 'hover:bg-yellow-50')}`}>{tab.label}</button>
								</li>
							);
						})}
					</ul>
				</nav>
			</aside>
			<main className="ml-64 p-8 transition-colors duration-300">
				<h1 className="text-4xl font-extrabold mb-6 font-heading">{activeTab === 'dropoffs' ? 'Drop-off Appointments' : (sidebarTabs.find(t => t.key === activeTab)?.label || "Admin Dashboard")}</h1>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
					{statsCards.map((stat, idx) => (
						<div key={idx} className="cursor-pointer" onClick={() => setModalStat(stat)}>
							<DashboardStatsCard {...stat} />
						</div>
					))}
				</div>

				{/* Stats modal */}
				<Modal isOpen={!!modalStat} onClose={() => setModalStat(null)} title={modalStat?.title || ''}>
					<div style={{ color: 'var(--card-fg)' }}>
						<p className="text-3xl font-bold mb-4">{modalStat?.value}</p>
						{modalStat?.note && <p className="text-sm text-gray-500 dark:text-gray-300">{modalStat.note}</p>}
						{/* Placeholder: additional details could be fetched/shown here */}
					</div>
				</Modal>
				<div className="mb-10">
					{renderContent()}
				</div>
				<ActivityLogList activity={activity} />

				{/* Program edit/create modal */}
				{programModal !== null && (
					<ProgramModal
						isOpen={!!programModal}
						program={Object.keys(programModal).length === 0 ? null : programModal}
						onClose={() => setProgramModal(null)}
						onSaved={(p: any) => {
							// refresh list and close
							(async () => {
								try {
									const programs = await adminService.getPrograms();
									setProgramEntries(programs || []);
								} catch (e) {}
							})();
							setProgramModal(null);
						}}
					/>
				)}
			</main>
		</div>
	);
}

export default AdminDashboardPage;
