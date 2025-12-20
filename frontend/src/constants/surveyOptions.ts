export type SurveyOption = { value: string; label: string };

export const SURVEY_OPTIONS: Record<string, SurveyOption[]> = {
  FOOD_FREQUENCY: [
    { value: 'NEVER', label: 'Never' },
    { value: 'RARELY', label: 'Rarely' },
    { value: 'SOMETIMES', label: 'Sometimes' },
    { value: 'OFTEN', label: 'Often' },
  ],
  FOOD_SECURITY_SEVERITY: [
    { value: 'SECURE', label: 'Secure' },
    { value: 'MILD', label: 'Mild' },
    { value: 'MODERATE', label: 'Moderate' },
    { value: 'SEVERE', label: 'Severe' },
  ],
};
