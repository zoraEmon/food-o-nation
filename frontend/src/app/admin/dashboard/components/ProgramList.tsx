import React from "react";

interface ProgramListProps {
  programs: Array<{
    id: string;
    title: string;
    summary: string;
  }>;
  onView: (id: string) => void;
}

export const ProgramList: React.FC<ProgramListProps> = ({ programs, onView }) => (
  <div className="overflow-hidden rounded-lg border bg-white/5">
    <div className="grid grid-cols-3 text-sm font-semibold text-white border-b border-gray-700 px-4 py-3">
      <span>Program</span>
      <span>Summary</span>
      <span className="text-right">Actions</span>
    </div>
    {programs.length === 0 ? (
      <div className="px-4 py-8 text-center text-gray-400">No programs found</div>
    ) : (
      programs.map((program) => (
        <div key={program.id} className="grid grid-cols-3 items-center px-4 py-3 text-sm text-gray-200 border-b border-gray-800 last:border-b-0">
          <button onClick={() => onView(program.id)} className="text-goldenyellow font-semibold hover:underline text-left">
            {program.title}
          </button>
          <span className="text-gray-300 truncate">{program.summary}</span>
          <div className="flex justify-end">
            <button
              onClick={() => onView(program.id)}
              className="px-3 py-1 rounded-md bg-white/10 text-white text-xs font-semibold hover:bg-white/20"
            >
              View / Edit
            </button>
          </div>
        </div>
      ))
    )}
  </div>
);
