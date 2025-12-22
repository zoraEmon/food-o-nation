import React, { useState, useEffect } from "react";import { useNotification } from '@/components/ui/NotificationProvider';import { adminService } from "@/services/adminService";
import { BeneficiaryDetailsModal } from "./BeneficiaryDetailsModal";
import { AdminTabs } from "./AdminTabs";
import ActionButton from '@/components/ui/ActionButton';

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

  const [reasonModal, setReasonModal] = useState<{ type: 'approve' | 'reject'; id: string } | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [reasonSubmitting, setReasonSubmitting] = useState(false);

  const viewDetails = async (id: string, source: 'applications'|'official'|'rejected' = 'applications') => {
    try {
      // Try to touch updatedAt first to mark it as viewed; if touch fails we still continue to load details
      try {
        await adminService.touchBeneficiary(id);
      } catch (err) {
        // Don't block showing details if touch fails
        // eslint-disable-next-line no-console
        console.warn('touchBeneficiary failed for', id, err);
      }

      const details = await adminService.getBeneficiaryDetails(id);
      // annotate the details with the viewing context so the modal can show/hide fields
      (details as any).viewContext = source;
      setDetailModal(details as any);
      fetchBeneficiaries();
    } catch (e) {
      showNotification({ title: 'Failed to load', message: 'Failed to load beneficiary details', type: 'error' });
    }
  };

  const openApproveModal = (id: string) => {
    setReasonText('');
    setReasonModal({ type: 'approve', id });
  };

  const openRejectModal = (id: string) => {
    setReasonText('');
    setReasonModal({ type: 'reject', id });
  };

  const confirmReason = async () => {
    if (!reasonModal) return;
    setReasonSubmitting(true);
    try {
      if (reasonModal.type === 'approve') {
        await adminService.approveBeneficiary(reasonModal.id, reasonText || undefined);
        showNotification({ title: 'Approved', message: 'Beneficiary approved successfully', type: 'success' });
      } else {
        await adminService.rejectBeneficiary(reasonModal.id, reasonText || undefined);
        showNotification({ title: 'Rejected', message: 'Beneficiary rejected successfully', type: 'success' });
      }
      setReasonModal(null);
      setReasonText('');
      fetchBeneficiaries();
    } catch (e) {
      showNotification({ title: 'Action failed', message: 'Failed to perform action', type: 'error' });
    } finally {
      setReasonSubmitting(false);
    }
  };

  const cancelReason = () => {
    setReasonModal(null);
  };

  return (
    <div className="p-6" style={{ background: 'var(--dashboard-bg)' }}>
      <div className="bg-white dark:bg-[#004225]/80 p-6 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-[#004225] dark:text-[#FFB000] font-heading">Beneficiary Management</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">Review applications and manage approved beneficiaries.</p>
          </div>

        </div>

        <AdminTabs
          title="Beneficiary"
          pending={pending}
          approved={approved}
          rejected={rejected}
          renderName={(b: any) => (<>{b.firstName} {b.lastName}</>)}
          getDate={(b: any) => (b.dateApplied || b.user?.createdAt ? new Date(b.dateApplied || b.user?.createdAt).toLocaleDateString() : 'N/A')}
          renderRightColumn={(b: any, subtab) => (
            <>
              {Array.isArray(b.householdMembers) && b.householdMembers.length > 0 ? (
                <ul className="text-xs text-[#004225] dark:text-yellow-100">
                  {b.householdMembers.map((m: any) => (
                    <li key={m.id} className="mb-1">{m.fullName} <span className="text-gray-500 dark:text-gray-400">({m.relationship}, Age: {m.age})</span></li>
                  ))}
                </ul>
              ) : null}
              <div className="flex gap-2 mt-2">
                <ActionButton onClick={() => viewDetails(b.id)} variant="secondary">View</ActionButton>
                {subtab === 'applications' && (
                  <>
                    <ActionButton onClick={() => openApproveModal(b.id)} variant="primary">Approve</ActionButton>
                    <ActionButton onClick={() => openRejectModal(b.id)} variant="danger">Reject</ActionButton>
                  </>
                )}
                {subtab === 'official' && (
                  <>
                    <ActionButton onClick={() => openRejectModal(b.id)} variant="danger">Reject</ActionButton>
                  </>
                )}
                {subtab === 'rejected' && <ActionButton onClick={() => openApproveModal(b.id)} variant="primary">Approve</ActionButton>}
              </div>
            </>
          )}
          onView={viewDetails}
          onApprove={openApproveModal}
          onReject={openRejectModal}
        />



        {/* Reason Modal for Approve/Reject */}
        {reasonModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div style={{ background: 'var(--card-bg)', color: 'var(--card-fg)' }} className="rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
              <button onClick={cancelReason} className="absolute top-3 right-3 text-gray-200 hover:text-white bg-transparent dark:bg-transparent text-2xl">&times;</button>
              <h3 className="text-lg font-semibold mb-2">{reasonModal.type === 'approve' ? 'Approve' : 'Reject'} Beneficiary</h3>
              <p className="text-sm mb-4">Provide a reason (optional) that will be saved with the review.</p>
              <textarea value={reasonText} onChange={(e) => setReasonText(e.target.value)} className="w-full p-2 border rounded mb-4" rows={4} />
              <div className="flex justify-end gap-2">
                <button onClick={cancelReason} className="px-4 py-2 rounded" style={{ background: 'var(--muted)', color: 'var(--foreground)' }}>Cancel</button>
                <button onClick={confirmReason} disabled={reasonSubmitting} className="px-4 py-2 rounded" style={{ background: 'var(--secondary)', color: 'var(--secondary-fg)' }}>
                  {reasonSubmitting ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
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
