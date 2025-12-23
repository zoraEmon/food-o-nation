import React, { useState, useEffect } from "react";
import { useNotification } from '@/components/ui/NotificationProvider';
import { adminService } from "@/services/adminService";
import { DonorDetailsModal } from "./DonorDetailsModal";
import { AdminTabs } from './AdminTabs';
import ActionButton from '@/components/ui/ActionButton';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [pending, setPending] = useState<Donor[]>([]);
  const [approved, setApproved] = useState<Donor[]>([]);
  const [rejected, setRejected] = useState<Donor[]>([]);
  const [detailModal, setDetailModal] = useState<Donor | null>(null);
  const [reasonModal, setReasonModal] = useState<{ type: 'approve' | 'reject'; id: string } | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [reasonSubmitting, setReasonSubmitting] = useState(false);

  const fetchDonors = async () => {
    try {
      // Use dedicated pending endpoint to reliably get applicants under review
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        adminService.getPendingDonors(),
        adminService.getAllDonors(1, 100, 'APPROVED'),
        adminService.getAllDonors(1, 100, 'REJECTED')
      ]);
      // getPendingDonors returns an array of donors (response.data.data === donors[])
      const pendingList = Array.isArray(pendingRes) ? pendingRes : (pendingRes.donors || []);
      setPending(pendingList);
      setApproved(approvedRes.donors || []);
      setRejected(rejectedRes.donors || []);
      // Debug: log counts so we can verify which lists were returned
      // eslint-disable-next-line no-console
      console.log('Donor fetch:', { pending: pendingList.length, approved: (approvedRes.donors || []).length, rejected: (rejectedRes.donors || []).length });
    } catch (e) {
      // handle error
    }
  };

  React.useEffect(() => { fetchDonors(); }, []);


  const viewDetails = (id: string, _source?: 'applications'|'official'|'rejected') => {
    (async () => {
      try {
        // best-effort touch to update updatedAt when admin views
        await adminService.touchDonor(id);
      } catch (e) {
        // ignore
      }
      try {
        const details = await adminService.getDonorDetails(id);
        (details as any).viewContext = _source || 'applications';
        setDetailModal(details as any);
        fetchDonors();
      } catch (err) {
        showNotification({ title: 'Failed to load', message: 'Failed to load donor details', type: 'error' });
      }
    })();
  };

  const handleApprove = async (id: string) => {
    // Open reason modal for approve
    setReasonText('');
    setReasonModal({ type: 'approve', id });
  };

  const handleReject = async (id: string) => {
    // Open reason modal for reject
    setReasonText('');
    setReasonModal({ type: 'reject', id });
  };

  const cancelReason = () => {
    setReasonModal(null);
    setReasonText('');
  };

  const confirmReason = async () => {
    if (!reasonModal) return;
    setReasonSubmitting(true);
    try {
      if (reasonModal.type === 'approve') {
        await adminService.approveDonor(reasonModal.id, reasonText || undefined);
        showNotification({ title: 'Approved', message: 'Donor approved successfully', type: 'success' });
      } else {
        await adminService.rejectDonor(reasonModal.id, reasonText || undefined);
        showNotification({ title: 'Rejected', message: 'Donor rejected successfully', type: 'success' });
      }
      setReasonModal(null);
      setReasonText('');
      fetchDonors();
    } catch (e) {
      showNotification({ title: 'Action failed', message: 'Failed to perform action', type: 'error' });
    } finally {
      setReasonSubmitting(false);
    }
  };

  return (
    <div className="p-6" style={{ background: 'var(--dashboard-bg)' }}>
      <div className="bg-white dark:bg-[#004225]/80 p-6 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-[#004225] dark:text-[#FFB000] font-heading">Donor Management</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">Evaluate donor applications, manage partners, and monitor drop-offs.</p>
          </div>
        </div>


        <AdminTabs
          title="Donor"
          pending={pending}
          approved={approved}
          rejected={rejected}
          renderName={(d: any) => (<>{d.displayName}</>)}
          getDate={(d: any, subtab?: 'applications'|'official'|'rejected') => {
            // Date applied should be applicant's registration date (user.createdAt or createdAt)
            if (subtab === 'applications') {
              const applied = d.user?.createdAt || d.createdAt;
              return applied ? new Date(applied).toLocaleDateString() : 'N/A';
            }

              // For official/rejected, prefer donor.reviewedAt, then donor.updatedAt, then user.updatedAt
              if (subtab === 'official') {
                const approved = d.reviewedAt || d.updatedAt || d.user?.updatedAt || d.dateApproved || d.dateDecision || d.approvedAt;
                return approved ? new Date(approved).toLocaleDateString() : 'N/A';
              }

              if (subtab === 'rejected') {
                const rejectedDate = d.reviewedAt || d.updatedAt || d.user?.updatedAt || d.dateRejected || d.dateDecision;
                return rejectedDate ? new Date(rejectedDate).toLocaleDateString() : 'N/A';
              }

            return 'N/A';
          }}
          onView={viewDetails}
          onApprove={handleApprove}
          onReject={handleReject}
          renderRightColumn={(d: any, subtab) => {
            if (subtab === 'applications') {
              return (
                <div className="flex gap-2 mt-2">
                    <ActionButton onClick={() => viewDetails(d.id)} variant="secondary">View</ActionButton>
                    <ActionButton onClick={() => handleApprove(d.id)} variant="primary">Approve</ActionButton>
                    <ActionButton onClick={() => handleReject(d.id)} variant="danger">Reject</ActionButton>
                </div>
              );
            }
            if (subtab === 'official') {
              return (
                <div className="flex gap-2 mt-2">
                  <ActionButton onClick={() => viewDetails(d.id)} variant="secondary">View</ActionButton>
                </div>
              );
            }
            // rejected tab: show view + approve (no reject)
            return (
              <div className="flex gap-2 mt-2">
                <ActionButton onClick={() => viewDetails(d.id, 'rejected')} variant="secondary">View</ActionButton>
                <ActionButton onClick={() => handleApprove(d.id)} variant="primary">Approve</ActionButton>
              </div>
            );
          }}
        />

        {/* Donor Details Modal */}
        {detailModal && (
          <DonorDetailsModal donor={detailModal} onClose={() => setDetailModal(null)} />
        )}

        {/* Reason Modal for Approve/Reject */}
        {reasonModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div style={{ background: 'var(--card-bg)', color: 'var(--card-fg)' }} className="rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
              <button onClick={cancelReason} className="absolute top-3 right-3 text-gray-200 hover:text-white bg-transparent dark:bg-transparent text-2xl">&times;</button>
              <h3 className="text-lg font-semibold mb-2">{reasonModal.type === 'approve' ? 'Approve' : 'Reject'} Donor</h3>
              <p className="text-sm mb-4">Provide a reason (optional) that will be saved with the review.</p>
              <textarea value={reasonText} onChange={(e) => setReasonText(e.target.value)} className="w-full p-2 border rounded mb-4" rows={4} />
              <div className="flex justify-end gap-2">
                <button onClick={cancelReason} className="px-4 py-2 rounded" style={{ background: 'var(--muted)', color: 'var(--foreground)' }}>Cancel</button>
                <button onClick={confirmReason} disabled={reasonSubmitting} className="px-4 py-2 rounded" style={{ background: 'var(--secondary)', color: 'var(--secondary-fg)' }}>{reasonSubmitting ? 'Processing...' : 'Confirm'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DonorManagement;

