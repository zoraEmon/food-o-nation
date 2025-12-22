"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { adminService } from '@/services/adminService';
import Link from 'next/link';

export default function DropoffSchedulePage() {
  const [loading, setLoading] = useState(true);
  const [grouped, setGrouped] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await adminService.getDropoffSchedule();
        setGrouped(data || {});
      } catch (err: unknown) {
        setError((err as Error)?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F0]">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#004225]">Drop-off Schedule</h1>
          <Link href="/admin/dashboard" className="text-sm text-gray-600 hover:text-[#004225]">Back to Admin</Link>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['SCHEDULED','COMPLETED','CANCELLED'].map((status) => (
              <div key={status} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold text-[#004225] mb-3">{status}</h3>
                {(grouped[status] || []).length === 0 ? (
                  <p className="text-sm text-gray-500">No items</p>
                ) : (
                  <ul className="space-y-3">
                    {(grouped[status] || []).map((d: any) => (
                      <li key={d.id} className="border p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{d.donor?.displayName || d.guestName || 'Guest'}</p>
                            <p className="text-sm text-gray-600">Scheduled: {new Date(d.scheduledDate).toLocaleString()}</p>
                            <p className="text-sm text-gray-600">Items: {d.items?.length || 0}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Center: {d.donationCenter?.placeId ? d.donationCenter?.placeId : 'N/A'}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
