import React from "react";

export function DashboardStatsCard({ title, value, icon: Icon, note, tone }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  note?: string;
  tone?: string;
}) {
  return (
    <div style={{ background: 'var(--card-bg)', color: 'var(--card-fg)' }} className="p-6 rounded-lg shadow-md border transition-colors border-gray-300 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold font-display" style={{ color: 'var(--secondary)' }}>{title}</h3>
        <Icon className="w-8 h-8" style={{ color: 'var(--secondary)' }} />
      </div>
      <p className={`text-5xl font-bold`} style={{ color: 'var(--card-fg)' }}>{value}</p>
      {note && <p className={`text-sm mt-2 ${tone || "text-gray-400"}`}>{note}</p>}
    </div>
  );
}
