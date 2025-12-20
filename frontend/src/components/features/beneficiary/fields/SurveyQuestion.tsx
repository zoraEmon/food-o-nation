import React from 'react';
import { SURVEY_OPTIONS } from '../../../../constants/surveyOptions';

export interface SurveyQuestionType {
  id: string;
  text: string;
  type: string;
  options: { value: string; label: string }[];
}

export interface SurveyQuestionProps {
  question: SurveyQuestionType;
  value: string;
  onChange: (key: string, value: string) => void;
}

const SurveyQuestion: React.FC<SurveyQuestionProps> = ({ question, value, onChange }) => {
  const { id, text, options = [] } = question;
  // Fallback to frontend canonical options if backend didn't include them
  const resolvedOptions = (options && options.length > 0) ? options : (SURVEY_OPTIONS[question.type] || []);
  if (!resolvedOptions || resolvedOptions.length === 0) {
    console.warn(`Question ${id} has no options for type ${question.type}`);
    return (
      <div>
        <label className="block text-sm font-bold text-current mb-2">{text}</label>
        <div className="text-sm text-yellow-500">No options available for this question.</div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-bold text-current mb-2">{text}</label>
      <div className="flex gap-4 flex-wrap">
        {resolvedOptions.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-current">
            <input
              type="radio"
              name={id}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(id, e.target.value)}
              className="w-4 h-4 accent-[#FFB000]"
            />
            <span className="text-current">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default SurveyQuestion;
