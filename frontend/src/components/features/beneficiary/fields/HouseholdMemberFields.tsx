import React from 'react';

export interface HouseholdMember {
  id: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  relationship: string;
}

interface HouseholdMemberFieldsProps {
  members: HouseholdMember[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof HouseholdMember, value: any) => void;
  calculateAge: (dateOfBirth: string) => number;
}

const HouseholdMemberFields: React.FC<HouseholdMemberFieldsProps> = ({
  members,
  onAdd,
  onRemove,
  onUpdate,
  calculateAge,
}) => {
  const toInputDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Household members must be at least 8 months old
  const maxHouseholdDob = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 8);
    return toInputDate(d);
  })();

  return (
    <div className="space-y-4">
      {members.map((member, idx) => (
        <div key={member.id} className="border-2 border-[#004225] rounded-lg p-4 space-y-3 bg-white dark:bg-transparent">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-current">Member {idx + 1}</span>
            {members.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(member.id)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Full Name"
              value={member.fullName}
              onChange={e => onUpdate(member.id, 'fullName', e.target.value)}
              className="p-2 rounded border border-gray-300 dark:border-[#2e4d3d] bg-gray-50 dark:bg-[#1a2b23] focus:border-[#FFB000]"
              required
            />

            <input
              type="date"
              value={member.dateOfBirth}
              onChange={e => onUpdate(member.id, 'dateOfBirth', e.target.value)}
              max={maxHouseholdDob}
              className="p-2 rounded border border-gray-300 dark:border-[#2e4d3d] bg-gray-50 dark:bg-[#1a2b23] focus:border-[#FFB000]"
              required
            />

            <input
              type="number"
              placeholder="Age"
              value={member.age !== undefined && member.age !== null ? String(member.age) : ''}
              readOnly
              className="p-2 rounded border border-gray-300 dark:border-[#2e4d3d] bg-gray-50 dark:bg-[#1a2b23] text-current"
            />

            <input
              type="text"
              placeholder="Relationship"
              value={member.relationship}
              onChange={e => onUpdate(member.id, 'relationship', e.target.value)}
              className="p-2 rounded border-2 border-[#004225] focus:border-[#FFB000]"
              required
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="w-full p-3 border-2 border-dashed border-[#004225] rounded-lg text-current font-bold hover:bg-[#FFB000]/10 flex items-center justify-center gap-2"
      >
        Add More
      </button>
    </div>
  );
};

export default HouseholdMemberFields;

