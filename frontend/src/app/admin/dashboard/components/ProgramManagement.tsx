import React from "react";
import { ProgramList } from "../components/ProgramList";

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
  return (
    <div className={`${bgCard} p-6 rounded-lg shadow-md border ${borderColor}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className={`text-2xl font-semibold text-accent ${headingFont}`}>Program Management</h3>
          <p className={`${textSecondary} text-sm`}>
            View programs, adjust capacity, and manage assigned beneficiaries and donor stalls.
          </p>
        </div>
      </div>
      <ProgramList
        programs={programEntries}
        onView={(id: string) => {
          const program = programEntries.find((p) => p.id === id);
          if (program) setProgramModal(program);
        }}
      />
    </div>
  );
};
