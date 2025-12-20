import React, { useState, useEffect } from "react";import { useNotification } from '@/components/ui/NotificationProvider';import { adminService } from "@/services/adminService";
import { BeneficiaryDetailsModal } from "./BeneficiaryDetailsModal";

interface Beneficiary {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  // ...other fields as needed
}

export function BeneficiaryManagement() {
  const { showNotification } = useNotification();
  const [subtab, setSubtab] = useState<'applications' | 'official' | 'rejected'>('applications');
  const [pending, setPending] = useState<Beneficiary[]>([]);
  const [approved, setApproved] = useState<Beneficiary[]>([]);
  const [rejected, setRejected] = useState<Beneficiary[]>([]);
  const [detailModal, setDetailModal] = useState<Beneficiary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBeneficiaries = async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        adminService.getAllBeneficiaries(1, 100, 'PENDING'),
        adminService.getAllBeneficiaries(1, 100, 'APPROVED'),
        adminService.getAllBeneficiaries(1, 100, 'REJECTED'),
      ]);
      setPending(pendingRes.beneficiaries || []);
      setApproved(approvedRes.beneficiaries || []);
      setRejected(rejectedRes.beneficiaries || []);
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const viewDetails = async (id: string) => {
    try {
      const details = await adminService.getBeneficiaryDetails(id);
      setDetailModal(details);
    } catch (e) {
      showNotification({ title: 'Failed to load', message: 'Failed to load beneficiary details', type: 'error' });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await adminService.approveBeneficiary(id);
      fetchBeneficiaries();
    } catch (e) {
      showNotification({ title: 'Action failed', message: 'Failed to approve beneficiary', type: 'error' });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await adminService.rejectBeneficiary(id);
      fetchBeneficiaries();
    } catch (e) {
      showNotification({ title: 'Action failed', message: 'Failed to reject beneficiary', type: 'error' });
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white dark:bg-[#004225]/80 p-6 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-[#004225] dark:text-[#FFB000] font-heading">Beneficiary Management</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">Review applications and manage approved beneficiaries.</p>
          </div>
          <div className="flex gap-2">
            {[{ key: "applications", label: "Application Review" }, { key: "official", label: "Official Beneficiaries" }, { key: "rejected", label: "Rejected" }].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSubtab(tab.key as typeof subtab)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                  subtab === tab.key
                    ? "bg-yellow-400 text-[#004225] dark:bg-yellow-700 dark:text-yellow-100"
                    : "bg-gray-100 text-[#004225] dark:bg-[#1a2a2a] dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#223]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Tab */}
        {subtab === "applications" && (
          <div className="overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a2a2a]">
            <div className="grid grid-cols-3 text-sm font-semibold text-[#004225] dark:text-yellow-200 border-b border-gray-300 dark:border-gray-700 px-4 py-3">
              <span>Beneficiary</span>
              <span>Date Applied</span>
              <span className="text-right">Actions</span>
            </div>
            {pending.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No pending applications</div>
            ) : (
              pending.map((b) => (
                <div key={b.id} className="grid grid-cols-3 items-center px-4 py-3 text-sm text-[#004225] dark:text-yellow-100 border-b border-gray-200 dark:border-gray-800 last:border-b-0">
                  <span className="flex items-center gap-2 font-semibold">
                    {b.firstName} {b.lastName}
                  </span>
                  <span>{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}</span>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => viewDetails(b.id)}
                      className="px-3 py-1 rounded-md bg-yellow-400 text-[#004225] text-xs font-semibold hover:bg-yellow-300 dark:bg-yellow-700 dark:text-yellow-100 dark:hover:bg-yellow-600 flex items-center gap-1"
                    >
                      View
                    </button>
                    <button
                      className="px-3 py-1 rounded-md bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600"
                      onClick={() => handleApprove(b.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="px-3 py-1 rounded-md bg-red-500 text-white text-xs font-semibold hover:bg-red-600"
                      onClick={() => handleReject(b.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Official Beneficiaries Tab */}
        {subtab === "official" && (
          <div className="overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a2a2a]">
            <div className="grid grid-cols-3 text-sm font-semibold text-[#004225] dark:text-yellow-200 border-b border-gray-300 dark:border-gray-700 px-4 py-3">
              <span>Beneficiary</span>
              <span>Date Approved</span>
              <span className="text-right">Family Members / Actions</span>
            </div>
            {approved.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No official beneficiaries</div>
            ) : (
              approved.map((b) => (
                <div key={b.id} className="grid grid-cols-3 items-center px-4 py-3 text-sm text-[#004225] dark:text-yellow-100 border-b border-gray-200 dark:border-gray-800 last:border-b-0">
                  <span className="flex items-center gap-2 font-semibold">
                    {b.firstName} {b.lastName}
                  </span>
                  <span>{b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : (b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A')}</span>
                  <div className="flex flex-col items-end gap-1">
                    {Array.isArray(b.householdMembers) && b.householdMembers.length > 0 ? (
                      <ul className="text-xs text-[#004225] dark:text-yellow-100">
                        {b.householdMembers.map((m: any) => (
                          <li key={m.id} className="mb-1">{m.fullName} <span className="text-gray-500 dark:text-gray-400">({m.relationship}, Age: {m.age})</span></li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">No family members</span>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => viewDetails(b.id)}
                        className="px-3 py-1 rounded-md bg-yellow-400 text-[#004225] text-xs font-semibold hover:bg-yellow-300 dark:bg-yellow-700 dark:text-yellow-100 dark:hover:bg-yellow-600 flex items-center gap-1"
                      >
                        View
                      </button>
                      <button
                        className="px-3 py-1 rounded-md bg-red-500 text-white text-xs font-semibold hover:bg-red-600"
                        onClick={() => handleReject(b.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Rejected Beneficiaries Tab */}
        {subtab === "rejected" && (
          <div className="overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a2a2a]">
            <div className="grid grid-cols-3 text-sm font-semibold text-[#004225] dark:text-yellow-200 border-b border-gray-300 dark:border-gray-700 px-4 py-3">
              <span>Beneficiary</span>
              <span>Date Rejected</span>
              <span className="text-right">Actions</span>
            </div>
            {rejected.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No rejected beneficiaries</div>
            ) : (
              rejected.map((b) => (
                <div key={b.id} className="grid grid-cols-3 items-center px-4 py-3 text-sm text-[#004225] dark:text-yellow-100 border-b border-gray-200 dark:border-gray-800 last:border-b-0">
                  <span className="flex items-center gap-2 font-semibold">
                    {b.firstName} {b.lastName}
                  </span>
                  <span>{b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : (b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A')}</span>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => viewDetails(b.id)}
                      className="px-3 py-1 rounded-md bg-yellow-400 text-[#004225] text-xs font-semibold hover:bg-yellow-300 dark:bg-yellow-700 dark:text-yellow-100 dark:hover:bg-yellow-600 flex items-center gap-1"
                    >
                      View
                    </button>
                    <button
                      className="px-3 py-1 rounded-md bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600"
                      onClick={() => handleApprove(b.id)}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Beneficiary Details Modal */}
        {detailModal && (
          <BeneficiaryDetailsModal beneficiary={detailModal} onClose={() => setDetailModal(null)} />
        )}
      </div>
    </div>
  );
}
