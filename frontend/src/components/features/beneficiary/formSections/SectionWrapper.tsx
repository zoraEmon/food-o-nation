import React from 'react';

export interface SectionProps {
  children: React.ReactNode;
  title: string;
}

const SectionWrapper: React.FC<SectionProps> = ({ title, children }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
    <h2 className="text-2xl lg:text-3xl font-bold text-current border-b-2 border-[#004225] pb-3">
      {title}
    </h2>
    {children}
  </div>
);

export default SectionWrapper;
