import React from "react";

export function ActivityLogList({ activity }: { activity: any[] }) {
  return (
    <div style={{ background: 'var(--card-bg)', color: 'var(--card-fg)' }} className="mt-10 p-6 rounded-lg shadow-md border transition-colors border-gray-300 dark:border-gray-700">
      <h3 className="text-2xl font-semibold mb-4 font-display" style={{ color: 'var(--secondary)' }}>Activity history</h3>
      {activity.length === 0 ? (
        <p className="text-sm text-gray-400">No activity history</p>
      ) : (
        <div className="custom-scrollbar overflow-y-auto max-h-72 p-1">
          <ul className="space-y-3 p-2">
            {activity.map((item) => (
              <li key={item.id} className="flex justify-between items-start" style={{ color: 'var(--card-fg)' }}>
                <div className="flex-1">
                  <span className="font-medium" style={{ color: 'var(--secondary)' }}>{item.userName}</span>
                  <span> - {item.action}</span>
                  {item.details && <span className="block text-sm text-gray-500 dark:text-gray-300">{item.details}</span>}
                </div>
                <span className="text-xs whitespace-nowrap ml-4 text-gray-400 dark:text-gray-300">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
