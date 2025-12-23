import React from "react";

interface ProgramListProps {
  programs: Array<any>;
  onView: (id: string) => void;
}

export const ProgramList: React.FC<ProgramListProps> = ({ programs, onView }) => (
  <div className="overflow-hidden rounded-lg border" style={{ background: 'var(--card-bg)', color: 'var(--card-fg)' }}>
    <div className="hidden sm:grid grid-cols-5 text-xs font-semibold border-b px-4 py-3" style={{ color: 'var(--muted-text)', borderColor: 'var(--muted)' }}>
      <span className="col-span-2">Program</span>
      <span>Summary</span>
      <span>Date</span>
      <span className="text-right">Actions</span>
    </div>

    {programs.length === 0 ? (
      <div className="px-4 py-8 text-center text-gray-400">No programs found</div>
    ) : (
      programs.map((program) => (
        <div
          key={program.id}
          className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-0 items-center px-4 py-3 text-sm border-b last:border-b-0"
          style={{ borderColor: 'var(--muted)' }}
        >
          <div className="col-span-2 flex flex-col">
            <button onClick={() => onView(program.id)} className="font-semibold hover:underline text-left text-sm" style={{ color: 'var(--primary)' }}>
              {program.title || program.name}
            </button>
            <span className="text-xs" style={{ color: 'var(--muted-text)' }}>{program.place?.name || program.location || "—"}</span>
          </div>

          <div className="text-sm truncate" style={{ color: 'var(--foreground)' }}>{program.summary || program.description || "No description"}</div>

          <div className="text-xs" style={{ color: 'var(--muted-text)' }}>
            {program.date ? new Date(program.date).toLocaleString() : program.startDate ? new Date(program.startDate).toLocaleString() : "—"}
          </div>

          <div className="flex justify-end items-center gap-2">
            {program.status && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: program.status === 'PUBLISHED' ? '#ECFDF5' : '#FFF7ED', color: program.status === 'PUBLISHED' ? '#065F46' : '#92400E' }}>
                {program.status}
              </span>
            )}

            <button onClick={() => onView(program.id)} className="px-3 py-1 rounded-md text-xs font-semibold" style={{ background: 'var(--muted)', color: 'var(--card-fg)' }}>
              View
            </button>
          </div>
        </div>
      ))
    )}
  </div>
);
