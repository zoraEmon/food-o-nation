"use client";

import React, { useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { adminService } from '@/services/adminService';
import { getImageUrl } from '@/lib/getImageUrl';

type Item = {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  status?: string;
  imageUrl?: string | null;
};

function verdictClass(verdict: string) {
  switch (verdict) {
    case 'COMPLETELY_APPROVED':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100';
    case 'EXTREMELY_APPROVED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'FAIRLY_APPROVED':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
    case 'BARELY_APPROVED':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
    case 'REJECTED':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-100';
  }
}

function formatVerdict(v: string) {
  return v.split('_').map((s) => s[0] + s.slice(1).toLowerCase()).join(' ');
}

export default function DonationApprovalModal({
  open,
  onClose,
  donation,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  donation: any | null;
  onUpdated?: () => void;
}) {
  const [items, setItems] = useState<Item[]>(() => (donation?.items || []) as Item[]);
  const [approvalVerdict, setApprovalVerdict] = useState<string | null>(() => donation?.approvalVerdict || null);
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [batchLoading, setBatchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setItems((donation?.items || []) as Item[]);
    setApprovalVerdict(donation?.approvalVerdict || null);
    setError(null);
  }, [donation?.id]);

  if (!open || !donation) return null;

  const updateItemStatus = async (itemId: string, status: 'APPROVED' | 'REJECTED') => {
    setError(null);
    setLoadingIds((s) => ({ ...s, [itemId]: true }));
    try {
      const res = await adminService.updateDonationItem(itemId, { status });
      setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, status } : it)));
      // Update aggregated verdict if the server returned one
      if (res && res.approvalVerdict) setApprovalVerdict(res.approvalVerdict);
      if (res && res.approvalVerdict && onUpdated) {
        // If aggregation happened, trigger parent refresh (donation likely moved to completed)
        onUpdated();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update item');
    } finally {
      setLoadingIds((s) => ({ ...s, [itemId]: false }));
    }
  };

  const bulkUpdate = async (targetStatus: 'APPROVED' | 'REJECTED') => {
    setError(null);
    setBatchLoading(true);
    try {
      let lastVerdict: string | null = null;
      for (const it of items) {
        if (it.status === targetStatus) continue;
        try {
          const res = await adminService.updateDonationItem(it.id, { status: targetStatus });
          // update local state per item
          setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, status: targetStatus } : p)));
          if (res && res.approvalVerdict) lastVerdict = res.approvalVerdict;
        } catch (err: any) {
          // Collect first error and continue so we attempt to update everything
          if (!error) setError(err?.message || 'Failed to update some items');
        }
      }
      if (lastVerdict) {
        setApprovalVerdict(lastVerdict);
        // Aggregation completed on server; notify parent to refresh lists
        if (onUpdated) onUpdated();
      }
    } finally {
      setBatchLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 text-left my-8 max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-xl font-bold text-[#004225]">Review Donation Items</h3>
              <p className="text-sm text-gray-600">Donation for <strong>{donation.donor?.displayName || donation.guestName || 'Guest'}</strong></p>
            </div>
            {approvalVerdict && (
              <div className="ml-4">
                <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${verdictClass(approvalVerdict)}`}>{formatVerdict(approvalVerdict)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                  {it.imageUrl ? <img src={getImageUrl(it.imageUrl) || ''} alt={it.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div> }
                </div>
                <div>
                  <div className="font-bold">{it.name}</div>
                  <div className="text-sm text-gray-600">{it.quantity ?? ''} {it.unit ?? ''}</div>
                  <div className="text-xs text-gray-500">Status: {it.status || 'PENDING'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => updateItemStatus(it.id, 'APPROVED')} disabled={loadingIds[it.id]} className="bg-emerald-600 text-white">Approve</Button>
                <Button onClick={() => updateItemStatus(it.id, 'REJECTED')} disabled={loadingIds[it.id]} className="bg-rose-600 text-white">Reject</Button>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={() => bulkUpdate('REJECTED')} disabled={batchLoading} className="bg-rose-600 text-white">Reject All</Button>
          <Button onClick={() => bulkUpdate('APPROVED')} disabled={batchLoading} className="bg-emerald-600 text-white">Approve All</Button>
          <Button onClick={onClose} className="bg-gray-200">Close</Button>
        </div>
      </div>
    </div>
  );
}
