"use client";
import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { adminService } from '@/services/adminService';
import ProgramRegistrationsModal from './ProgramRegistrationsModal';
import MapPicker from '@/components/MapPicker';
import { programApplicationService } from '@/services/programApplicationService';
import { useAuth } from '@/contexts/AuthContext';
import QRScanner from '@/components/QRScanner';

interface Props {
  program?: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (program: any) => void;
}

export const ProgramModalV2: React.FC<Props> = ({ program, isOpen, onClose, onSaved }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const minStartLocal = (() => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0,16);
  })();
  const [minStart, setMinStart] = useState<string>(minStartLocal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const { user } = useAuth();

  // QR scanning
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scannedApp, setScannedApp] = useState<any | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // QR scan modals/messages
  const [qrWarning, setQrWarning] = useState<string | null>(null);
  const [qrSuccess, setQrSuccess] = useState<string | null>(null);
  const [qrRejected, setQrRejected] = useState<string | null>(null);

  // If the QR was already scanned previously, we'll show a dedicated modal with details
  const [alreadyScannedInfo, setAlreadyScannedInfo] = useState<{ message: string; scan?: any; application?: any } | null>(null);

  // Show scan result modal (on successful scan) so it can "pop in" independently
  const [showScanResultModal, setShowScanResultModal] = useState(false);

  // place / map state
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [placeAddress, setPlaceAddress] = useState<string>(''); // system-populated address
  const [venueName, setVenueName] = useState<string>(''); // user-entered venue name
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Participant / Stall controls
  const [enableRegistration, setEnableRegistration] = useState<boolean>(false);
  const [maxParticipants, setMaxParticipants] = useState<number | ''>('');
  const [enableStalls, setEnableStalls] = useState<boolean>(false);
  const [stallCapacity, setStallCapacity] = useState<number | ''>('');

  useEffect(() => {
    if (isOpen) console.debug('ProgramModalV2 opened', { id: program?.id });
    if (program) {
      setTitle(program.title || program.name || '');
      setDescription(program.description || '');
      const dt = program.date || program.startDate || program.datetime;
      setDate(dt ? new Date(dt).toISOString().slice(0, 16) : '');
      // participant/stall state
      setEnableRegistration((program.maxParticipants || 0) > 0);
      setMaxParticipants((program.maxParticipants !== undefined && program.maxParticipants !== null) ? program.maxParticipants : '');
      setEnableStalls((program.stallCapacity || 0) > 0);
      setStallCapacity((program.stallCapacity !== undefined && program.stallCapacity !== null) ? program.stallCapacity : '');

      // place info (coerce to string and skip suspiciously short values)
      setPlaceId(program.place?.id || null);
      try {
        const a = String(program.place?.address || '').trim();
        const n = String(program.place?.name || '').trim();
        setPlaceAddress(a.length >= 3 ? a : '');
        setVenueName(n.length >= 3 ? n : '');
      } catch (e) {
        setPlaceAddress('');
        setVenueName('');
      }

      setLatitude(program.place?.latitude ?? null);
      setLongitude(program.place?.longitude ?? null);
    } else {
      setTitle('');
      setDescription('');
      setDate('');
      setEnableRegistration(false);
      setMaxParticipants('');
      setEnableStalls(false);
      setStallCapacity('');
      setPlaceId(null);
      setPlaceAddress('');
      setVenueName('');
      setLatitude(null);
      setLongitude(null);
    }
    setError(null);
  }, [program, isOpen]);

  // When latitude & longitude are filled and user hasn't entered a place name,
  // try to find a nearby place and auto-fill venue details.
  useEffect(() => {
    let cancelled = false;
    async function findNearby() {
      if (latitude == null || longitude == null) return;
      // Don't overwrite existing address or venue name entered by the user
      if ((placeAddress && placeAddress.trim() !== '') || (venueName && venueName.trim() !== '')) return;
      try {
        const places = await adminService.getPlaces();
        if (!Array.isArray(places) || places.length === 0) return;
        const toRad = (v: number) => v * Math.PI / 180;
        const distanceMeters = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) => {
          const R = 6371000;
          const dLat = toRad(b.latitude - a.latitude);
          const dLon = toRad(b.longitude - a.longitude);
          const lat1 = toRad(a.latitude);
          const lat2 = toRad(b.latitude);
          const sinDLat = Math.sin(dLat/2);
          const sinDLon = Math.sin(dLon/2);
          const aa = sinDLat*sinDLat + sinDLon*sinDLon * Math.cos(lat1) * Math.cos(lat2);
          const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
          return R * c;
        };
        let best: any = null;
        let bestDist = Infinity;
        for (const p of places) {
          if (p && typeof p.latitude === 'number' && typeof p.longitude === 'number') {
            const d = distanceMeters({ latitude, longitude }, { latitude: p.latitude, longitude: p.longitude });
            if (d < bestDist) { bestDist = d; best = p; }
          }
        }
        if (!cancelled && best && bestDist <= 1000) {
          setPlaceId(best.id || null);
          // Prefer to auto-fill a real address into the address field. If the place
          // only has a name (no address), auto-fill the *venue name* instead so we
          // do not place the name into `placeAddress` and confuse saved data.
          try {
            const bestAddr = (best.address && typeof best.address === 'string' && best.address.trim() !== '') ? String(best.address).trim() : null;
            const bestName = (best.name && typeof best.name === 'string' && best.name.trim() !== '') ? String(best.name).trim() : null;

            if (bestAddr) {
              // Avoid tiny/invalid autofills — log for debugging and skip short values
              if (bestAddr.length < 3) {
                console.debug('Nearby place returned suspiciously short address, skipping auto-fill', { id: best.id, address: bestAddr });
              } else if (!placeAddress || placeAddress.trim() === '') {
                // Only auto-fill address when the address field is blank
                setPlaceAddress(bestAddr);
              }
            }

            // Only auto-fill venue name from the nearby place name if the user hasn't entered one
            if (!venueName || venueName.trim() === '') {
              if (bestName && bestName.length >= 3) {
                setVenueName(bestName);
              } else if (bestName && bestName.length < 3) {
                console.debug('Nearby place returned suspiciously short name, skipping auto-fill', { id: best.id, name: bestName });
              }
            }
          } catch (e) {
            // ignore auto-fill failures
          }
        }
      } catch (e) {
        // ignore
      }
    }
    findNearby();
    return () => { cancelled = true; };
  }, [latitude, longitude, placeAddress, venueName]);

  async function handleSave() {
    setError(null);
    if (!title.trim()) {
      setError('Please provide a title');
      return;
    }

    // Require date/time
    if (!date || date.trim() === '') {
      setError('Please provide a date / start time for the program');
      return;
    }

    // Validate date client-side (must be at least 24 hours from now)
    if (date && date < minStart) {
      setError('Program must be scheduled at least 24 hours from now');
      return;
    }

    setLoading(true);
    try {
      const payload: any = { title, description };
      if (date) payload.date = new Date(date).toISOString();

      // ensure numeric fields are included
      if (enableRegistration) {
        payload.maxParticipants = typeof maxParticipants === 'number' ? maxParticipants : (maxParticipants === '' ? 0 : Number(maxParticipants));
      } else {
        payload.maxParticipants = 0;
      }

      // Always include stallCapacity (server now accepts it on create/update).
      {
        const sc = typeof stallCapacity === 'number' ? stallCapacity : (stallCapacity === '' ? 0 : Number(stallCapacity));
        if (isNaN(sc) || sc < 0) {
          setError('Stall capacity must be a non-negative number');
          setLoading(false);
          return;
        }
        payload.stallCapacity = enableStalls ? sc : 0;
      }

      let res;
      // ensure place is created/used
      if (placeId) {
        payload.placeId = placeId;
      } else if (latitude !== null && longitude !== null && (placeAddress || venueName)) {
        try {
          // Backend requires non-empty address and name. Prefers explicit address and
          // requires a venue name; we will *not* copy address into the venue name.
          const rawAddr = String(placeAddress || '').trim();
          const rawName = String(venueName || '').trim();

          // Determine address to send
          let addressToSend: string | undefined = undefined;
          if (rawAddr && rawAddr.length >= 3) {
            addressToSend = rawAddr;
          }

          // Venue name is required by the backend; if user didn't supply a name, ask them to.
          if (!rawName || rawName.length < 3) {
            setError('Please provide a venue name (at least 3 characters) to create the place');
            setLoading(false);
            return;
          }

          const nameToSend = rawName;

          // If address is missing, we cannot create a place; ask the user to provide an address
          if (!addressToSend) {
            setError('Please provide a valid address (at least 3 characters) to create the place');
            setLoading(false);
            return;
          }

          console.debug('Creating place with', { name: nameToSend, address: addressToSend, latitude, longitude });
          const created = await adminService.createPlace({ name: nameToSend, address: addressToSend, latitude, longitude });
          payload.placeId = created.id || created.placeId || created?.id;
        } catch (err:any) {
          // Surface place creation errors to the user and abort save
          console.error('Failed to create place:', err?.message || err);
          setError(err?.message || 'Failed to create place');
          setLoading(false);
          return;
        }
      }

      // Debugging: log payload
      try { console.debug('Program save payload:', payload); } catch (e) {}

      if (program?.id) {
        res = await adminService.updateProgram(program.id, payload);
      } else {
        res = await adminService.createProgram(payload);
      }

      onSaved?.(res || {});
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to save program');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!program?.id) return;
    setLoading(true);
    try {
      const res = await adminService.cancelProgram(program.id);
      // If the server deleted the program, indicate deletion; parent will refresh list
      onSaved?.(null);
      onClose();
      console.debug('Program cancel/delete result:', res);
    } catch (e: any) {
      setError(e?.message || 'Failed to cancel');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={program?.id ? 'Edit Program' : 'New Program'}>
        <div className="flex flex-col" style={{ minHeight: '56vh' }}>
          {error && <div className="text-sm text-red-400">{error}</div>}

          {/* Scrollable form area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[65vh]" data-testid="admin-program-modal-body-v2">

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300">Program Title:</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 p-2 rounded bg-white/5 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-300">Description:</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 p-2 rounded bg-white/5 outline-none" rows={4} />
              </div>

              <div>
                <label className="block text-sm text-gray-300">Date / Start</label>
                <input type="datetime-local" value={date} min={minStart} onChange={(e) => setDate(e.target.value)} className="w-full mt-1 p-2 rounded bg-white/5 outline-none" />
                  {date && date < minStart && <div className="text-xs text-red-400 mt-1">Program must be scheduled at least 24 hours from now.</div>}
              </div>

              <div className="mt-2">
                <label className="block text-sm text-gray-300">Venue Address (automatically filled from coordinates):</label>
                <input value={String(placeAddress ?? '')} onChange={(e) => setPlaceAddress(String(e.target.value))} placeholder="Address" className="w-full mt-1 p-2 rounded bg-white/5 outline-none" />

                <label className="block text-sm text-gray-300 mt-2">Venue Name (you can override):</label>
                <input value={String(venueName ?? '')} onChange={(e) => setVenueName(String(e.target.value))} placeholder="Venue name" className="w-full mt-1 p-2 rounded bg-white/5 outline-none" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <input value={latitude ?? ''} onChange={(e) => setLatitude(e.target.value === '' ? null : Number(e.target.value))} placeholder="Latitude" className="w-full p-2 rounded bg-white/5 outline-none" />
                  <input value={longitude ?? ''} onChange={(e) => setLongitude(e.target.value === '' ? null : Number(e.target.value))} placeholder="Longitude" className="w-full p-2 rounded bg-white/5 outline-none" />
                </div>

                <div className="mt-3">
                  {/* Map picker */}
                  <MapPicker lat={latitude ?? undefined} lng={longitude ?? undefined} onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} />
                  <div className="text-xs text-gray-500 mt-2">Click on the map to set latitude/longitude.</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <label className="inline-flex items-start gap-2">
                  <input type="checkbox" checked={enableRegistration} onChange={(e) => setEnableRegistration(e.target.checked)} className="h-4 w-4 mt-1" />
                  <div className="ml-2">
                    <div className="text-sm text-gray-200 font-semibold">Enable Participant Registration</div>
                    <div className="text-xs text-gray-400">Allow beneficiaries to register and receive QR codes.</div>
                  </div>
                </label>

                <div className="flex-1">
                  <label className="block text-sm text-gray-300">Participant Limit</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={0}
                    disabled={!enableRegistration}
                    value={maxParticipants as any}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^0-9]/g, '');
                      setMaxParticipants(sanitized === '' ? '' : Math.max(0, Number(sanitized)));
                    }}
                    className="w-full mt-1 p-2 rounded bg-white/5 outline-none"
                    placeholder="0 to disable"
                  />

                  {enableRegistration && program?.id && (
                    <div className="mt-3">
                      <button onClick={() => setShowScanner(!showScanner)} className="px-3 py-2 rounded bg-white/10 text-sm">{showScanner ? 'Close Scanner' : 'Scan QR / Upload'}</button>
                    </div>
                  )}
                </div>
              </div>

              {program?.id && showScanner && (
                <div className="mt-3">
                  <QRScanner onResult={async (val) => {
                    setScanning(true);
                    setScanResult(val);
                    // Guard: ensure admin id present
                    if (!user?.id) {
                      setError('You must be signed in as an admin to scan QR codes');
                      setScanning(false);
                      return;
                    }
                    const scannedValue = String(val).trim();
                    if (!scannedValue) {
                      setError('Scanned value is empty');
                      setScanning(false);
                      return;
                    }
                    try {
                      const res = await programApplicationService.scanQRCode({ qrCodeValue: scannedValue, adminId: user.id });
                      const app = res?.data?.application;

                      // Ensure the scanned application belongs to this program
                      const scannedProgramId = app?.programRegistration?.program?.id;
                      if (!scannedProgramId || scannedProgramId !== program.id) {
                        setQrWarning('The registration belongs to a different program');
                        return;
                      }

                      // Accept the scan
                      setScannedApp(app);
                      setQrSuccess('Scan successful');
                      setError(null);
                      // Close scanner and show the scan result modal (pops in)
                      setShowScanner(false);
                      setShowScanResultModal(true);
                    } catch (e:any) {
                      // Axios errors often have response.data.error
                      const errMsg = e?.response?.data?.error || e?.message || 'Failed to scan QR code';

                      // If backend indicates the QR was already scanned (409), show dedicated modal with details
                      const status = e?.response?.status;
                      const responseData = e?.response?.data?.data;
                      if (status === 409 || String(errMsg).toLowerCase().includes('already scanned')) {
                        console.debug('Scan API conflict (already scanned):', errMsg);
                        setAlreadyScannedInfo({ message: errMsg, scan: responseData?.scan, application: responseData?.application });
                        setError(null);
                        // close the scanner UI so admin can view details in the modal
                        setShowScanner(false);
                      } else {
                        console.error('Scan API error:', e);
                        setError(errMsg);
                      }
                    } finally {
                      setScanning(false);
                    }
                  }} onClose={() => setShowScanner(false)} />



                  {/* Already scanned details modal */}
                  {alreadyScannedInfo && (
                    <Modal isOpen={true} onClose={() => setAlreadyScannedInfo(null)} title={"QR Already Scanned"}>
                      <div className="space-y-3">
                        <div className="text-sm font-semibold">{alreadyScannedInfo.message}</div>
                        {alreadyScannedInfo.scan ? (
                          <div className="text-xs text-gray-400">
                            <div>Scanned at: {new Date(alreadyScannedInfo.scan.scannedAt).toLocaleString()}</div>
                            <div>Scanned by: {alreadyScannedInfo.scan.admin?.firstName} {alreadyScannedInfo.scan.admin?.lastName}</div>
                            {alreadyScannedInfo.scan.notes && <div>Notes: {alreadyScannedInfo.scan.notes}</div>}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">No additional scan details available.</div>
                        )}

                        <div className="mt-4 flex justify-end">
                          <button onClick={() => setAlreadyScannedInfo(null)} className="px-3 py-1 rounded bg-white/10">Close</button>
                        </div>
                      </div>
                    </Modal>
                  )}

                  {/* Scan result modal (success) */}
                  {showScanResultModal && scannedApp && (
                    <Modal isOpen={true} onClose={() => { setShowScanResultModal(false); setScannedApp(null); }} title={"Scan Result"}>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">{(scannedApp.programRegistration?.beneficiary?.firstName || 'U')[0]}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{scannedApp.programRegistration?.beneficiary?.firstName} {scannedApp.programRegistration?.beneficiary?.lastName}</div>
                            <div className="text-xs text-gray-400">Status: {scannedApp.applicationStatus}</div>
                          </div>
                        </div>

                        <div className="text-xs text-gray-400">Scanned at: {scannedApp.qrCodeScannedAt ? new Date(scannedApp.qrCodeScannedAt).toLocaleString() : '—'}</div>

                        <div className="mt-4 flex justify-end gap-2">
                          <button onClick={() => { setShowScanResultModal(false); setScannedApp(null); }} className="px-3 py-1 rounded bg-white/10">Close</button>
                          <button disabled={confirmLoading} onClick={async () => {
                            if (!scannedApp?.programRegistration?.id) return;
                            setConfirmLoading(true);
                            try {
                              await adminService.updateProgramRegistrationStatus(scannedApp.programRegistration.id, 'APPROVED');
                              setError(null);
                              setQrSuccess('Registration approved');
                              setShowScanResultModal(false);
                              setScannedApp(null);
                              setShowScanner(false);
                            } catch (e:any) {
                              setError(e?.message || 'Failed to approve registration');
                            } finally {
                              setConfirmLoading(false);
                            }
                          }} className="px-3 py-1 rounded bg-[#004225] text-white text-sm">{confirmLoading ? 'Approving...' : 'Approve'}</button>

                          <button disabled={confirmLoading} onClick={async () => {
                            if (!scannedApp?.programRegistration?.id) return;
                            setConfirmLoading(true);
                            try {
                              await adminService.updateProgramRegistrationStatus(scannedApp.programRegistration.id, 'REJECTED');
                              setError(null);
                              setQrRejected('Registration rejected');
                              setShowScanResultModal(false);
                              setScannedApp(null);
                              setShowScanner(false);
                            } catch (e:any) {
                              setError(e?.message || 'Failed to reject registration');
                            } finally {
                              setConfirmLoading(false);
                            }
                          }} className="px-3 py-1 rounded bg-red-600 text-white text-sm">{confirmLoading ? 'Processing...' : 'Reject'}</button>
                        </div>
                      </div>
                    </Modal>
                  )}

                  {/* QR modals */}
                  {qrWarning && (
                    <div className="mt-3">
                      <Modal isOpen={!!qrWarning} onClose={() => setQrWarning(null)} title="Warning">
                        <div className="text-sm">{qrWarning}</div>
                        <div className="mt-4 flex justify-end">
                          <button onClick={() => setQrWarning(null)} className="px-3 py-1 rounded bg-white/10">Close</button>
                        </div>
                      </Modal>
                    </div>
                  )}

                  {qrSuccess && (
                    <div className="mt-3">
                      <Modal isOpen={!!qrSuccess} onClose={() => setQrSuccess(null)} title="Success">
                        <div className="text-sm">{qrSuccess}</div>
                        <div className="mt-4 flex justify-end">
                          <button onClick={() => setQrSuccess(null)} className="px-3 py-1 rounded bg-white/10">OK</button>
                        </div>
                      </Modal>
                    </div>
                  )}

                  {qrRejected && (
                    <div className="mt-3">
                      <Modal isOpen={!!qrRejected} onClose={() => setQrRejected(null)} title="Rejected">
                        <div className="text-sm">{qrRejected}</div>
                        <div className="mt-4 flex justify-end">
                          <button onClick={() => setQrRejected(null)} className="px-3 py-1 rounded bg-white/10">OK</button>
                        </div>
                      </Modal>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <label className="inline-flex items-start gap-2">
                  <input type="checkbox" checked={enableStalls} onChange={(e) => setEnableStalls(e.target.checked)} className="h-4 w-4 mt-1" />
                  <div className="ml-2">
                    <div className="text-sm text-gray-200 font-semibold">Enable Stall Reservations</div>
                    <div className="text-xs text-gray-400">Allow donors to reserve donor stalls.</div>
                  </div>
                </label>

                <div className="flex-1">
                  <label className="block text-sm text-gray-300">Stall Capacity</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={0}
                    disabled={!enableStalls}
                    value={stallCapacity as any}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^0-9]/g, '');
                      setStallCapacity(sanitized === '' ? '' : Math.max(0, Number(sanitized)));
                    }}
                    className="w-full mt-1 p-2 rounded bg-white/5 outline-none"
                    placeholder="0 to disable"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Footer with persistent actions */}
          <div className="mt-4 border-t pt-4 flex items-center justify-between gap-3 sticky bottom-0 bg-background">
            <div className="flex gap-2">
              {program?.id && (
                <>
                  <button data-testid="view-registrations" onClick={() => setShowRegistrations(true)} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-sm font-semibold">View Registrations</button>

                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {program?.id && (
                <button onClick={handleCancel} disabled={loading} className="px-4 py-2 rounded bg-red-600 text-white text-sm font-semibold">Cancel Program</button>
              )}

              {/* QR scanner button relocated to footer for edit flows */}
              {program?.id && (
                <button onClick={() => { setShowScanner(!showScanner); setQrWarning(null); setQrSuccess(null); setQrRejected(null); }} className="px-3 py-2 rounded bg-white/10 text-sm">{showScanner ? 'Close Scanner' : 'Scan QR / Upload'}</button>
              )}

              <button onClick={onClose} className="px-4 py-2 rounded bg-white/10 text-sm font-semibold">Close</button>
              <button onClick={handleSave} disabled={loading} className="px-4 py-2 rounded bg-[#004225] text-white text-sm font-semibold">
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <ProgramRegistrationsModal programId={program?.id} programTitle={program?.title || program?.name} isOpen={showRegistrations} onClose={() => setShowRegistrations(false)} />
    </>
  );
};

export default ProgramModalV2;
