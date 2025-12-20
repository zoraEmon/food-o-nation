import React from "react";

export function DashboardStatsCard({ title, value, icon: Icon, note, tone }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  note?: string;
  tone?: string;
}) {
  return (
    <div className="bg-[#004225]/80 p-6 rounded-lg shadow-md border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[#FFB000] font-display">{title}</h3>
        <Icon className="w-8 h-8 text-[#FFB000]" />
      </div>
      <p className={`text-5xl font-bold text-white`}>{value}</p>
      {note && <p className={`text-sm mt-2 ${tone || "text-gray-400"}`}>{note}</p>}
    </div>
  );
}
