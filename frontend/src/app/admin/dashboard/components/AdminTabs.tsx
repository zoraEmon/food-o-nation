import React, { useState } from 'react';

interface AdminTabsProps<T> {
  title: string;
  tabLabels?: { applications: string; official: string; rejected: string };
  pending: T[];
  approved: T[];
  rejected: T[];
  renderName: (item: T) => React.ReactNode;
  // getDate accepts optional subtab to allow different date columns per tab
  getDate: (item: T, subtab?: 'applications'|'official'|'rejected') => string;
  renderRightColumn?: (item: T, subtab: 'applications'|'official'|'rejected') => React.ReactNode;
  onView: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

import ActionButton from '@/components/ui/ActionButton';

export function AdminTabs<T extends { id: string }>(props: AdminTabsProps<T>) {
  const { title, tabLabels, pending, approved, rejected, renderName, getDate, renderRightColumn, onView, onApprove, onReject } = props;
  const [subtab, setSubtab] = useState<'applications' | 'official' | 'rejected'>('applications');

  const tabs = tabLabels || { applications: 'Application Review', official: 'Official', rejected: 'Rejected' };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {Object.entries(tabs).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSubtab(key as any)}
            className="px-4 py-2 rounded-md text-sm font-semibold transition"
            style={subtab === key ? { background: 'var(--secondary)', color: 'var(--secondary-fg)' } : { background: 'var(--card-bg)', color: 'var(--card-fg)' }}
          >
            {label}
          </button>
        ))}
      </div>

      {subtab === 'applications' && (
        <div className="overflow-hidden rounded-lg mt-0" style={{ border: '1px solid rgba(0,0,0,0.06)', background: 'var(--card-bg)', color: 'var(--card-fg)' }}>
          <div className="grid grid-cols-3 text-sm font-semibold border-b px-4 py-3" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <span style={{ color: 'var(--card-fg)' }}>{title}</span>
            <span style={{ color: 'var(--card-fg)' }}>Date Applied</span>
            <span className="text-right" style={{ color: 'var(--card-fg)' }}>Actions</span>
          </div>
          {pending.length === 0 ? (
            <div className="px-4 py-8 text-center" style={{ color: 'var(--card-fg)' }}>No pending applications</div>
          ) : (
            pending.map((b) => (
              <div key={b.id} className="grid grid-cols-3 items-center px-4 py-3 text-sm" style={{ background: 'var(--card-bg)', color: 'var(--card-fg)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <span className="flex items-center gap-2 font-semibold">{renderName(b)}</span>
                <span>{getDate(b, 'applications') || 'N/A'}</span>
                <div className="flex justify-end gap-2">
                  {renderRightColumn ? renderRightColumn(b, 'applications') : (
                    <>
                      <ActionButton onClick={() => onView(b.id)} variant="secondary">View</ActionButton>
                      {onApprove && <ActionButton onClick={() => onApprove(b.id)} variant="primary">Approve</ActionButton>}
                      {onReject && <ActionButton onClick={() => onReject(b.id)} variant="danger">Reject</ActionButton>}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {subtab === 'official' && (
        <div className="overflow-hidden rounded-lg mt-4" style={{ border: '1px solid rgba(0,0,0,0.06)', background: 'var(--card-bg)', color: 'var(--card-fg)' }}>
          <div className="grid grid-cols-3 text-sm font-semibold border-b px-4 py-3" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <span style={{ color: 'var(--card-fg)' }}>{title}</span>
            <span style={{ color: 'var(--card-fg)' }}>Date Approved</span>
            <span className="text-right" style={{ color: 'var(--card-fg)' }}>Actions</span>
          </div>
          {approved.length === 0 ? (
            <div className="px-4 py-8 text-center" style={{ color: 'var(--card-fg)' }}>No official entries</div>
          ) : (
            approved.map((b) => (
              <div key={b.id} className="grid grid-cols-3 items-center px-4 py-3 text-sm" style={{ background: 'var(--card-bg)', color: 'var(--card-fg)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <span className="flex items-center gap-2 font-semibold">{renderName(b)}</span>
                <span>{getDate(b, 'official') || 'N/A'}</span>
                <div className="flex justify-end gap-2">
                  {renderRightColumn ? renderRightColumn(b, 'official') : (
                    <>
                      <ActionButton onClick={() => onView(b.id)} variant="secondary">View</ActionButton>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {subtab === 'rejected' && (
        <div className="overflow-hidden rounded-lg mt-4" style={{ border: '1px solid rgba(0,0,0,0.06)', background: 'var(--card-bg)', color: 'var(--card-fg)' }}>
          <div className="grid grid-cols-3 text-sm font-semibold border-b px-4 py-3" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <span>{title}</span>
            <span>Date Rejected</span>
            <span className="text-right">Actions</span>
          </div>
          {rejected.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400">No rejected entries</div>
          ) : (
            rejected.map((b) => (
              <div key={b.id} className="grid grid-cols-3 items-center px-4 py-3 text-sm" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <span className="flex items-center gap-2 font-semibold">{renderName(b)}</span>
                <span>{getDate(b, 'rejected') || 'N/A'}</span>
                <div className="flex justify-end gap-2">
                  {renderRightColumn ? renderRightColumn(b, 'rejected') : (
                    <>
                      <ActionButton onClick={() => onView(b.id, 'rejected')} variant="secondary">View</ActionButton>
                      {onApprove && <ActionButton onClick={() => onApprove(b.id)} variant="primary">Approve</ActionButton>}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
