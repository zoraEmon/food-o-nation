import React from "react";

interface BeneficiaryListProps {
  beneficiaries: Array<{
    id: string;
    firstName: string;
    lastName: string;
    user?: { profileImage?: string; email?: string; status?: string };
  }>;
  onView: (id: string) => void;
}

export const BeneficiaryList: React.FC<BeneficiaryListProps> = ({ beneficiaries, onView }) => (
  <div className="overflow-hidden rounded-lg border bg-white/5">
    <div className="grid grid-cols-4 text-sm font-semibold text-white border-b border-gray-700 px-4 py-3">
      <span>Beneficiary</span>
      <span>Email</span>
      <span>Status</span>
      <span className="text-right">Actions</span>
    </div>
    {beneficiaries.length === 0 ? (
      <div className="px-4 py-8 text-center text-gray-400">No beneficiaries found</div>
    ) : (
      beneficiaries.map((beneficiary) => (
        <div key={beneficiary.id} className="grid grid-cols-4 items-center px-4 py-3 text-sm text-gray-200 border-b border-gray-800 last:border-b-0">
          <span className="flex items-center gap-2 text-goldenyellow font-semibold">
            <img src={beneficiary.user?.profileImage || "https://placehold.co/32x32"} alt="Profile" className="w-8 h-8 rounded-full object-cover border" />
            {beneficiary.firstName} {beneficiary.lastName}
          </span>
          <span>{beneficiary.user?.email || 'N/A'}</span>
          <span>
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
              beneficiary.user?.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
              beneficiary.user?.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {beneficiary.user?.status || 'N/A'}
            </span>
          </span>
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => onView(beneficiary.id)}
              className="px-3 py-1 rounded-md bg-[#FFB000] text-[#004225] text-xs font-semibold hover:bg-yellow-300 flex items-center gap-1"
            >
              View
            </button>
          </div>
        </div>
      ))
    )}
  </div>
);
