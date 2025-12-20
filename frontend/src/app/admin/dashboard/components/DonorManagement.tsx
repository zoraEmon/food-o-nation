import React, { useState, useEffect } from "react";import { useNotification } from '@/components/ui/NotificationProvider';import { adminService } from "@/services/adminService";
import { DonorDetailsModal } from "./DonorDetailsModal";

interface Donor {
  id: string;
  displayName: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  // ...other fields as needed
}

export function DonorManagement() {
  const { showNotification } = useNotification();
  const [subtab, setSubtab] = useState<'applications' | 'official' | 'rejected'>('applications');
  const [pending, setPending] = useState<Donor[]>([]);
  const [approved, setApproved] = useState<Donor[]>([]);
  const [rejected, setRejected] = useState<Donor[]>([]);
  const [detailModal, setDetailModal] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const allDonors = await adminService.getAllDonors();
      setPending(allDonors.filter((d: any) => d.status === 'pending'));
      setApproved(allDonors.filter((d: any) => d.status === 'approved'));
      setRejected(allDonors.filter((d: any) => d.status === 'rejected'));
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const viewDetails = (id: string) => {
    const donor = [...pending, ...approved, ...rejected].find((d) => d.id === id);
    setDetailModal(donor || null);
  };

  const handleApprove = async (id: string) => {
    try {
      await adminService.approveDonor(id);
      fetchDonors();
    } catch (e) {
      showNotification({ title: 'Action failed', message: 'Failed to approve donor', type: 'error' });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await adminService.rejectDonor(id);
      fetchDonors();
    } catch (e) {
      showNotification({ title: 'Action failed', message: 'Failed to reject donor', type: 'error' });
    }
  };

  return (
    <div className="p-6">
      <div className="bg-[#004225]/80 p-6 rounded-lg shadow-md border border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-[#FFB000] font-display">Donor Management</h3>
            <p className="text-gray-400 text-sm">Evaluate donor applications, manage partners, and monitor drop-offs.</p>
          </div>
          <div className="flex gap-2">
            {[{ key: "applications", label: "Application Review" }, { key: "official", label: "Official Donors" }, { key: "rejected", label: "Rejected" }].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSubtab(tab.key as typeof subtab)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                  subtab === tab.key ? "bg-goldenyellow text-gray-900" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Tab */}
        {subtab === "applications" && (
          <div className="overflow-hidden rounded-lg border border-gray-700 bg-white/5">
            <div className="grid grid-cols-3 text-sm font-semibold text-white border-b border-gray-700 px-4 py-3">
              <span>Donor</span>
              <span>Date Applied</span>
              <span className="text-right">Actions</span>
            </div>
            {pending.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400">No pending applications</div>
            ) : (
              pending.map((d) => (
                <div key={d.id} className="grid grid-cols-3 items-center px-4 py-3 text-sm text-gray-200 border-b border-gray-800 last:border-b-0">
                  <span className="flex items-center gap-2 text-goldenyellow font-semibold">
                    {d.displayName}
                  </span>
                  <span>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'N/A'}</span>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => viewDetails(d.id)}
                      className="px-3 py-1 rounded-md bg-[#FFB000] text-[#004225] text-xs font-semibold hover:bg-yellow-300 flex items-center gap-1"
                    >
                      View
                    </button>
                    <button
                      className="px-3 py-1 rounded-md bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600"
                      onClick={() => handleApprove(d.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="px-3 py-1 rounded-md bg-red-500 text-white text-xs font-semibold hover:bg-red-600"
                      onClick={() => handleReject(d.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Official Donors Tab */}
        {subtab === "official" && (
          <div className="overflow-hidden rounded-lg border border-gray-700 bg-white/5">
            <div className="grid grid-cols-3 text-sm font-semibold text-white border-b border-gray-700 px-4 py-3">
              <span>Donor</span>
              <span>Date Approved</span>
              <span className="text-right">Actions</span>
            </div>
            {approved.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400">No official donors</div>
            ) : (
              approved.map((d) => (
                <div key={d.id} className="grid grid-cols-3 items-center px-4 py-3 text-sm text-gray-200 border-b border-gray-800 last:border-b-0">
                  <span className="flex items-center gap-2 text-goldenyellow font-semibold">
                    {d.displayName}
                  </span>
                  <span>{d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : (d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'N/A')}</span>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => viewDetails(d.id)}
                      className="px-3 py-1 rounded-md bg-[#FFB000] text-[#004225] text-xs font-semibold hover:bg-yellow-300 flex items-center gap-1"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Rejected Donors Tab */}
        {subtab === "rejected" && (
          <div className="overflow-hidden rounded-lg border border-gray-700 bg-white/5">
            <div className="grid grid-cols-3 text-sm font-semibold text-white border-b border-gray-700 px-4 py-3">
              <span>Donor</span>
              <span>Date Rejected</span>
              <span className="text-right">Actions</span>
            </div>
            {rejected.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400">No rejected donors</div>
            ) : (
              rejected.map((d) => (
                <div key={d.id} className="grid grid-cols-3 items-center px-4 py-3 text-sm text-gray-200 border-b border-gray-800 last:border-b-0">
                  <span className="flex items-center gap-2 text-goldenyellow font-semibold">
                    {d.displayName}
                  </span>
                  <span>{d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : (d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'N/A')}</span>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => viewDetails(d.id)}
                      className="px-3 py-1 rounded-md bg-[#FFB000] text-[#004225] text-xs font-semibold hover:bg-yellow-300 flex items-center gap-1"
                    >
                      View
                    </button>
                    <button
                      className="px-3 py-1 rounded-md bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600"
                      onClick={() => handleApprove(d.id)}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Donor Details Modal */}
        {detailModal && (
          <DonorDetailsModal donor={detailModal} onClose={() => setDetailModal(null)} />
        )}
      </div>
    </div>
  );
}
