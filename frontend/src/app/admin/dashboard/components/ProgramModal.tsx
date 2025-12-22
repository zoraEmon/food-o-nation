import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { adminService } from '@/services/adminService';
import { programApplicationService } from '@/services/programApplicationService';

interface Props {
  program?: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (program: any) => void;
}

export const ProgramModal: React.FC<Props> = ({ program, isOpen, onClose, onSaved }) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [registrationEnabled, setRegistrationEnabled] = useState(false);
  const [stallEnabled, setStallEnabled] = useState(false);
  const [beneficiaryLimit, setBeneficiaryLimit] = useState<number | ''>(50);
  const [donorStallLimit, setDonorStallLimit] = useState<number | ''>(30);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (program) {
      setTitle(program.title || program.name || '');
      setSummary(program.summary || program.description || '');
      const dt = program.date || program.startDate || program.datetime;
      setDate(dt ? new Date(dt).toISOString().slice(0, 16) : '');
      setVenue(program.place?.name || program.venue || '');
      setRegistrationEnabled(!!program.enableRegistration || !!program.allowRegistration || !!program.enable_participant_registration);
      setStallEnabled(!!program.enableStalls || !!program.allowStalls || !!program.enable_stall_reservation);
      setBeneficiaryLimit(program.beneficiaryLimit || program.capacity || 50);
      setDonorStallLimit(program.donorStallLimit || program.stallCapacity || 30);
    } else {
      setTitle('');
      setSummary('');
      setDate('');
      setVenue('');
      setRegistrationEnabled(false);
      setStallEnabled(false);
      setBeneficiaryLimit(50);
      setDonorStallLimit(30);
    }
    setError(null);
  }, [program, isOpen]);

  async function handleSave() {
    setError(null);
    if (!title.trim()) {
      setError('Please provide a title');
      return;
    }
    setLoading(true);
    try {
      const payload: any = { title, summary };
      if (date) payload.date = new Date(date).toISOString();
      if (venue) payload.place = { name: venue };
      payload.enableRegistration = !!registrationEnabled;
      payload.enableStalls = !!stallEnabled;
      payload.beneficiaryLimit = beneficiaryLimit || undefined;
      payload.donorStallLimit = donorStallLimit || undefined;

      let res;
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

  async function handlePublish() {
    if (!program?.id) return;
    setLoading(true);
    try {
      await adminService.publishProgram(program.id);
      onSaved?.({ ...program, status: 'PUBLISHED' });
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to publish');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!program?.id) return;
    setLoading(true);
    try {
      await adminService.cancelProgram(program.id);
      onSaved?.({ ...program, status: 'CANCELLED' });
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to cancel');
    } finally {
      setLoading(false);
    }
  }

  async function fetchRegistrations() {
    if (!program?.id) return;
    setLoading(true);
    try {
      const res = await programApplicationService.getApplicationsByProgram(program.id);
      setRegistrations(res?.data || res || []);
      setShowRegistrations(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={program?.id ? 'Edit Program' : 'New Program'}>
      <div className="space-y-4">
        {error && <div className="text-sm text-red-400">{error}</div>}

        <div>
          <label className="block text-sm text-gray-300">Program Title:</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 p-3 rounded border border-gray-300 bg-white/5 outline-none" />
        </div>

        <div>
          <label className="block text-sm text-gray-300">Program Details:</label>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full mt-1 p-3 rounded border border-gray-300 bg-white/5 outline-none" rows={6} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={registrationEnabled} onChange={(e) => setRegistrationEnabled(e.target.checked)} className="h-4 w-4" />
              <span className="text-sm text-gray-300">Enable Participant Registration</span>
            </label>
            {registrationEnabled && (
              <div className="ml-4 flex items-center gap-2">
                <span className="text-sm text-gray-300">Beneficiary Limit:</span>
                <select value={beneficiaryLimit} onChange={(e) => setBeneficiaryLimit(Number(e.target.value))} className="px-3 py-1 rounded border bg-white/5">
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 justify-start sm:justify-end">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={stallEnabled} onChange={(e) => setStallEnabled(e.target.checked)} className="h-4 w-4" />
              <span className="text-sm text-gray-300">Enable Stall Reservation</span>
            </label>
            {stallEnabled && (
              <div className="ml-4 flex items-center gap-2">
                <span className="text-sm text-gray-300">Donor Stall Limit:</span>
                <select value={donorStallLimit} onChange={(e) => setDonorStallLimit(Number(e.target.value))} className="px-3 py-1 rounded border bg-white/5">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300">Program Venue:</label>
          <input value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full mt-1 p-3 rounded border border-gray-300 bg-white/5 outline-none" />
        </div>

        <div className="border rounded overflow-hidden">
          <div className="h-40 bg-gray-800/20 flex items-center justify-center text-gray-400">Map placeholder</div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <button onClick={fetchRegistrations} disabled={!program?.id || loading} className="px-3 py-2 rounded bg-white/10 text-sm">View Registrations</button>
          </div>

          <div className="flex items-center gap-3">
            {program?.id && (
              <>
                <button onClick={handleCancel} disabled={loading} className="px-3 py-2 text-xs rounded bg-red-600 text-white">Cancel Program</button>
                <button onClick={handlePublish} disabled={loading} className="px-3 py-2 text-xs rounded bg-emerald-600 text-white">Publish</button>
              </>
            )}

            <button onClick={onClose} className="px-3 py-2 text-xs rounded bg-white/10">Close</button>
            <button onClick={handleSave} disabled={loading} className="px-3 py-2 text-sm rounded bg-[#004225] text-white">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Registrations panel */}
        {showRegistrations && (
          <div className="mt-4 bg-white/3 p-3 rounded border">
            <h4 className="text-sm font-semibold mb-2">Registrations</h4>
            {registrations.length === 0 ? (
              <div className="text-sm text-gray-400">No registrations found.</div>
            ) : (
              <div className="max-h-48 overflow-auto">
                {registrations.map((r: any) => (
                  <div key={r.id || r.application?.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-semibold text-sm">{r.applicantName || r.user?.fullName || r.application?.beneficiaryName || r.user?.name || r.application?.name}</div>
                      <div className="text-xs text-gray-400">{r.applicantEmail || r.user?.email || r.application?.email}</div>
                    </div>
                    <div className="text-xs text-gray-400">{r.stallNumber ? `Stall ${r.stallNumber}` : ''}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProgramModal;
