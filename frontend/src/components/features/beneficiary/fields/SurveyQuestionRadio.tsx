import React from 'react';

export interface SurveyQuestionProps {
  questionKey: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (key: string, value: string) => void;
}

const SurveyQuestionRadio: React.FC<SurveyQuestionProps> = ({
  questionKey,
  label,
  options,
  value,
  onChange,
}) => (
  <div>
    <label className="block text-sm font-bold text-current mb-2">{label}</label>
    <div className="flex gap-4 flex-wrap">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-2 text-current">
          <input
            type="radio"
            name={questionKey}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(questionKey, e.target.value)}
            className="w-4 h-4 accent-[#FFB000]"
          />
          <span className="text-current">{option.label}</span>
        </label>
      ))}
    </div>
  </div>
);

export default SurveyQuestionRadio;
