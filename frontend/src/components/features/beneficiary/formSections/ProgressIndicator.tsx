import React from 'react';

export interface ProgressStep {
  id: number;
  title: string;
  icon: React.ElementType;
}

interface ProgressIndicatorProps {
  sections: ProgressStep[];
  currentSection: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ sections, currentSection }) => (
  <div className="mb-8">
    <div className="flex justify-center mb-4">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between">
          {sections.map((section, idx) => (
            <React.Fragment key={section.id}>
              <div className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all ${
                  currentSection === section.id
                    ? 'bg-[#FFB000] border-[#FFB000] text-current scale-110'
                    : currentSection > section.id
                    ? 'bg-[#004225] border-[#004225] text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <section.icon className="w-6 h-6" />
                </div>
                <span className={`text-xs font-bold mt-2 ${currentSection >= section.id ? 'text-current' : 'text-gray-400'}`}>
                  {section.title}
                </span>
              </div>
              {idx < sections.length - 1 && (
                <div className={`flex-1 h-1 mx-2 ${currentSection > section.id ? 'bg-[#004225]' : 'bg-gray-300'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ProgressIndicator;
