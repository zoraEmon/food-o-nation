import React from "react";

interface DonorDetailsModalProps {
  donor: any;
  onClose: () => void;
}

const formatPhone = (raw?: string) => {
  if (!raw) return 'N/A';
  const digits = String(raw).replace(/[^0-9+]/g, '');
  // simple grouping: if starts with + then leave, else group by 3/3/4
  if (digits.startsWith('+')) return digits;
  if (digits.length === 11) {
    // e.g. 09171234567 -> 0917 123 4567
    return `${digits.slice(0,4)} ${digits.slice(4,7)} ${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`;
  }
  return digits;
};

const formatDate = (val?: string | Date | null) => {
  if (!val) return 'N/A';
  try {
    return new Date(val).toLocaleDateString();
  } catch (e) {
    return String(val);
  }
};
export const DonorDetailsModal: React.FC<DonorDetailsModalProps> = ({ donor, onClose }) => {
  if (!donor) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div style={{ background: 'var(--card-bg)', color: 'var(--card-fg)' }} className="rounded-lg shadow-2xl w-full max-w-3xl p-6 relative custom-scrollbar">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-sm uppercase text-gray-400">Donor Details</p>
            <h3 className="text-2xl font-semibold" style={{ color: 'var(--primary)' }}>
              {donor.displayName}
            </h3>
            <div className="mt-2">
              <span className={`inline-block mt-2 px-3 py-1 rounded text-xs font-semibold ${donor.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' : donor.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-gray-200 text-gray-600'}`}>
                {donor.status || 'UNKNOWN'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition" aria-label="Close details">
            ✕
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border rounded-lg p-4" style={{ background: 'var(--card-bg)' }}>
              <h4 className="font-semibold mb-3" style={{ color: 'var(--secondary)' }}>Contact Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span style={{ color: 'var(--card-fg)' }}>{donor.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span style={{ color: 'var(--card-fg)' }}>{formatPhone(donor.contactNumber || donor.primaryPhone)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span style={{ color: 'var(--card-fg)' }}>{donor.donorType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Donation:</span>
                  <span style={{ color: 'var(--card-fg)' }}>₱{donor.totalDonation || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Joined:</span>
                  <span style={{ color: 'var(--card-fg)' }}>{donor.createdAt ? new Date(donor.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="border rounded-lg p-4" style={{ background: 'var(--card-bg)' }}>
              <h4 className="font-semibold mb-3" style={{ color: 'var(--secondary)' }}>Dates</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date Applied</span>
                  <span style={{ color: 'var(--card-fg)' }}>{formatDate(donor.createdAt || donor.user?.createdAt)}</span>
                </div>
                {/* Prefer explicit approved fields then fallback to updatedAt */}
                {(donor.approvedAt || donor.dateApproved || donor.dateDecision || donor.updatedAt) && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date Approved</span>
                    <span style={{ color: 'var(--card-fg)' }}>{formatDate(donor.approvedAt || donor.dateApproved || donor.dateDecision || donor.updatedAt)}</span>
                  </div>
                )}
                {/* Prefer explicit rejected fields then fallback to updatedAt */}
                {(donor.rejectedAt || donor.dateRejected || donor.dateDecision || donor.updatedAt) && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date Rejected</span>
                    <span style={{ color: 'var(--card-fg)' }}>{formatDate(donor.rejectedAt || donor.dateRejected || donor.dateDecision || donor.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="border rounded-lg p-4" style={{ background: 'var(--card-bg)' }}>
              <h4 className="font-semibold mb-3" style={{ color: 'var(--secondary)' }}>User Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">User ID:</span>
                  <span style={{ color: 'var(--card-fg)' }}>{donor.user?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">User Email:</span>
                  <span style={{ color: 'var(--card-fg)' }}>{donor.user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">User Status:</span>
                  <span style={{ color: 'var(--card-fg)' }}>{donor.user?.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
