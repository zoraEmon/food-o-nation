import React from "react";

export function ActivityLogList({ activity }: { activity: any[] }) {
  return (
    <div className="bg-[#004225]/80 mt-10 p-6 rounded-lg shadow-md border border-gray-700">
      <h3 className="text-2xl font-semibold text-[#FFB000] mb-4 font-display">Recent Activity</h3>
      {activity.length === 0 ? (
        <p className="text-gray-400">No recent activity</p>
      ) : (
        <ul className="space-y-3">
          {activity.map((item) => (
            <li key={item.id} className="text-gray-400 flex justify-between items-start">
              <div className="flex-1">
                <span className="font-medium text-[#FFB000]">{item.userName}</span>
                <span> - {item.action}</span>
                {item.details && <span className="block text-sm">{item.details}</span>}
              </div>
              <span className="text-xs whitespace-nowrap ml-4">
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
