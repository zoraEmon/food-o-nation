import React from "react";

interface DonorListProps {
  donors: Array<{
    name: string;
    date: string;
    portrait: string;
    details: string;
    location: string;
    phone: string;
    donationFocus: string;
  }>;
  onView: (name: string) => void;
}

export const DonorList: React.FC<DonorListProps> = ({ donors, onView }) => (
  <div className="overflow-hidden rounded-lg border bg-white/5">
    <div className="grid grid-cols-3 text-sm font-semibold text-white border-b border-gray-700 px-4 py-3">
      <span>Donor</span>
      <span>Status / Since</span>
      <span className="text-right">Actions</span>
    </div>
    {donors.length === 0 ? (
      <div className="px-4 py-8 text-center text-gray-400">No donors found</div>
    ) : (
      donors.map((donor) => (
        <div key={donor.name} className="grid grid-cols-3 items-center px-4 py-3 text-sm text-gray-200 border-b border-gray-800 last:border-b-0">
          <button
            onClick={() => onView(donor.name)}
            className="text-goldenyellow font-semibold hover:underline text-left"
          >
            {donor.name}
          </button>
          <span>{donor.date}</span>
          <div className="flex justify-end">
            <button className="px-3 py-1 rounded-md bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Remove</button>
          </div>
        </div>
      ))
    )}
  </div>
);
