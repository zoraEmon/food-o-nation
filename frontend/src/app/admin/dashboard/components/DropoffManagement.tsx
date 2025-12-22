"use client";

import React, { useEffect, useRef, useState } from 'react';
import { adminService } from '@/services/adminService';
import { useNotification } from '@/components/ui/NotificationProvider';
import ActionButton from '@/components/ui/ActionButton';
import QrModal from '@/components/qr/QrModal';
import DonationApprovalModal from '@/components/admin/DonationApprovalModal';
import { getImageUrl } from '@/lib/getImageUrl';

interface DropoffDonation {
  id: string;
  donor?: { displayName?: string } | null;
  guestName?: string | null;
  scheduledDate?: string | null;
  items?: Array<{ [k: string]: unknown }> | null;
  donationCenter?: { placeId?: string } | null;
  qrCodeRef?: string | null;
}


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

export default function DropoffManagement() {
  const [showQrModal, setShowQrModal] = useState(false);
  const [modalDonation, setModalDonation] = useState<DropoffDonation | null>(null);

  const openQrModal = (donation: DropoffDonation) => {
    setModalDonation(donation);
    setShowQrModal(true);
  };

  const closeQrModal = () => {
    setShowQrModal(false);
    setModalDonation(null);
  };

  // Approval modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalDonation, setApprovalDonation] = useState<any | null>(null);

  const openApprovalModal = async (donationIdOrDonation: string | DropoffDonation) => {
    try {
      const donation = typeof donationIdOrDonation === 'string' ? await adminService.getDonationById(donationIdOrDonation) : donationIdOrDonation;
      // If the service returns a wrapper { data: donation } or similar, normalize
      const normalized = donation?.data?.donation ? donation.data.donation : donation;
      setApprovalDonation(normalized);
      setShowApprovalModal(true);
    } catch (err: any) {
      showNotification({ title: 'Failed', message: err?.message || 'Failed to load donation', type: 'error' });
    }
  };

  const closeApprovalModal = () => {
    setShowApprovalModal(false);
    setApprovalDonation(null);
  };
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [grouped, setGrouped] = useState<Record<string, DropoffDonation[]>>({});
  const [error, setError] = useState<string | null>(null);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanningDonationId, setScanningDonationId] = useState<string | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  type QrScannerConstructor = new (video: HTMLVideoElement, onDecode: (result: string) => void) => { start: () => Promise<void> | void; stop: () => void; destroy: () => void };
  const scannerRef = useRef<QrScannerConstructor | null>(null);

  const fetchDropoffs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDropoffSchedule();
      setGrouped(data || {});
      setError(null);
    } catch (err: unknown) {
      const msg = (err as Error)?.message || String(err ?? 'Failed to load drop-off appointments');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropoffs();
    // cleanup on unmount
    return () => {
      if (scannerRef.current) {
        try {
          // stop & destroy if available
          (scannerRef.current as unknown as { stop?: () => void })?.stop?.();
          (scannerRef.current as unknown as { destroy?: () => void })?.destroy?.();
        } catch (err) {
          console.debug('Failed to stop/destroy scanner', err);
        }
      }
    };
  }, []);

  const handleUpdateStatus = async (donationId: string, status: 'COMPLETED' | 'CANCELLED') => {
    try {
      await adminService.updateDonationStatus(donationId, status);
      showNotification({ title: 'Success', message: `Donation marked ${status}`, type: 'success' });
      fetchDropoffs();
    } catch (err: unknown) {
      const msg = (err as Error)?.message || String(err ?? 'Failed to update status');
      showNotification({ title: 'Failed', message: msg, type: 'error' });
    }
  };

  const openScanner = (donationId?: string | null) => {
    setScannerError(null);
    setScanningDonationId(donationId || null);
    setScannerOpen(true);
    // start scanner in next tick (useEffect would be another option)
    setTimeout(initScanner, 50);
  };

  const stopVideoStream = () => {
    const videoEl = videoRef.current;
    if (videoEl) {
      const stream = videoEl.srcObject as MediaStream | null;
      if (stream) {
        try {
          stream.getTracks().forEach((t) => t.stop());
        } catch (err) {
          console.debug('Error stopping tracks', err);
        }
      }
      try { videoEl.srcObject = null; } catch { /* ignore */ }
    }
  };

  const closeScanner = () => {
    setScannerOpen(false);
    setScanningDonationId(null);
    setScannerError(null);
    if (scannerRef.current) {
      try {
        (scannerRef.current as unknown as { stop?: () => void })?.stop?.();
        (scannerRef.current as unknown as { destroy?: () => void })?.destroy?.();
      } catch (err) {
        console.debug('Failed to stop/destroy scanner', err);
      }
      scannerRef.current = null;
    }
    stopVideoStream();
  };

  const initScanner = async () => {
    if (!videoRef.current) return setScannerError('No camera available');
    try {
      // Detect whether the device has any video input before attempting to init the scanner
      if (!navigator?.mediaDevices || typeof navigator.mediaDevices.enumerateDevices !== 'function') {
        setScannerError('Camera not available. You can upload a QR image instead.');
        return;
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideoInput = devices.some((d) => d.kind === 'videoinput');
      if (!hasVideoInput) {
        setScannerError('Camera not found. You can upload a QR image instead.');
        return;
      }

      const qrModule: unknown = await import('qr-scanner');
      const QrScanner = ((qrModule as { default?: unknown }).default ?? qrModule) as unknown as QrScannerConstructor;
      // Set worker path dynamically so bundler can handle it
      (QrScanner as unknown as { WORKER_PATH?: string }).WORKER_PATH = new URL('qr-scanner/qr-scanner-worker.min.js', import.meta.url).toString();
      scannerRef.current = new QrScanner(videoRef.current as HTMLVideoElement, async (result: string) => {
        // When camera scans something, attempt to send to backend
        try {
          if (!result) return;
          // backend expects the full QR payload string
          const donation = await adminService.scanDonationQr(result);
          showNotification({ title: 'Found', message: 'Donation found. Review details in the dialog', type: 'info' });
          // open modal with donation details if returned
          if (donation && donation.id) {
            openQrModal(donation);
          }
          closeScanner();
        } catch (err: unknown) {
          // show friendly message but keep scanner open for retry
          const axiosResp = (err as any)?.response?.data;
          const msg = axiosResp?.message || axiosResp?.error || (err as Error)?.message || String(err ?? 'Failed to process QR');
          setScannerError(msg);
        }
      });
      await (scannerRef.current as { start?: () => Promise<void> | void }).start?.();
    } catch (err: unknown) {
      console.error('Scanner init error', err);
      // Handle common media errors nicely
      const errName = (err as Error & { name?: string }).name;
      if (errName === 'AbortError') {
        setScannerError('Camera access was aborted or denied. You can upload a QR image instead.');
      } else if (errName === 'NotAllowedError' || errName === 'SecurityError') {
        setScannerError('Camera access was denied. Please allow camera access or upload a QR image.');
      } else if (errName === 'NotFoundError') {
        setScannerError('Camera not found. You can upload a QR image instead.');
      } else if (errName === 'NotReadableError') {
        setScannerError('Camera in use by another application. Please close other apps and try again.');
      } else {
        const msg = (err as Error)?.message || String(err ?? 'Failed to initialize scanner. Check camera permissions.');
        setScannerError(msg);
      }
      // Ensure no dangling streams
      stopVideoStream();
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <h3 className="text-xl font-semibold text-[#004225] dark:text-[#FFB000]">Drop-off Appointments</h3>
        <div className="ml-auto">
          <ActionButton onClick={() => openScanner(null)} variant="secondary">Open Scanner</ActionButton>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading appointments...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['SCHEDULED', 'COMPLETED', 'CANCELLED'] as const).map((status) => {
            const headerClass = 'text-sm font-bold ' + (status === 'SCHEDULED' ? 'text-[#004225] dark:text-[#FFB000]' : status === 'COMPLETED' ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300');

            return (
              <div key={status} style={{ background: 'var(--card-bg)', color: 'var(--card-fg)' }} className={`p-3 rounded shadow border border-gray-200 dark:border-gray-700 transition-colors`}>
                <h5 className={headerClass + ' mb-2'}>{status}</h5>
                {(grouped[status] || []).length === 0 ? (
                  <p className="text-xs text-gray-500">No appointments</p>
                ) : (
                  <ul className="space-y-2 max-h-64 overflow-auto">
                    {(grouped[status] || []).map((donation: DropoffDonation) => (
                      <li key={donation.id} onClick={() => openApprovalModal(donation.id)} className="cursor-pointer border p-2 rounded hover:shadow-lg transition-shadow" style={{ background: 'var(--card-bg)', color: 'var(--card-fg)' }}>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <p className="font-semibold text-[#063d2b] dark:text-[#aee7c8]">{donation.donor?.displayName || donation.guestName || 'Guest'}</p>
                            <p className="text-xs text-gray-600">Scheduled: {donation.scheduledDate ? new Date(donation.scheduledDate).toLocaleString() : 'N/A'}</p>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <div>
                              {donation.qrCodeRef ? (
                                <div className="text-xs text-gray-500">QR: Available</div>
                              ) : (
                                <div className="text-xs text-gray-500">QR: N/A</div>
                              )}
                            </div>
                            {donation.approvalVerdict && (
                              <div>
                                <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${verdictClass(donation.approvalVerdict as string)}`}>{formatVerdict(donation.approvalVerdict as string)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Scanner Modal */}
      {scannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div style={{ background: 'var(--card-bg)', color: 'var(--card-fg)' }} className="p-6 rounded-xl w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Scan Donation QR</h4>
              <div className="text-xs text-gray-600">{scanningDonationId ? `Donation: ${scanningDonationId}` : ''}</div>
              <div>
                <ActionButton onClick={() => closeScanner()} variant="secondary">Close</ActionButton>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="relative">
                  <video ref={videoRef} className="w-full h-64 rounded border border-gray-200 dark:border-gray-700 object-cover" muted playsInline></video>
                  {/* Scanning overlay box */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-32 border-2 border-secondary dark:border-yellow-300 rounded-lg relative">
                      <div className="absolute inset-0 border-2 border-white/20 rounded-lg animate-pulse" />
                    </div>
                  </div>
                </div>
                {scannerError && <p className="text-xs text-red-600 mt-2">{scannerError}</p>}

                <div className="mt-3 flex items-center gap-2">
                  <label htmlFor="qrUpload" className="cursor-pointer text-sm text-[#004225] dark:text-[#FFB000] underline">Upload QR Image</label>
                  <input id="qrUpload" type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setScannerError(null);
                    try {
                                      const qrModule: unknown = await import('qr-scanner');
                      const QrScanner = ((qrModule as { default?: unknown }).default ?? qrModule) as unknown as { scanImage: (img: File|HTMLImageElement|string) => Promise<string> };
                      const result = await QrScanner.scanImage(file);
                      if (!result) throw new Error('No QR code detected');
                      const donation = await adminService.scanDonationQr(result);
                      showNotification({ title: 'Found', message: 'Donation found. Review details in the dialog', type: 'info' });
                      // open approval modal with donation details if returned
                      if (donation && donation.id) {
                        openApprovalModal(donation);
                      }
                      closeScanner();
                    } catch (err: unknown) {
                      // Log richer diagnostics to help debugging upload/scan failures
                      try {
                        const status = (err as any)?.response?.status;
                        const resp = (err as any)?.response?.data;
                        console.error('Upload scan failed:', {
                          message: (err as Error)?.message,
                          status,
                          responseData: resp !== undefined ? (typeof resp === 'object' ? JSON.parse(JSON.stringify(resp)) : resp) : undefined,
                          stack: (err as any)?.stack,
                        });
                      } catch (e) {
                        console.error('Upload scan failed (could not serialize error):', err);
                      }

                      // Prefer detailed server message if available
                      const axiosResp = (err as any)?.response?.data;
                      const msg = axiosResp?.message || axiosResp?.error || (err as Error)?.message || String(err ?? 'Failed to decode QR image');
                      setScannerError(msg);
                    }
                    // reset the file input so the same file can be re-uploaded if needed
                    (e.target as HTMLInputElement).value = '';
                  }} className="hidden" />
                </div>
              </div>

              <div className="w-48">
                <p className="text-sm text-gray-600 mb-2">Hold the QR code in front of the camera. The system will automatically detect and mark the donation as completed, or upload an image if camera is unavailable.</p>
                <div className="space-y-2">
                  <ActionButton onClick={() => closeScanner()} variant="danger">Cancel</ActionButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal for viewing donation QR */}
      <QrModal
        open={showQrModal}
        onClose={closeQrModal}
        qrImage={modalDonation?.qrCodeRef ?? null}
        title={modalDonation ? 'Donation Scheduled!' : undefined}
        subtitle={modalDonation ? `Donation for ${modalDonation?.donor?.displayName || modalDonation?.guestName || 'Guest'}` : undefined}
        details={modalDonation ? [
          { label: 'Scheduled', value: modalDonation.scheduledDate ? new Date(modalDonation.scheduledDate).toLocaleString() : 'N/A' },
          { label: 'Items', value: String(modalDonation?.items?.length || 0) },
          { label: 'Center', value: modalDonation?.donationCenter?.placeId || 'N/A' },
        ] : undefined}
        emailed={Boolean(modalDonation?.donor || (modalDonation as any)?.guestEmail)}
        // show first item image if available (defensive paths)
        extraImage={(() => {
          const item = (modalDonation?.items?.[0] as any) || null;
          const path = item?.imageUrl || item?.image || (item?.images && item.images[0]?.url) || null;
          return getImageUrl(path) || null;
        })()}
      />

      {/* Donation Approval Modal (admin review of items) */}
      <DonationApprovalModal
        open={showApprovalModal}
        onClose={closeApprovalModal}
        donation={approvalDonation}
        onUpdated={() => {
          closeApprovalModal();
          fetchDropoffs();
        }}
      />
    </div>
  );
}
