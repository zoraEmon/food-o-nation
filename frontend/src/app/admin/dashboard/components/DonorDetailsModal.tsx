import React from "react";

interface DonorDetailsModalProps {
  donor: any;
  onClose: () => void;
}

export const DonorDetailsModal: React.FC<DonorDetailsModalProps> = ({ donor, onClose }) => {
  if (!donor) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-3xl p-6 relative">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-sm uppercase text-gray-400">Donor Details</p>
            <h3 className="text-2xl font-semibold text-goldenyellow">
              {donor.displayName}
            </h3>
            <span className={`inline-block mt-2 px-3 py-1 rounded text-xs font-semibold ${
              donor.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
              donor.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {donor.status || 'UNKNOWN'}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition" aria-label="Close details">
            ✕
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white/5 border border-gray-700 rounded-lg p-4">
              <h4 className="text-goldenyellow font-semibold mb-3">Contact Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">{donor.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">{donor.donorType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Donation:</span>
                  <span className="text-white">₱{donor.totalDonation || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Points:</span>
                  <span className="text-white">{donor.points}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Joined:</span>
                  <span className="text-white">{new Date(donor.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white/5 border border-gray-700 rounded-lg p-4">
              <h4 className="text-goldenyellow font-semibold mb-3">User Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">User ID:</span>
                  <span className="text-white">{donor.user?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">User Email:</span>
                  <span className="text-white">{donor.user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">User Status:</span>
                  <span className="text-white">{donor.user?.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
