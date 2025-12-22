import React, { useMemo, useState } from "react";
import { ProgramList } from "./ProgramList";

interface ProgramManagementProps {
  programEntries: any[];
  setProgramModal: (program: any) => void;
  bgCard?: string;
  borderColor?: string;
  headingFont?: string;
  textSecondary?: string;
}

export const ProgramManagement: React.FC<ProgramManagementProps> = ({
  programEntries,
  setProgramModal,
  bgCard = "bg-card",
  borderColor = "border-default",
  headingFont = "font-heading",
  textSecondary = "text-secondary",
}) => {
  const [query, setQuery] = useState("");
  const [onlyUpcoming, setOnlyUpcoming] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return programEntries.filter((p) => {
      if (onlyUpcoming) {
        const dt = new Date(p.date || p.startDate || p.datetime);
        if (isNaN(dt.getTime()) || dt < new Date()) return false;
      }
      if (!q) return true;
      return (
        (p.title || p.name || "").toString().toLowerCase().includes(q) ||
        (p.summary || p.description || "").toString().toLowerCase().includes(q)
      );
    });
  }, [programEntries, query, onlyUpcoming]);

  return (
    <div className={`${bgCard} p-6 rounded-lg shadow border ${borderColor}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className={`text-2xl font-semibold text-accent ${headingFont}`}>Program Management</h3>
          <p className={`${textSecondary} text-sm`}>Manage programs, capacity, and registrations.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-2 rounded-md">
            <input
              aria-label="Search programs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search programs, description..."
              className="bg-transparent placeholder:text-gray-400 outline-none px-2 py-1 text-sm text-gray-100"
            />
          </div>
          <label className="inline-flex items-center text-sm gap-2">
            <input type="checkbox" checked={onlyUpcoming} onChange={(e) => setOnlyUpcoming(e.target.checked)} className="h-4 w-4" />
            <span className="text-xs text-gray-300">Upcoming</span>
          </label>
          <button
            onClick={() => setProgramModal({})}
            className="px-3 py-2 bg-[#004225] hover:bg-[#00361a] text-white rounded-md text-sm font-semibold"
          >
            + New Program
          </button>
        </div>
      </div>

      <ProgramList
        programs={filtered}
        onView={(id: string) => {
          const program = programEntries.find((p) => p.id === id);
          if (program) setProgramModal(program);
        }}
      />
    </div>
  );
};
