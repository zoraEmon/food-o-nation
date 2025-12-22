import React from "react";

interface ProgramListProps {
  programs: Array<any>;
  onView: (id: string) => void;
}

export const ProgramList: React.FC<ProgramListProps> = ({ programs, onView }) => (
  <div className="overflow-hidden rounded-lg border bg-white/3">
    <div className="hidden sm:grid grid-cols-5 text-xs font-semibold text-gray-400 border-b border-gray-700 px-4 py-3">
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
          className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-0 items-center px-4 py-3 text-sm text-gray-200 border-b border-gray-800 last:border-b-0"
        >
          <div className="col-span-2 flex flex-col">
            <button onClick={() => onView(program.id)} className="text-[#004225] font-semibold hover:underline text-left text-sm">
              {program.title || program.name}
            </button>
            <span className="text-xs text-gray-400">{program.place?.name || program.location || "—"}</span>
          </div>

          <div className="text-gray-300 text-sm truncate">{program.summary || program.description || "No description"}</div>

          <div className="text-xs text-gray-300">
            {program.date ? new Date(program.date).toLocaleString() : program.startDate ? new Date(program.startDate).toLocaleString() : "—"}
          </div>

          <div className="flex justify-end items-center gap-2">
            {program.status && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: program.status === 'PUBLISHED' ? '#ECFDF5' : '#FFF7ED', color: program.status === 'PUBLISHED' ? '#065F46' : '#92400E' }}>
                {program.status}
              </span>
            )}

            <button onClick={() => onView(program.id)} className="px-3 py-1 rounded-md bg-white/10 text-white text-xs font-semibold hover:bg-white/20">
              View
            </button>
          </div>
        </div>
      ))
    )}
  </div>
);
