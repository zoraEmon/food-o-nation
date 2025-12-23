import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { programApplicationService } from '@/services/programApplicationService';
import { adminService } from '@/services/adminService';

interface Props {
  programId: string;
  programTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

const ProgramRegistrationsModal: React.FC<Props> = ({ programId, programTitle, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'program' | 'stall'>('program');
  const [stallReservations, setStallReservations] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setLoading(true);
    (async () => {
      try {
        const resp = await programApplicationService.getApplicationsByProgram(programId);
        const apps = resp?.data || [];
        setApplications(apps);
      } catch (e: any) {
        setError(e?.message || 'Failed to fetch registrations');
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, programId]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'stall') return;
    (async () => {
      try {
        const stalls = await adminService.getProgramStalls(programId);
        setStallReservations(stalls || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to fetch stall reservations');
      }
    })();
  }, [isOpen, activeTab, programId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Registrations${programTitle ? ` — ${programTitle}` : ''}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveTab('program')} className={`px-3 py-2 rounded ${activeTab === 'program' ? 'bg-[#004225] text-white' : 'bg-white/5 text-gray-200'}`}>Program Registrations</button>
          <button onClick={() => setActiveTab('stall')} className={`px-3 py-2 rounded ${activeTab === 'stall' ? 'bg-[#004225] text-white' : 'bg-white/5 text-gray-200'}`}>Stall Reservations</button>
        </div>

        {loading && <div className="text-sm text-gray-400">Loading registrations...</div>}
        {error && <div className="text-sm text-red-400">{error}</div>}

        {activeTab === 'program' && !loading && applications.length === 0 && <div className="text-sm text-gray-400">No registrations found.</div>}
        {activeTab === 'stall' && stallReservations.length === 0 && <div className="text-sm text-gray-400">No stall reservations found.</div>}

        <div className="space-y-3 max-h-72 overflow-auto custom-scrollbar">
          {activeTab === 'program' && applications.map((app) => {
            const reg = app.programRegistration || {};
            const ben = reg.beneficiary || {};
            const user = ben.user || {};

            const avatar = user.profileImage || ben.profileImage || null;
            const name = ben.firstName ? `${ben.firstName} ${ben.lastName || ''}` : (user.fullName || app.applicantName || app.applicantEmail || reg.id || app.id);
            const role = 'Beneficiary';

            return (
              <div key={app.id} className="p-3 rounded border bg-white/3 flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-white">{(name || 'U').split(' ').map(n=>n[0]).slice(0,2).join('')}</span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-100">{name}</div>
                  <div className="text-xs text-gray-400">{role} • Status: {app.applicationStatus || 'N/A'}</div>
                  {app.scheduledDeliveryDate && <div className="text-xs text-gray-400">Scheduled: {new Date(app.scheduledDeliveryDate).toLocaleString()}</div>}
                </div>

                <div className="text-right text-xs min-w-[8rem]">
                  {reg.stallReservation || reg.donorReservation ? (
                    <div>
                      <div className="font-semibold">Stall</div>
                      <div className="text-gray-300">{(reg.stallReservation && reg.stallReservation.slotNumber) || (reg.donorReservation && reg.donorReservation.slotNumber) || 'Reserved'}</div>
                    </div>
                  ) : (
                    <div className="text-gray-400">No stall</div>
                  )}
                </div>
              </div>
            );
          })}

          {activeTab === 'stall' && stallReservations.map((s: any) => {
            const donor = s.donor || s.user || {};
            const avatar = donor.profileImage || donor.user?.profileImage || null;
            const name = donor.displayName || donor.fullName || donor.user?.email || s.donorId;
            const role = 'Donor';

            return (
              <div key={s.id} className="p-3 rounded border bg-white/3 flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-white">{(name || 'U').split(' ').map(n=>n[0]).slice(0,2).join('')}</span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-100">{name}</div>
                  <div className="text-xs text-gray-400">{role} • Slot: {s.slotNumber}</div>
                  <div className="text-xs text-gray-400">Status: {s.status}</div>
                </div>

                <div className="text-xs text-gray-300">{s.reservedAt ? new Date(s.reservedAt).toLocaleString() : ''}</div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="px-3 py-2 rounded bg-white/10">Close</button>
        </div>
      </div>
    </Modal>
  );
};

export default ProgramRegistrationsModal;
